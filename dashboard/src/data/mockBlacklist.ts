/**
 * Blacklist mock dataset — five types unified under one entry shape.
 *
 * Single source of truth for the Blacklist surface
 * (`/compliance/blacklist`).
 *
 * Schema (mirrors `docs/models.md` §2.5 — `blacklist`):
 *   id           string  ('bl_NNNN')
 *   type         'phone' | 'pinfl' | 'device_id' | 'ip' | 'card_token'
 *   identifier   string  (full value — UI masks per type)
 *   severity     'suspected' | 'confirmed'
 *   reason       string  (≥ 30 chars at insert)
 *   addedBy      string  (admin id, or 'system')
 *   expiresAt    Date | null  (null = indefinite)
 *   createdAt    Date
 *
 * Mock-only embellishments:
 *   - `affectedCount` — denormalized "currently affecting" hint for
 *     `device_id` / `ip` types, where no canonical user/device store exists
 *     yet in the prototype. For `phone` / `pinfl` / `card_token` the count
 *     is derived from `mockUsers` / `mockCards`.
 *   - `loginAttemptsBlocked30d` — optional, for the impact card's "has
 *     prevented N login attempts" line. Synthetic, mock-only.
 *
 * Critical invariants (enforced by the mutators):
 *   1. Rows are NEVER edited in place except via `editBlacklistReason()` and
 *      `extendBlacklistExpiry()`, both of which append a new audit-log
 *      entry preserving the prior value in `context.previous_*`.
 *   2. `removeBlacklistEntry()` is a hard-delete and emits an audit-log
 *      entry — the row is gone from the live array but the audit history
 *      retains the trace.
 *   3. `addedBy` and `reason` are mock-only audit-trail surrogates
 *      (same precedent as `mockFxRates.ts` / `mockCommissionRules.ts`).
 *      The real backend records these in a separate audit-log table.
 *
 * Audit-log bridge: `listBlacklistAudit()` is consumed by `mockAuditLog.ts`
 * to surface granular verbs (`add` / `edit_reason` / `extend_expiry` /
 * `hard_delete`) on the central `/compliance/audit-log` surface.
 */

import { listUsers, type UserListRow } from './mockUsers';
import { listCards, type CardEntry } from './mockCards';

// =====================================================================
// Public types
// =====================================================================

export type BlacklistType = 'phone' | 'pinfl' | 'device_id' | 'ip' | 'card_token';
export type BlacklistSeverity = 'suspected' | 'confirmed';

export interface BlacklistEntry {
  id: string;
  type: BlacklistType;
  identifier: string;
  severity: BlacklistSeverity;
  reason: string;
  addedBy: string;
  expiresAt: Date | null;
  createdAt: Date;
  /** Denormalized fallback for device_id / ip (no canonical store yet). */
  affectedCount?: number;
  /** Optional: synthetic 30-day blocked-login count for impact card. */
  loginAttemptsBlocked30d?: number;
}

// =====================================================================
// Reference time + admin pool — keep aligned with sibling modules
// =====================================================================

const NOW = new Date('2026-04-29T10:30:00Z');
function daysAgo(days: number): Date {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);
}
function daysAhead(days: number): Date {
  return new Date(NOW.getTime() + days * 24 * 60 * 60 * 1000);
}
function hoursAgo(hours: number): Date {
  return new Date(NOW.getTime() - hours * 60 * 60 * 1000);
}

interface AdminProfile {
  id: string;
  name: string;
}
const SUPER_ADMIN: AdminProfile = { id: 'admin_super_01', name: 'Yulduz Otaboeva' };
const FINANCE_ADMIN: AdminProfile = { id: 'admin_finance_02', name: 'Adel Ortiqova' };
export const BLACKLIST_ADMIN_POOL: AdminProfile[] = [SUPER_ADMIN, FINANCE_ADMIN];

// =====================================================================
// 45-row deterministic seed (no PRNG)
// =====================================================================

let seq = 1;
function nextId(): string {
  return `bl_${String(seq++).padStart(4, '0')}`;
}

const _SEED: BlacklistEntry[] = [];

