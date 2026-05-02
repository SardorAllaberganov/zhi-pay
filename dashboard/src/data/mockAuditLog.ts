/**
 * Central audit-log mock — single source of truth for the
 * `/compliance/audit-log` surface.
 *
 * Strategy:
 *   1. **Bridge** the 6 existing module-level audit stores
 *      (mockUsers / mockCards / mockKycQueue / mockAmlTriage / mockFxRates /
 *       mockCommissionRules) so admin actions taken in this session appear
 *      here. The per-page tabs continue to read their own stores untouched.
 *   2. **Plus** a 200-row deterministic seed (manual, no PRNG) over the last
 *      7 days covering the four actor classes per the spec:
 *        ~80 system  (transfer state transitions, KYC auto-expire, FX-stale)
 *        ~50 provider (Alipay / WeChat completed/failed webhooks)
 *        ~40 admin    (KYC approve/reject, card freeze, AML clear, FX update,
 *                      commission rule new version)
 *        ~30 user     (login, kyc start, transfer submit, recipient save)
 *
 * Read-only by design: there is no mutator on this module — the surface
 * never writes back. Each existing surface continues to write to its own
 * store as before.
 *
 * Schema:
 *   id           string            (`evt_NNNN` for seed, source-prefixed
 *                                   for bridged rows)
 *   timestamp    Date
 *   actorType    'system' | 'user' | 'provider' | 'admin'
 *   actor        { id?, name?, ip?, device?, phone? }
 *   action       one of the 12 spec values (created / updated / deleted /
 *                status_changed / approved / rejected / cleared /
 *                escalated / frozen / unfrozen / reversed / failed)
 *   entity       { type, id }
 *   fromStatus   string | null
 *   toStatus     string | null
 *   reason       string?
 *   context      jsonb (per-row free-form; carries `kind` for the
 *                granular verb when it doesn't fit the 12-value enum,
 *                e.g. `kind: 'request_info'` rolls up to `action: 'updated'`)
 *
 * The real backend may store this as a UNION view over per-domain audit
 * tables, or as a single normalized `audit_events` table. For mock, we
 * synthesize the union.
 */

import { TRANSFER_EVENTS_FULL } from './mockTransfers';
import {
  listUserAudit,
  type UserAuditAction,
  type UserAuditEntry,
} from './mockUsers';
import {
  listCardAudit,
  type CardAuditAction,
  type CardAuditEntry,
} from './mockCards';
import {
  listKycAudit,
  type KycAuditAction,
  type KycAuditEntry,
} from './mockKycQueue';
import {
  listAmlAudit,
  type AmlAuditAction,
  type AmlAuditEntry,
} from './mockAmlTriage';
import {
  listFxAudit,
  type FxAuditEntry,
} from './mockFxRates';
import {
  listCommissionAudit,
  type CommissionAuditEntry,
} from './mockCommissionRules';
import {
  listBlacklistAudit,
  type BlacklistAuditAction,
  type BlacklistAuditEntry,
} from './mockBlacklist';

// =====================================================================
// Public types
// =====================================================================

export type AuditActorType = 'system' | 'user' | 'provider' | 'admin';

export type AuditEntityType =
  | 'transfer'
  | 'user'
  | 'card'
  | 'kyc'
  | 'aml'
  | 'blacklist'
  | 'fx'
  | 'commission'
  | 'service'
  | 'app_version'
  | 'notification';

export type AuditAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'status_changed'
  | 'approved'
  | 'rejected'
  | 'cleared'
  | 'escalated'
  | 'frozen'
  | 'unfrozen'
  | 'reversed'
  | 'failed';

export interface AuditActor {
  /** Stable id (admin id, user id, provider name, system module). */
  id?: string;
  /** Human-readable display name. */
  name?: string;
  /** Source IP — admin/user actions when known. */
  ip?: string;
  /** Device descriptor — admin actions when known. */
  device?: string;
  /** Phone for end-user actions (no name available). */
  phone?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: Date;
  actorType: AuditActorType;
  actor: AuditActor;
  action: AuditAction;
  entity: { type: AuditEntityType; id: string };
  fromStatus: string | null;
  toStatus: string | null;
  reason?: string;
  context: Record<string, unknown>;
}

// =====================================================================
// Reference time + admin pool — keep aligned with sibling modules
// =====================================================================

const NOW = new Date('2026-04-29T10:30:00Z');

function ago(days: number, hour = 9, minute = 0): Date {
  const d = new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);
  d.setUTCHours(hour, minute, 0, 0);
  return d;
}
function agoMins(mins: number): Date {
  return new Date(NOW.getTime() - mins * 60 * 1000);
}

interface AdminProfile {
  id: string;
  name: string;
  ip: string;
  device: string;
}

const SUPER_ADMIN: AdminProfile = {
  id: 'admin_super_01',
  name: 'Yulduz Otaboeva',
  ip: '95.214.10.42',
  device: 'macOS 14 · Chrome 132',
};
const FINANCE_ADMIN: AdminProfile = {
  id: 'admin_finance_02',
  name: 'Adel Ortiqova',
  ip: '95.214.10.118',
  device: 'macOS 14 · Safari 17',
};

