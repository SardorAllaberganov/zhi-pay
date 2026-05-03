/**
 * Module-level UI cache for the Stories list page. Persists filter +
 * sort + focused-card-id across remounts so deep-link round-trips
 * (Audit Log → Story → back) restore state. Mirrors the precedent set
 * by AuditLog / Error Codes / App Versions filterState modules.
 */

import { EMPTY_FILTERS, DEFAULT_SORT, type StoryFilters, type StorySort } from './types';

interface StoriesFilterState {
  filters: StoryFilters;
  sort: StorySort;
  focusedId: string | null;
}

const state: StoriesFilterState = {
  filters: { ...EMPTY_FILTERS },
  sort: { ...DEFAULT_SORT },
  focusedId: null,
};

export function getFilterState(): StoriesFilterState {
  return {
    filters: { ...state.filters, statuses: [...state.filters.statuses], types: [...state.filters.types] },
    sort: { ...state.sort },
    focusedId: state.focusedId,
  };
}

export function setFilters(next: StoryFilters) {
  state.filters = { ...next, statuses: [...next.statuses], types: [...next.types] };
}

export function setSort(next: StorySort) {
  state.sort = { ...next };
}

export function setFocusedId(id: string | null) {
  state.focusedId = id;
}