// ---------------------------------------------------------------------
// Phone — 8 entries (5 confirmed, 3 suspected)
// ---------------------------------------------------------------------
_SEED.push(
  {
    id: nextId(),
    type: 'phone',
    identifier: '+998 99 789 01 23', // matches u_07 = Jasur Toshmatov (already blocked)
    severity: 'confirmed',
    reason:
      'Repeated chargeback fraud across 4 transfers — case #2026-04-12-A. Confirmed by acquirer; account already blocked.',
    addedBy: SUPER_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(14),
    loginAttemptsBlocked30d: 23,
  },
  {
    id: nextId(),
    type: 'phone',
    identifier: '+998 94 890 12 34', // matches u_18 Zuhra Nazarova (blocked)
    severity: 'confirmed',
    reason:
      'Multi-account abuse — same device and IP linked to 3 accounts under different PINFLs. Sanctions screening hit on associated entity.',
    addedBy: SUPER_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(28),
    loginAttemptsBlocked30d: 47,
  },
  {
    id: nextId(),
    type: 'phone',
    identifier: '+998 90 555 12 34', // not in user pool
    severity: 'confirmed',
    reason:
      'Confirmed money mule — phone surfaced on three separate AML-pattern flags within 48h. Compliance escalation #2026-03-29-C.',
    addedBy: FINANCE_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(35),
    loginAttemptsBlocked30d: 8,
  },
  {
    id: nextId(),
    type: 'phone',
    identifier: '+998 91 444 67 89', // not in user pool
    severity: 'confirmed',
    reason:
      'Repeated OTP-bombing of /signup/verify endpoint — 412 attempts in 6h with rotated device fingerprints.',
    addedBy: SUPER_ADMIN.id,
    expiresAt: daysAhead(60),
    createdAt: daysAgo(7),
    loginAttemptsBlocked30d: 412,
  },
  {
    id: nextId(),
    type: 'phone',
    identifier: '+998 93 877 65 43', // not in user pool
    severity: 'confirmed',
    reason:
      'Sanctions-list match — full PINFL screening returned partial-name positive. Manual review by Compliance confirmed match.',
    addedBy: FINANCE_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(50),
    loginAttemptsBlocked30d: 0,
  },
  {
    id: nextId(),
    type: 'phone',
    identifier: '+998 95 222 33 44', // not in user pool
    severity: 'suspected',
    reason:
      'Velocity AML flag triggered three times in two weeks — investigating before escalating to confirmed.',
    addedBy: SUPER_ADMIN.id,
    expiresAt: daysAhead(30),
    createdAt: daysAgo(4),
    loginAttemptsBlocked30d: 5,
  },
  {
    id: nextId(),
    type: 'phone',
    identifier: '+998 97 666 11 00', // not in user pool
    severity: 'suspected',
    reason:
      'Recipient-side complaint received via partner — pending investigation by AML team. Soft block in the meantime.',
    addedBy: FINANCE_ADMIN.id,
    expiresAt: daysAhead(14),
    createdAt: daysAgo(2),
    loginAttemptsBlocked30d: 1,
  },
  {
    id: nextId(),
    type: 'phone',
    identifier: '+998 90 808 70 60', // not in user pool
    severity: 'suspected',
    reason:
      'Reported by user complaint as harassment / impersonation source — provisional block during investigation.',
    addedBy: SUPER_ADMIN.id,
    expiresAt: daysAhead(21),
    createdAt: hoursAgo(36),
    loginAttemptsBlocked30d: 2,
  },
);

