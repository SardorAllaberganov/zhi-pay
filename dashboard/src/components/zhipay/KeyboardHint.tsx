import { cn } from '@/lib/utils';

interface KeyboardHintProps {
  keys: string[];
  className?: string;
}

/**
 * Renders kbd-styled chips for keyboard shortcuts.
 * Used in tooltips, help overlay, and queue empty states.
 */
export function KeyboardHint({ keys, className }: KeyboardHintProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {keys.map((key, i) => (
        <kbd
          key={`${key}-${i}`}
          className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground"
        >
          {key}
        </kbd>
      ))}
    </span>
  );
}
