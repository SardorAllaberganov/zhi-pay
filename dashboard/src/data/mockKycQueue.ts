/**
 * KYC Review Queue mock dataset — 30 deterministic verifications.
 *
 * Status mix:
 *   27 pending (23 unassigned + 4 assigned = "reviewing" derived)
 *    2 passed (recent, within last 24h)
 *    1 failed
 *
 * Pending edge-case mix (per spec):
 *   22 clean
 *    2 under_18      — DOB makes age < 18 (auto-blocked from approval)
 *    2 data_mismatch — MyID full_name differs from users.full_name
 *    1 sanctions_hit — critical AML flag attached
 *
 * Submitted-age spread: 3 rows >12min (soft auto-expire warning); rest 30s–2h ago.
 *
 * `reviewing` is NOT a canonical KYC status (per
 * docs/mermaid_schemas/kyc_state_machine.md the four states are
 * pending/passed/failed/expired). It is a DERIVED UI state computed from
 * `pending + assigneeId set`. The status badge always shows the canonical
 * four. The header chip "X reviewing" computes from the derivation.
 *
 * Schema gap: `assignee_id` is modeled in this mock only — backend
 * `kyc_verifications` does not have it yet (see ai_context/AI_CONTEXT.md
 * Open items).
 *
 * Privacy: full PINFL and full passport numbers live in this file because
 * they are mock values. The UI MUST never render them in full — use
 * `maskPinfl` / `maskDocNumber` at every display site.
 */

import type { KycStatus, KycTier } from '@/types';

export type KycEdgeFlag =
  | 'clean'
  | 'under_18'
  | 'data_mismatch'
  | 'sanctions_hit';

export type KycDocumentType = 'passport' | 'id_card';

export type KycFailureReason =
  | 'document_unreadable'
  | 'data_mismatch'
  | 'under_18'
  | 'sanctions_hit'
  | 'other';

export interface KycAdmin {
  id: string;
  name: string;
  initials: string;
}

export const CURRENT_ADMIN: KycAdmin = {
  id: 'admin_me',
  name: 'You',
  initials: 'YO',
};

export const ADMIN_POOL: KycAdmin[] = [
  CURRENT_ADMIN,
  { id: 'admin_adel', name: 'Adel Ortiqova', initials: 'AO' },
  { id: 'admin_bobur', name: 'Bobur Sayfullayev', initials: 'BS' },
];

export interface KycReview {
  id: string;
  userId: string;
  userPhone: string;

  /** From MyID — the truth of record for the verification. */
  myidFullName: string;
  /**
   * From `users.full_name` at submission time. Diverges from `myidFullName`
   * for the `data_mismatch` edge case.
   */
  userFullName: string;

  dob: Date;
  documentType: KycDocumentType;
  /** Full passport / id-card number — NEVER display in UI. Use `maskDocNumber`. */
  documentNumber: string;
  /** Full 14-digit PINFL — NEVER display in UI. Use `maskPinfl`. */
  pinfl: string;

  myidSessionId: string;
  myidResponse: Record<string, unknown>;
  /** Placeholder URL — real document scan never sourced from network. */
  documentImageUrl: string | null;

  status: KycStatus;
  /** Tier the user will be promoted to on approval. */
  resultingTier: KycTier;

  edgeFlag: KycEdgeFlag;

  /** Set on rejected reviews. */
  failureReason?: KycFailureReason;
  failureNote?: string;

  /** Mock-only assignee. Schema gap — see file header. */
  assigneeId?: string;
  assigneeName?: string;
  claimedAt?: Date;

  /** Set on passed reviews. */
  verifiedAt?: Date;
  expiresAt?: Date;

  submittedAt: Date;

  /** Increments on "Request more info" without changing status. */
  infoRequests: number;
}

// =====================================================================
// Audit log — module-level append-only store
// =====================================================================

export type KycAuditAction =
  | 'claim'
  | 'unclaim'
  | 'approve'
  | 'reject'
  | 'request_info'
  | 'escalate'
  | 'reveal_face'
  | 'hide_face'
  | 'reveal_doc_number'
  | 'hide_doc_number';

export interface KycAuditEntry {
  id: string;
  reviewId: string;
  action: KycAuditAction;
  actorId: string;
  actorName: string;
  reason?: string;
  failureReason?: KycFailureReason;
  context?: Record<string, unknown>;
  createdAt: Date;
}

