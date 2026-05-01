/**
 * Filter / sort types + helpers for the central audit-log surface.
 *
 * Default date range is **today** per spec. The DateRangePicker primitive
 * resolves `range: 'today'` to a single-day window via `resolveDateRange`,
 * so the filter handler keeps the existing primitive untouched.
 *
 * `entityRef` is a free-text input that matches against either the
 * full `entity.id` (case-insensitive) or its 8-char prefix. Lets reviewers
 * paste a transfer-id, user-id, or card-id and scope the table.
 */

import {
  resolveDateRange,
  type DateRangeValue,
} from '@/components/zhipay/DateRangePicker';
import type {
  AuditAction,
  AuditActorType,
  AuditEntityType,
  AuditEvent,
} from '@/data/mockAuditLog';

export type AuditSortDir = 'asc' | 'desc';

export interface AuditSort {
  /** Only timestamp is sortable per spec — categorical columns are static. */
  key: 'timestamp';
  dir: AuditSortDir;
}

export interface AuditFilters {
  dateRange: DateRangeValue;
  actorTypes: AuditActorType[];
  /** Distinct admin actor ids — for v1 this is just the canonical 2 admins. */
  adminActorIds: string[];
  entityTypes: AuditEntityType[];
  actions: AuditAction[];
  /** Free-text — matches entity.id (full or 8-char prefix), case-insensitive. */
  entityRef: string;
}

export const DEFAULT_AUDIT_FILTERS: AuditFilters = {
  dateRange: { range: 'today' },
  actorTypes: [],
  adminActorIds: [],
  entityTypes: [],
  actions: [],
  entityRef: '',
};

export const DEFAULT_AUDIT_SORT: AuditSort = { key: 'timestamp', dir: 'desc' };

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function inDateRange(e: AuditEvent, value: DateRangeValue): boolean {
  const resolved = resolveDateRange(value);
  if (!resolved?.from) return true;
  const ts = e.timestamp.getTime();
  const fromTs = resolved.from.getTime();
  const toBase = (resolved.to ?? resolved.from).getTime();
  // End-of-day inclusive on the upper bound so e.g. selecting "today"
  // matches anything between 00:00 and 23:59:59 today.
  const toTs = toBase + ONE_DAY_MS - 1;
  return ts >= fromTs && ts <= toTs;
}

export function applyAuditFilters(list: AuditEvent[], f: AuditFilters): AuditEvent[] {
  const ref = f.entityRef.trim().toLowerCase();
  return list.filter((e) => {
    if (!inDateRange(e, f.dateRange)) return false;
    if (f.actorTypes.length > 0 && !f.actorTypes.includes(e.actorType)) return false;
    if (f.adminActorIds.length > 0) {
      if (e.actorType !== 'admin') return false;
      if (!e.actor.id || !f.adminActorIds.includes(e.actor.id)) return false;
    }
    if (f.entityTypes.length > 0 && !f.entityTypes.includes(e.entity.type)) return false;
    if (f.actions.length > 0 && !f.actions.includes(e.action)) return false;
    if (ref.length > 0) {
      const id = e.entity.id.toLowerCase();
      if (!id.includes(ref)) return false;
    }
    return true;
  });
}

export function applyAuditSort(list: AuditEvent[], sort: AuditSort): AuditEvent[] {
  const sorted = list.slice();
  const direction = sort.dir === 'asc' ? 1 : -1;
  sorted.sort((a, b) => direction * (a.timestamp.getTime() - b.timestamp.getTime()));
  return sorted;
}

export function countActiveAuditFilters(f: AuditFilters): number {
  let n = 0;
  // Count "date range != today" as an active filter so the user knows a
  // non-default window is in effect.
  if (f.dateRange.range !== 'today') n++;
  if (f.actorTypes.length > 0) n++;
  if (f.adminActorIds.length > 0) n++;
  if (f.entityTypes.length > 0) n++;
  if (f.actions.length > 0) n++;
  if (f.entityRef.trim().length > 0) n++;
  return n;
}
