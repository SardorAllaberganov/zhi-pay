import { ChevronDown, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ErrorCodeWithStats } from '@/data/mockErrorCodes';
import { CategoryChip } from './CategoryChip';
import { RetryableChip } from './RetryableChip';
import { RowExpanded } from './RowExpanded';

interface Props {
  rows: ErrorCodeWithStats[];
  totalCount: number;
  loading?: boolean;
  expandedCode: string | null;
  onToggleExpand: (code: string) => void;
}

const MESSAGE_PREVIEW_MAX = 100;

function truncate(text: string, max: number): string {
  const collapsed = text.replace(/\s+/g, ' ').trim();
  if (collapsed.length <= max) return collapsed;
  const cut = collapsed.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

export function ErrorCodesMobileCardStack({
  rows,
  totalCount,
  loading = false,
  expandedCode,
  onToggleExpand,
}: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-background py-12 px-6 text-center">
        <h3 className="text-base font-medium">
          {totalCount === 0
            ? t('admin.error-codes.empty.no-data.title')
            : t('admin.error-codes.empty.no-results.title')}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalCount === 0
            ? t('admin.error-codes.empty.no-data.body')
            : t('admin.error-codes.empty.no-results.body')}
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2.5">
      {rows.map((row) => {
        const isExpanded = row.code === expandedCode;
        return (
          <li
            key={row.code}
            className={cn(
              'rounded-lg border border-border bg-background overflow-hidden',
              isExpanded && 'ring-1 ring-brand-300 dark:ring-brand-700',
            )}
          >
            <button
              type="button"
              onClick={() => onToggleExpand(row.code)}
              className="w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors"
              aria-expanded={isExpanded}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col min-w-0 gap-1.5">
                  <span className="font-mono text-sm tabular tabular-nums truncate">
                    {row.code}
                  </span>
                  <CategoryChip category={row.category} />
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <RetryableChip retryable={row.retryable} />
                  {isExpanded ? (
                    <ChevronDown
                      className="h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                  ) : (
                    <ChevronRight
                      className="h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {truncate(row.message_en, MESSAGE_PREVIEW_MAX)}
              </p>
            </button>
            {isExpanded && <RowExpanded row={row} />}
          </li>
        );
      })}
    </ul>
  );
}
