import * as React from 'react';
import { cn } from '@/lib/utils';

interface OTPInputProps {
  /** Number of digit boxes — defaults to 6 (TOTP standard). */
  length?: number;
  value: string;
  onChange: (next: string) => void;
  /** Fired when the user completes the last digit. */
  onComplete?: (full: string) => void;
  disabled?: boolean;
  /** Visual error state — red ring + red borders. */
  error?: boolean;
  /** Autofocus first empty box on mount. Default true. */
  autoFocus?: boolean;
  /** aria-label applied to the wrapping group. */
  ariaLabel?: string;
  className?: string;
}

/**
 * 6-digit OTP input primitive — N separate boxes, large mono characters,
 * autofocus first, auto-advance on digit, backspace moves back, paste
 * fills all N. Reuses Tokens only — no Component-layer imports.
 *
 * Per LESSON 2026-04-29: 13px floor for any text. The boxes here render
 * digits at `text-2xl` (~22px in the locked scale) so the floor is
 * comfortably exceeded.
 */
export function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  autoFocus = true,
  ariaLabel,
  className,
}: OTPInputProps) {
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);
  const digits = React.useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i < length; i += 1) out.push(value[i] ?? '');
    return out;
  }, [value, length]);

  React.useEffect(() => {
    if (autoFocus && !disabled) {
      const firstEmpty = digits.findIndex((d) => d === '');
      const idx = firstEmpty === -1 ? 0 : firstEmpty;
      refs.current[idx]?.focus();
    }
    // mount-only autofocus
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setDigitAt(i: number, ch: string): string {
    const arr = digits.slice();
    arr[i] = ch;
    return arr.join('');
  }

  function handleChange(i: number, raw: string) {
    // Strip non-digits and take the LAST character — handles auto-advance
    // and "type-over" cases where the box already had a digit.
    const cleaned = raw.replace(/\D/g, '');
    if (cleaned.length === 0) {
      const next = setDigitAt(i, '');
      onChange(next);
      return;
    }

    if (cleaned.length === 1) {
      const next = setDigitAt(i, cleaned);
      onChange(next);
      // Auto-advance
      if (i < length - 1) refs.current[i + 1]?.focus();
      else if (next.length === length) onComplete?.(next);
      return;
    }

    // User typed/pasted multiple digits — distribute starting at i.
    const slice = cleaned.slice(0, length - i);
    const arr = digits.slice();
    for (let k = 0; k < slice.length; k += 1) {
      arr[i + k] = slice[k];
    }
    const next = arr.join('');
    onChange(next);
    const nextIdx = Math.min(i + slice.length, length - 1);
    refs.current[nextIdx]?.focus();
    if (next.replace(/\D/g, '').length === length) onComplete?.(next);
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (digits[i] === '' && i > 0) {
        e.preventDefault();
        const next = setDigitAt(i - 1, '');
        onChange(next);
        refs.current[i - 1]?.focus();
        return;
      }
      // If current box has a digit, let default backspace clear it; we
      // catch the resulting empty string in handleChange.
      return;
    }
    if (e.key === 'ArrowLeft' && i > 0) {
      e.preventDefault();
      refs.current[i - 1]?.focus();
      return;
    }
    if (e.key === 'ArrowRight' && i < length - 1) {
      e.preventDefault();
      refs.current[i + 1]?.focus();
      return;
    }
  }

  function handlePaste(i: number, e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData('text');
    const cleaned = text.replace(/\D/g, '');
    if (!cleaned) return;
    e.preventDefault();
    handleChange(i, cleaned);
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn('inline-flex items-center gap-2', className)}
    >
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          onFocus={(e) => e.currentTarget.select()}
          disabled={disabled}
          aria-label={`Digit ${i + 1} of ${length}`}
          className={cn(
            // sizing
            'h-12 w-10 sm:h-14 sm:w-12 rounded-md border bg-background text-center font-mono text-2xl shadow-sm tabular-nums',
            // state
            'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-destructive focus-visible:ring-destructive'
              : 'border-input',
          )}
        />
      ))}
    </div>
  );
}
