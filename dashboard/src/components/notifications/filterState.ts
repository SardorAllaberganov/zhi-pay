/**
 * Module-level UI cache for the Notifications list page. Persists filter
 * + sort + focused-row across remounts so deep-link round-trips (Audit Log
 * → Notifications → back) restore state. Mirrors the precedent set by
 * News / Stories / AuditLog / Error Codes / App Versions.
 */

import { EMPTY_FILTERS, DEFAULT_SORT, type NotificationFilters, type NotificationSort } from './types';

interface NotificationsListFilterState {
  filters: NotificationFilters;
  sort: NotificationSort;
  focusedId: string | null;
}

const state: NotificationsListFilterState = {
  filters: { ...EMPTY_FILTERS, dateRange: { ...EMPTY_FILTERS.dateRange } },
  sort: { ...DEFAULT_SORT },
  focusedId: null,
};

export function getFilterState(): NotificationsListFilterState {
  return {
    filters: {
      ...state.filters,
      types: [...state.filters.types],
      audienceTypes: [...state.filters.audienceTypes],
      dateRange: { ...state.filters.dateRange },
    },
    sort: { ...state.sort },
    focusedId: state.focusedId,
  };
}

export function setFilters(next: NotificationFilters) {
  state.filters = {
    ...next,
    types: [...next.types],
    audienceTypes: [...next.audienceTypes],
    dateRange: { ...next.dateRange },
  };
}

export function setSort(next: NotificationSort) {
  state.sort = { ...next };
}

export function setFocusedId(id: string | null) {
  state.focusedId = id;
}
