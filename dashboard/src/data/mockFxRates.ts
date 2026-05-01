/**
 * FX rates mock dataset — 19 versions of UZS_CNY over the last 60 days.
 *
 * Single source of truth for the FX Config surface (`/finance/fx-config`).
 *
 * Schema (mirrors `docs/models.md` §6 — `fx_rates`):
 *   id          string  (`fxr_001` … `fxr_019`)
 *   pair        'UZS_CNY' (locked — corridor scope)
 *   midRate     number  (numeric(20,8) display ≤ 4 decimals)
 *   spreadPct   number  (numeric(8,4) display ≤ 4 decimals)
 *   clientRate  number  ( = mid_rate * (1 + spread_pct / 100) — see formula )
 *   source      'central_bank' | 'provider_x' | 'manual'
 *   validFrom   Date
 *   validTo     Date | null     (null = open-ended; only one row at a time)
 *   createdBy   string          (admin id)
 *   reasonNote  string | null   (free-text from the operator)
 *
 * **Critical invariants enforced by the mutator:**
 *   1. `fx_rates` rows are NEVER edited in place — `addFxRate()` only inserts
 *      new versions.
 *   2. The "active" version is the one whose `[validFrom, validTo)` window
 *      contains `now()`. The mutator closes the previous active row by
 *      setting its `validTo = newRow.validFrom` so no two rows are active
 *      simultaneously.
 *   3. `amount_cny` for transfers already in `processing` / `completed` is
 *      NOT recomputed — those transfers stay locked at their original rate
 *      (this is enforced upstream in `transfers`; FX Config is read-only as
 *      far as historical transfers are concerned).
 *
 * Spread health bands (locked here so the page reads them in one place):
 *   - `healthy`  — spread_pct ≤ 1.5
 *   - `drifting` — 1.5 < spread_pct ≤ 2.0
 *   - `stale`    — `validTo !== null && validTo < now()`  (overrides above)
 *
 * Numbers: pending Compliance sign-off. Today the pricing band sits at
 * 1.20% with the 1.5%-jump historic outlier flagged "manual" + reviewed.
 */

export type FxSource = 'central_bank' | 'provider_x' | 'manual';

export type FxHealthState = 'healthy' | 'drifting' | 'stale';

export interface FxRateEntry {
  id: string;
  pair: 'UZS_CNY';
  midRate: number;
  spreadPct: number;
  clientRate: number;
  source: FxSource;
  validFrom: Date;
  validTo: Date | null;
  createdBy: string;
  reasonNote: string | null;
}

export const FX_SPREAD_HEALTH_THRESHOLDS = {
  healthyMaxPct: 1.5,
  driftingMaxPct: 2.0,
} as const;

// =====================================================================
// Deterministic time helpers — must match mockUsers / mockTransfers NOW
// =====================================================================

const NOW = new Date('2026-04-29T10:30:00Z');
function daysAgo(days: number, hour = 9, minute = 0): Date {
  const d = new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);
  d.setUTCHours(hour, minute, 0, 0);
  return d;
}

// =====================================================================
// 19-version seed (manual, deterministic — no PRNG).
//
// Walk the rate from 1392.00 → 1404.17 over 60 days with realistic small
// daily moves (≤ 0.4% day-on-day) and one historical 1.5% jump on
// 2026-03-30 that was a manual override flagged for compliance review.
//
// `client_rate` is computed exactly as `round((mid * (1 + spread/100)), 2)`
// in this seed so the math reconciles in the diff preview.
// =====================================================================

interface Seed {
  midRate: number;
  spreadPct: number;
  daysAgo: number;
  source: FxSource;
  createdBy: string;
  reasonNote: string | null;
}

function clientRateOf(mid: number, spreadPct: number): number {
  return Math.round(mid * (1 + spreadPct / 100) * 100) / 100;
}

