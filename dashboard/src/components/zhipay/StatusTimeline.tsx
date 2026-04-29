import { cn, formatRelative, statusLabel, statusToTone, toneClasses } from '@/lib/utils';
import type { StatusDomain, TransferEvent } from '@/types';

interface StatusTimelineProps {
  events: TransferEvent[];
  domain?: StatusDomain;
  className?: string;
}

/**
 * Vertical timeline derived from transfer_events.
 * Filled circle = past, ring = current, hollow = future.
 */
export function StatusTimeline({ events, domain = 'transfer', className }: StatusTimelineProps) {
  if (events.length === 0) {
    return null;
  }
  const currentIdx = events.length - 1;

  return (
    <ol className={cn('relative space-y-4 border-l border-border pl-6', className)}>
      {events.map((event, idx) => {
        const isCurrent = idx === currentIdx;
        const isPast = idx < currentIdx;
        const tone = statusToTone(event.toStatus, domain);
        const tc = toneClasses(tone);

        return (
          <li key={event.id} className="relative">
            <span
              className={cn(
                'absolute -left-[1.625rem] top-1 h-3 w-3 rounded-full border-2',
                isPast && cn(tc.dot, 'border-transparent'),
                isCurrent && cn('bg-background animate-pulse-dot', 'border-current', tc.text),
                !isPast && !isCurrent && 'border-border bg-background',
              )}
              aria-hidden="true"
            />
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <div className="text-sm font-medium">{statusLabel(event.toStatus, domain)}</div>
                <div className="text-sm text-muted-foreground capitalize">{event.actor}</div>
                {event.failureCode && (
                  <div className="text-sm text-danger-600 mt-1 font-mono">{event.failureCode}</div>
                )}
              </div>
              <div className="text-sm text-muted-foreground tabular shrink-0">
                {formatRelative(event.createdAt)}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
