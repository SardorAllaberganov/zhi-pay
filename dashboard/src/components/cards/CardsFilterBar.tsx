import { useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { SchemeLogo } from '@/components/zhipay/SchemeLogo';
import {
  DateRangePicker,
  formatDateRangeLabel,
} from '@/components/zhipay/DateRangePicker';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { CardScheme, CardStatus } from '@/data/mockCards';
import {
  DEFAULT_CARDS_FILTERS,
  DEFAULT_LAST_USED_RANGE,
  countActiveCardsFilters,
  type CardsFilters,
} from './types';

const SCHEME_OPTIONS: CardScheme[] = ['uzcard', 'humo'];
const STATUS_OPTIONS: CardStatus[] = ['active', 'frozen', 'expired', 'removed'];

interface CardsFilterBarProps {
  filters: CardsFilters;
  setFilters: (next: CardsFilters) => void;
  onSearchInput: (value: string) => void;
  banks: string[];
  countries: string[];
  loading?: boolean;
  searchInputRef?: React.Ref<HTMLInputElement>;
}

export function CardsFilterBar({
  filters,
  setFilters,
  onSearchInput,
  banks,
  countries,
  loading = false,
  searchInputRef,
}: CardsFilterBarProps) {
  const activeCount = countActiveCardsFilters(filters);

  function reset() {
    setFilters({ ...DEFAULT_CARDS_FILTERS });
    onSearchInput('');
  }

  if (loading) {
    return (
      <div className="rounded-md border border-border bg-card px-3 py-3 space-y-3">
        <Skeleton className="h-10 w-full" />
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card px-3 py-3 space-y-3">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          ref={searchInputRef}
          type="search"
          value={filters.search}
          onChange={(e) => onSearchInput(e.target.value)}
          placeholder={t('admin.cards.search-placeholder')}
          aria-label={t('admin.cards.search-placeholder')}
          className="pl-9 h-10 bg-background text-sm shadow-sm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ChipMulti
          label={t('admin.cards.filter.scheme')}
          values={filters.schemes}
          options={SCHEME_OPTIONS}
          renderOption={(s) => (
            <span className="inline-flex items-center gap-2">
              <SchemeLogo scheme={s} size="xs" />
              <span>{t(`admin.cards.scheme.${s}`)}</span>
            </span>
          )}
          renderSummary={(s) => t(`admin.cards.scheme.${s}`)}
          onChange={(next) => setFilters({ ...filters, schemes: next })}
        />

        <ChipMulti
          label={t('admin.cards.filter.status')}
          values={filters.statuses}
          options={STATUS_OPTIONS}
          renderOption={(s) => <span>{t(`admin.cards.status.${s}`)}</span>}
          renderSummary={(s) => t(`admin.cards.status.${s}`)}
          onChange={(next) => setFilters({ ...filters, statuses: next })}
        />

        <ChipMulti
          label={t('admin.cards.filter.bank')}
          values={filters.banks}
          options={banks}
          renderOption={(b) => <span>{b}</span>}
          renderSummary={(b) => b}
          onChange={(next) => setFilters({ ...filters, banks: next })}
          searchable
        />

        <ChipMulti
          label={t('admin.cards.filter.country')}
          values={filters.countries}
          options={countries}
          renderOption={(c) => <span>{c}</span>}
          renderSummary={(c) => c}
          onChange={(next) => setFilters({ ...filters, countries: next })}
        />

        <LastUsedChip
          value={filters.lastUsedRange}
          onChange={(next) => setFilters({ ...filters, lastUsedRange: next })}
        />

        <ToggleChip
          active={filters.lastUsedNeverOnly}
          label={t('admin.cards.filter.never-used')}
          onClick={() => setFilters({ ...filters, lastUsedNeverOnly: !filters.lastUsedNeverOnly })}
        />

        <ToggleChip
          active={filters.defaultOnly}
          label={t('admin.cards.filter.default-only')}
          onClick={() => setFilters({ ...filters, defaultOnly: !filters.defaultOnly })}
        />

        {(activeCount > 0 || filters.search.length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
            {t('admin.cards.filter.clear-all')}
          </Button>
        )}
      </div>
    </div>
  );
}

// =====================================================================
// Chip primitives — locally scoped (mirror Users / AML / KYC).
// =====================================================================

interface ChipMultiProps<T extends string> {
  label: string;
  values: T[];
  options: T[];
  renderOption: (o: T) => React.ReactNode;
  renderSummary: (o: T) => string;
  onChange: (next: T[]) => void;
  searchable?: boolean;
}

function ChipMulti<T extends string>({
  label,
  values,
  options,
  renderOption,
  renderSummary,
  onChange,
  searchable = false,
}: ChipMultiProps<T>) {
  const active = values.length > 0;
  const summary = active
    ? values.length === 1
      ? renderSummary(values[0])
      : `${label} · ${values.length}`
    : label;

  function toggle(option: T) {
    if (values.includes(option)) onChange(values.filter((v) => v !== option));
    else onChange([...values, option]);
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
          <span className="truncate max-w-[180px]">{summary}</span>
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
              {t('admin.cards.filter.clear-all')}
            </button>
          )}
        </div>
        {searchable && options.length > 8 ? (
          <SearchableOptions
            options={options}
            values={values}
            renderOption={renderOption}
            toggle={toggle}
          />
        ) : (
          <div className="p-1.5 space-y-0.5 max-h-64 overflow-y-auto">
            {options.map((opt) => {
              const checked = values.includes(opt);
              return (
                <label
                  key={opt}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm cursor-pointer transition-colors',
                    checked
                      ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 font-medium'
                      : 'hover:bg-muted',
                  )}
                >
                  <Checkbox checked={checked} onCheckedChange={() => toggle(opt)} />
                  <span className="flex-1">{renderOption(opt)}</span>
                </label>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function SearchableOptions<T extends string>({
  options,
  values,
  renderOption,
  toggle,
}: {
  options: T[];
  values: T[];
  renderOption: (o: T) => React.ReactNode;
  toggle: (o: T) => void;
}) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const filtered = q.length === 0 ? options : options.filter((o) => o.toLowerCase().includes(q));
  return (
    <div>
      <div className="px-2 py-1.5 border-b border-border">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('admin.cards.filter.search-placeholder')}
          className="h-8 text-sm"
          autoFocus
        />
      </div>
      <div className="p-1.5 space-y-0.5 max-h-64 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-2 py-3 text-sm text-muted-foreground text-center">
            {t('admin.cards.filter.no-matches')}
          </div>
        ) : (
          filtered.map((opt) => {
            const checked = values.includes(opt);
            return (
              <label
                key={opt}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm cursor-pointer transition-colors',
                  checked
                    ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 font-medium'
                    : 'hover:bg-muted',
                )}
              >
                <Checkbox checked={checked} onCheckedChange={() => toggle(opt)} />
                <span className="flex-1 truncate">{renderOption(opt)}</span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}

// =====================================================================
// Last-used date-range chip — opens the canonical DateRangePicker.
// Active state shows the formatted range label + an X to clear.
// =====================================================================

import type { DateRangeValue } from '@/components/zhipay/DateRangePicker';

interface LastUsedChipProps {
  value: DateRangeValue | undefined;
  onChange: (next: DateRangeValue | undefined) => void;
}

function LastUsedChip({ value, onChange }: LastUsedChipProps) {
  const active = value !== undefined;
  const summary = active
    ? `${t('admin.cards.filter.last-used')} · ${formatDateRangeLabel(value)}`
    : t('admin.cards.filter.last-used');

  // Triggering the picker requires a starting value — fall back to the
  // shared "30 days" default when no filter is currently active.
  const pickerValue = value ?? DEFAULT_LAST_USED_RANGE;

  return (
    <DateRangePicker value={pickerValue} onChange={onChange}>
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
        {active ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onChange(undefined);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onChange(undefined);
              }
            }}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label={t('admin.cards.filter.last-used.clear')}
            className="shrink-0 -mr-1 inline-flex h-4 w-4 items-center justify-center rounded-sm hover:bg-brand-100 dark:hover:bg-brand-900/40"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </span>
        ) : (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
        )}
      </button>
    </DateRangePicker>
  );
}

// =====================================================================
// Generic toggle chip — used for "Default only" + "Never used".
// =====================================================================

interface ToggleChipProps {
  active: boolean;
  label: string;
  onClick: () => void;
}

function ToggleChip({ active, label, onClick }: ToggleChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 h-8 text-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        active
          ? 'border-brand-600 bg-card text-brand-700 dark:text-brand-300 shadow-sm'
          : 'border-border bg-background hover:bg-muted',
      )}
    >
      <span
        className={cn(
          'flex h-3.5 w-3.5 items-center justify-center rounded-sm border',
          active ? 'bg-brand-600 border-brand-600' : 'border-border bg-background',
        )}
        aria-hidden="true"
      >
        {active && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </span>
      <span>{label}</span>
    </button>
  );
}
