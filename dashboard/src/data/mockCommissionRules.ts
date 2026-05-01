/**
 * Commission rules mock dataset — versioned per account_type.
 *
 * Single source of truth for the Commission Rules surface
 * (`/finance/commissions`).
 *
 * Schema (mirrors `docs/models.md` §6 — `commission_rules`):
 *   id                       string  ('cr_p_001' personal, 'cr_c_001' corporate)
 *   accountType              'personal' | 'corporate'
 *   version                  integer  (sequential per accountType, starts at 1)
 *   minPct                   number   (decimal, display ≤ 4 dp)
 *   maxPct                   number   (decimal, display ≤ 4 dp)
 *   minFeeUzsTiyins          bigint   (UZS in tiyins per money-and-fx rule)
 *   volumeThresholdUsdCents  bigint | null  (USD in cents; null for personal)
 *   corporatePct             number | null  (decimal; null for personal)
 *   effectiveFrom            Date
 *   effectiveTo              Date | null    (null = open-ended; only one row at a time per accountType)
 *   createdBy                string         (admin id — mock-only audit surrogate)
 *   reasonNote               string         (free-text from operator — mock-only audit surrogate)
 *
 * Critical invariants (enforced by the mutator):
 *   1. Rows are NEVER edited in place — `addCommissionRule()` only inserts new versions.
 *   2. The "active" version per accountType is the row whose
 *      `[effectiveFrom, effectiveTo)` covers `now()`. The mutator closes the
 *      previous active row by setting its `effectiveTo = newRow.effectiveFrom`,
 *      so no two rows are simultaneously active for the same accountType.
 *   3. Schema's `is_active` boolean is treated as a denormalized cache of the
 *      window check above. The mock derives it on read; the real backend may
 *      keep it materialized.
 *   4. `transfer_fees` rows on existing transfers are NOT re-priced when a
 *      new rule version lands. This is enforced upstream — Commission Rules
 *      is read-only as far as historical transfers are concerned.
 *
 * `created_by` and `reason_note` are mock-only audit-trail surrogates (same
 * precedent as `mockFxRates.ts`). The real backend will record these in a
 * separate audit-log table rather than denormalize on the row.
 */

export type AccountType = 'personal' | 'corporate';

export interface CommissionRuleEntry {
  id: string;
  accountType: AccountType;
  version: number;
  minPct: number;
  maxPct: number;
  minFeeUzsTiyins: bigint;
  volumeThresholdUsdCents: bigint | null;
  corporatePct: number | null;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  createdBy: string;
  reasonNote: string;
}

// =====================================================================
// Deterministic time helpers — match mockFxRates / mockTransfers NOW
// =====================================================================

const NOW = new Date('2026-04-29T10:30:00Z');
function daysAgo(days: number, hour = 9, minute = 0): Date {
  const d = new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);
  d.setUTCHours(hour, minute, 0, 0);
  return d;
}

// =====================================================================
// Personal — 12 versions over ~9 months. v12 is active.
// =====================================================================

interface PersonalSeed {
  daysAgo: number;
  minPct: number;
  maxPct: number;
  minFeeUzsTiyins: bigint;
  createdBy: string;
  reasonNote: string;
}

