import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { AmlSeverity } from '@/types';

interface SeverityBadgeProps {
  severity: AmlSeverity;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const label = t(`admin.severity.${severity}`);

  if (severity === 'critical') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-sm bg-danger-50 dark:bg-danger-700/15 px-2 py-0.5 text-xs font-medium text-danger-700 dark:text-danger-600 border border-danger-600/30',
          className,
        )}
      >
        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
        {label}
      </span>
    );
  }

  if (severity === 'warning') {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-sm bg-warning-50 dark:bg-warning-700/15 px-2 py-0.5 text-xs font-medium text-warning-700 dark:text-warning-600 border border-warning-600/30',
          className,
        )}
      >
        {label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700',
        className,
      )}
    >
      {label}
    </span>
  );
}
