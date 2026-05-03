import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TierBadge } from '@/components/zhipay/TierBadge';
import { Money } from '@/components/zhipay/Money';
import { cn, formatNumber } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { TierUserCounts, ActiveTransferStats } from '@/data/mockKycTiers';

interface LiveImpactCardProps {
  counts: TierUserCounts;
  active: ActiveTransferStats;
  className?: string;
}

/**
 * Live distribution panel — derived counts from the existing user
 * + transfer mocks. Helps operators answer "how many users are in
 * each tier right now" and "what's the per-tx amount in flight".
 */
export function LiveImpactCard({ counts, active, className }: LiveImpactCardProps) {
  const totalUsers = counts.tier_0 + counts.tier_1 + counts.tier_2;

  return (
    <Card className={cn('p-5 lg:p-6', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            {t('admin.kyc-tiers.impact.title')}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t('admin.kyc-tiers.impact.subtitle')}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t('admin.kyc-tiers.impact.total-users')}
          </div>
          <div className="mt-0.5 font-mono tabular text-2xl lg:text-3xl font-semibold tracking-tight">
            {formatNumber(totalUsers, 0)}
          </div>
        </div>
      </div>

      {/* 3-cell tier-count grid */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TierCount tier="tier_0" count={counts.tier_0} total={totalUsers} />
        <TierCount tier="tier_1" count={counts.tier_1} total={totalUsers} />
        <TierCount tier="tier_2" count={counts.tier_2} total={totalUsers} />
      </div>

      {/* Active transfers strip */}
      <div className="mt-5 pt-5 border-t border-border flex flex-wrap items-baseline gap-x-6 gap-y-2 text-sm">
        <MetaItem label={t('admin.kyc-tiers.impact.active-transfers')}>
          <span className="font-mono tabular text-foreground font-medium">
            {formatNumber(active.count, 0)}
          </span>
        </MetaItem>
        {active.count > 0 ? (
          <MetaItem label={t('admin.kyc-tiers.impact.avg-amount')}>
            <Money
              amount={active.avgAmountTiyins}
              currency="UZS"
              className="text-foreground font-medium"
            />
          </MetaItem>
        ) : (
          <span className="text-muted-foreground italic">
            {t('admin.kyc-tiers.impact.no-active')}
          </span>
        )}
      </div>
    </Card>
  );
}

function TierCount({
  tier,
  count,
  total,
}: {
  tier: 'tier_0' | 'tier_1' | 'tier_2';
  count: number;
  total: number;
}) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <div className="space-y-2">
      <TierBadge tier={tier} />
      <div className="flex items-baseline gap-2">
        <span className="font-mono tabular text-2xl lg:text-3xl font-semibold tracking-tight">
          {formatNumber(count, 0)}
        </span>
        <span className="text-sm text-muted-foreground">
          {pct}%
        </span>
      </div>
    </div>
  );
}

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{label}:</span>
      {children}
    </div>
  );
}

export function LiveImpactCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('p-5 lg:p-6', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-1 h-4 w-64" />
        </div>
        <div className="text-right space-y-1">
          <Skeleton className="ml-auto h-3 w-20" />
          <Skeleton className="ml-auto h-9 w-20" />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-16 rounded-sm" />
            <Skeleton className="h-9 w-24" />
          </div>
        ))}
      </div>
      <div className="mt-5 pt-5 border-t border-border flex flex-wrap gap-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-5 w-56" />
      </div>
    </Card>
  );
}
