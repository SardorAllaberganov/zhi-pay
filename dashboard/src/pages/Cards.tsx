import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardsFilterBar } from '@/components/cards/CardsFilterBar';
import { CardsTable } from '@/components/cards/CardsTable';
import { CardsMobileCardStack } from '@/components/cards/CardsMobileCardStack';
import {
  DEFAULT_CARDS_FILTERS,
  DEFAULT_CARDS_SORT,
  applyCardsFilters,
  applyCardsSort,
  type CardsFilters,
  type CardsSort,
  type CardsSortKey,
} from '@/components/cards/types';
import {
  readCardsState,
  writeCardsState,
} from '@/components/cards/filterState';
import {
  getCardCountsByStatus,
  getDistinctBanks,
  getDistinctCountries,
  listCards,
  recordTokenCopy,
  type CardEntry,
} from '@/data/mockCards';
import { CURRENT_USER_ADMIN, getUserById, listUsers, type UserListRow } from '@/data/mockUsers';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

const PAGE_SIZE = 50;

export function Cards() {
  const navigate = useNavigate();
  const cached = readCardsState();

  const [filters, setFilters] = useState<CardsFilters>(cached?.filters ?? { ...DEFAULT_CARDS_FILTERS });
  const [searchInput, setSearchInput] = useState<string>(cached?.filters.search ?? '');
  const [sort, setSort] = useState<CardsSort>(cached?.sort ?? DEFAULT_CARDS_SORT);
  const [page, setPage] = useState<number>(cached?.page ?? 1);
  const [focusedIndex, setFocusedIndex] = useState<number>(cached?.focusedIndex ?? 0);
  const [loading, setLoading] = useState<boolean>(true);

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
      setFilters((prev) => (prev.search === searchInput ? prev : { ...prev, search: searchInput }));
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

  const allCards = useMemo(() => listCards(), []);
  const banks = useMemo(() => getDistinctBanks(), []);
  const countries = useMemo(() => getDistinctCountries(), []);
  const counts = useMemo(() => getCardCountsByStatus(), []);

  const filteredSorted = useMemo(
    () => applyCardsSort(applyCardsFilters(allCards, filters, ownerLookupShallow), sort),
    [allCards, filters, sort, ownerLookupShallow],
  );

  const totalCount = allCards.length;
  const filteredCount = filteredSorted.length;
  const pageCount = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filteredSorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset to page 1 when filters/sort change.
  useEffect(() => {
    setPage(1);
    setFocusedIndex(0);
  }, [filters, sort]);

  // Persist state.
  useEffect(() => {
    writeCardsState({
      filters,
      sort,
      page: safePage,
      pageSize: PAGE_SIZE,
      focusedIndex,
      visibleIds: pageRows.map((r) => r.id),
    });
  }, [filters, sort, safePage, focusedIndex, pageRows]);

  function toggleSort(key: CardsSortKey) {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: 'desc' };
      return { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' };
    });
  }

  function exportCsv() {
    const header = [
      'card_id',
      'user_id',
      'scheme',
      'masked_pan',
      'bank',
      'holder_name',
      'issuer_country',
      'expiry',
      'status',
      'is_default',
      'token',
      'last_used_at',
      'created_at',
    ];
    const lines = [header.join(',')];
    filteredSorted.forEach((c) => {
      lines.push(
        [
          c.id,
          c.userId,
          c.scheme,
          c.maskedPan,
          quoteCsv(c.bank),
          quoteCsv(c.holderName),
          c.issuerCountry,
          `${String(c.expiryMonth).padStart(2, '0')}/${c.expiryYear}`,
          c.status,
          String(c.isDefault),
          c.token,
          c.lastUsedAt ? c.lastUsedAt.toISOString() : '',
          c.createdAt.toISOString(),
        ].join(','),
      );
    });
    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zhipay-cards-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(t('admin.cards.toast.exported'), {
      description: t('admin.cards.toast.exported-body', { count: filteredCount }),
    });
  }

  function handleRowAction(
    action: 'open-owner' | 'open-transfers' | 'copy-token',
    card: CardEntry,
  ) {
    if (action === 'open-owner') {
      navigate(`/customers/users/${card.userId}`);
      return;
    }
    if (action === 'open-transfers') {
      navigate(`/operations/transfers?context=card&card_id=${card.id}`);
      return;
    }
    // copy-token
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(card.token);
    recordTokenCopy(card.id, CURRENT_USER_ADMIN);
    toast.success(t('admin.cards.toast.token-copied'));
  }

  // List-page hotkeys: j/k focus row, Enter open, / focus search.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) {
        if (e.key === 'Escape' && tag === 'input') (target as HTMLInputElement).blur();
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
          navigate(`/customers/cards/${pageRows[focusedIndex].id}`);
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
          <h1 className="text-2xl font-semibold tracking-tight">{t('admin.cards.title')}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground tabular">
            {t('admin.cards.subtitle.counts', {
              active: counts.active.toLocaleString('en'),
              frozen: counts.frozen.toLocaleString('en'),
              expired: counts.expired.toLocaleString('en'),
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
            {t('admin.cards.action.export-csv')}
          </Button>
        </div>
      </header>

      {/* Filters */}
      <CardsFilterBar
        filters={{ ...filters, search: searchInput }}
        setFilters={(next) => {
          setFilters(next);
          setSearchInput(next.search);
        }}
        onSearchInput={setSearchInput}
        banks={banks}
        countries={countries}
        loading={loading}
        searchInputRef={searchInputRef}
      />

      {/* Result count */}
      {!loading && (
        <div className="text-sm text-muted-foreground">
          {t('admin.cards.result-count', { shown: pageRows.length, total: filteredCount })}
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden lg:block">
        <CardsTable
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
        <CardsMobileCardStack
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
            {t('admin.cards.pagination.page', { page: safePage, total: pageCount })}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
            >
              {t('admin.cards.pagination.prev')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={safePage === pageCount}
            >
              {t('admin.cards.pagination.next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function quoteCsv(s: string): string {
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
