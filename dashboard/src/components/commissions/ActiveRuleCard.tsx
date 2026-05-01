import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Money } from '@/components/zhipay/Money';
import { cn, formatNumber, formatDateTime, formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { CommissionRuleEntry } from '@/data/mockCommissionRules';

interface ActiveRuleCardProps {
  rule: CommissionRuleEntry | undefined;
  loading?: boolean;
  onNewVersion: () => void;
  className?: string;
}

/**
 * Active commission rule card — shown for the selected account-type tab.
 *
 * Layout (per spec):
 *   • Top row — title + version chip + right-side "New version" CTA
 *   • 4-cell grid (personal) / 6-cell grid (corporate) on lg+, 2-cell on
 *     tablet/mobile
 *   • Meta strip — effective-from / effective-to / created-by
 */
export function ActiveRuleCard({
  rule,
  loading,
  onNewVersion,
  className,
}: ActiveRuleCardProps) {
  if (loading) return <ActiveRuleCardSkeleton className={className} />;

  if (!rule) {
    return (
      <Card className={cn('p-6 text-sm text-muted-foreground', className)}>
        {t('admin.commissions.active.empty')}
      </Card>
    );
  }

  const isCorporate = rule.accountType === 'corporate';

  return (
    <Card className={cn('p-5 lg:p-6', className)}>
      {/* Top row — title + version chip + New version CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold tracking-tight">
            {t('admin.commissions.active.title')}
          </h2>
          <span className="inline-flex items-center rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 px-2.5 h-6 text-xs font-medium font-mono tabular">
            v{rule.version}
          </span>
        </div>
        <Button onClick={onNewVersion} className="flex-1 md:flex-none">
          <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
          {t('admin.commissions.action.new-version')}
        </Button>
      </div>

      {/* Grid — 4 cells personal, 6 cells corporate */}
      <div
        className={cn(
          'mt-5 grid gap-4 lg:gap-6',
          'grid-cols-2',
          isCorporate ? 'lg:grid-cols-3' : 'lg:grid-cols-4',
        )}
      >
        <Cell label={t('admin.commissions.active.min-pct')}>
          <span className="font-mono tabular text-2xl lg:text-3xl font-semibold tracking-tight">
            {formatNumber(rule.minPct, 2)}%
          </span>
        </Cell>

        <Cell label={t('admin.commissions.active.max-pct')}>
          <span className="font-mono tabular text-2xl lg:text-3xl font-semibold tracking-tight">
            {formatNumber(rule.maxPct, 2)}%
          </span>
        </Cell>

        <Cell label={t('admin.commissions.active.min-fee')}>
          <Money
            amount={rule.minFeeUzsTiyins}
            currency="UZS"
            className="text-2xl lg:text-3xl font-semibold tracking-tight"
          />
        </Cell>

        {isCorporate && rule.volumeThresholdUsdCents !== null && (
          <Cell label={t('admin.commissions.active.volume-threshold')}>
            <Money
              amount={rule.volumeThresholdUsdCents}
              currency="USD"
              className="text-2xl lg:text-3xl font-semibold tracking-tight"
            />
          </Cell>
        )}

        {isCorporate && rule.corporatePct !== null && (
          <Cell label={t('admin.commissions.active.corporate-pct')}>
            <span className="font-mono tabular text-2xl lg:text-3xl font-semibold tracking-tight text-brand-700 dark:text-brand-400">
              {formatNumber(rule.corporatePct, 2)}%
            </span>
          </Cell>
        )}
      </div>

      {/* Meta strip */}
      <div className="mt-5 pt-5 border-t border-border flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <MetaItem label={t('admin.commissions.active.effective-from')}>
          <span className="tabular text-foreground">
            {formatDateTime(rule.effectiveFrom)}
          </span>
          <span className="ml-1.5 text-muted-foreground">
            ({formatRelative(rule.effectiveFrom)})
          </span>
        </MetaItem>
        <MetaItem label={t('admin.commissions.active.effective-to')}>
          {rule.effectiveTo === null ? (
            <span className="text-foreground italic">
              {t('admin.commissions.active.effective-to.open')}
            </span>
          ) : (
            <span className="tabular text-foreground">
              {formatDateTime(rule.effectiveTo)}
            </span>
          )}
        </MetaItem>
        <MetaItem label={t('admin.commissions.active.created-by')}>
          <span className="font-mono tabular text-foreground">{rule.createdBy}</span>
        </MetaItem>
      </div>
    </Card>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="flex items-baseline">{children}</div>
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

function ActiveRuleCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('p-5 lg:p-6', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
      <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        ))}
      </div>
      <div className="mt-5 pt-5 border-t border-border flex flex-wrap gap-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-5 w-40" />
      </div>
    </Card>
  );
}
