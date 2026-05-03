import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ErrorCategory } from '@/data/mockErrorCodes';
import { CATEGORY_LABEL_KEY } from './types';

/**
 * Category chip — palette per Phase 16 spec D9:
 *   kyc        → brand     (front-of-funnel, route-to-MyID)
 *   acquiring  → warning   (card-side, retryable)
 *   fx         → warning   (recoverable on refresh)
 *   provider   → warning   (transient, recoverable)
 *   compliance → danger    (limit / sanctions / KYC blocks)
 *   system     → slate     (catch-all neutral)
 */

type Tone = 'brand' | 'warning' | 'danger' | 'slate';

const CATEGORY_TONE: Record<ErrorCategory, Tone> = {
  kyc: 'brand',
  acquiring: 'warning',
  fx: 'warning',
  provider: 'warning',
  compliance: 'danger',
  system: 'slate',
};

const TONE_CLASSES: Record<Tone, { bg: string; text: string; border: string }> = {
  brand: {
    bg: 'bg-brand-50 dark:bg-brand-950/40',
    text: 'text-brand-700 dark:text-brand-300',
    border: 'border-brand-600/20',
  },
  warning: {
    bg: 'bg-warning-50 dark:bg-warning-700/15',
    text: 'text-warning-700 dark:text-warning-600',
    border: 'border-warning-600/20',
  },
  danger: {
    bg: 'bg-danger-50 dark:bg-danger-700/15',
    text: 'text-danger-700 dark:text-danger-600',
    border: 'border-danger-600/20',
  },
  slate: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-300/60 dark:border-slate-700',
  },
};

export function CategoryChip({
  category,
  className,
}: {
  category: ErrorCategory;
  className?: string;
}) {
  const tone = CATEGORY_TONE[category];
  const c = TONE_CLASSES[tone];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium',
        c.bg,
        c.text,
        c.border,
        className,
      )}
    >
      {t(CATEGORY_LABEL_KEY[category])}
    </span>
  );
}
