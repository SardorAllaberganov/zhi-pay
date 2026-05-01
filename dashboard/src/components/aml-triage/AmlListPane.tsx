import { forwardRef } from 'react';
import {
  ShieldCheck,
  X,
  AlertTriangle,
  ArrowDownUp,
  ChevronDown,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { AmlReview } from '@/data/mockAmlTriage';
import type { AmlSort } from './types';
import { AmlRow } from './AmlRow';

const SORT_OPTIONS: AmlSort[] = ['severity-age', 'newest', 'oldest'];

interface AmlListPaneProps {
  reviews: AmlReview[];
  selectedId: string | null;
  focusedIndex: number;
  selectedIds: Set<string>;
  sort: AmlSort;
  onSortChange: (next: AmlSort) => void;
  onSelect: (id: string) => void;
  onCheckToggle: (id: string) => void;
  onCheckAll: (allChecked: boolean) => void;
  onBulkAssignMe: () => void;
  onClearSelection: () => void;
  loading: boolean;
  hasError: boolean;
  onRetry: () => void;
  totalCount: number;
}

export const AmlListPane = forwardRef<HTMLDivElement, AmlListPaneProps>(
  function AmlListPane(
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
      <div ref={ref} className="flex flex-col bg-card lg:h-full" data-aml-list-pane>
        {/* Header — select-all + count + sort */}
        <div className="flex items-center gap-2.5 border-b border-border px-3 py-2 shrink-0">
          <Checkbox
            checked={allChecked ? true : someChecked ? 'indeterminate' : false}
            onCheckedChange={(value) => onCheckAll(value === true)}
            aria-label="Select all visible flags"
            disabled={reviews.length === 0}
          />
          <div className="flex-1 text-sm text-muted-foreground tabular min-w-0">
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
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 -mr-1 text-muted-foreground hover:text-foreground"
              >
                <ArrowDownUp className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
                <span className="truncate max-w-[140px]">
                  {t(`admin.aml-triage.sort.${sort === 'severity-age' ? 'severity-age' : sort}`)}
                </span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[12rem]">
              {SORT_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt}
                  onClick={() => onSortChange(opt)}
                  className="gap-2"
                >
                  <Check
                    className={cn(
                      'h-3.5 w-3.5 shrink-0',
                      sort === opt ? 'opacity-100 text-brand-700 dark:text-brand-300' : 'opacity-0',
                    )}
                    aria-hidden="true"
                  />
                  <span>
                    {t(`admin.aml-triage.sort.${opt === 'severity-age' ? 'severity-age' : opt}`)}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Body — internal scroll only on lg+; mobile lets main scroll the page. */}
        <div className="flex-1 lg:overflow-y-auto lg:min-h-0" data-aml-list-body>
          {loading ? (
            <ListSkeleton />
          ) : hasError ? (
            <ErrorState onRetry={onRetry} />
          ) : reviews.length === 0 ? (
            totalCount === 0 ? <EmptyAllClear /> : <EmptyFiltered />
          ) : (
            <ul>
              {reviews.map((r, i) => (
                <li key={r.id}>
                  <AmlRow
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
            data-aml-bulk-bar
          >
            <Button
              size="icon"
              variant="ghost"
              onClick={onClearSelection}
              aria-label={t('admin.aml-triage.bulk.clear')}
              title={t('admin.aml-triage.bulk.clear')}
              className="h-8 w-8 shrink-0"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
            <span className="text-sm font-medium tabular shrink-0">
              {t('admin.aml-triage.bulk.selected', { count: checkedCount })}
            </span>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" onClick={onBulkAssignMe}>
                {t('admin.aml-triage.bulk.assign-me')}
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
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-sm" />
            <Skeleton className="h-5 w-16 rounded-sm" />
            <Skeleton className="h-5 w-20 rounded-sm" />
            <div className="ml-auto flex items-center gap-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-5 w-16 rounded-sm" />
            </div>
          </div>
          <Skeleton className="h-3.5 ml-[26px] w-3/5" />
          <Skeleton className="h-3.5 ml-[26px] w-4/5" />
        </li>
      ))}
    </ul>
  );
}

function EmptyAllClear() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-12 h-full">
      <div className="rounded-full bg-success-50 dark:bg-success-700/15 p-3 mb-3">
        <ShieldCheck
          className="h-6 w-6 text-success-700 dark:text-success-600"
          aria-hidden="true"
        />
      </div>
      <h3 className="text-base font-semibold mb-1">
        {t('admin.aml-triage.empty.cleared')}
      </h3>
      <p className="text-sm text-muted-foreground max-w-[280px]">
        {t('admin.aml-triage.empty.cleared.body')}
      </p>
    </div>
  );
}

function EmptyFiltered() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-12 h-full">
      <h3 className="text-base font-semibold mb-1">
        {t('admin.aml-triage.empty.no-results.title')}
      </h3>
      <p className="text-sm text-muted-foreground max-w-[280px]">
        {t('admin.aml-triage.empty.no-results.body')}
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
        {t('admin.aml-triage.error.list.title')}
      </h3>
      <p className="text-sm text-muted-foreground max-w-[280px] mb-4">
        {t('admin.aml-triage.error.list.body')}
      </p>
      <Button size="sm" onClick={onRetry}>
        {t('admin.aml-triage.error.list.retry')}
      </Button>
    </div>
  );
}