// ---------------------------------------------------------------------
// PINFL — 4 entries (all confirmed)
// ---------------------------------------------------------------------
_SEED.push(
  {
    id: nextId(),
    type: 'pinfl',
    identifier: '12345678901234', // not in user pool
    severity: 'confirmed',
    reason:
      'Synthetic ID — PINFL not present in CBU registry but used by repeated MyID-fail attempts. Case #2026-03-15-S.',
    addedBy: FINANCE_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(45),
    loginAttemptsBlocked30d: 19,
  },
  {
    id: nextId(),
    type: 'pinfl',
    identifier: '23456789012345',
    severity: 'confirmed',
    reason:
      'Multi-account creation — same PINFL submitted via 4 different phone numbers in 2 months. Confirmed by MyID.',
    addedBy: SUPER_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(60),
    loginAttemptsBlocked30d: 6,
  },
  {
    id: nextId(),
    type: 'pinfl',
    identifier: '66677788805678', // matches u_07 = Jasur Toshmatov (blocked)
    severity: 'confirmed',
    reason:
      'Linked to chargeback fraud case #2026-04-12-A. PINFL added to prevent re-registration via different phone number.',
    addedBy: SUPER_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(14),
    loginAttemptsBlocked30d: 2,
  },
  {
    id: nextId(),
    type: 'pinfl',
    identifier: '34567890123456',
    severity: 'confirmed',
    reason:
      'Sanctions-list match — name + DOB match against OFAC SDN list. Full block per Compliance directive 2026-Q1-12.',
    addedBy: FINANCE_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(80),
    loginAttemptsBlocked30d: 0,
  },
);

// ---------------------------------------------------------------------
// Device — 12 entries (bot detection patterns)
// ---------------------------------------------------------------------
_SEED.push(
  {
    id: nextId(),
    type: 'device_id',
    identifier: '7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
    severity: 'confirmed',
    reason: 'Frida instrumentation detected — runtime-patched the OTP verification flow. Device kept for forensic analysis.',
    addedBy: SUPER_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(20),
    affectedCount: 1,
    loginAttemptsBlocked30d: 47,
  },
  {
    id: nextId(),
    type: 'device_id',
    identifier: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
    severity: 'confirmed',
    reason: 'Android emulator with rooted environment + MagiskHide signature. Used for repeated KYC bypass attempts.',
    addedBy: SUPER_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(18),
    affectedCount: 1,
    loginAttemptsBlocked30d: 31,
  },
  {
    id: nextId(),
    type: 'device_id',
    identifier: 'f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4',
    severity: 'confirmed',
    reason: 'Jailbroken iOS device with Cydia substrate — confirmed via runtime checksum mismatch on three sessions.',
    addedBy: FINANCE_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(16),
    affectedCount: 1,
    loginAttemptsBlocked30d: 12,
  },
  {
    id: nextId(),
    type: 'device_id',
    identifier: '11223344556677889900aabbccddeeff',
    severity: 'confirmed',
    reason: 'Headless browser fingerprint (Puppeteer signature) seen across 23 phone numbers within 4 hours.',
    addedBy: SUPER_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(11),
    affectedCount: 23,
    loginAttemptsBlocked30d: 156,
  },
  {
    id: nextId(),
    type: 'device_id',
    identifier: 'aabbccddeeff00112233445566778899',
    severity: 'confirmed',
    reason: 'Confirmed botnet endpoint — matches IOC bundle 2026-04-22 from MFER.',
    addedBy: FINANCE_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(9),
    affectedCount: 4,
    loginAttemptsBlocked30d: 89,
  },
  {
    id: nextId(),
    type: 'device_id',
    identifier: 'ddeeff00112233445566778899aabbcc',
    severity: 'confirmed',
    reason: 'Repeated 3DS fail-then-succeed pattern — 12 cards, same device. Card-cloning suspect.',
    addedBy: SUPER_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(8),
    affectedCount: 0,
    loginAttemptsBlocked30d: 38,
  },
  {
    id: nextId(),
    type: 'device_id',
    identifier: 'beefcafefeedfacedeadbeefdeadbabe',
    severity: 'suspected',
    reason: 'Anomalous battery-state-spoof signal seen during onboarding. Investigation pending — provisional block.',
    addedBy: FINANCE_ADMIN.id,
    expiresAt: daysAhead(14),
    createdAt: daysAgo(5),
    affectedCount: 0,
    loginAttemptsBlocked30d: 4,
  },
  {
    id: nextId(),
    type: 'device_id',
    identifier: 'baadf00d12345678baadf00d87654321',
    severity: 'suspected',
    reason: 'Hardware-attestation fail (Play Integrity API verdict = MEETS_BASIC_INTEGRITY only). Soft block while collecting more samples.',
    addedBy: SUPER_ADMIN.id,
    expiresAt: daysAhead(30),
    createdAt: daysAgo(6),
    affectedCount: 0,
    loginAttemptsBlocked30d: 2,
  },
  {
    id: nextId(),
    type: 'device_id',
    identifier: 'c0ffee1234c0ffee5678c0ffee9abcde',
    severity: 'confirmed',
    reason: 'OTP bombing source — 1,800+ /signup/verify hits in 12h with rotated phones. Botnet-grade.',
    addedBy: SUPER_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(3),
    affectedCount: 0,
    loginAttemptsBlocked30d: 1842,
  },
  {
    id: nextId(),
    type: 'device_id',
    identifier: '0fedcba987654321fedcba9876543210',
    severity: 'confirmed',
    reason: 'Linked to confirmed money mule (case #2026-03-29-C). Device persistently logged in across two blocked accounts.',
    addedBy: FINANCE_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(35),
    affectedCount: 0,
    loginAttemptsBlocked30d: 0,
  },
  {
    id: nextId(),
    type: 'device_id',
    identifier: '1357246813572468135724681357acef',
    severity: 'suspected',
    reason: 'Velocity flag (5 different phones in 24h) without other anomaly signals. Watching before promoting.',
    addedBy: SUPER_ADMIN.id,
    expiresAt: daysAhead(7),
    createdAt: hoursAgo(40),
    affectedCount: 1,
    loginAttemptsBlocked30d: 9,
  },
  {
    id: nextId(),
    type: 'device_id',
    identifier: '24680135713579024680135702468ace',
    severity: 'suspected',
    reason: 'Repeated card-add-fail / 3DS-cancel pattern — 17 cards declined within 1h.',
    addedBy: FINANCE_ADMIN.id,
    expiresAt: daysAhead(14),
    createdAt: hoursAgo(20),
    affectedCount: 0,
    loginAttemptsBlocked30d: 3,
  },
);

