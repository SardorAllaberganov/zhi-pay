import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FxStatusBadge } from './FxStatusBadge';
import { SourceChip } from './SourceChip';
import { cn, formatNumber, formatDateTime } from '@/lib/utils';
import { t } from '@/lib/i18n';
import {
  type FxRateEntry,
  getFxHealth,
} from '@/data/mockFxRates';

interface ActiveRateCardProps {
  rate: FxRateEntry | undefined;
  inFlightCount: number;
  loading?: boolean;
  className?: string;
}

/**
 * Active FX rate card — the one whose [validFrom, validTo) covers now().
 *
 * Layout: 4-cell grid on `lg+`, 2-cell on tablet/mobile.
 * Below the grid: pair / valid_from / valid_to / in-flight count.
 * Top-right: health badge.
 */
export function ActiveRateCard({
  rate,
  inFlightCount,
  loading,
  className,
}: ActiveRateCardProps) {
  if (loading) return <ActiveRateCardSkeleton className={className} />;

  if (!rate) {
    return (
      <Card className={cn('p-6 text-sm text-muted-foreground', className)}>
        {t('admin.fx-config.active.empty')}
      </Card>
    );
  }

  const health = getFxHealth(rate);

  return (
    <Card className={cn('p-5 lg:p-6', className)}>
      {/* Top row — title + status badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            {t('admin.fx-config.active.title')}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t('admin.fx-config.active.subtitle')}
          </p>
        </div>
        <FxStatusBadge state={health} />
      </div>

      {/* 4-cell grid — collapses to 2 on tablet, 2 on mobile.
          (Spec: grid-cols-4 desktop, 2 on tablet.) */}
      <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Cell label={t('admin.fx-config.active.mid-rate')}>
          <span className="font-mono tabular text-2xl lg:text-3xl font-semibold tracking-tight">
            {formatNumber(rate.midRate, 2)}
          </span>
          <span className="ml-1.5 text-sm text-muted-foreground">
            {t('admin.fx-config.unit.uzs-per-cny')}
          </span>
        </Cell>

        <Cell label={t('admin.fx-config.active.spread')}>
          <span className="font-mono tabular text-2xl lg:text-3xl font-semibold tracking-tight">
            {formatNumber(rate.spreadPct, 2)}%
          </span>
        </Cell>

        <Cell label={t('admin.fx-config.active.client-rate')}>
          <span className="font-mono tabular text-2xl lg:text-3xl font-semibold tracking-tight text-brand-700 dark:text-brand-400">
            {formatNumber(rate.clientRate, 2)}
          </span>
          <span className="ml-1.5 text-sm text-muted-foreground">
            {t('admin.fx-config.unit.uzs-per-cny')}
          </span>
        </Cell>

        <Cell label={t('admin.fx-config.active.source')}>
          <SourceChip source={rate.source} />
        </Cell>
      </div>

      {/* Below the grid — meta strip */}
      <div className="mt-5 pt-5 border-t border-border flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <MetaItem label={t('admin.fx-config.active.pair')}>
          <span className="font-mono tabular px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-foreground/90">
            {rate.pair}
          </span>
        </MetaItem>
        <MetaItem label={t('admin.fx-config.active.valid-from')}>
          <span className="tabular text-foreground">
            {formatDateTime(rate.validFrom)}
          </span>
        </MetaItem>
        <MetaItem label={t('admin.fx-config.active.valid-to')}>
          {rate.validTo === null ? (
            <span className="text-foreground italic">
              {t('admin.fx-config.active.valid-to.open')}
            </span>
          ) : (
            <span className="tabular text-foreground">
              {formatDateTime(rate.validTo)}
            </span>
          )}
        </MetaItem>
        <MetaItem label={t('admin.fx-config.active.in-flight-locked')}>
          <span className="tabular font-mono font-medium text-foreground">
            {t('admin.fx-config.active.in-flight-locked.value', {
              count: inFlightCount.toLocaleString('en'),
            })}
          </span>
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

function ActiveRateCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('p-5 lg:p-6', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
      <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-32" />
          </div>
        ))}
      </div>
      <div className="mt-5 pt-5 border-t border-border flex flex-wrap gap-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-48" />
      </div>
    </Card>
  );
}
