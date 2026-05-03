/**
 * Surface-facing API for the `mockSystemEvents` forensic store.
 *
 * Wraps `data/mockSystemEvents.ts` with the API the SystemErrorBoundary
 * and ForbiddenState components consume:
 *
 *   - `logPageError({ route, error })` → records a `page_error` event
 *     and returns the generated reference id
 *   - `logPermissionDenied({ route, requiredRole? })` → records a
 *     `permission_denied` event
 *
 * Both calls are fire-and-forget from the consumer's perspective —
 * failures are swallowed (we don't want telemetry to crash the
 * already-broken page).
 *
 * No bridge into `mockAuditLog` (D1 = a per Phase 22 plan). The events
 * are queryable only via `listSystemEvents()` from the data module
 * directly — no UI surface today, intentional minimal shape.
 */

import { recordSystemEvent } from '@/data/mockSystemEvents';

export interface LogPageErrorInput {
  route: string;
  error?: unknown;
  componentStack?: string;
}

export function logPageError(input: LogPageErrorInput): string {
  const message =
    input.error instanceof Error
      ? input.error.message
      : typeof input.error === 'string'
        ? input.error
        : undefined;
  try {
    const event = recordSystemEvent({
      type: 'page_error',
      route: input.route,
      context: {
        ...(message ? { message } : {}),
        ...(input.componentStack ? { componentStack: input.componentStack } : {}),
      },
    });
    return event.referenceId ?? '';
  } catch {
    // Never let telemetry crash the already-broken page.
    return '';
  }
}

export interface LogPermissionDeniedInput {
  route: string;
  requiredRole?: string;
}

export function logPermissionDenied(input: LogPermissionDeniedInput): void {
  try {
    recordSystemEvent({
      type: 'permission_denied',
      route: input.route,
      context: input.requiredRole ? { requiredRole: input.requiredRole } : {},
    });
  } catch {
    // swallow
  }
}
