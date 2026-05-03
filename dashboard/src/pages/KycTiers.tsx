import { useEffect, useMemo, useState } from 'react';
import { TierCard, TierCardSkeleton } from '@/components/kyc-tiers/TierCard';
import {
  LiveImpactCard,
  LiveImpactCardSkeleton,
} from '@/components/kyc-tiers/LiveImpactCard';
import {
  getActiveTransferStats,
  getUserCountsByTier,
  listKycTiers,
} from '@/data/mockKycTiers';
import { t } from '@/lib/i18n';

/**
 * KYC Tier Limits — read-only canonical reference at /compliance/kyc-tiers.
 *
 * Tier limits are governed by Compliance + the regulator. This page
 * exists so operators, finance, and new compliance hires can answer
 * "what's tier_2 daily?" without grepping code. Edits flow through
 * docs/models.md §2.2 + a code review, not this surface.
 */
export function KycTiers() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tid = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(tid);
  }, []);

  const tiers = useMemo(() => listKycTiers(), []);
  const counts = useMemo(() => getUserCountsByTier(), []);
  const active = useMemo(() => getActiveTransferStats(), []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('admin.kyc-tiers.title')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('admin.kyc-tiers.subtitle')}
        </p>
      </header>

      {/* Three tier cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {loading
          ? [0, 1, 2].map((i) => <TierCardSkeleton key={i} />)
          : tiers.map((tier) => <TierCard key={tier.code} tier={tier} />)}
      </div>

      {/* Live distribution */}
      {loading ? (
        <LiveImpactCardSkeleton />
      ) : (
        <LiveImpactCard counts={counts} active={active} />
      )}
    </div>
  );
}