// ---------------------------------------------------------------------
// IP — 15 entries (3 with expiry for DDoS bursts; 12 indefinite)
// ---------------------------------------------------------------------
_SEED.push(
  // 3 with expiry — DDoS bursts
  {
    id: nextId(),
    type: 'ip',
    identifier: '185.196.213.42',
    severity: 'confirmed',
    reason: 'DDoS source — 18,400 RPS on /api/auth/login during 2026-04-26 burst. Auto-mitigated; manual block extended.',
    addedBy: SUPER_ADMIN.id,
    expiresAt: daysAhead(7),
    createdAt: daysAgo(3),
    affectedCount: 0,
    loginAttemptsBlocked30d: 18400,
  },
  {
    id: nextId(),
    type: 'ip',
    identifier: '5.181.234.117',
    severity: 'confirmed',
    reason: 'DDoS source — credential-stuffing burst from compromised ASN range. Block expires after 14d cool-down.',
    addedBy: SUPER_ADMIN.id,
    expiresAt: daysAhead(11),
    createdAt: daysAgo(3),
    affectedCount: 0,
    loginAttemptsBlocked30d: 6420,
  },
  {
    id: nextId(),
    type: 'ip',
    identifier: '94.102.49.190',
    severity: 'suspected',
    reason: 'Spike in /signup/verify failures — possible scraping. Soft block; will re-evaluate when expiry hits.',
    addedBy: FINANCE_ADMIN.id,
    expiresAt: daysAhead(5),
    createdAt: daysAgo(2),
    affectedCount: 0,
    loginAttemptsBlocked30d: 312,
  },
  // 12 indefinite — Tor exits, abusive ASNs, scraping bots
  {
    id: nextId(),
    type: 'ip',
    identifier: '185.220.101.45',
    severity: 'confirmed',
    reason: 'Tor exit node — repeatedly used for KYC-bypass attempts. Listed on dan.me.uk Tor bulk-list.',
    addedBy: SUPER_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(40),
    affectedCount: 0,
    loginAttemptsBlocked30d: 234,
  },
  {
    id: nextId(),
    type: 'ip',
    identifier: '199.249.230.22',
    severity: 'confirmed',
    reason: 'Tor exit — same chain used in case #2026-02-04-B. Permanent block per Compliance.',
    addedBy: SUPER_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(75),
    affectedCount: 0,
    loginAttemptsBlocked30d: 89,
  },
  {
    id: nextId(),
    type: 'ip',
    identifier: '162.158.41.99',
    severity: 'confirmed',
    reason: 'Cloudflare-fronted scraper hitting /api/recipients/search — 4,200 RPS over 3h. Block per Engineering.',
    addedBy: FINANCE_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(22),
    affectedCount: 0,
    loginAttemptsBlocked30d: 4200,
  },
  {
    id: nextId(),
    type: 'ip',
    identifier: '45.155.205.233',
    severity: 'confirmed',
    reason: 'Abusive ASN (NiceVPS / "Bulletproof hosting") — confirmed source of 6 confirmed-fraud signups.',
    addedBy: SUPER_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(50),
    affectedCount: 0,
    loginAttemptsBlocked30d: 73,
  },
  {
    id: nextId(),
    type: 'ip',
    identifier: '194.26.229.10',
    severity: 'confirmed',
    reason: 'Bruteforce login attempts against /api/auth/login — 220k tries in 5d, rotated phone numbers each.',
    addedBy: SUPER_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(15),
    affectedCount: 0,
    loginAttemptsBlocked30d: 220000,
  },
  {
    id: nextId(),
    type: 'ip',
    identifier: '141.98.10.45',
    severity: 'confirmed',
    reason: 'Open SOCKS5 proxy on the AbuseIPDB top-50. Repeatedly used to mask origin during card-add attempts.',
    addedBy: FINANCE_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(33),
    affectedCount: 0,
    loginAttemptsBlocked30d: 412,
  },
  {
    id: nextId(),
    type: 'ip',
    identifier: '212.115.99.211',
    severity: 'confirmed',
    reason: 'Confirmed source of OTP-bombing campaign — case #2026-04-09-O.',
    addedBy: SUPER_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(20),
    affectedCount: 0,
    loginAttemptsBlocked30d: 1840,
  },
  {
    id: nextId(),
    type: 'ip',
    identifier: '23.129.64.130',
    severity: 'confirmed',
    reason: 'Tor exit — listed in Spamhaus DROP. No legitimate user flow expected from this address.',
    addedBy: SUPER_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(42),
    affectedCount: 0,
    loginAttemptsBlocked30d: 67,
  },
  {
    id: nextId(),
    type: 'ip',
    identifier: '185.220.102.8',
    severity: 'suspected',
    reason: 'Tor exit — moderate suspicious traffic. Watch-only block, easily lifted if false-positives surface.',
    addedBy: FINANCE_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(11),
    affectedCount: 0,
    loginAttemptsBlocked30d: 18,
  },
  {
    id: nextId(),
    type: 'ip',
    identifier: '198.96.155.3',
    severity: 'confirmed',
    reason: 'Tor exit reused across multiple chargeback cases. Compliance directive 2026-Q1-12.',
    addedBy: SUPER_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(60),
    affectedCount: 0,
    loginAttemptsBlocked30d: 28,
  },
  {
    id: nextId(),
    type: 'ip',
    identifier: '2a03:b0c0:1:d0::42:1',
    severity: 'confirmed',
    reason: 'IPv6 source of repeated synthetic-ID signups via emulator devices. Identified by Engineering 2026-04-18.',
    addedBy: SUPER_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(11),
    affectedCount: 0,
    loginAttemptsBlocked30d: 47,
  },
  {
    id: nextId(),
    type: 'ip',
    identifier: '185.165.190.34',
    severity: 'suspected',
    reason: 'Persistently scraping /api/cards/banks — looking for enumeration weaknesses. Watching before escalating.',
    addedBy: FINANCE_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(6),
    affectedCount: 0,
    loginAttemptsBlocked30d: 0,
  },
);

