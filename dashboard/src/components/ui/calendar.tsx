import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, type DayPickerProps } from 'react-day-picker';
import 'react-day-picker/style.css';
import { cn } from '@/lib/utils';

/**
 * Calendar primitive — thin wrapper around react-day-picker v9 that swaps in
 * our brand tokens and locks the day-cell sizing for the dashboard.
 *
 * Single, multi, range modes are passed through. See [date range picker]
 * (../zhipay/DateRangePicker.tsx) for the typical range-selection use.
 */
function Calendar({ className, classNames, ...props }: DayPickerProps) {
  return (
    <div
      style={
        {
          '--rdp-accent-color': 'hsl(var(--brand-600))',
          '--rdp-accent-background-color': 'hsl(var(--brand-50))',
          '--rdp-day-height': '40px',
          '--rdp-day-width': '40px',
          '--rdp-day_button-height': '34px',
          '--rdp-day_button-width': '34px',
          '--rdp-day_button-border-radius': '999px',
          '--rdp-months-gap': '24px',
          '--rdp-range_start-color': '#fff',
          '--rdp-range_end-color': '#fff',
          '--rdp-nav_button-height': '32px',
          '--rdp-nav_button-width': '32px',
          '--rdp-weekday-text-align': 'center',
          '--rdp-today-color': 'hsl(var(--brand-600))',
        } as React.CSSProperties
      }
      className={cn('rdp-wrapper text-sm text-foreground', className)}
    >
      <DayPicker
        showOutsideDays
        components={{
          Chevron: ({ orientation, ...rest }) =>
            orientation === 'left' ? (
              <ChevronLeft className="h-4 w-4" {...rest} />
            ) : (
              <ChevronRight className="h-4 w-4" {...rest} />
            ),
        }}
        classNames={{
          // Force side-by-side months (default `.rdp-months` allows flex-wrap,
          // which can stack the months on narrower containers).
          months: 'flex flex-row flex-nowrap gap-6',
          month_caption: 'flex items-center justify-center pt-1 pb-2 text-sm font-semibold',
          weekdays: 'text-muted-foreground',
          weekday: 'text-xs font-medium text-muted-foreground uppercase tracking-wider',
          ...classNames,
        }}
        {...props}
      />
    </div>
  );
}

export { Calendar };
