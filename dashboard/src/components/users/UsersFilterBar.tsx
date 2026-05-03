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
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type {
  UserKycStatus,
  UserStatus,
  UserTier,
} from '@/data/mockUsers';
import {
  DEFAULT_USERS_FILTERS,
  countActiveUsersFilters,
  type UsersCreatedRange,
  type UsersFilters,
} from './types';

const TIER_OPTIONS: UserTier[] = ['tier_0', 'tier_1', 'tier_2'];
const STATUS_OPTIONS: UserStatus[] = ['active', 'blocked', 'pending', 'deleted'];
const KYC_OPTIONS: UserKycStatus[] = ['pending', 'passed', 'failed', 'expired', 'never'];
const RANGE_OPTIONS: UsersCreatedRange[] = ['all', 'today', '7d', '30d'];

interface UsersFilterBarProps {
  filters: UsersFilters;
  setFilters: (next: UsersFilters) => void;
  onSearchInput: (value: string) => void;
  loading?: boolean;
}

export function UsersFilterBar({
  filters,
  setFilters,
  onSearchInput,
  loading = false,
}: UsersFilterBarProps) {
  const activeCount = countActiveUsersFilters(filters);

  function reset() {
    setFilters({ ...DEFAULT_USERS_FILTERS });
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
          type="search"
          value={filters.search}
          onChange={(e) => onSearchInput(e.target.value)}
          placeholder={t('admin.users.search-placeholder')}
          aria-label={t('admin.users.search-placeholder')}
          className="pl-9 h-10 bg-background text-sm shadow-sm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ChipMulti
          label={t('admin.users.filter.tier')}
          values={filters.tiers}
          options={TIER_OPTIONS}
          renderOption={(s) => t(`admin.users.filter.tier.${s}`)}
          onChange={(next) => setFilters({ ...filters, tiers: next })}
        />

        <ChipMulti
          label={t('admin.users.filter.status')}
          values={filters.statuses}
          options={STATUS_OPTIONS}
          renderOption={(s) => t(`admin.users.filter.status.${s}`)}
          onChange={(next) => setFilters({ ...filters, statuses: next })}
        />

        <ChipMulti
          label={t('admin.users.filter.kyc')}
          values={filters.kycStatuses}
          options={KYC_OPTIONS}
          renderOption={(s) => t(`admin.users.filter.kyc.${s}`)}
          onChange={(next) => setFilters({ ...filters, kycStatuses: next })}
        />

        <ChipSingle
          label={t('admin.users.filter.created')}
          value={filters.createdRange}
          options={RANGE_OPTIONS}
          renderOption={(v) => t(`admin.users.filter.created.${v}`)}
          onChange={(next) => setFilters({ ...filters, createdRange: next })}
        />

        <button
          type="button"
          onClick={() => setFilters({ ...filters, hasOpenAml: !filters.hasOpenAml })}
          aria-pressed={filters.hasOpenAml}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 h-8 text-sm transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            filters.hasOpenAml
              ? 'border-brand-600 bg-card text-brand-700 dark:text-brand-300 shadow-sm'
              : 'border-border bg-background hover:bg-muted',
          )}
        >
          <span
            className={cn(
              'flex h-3.5 w-3.5 items-center justify-center rounded-sm border',
              filters.hasOpenAml
                ? 'bg-brand-600 border-brand-600'
                : 'border-border bg-background',
            )}
            aria-hidden="true"
          >
            {filters.hasOpenAml && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
          </span>
          <span>{t('admin.users.filter.has-aml')}</span>
        </button>

        {(activeCount > 0 || filters.search.length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
            {t('admin.users.filter.clear-all')}
          </Button>
        )}
      </div>
    </div>
  );
}

// =====================================================================
// Chip primitives — local copies (mirror AML/KYC filter bars).
// =====================================================================

interface ChipMultiProps<T extends string> {
  label: string;
  values: T[];
  options: T[];
  renderOption: (o: T) => string;
  onChange: (next: T[]) => void;
}

function ChipMulti<T extends string>({
  label,
  values,
  options,
  renderOption,
  onChange,
}: ChipMultiProps<T>) {
  const active = values.length > 0;
  const summary = active
    ? values.length === 1
      ? renderOption(values[0])
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
          <span className="truncate max-w-[160px]">{summary}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-60 p-0 overflow-hidden">
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
              {t('admin.users.filter.clear-all')}
            </button>
          )}
        </div>
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
      </PopoverContent>
    </Popover>
  );
}

interface ChipSingleProps<T extends string> {
  label: string;
  value: T;
  options: T[];
  renderOption: (o: T) => string;
  onChange: (next: T) => void;
}

function ChipSingle<T extends string>({
  value,
  options,
  renderOption,
  onChange,
  label,
}: ChipSingleProps<T>) {
  const isDefault = value === options[0];
  const summary = isDefault ? label : `${label} · ${renderOption(value)}`;
  const highlight = !isDefault;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 h-8 text-sm transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            highlight
              ? 'border-brand-600 bg-card text-brand-700 dark:text-brand-300 shadow-sm font-medium'
              : 'border-border bg-background hover:bg-muted',
          )}
        >
          <span className="truncate max-w-[200px]">{summary}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={6} className="w-auto min-w-[14rem] p-1.5">
        <div className="space-y-0.5">
          {options.map((opt) => {
            const selected = value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm whitespace-nowrap transition-colors',
                  selected
                    ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 font-medium'
                    : 'hover:bg-muted',
                )}
              >
                <Check
                  className={cn(
                    'h-3.5 w-3.5 shrink-0',
                    selected ? 'opacity-100' : 'opacity-0',
                  )}
                  aria-hidden="true"
                />
                <span>{renderOption(opt)}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
