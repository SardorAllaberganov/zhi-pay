import { Check, ChevronDown, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { KycStatus, KycTier } from '@/types';
import type { KycDocumentType } from '@/data/mockKycQueue';
import {
  DEFAULT_KYC_FILTERS,
  countActiveFilters,
  type KycAgeBucket,
  type KycAssignedFilter,
  type KycFilters,
} from './types';

const STATUS_OPTIONS: KycStatus[] = ['pending', 'passed', 'failed', 'expired'];
const DOC_OPTIONS: KycDocumentType[] = ['passport', 'id_card'];
const TIER_OPTIONS: KycTier[] = ['tier_2'];
const AGE_OPTIONS: KycAgeBucket[] = ['under-1h', 'under-24h', 'over-24h', 'over-7d'];
const ASSIGNED_OPTIONS: KycAssignedFilter[] = ['anyone', 'me', 'unassigned'];

interface KycFilterBarProps {
  filters: KycFilters;
  setFilters: (next: KycFilters) => void;
  loading?: boolean;
}

export function KycFilterBar({
  filters,
  setFilters,
  loading = false,
}: KycFilterBarProps) {
  const activeCount = countActiveFilters(filters);

  function reset() {
    setFilters({ ...DEFAULT_KYC_FILTERS });
  }

  if (loading) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
        <ChipMulti
          label={t('admin.kyc-queue.filter.status')}
          values={filters.statuses}
          options={STATUS_OPTIONS}
          renderOption={(s) => t(`admin.kyc-queue.filter.status.${s}`)}
          onChange={(next) => setFilters({ ...filters, statuses: next })}
        />

        <ChipMulti
          label={t('admin.kyc-queue.filter.document-type')}
          values={filters.documentTypes}
          options={DOC_OPTIONS}
          renderOption={(d) => t(`admin.kyc-queue.filter.document-type.${d}`)}
          onChange={(next) => setFilters({ ...filters, documentTypes: next })}
        />

        <ChipMulti
          label={t('admin.kyc-queue.filter.tier')}
          values={filters.resultingTiers}
          options={TIER_OPTIONS}
          renderOption={(tier) => t(`admin.tier.${tier}`)}
          onChange={(next) => setFilters({ ...filters, resultingTiers: next })}
        />

        <ChipMulti
          label={t('admin.kyc-queue.filter.age')}
          values={filters.ages}
          options={AGE_OPTIONS}
          renderOption={(a) => t(`admin.kyc-queue.filter.age.${a}`)}
          onChange={(next) => setFilters({ ...filters, ages: next })}
        />

        <ChipSingle
          label={t('admin.kyc-queue.filter.assigned')}
          value={filters.assigned}
          options={ASSIGNED_OPTIONS}
          renderOption={(v) => t(`admin.kyc-queue.filter.assigned.${v}`)}
          onChange={(next) => setFilters({ ...filters, assigned: next })}
        />

        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
            {t('admin.kyc-queue.filter.clear-all')}
          </Button>
        )}

    </div>
  );
}

// =====================================================================
// Chip components
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
              ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-medium'
              : 'border-border bg-background hover:bg-muted',
          )}
          data-kyc-chip
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
              {t('admin.kyc-queue.filter.clear-all')}
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
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-medium'
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
  label,
  value,
  options,
  renderOption,
  onChange,
}: ChipSingleProps<T>) {
  // For "assigned": "anyone" is the default — non-default values activate.
  const isDefault = value === options[0];
  const summary = isDefault ? label : `${label} · ${renderOption(value)}`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 h-8 text-sm transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            !isDefault
              ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-medium'
              : 'border-border bg-background hover:bg-muted',
          )}
          data-kyc-chip
        >
          <span className="truncate max-w-[180px]">{summary}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-auto min-w-[14rem] p-1.5">
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
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-medium'
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
