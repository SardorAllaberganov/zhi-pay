/**
 * AML Triage mock dataset — 26 deterministic flags.
 *
 * Status mix:
 *   19 open (3 critical · 12 warning · 4 info)
 *    7 reviewing (mix of severities, already assigned)
 *
 * Within open critical (3 total):
 *    2 sanctions (Clear disabled, Escalate auto-fills compliance template)
 *    1 amount-anomaly (10× user's avg)
 *
 * Linked transfers:
 *   - sanctions flags ALWAYS have transfer_id set
 *   - velocity / amount / pattern usually have transfer_id
 *   - manual sometimes has transfer_id
 *
 * Schema: matches `aml_flags` in docs/models.md §5.1 (incl. resolution_notes).
 * The `context` jsonb shape is a per-flag-type contract documented in
 * `AmlFlagContext` below. Today the canonical schema only carries
 * `description` (string); structured context is modeled here for the
 * prototype's typed rendering — backend can emit jsonb when ready.
 */

import type { AmlFlagStatus, AmlSeverity } from '@/types';
import { TRANSFERS_FULL } from './mockTransfers';
import type { Transfer } from '@/types';

export type AmlFlagType = 'velocity' | 'amount' | 'pattern' | 'sanctions' | 'manual';

export type AmlClearReason =
  | 'false_positive'
  | 'verified_legitimate'
  | 'low_risk'
  | 'other';

// =====================================================================
// Per-type context shapes
// =====================================================================

export interface VelocityContext {
  type: 'velocity';
  window_minutes: number;
  transfer_count: number;
  threshold: number;
  recent_transfer_ids: string[];
}

export interface AmountContext {
  type: 'amount';
  amount_uzs: bigint;
  user_avg_uzs: bigint;
  std_dev_count: number; // e.g. 4.2 means 4.2σ above mean
  multiplier: number; // e.g. 10× = 10
}

export interface PatternContext {
  type: 'pattern';
  rule_name: string;
  matched_signal: string;
  pattern_description: string;
}

export interface SanctionsContext {
  type: 'sanctions';
  matched_list: string;
  matched_name: string;
  match_score: number; // 0..1
  recipient_handle: string;
  recipient_destination: 'alipay' | 'wechat';
}

export interface ManualContext {
  type: 'manual';
  filer_admin_id: string;
  filer_admin_name: string;
  filer_note: string;
}

export type AmlFlagContext =
  | VelocityContext
  | AmountContext
  | PatternContext
  | SanctionsContext
  | ManualContext;

// =====================================================================
// User-level lifetime stats (for the UserCard)
// =====================================================================

export interface AmlUserStats {
  userId: string;
  phone: string;
  fullName: string;
  pinfl: string; // 14 digits — UI must mask via maskPinfl
  tier: 'tier_0' | 'tier_1' | 'tier_2';
  status: 'active' | 'blocked' | 'pending' | 'deleted';
  lifetimeTransferCount: number;
  lifetimeVolumeUzsTiyins: bigint;
  joinedAt: Date;
}

// =====================================================================
// Admin pool
// =====================================================================

export interface AmlAdmin {
  id: string;
  name: string;
  initials: string;
}

export const CURRENT_ADMIN: AmlAdmin = {
  id: 'admin_me',
  name: 'You',
  initials: 'YO',
};

export const ADMIN_POOL: AmlAdmin[] = [
  CURRENT_ADMIN,
  { id: 'admin_adel', name: 'Adel Ortiqova', initials: 'AO' },
  { id: 'admin_bobur', name: 'Bobur Sayfullayev', initials: 'BS' },
  { id: 'admin_zafar', name: 'Zafar Hasanov', initials: 'ZH' },
];

// =====================================================================
// Flag (extended for the triage view)
// =====================================================================

export interface AmlReview {
  id: string;
  userId: string;

  /** Optional — user-level flags (e.g. blacklist hit) won't have one. */
  transferId?: string;

  flagType: AmlFlagType;
  severity: AmlSeverity;

  /** Auto-generated short reason — drives the truncated row description. */
  description: string;

  /** Structured per-type payload — drives the typed FlagContextCard. */
  context: AmlFlagContext;

  status: AmlFlagStatus;

  /** Admin id when assigned. */
  assigneeId?: string;
  assigneeName?: string;

