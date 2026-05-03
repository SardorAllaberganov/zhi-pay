/**
 * Module-level UI cache so filter / sort / expanded-code survive
 * mount-unmount round-trips (e.g. nav back from Transfers list landed
 * via the row-expanded "View transfers that failed with this code →"
 * link). Same precedent as the audit-log filterState cache.
 */

import type { ErrorCodeFilters, ErrorCodeSort } from './types';

export interface CachedErrorCodeState {
  filters: ErrorCodeFilters;
  sort: ErrorCodeSort;
  expandedCode: string | null;
  focusedIndex: number;
}

let cache: CachedErrorCodeState | null = null;

export function readErrorCodeState(): CachedErrorCodeState | null {
  return cache;
}

export function writeErrorCodeState(state: CachedErrorCodeState): void {
  cache = state;
}

export function clearErrorCodeState(): void {
  cache = null;
}
