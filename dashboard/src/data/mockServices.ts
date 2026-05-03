/**
 * Services & Health mock dataset — single source of truth for the
 * `/system/services` surface.
 *
 * Schema (`docs/models.md` §8 — `services`):
 *   id                string  (`svc_<name>`)
 *   name              ServiceName  ('alipay' | 'wechat' | 'uzcard' | 'humo' | 'myid')
 *   status            ServiceStatus  ('active' | 'maintenance' | 'disabled')
 *   priority          number  (1 = P1, 2 = P2)
 *   healthCheckUrl    string
 *   lastCheckedAt     Date
 *   config            jsonb  (api keys / endpoints / signing secrets)
 *
 * Mock-only observability cache (NOT in `docs/models.md` §8 — these are
 * normally backed by a metrics store / time-series DB, surfaced into the
 * admin UI as denormalized read-models). Modeled here so the page renders
 * realistic data without a real backend:
 *
 *   latency24h.{p50, p95, p99}      number  (ms)
 *   successRate24h, successRate7d   number  (0..1)
 *   uptime30d                       number  (0..1)
 *   inflightCount                   number
 *   webhooksLastHour                number
 *   successSparkline24h             number[]  (24 hourly buckets, 0..1)
 *   healthChecksLast20              HealthCheckPoint[]
 *   recentWebhookEvents             WebhookEvent[]  (last 10)
 *   latencySpikeAlerts              LatencySpikeAlert[]  (last 5)
 *   configSensitiveKeys             string[]  (which keys to mask in UI)
 *
 * Visa / Mastercard rails are deliberately absent — they aren't supported in
 * v1 and the surface mirrors the spec's "Visa and Mastercard are not
 * supported in v1" line. Schema §8 still declares them in the canonical
 * service-name enum; mock omits them by intent.
 *
 * Critical invariants (enforced by the mutator):
 *   1. Status changes always emit one audit-log row capturing
 *      `from_status` + `to_status` + reason + inflight count + acknowledge
 *      flag (for `disabled`). Bridged into `mockAuditLog` as
 *      `action: 'status_changed'` with the granular verb in `context.kind`
 *      (`activate` / `enter_maintenance` / `disable`).
 *   2. `setServiceStatus()` is the only writer. It rewrites
 *      `live.status` + `live.lastCheckedAt` and appends to the audit
 *      store. The page never edits the underlying row directly.
 *   3. Sensitive keys are flagged in `configSensitiveKeys`; the UI
 *      masks them as `••••••••` with no reveal affordance — this is
 *      server-side data that should never round-trip to the client in
 *      cleartext.
 */

import type { ServiceName, ServiceStatus, ServiceHealth } from '@/types';

// =====================================================================
// Public types
// =====================================================================

export type HealthCheckStatus = 'ok' | 'slow' | 'failed';

export interface HealthCheckPoint {
  timestamp: Date;
  responseTimeMs: number;
  status: HealthCheckStatus;
}

export type WebhookEventStatus = 'received' | 'processed' | 'failed';

export interface WebhookEvent {
  id: string;
  timestamp: Date;
  eventType: string;
  status: WebhookEventStatus;
}

export interface LatencySpikeAlert {
  id: string;
  timestamp: Date;
  p95SpikedToMs: number;
  durationMin: number;
  resolved: boolean;
}

export interface ServiceFull {
  id: string;
  name: ServiceName;
  status: ServiceStatus;
  priority: 1 | 2;
  healthCheckUrl: string;
  lastCheckedAt: Date;
  /** Optional short status label rendered next to the dot. */
  note?: string;
  // observability
  latency24h: { p50: number; p95: number; p99: number };
  successRate24h: number;
  successRate7d: number;
  uptime30d: number;
  inflightCount: number;
  webhooksLastHour: number;
  successSparkline24h: number[];
  healthChecksLast20: HealthCheckPoint[];
  recentWebhookEvents: WebhookEvent[];
  latencySpikeAlerts: LatencySpikeAlert[];
  // jsonb config
  config: Record<string, unknown>;
  configSensitiveKeys: string[];
}