const auditEntries: KycAuditEntry[] = [];
let auditSeq = 1;

export function appendKycAudit(
  entry: Omit<KycAuditEntry, 'id' | 'createdAt'>,
): KycAuditEntry {
  const e: KycAuditEntry = {
    ...entry,
    id: `kaud_${String(auditSeq++).padStart(4, '0')}`,
    createdAt: new Date(),
  };
  auditEntries.push(e);
  return e;
}

export function getKycAuditForReview(reviewId: string): KycAuditEntry[] {
  return auditEntries.filter((e) => e.reviewId === reviewId);
}

// =====================================================================
// Reference time + small helpers
// =====================================================================

const NOW = new Date('2026-05-01T10:30:00Z');

function ago(minutes: number): Date {
  return new Date(NOW.getTime() - minutes * 60 * 1000);
}

function dob(year: number, month: number, day: number): Date {
  return new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00Z`);
}

export function ageInYears(dobDate: Date, ref: Date = NOW): number {
  const ms = ref.getTime() - dobDate.getTime();
  return Math.floor(ms / (365.25 * 24 * 60 * 60 * 1000));
}

// =====================================================================
// Manual seed — 30 reviews
//
// Order is row-1 first (newest) → row-30 last (oldest). Edge-case rows
// are interleaved so j/k navigation hits them naturally.
// =====================================================================

interface Row {
  id: string;
  user: { id: string; phone: string };
  // when name diverges, `myid` and `user_table` differ; otherwise the same.
  name: { myid: string; user_table?: string };
  dob: Date;
  doc: { type: KycDocumentType; number: string }; // 9-char `AB1234567`
  pinfl: string; // 14 digits
  edgeFlag: KycEdgeFlag;
  submittedMinAgo: number;
  status: KycStatus;
  resultingTier: KycTier;
  assignee?: KycAdmin;
  // failed-only
  failureReason?: KycFailureReason;
  failureNote?: string;
  // passed-only
  verifiedMinAgo?: number; // minutes ago — verified_at = NOW - this
  expiresInDays?: number; // typically 365
}

const ROWS: Row[] = [
  // ---- pending — 5 rows >12min (auto-expire warning) ----
  {
    id: 'kv_01', user: { id: 'u_kq_01', phone: '+998 90 110 11 21' },
    name: { myid: 'Otabek Karimov' },
    dob: dob(1992, 4, 18),
    doc: { type: 'passport', number: 'AB7741234' },
    pinfl: '32412199204185678',
    edgeFlag: 'clean',
    submittedMinAgo: 13,
    status: 'pending',
    resultingTier: 'tier_2',
  },
  {
    id: 'kv_02', user: { id: 'u_kq_02', phone: '+998 91 220 33 44' },
    name: { myid: 'Diyora Tursunova' },
    dob: dob(1996, 11, 3),
    doc: { type: 'passport', number: 'AC2256789' },
    pinfl: '52311199611036712',
    edgeFlag: 'clean',
    submittedMinAgo: 14,
    status: 'pending',
    resultingTier: 'tier_2',
  },
  {
    id: 'kv_03', user: { id: 'u_kq_03', phone: '+998 93 555 66 77' },
    name: { myid: 'Akmal Iskandarov' },
    dob: dob(1988, 7, 22),
    doc: { type: 'passport', number: 'AB9988123' },
    pinfl: '52507198807228899',
    edgeFlag: 'sanctions_hit', // critical — assigned to me, also >12min
    submittedMinAgo: 18,
    status: 'pending',
    resultingTier: 'tier_2',
    assignee: CURRENT_ADMIN,
  },

  // ---- pending — under_18 (auto-blocked) ----
  {
    id: 'kv_04', user: { id: 'u_kq_04', phone: '+998 94 777 88 99' },
    name: { myid: 'Aziza Yusupova' },
    dob: dob(2010, 5, 15), // ~16 yo
    doc: { type: 'id_card', number: 'IC4456778' },
    pinfl: '12515201005156643',
    edgeFlag: 'under_18',
    submittedMinAgo: 8,
    status: 'pending',
    resultingTier: 'tier_2',
  },
  {
    id: 'kv_05', user: { id: 'u_kq_05', phone: '+998 95 222 33 44' },
    name: { myid: 'Bekzod Nurmatov' },
    dob: dob(2009, 8, 20), // ~16 yo
    doc: { type: 'passport', number: 'AB3322445' },
    pinfl: '52520200908203321',
    edgeFlag: 'under_18',
    submittedMinAgo: 22,
    status: 'pending',
    resultingTier: 'tier_2',
  },

  // ---- pending — data_mismatch ----
  {
    id: 'kv_06', user: { id: 'u_kq_06', phone: '+998 90 311 22 33' },
    name: {
      myid: 'Sardor Toirovich Tursunov', // formal w/ patronymic
      user_table: 'Sardor Tursunov',
    },
    dob: dob(1990, 2, 14),
    doc: { type: 'passport', number: 'AB1119988' },
    pinfl: '52414199002145511',
    edgeFlag: 'data_mismatch',
    submittedMinAgo: 5,
    status: 'pending',
    resultingTier: 'tier_2',
  },
  {
    id: 'kv_07', user: { id: 'u_kq_07', phone: '+998 99 423 56 78' },
    name: {
      myid: 'Madina Yusupova-Karimova', // married surname
      user_table: 'Madina Yusupova',
    },
    dob: dob(1994, 9, 30),
    doc: { type: 'id_card', number: 'IC9988776' },
    pinfl: '12530199409305544',
    edgeFlag: 'data_mismatch',
    submittedMinAgo: 9,
    status: 'pending',
    resultingTier: 'tier_2',
  },

  // ---- pending — clean (assigned to others = part of "reviewing") ----
  {
    id: 'kv_08', user: { id: 'u_kq_08', phone: '+998 90 444 11 22' },
    name: { myid: 'Lola Saidova' },
    dob: dob(1985, 6, 7),
    doc: { type: 'passport', number: 'AB5566778' },
    pinfl: '52507198506075522',
    edgeFlag: 'clean',
    submittedMinAgo: 7,
    status: 'pending',
    resultingTier: 'tier_2',
    assignee: ADMIN_POOL[1], // Adel
  },
  {
    id: 'kv_09', user: { id: 'u_kq_09', phone: '+998 93 988 77 66' },
    name: { myid: 'Jasur Yuldashev' },
    dob: dob(1991, 12, 25),
    doc: { type: 'passport', number: 'AC7788991' },
    pinfl: '52525199112258833',
    edgeFlag: 'clean',
    submittedMinAgo: 11,
    status: 'pending',
    resultingTier: 'tier_2',
    assignee: ADMIN_POOL[2], // Bobur
  },

  // ---- pending — clean (one assigned to me, the rest unassigned) ----
  {
    id: 'kv_10', user: { id: 'u_kq_10', phone: '+998 90 211 99 88' },
    name: { myid: 'Nigora Akhmedova' },
    dob: dob(1993, 3, 12),
    doc: { type: 'passport', number: 'AB6611234' },
    pinfl: '52512199303125578',
    edgeFlag: 'clean',
    submittedMinAgo: 4,
    status: 'pending',
    resultingTier: 'tier_2',
    assignee: CURRENT_ADMIN, // me
  },
  {
    id: 'kv_11', user: { id: 'u_kq_11', phone: '+998 94 877 66 55' },
    name: { myid: 'Davron Khasanov' },
    dob: dob(1987, 1, 9),
    doc: { type: 'passport', number: 'AB4488112' },
    pinfl: '52509198701094477',
    edgeFlag: 'clean',
    submittedMinAgo: 1,
    status: 'pending',
    resultingTier: 'tier_2',
  },
  {
    id: 'kv_12', user: { id: 'u_kq_12', phone: '+998 95 100 22 33' },
    name: { myid: 'Shahnoza Rakhmonova' },
    dob: dob(1995, 8, 17),
    doc: { type: 'id_card', number: 'IC2233445' },
    pinfl: '12517199508177733',
    edgeFlag: 'clean',
    submittedMinAgo: 2,
    status: 'pending',
    resultingTier: 'tier_2',
  },
  {
    id: 'kv_13', user: { id: 'u_kq_13', phone: '+998 99 555 12 13' },
    name: { myid: 'Rustam Sobirov' },
    dob: dob(1990, 10, 28),
    doc: { type: 'passport', number: 'AB7799001' },
    pinfl: '52528199010289912',
    edgeFlag: 'clean',
    submittedMinAgo: 3,
    status: 'pending',
    resultingTier: 'tier_2',
  },
  {
    id: 'kv_14', user: { id: 'u_kq_14', phone: '+998 90 661 23 45' },
    name: { myid: 'Iroda Karimova' },
    dob: dob(1989, 5, 4),
    doc: { type: 'passport', number: 'AC1100223' },
    pinfl: '52404198905047722',
    edgeFlag: 'clean',
    submittedMinAgo: 6,
    status: 'pending',
    resultingTier: 'tier_2',
  },
  {
    id: 'kv_15', user: { id: 'u_kq_15', phone: '+998 91 882 34 56' },
    name: { myid: 'Asilbek Tashpulatov' },
    dob: dob(1986, 9, 19),
    doc: { type: 'passport', number: 'AB3344556' },
    pinfl: '52419198609194466',
    edgeFlag: 'clean',
    submittedMinAgo: 10,
    status: 'pending',
    resultingTier: 'tier_2',
  },
  {
    id: 'kv_16', user: { id: 'u_kq_16', phone: '+998 93 271 45 67' },
    name: { myid: 'Malika Rashidova' },
    dob: dob(1997, 2, 26),
    doc: { type: 'id_card', number: 'IC4455667' },
    pinfl: '12526199702265500',
    edgeFlag: 'clean',
    submittedMinAgo: 12,
    status: 'pending',
    resultingTier: 'tier_2',
  },
  {
    id: 'kv_17', user: { id: 'u_kq_17', phone: '+998 94 312 56 78' },
    name: { myid: 'Hilola Yakubova' },
    dob: dob(1992, 7, 11),
    doc: { type: 'passport', number: 'AB5566889' },
    pinfl: '52511199207117788',
    edgeFlag: 'clean',
    submittedMinAgo: 4,
    status: 'pending',
    resultingTier: 'tier_2',
  },
  {
    id: 'kv_18', user: { id: 'u_kq_18', phone: '+998 95 433 67 89' },
    name: { myid: 'Zafar Mirzaev' },
    dob: dob(1984, 11, 5),
    doc: { type: 'passport', number: 'AB7788990' },
    pinfl: '52505198411052299',
    edgeFlag: 'clean',
    submittedMinAgo: 8,
    status: 'pending',
    resultingTier: 'tier_2',
  },
  {
    id: 'kv_19', user: { id: 'u_kq_19', phone: '+998 99 544 78 90' },
    name: { myid: 'Komila Toirova' },
    dob: dob(1998, 4, 23),
    doc: { type: 'id_card', number: 'IC6677889' },
    pinfl: '12523199804233344',
    edgeFlag: 'clean',
    submittedMinAgo: 15,
    status: 'pending',
    resultingTier: 'tier_2',
  },
  {
    id: 'kv_20', user: { id: 'u_kq_20', phone: '+998 90 655 89 01' },
    name: { myid: 'Bobir Kamolov' },
    dob: dob(1993, 1, 30),
    doc: { type: 'passport', number: 'AB8899001' },
    pinfl: '52430199301301188',
    edgeFlag: 'clean',
    submittedMinAgo: 7,
    status: 'pending',
    resultingTier: 'tier_2',
  },
  {
    id: 'kv_21', user: { id: 'u_kq_21', phone: '+998 91 776 90 12' },
    name: { myid: 'Sevara Nazarova' },
    dob: dob(1991, 6, 8),
    doc: { type: 'passport', number: 'AB9900112' },
    pinfl: '52508199106082244',
    edgeFlag: 'clean',
    submittedMinAgo: 16,
    status: 'pending',
    resultingTier: 'tier_2',
  },
  {
    id: 'kv_22', user: { id: 'u_kq_22', phone: '+998 93 887 01 23' },
    name: { myid: 'Aziz Khudoyberdiev' },
    dob: dob(1988, 8, 14),
    doc: { type: 'passport', number: 'AC2233445' },
    pinfl: '52514198808147755',
    edgeFlag: 'clean',
    submittedMinAgo: 19,
    status: 'pending',
    resultingTier: 'tier_2',
  },
  {
    id: 'kv_23', user: { id: 'u_kq_23', phone: '+998 94 998 12 34' },
    name: { myid: 'Nodira Khakimova' },
    dob: dob(1996, 12, 2),
    doc: { type: 'id_card', number: 'IC8899001' },
    pinfl: '12502199612026611',
    edgeFlag: 'clean',
    submittedMinAgo: 21,
    status: 'pending',
    resultingTier: 'tier_2',
  },
  {
    id: 'kv_24', user: { id: 'u_kq_24', phone: '+998 95 109 23 45' },
    name: { myid: 'Sherzod Tashkentov' },
    dob: dob(1985, 3, 27),
    doc: { type: 'passport', number: 'AB1010202' },
    pinfl: '52427198503271100',
    edgeFlag: 'clean',
    submittedMinAgo: 25,
    status: 'pending',
    resultingTier: 'tier_2',
  },
  {
    id: 'kv_25', user: { id: 'u_kq_25', phone: '+998 99 110 34 56' },
    name: { myid: 'Munisa Anvarova' },
    dob: dob(1994, 10, 16),
    doc: { type: 'passport', number: 'AC1212323' },
    pinfl: '52416199410163322',
    edgeFlag: 'clean',
    submittedMinAgo: 28,
    status: 'pending',
    resultingTier: 'tier_2',
  },
  {
    id: 'kv_26', user: { id: 'u_kq_26', phone: '+998 90 211 45 67' },
    name: { myid: 'Olimjon Umarov' },
    dob: dob(1989, 7, 21),
    doc: { type: 'passport', number: 'AB1313434' },
    pinfl: '52521198907211177',
    edgeFlag: 'clean',
    submittedMinAgo: 35,
    status: 'pending',
    resultingTier: 'tier_2',
  },
  {
    id: 'kv_27', user: { id: 'u_kq_27', phone: '+998 91 322 56 78' },
    name: { myid: 'Gulnoza Aliyeva' },
    dob: dob(1992, 11, 9),
    doc: { type: 'id_card', number: 'IC1414545' },
    pinfl: '12509199211091199',
    edgeFlag: 'clean',
    submittedMinAgo: 41,
    status: 'pending',
    resultingTier: 'tier_2',
  },

  // ---- passed — recent (within 24h) ----
  {
    id: 'kv_28', user: { id: 'u_kq_28', phone: '+998 93 433 67 89' },
    name: { myid: 'Anvar Pulatov' },
    dob: dob(1986, 5, 12),
    doc: { type: 'passport', number: 'AB1515656' },
    pinfl: '52512198605121155',
    edgeFlag: 'clean',
    submittedMinAgo: 60 * 4 + 5, // ~4h ago
    status: 'passed',
    resultingTier: 'tier_2',
    verifiedMinAgo: 60 * 4 + 2,
    expiresInDays: 365,
  },
  {
    id: 'kv_29', user: { id: 'u_kq_29', phone: '+998 94 544 78 90' },
    name: { myid: 'Marjona Erkinova' },
    dob: dob(1995, 2, 28),
    doc: { type: 'id_card', number: 'IC1616767' },
    pinfl: '12528199502281166',
    edgeFlag: 'clean',
    submittedMinAgo: 60 * 6 + 12, // ~6h ago
    status: 'passed',
    resultingTier: 'tier_2',
    verifiedMinAgo: 60 * 6 + 9,
    expiresInDays: 365,
  },

  // ---- failed ----
  {
    id: 'kv_30', user: { id: 'u_kq_30', phone: '+998 95 655 89 01' },
    name: { myid: 'Sanjar Begmatov' },
    dob: dob(1990, 9, 4),
    doc: { type: 'passport', number: 'AB1717878' },
    pinfl: '52404199009047733',
    edgeFlag: 'clean',
    submittedMinAgo: 60 * 8 + 30, // ~8.5h ago
    status: 'failed',
    resultingTier: 'tier_2',
    failureReason: 'document_unreadable',
    failureNote: 'Passport photo blurred — could not extract MRZ reliably.',
  },
];

// =====================================================================
// Build phase — translate Row → KycReview
// =====================================================================

function buildMyidResponse(row: Row): Record<string, unknown> {
  // Real MyID payload would carry a lot more — this mirrors the shape.
  // Sensitive fields (full PINFL, full document number) are redacted in
  // the JSON viewer so the dashboard never displays them in full.
  return {
    session_id: `mid_${row.id}_${Date.now().toString(36)}`,
    matched: row.edgeFlag !== 'data_mismatch',
    full_name: row.name.myid,
    dob: row.dob.toISOString().slice(0, 10),
    document: {
      type: row.doc.type,
      // Series prefix kept (passport series like AB are not PII alone)
      series: row.doc.number.slice(0, 2),
      number_redacted: '••••' + row.doc.number.slice(-3),
    },
    pinfl_redacted: '••••••••••' + row.pinfl.slice(-4),
    biometric_match_score: row.edgeFlag === 'data_mismatch' ? 0.83 : 0.97,
    aml: {
      sanctions_match: row.edgeFlag === 'sanctions_hit',
      pep: false,
      adverse_media: row.edgeFlag === 'sanctions_hit',
    },
    issued_at: row.dob.toISOString(),
    issued_by: 'MIA — Republic of Uzbekistan',
  };
}

function rowToReview(row: Row): KycReview {
  const submittedAt = ago(row.submittedMinAgo);
  const verifiedAt =
    row.status === 'passed' && row.verifiedMinAgo != null
      ? ago(row.verifiedMinAgo)
      : undefined;
  const expiresAt =
    verifiedAt && row.expiresInDays
      ? new Date(verifiedAt.getTime() + row.expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

  return {
    id: row.id,
    userId: row.user.id,
    userPhone: row.user.phone,
    myidFullName: row.name.myid,
    userFullName: row.name.user_table ?? row.name.myid,
    dob: row.dob,
    documentType: row.doc.type,
    documentNumber: row.doc.number,
    pinfl: row.pinfl,
    myidSessionId: `mid_${row.id}_session`,
    myidResponse: buildMyidResponse(row),
    documentImageUrl: row.status === 'failed' ? null : `placeholder://doc/${row.id}`,
    status: row.status,
    resultingTier: row.resultingTier,
    edgeFlag: row.edgeFlag,
    failureReason: row.failureReason,
    failureNote: row.failureNote,
    assigneeId: row.assignee?.id,
    assigneeName: row.assignee?.name,
    claimedAt: row.assignee ? ago(row.submittedMinAgo - 1) : undefined,
    verifiedAt,
    expiresAt,
    submittedAt,
    infoRequests: 0,
  };
}

