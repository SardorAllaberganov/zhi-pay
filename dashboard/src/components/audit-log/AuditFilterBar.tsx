import { useState } from 'react';
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
import type {
  AuditAction,
  AuditActorType,
  AuditEntityType,
} from '@/data/mockAuditLog';
import {
  DEFAULT_AUDIT_FILTERS,
  countActiveAuditFilters,
  type AuditFilters,
} from './types';

const ACTOR_TYPE_OPTIONS: AuditActorType[] = ['system', 'user', 'provider', 'admin'];

const ENTITY_TYPE_OPTIONS: AuditEntityType[] = [
  'transfer',
  'user',
  'card',
  'kyc',
  'aml',
  'blacklist',
  'fx',
  'commission',
  'service',
  'app_version',
  'story',
  'notification',
];

const ACTION_OPTIONS: AuditAction[] = [
  'created',
  'updated',
  'deleted',
  'status_changed',
  'approved',
  'rejected',
  'cleared',
  'escalated',
  'frozen',
  'unfrozen',
  'reversed',
  'failed',
];

interface AdminActorOption {
  id: string;
  name: string;
}

interface AuditFilterBarProps {
  filters: AuditFilters;
  setFilters: (next: AuditFilters) => void;
  adminOptions: AdminActorOption[];
  loading?: boolean;
  /** Visual-only — `f` hotkey focuses this button. */
  firstChipRef?: React.RefObject<HTMLButtonElement>;
}

export function AuditFilterBar({
  filters,
  setFilters,
  adminOptions,
  loading = false,
  firstChipRef,
}: AuditFilterBarProps) {
  const activeCount = countActiveAuditFilters(filters);

  function reset() {
    setFilters({ ...DEFAULT_AUDIT_FILTERS });
  }

  if (loading) {
    return (
      <div className="rounded-md border border-border bg-card px-3 py-3 space-y-3">
        <Skeleton className="h-10 w-full" />
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-28 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card px-3 py-3 space-y-3">
      {/* Search row — canonical full-width entity-ref input matching
          Users / Cards / Recipients pattern. */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={filters.entityRef}
          onChange={(e) => setFilters({ ...filters, entityRef: e.target.value })}
          placeholder={t('admin.audit-log.filter.entity-ref-placeholder')}
          aria-label={t('admin.audit-log.filter.entity-ref')}
          className="pl-9 h-10 bg-background text-sm shadow-sm"
        />
        {filters.entityRef.length > 0 && (
          <button
            type="button"
            onClick={() => setFilters({ ...filters, entityRef: '' })}
            aria-label={t('admin.audit-log.filter.clear-search')}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Chip row */}
      <div className="flex flex-wrap items-center gap-2">
        <DateRangeChip
          value={filters.dateRange}
          onChange={(next) => setFilters({ ...filters, dateRange: next })}
          firstChipRef={firstChipRef}
        />

        <ChipMulti
          label={t('admin.audit-log.filter.actor-type')}
          values={filters.actorTypes}
          options={ACTOR_TYPE_OPTIONS}
          renderOption={(o) => <span>{t(`admin.audit-log.actor-type.${o}`)}</span>}
          renderSummary={(o) => t(`admin.audit-log.actor-type.${o}`)}
          onChange={(next) => setFilters({ ...filters, actorTypes: next })}
        />

        <AdminActorChip
          adminOptions={adminOptions}
          values={filters.adminActorIds}
          onChange={(next) => setFilters({ ...filters, adminActorIds: next })}
        />

        <ChipMulti
          label={t('admin.audit-log.filter.entity-type')}
          values={filters.entityTypes}
          options={ENTITY_TYPE_OPTIONS}
          renderOption={(o) => <span>{t(`admin.audit-log.entity-type.${o}`)}</span>}
          renderSummary={(o) => t(`admin.audit-log.entity-type.${o}`)}
          onChange={(next) => setFilters({ ...filters, entityTypes: next })}
        />

        <ChipMulti
          label={t('admin.audit-log.filter.action')}
          values={filters.actions}
          options={ACTION_OPTIONS}
          renderOption={(o) => <span>{t(`admin.audit-log.action.${o}`)}</span>}
          renderSummary={(o) => t(`admin.audit-log.action.${o}`)}
          onChange={(next) => setFilters({ ...filters, actions: next })}
        />

        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
            {t('admin.audit-log.filter.clear-all')}
          </Button>
        )}
      </div>
    </div>
  );
}

// =====================================================================
// Date-range chip — wraps the canonical DateRangePicker as `children`
// =====================================================================

interface DateRangeChipProps {
  value: DateRangeValue;
  onChange: (next: DateRangeValue) => void;
  firstChipRef?: React.RefObject<HTMLButtonElement>;
}

function DateRangeChip({ value, onChange, firstChipRef }: DateRangeChipProps) {
  // "today" is the default — treat it as inactive in the chip styling so the
  // rest of the chip strip stays calm. Any other range light up brand colors.
  const active = value.range !== 'today';
  return (
    <DateRangePicker value={value} onChange={onChange}>
      <button
        ref={firstChipRef}
        type="button"
        aria-label={`${t('admin.audit-log.filter.date-range')}: ${formatDateRangeLabel(value)}`}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-3 h-8 text-sm transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          active
            ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-medium'
            : 'border-border bg-background hover:bg-muted',
        )}
      >
        <span className="truncate max-w-[180px]">{formatDateRangeLabel(value)}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
      </button>
    </DateRangePicker>
  );
}

