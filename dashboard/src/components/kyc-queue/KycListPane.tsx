import { forwardRef } from 'react';
import { CheckCircle2, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { KycReview } from '@/data/mockKycQueue';
import type { KycSort } from './types';
import { KycRow } from './KycRow';

interface KycListPaneProps {
  reviews: KycReview[];
  selectedId: string | null;
  focusedIndex: number;
  selectedIds: Set<string>;
  sort: KycSort;
  onSortChange: (next: KycSort) => void;
  onSelect: (id: string) => void;
  onCheckToggle: (id: string) => void;
  onCheckAll: (allChecked: boolean) => void;
  onBulkApprove: () => void;
  onBulkReject: () => void;
  onBulkAssignMe: () => void;
  onClearSelection: () => void;
  loading: boolean;
  hasError: boolean;
  onRetry: () => void;
  totalCount: number;
}

export const KycListPane = forwardRef<HTMLDivElement, KycListPaneProps>(
  function KycListPane(
    {
      reviews,
      selectedId,
      focusedIndex,
      selectedIds,
      sort,
      onSortChange,
      onSelect,
      onCheckToggle,
      onCheckAll,
      onBulkApprove,
      onBulkReject,
      onBulkAssignMe,
      onClearSelection,
      loading,
      hasError,
      onRetry,
      totalCount,
    },
    ref,
  ) {
    const allChecked = reviews.length > 0 && reviews.every((r) => selectedIds.has(r.id));
    const someChecked = selectedIds.size > 0 && !allChecked;
    const checkedCount = selectedIds.size;

    return (
      <div
        ref={ref}
        className="flex flex-col bg-card lg:h-full"
        data-kyc-list-pane
      >
        {/* Header — sort + select-all + count */}
        <div className="flex items-center gap-2.5 border-b border-border px-3 py-2 shrink-0">
          <Checkbox
            checked={allChecked ? true : someChecked ? 'indeterminate' : false}
            onCheckedChange={(value) => onCheckAll(value === true)}
            aria-label="Select all visible rows"
            disabled={reviews.length === 0}
          />

          <div className="flex-1 text-sm text-muted-foreground tabular">
            {loading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <span>
                {reviews.length} of {totalCount}
              </span>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 gap-1">
                {sort === 'newest'
                  ? t('admin.kyc-queue.sort.newest')
                  : t('admin.kyc-queue.sort.oldest')}
                <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSortChange('newest')}>
                {t('admin.kyc-queue.sort.newest')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('oldest')}>
                {t('admin.kyc-queue.sort.oldest')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Body */}
        <div className="flex-1 lg:overflow-y-auto lg:min-h-0" data-kyc-list-body>
          {loading ? (
            <ListSkeleton />
          ) : hasError ? (
            <ErrorState onRetry={onRetry} />
          ) : reviews.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="divide-border">
              {reviews.map((r, i) => (
                <li key={r.id}>
                  <KycRow
                    review={r}
                    selected={r.id === selectedId}
                    focused={i === focusedIndex}
                    checked={selectedIds.has(r.id)}
                    onCheckedChange={onCheckToggle}
                    onSelect={onSelect}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Bulk-action bar — sticky bottom so it pins inside the pane on lg+
            and to the viewport on mobile (main scroll). */}
        {checkedCount > 0 && (
          <div
            className={cn(
              'border-t border-border bg-card shadow-[0_-4px_12px_rgba(0,0,0,0.04)]',
              'flex flex-wrap items-center gap-2 px-3 py-2.5 sticky bottom-0',
            )}
            data-kyc-bulk-bar
          >
            <Button
              size="icon"
              variant="ghost"
              onClick={onClearSelection}
              aria-label={t('admin.kyc-queue.bulk.clear')}
              title={t('admin.kyc-queue.bulk.clear')}
              className="h-8 w-8 shrink-0"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
            <span className="text-sm font-medium tabular shrink-0">
              {t('admin.kyc-queue.bulk.selected', { count: checkedCount })}
            </span>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={onBulkApprove}>
                {t('admin.kyc-queue.bulk.approve')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onBulkReject}
                className="border-danger-600/40 text-danger-700 hover:bg-danger-50 hover:text-danger-700 dark:text-danger-600 dark:hover:bg-danger-700/15"
              >
                {t('admin.kyc-queue.bulk.reject')}
              </Button>
              <Button size="sm" variant="outline" onClick={onBulkAssignMe}>
                {t('admin.kyc-queue.bulk.assign-me')}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  },
);

// =====================================================================
// Loading / empty / error
// =====================================================================

function ListSkeleton() {
  return (
    <ul>
      {Array.from({ length: 8 }).map((_, i) => (
        <li
          key={i}
          className="flex flex-col gap-1.5 border-b border-border px-3 py-2.5"
        >
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-4 w-4 rounded-sm" />
            <Skeleton className="h-4 flex-1 max-w-[160px]" />
            <Skeleton className="h-5 w-16 rounded-sm" />
          </div>
          <div className="flex items-center gap-2 pl-[26px]">
            <Skeleton className="h-5 w-20 rounded-sm" />
            <Skeleton className="h-3.5 flex-1 max-w-[200px]" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-12 h-full">
      <div className="rounded-full bg-success-50 dark:bg-success-700/15 p-3 mb-3">
        <CheckCircle2
          className="h-6 w-6 text-success-700 dark:text-success-600"
          aria-hidden="true"
        />
      </div>
      <h3 className="text-base font-semibold mb-1">
        {t('admin.kyc-queue.empty.cleared')}
      </h3>
      <p className="text-sm text-muted-foreground max-w-[280px]">
        {t('admin.kyc-queue.empty.cleared.body')}
      </p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-12 h-full">
      <div className="rounded-full bg-danger-50 dark:bg-danger-700/15 p-3 mb-3">
        <AlertTriangle
          className="h-6 w-6 text-danger-700 dark:text-danger-600"
          aria-hidden="true"
        />
      </div>
      <h3 className="text-base font-semibold mb-1">
        {t('admin.kyc-queue.error.list.title')}
      </h3>
      <p className="text-sm text-muted-foreground max-w-[280px] mb-4">
        {t('admin.kyc-queue.error.list.body')}
      </p>
      <Button size="sm" onClick={onRetry}>
        {t('admin.kyc-queue.error.list.retry')}
      </Button>
    </div>
  );
}
