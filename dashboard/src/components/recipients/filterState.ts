/**
 * Module-level cache for the Recipients list page so list ↔ detail
 * round-trip preserves filter / sort / pagination state. Mirrors the
 * Cards / Users / Transfers pattern.
 */

import type { RecipientsFilters, RecipientsSort } from './types';

interface RecipientsState {
  filters: RecipientsFilters;
  sort: RecipientsSort;
  page: number;
  pageSize: number;
  focusedIndex: number;
  /** IDs of the rows currently visible after filters + pagination — used
   *  by the detail-page pager (j/k) to walk the same set. */
  visibleIds: string[];
}

let cached: RecipientsState | null = null;

export function readRecipientsState(): RecipientsState | null {
  return cached;
}

export function writeRecipientsState(next: RecipientsState): void {
  cached = next;
}

export function clearRecipientsState(): void {
  cached = null;
}
