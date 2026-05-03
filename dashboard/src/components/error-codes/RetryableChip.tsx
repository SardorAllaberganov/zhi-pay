import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

/**
 * Retryable chip — `yes` reads as success-tinted (recovery is possible),
 * `no` reads as muted-slate (terminal, no retry). Always paired with
 * the textual yes/no label so the signal isn't color-only.
 */
export function RetryableChip({
  retryable,
  className,
}: {
  retryable: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium',
        retryable
          ? 'bg-success-50 dark:bg-success-700/15 text-success-700 dark:text-success-600 border-success-600/20'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300/60 dark:border-slate-700',
        className,
      )}
    >
      {retryable
        ? t('admin.error-codes.retryable.yes')
        : t('admin.error-codes.retryable.no')}
    </span>
  );
}
