import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatRelative, formatDateTime } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { AppVersion, Platform } from '@/data/mockAppVersions';
import { PLATFORM_LABEL_KEY } from './types';
import { PlatformIcon } from './PlatformIcon';
import { ForceUpdatePill } from './ForceUpdatePill';

/**
 * Active-version banner — pinned at the top of each platform tab. Filled
 * brand-tinted card so the latest release reads as the primary signal.
 *
 * Stacks vertically on `<sm`, side-by-side on `sm+`. Right side carries the
 * Edit button — same Edit modal as the row-kebab so there's one canonical
 * Edit path per LESSONS-aligned "one source of truth" stance.
 */
export function ActiveVersionBanner({
  platform,
  version,
  onEdit,
}: {
  platform: Platform;
  version: AppVersion;
  onEdit: (v: AppVersion) => void;
}) {
  return (
    <Card className="overflow-hidden border-brand-200 dark:border-brand-700/40 bg-brand-50/40 dark:bg-brand-950/20">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <span
              className={cn(
                'inline-flex h-10 w-10 items-center justify-center rounded-lg shrink-0',
                'bg-background border border-border',
              )}
            >
              <PlatformIcon platform={platform} className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="text-sm text-muted-foreground">
                {t('admin.app-versions.banner.latest', {
                  platform: t(PLATFORM_LABEL_KEY[platform]),
                })}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <span className="text-2xl font-semibold tracking-tight font-mono">
                  v{version.version}
                </span>
                {version.forceUpdate && <ForceUpdatePill />}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span title={formatDateTime(version.releasedAt)}>
                  {t('admin.app-versions.banner.released', {
                    time: formatRelative(version.releasedAt),
                  })}
                </span>
                {version.minSupported && (
                  <span>
                    {t('admin.app-versions.banner.min-supported', {
                      version: version.minSupported,
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="shrink-0 sm:self-start">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(version)}
              className="bg-background"
            >
              <Pencil className="h-4 w-4 mr-1.5" aria-hidden="true" />
              {t('admin.app-versions.action.edit')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActiveVersionBannerSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}
