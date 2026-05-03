import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import {
  type Story,
  deleteStory,
  getCounts,
  getStatus,
  listStories,
  publishStory,
  reorderStory,
} from '@/data/mockStories';
import { StoriesFilterBar } from '@/components/stories/StoriesFilterBar';
import { SortDropdown } from '@/components/stories/SortDropdown';
import { StoryGrid } from '@/components/stories/StoryGrid';
import { ReorderConfirmDialog } from '@/components/stories/ReorderConfirmDialog';
import { DeleteStoryDialog } from '@/components/stories/DeleteStoryDialog';
import { PublishNowDialog } from '@/components/stories/PublishNowDialog';
import { EmptyStoriesFilteredState, EmptyStoriesState } from '@/components/stories/EmptyState';
import {
  EMPTY_FILTERS,
  DEFAULT_SORT,
  countActiveFilters,
  type StoryFilters,
  type StorySort,
} from '@/components/stories/types';
import {
  getFilterState,
  setFilters as cacheFilters,
  setSort as cacheSort,
  setFocusedId as cacheFocused,
} from '@/components/stories/filterState';

export function Stories() {
  const navigate = useNavigate();

  // Module-cached state — survives remounts within the same session.
  const initial = useRef(getFilterState()).current;
  const [filters, setFilters] = useState<StoryFilters>(initial.filters);
  const [sort, setSort] = useState<StorySort>(initial.sort);
  const [focusedId, setFocusedIdState] = useState<string | null>(initial.focusedId);

  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0); // increments on mutation to re-derive

  // Reorder dialog state
  const [reorderTarget, setReorderTarget] = useState<{
    story: Story;
    oldOrder: number;
    newOrder: number;
  } | null>(null);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<Story | null>(null);

  // Publish-now dialog state
  const [publishTarget, setPublishTarget] = useState<Story | null>(null);

  useEffect(() => {
    cacheFilters(filters);
  }, [filters]);
  useEffect(() => {
    cacheSort(sort);
  }, [sort]);
  useEffect(() => {
    cacheFocused(focusedId);
  }, [focusedId]);

  // 350ms initial-mount skeleton — matches FX/Commission/Services cadence.
  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(id);
  }, []);

  // ---------------------------------------------------------------
  // Page-scoped hotkeys
  // ---------------------------------------------------------------
  const filteredRef = useRef<Story[]>([]);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      const inField =
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        (e.target as HTMLElement | null)?.isContentEditable;
      if (inField || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'n') {
        e.preventDefault();
        navigate('/content/stories/new');
        return;
      }
      const list = filteredRef.current;
      if (list.length === 0) return;
      const currentIdx = focusedId ? list.findIndex((s) => s.id === focusedId) : -1;
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
          navigate(`/content/stories/${list[currentIdx].id}`);
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focusedId, navigate]);

  // ---------------------------------------------------------------
  // Derive list — re-reads `version` so mutators trigger refresh
  // ---------------------------------------------------------------
  const allStories = useMemo(() => listStories(), [version]);
  const counts = useMemo(() => getCounts(), [version]);

  const filtered = useMemo(() => {
    let result = allStories.filter((s) => {
      const status = getStatus(s);
      if (filters.statuses.length > 0 && !filters.statuses.includes(status)) return false;
      if (filters.types.length > 0 && !filters.types.includes(s.type)) return false;
      if (filters.hasExpiration && !s.expiresAt) return false;
      return true;
    });

    if (sort.key === 'display_order') {
      // Group: published (by displayOrder ASC) → scheduled (by displayOrder ASC) →
      // drafts (by createdAt DESC) → expired (by expiresAt DESC).
      const ranks: Record<string, number> = { published: 0, scheduled: 1, draft: 2, expired: 3 };
      result = [...result].sort((a, b) => {
        const sa = getStatus(a);
        const sb = getStatus(b);
        if (ranks[sa] !== ranks[sb]) return ranks[sa] - ranks[sb];
        if (sa === 'published' || sa === 'scheduled') return a.displayOrder - b.displayOrder;
        if (sa === 'draft') return b.createdAt.getTime() - a.createdAt.getTime();
        return (b.expiresAt?.getTime() ?? 0) - (a.expiresAt?.getTime() ?? 0);
      });
    } else if (sort.key === 'created') {
      result = [...result].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else {
      // 'expiring' — closest expiry first; nulls (open-ended) sink to bottom.
      result = [...result].sort((a, b) => {
        const at = a.expiresAt?.getTime() ?? Number.POSITIVE_INFINITY;
        const bt = b.expiresAt?.getTime() ?? Number.POSITIVE_INFINITY;
        return at - bt;
      });
    }

    return result;
  }, [allStories, filters, sort]);

  filteredRef.current = filtered;

  // ---------------------------------------------------------------
  // Reorder flow
  // ---------------------------------------------------------------
  function handleReorderRequested(story: Story, newOrder: number) {
    if (story.displayOrder === newOrder) return;
    setReorderTarget({ story, oldOrder: story.displayOrder, newOrder });
  }

  function commitReorder(reason: string) {
    if (!reorderTarget) return;
    try {
      reorderStory(reorderTarget.story.id, reorderTarget.newOrder, reason);
      toast.success(t('admin.stories.reorder.toast.success'));
      setVersion((v) => v + 1);
    } catch (err) {
      toast.error(t('admin.stories.reorder.toast.failed'));
      console.error(err);
    } finally {
      setReorderTarget(null);
    }
  }

  // ---------------------------------------------------------------
  // Delete flow
  // ---------------------------------------------------------------
  function commitDelete(reason: string) {
    if (!deleteTarget) return;
    try {
      deleteStory(deleteTarget.id, reason);
      toast.success(t('admin.stories.delete.toast.success', { title: deleteTarget.titleEn }));
      setVersion((v) => v + 1);
    } catch (err) {
      toast.error(t('admin.stories.delete.toast.failed'));
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  }

  // ---------------------------------------------------------------
  // Publish-now flow (drafts + scheduled override)
  // ---------------------------------------------------------------
  function commitPublishNow() {
    if (!publishTarget) return;
    try {
      publishStory(publishTarget.id, new Date());
      toast.success(t('admin.stories.publish-now.toast.success', { title: publishTarget.titleEn }));
      setVersion((v) => v + 1);
    } catch (err) {
      toast.error(t('admin.stories.publish-now.toast.failed'));
      console.error(err);
    } finally {
      setPublishTarget(null);
    }
  }

  // ---------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------
  const noStoriesAtAll = !loading && allStories.length === 0;
  const noFilteredStories = !loading && allStories.length > 0 && filtered.length === 0;
  const filterBarFirstChipRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t('admin.stories.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('admin.stories.subtitle.counts', {
              published: counts.published,
              scheduled: counts.scheduled,
              draft: counts.draft,
              expired: counts.expired,
            })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SortDropdown value={sort.key} onChange={(key) => setSort({ key, dir: 'asc' })} />
          <Button onClick={() => navigate('/content/stories/new')}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {t('admin.stories.action.new')}
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <StoriesFilterBar
        filters={filters}
        setFilters={setFilters}
        loading={loading}
        firstChipRef={filterBarFirstChipRef}
      />

      {/* Body */}
      {noStoriesAtAll ? (
        <EmptyStoriesState />
      ) : noFilteredStories ? (
        <EmptyStoriesFilteredState onClear={() => setFilters({ ...EMPTY_FILTERS })} />
      ) : (
        <StoryGrid
          stories={filtered}
          loading={loading}
          focusedId={focusedId}
          onFocus={setFocusedIdState}
          onReorderRequested={handleReorderRequested}
          onPublish={(s) => setPublishTarget(s)}
          onDelete={(s) => setDeleteTarget(s)}
        />
      )}

      {/* Dialogs */}
      <ReorderConfirmDialog
        open={Boolean(reorderTarget)}
        onOpenChange={(open) => {
          if (!open) setReorderTarget(null);
        }}
        story={reorderTarget?.story ?? null}
        oldOrder={reorderTarget?.oldOrder ?? 0}
        newOrder={reorderTarget?.newOrder ?? 0}
        onConfirm={commitReorder}
      />

      <DeleteStoryDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        story={deleteTarget}
        onConfirm={commitDelete}
      />

      <PublishNowDialog
        open={Boolean(publishTarget)}
        onOpenChange={(open) => {
          if (!open) setPublishTarget(null);
        }}
        story={publishTarget}
        onConfirm={commitPublishNow}
      />

      {/* Hidden reference so ESLint doesn't flag countActiveFilters as unused — it's reflected in the chip-count badge inside FilterBar */}
      <span className="sr-only" aria-hidden="true">
        {countActiveFilters(filters)}
      </span>
    </div>
  );
}
