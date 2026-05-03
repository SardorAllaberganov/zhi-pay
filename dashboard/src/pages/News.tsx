import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import {
  type News,
  countByStatus,
  deleteNews,
  listNews,
  publishNews,
  unpublishNews,
} from '@/data/mockNews';
import { NewsFilterBar } from '@/components/news/NewsFilterBar';
import { NewsTable } from '@/components/news/NewsTable';
import { NewsMobileCardStack } from '@/components/news/NewsMobileCardStack';
import { SortDropdown } from '@/components/news/SortDropdown';
import { DeleteNewsDialog } from '@/components/news/DeleteNewsDialog';
import { PublishNowDialog } from '@/components/news/PublishNowDialog';
import { UnpublishDialog } from '@/components/news/UnpublishDialog';
import { EmptyState } from '@/components/news/EmptyState';
import {
  EMPTY_FILTERS,
  DEFAULT_SORT,
  applyNewsFilters,
  applyNewsSort,
  countActiveFilters,
  type NewsFilters,
  type NewsSort,
} from '@/components/news/types';
import {
  getFilterState,
  setFilters as cacheFilters,
  setSort as cacheSort,
  setFocusedId as cacheFocused,
} from '@/components/news/filterState';

export function News() {
  const navigate = useNavigate();

  const initial = useRef(getFilterState()).current;
  const [filters, setFilters] = useState<NewsFilters>(initial.filters);
  const [sort, setSort] = useState<NewsSort>(initial.sort);
  const [focusedId, setFocusedIdState] = useState<string | null>(initial.focusedId);

  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<News | null>(null);
  const [publishTarget, setPublishTarget] = useState<News | null>(null);
  const [unpublishTarget, setUnpublishTarget] = useState<News | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const firstChipRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { cacheFilters(filters); }, [filters]);
  useEffect(() => { cacheSort(sort); }, [sort]);
  useEffect(() => { cacheFocused(focusedId); }, [focusedId]);

  // 350ms initial-mount skeleton
  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(id);
  }, []);

  // Derive list
  const all = useMemo(() => listNews(), [version]);
  const counts = useMemo(() => countByStatus(), [version]);
  const filtered = useMemo(() => applyNewsFilters(all, filters), [all, filters]);
  const sorted = useMemo(() => applyNewsSort(filtered, sort), [filtered, sort]);

  // Page-scoped hotkeys
  const sortedRef = useRef<News[]>(sorted);
  useEffect(() => {
    sortedRef.current = sorted;
  }, [sorted]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      const inField =
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        (e.target as HTMLElement | null)?.isContentEditable;
      if (inField || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }
      if (e.key === 'f') {
        e.preventDefault();
        firstChipRef.current?.focus();
        return;
      }
      if (e.key === 'n') {
        e.preventDefault();
        navigate('/content/news/new');
        return;
      }
      const list = sortedRef.current;
      if (list.length === 0) return;
      const currentIdx = focusedId ? list.findIndex((n) => n.id === focusedId) : -1;
      if (e.key === 'j') {
        e.preventDefault();
        const next = list[Math.min(list.length - 1, currentIdx + 1)] ?? list[0];
        setFocusedIdState(next.id);
      } else if (e.key === 'k') {
        e.preventDefault();
        const prev = list[Math.max(0, currentIdx - 1)] ?? list[0];
        setFocusedIdState(prev.id);
      } else if (e.key === 'Enter') {
        if (currentIdx >= 0) {
          e.preventDefault();
          navigate(`/content/news/${list[currentIdx].id}`);
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focusedId, navigate]);

  // Handlers
  function open(id: string) {
    navigate(`/content/news/${id}`);
  }
  function openAudit(id: string) {
    navigate(`/compliance/audit-log?entity=news&id=${id}`);
  }
  function handleDelete(reason: string) {
    if (!deleteTarget) return;
    try {
      deleteNews(deleteTarget.id, reason);
      toast.success(t('admin.news.toast.deleted'));
      setDeleteTarget(null);
      setVersion((v) => v + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  }
  function handlePublishNow() {
    if (!publishTarget) return;
    try {
      publishNews(publishTarget.id);
      toast.success(t('admin.news.toast.published'));
      setPublishTarget(null);
      setVersion((v) => v + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish');
    }
  }
  function handleUnpublish(reason: string) {
    if (!unpublishTarget) return;
    try {
      unpublishNews(unpublishTarget.id, reason);
      toast.success(t('admin.news.toast.unpublished'));
      setUnpublishTarget(null);
      setVersion((v) => v + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to unpublish');
    }
  }

  const isEmptyAll = !loading && all.length === 0;
  const isEmptyFiltered = !loading && all.length > 0 && sorted.length === 0;
  const activeFilterCount = countActiveFilters(filters);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1 min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{t('admin.news.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('admin.news.subtitle.counts')
              .replace('{published}', String(counts.published))
              .replace('{draft}', String(counts.draft))}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SortDropdown value={sort} onChange={setSort} />
          <Button onClick={() => navigate('/content/news/new')}>
            <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {t('admin.news.action.new')}
          </Button>
        </div>
      </header>

      {/* Filter bar */}
      <NewsFilterBar
        filters={filters}
        setFilters={setFilters}
        loading={loading}
        firstChipRef={firstChipRef}
        searchInputRef={searchInputRef}
      />

      {/* Body */}
      {isEmptyAll ? (
        <EmptyState variant="no-records" onAction={() => navigate('/content/news/new')} />
      ) : isEmptyFiltered ? (
        <EmptyState
          variant="no-matches"
          onAction={() => navigate('/content/news/new')}
          onClearFilters={
            activeFilterCount > 0
              ? () => setFilters({ ...EMPTY_FILTERS, dateRange: { ...EMPTY_FILTERS.dateRange } })
              : undefined
          }
        />
      ) : (
        <>
          <div className="hidden lg:block">
            <NewsTable
              rows={sorted}
              loading={loading}
              focusedId={focusedId}
              setFocusedId={setFocusedIdState}
              onOpen={open}
              onPublishNow={(id) => setPublishTarget(all.find((n) => n.id === id) ?? null)}
              onUnpublish={(id) => setUnpublishTarget(all.find((n) => n.id === id) ?? null)}
              onDelete={(id) => setDeleteTarget(all.find((n) => n.id === id) ?? null)}
              onOpenAudit={openAudit}
              adminLocale="en"
            />
          </div>
          <div className="lg:hidden">
            <NewsMobileCardStack
              rows={sorted}
              loading={loading}
              focusedId={focusedId}
              setFocusedId={setFocusedIdState}
              onOpen={open}
              onPublishNow={(id) => setPublishTarget(all.find((n) => n.id === id) ?? null)}
              onUnpublish={(id) => setUnpublishTarget(all.find((n) => n.id === id) ?? null)}
              onDelete={(id) => setDeleteTarget(all.find((n) => n.id === id) ?? null)}
              onOpenAudit={openAudit}
              adminLocale="en"
            />
          </div>
        </>
      )}

      {/* Dialogs */}
      <DeleteNewsDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
        item={deleteTarget}
        onConfirm={handleDelete}
      />
      <PublishNowDialog
        open={!!publishTarget}
        onOpenChange={(o) => { if (!o) setPublishTarget(null); }}
        item={publishTarget}
        onConfirm={handlePublishNow}
      />
      <UnpublishDialog
        open={!!unpublishTarget}
        onOpenChange={(o) => { if (!o) setUnpublishTarget(null); }}
        item={unpublishTarget}
        onConfirm={handleUnpublish}
      />
    </div>
  );
}

export default News;