const PERSONAL_SEEDS: PersonalSeed[] = [
  // v1 — 270 days ago — initial baseline
  {
    daysAgo: 270,
    minPct: 1.0,
    maxPct: 3.0,
    minFeeUzsTiyins: 500_000n,
    createdBy: 'admin_super_01',
    reasonNote:
      'Initial commission-rule baseline for personal account holders. Numbers ratified at the corridor-launch pricing meeting.',
  },
  // v2 — 240d
  {
    daysAgo: 240,
    minPct: 1.0,
    maxPct: 2.5,
    minFeeUzsTiyins: 500_000n,
    createdBy: 'admin_finance_02',
    reasonNote: 'Lowered max_pct from 3.00% to 2.50% after 30-day pricing review (volumes higher than projected).',
  },
  // v3 — 210d
  {
    daysAgo: 210,
    minPct: 0.8,
    maxPct: 2.5,
    minFeeUzsTiyins: 500_000n,
    createdBy: 'admin_super_01',
    reasonNote: 'Lowered min_pct to compete on small-amount transfers (Q3 corridor-pricing review).',
  },
  // v4 — 180d
  {
    daysAgo: 180,
    minPct: 0.8,
    maxPct: 2.5,
    minFeeUzsTiyins: 400_000n,
    createdBy: 'admin_finance_02',
    reasonNote: 'Reduced min fee from 5,000 to 4,000 UZS — addressed customer feedback that the floor was too punitive on small transfers.',
  },
  // v5 — 150d
  {
    daysAgo: 150,
    minPct: 0.8,
    maxPct: 2.2,
    minFeeUzsTiyins: 400_000n,
    createdBy: 'admin_super_01',
    reasonNote: 'Lowered max_pct after CBU regulator guidance on cross-border fee transparency (CBU notice 02-2026).',
  },
  // v6 — 120d
  {
    daysAgo: 120,
    minPct: 0.7,
    maxPct: 2.2,
    minFeeUzsTiyins: 500_000n,
    createdBy: 'admin_finance_02',
    reasonNote: 'Bumped min fee back to 5,000 UZS to cover provider settlement cost — Alipay/WeChat per-tx settlement fee increase.',
  },
  // v7 — 105d
  {
    daysAgo: 105,
    minPct: 0.7,
    maxPct: 2.1,
    minFeeUzsTiyins: 500_000n,
    createdBy: 'admin_super_01',
    reasonNote: 'Trimmed max_pct 0.10pp — pricing-committee monthly review.',
  },
  // v8 — 90d
  {
    daysAgo: 90,
    minPct: 0.6,
    maxPct: 2.0,
    minFeeUzsTiyins: 500_000n,
    createdBy: 'admin_super_01',
    reasonNote: 'Aligned max_pct with regulator guidance (CBU notice 04-2026 — competitive-corridor pricing).',
  },
  // v9 — 75d
  {
    daysAgo: 75,
    minPct: 0.55,
    maxPct: 2.0,
    minFeeUzsTiyins: 500_000n,
    createdBy: 'admin_finance_02',
    reasonNote: 'Lowered min_pct after Q1 customer-feedback survey: small-amount competitors moved to 0.50% in the same window.',
  },
  // v10 — 60d
  {
    daysAgo: 60,
    minPct: 0.55,
    maxPct: 2.0,
    minFeeUzsTiyins: 600_000n,
    createdBy: 'admin_finance_02',
    reasonNote: 'Bumped min fee to 6,000 UZS to keep small-amount transfers economically viable after provider-fee increase #2.',
  },
  // v11 — 45d
  {
    daysAgo: 45,
    minPct: 0.55,
    maxPct: 2.0,
    minFeeUzsTiyins: 500_000n,
    createdBy: 'admin_super_01',
    reasonNote: 'Reverted min fee to 5,000 UZS after merchant feedback that the bump priced out the smallest tier.',
  },
  // v12 — 30d ago — ACTIVE (effectiveTo = null)
  {
    daysAgo: 30,
    minPct: 0.5,
    maxPct: 2.0,
    minFeeUzsTiyins: 500_000n,
    createdBy: 'admin_super_01',
    reasonNote: 'Lowered min_pct to align with regulator guidance on competitive corridor pricing (CBU follow-up to notice 04-2026). Current active rule.',
  },
];

// =====================================================================
// Corporate — 8 versions. v8 is active.
// =====================================================================

interface CorporateSeed {
  daysAgo: number;
  minPct: number;
  maxPct: number;
  minFeeUzsTiyins: bigint;
  volumeThresholdUsdCents: bigint;
  corporatePct: number;
  createdBy: string;
  reasonNote: string;
}