// =====================================================================
// Reference time + admin pool — keep aligned with sibling modules
// =====================================================================

const NOW = new Date('2026-04-29T10:30:00Z');
function secsAgo(s: number): Date {
  return new Date(NOW.getTime() - s * 1000);
}
function minsAgo(m: number): Date {
  return new Date(NOW.getTime() - m * 60 * 1000);
}
function hoursAgo(h: number): Date {
  return new Date(NOW.getTime() - h * 60 * 60 * 1000);
}

// =====================================================================
// Health-check generators — deterministic per service
// =====================================================================

/**
 * Build the last-20 health-check pip strip with a realistic mix.
 * Indexed newest first (idx 0 = most recent). The mix is parameterized so
 * each service can carry a believable signature:
 *   - alipay  / uzcard / myid → mostly ok, occasional slow
 *   - humo                    → degraded — mix of ok / slow / a couple failed
 *   - wechat                  → mostly ok historically (maintenance hides
 *                                live, but the strip retains the previous
 *                                period for a clean visual continuity)
 */
function buildPips(
  baseLatency: number,
  pattern: 'healthy' | 'degraded' | 'maintenance',
): HealthCheckPoint[] {
  const out: HealthCheckPoint[] = [];
  for (let i = 0; i < 20; i++) {
    const tickSec = 30 + i * 30; // every ~30s back
    const ts = secsAgo(tickSec);
    let status: HealthCheckStatus = 'ok';
    let resp = baseLatency;
    if (pattern === 'healthy') {
      // 1/20 slow blips at i = 6 and i = 13
      if (i === 6 || i === 13) {
        status = 'slow';
        resp = Math.round(baseLatency * 2.4);
      } else {
        // small natural jitter
        resp = baseLatency + ((i * 7) % 31) - 15;
      }
    } else if (pattern === 'degraded') {
      // humo — 4 slow + 2 failed scattered across the 20-sample window
      if (i === 1 || i === 5 || i === 11 || i === 18) {
        status = 'slow';
        resp = Math.round(baseLatency * 1.8);
      } else if (i === 8 || i === 16) {
        status = 'failed';
        resp = 0;
      } else {
        resp = baseLatency + ((i * 11) % 41) - 20;
      }
    } else if (pattern === 'maintenance') {
      // wechat — failed checks since maintenance window started
      if (i < 9) {
        status = 'failed';
        resp = 0;
      } else if (i === 9) {
        status = 'slow';
        resp = Math.round(baseLatency * 1.6);
      } else {
        resp = baseLatency + ((i * 5) % 27) - 13;
      }
    }
    out.push({
      timestamp: ts,
      responseTimeMs: Math.max(0, resp),
      status,
    });
  }
  return out;
}

/**
 * Hourly success rate over last 24h, oldest first (idx 0 = 24h ago).
 * `dipAtIndex` injects a single dip to make humo's degradation visible.
 */
function buildSparkline(base: number, dipAtIndex?: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < 24; i++) {
    let v = base + ((i * 13) % 7) / 1000; // ~0.001 jitter
    if (dipAtIndex !== undefined && i === dipAtIndex) {
      v = base - 0.04;
    } else if (dipAtIndex !== undefined && (i === dipAtIndex - 1 || i === dipAtIndex + 1)) {
      v = base - 0.015;
    }
    out.push(Math.max(0, Math.min(1, v)));
  }
  return out;
}

// =====================================================================
// Webhook events + latency-spike alerts (small per-service samples)
// =====================================================================