export const ADMIN_PROFILES: AdminProfile[] = [SUPER_ADMIN, FINANCE_ADMIN];

const PROVIDERS = ['alipay', 'wechat'] as const;

// =====================================================================
// 200-row deterministic seed
//
// Layout (for predictable spread):
//   - 80 system entries     — transfer state transitions over 7 days
//   - 50 provider webhooks  — alternating alipay/wechat completed/failed
//   - 40 admin actions      — kyc/cards/aml/fx/commission slots
//   - 30 user actions       — login/kyc-start/transfer-submit/recipient-save
//
// Timestamps weighted toward business hours (UZT = UTC+5; we keep UTC and
// pick hours 5-15 = local 10:00-20:00). 4-5 short clusters keep related
// actions on the same entity within a few minutes for the demo.
// =====================================================================

let seq = 1;
function nextId(): string {
  return `evt_${String(seq++).padStart(4, '0')}`;
}

function mkSystem(
  timestamp: Date,
  partial: Omit<AuditEvent, 'id' | 'timestamp' | 'actorType' | 'actor'>,
): AuditEvent {
  return {
    id: nextId(),
    timestamp,
    actorType: 'system',
    actor: { id: 'system', name: 'system' },
    ...partial,
  };
}

function mkProvider(
  timestamp: Date,
  provider: (typeof PROVIDERS)[number],
  partial: Omit<AuditEvent, 'id' | 'timestamp' | 'actorType' | 'actor'>,
): AuditEvent {
  return {
    id: nextId(),
    timestamp,
    actorType: 'provider',
    actor: { id: provider, name: provider },
    ...partial,
  };
}

function mkAdmin(
  timestamp: Date,
  admin: AdminProfile,
  partial: Omit<AuditEvent, 'id' | 'timestamp' | 'actorType' | 'actor'>,
): AuditEvent {
  return {
    id: nextId(),
    timestamp,
    actorType: 'admin',
    actor: {
      id: admin.id,
      name: admin.name,
      ip: admin.ip,
      device: admin.device,
    },
    ...partial,
  };
}

function mkUser(
  timestamp: Date,
  phone: string,
  partial: Omit<AuditEvent, 'id' | 'timestamp' | 'actorType' | 'actor'>,
): AuditEvent {
  return {
    id: nextId(),
    timestamp,
    actorType: 'user',
    actor: { phone },
    ...partial,
  };
}

const SEED_USER_PHONES = [
  '+998 90 123 45 67',
  '+998 91 234 56 78',
  '+998 93 345 67 89',
  '+998 94 456 78 90',
  '+998 95 567 89 01',
  '+998 97 678 90 12',
  '+998 99 789 01 23',
];
const SEED_USER_IDS = ['u_01', 'u_02', 'u_03', 'u_04', 'u_05', 'u_06', 'u_07'];

const SEED_TRANSFER_IDS = [
  'tx_seed_a01',
  'tx_seed_a02',
  'tx_seed_a03',
  'tx_seed_a04',
  'tx_seed_a05',
  'tx_seed_a06',
  'tx_seed_a07',
  'tx_seed_a08',
  'tx_seed_a09',
  'tx_seed_a10',
  'tx_seed_a11',
  'tx_seed_a12',
];

const SEED: AuditEvent[] = [];