  /** Closure / escalation note — populated on cleared / escalated. */
  resolutionNotes?: string;
  /** Reason code captured on Clear (cleared status only). */
  clearReason?: AmlClearReason;

  resolvedAt?: Date;
  createdAt: Date;
}

// =====================================================================
// Audit log — append-only, module-level
// =====================================================================

export type AmlAuditAction =
  | 'claim'
  | 'unclaim'
  | 'reassign'
  | 'clear'
  | 'escalate'
  | 'create_manual';

export interface AmlAuditEntry {
  id: string;
  flagId: string;
  action: AmlAuditAction;
  actorId: string;
  actorName: string;
  fromStatus?: AmlFlagStatus;
  toStatus?: AmlFlagStatus;
  reason?: string;
  context?: Record<string, unknown>;
  createdAt: Date;
}

const auditEntries: AmlAuditEntry[] = [];
let auditSeq = 1;

export function appendAmlAudit(
  entry: Omit<AmlAuditEntry, 'id' | 'createdAt'>,
): AmlAuditEntry {
  const e: AmlAuditEntry = {
    ...entry,
    id: `aaud_${String(auditSeq++).padStart(4, '0')}`,
    createdAt: new Date(),
  };
  auditEntries.push(e);
  return e;
}

export function getAmlAuditForFlag(flagId: string): AmlAuditEntry[] {
  return auditEntries.filter((e) => e.flagId === flagId);
}

// =====================================================================
// Reference time + helpers
// =====================================================================

const NOW = new Date('2026-05-01T10:30:00Z');

function ago(minutes: number): Date {
  return new Date(NOW.getTime() - minutes * 60 * 1000);
}

export function getNow(): Date {
  return NOW;
}

// =====================================================================
// User pool — drives the user card + initial blocked-on-escalate side effect.
// Mutable so an Escalate action on critical severity can flip status.
// =====================================================================

const USERS: AmlUserStats[] = [
  {
    userId: 'u_aml_01',
    phone: '+998 90 100 11 22',
    fullName: 'Akmal Iskandarov',
    pinfl: '52507198807228899',
    tier: 'tier_2',
    status: 'active',
    lifetimeTransferCount: 14,
    lifetimeVolumeUzsTiyins: 28_500_000n * 100n,
    joinedAt: new Date('2025-08-12T09:00:00Z'),
  },
  {
    userId: 'u_aml_02',
    phone: '+998 91 211 22 33',
    fullName: 'Diyora Tursunova',
    pinfl: '52311199611036712',
    tier: 'tier_2',
    status: 'active',
    lifetimeTransferCount: 31,
    lifetimeVolumeUzsTiyins: 71_200_000n * 100n,
    joinedAt: new Date('2025-04-22T09:00:00Z'),
  },
  {
    userId: 'u_aml_03',
    phone: '+998 93 322 33 44',
    fullName: 'Bobir Kamolov',
    pinfl: '52430199301301188',
    tier: 'tier_2',
    status: 'active',
    lifetimeTransferCount: 8,
    lifetimeVolumeUzsTiyins: 12_900_000n * 100n,
    joinedAt: new Date('2025-12-04T09:00:00Z'),
  },
  {
    userId: 'u_aml_04',
    phone: '+998 94 433 44 55',
    fullName: 'Sardor Tursunov',
    pinfl: '52414199002145511',
    tier: 'tier_2',
    status: 'active',
    lifetimeTransferCount: 47,
    lifetimeVolumeUzsTiyins: 95_400_000n * 100n,
    joinedAt: new Date('2024-11-18T09:00:00Z'),
  },
  {
    userId: 'u_aml_05',
    phone: '+998 95 544 55 66',
    fullName: 'Madina Yusupova',
    pinfl: '12530199409305544',
    tier: 'tier_2',
    status: 'active',
    lifetimeTransferCount: 22,
    lifetimeVolumeUzsTiyins: 47_800_000n * 100n,
    joinedAt: new Date('2025-06-30T09:00:00Z'),
  },
  {
    userId: 'u_aml_06',
    phone: '+998 99 655 66 77',
    fullName: 'Olim Karimov',
    pinfl: '32412199204185678',
    tier: 'tier_1',
    status: 'active',
    lifetimeTransferCount: 5,
    lifetimeVolumeUzsTiyins: 4_300_000n * 100n,
    joinedAt: new Date('2026-02-14T09:00:00Z'),
  },
  {
    userId: 'u_aml_07',
    phone: '+998 90 766 77 88',
    fullName: 'Aziza Rahimova',
    pinfl: '12515199205156643',
    tier: 'tier_2',
    status: 'active',
    lifetimeTransferCount: 19,
    lifetimeVolumeUzsTiyins: 38_700_000n * 100n,
    joinedAt: new Date('2025-09-08T09:00:00Z'),
  },
  {
    userId: 'u_aml_08',
    phone: '+998 91 877 88 99',
    fullName: 'Bekzod Nurmatov',
    pinfl: '52520200908203321',
    tier: 'tier_2',
    status: 'active',
    lifetimeTransferCount: 11,
    lifetimeVolumeUzsTiyins: 19_400_000n * 100n,
    joinedAt: new Date('2025-11-02T09:00:00Z'),
  },
  {
    userId: 'u_aml_09',
    phone: '+998 93 988 99 00',
    fullName: 'Lola Saidova',
    pinfl: '52507198506075522',
    tier: 'tier_2',
    status: 'active',
    lifetimeTransferCount: 26,
    lifetimeVolumeUzsTiyins: 52_300_000n * 100n,
    joinedAt: new Date('2025-05-15T09:00:00Z'),
  },
  {
    userId: 'u_aml_10',
    phone: '+998 94 099 00 11',
    fullName: 'Jasur Yuldashev',
    pinfl: '52525199112258833',
    tier: 'tier_2',
    status: 'active',
    lifetimeTransferCount: 3,
    lifetimeVolumeUzsTiyins: 1_800_000n * 100n,
    joinedAt: new Date('2026-03-22T09:00:00Z'),
  },
  {
    userId: 'u_aml_11',
    phone: '+998 95 100 11 22',
    fullName: 'Nigora Akhmedova',
    pinfl: '52512199303125578',
    tier: 'tier_2',
    status: 'active',
    lifetimeTransferCount: 9,
    lifetimeVolumeUzsTiyins: 14_600_000n * 100n,
    joinedAt: new Date('2025-12-19T09:00:00Z'),
  },
  {
    userId: 'u_aml_12',
    phone: '+998 99 211 22 33',
    fullName: 'Davron Khasanov',
    pinfl: '52509198701094477',
    tier: 'tier_2',
    status: 'active',
    lifetimeTransferCount: 17,
    lifetimeVolumeUzsTiyins: 32_100_000n * 100n,
    joinedAt: new Date('2025-07-04T09:00:00Z'),
  },
];

