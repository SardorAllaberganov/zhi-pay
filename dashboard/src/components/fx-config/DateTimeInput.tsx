import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { addMonths, format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

interface DateTimeInputProps {
  id?: string;
  value: Date | null;
  onValueChange: (next: Date | null) => void;
  /** When true, allow clearing to null (open-ended). */
  allowEmpty?: boolean;
  min?: Date;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

/**
 * Datetime picker — Popover-anchored Calendar + time-of-day selects.
 *
 * Replaces native `<input type="datetime-local">` (its system-rendered
 * stepped numeric picker is awkward, especially on macOS). Mirrors the
 * `<DateRangePicker>` style: anchored Popover, calendar on top, footer
 * with Cancel / Apply (+ Clear when `allowEmpty`). Time stepped at 5min
 * granularity so the minute select stays scannable.
 */
export function DateTimeInput({
  id,
  value,
  onValueChange,
  allowEmpty,
  min,
  className,
  ariaLabel,
  disabled,
}: DateTimeInputProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<{
    date: Date | undefined;
    hour: number;
    minute: number;
  }>(() => deriveDraft(value));
  const [displayMonth, setDisplayMonth] = useState<Date>(value ?? new Date());

  // Reset draft + reposition the visible month on every open so
  // cancel-then-reopen returns to the committed value.
  useEffect(() => {
    if (open) {
      setDraft(deriveDraft(value));
      setDisplayMonth(value ?? new Date());
    }
  }, [open, value]);

  function commit() {
    if (!draft.date) {
      if (allowEmpty) onValueChange(null);
      setOpen(false);
      return;
    }
    const out = new Date(draft.date);
    out.setHours(draft.hour, draft.minute, 0, 0);
    if (min && out.getTime() < min.getTime()) {
      onValueChange(min);
    } else {
      onValueChange(out);
    }
    setOpen(false);
  }

  function clear() {
    onValueChange(null);
    setOpen(false);
  }

  const label = value ? format(value, 'MMM d, yyyy · HH:mm') : '—';

  return (
    <Popover open={open} onOpenChange={(o) => !disabled && setOpen(o)}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          aria-label={ariaLabel}
          disabled={disabled}
          className={cn(
            'inline-flex items-center justify-between gap-2 w-full',
            'h-10 rounded-md border border-input bg-background px-3 text-sm',
            'hover:bg-accent/40 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <span className="inline-flex items-center gap-2 min-w-0 truncate">
            <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
            <span className="tabular truncate">
              {value ? label : t('admin.fx-config.datetime.placeholder')}
            </span>
          </span>
          {value && allowEmpty && (
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                clear();
              }}
              className="inline-flex items-center justify-center h-6 w-6 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
              aria-label={t('admin.fx-config.datetime.clear')}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className={cn(
          'p-0 overflow-hidden rounded-lg shadow-lg',
          'w-[min(360px,calc(100vw-2rem))]',
        )}
      >
        {/* Custom header — `<  Month YYYY  >` with arrows on the sides
            (LESSONS 2026-05-03 — Calendar header convention). The default
            react-day-picker chrome is hidden via `classNames`. */}
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <button
            type="button"
            onClick={() => setDisplayMonth(addMonths(displayMonth, -1))}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-foreground/80 hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={t('admin.fx-config.datetime.prev-month')}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="text-base font-semibold tracking-tight truncate">
            {format(displayMonth, 'MMMM yyyy')}
          </span>
          <button
            type="button"
            onClick={() => setDisplayMonth(addMonths(displayMonth, 1))}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-foreground/80 hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={t('admin.fx-config.datetime.next-month')}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="p-3 flex justify-center">
          <Calendar
            mode="single"
            selected={draft.date}
            onSelect={(d) => setDraft((cur) => ({ ...cur, date: d ?? undefined }))}
            month={displayMonth}
            onMonthChange={setDisplayMonth}
            classNames={{ nav: 'hidden', month_caption: 'hidden' }}
            disabled={
              min
                ? (date: Date) => {
                    const minDay = new Date(min);
                    minDay.setHours(0, 0, 0, 0);
                    const candidate = new Date(date);
                    candidate.setHours(0, 0, 0, 0);
                    return candidate.getTime() < minDay.getTime();
                  }
                : undefined
            }
          />
        </div>

        {/* Time row */}
        <div className="border-t px-4 py-3 bg-muted/30">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium shrink-0">
              {t('admin.fx-config.datetime.time')}
            </span>
            <div className="flex items-center gap-1 ml-auto">
              <select
                aria-label={t('admin.fx-config.datetime.hour')}
                value={draft.hour}
                onChange={(e) =>
                  setDraft((cur) => ({ ...cur, hour: Number(e.target.value) }))
                }
                className="h-9 rounded-md border border-input bg-background pl-2 pr-1 text-sm tabular focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {String(i).padStart(2, '0')}
                  </option>
                ))}
              </select>
              <span className="text-muted-foreground tabular">:</span>
              <select
                aria-label={t('admin.fx-config.datetime.minute')}
                value={draft.minute}
                onChange={(e) =>
                  setDraft((cur) => ({ ...cur, minute: Number(e.target.value) }))
                }
                className="h-9 rounded-md border border-input bg-background pl-2 pr-1 text-sm tabular focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                  <option key={m} value={m}>
                    {String(m).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm tabular text-foreground/80">
            {draft.date
              ? `${format(draft.date, 'MMM d, yyyy')} · ${String(draft.hour).padStart(2, '0')}:${String(draft.minute).padStart(2, '0')}`
              : t('admin.fx-config.datetime.no-selection')}
          </div>
          <div className="flex items-center justify-end gap-2">
            {allowEmpty && value && (
              <Button variant="ghost" size="sm" onClick={clear}>
                {t('admin.fx-config.datetime.clear')}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              {t('common.actions.cancel')}
            </Button>
            <Button size="sm" onClick={commit} disabled={!draft.date}>
              {t('common.daterange.apply')}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function deriveDraft(value: Date | null): {
  date: Date | undefined;
  hour: number;
  minute: number;
} {
  if (!value) {
    const now = new Date();
    return {
      date: undefined,
      hour: now.getHours(),
      minute: roundToFive(now.getMinutes()),
    };
  }
  return {
    date: value,
    hour: value.getHours(),
    minute: roundToFive(value.getMinutes()),
  };
}

function roundToFive(m: number): number {
  return Math.min(55, Math.round(m / 5) * 5);
}
