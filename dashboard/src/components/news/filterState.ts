/**
 * Module-level UI cache for the News list page. Persists filter + sort +
 * focused-row across remounts so deep-link round-trips (Audit Log → News →
 * back) restore state. Mirrors the precedent set by Stories / AuditLog /
 * Error Codes / App Versions filterState modules.
 */

import { EMPTY_FILTERS, DEFAULT_SORT, type NewsFilters, type NewsSort } from './types';

interface NewsListFilterState {
  filters: NewsFilters;
  sort: NewsSort;
  focusedId: string | null;
}

const state: NewsListFilterState = {
  filters: { ...EMPTY_FILTERS, dateRange: { ...EMPTY_FILTERS.dateRange } },
  sort: { ...DEFAULT_SORT },
  focusedId: null,
};

export function getFilterState(): NewsListFilterState {
  return {
    filters: {
      ...state.filters,
      statuses: [...state.filters.statuses],
      dateRange: { ...state.filters.dateRange },
    },
    sort: { ...state.sort },
    focusedId: state.focusedId,
  };
}

export function setFilters(next: NewsFilters) {
  state.filters = {
    ...next,
    statuses: [...next.statuses],
    dateRange: { ...next.dateRange },
  };
}

export function setSort(next: NewsSort) {
  state.sort = { ...next };
}

export function setFocusedId(id: string | null) {
  state.focusedId = id;
}
