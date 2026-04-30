import { forwardRef, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  CircleDollarSign,
  Filter,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  DateRangePicker,
  formatDateRangeLabel,
} from '@/components/zhipay/DateRangePicker';
import { cn, statusLabel } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type {
  CardScheme,
  Destination,
  KycTier,
  TransferStatus,
} from '@/types';
import type { TransferFilters } from './types';
import { countActiveFilters, makeEmptyFilters } from './types';

const STATUS_OPTIONS: TransferStatus[] = [
  'created',
  'processing',
  'completed',
  'failed',
  'reversed',
];
const DESTINATION_OPTIONS: Destination[] = ['alipay', 'wechat'];
// Visa / Mastercard scoped out per LESSONS.md until user explicitly invokes them.
const SCHEME_OPTIONS: CardScheme[] = ['uzcard', 'humo'];
const TIER_OPTIONS: KycTier[] = ['tier_0', 'tier_1', 'tier_2'];

interface QuickFilterCounts {
  failedToday: number;
  reversedLast7d: number;
  stuckProcessing: number;
}

interface TransfersFilterBarProps {
  filters: TransferFilters;
  setFilters: (next: TransferFilters) => void;
  statusCounts: Record<TransferStatus, number>;
  quickCounts: QuickFilterCounts;
  onApplyQuickFilter: (key: 'failedToday' | 'reversedLast7d' | 'stuckProcessing') => void;
  loading?: boolean;
}

// =====================================================================
// Top-level component
// =====================================================================

