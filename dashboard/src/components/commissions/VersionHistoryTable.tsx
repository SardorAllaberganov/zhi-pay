import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, MoreHorizontal, ScrollText } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

interface VersionHistoryTableProps {
  rows: CommissionRuleEntry[];
  activeId: string | undefined;
  accountType: AccountType;
  loading?: boolean;
  className?: string;
}

/**
 * Desktop version-history table for commission rules.
 *
 * Columns: Version / Effective from / Effective to / Min % / Max % / Min fee / Active / "⋮"
 * Default sort: rows passed in newest-first by effectiveFrom (handled by caller).
 * Active row → bg-brand-50/60 (matches FX Config). Click expands inline
 * showing full record + diff vs previous + reason note.
 *
 * Title Case headers + `text-sm font-medium text-muted-foreground` per
 * LESSON 2026-05-02.
 */
export function VersionHistoryTable({
  rows,
  activeId,
  accountType,
  loading,
  className,
}: VersionHistoryTableProps) {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) return <Skeleton5Rows className={className} />;

  if (rows.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{t('admin.commissions.history.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('admin.commissions.history.empty')}
          </p>
        </CardContent>
      </Card>
    );
  }

  function toggle(id: string) {
    setExpandedId((cur) => (cur === id ? null : id));
  }

  function openAuditEntry(rowId: string) {
    navigate(`/audit-log?entity=commission_rule&id=${rowId}`);
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle>{t('admin.commissions.history.title')}</CardTitle>
        <span className="text-sm text-muted-foreground">
          {t('admin.commissions.history.count', { count: rows.length })}
        </span>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>{t('admin.commissions.history.column.version')}</TableHead>
                <TableHead>{t('admin.commissions.history.column.effective-from')}</TableHead>
                <TableHead>{t('admin.commissions.history.column.effective-to')}</TableHead>
                <TableHead className="text-right">{t('admin.commissions.history.column.min-pct')}</TableHead>
                <TableHead className="text-right">{t('admin.commissions.history.column.max-pct')}</TableHead>
                <TableHead className="text-right">{t('admin.commissions.history.column.min-fee')}</TableHead>
                <TableHead>{t('admin.commissions.history.column.active')}</TableHead>
                <TableHead className="w-12 text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, idx) => {
                const previous = rows[idx + 1];
                const isActive = row.id === activeId;
                const isExpanded = row.id === expandedId;
                return (
                  <RowGroup
                    key={row.id}
                    row={row}
                    previous={previous}
                    isActive={isActive}
                    isExpanded={isExpanded}
                    accountType={accountType}
                    onToggle={() => toggle(row.id)}
                    onOpenAudit={() => openAuditEntry(row.id)}
                  />
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function RowGroup({
  row,
  previous,
  isActive,
  isExpanded,
  accountType,
  onToggle,
  onOpenAudit,
}: {
  row: CommissionRuleEntry;
  previous: CommissionRuleEntry | undefined;
  isActive: boolean;
  isExpanded: boolean;
  accountType: AccountType;
  onToggle: () => void;
  onOpenAudit: () => void;
}) {
  return (
    <>
      <TableRow
        className={cn(
          'cursor-pointer',
          isActive &&
            'bg-brand-50/60 dark:bg-brand-950/30 hover:bg-brand-50 dark:hover:bg-brand-950/40',
        )}
        onClick={onToggle}
      >
        <TableCell className="text-muted-foreground">
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              isExpanded ? 'rotate-180' : 'rotate-0',
            )}
            aria-hidden="true"
          />
        </TableCell>
        <TableCell
          className={cn(
            'tabular font-mono text-sm font-medium',
            isActive && 'text-brand-700 dark:text-brand-400',
          )}
        >
          v{row.version}
        </TableCell>
        <TableCell className="tabular text-sm">
          {formatDateTime(row.effectiveFrom)}
        </TableCell>
        <TableCell className="tabular text-sm">
          {row.effectiveTo === null ? (
            <span className="italic text-muted-foreground">
              {t('admin.commissions.active.effective-to.open')}
            </span>
          ) : (
            formatDateTime(row.effectiveTo)
          )}
        </TableCell>
        <TableCell className="text-right font-mono tabular text-sm">
          {formatNumber(row.minPct, 2)}%
        </TableCell>
        <TableCell className="text-right font-mono tabular text-sm">
          {formatNumber(row.maxPct, 2)}%
        </TableCell>
        <TableCell className="text-right font-mono tabular text-sm">
          <Money amount={row.minFeeUzsTiyins} currency="UZS" />
        </TableCell>
        <TableCell>
          {isActive ? (
            <span className="inline-flex items-center rounded-full bg-success-50 dark:bg-success-700/15 text-success-700 dark:text-success-600 px-2 h-6 text-xs font-medium">
              {t('admin.commissions.history.active.yes')}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              {t('admin.commissions.history.active.no')}
            </span>
          )}
        </TableCell>
        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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
              <DropdownMenuItem onClick={onToggle}>
                {isExpanded
                  ? t('admin.commissions.history.row.action.collapse')
                  : t('admin.commissions.history.row.action.view')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenAudit}>
                <ScrollText className="h-4 w-4 mr-2" aria-hidden="true" />
                {t('admin.commissions.history.row.action.open-audit')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow
          className={cn(
            'bg-slate-50 dark:bg-slate-900/40',
            'hover:bg-slate-50 dark:hover:bg-slate-900/40',
          )}
        >
          <TableCell colSpan={9} className="p-0">
            <ExpandedRecord row={row} previous={previous} accountType={accountType} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function ExpandedRecord({
  row,
  previous,
  accountType,
}: {
  row: CommissionRuleEntry;
  previous: CommissionRuleEntry | undefined;
  accountType: AccountType;
}) {
  return (
    <div className="px-6 py-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            {t('admin.commissions.history.expanded.full-record')}
          </div>
          <dl className="grid grid-cols-[160px_1fr] gap-y-1.5 text-sm">
            <Field label={t('admin.commissions.history.expanded.field.id')}>
              <span className="font-mono tabular">{row.id}</span>
            </Field>
            <Field label={t('admin.commissions.history.expanded.field.version')}>
              <span className="font-mono tabular">v{row.version}</span>
            </Field>
            <Field label={t('admin.commissions.history.expanded.field.account-type')}>
              <span className="font-mono tabular">{row.accountType}</span>
            </Field>
            <Field label={t('admin.commissions.history.expanded.field.min-pct')}>
              <span className="font-mono tabular">{formatNumber(row.minPct, 4)}%</span>
            </Field>
            <Field label={t('admin.commissions.history.expanded.field.max-pct')}>
              <span className="font-mono tabular">{formatNumber(row.maxPct, 4)}%</span>
            </Field>
            <Field label={t('admin.commissions.history.expanded.field.min-fee')}>
              <Money amount={row.minFeeUzsTiyins} currency="UZS" />
            </Field>
            {accountType === 'corporate' && row.volumeThresholdUsdCents !== null && (
              <Field label={t('admin.commissions.history.expanded.field.volume-threshold')}>
                <Money amount={row.volumeThresholdUsdCents} currency="USD" />
              </Field>
            )}
            {accountType === 'corporate' && row.corporatePct !== null && (
              <Field label={t('admin.commissions.history.expanded.field.corporate-pct')}>
                <span className="font-mono tabular text-brand-700 dark:text-brand-400 font-medium">
                  {formatNumber(row.corporatePct, 4)}%
                </span>
              </Field>
            )}
            <Field label={t('admin.commissions.history.expanded.field.created-by')}>
              <span className="font-mono tabular">{row.createdBy}</span>
            </Field>
            <Field label={t('admin.commissions.history.expanded.field.reason')}>
              <span className="text-foreground/90">{row.reasonNote}</span>
            </Field>
          </dl>
        </div>

        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            {t('admin.commissions.history.expanded.diff')}
          </div>
          {previous ? (
            <DiffTable previous={previous} current={row} accountType={accountType} />
          ) : (
            <p className="text-sm text-muted-foreground italic">
              {t('admin.commissions.history.expanded.no-previous')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DiffTable({
  previous,
  current,
  accountType,
}: {
  previous: CommissionRuleEntry;
  current: CommissionRuleEntry;
  accountType: AccountType;
}) {
  const rows: Array<{
    label: string;
    prev: React.ReactNode;
    next: React.ReactNode;
    changed: boolean;
  }> = [
    {
      label: t('admin.commissions.diff.row.min-pct'),
      prev: `${formatNumber(previous.minPct, 2)}%`,
      next: `${formatNumber(current.minPct, 2)}%`,
      changed: previous.minPct !== current.minPct,
    },
    {
      label: t('admin.commissions.diff.row.max-pct'),
      prev: `${formatNumber(previous.maxPct, 2)}%`,
      next: `${formatNumber(current.maxPct, 2)}%`,
      changed: previous.maxPct !== current.maxPct,
    },
    {
      label: t('admin.commissions.diff.row.min-fee'),
      prev: <Money amount={previous.minFeeUzsTiyins} currency="UZS" />,
      next: <Money amount={current.minFeeUzsTiyins} currency="UZS" />,
      changed: previous.minFeeUzsTiyins !== current.minFeeUzsTiyins,
    },
  ];
  if (accountType === 'corporate') {
    if (previous.volumeThresholdUsdCents !== null && current.volumeThresholdUsdCents !== null) {
      rows.push({
        label: t('admin.commissions.diff.row.volume-threshold'),
        prev: <Money amount={previous.volumeThresholdUsdCents} currency="USD" />,
        next: <Money amount={current.volumeThresholdUsdCents} currency="USD" />,
        changed:
          previous.volumeThresholdUsdCents !== current.volumeThresholdUsdCents,
      });
    }
    if (previous.corporatePct !== null && current.corporatePct !== null) {
      rows.push({
        label: t('admin.commissions.diff.row.corporate-pct'),
        prev: `${formatNumber(previous.corporatePct, 2)}%`,
        next: `${formatNumber(current.corporatePct, 2)}%`,
        changed: previous.corporatePct !== current.corporatePct,
      });
    }
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3">{t('admin.commissions.diff.column.field')}</TableHead>
            <TableHead className="text-right">{t('admin.commissions.diff.column.previous')}</TableHead>
            <TableHead className="text-right">{t('admin.commissions.diff.column.current')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.label}>
              <TableCell className="text-sm">{r.label}</TableCell>
              <TableCell className="text-right text-sm font-mono tabular text-muted-foreground">
                {r.prev}
              </TableCell>
              <TableCell
                className={cn(
                  'text-right text-sm font-mono tabular',
                  r.changed ? 'text-foreground font-medium' : 'text-muted-foreground',
                )}
              >
                {r.next}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground self-center">
        {label}
      </dt>
      <dd className="text-sm">{children}</dd>
    </>
  );
}

function Skeleton5Rows({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="px-0 pb-0 space-y-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-none" />
        ))}
      </CardContent>
    </Card>
  );
}
