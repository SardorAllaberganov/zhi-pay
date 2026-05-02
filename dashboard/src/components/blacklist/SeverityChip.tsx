import { ShieldAlert, ShieldQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { BlacklistSeverity } from '@/data/mockBlacklist';

export function SeverityChip({
  severity,
  className,
}: {
  severity: BlacklistSeverity;
  className?: string;
}) {
  const label = t(`admin.blacklist.severity.${severity}`);
  if (severity === 'confirmed') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-sm bg-danger-50 dark:bg-danger-700/15 px-2 py-0.5 text-xs font-medium text-danger-700 dark:text-danger-600 border border-danger-600/30',
          className,
        )}
      >
        <ShieldAlert className="h-3 w-3" aria-hidden="true" />
        {label}
      </span>
    );
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm bg-warning-50 dark:bg-warning-700/15 px-2 py-0.5 text-xs font-medium text-warning-700 dark:text-warning-600 border border-warning-600/30',
        className,
      )}
    >
      <ShieldQuestion className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  );
}
