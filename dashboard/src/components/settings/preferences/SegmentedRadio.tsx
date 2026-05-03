import { cn } from '@/lib/utils';

export interface SegmentedRadioOption<T extends string> {
  value: T;
  label: string;
  /** Render a small "Coming soon" pill instead of selecting on click. */
  disabled?: boolean;
  /** Aria-label override; defaults to label. */
  ariaLabel?: string;
}

interface SegmentedRadioProps<T extends string> {
  /** Surface-scoped id for the radiogroup; passed to a11y attributes. */
  name: string;
  value: T;
  options: SegmentedRadioOption<T>[];
  onChange: (next: T) => void;
  /** Aria-label for the radiogroup. */
  ariaLabel: string;
}

/**
 * Small button-segmented radio control. Mirrors the dashboard's
 * established active-state styling (white-on-card pill lifted with
 * shadow per Phase 18b LESSON), used here for Theme / Language /
 * Density / Date-format / Time-format radios in the Preferences tab.
 */
export function SegmentedRadio<T extends string>({
  name,
  value,
  options,
  onChange,
  ariaLabel,
}: SegmentedRadioProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 p-1',
        'flex-wrap',
      )}
    >
      {options.map((opt) => {
        const checked = opt.value === value && !opt.disabled;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={opt.ariaLabel ?? opt.label}
            disabled={opt.disabled}
            onClick={() => !opt.disabled && onChange(opt.value)}
            data-name={name}
            className={cn(
              'inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              checked
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
              opt.disabled && 'opacity-60 cursor-not-allowed hover:text-muted-foreground',
            )}
          >
            {opt.label}
            {opt.disabled ? (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                soon
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

interface PreferenceRowProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

/**
 * Standard preferences row layout: label on top (mobile) / left
 * (desktop), control on right.
 */
export function PreferenceRow({ label, hint, children }: PreferenceRowProps) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-6 py-3">
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {hint ? (
          <div className="text-sm text-muted-foreground mt-0.5">{hint}</div>
        ) : null}
      </div>
      <div>{children}</div>
    </div>
  );
}
