import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, MoreHorizontal, ScrollText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Money } from '@/components/zhipay/Money';
import { cn, formatDateTime, formatNumber } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type {
  AccountType,
  CommissionRuleEntry,
} from '@/data/mockCommissionRules';

interface VersionHistoryMobileCardStackProps {
  rows: CommissionRuleEntry[];
  activeId: string | undefined;
  accountType: AccountType;
  loading?: boolean;
  className?: string;
}

export function VersionHistoryMobileCardStack({
  rows,
  activeId,
  accountType,
  loading,
  className,
}: VersionHistoryMobileCardStackProps) {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-5 w-44" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  function toggle(id: string) {
    setExpandedId((cur) => (cur === id ? null : id));
  }

  function openAuditEntry(id: string) {
    navigate(`/audit-log?entity=commission_rule&id=${id}`);
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>{t('admin.commissions.history.title')}</CardTitle>
        <span className="text-sm text-muted-foreground">
          {t('admin.commissions.history.count', { count: rows.length })}
        </span>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {t('admin.commissions.history.empty')}
          </p>
        )}
        {rows.map((row, idx) => {
          const previous = rows[idx + 1];
          const isActive = row.id === activeId;
          const isExpanded = row.id === expandedId;
          return (
            <div
              key={row.id}
              className={cn(
                'rounded-md border bg-card text-card-foreground shadow-sm',
                isActive
                  ? 'border-brand-600/30 bg-brand-50/40 dark:bg-brand-950/30'
                  : 'border-border',
              )}
            >
              <button
                type="button"
                onClick={() => toggle(row.id)}
                className="flex w-full items-start justify-between gap-3 p-3 text-left"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'font-mono tabular text-sm font-medium',
                        isActive && 'text-brand-700 dark:text-brand-400',
                      )}
                    >
                      v{row.version}
                    </span>
                    <span className="text-sm tabular text-foreground/90">
                      {formatDateTime(row.effectiveFrom)}
                    </span>
                    {isActive && (
                      <span className="inline-flex items-center rounded-full bg-success-50 dark:bg-success-700/15 text-success-700 dark:text-success-600 px-2 h-5 text-xs font-medium">
                        {t('admin.commissions.history.active.yes')}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
                    <span className="font-mono tabular">
                      {formatNumber(row.minPct, 2)}% – {formatNumber(row.maxPct, 2)}%
                    </span>
                    <span className="text-muted-foreground">
                      {t('admin.commissions.history.mobile.min-fee')}{' '}
                      <Money amount={row.minFeeUzsTiyins} currency="UZS" />
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 mt-1 text-muted-foreground transition-transform',
                    isExpanded ? 'rotate-180' : 'rotate-0',
                  )}
                  aria-hidden="true"
                />
              </button>
              {isExpanded && (
                <div className="border-t border-border px-3 py-3 space-y-3 bg-slate-50/60 dark:bg-slate-900/40">
                  <dl className="grid grid-cols-[140px_1fr] gap-y-1 text-sm">
                    <dt className="text-muted-foreground">
                      {t('admin.commissions.history.expanded.field.id')}
                    </dt>
                    <dd className="font-mono tabular">{row.id}</dd>
                    <dt className="text-muted-foreground">
                      {t('admin.commissions.history.column.effective-to')}
                    </dt>
                    <dd className="tabular">
                      {row.effectiveTo === null
                        ? t('admin.commissions.active.effective-to.open')
                        : formatDateTime(row.effectiveTo)}
                    </dd>
                    {accountType === 'corporate' && row.volumeThresholdUsdCents !== null && (
                      <>
                        <dt className="text-muted-foreground">
                          {t('admin.commissions.history.expanded.field.volume-threshold')}
                        </dt>
                        <dd>
                          <Money amount={row.volumeThresholdUsdCents} currency="USD" />
                        </dd>
                      </>
                    )}
                    {accountType === 'corporate' && row.corporatePct !== null && (
                      <>
                        <dt className="text-muted-foreground">
                          {t('admin.commissions.history.expanded.field.corporate-pct')}
                        </dt>
                        <dd className="font-mono tabular text-brand-700 dark:text-brand-400">
                          {formatNumber(row.corporatePct, 4)}%
                        </dd>
                      </>
                    )}
                    <dt className="text-muted-foreground">
                      {t('admin.commissions.history.expanded.field.created-by')}
                    </dt>
                    <dd className="font-mono tabular">{row.createdBy}</dd>
                    <dt className="text-muted-foreground">
                      {t('admin.commissions.history.expanded.field.reason')}
                    </dt>
                    <dd>{row.reasonNote}</dd>
                  </dl>

                  {previous && (
                    <div className="pt-2 border-t border-border">
                      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                        {t('admin.commissions.history.expanded.diff')}
                      </div>
                      <dl className="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-1 text-sm">
                        <dt className="text-muted-foreground">
                          {t('admin.commissions.diff.row.min-pct')}
                        </dt>
                        <dd className="font-mono tabular text-muted-foreground text-right">
                          {formatNumber(previous.minPct, 2)}%
                        </dd>
                        <dd
                          className={cn(
                            'font-mono tabular text-right',
                            previous.minPct !== row.minPct
                              ? 'font-medium'
                              : 'text-muted-foreground',
                          )}
                        >
                          {formatNumber(row.minPct, 2)}%
                        </dd>
                        <dt className="text-muted-foreground">
                          {t('admin.commissions.diff.row.max-pct')}
                        </dt>
                        <dd className="font-mono tabular text-muted-foreground text-right">
                          {formatNumber(previous.maxPct, 2)}%
                        </dd>
                        <dd
                          className={cn(
                            'font-mono tabular text-right',
                            previous.maxPct !== row.maxPct
                              ? 'font-medium'
                              : 'text-muted-foreground',
                          )}
                        >
                          {formatNumber(row.maxPct, 2)}%
                        </dd>
                        <dt className="text-muted-foreground">
                          {t('admin.commissions.diff.row.min-fee')}
                        </dt>
                        <dd className="font-mono tabular text-muted-foreground text-right">
                          <Money amount={previous.minFeeUzsTiyins} currency="UZS" />
                        </dd>
                        <dd
                          className={cn(
                            'font-mono tabular text-right',
                            previous.minFeeUzsTiyins !== row.minFeeUzsTiyins
                              ? 'font-medium'
                              : 'text-muted-foreground',
                          )}
                        >
                          <Money amount={row.minFeeUzsTiyins} currency="UZS" />
                        </dd>
                      </dl>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          aria-label={t('admin.commissions.history.row.actions.aria')}
                          className="inline-flex items-center justify-center rounded-md h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openAuditEntry(row.id)}>
                          <ScrollText className="h-4 w-4 mr-2" aria-hidden="true" />
                          {t('admin.commissions.history.row.action.open-audit')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
