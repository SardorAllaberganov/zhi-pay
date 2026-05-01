import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { FxHealthState } from '@/data/mockFxRates';

interface FxStatusBadgeProps {
  state: FxHealthState;
  className?: string;
}

/**
 * Health badge for the active FX rate card.
 *   healthy  → success / CheckCircle2
 *   drifting → warning / AlertTriangle
 *   stale    → danger  / AlertOctagon  (rate must be updated immediately)
 */
export function FxStatusBadge({ state, className }: FxStatusBadgeProps) {
  if (state === 'stale') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 h-7 text-xs font-medium',
          'bg-danger-50 text-danger-700 dark:bg-danger-700/15 dark:text-danger-600',
          'border border-danger-600/20',
          className,
        )}
      >
        <AlertOctagon className="h-3.5 w-3.5" aria-hidden="true" />
        {t('admin.fx-config.active.status.stale')}
      </span>
    );
  }
  if (state === 'drifting') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 h-7 text-xs font-medium',
          'bg-warning-50 text-warning-700 dark:bg-warning-700/15 dark:text-warning-600',
          'border border-warning-600/20',
          className,
        )}
      >
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
        {t('admin.fx-config.active.status.drifting')}
      </span>
    );
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 h-7 text-xs font-medium',
        'bg-success-50 text-success-700 dark:bg-success-700/15 dark:text-success-600',
        'border border-success-600/20',
        className,
      )}
    >
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
      {t('admin.fx-config.active.status.healthy')}
    </span>
  );
}