// ---------------------------------------------------------------------
// Card token — 6 entries (confirmed fraud cards)
// ---------------------------------------------------------------------
_SEED.push(
  {
    id: nextId(),
    type: 'card_token',
    identifier: 'tok_acq_a1b2c302', // matches c_ol_02 (u_01)
    severity: 'confirmed',
    reason: 'Confirmed chargeback case #2026-04-12-A — card used in fraud after compromise. Acquirer requested permanent block.',
    addedBy: SUPER_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(13),
    loginAttemptsBlocked30d: 0,
  },
  {
    id: nextId(),
    type: 'card_token',
    identifier: 'tok_acq_fraud0001',
    severity: 'confirmed',
    reason: 'Card used in 3DS-bypass attempt — same BIN seen in 12 chargebacks last quarter. Acquirer flagged.',
    addedBy: FINANCE_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(28),
    loginAttemptsBlocked30d: 0,
  },
  {
    id: nextId(),
    type: 'card_token',
    identifier: 'tok_acq_fraud0002',
    severity: 'confirmed',
    reason: 'Stolen card report from issuer — token blocked at Compliance request before next attempted use.',
    addedBy: SUPER_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(20),
    loginAttemptsBlocked30d: 0,
  },
  {
    id: nextId(),
    type: 'card_token',
    identifier: 'tok_acq_fraud0003',
    severity: 'confirmed',
    reason: 'Sanctions hit on holder name during periodic re-screening. Card frozen, token added to blacklist for re-add prevention.',
    addedBy: FINANCE_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(45),
    loginAttemptsBlocked30d: 0,
  },
  {
    id: nextId(),
    type: 'card_token',
    identifier: 'tok_acq_fraud0004',
    severity: 'confirmed',
    reason: 'Repeated declined attempts followed by velocity-fraud pattern — confirmed fraud after acquirer dispute.',
    addedBy: SUPER_ADMIN.id,
    expiresAt: null,
    createdAt: daysAgo(8),
    loginAttemptsBlocked30d: 0,
  },
  {
    id: nextId(),
    type: 'card_token',
    identifier: 'tok_acq_fraud0005',
    severity: 'suspected',
    reason: 'Anomalous spending pattern flagged by AML — token soft-blocked while investigation runs.',
    addedBy: FINANCE_ADMIN.id,
    expiresAt: daysAhead(14),
    createdAt: hoursAgo(60),
    loginAttemptsBlocked30d: 0,
  },
);