const SEEDS: Seed[] = [
  // v01 — 60 days ago — initial baseline
  { midRate: 1392.00, spreadPct: 1.20, daysAgo: 60, source: 'central_bank', createdBy: 'admin_super_01', reasonNote: 'Initial UZS_CNY baseline aligned with CBU Q1 reference fixing.' },
  // v02 — 56 days ago
  { midRate: 1391.40, spreadPct: 1.20, daysAgo: 56, source: 'central_bank', createdBy: 'admin_super_01', reasonNote: 'CBU daily fixing — mid rate trimmed -0.04%.' },
  // v03 — 52 days ago
  { midRate: 1393.60, spreadPct: 1.20, daysAgo: 52, source: 'central_bank', createdBy: 'admin_super_01', reasonNote: 'Weekly CBU update — mild upward drift.' },
  // v04 — 48 days ago
  { midRate: 1395.10, spreadPct: 1.20, daysAgo: 48, source: 'central_bank', createdBy: 'admin_finance_02', reasonNote: 'Routine CBU pull; spread held.' },
  // v05 — 44 days ago
  { midRate: 1396.80, spreadPct: 1.20, daysAgo: 44, source: 'central_bank', createdBy: 'admin_finance_02', reasonNote: 'CBU daily fixing.' },
  // v06 — 41 days ago
  { midRate: 1394.20, spreadPct: 1.20, daysAgo: 41, source: 'central_bank', createdBy: 'admin_super_01', reasonNote: 'CBU correction after PBoC mid-rate dip.' },
  // v07 — 38 days ago
  { midRate: 1395.90, spreadPct: 1.20, daysAgo: 38, source: 'central_bank', createdBy: 'admin_finance_02', reasonNote: 'CBU daily fixing.' },
  // v08 — 35 days ago
  { midRate: 1397.50, spreadPct: 1.20, daysAgo: 35, source: 'central_bank', createdBy: 'admin_finance_02', reasonNote: 'CBU daily fixing.' },
  // v09 — 32 days ago
  { midRate: 1399.10, spreadPct: 1.20, daysAgo: 32, source: 'central_bank', createdBy: 'admin_super_01', reasonNote: 'CBU weekly update.' },
  // v10 — 30 days ago — manual override (1.5% jump documented)
  { midRate: 1420.20, spreadPct: 1.50, daysAgo: 30, source: 'manual', createdBy: 'admin_super_01', reasonNote: 'Manual override after PBoC weekend devaluation announcement. Spread temporarily widened to 1.50% pending compliance review (RIS-2026-08).' },
  // v11 — 28 days ago — corrected back to 1.20% spread but mid stayed elevated
  { midRate: 1416.40, spreadPct: 1.20, daysAgo: 28, source: 'central_bank', createdBy: 'admin_super_01', reasonNote: 'Compliance review approved spread reset to 1.20% after manual override (RIS-2026-08 closed).' },
  // v12 — 25 days ago
  { midRate: 1413.20, spreadPct: 1.20, daysAgo: 25, source: 'central_bank', createdBy: 'admin_finance_02', reasonNote: 'CBU daily fixing — drifting back toward pre-jump band.' },
  // v13 — 21 days ago
  { midRate: 1410.50, spreadPct: 1.20, daysAgo: 21, source: 'central_bank', createdBy: 'admin_finance_02', reasonNote: 'CBU weekly update.' },
  // v14 — 17 days ago
  { midRate: 1408.30, spreadPct: 1.20, daysAgo: 17, source: 'central_bank', createdBy: 'admin_super_01', reasonNote: 'CBU daily fixing.' },
  // v15 — 13 days ago
  { midRate: 1406.90, spreadPct: 1.20, daysAgo: 13, source: 'central_bank', createdBy: 'admin_finance_02', reasonNote: 'CBU daily fixing.' },
  // v16 — 10 days ago
  { midRate: 1405.40, spreadPct: 1.20, daysAgo: 10, source: 'central_bank', createdBy: 'admin_finance_02', reasonNote: 'CBU daily fixing.' },
  // v17 — 7 days ago
  { midRate: 1404.80, spreadPct: 1.20, daysAgo: 7, source: 'central_bank', createdBy: 'admin_super_01', reasonNote: 'CBU weekly update.' },
  // v18 — 4 days ago
  { midRate: 1404.20, spreadPct: 1.20, daysAgo: 4, source: 'central_bank', createdBy: 'admin_super_01', reasonNote: 'CBU daily fixing.' },
  // v19 — 2 days ago — ACTIVE (validTo = null)
  { midRate: 1404.17, spreadPct: 1.20, daysAgo: 2, source: 'central_bank', createdBy: 'admin_super_01', reasonNote: 'CBU daily fixing — current active rate.' },
];

function buildSeed(): FxRateEntry[] {
  const rows: FxRateEntry[] = [];
  for (let i = 0; i < SEEDS.length; i++) {
    const s = SEEDS[i];
    const validFrom = daysAgo(s.daysAgo);
    const validTo = i < SEEDS.length - 1 ? daysAgo(SEEDS[i + 1].daysAgo) : null;
    rows.push({
      id: `fxr_${String(i + 1).padStart(3, '0')}`,
      pair: 'UZS_CNY',
      midRate: s.midRate,
      spreadPct: s.spreadPct,
      clientRate: clientRateOf(s.midRate, s.spreadPct),
      source: s.source,
      validFrom,
      validTo,
      createdBy: s.createdBy,
      reasonNote: s.reasonNote,
    });
  }
  return rows;
}