let liveUsers: AmlUserStats[] = USERS.map((u) => ({ ...u }));

export function getAmlUserById(userId: string): AmlUserStats | undefined {
  return liveUsers.find((u) => u.userId === userId);
}

/** Mutates user.status — used by critical Escalate side-effect. */
export function blockAmlUser(userId: string): AmlUserStats | undefined {
  const u = liveUsers.find((u) => u.userId === userId);
  if (u && u.status !== 'blocked') {
    u.status = 'blocked';
  }
  return u;
}

// =====================================================================
// Flag seeds
// =====================================================================

interface FlagSeed {
  id: string;
  userId: string;
  transferId?: string;
  flagType: AmlFlagType;
  severity: AmlSeverity;
  description: string;
  context: AmlFlagContext;
  status: AmlFlagStatus;
  assignee?: AmlAdmin;
  ageMin: number;
  resolutionNotes?: string;
  clearReason?: AmlClearReason;
}

// Pull deterministic transfer ids for linking — pick from earliest 60 of TRANSFERS_FULL.
const LINKABLE_TX = TRANSFERS_FULL.slice(0, 60);
function pickTx(seed: number): Transfer {
  return LINKABLE_TX[seed % LINKABLE_TX.length];
}

const SEEDS: FlagSeed[] = [
  // ===== 3 CRITICAL OPEN =====
  // 2 sanctions
  {
    id: 'aml_01',
    userId: 'u_aml_01',
    transferId: pickTx(7).id,
    flagType: 'sanctions',
    severity: 'critical',
    description: 'Recipient handle matches OFAC SDN watchlist (score 0.94)',
    context: {
      type: 'sanctions',
      matched_list: 'OFAC SDN List',
      matched_name: 'Akmal I. — exact name match',
      match_score: 0.94,
      recipient_handle: 'wxid_match_test_94',
      recipient_destination: 'wechat',
    },
    status: 'open',
    ageMin: 12,
  },
  {
    id: 'aml_02',
    userId: 'u_aml_02',
    transferId: pickTx(13).id,
    flagType: 'sanctions',
    severity: 'critical',
    description: 'Recipient handle on UN consolidated sanctions list (score 0.87)',
    context: {
      type: 'sanctions',
      matched_list: 'UN Consolidated Sanctions',
      matched_name: 'Yu D. — phonetic match',
      match_score: 0.87,
      recipient_handle: '13800138000',
      recipient_destination: 'alipay',
    },
    status: 'open',
    ageMin: 47,
  },
  // 1 amount anomaly
  {
    id: 'aml_03',
    userId: 'u_aml_03',
    transferId: pickTx(21).id,
    flagType: 'amount',
    severity: 'critical',
    description: '12.5M UZS — 10× this user\'s 6-month average',
    context: {
      type: 'amount',
      amount_uzs: 12_500_000n * 100n,
      user_avg_uzs: 1_250_000n * 100n,
      std_dev_count: 9.8,
      multiplier: 10.0,
    },
    status: 'open',
    ageMin: 28,
  },

  // ===== 12 WARNING OPEN =====
  // velocity (5)
  {
    id: 'aml_04',
    userId: 'u_aml_04',
    transferId: pickTx(2).id,
    flagType: 'velocity',
    severity: 'warning',
    description: '6 transfers in last 10 minutes (threshold: 5)',
    context: {
      type: 'velocity',
      window_minutes: 10,
      transfer_count: 6,
      threshold: 5,
      recent_transfer_ids: [
        pickTx(2).id, pickTx(3).id, pickTx(4).id, pickTx(5).id, pickTx(6).id, pickTx(7).id,
      ],
    },
    status: 'open',
    ageMin: 18,
  },
  {
    id: 'aml_05',
    userId: 'u_aml_05',
    transferId: pickTx(11).id,
    flagType: 'velocity',
    severity: 'warning',
    description: '7 transfers in last 15 minutes (threshold: 5)',
    context: {
      type: 'velocity',
      window_minutes: 15,
      transfer_count: 7,
      threshold: 5,
      recent_transfer_ids: [
        pickTx(11).id, pickTx(12).id, pickTx(13).id, pickTx(14).id,
        pickTx(15).id, pickTx(16).id, pickTx(17).id,
      ],
    },
    status: 'open',
    ageMin: 35,
  },
  {
    id: 'aml_06',
    userId: 'u_aml_06',
    transferId: pickTx(19).id,
    flagType: 'velocity',
    severity: 'warning',
    description: '5 transfers in last 8 minutes (threshold: 5)',
    context: {
      type: 'velocity',
      window_minutes: 8,
      transfer_count: 5,
      threshold: 5,
      recent_transfer_ids: [pickTx(19).id, pickTx(20).id, pickTx(21).id, pickTx(22).id, pickTx(23).id],
    },
    status: 'open',
    ageMin: 52,
  },
  {
    id: 'aml_07',
    userId: 'u_aml_07',
    transferId: pickTx(25).id,
    flagType: 'velocity',
    severity: 'warning',
    description: '8 transfers in last 20 minutes (threshold: 5)',
    context: {
      type: 'velocity',
      window_minutes: 20,
      transfer_count: 8,
      threshold: 5,
      recent_transfer_ids: [
        pickTx(25).id, pickTx(26).id, pickTx(27).id, pickTx(28).id,
        pickTx(29).id, pickTx(30).id, pickTx(31).id, pickTx(32).id,
      ],
    },
    status: 'open',
    ageMin: 71,
  },
  {
    id: 'aml_08',
    userId: 'u_aml_08',
    flagType: 'velocity',
    severity: 'warning',
    description: '5 transfers in last 12 minutes (threshold: 5)',
    context: {
      type: 'velocity',
      window_minutes: 12,
      transfer_count: 5,
      threshold: 5,
      recent_transfer_ids: [pickTx(33).id, pickTx(34).id, pickTx(35).id, pickTx(36).id, pickTx(37).id],
    },
    status: 'open',
    ageMin: 96,
  },
  // amount (4)
  {
    id: 'aml_09',
    userId: 'u_aml_09',
    transferId: pickTx(8).id,
    flagType: 'amount',
    severity: 'warning',
    description: '4.8M UZS — 4.2σ above this user\'s 30-day mean',
    context: {
      type: 'amount',
      amount_uzs: 4_800_000n * 100n,
      user_avg_uzs: 1_900_000n * 100n,
      std_dev_count: 4.2,
      multiplier: 2.5,
    },
    status: 'open',
    ageMin: 23,
  },
  {
    id: 'aml_10',
    userId: 'u_aml_10',
    transferId: pickTx(17).id,
    flagType: 'amount',
    severity: 'warning',
    description: '7.2M UZS — first transfer above 5M for this account',
    context: {
      type: 'amount',
      amount_uzs: 7_200_000n * 100n,
      user_avg_uzs: 600_000n * 100n,
      std_dev_count: 5.1,
      multiplier: 12.0,
    },
    status: 'open',
    ageMin: 41,
  },
  {
    id: 'aml_11',
    userId: 'u_aml_11',
    transferId: pickTx(29).id,
    flagType: 'amount',
    severity: 'warning',
    description: '3.5M UZS — 3.4σ above mean for this corridor',
    context: {
      type: 'amount',
      amount_uzs: 3_500_000n * 100n,
      user_avg_uzs: 1_400_000n * 100n,
      std_dev_count: 3.4,
      multiplier: 2.5,
    },
    status: 'open',
    ageMin: 64,
  },
  {
    id: 'aml_12',
    userId: 'u_aml_12',
    transferId: pickTx(38).id,
    flagType: 'amount',
    severity: 'warning',
    description: '5.5M UZS — 3.8σ above mean',
    context: {
      type: 'amount',
      amount_uzs: 5_500_000n * 100n,
      user_avg_uzs: 1_800_000n * 100n,
      std_dev_count: 3.8,
      multiplier: 3.1,
    },
    status: 'open',
    ageMin: 89,
  },
  // pattern (3)
  {
    id: 'aml_13',
    userId: 'u_aml_01',
    transferId: pickTx(43).id,
    flagType: 'pattern',
    severity: 'warning',
    description: 'Round-number layering pattern (5 transfers of exactly 1M UZS in 30min)',
    context: {
      type: 'pattern',
      rule_name: 'round-number-layering',
      matched_signal: '5 transfers of exactly 1,000,000 UZS within 30 minutes',
      pattern_description:
        'Sequence of identical round-number transfers across multiple recipients in a short window — classic layering signal.',
    },
    status: 'open',
    ageMin: 33,
  },
  {
    id: 'aml_14',
    userId: 'u_aml_04',
    transferId: pickTx(46).id,
    flagType: 'pattern',
    severity: 'warning',
    description: 'Recipient handle seen receiving from 4 unrelated senders this week',
    context: {
      type: 'pattern',
      rule_name: 'shared-recipient-fan-in',
      matched_signal: 'Recipient handle wxid_zhang_wei received from 4 distinct senders within 7 days',
      pattern_description:
        'Multiple senders converging on a single recipient is consistent with money-mule patterns. Review sender relationships.',
    },
    status: 'open',
    ageMin: 58,
  },
  {
    id: 'aml_15',
    userId: 'u_aml_05',
    flagType: 'pattern',
    severity: 'warning',
    description: 'New device + new card + first transfer above 3M UZS',
    context: {
      type: 'pattern',
      rule_name: 'first-large-transfer-new-context',
      matched_signal: 'Device fingerprint + card both first seen this session, transfer > 3M UZS',
      pattern_description:
        'Combination of new device, new card, and elevated amount is a common account-takeover signal.',
    },
    status: 'open',
    ageMin: 102,
  },

  // ===== 4 INFO OPEN =====
  {
    id: 'aml_16',
    userId: 'u_aml_06',
    transferId: pickTx(49).id,
    flagType: 'pattern',
    severity: 'info',
    description: 'Low-confidence pattern: weekend midnight transfers',
    context: {
      type: 'pattern',
      rule_name: 'unusual-time-window',
      matched_signal: 'Transfer at 02:14 local on Sunday',
      pattern_description:
        'Time-of-day outlier vs user\'s typical activity. Low confidence — single signal.',
    },
    status: 'open',
    ageMin: 142,
  },
  {
    id: 'aml_17',
    userId: 'u_aml_07',
    transferId: pickTx(51).id,
    flagType: 'amount',
    severity: 'info',
    description: '2.1M UZS — 2.0σ above corridor mean',
    context: {
      type: 'amount',
      amount_uzs: 2_100_000n * 100n,
      user_avg_uzs: 1_350_000n * 100n,
      std_dev_count: 2.0,
      multiplier: 1.6,
    },
    status: 'open',
    ageMin: 178,
  },
  {
    id: 'aml_18',
    userId: 'u_aml_08',
    flagType: 'pattern',
    severity: 'info',
    description: 'New device fingerprint after 60 days idle',
    context: {
      type: 'pattern',
      rule_name: 'idle-device-rotation',
      matched_signal: 'Last device hash differs from prior 60-day baseline',
      pattern_description:
        'Idle accounts returning with new devices warrant a soft check.',
    },
    status: 'open',
    ageMin: 240,
  },
  {
    id: 'aml_19',
    userId: 'u_aml_09',
    transferId: pickTx(54).id,
    flagType: 'velocity',
    severity: 'info',
    description: '3 transfers in last 30 minutes (threshold: 5, monitoring)',
    context: {
      type: 'velocity',
      window_minutes: 30,
      transfer_count: 3,
      threshold: 5,
      recent_transfer_ids: [pickTx(54).id, pickTx(55).id, pickTx(56).id],
    },
    status: 'open',
    ageMin: 305,
  },

  // ===== 7 REVIEWING (already assigned) =====
  {
    id: 'aml_20',
    userId: 'u_aml_10',
    transferId: pickTx(40).id,
    flagType: 'velocity',
    severity: 'warning',
    description: '5 transfers in last 11 minutes (threshold: 5)',
    context: {
      type: 'velocity',
      window_minutes: 11,
      transfer_count: 5,
      threshold: 5,
      recent_transfer_ids: [pickTx(40).id, pickTx(41).id, pickTx(42).id, pickTx(43).id, pickTx(44).id],
    },
    status: 'reviewing',
    assignee: ADMIN_POOL[1],
    ageMin: 88,
  },
  {
    id: 'aml_21',
    userId: 'u_aml_11',
    transferId: pickTx(48).id,
    flagType: 'amount',
    severity: 'warning',
    description: '3.8M UZS — 3.2σ above user mean',
    context: {
      type: 'amount',
      amount_uzs: 3_800_000n * 100n,
      user_avg_uzs: 1_500_000n * 100n,
      std_dev_count: 3.2,
      multiplier: 2.5,
    },
    status: 'reviewing',
    assignee: CURRENT_ADMIN,
    ageMin: 115,
  },
  {
    id: 'aml_22',
    userId: 'u_aml_12',
    transferId: pickTx(50).id,
    flagType: 'pattern',
    severity: 'warning',
    description: 'Recipient seen across 3 sender accounts this week',
    context: {
      type: 'pattern',
      rule_name: 'shared-recipient-fan-in',
      matched_signal: 'wxid_huang_min received from 3 senders in 5 days',
      pattern_description: 'Multiple-sender / single-recipient signal.',
    },
    status: 'reviewing',
    assignee: ADMIN_POOL[2],
    ageMin: 143,
  },
  {
    id: 'aml_23',
    userId: 'u_aml_02',
    transferId: pickTx(52).id,
    flagType: 'velocity',
    severity: 'warning',
    description: '6 transfers in last 14 minutes (threshold: 5)',
    context: {
      type: 'velocity',
      window_minutes: 14,
      transfer_count: 6,
      threshold: 5,
      recent_transfer_ids: [pickTx(52).id, pickTx(53).id, pickTx(54).id, pickTx(55).id, pickTx(56).id, pickTx(57).id],
    },
    status: 'reviewing',
    assignee: ADMIN_POOL[3],
    ageMin: 167,
  },
  {
    id: 'aml_24',
    userId: 'u_aml_03',
    flagType: 'manual',
    severity: 'warning',
    description: 'Manually flagged — atypical recipient relationship',
    context: {
      type: 'manual',
      filer_admin_id: 'admin_adel',
      filer_admin_name: 'Adel Ortiqova',
      filer_note:
        'User opened a support ticket complaining about a transfer they didn\'t recognize. Need to verify card binding history before any action.',
    },
    status: 'reviewing',
    assignee: ADMIN_POOL[1],
    ageMin: 215,
  },
  {
    id: 'aml_25',
    userId: 'u_aml_05',
    transferId: pickTx(58).id,
    flagType: 'pattern',
    severity: 'info',
    description: 'Round-number transfers (3 of exactly 500K UZS)',
    context: {
      type: 'pattern',
      rule_name: 'round-number-layering',
      matched_signal: '3 transfers of exactly 500,000 UZS within 60 minutes',
      pattern_description:
        'Lower-confidence layering signal — small batch, longer window. Monitoring only.',
    },
    status: 'reviewing',
    assignee: CURRENT_ADMIN,
    ageMin: 295,
  },
  {
    id: 'aml_26',
    userId: 'u_aml_06',
    transferId: pickTx(59).id,
    flagType: 'amount',
    severity: 'info',
    description: '1.9M UZS — 2.3σ above mean',
    context: {
      type: 'amount',
      amount_uzs: 1_900_000n * 100n,
      user_avg_uzs: 850_000n * 100n,
      std_dev_count: 2.3,
      multiplier: 2.2,
    },
    status: 'reviewing',
    assignee: ADMIN_POOL[2],
    ageMin: 412,
  },
];

