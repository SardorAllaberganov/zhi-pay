import { cn, statusToTone, toneClasses, statusLabel } from '@/lib/utils';
import type { StatusDomain } from '@/types';

interface StatusBadgeProps {
  status: string;
  domain: StatusDomain;
  className?: string;
}

/**
 * Single source of truth for status visualization.
 * Always pairs color with text label (never color alone — accessibility).
 */
export function StatusBadge({ status, domain, className }: StatusBadgeProps) {
  const tone = statusToTone(status, domain);
  const classes = toneClasses(tone);
  const label = statusLabel(status, domain);
  const isProcessing = domain === 'transfer' && status === 'processing';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium border',
        classes.bg,
        classes.text,
        classes.border,
        className,
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          classes.dot,
          isProcessing && 'animate-pulse-dot',
        )}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