const initialReviews: KycReview[] = ROWS.map(rowToReview);

// Sort newest-first (matches default list sort).
initialReviews.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());

// =====================================================================
// Public API
// =====================================================================

export function getInitialKycList(): KycReview[] {
  return initialReviews.slice();
}

export function getKycById(id: string, list: KycReview[]): KycReview | undefined {
  return list.find((r) => r.id === id);
}

export function getNow(): Date {
  return NOW;
}

/**
 * Approve-blocking guard. Spec:
 *   - Under-18: hard auto-block.
 *   - Sanctions hit: hard auto-block until cleared.
 *   - Data-mismatch is a SOFT warning — reviewer can still approve.
 */
export function approveBlocked(r: KycReview): KycFailureReason | null {
  if (r.edgeFlag === 'under_18') return 'under_18';
  if (r.edgeFlag === 'sanctions_hit') return 'sanctions_hit';
  return null;
}

/**
 * Counts for the page header chip and filter chips.
 * `reviewing` is derived: pending + assigneeId set.
 */
export interface KycCounts {
  pending: number;
  reviewing: number;
  passed: number;
  failed: number;
  expired: number;
}

export function computeKycCounts(list: KycReview[]): KycCounts {
  const counts: KycCounts = { pending: 0, reviewing: 0, passed: 0, failed: 0, expired: 0 };
  for (const r of list) {
    if (r.status === 'pending') {
      if (r.assigneeId) counts.reviewing++;
      else counts.pending++;
    } else {
      counts[r.status]++;
    }
  }
  return counts;
}

// Auto-expire warning thresholds (mirrors backend job — UI only signals).
export const KYC_AUTO_EXPIRE_WARN_MS = 12 * 60 * 1000;
export const KYC_AUTO_EXPIRE_HARD_MS = 15 * 60 * 1000;

export function pendingMinutesAge(r: KycReview, ref: Date = new Date()): number {
  return Math.floor((ref.getTime() - r.submittedAt.getTime()) / (60 * 1000));
}

export function isExpiringSoon(r: KycReview, ref: Date = new Date()): boolean {
  if (r.status !== 'pending') return false;
  const ageMs = ref.getTime() - r.submittedAt.getTime();
  return ageMs >= KYC_AUTO_EXPIRE_WARN_MS && ageMs < KYC_AUTO_EXPIRE_HARD_MS;
}
