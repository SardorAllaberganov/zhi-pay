import { useEffect } from 'react';
import { ShieldXIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { SystemStateLayout } from './SystemStateLayout';
import { logPermissionDenied } from '@/lib/systemEvents';
import { t } from '@/lib/i18n';

interface ForbiddenStateProps {
  /** When `true`, skip the audit-log write — used by preview routes. */
  preview?: boolean;
  /** Optional role hint for the audit-log row. */
  requiredRole?: string;
}

/**
 * 403 — Forbidden. Defensive fallback for future RBAC. v1 is
 * super-admin-only, so this state should never render in practice.
 *
 * No reference id (this is a permission outcome, not a system error).
 * Logs `permission_denied` to `mockSystemEvents` on mount so future
 * RBAC tuning has signal — skipped in preview mode.
 */
export function ForbiddenState({ preview, requiredRole }: ForbiddenStateProps) {
  const location = useLocation();

  useEffect(() => {
    if (preview) return;
    logPermissionDenied({
      route: `${location.pathname}${location.search}`,
      requiredRole,
    });
    // mount-only (we don't want to re-log on every prop change)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SystemStateLayout
      icon={ShieldXIcon}
      iconTone="warning"
      title={t('admin.error.403.title')}
      body={t('admin.error.403.body')}
      primary={{ label: t('admin.error.403.action.home'), to: '/' }}
    />
  );
}