function seedToReview(seed: FlagSeed): AmlReview {
  return {
    id: seed.id,
    userId: seed.userId,
    transferId: seed.transferId,
    flagType: seed.flagType,
    severity: seed.severity,
    description: seed.description,
    context: seed.context,
    status: seed.status,
    assigneeId: seed.assignee?.id,
    assigneeName: seed.assignee?.name,
    resolutionNotes: seed.resolutionNotes,
    clearReason: seed.clearReason,
    resolvedAt: undefined,
    createdAt: ago(seed.ageMin),
  };
}

const initialFlags: AmlReview[] = SEEDS.map(seedToReview);

/**
 * Manual-flag store — appended to by the AmlTriageNew form. Survives
 * across navigations within the SPA. Resets on full reload.
 */
export const extraManualFlags: AmlReview[] = [];

export function getInitialAmlList(): AmlReview[] {
  // Newest manual flags first, then the seeded set.
  return [...extraManualFlags, ...initialFlags].map((f) => ({ ...f }));
}

export function getAmlById(id: string, list: AmlReview[]): AmlReview | undefined {
  return list.find((f) => f.id === id);
}

// =====================================================================
// Counts (header + filter bar)
// =====================================================================

export interface AmlCounts {
  /** open AND severity=critical */
  criticalOpen: number;
  warningOpen: number;
  infoOpen: number;
  reviewing: number;
  cleared: number;
  escalated: number;
}

