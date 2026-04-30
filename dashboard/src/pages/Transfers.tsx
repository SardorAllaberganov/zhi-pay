import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, BookmarkPlus, ChevronDown, Inbox, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TransfersFilterBar } from '@/components/transfers/TransfersFilterBar';
import { TransfersTable } from '@/components/transfers/TransfersTable';
import {
  applyFilters,
  countActiveFilters,
  makeEmptyFilters,
  sortTransfers,
} from '@/components/transfers/types';
import type { TransferFilters, SortKey, SortState } from '@/components/transfers/types';
import {
  addSavedFilter,
  getSavedFilters,
  readTransfersState,
  removeSavedFilter,
  subscribeSavedFilters,
  writeTransfersState,
} from '@/components/transfers/filterState';
import type { SavedFilter } from '@/components/transfers/filterState';
import {
  QUICK_FILTERS,
  STATUS_COUNTS,
  TRANSFERS_FULL,
  getAmlFlagsForTransfer,
} from '@/data/mockTransfers';
import { cn, formatMoney } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { Transfer } from '@/types';

const FEED_HEALTHY = true;
const TRANSFERS_BASE = '/operations/transfers';

export function Transfers() {
  const navigate = useNavigate();

  // Hydrate from module cache so detail-page round-trips preserve list state.
  const cached = readTransfersState();

  const [filters, setFilters] = useState<TransferFilters>(cached?.filters ?? makeEmptyFilters());
  const [sort, setSort] = useState<SortState>(cached?.sort ?? { key: 'createdAt', dir: 'desc' });
  const [page, setPage] = useState(cached?.page ?? 0);
  const [pageSize, setPageSize] = useState<number>(cached?.pageSize ?? 50);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(cached?.selectedIds ?? new Set());
  const [focusedIndex, setFocusedIndex] = useState(cached?.focusedIndex ?? -1);
  const [feedHealthy, setFeedHealthy] = useState(FEED_HEALTHY);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);
  const [filterBarH, setFilterBarH] = useState(132);

  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(() => getSavedFilters());
  useEffect(() => subscribeSavedFilters(() => setSavedFilters(getSavedFilters())), []);

  // Saved-filters dropdown control + dialog state.
  const [savedFiltersOpen, setSavedFiltersOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'save' | 'rename' | null>(null);
  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState('');

  // Defer closing the parent dropdown when an action also opens a Dialog
  // or just changes filter state. Radix sets `pointer-events: none` on
  // <body> while a modal DropdownMenu is open; if the nested kebab menu
  // and the parent menu close in the same tick that lock can stay stuck
  // and block subsequent clicks (Clear-all, Saved-filters trigger, etc.).
  // Deferring lets the kebab fully unmount first.
  function deferCloseSavedFiltersDropdown() {
    window.setTimeout(() => setSavedFiltersOpen(false), 0);
  }

  function openSaveDialog() {
    setDialogMode('save');
    setRenameTarget(null);
    setPendingName('');
    deferCloseSavedFiltersDropdown();
  }
  function openRenameDialog(name: string) {
    setDialogMode('rename');
    setRenameTarget(name);
    setPendingName(name);
    deferCloseSavedFiltersDropdown();
  }
  function closeDialog() {
    setDialogMode(null);
    setRenameTarget(null);
    setPendingName('');
  }
  function confirmDialog() {
    const name = pendingName.trim();
    if (!name) return;

    if (dialogMode === 'rename' && renameTarget) {
      const existing = savedFilters.find((s) => s.name === renameTarget);
      if (existing) {
        if (renameTarget !== name) removeSavedFilter(renameTarget);
        addSavedFilter({ name, filters: existing.filters, sort: existing.sort });
      }
    } else {
      addSavedFilter({ name, filters, sort });
    }
    closeDialog();
  }

  function applySavedFilter(saved: SavedFilter) {
    setFilters(saved.filters);
    setSort(saved.sort);
    deferCloseSavedFiltersDropdown();
  }

  // Measure filter bar so the table thead can sticky-stack just below it.
  useLayoutEffect(() => {
    const el = filterBarRef.current;
    if (!el) return;
    const update = () => setFilterBarH(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Persist state to the module cache on every change so detail-page
  // round-trips don't reset filters / sort / page / selection.
  useEffect(() => {
    writeTransfersState({ filters, sort, page, pageSize, selectedIds, focusedIndex });
  }, [filters, sort, page, pageSize, selectedIds, focusedIndex]);

  // ----- Derived data -----
  const hasAmlByTransferId = useMemo(() => {
    const cache = new Map<string, boolean>();
    return (id: string) => {
      const hit = cache.get(id);
      if (hit !== undefined) return hit;
      const has = getAmlFlagsForTransfer(id).length > 0;
      cache.set(id, has);
      return has;
    };
  }, []);

  const filtered = useMemo(
    () => applyFilters(TRANSFERS_FULL, filters, hasAmlByTransferId),
    [filters, hasAmlByTransferId],
  );
  const sorted = useMemo(() => sortTransfers(filtered, sort), [filtered, sort]);
  const paged = useMemo(
    () => sorted.slice(page * pageSize, (page + 1) * pageSize),
    [sorted, page, pageSize],
  );

  // Reset page on filter / sort / pageSize change — but skip the first run
  // so the cached page survives hydration on remount.
  const isFirstResetRef = useRef(true);
  useEffect(() => {
    if (isFirstResetRef.current) {
      isFirstResetRef.current = false;
      return;
    }
    setPage(0);
    setFocusedIndex(-1);
  }, [filters, sort, pageSize]);

  // ----- Selection -----
  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const allOnPage = paged.every((r) => prev.has(r.id));
      const next = new Set(prev);
      if (allOnPage) for (const r of paged) next.delete(r.id);
      else for (const r of paged) next.add(r.id);
      return next;
    });
  }
  function clearSelection() {
    setSelectedIds(new Set());
  }

  // ----- Sort -----
  function onSort(key: SortKey) {
    setSort((prev) => {
      if (prev.key === key) return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      return { key, dir: 'desc' };
    });
  }

  // ----- Quick filters -----
  function applyQuickFilter(
    key: 'failedToday' | 'reversedLast7d' | 'stuckProcessing',
  ) {
    if (key === 'failedToday') {
      setFilters({
        ...makeEmptyFilters(),
        statuses: new Set(['failed']),
        range: 'today',
      });
    } else if (key === 'reversedLast7d') {
      setFilters({
        ...makeEmptyFilters(),
        statuses: new Set(['reversed']),
        range: '7d',
      });
    } else {
      setFilters({
        ...makeEmptyFilters(),
        statuses: new Set(['processing']),
        range: '30d',
      });
    }
  }

  // ----- CSV export -----
  function exportToCsv(rows: Transfer[]) {
    const headers = [
      'transfer_id',
      'created_at',
      'status',
      'failure_code',
      'card_scheme',
      'masked_pan',
      'sender_name',
      'sender_phone',
      'destination',
      'recipient',
      'amount_uzs',
      'amount_cny',
      'fee_uzs',
      'fx_spread_uzs',
      'total_charge_uzs',
      'client_rate',
      'external_tx_id',
    ];
    const lines = [headers.join(',')];
    for (const t of rows) {
      lines.push(
        [
          t.id,
          t.createdAt.toISOString(),
          t.status,
          t.failureCode ?? '',
          t.cardScheme,
          t.cardMaskedPan,
          escapeCsv(t.userName),
          t.userPhone,
          t.destination,
          t.recipientIdentifier,
          formatMoney(t.amountUzs, 'UZS').replace(/[^\d.]/g, ''),
          formatMoney(t.amountCny, 'CNY').replace(/[^\d.]/g, ''),
          formatMoney(t.feeUzs, 'UZS').replace(/[^\d.]/g, ''),
          formatMoney(t.fxSpreadUzs, 'UZS').replace(/[^\d.]/g, ''),
          formatMoney(t.totalChargeUzs, 'UZS').replace(/[^\d.]/g, ''),
          String(t.clientRate),
          t.externalTxId ?? '',
        ].join(','),
      );
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const stamp = new Date().toISOString().slice(0, 10);
    a.download = `transfers-${stamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportFiltered() {
    exportToCsv(sorted);
  }
  function exportSelected() {
    const set = selectedIds;
    exportToCsv(sorted.filter((t) => set.has(t.id)));
  }

  // ----- Row actions -----
  function onRowAction(action: 'copy' | 'audit' | 'reverse' | 'force-fail' | 'resend', id: string) {
    if (action === 'copy') {
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(id);
      return;
    }
    if (action === 'audit') {
      navigate('/audit-log');
      return;
    }
    // reverse / force-fail / resend → open detail page where confirm dialog lives
    navigate(`${TRANSFERS_BASE}/${id}?action=${action}`);
  }

  function onRowOpen(id: string) {
    navigate(`${TRANSFERS_BASE}/${id}`);
  }

  // ----- Keyboard shortcuts -----
  // f → focus search; / → focus search; e → export filtered;
  // j / k → move focused row; Enter → open detail.
  // (g+ shortcuts handled globally by useKeyboardShortcuts.)
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isTypingContext(e.target)) {
        // Within search input, Esc clears focus.
        if (e.key === 'Escape' && (e.target as HTMLElement).tagName === 'INPUT') {
          (e.target as HTMLInputElement).blur();
        }
        return;
      }

      if (e.key === 'g') {
        lastKeyRef.current = 'g';
        window.setTimeout(() => {
          if (lastKeyRef.current === 'g') lastKeyRef.current = null;
        }, 1000);
        return;
      }
      const swallowedAfterG = lastKeyRef.current === 'g';
      lastKeyRef.current = null;
      if (swallowedAfterG) return;

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === '/' || e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      if (e.key === 'e') {
        e.preventDefault();
        exportFiltered();
        return;
      }
      if (e.key === 'j') {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(paged.length - 1, i + 1));
        return;
      }
      if (e.key === 'k') {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(0, i - 1));
        return;
      }
      if (e.key === 'Enter') {
        const row = paged[focusedIndex];
        if (row) {
          e.preventDefault();
          onRowOpen(row.id);
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paged, focusedIndex]);

  const totalCount = sorted.length;
  const activeFilterCount = countActiveFilters(filters);
  const showNoResults = totalCount === 0 && TRANSFERS_FULL.length > 0 && activeFilterCount > 0;
  const showTotalEmpty = TRANSFERS_FULL.length === 0;

  return (
    <div className="space-y-4">
      {/* Page header */}
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('admin.transfers.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 tabular">
            {t('admin.transfers.count', { count: totalCount.toLocaleString('en') })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu open={savedFiltersOpen} onOpenChange={setSavedFiltersOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {t('admin.transfers.saved-filters')}
                {savedFilters.length > 0 && (
                  <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                    {savedFilters.length}
                  </span>
                )}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[280px] p-1">
              {savedFilters.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  {t('admin.transfers.saved-filters.empty')}
                </div>
              ) : (
                <>
                  <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                    {t('admin.transfers.saved-filters')}
                  </DropdownMenuLabel>
                  {savedFilters.map((s) => (
                    <SavedFilterRow
                      key={s.name}
                      saved={s}
                      onApply={() => applySavedFilter(s)}
                      onRename={() => openRenameDialog(s.name)}
                      onDelete={() => removeSavedFilter(s.name)}
                    />
                  ))}
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={activeFilterCount === 0}
                onSelect={(e) => {
                  e.preventDefault();
                  if (activeFilterCount === 0) return;
                  openSaveDialog();
                }}
                className="text-brand-700 dark:text-brand-300 focus:text-brand-700 data-[disabled]:text-muted-foreground"
              >
                <BookmarkPlus className="h-4 w-4" />
                <span className="flex-1">{t('admin.transfers.saved-filters.save')}</span>
                {activeFilterCount === 0 && (
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {t('admin.transfers.saved-filters.save-disabled-hint')}
                  </span>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Error banner */}
      {!feedHealthy && (
        <div
          role="alert"
          className="flex flex-col gap-2 rounded-md border border-warning-600/30 bg-warning-50 p-3 text-sm dark:bg-warning-700/15 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-warning-700 dark:text-warning-600"
              aria-hidden="true"
            />
            <div>
              <div className="font-medium text-warning-700 dark:text-warning-600">
                {t('admin.transfers.error.title')}
              </div>
              <div className="text-muted-foreground">
                {t('admin.transfers.error.body')}
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setFeedHealthy(true)}>
            {t('admin.transfers.error.retry')}
          </Button>
        </div>
      )}

      {/* Filter bar (sticky) */}
      <div ref={filterBarRef}>
        <TransfersFilterBar
          ref={searchInputRef}
          filters={filters}
          setFilters={setFilters}
          statusCounts={STATUS_COUNTS}
          quickCounts={QUICK_FILTERS}
          onApplyQuickFilter={applyQuickFilter}
          onExportCsv={exportFiltered}
        />
      </div>

      {/* Save / Rename saved filter dialog */}
      <Dialog
        open={dialogMode !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'rename'
                ? t('admin.transfers.saved-filters.dialog.rename-title')
                : t('admin.transfers.saved-filters.dialog.save-title')}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'rename'
                ? t('admin.transfers.saved-filters.dialog.rename-description')
                : t('admin.transfers.saved-filters.dialog.save-description')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="saved-filter-name">
              {t('admin.transfers.saved-filters.dialog.name-label')}
            </Label>
            <Input
              id="saved-filter-name"
              autoFocus
              value={pendingName}
              onChange={(e) => setPendingName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && pendingName.trim()) {
                  e.preventDefault();
                  confirmDialog();
                }
              }}
              placeholder={t('admin.transfers.saved-filters.dialog.name-placeholder')}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog}>
              {t('admin.transfers.saved-filters.dialog.cancel')}
            </Button>
            <Button onClick={confirmDialog} disabled={!pendingName.trim()}>
              {dialogMode === 'rename'
                ? t('admin.transfers.saved-filters.dialog.rename')
                : t('admin.transfers.saved-filters.dialog.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Body */}
      {showTotalEmpty ? (
        <EmptyTotal />
      ) : showNoResults ? (
        <NoResults onClear={() => setFilters(makeEmptyFilters())} />
      ) : (
        <TransfersTable
          rows={paged}
          totalCount={totalCount}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onClearSelection={clearSelection}
          onBulkExport={exportSelected}
          onBulkMarkReview={() => {
            // Mock: in a real backend this would write to a review flags table.
            clearSelection();
          }}
          sort={sort}
          onSort={onSort}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          focusedIndex={focusedIndex}
          onFocusedIndexChange={setFocusedIndex}
          amlByTransferId={hasAmlByTransferId}
          onRowOpen={onRowOpen}
          onRowAction={onRowAction}
          stickyTopPx={filterBarH}
        />
      )}
    </div>
  );
}

// =====================================================================
// Empty / no-results blocks
// =====================================================================

function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <Card>
      <CardContent
        className={cn('flex flex-col items-center justify-center py-16 text-center')}
      >
        <Inbox className="h-8 w-8 text-muted-foreground/60 mb-3" aria-hidden="true" />
        <div className="text-sm font-medium text-foreground">
          {t('admin.transfers.empty.no-results.title')}
        </div>
        <div className="text-sm text-muted-foreground mt-1 max-w-md">
          {t('admin.transfers.empty.no-results.body')}
        </div>
        <Button variant="outline" size="sm" className="mt-4" onClick={onClear}>
          {t('admin.transfers.empty.no-results.clear')}
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptyTotal() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <Inbox className="h-10 w-10 text-muted-foreground/60 mb-4" aria-hidden="true" />
        <div className="text-sm font-medium text-foreground">
          {t('admin.transfers.empty.total.title')}
        </div>
        <div className="text-sm text-muted-foreground mt-1 max-w-md">
          {t('admin.transfers.empty.total.body')}
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================================
// Saved filter row — apply on body click, kebab menu for rename / delete
// =====================================================================

interface SavedFilterRowProps {
  saved: SavedFilter;
  onApply: () => void;
  onRename: () => void;
  onDelete: () => void;
}

function SavedFilterRow({ saved, onApply, onRename, onDelete }: SavedFilterRowProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-1 rounded-sm pr-1',
        'hover:bg-accent focus-within:bg-accent transition-colors',
      )}
    >
      <button
        type="button"
        onClick={onApply}
        className={cn(
          'flex-1 min-w-0 px-2 py-1.5 text-left text-sm rounded-sm truncate',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
        title={saved.name}
      >
        {saved.name}
      </button>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className={cn(
              'inline-flex h-6 w-6 items-center justify-center rounded-sm shrink-0',
              'text-muted-foreground hover:bg-accent-foreground/10',
              'opacity-60 group-hover:opacity-100 group-focus-within:opacity-100',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
            aria-label={t('admin.transfers.saved-filters.actions.label')}
          >
            <MoreVertical className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={4} onCloseAutoFocus={(e) => e.preventDefault()}>
          <DropdownMenuItem onSelect={onApply}>
            <BookmarkPlus className="h-3.5 w-3.5" />
            {t('admin.transfers.saved-filters.actions.apply')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onRename}>
            <Pencil className="h-3.5 w-3.5" />
            {t('admin.transfers.saved-filters.actions.rename')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={onDelete}
            className="text-danger-700 dark:text-danger-600 focus:text-danger-700"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t('admin.transfers.saved-filters.actions.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// =====================================================================
// Helpers
// =====================================================================

const TYPING_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];
function isTypingContext(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (TYPING_TAGS.includes(target.tagName)) return true;
  if (target.isContentEditable) return true;
  return false;
}

function escapeCsv(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
