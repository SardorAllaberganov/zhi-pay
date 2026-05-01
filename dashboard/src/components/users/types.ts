import type {
  UserKycStatus,
  UserListRow,
  UserStatus,
  UserTier,
} from '@/data/mockUsers';

export type UsersCreatedRange = 'today' | '7d' | '30d' | 'custom' | 'all';

export type UsersSortKey = 'created' | 'last-login' | 'volume';
export type UsersSortDir = 'asc' | 'desc';

export interface UsersSort {
  key: UsersSortKey;
  dir: UsersSortDir;
}

export interface UsersFilters {
  search: string;
  tiers: UserTier[];
  statuses: UserStatus[];
  kycStatuses: UserKycStatus[];
  hasOpenAml: boolean;
  createdRange: UsersCreatedRange;
  customCreatedFrom?: Date;
  customCreatedTo?: Date;
}

export const DEFAULT_USERS_FILTERS: UsersFilters = {
  search: '',
  tiers: [],
  statuses: [],
  kycStatuses: [],
  hasOpenAml: false,
  createdRange: 'all',
};

export const DEFAULT_USERS_SORT: UsersSort = { key: 'created', dir: 'desc' };

export function countActiveUsersFilters(f: UsersFilters): number {
  let n = 0;
  if (f.tiers.length > 0) n++;
  if (f.statuses.length > 0) n++;
  if (f.kycStatuses.length > 0) n++;
  if (f.hasOpenAml) n++;
  if (f.createdRange !== 'all') n++;
  return n;
}

export function isUsersFiltersActive(f: UsersFilters): boolean {
  return countActiveUsersFilters(f) > 0 || f.search.trim().length > 0;
}

// =====================================================================
// Filter / sort helpers
// =====================================================================

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function createdInRange(createdAt: Date, range: UsersCreatedRange, custom: { from?: Date; to?: Date }, now: Date): boolean {
  if (range === 'all') return true;
  if (range === 'today') {
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    return createdAt.getTime() >= startOfDay.getTime();
  }
  if (range === '7d') return now.getTime() - createdAt.getTime() <= 7 * ONE_DAY_MS;
  if (range === '30d') return now.getTime() - createdAt.getTime() <= 30 * ONE_DAY_MS;
  if (range === 'custom') {
    if (custom.from && createdAt.getTime() < custom.from.getTime()) return false;
    if (custom.to && createdAt.getTime() > custom.to.getTime() + ONE_DAY_MS - 1) return false;
    return true;
  }
  return true;
}

export function applyUsersFilters(
  list: UserListRow[],
  filters: UsersFilters,
  now: Date = new Date(),
): UserListRow[] {
  const q = filters.search.trim().toLowerCase().replace(/\s+/g, '');
  return list.filter((u) => {
    if (q.length > 0) {
      const haystack = [
        u.name.toLowerCase(),
        u.phone.toLowerCase().replace(/\s+/g, ''),
        (u.pinfl ?? '').toLowerCase(),
        (u.email ?? '').toLowerCase(),
      ];
      if (!haystack.some((h) => h.includes(q))) return false;
    }
    if (filters.tiers.length > 0 && !filters.tiers.includes(u.tier)) return false;
    if (filters.statuses.length > 0 && !filters.statuses.includes(u.status)) return false;
    if (filters.kycStatuses.length > 0 && !filters.kycStatuses.includes(u.kycStatus)) return false;
    if (filters.hasOpenAml && !u.hasOpenAmlFlag) return false;
    if (!createdInRange(u.createdAt, filters.createdRange, { from: filters.customCreatedFrom, to: filters.customCreatedTo }, now)) return false;
    return true;
  });
}

export function applyUsersSort(list: UserListRow[], sort: UsersSort): UserListRow[] {
  const sorted = list.slice();
  const direction = sort.dir === 'asc' ? 1 : -1;
  sorted.sort((a, b) => {
    if (sort.key === 'created') {
      return direction * (a.createdAt.getTime() - b.createdAt.getTime());
    }
    if (sort.key === 'last-login') {
      const aT = a.lastLoginAt?.getTime() ?? 0;
      const bT = b.lastLoginAt?.getTime() ?? 0;
      return direction * (aT - bT);
    }
    // volume
    const aV = a.lifetimeVolumeUzsTiyins;
    const bV = b.lifetimeVolumeUzsTiyins;
    if (aV === bV) return 0;
    return aV < bV ? -direction : direction;
  });
  return sorted;
}