// ---------------------------------------------------------------------
// SYSTEM — 80 rows (transfer state transitions, KYC auto-expire, FX stale)
// ---------------------------------------------------------------------
{
  // 4 clusters of 6 events each = 24 — same transfer walked through states
  // (created → processing → completed) within minutes.
  const clusters: Array<{ tx: string; baseDay: number; hour: number }> = [
    { tx: SEED_TRANSFER_IDS[0], baseDay: 0, hour: 9 },
    { tx: SEED_TRANSFER_IDS[1], baseDay: 1, hour: 11 },
    { tx: SEED_TRANSFER_IDS[2], baseDay: 3, hour: 14 },
    { tx: SEED_TRANSFER_IDS[3], baseDay: 5, hour: 8 },
  ];
  for (const c of clusters) {
    const t0 = ago(c.baseDay, c.hour, 0);
    SEED.push(
      mkSystem(t0, {
        action: 'created',
        entity: { type: 'transfer', id: c.tx },
        fromStatus: null,
        toStatus: 'created',
        context: { kind: 'transfer_create', cluster: true },
      }),
      mkSystem(new Date(t0.getTime() + 30 * 1000), {
        action: 'status_changed',
        entity: { type: 'transfer', id: c.tx },
        fromStatus: 'created',
        toStatus: 'processing',
        context: { kind: 'auth_captured', cluster: true },
      }),
      mkSystem(new Date(t0.getTime() + 90 * 1000), {
        action: 'status_changed',
        entity: { type: 'transfer', id: c.tx },
        fromStatus: 'processing',
        toStatus: 'completed',
        context: { kind: 'transfer_complete', cluster: true },
      }),
    );
  }
  // 1 cluster of failure: created → processing → failed.
  {
    const tx = SEED_TRANSFER_IDS[4];
    const t0 = ago(2, 13, 5);
    SEED.push(
      mkSystem(t0, {
        action: 'created',
        entity: { type: 'transfer', id: tx },
        fromStatus: null,
        toStatus: 'created',
        context: { kind: 'transfer_create', cluster: true },
      }),
      mkSystem(new Date(t0.getTime() + 45 * 1000), {
        action: 'status_changed',
        entity: { type: 'transfer', id: tx },
        fromStatus: 'created',
        toStatus: 'processing',
        context: { kind: 'auth_captured', cluster: true },
      }),
      mkSystem(new Date(t0.getTime() + 240 * 1000), {
        action: 'failed',
        entity: { type: 'transfer', id: tx },
        fromStatus: 'processing',
        toStatus: 'failed',
        context: {
          kind: 'transfer_failed',
          failure_code: 'PROVIDER_UNAVAILABLE',
          cluster: true,
        },
      }),
    );
  }

  // Background system noise — KYC auto-expire scans
  for (let i = 0; i < 12; i++) {
    const day = i % 7;
    const hour = 5 + (i % 8);
    SEED.push(
      mkSystem(ago(day, hour, (i * 7) % 60), {
        action: 'updated',
        entity: { type: 'kyc', id: `kyc_seed_${String(100 + i).padStart(3, '0')}` },
        fromStatus: 'passed',
        toStatus: 'expired',
        context: { kind: 'kyc_auto_expire', batch: 'nightly_scan' },
      }),
    );
  }

  // FX stale flagging — once per day mid-day
  for (let day = 0; day < 7; day++) {
    SEED.push(
      mkSystem(ago(day, 12, 0), {
        action: 'updated',
        entity: { type: 'fx', id: `fxr_seed_${String(day + 1).padStart(3, '0')}` },
        fromStatus: 'healthy',
        toStatus: 'drifting',
        context: { kind: 'fx_health_change', spread_pct: 1.6 + day * 0.05 },
      }),
    );
  }

  // Background transfer state transitions — 30 standalone events spread
  // across the 7 days.
  const TX_SUFFIX = ['s01','s02','s03','s04','s05','s06','s07','s08','s09','s10',
                     's11','s12','s13','s14','s15','s16','s17','s18','s19','s20',
                     's21','s22','s23','s24','s25','s26','s27','s28','s29','s30'];
  const TX_FROM_TO: Array<[string | null, string]> = [
    [null, 'created'], ['created', 'processing'], ['processing', 'completed'],
    [null, 'created'], ['created', 'processing'], ['processing', 'completed'],
    ['processing', 'failed'], [null, 'created'], ['created', 'processing'],
    ['processing', 'completed'], [null, 'created'], ['created', 'processing'],
    ['processing', 'completed'], [null, 'created'], ['created', 'processing'],
    ['processing', 'completed'], [null, 'created'], ['created', 'processing'],
    ['processing', 'completed'], [null, 'created'], ['created', 'processing'],
    ['processing', 'completed'], [null, 'created'], ['created', 'processing'],
    ['processing', 'completed'], [null, 'created'], ['created', 'processing'],
    ['processing', 'completed'], [null, 'created'], ['processing', 'completed'],
  ];
  for (let i = 0; i < TX_SUFFIX.length; i++) {
    const day = i % 7;
    const hour = 5 + ((i * 3) % 11);
    const minute = (i * 13) % 60;
    const [from, to] = TX_FROM_TO[i];
    const action: AuditAction =
      from === null ? 'created' : to === 'failed' ? 'failed' : 'status_changed';
    SEED.push(
      mkSystem(ago(day, hour, minute), {
        action,
        entity: { type: 'transfer', id: `tx_seed_b${TX_SUFFIX[i]}` },
        fromStatus: from,
        toStatus: to,
        context: action === 'failed'
          ? { kind: 'transfer_failed', failure_code: i % 2 === 0 ? 'CARD_DECLINED' : 'INSUFFICIENT_FUNDS' }
          : { kind: from === null ? 'transfer_create' : 'state_transition' },
      }),
    );
  }
  // Top up to 80 system rows with KYC verified + KYC expired sweeps.
  let pad = 80 - (SEED.filter((e) => e.actorType === 'system').length);
  let i = 0;
  while (pad > 0) {
    const day = i % 7;
    const hour = 5 + ((i * 5) % 11);
    SEED.push(
      mkSystem(ago(day, hour, (i * 17) % 60), {
        action: 'updated',
        entity: { type: 'user', id: `u_seed_${String(200 + i).padStart(3, '0')}` },
        fromStatus: null,
        toStatus: null,
        context: { kind: 'last_login_recorded' },
      }),
    );
    pad--;
    i++;
  }
}