function alipayWebhooks(): WebhookEvent[] {
  return [
    { id: 'wh_a_010', timestamp: minsAgo(2),   eventType: 'transfer.completed', status: 'processed' },
    { id: 'wh_a_009', timestamp: minsAgo(4),   eventType: 'transfer.completed', status: 'processed' },
    { id: 'wh_a_008', timestamp: minsAgo(7),   eventType: 'transfer.completed', status: 'processed' },
    { id: 'wh_a_007', timestamp: minsAgo(11),  eventType: 'transfer.failed',    status: 'processed' },
    { id: 'wh_a_006', timestamp: minsAgo(14),  eventType: 'transfer.completed', status: 'processed' },
    { id: 'wh_a_005', timestamp: minsAgo(18),  eventType: 'transfer.completed', status: 'received' },
    { id: 'wh_a_004', timestamp: minsAgo(23),  eventType: 'transfer.completed', status: 'processed' },
    { id: 'wh_a_003', timestamp: minsAgo(27),  eventType: 'transfer.completed', status: 'processed' },
    { id: 'wh_a_002', timestamp: minsAgo(34),  eventType: 'transfer.completed', status: 'processed' },
    { id: 'wh_a_001', timestamp: minsAgo(41),  eventType: 'transfer.completed', status: 'processed' },
  ];
}
function wechatWebhooks(): WebhookEvent[] {
  return [
    // pre-maintenance traffic
    { id: 'wh_w_006', timestamp: minsAgo(8),   eventType: 'transfer.completed', status: 'processed' },
    { id: 'wh_w_005', timestamp: minsAgo(11),  eventType: 'transfer.completed', status: 'processed' },
    { id: 'wh_w_004', timestamp: minsAgo(15),  eventType: 'transfer.failed',    status: 'failed' },
    { id: 'wh_w_003', timestamp: minsAgo(22),  eventType: 'transfer.completed', status: 'processed' },
    { id: 'wh_w_002', timestamp: minsAgo(31),  eventType: 'transfer.completed', status: 'processed' },
    { id: 'wh_w_001', timestamp: minsAgo(45),  eventType: 'transfer.completed', status: 'processed' },
  ];
}
function uzcardWebhooks(): WebhookEvent[] {
  return [
    { id: 'wh_u_010', timestamp: minsAgo(1),   eventType: 'card.auth.captured', status: 'processed' },
    { id: 'wh_u_009', timestamp: minsAgo(3),   eventType: 'card.auth.captured', status: 'processed' },
    { id: 'wh_u_008', timestamp: minsAgo(5),   eventType: 'card.auth.declined', status: 'processed' },
    { id: 'wh_u_007', timestamp: minsAgo(8),   eventType: 'card.auth.captured', status: 'processed' },
    { id: 'wh_u_006', timestamp: minsAgo(12),  eventType: 'card.auth.captured', status: 'processed' },
    { id: 'wh_u_005', timestamp: minsAgo(17),  eventType: 'card.3ds.passed',    status: 'processed' },
    { id: 'wh_u_004', timestamp: minsAgo(21),  eventType: 'card.auth.captured', status: 'processed' },
    { id: 'wh_u_003', timestamp: minsAgo(28),  eventType: 'card.auth.captured', status: 'processed' },
    { id: 'wh_u_002', timestamp: minsAgo(36),  eventType: 'card.auth.captured', status: 'processed' },
    { id: 'wh_u_001', timestamp: minsAgo(48),  eventType: 'card.auth.captured', status: 'processed' },
  ];
}
function humoWebhooks(): WebhookEvent[] {
  return [
    { id: 'wh_h_010', timestamp: minsAgo(2),   eventType: 'card.auth.captured', status: 'processed' },
    { id: 'wh_h_009', timestamp: minsAgo(5),   eventType: 'card.auth.timeout',  status: 'failed'    },
    { id: 'wh_h_008', timestamp: minsAgo(9),   eventType: 'card.auth.captured', status: 'processed' },
    { id: 'wh_h_007', timestamp: minsAgo(13),  eventType: 'card.auth.captured', status: 'processed' },
    { id: 'wh_h_006', timestamp: minsAgo(17),  eventType: 'card.auth.timeout',  status: 'failed'    },
    { id: 'wh_h_005', timestamp: minsAgo(22),  eventType: 'card.auth.captured', status: 'processed' },
    { id: 'wh_h_004', timestamp: minsAgo(28),  eventType: 'card.3ds.passed',    status: 'processed' },
    { id: 'wh_h_003', timestamp: minsAgo(35),  eventType: 'card.auth.captured', status: 'processed' },
    { id: 'wh_h_002', timestamp: minsAgo(43),  eventType: 'card.auth.declined', status: 'processed' },
    { id: 'wh_h_001', timestamp: minsAgo(52),  eventType: 'card.auth.captured', status: 'processed' },
  ];
}
function myidWebhooks(): WebhookEvent[] {
  return [
    { id: 'wh_m_005', timestamp: minsAgo(6),   eventType: 'kyc.passed',  status: 'processed' },
    { id: 'wh_m_004', timestamp: minsAgo(14),  eventType: 'kyc.passed',  status: 'processed' },
    { id: 'wh_m_003', timestamp: minsAgo(23),  eventType: 'kyc.failed',  status: 'processed' },
    { id: 'wh_m_002', timestamp: minsAgo(38),  eventType: 'kyc.passed',  status: 'processed' },
    { id: 'wh_m_001', timestamp: minsAgo(54),  eventType: 'kyc.passed',  status: 'processed' },
  ];
}