const CORPORATE_SEEDS: CorporateSeed[] = [
  // v1 — 270d ago — initial corporate baseline
  {
    daysAgo: 270,
    minPct: 0.8,
    maxPct: 2.0,
    minFeeUzsTiyins: 500_000n,
    volumeThresholdUsdCents: 2_000_000n, // 20,000.00 USD
    corporatePct: 0.5,
    createdBy: 'admin_super_01',
    reasonNote: 'Initial corporate-rule baseline at corridor launch. Volume threshold set conservatively at 20,000 USD; corporate_pct at 0.50%.',
  },
  // v2 — 240d
  {
    daysAgo: 240,
    minPct: 0.7,
    maxPct: 1.8,
    minFeeUzsTiyins: 500_000n,
    volumeThresholdUsdCents: 2_000_000n,
    corporatePct: 0.5,
    createdBy: 'admin_finance_02',
    reasonNote: 'Trimmed corporate min/max bands — pricing committee Q4 review.',
  },
  // v3 — 210d
  {
    daysAgo: 210,
    minPct: 0.6,
    maxPct: 1.7,
    minFeeUzsTiyins: 500_000n,
    volumeThresholdUsdCents: 1_500_000n, // 15,000.00 USD
    corporatePct: 0.4,
    createdBy: 'admin_super_01',
    reasonNote: 'Lowered volume threshold to 15,000 USD and corporate_pct to 0.40% — first wave of corporate customers signing.',
  },
  // v4 — 180d
  {
    daysAgo: 180,
    minPct: 0.5,
    maxPct: 1.6,
    minFeeUzsTiyins: 500_000n,
    volumeThresholdUsdCents: 1_500_000n,
    corporatePct: 0.4,
    createdBy: 'admin_finance_02',
    reasonNote: 'Lowered min/max pct after corporate-onboarding feedback round.',
  },
  // v5 — 150d
  {
    daysAgo: 150,
    minPct: 0.5,
    maxPct: 1.5,
    minFeeUzsTiyins: 500_000n,
    volumeThresholdUsdCents: 1_500_000n,
    corporatePct: 0.35,
    createdBy: 'admin_super_01',
    reasonNote: 'Trimmed corporate_pct to 0.35% to retain higher-volume customers (3 customer churn signals in Q1).',
  },
  // v6 — 120d
  {
    daysAgo: 120,
    minPct: 0.45,
    maxPct: 1.5,
    minFeeUzsTiyins: 500_000n,
    volumeThresholdUsdCents: 1_200_000n, // 12,000.00 USD
    corporatePct: 0.35,
    createdBy: 'admin_finance_02',
    reasonNote: 'Lowered volume threshold to 12,000 USD — broaden access to corporate-pct discount.',
  },
  // v7 — 105d
  {
    daysAgo: 105,
    minPct: 0.4,
    maxPct: 1.5,
    minFeeUzsTiyins: 500_000n,
    volumeThresholdUsdCents: 1_200_000n,
    corporatePct: 0.3,
    createdBy: 'admin_super_01',
    reasonNote: 'Trimmed corporate_pct to 0.30% — align with regulator guidance on competitive corporate-corridor pricing.',
  },
  // v8 — 90d ago — ACTIVE (effectiveTo = null) — 3 months ago per spec
  {
    daysAgo: 90,
    minPct: 0.4,
    maxPct: 1.5,
    minFeeUzsTiyins: 500_000n,
    volumeThresholdUsdCents: 1_000_000n, // 10,000.00 USD
    corporatePct: 0.3,
    createdBy: 'admin_finance_02',
    reasonNote: 'Lowered volume threshold to 10,000 USD — final tier alignment with PBoC/CBU bilateral pricing framework. Current active rule.',
  },
];

// =====================================================================
// Build seed
// =====================================================================

function buildPersonal(): CommissionRuleEntry[] {
  const rows: CommissionRuleEntry[] = [];
  for (let i = 0; i < PERSONAL_SEEDS.length; i++) {
    const s = PERSONAL_SEEDS[i];
    const effectiveFrom = daysAgo(s.daysAgo);
    const effectiveTo = i < PERSONAL_SEEDS.length - 1 ? daysAgo(PERSONAL_SEEDS[i + 1].daysAgo) : null;
    rows.push({
      id: `cr_p_${String(i + 1).padStart(3, '0')}`,
      accountType: 'personal',
      version: i + 1,
      minPct: s.minPct,
      maxPct: s.maxPct,
      minFeeUzsTiyins: s.minFeeUzsTiyins,
      volumeThresholdUsdCents: null,
      corporatePct: null,
      effectiveFrom,
      effectiveTo,
      createdBy: s.createdBy,
      reasonNote: s.reasonNote,
    });
  }
  return rows;
}

function buildCorporate(): CommissionRuleEntry[] {
  const rows: CommissionRuleEntry[] = [];
  for (let i = 0; i < CORPORATE_SEEDS.length; i++) {
    const s = CORPORATE_SEEDS[i];
    const effectiveFrom = daysAgo(s.daysAgo);
    const effectiveTo = i < CORPORATE_SEEDS.length - 1 ? daysAgo(CORPORATE_SEEDS[i + 1].daysAgo) : null;
    rows.push({
      id: `cr_c_${String(i + 1).padStart(3, '0')}`,
      accountType: 'corporate',
      version: i + 1,
      minPct: s.minPct,
      maxPct: s.maxPct,
      minFeeUzsTiyins: s.minFeeUzsTiyins,
      volumeThresholdUsdCents: s.volumeThresholdUsdCents,
      corporatePct: s.corporatePct,
      effectiveFrom,
      effectiveTo,
      createdBy: s.createdBy,
      reasonNote: s.reasonNote,
    });
  }
  return rows;
}

