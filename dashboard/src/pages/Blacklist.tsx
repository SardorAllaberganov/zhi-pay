import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BlacklistTabs } from '@/components/blacklist/BlacklistTabs';
import { BlacklistFilterBar } from '@/components/blacklist/BlacklistFilterBar';
import { BlacklistTable } from '@/components/blacklist/BlacklistTable';
import { BlacklistMobileCardStack } from '@/components/blacklist/BlacklistMobileCardStack';
import { RemoveEntryDialog } from '@/components/blacklist/modals/RemoveEntryDialog';
import {
  applyFilters,
  applySort,
  type BlacklistFilterState,
  type BlacklistSort,
} from '@/components/blacklist/types';
import {
  getTabState,
  setTabFilter,
  setTabFocusedIndex,
  setTabSort,
  setTabVisibleIds,
} from '@/components/blacklist/filterState';
import {
  BLACKLIST_ADMIN_POOL,
  getBlacklistCounts,
  listBlacklist,
  removeBlacklistEntry,
  type BlacklistType,
} from '@/data/mockBlacklist';
import { t } from '@/lib/i18n';

const TYPE_ORDER: BlacklistType[] = ['phone', 'pinfl', 'device_id', 'ip', 'card_token'];

function parseTabFromUrl(raw: string | null): BlacklistType {
  if (raw === 'pinfl' || raw === 'device_id' || raw === 'ip' || raw === 'card_token') return raw;
  return 'phone';
}

const SEARCH_PLACEHOLDER_KEY: Record<BlacklistType, string> = {
  phone: 'admin.blacklist.filter.search-placeholder.phone',
  pinfl: 'admin.blacklist.filter.search-placeholder.pinfl',
  device_id: 'admin.blacklist.filter.search-placeholder.device',
  ip: 'admin.blacklist.filter.search-placeholder.ip',
  card_token: 'admin.blacklist.filter.search-placeholder.card-token',
};

const ACTOR = BLACKLIST_ADMIN_POOL[0];

export function Blacklist() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const tab = parseTabFromUrl(searchParams.get('type'));

  const cached = getTabState(tab);
  const [filter, setFilter] = useState<BlacklistFilterState>(cached.filter);
  const [sort, setSort] = useState<BlacklistSort>(cached.sort);
  const [focusedIndex, setFocusedIndex] = useState<number>(cached.focusedIndex);

  const [removeId, setRemoveId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initial-mount skeleton (and on tab switch).
  useEffect(() => {
    setLoading(true);
    const tid = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(tid);
  }, [tab]);

  // Re-derive when an admin action elsewhere mutates the live store.
  useEffect(() => {
    function bump() {
      setVersion((v) => v + 1);
    }
    window.addEventListener('focus', bump);
    window.addEventListener('popstate', bump);
    return () => {
      window.removeEventListener('focus', bump);
      window.removeEventListener('popstate', bump);
    };
  }, []);

  // Pull cached state on tab switch — keeps each tab's filter/sort/focus.
  useEffect(() => {
    const c = getTabState(tab);
    setFilter(c.filter);
    setSort(c.sort);
    setFocusedIndex(c.focusedIndex);
  }, [tab]);

  // Persist back to cache on every change.
  useEffect(() => setTabFilter(tab, filter), [tab, filter]);
  useEffect(() => setTabSort(tab, sort), [tab, sort]);
  useEffect(() => setTabFocusedIndex(tab, focusedIndex), [tab, focusedIndex]);

  const counts = useMemo(
    () => getBlacklistCounts(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );

  const visible = useMemo(() => {
    const all = listBlacklist().filter((e) => e.type === tab);
    const filtered = applyFilters(all, filter);
    return applySort(filtered, sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, filter, sort, version]);

  // Cache visible-id list for j/k pager.
  useEffect(() => {
    setTabVisibleIds(tab, visible.map((r) => r.id));
  }, [tab, visible]);

  function setActiveTab(next: string) {
    const nextParams = new URLSearchParams(searchParams);
    if (next === 'phone') nextParams.delete('type');
    else nextParams.set('type', next);
    setSearchParams(nextParams, { replace: true });
  }

  // Page-scoped hotkeys.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement | null;
      const tag = tgt?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tgt?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'n') {
        e.preventDefault();
        navigate('/compliance/blacklist/new');
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      if (e.key === 'j') {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(visible.length - 1, i < 0 ? 0 : i + 1));
        return;
      }
      if (e.key === 'k') {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(0, i - 1));
        return;
      }
      if (e.key === 'Enter') {
        const idx = focusedIndex;
        if (idx >= 0 && idx < visible.length) {
          e.preventDefault();
          navigate(`/compliance/blacklist/${visible[idx].id}`);
        }
      }
    },
    [focusedIndex, visible, navigate],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  function openDetail(id: string) {
    navigate(`/compliance/blacklist/${id}`);
  }

  function confirmRemove(reason: string) {
    if (!removeId) return;
    const removed = removeBlacklistEntry({ entryId: removeId, reason, actor: ACTOR });
    setRemoveId(null);
    if (removed) {
      setVersion((v) => v + 1);
      toast.success(t('admin.blacklist.toast.removed.title'));
    } else {
      toast.error(t('admin.blacklist.toast.removed.error'));
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('admin.blacklist.title')}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t('admin.blacklist.subtitle')}
          </p>
        </div>
        <Button onClick={() => navigate('/compliance/blacklist/new')}>
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          {t('admin.blacklist.action.add')}
        </Button>
      </header>

      <Tabs value={tab} onValueChange={setActiveTab} className="space-y-4">
        <BlacklistTabs counts={counts} loading={loading} />

        {TYPE_ORDER.map((type) => (
          <TabsContent key={type} value={type} className="space-y-4">
            <BlacklistFilterBar
              filter={filter}
              setFilter={setFilter}
              loading={loading}
              searchPlaceholder={t(SEARCH_PLACEHOLDER_KEY[type])}
              searchInputRef={searchInputRef}
            />
            <div className="hidden lg:block">
              <BlacklistTable
                rows={visible}
                loading={loading}
                type={type}
                sort={sort}
                setSort={setSort}
                focusedIndex={focusedIndex}
                onRowClick={openDetail}
                onRemove={setRemoveId}
              />
            </div>
            <div className="lg:hidden">
              <BlacklistMobileCardStack
                rows={visible}
                loading={loading}
                onRowClick={openDetail}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <RemoveEntryDialog
        open={removeId !== null}
        onOpenChange={(open) => !open && setRemoveId(null)}
        onConfirm={confirmRemove}
      />
    </div>
  );
}
