import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';
import {
  type AppVersion,
  type Platform,
  addAppVersion,
  editAppVersion,
  getAppVersionById,
  getCounts,
  getLatestAppVersion,
  listAppVersions,
} from '@/data/mockAppVersions';
import { CURRENT_USER_ADMIN } from '@/data/mockUsers';
import { PLATFORM_ORDER } from '@/components/app-versions/types';
import { getPlatformUiState, setPlatformUiState } from '@/components/app-versions/filterState';
import { PlatformTabs } from '@/components/app-versions/PlatformTabs';
import {
  ActiveVersionBanner,
  ActiveVersionBannerSkeleton,
} from '@/components/app-versions/ActiveVersionBanner';
import { VersionsTable } from '@/components/app-versions/VersionsTable';
import { VersionsMobileCardStack } from '@/components/app-versions/VersionsMobileCardStack';
import { EmptyState } from '@/components/app-versions/EmptyState';
import { AddVersionDialog } from '@/components/app-versions/modals/AddVersionDialog';
import { EditVersionDialog } from '@/components/app-versions/modals/EditVersionDialog';

/**
 * App Versions page — single orchestrator. Routes:
 *   /system/app-versions                        → tab driven by ?platform=ios|android
 *   /system/app-versions?platform=android       → Android tab active
 *
 * URL drives the active tab so back-button + refresh + deep-link all work.
 * Sort + expanded-row are cached per-platform via `filterState` so tab
 * switching doesn't reset state.
 */

const PLATFORMS = PLATFORM_ORDER;

function isPlatform(v: string | null): v is Platform {
  return v === 'ios' || v === 'android';
}