let liveRules: CommissionRuleEntry[] = [...buildPersonal(), ...buildCorporate()];
let nextPersonalSeq = PERSONAL_SEEDS.length + 1;
let nextCorporateSeq = CORPORATE_SEEDS.length + 1;

// =====================================================================
// Audit log — append-only
// =====================================================================

export type CommissionAuditAction = 'commission_rule_create';

export interface CommissionAuditEntry {
  id: string;
  ruleId: string;
  action: CommissionAuditAction;
  actorId: string;
  actorName: string;
  reason: string;
  context?: Record<string, unknown>;
  createdAt: Date;
}

const commissionAudit: CommissionAuditEntry[] = [];
let commissionAuditSeq = 1;

function appendCommissionAudit(entry: Omit<CommissionAuditEntry, 'id' | 'createdAt'>): CommissionAuditEntry {
  const e: CommissionAuditEntry = {
    ...entry,
    id: `caud_${String(commissionAuditSeq++).padStart(4, '0')}`,
    createdAt: new Date(),
  };
  commissionAudit.push(e);
  return e;
}

export function getCommissionAudit(ruleId: string): CommissionAuditEntry[] {
  return commissionAudit.filter((e) => e.ruleId === ruleId).slice().reverse();
}

/** Bridge for the central audit-log surface — full module store (newest first). */
export function listCommissionAudit(): CommissionAuditEntry[] {
  return commissionAudit.slice().reverse();
}

// =====================================================================
// Read helpers
// =====================================================================

/**
 * Returns rows for the given accountType, newest-first by effectiveFrom.
 * (Default sort for the version-history list; matches FX Config convention.)
 */
export function listCommissionRules(accountType: AccountType): CommissionRuleEntry[] {
  return liveRules
    .filter((r) => r.accountType === accountType)
    .slice()
    .sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime());
}

export function getCommissionRuleById(id: string): CommissionRuleEntry | undefined {
  return liveRules.find((r) => r.id === id);
}

export function getActiveCommissionRule(
  accountType: AccountType,
  now: Date = new Date(),
): CommissionRuleEntry | undefined {
  return liveRules.find(
    (r) =>
      r.accountType === accountType &&
      r.effectiveFrom.getTime() <= now.getTime() &&
      (r.effectiveTo === null || r.effectiveTo.getTime() > now.getTime()),
  );
}

/**
 * Returns the version immediately preceding the given rule (within the same
 * accountType). Used to render "Diff vs previous" in the version history.
 */
export function getPreviousCommissionRule(activeId: string): CommissionRuleEntry | undefined {
  const active = getCommissionRuleById(activeId);
  if (!active) return undefined;
  return liveRules
    .filter(
      (r) =>
        r.accountType === active.accountType &&
        r.effectiveFrom.getTime() < active.effectiveFrom.getTime(),
    )
    .sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime())[0];
}

// =====================================================================
// Worked example — recomputes live from any rule + sample transfer amount
// =====================================================================

export const WORKED_EXAMPLE_AMOUNT_UZS_TIYINS = 500_000_000n; // 5,000,000.00 UZS

export interface WorkedExample {
  /** Sample amount used for the example (in tiyins). */
  amountUzsTiyins: bigint;
  /**
   * Display commission percentage used. We use the midpoint of [minPct, maxPct]
   * so the example shifts as the rule moves; this represents a "typical"
   * commission percentage within the band, not the floor or ceiling.
   */
  commissionPct: number;
  commissionUzsTiyins: bigint;
  minFeeUzsTiyins: bigint;
  /** True when computed commission < min_fee — floor lifts the total. */
  floorApplies: boolean;
  totalFeeUzsTiyins: bigint;
  /** Corporate-only — `corporate_pct` charge for amounts above the volume threshold. */
  corporateAboveThreshold?: {
    volumeThresholdUsdCents: bigint;
    corporatePct: number;
    commissionUzsTiyins: bigint;
  };
}

/**
 * Compute the worked example for a given rule, using
 * `WORKED_EXAMPLE_AMOUNT_UZS_TIYINS` as the sample transfer amount.
 *
 * Display commission percentage = round((minPct + maxPct) / 2, 2). This
 * communicates a "typical" charge inside the band; the worked example is
 * illustrative — real charges depend on amount/destination/customer history,
 * which is out of scope for this surface.
 */
