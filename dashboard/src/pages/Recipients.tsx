import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecipientsFilterBar } from '@/components/recipients/RecipientsFilterBar';
import { RecipientsTable } from '@/components/recipients/RecipientsTable';
import { RecipientsMobileCardStack } from '@/components/recipients/RecipientsMobileCardStack';
import { HardDeleteRecipientDialog } from '@/components/recipients/modals/HardDeleteRecipientDialog';
import {
  DEFAULT_RECIPIENTS_FILTERS,
  DEFAULT_RECIPIENTS_SORT,
  applyRecipientsFilters,
  applyRecipientsSort,
  type RecipientsFilters,
  type RecipientsSort,
  type RecipientsSortKey,
} from '@/components/recipients/types';
import {
  readRecipientsState,
  writeRecipientsState,
} from '@/components/recipients/filterState';
import {
  getRecipientCounts,
  hardDeleteRecipient as recipientsHardDelete,
  listRecipients,
  type RecipientEntry,
} from '@/data/mockRecipients';
import {
  CURRENT_USER_ADMIN,
  getUserById,
  hardDeleteRecipient as usersHardDelete,
  listUsers,
  type UserListRow,
} from '@/data/mockUsers';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

const PAGE_SIZE = 50;

export function Recipients() {
  const navigate = useNavigate();
  const cached = readRecipientsState();

  const [filters, setFilters] = useState<RecipientsFilters>(
    cached?.filters ?? { ...DEFAULT_RECIPIENTS_FILTERS },
  );
  const [searchInput, setSearchInput] = useState<string>(
    cached?.filters.search ?? '',
  );
  const [sort, setSort] = useState<RecipientsSort>(
    cached?.sort ?? DEFAULT_RECIPIENTS_SORT,
  );
  const [page, setPage] = useState<number>(cached?.page ?? 1);
  const [focusedIndex, setFocusedIndex] = useState<number>(
    cached?.focusedIndex ?? 0,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [target, setTarget] = useState<RecipientEntry | null>(null);
  const [version, setVersion] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initial-mount mock-load skeleton.
  useEffect(() => {
    const tid = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(tid);
  }, []);

  // Debounced search.
  const searchDebounceRef = useRef<number | null>(null);
  useEffect(() => {
    if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = window.setTimeout(() => {
      setFilters((prev) =>
        prev.search === searchInput ? prev : { ...prev, search: searchInput },
      );
    }, 300);
    return () => {
      if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
    };
  }, [searchInput]);

  // Owner lookup (memoized so repeated table renders don't rebuild).
  const userIndex = useMemo(() => {
    const map = new Map<string, UserListRow>();
    for (const u of listUsers()) map.set(u.id, u);
    return map;
  }, []);
  const ownerLookup = useCallback(
    (userId: string) => userIndex.get(userId) ?? getUserById(userId),
    [userIndex],
  );
  const ownerLookupShallow = useCallback(
    (userId: string) => {
      const u = userIndex.get(userId);
      if (!u) return undefined;
      return { phone: u.phone, name: u.name };
    },
    [userIndex],
  );

  // version is bumped after a hard-delete so listRecipients re-resolves.
  const allRecipients = useMemo(
    () => listRecipients(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );
  const counts = useMemo(
    () => getRecipientCounts(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );

  const filteredSorted = useMemo(
    () =>
      applyRecipientsSort(
        applyRecipientsFilters(allRecipients, filters, ownerLookupShallow),
        sort,
      ),
    [allRecipients, filters, sort, ownerLookupShallow],
  );

  const totalCount = allRecipients.length;
  const filteredCount = filteredSorted.length;
  const pageCount = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filteredSorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  // Reset to page 1 when filters/sort change.
  useEffect(() => {
    setPage(1);
    setFocusedIndex(0);
  }, [filters, sort]);

  // Persist state.
  useEffect(() => {
    writeRecipientsState({
      filters,
      sort,
      page: safePage,
      pageSize: PAGE_SIZE,
      focusedIndex,
      visibleIds: pageRows.map((r) => r.id),
    });
  }, [filters, sort, safePage, focusedIndex, pageRows]);

  function toggleSort(key: RecipientsSortKey) {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: 'desc' };
      return { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' };
    });
  }

  function exportCsv() {
    const header = [
      'recipient_id',
      'user_id',
      'destination',
      'identifier',
      'display_name',
      'nickname',
      'is_favorite',
      'transfer_count',
      'total_volume_uzs_tiyins',
      'last_used_at',
      'created_at',
    ];
    const lines = [header.join(',')];
    filteredSorted.forEach((r) => {
      lines.push(
        [
          r.id,
          r.userId,
          r.destination,
          quoteCsv(r.identifier),
          quoteCsv(r.displayName),
          quoteCsv(r.nickname ?? ''),
          String(r.isFavorite),
          String(r.transferCount),
          r.totalVolumeUzsTiyins.toString(),
          r.lastUsedAt.toISOString(),
          r.createdAt.toISOString(),
        ].join(','),
      );
    });
    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zhipay-recipients-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(t('admin.recipients.toast.exported'), {
      description: t('admin.recipients.toast.exported-body', {
        count: filteredCount,
      }),
    });
  }

  function handleRowAction(
    action: 'open-owner' | 'open-transfers' | 'delete',
    r: RecipientEntry,
  ) {
    if (action === 'open-owner') {
      navigate(`/customers/users/${r.userId}`);
      return;
    }
    if (action === 'open-transfers') {
      navigate(
        `/operations/transfers?context=recipient&recipient_id=${r.id}`,
      );
      return;
    }
    // delete
    setTarget(r);
  }

  function handleDeleteSubmit(reason: string) {
    if (!target) return;
    // The user-facing wrapper writes to BOTH the recipient-audit and the
    // user-audit log, so the user-detail Audit tab still surfaces the
    // deletion. The wrapper itself delegates to mockRecipients.
    const updated = usersHardDelete(
      target.userId,
      target.id,
      reason,
      CURRENT_USER_ADMIN,
    );
    if (updated) {
      toast.success(t('admin.recipients.toast.deleted'));
      setVersion((v) => v + 1);
    } else {
      // Fallback path — delete directly via mockRecipients so the row at
      // least leaves the live list. This shouldn't fire in practice.
      recipientsHardDelete(target.id, reason, CURRENT_USER_ADMIN);
      toast.success(t('admin.recipients.toast.deleted'));
      setVersion((v) => v + 1);
    }
    setTarget(null);
  }

  // List-page hotkeys: j/k focus row, Enter open, / focus search.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement | null;
      const tag = tgt?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tgt?.isContentEditable) {
        if (e.key === 'Escape' && tag === 'input') (tgt as HTMLInputElement).blur();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (window.matchMedia('(max-width: 1023px)').matches) return;
      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      if (e.key === 'j') {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(pageRows.length - 1, i + 1));
      } else if (e.key === 'k') {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(0, i - 1));
      } else if (e.key === 'Enter') {
        if (pageRows[focusedIndex]) {
          e.preventDefault();
          navigate(`/customers/recipients/${pageRows[focusedIndex].id}`);
        }
      }
    },
    [pageRows, focusedIndex, navigate],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('admin.recipients.title')}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground tabular">
            {t('admin.recipients.subtitle.counts', {
              total: counts.total.toLocaleString('en'),
              owners: counts.distinctOwners.toLocaleString('en'),
            })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCsv}
            disabled={filteredCount === 0}
            className="flex-1 md:flex-none"
          >
            <Download className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {t('admin.recipients.action.export-csv')}
          </Button>
        </div>
      </header>

      {/* Filters */}
      <RecipientsFilterBar
        filters={{ ...filters, search: searchInput }}
        setFilters={(next) => {
          setFilters(next);
          setSearchInput(next.search);
        }}
        onSearchInput={setSearchInput}
        loading={loading}
        searchInputRef={searchInputRef}
      />

      {/* Result count */}
      {!loading && (
        <div className="text-sm text-muted-foreground">
          {t('admin.recipients.result-count', {
            shown: pageRows.length,
            total: filteredCount,
          })}
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden lg:block">
        <RecipientsTable
          rows={pageRows}
          totalCount={totalCount}
          loading={loading}
          focusedIndex={focusedIndex}
          onFocusRow={setFocusedIndex}
          sort={sort}
          onSort={toggleSort}
          ownerLookup={ownerLookup}
          onRowAction={handleRowAction}
        />
      </div>

      {/* Mobile / tablet card stack */}
      <div className="lg:hidden">
        <RecipientsMobileCardStack
          rows={pageRows}
          totalCount={totalCount}
          loading={loading}
          ownerLookup={ownerLookup}
        />
      </div>

      {/* Pagination */}
      {!loading && filteredCount > PAGE_SIZE && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
          <span className="text-sm text-muted-foreground">
            {t('admin.recipients.pagination.page', {
              page: safePage,
              total: pageCount,
            })}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
            >
              {t('admin.recipients.pagination.prev')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={safePage === pageCount}
            >
              {t('admin.recipients.pagination.next')}
            </Button>
          </div>
        </div>
      )}

      {/* Hard-delete dialog */}
      <HardDeleteRecipientDialog
        open={target !== null}
        onOpenChange={(o) => {
          if (!o) setTarget(null);
        }}
        recipient={target}
        onSubmit={handleDeleteSubmit}
      />
    </div>
  );
}

function quoteCsv(s: string): string {
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
