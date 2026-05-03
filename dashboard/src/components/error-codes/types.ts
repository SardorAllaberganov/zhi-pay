/**
 * Filter / sort types + helpers for the read-only Error Codes catalog.
 *
 * Source list comes from `mockErrorCodes` already sorted by code ASC.
 * The page applies (a) the search/category/retryable filter set, then
 * (b) the active sort. Both are pure functions — safe to memoize.
 */

import type {
  ErrorCategory,
  ErrorCodeWithStats,
} from '@/data/mockErrorCodes';

export type RetryableFilter = 'any' | 'yes' | 'no';

export interface ErrorCodeFilters {
  /** Free-text search — matches code, message_*, suggested_action_* across all locales. */
  search: string;
  categories: ErrorCategory[];
  retryable: RetryableFilter;
}

export const DEFAULT_ERROR_CODE_FILTERS: ErrorCodeFilters = {
  search: '',
  categories: [],
  retryable: 'any',
};

export type ErrorCodeSortKey = 'code';
export type SortDir = 'asc' | 'desc';

export interface ErrorCodeSort {
  key: ErrorCodeSortKey;
  dir: SortDir;
}

export const DEFAULT_ERROR_CODE_SORT: ErrorCodeSort = {
  key: 'code',
  dir: 'asc',
};

/** i18n key per category — used by the chip + the filter popover labels. */
export const CATEGORY_LABEL_KEY: Record<ErrorCategory, string> = {
  kyc: 'admin.error-codes.category.kyc',
  acquiring: 'admin.error-codes.category.acquiring',
  fx: 'admin.error-codes.category.fx',
  provider: 'admin.error-codes.category.provider',
  compliance: 'admin.error-codes.category.compliance',
  system: 'admin.error-codes.category.system',
};

export function applyErrorCodeFilters(
  rows: ErrorCodeWithStats[],
  f: ErrorCodeFilters,
): ErrorCodeWithStats[] {
  const q = f.search.trim().toLowerCase();
  return rows.filter((r) => {
    if (f.categories.length > 0 && !f.categories.includes(r.category)) return false;
    if (f.retryable === 'yes' && !r.retryable) return false;
    if (f.retryable === 'no' && r.retryable) return false;
    if (q.length > 0) {
      const haystack = [
        r.code,
        r.message_uz,
        r.message_ru,
        r.message_en,
        r.suggested_action_uz,
        r.suggested_action_ru,
        r.suggested_action_en,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export function applyErrorCodeSort(
  rows: ErrorCodeWithStats[],
  sort: ErrorCodeSort,
): ErrorCodeWithStats[] {
  const dirMul = sort.dir === 'asc' ? 1 : -1;
  return rows.slice().sort((a, b) => a.code.localeCompare(b.code) * dirMul);
}

export function countActiveFilters(f: ErrorCodeFilters): number {
  let n = 0;
  if (f.search.trim().length > 0) n++;
  if (f.categories.length > 0) n++;
  if (f.retryable !== 'any') n++;
  return n;
}