// ---------------------------------------------------------------------
// PROVIDER — 50 rows (alipay/wechat webhooks)
// ---------------------------------------------------------------------
{
  for (let i = 0; i < 50; i++) {
    const provider = PROVIDERS[i % 2];
    const day = i % 7;
    const hour = 5 + ((i * 4) % 11);
    const minute = (i * 11) % 60;
    const isFailure = i % 9 === 0; // ~5/50 failures
    SEED.push(
      mkProvider(ago(day, hour, minute), provider, {
        action: isFailure ? 'failed' : 'status_changed',
        entity: {
          type: 'transfer',
          id: `tx_seed_p${String(100 + i).padStart(3, '0')}`,
        },
        fromStatus: 'processing',
        toStatus: isFailure ? 'failed' : 'completed',
        context: isFailure
          ? {
              kind: 'webhook',
              webhook_event: `${provider}.transfer.failed`,
              failure_code: provider === 'alipay' ? 'RECIPIENT_INVALID' : 'PROVIDER_UNAVAILABLE',
              external_tx_id: `${provider.toUpperCase()}_${1000 + i}`,
            }
          : {
              kind: 'webhook',
              webhook_event: `${provider}.transfer.completed`,
              external_tx_id: `${provider.toUpperCase()}_${1000 + i}`,
            },
      }),
    );
  }
}

