import { cn, formatRelative, statusLabel, statusToTone, toneClasses } from '@/lib/utils';
import type {
  StatusDomain,
  TransferEvent,
  TransferStatus,
} from '@/types';

interface StatusTimelineProps {
  events: TransferEvent[];
  domain?: StatusDomain;
  className?: string;
}

/**
 * Vertical timeline derived from transfer_events.
 * - Filled circle = past, ring = current, hollow = theoretical future.
 * - Lines connect ONLY consecutive items (no overflow above first or below
 *   last circle).
 * - Past-to-past lines are solid; the line between the current event and a
 *   theoretical-future state is dashed.
 *
 * For non-terminal current states (created, processing) we append a hollow
 * theoretical-next marker so the dashed line has somewhere to terminate.
 */
export function StatusTimeline({ events, domain = 'transfer', className }: StatusTimelineProps) {
  if (events.length === 0) return null;
  const currentIdx = events.length - 1;

  // Theoretical-next state to surface the "not processed yet" portion.
  // Only shown for transfer-domain non-terminal currents.
  let theoreticalNext: TransferStatus | null = null;
  if (domain === 'transfer') {
    const cur = events[currentIdx].toStatus as TransferStatus;
    if (cur === 'created') theoreticalNext = 'processing';
    else if (cur === 'processing') theoreticalNext = 'completed';
  }

  return (
    <ol className={cn('flex flex-col', className)}>
      {events.map((event, idx) => {
        const isPast = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const tone = statusToTone(event.toStatus, domain);
        const tc = toneClasses(tone);

        const isLastEvent = idx === events.length - 1;
        const showLineBelow = !isLastEvent || theoreticalNext !== null;
        const lineDashed = isLastEvent && theoreticalNext !== null;

        return (
          <li key={event.id} className="flex gap-3">
            {/* Marker column — circle + (optional) line */}
            <div className="flex flex-col items-center w-3 shrink-0">
              <span
                className={cn(
                  'mt-1.5 h-3 w-3 rounded-full border-2 shrink-0',
                  isPast && cn(tc.dot, 'border-transparent'),
                  isCurrent && cn('bg-background animate-pulse-dot border-current', tc.text),
                )}
                aria-hidden="true"
              />
              {showLineBelow && (
                <span
                  className={cn(
                    'flex-1 min-h-[20px] mt-1 self-center w-px',
                    lineDashed
                      ? 'border-l border-dashed border-border bg-transparent'
                      : 'bg-border',
                  )}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Content column */}
            <div className="flex-1 min-w-0 pb-4 last:pb-0">
              <div className="flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium">
                    {statusLabel(event.toStatus, domain)}
                  </div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {event.actor}
                  </div>
                  {event.failureCode && (
                    <div className="text-sm text-danger-600 mt-1 font-mono tabular">
                      {event.failureCode}
                    </div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground tabular shrink-0">
                  {formatRelative(event.createdAt)}
                </div>
              </div>
            </div>
          </li>
        );
      })}

      {/* Theoretical-next marker (no line below it — terminates the timeline) */}
      {theoreticalNext && (
        <li className="flex gap-3">
          <div className="flex flex-col items-center w-3 shrink-0">
            <span
              className="mt-1.5 h-3 w-3 rounded-full border-2 border-border bg-background shrink-0"
              aria-hidden="true"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-muted-foreground">
              {statusLabel(theoreticalNext, domain)}
            </div>
          </div>
        </li>
      )}
    </ol>
  );
}
