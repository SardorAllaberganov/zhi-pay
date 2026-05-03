/**
 * Forensic store for admin-surface system events — page errors and
 * permission-denied outcomes that the `<SystemErrorBoundary>` and
 * `<ForbiddenState>` components log automatically.
 *
 * Lives in its own store rather than bridging into `mockAuditLog`. The
 * central audit log is reserved for entity-state-change events
 * (transfers, KYC, AML, cards, FX, services, content) — that's what
 * compliance reviewers scan. Mixing operational signals like
 * `page_error` and `permission_denied` would dilute that surface.
 *
 * Same precedent as Phase 20's `mockAdminLoginAudit` (auth events live
 * in their own forensic stream).
 *
 * Schema: deliberately mock-only. Real backend would surface page
 * errors via APM (Sentry / Datadog) and permission denials via the
 * authorization layer — this store models the smallest shape the UI
 * needs (timestamp + actor + type + context).
 *
 * Append-only by contract — no edit, no delete. The list is exposed
 * read-only to consumers; only `recordSystemEvent` mutates.
 */

import { generateReferenceId } from '@/lib/referenceId';

export type SystemEventType = 'page_error' | 'permission_denied';

export interface SystemEvent {
  id: string;
  /** ms since epoch — sorted DESC for display. */
  timestamp: number;
  /** Always 'system' in v1 — there's no per-admin attribution for these. */
  actorType: 'system';
  type: SystemEventType;
  /** The route the admin was on when the event fired. */
  route: string;
  /** Reference id — surfaced in the 500 footer; absent for permission_denied. */
  referenceId: string | null;
  /** Free-form context bag. Minimal in v1; expand as patterns emerge. */
  context: {
    message?: string;
    componentStack?: string;
    requiredRole?: string;
  };
}

const events: SystemEvent[] = [];

let id = 0;
function nextId(): string {
  id += 1;
  return `sysev_${Date.now().toString(36)}_${id.toString(36)}`;
}

export interface RecordSystemEventInput {
  type: SystemEventType;
  route: string;
  context?: SystemEvent['context'];
}

/**
 * Record a system event. Returns the generated reference id for
 * `page_error` (so the UI can surface it to the user); `null` for
 * `permission_denied` (no user-facing handle).
 */
export function recordSystemEvent(input: RecordSystemEventInput): SystemEvent {
  const referenceId = input.type === 'page_error' ? generateReferenceId() : null;
  const event: SystemEvent = {
    id: nextId(),
    timestamp: Date.now(),
    actorType: 'system',
    type: input.type,
    route: input.route,
    referenceId,
    context: input.context ?? {},
  };
  events.unshift(event);
  return event;
}

/** Read-only snapshot, newest first. */
export function listSystemEvents(): readonly SystemEvent[] {
  return events;
}