// =====================================================================
// Live store + read helpers
// =====================================================================

let liveEntries: BlacklistEntry[] = [..._SEED];
let nextSeq = seq + 1; // future inserts won't collide with seed ids

export function listBlacklist(): BlacklistEntry[] {
  return liveEntries.slice();
}

export function listBlacklistByType(type: BlacklistType): BlacklistEntry[] {
  return liveEntries.filter((e) => e.type === type);
}

export function getBlacklistEntry(id: string): BlacklistEntry | undefined {
  return liveEntries.find((e) => e.id === id);
}

export function getBlacklistCounts(): Record<BlacklistType, number> {
  const counts: Record<BlacklistType, number> = {
    phone: 0,
    pinfl: 0,
    device_id: 0,
    ip: 0,
    card_token: 0,
  };
  for (const e of liveEntries) counts[e.type]++;
  return counts;
}

export function isBlacklistEntryActive(e: BlacklistEntry, asOf: Date = new Date()): boolean {
  if (e.expiresAt === null) return true;
  return e.expiresAt.getTime() > asOf.getTime();
}

export function getDistinctBlacklistAdmins(): AdminProfile[] {
  return BLACKLIST_ADMIN_POOL.slice();
}

// =====================================================================
// Pre-add check — does the new identifier match an existing user / card?
// =====================================================================

export interface PreAddMatchUser {
  kind: 'user';
  userId: string;
  name: string;
  phone: string;
  tier: UserListRow['tier'];
  status: UserListRow['status'];
  lastLoginAt: Date | null;
}
export interface PreAddMatchCard {
  kind: 'card';
  cardId: string;
  ownerId: string;
  maskedPan: string;
  bank: string;
  scheme: CardEntry['scheme'];
  status: CardEntry['status'];
}
export type PreAddMatch = PreAddMatchUser | PreAddMatchCard;

export interface PreAddCheckResult {
  /** A normalized identifier the caller can re-display. */
  identifier: string;
  /** A duplicate live blacklist row matching this (type, identifier). */
  duplicate: BlacklistEntry | null;
  /** First match against current data (only for phone / pinfl / card_token). */
  match: PreAddMatch | null;
  /** Hint that the type has no canonical store yet (device_id, ip). */
  noStore: boolean;
}

