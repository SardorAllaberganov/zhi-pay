import { useMemo } from 'react';
import { WifiOffIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useNetworkState } from '@/hooks/useNetworkState';
import { t } from '@/lib/i18n';

interface OfflineBannerProps {
  /** Render even when online — used by `/system/preview/offline`. */
  forceVisible?: boolean;
  /** ms-since-epoch to display in "Showing cached data from {time}." */
  cachedFromOverride?: number;
  /** Re-runs the most recent fetch. Falls back to `window.location.reload()`. */
  onRetry?: () => void;
}

/**
 * Slate-toned banner that renders inside `<AppShell>` between the TopBar
 * and the route content when `navigator.onLine` is `false`. Persists
 * until network is restored.
 *
 * NOT a full-page replacement — the page below it stays visible with
 * stale data. Write actions across the app gate themselves on
 * `useNetworkState()` (per AppShell's offline-aware contract).
 */
export function OfflineBanner({
  forceVisible,
  cachedFromOverride,
  onRetry,
}: OfflineBannerProps) {
  const online = useNetworkState();
  const visible = forceVisible || !online;

  // Capture the moment the banner first appears so the "cached from"
  // label stays stable for the duration of the offline window. A fresh
  // `Date.now()` on every render would tick the label every paint.
  const cachedFrom = useMemo(
    () => cachedFromOverride ?? Date.now(),
    [cachedFromOverride, visible],
  );

  if (!visible) return null;

  function handleRetry() {
    if (onRetry) onRetry();
    else if (typeof window !== 'undefined') window.location.reload();
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-slate-100 px-4 py-2.5 dark:bg-slate-800"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <WifiOffIcon
          className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400"
          aria-hidden="true"
        />
        <p className="text-sm text-slate-900 dark:text-slate-100">
          <span className="font-medium">{t('admin.system.offline.banner.title')}</span>{' '}
          <span className="text-slate-700 dark:text-slate-300">
            {t('admin.system.offline.banner.cached-from', {
              time: format(new Date(cachedFrom), 'p'),
            })}
          </span>
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={handleRetry}>
        {t('admin.system.offline.banner.retry')}
      </Button>
    </div>
  );
}
