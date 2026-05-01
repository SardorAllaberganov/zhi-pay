import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import {
  ADMIN_POOL,
  CURRENT_ADMIN,
  appendAmlAudit,
  blockAmlUser,
  computeAmlCounts,
  getAmlUserById,
  getInitialAmlList,
  unassignedCriticalOpen,
  type AmlClearReason,
  type AmlReview,
} from '@/data/mockAmlTriage';
import { AmlFilterBar } from '@/components/aml-triage/AmlFilterBar';
import { AmlListPane } from '@/components/aml-triage/AmlListPane';
import { AmlDetailPane } from '@/components/aml-triage/AmlDetailPane';
import { CriticalBanner } from '@/components/aml-triage/cards/CriticalBanner';
import { ClearDialog } from '@/components/aml-triage/modals/ClearDialog';
import { EscalateDialog } from '@/components/aml-triage/modals/EscalateDialog';
import { ReassignDialog } from '@/components/aml-triage/modals/ReassignDialog';
import {
  applyFilters,
  applySort,
  DEFAULT_AML_FILTERS,
  type AmlFilters,
  type AmlSort,
} from '@/components/aml-triage/types';
import {
  readAmlState,
  writeAmlState,
} from '@/components/aml-triage/filterState';

/**
 * Master-detail AML triage page.
 *
 * Routing:
 *   /operations/aml-triage         — list-only on mobile, master-detail on lg+
 *   /operations/aml-triage/:id     — focuses a row; on mobile renders detail-only
 *   /operations/aml-triage/new     — full-page manual-flag form (separate page)
 */