let liveRates: FxRateEntry[] = buildSeed();
let nextSeq = liveRates.length + 1;

// =====================================================================
// FX audit log — append-only
// =====================================================================

export type FxAuditAction = 'fx_rate_create';

export interface FxAuditEntry {
  id: string;
  fxRateId: string;
  action: FxAuditAction;
  actorId: string;
  actorName: string;
  reason: string;
  context?: Record<string, unknown>;
  createdAt: Date;
}

const fxAudit: FxAuditEntry[] = [];
let fxAuditSeq = 1;

function appendFxAudit(entry: Omit<FxAuditEntry, 'id' | 'createdAt'>): FxAuditEntry {
  const e: FxAuditEntry = {
    ...entry,
    id: `faud_${String(fxAuditSeq++).padStart(4, '0')}`,
    createdAt: new Date(),
  };
  fxAudit.push(e);
  return e;
}

export function getFxAudit(fxRateId: string): FxAuditEntry[] {
  return fxAudit.filter((e) => e.fxRateId === fxRateId).slice().reverse();
}

/** Bridge for the central audit-log surface — full module store (newest first). */
export function listFxAudit(): FxAuditEntry[] {
  return fxAudit.slice().reverse();
}

// =====================================================================
// Read helpers
// =====================================================================

/**
 * Returns rows in newest-first order (matches default detail-page sort).
 */
export function listFxRates(): FxRateEntry[] {
  return liveRates
    .slice()
    .sort((a, b) => b.validFrom.getTime() - a.validFrom.getTime());
}

export function getFxRateById(id: string): FxRateEntry | undefined {
  return liveRates.find((r) => r.id === id);
}

export function getActiveFxRate(now: Date = new Date()): FxRateEntry | undefined {
  return liveRates.find(
    (r) =>
      r.validFrom.getTime() <= now.getTime() &&
      (r.validTo === null || r.validTo.getTime() > now.getTime()),
  );
}

export function getPreviousFxRate(activeId: string): FxRateEntry | undefined {
  const active = getFxRateById(activeId);
  if (!active) return undefined;
  return liveRates
    .filter((r) => r.validFrom.getTime() < active.validFrom.getTime())
    .sort((a, b) => b.validFrom.getTime() - a.validFrom.getTime())[0];
}

/**
 * Health classification for the active row.
 * `stale` overrides spread bands when the validity window has expired.
 */
export function getFxHealth(rate: FxRateEntry, now: Date = new Date()): FxHealthState {
  if (rate.validTo !== null && rate.validTo.getTime() < now.getTime()) {
    return 'stale';
  }
  if (rate.spreadPct <= FX_SPREAD_HEALTH_THRESHOLDS.healthyMaxPct) return 'healthy';
  if (rate.spreadPct <= FX_SPREAD_HEALTH_THRESHOLDS.driftingMaxPct) return 'drifting';
  return 'drifting';
}

// =====================================================================
// In-flight count — derived from `transfers.status='processing'`.
//
// Real backend: every transfer carries an `fx_rate_id` snapshot taken at
// `created` time. Mock data does NOT yet carry that column on transfers
// (would require backfilling 200 rows in mockTransfers); the active rate
// is by definition the only rate whose validity window contains `now()`,
// and `processing` rows are by definition created within that window —
// so the count of `processing` transfers IS the count locked at the
// active rate. Historical rates (validTo set) cannot have new
// `processing` transfers attached.
// =====================================================================

export interface InFlightCounter {
  count(): number;
}

let inFlightCounter: InFlightCounter | null = null;

/**
 * Wired by the page at module load to avoid a circular import between
 * mockFxRates ↔ mockTransfers.
 */
export function setInFlightCounter(counter: InFlightCounter): void {
  inFlightCounter = counter;
}

export function getInFlightCount(): number {
  return inFlightCounter?.count() ?? 0;
}

// =====================================================================
// Mutator — addFxRate creates a NEW version + closes previous active
// =====================================================================

export interface FxActor {
  id: string;
  name: string;
}

export interface AddFxRateInput {
  midRate: number;
  spreadPct: number;
  source: FxSource;
  validFrom: Date;
  validTo: Date | null;
  reasonNote: string;
  actor: FxActor;
}

