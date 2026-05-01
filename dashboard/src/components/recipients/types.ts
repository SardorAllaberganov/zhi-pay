/**
 * Filter / sort types + helpers for the cross-user Recipients list page.
 *
 * "Last used" filter uses the canonical `<DateRangePicker>` primitive +
 * an orthogonal `lastUsedNeverOnly` toggle, mirroring the Cards page
 * (LESSONS 2026-05-02: bucketed dropdowns were retired in favor of the
 * shared DateRangePicker).
 *
 * Default sort is `created` DESC per the Phase-8 spec.
 */

import {
  resolveDateRange,
  type DateRangeValue,
} from '@/components/zhipay/DateRangePicker';
import type {
  RecipientDestination,
  RecipientEntry,
} from '@/data/mockRecipients';

export type RecipientsSortKey = 'created' | 'last-used' | 'transfer-count';
export type RecipientsSortDir = 'asc' | 'desc';

export interface RecipientsSort {
  key: RecipientsSortKey;
  dir: RecipientsSortDir;
}

export interface RecipientsFilters {
  search: string;
  destinations: RecipientDestination[];
  favoritesOnly: boolean;
  /** When set, only recipients whose `lastUsedAt` falls in the range pass. */
  lastUsedRange?: DateRangeValue;
  /** Orthogonal toggle for recipients that have never been used. */
  lastUsedNeverOnly: boolean;
}

export const DEFAULT_RECIPIENTS_FILTERS: RecipientsFilters = {
  search: '',
  destinations: [],
  favoritesOnly: false,
  lastUsedRange: undefined,
  lastUsedNeverOnly: false,
};

export const DEFAULT_LAST_USED_RANGE: DateRangeValue = { range: '30d' };

export const DEFAULT_RECIPIENTS_SORT: RecipientsSort = {
  key: 'created',
  dir: 'desc',
};

export function countActiveRecipientsFilters(f: RecipientsFilters): number {
  let n = 0;
  if (f.destinations.length > 0) n++;
  if (f.favoritesOnly) n++;
  if (f.lastUsedRange !== undefined) n++;
  if (f.lastUsedNeverOnly) n++;
  return n;
}

export function isRecipientsFiltersActive(f: RecipientsFilters): boolean {
  return countActiveRecipientsFilters(f) > 0 || f.search.trim().length > 0;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function lastUsedInRange(r: RecipientEntry, value: DateRangeValue): boolean {
  const resolved = resolveDateRange(value);
  if (!resolved?.from) return true;
  const ts = r.lastUsedAt.getTime();
  const fromTs = resolved.from.getTime();
  const toBase = (resolved.to ?? resolved.from).getTime();
  // End-of-day inclusive on the upper bound.
  const toTs = toBase + ONE_DAY_MS - 1;
  return ts >= fromTs && ts <= toTs;
}

export function applyRecipientsFilters(
  list: RecipientEntry[],
  filters: RecipientsFilters,
  ownerLookup: (userId: string) => { phone?: string; name?: string } | undefined,
): RecipientEntry[] {
  const q = filters.search.trim().toLowerCase().replace(/\s+/g, '');
  return list.filter((r) => {
    if (filters.destinations.length > 0 && !filters.destinations.includes(r.destination)) return false;
    if (filters.favoritesOnly && !r.isFavorite) return false;
    if (filters.lastUsedNeverOnly) return false; // recipients always have a last-used date in mock
    if (filters.lastUsedRange !== undefined && !lastUsedInRange(r, filters.lastUsedRange)) return false;
    if (q.length > 0) {
      const owner = ownerLookup(r.userId);
      const haystack = [
        r.identifier.toLowerCase().replace(/\s+/g, ''),
        r.displayName.toLowerCase(),
        r.nickname?.toLowerCase() ?? '',
        r.id.toLowerCase(),
        owner?.phone?.toLowerCase().replace(/\s+/g, '') ?? '',
        owner?.name?.toLowerCase() ?? '',
      ];
      if (!haystack.some((h) => h.includes(q))) return false;
    }
    return true;
  });
}

export function applyRecipientsSort(
  list: RecipientEntry[],
  sort: RecipientsSort,
): RecipientEntry[] {
  const sorted = list.slice();
  const direction = sort.dir === 'asc' ? 1 : -1;
  sorted.sort((a, b) => {
    if (sort.key === 'created') {
      return direction * (a.createdAt.getTime() - b.createdAt.getTime());
    }
    if (sort.key === 'last-used') {
      return direction * (a.lastUsedAt.getTime() - b.lastUsedAt.getTime());
    }
    // transfer-count
    return direction * (a.transferCount - b.transferCount);
  });
  return sorted;
}