// ---------------------------------------------------------------------
// ADMIN — 40 rows (KYC approve/reject, card freeze, AML clear, FX update,
//                  commission rule new version)
// ---------------------------------------------------------------------
{
  // KYC approves x10
  for (let i = 0; i < 10; i++) {
    const day = i % 7;
    const hour = 5 + ((i * 3) % 11);
    const admin = i % 2 === 0 ? SUPER_ADMIN : FINANCE_ADMIN;
    SEED.push(
      mkAdmin(ago(day, hour, (i * 23) % 60), admin, {
        action: 'approved',
        entity: { type: 'kyc', id: `kyc_seed_app_${String(i + 1).padStart(3, '0')}` },
        fromStatus: 'pending',
        toStatus: 'passed',
        reason: 'All checks passed; document quality acceptable.',
        context: { kind: 'kyc_approve', user_id: SEED_USER_IDS[i % SEED_USER_IDS.length] },
      }),
    );
  }
  // KYC rejects x5
  const REJECT_REASONS = [
    'Document image too blurred — please re-submit.',
    'PINFL on document does not match registered account.',
    'Photo is older than 30 days; please re-take.',
    'Date of birth on document is illegible.',
    'Document type not supported (foreign passport flagged).',
  ];
  for (let i = 0; i < 5; i++) {
    const day = i % 7;
    const admin = i % 2 === 0 ? SUPER_ADMIN : FINANCE_ADMIN;
    SEED.push(
      mkAdmin(ago(day, 6 + i, 30 + i * 5), admin, {
        action: 'rejected',
        entity: { type: 'kyc', id: `kyc_seed_rej_${String(i + 1).padStart(3, '0')}` },
        fromStatus: 'pending',
        toStatus: 'failed',
        reason: REJECT_REASONS[i],
        context: {
          kind: 'kyc_reject',
          failure_reason: ['document_quality', 'pinfl_mismatch', 'photo_stale', 'illegible', 'unsupported_doc'][i],
          user_id: SEED_USER_IDS[i % SEED_USER_IDS.length],
        },
      }),
    );
  }
  // Card freeze x6
  const FREEZE_REASONS = [
    'Customer reported card lost — frozen pending replacement.',
    'Suspected unauthorized use; flagged by AML.',
    'Compliance hold — sanctions list match pending review.',
    'Customer-requested freeze via support channel.',
    'Repeated failed 3DS attempts within 1h.',
    'Daily limit breach pattern flagged for review.',
  ];
  for (let i = 0; i < 6; i++) {
    const day = i % 7;
    const admin = i % 2 === 0 ? FINANCE_ADMIN : SUPER_ADMIN;
    SEED.push(
      mkAdmin(ago(day, 7 + (i * 2) % 8, (i * 19) % 60), admin, {
        action: 'frozen',
        entity: { type: 'card', id: `c_seed_${String(100 + i).padStart(3, '0')}` },
        fromStatus: 'active',
        toStatus: 'frozen',
        reason: FREEZE_REASONS[i],
        context: {
          kind: 'card_freeze',
          severity: ['low', 'medium', 'high', 'low', 'high', 'medium'][i],
          scheme: i % 2 === 0 ? 'uzcard' : 'humo',
        },
      }),
    );
  }
  // Card unfreeze x2
  for (let i = 0; i < 2; i++) {
    SEED.push(
      mkAdmin(ago(i + 1, 10 + i, 15), SUPER_ADMIN, {
        action: 'unfrozen',
        entity: { type: 'card', id: `c_seed_${String(110 + i).padStart(3, '0')}` },
        fromStatus: 'frozen',
        toStatus: 'active',
        reason: 'Customer identity re-confirmed; replacement card delivered.',
        context: { kind: 'card_unfreeze', scheme: 'humo' },
      }),
    );
  }
  // AML clear x6
  const AML_CLEAR_REASONS = [
    'Velocity check explained by recurring vendor invoice; cleared.',
    'Amount within usual customer pattern post-deeper review.',
    'Pattern false-positive — sender-recipient pair pre-vetted.',
    'Manual flag closed; reporter retracted suspicion.',
    'Reviewer verified business context; cleared.',
    'Repeat sender, all prior transfers settled cleanly.',
  ];
  for (let i = 0; i < 6; i++) {
    const day = i % 7;
    const admin = i % 2 === 0 ? SUPER_ADMIN : FINANCE_ADMIN;
    SEED.push(
      mkAdmin(ago(day, 9 + i, 5 + i * 7), admin, {
        action: 'cleared',
        entity: { type: 'aml', id: `aml_seed_${String(100 + i).padStart(3, '0')}` },
        fromStatus: 'reviewing',
        toStatus: 'cleared',
        reason: AML_CLEAR_REASONS[i],
        context: {
          kind: 'aml_clear',
          flag_type: ['velocity', 'amount', 'pattern', 'manual', 'pattern', 'velocity'][i],
          clear_reason: ['benign_pattern', 'context_verified', 'false_positive', 'reporter_retracted', 'context_verified', 'benign_pattern'][i],
        },
      }),
    );
  }
  // AML escalate x3 (one critical → user blocked)
  SEED.push(
    mkAdmin(ago(1, 15, 22), SUPER_ADMIN, {
      action: 'escalated',
      entity: { type: 'aml', id: 'aml_seed_critical_001' },
      fromStatus: 'reviewing',
      toStatus: 'escalated',
      reason: 'Sanctions hit confirmed against OFAC entity. Auto-blocking user.',
      context: { kind: 'aml_escalate', severity: 'critical', blocks_user: true, user_id: 'u_seed_999' },
    }),
    mkAdmin(ago(3, 11, 8), FINANCE_ADMIN, {
      action: 'escalated',
      entity: { type: 'aml', id: 'aml_seed_warn_002' },
      fromStatus: 'reviewing',
      toStatus: 'escalated',
      reason: 'Compliance review required — pattern inconsistent with KYC profile.',
      context: { kind: 'aml_escalate', severity: 'warning' },
    }),
    mkAdmin(ago(5, 14, 41), SUPER_ADMIN, {
      action: 'escalated',
      entity: { type: 'aml', id: 'aml_seed_info_003' },
      fromStatus: 'open',
      toStatus: 'escalated',
      reason: 'Forwarding to senior reviewer due to high amount.',
      context: { kind: 'aml_escalate', severity: 'info' },
    }),
  );
  // FX rate update x4
  const FX_REASONS = [
    'Daily CBU mid-rate refresh.',
    'Spread tightened to 1.20% per pricing-committee review.',
    'Manual override after PBoC weekend devaluation announcement.',
    'Regular daily rate refresh.',
  ];
  for (let i = 0; i < 4; i++) {
    SEED.push(
      mkAdmin(ago(i * 2, 8, 0), i % 2 === 0 ? FINANCE_ADMIN : SUPER_ADMIN, {
        action: 'created',
        entity: { type: 'fx', id: `fxr_seed_v${String(15 + i).padStart(3, '0')}` },
        fromStatus: null,
        toStatus: 'active',
        reason: FX_REASONS[i],
        context: {
          kind: 'fx_rate_create',
          pair: 'UZS_CNY',
          mid_rate: 1404.17 - i * 0.5,
          spread_pct: i === 2 ? 1.5 : 1.2,
          source: i === 2 ? 'manual' : 'central_bank',
        },
      }),
    );
  }
  // Commission rule new version x2
  SEED.push(
    mkAdmin(ago(4, 10, 0), FINANCE_ADMIN, {
      action: 'created',
      entity: { type: 'commission', id: 'cr_seed_p013' },
      fromStatus: null,
      toStatus: 'active',
      reason: 'Quarterly pricing review — narrowed band per regulator notice CBU-2026-04.',
      context: {
        kind: 'commission_rule_create',
        account_type: 'personal',
        version: 13,
        min_pct: 0.6,
        max_pct: 1.9,
      },
    }),
    mkAdmin(ago(6, 9, 30), SUPER_ADMIN, {
      action: 'created',
      entity: { type: 'commission', id: 'cr_seed_c009' },
      fromStatus: null,
      toStatus: 'active',
      reason: 'Corporate-tier discount adjusted after volume pattern review.',
      context: {
        kind: 'commission_rule_create',
        account_type: 'corporate',
        version: 9,
        corporate_pct: 0.25,
      },
    }),
  );
  // Blacklist add x1
  SEED.push(
    mkAdmin(ago(2, 16, 14), SUPER_ADMIN, {
      action: 'created',
      entity: { type: 'blacklist', id: 'bl_seed_001' },
      fromStatus: null,
      toStatus: 'active',
      reason: 'Phone reported in repeated fraud attempts; added to phone blacklist.',
      context: { kind: 'blacklist_add', identifier_type: 'phone', identifier: '+998 90 000 00 00' },
    }),
  );
  // Service maintenance toggle x1
  SEED.push(
    mkAdmin(ago(0, 5, 5), SUPER_ADMIN, {
      action: 'updated',
      entity: { type: 'service', id: 'svc_alipay' },
      fromStatus: 'active',
      toStatus: 'maintenance',
      reason: 'Scheduled maintenance window — Alipay v3 webhook migration.',
      context: { kind: 'service_toggle', service: 'alipay' },
    }),
  );
}

