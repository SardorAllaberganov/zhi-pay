/**
 * Module-level cache so the AML Triage list state survives a round-trip
 * through the mobile detail page without a reload. Resets on full reload —
 * matches `kyc-queue/filterState.ts` and `transfers/filterState.ts`.
 */

import type { AmlFilters, AmlSort } from './types';

export interface CachedAmlState {
  filters: AmlFilters;
  sort: AmlSort;
  selectedId: string | null;
  focusedIndex: number;
  selectedIds: Set<string>;
  visibleIds: string[];
}

let cache: CachedAmlState | null = null;

export function readAmlState(): CachedAmlState | null {
  return cache;
}

export function writeAmlState(state: CachedAmlState): void {
  cache = state;
}

export function clearAmlState(): void {
  cache = null;
}
