import { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  MoreVertical,
  RotateCw,
  ShieldAlert,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Money } from '@/components/zhipay/Money';
import { MaskedPan } from '@/components/zhipay/MaskedPan';
import { StatusBadge } from '@/components/zhipay/StatusBadge';
import { DestinationBadge } from '@/components/zhipay/DestinationBadge';
import { ErrorCell } from '@/components/zhipay/ErrorCell';
import { cn, formatRelative, formatDateTime } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { Transfer } from '@/types';
import type { SortKey, SortState } from './types';

type RowAction = 'copy' | 'audit' | 'reverse' | 'force-fail' | 'resend';

const NOW = new Date('2026-04-29T10:30:00Z');
const STUCK_THRESHOLD_MS = 10 * 60 * 1000;

interface TransfersTableProps {
  rows: Transfer[];
  totalCount: number;
  loading?: boolean;

  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onClearSelection: () => void;
  onBulkExport: () => void;
  onBulkMarkReview: () => void;

  sort: SortState;
  onSort: (key: SortKey) => void;

  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (size: number) => void;

  focusedIndex: number;
  onFocusedIndexChange: (i: number) => void;

  amlByTransferId: (id: string) => boolean;
  onRowOpen: (id: string) => void;
  onRowAction: (action: RowAction, id: string) => void;

  /** Pixel offset for sticky thead and bulk bar (matches filter bar height). */
  stickyTopPx: number;
}

// =====================================================================
// Top-level component
// =====================================================================

