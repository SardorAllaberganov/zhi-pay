/**
 * Module-level cache so the Cards list state survives a round-trip
 * through the card-detail page without a page reload.
 */

import type { CardsFilters, CardsSort } from './types';

export interface CachedCardsState {
  filters: CardsFilters;
  sort: CardsSort;
  page: number;
  pageSize: number;
  focusedIndex: number;
  visibleIds: string[];
}

let cache: CachedCardsState | null = null;

export function readCardsState(): CachedCardsState | null {
  return cache;
}

export function writeCardsState(state: CachedCardsState): void {
  cache = state;
}

export function clearCardsState(): void {
  cache = null;
}
