import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { KycTier } from '@/types';

interface TierBadgeProps {
  tier: KycTier;
  className?: string;
}

/**
 * KYC tier visual.
 * tier_2 (MyID) = filled brand + shield-check.
 * tier_1 = outline brand.
 * tier_0 = outline slate.
 */
export function TierBadge({ tier, className }: TierBadgeProps) {
  const label = t(`admin.tier.${tier}`);

  if (tier === 'tier_2') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-sm bg-brand-600 px-2 py-0.5 text-xs font-medium text-white',
          className,
        )}
      >
        <ShieldCheck className="h-3 w-3" aria-hidden="true" />
        {label}
      </span>
    );
  }

  if (tier === 'tier_1') {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-sm border border-brand-600/50 bg-transparent px-2 py-0.5 text-xs font-medium text-brand-700 dark:text-brand-300',
          className,
        )}
      >
        {label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-400',
        className,
      )}
    >
      {label}
    </span>
  );
}
