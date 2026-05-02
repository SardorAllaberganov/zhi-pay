import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { BlacklistEntry } from '@/data/mockBlacklist';
import { isBlacklistEntryActive } from '@/data/mockBlacklist';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function StatusChip({
  entry,
  className,
}: {
  entry: BlacklistEntry;
  className?: string;
}) {
  const now = new Date();
  const active = isBlacklistEntryActive(entry, now);
  if (!active) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-sm bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700',
          className,
        )}
      >
        <XCircle className="h-3 w-3" aria-hidden="true" />
        {t('admin.blacklist.status.expired')}
      </span>
    );
  }

  // Active — flag "expiring soon" if expiresAt within 72h.
  if (entry.expiresAt) {
    const ms = entry.expiresAt.getTime() - now.getTime();
    if (ms > 0 && ms < 3 * ONE_DAY_MS) {
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-sm bg-warning-50 dark:bg-warning-700/15 px-2 py-0.5 text-xs font-medium text-warning-700 dark:text-warning-600 border border-warning-600/30',
            className,
          )}
        >
          <Clock className="h-3 w-3" aria-hidden="true" />
          {t('admin.blacklist.status.expiring-soon')}
        </span>
      );
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm bg-success-50 dark:bg-success-700/15 px-2 py-0.5 text-xs font-medium text-success-700 dark:text-success-600 border border-success-600/30',
        className,
      )}
    >
      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
      {t('admin.blacklist.status.active')}
    </span>
  );
}
