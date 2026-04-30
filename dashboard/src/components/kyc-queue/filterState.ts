/**
 * Module-level cache so the KYC Queue list state (filters, sort, selected
 * id, focus) survives a round-trip through the mobile detail page without
 * a page reload. Resets on full reload — that's intentional.
 *
 * Mirrors `components/transfers/filterState.ts`.
 */

import type { KycFilters, KycSort } from './types';

export interface CachedKycState {
  filters: KycFilters;
  sort: KycSort;
  selectedId: string | null;
  focusedIndex: number;
  selectedIds: Set<string>;
  /** Sorted+filtered ids at last commit — used by mobile detail j/k pager. */
  visibleIds: string[];
}

let cache: CachedKycState | null = null;

export function readKycState(): CachedKycState | null {
  return cache;
}

export function writeKycState(state: CachedKycState): void {
  cache = state;
}

export function clearKycState(): void {
  cache = null;
}
