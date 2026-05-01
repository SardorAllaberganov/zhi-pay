/**
 * Module-level cache so the audit-log filter state survives a kebab
 * deep-link round-trip (e.g. opening the audit log from FX Config's
 * version-history kebab pre-fills the filter to that fx_rate id).
 */

import type { AuditFilters, AuditSort } from './types';

export interface CachedAuditState {
  filters: AuditFilters;
  sort: AuditSort;
  page: number;
  focusedIndex: number;
  expandedId: string | null;
}

let cache: CachedAuditState | null = null;

export function readAuditState(): CachedAuditState | null {
  return cache;
}

export function writeAuditState(state: CachedAuditState): void {
  cache = state;
}

export function clearAuditState(): void {
  cache = null;
}
