import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Money } from '@/components/zhipay/Money';
import { cn, formatNumber } from '@/lib/utils';
import { t } from '@/lib/i18n';
import {
  computeWorkedExample,
  type CommissionRuleEntry,
} from '@/data/mockCommissionRules';

interface WorkedExampleCardProps {
  rule: CommissionRuleEntry | undefined;
  loading?: boolean;
  className?: string;
  /**
   * When true, render as a compact preview suitable for the right pane of
   * the New-version form (hides the card header subtitle, tighter spacing).
   */
  compact?: boolean;
}

/**
 * Worked-example card — renders a deterministic 5,000,000 UZS sample
 * transfer through the rule and shows commission %, commission UZS,
 * min-fee floor check, and total fee. Corporate rules also render the
 * "above volume threshold" line.
 *
 * The display commission % is the midpoint of [min_pct, max_pct] — see
 * `computeWorkedExample` for rationale.
 */
export function WorkedExampleCard({
  rule,
  loading,
  className,
  compact,
}: WorkedExampleCardProps) {
  if (loading) return <WorkedExampleCardSkeleton className={className} compact={compact} />;
  if (!rule) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{t('admin.commissions.example.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('admin.commissions.example.empty')}
          </p>
        </CardContent>
      </Card>
    );
  }

  const example = computeWorkedExample(rule);

  return (
    <Card className={className}>
      <CardHeader className={cn(compact && 'pb-2')}>
        <CardTitle>{t('admin.commissions.example.title')}</CardTitle>
        {!compact && (
          <p className="text-sm text-muted-foreground">
            {t('admin.commissions.example.subtitle')}
          </p>
        )}
      </CardHeader>
      <CardContent className={cn('space-y-3', compact && 'pt-0')}>
        {/* Sample amount — header */}
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            {t('admin.commissions.example.sample-amount')}
          </span>
          <Money
            amount={example.amountUzsTiyins}
            currency="UZS"
            className="text-base font-semibold"
          />
        </div>

        <div className="border-t border-border pt-3 space-y-2 text-sm">
          {/* Commission % line */}
          <Row
            label={t('admin.commissions.example.commission-pct.label')}
            detail={t('admin.commissions.example.commission-pct.detail', {
              minPct: formatNumber(rule.minPct, 2),
              maxPct: formatNumber(rule.maxPct, 2),
            })}
            value={
              <span className="font-mono tabular font-medium">
                {formatNumber(example.commissionPct, 2)}%
              </span>
            }
          />

          {/* Commission UZS line */}
          <Row
            label={t('admin.commissions.example.commission-uzs.label')}
            value={
              <Money amount={example.commissionUzsTiyins} currency="UZS" />
            }
          />

          {/* Min-fee floor line */}
          <Row
            label={t('admin.commissions.example.min-fee.label')}
            detail={
              example.floorApplies
                ? t('admin.commissions.example.min-fee.applies')
                : t('admin.commissions.example.min-fee.doesnt-apply')
            }
            value={<Money amount={example.minFeeUzsTiyins} currency="UZS" />}
          />

          {/* Total fee line */}
          <div className="pt-2 border-t border-border">
            <Row
              label={
                <span className="text-foreground font-medium">
                  {t('admin.commissions.example.total-fee.label')}
                </span>
              }
              value={
                <Money
                  amount={example.totalFeeUzsTiyins}
                  currency="UZS"
                  className="font-semibold text-brand-700 dark:text-brand-400 text-base"
                />
              }
            />
          </div>
        </div>

        {/* Corporate above-threshold variant */}
        {example.corporateAboveThreshold && (
          <div className="rounded-md border border-border bg-slate-50/60 dark:bg-slate-900/40 p-3 space-y-2">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t('admin.commissions.example.above-threshold.title')}
            </div>
            <p className="text-sm text-foreground/90">
              {t('admin.commissions.example.above-threshold.body', {
                threshold: formatUsdCents(example.corporateAboveThreshold.volumeThresholdUsdCents),
                corporatePct: formatNumber(example.corporateAboveThreshold.corporatePct, 2),
              })}
            </p>
            <Row
              label={t('admin.commissions.example.above-threshold.commission-uzs.label')}
              value={
                <Money
                  amount={example.corporateAboveThreshold.commissionUzsTiyins}
                  currency="UZS"
                  className="font-semibold text-brand-700 dark:text-brand-400"
                />
              }
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  detail,
  value,
}: {
  label: React.ReactNode;
  detail?: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="text-foreground/90">{label}</div>
        {detail && (
          <div className="text-sm text-muted-foreground mt-0.5">{detail}</div>
        )}
      </div>
      <div className="shrink-0 text-right">{value}</div>
    </div>
  );
}

function formatUsdCents(cents: bigint): string {
  const dollars = Number(cents / 100n);
  return `${formatNumber(dollars, 2).replace(/\.00$/, '.00')} USD`;
}

function WorkedExampleCardSkeleton({
  className,
  compact,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Card className={className}>
      <CardHeader className={cn(compact && 'pb-2')}>
        <Skeleton className="h-5 w-44" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
      </CardContent>
    </Card>
  );
}