export function computeAmlCounts(list: AmlReview[]): AmlCounts {
  const c: AmlCounts = {
    criticalOpen: 0,
    warningOpen: 0,
    infoOpen: 0,
    reviewing: 0,
    cleared: 0,
    escalated: 0,
  };
  for (const f of list) {
    if (f.status === 'open') {
      if (f.severity === 'critical') c.criticalOpen++;
      else if (f.severity === 'warning') c.warningOpen++;
      else c.infoOpen++;
    } else if (f.status === 'reviewing') c.reviewing++;
    else if (f.status === 'cleared') c.cleared++;
    else if (f.status === 'escalated') c.escalated++;
  }
  return c;
}

/** Open + critical + unassigned — drives the page-top critical banner. */
export function unassignedCriticalOpen(list: AmlReview[]): AmlReview[] {
  return list.filter(
    (f) => f.status === 'open' && f.severity === 'critical' && !f.assigneeId,
  );
}

// =====================================================================
// Compliance template — Sanctions Escalate auto-fill
// =====================================================================

export function buildSanctionsEscalateTemplate(flag: AmlReview): string {
  const ctx = flag.context.type === 'sanctions' ? flag.context : null;
  if (!ctx) return '';
  return [
    `Sanctions hit on watchlist [${ctx.matched_list}].`,
    `Recipient handle [${ctx.recipient_handle}] (${ctx.recipient_destination}) matched [${ctx.matched_name}] at score [${ctx.match_score.toFixed(2)}].`,
    `Escalating to senior compliance per protocol. Source-of-funds documentation requested. Customer not to be informed of match details.`,
  ].join('\n');
}

// =====================================================================
// Sequence id generator — used by the manual-flag form
// =====================================================================

let manualFlagSeq = 100;
export function nextManualFlagId(): string {
  manualFlagSeq++;
  return `aml_${manualFlagSeq}`;
}

// =====================================================================
// User pool getter (for the manual-flag form's user picker)
// =====================================================================

export function listAmlUsers(): AmlUserStats[] {
  return liveUsers.map((u) => ({ ...u }));
}