function alipayAlerts(): LatencySpikeAlert[] {
  return [
    { id: 'al_a_002', timestamp: hoursAgo(6),  p95SpikedToMs: 940,  durationMin: 4, resolved: true },
    { id: 'al_a_001', timestamp: hoursAgo(28), p95SpikedToMs: 720,  durationMin: 2, resolved: true },
  ];
}
function wechatAlerts(): LatencySpikeAlert[] {
  return [
    { id: 'al_w_002', timestamp: minsAgo(4),   p95SpikedToMs: 0,    durationMin: 4, resolved: false },
    { id: 'al_w_001', timestamp: hoursAgo(48), p95SpikedToMs: 1100, durationMin: 8, resolved: true },
  ];
}
function uzcardAlerts(): LatencySpikeAlert[] {
  return [
    { id: 'al_u_001', timestamp: hoursAgo(72), p95SpikedToMs: 1200, durationMin: 6, resolved: true },
  ];
}
function humoAlerts(): LatencySpikeAlert[] {
  return [
    { id: 'al_h_005', timestamp: minsAgo(38),  p95SpikedToMs: 2400, durationMin: 12, resolved: false },
    { id: 'al_h_004', timestamp: hoursAgo(8),  p95SpikedToMs: 2100, durationMin:  9, resolved: true },
    { id: 'al_h_003', timestamp: hoursAgo(20), p95SpikedToMs: 1800, durationMin:  4, resolved: true },
    { id: 'al_h_002', timestamp: hoursAgo(36), p95SpikedToMs: 1600, durationMin:  3, resolved: true },
    { id: 'al_h_001', timestamp: hoursAgo(60), p95SpikedToMs: 1400, durationMin:  2, resolved: true },
  ];
}
function myidAlerts(): LatencySpikeAlert[] {
  return [
    { id: 'al_m_002', timestamp: hoursAgo(14), p95SpikedToMs: 3200, durationMin: 18, resolved: true },
    { id: 'al_m_001', timestamp: hoursAgo(50), p95SpikedToMs: 2800, durationMin:  6, resolved: true },
  ];
}

// =====================================================================
// Service seed — 5 services
// =====================================================================