export const TransfersFilterBar = forwardRef<HTMLInputElement, TransfersFilterBarProps>(
  function TransfersFilterBar(
    { filters, setFilters, statusCounts, quickCounts, onApplyQuickFilter, loading = false },
    searchRef,
  ) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const activeCount = countActiveFilters(filters);

    function reset() {
      setFilters(makeEmptyFilters());
    }

    return (
      <div
        className={cn(
          'sticky top-0 z-20 -mx-4 md:-mx-6 px-4 md:px-6 py-3 bg-background/95 backdrop-blur',
          'border-b border-border min-w-0 space-y-3',
        )}
        data-filter-bar
      >
        {/* Row 1: search (left) ◇ Sheet trigger (mobile only, right) */}
        <div className="flex items-center justify-between gap-3 min-w-0">
          <div className="relative flex-1 min-w-0 max-w-[700px]">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              ref={searchRef}
              type="search"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder={t('admin.transfers.search-placeholder')}
              className="pl-8 h-9"
              aria-label={t('admin.transfers.search-placeholder')}
            />
          </div>

          {/* Right group: mobile filters trigger (Export CSV lives in page header) */}
          <div className="flex items-center gap-2 shrink-0 md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="md:hidden shrink-0"
                aria-label={t('admin.transfers.filter.mobile-button')}
              >
                <Filter className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden xs:inline">
                  {t('admin.transfers.filter.mobile-button')}
                </span>
                {activeCount > 0 && (
                  <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    {activeCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
              <SheetHeader className="px-5 pt-5 pb-4 border-b">
                <SheetTitle>{t('admin.transfers.filter.mobile-button')}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                <MobileFilterSection title={t('admin.transfers.filter.status')}>
                  <CheckboxList
                    options={STATUS_OPTIONS.map((s) => ({
                      value: s,
                      label: `${statusLabel(s, 'transfer')} (${statusCounts[s] ?? 0})`,
                    }))}
                    selected={filters.statuses}
                    onChange={(next) => setFilters({ ...filters, statuses: next as Set<TransferStatus> })}
                    name="status-mobile"
                  />
                </MobileFilterSection>

                <MobileFilterSection title={t('admin.transfers.filter.date-range')}>
                  <DateRangePicker
                    value={{
                      range: filters.range,
                      customFrom: filters.customFrom,
                      customTo: filters.customTo,
                    }}
                    onChange={(next) =>
                      setFilters({
                        ...filters,
                        range: next.range,
                        customFrom: next.customFrom,
                        customTo: next.customTo,
                      })
                    }
                  >
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                      {formatDateRangeLabel({
                        range: filters.range,
                        customFrom: filters.customFrom,
                        customTo: filters.customTo,
                      })}
                    </Button>
                  </DateRangePicker>
                </MobileFilterSection>

                <MobileFilterSection title={t('admin.transfers.filter.destination')}>
                  <CheckboxList
                    options={DESTINATION_OPTIONS.map((d) => ({
                      value: d,
                      label: t(`admin.overview.destination.${d}`),
                    }))}
                    selected={filters.destinations}
                    onChange={(next) => setFilters({ ...filters, destinations: next as Set<Destination> })}
                    name="destination-mobile"
                  />
                </MobileFilterSection>

                <MobileFilterSection title={t('admin.transfers.filter.scheme')}>
                  <CheckboxList
                    options={SCHEME_OPTIONS.map((s) => ({
                      value: s,
                      label: t(`admin.transfers.scheme.${s}`),
                    }))}
                    selected={filters.schemes}
                    onChange={(next) => setFilters({ ...filters, schemes: next as Set<CardScheme> })}
                    name="scheme-mobile"
                  />
                </MobileFilterSection>

                <MobileFilterSection title={t('admin.transfers.filter.amount')}>
                  <AmountInputs filters={filters} setFilters={setFilters} />
                </MobileFilterSection>

                <MobileFilterSection title={t('admin.transfers.filter.tier')}>
                  <CheckboxList
                    options={TIER_OPTIONS.map((tier) => ({
                      value: tier,
                      label: t(`admin.tier.${tier}`),
                    }))}
                    selected={filters.tiers}
                    onChange={(next) => setFilters({ ...filters, tiers: next as Set<KycTier> })}
                    name="tier-mobile"
                  />
                </MobileFilterSection>

                <div className="flex flex-col gap-2 border-t pt-4">
                  <ToggleChip
                    active={filters.hasAml}
                    onToggle={() => setFilters({ ...filters, hasAml: !filters.hasAml })}
                    label={t('admin.transfers.filter.has-aml')}
                    icon={<ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />}
                    fullWidth
                  />
                  <ToggleChip
                    active={filters.hasFailure}
                    onToggle={() => setFilters({ ...filters, hasFailure: !filters.hasFailure })}
                    label={t('admin.transfers.filter.has-failure')}
                    icon={<AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />}
                    fullWidth
                  />
                </div>
              </div>
              <div className="border-t px-5 py-4 flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    reset();
                    setMobileOpen(false);
                  }}
                  className="flex-1"
                >
                  {t('admin.transfers.filter.clear-all')}
                </Button>
                <Button onClick={() => setMobileOpen(false)} className="flex-1">
                  {t('admin.transfers.filter.apply')}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          </div>
        </div>

        {/* Row 2: chip filters (md+ only — mobile uses the Sheet) */}
        {loading ? (
          <div className="hidden md:flex flex-wrap items-center gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-8 rounded-full"
                style={{ width: 96 + (i % 3) * 24 }}
              />
            ))}
          </div>
        ) : (
        <div className="hidden md:flex flex-wrap items-center gap-2 min-w-0">
            <StatusFilterChip filters={filters} setFilters={setFilters} statusCounts={statusCounts} />
            <DateRangePicker
              value={{
                range: filters.range,
                customFrom: filters.customFrom,
                customTo: filters.customTo,
              }}
              onChange={(next) =>
                setFilters({
                  ...filters,
                  range: next.range,
                  customFrom: next.customFrom,
                  customTo: next.customTo,
                })
              }
            >
              <ChipButton active={filters.range !== '30d'}>
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                {formatDateRangeLabel({
                  range: filters.range,
                  customFrom: filters.customFrom,
                  customTo: filters.customTo,
                })}
              </ChipButton>
            </DateRangePicker>
            <DestinationFilterChip filters={filters} setFilters={setFilters} />
            <SchemeFilterChip filters={filters} setFilters={setFilters} />
            <AmountRangeChip filters={filters} setFilters={setFilters} />
            <TierFilterChip filters={filters} setFilters={setFilters} />
            <ToggleChip
              active={filters.hasAml}
              onToggle={() => setFilters({ ...filters, hasAml: !filters.hasAml })}
              label={t('admin.transfers.filter.has-aml')}
              icon={<ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />}
            />
            <ToggleChip
              active={filters.hasFailure}
              onToggle={() => setFilters({ ...filters, hasFailure: !filters.hasFailure })}
              label={t('admin.transfers.filter.has-failure')}
              icon={<AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />}
            />
            {activeCount > 0 && (
              <button
                type="button"
                onClick={reset}
                className="ml-auto inline-flex items-center gap-1 rounded-sm px-2 py-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                {t('admin.transfers.filter.clear-all')}
              </button>
            )}
          </div>
        )}

        {/* Row 3: quick filter pills */}
        {loading ? (
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-4 w-12 rounded-md" />
            <Skeleton className="h-7 w-32 rounded-full" />
            <Skeleton className="h-7 w-36 rounded-full" />
            <Skeleton className="h-7 w-40 rounded-full" />
          </div>
        ) : (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground mr-1">
            Quick:
          </span>
          <QuickPill
            label={t('admin.transfers.quick.failed-today', { count: quickCounts.failedToday })}
            tone="danger"
            onClick={() => onApplyQuickFilter('failedToday')}
          />
          <QuickPill
            label={t('admin.transfers.quick.reversed-7d', { count: quickCounts.reversedLast7d })}
            tone="warning"
            onClick={() => onApplyQuickFilter('reversedLast7d')}
          />
          <QuickPill
            label={t('admin.transfers.quick.stuck', { count: quickCounts.stuckProcessing })}
            tone="info"
            onClick={() => onApplyQuickFilter('stuckProcessing')}
          />
        </div>
        )}
      </div>
    );
  },
);

