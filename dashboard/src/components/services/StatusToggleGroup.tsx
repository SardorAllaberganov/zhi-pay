import { CheckCircle2, Wrench, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ServiceStatus } from '@/types';

interface StatusToggleGroupProps {
  current: ServiceStatus;
  onPick: (next: ServiceStatus) => void;
  /** When true, the segments shrink to 28px height (used in tile pane on desktop). */
  compact?: boolean;
  /** When true, the group spans the full container width and each segment is equal-flex (used in the mobile action bar to align with the full-width button row below). */
  fullWidth?: boolean;
}

const ITEMS: Array<{ value: ServiceStatus; icon: typeof CheckCircle2 }> = [
  { value: 'active', icon: CheckCircle2 },
  { value: 'maintenance', icon: Wrench },
  { value: 'disabled', icon: Ban },
];

/**
 * 3-segment toggle for the service status. Clicking a NON-current segment
 * fires `onPick(next)` so the page can open the AlertDialog confirm — no
 * status mutation happens immediately, per spec ("clicking a different
 * status opens AlertDialog").
 */
export function StatusToggleGroup({
  current,
  onPick,
  compact = false,
  fullWidth = false,
}: StatusToggleGroupProps) {
  return (
    <div
      role="group"
      aria-label={t('admin.services.status-toggle.aria-label')}
      className={cn(
        'items-center rounded-md border border-border bg-muted p-1',
        fullWidth ? 'flex w-full' : 'inline-flex',
        compact ? 'h-8' : 'h-9',
      )}
    >
      {ITEMS.map(({ value, icon: Icon }) => {
        const active = value === current;
        return (
          <button
            key={value}
            type="button"
            onClick={() => {
              if (!active) onPick(value);
            }}
            aria-pressed={active}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-sm text-sm font-medium transition-colors',
              fullWidth ? 'flex-1 justify-center px-2' : 'px-2.5',
              compact ? 'h-6' : 'h-7',
              active
                ? value === 'active'
                  ? 'bg-card text-success-700 dark:text-success-600 shadow-sm'
                  : value === 'maintenance'
                    ? 'bg-card text-warning-700 dark:text-warning-600 shadow-sm'
                    : 'bg-card text-danger-700 dark:text-danger-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {t(`admin.services.status.${value}`)}
          </button>
        );
      })}
    </div>
  );
}