const _SEED: ServiceFull[] = [
  {
    id: 'svc_alipay',
    name: 'alipay',
    status: 'active',
    priority: 1,
    healthCheckUrl: 'https://openapi.alipay.com/gateway.do?method=alipay.system.oauth.token',
    lastCheckedAt: secsAgo(12),
    latency24h: { p50: 280, p95: 540, p99: 820 },
    successRate24h: 0.997,
    successRate7d: 0.995,
    uptime30d: 0.9991,
    inflightCount: 42,
    webhooksLastHour: 318,
    successSparkline24h: buildSparkline(0.996),
    healthChecksLast20: buildPips(280, 'healthy'),
    recentWebhookEvents: alipayWebhooks(),
    latencySpikeAlerts: alipayAlerts(),
    config: {
      app_id: '2021004112634123',
      gateway_url: 'https://openapi.alipay.com/gateway.do',
      sandbox_url: 'https://openapi.alipaydev.com/gateway.do',
      api_key: 'sk_live_alipay_••••••••',
      private_key: '••••••••',
      webhook_signing_secret: '••••••••',
      timeout_ms: 30000,
      retry_attempts: 3,
    },
    configSensitiveKeys: ['api_key', 'private_key', 'webhook_signing_secret'],
  },
  {
    id: 'svc_wechat',
    name: 'wechat',
    status: 'maintenance',
    priority: 1,
    healthCheckUrl: 'https://api.mch.weixin.qq.com/v3/certificates',
    lastCheckedAt: minsAgo(4),
    note: 'Scheduled maintenance window 14:00–16:00 UTC+5',
    latency24h: { p50: 0, p95: 0, p99: 0 },
    successRate24h: 0.0,
    successRate7d: 0.992,
    uptime30d: 0.9942,
    inflightCount: 0,
    webhooksLastHour: 0,
    successSparkline24h: buildSparkline(0.99, 22),
    healthChecksLast20: buildPips(220, 'maintenance'),
    recentWebhookEvents: wechatWebhooks(),
    latencySpikeAlerts: wechatAlerts(),
    config: {
      mch_id: '1601234567',
      app_id: 'wxd930ea5d5a258f4f',
      api_url: 'https://api.mch.weixin.qq.com/v3',
      api_key: 'sk_live_wechat_••••••••',
      cert_serial_no: '••••••••',
      api_v3_key: '••••••••',
      webhook_signing_secret: '••••••••',
      timeout_ms: 30000,
      retry_attempts: 3,
    },
    configSensitiveKeys: ['api_key', 'cert_serial_no', 'api_v3_key', 'webhook_signing_secret'],
  },
  {
    id: 'svc_uzcard',
    name: 'uzcard',
    status: 'active',
    priority: 1,
    healthCheckUrl: 'https://api.uzcard.uz/v2/health',
    lastCheckedAt: secsAgo(8),
    latency24h: { p50: 340, p95: 580, p99: 740 },
    successRate24h: 0.999,
    successRate7d: 0.998,
    uptime30d: 0.9997,
    inflightCount: 67,
    webhooksLastHour: 412,
    successSparkline24h: buildSparkline(0.998),
    healthChecksLast20: buildPips(340, 'healthy'),
    recentWebhookEvents: uzcardWebhooks(),
    latencySpikeAlerts: uzcardAlerts(),
    config: {
      terminal_id: '90120103',
      gateway_url: 'https://api.uzcard.uz/v2',
      acquirer_id: 'UZB-7849',
      api_key: 'sk_live_uzcard_••••••••',
      shared_secret: '••••••••',
      webhook_signing_secret: '••••••••',
      timeout_ms: 25000,
      retry_attempts: 2,
    },
    configSensitiveKeys: ['api_key', 'shared_secret', 'webhook_signing_secret'],
  },
  {
    id: 'svc_humo',
    name: 'humo',
    status: 'active',
    priority: 2,
    healthCheckUrl: 'https://gateway.humo.uz/api/v1/health',
    lastCheckedAt: secsAgo(15),
    note: 'Elevated latency',
    latency24h: { p50: 620, p95: 1480, p99: 2380 },
    successRate24h: 0.976,
    successRate7d: 0.989,
    uptime30d: 0.9938,
    inflightCount: 23,
    webhooksLastHour: 187,
    successSparkline24h: buildSparkline(0.988, 18),
    healthChecksLast20: buildPips(620, 'degraded'),
    recentWebhookEvents: humoWebhooks(),
    latencySpikeAlerts: humoAlerts(),
    config: {
      terminal_id: '88210034',
      gateway_url: 'https://gateway.humo.uz/api/v1',
      acquirer_id: 'UZB-3120',
      api_key: 'sk_live_humo_••••••••',
      shared_secret: '••••••••',
      webhook_signing_secret: '••••••••',
      timeout_ms: 25000,
      retry_attempts: 2,
    },
    configSensitiveKeys: ['api_key', 'shared_secret', 'webhook_signing_secret'],
  },
  {
    id: 'svc_myid',
    name: 'myid',
    status: 'active',
    priority: 1,
    healthCheckUrl: 'https://myid.uz/api/v1/status',
    lastCheckedAt: secsAgo(22),
    latency24h: { p50: 1200, p95: 2400, p99: 3600 },
    successRate24h: 0.989,
    successRate7d: 0.991,
    uptime30d: 0.9982,
    inflightCount: 11,
    webhooksLastHour: 47,
    successSparkline24h: buildSparkline(0.99),
    healthChecksLast20: buildPips(1200, 'healthy'),
    recentWebhookEvents: myidWebhooks(),
    latencySpikeAlerts: myidAlerts(),
    config: {
      client_id: 'zhipay_admin_prod',
      api_url: 'https://myid.uz/api/v1',
      api_key: 'sk_live_myid_••••••••',
      jwt_signing_key: '••••••••',
      webhook_signing_secret: '••••••••',
      timeout_ms: 45000,
      retry_attempts: 2,
    },
    configSensitiveKeys: ['api_key', 'jwt_signing_key', 'webhook_signing_secret'],
  },
];