function normalizePhone(raw: string): string {
  // Collapse whitespace; keep + and digits only.
  return raw.replace(/\s+/g, '').trim();
}
function phonesEqual(a: string, b: string): boolean {
  return normalizePhone(a).replace(/[^\d+]/g, '') === normalizePhone(b).replace(/[^\d+]/g, '');
}

export function preAddCheck(type: BlacklistType, rawIdentifier: string): PreAddCheckResult {
  const identifier = rawIdentifier.trim();
  if (!identifier) {
    return { identifier, duplicate: null, match: null, noStore: false };
  }

  const duplicate =
    liveEntries.find(
      (e) =>
        e.type === type &&
        (type === 'phone'
          ? phonesEqual(e.identifier, identifier)
          : e.identifier.toLowerCase() === identifier.toLowerCase()),
    ) ?? null;

  let match: PreAddMatch | null = null;
  let noStore = false;

  if (type === 'phone') {
    const u = listUsers().find((row) => phonesEqual(row.phone, identifier));
    if (u) {
      match = {
        kind: 'user',
        userId: u.id,
        name: u.name,
        phone: u.phone,
        tier: u.tier,
        status: u.status,
        lastLoginAt: u.lastLoginAt,
      };
    }
  } else if (type === 'pinfl') {
    const u = listUsers().find((row) => row.pinfl === identifier);
    if (u) {
      match = {
        kind: 'user',
        userId: u.id,
        name: u.name,
        phone: u.phone,
        tier: u.tier,
        status: u.status,
        lastLoginAt: u.lastLoginAt,
      };
    }
  } else if (type === 'card_token') {
    const c = listCards().find((row) => row.token === identifier);
    if (c) {
      match = {
        kind: 'card',
        cardId: c.id,
        ownerId: c.userId,
        maskedPan: c.maskedPan,
        bank: c.bank,
        scheme: c.scheme,
        status: c.status,
      };
    }
  } else {
    noStore = true;
  }

  return { identifier, duplicate, match, noStore };
}

// =====================================================================
// Audit log — append-only
// =====================================================================

export type BlacklistAuditAction =
  | 'add'
  | 'edit_reason'
  | 'extend_expiry'
  | 'hard_delete';

export interface BlacklistAuditEntry {
  id: string;
  entryId: string;
  action: BlacklistAuditAction;
  actorId: string;
  actorName: string;
  reason: string;
  /** Optional snapshot for reads after the row is hard-deleted. */
  snapshot?: {
    type: BlacklistType;
    identifier: string;
    severity: BlacklistSeverity;
  };
  context?: Record<string, unknown>;
  createdAt: Date;
}

const blacklistAudit: BlacklistAuditEntry[] = [];
let blacklistAuditSeq = 1;

function appendBlacklistAudit(
  entry: Omit<BlacklistAuditEntry, 'id' | 'createdAt'>,
): BlacklistAuditEntry {
  const e: BlacklistAuditEntry = {
    ...entry,
    id: `blaud_${String(blacklistAuditSeq++).padStart(4, '0')}`,
    createdAt: new Date(),
  };
  blacklistAudit.push(e);
  return e;
}

export function getBlacklistAuditForEntry(entryId: string): BlacklistAuditEntry[] {
  return blacklistAudit.filter((e) => e.entryId === entryId).slice().reverse();
}

/** Bridge for the central audit-log surface — full module store, newest first. */
export function listBlacklistAudit(): BlacklistAuditEntry[] {
  return blacklistAudit.slice().reverse();
}

// =====================================================================
// Mutators
// =====================================================================

export interface BlacklistActor {
  id: string;
  name: string;
}

export interface AddBlacklistInput {
  type: BlacklistType;
  identifier: string;
  severity: BlacklistSeverity;
  reason: string;
  expiresAt: Date | null;
  actor: BlacklistActor;
}

