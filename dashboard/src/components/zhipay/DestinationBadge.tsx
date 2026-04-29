import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { Destination } from '@/types';

/**
 * Tiny chip showing the destination wallet (Alipay or WeChat Pay).
 * Brand-colored dot + label. Used in transfer rows, recipient pickers,
 * and any surface that visualizes the destination instrument.
 *
 * Real Alipay / WeChat brand assets require licensing — this is a
 * stylized placeholder that can be swapped for an SVG mark later.
 */

interface DestinationBadgeProps {
  destination: Destination;
  /** Hide the textual label and render dot-only (table-cell density). */
  iconOnly?: boolean;
  className?: string;
}

const STYLES: Record<Destination, { dot: string; label: string }> = {
  alipay: {
    dot: 'bg-[#1677FF]', // Alipay blue
    label: 'admin.overview.destination.alipay',
  },
  wechat: {
    dot: 'bg-[#07C160]', // WeChat green
    label: 'admin.overview.destination.wechat',
  },
};

export function DestinationBadge({
  destination,
  iconOnly,
  className,
}: DestinationBadgeProps) {
  const style = STYLES[destination];
  const label = t(style.label);

  if (iconOnly) {
    return (
      <span
        className={cn('inline-block h-2 w-2 rounded-full', style.dot, className)}
        role="img"
        aria-label={label}
      />
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm px-1.5 py-0.5 text-xs font-medium',
        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} aria-hidden="true" />
      {label}
    </span>
  );
}
