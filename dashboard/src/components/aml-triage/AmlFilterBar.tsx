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
import type { AmlFlagStatus, AmlSeverity } from '@/types';
import type { AmlFlagType } from '@/data/mockAmlTriage';
import {
  DEFAULT_AML_FILTERS,
  countActiveFilters,
  type AmlAssignedFilter,
  type AmlFilters,
} from './types';

const SEVERITY_OPTIONS: AmlSeverity[] = ['info', 'warning', 'critical'];
const TYPE_OPTIONS: AmlFlagType[] = ['velocity', 'amount', 'pattern', 'sanctions', 'manual'];
const STATUS_OPTIONS: AmlFlagStatus[] = ['open', 'reviewing', 'cleared', 'escalated'];
const ASSIGNED_OPTIONS: AmlAssignedFilter[] = ['anyone', 'me', 'unassigned'];

interface AmlFilterBarProps {
  filters: AmlFilters;
  setFilters: (next: AmlFilters) => void;
  loading?: boolean;
}

export function AmlFilterBar({
  filters,
  setFilters,
  loading = false,
}: AmlFilterBarProps) {
  const activeCount = countActiveFilters(filters);

  function reset() {
    setFilters({ ...DEFAULT_AML_FILTERS });
  }

  if (loading) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ChipMulti
        label={t('admin.aml-triage.filter.severity')}
        values={filters.severities}
        options={SEVERITY_OPTIONS}
        renderOption={(s) => t(`admin.aml-triage.filter.severity.${s}`)}
        onChange={(next) => setFilters({ ...filters, severities: next })}
      />

      <ChipMulti
        label={t('admin.aml-triage.filter.type')}
        values={filters.types}
        options={TYPE_OPTIONS}
        renderOption={(s) => t(`admin.aml-triage.filter.type.${s}`)}
        onChange={(next) => setFilters({ ...filters, types: next })}
      />

      <ChipMulti
        label={t('admin.aml-triage.filter.status')}
        values={filters.statuses}
        options={STATUS_OPTIONS}
        renderOption={(s) => t(`admin.aml-triage.filter.status.${s}`)}
        onChange={(next) => setFilters({ ...filters, statuses: next })}
      />

      <ChipSingle
        label={t('admin.aml-triage.filter.assigned')}
        value={filters.assigned}
        options={ASSIGNED_OPTIONS}
        renderOption={(v) => t(`admin.aml-triage.filter.assigned.${v}`)}
        onChange={(next) => setFilters({ ...filters, assigned: next })}
      />

      <button
        type="button"
        onClick={() => setFilters({ ...filters, hasTransfer: !filters.hasTransfer })}
        aria-pressed={filters.hasTransfer}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-3 h-8 text-sm transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          filters.hasTransfer
            ? 'border-brand-600 bg-card text-brand-700 dark:text-brand-300 shadow-sm'
            : 'border-border bg-background hover:bg-muted',
        )}
      >
        <span
          className={cn(
            'flex h-3.5 w-3.5 items-center justify-center rounded-sm border',
            filters.hasTransfer
              ? 'bg-brand-600 border-brand-600'
              : 'border-border bg-background',
          )}
          aria-hidden="true"
        >
          {filters.hasTransfer && (
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          )}
        </span>
        <span>{t('admin.aml-triage.filter.has-transfer')}</span>
      </button>

      {activeCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
          {t('admin.aml-triage.filter.clear-all')}
        </Button>
      )}

    </div>
  );
}

// =====================================================================
// Chip components — same shape as the KYC Queue versions, kept local so
// they can drift if AML needs different visuals later.
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
        {/* Header with label + Clear */}
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
              {t('admin.aml-triage.filter.clear-all')}
            </button>
          )}
        </div>

        {/* Options */}
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
      <PopoverContent
        align="end"
        sideOffset={6}
        className="w-auto min-w-[14rem] p-1.5"
      >
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
