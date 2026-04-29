import { cn, formatMoney } from '@/lib/utils';
import type { Currency, Locale } from '@/types';

interface MoneyProps {
  /**
   * Minor units (tiyins for UZS, fen for CNY).
   * Stored as bigint or non-float number — never accept a float.
   */
  amount: bigint | number;
  currency: Currency;
  locale?: Locale;
  className?: string;
  /** Show explicit + on positive amounts */
  signed?: boolean;
}

export function Money({ amount, currency, locale = 'en', className, signed }: MoneyProps) {
  if (typeof amount === 'number' && !Number.isInteger(amount)) {
    // Defensive: never accept float input.
    throw new Error(
      `Money component received a float (${amount}). Use bigint or integer minor units.`,
    );
  }
  const formatted = formatMoney(amount, currency, locale);
  const isNegative = formatted.startsWith('−');
  const positive = !isNegative && (typeof amount === 'bigint' ? amount > 0n : amount > 0);

  return (
    <span
      className={cn(
        'tabular font-mono',
        isNegative && 'text-danger-600 dark:text-danger-600',
        className,
      )}
    >
      {signed && positive ? `+${formatted}` : formatted}
    </span>
  );
}
