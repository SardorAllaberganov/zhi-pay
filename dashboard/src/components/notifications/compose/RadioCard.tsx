import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface RadioCardProps {
  checked: boolean;
  onSelect: () => void;
  /** Required for screen readers. */
  ariaLabel?: string;
  /** Tabbable in the radio group when true. */
  tabIndex?: number;
  className?: string;
  children: ReactNode;
}

/**
 * Branded radio-card primitive used by the audience / type / schedule
 * pickers in the Notifications composer. Mirrors the Stories editor
 * `TypeRadioCard` styling (brand-tinted active state with subtle ring,
 * focus-ring fallback) so all radio-card surfaces in the dashboard read
 * the same.
 *
 * Wrap children freely — caller composes icons / labels / descriptions
 * inside.
 */
export function RadioCard({
  checked,
  onSelect,
  ariaLabel,
  tabIndex,
  className,
  children,
}: RadioCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      aria-label={ariaLabel}
      tabIndex={tabIndex}
      onClick={onSelect}
      className={cn(
        'flex w-full flex-col items-start gap-1 rounded-md border p-3 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        checked
          ? 'border-brand-600 bg-brand-50/60 ring-1 ring-brand-200 dark:bg-brand-950/30'
          : 'border-border bg-background hover:bg-muted/50',
        className,
      )}
    >
      {children}
    </button>
  );
}