export function addBlacklistEntry(input: AddBlacklistInput): BlacklistEntry {
  const newRow: BlacklistEntry = {
    id: `bl_${String(nextSeq++).padStart(4, '0')}`,
    type: input.type,
    identifier: input.identifier.trim(),
    severity: input.severity,
    reason: input.reason,
    addedBy: input.actor.id,
    expiresAt: input.expiresAt,
    createdAt: new Date(),
  };
  liveEntries = [...liveEntries, newRow];
  appendBlacklistAudit({
    entryId: newRow.id,
    action: 'add',
    actorId: input.actor.id,
    actorName: input.actor.name,
    reason: input.reason,
    snapshot: { type: newRow.type, identifier: newRow.identifier, severity: newRow.severity },
    context: {
      type: newRow.type,
      identifier: newRow.identifier,
      severity: newRow.severity,
      expires_at: newRow.expiresAt ? newRow.expiresAt.toISOString() : null,
    },
  });
  return newRow;
}

export interface EditReasonInput {
  entryId: string;
  newReason: string;
  /** Why this reason was changed — landed in the audit-log entry. */
  changeNote: string;
  actor: BlacklistActor;
}

export function editBlacklistReason(input: EditReasonInput): BlacklistEntry | null {
  const existing = liveEntries.find((e) => e.id === input.entryId);
  if (!existing) return null;
  const previous = existing.reason;
  existing.reason = input.newReason;
  appendBlacklistAudit({
    entryId: existing.id,
    action: 'edit_reason',
    actorId: input.actor.id,
    actorName: input.actor.name,
    reason: input.changeNote,
    snapshot: { type: existing.type, identifier: existing.identifier, severity: existing.severity },
    context: {
      previous_reason: previous,
      new_reason: input.newReason,
    },
  });
  return existing;
}

export interface ExtendExpiryInput {
  entryId: string;
  newExpiresAt: Date | null;
  actor: BlacklistActor;
}

export function extendBlacklistExpiry(input: ExtendExpiryInput): BlacklistEntry | null {
  const existing = liveEntries.find((e) => e.id === input.entryId);
  if (!existing) return null;
  const previous = existing.expiresAt;
  existing.expiresAt = input.newExpiresAt;
  appendBlacklistAudit({
    entryId: existing.id,
    action: 'extend_expiry',
    actorId: input.actor.id,
    actorName: input.actor.name,
    reason: '',
    snapshot: { type: existing.type, identifier: existing.identifier, severity: existing.severity },
    context: {
      previous_expires_at: previous ? previous.toISOString() : null,
      new_expires_at: input.newExpiresAt ? input.newExpiresAt.toISOString() : null,
    },
  });
  return existing;
}

export interface RemoveEntryInput {
  entryId: string;
  reason: string;
  actor: BlacklistActor;
}

export function removeBlacklistEntry(input: RemoveEntryInput): BlacklistEntry | null {
  const existing = liveEntries.find((e) => e.id === input.entryId);
  if (!existing) return null;
  liveEntries = liveEntries.filter((e) => e.id !== input.entryId);
  appendBlacklistAudit({
    entryId: existing.id,
    action: 'hard_delete',
    actorId: input.actor.id,
    actorName: input.actor.name,
    reason: input.reason,
    snapshot: { type: existing.type, identifier: existing.identifier, severity: existing.severity },
    context: {
      type: existing.type,
      identifier: existing.identifier,
      severity: existing.severity,
      expires_at: existing.expiresAt ? existing.expiresAt.toISOString() : null,
    },
  });
  return existing;
}

// =====================================================================
// "Currently affecting" derivation
// =====================================================================

export interface AffectedSummary {
  /** Total currently-blocked entities by this entry. */
  total: number;
  /** Linked user (only for phone / pinfl matches against the user pool). */
  user: PreAddMatchUser | null;
  /** Linked card (only for card_token matches against the card pool). */
  card: PreAddMatchCard | null;
}

export function getAffectedSummary(entry: BlacklistEntry): AffectedSummary {
  if (entry.type === 'phone' || entry.type === 'pinfl' || entry.type === 'card_token') {
    const r = preAddCheck(entry.type, entry.identifier);
    if (r.match?.kind === 'user') {
      return { total: 1, user: r.match, card: null };
    }
    if (r.match?.kind === 'card') {
      return { total: 1, user: null, card: r.match };
    }
    return { total: 0, user: null, card: null };
  }
  // device_id / ip — no canonical store; fall back to the seeded affectedCount.
  return { total: entry.affectedCount ?? 0, user: null, card: null };
}
