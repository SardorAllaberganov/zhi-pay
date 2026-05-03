/**
 * Pure-function audience estimation against the live `mockUsers` seed.
 *
 * Mirrors what a real backend `COUNT(...)` query would compute, but operates
 * over the in-memory `UserListRow[]` so the composer's "Estimated audience"
 * line updates synchronously as criteria change. A real production backend
 * would issue a count query against the users index — the function shape
 * (criteria-in, count-out) translates 1:1.
 *
 * Active-user requirement: `tier_0` users with `status='deleted'` are
 * excluded from broadcasts even when no tier filter is set, matching the
 * mobile-side push-eligibility rule (only active accounts receive pushes).
 */

import { listUsers, type UserListRow } from '@/data/mockUsers';
import type { LastLoginBucket, SegmentCriteria } from './types';

const NOW = new Date('2026-04-29T10:30:00Z');
const DAY_MS = 24 * 60 * 60 * 1000;

function isPushEligible(u: UserListRow): boolean {
  return u.status === 'active';
}

function matchesLastLogin(u: UserListRow, bucket: LastLoginBucket): boolean {
  const last = u.lastLoginAt;
  switch (bucket) {
    case 'never':
      return last === null;
    case 'lt7d':
      return last !== null && NOW.getTime() - last.getTime() < 7 * DAY_MS;
    case 'lt30d':
      return last !== null && NOW.getTime() - last.getTime() < 30 * DAY_MS;
    case 'gt30d':
      return last !== null && NOW.getTime() - last.getTime() > 30 * DAY_MS;
  }
}

export function userMatchesCriteria(u: UserListRow, c: SegmentCriteria): boolean {
  if (!isPushEligible(u)) return false;
  if (c.tiers.length > 0 && !c.tiers.includes(u.tier)) return false;
  if (c.languages.length > 0 && !c.languages.includes(u.preferredLanguage)) return false;
  if (c.hasLinkedCard !== null) {
    const has = u.linkedCardsCount > 0;
    if (has !== c.hasLinkedCard) return false;
  }
  if (c.hasCompletedTransfer !== null) {
    const has = u.lifetimeTransferCount > 0;
    if (has !== c.hasCompletedTransfer) return false;
  }
  if (c.lastLogin !== null && !matchesLastLogin(u, c.lastLogin)) return false;
  return true;
}

/** Total broadcast audience (every active user, regardless of criteria). */
export function broadcastAudienceCount(): number {
  return listUsers().filter(isPushEligible).length;
}

/** Count users matching the given segment criteria (active-only). */
export function estimateAudience(c: SegmentCriteria): number {
  return listUsers().filter((u) => userMatchesCriteria(u, c)).length;
}

/**
 * Return the language breakdown of the audience set — used by the Sent
 * Detail "Recipient breakdown by language" stacked bar.
 */
export function audienceLanguageBreakdown(
  c: SegmentCriteria,
): { uz: number; ru: number; en: number; total: number } {
  const matched = listUsers().filter((u) => userMatchesCriteria(u, c));
  const counts = { uz: 0, ru: 0, en: 0 };
  for (const u of matched) counts[u.preferredLanguage] += 1;
  return { ...counts, total: matched.length };
}

/** Same as `audienceLanguageBreakdown` but for a full broadcast (no criteria). */
export function broadcastLanguageBreakdown(): { uz: number; ru: number; en: number; total: number } {
  const active = listUsers().filter(isPushEligible);
  const counts = { uz: 0, ru: 0, en: 0 };
  for (const u of active) counts[u.preferredLanguage] += 1;
  return { ...counts, total: active.length };
}

/**
 * Search helper for the single-user picker. Matches against name (case-
 * insensitive) and phone (loose digit-only match — strips spaces, +, etc.).
 * Caps results at 8 so the dropdown stays scannable.
 */
export function searchUsersForPicker(query: string, limit = 8): UserListRow[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];
  const digits = q.replace(/[^\d]/g, '');
  const eligible = listUsers().filter(isPushEligible);
  const matches = eligible.filter((u) => {
    if (u.name.toLowerCase().includes(q)) return true;
    if (digits.length > 0) {
      const userDigits = u.phone.replace(/[^\d]/g, '');
      if (userDigits.includes(digits)) return true;
    }
    return false;
  });
  return matches.slice(0, limit);
}
