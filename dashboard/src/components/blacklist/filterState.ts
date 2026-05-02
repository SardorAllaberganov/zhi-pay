/**
 * Module-level filter / sort / page cache, keyed per BlacklistType so the
 * Tabs primitive can switch between five tabs without losing each tab's
 * filter state. Also caches focused-row index for j/k pager UX.
 */

import type { BlacklistType } from '@/data/mockBlacklist';
import {
  DEFAULT_FILTER,
  DEFAULT_SORT,
  type BlacklistFilterState,
  type BlacklistSort,
} from './types';

interface PerTabState {
  filter: BlacklistFilterState;
  sort: BlacklistSort;
  focusedIndex: number;
  visibleIds: string[];
}

const _cache: Record<BlacklistType, PerTabState> = {
  phone: emptyState(),
  pinfl: emptyState(),
  device_id: emptyState(),
  ip: emptyState(),
  card_token: emptyState(),
};

function emptyState(): PerTabState {
  return {
    filter: { ...DEFAULT_FILTER, addedBy: [], createdRange: null },
    sort: { ...DEFAULT_SORT },
    focusedIndex: -1,
    visibleIds: [],
  };
}

export function getTabState(type: BlacklistType): PerTabState {
  return _cache[type];
}

export function setTabFilter(type: BlacklistType, filter: BlacklistFilterState) {
  _cache[type].filter = filter;
}
export function setTabSort(type: BlacklistType, sort: BlacklistSort) {
  _cache[type].sort = sort;
}
export function setTabFocusedIndex(type: BlacklistType, index: number) {
  _cache[type].focusedIndex = index;
}
export function setTabVisibleIds(type: BlacklistType, ids: string[]) {
  _cache[type].visibleIds = ids;
}
