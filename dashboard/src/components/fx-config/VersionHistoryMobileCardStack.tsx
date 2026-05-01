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
import { SourceChip } from './SourceChip';
import { cn, formatDateTime, formatNumber } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { FxRateEntry } from '@/data/mockFxRates';

interface VersionHistoryMobileCardStackProps {
  rows: FxRateEntry[];
  activeId: string | undefined;
  loading?: boolean;
  className?: string;
}

export function VersionHistoryMobileCardStack({
  rows,
  activeId,
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
    navigate(`/audit-log?entity=fx_rate&id=${id}`);
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>{t('admin.fx-config.history.title')}</CardTitle>
        <span className="text-sm text-muted-foreground">
          {t('admin.fx-config.history.count', { count: rows.length })}
        </span>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {t('admin.fx-config.history.empty')}
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
                isActive ? 'border-brand-600/30 bg-brand-50/40 dark:bg-brand-950/30' : 'border-border',
              )}
            >
              <button
                type="button"
                onClick={() => toggle(row.id)}
                className="flex w-full items-start justify-between gap-3 p-3 text-left"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium tabular">
                      {formatDateTime(row.validFrom)}
                    </span>
                    {isActive && (
                      <span className="inline-flex items-center rounded-full bg-success-50 dark:bg-success-700/15 text-success-700 dark:text-success-600 px-2 h-5 text-xs font-medium">
                        {t('admin.fx-config.history.active.yes')}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
                    <span
                      className={cn(
                        'font-mono tabular text-base font-semibold',
                        isActive && 'text-brand-700 dark:text-brand-400',
                      )}
                    >
                      {formatNumber(row.clientRate, 2)}
                    </span>
                    <span className="text-muted-foreground tabular">
                      {t('admin.fx-config.history.mobile.spread', {
                        value: formatNumber(row.spreadPct, 2),
                      })}
                    </span>
                  </div>
                  <SourceChip source={row.source} />
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
                  <dl className="grid grid-cols-[120px_1fr] gap-y-1 text-sm">
                    <dt className="text-muted-foreground">{t('admin.fx-config.history.expanded.field.id')}</dt>
                    <dd className="font-mono tabular">{row.id}</dd>
                    <dt className="text-muted-foreground">{t('admin.fx-config.history.expanded.field.mid-rate')}</dt>
                    <dd className="font-mono tabular">{formatNumber(row.midRate, 4)}</dd>
                    <dt className="text-muted-foreground">{t('admin.fx-config.history.expanded.field.client-rate')}</dt>
                    <dd className="font-mono tabular text-brand-700 dark:text-brand-400">{formatNumber(row.clientRate, 4)}</dd>
                    <dt className="text-muted-foreground">{t('admin.fx-config.history.column.effective-to')}</dt>
                    <dd className="tabular">
                      {row.validTo === null
                        ? t('admin.fx-config.active.valid-to.open')
                        : formatDateTime(row.validTo)}
                    </dd>
                    <dt className="text-muted-foreground">{t('admin.fx-config.history.expanded.field.created-by')}</dt>
                    <dd className="font-mono tabular">{row.createdBy}</dd>
                    <dt className="text-muted-foreground">{t('admin.fx-config.history.expanded.field.reason')}</dt>
                    <dd>{row.reasonNote ?? <em className="text-muted-foreground">{t('admin.fx-config.history.expanded.no-reason')}</em>}</dd>
                  </dl>

                  {previous && (
                    <div className="pt-2 border-t border-border">
                      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                        {t('admin.fx-config.history.expanded.diff')}
                      </div>
                      <dl className="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-1 text-sm">
                        <dt className="text-muted-foreground">{t('admin.fx-config.diff.row.mid-rate')}</dt>
                        <dd className="font-mono tabular text-muted-foreground text-right">
                          {formatNumber(previous.midRate, 2)}
                        </dd>
                        <dd className={cn(
                          'font-mono tabular text-right',
                          previous.midRate !== row.midRate ? 'font-medium' : 'text-muted-foreground',
                        )}>
                          {formatNumber(row.midRate, 2)}
                        </dd>
                        <dt className="text-muted-foreground">{t('admin.fx-config.diff.row.client-rate')}</dt>
                        <dd className="font-mono tabular text-muted-foreground text-right">
                          {formatNumber(previous.clientRate, 2)}
                        </dd>
                        <dd className={cn(
                          'font-mono tabular text-right',
                          previous.clientRate !== row.clientRate ? 'font-medium text-brand-700 dark:text-brand-400' : 'text-muted-foreground',
                        )}>
                          {formatNumber(row.clientRate, 2)}
                        </dd>
                      </dl>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          aria-label={t('admin.fx-config.history.row.actions.aria')}
                          className="inline-flex items-center justify-center rounded-md h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openAuditEntry(row.id)}>
                          <ScrollText className="h-4 w-4 mr-2" aria-hidden="true" />
                          {t('admin.fx-config.history.row.action.open-audit')}
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
