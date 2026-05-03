import type {
  CardScheme,
  Destination,
  KycTier,
  Transfer,
  TransferStatus,
} from '@/types';
import { USERS } from '@/data/mock';

export type RangeKey = 'today' | 'yesterday' | '7d' | '30d' | 'custom';

export interface TransferFilters {
  search: string;
  statuses: Set<TransferStatus>;
  range: RangeKey;
  customFrom?: Date;
  customTo?: Date;
  destinations: Set<Destination>;
  schemes: Set<CardScheme>;
  /** Amount in tiyins (smallest UZS unit). undefined = no bound. */
  amountMinTiyins?: bigint;
  amountMaxTiyins?: bigint;
  tiers: Set<KycTier>;
  hasAml: boolean;
  hasFailure: boolean;
  /**
   * Literal `failure_code` match — seeded from `?failure_code=` URL
   * param when the user lands here from Error Codes' "View transfers
   * that failed with this code →" link. Cleared via the dismissable
   * banner at the top of the list page; not exposed as a chip-row
   * filter (kept off-keyboard since it's a deep-link only).
   */
  failureCode?: string;
}

/**
 * Build a fresh `TransferFilters` instance — every Set is a new object so
 * resets and applies don't accidentally share Set references between the
 * live state, the cached snapshot, and saved-filter entries.
 */
export function makeEmptyFilters(): TransferFilters {
  return {
    search: '',
    statuses: new Set(),
    range: '30d',
    destinations: new Set(),
    schemes: new Set(),
    tiers: new Set(),
    hasAml: false,
    hasFailure: false,
  };
}

export const EMPTY_FILTERS: TransferFilters = makeEmptyFilters();

export type SortKey = 'createdAt' | 'amountUzs' | 'amountCny';
export type SortDir = 'asc' | 'desc';

export interface SortState {
  key: SortKey;
  dir: SortDir;
}

const NOW = new Date('2026-04-29T10:30:00Z');
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function rangeWindow(range: RangeKey, from?: Date, to?: Date): [Date, Date] | null {
  const end = NOW;
  if (range === 'today') {
    const startOfToday = new Date(end);
    startOfToday.setUTCHours(0, 0, 0, 0);
    return [startOfToday, end];
  }
  if (range === 'yesterday') {
    const startOfYesterday = new Date(end.getTime() - ONE_DAY_MS);
    startOfYesterday.setUTCHours(0, 0, 0, 0);
    const endOfYesterday = new Date(startOfYesterday.getTime() + ONE_DAY_MS - 1);
    return [startOfYesterday, endOfYesterday];
  }
  if (range === '7d') return [new Date(end.getTime() - 7 * ONE_DAY_MS), end];
  if (range === '30d') return [new Date(end.getTime() - 30 * ONE_DAY_MS), end];
  if (range === 'custom') {
    if (!from || !to) return null;
    return [from, to];
  }
  return null;
}

const userTier = new Map(USERS.map((u) => [u.id, u.kycTier] as const));

/**
 * Apply the filter set to a transfer list. Pure function — safe to memoize.
 * Sort is intentionally NOT applied here (page owns sort state separately).
 */
export function applyFilters(
  transfers: Transfer[],
  filters: TransferFilters,
  hasAmlByTransferId: (id: string) => boolean,
): Transfer[] {
  const search = filters.search.trim().toLowerCase();
  const window = rangeWindow(filters.range, filters.customFrom, filters.customTo);

  return transfers.filter((t) => {
    if (filters.statuses.size > 0 && !filters.statuses.has(t.status)) return false;
    if (filters.destinations.size > 0 && !filters.destinations.has(t.destination)) return false;
    if (filters.schemes.size > 0 && !filters.schemes.has(t.cardScheme)) return false;

    if (window) {
      const ts = t.createdAt.getTime();
      if (ts < window[0].getTime() || ts > window[1].getTime()) return false;
    }

    if (filters.amountMinTiyins !== undefined && t.amountUzs < filters.amountMinTiyins) {
      return false;
    }
    if (filters.amountMaxTiyins !== undefined && t.amountUzs > filters.amountMaxTiyins) {
      return false;
    }

    if (filters.tiers.size > 0) {
      const tier = userTier.get(t.userId);
      if (!tier || !filters.tiers.has(tier)) return false;
    }

    if (filters.hasFailure && !t.failureCode) return false;
    if (filters.failureCode && t.failureCode !== filters.failureCode) return false;
    if (filters.hasAml && !hasAmlByTransferId(t.id)) return false;

    if (search) {
      const haystack = [
        t.id,
        t.userPhone,
        t.cardMaskedPan,
        t.recipientIdentifier,
        t.userName,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    return true;
  });
}

export function sortTransfers(transfers: Transfer[], sort: SortState): Transfer[] {
  const dirMul = sort.dir === 'desc' ? -1 : 1;
  return [...transfers].sort((a, b) => {
    if (sort.key === 'createdAt') {
      return (a.createdAt.getTime() - b.createdAt.getTime()) * dirMul;
    }
    if (sort.key === 'amountUzs') {
      return Number(a.amountUzs - b.amountUzs) * dirMul;
    }
    return Number(a.amountCny - b.amountCny) * dirMul;
  });
}

export function countActiveFilters(f: TransferFilters): number {
  let n = 0;
  if (f.search.trim()) n++;
  if (f.statuses.size > 0) n++;
  if (f.range !== '30d') n++;
  if (f.destinations.size > 0) n++;
  if (f.schemes.size > 0) n++;
  if (f.amountMinTiyins !== undefined || f.amountMaxTiyins !== undefined) n++;
  if (f.tiers.size > 0) n++;
  if (f.hasAml) n++;
  if (f.hasFailure) n++;
  if (f.failureCode) n++;
  return n;
}
