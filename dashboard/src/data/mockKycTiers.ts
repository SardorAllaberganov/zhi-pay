/**
 * mockKycTiers — read-only canonical reference for the three KYC tiers.
 *
 * This module is intentionally without mutators or version history.
 * Tier limits are governed by Compliance + the regulator; the page at
 * /compliance/kyc-tiers exists as a read-only reference, not a config
 * surface. Changes flow through docs/models.md §2.2 + a code review.
 *
 * Numbers come from .claude/rules/kyc-tiers-and-limits.md and are
 * flagged as placeholders pending Compliance sign-off.
 */

import { listUsers, type UserTier } from './mockUsers';
import { TRANSFERS_FULL } from './mockTransfers';

export type KycTierCode = UserTier;

export interface TierConfig {
  code: KycTierCode;
  perTxLimitTiyins: bigint;
  dailyLimitTiyins: bigint;
  monthlyLimitTiyins: bigint;
  maxCards: number;
  requiresMyId: boolean;
}

const UZS = (uzs: number): bigint => BigInt(uzs) * 100n;

export const KYC_TIERS: TierConfig[] = [
  {
    code: 'tier_0',
    perTxLimitTiyins: 0n,
    dailyLimitTiyins: 0n,
    monthlyLimitTiyins: 0n,
    maxCards: 1,
    requiresMyId: false,
  },
  {
    code: 'tier_1',
    perTxLimitTiyins: UZS(5_000_000),
    dailyLimitTiyins: UZS(5_000_000),
    monthlyLimitTiyins: UZS(20_000_000),
    maxCards: 2,
    requiresMyId: false,
  },
  {
    code: 'tier_2',
    perTxLimitTiyins: UZS(50_000_000),
    dailyLimitTiyins: UZS(50_000_000),
    monthlyLimitTiyins: UZS(200_000_000),
    maxCards: 5,
    requiresMyId: true,
  },
];

export function listKycTiers(): TierConfig[] {
  return KYC_TIERS.slice();
}

export function getKycTier(code: KycTierCode): TierConfig | undefined {
  return KYC_TIERS.find((t) => t.code === code);
}

// ── Live distribution (derived from the existing mocks) ─────────────────

export interface TierUserCounts {
  tier_0: number;
  tier_1: number;
  tier_2: number;
}

export function getUserCountsByTier(): TierUserCounts {
  const counts: TierUserCounts = { tier_0: 0, tier_1: 0, tier_2: 0 };
  for (const u of listUsers()) {
    counts[u.tier] += 1;
  }
  return counts;
}

export interface ActiveTransferStats {
  count: number;
  avgAmountTiyins: bigint;
}

export function getActiveTransferStats(): ActiveTransferStats {
  const processing = TRANSFERS_FULL.filter((t) => t.status === 'processing');
  if (processing.length === 0) {
    return { count: 0, avgAmountTiyins: 0n };
  }
  let sum = 0n;
  for (const t of processing) sum += t.amountUzs;
  return {
    count: processing.length,
    avgAmountTiyins: sum / BigInt(processing.length),
  };
}
