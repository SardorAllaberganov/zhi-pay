import { ChevronDown, Search, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  DateRangePicker,
  formatDateRangeLabel,
  type DateRangeValue,
} from '@/components/zhipay/DateRangePicker';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { BLACKLIST_ADMIN_POOL } from '@/data/mockBlacklist';
import {
  DEFAULT_FILTER,
  countActiveBlacklistFilters,
  type BlacklistFilterState,
  type BlacklistStatusFilter,
} from './types';

const STATUS_OPTIONS: BlacklistStatusFilter[] = ['active', 'expired'];

interface Props {
  filter: BlacklistFilterState;
  setFilter: (next: BlacklistFilterState) => void;
  loading?: boolean;
  searchPlaceholder: string;
  /** Hotkey `f` focuses this input. */
  searchInputRef?: React.RefObject<HTMLInputElement>;
}

export function BlacklistFilterBar({
  filter,
  setFilter,
  loading = false,
  searchPlaceholder,
  searchInputRef,
}: Props) {
  const activeCount = countActiveBlacklistFilters(filter);

  function reset() {
    setFilter({ ...DEFAULT_FILTER, addedBy: [], createdRange: null });
  }

  if (loading) {
    return (
      <div className="rounded-md border border-border bg-card px-3 py-3 space-y-3">
        <Skeleton className="h-10 w-full" />
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-28 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card px-3 py-3 space-y-3 lg:sticky lg:top-0 lg:z-20">
      {/* Search row */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          ref={searchInputRef}
          type="search"
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          placeholder={searchPlaceholder}
          aria-label={t('admin.blacklist.filter.search')}
          className="pl-9 h-10 bg-background text-sm shadow-sm"
        />
        {filter.search.length > 0 && (
          <button
            type="button"
            onClick={() => setFilter({ ...filter, search: '' })}
            aria-label={t('admin.blacklist.filter.clear-search')}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Chip row */}
      <div className="flex flex-wrap items-center gap-2">
        <ChipSingle<BlacklistStatusFilter>
          label={t('admin.blacklist.filter.status')}
          value={filter.status}
          options={STATUS_OPTIONS}
          renderOption={(o) => <span>{t(`admin.blacklist.status.${o}`)}</span>}
          renderSummary={(o) => t(`admin.blacklist.status.${o}`)}
          onChange={(next) => setFilter({ ...filter, status: next })}
          activeIfNotDefault={(v) => v !== DEFAULT_FILTER.status}
        />

        <ChipMulti
          label={t('admin.blacklist.filter.added-by')}
          values={filter.addedBy}
          options={BLACKLIST_ADMIN_POOL.map((a) => ({ id: a.id, label: a.name }))}
          onChange={(next) => setFilter({ ...filter, addedBy: next })}
        />

        <DateRangeChip
          value={filter.createdRange}
          onChange={(next) => setFilter({ ...filter, createdRange: next })}
        />

        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
            {t('admin.blacklist.filter.clear-all')}
          </Button>
        )}
      </div>
    </div>
  );
}

// =====================================================================
// Single-value chip
// =====================================================================

interface ChipSingleProps<T extends string> {
  label: string;
  value: T;
  options: T[];
  renderOption: (o: T) => React.ReactNode;
  renderSummary: (o: T) => string;
  onChange: (next: T) => void;
  activeIfNotDefault: (v: T) => boolean;
}

function ChipSingle<T extends string>({
  label,
  value,
  options,
  renderOption,
  renderSummary,
  onChange,
  activeIfNotDefault,
}: ChipSingleProps<T>) {
  const active = activeIfNotDefault(value);
  const summary = active ? renderSummary(value) : label;
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
          <span className="truncate max-w-[180px]">{summary}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-56 p-1.5">
        <div className="space-y-0.5">
          {options.map((opt) => {
            const checked = value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={cn(
                  'flex w-full items-center justify-between rounded-md px-2 py-2 text-sm cursor-pointer transition-colors',
                  checked
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-medium'
                    : 'hover:bg-muted',
                )}
              >
                {renderOption(opt)}
                {checked && <span className="text-brand-600">✓</span>}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// =====================================================================
// Multi-value chip — generic over { id, label } options
// =====================================================================

interface ChipMultiOption {
  id: string;
  label: string;
}
interface ChipMultiProps {
  label: string;
  values: string[];
  options: ChipMultiOption[];
  onChange: (next: string[]) => void;
}

function ChipMulti({ label, values, options, onChange }: ChipMultiProps) {
  const active = values.length > 0;
  const summary = active
    ? values.length === 1
      ? options.find((o) => o.id === values[0])?.label ?? label
      : `${label} · ${values.length}`
    : label;

  function toggle(id: string) {
    if (values.includes(id)) onChange(values.filter((v) => v !== id));
    else onChange([...values, id]);
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
              ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-medium'
              : 'border-border bg-background hover:bg-muted',
          )}
        >
          <span className="truncate max-w-[200px]">{summary}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-64 p-0 overflow-hidden">
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
              {t('admin.blacklist.filter.clear-all')}
            </button>
          )}
        </div>
        <div className="p-1.5 space-y-0.5 max-h-64 overflow-y-auto">
          {options.map((opt) => {
            const checked = values.includes(opt.id);
            return (
              <label
                key={opt.id}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm cursor-pointer transition-colors',
                  checked
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-medium'
                    : 'hover:bg-muted',
                )}
              >
                <Checkbox checked={checked} onCheckedChange={() => toggle(opt.id)} />
                <span className="flex-1">{opt.label}</span>
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// =====================================================================
// Created date-range chip — wraps DateRangePicker
// =====================================================================

function DateRangeChip({
  value,
  onChange,
}: {
  value: DateRangeValue | null;
  onChange: (next: DateRangeValue | null) => void;
}) {
  const active = value !== null;
  // Picker always needs a non-null value — use 30d as the placeholder when
  // the filter is unset. Toggling back to "all" via the active-chip clear
  // button below the chip is the formal opt-out.
  const adapter: DateRangeValue = value ?? { range: '30d' };
  return (
    <div className="inline-flex items-center">
      <DateRangePicker value={adapter} onChange={onChange}>
        <button
          type="button"
          aria-label={`${t('admin.blacklist.filter.created')}: ${active ? formatDateRangeLabel(adapter) : t('admin.blacklist.filter.created')}`}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 h-8 text-sm transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            active
              ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-medium rounded-r-none border-r-0'
              : 'border-border bg-background hover:bg-muted',
          )}
        >
          <span className="truncate max-w-[180px]">
            {active ? formatDateRangeLabel(adapter) : t('admin.blacklist.filter.created')}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
        </button>
      </DateRangePicker>
      {active && (
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label={t('admin.blacklist.filter.clear-created')}
          className="inline-flex h-8 w-7 items-center justify-center rounded-r-full border border-l-0 border-brand-600 bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-950/40 dark:text-brand-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
