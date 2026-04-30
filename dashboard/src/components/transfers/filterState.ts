/**
 * Module-level cache so the Transfers list state (filters, sort, page,
 * selection) survives a round-trip through the detail page without a page
 * reload. Resets on full reload — that's intentional; URL params would
 * persist further if/when we want shareable filtered URLs.
 */

import type { SortState, TransferFilters } from './types';

export interface CachedTransfersState {
  filters: TransferFilters;
  sort: SortState;
  page: number;
  pageSize: number;
  selectedIds: Set<string>;
  focusedIndex: number;
}

let cache: CachedTransfersState | null = null;

export function readTransfersState(): CachedTransfersState | null {
  return cache;
}

export function writeTransfersState(state: CachedTransfersState): void {
  cache = state;
}

export function clearTransfersState(): void {
  cache = null;
}

/* -------------------------------------------------------------------------
 * Saved filters — named filter presets the admin can recall later.
 * Module-level (in-memory). Persists across detail-page round-trips, resets
 * on full reload.
 * ----------------------------------------------------------------------- */

export interface SavedFilter {
  name: string;
  filters: TransferFilters;
  sort: SortState;
}

const savedFilters: SavedFilter[] = [];
const savedFilterListeners = new Set<() => void>();

export function getSavedFilters(): SavedFilter[] {
  return savedFilters.slice();
}

export function addSavedFilter(entry: SavedFilter): void {
  // Replace any existing entry with the same name.
  const idx = savedFilters.findIndex((s) => s.name === entry.name);
  if (idx >= 0) savedFilters[idx] = entry;
  else savedFilters.push(entry);
  savedFilterListeners.forEach((cb) => cb());
}

export function removeSavedFilter(name: string): void {
  const idx = savedFilters.findIndex((s) => s.name === name);
  if (idx === -1) return;
  savedFilters.splice(idx, 1);
  savedFilterListeners.forEach((cb) => cb());
}

export function subscribeSavedFilters(cb: () => void): () => void {
  savedFilterListeners.add(cb);
  return () => savedFilterListeners.delete(cb);
}
