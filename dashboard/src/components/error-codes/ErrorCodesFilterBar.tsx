import { ChevronDown, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import {
  ERROR_CATEGORIES,
  type ErrorCategory,
} from '@/data/mockErrorCodes';
import {
  CATEGORY_LABEL_KEY,
  DEFAULT_ERROR_CODE_FILTERS,
  countActiveFilters,
  type ErrorCodeFilters,
  type RetryableFilter,
} from './types';

interface Props {
  filters: ErrorCodeFilters;
  setFilters: (next: ErrorCodeFilters) => void;
  loading?: boolean;
  searchInputRef?: React.RefObject<HTMLInputElement>;
  /** `f` page-scoped hotkey focuses this button. */
  firstChipRef?: React.RefObject<HTMLButtonElement>;
}

const RETRYABLE_OPTIONS: RetryableFilter[] = ['any', 'yes', 'no'];

export function ErrorCodesFilterBar({
  filters,
  setFilters,
  loading = false,
  searchInputRef,
  firstChipRef,
}: Props) {
  const activeCount = countActiveFilters(filters);

  function reset() {
    setFilters({ ...DEFAULT_ERROR_CODE_FILTERS });
  }

  if (loading) {
    return (
      <div className="rounded-md border border-border bg-card px-3 py-3 space-y-3">
        <Skeleton className="h-10 w-full" />
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-8 w-32 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card px-3 py-3 space-y-3">
      {/* Search row — canonical full-width input matching audit-log /
          users / cards / recipients pattern. */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          ref={searchInputRef}
          type="search"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder={t('admin.error-codes.filter.search-placeholder')}
          aria-label={t('admin.error-codes.filter.search-aria')}
          className="pl-9 h-10 bg-background text-sm shadow-sm"
        />
        {filters.search.length > 0 && (
          <button
            type="button"
            onClick={() => setFilters({ ...filters, search: '' })}
            aria-label={t('admin.error-codes.filter.clear-search')}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Chip row */}
      <div className="flex flex-wrap items-center gap-2">
        <CategoryChipMulti
          values={filters.categories}
          onChange={(next) => setFilters({ ...filters, categories: next })}
          firstChipRef={firstChipRef}
        />

        <RetryableChipSingle
          value={filters.retryable}
          onChange={(next) => setFilters({ ...filters, retryable: next })}
        />

        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
            {t('admin.error-codes.filter.clear-all')}
          </Button>
        )}
      </div>
    </div>
  );
}

// =====================================================================

function CategoryChipMulti({
  values,
  onChange,
  firstChipRef,
}: {
  values: ErrorCategory[];
  onChange: (next: ErrorCategory[]) => void;
  firstChipRef?: React.RefObject<HTMLButtonElement>;
}) {
  const active = values.length > 0;
  const label = t('admin.error-codes.filter.category');
  const summary = active
    ? values.length === 1
      ? t(CATEGORY_LABEL_KEY[values[0]])
      : `${label} · ${values.length}`
    : label;

  function toggle(c: ErrorCategory) {
    if (values.includes(c)) onChange(values.filter((v) => v !== c));
    else onChange([...values, c]);
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
              ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-medium'
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
              {t('admin.error-codes.filter.clear-all')}
            </button>
          )}
        </div>
        <div className="p-1.5 space-y-0.5">
          {ERROR_CATEGORIES.map((c) => {
            const checked = values.includes(c);
            return (
              <label
                key={c}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm cursor-pointer transition-colors',
                  checked
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-medium'
                    : 'hover:bg-muted',
                )}
              >
                <Checkbox checked={checked} onCheckedChange={() => toggle(c)} />
                <span className="flex-1">{t(CATEGORY_LABEL_KEY[c])}</span>
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function RetryableChipSingle({
  value,
  onChange,
}: {
  value: RetryableFilter;
  onChange: (next: RetryableFilter) => void;
}) {
  const active = value !== 'any';
  const label = t('admin.error-codes.filter.retryable');
  const summary = active
    ? `${label} · ${t(`admin.error-codes.retryable.${value}`)}`
    : label;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 h-8 text-sm transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            active
              ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-medium'
              : 'border-border bg-background hover:bg-muted',
          )}
        >
          <span className="truncate max-w-[200px]">{summary}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-44 p-1">
        {RETRYABLE_OPTIONS.map((opt) => {
          const isActive = opt === value;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={cn(
                'w-full flex items-center justify-between rounded-md px-2 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-medium'
                  : 'hover:bg-muted',
              )}
            >
              <span>{t(`admin.error-codes.retryable.${opt}`)}</span>
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
