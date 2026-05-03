import { useEffect, useState, type RefObject } from 'react';
import { ChevronDown, Search, X, Calendar as CalendarIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DateRangePicker,
  formatDateRangeLabel,
} from '@/components/zhipay/DateRangePicker';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { NotificationAudienceType, NotificationType } from '@/data/mockNotifications';
import {
  AUDIENCE_TYPE_LABEL_KEY,
  AUDIENCE_TYPE_ORDER,
  EMPTY_FILTERS,
  NOTIFICATION_TYPE_LABEL_KEY,
  NOTIFICATION_TYPE_ORDER,
  countActiveFilters,
  type NotificationFilters,
} from '../types';

interface Props {
  filters: NotificationFilters;
  setFilters: (next: NotificationFilters) => void;
  loading?: boolean;
  firstChipRef?: RefObject<HTMLButtonElement>;
  searchInputRef?: RefObject<HTMLInputElement>;
}

export function NotificationsFilterBar({
  filters,
  setFilters,
  loading = false,
  firstChipRef,
  searchInputRef,
}: Props) {
  const activeCount = countActiveFilters(filters);
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
          <Skeleton className="h-8 w-32 rounded-full" />
          <Skeleton className="h-8 w-44 rounded-full" />
        </div>
      </div>
    );
  }

  const dateActive = filters.dateRange.range !== 'today';

  return (
    <div className="rounded-md border border-border bg-card px-3 py-3 space-y-3">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          aria-hidden
        />
        <Input
          ref={searchInputRef}
          type="search"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder={t('admin.notifications.filter.search-placeholder')}
          aria-label={t('admin.notifications.filter.search-placeholder')}
          className="pl-9 h-10 bg-background text-sm shadow-sm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <TypeChipMulti
          values={filters.types}
          onChange={(next) => setFilters({ ...filters, types: next })}
          firstChipRef={firstChipRef}
        />
        <AudienceTypeChipMulti
          values={filters.audienceTypes}
          onChange={(next) => setFilters({ ...filters, audienceTypes: next })}
        />

        <DateRangePicker
          value={filters.dateRange}
          onChange={(next) => setFilters({ ...filters, dateRange: next })}
        >
          <button
            type="button"
            aria-label={`${t('admin.notifications.filter.date-range')}: ${formatDateRangeLabel(filters.dateRange)}`}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 h-8 text-sm transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              dateActive
                ? 'border-brand-600 bg-card text-brand-700 dark:text-brand-300 shadow-sm font-medium'
                : 'border-border bg-background hover:bg-muted',
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
            <span className="truncate max-w-[260px]">
              {dateActive
                ? formatDateRangeLabel(filters.dateRange)
                : t('admin.notifications.filter.date-range')}
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
          </button>
        </DateRangePicker>

        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5 mr-1" aria-hidden />
            {t('admin.notifications.filter.clear-all')}
          </Button>
        )}
      </div>
    </div>
  );
}

function TypeChipMulti({
  values,
  onChange,
  firstChipRef,
}: {
  values: NotificationType[];
  onChange: (next: NotificationType[]) => void;
  firstChipRef?: RefObject<HTMLButtonElement>;
}) {
  const active = values.length > 0;
  const label = t('admin.notifications.filter.type');
  const summary = active
    ? values.length === 1
      ? t(NOTIFICATION_TYPE_LABEL_KEY[values[0]])
      : `${label} · ${values.length}`
    : label;

  function toggle(v: NotificationType) {
    if (values.includes(v)) onChange(values.filter((x) => x !== v));
    else onChange([...values, v]);
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
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
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
              {t('admin.notifications.filter.clear-all')}
            </button>
          )}
        </div>
        <div className="p-1.5 space-y-0.5">
          {NOTIFICATION_TYPE_ORDER.map((v) => {
            const checked = values.includes(v);
            return (
              <label
                key={v}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm cursor-pointer transition-colors',
                  checked
                    ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 font-medium'
                    : 'hover:bg-muted',
                )}
              >
                <Checkbox checked={checked} onCheckedChange={() => toggle(v)} />
                <span className="flex-1">{t(NOTIFICATION_TYPE_LABEL_KEY[v])}</span>
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function AudienceTypeChipMulti({
  values,
  onChange,
}: {
  values: NotificationAudienceType[];
  onChange: (next: NotificationAudienceType[]) => void;
}) {
  const active = values.length > 0;
  const label = t('admin.notifications.filter.audience');
  const summary = active
    ? values.length === 1
      ? t(AUDIENCE_TYPE_LABEL_KEY[values[0]])
      : `${label} · ${values.length}`
    : label;

  function toggle(v: NotificationAudienceType) {
    if (values.includes(v)) onChange(values.filter((x) => x !== v));
    else onChange([...values, v]);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
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
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
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
              {t('admin.notifications.filter.clear-all')}
            </button>
          )}
        </div>
        <div className="p-1.5 space-y-0.5">
          {AUDIENCE_TYPE_ORDER.map((v) => {
            const checked = values.includes(v);
            return (
              <label
                key={v}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm cursor-pointer transition-colors',
                  checked
                    ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 font-medium'
                    : 'hover:bg-muted',
                )}
              >
                <Checkbox checked={checked} onCheckedChange={() => toggle(v)} />
                <span className="flex-1">{t(AUDIENCE_TYPE_LABEL_KEY[v])}</span>
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
