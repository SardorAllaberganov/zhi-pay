import type { AmlFlagStatus, AmlSeverity } from '@/types';
import type { AmlFlagType, AmlReview } from '@/data/mockAmlTriage';

export type AmlAssignedFilter = 'anyone' | 'me' | 'unassigned';

export type AmlSort = 'severity-age' | 'newest' | 'oldest';

export interface AmlFilters {
  severities: AmlSeverity[];
  types: AmlFlagType[];
  statuses: AmlFlagStatus[];
  assigned: AmlAssignedFilter;
  hasTransfer: boolean;
}

export const DEFAULT_AML_FILTERS: AmlFilters = {
  severities: ['warning', 'critical'],
  statuses: ['open', 'reviewing'],
  types: [],
  assigned: 'anyone',
  hasTransfer: false,
};

export function isFilterActive(f: AmlFilters): boolean {
  if (f.types.length > 0) return true;
  if (f.assigned !== 'anyone') return true;
  if (f.hasTransfer) return true;
  // Severities: default is warning + critical
  if (
    f.severities.length !== 2 ||
    !f.severities.includes('warning') ||
    !f.severities.includes('critical')
  )
    return true;
  // Statuses: default is open + reviewing
  if (
    f.statuses.length !== 2 ||
    !f.statuses.includes('open') ||
    !f.statuses.includes('reviewing')
  )
    return true;
  return false;
}

export function countActiveFilters(f: AmlFilters): number {
  let n = 0;
  if (f.types.length > 0) n++;
  if (f.assigned !== 'anyone') n++;
  if (f.hasTransfer) n++;
  if (
    f.severities.length !== 2 ||
    !f.severities.includes('warning') ||
    !f.severities.includes('critical')
  )
    n++;
  if (
    f.statuses.length !== 2 ||
    !f.statuses.includes('open') ||
    !f.statuses.includes('reviewing')
  )
    n++;
  return n;
}

// =====================================================================
// Filtering
// =====================================================================

export function applyFilters(
  list: AmlReview[],
  filters: AmlFilters,
  myId: string,
): AmlReview[] {
  return list.filter((f) => {
    if (filters.severities.length > 0 && !filters.severities.includes(f.severity)) return false;
    if (filters.types.length > 0 && !filters.types.includes(f.flagType)) return false;
    if (filters.statuses.length > 0 && !filters.statuses.includes(f.status)) return false;
    if (filters.assigned === 'me' && f.assigneeId !== myId) return false;
    if (filters.assigned === 'unassigned' && f.assigneeId) return false;
    if (filters.hasTransfer && !f.transferId) return false;
    return true;
  });
}

// =====================================================================
// Sorting — critical pinned first regardless of choice
// =====================================================================

const SEVERITY_ORDER: Record<AmlSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

export function applySort(list: AmlReview[], sort: AmlSort): AmlReview[] {
  const sorted = list.slice();
  sorted.sort((a, b) => {
    // Critical always pins first.
    const aCritical = a.severity === 'critical' ? 0 : 1;
    const bCritical = b.severity === 'critical' ? 0 : 1;
    if (aCritical !== bCritical) return aCritical - bCritical;

    // Inside critical bucket, also sort by age ASC (oldest first) — surface
    // the longest-pending critical regardless of user's chosen sort.
    if (a.severity === 'critical' && b.severity === 'critical') {
      return a.createdAt.getTime() - b.createdAt.getTime();
    }

    // Outside critical, apply the user's sort choice.
    if (sort === 'severity-age') {
      const sevDiff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
      if (sevDiff !== 0) return sevDiff;
      return a.createdAt.getTime() - b.createdAt.getTime();
    }
    if (sort === 'newest') {
      return b.createdAt.getTime() - a.createdAt.getTime();
    }
    return a.createdAt.getTime() - b.createdAt.getTime(); // oldest
  });
  return sorted;
}