// ---------------------------------------------------------------------
// USER — 30 rows (login, kyc start, transfer submit, recipient save)
// ---------------------------------------------------------------------
{
  const USER_IPS = [
    '94.158.45.12', '94.158.45.99', '213.230.110.4', '95.214.10.215',
    '37.46.222.18', '213.230.85.40', '94.158.50.123',
  ];
  const VERBS: Array<{ action: AuditAction; entity: AuditEntityType; kind: string; fromStatus?: string | null; toStatus?: string | null }> = [
    { action: 'updated', entity: 'user', kind: 'login_success' },
    { action: 'created', entity: 'kyc', kind: 'kyc_start', fromStatus: null, toStatus: 'pending' },
    { action: 'created', entity: 'transfer', kind: 'transfer_submit', fromStatus: null, toStatus: 'created' },
    { action: 'created', entity: 'user', kind: 'recipient_save' },
  ];
  for (let i = 0; i < 30; i++) {
    const day = i % 7;
    const hour = 5 + ((i * 7) % 11);
    const minute = (i * 9) % 60;
    const phone = SEED_USER_PHONES[i % SEED_USER_PHONES.length];
    const v = VERBS[i % VERBS.length];
    const userId = SEED_USER_IDS[i % SEED_USER_IDS.length];
    let entityId: string;
    if (v.entity === 'transfer') entityId = `tx_seed_u${String(i + 1).padStart(3, '0')}`;
    else if (v.entity === 'kyc') entityId = `kyc_seed_u${String(i + 1).padStart(3, '0')}`;
    else entityId = userId;
    SEED.push({
      id: nextId(),
      timestamp: ago(day, hour, minute),
      actorType: 'user',
      actor: { phone, ip: USER_IPS[i % USER_IPS.length] },
      action: v.action,
      entity: { type: v.entity, id: entityId },
      fromStatus: v.fromStatus ?? null,
      toStatus: v.toStatus ?? null,
      context: {
        kind: v.kind,
        user_id: userId,
        ...(v.kind === 'recipient_save' ? { destination: i % 2 === 0 ? 'alipay' : 'wechat' } : {}),
        ...(v.kind === 'transfer_submit' ? { amount_uzs: 1500000 + i * 100000 } : {}),
      },
    });
  }
}

// =====================================================================
// Bridge — normalizers from per-domain stores to AuditEvent
// =====================================================================

function adminFromName(name: string, id: string): AuditActor {
  const profile = ADMIN_PROFILES.find((a) => a.name === name || a.id === id);
  if (profile) {
    return { id: profile.id, name: profile.name, ip: profile.ip, device: profile.device };
  }
  return { id, name };
}

const USER_ACTION_MAP: Record<UserAuditAction, { action: AuditAction; entity: AuditEntityType }> = {
  block:                  { action: 'updated', entity: 'user' },
  unblock:                { action: 'updated', entity: 'user' },
  soft_delete:            { action: 'deleted', entity: 'user' },
  reverify_kyc:           { action: 'updated', entity: 'user' },
  blacklist_phone:        { action: 'created', entity: 'blacklist' },
  reset_devices:          { action: 'updated', entity: 'user' },
  untrust_device:         { action: 'updated', entity: 'user' },
  generate_audit_report:  { action: 'updated', entity: 'user' },
  freeze_card:            { action: 'frozen',  entity: 'card' },
  unfreeze_card:          { action: 'unfrozen', entity: 'card' },
  hard_delete_recipient:  { action: 'deleted', entity: 'user' },
};

function bridgeUserAudit(e: UserAuditEntry): AuditEvent {
  const map = USER_ACTION_MAP[e.action];
  // For the few actions whose target entity is not the user (freeze_card,
  // blacklist_phone), prefer the context id when present.
  let entityId = e.userId;
  if (e.action === 'freeze_card' || e.action === 'unfreeze_card') {
    const ctxCard = (e.context as Record<string, unknown> | undefined)?.['card_id'] as string | undefined;
    if (typeof ctxCard === 'string') entityId = ctxCard;
  } else if (e.action === 'blacklist_phone') {
    entityId = `bl_${e.id}`;
  }
  return {
    id: `bridge_user_${e.id}`,
    timestamp: e.createdAt,
    actorType: 'admin',
    actor: adminFromName(e.actorName, e.actorId),
    action: map.action,
    entity: { type: map.entity, id: entityId },
    fromStatus: null,
    toStatus: null,
    reason: e.reason,
    context: { kind: e.action, user_id: e.userId, ...(e.context ?? {}) },
  };
}

