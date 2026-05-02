import {
  isBlacklistEntryActive,
  type BlacklistEntry,
  type BlacklistType,
} from '@/data/mockBlacklist';
import {
  resolveDateRange,
  type DateRangeValue,
} from '@/components/zhipay/DateRangePicker';

export type BlacklistStatusFilter = 'active' | 'expired';
export type BlacklistSortField = 'createdAt' | 'expiresAt';

/** `null` = no created-range filter applied. */
export type DateRangeFilter = DateRangeValue | null;

export interface BlacklistFilterState {
  search: string;
  status: BlacklistStatusFilter;
  addedBy: string[];
  createdRange: DateRangeFilter;
}

export const DEFAULT_FILTER: BlacklistFilterState = {
  search: '',
  status: 'active',
  addedBy: [],
  createdRange: null,
};

export interface BlacklistSort {
  field: BlacklistSortField;
  dir: 'asc' | 'desc';
}

export const DEFAULT_SORT: BlacklistSort = { field: 'createdAt', dir: 'desc' };

export function applyFilters(
  rows: BlacklistEntry[],
  filter: BlacklistFilterState,
  asOf: Date = new Date(),
): BlacklistEntry[] {
  const search = filter.search.trim().toLowerCase();
  return rows.filter((row) => {
    const active = isBlacklistEntryActive(row, asOf);
    if (filter.status === 'active' && !active) return false;
    if (filter.status === 'expired' && active) return false;

    if (filter.addedBy.length > 0 && !filter.addedBy.includes(row.addedBy)) return false;

    if (filter.createdRange) {
      const resolved = resolveDateRange(filter.createdRange);
      if (resolved) {
        const from = resolved.from;
        const to = resolved.to ? new Date(resolved.to.getFullYear(), resolved.to.getMonth(), resolved.to.getDate(), 23, 59, 59, 999) : undefined;
        if (from && row.createdAt < from) return false;
        if (to && row.createdAt > to) return false;
      }
    }

    if (search.length > 0) {
      const hay = `${row.identifier} ${row.reason}`.toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
}

export function applySort(
  rows: BlacklistEntry[],
  sort: BlacklistSort,
): BlacklistEntry[] {
  const sorted = rows.slice();
  sorted.sort((a, b) => {
    const av = sort.field === 'createdAt' ? a.createdAt.getTime() : a.expiresAt?.getTime() ?? Infinity;
    const bv = sort.field === 'createdAt' ? b.createdAt.getTime() : b.expiresAt?.getTime() ?? Infinity;
    return sort.dir === 'asc' ? av - bv : bv - av;
  });
  return sorted;
}

export function countActiveBlacklistFilters(state: BlacklistFilterState): number {
  let n = 0;
  if (state.search.trim() !== '') n++;
  if (state.status !== DEFAULT_FILTER.status) n++;
  if (state.addedBy.length > 0) n++;
  if (state.createdRange !== null) n++;
  return n;
}

// =====================================================================
// Per-type identifier masking — privacy rules per spec
// =====================================================================

export function maskIdentifier(type: BlacklistType, raw: string): string {
  switch (type) {
    case 'phone':
      // Already formatted upstream; show as-is.
      return raw;
    case 'pinfl': {
      // Last 4 visible — pad with • bullets.
      const last4 = raw.slice(-4);
      return `••••••••••${last4}`;
    }
    case 'device_id': {
      // Last 6 of fingerprint, padded with bullets to 12 chars.
      const last6 = raw.slice(-6);
      return `••••••${last6}`;
    }
    case 'ip':
      // Full address visible.
      return raw;
    case 'card_token': {
      // Last 8 visible.
      const last8 = raw.slice(-8);
      return `••••${last8}`;
    }
  }
}
