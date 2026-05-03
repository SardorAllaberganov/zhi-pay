import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

/**
 * Force-update pill — danger tint, used in the active-version banner +
 * the table version cell + the row-expanded body. Compact size matches
 * other chip primitives in the codebase (`text-xs` is allowed inside
 * pill / badge bodies per LESSONS 2026-04-29 + 2026-05-01).
 */
export function ForceUpdatePill({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
        'bg-danger-50 text-danger-700 dark:bg-danger-700/15 dark:text-danger-600',
        'text-xs font-medium tabular',
        className,
      )}
    >
      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
      <span>{t('admin.app-versions.chip.force-update')}</span>
    </span>
  );
}