const CARD_ACTION_MAP: Record<CardAuditAction, AuditAction> = {
  freeze:                    'frozen',
  unfreeze:                  'unfrozen',
  auto_freeze_user_blocked:  'frozen',
  copy_token:                'updated',
};

function bridgeCardAudit(e: CardAuditEntry): AuditEvent {
  return {
    id: `bridge_card_${e.id}`,
    timestamp: e.createdAt,
    actorType: e.action === 'auto_freeze_user_blocked' ? 'system' : 'admin',
    actor:
      e.action === 'auto_freeze_user_blocked'
        ? { id: 'system', name: 'system' }
        : adminFromName(e.actorName, e.actorId),
    action: CARD_ACTION_MAP[e.action],
    entity: { type: 'card', id: e.cardId },
    fromStatus: e.action === 'freeze' || e.action === 'auto_freeze_user_blocked' ? 'active' : e.action === 'unfreeze' ? 'frozen' : null,
    toStatus: e.action === 'freeze' || e.action === 'auto_freeze_user_blocked' ? 'frozen' : e.action === 'unfreeze' ? 'active' : null,
    reason: e.reason,
    context: { kind: e.action, user_id: e.userId, ...(e.context ?? {}) },
  };
}

const KYC_ACTION_MAP: Record<KycAuditAction, AuditAction> = {
  claim:               'updated',
  unclaim:             'updated',
  approve:             'approved',
  reject:              'rejected',
  request_info:        'updated',
  escalate:            'escalated',
  reveal_face:         'updated',
  hide_face:           'updated',
  reveal_doc_number:   'updated',
  hide_doc_number:     'updated',
};

function bridgeKycAudit(e: KycAuditEntry): AuditEvent {
  return {
    id: `bridge_kyc_${e.id}`,
    timestamp: e.createdAt,
    actorType: 'admin',
    actor: adminFromName(e.actorName, e.actorId),
    action: KYC_ACTION_MAP[e.action],
    entity: { type: 'kyc', id: e.reviewId },
    fromStatus: e.action === 'approve' || e.action === 'reject' ? 'pending' : null,
    toStatus: e.action === 'approve' ? 'passed' : e.action === 'reject' ? 'failed' : null,
    reason: e.reason,
    context: {
      kind: e.action,
      ...(e.failureReason ? { failure_reason: e.failureReason } : {}),
      ...(e.context ?? {}),
    },
  };
}

const AML_ACTION_MAP: Record<AmlAuditAction, AuditAction> = {
  claim:           'updated',
  unclaim:         'updated',
  reassign:        'updated',
  clear:           'cleared',
  escalate:        'escalated',
  create_manual:   'created',
};

function bridgeAmlAudit(e: AmlAuditEntry): AuditEvent {
  return {
    id: `bridge_aml_${e.id}`,
    timestamp: e.createdAt,
    actorType: 'admin',
    actor: adminFromName(e.actorName, e.actorId),
    action: AML_ACTION_MAP[e.action],
    entity: { type: 'aml', id: e.flagId },
    fromStatus: e.fromStatus ?? null,
    toStatus: e.toStatus ?? null,
    reason: e.reason,
    context: { kind: e.action, ...(e.context ?? {}) },
  };
}

function bridgeFxAudit(e: FxAuditEntry): AuditEvent {
  return {
    id: `bridge_fx_${e.id}`,
    timestamp: e.createdAt,
    actorType: 'admin',
    actor: adminFromName(e.actorName, e.actorId),
    action: 'created',
    entity: { type: 'fx', id: e.fxRateId },
    fromStatus: null,
    toStatus: 'active',
    reason: e.reason,
    context: { kind: e.action, ...(e.context ?? {}) },
  };
}

function bridgeCommissionAudit(e: CommissionAuditEntry): AuditEvent {
  return {
    id: `bridge_commission_${e.id}`,
    timestamp: e.createdAt,
    actorType: 'admin',
    actor: adminFromName(e.actorName, e.actorId),
    action: 'created',
    entity: { type: 'commission', id: e.ruleId },
    fromStatus: null,
    toStatus: 'active',
    reason: e.reason,
    context: { kind: e.action, ...(e.context ?? {}) },
  };
}

const BLACKLIST_ACTION_MAP: Record<BlacklistAuditAction, AuditAction> = {
  add:            'created',
  edit_reason:    'updated',
  extend_expiry:  'updated',
  hard_delete:    'deleted',
};

function bridgeBlacklistAudit(e: BlacklistAuditEntry): AuditEvent {
  return {
    id: `bridge_blacklist_${e.id}`,
    timestamp: e.createdAt,
    actorType: 'admin',
    actor: adminFromName(e.actorName, e.actorId),
    action: BLACKLIST_ACTION_MAP[e.action],
    entity: { type: 'blacklist', id: e.entryId },
    fromStatus: null,
    toStatus: null,
    reason: e.reason || undefined,
    context: { kind: e.action, ...(e.snapshot ?? {}), ...(e.context ?? {}) },
  };
}