export function AppVersions() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 350ms initial-mount skeleton (matches FX Config / Services cadence).
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(id);
  }, []);

  // Data version — bumped on every mutator so derived selectors refresh.
  const [version, setVersion] = useState(0);

  // Active platform via URL query param.
  const platform: Platform = useMemo(() => {
    const raw = searchParams.get('platform');
    return isPlatform(raw) ? raw : 'ios';
  }, [searchParams]);

  function setPlatform(next: Platform) {
    const params = new URLSearchParams(searchParams);
    params.set('platform', next);
    setSearchParams(params, { replace: true });
  }

  // Per-platform UI state (sort + expanded-row id).
  const ui = getPlatformUiState(platform);
  const [sort, setSort] = useState(ui.sort);
  const [expandedId, setExpandedId] = useState<string | null>(ui.expandedId);

  // Persist sort + expanded back into the cache when they change OR when
  // the platform flips so re-mount restores the right state.
  useEffect(() => {
    setPlatformUiState(platform, { sort, expandedId });
  }, [platform, sort, expandedId]);

  // When the URL platform changes, hydrate local state from the cache.
  useEffect(() => {
    const cached = getPlatformUiState(platform);
    setSort(cached.sort);
    setExpandedId(cached.expandedId);
  }, [platform]);

  // Derived data
  const counts = useMemo<Record<Platform, number>>(
    () => getCounts(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );
  const rows = useMemo<AppVersion[]>(() => {
    const list = listAppVersions(platform);
    if (sort.dir === 'asc') {
      return list.slice().sort((a, b) => a.releasedAt.getTime() - b.releasedAt.getTime());
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, sort.dir, version]);
  const latest = useMemo<AppVersion | undefined>(
    () => getLatestAppVersion(platform),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [platform, version],
  );

  // Add modal
  const [addOpen, setAddOpen] = useState(false);
  function openAdd() {
    setAddOpen(true);
  }

  async function handleAdd(input: Omit<Parameters<typeof addAppVersion>[0], 'actor'>) {
    const result = addAppVersion({ ...input, actor: { id: CURRENT_USER_ADMIN.id, name: CURRENT_USER_ADMIN.name } });
    if (result.ok) {
      setVersion((v) => v + 1);
      // Switch the tab to the platform we just added to.
      setPlatform(input.platform);
      // Auto-expand the freshly added row so the admin sees the result.
      setExpandedId(result.entry.id);
      setAddOpen(false);
      toast.success(
        t('admin.app-versions.toast.added', {
          platform: t(`admin.app-versions.tab.${input.platform}`),
          version: input.version,
        }),
      );
    } else {
      // Surface the error inline + keep modal open. Toast for redundancy.
      const msgKey =
        result.error === 'duplicate'
          ? 'admin.app-versions.toast.error.duplicate'
          : result.error === 'invalid_min_supported'
            ? 'admin.app-versions.toast.error.min-supported'
            : result.error === 'invalid_version'
              ? 'admin.app-versions.toast.error.semver'
              : 'admin.app-versions.toast.error.missing-notes';
      toast.error(t(msgKey));
    }
  }

  // Edit modal
  const [editTarget, setEditTarget] = useState<AppVersion | null>(null);
  function openEdit(v: AppVersion) {
    setEditTarget(v);
  }

  async function handleEdit(input: Omit<Parameters<typeof editAppVersion>[0], 'actor'>) {
    const result = editAppVersion({ ...input, actor: { id: CURRENT_USER_ADMIN.id, name: CURRENT_USER_ADMIN.name } });
    if (result.ok) {
      setVersion((v) => v + 1);
      setEditTarget(null);
      toast.success(
        t('admin.app-versions.toast.edited', {
          platform: t(`admin.app-versions.tab.${result.entry.platform}`),
          version: result.entry.version,
        }),
      );
    } else {
      const msgKey =
        result.error === 'invalid_min_supported'
          ? 'admin.app-versions.toast.error.min-supported'
          : result.error === 'missing_notes'
            ? 'admin.app-versions.toast.error.missing-notes'
            : result.error === 'missing_reason'
              ? 'admin.app-versions.toast.error.missing-reason'
              : 'admin.app-versions.toast.error.not-found';
      toast.error(t(msgKey));
    }
  }

  function openAuditFor(v: AppVersion) {
    navigate(`/compliance/audit-log?entity=app_version&id=${encodeURIComponent(v.id)}`);
  }

  function toggleExpand(id: string) {
    setExpandedId((cur) => (cur === id ? null : id));
  }

  function toggleSort() {
    setSort((cur) => ({ ...cur, dir: cur.dir === 'desc' ? 'asc' : 'desc' }));
  }

  // Page-scoped hotkeys: `n` opens Add modal.
  const onKey = useCallback(
    (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement | null;
      const tag = tgt?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tgt?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // Don't hijack hotkeys when a modal is open.
      if (addOpen || editTarget) return;
      if (e.key === 'n') {
        e.preventDefault();
        openAdd();
      }
    },
    [addOpen, editTarget],
  );
  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onKey]);

  return (
    <div className="space-y-4">
      {/* Page header */}
      <header className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('admin.app-versions.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('admin.app-versions.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openAdd} size="sm">
            <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {t('admin.app-versions.action.add')}
          </Button>
        </div>
      </header>

      {/* Platform tabs + per-platform body */}
      <Tabs value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
        <PlatformTabs counts={counts} loading={loading} />
        {PLATFORMS.map((p) => (
          <TabsContent key={p} value={p} className="mt-4 space-y-4">
            {loading ? (
              <>
                <ActiveVersionBannerSkeleton />
                <Skeleton className="h-72 w-full rounded-lg" />
              </>
            ) : latest && p === platform ? (
              <>
                <ActiveVersionBanner platform={p} version={latest} onEdit={openEdit} />
                {/* Desktop table */}
                <div className="hidden md:block">
                  <VersionsTable
                    rows={rows}
                    expandedId={expandedId}
                    onToggleExpand={toggleExpand}
                    sort={sort}
                    onSort={toggleSort}
                    onEdit={openEdit}
                    onOpenAudit={openAuditFor}
                  />
                </div>
                {/* Mobile card stack */}
                <div className="md:hidden">
                  <VersionsMobileCardStack
                    rows={rows}
                    expandedId={expandedId}
                    onToggleExpand={toggleExpand}
                    platform={p}
                    onEdit={openEdit}
                  />
                </div>
              </>
            ) : (
              <EmptyState platform={p} onAdd={openAdd} />
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Add modal */}
      <AddVersionDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        initialPlatform={platform}
        onConfirm={handleAdd}
      />

      {/* Edit modal */}
      <EditVersionDialog
        open={editTarget !== null}
        onOpenChange={(o) => {
          if (!o) setEditTarget(null);
        }}
        version={editTarget}
        onConfirm={handleEdit}
      />
    </div>
  );
}

/**
 * Used by `mockAuditLog`'s deep-link handler — given an entity id, the
 * audit-log page can open this surface and pre-select the right tab.
 * Returns the platform a version belongs to, or `null` if the id is
 * unknown.
 */
export function getPlatformForAppVersionId(id: string): Platform | null {
  const v = getAppVersionById(id);
  return v ? v.platform : null;
}
