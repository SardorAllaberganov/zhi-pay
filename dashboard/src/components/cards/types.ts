/**
 * Filter / sort types + helpers for the cross-user Cards list page.
 *
 * Default status filter is `[active, frozen]` per spec — expired and
 * removed are off by default since reviewers care about the live cards.
 *
 * "Last used" filter uses the canonical `DateRangePicker` primitive.
 * `lastUsedRange` is optional — undefined means no date filter applied.
 * `lastUsedNeverOnly` is an orthogonal toggle for cards that have never
 * been used (lastUsedAt === null), since `null` is not expressible as a
 * date range.
 */

import {
  resolveDateRange,
  type DateRangeValue,
} from '@/components/zhipay/DateRangePicker';
import type {
  CardEntry,
  CardScheme,
  CardStatus,
} from '@/data/mockCards';

export type CardsSortKey = 'created' | 'last-used' | 'expiry';
export type CardsSortDir = 'asc' | 'desc';

export interface CardsSort {
  key: CardsSortKey;
  dir: CardsSortDir;
}

export interface CardsFilters {
  search: string;
  schemes: CardScheme[];
  statuses: CardStatus[];
  banks: string[];
  countries: string[];
  defaultOnly: boolean;
  /** When set, only cards whose `lastUsedAt` falls in the range pass. */
  lastUsedRange?: DateRangeValue;
  /** Orthogonal toggle for cards that have never been used. */
  lastUsedNeverOnly: boolean;
}

export const DEFAULT_CARDS_FILTERS: CardsFilters = {
  search: '',
  schemes: [],
  statuses: ['active', 'frozen'],
  banks: [],
  countries: [],
  defaultOnly: false,
  lastUsedRange: undefined,
  lastUsedNeverOnly: false,
};

/** Default range when the picker is first opened from an inactive state. */
export const DEFAULT_LAST_USED_RANGE: DateRangeValue = { range: '30d' };

export const DEFAULT_CARDS_SORT: CardsSort = { key: 'created', dir: 'desc' };

const _DEFAULT_STATUS_SET = new Set<CardStatus>(['active', 'frozen']);

function statusesAreDefault(s: CardStatus[]): boolean {
  if (s.length !== _DEFAULT_STATUS_SET.size) return false;
  return s.every((x) => _DEFAULT_STATUS_SET.has(x));
}

export function countActiveCardsFilters(f: CardsFilters): number {
  let n = 0;
  if (f.schemes.length > 0) n++;
  if (!statusesAreDefault(f.statuses)) n++;
  if (f.banks.length > 0) n++;
  if (f.countries.length > 0) n++;
  if (f.defaultOnly) n++;
  if (f.lastUsedRange !== undefined) n++;
  if (f.lastUsedNeverOnly) n++;
  return n;
}

export function isCardsFiltersActive(f: CardsFilters): boolean {
  return countActiveCardsFilters(f) > 0 || f.search.trim().length > 0;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function lastUsedInRange(
  card: CardEntry,
  value: DateRangeValue,
): boolean {
  if (!card.lastUsedAt) return false;
  const resolved = resolveDateRange(value);
  if (!resolved?.from) return true;
  const ts = card.lastUsedAt.getTime();
  const fromTs = resolved.from.getTime();
  const toBase = (resolved.to ?? resolved.from).getTime();
  // End-of-day inclusive on the upper bound so e.g. selecting "today"
  // matches anything used between 00:00 and 23:59:59 today.
  const toTs = toBase + ONE_DAY_MS - 1;
  return ts >= fromTs && ts <= toTs;
}

export function applyCardsFilters(
  list: CardEntry[],
  filters: CardsFilters,
  ownerLookup: (userId: string) => { phone?: string; name?: string } | undefined,
): CardEntry[] {
  const q = filters.search.trim().toLowerCase().replace(/\s+/g, '');
  return list.filter((c) => {
    if (filters.schemes.length > 0 && !filters.schemes.includes(c.scheme)) return false;
    if (filters.statuses.length > 0 && !filters.statuses.includes(c.status)) return false;
    if (filters.banks.length > 0 && !filters.banks.includes(c.bank)) return false;
    if (filters.countries.length > 0 && !filters.countries.includes(c.issuerCountry)) return false;
    if (filters.defaultOnly && !c.isDefault) return false;
    if (filters.lastUsedNeverOnly && c.lastUsedAt !== null) return false;
    if (filters.lastUsedRange !== undefined && !lastUsedInRange(c, filters.lastUsedRange)) return false;
    if (q.length > 0) {
      const owner = ownerLookup(c.userId);
      const haystack = [
        c.maskedPan.toLowerCase(),
        c.bank.toLowerCase(),
        c.holderName.toLowerCase(),
        c.id.toLowerCase(),
        c.token.toLowerCase(),
        owner?.phone?.toLowerCase().replace(/\s+/g, '') ?? '',
        owner?.name?.toLowerCase() ?? '',
      ];
      if (!haystack.some((h) => h.includes(q))) return false;
    }
    return true;
  });
}

export function applyCardsSort(list: CardEntry[], sort: CardsSort): CardEntry[] {
  const sorted = list.slice();
  const direction = sort.dir === 'asc' ? 1 : -1;
  sorted.sort((a, b) => {
    if (sort.key === 'created') {
      return direction * (a.createdAt.getTime() - b.createdAt.getTime());
    }
    if (sort.key === 'last-used') {
      const aT = a.lastUsedAt?.getTime() ?? 0;
      const bT = b.lastUsedAt?.getTime() ?? 0;
      return direction * (aT - bT);
    }
    // expiry — sort by year+month (numeric)
    const aV = a.expiryYear * 100 + a.expiryMonth;
    const bV = b.expiryYear * 100 + b.expiryMonth;
    return direction * (aV - bV);
  });
  return sorted;
}
