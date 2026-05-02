import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UsersFilterBar } from '@/components/users/UsersFilterBar';
import { UsersTable } from '@/components/users/UsersTable';
import { UsersMobileCardStack } from '@/components/users/UsersMobileCardStack';
import {
  DEFAULT_USERS_FILTERS,
  DEFAULT_USERS_SORT,
  applyUsersFilters,
  applyUsersSort,
  type UsersFilters,
  type UsersSort,
  type UsersSortKey,
} from '@/components/users/types';
import { readUsersState, writeUsersState } from '@/components/users/filterState';
import {
  listUsers,
  type UserListRow,
} from '@/data/mockUsers';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

const PAGE_SIZE = 25;

export function Users() {
  const navigate = useNavigate();
  const cached = readUsersState();

  const [filters, setFilters] = useState<UsersFilters>(cached?.filters ?? { ...DEFAULT_USERS_FILTERS });
  const [searchInput, setSearchInput] = useState<string>(cached?.filters.search ?? '');
  const [sort, setSort] = useState<UsersSort>(cached?.sort ?? DEFAULT_USERS_SORT);
  const [page, setPage] = useState<number>(cached?.page ?? 1);
  const [focusedIndex, setFocusedIndex] = useState<number>(cached?.focusedIndex ?? 0);
  const [loading, setLoading] = useState<boolean>(true);

  // Initial mount mock load
  useEffect(() => {
    const tid = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(tid);
  }, []);

  // Debounced search input → filter
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

  // Sorted + filtered + paged
  const all = useMemo(() => listUsers(), []);

  const filteredSorted = useMemo(
    () => applyUsersSort(applyUsersFilters(all, filters), sort),
    [all, filters, sort],
  );

  const totalCount = all.length;
  const filteredCount = filteredSorted.length;
  const pageCount = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filteredSorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset to page 1 when filters/sort change
  useEffect(() => {
    setPage(1);
    setFocusedIndex(0);
  }, [filters, sort]);

  // Persist state on changes
  useEffect(() => {
    writeUsersState({
      filters,
      sort,
      page: safePage,
      pageSize: PAGE_SIZE,
      focusedIndex,
      visibleIds: pageRows.map((r) => r.id),
    });
  }, [filters, sort, safePage, focusedIndex, pageRows]);

  function toggleSort(key: UsersSortKey) {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: 'desc' };
      return { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' };
    });
  }

  function exportCsv() {
    const header = [
      'id',
      'name',
      'phone',
      'pinfl',
      'tier',
      'status',
      'kyc_status',
      'preferred_language',
      'has_open_aml_flag',
      'linked_cards_count',
      'lifetime_volume_uzs',
      'lifetime_transfer_count',
      'last_login_at',
      'created_at',
    ];
    const lines = [header.join(',')];
    filteredSorted.forEach((u) => {
      lines.push(
        [
          u.id,
          quoteCsv(u.name),
          quoteCsv(u.phone),
          u.pinfl ?? '',
          u.tier,
          u.status,
          u.kycStatus,
          u.preferredLanguage,
          String(u.hasOpenAmlFlag),
          String(u.linkedCardsCount),
          (Number(u.lifetimeVolumeUzsTiyins) / 100).toFixed(2),
          String(u.lifetimeTransferCount),
          u.lastLoginAt ? u.lastLoginAt.toISOString() : '',
          u.createdAt.toISOString(),
        ].join(','),
      );
    });
    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zhipay-users-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(t('admin.users.toast.exported'), {
      description: t('admin.users.toast.exported-body', { count: filteredCount }),
    });
  }

  function handleRowAction(action: 'block' | 'unblock' | 'open-aml' | 'open-audit', user: UserListRow) {
    if (action === 'open-aml') {
      navigate(`/customers/users/${user.id}?tab=aml`);
      return;
    }
    if (action === 'open-audit') {
      navigate(`/customers/users/${user.id}?tab=audit`);
      return;
    }
    // Block / Unblock — funnel the admin into the detail page where the modal lives
    navigate(`/customers/users/${user.id}?action=${action}`);
  }

  // List-page hotkeys: j/k focus row, Enter open
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // Touch-friendly viewports skip these
      if (window.matchMedia('(max-width: 1023px)').matches) return;
      if (e.key === 'j') {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(pageRows.length - 1, i + 1));
      } else if (e.key === 'k') {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(0, i - 1));
      } else if (e.key === 'Enter') {
        if (pageRows[focusedIndex]) {
          e.preventDefault();
          navigate(`/customers/users/${pageRows[focusedIndex].id}`);
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
          <h1 className="text-2xl font-semibold tracking-tight">{t('admin.users.title')}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t('admin.users.subtitle', { count: totalCount })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/compliance/blacklist/new?type=phone')}
            className="flex-1 md:flex-none"
          >
            <ShieldOff className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {t('admin.users.action.add-blacklist')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportCsv}
            disabled={filteredCount === 0}
            className="flex-1 md:flex-none"
          >
            <Download className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {t('admin.users.action.export-csv')}
          </Button>
        </div>
      </header>

      {/* Filters */}
      <UsersFilterBar
        filters={{ ...filters, search: searchInput }}
        setFilters={(next) => {
          setFilters(next);
          setSearchInput(next.search);
        }}
        onSearchInput={setSearchInput}
        loading={loading}
      />

      {/* Result count */}
      {!loading && (
        <div className="text-sm text-muted-foreground">
          {t('admin.users.result-count', { shown: pageRows.length, total: filteredCount })}
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden lg:block">
        <UsersTable
          rows={pageRows}
          totalCount={totalCount}
          loading={loading}
          focusedIndex={focusedIndex}
          onFocusRow={setFocusedIndex}
          sort={sort}
          onSort={toggleSort}
          onRowAction={handleRowAction}
        />
      </div>

      {/* Mobile / tablet card stack */}
      <div className="lg:hidden">
        <UsersMobileCardStack rows={pageRows} totalCount={totalCount} loading={loading} />
      </div>

      {/* Pagination */}
      {!loading && filteredCount > PAGE_SIZE && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
          <span className="text-sm text-muted-foreground">
            {t('admin.users.pagination.page', { page: safePage, total: pageCount })}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
            >
              {t('admin.users.pagination.prev')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={safePage === pageCount}
            >
              {t('admin.users.pagination.next')}
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