export function computeWorkedExample(rule: CommissionRuleEntry): WorkedExample {
  const amount = WORKED_EXAMPLE_AMOUNT_UZS_TIYINS;
  const commissionPct = Math.round(((rule.minPct + rule.maxPct) / 2) * 100) / 100;

  // commission_uzs = round(amount × pct/100), in tiyins (bigint)
  const commissionUzsTiyins = bigintRound(
    Number(amount) * (commissionPct / 100),
  );
  const floorApplies = commissionUzsTiyins < rule.minFeeUzsTiyins;
  const totalFeeUzsTiyins = floorApplies ? rule.minFeeUzsTiyins : commissionUzsTiyins;

  let corporateAboveThreshold: WorkedExample['corporateAboveThreshold'];
  if (rule.corporatePct !== null && rule.volumeThresholdUsdCents !== null) {
    const corporateCommission = bigintRound(
      Number(amount) * (rule.corporatePct / 100),
    );
    corporateAboveThreshold = {
      volumeThresholdUsdCents: rule.volumeThresholdUsdCents,
      corporatePct: rule.corporatePct,
      commissionUzsTiyins: corporateCommission,
    };
  }

  return {
    amountUzsTiyins: amount,
    commissionPct,
    commissionUzsTiyins,
    minFeeUzsTiyins: rule.minFeeUzsTiyins,
    floorApplies,
    totalFeeUzsTiyins,
    corporateAboveThreshold,
  };
}

function bigintRound(n: number): bigint {
  return BigInt(Math.round(n));
}

// =====================================================================
// Mutator — addCommissionRule creates a NEW version + closes prior active
// =====================================================================

export interface CommissionActor {
  id: string;
  name: string;
}

export interface AddCommissionRuleInput {
  accountType: AccountType;
  minPct: number;
  maxPct: number;
  minFeeUzsTiyins: bigint;
  /** Required for corporate, must be null for personal. */
  volumeThresholdUsdCents: bigint | null;
  /** Required for corporate, must be null for personal. */
  corporatePct: number | null;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  reasonNote: string;
  actor: CommissionActor;
}

export function addCommissionRule(input: AddCommissionRuleInput): CommissionRuleEntry {
  // Determine next version number for this account type.
  const sameType = liveRules.filter((r) => r.accountType === input.accountType);
  const nextVersion = sameType.length + 1;
  const idPrefix = input.accountType === 'personal' ? 'cr_p' : 'cr_c';
  const seq = input.accountType === 'personal' ? nextPersonalSeq++ : nextCorporateSeq++;

  const newRow: CommissionRuleEntry = {
    id: `${idPrefix}_${String(seq).padStart(3, '0')}`,
    accountType: input.accountType,
    version: nextVersion,
    minPct: input.minPct,
    maxPct: input.maxPct,
    minFeeUzsTiyins: input.minFeeUzsTiyins,
    volumeThresholdUsdCents:
      input.accountType === 'corporate' ? input.volumeThresholdUsdCents : null,
    corporatePct: input.accountType === 'corporate' ? input.corporatePct : null,
    effectiveFrom: input.effectiveFrom,
    effectiveTo: input.effectiveTo,
    createdBy: input.actor.id,
    reasonNote: input.reasonNote,
  };

  // Close the previous active window for the same accountType — invariant:
  // only one open-ended row per accountType at any moment.
  for (const r of liveRules) {
    if (r.accountType !== input.accountType) continue;
    const stillActive =
      r.effectiveFrom.getTime() <= input.effectiveFrom.getTime() &&
      (r.effectiveTo === null || r.effectiveTo.getTime() > input.effectiveFrom.getTime());
    if (stillActive) {
      r.effectiveTo = input.effectiveFrom;
    }
  }

  liveRules = [...liveRules, newRow];

  appendCommissionAudit({
    ruleId: newRow.id,
    action: 'commission_rule_create',
    actorId: input.actor.id,
    actorName: input.actor.name,
    reason: input.reasonNote,
    context: {
      account_type: newRow.accountType,
      version: newRow.version,
      min_pct: newRow.minPct,
      max_pct: newRow.maxPct,
      min_fee_uzs_tiyins: newRow.minFeeUzsTiyins.toString(),
      volume_threshold_usd_cents: newRow.volumeThresholdUsdCents?.toString() ?? null,
      corporate_pct: newRow.corporatePct,
      effective_from: newRow.effectiveFrom.toISOString(),
      effective_to: newRow.effectiveTo ? newRow.effectiveTo.toISOString() : null,
    },
  });

  return newRow;
}
