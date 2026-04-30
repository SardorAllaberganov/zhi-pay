import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import { addMonths, format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn, formatDate } from '@/lib/utils';
import { t } from '@/lib/i18n';

/**
 * Mock-data anchor: the dashboard prototype hardcodes "today" to align with
 * the seeded transfer dataset. Swap to `new Date()` when wired to backend.
 */
const NOW = new Date('2026-04-29T10:30:00Z');

export type DateRangeKey = 'today' | 'yesterday' | '7d' | '30d' | 'custom';

export interface DateRangeValue {
  range: DateRangeKey;
  customFrom?: Date;
  customTo?: Date;
}

interface QuickOption {
  key: DateRangeKey;
  labelKey: string;
}

const QUICK_OPTIONS: QuickOption[] = [
  { key: 'today',     labelKey: 'common.daterange.today' },
  { key: 'yesterday', labelKey: 'common.daterange.yesterday' },
  { key: '7d',        labelKey: 'common.daterange.7d' },
  { key: '30d',       labelKey: 'common.daterange.30d' },
  { key: 'custom',    labelKey: 'common.daterange.custom' },
];

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/**
 * Resolve a DateRangeValue to a concrete [from, to] pair for calendar
 * highlighting. The picker keeps Filters' `range` semantics in sync — no
 * separate range computation lives outside this primitive.
 */
export function resolveDateRange(value: DateRangeValue): DateRange | undefined {
  const today = startOfDay(NOW);
  if (value.range === 'today') return { from: today, to: today };
  if (value.range === 'yesterday') {
    const y = addDays(today, -1);
    return { from: y, to: y };
  }
  if (value.range === '7d') return { from: addDays(today, -6), to: today };
  if (value.range === '30d') return { from: addDays(today, -29), to: today };
  if (value.range === 'custom') {
    if (value.customFrom && value.customTo) {
      return { from: value.customFrom, to: value.customTo };
    }
    if (value.customFrom) return { from: value.customFrom, to: value.customFrom };
    return undefined;
  }
  return undefined;
}

/**
 * Localized label for the active range — for use in the trigger button.
 */
export function formatDateRangeLabel(value: DateRangeValue): string {
  if (value.range === 'custom') {
    if (value.customFrom && value.customTo) {
      return `${formatDate(value.customFrom)} – ${formatDate(value.customTo)}`;
    }
    return t('common.daterange.custom');
  }
  return t(`common.daterange.${value.range}`);
}

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (next: DateRangeValue) => void;
  /** The trigger element. Wrapped in a DialogTrigger asChild slot. */
  children: React.ReactNode;
}

export function DateRangePicker({ value, onChange, children }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<DateRangeValue>(value);
  const [displayMonth, setDisplayMonth] = useState<Date>(
    () => resolveDateRange(value)?.from ?? startOfDay(NOW),
  );

  // Reset pending state + reposition the calendar to the active range
  // whenever the picker opens.
  useEffect(() => {
    if (open) {
      setPending(value);
      const r = resolveDateRange(value);
      if (r?.from) setDisplayMonth(r.from);
    }
  }, [open, value]);

  const resolved = resolveDateRange(pending);
  const monthA = displayMonth;
  const monthB = addMonths(displayMonth, 1);

  function selectQuick(key: DateRangeKey) {
    if (key === 'custom') {
      setPending({
        range: 'custom',
        customFrom: pending.customFrom ?? resolved?.from,
        customTo: pending.customTo ?? resolved?.to,
      });
    } else {
      setPending({ range: key });
    }
  }

  function selectCalendarRange(range: DateRange | undefined) {
    if (!range?.from) {
      setPending({ range: 'custom', customFrom: undefined, customTo: undefined });
      return;
    }
    setPending({
      range: 'custom',
      customFrom: range.from,
      customTo: range.to ?? range.from,
    });
  }

  function handleApply() {
    onChange(pending);
    setOpen(false);
  }
  function handleCancel() {
    setOpen(false);
  }

  const fromLabel = resolved?.from ? formatDate(resolved.from) : '—';
  const toLabel = resolved?.to ? formatDate(resolved.to) : '—';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className={cn(
          'p-0 overflow-hidden rounded-lg shadow-lg',
          // Wide enough for the 200px sidebar + 2-month calendar; clamps
          // inside the viewport on narrow screens.
          'w-[min(860px,calc(100vw-2rem))]',
        )}
        aria-label={t('common.daterange.title')}
      >
        <div className="flex flex-col md:flex-row md:min-h-[420px]">
          {/* Quick-select sidebar */}
          <aside className="md:w-[210px] border-b md:border-b-0 md:border-r bg-muted/30 flex flex-col">
            <div className="px-4 pt-4 pb-2 text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {t('common.daterange.quick-select')}
            </div>
            <div className="flex-1 px-2 pb-3 space-y-0.5">
              {QUICK_OPTIONS.map((opt) => (
                <QuickRow
                  key={opt.key}
                  label={t(opt.labelKey)}
                  active={pending.range === opt.key}
                  onClick={() => selectQuick(opt.key)}
                />
              ))}
            </div>
          </aside>

          {/* Two-month calendar with custom header bar */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
              <button
                type="button"
                onClick={() => setDisplayMonth(addMonths(displayMonth, -1))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-foreground/80 hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <div className="flex flex-1 items-center justify-around gap-2 min-w-0">
                <span className="text-base font-semibold tracking-tight truncate">
                  {format(monthA, 'MMMM yyyy')}
                </span>
                <span
                  className="h-5 w-px bg-border shrink-0"
                  aria-hidden="true"
                />
                <span className="text-base font-semibold tracking-tight truncate">
                  {format(monthB, 'MMMM yyyy')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDisplayMonth(addMonths(displayMonth, 1))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-foreground/80 hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-x-auto flex justify-center">
              <Calendar
                mode="range"
                numberOfMonths={2}
                month={displayMonth}
                onMonthChange={setDisplayMonth}
                selected={resolved}
                onSelect={selectCalendarRange}
                classNames={{ nav: 'hidden' }}
              />
            </div>
          </div>
        </div>

        {/* Footer: range summary + Cancel / Apply */}
        <div className="flex flex-col gap-3 border-t bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2 text-sm font-medium tabular text-foreground">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span>
              {fromLabel} <span className="text-muted-foreground">–</span> {toLabel}
            </span>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              {t('common.daterange.cancel')}
            </Button>
            <Button onClick={handleApply}>{t('common.daterange.apply')}</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function QuickRow({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-left transition-colors',
        active
          ? 'bg-brand-50 text-brand-700 font-medium dark:bg-brand-950/40 dark:text-brand-300'
          : 'text-foreground/80 hover:bg-accent',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      <span
        className={cn(
          'h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0',
          active ? 'border-brand-600' : 'border-muted-foreground/40',
        )}
        aria-hidden="true"
      >
        {active && <span className="h-2 w-2 rounded-full bg-brand-600" />}
      </span>
      {label}
    </button>
  );
}
