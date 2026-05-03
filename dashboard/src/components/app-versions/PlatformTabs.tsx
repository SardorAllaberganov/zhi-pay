import { Skeleton } from '@/components/ui/skeleton';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Platform } from '@/data/mockAppVersions';
import { PLATFORM_LABEL_KEY, PLATFORM_ORDER } from './types';
import { PlatformIcon } from './PlatformIcon';

/**
 * 2-tab segmented control for iOS / Android. Mirrors the BlacklistTabs
 * convention — the outer wrapper handles mobile horizontal scroll while
 * the inner TabsList keeps its default `inline-flex bg-muted p-1 rounded-md`
 * pill. Count badges render Skeletons during initial load and lift to
 * `bg-foreground/10` when active.
 */
export function PlatformTabs({
  counts,
  loading,
}: {
  counts: Record<Platform, number>;
  loading?: boolean;
}) {
  return (
    <div className="-mx-1 overflow-x-auto pb-1 md:mx-0 md:overflow-visible md:pb-0">
      <TabsList className="h-auto">
        {PLATFORM_ORDER.map((platform) => {
          const count = counts[platform];
          return (
            <TabsTrigger
              key={platform}
              value={platform}
              className="gap-1.5 data-[state=active]:[&_[data-tab-count]]:bg-foreground/10"
            >
              <PlatformIcon platform={platform} className="h-3.5 w-3.5" tone="muted" />
              <span>{t(PLATFORM_LABEL_KEY[platform])}</span>
              {loading ? (
                <Skeleton className="h-4 w-6 rounded-full" />
              ) : (
                <span
                  data-tab-count
                  className={cn(
                    'inline-flex min-w-5 h-5 items-center justify-center rounded-full px-1.5 text-xs font-medium tabular',
                    count > 0
                      ? 'bg-background/80 text-foreground'
                      : 'bg-transparent text-muted-foreground',
                  )}
                >
                  {count}
                </span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </div>
  );
}