// =====================================================================
// Generic multi-chip
// =====================================================================

interface ChipMultiProps<T extends string> {
  label: string;
  values: T[];
  options: T[];
  renderOption: (o: T) => React.ReactNode;
  renderSummary: (o: T) => string;
  onChange: (next: T[]) => void;
}

function ChipMulti<T extends string>({
  label,
  values,
  options,
  renderOption,
  renderSummary,
  onChange,
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
              ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-medium'
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
              {t('admin.audit-log.filter.clear-all')}
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

// =====================================================================
// Admin actor chip — searchable multi-select keyed by stable admin id
// =====================================================================

interface AdminActorChipProps {
  adminOptions: AdminActorOption[];
  values: string[];
  onChange: (next: string[]) => void;
}

function AdminActorChip({ adminOptions, values, onChange }: AdminActorChipProps) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const filtered =
    q.length === 0
      ? adminOptions
      : adminOptions.filter(
          (a) => a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q),
        );
  const active = values.length > 0;
  const label = t('admin.audit-log.filter.admin-actor');
  const summary = active
    ? values.length === 1
      ? adminOptions.find((a) => a.id === values[0])?.name ?? values[0]
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
          <span className="truncate max-w-[180px]">{summary}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-72 p-0 overflow-hidden">
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
              {t('admin.audit-log.filter.clear-all')}
            </button>
          )}
        </div>
        <div className="px-2 py-1.5 border-b border-border">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('admin.audit-log.filter.admin-search-placeholder')}
            className="h-8 text-sm"
            autoFocus
          />
        </div>
        <div className="p-1.5 space-y-0.5 max-h-64 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-2 py-3 text-sm text-muted-foreground text-center">
              {t('admin.audit-log.filter.admin-no-matches')}
            </div>
          ) : (
            filtered.map((a) => {
              const checked = values.includes(a.id);
              return (
                <label
                  key={a.id}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm cursor-pointer transition-colors',
                    checked
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-medium'
                      : 'hover:bg-muted',
                  )}
                >
                  <Checkbox checked={checked} onCheckedChange={() => toggle(a.id)} />
                  <span className="flex-1 flex flex-col">
                    <span className="font-medium">{a.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{a.id}</span>
                  </span>
                </label>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