export function TransfersTable(props: TransfersTableProps) {
  const {
    rows,
    totalCount,
    loading = false,
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    onClearSelection,
    onBulkExport,
    onBulkMarkReview,
    sort,
    onSort,
    page,
    pageSize,
    onPageChange,
    onPageSizeChange,
    focusedIndex,
    onFocusedIndexChange,
    amlByTransferId,
    onRowOpen,
    onRowAction,
    stickyTopPx,
  } = props;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const fromRow = totalCount === 0 ? 0 : page * pageSize + 1;
  const toRow = Math.min(totalCount, (page + 1) * pageSize);

  const allSelectedOnPage =
    rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
  const someSelectedOnPage =
    rows.some((r) => selectedIds.has(r.id)) && !allSelectedOnPage;

  // Auto-scroll the focused row into view.
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  useEffect(() => {
    const tr = tbodyRef.current?.querySelector<HTMLTableRowElement>(
      `tr[data-row-index="${focusedIndex}"]`,
    );
    tr?.scrollIntoView({ block: 'nearest' });
  }, [focusedIndex]);

  return (
    <div className="space-y-3">
      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div
          className="sticky z-10 flex flex-wrap items-center gap-3 rounded-md border border-brand-600/30 bg-brand-50 px-4 py-2 dark:bg-brand-950/40"
          style={{ top: stickyTopPx + 4 }}
          role="toolbar"
        >
          <span className="text-sm font-medium text-brand-700 dark:text-brand-300">
            {t('admin.transfers.bulk.selected', { count: selectedIds.size })}
          </span>
          <Button variant="outline" size="sm" onClick={onBulkExport}>
            {t('admin.transfers.bulk.export')}
          </Button>
          <Button variant="outline" size="sm" onClick={onBulkMarkReview}>
            {t('admin.transfers.bulk.review')}
          </Button>
          <span className="ml-auto text-xs text-muted-foreground">
            {t('admin.transfers.bulk.no-state-change')}
          </span>
          <Button variant="ghost" size="sm" onClick={onClearSelection} aria-label="Clear selection">
            <X className="h-3.5 w-3.5" />
            {t('admin.transfers.bulk.clear')}
          </Button>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block rounded-md border border-border bg-card overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="border-b">
            <tr>
              <Th className="w-9 pl-3">
                <Checkbox
                  checked={allSelectedOnPage ? true : someSelectedOnPage ? 'indeterminate' : false}
                  onCheckedChange={onToggleSelectAll}
                  aria-label="Select all on this page"
                />
              </Th>
              <SortHead
                label={t('admin.transfers.column.created')}
                sortKey="createdAt"
                sort={sort}
                onSort={onSort}
              />
              <Th>{t('admin.transfers.column.transfer-id')}</Th>
              <Th>{t('admin.transfers.column.card')}</Th>
              <Th>{t('admin.transfers.column.sender')}</Th>
              <Th>{t('admin.transfers.column.recipient')}</Th>
              <SortHead
                label={t('admin.transfers.column.amount-uzs')}
                sortKey="amountUzs"
                sort={sort}
                onSort={onSort}
                align="right"
              />
              <SortHead
                label={t('admin.transfers.column.amount-cny')}
                sortKey="amountCny"
                sort={sort}
                onSort={onSort}
                align="right"
              />
              <Th align="right">{t('admin.transfers.column.fees-uzs')}</Th>
              <Th>{t('admin.transfers.column.status')}</Th>
              <Th>{t('admin.transfers.column.failure')}</Th>
              <Th aria-label="actions" className="w-9" />
            </tr>
          </thead>
          <tbody ref={tbodyRef}>
            {loading
              ? Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
              : rows.map((tr, i) => (
                  <Row
                    key={tr.id}
                    tr={tr}
                    rowIndex={i}
                    focused={i === focusedIndex}
                    selected={selectedIds.has(tr.id)}
                    hasAml={amlByTransferId(tr.id)}
                    onToggleSelect={() => onToggleSelect(tr.id)}
                    onOpen={() => onRowOpen(tr.id)}
                    onAction={(a) => onRowAction(a, tr.id)}
                    onFocus={() => onFocusedIndexChange(i)}
                  />
                ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <ul className="md:hidden space-y-2">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <li key={i}>
                <SkeletonMobileCard />
              </li>
            ))
          : rows.map((tr, i) => (
              <li key={tr.id}>
                <MobileRow
                  tr={tr}
                  rowIndex={i}
                  focused={i === focusedIndex}
                  selected={selectedIds.has(tr.id)}
                  hasAml={amlByTransferId(tr.id)}
                  onToggleSelect={() => onToggleSelect(tr.id)}
                  onOpen={() => onRowOpen(tr.id)}
                  onFocus={() => onFocusedIndexChange(i)}
                />
              </li>
            ))}
      </ul>

      {/* Pagination */}
      <div className="flex flex-col items-start gap-3 px-1 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <label className="inline-flex items-center gap-2">
            {t('admin.transfers.pagination.per-page')}
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 rounded-md border border-border bg-background px-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </label>
          <span className="tabular">
            {t('admin.transfers.pagination.showing', { from: fromRow, to: toRow, count: totalCount })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
            aria-label={t('admin.transfers.pagination.prev')}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            {t('admin.transfers.pagination.prev')}
          </Button>
          <span className="text-sm tabular px-2 text-muted-foreground">
            {t('admin.transfers.pagination.page', { page: page + 1, total: totalPages })}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page + 1 >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label={t('admin.transfers.pagination.next')}
          >
            {t('admin.transfers.pagination.next')}
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// Row (desktop)
// =====================================================================

interface RowProps {
  tr: Transfer;
  rowIndex: number;
  focused: boolean;
  selected: boolean;
  hasAml: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
  onAction: (a: RowAction) => void;
  onFocus: () => void;
}

function Row({
  tr,
  rowIndex,
  focused,
  selected,
  hasAml,
  onToggleSelect,
  onOpen,
  onAction,
  onFocus,
}: RowProps) {
  const railColor =
    tr.status === 'failed'
      ? 'bg-danger-600'
      : tr.status === 'reversed'
        ? 'bg-warning-600'
        : null;

  function handleRowKey(e: React.KeyboardEvent<HTMLTableRowElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      onOpen();
    }
  }

  function handleCellClick(e: React.MouseEvent) {
    // Only open on td clicks (not on checkbox / action button).
    const target = e.target as HTMLElement;
    if (
      target.closest('button, [role="checkbox"], input, [data-row-stop]')
    )
      return;
    onOpen();
  }

  return (
    <tr
      data-row-index={rowIndex}
      tabIndex={focused ? 0 : -1}
      onFocus={onFocus}
      onKeyDown={handleRowKey}
      onClick={handleCellClick}
      className={cn(
        'border-b cursor-pointer transition-colors',
        'hover:bg-slate-50 dark:hover:bg-slate-900/40',
        selected && 'bg-brand-50 dark:bg-brand-950/30',
        focused && 'ring-2 ring-inset ring-brand-600/40',
      )}
    >
      <td className="relative pl-3 py-3 align-middle w-9">
        {railColor && (
          <span
            className={cn('absolute left-0 top-0 bottom-0 w-0.5', railColor)}
            aria-hidden="true"
          />
        )}
        <Checkbox
          checked={selected}
          onCheckedChange={onToggleSelect}
          aria-label={`Select transfer ${tr.id}`}
          data-row-stop
        />
      </td>
      <td
        className="px-3 py-3 align-middle text-sm text-muted-foreground tabular whitespace-nowrap"
        title={formatDateTime(tr.createdAt)}
      >
        {formatRelative(tr.createdAt)}
      </td>
      <td className="px-3 py-3 align-middle">
        <CopyableId id={tr.id} />
      </td>
      <td className="px-3 py-3 align-middle">
        <MaskedPan value={tr.cardMaskedPan} scheme={tr.cardScheme} />
      </td>
      <td className="px-3 py-3 align-middle">
        <div className="font-medium">{tr.userName}</div>
        <div className="text-sm text-muted-foreground tabular">{tr.userPhone}</div>
      </td>
      <td className="px-3 py-3 align-middle">
        <div className="font-mono tabular text-sm font-medium">
          {tr.recipientIdentifier}
        </div>
        <div className="mt-0.5">
          <DestinationBadge destination={tr.destination} />
        </div>
      </td>
      <td className="px-3 py-3 align-middle text-right">
        <Money amount={tr.amountUzs} currency="UZS" />
      </td>
      <td className="px-3 py-3 align-middle text-right">
        <Money amount={tr.amountCny} currency="CNY" className="text-muted-foreground" />
      </td>
      <td className="px-3 py-3 align-middle text-right">
        <Money amount={tr.feeUzs} currency="UZS" className="text-muted-foreground text-sm" />
      </td>
      <td className="px-3 py-3 align-middle">
        <div className="flex items-center gap-1.5">
          <StatusBadge status={tr.status} domain="transfer" />
          {hasAml && (
            <ShieldAlert
              className="h-3.5 w-3.5 text-danger-600"
              aria-label="Has AML flag"
            />
          )}
        </div>
      </td>
      <td className="px-3 py-3 align-middle">
        {tr.failureCode ? (
          <ErrorCell code={tr.failureCode} />
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-3 py-3 align-middle w-9 text-right" data-row-stop>
        <ActionMenu transfer={tr} onAction={onAction} />
      </td>
    </tr>
  );
}

// =====================================================================
// Row (mobile)
// =====================================================================

function MobileRow({
  tr,
  rowIndex,
  focused,
  selected,
  hasAml,
  onToggleSelect,
  onOpen,
  onFocus,
}: Omit<RowProps, 'onAction'>) {
  const railColor =
    tr.status === 'failed'
      ? 'bg-danger-600'
      : tr.status === 'reversed'
        ? 'bg-warning-600'
        : 'bg-transparent';

  return (
    <div
      data-row-index={rowIndex}
      tabIndex={focused ? 0 : -1}
      onFocus={onFocus}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest('button, [role="checkbox"], input, [data-row-stop]')) return;
        onOpen();
      }}
      className={cn(
        'relative flex items-stretch gap-3 rounded-md border border-border bg-card p-3 cursor-pointer overflow-hidden',
        selected && 'bg-brand-50 dark:bg-brand-950/30 border-brand-600/30',
        focused && 'ring-2 ring-brand-600/40',
      )}
    >
      <span className={cn('absolute left-0 top-0 bottom-0 w-1', railColor)} aria-hidden="true" />
      <div className="pl-2 flex items-start" data-row-stop>
        <Checkbox
          checked={selected}
          onCheckedChange={onToggleSelect}
          aria-label={`Select transfer ${tr.id}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground tabular">
            {formatRelative(tr.createdAt)}
          </div>
          <div className="flex items-center gap-1.5">
            <StatusBadge status={tr.status} domain="transfer" />
            {hasAml && (
              <ShieldAlert className="h-3.5 w-3.5 text-danger-600" aria-label="Has AML flag" />
            )}
          </div>
        </div>
        <div className="mt-1 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-medium truncate">{tr.userName}</div>
            <div className="text-sm text-muted-foreground tabular truncate">{tr.userPhone}</div>
            <div className="mt-1 flex items-center gap-1.5">
              <DestinationBadge destination={tr.destination} />
              <span className="font-mono tabular text-sm text-foreground/80 truncate">
                {tr.recipientIdentifier}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <Money amount={tr.amountUzs} currency="UZS" className="font-medium" />
            <div className="mt-0.5">
              <Money
                amount={tr.amountCny}
                currency="CNY"
                className="text-sm text-muted-foreground"
              />
            </div>
          </div>
        </div>
        {tr.failureCode && (
          <div className="mt-2 border-t pt-2">
            <ErrorCell code={tr.failureCode} />
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================================
// Helpers
// =====================================================================

function Th({
  children,
  className,
  align,
  ...rest
}: React.ThHTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'right' }) {
  return (
    <th
      className={cn(
        // Match canonical TableHead — Title Case, 14px, single muted color.
        'h-9 px-3 align-middle text-sm font-medium text-muted-foreground',
        align === 'right' ? 'text-right' : 'text-left',
        className,
      )}
      {...rest}
    >
      {children}
    </th>
  );
}

function SortHead({
  label,
  sortKey,
  sort,
  onSort,
  align,
}: {
  label: string;
  sortKey: SortKey;
  sort: SortState;
  onSort: (k: SortKey) => void;
  align?: 'left' | 'right';
}) {
  const active = sort.key === sortKey;
  const Icon = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown;
  return (
    <Th align={align}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          // Color stays uniform with non-sortable column headers; active
          // state is conveyed by the arrow icon only.
          'inline-flex items-center gap-1 rounded-sm px-1 py-0.5',
          'text-muted-foreground hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          align === 'right' && 'flex-row-reverse',
        )}
        aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
      >
        <span>{label}</span>
        <Icon className="h-3 w-3" aria-hidden="true" />
      </button>
    </Th>
  );
}

function CopyableId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(id);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        copy();
      }}
      data-row-stop
      className={cn(
        'group inline-flex items-center gap-1 rounded-sm px-1 py-0.5',
        'font-mono tabular text-sm text-foreground/85 hover:bg-accent/40',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        copied && 'bg-success-50 text-success-700 dark:bg-success-700/15 dark:text-success-600',
      )}
      title={copied ? 'Copied' : `Copy ${id}`}
      aria-label={`Copy transfer ID ${id}`}
    >
      {id}
      {copied ? (
        <Check className="h-3 w-3 text-success-600" aria-hidden="true" />
      ) : (
        <Copy
          className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

function ActionMenu({
  transfer,
  onAction,
}: {
  transfer: Transfer;
  onAction: (a: RowAction) => void;
}) {
  const ageMs = NOW.getTime() - transfer.createdAt.getTime();
  const stuck = transfer.status === 'processing' && ageMs > STUCK_THRESHOLD_MS;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t('admin.transfers.column.actions')}
          onClick={(e) => e.stopPropagation()}
          data-row-stop
        >
          <MoreVertical className="h-4 w-4" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]" onCloseAutoFocus={(e) => e.preventDefault()}>
        <DropdownMenuLabel className="font-mono tabular text-xs text-muted-foreground">
          {transfer.id}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {transfer.status === 'completed' && (
          <DropdownMenuItem
            onSelect={() => onAction('reverse')}
            className="text-danger-700 dark:text-danger-600 focus:text-danger-700"
          >
            <RotateCw className="h-4 w-4" />
            {t('admin.transfers.action.reverse')}
          </DropdownMenuItem>
        )}
        {stuck && (
          <DropdownMenuItem
            onSelect={() => onAction('force-fail')}
            className="text-danger-700 dark:text-danger-600 focus:text-danger-700"
          >
            <ShieldAlert className="h-4 w-4" />
            {t('admin.transfers.action.force-fail')}
          </DropdownMenuItem>
        )}
        {transfer.status === 'failed' && (
          <DropdownMenuItem onSelect={() => onAction('resend')}>
            <RotateCw className="h-4 w-4" />
            {t('admin.transfers.action.resend-webhook')}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => onAction('copy')}>
          <Copy className="h-4 w-4" />
          {t('admin.transfers.action.copy-id')}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onAction('audit')}>
          <ExternalLink className="h-4 w-4" />
          {t('admin.transfers.action.open-audit')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// =====================================================================
// Skeletons
// =====================================================================

function SkeletonRow() {
  return (
    <tr className="border-b">
      <td className="pl-3 py-3 align-middle w-9">
        <Skeleton className="h-4 w-4 rounded-sm" />
      </td>
      <td className="px-3 py-3 align-middle">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="px-3 py-3 align-middle">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-3 py-3 align-middle">
        <Skeleton className="h-4 w-32" />
      </td>
      <td className="px-3 py-3 align-middle">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </td>
      <td className="px-3 py-3 align-middle">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-14" />
        </div>
      </td>
      <td className="px-3 py-3 align-middle text-right">
        <Skeleton className="h-4 w-24 ml-auto" />
      </td>
      <td className="px-3 py-3 align-middle text-right">
        <Skeleton className="h-4 w-16 ml-auto" />
      </td>
      <td className="px-3 py-3 align-middle text-right">
        <Skeleton className="h-4 w-16 ml-auto" />
      </td>
      <td className="px-3 py-3 align-middle">
        <Skeleton className="h-5 w-20 rounded-full" />
      </td>
      <td className="px-3 py-3 align-middle">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-3 py-3 align-middle w-9">
        <Skeleton className="h-4 w-4 rounded-sm" />
      </td>
    </tr>
  );
}

function SkeletonMobileCard() {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-5 w-40" />
      <div className="mt-3 flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}