export function AmlTriage() {
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const idFromUrl = params.id ?? null;

  const cached = readAmlState();

  const [reviews, setReviews] = useState<AmlReview[]>(getInitialAmlList);
  const [filters, setFilters] = useState<AmlFilters>(
    cached?.filters ?? DEFAULT_AML_FILTERS,
  );
  const [sort, setSort] = useState<AmlSort>(cached?.sort ?? 'severity-age');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    cached?.selectedIds ?? new Set(),
  );
  const [focusedIndex, setFocusedIndex] = useState<number>(
    cached?.focusedIndex ?? -1,
  );

  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  useEffect(() => {
    setLoading(true);
    const handle = window.setTimeout(() => setLoading(false), 600);
    return () => window.clearTimeout(handle);
  }, [refreshTick]);

  const [clearOpen, setClearOpen] = useState(false);
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);

  const visibleReviews = useMemo(
    () => applySort(applyFilters(reviews, filters, CURRENT_ADMIN.id), sort),
    [reviews, filters, sort],
  );

  const counts = useMemo(() => computeAmlCounts(reviews), [reviews]);
  const criticalUnassigned = useMemo(
    () => unassignedCriticalOpen(reviews),
    [reviews],
  );

  const selectedReview = useMemo(
    () => (idFromUrl ? reviews.find((r) => r.id === idFromUrl) ?? null : null),
    [reviews, idFromUrl],
  );

  // Persist state cache (mobile round-trip + jk in detail later if needed).
  useEffect(() => {
    writeAmlState({
      filters,
      sort,
      selectedId: idFromUrl,
      focusedIndex,
      selectedIds,
      visibleIds: visibleReviews.map((r) => r.id),
    });
  }, [filters, sort, idFromUrl, focusedIndex, selectedIds, visibleReviews]);

  const selectRow = useCallback(
    (id: string) => {
      setFocusedIndex(visibleReviews.findIndex((r) => r.id === id));
      navigate(`/operations/aml-triage/${id}`);
    },
    [navigate, visibleReviews],
  );

  const advanceToNextOpen = useCallback(() => {
    if (!idFromUrl) return;
    const currentIdx = visibleReviews.findIndex((r) => r.id === idFromUrl);
    const candidates = [
      ...visibleReviews.slice(currentIdx + 1),
      ...visibleReviews.slice(0, currentIdx),
    ];
    const next = candidates.find(
      (r) => r.status === 'open' || r.status === 'reviewing',
    );
    if (next) {
      navigate(`/operations/aml-triage/${next.id}`, { replace: true });
      setFocusedIndex(visibleReviews.findIndex((r) => r.id === next.id));
    } else {
      navigate('/operations/aml-triage', { replace: true });
      setFocusedIndex(-1);
    }
  }, [idFromUrl, navigate, visibleReviews]);

  const updateReview = useCallback(
    (id: string, patch: Partial<AmlReview>) => {
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    },
    [],
  );

  // ----- single-row actions -----

  const handleClear = (payload: { reasonCode: AmlClearReason; notes: string }) => {
    if (!selectedReview) return;
    const now = new Date();
    updateReview(selectedReview.id, {
      status: 'cleared',
      resolutionNotes: payload.notes,
      clearReason: payload.reasonCode,
      resolvedAt: now,
      // Auto-claim on close so audit trail shows who actioned it.
      assigneeId: CURRENT_ADMIN.id,
      assigneeName: CURRENT_ADMIN.name,
    });
    appendAmlAudit({
      flagId: selectedReview.id,
      action: 'clear',
      actorId: CURRENT_ADMIN.id,
      actorName: CURRENT_ADMIN.name,
      fromStatus: selectedReview.status,
      toStatus: 'cleared',
      reason: payload.notes,
      context: { reason_code: payload.reasonCode },
    });
    toast.success(t('admin.aml-triage.action.clear.success'));
    advanceToNextOpen();
  };

  const handleEscalate = (payload: { notes: string }) => {
    if (!selectedReview) return;
    const now = new Date();
    updateReview(selectedReview.id, {
      status: 'escalated',
      resolutionNotes: payload.notes,
      resolvedAt: now,
      assigneeId: CURRENT_ADMIN.id,
      assigneeName: CURRENT_ADMIN.name,
    });

    let blocked = false;
    if (selectedReview.severity === 'critical') {
      const u = blockAmlUser(selectedReview.userId);
      blocked = !!u;
      // Force a re-render of the user-card by bumping the reviews tick —
      // mockAmlTriage exposes user state via getAmlUserById, which reads
      // from the live mutable array. Triggering setReviews with same
      // reference is enough since selectedReview already drives the card.
      setReviews((prev) => prev.slice());
    }

    appendAmlAudit({
      flagId: selectedReview.id,
      action: 'escalate',
      actorId: CURRENT_ADMIN.id,
      actorName: CURRENT_ADMIN.name,
      fromStatus: selectedReview.status,
      toStatus: 'escalated',
      reason: payload.notes,
      context: { user_blocked: blocked },
    });
    toast.success(
      blocked
        ? t('admin.aml-triage.action.escalate.success-blocked')
        : t('admin.aml-triage.action.escalate.success'),
    );
    advanceToNextOpen();
  };

  const handleAssignMe = () => {
    if (!selectedReview) return;
    updateReview(selectedReview.id, {
      assigneeId: CURRENT_ADMIN.id,
      assigneeName: CURRENT_ADMIN.name,
      // Open → reviewing on claim. Cleared/escalated stay terminal.
      status: selectedReview.status === 'open' ? 'reviewing' : selectedReview.status,
    });
    appendAmlAudit({
      flagId: selectedReview.id,
      action: 'claim',
      actorId: CURRENT_ADMIN.id,
      actorName: CURRENT_ADMIN.name,
      fromStatus: selectedReview.status,
      toStatus: selectedReview.status === 'open' ? 'reviewing' : selectedReview.status,
    });
    toast.success(t('admin.aml-triage.action.assign-me.success'));
  };

  const handleReassign = (payload: { assigneeId: string | null }) => {
    if (!selectedReview) return;
    const target = payload.assigneeId
      ? ADMIN_POOL.find((a) => a.id === payload.assigneeId)
      : null;
    updateReview(selectedReview.id, {
      assigneeId: target?.id,
      assigneeName: target?.name,
      // Reassigning to "Unassigned" returns the flag to open.
      status:
        !target && selectedReview.status === 'reviewing'
          ? 'open'
          : selectedReview.status,
    });
    appendAmlAudit({
      flagId: selectedReview.id,
      action: 'reassign',
      actorId: CURRENT_ADMIN.id,
      actorName: CURRENT_ADMIN.name,
      fromStatus: selectedReview.status,
      toStatus:
        !target && selectedReview.status === 'reviewing'
          ? 'open'
          : selectedReview.status,
      context: { to_assignee: target?.id ?? null },
    });
    toast.success(t('admin.aml-triage.action.reassign.success'));
  };

  // ----- bulk actions -----

  const handleBulkAssignMe = () => {
    const ids = Array.from(selectedIds);
    setReviews((prev) =>
      prev.map((r) => {
        if (!ids.includes(r.id)) return r;
        if (r.status === 'cleared' || r.status === 'escalated') return r;
        return {
          ...r,
          assigneeId: CURRENT_ADMIN.id,
          assigneeName: CURRENT_ADMIN.name,
          status: r.status === 'open' ? 'reviewing' : r.status,
        };
      }),
    );
    for (const id of ids) {
      appendAmlAudit({
        flagId: id,
        action: 'claim',
        actorId: CURRENT_ADMIN.id,
        actorName: CURRENT_ADMIN.name,
        context: { bulk: true },
      });
    }
    toast.success(`Claimed ${ids.length} flag${ids.length === 1 ? '' : 's'}`);
    setSelectedIds(new Set());
  };

  const clearSelection = () => setSelectedIds(new Set());

  // ----- critical banner CTA: claim oldest unassigned critical -----

  const onAssignFirstCriticalToMe = () => {
    const oldest = criticalUnassigned
      .slice()
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
    if (!oldest) return;
    updateReview(oldest.id, {
      assigneeId: CURRENT_ADMIN.id,
      assigneeName: CURRENT_ADMIN.name,
      status: 'reviewing',
    });
    appendAmlAudit({
      flagId: oldest.id,
      action: 'claim',
      actorId: CURRENT_ADMIN.id,
      actorName: CURRENT_ADMIN.name,
      fromStatus: oldest.status,
      toStatus: 'reviewing',
      context: { source: 'critical_banner' },
    });
    navigate(`/operations/aml-triage/${oldest.id}`);
    toast.success(t('admin.aml-triage.action.assign-me.success'));
  };

  // ----- page-scoped hotkeys -----

  useEffect(() => {
    function isTyping(target: EventTarget | null) {
      if (!(target instanceof HTMLElement)) return false;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return true;
      if (target.isContentEditable) return true;
      return false;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (isTyping(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (window.matchMedia('(max-width: 1023px)').matches) return;

      switch (e.key) {
        case 'j': {
          e.preventDefault();
          if (visibleReviews.length === 0) return;
          const next = Math.min(focusedIndex + 1, visibleReviews.length - 1);
          setFocusedIndex(next);
          const target = visibleReviews[next];
          if (target) navigate(`/operations/aml-triage/${target.id}`, { replace: true });
          return;
        }
        case 'k': {
          e.preventDefault();
          if (visibleReviews.length === 0) return;
          const next = Math.max(focusedIndex - 1, 0);
          setFocusedIndex(next);
          const target = visibleReviews[next];
          if (target) navigate(`/operations/aml-triage/${target.id}`, { replace: true });
          return;
        }
        case 'Enter': {
          if (focusedIndex < 0) return;
          const target = visibleReviews[focusedIndex];
          if (target) {
            e.preventDefault();
            selectRow(target.id);
          }
          return;
        }
        case 'c': {
          if (!selectedReview) return;
          if (selectedReview.status === 'cleared' || selectedReview.status === 'escalated') return;
          if (selectedReview.flagType === 'sanctions') return;
          e.preventDefault();
          setClearOpen(true);
          return;
        }
        case 'e': {
          if (!selectedReview) return;
          if (selectedReview.status === 'cleared' || selectedReview.status === 'escalated') return;
          e.preventDefault();
          setEscalateOpen(true);
          return;
        }
        case 'm': {
          if (!selectedReview) return;
          if (selectedReview.status === 'cleared' || selectedReview.status === 'escalated') return;
          e.preventDefault();
          handleAssignMe();
          return;
        }
        case 'a': {
          if (!selectedReview) return;
          if (selectedReview.status === 'cleared' || selectedReview.status === 'escalated') return;
          e.preventDefault();
          setReassignOpen(true);
          return;
        }
        default:
          return;
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedIndex, visibleReviews, selectedReview, navigate]);

  useEffect(() => {
    if (focusedIndex >= visibleReviews.length) {
      setFocusedIndex(visibleReviews.length - 1);
    }
  }, [visibleReviews.length, focusedIndex]);

  const onMobileBack = () => navigate('/operations/aml-triage');

  // ===================================================================
  // Render
  // ===================================================================

  const showListMobile = !idFromUrl;
  const showDetailMobile = !!idFromUrl;

  const selectedUserPhone = selectedReview
    ? getAmlUserById(selectedReview.userId)?.phone ?? '—'
    : '—';

  // Layout strategy:
  //   • lg+ : fixed page height (100dvh − topbar − main padding) so each
  //           pane scrolls independently and the action bar docks bottom.
  //   • <lg : natural page height; main scrolls; action bar uses sticky
  //           bottom-0 so it pins to the viewport while content scrolls.
  return (
    <div className="flex flex-col gap-4 lg:h-[calc(100dvh-6.5rem)]">
      {/* Page header */}
      <header
        className={cn(
          'flex flex-col gap-3 md:flex-row md:items-end md:justify-between shrink-0',
          showDetailMobile && 'hidden lg:flex',
        )}
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('admin.aml-triage.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 tabular">
            {t('admin.aml-triage.subtitle.counts', {
              critical: counts.criticalOpen,
              warning: counts.warningOpen,
              info: counts.infoOpen,
              reviewing: counts.reviewing,
            })}
          </p>
        </div>
        {/* On <md: full-width row with Refresh + New flag at 50/50 (flex-1).
            On md+: natural-width inline group with the AssigneeQuickToggle
            included (filter chip duplicate is hidden on <md). */}
        <div className="flex w-full items-center gap-2 md:w-auto md:flex-wrap">
          <div className="hidden md:inline-flex">
            <AssigneeQuickToggle
              value={filters.assigned}
              onChange={(next) =>
                setFilters((prev) => ({ ...prev, assigned: next }))
              }
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefreshTick((n) => n + 1)}
            aria-label={t('admin.aml-triage.refresh')}
            className="h-9 flex-1 md:flex-none"
          >
            <RotateCw className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
            {t('admin.aml-triage.refresh')}
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/operations/aml-triage/new')}
            className="h-9 flex-1 md:flex-none"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
            <span className="hidden sm:inline">
              {t('admin.aml-triage.new-manual-flag')}
            </span>
            <span className="sm:hidden">New flag</span>
          </Button>
        </div>
      </header>

      {/* Critical banner — page-top, only when there's a critical+open+unassigned flag */}
      {!showDetailMobile && criticalUnassigned.length > 0 && (
        <CriticalBanner
          count={criticalUnassigned.length}
          onAssignFirstToMe={onAssignFirstCriticalToMe}
        />
      )}

      {/* Filter bar */}
      <div className={cn('shrink-0', showDetailMobile && 'hidden lg:block')}>
        <AmlFilterBar
          filters={filters}
          setFilters={setFilters}
          loading={loading}
        />
      </div>

      {/* Master + detail body — card-style container with always-on
          overflow-hidden so the rounded corners cleanly clip every child
          background (list pane bg-card, detail action-bar, etc.). The
          detail-pane action bar uses `position: fixed` on <lg so it
          escapes overflow-hidden and pins to the viewport bottom. */}
      <div className="rounded-lg border border-border bg-background overflow-hidden lg:flex lg:flex-1 lg:min-h-0">
        <div
          className={cn(
            'flex flex-col min-w-0',
            showListMobile ? 'flex-1' : 'hidden',
            'lg:flex lg:flex-none lg:w-[520px] lg:border-r lg:border-border',
          )}
        >
          <AmlListPane
            reviews={visibleReviews}
            selectedId={idFromUrl}
            focusedIndex={focusedIndex}
            selectedIds={selectedIds}
            sort={sort}
            onSortChange={setSort}
            onSelect={selectRow}
            onCheckToggle={(id) => {
              setSelectedIds((prev) => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
              });
            }}
            onCheckAll={(allChecked) => {
              if (allChecked) {
                setSelectedIds(new Set(visibleReviews.map((r) => r.id)));
              } else {
                setSelectedIds(new Set());
              }
            }}
            onBulkAssignMe={handleBulkAssignMe}
            onClearSelection={clearSelection}
            loading={loading}
            hasError={false}
            onRetry={() => setRefreshTick((n) => n + 1)}
            totalCount={reviews.length}
          />
        </div>

        <div
          className={cn(
            'flex flex-col flex-1 min-w-0',
            showDetailMobile ? 'flex' : 'hidden',
            'lg:flex',
          )}
        >
          {showDetailMobile && (
            <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-2 lg:hidden shrink-0">
              <Button variant="ghost" size="sm" onClick={onMobileBack}>
                <ArrowLeft className="h-4 w-4 mr-1.5" aria-hidden="true" />
                {t('admin.aml-triage.mobile.back')}
              </Button>
            </div>
          )}

          <AmlDetailPane
            review={selectedReview}
            onClear={() => setClearOpen(true)}
            onEscalate={() => setEscalateOpen(true)}
            onAssignMe={handleAssignMe}
            onReassign={() => setReassignOpen(true)}
            onOpenUserProfile={() => {
              if (selectedReview) navigate(`/users?focus=${selectedReview.userId}`);
            }}
            onOpenTransfer={(transferId) =>
              navigate(`/operations/transfers/${transferId}`)
            }
          />
        </div>
      </div>

      {/* Modals */}
      {selectedReview && (
        <>
          <ClearDialog
            open={clearOpen}
            onOpenChange={setClearOpen}
            onSubmit={handleClear}
          />
          <EscalateDialog
            open={escalateOpen}
            onOpenChange={setEscalateOpen}
            review={selectedReview}
            userPhone={selectedUserPhone}
            onSubmit={handleEscalate}
          />
          <ReassignDialog
            open={reassignOpen}
            onOpenChange={setReassignOpen}
            currentAssigneeId={selectedReview.assigneeId}
            onSubmit={handleReassign}
          />
        </>
      )}
    </div>
  );
}

// =====================================================================
// Page-header assignee quick toggle (All / Assigned to me)
// =====================================================================

interface AssigneeQuickToggleProps {
  value: 'anyone' | 'me' | 'unassigned';
  onChange: (next: 'anyone' | 'me' | 'unassigned') => void;
}

function AssigneeQuickToggle({ value, onChange }: AssigneeQuickToggleProps) {
  const isMe = value === 'me';
  return (
    <div
      className="inline-flex rounded-md border border-border bg-background p-0.5"
      role="tablist"
      aria-label="Assignee filter"
    >
      <Button
        variant={!isMe ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onChange('anyone')}
        className="h-7 rounded-sm"
      >
        {t('admin.aml-triage.assignee.all')}
      </Button>
      <Button
        variant={isMe ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onChange('me')}
        className="h-7 rounded-sm"
      >
        {t('admin.aml-triage.assignee.me')}
      </Button>
    </div>
  );
}