export function addFxRate(input: AddFxRateInput): FxRateEntry {
  const newRow: FxRateEntry = {
    id: `fxr_${String(nextSeq++).padStart(3, '0')}`,
    pair: 'UZS_CNY',
    midRate: input.midRate,
    spreadPct: input.spreadPct,
    clientRate: clientRateOf(input.midRate, input.spreadPct),
    source: input.source,
    validFrom: input.validFrom,
    validTo: input.validTo,
    createdBy: input.actor.id,
    reasonNote: input.reasonNote,
  };

  // Close the previous active window — invariant: only one open-ended row.
  for (const r of liveRates) {
    const stillActive =
      r.validFrom.getTime() <= input.validFrom.getTime() &&
      (r.validTo === null || r.validTo.getTime() > input.validFrom.getTime());
    if (stillActive) {
      r.validTo = input.validFrom;
    }
  }

  liveRates = [...liveRates, newRow];

  appendFxAudit({
    fxRateId: newRow.id,
    action: 'fx_rate_create',
    actorId: input.actor.id,
    actorName: input.actor.name,
    reason: input.reasonNote,
    context: {
      mid_rate: newRow.midRate,
      spread_pct: newRow.spreadPct,
      client_rate: newRow.clientRate,
      source: newRow.source,
      valid_from: newRow.validFrom.toISOString(),
      valid_to: newRow.validTo ? newRow.validTo.toISOString() : null,
    },
  });

  return newRow;
}

// =====================================================================
// Trend chart data — synthetic intra-day samples to fill the chart at
// `24h` / `7d` / `30d` / `90d` ranges. The 19 versioned rows alone are
// too sparse for a smooth trend line, so we interpolate linearly between
// versions and add a low-amplitude noise pattern.
// =====================================================================

export type ChartRangeKey = '24h' | '7d' | '30d' | '90d';

export interface FxChartPoint {
  /** ISO timestamp (millis since epoch) for sorting. */
  ts: number;
  /** Display label for the X-axis tick. */
  t: string;
  midRate: number;
  clientRate: number;
  source: FxSource;
}

const RANGE_TO_DAYS: Record<ChartRangeKey, number> = {
  '24h': 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

const RANGE_TO_STEP_HOURS: Record<ChartRangeKey, number> = {
  '24h': 1,
  '7d': 4,
  '30d': 12,
  '90d': 24,
};

function rateAt(timestamp: number): { mid: number; spread: number; source: FxSource } {
  // Find the row whose validity window covers `timestamp`.
  const sorted = liveRates
    .slice()
    .sort((a, b) => a.validFrom.getTime() - b.validFrom.getTime());
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].validFrom.getTime() <= timestamp) {
      const r = sorted[i];
      return { mid: r.midRate, spread: r.spreadPct, source: r.source };
    }
  }
  const first = sorted[0];
  return { mid: first.midRate, spread: first.spreadPct, source: first.source };
}

export function getFxChartSeries(
  range: ChartRangeKey,
  now: Date = NOW,
): FxChartPoint[] {
  const days = RANGE_TO_DAYS[range];
  const stepHours = RANGE_TO_STEP_HOURS[range];
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const stepMs = stepHours * 60 * 60 * 1000;
  const points: FxChartPoint[] = [];
  for (let ts = start.getTime(); ts <= now.getTime(); ts += stepMs) {
    const sample = rateAt(ts);
    // Light intra-window noise so 24h doesn't read as flat-line — but
    // never break the locked client_rate formula at the version
    // boundary, so noise is on `mid` only, then clientRate computed off it.
    const idx = Math.floor((ts - start.getTime()) / stepMs);
    const noise = (Math.sin(idx / 3.7) * 0.4 + Math.cos(idx / 5.1) * 0.25);
    const mid = Math.round((sample.mid + noise) * 100) / 100;
    const clientRate = clientRateOf(mid, sample.spread);
    const d = new Date(ts);
    let label: string;
    if (range === '24h') {
      label = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
    } else if (range === '7d') {
      label = `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${String(d.getUTCHours()).padStart(2, '0')}:00`;
    } else {
      label = `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
    }
    points.push({
      ts,
      t: label,
      midRate: mid,
      clientRate,
      source: sample.source,
    });
  }
  return points;
}

// =====================================================================
// Diff helper — returns row-level deltas for the update preview.
// =====================================================================

export interface FxDiffRow {
  field: 'midRate' | 'spreadPct' | 'clientRate' | 'source' | 'validFrom' | 'validTo';
  current: string;
  next: string;
  changed: boolean;
  /** Optional percent delta string for clientRate (e.g. "+0.31%"). */
  pctDelta?: string;
}