// Bridge the canonical TRANSFER_EVENTS_FULL set — these are the
// state-machine rows for transfers (system / provider / user-driven).
function bridgeTransferEvents(): AuditEvent[] {
  return TRANSFER_EVENTS_FULL.map((ev) => {
    const action: AuditAction = ev.fromStatus === null
      ? 'created'
      : ev.toStatus === 'failed'
        ? 'failed'
        : ev.toStatus === 'reversed'
          ? 'reversed'
          : 'status_changed';
    return {
      id: `bridge_tx_${ev.id}`,
      timestamp: ev.createdAt,
      actorType: ev.actor,
      actor:
        ev.actor === 'system'
          ? { id: 'system', name: 'system' }
          : ev.actor === 'provider'
            ? { id: 'alipay', name: 'alipay' }
            : ev.actor === 'admin'
              ? { id: SUPER_ADMIN.id, name: SUPER_ADMIN.name, ip: SUPER_ADMIN.ip, device: SUPER_ADMIN.device }
              : {},
      action,
      entity: { type: 'transfer', id: ev.transferId },
      fromStatus: ev.fromStatus,
      toStatus: ev.toStatus,
      context: {
        kind: action === 'created' ? 'transfer_create' : 'state_transition',
        ...(ev.failureCode ? { failure_code: ev.failureCode } : {}),
        ...(ev.context ?? {}),
      },
    };
  });
}

// =====================================================================
// Public API — list all events (seed + bridge), helpers, exports
// =====================================================================

/**
 * Merged list of seed + bridged events, sorted by timestamp DESC (newest
 * first). Re-derives every call so live mutator-emitted bridge rows show
 * up immediately.
 */
export function listAuditEvents(): AuditEvent[] {
  const merged: AuditEvent[] = [
    ...SEED,
    ...bridgeTransferEvents(),
    ...listUserAudit().map(bridgeUserAudit),
    ...listCardAudit().map(bridgeCardAudit),
    ...listKycAudit().map(bridgeKycAudit),
    ...listAmlAudit().map(bridgeAmlAudit),
    ...listFxAudit().map(bridgeFxAudit),
    ...listCommissionAudit().map(bridgeCommissionAudit),
    ...listBlacklistAudit().map(bridgeBlacklistAudit),
  ];
  merged.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return merged;
}

/** Distinct admin actor identifiers across the merged list (for the filter). */
export function getDistinctAdminActors(): Array<{ id: string; name: string }> {
  const seen = new Map<string, { id: string; name: string }>();
  for (const e of listAuditEvents()) {
    if (e.actorType !== 'admin') continue;
    const id = e.actor.id;
    if (!id || seen.has(id)) continue;
    seen.set(id, { id, name: e.actor.name ?? id });
  }
  // Stable order — super first, then finance, then alphabetical.
  return Array.from(seen.values()).sort((a, b) => {
    if (a.id === SUPER_ADMIN.id) return -1;
    if (b.id === SUPER_ADMIN.id) return 1;
    if (a.id === FINANCE_ADMIN.id) return -1;
    if (b.id === FINANCE_ADMIN.id) return 1;
    return a.name.localeCompare(b.name);
  });
}

/** Count other events that share the same `entity.id` (for "View N other events"). */
export function countRelatedEvents(entityId: string, excludeId: string): number {
  let n = 0;
  for (const e of listAuditEvents()) {
    if (e.entity.id === entityId && e.id !== excludeId) n++;
  }
  return n;
}

/** 8-char prefix of the canonical entity id (display). */
export function entityRefPrefix(id: string): string {
  // Strip optional `bridge_xxx_` or other prefix punctuation for nicer display.
  // The full id is what users copy; the prefix is presentational.
  return id.length > 8 ? id.slice(0, 8) : id;
}

/** BigInt-safe JSON replacer for `<pre>` viewers + export. */
export function bigintSafeReplacer(_key: string, value: unknown): unknown {
  if (typeof value === 'bigint') return value.toString();
  return value;
}

/** Pretty-print context for the expanded body. */
export function formatContextJson(ctx: Record<string, unknown>): string {
  return JSON.stringify(ctx, bigintSafeReplacer, 2);
}

/**
 * Synthesize an 80-char preview from the context — used as the table's
 * "Context summary" column and as the mobile card stack body.
 */
export function summarizeContext(e: AuditEvent): string {
  const ctx = e.context ?? {};
  const kind = (ctx.kind as string | undefined) ?? '';
  const parts: string[] = [];
  if (kind) parts.push(kind);
  if (e.reason) parts.push(`— ${e.reason}`);
  // Surface a couple of meaningful keys per common shape.
  for (const k of ['failure_code', 'webhook_event', 'severity', 'amount_uzs', 'pair', 'spread_pct', 'account_type']) {
    if (ctx[k] !== undefined) parts.push(`${k}=${String(ctx[k])}`);
  }
  const joined = parts.join(' ');
  return joined.length > 80 ? `${joined.slice(0, 77)}…` : joined;
}
