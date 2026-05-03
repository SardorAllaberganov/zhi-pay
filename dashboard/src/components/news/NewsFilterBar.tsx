import { useEffect, useState, type RefObject } from 'react';
import { ChevronDown, Search, X, Calendar as CalendarIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DateRangePicker,
  formatDateRangeLabel,
} from '@/components/zhipay/DateRangePicker';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { NewsStatus } from '@/data/mockNews';
import {
  NEWS_STATUS_LABEL_KEY,
  NEWS_STATUS_ORDER,
  EMPTY_FILTERS,
  countActiveFilters,
  type NewsFilters,
} from './types';

interface Props {
  filters: NewsFilters;
  setFilters: (next: NewsFilters) => void;
  loading?: boolean;
  /** `f` page-scoped hotkey focuses this button. */
  firstChipRef?: RefObject<HTMLButtonElement>;
  /** `/` page-scoped hotkey focuses this input. */
  searchInputRef?: RefObject<HTMLInputElement>;
}

export function NewsFilterBar({
  filters,
  setFilters,
  loading = false,
  firstChipRef,
  searchInputRef,
}: Props) {
  const activeCount = countActiveFilters(filters);
  // Local input value debounced into `filters.search`
  const [localSearch, setLocalSearch] = useState(filters.search);

  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (localSearch === filters.search) return;
    const id = setTimeout(() => {
      setFilters({ ...filters, search: localSearch });
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);

  function reset() {
    setFilters({ ...EMPTY_FILTERS, dateRange: { ...EMPTY_FILTERS.dateRange } });
    setLocalSearch('');
  }

  if (loading) {
    return (
      <div className="rounded-md border border-border bg-card px-3 py-3 space-y-3">
        <Skeleton className="h-10 w-full" />
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-8 w-32 rounded-full" />
          <Skeleton className="h-8 w-44 rounded-full" />
        </div>
      </div>
    );
  }

  const dateActive = filters.dateRange.range !== 'today';

  return (
    <div className="rounded-md border border-border bg-card px-3 py-3 space-y-3">
      {/* Wide debounced search — canonical filter-bar pattern (carded shell) */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          ref={searchInputRef}
          type="search"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder={t('admin.news.filter.search-placeholder')}
          aria-label={t('admin.news.filter.search-placeholder')}
          className="pl-9 h-10 bg-background text-sm shadow-sm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusChipMulti
          values={filters.statuses}
          onChange={(next) => setFilters({ ...filters, statuses: next })}
          firstChipRef={firstChipRef}
        />

        {/* Date-range chip — inline button so Radix asChild forwards onClick+ref */}
        <DateRangePicker
          value={filters.dateRange}
          onChange={(next) => setFilters({ ...filters, dateRange: next })}
        >
          <button
            type="button"
            aria-label={`${t('admin.news.filter.date-range')}: ${formatDateRangeLabel(filters.dateRange)}`}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 h-8 text-sm transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              dateActive
                ? 'border-brand-600 bg-card text-brand-700 dark:text-brand-300 shadow-sm font-medium'
                : 'border-border bg-background hover:bg-muted',
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
            <span className="truncate max-w-[260px]">
              {dateActive
                ? formatDateRangeLabel(filters.dateRange)
                : t('admin.news.filter.date-range')}
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
          </button>
        </DateRangePicker>

        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
            {t('admin.news.filter.clear-all')}
          </Button>
        )}
      </div>
    </div>
  );
}

// =====================================================================

function StatusChipMulti({
  values,
  onChange,
  firstChipRef,
}: {
  values: NewsStatus[];
  onChange: (next: NewsStatus[]) => void;
  firstChipRef?: RefObject<HTMLButtonElement>;
}) {
  const active = values.length > 0;
  const label = t('admin.news.filter.status');
  const summary = active
    ? values.length === 1
      ? t(NEWS_STATUS_LABEL_KEY[values[0]])
      : `${label} · ${values.length}`
    : label;

  function toggle(s: NewsStatus) {
    if (values.includes(s)) onChange(values.filter((v) => v !== s));
    else onChange([...values, s]);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          ref={firstChipRef}
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 h-8 text-sm transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            active
              ? 'border-brand-600 bg-card text-brand-700 dark:text-brand-300 shadow-sm font-medium'
              : 'border-border bg-background hover:bg-muted',
          )}
        >
          <span className="truncate max-w-[200px]">{summary}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-56 p-0 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {label}
          </span>
          {active && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('admin.news.filter.clear-all')}
            </button>
          )}
        </div>
        <div className="p-1.5 space-y-0.5">
          {NEWS_STATUS_ORDER.map((s) => {
            const checked = values.includes(s);
            return (
              <label
                key={s}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm cursor-pointer transition-colors',
                  checked
                    ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 font-medium'
                    : 'hover:bg-muted',
                )}
              >
                <Checkbox checked={checked} onCheckedChange={() => toggle(s)} />
                <span className="flex-1">{t(NEWS_STATUS_LABEL_KEY[s])}</span>
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
