/**
 * Module-level cache so the Users list state survives a round-trip through
 * the user-detail page without a page reload.
 */

import type { UsersFilters, UsersSort } from './types';

export interface CachedUsersState {
  filters: UsersFilters;
  sort: UsersSort;
  page: number;
  pageSize: number;
  focusedIndex: number;
  visibleIds: string[];
}

let cache: CachedUsersState | null = null;

export function readUsersState(): CachedUsersState | null {
  return cache;
}

export function writeUsersState(state: CachedUsersState): void {
  cache = state;
}

export function clearUsersState(): void {
  cache = null;
}
