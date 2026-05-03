import { ChevronDown, ChevronRight, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatDateTime, formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { AppVersion, Platform } from '@/data/mockAppVersions';
import { ForceUpdatePill } from './ForceUpdatePill';
import { ReleaseNotesPreview } from './ReleaseNotesPreview';
import { RowExpanded } from './RowExpanded';
import { PLATFORM_LABEL_KEY } from './types';

/**
 * Mobile (`<lg`) version of the table — vertical stack of cards. Each card
 * carries: version + platform tag as title, released-at + flags as subtitle,
 * release-notes preview below, and the kebab actions inline. Tap header to
 * expand the full release-notes per locale.
 */
export function VersionsMobileCardStack({
  rows,
  loading = false,
  expandedId,
  onToggleExpand,
  platform,
  onEdit,
}: {
  rows: AppVersion[];
  loading?: boolean;
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  platform: Platform;
  onEdit: (v: AppVersion) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-background p-4 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-44" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const isExpanded = row.id === expandedId;
        return (
          <div
            key={row.id}
            className={cn(
              'rounded-lg border border-border bg-background overflow-hidden',
              isExpanded && 'border-brand-200 dark:border-brand-700/40',
            )}
          >
            <button
              type="button"
              onClick={() => onToggleExpand(row.id)}
              aria-expanded={isExpanded}
              className="w-full text-left px-4 py-3 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-base font-medium">v{row.version}</span>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                      {t(PLATFORM_LABEL_KEY[platform])}
                    </span>
                    {row.forceUpdate && <ForceUpdatePill />}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                    <span title={formatDateTime(row.releasedAt)}>
                      {formatRelative(row.releasedAt)}
                    </span>
                    {row.minSupported && (
                      <span>
                        {t('admin.app-versions.banner.min-supported', {
                          version: row.minSupported,
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-muted-foreground shrink-0 mt-1">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  )}
                </span>
              </div>
              <div className="mt-2">
                <ReleaseNotesPreview notesEn={row.releaseNotesEn} />
              </div>
            </button>
            {isExpanded && (
              <>
                <RowExpanded version={row} />
                <div className="border-t border-border bg-muted/10 px-4 py-3 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => onEdit(row)}>
                    <Pencil className="h-4 w-4 mr-1.5" aria-hidden="true" />
                    {t('admin.app-versions.action.edit')}
                  </Button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