let liveServices: ServiceFull[] = _SEED.map((s) => ({ ...s }));

// =====================================================================
// Public read API
// =====================================================================

export function listServices(): ServiceFull[] {
  return liveServices;
}

export function getServiceById(id: string): ServiceFull | undefined {
  return liveServices.find((s) => s.id === id);
}

/**
 * Health overlay derived from the recent pip strip.
 * Disabled / maintenance services still expose their last-seen health
 * (so the overlay can read "this was green before maintenance").
 */
export function deriveHealth(svc: ServiceFull): ServiceHealth {
  const recent = svc.healthChecksLast20.slice(0, 10);
  const failed = recent.filter((p) => p.status === 'failed').length;
  const slow = recent.filter((p) => p.status === 'slow').length;
  if (failed >= 3) return 'red';
  if (failed >= 1 || slow >= 3) return 'amber';
  return 'green';
}

export function getServicesCounts(): {
  active: number;
  maintenance: number;
  disabled: number;
  total: number;
} {
  let active = 0;
  let maintenance = 0;
  let disabled = 0;
  for (const s of liveServices) {
    if (s.status === 'active') active++;
    else if (s.status === 'maintenance') maintenance++;
    else if (s.status === 'disabled') disabled++;
  }
  return { active, maintenance, disabled, total: liveServices.length };
}

// =====================================================================
// Audit log — append-only
// =====================================================================

/**
 * Granular per-store action verbs. Mapped to the central log's
 * `status_changed` action with the granular verb landing in
 * `context.kind`.
 */
export type ServiceAuditAction =
  | 'activate'
  | 'enter_maintenance'
  | 'disable'
  | 'run_health_check';

export interface ServiceAuditEntry {
  id: string;
  serviceId: string;
  serviceName: ServiceName;
  action: ServiceAuditAction;
  actorId: string;
  actorName: string;
  /** Reason note — required for status changes (>= 20 chars), omitted for run_health_check. */
  reason: string;
  fromStatus: ServiceStatus | null;
  toStatus: ServiceStatus | null;
  /** Inflight count snapshot at time of change — for the disabled blast-radius story. */
  inflightAtChange: number;
  /** Acknowledgement checkbox flag — only set on disable transitions. */
  acknowledgeImpact?: boolean;
  context?: Record<string, unknown>;
  createdAt: Date;
}

const serviceAudit: ServiceAuditEntry[] = [];
let serviceAuditSeq = 1;

function appendServiceAudit(
  entry: Omit<ServiceAuditEntry, 'id' | 'createdAt'>,
): ServiceAuditEntry {
  const e: ServiceAuditEntry = {
    ...entry,
    id: `svaud_${String(serviceAuditSeq++).padStart(4, '0')}`,
    createdAt: new Date(),
  };
  serviceAudit.push(e);
  return e;
}

