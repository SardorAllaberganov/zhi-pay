import { ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatDateTime } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { BlacklistEntry } from '@/data/mockBlacklist';
import { getAffectedSummary } from '@/data/mockBlacklist';
import { IdentityCell } from './IdentityCell';
import { ExpiryCell } from './ExpiryCell';
import { SeverityChip } from './SeverityChip';
import { StatusChip } from './StatusChip';

interface Props {
  rows: BlacklistEntry[];
  loading: boolean;
  onRowClick: (id: string) => void;
}

function truncate80(s: string): string {
  return s.length <= 80 ? s : `${s.slice(0, 80)}…`;
}

export function BlacklistMobileCardStack({ rows, loading, onRowClick }: Props) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-md border border-border bg-card p-3 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-border bg-card px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          {t('admin.blacklist.empty.body')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => {
        const affected = getAffectedSummary(row);
        return (
          <button
            key={row.id}
            type="button"
            onClick={() => onRowClick(row.id)}
            className={cn(
              'w-full text-left rounded-md border border-border bg-card p-3 space-y-2',
              'transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <IdentityCell type={row.type} identifier={row.identifier} />
              <ChevronRight
                className="h-4 w-4 text-muted-foreground shrink-0"
                aria-hidden="true"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <SeverityChip severity={row.severity} />
              <StatusChip entry={row} />
              {affected.total > 0 && (
                <span className="text-sm text-muted-foreground">
                  · {t('admin.blacklist.row.affecting-n', { count: affected.total })}
                </span>
              )}
            </div>
            <p className="text-sm text-foreground/90 line-clamp-2">
              {truncate80(row.reason)}
            </p>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{formatDateTime(row.createdAt)}</span>
              <ExpiryCell entry={row} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
