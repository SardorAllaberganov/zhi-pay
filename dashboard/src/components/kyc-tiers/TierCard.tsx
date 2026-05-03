import { Check, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TierBadge } from '@/components/zhipay/TierBadge';
import { Money } from '@/components/zhipay/Money';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { TierConfig } from '@/data/mockKycTiers';

interface TierCardProps {
  tier: TierConfig;
  className?: string;
}

/**
 * Read-only tier reference card. Three of these sit in a `lg:grid-cols-3`
 * row at the top of /compliance/kyc-tiers.
 *
 * No edit affordance — tier limits are governed by Compliance + the
 * regulator. The page is a reference, not a config surface.
 */
export function TierCard({ tier, className }: TierCardProps) {
  return (
    <Card className={cn('p-5 lg:p-6 flex flex-col', className)}>
      {/* Header — TierBadge + name + code. The MyID-required chip
          is shown only on tier_2 (the only operational tier); for
          tier_0 / tier_1 the gate note below carries the message. */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <TierBadge tier={tier.code} />
          <div>
            <h3 className="text-base font-semibold tracking-tight">
              {t(`admin.kyc-tiers.tier.${tier.code}.name`)}
            </h3>
            <p className="mt-0.5 font-mono tabular text-sm text-muted-foreground">
              {tier.code}
            </p>
          </div>
        </div>
        {tier.requiresMyId && <MyIdChip />}
      </div>

      {/* Description */}
      <p className="mt-3 text-sm text-muted-foreground">
        {t(`admin.kyc-tiers.tier.${tier.code}.description`)}
      </p>

      {/* Gate note — describes what's blocked at this tier (only on
          partial-registration tiers). Copy is tier-specific because
          the tier_0 lockout is stricter than tier_1's view-only state. */}
      {!tier.requiresMyId && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-warning-600/30 bg-warning-50 px-3 py-2 text-sm dark:bg-warning-700/15">
          <ShieldAlert
            className="h-4 w-4 mt-0.5 shrink-0 text-warning-700 dark:text-warning-600"
            aria-hidden="true"
          />
          <span className="text-warning-700 dark:text-warning-600">
            {t(`admin.kyc-tiers.tier.${tier.code}.gate`)}
          </span>
        </div>
      )}

      {/* Stats — only shown on operational tiers (tier_2). tier_0 / tier_1
          cannot transact at all, so listing limits would imply they apply. */}
      {tier.requiresMyId && (
        <dl className="mt-5 pt-4 border-t border-border space-y-3 text-sm">
          <Row label={t('admin.kyc-tiers.card.per-tx')}>
            <LimitValue tiyins={tier.perTxLimitTiyins} />
          </Row>
          <Row label={t('admin.kyc-tiers.card.daily')}>
            <LimitValue tiyins={tier.dailyLimitTiyins} />
          </Row>
          <Row label={t('admin.kyc-tiers.card.monthly')}>
            <LimitValue tiyins={tier.monthlyLimitTiyins} />
          </Row>
          <Row label={t('admin.kyc-tiers.card.max-cards')}>
            <span className="font-mono tabular text-foreground font-medium">
              {tier.maxCards}
            </span>
          </Row>
        </dl>
      )}
    </Card>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function LimitValue({ tiyins }: { tiyins: bigint }) {
  if (tiyins === 0n) {
    return <span className="text-muted-foreground italic">—</span>;
  }
  return <Money amount={tiyins} currency="UZS" className="text-foreground font-medium" />;
}

function MyIdChip() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-success-600/30 bg-success-50 px-2 py-0.5 text-xs font-medium text-success-700 dark:bg-success-700/15 dark:text-success-600">
      <Check className="h-3 w-3" aria-hidden="true" />
      {t('admin.kyc-tiers.card.myid-required')}
    </span>
  );
}

export function TierCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('p-5 lg:p-6', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-16 rounded-sm" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-14" />
          </div>
        </div>
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-4 w-full" />
      <div className="mt-5 pt-4 border-t border-border space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </Card>
  );
}