/** Bridge for the central audit-log surface — full module store, newest first. */
export function listServicesAudit(): ServiceAuditEntry[] {
  return serviceAudit.slice().reverse();
}

export function getServiceAuditForService(serviceId: string): ServiceAuditEntry[] {
  return serviceAudit.filter((e) => e.serviceId === serviceId).slice().reverse();
}

// =====================================================================
// Mutators
// =====================================================================

export interface ServiceActor {
  id: string;
  name: string;
}

export interface SetServiceStatusInput {
  serviceId: string;
  newStatus: ServiceStatus;
  reason: string;
  acknowledgeImpact?: boolean;
  actor: ServiceActor;
}

/**
 * Toggle a service's operational status. Always emits a single audit-log
 * row. The page is the only writer — there's no "freelance" status edit.
 *
 * Returns the updated row, or `null` if the service id is unknown or the
 * transition is a no-op.
 */
export function setServiceStatus(input: SetServiceStatusInput): ServiceFull | null {
  const idx = liveServices.findIndex((s) => s.id === input.serviceId);
  if (idx === -1) return null;
  const existing = liveServices[idx];
  if (existing.status === input.newStatus) return null;

  const action: ServiceAuditAction =
    input.newStatus === 'active'
      ? 'activate'
      : input.newStatus === 'maintenance'
        ? 'enter_maintenance'
        : 'disable';

  const updated: ServiceFull = {
    ...existing,
    status: input.newStatus,
    lastCheckedAt: new Date(),
  };
  liveServices = [
    ...liveServices.slice(0, idx),
    updated,
    ...liveServices.slice(idx + 1),
  ];

  appendServiceAudit({
    serviceId: existing.id,
    serviceName: existing.name,
    action,
    actorId: input.actor.id,
    actorName: input.actor.name,
    reason: input.reason,
    fromStatus: existing.status,
    toStatus: input.newStatus,
    inflightAtChange: existing.inflightCount,
    acknowledgeImpact: input.acknowledgeImpact,
  });
  return updated;
}

/**
 * Append a fresh health-check tick to the pip strip. Used by the "Run
 * health check now" CTA + the auto-refresh tick. Drops the oldest pip so
 * the strip stays at 20.
 */
export function runHealthCheck(serviceId: string): HealthCheckPoint | null {
  const idx = liveServices.findIndex((s) => s.id === serviceId);
  if (idx === -1) return null;
  const svc = liveServices[idx];
  // Keep the simulated check honest with the configured status.
  const status: HealthCheckStatus =
    svc.status === 'maintenance' ? 'failed' : svc.status === 'disabled' ? 'failed' : 'ok';
  const responseTimeMs = status === 'failed' ? 0 : svc.latency24h.p50;
  const point: HealthCheckPoint = {
    timestamp: new Date(),
    responseTimeMs,
    status,
  };
  const updated: ServiceFull = {
    ...svc,
    lastCheckedAt: point.timestamp,
    healthChecksLast20: [point, ...svc.healthChecksLast20.slice(0, 19)],
  };
  liveServices = [
    ...liveServices.slice(0, idx),
    updated,
    ...liveServices.slice(idx + 1),
  ];
  return point;
}

// =====================================================================
// Formatting helpers
// =====================================================================

export function formatLatencyMs(ms: number): string {
  if (!Number.isFinite(ms)) return '—';
  if (ms === 0) return '—';
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

/**
 * Format a 0..1 ratio as a percent with the spec's "99.7%" / "97.6%"
 * single-decimal style. 100% renders without a decimal so the column
 * stays tidy.
 */
export function formatPct(ratio: number, fractionDigits = 1): string {
  if (!Number.isFinite(ratio)) return '—';
  const v = ratio * 100;
  if (v === 100) return '100%';
  return `${v.toFixed(fractionDigits)}%`;
}
