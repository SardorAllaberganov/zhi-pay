import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Renders a `from → to` status transition pill (e.g. `processing → reversed`).
 * Returns `null` when both sides are absent so the column reads as `—`.
 */
interface StatusTransitionPillProps {
  from: string | null;
  to: string | null;
  className?: string;
}

export function StatusTransitionPill({ from, to, className }: StatusTransitionPillProps) {
  if (!from && !to) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border border-border bg-card px-2 py-0.5 font-mono text-xs text-foreground/80',
        className,
      )}
    >
      <span className="truncate">{from ?? '∅'}</span>
      <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="truncate">{to ?? '∅'}</span>
    </span>
  );
}