// =====================================================================
// Sub-components
// =====================================================================

interface ChipButtonProps {
  active: boolean;
  selectedCount?: number;
  children: React.ReactNode;
  ariaLabel?: string;
}

const ChipButton = forwardRef<HTMLButtonElement, ChipButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>>(
  function ChipButton({ active, selectedCount, children, className, ariaLabel, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={ariaLabel}
        className={cn(
          'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          active
            ? 'border-brand-600/50 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
            : 'border-border bg-background text-foreground/80 hover:bg-accent',
          className,
        )}
        {...rest}
      >
        {children}
        {selectedCount !== undefined && selectedCount > 0 && (
          <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-bold text-white">
            {selectedCount}
          </span>
        )}
        <ChevronDown className="h-3 w-3 opacity-60" aria-hidden="true" />
      </button>
    );
  },
);

function StatusFilterChip({
  filters,
  setFilters,
  statusCounts,
}: {
  filters: TransferFilters;
  setFilters: (n: TransferFilters) => void;
  statusCounts: Record<TransferStatus, number>;
}) {
  const selected = filters.statuses;

  function toggle(s: TransferStatus) {
    const next = new Set(selected);
    if (next.has(s)) next.delete(s);
    else next.add(s);
    setFilters({ ...filters, statuses: next });
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <ChipButton active={selected.size > 0} selectedCount={selected.size}>
          {t('admin.transfers.filter.status')}
        </ChipButton>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="start">
        <ul className="space-y-2">
          {STATUS_OPTIONS.map((s) => (
            <li key={s} className="flex items-center gap-2">
              <Checkbox
                id={`status-${s}`}
                checked={selected.has(s)}
                onCheckedChange={() => toggle(s)}
              />
              <Label htmlFor={`status-${s}`} className="flex flex-1 items-center justify-between cursor-pointer">
                <span className="capitalize">{statusLabel(s, 'transfer')}</span>
                <span className="font-mono tabular text-xs text-muted-foreground">
                  {statusCounts[s] ?? 0}
                </span>
              </Label>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function DestinationFilterChip({
  filters,
  setFilters,
}: {
  filters: TransferFilters;
  setFilters: (n: TransferFilters) => void;
}) {
  const selected = filters.destinations;
  function toggle(d: Destination) {
    const next = new Set(selected);
    if (next.has(d)) next.delete(d);
    else next.add(d);
    setFilters({ ...filters, destinations: next });
  }
  return (
    <Popover>
      <PopoverTrigger asChild>
        <ChipButton active={selected.size > 0} selectedCount={selected.size}>
          {t('admin.transfers.filter.destination')}
        </ChipButton>
      </PopoverTrigger>
      <PopoverContent className="w-48" align="start">
        <ul className="space-y-2">
          {DESTINATION_OPTIONS.map((d) => (
            <li key={d} className="flex items-center gap-2">
              <Checkbox
                id={`dest-${d}`}
                checked={selected.has(d)}
                onCheckedChange={() => toggle(d)}
              />
              <Label htmlFor={`dest-${d}`} className="flex-1 cursor-pointer">
                {t(`admin.overview.destination.${d}`)}
              </Label>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function SchemeFilterChip({
  filters,
  setFilters,
}: {
  filters: TransferFilters;
  setFilters: (n: TransferFilters) => void;
}) {
  const selected = filters.schemes;
  function toggle(s: CardScheme) {
    const next = new Set(selected);
    if (next.has(s)) next.delete(s);
    else next.add(s);
    setFilters({ ...filters, schemes: next });
  }
  return (
    <Popover>
      <PopoverTrigger asChild>
        <ChipButton active={selected.size > 0} selectedCount={selected.size}>
          {t('admin.transfers.filter.scheme')}
        </ChipButton>
      </PopoverTrigger>
      <PopoverContent className="w-48" align="start">
        <ul className="space-y-2">
          {SCHEME_OPTIONS.map((s) => (
            <li key={s} className="flex items-center gap-2">
              <Checkbox
                id={`scheme-${s}`}
                checked={selected.has(s)}
                onCheckedChange={() => toggle(s)}
              />
              <Label htmlFor={`scheme-${s}`} className="flex-1 cursor-pointer">
                {t(`admin.transfers.scheme.${s}`)}
              </Label>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function TierFilterChip({
  filters,
  setFilters,
}: {
  filters: TransferFilters;
  setFilters: (n: TransferFilters) => void;
}) {
  const selected = filters.tiers;
  function toggle(tier: KycTier) {
    const next = new Set(selected);
    if (next.has(tier)) next.delete(tier);
    else next.add(tier);
    setFilters({ ...filters, tiers: next });
  }
  return (
    <Popover>
      <PopoverTrigger asChild>
        <ChipButton active={selected.size > 0} selectedCount={selected.size}>
          {t('admin.transfers.filter.tier')}
        </ChipButton>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="start">
        <ul className="space-y-2">
          {TIER_OPTIONS.map((tier) => (
            <li key={tier} className="flex items-center gap-2">
              <Checkbox
                id={`tier-${tier}`}
                checked={selected.has(tier)}
                onCheckedChange={() => toggle(tier)}
              />
              <Label htmlFor={`tier-${tier}`} className="flex-1 cursor-pointer">
                {t(`admin.tier.${tier}`)}
              </Label>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function AmountRangeChip({
  filters,
  setFilters,
}: {
  filters: TransferFilters;
  setFilters: (n: TransferFilters) => void;
}) {
  const active = filters.amountMinTiyins !== undefined || filters.amountMaxTiyins !== undefined;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <ChipButton active={active}>
          <CircleDollarSign className="h-3.5 w-3.5" aria-hidden="true" />
          {t('admin.transfers.filter.amount')}
        </ChipButton>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <AmountInputs filters={filters} setFilters={setFilters} />
      </PopoverContent>
    </Popover>
  );
}

function AmountInputs({
  filters,
  setFilters,
}: {
  filters: TransferFilters;
  setFilters: (n: TransferFilters) => void;
}) {
  function toTiyins(value: string): bigint | undefined {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const num = Number(trimmed.replace(/\s/g, '').replace(/,/g, ''));
    if (!Number.isFinite(num) || num < 0) return undefined;
    return BigInt(Math.round(num)) * 100n;
  }
  function fromTiyins(v?: bigint): string {
    if (v === undefined) return '';
    return String(v / 100n);
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <Label className="text-xs">{t('admin.transfers.filter.amount-min')}</Label>
        <Input
          type="text"
          inputMode="numeric"
          value={fromTiyins(filters.amountMinTiyins)}
          onChange={(e) =>
            setFilters({ ...filters, amountMinTiyins: toTiyins(e.target.value) })
          }
          placeholder="0"
          className="h-8 font-mono tabular"
        />
      </div>
      <div>
        <Label className="text-xs">{t('admin.transfers.filter.amount-max')}</Label>
        <Input
          type="text"
          inputMode="numeric"
          value={fromTiyins(filters.amountMaxTiyins)}
          onChange={(e) =>
            setFilters({ ...filters, amountMaxTiyins: toTiyins(e.target.value) })
          }
          placeholder="∞"
          className="h-8 font-mono tabular"
        />
      </div>
    </div>
  );
}

function ToggleChip({
  active,
  onToggle,
  label,
  icon,
  fullWidth,
}: {
  active: boolean;
  onToggle: () => void;
  label: string;
  icon: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        active
          ? 'border-brand-600/50 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
          : 'border-border bg-background text-foreground/80 hover:bg-accent',
        fullWidth && 'w-full justify-center',
      )}
    >
      {icon}
      {label}
    </button>
  );
}

interface QuickPillProps {
  label: string;
  tone: 'danger' | 'warning' | 'info';
  onClick: () => void;
}

function QuickPill({ label, tone, onClick }: QuickPillProps) {
  const toneClass: Record<QuickPillProps['tone'], string> = {
    danger:
      'border-danger-600/30 bg-danger-50 text-danger-700 hover:bg-danger-100 dark:bg-danger-700/15 dark:text-danger-600',
    warning:
      'border-warning-600/30 bg-warning-50 text-warning-700 hover:bg-warning-100 dark:bg-warning-700/15 dark:text-warning-600',
    info: 'border-brand-600/30 bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-950/40 dark:text-brand-300',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-7 items-center gap-1 rounded-full border px-3 text-xs font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        toneClass[tone],
      )}
    >
      {label}
    </button>
  );
}

interface CheckboxOption<T extends string> {
  value: T;
  label: string;
}

function CheckboxList<T extends string>({
  options,
  selected,
  onChange,
  name,
}: {
  options: CheckboxOption<T>[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  name: string;
}) {
  function toggle(value: string) {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onChange(next);
  }
  return (
    <ul className="space-y-2">
      {options.map((opt) => (
        <li key={opt.value} className="flex items-center gap-2">
          <Checkbox
            id={`${name}-${opt.value}`}
            checked={selected.has(opt.value)}
            onCheckedChange={() => toggle(opt.value)}
          />
          <Label htmlFor={`${name}-${opt.value}`} className="flex-1 cursor-pointer">
            {opt.label}
          </Label>
        </li>
      ))}
    </ul>
  );
}

function MobileFilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
        {title}
      </h3>
      {children}
    </section>
  );
}
