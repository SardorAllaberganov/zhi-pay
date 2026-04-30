import type { KycStatus, KycTier } from '@/types';
import type { KycDocumentType, KycReview } from '@/data/mockKycQueue';

export type KycAgeBucket = 'under-1h' | 'under-24h' | 'over-24h' | 'over-7d';

export type KycAssignedFilter = 'anyone' | 'me' | 'unassigned';

export interface KycFilters {
  statuses: KycStatus[];
  documentTypes: KycDocumentType[];
  resultingTiers: KycTier[];
  ages: KycAgeBucket[];
  assigned: KycAssignedFilter;
}

export type KycSort = 'newest' | 'oldest';

export const DEFAULT_KYC_FILTERS: KycFilters = {
  statuses: ['pending'],
  documentTypes: [],
  resultingTiers: [],
  ages: [],
  assigned: 'anyone',
};

export function isFilterActive(f: KycFilters): boolean {
  // Default = only `pending` in statuses, everything else cleared.
  if (f.documentTypes.length > 0) return true;
  if (f.resultingTiers.length > 0) return true;
  if (f.ages.length > 0) return true;
  if (f.assigned !== 'anyone') return true;
  if (f.statuses.length !== 1 || f.statuses[0] !== 'pending') return true;
  return false;
}

export function countActiveFilters(f: KycFilters): number {
  let count = 0;
  if (f.documentTypes.length > 0) count++;
  if (f.resultingTiers.length > 0) count++;
  if (f.ages.length > 0) count++;
  if (f.assigned !== 'anyone') count++;
  if (f.statuses.length !== 1 || f.statuses[0] !== 'pending') count++;
  return count;
}

// =====================================================================
// Filtering & sorting helpers
// =====================================================================

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;
const SEVEN_DAYS_MS = 7 * ONE_DAY_MS;

function ageBucketMatches(submittedAt: Date, bucket: KycAgeBucket, now: Date): boolean {
  const age = now.getTime() - submittedAt.getTime();
  switch (bucket) {
    case 'under-1h': return age < ONE_HOUR_MS;
    case 'under-24h': return age < ONE_DAY_MS;
    case 'over-24h': return age >= ONE_DAY_MS;
    case 'over-7d': return age >= SEVEN_DAYS_MS;
  }
}

export function applyFilters(
  list: KycReview[],
  filters: KycFilters,
  myId: string,
  now: Date = new Date(),
): KycReview[] {
  return list.filter((r) => {
    if (filters.statuses.length > 0 && !filters.statuses.includes(r.status)) return false;

    if (filters.documentTypes.length > 0 && !filters.documentTypes.includes(r.documentType)) return false;

    if (filters.resultingTiers.length > 0 && !filters.resultingTiers.includes(r.resultingTier)) return false;

    if (filters.ages.length > 0) {
      const matches = filters.ages.some((b) => ageBucketMatches(r.submittedAt, b, now));
      if (!matches) return false;
    }

    if (filters.assigned === 'me' && r.assigneeId !== myId) return false;
    if (filters.assigned === 'unassigned' && r.assigneeId) return false;

    return true;
  });
}

export function applySort(list: KycReview[], sort: KycSort): KycReview[] {
  const sorted = list.slice();
  sorted.sort((a, b) => {
    const diff = a.submittedAt.getTime() - b.submittedAt.getTime();
    return sort === 'newest' ? -diff : diff;
  });
  return sorted;
}
