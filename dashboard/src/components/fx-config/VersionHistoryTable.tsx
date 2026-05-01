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
import { SourceChip } from './SourceChip';
import { cn, formatDateTime, formatNumber } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { FxRateEntry } from '@/data/mockFxRates';

interface VersionHistoryTableProps {
  rows: FxRateEntry[];
  activeId: string | undefined;
  loading?: boolean;
  className?: string;
}

export function VersionHistoryTable({
  rows,
  activeId,
  loading,
  className,
}: VersionHistoryTableProps) {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) return <VersionHistoryTableSkeleton className={className} />;

  if (rows.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{t('admin.fx-config.history.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('admin.fx-config.history.empty')}
          </p>
        </CardContent>
      </Card>
    );
  }

  function toggle(id: string) {
    setExpandedId((cur) => (cur === id ? null : id));
  }

  function openAuditEntry(rowId: string) {
    navigate(`/audit-log?entity=fx_rate&id=${rowId}`);
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle>{t('admin.fx-config.history.title')}</CardTitle>
        <span className="text-sm text-muted-foreground">
          {t('admin.fx-config.history.count', { count: rows.length })}
        </span>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>{t('admin.fx-config.history.column.effective-from')}</TableHead>
                <TableHead>{t('admin.fx-config.history.column.effective-to')}</TableHead>
                <TableHead className="text-right">{t('admin.fx-config.history.column.mid-rate')}</TableHead>
                <TableHead className="text-right">{t('admin.fx-config.history.column.spread')}</TableHead>
                <TableHead className="text-right">{t('admin.fx-config.history.column.client-rate')}</TableHead>
                <TableHead>{t('admin.fx-config.history.column.source')}</TableHead>
                <TableHead>{t('admin.fx-config.history.column.active')}</TableHead>
                <TableHead>{t('admin.fx-config.history.column.created-by')}</TableHead>
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
  onToggle,
  onOpenAudit,
}: {
  row: FxRateEntry;
  previous: FxRateEntry | undefined;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onOpenAudit: () => void;
}) {
  return (
    <>
      <TableRow
        className={cn(
          'cursor-pointer',
          isActive && 'bg-brand-50/60 dark:bg-brand-950/30 hover:bg-brand-50 dark:hover:bg-brand-950/40',
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
        <TableCell className="tabular text-sm">
          {formatDateTime(row.validFrom)}
        </TableCell>
        <TableCell className="tabular text-sm">
          {row.validTo === null ? (
            <span className="italic text-muted-foreground">
              {t('admin.fx-config.active.valid-to.open')}
            </span>
          ) : (
            formatDateTime(row.validTo)
          )}
        </TableCell>
        <TableCell className="text-right font-mono tabular text-sm">
          {formatNumber(row.midRate, 2)}
        </TableCell>
        <TableCell className="text-right font-mono tabular text-sm">
          {formatNumber(row.spreadPct, 2)}%
        </TableCell>
        <TableCell
          className={cn(
            'text-right font-mono tabular text-sm font-medium',
            isActive && 'text-brand-700 dark:text-brand-400',
          )}
        >
          {formatNumber(row.clientRate, 2)}
        </TableCell>
        <TableCell>
          <SourceChip source={row.source} />
        </TableCell>
        <TableCell>
          {isActive ? (
            <span className="inline-flex items-center rounded-full bg-success-50 dark:bg-success-700/15 text-success-700 dark:text-success-600 px-2 h-6 text-xs font-medium">
              {t('admin.fx-config.history.active.yes')}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              {t('admin.fx-config.history.active.no')}
            </span>
          )}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground font-mono tabular">
          {row.createdBy}
        </TableCell>
        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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
              <DropdownMenuItem onClick={onToggle}>
                {isExpanded
                  ? t('admin.fx-config.history.row.action.collapse')
                  : t('admin.fx-config.history.row.action.view')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenAudit}>
                <ScrollText className="h-4 w-4 mr-2" aria-hidden="true" />
                {t('admin.fx-config.history.row.action.open-audit')}
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
          <TableCell colSpan={10} className="p-0">
            <ExpandedRecord row={row} previous={previous} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function ExpandedRecord({
  row,
  previous,
}: {
  row: FxRateEntry;
  previous: FxRateEntry | undefined;
}) {
  return (
    <div className="px-6 py-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            {t('admin.fx-config.history.expanded.full-record')}
          </div>
          <dl className="grid grid-cols-[140px_1fr] gap-y-1.5 text-sm">
            <Field label={t('admin.fx-config.history.expanded.field.id')}>
              <span className="font-mono tabular">{row.id}</span>
            </Field>
            <Field label={t('admin.fx-config.history.expanded.field.pair')}>
              <span className="font-mono tabular">{row.pair}</span>
            </Field>
            <Field label={t('admin.fx-config.history.expanded.field.mid-rate')}>
              <span className="font-mono tabular">
                {formatNumber(row.midRate, 4)}
              </span>
            </Field>
            <Field label={t('admin.fx-config.history.expanded.field.spread')}>
              <span className="font-mono tabular">{formatNumber(row.spreadPct, 4)}%</span>
            </Field>
            <Field label={t('admin.fx-config.history.expanded.field.client-rate')}>
              <span className="font-mono tabular text-brand-700 dark:text-brand-400 font-medium">
                {formatNumber(row.clientRate, 4)}
              </span>
            </Field>
            <Field label={t('admin.fx-config.history.expanded.field.source')}>
              <SourceChip source={row.source} />
            </Field>
            <Field label={t('admin.fx-config.history.expanded.field.created-by')}>
              <span className="font-mono tabular">{row.createdBy}</span>
            </Field>
            <Field label={t('admin.fx-config.history.expanded.field.reason')}>
              <span className="text-foreground/90">
                {row.reasonNote ?? <em className="text-muted-foreground">{t('admin.fx-config.history.expanded.no-reason')}</em>}
              </span>
            </Field>
          </dl>
        </div>

        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            {t('admin.fx-config.history.expanded.diff')}
          </div>
          {previous ? (
            <DiffTable previous={previous} current={row} />
          ) : (
            <p className="text-sm text-muted-foreground italic">
              {t('admin.fx-config.history.expanded.no-previous')}
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
}: {
  previous: FxRateEntry;
  current: FxRateEntry;
}) {
  const rows: Array<{
    label: string;
    prev: string;
    next: string;
    changed: boolean;
  }> = [
    {
      label: t('admin.fx-config.diff.row.mid-rate'),
      prev: formatNumber(previous.midRate, 2),
      next: formatNumber(current.midRate, 2),
      changed: previous.midRate !== current.midRate,
    },
    {
      label: t('admin.fx-config.diff.row.spread'),
      prev: `${formatNumber(previous.spreadPct, 2)}%`,
      next: `${formatNumber(current.spreadPct, 2)}%`,
      changed: previous.spreadPct !== current.spreadPct,
    },
    {
      label: t('admin.fx-config.diff.row.client-rate'),
      prev: formatNumber(previous.clientRate, 2),
      next: formatNumber(current.clientRate, 2),
      changed: previous.clientRate !== current.clientRate,
    },
    {
      label: t('admin.fx-config.diff.row.source'),
      prev: t(`admin.fx-config.source.${previous.source}`),
      next: t(`admin.fx-config.source.${current.source}`),
      changed: previous.source !== current.source,
    },
  ];
  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3">{t('admin.fx-config.diff.column.field')}</TableHead>
            <TableHead className="text-right">{t('admin.fx-config.diff.column.previous')}</TableHead>
            <TableHead className="text-right">{t('admin.fx-config.diff.column.current')}</TableHead>
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

function VersionHistoryTableSkeleton({ className }: { className?: string }) {
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
