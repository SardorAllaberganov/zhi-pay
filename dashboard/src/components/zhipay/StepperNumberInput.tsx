import * as React from 'react';
import { cn } from '@/lib/utils';

interface StepperNumberInputProps {
  id?: string;
  value: number | '';
  onValueChange: (next: number | '') => void;
  /** Decimal precision — clamps `toFixed` on commit. */
  precision: number;
  step?: number;
  shiftStep?: number;
  min?: number;
  max?: number;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
  placeholder?: string;
  onSubmit?: () => void;
}

/**
 * Number input with arrow-key stepping.
 *   ↑ / ↓        → ± step       (default 0.01)
 *   Shift+↑/↓    → ± shiftStep  (default 0.10)
 *   Cmd/Ctrl+Enter → onSubmit
 */
export function StepperNumberInput({
  id,
  value,
  onValueChange,
  precision,
  step = 0.01,
  shiftStep = 0.1,
  min,
  max,
  className,
  ariaLabel,
  disabled,
  placeholder,
  onSubmit,
}: StepperNumberInputProps) {
  function clamp(n: number): number {
    if (typeof min === 'number' && n < min) return min;
    if (typeof max === 'number' && n > max) return max;
    return n;
  }

  function commit(n: number) {
    const clamped = clamp(n);
    const rounded = Number(clamped.toFixed(precision));
    onValueChange(rounded);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const dir = e.key === 'ArrowUp' ? 1 : -1;
      const delta = e.shiftKey ? shiftStep : step;
      const base = typeof value === 'number' ? value : 0;
      commit(base + dir * delta);
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      onSubmit?.();
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (raw === '') {
      onValueChange('');
      return;
    }
    const parsed = Number(raw.replace(',', '.'));
    if (Number.isNaN(parsed)) return;
    onValueChange(parsed);
  }

  function handleBlur() {
    if (disabled) return;
    if (typeof value === 'number') commit(value);
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      value={typeof value === 'number' ? value : ''}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      disabled={disabled}
      placeholder={placeholder}
      className={cn(
        'tabular font-mono',
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    />
  );
}
