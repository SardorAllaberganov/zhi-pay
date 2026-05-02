import { cn, formatDateTime } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { BlacklistEntry } from '@/data/mockBlacklist';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function formatCountdown(ms: number): string {
  if (ms <= 0) return '';
  const days = Math.floor(ms / ONE_DAY_MS);
  if (days >= 2) return t('admin.blacklist.expires.in-days', { count: days });
  const hours = Math.max(1, Math.floor(ms / (60 * 60 * 1000)));
  return t('admin.blacklist.expires.in-hours', { count: hours });
}

export function ExpiryCell({
  entry,
  className,
}: {
  entry: BlacklistEntry;
  className?: string;
}) {
  if (entry.expiresAt === null) {
    return (
      <span className={cn('text-sm text-muted-foreground', className)}>
        {t('admin.blacklist.expires.never')}
      </span>
    );
  }
  const now = new Date();
  const ms = entry.expiresAt.getTime() - now.getTime();
  if (ms <= 0) {
    return (
      <span className={cn('text-sm font-medium text-danger-700 dark:text-danger-600', className)}>
        {t('admin.blacklist.expires.expired')}
      </span>
    );
  }
  if (ms < 3 * ONE_DAY_MS) {
    return (
      <span className={cn('text-sm font-medium text-warning-700 dark:text-warning-600', className)}>
        {formatCountdown(ms)}
      </span>
    );
  }
  return (
    <span className={cn('text-sm', className)}>
      {formatDateTime(entry.expiresAt)}
    </span>
  );
}
