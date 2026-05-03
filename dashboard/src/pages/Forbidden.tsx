import { ForbiddenState } from '@/components/system/ForbiddenState';

/**
 * 403 — Forbidden. Defensive route mounted at `/system/403` so future
 * RBAC code can navigate users here when a permission check fails.
 *
 * v1 is super-admin-only, so this surface should never render in
 * practice. Intentionally not exposed in the sidebar / command palette.
 */
export function Forbidden() {
  return <ForbiddenState />;
}
