import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import {
  CURRENT_ADMIN,
  appendKycAudit,
  approveBlocked,
  computeKycCounts,
  getInitialKycList,
  type KycReview,
  type KycFailureReason,
} from '@/data/mockKycQueue';
import { KycFilterBar } from '@/components/kyc-queue/KycFilterBar';
import { KycListPane } from '@/components/kyc-queue/KycListPane';
import { KycDetailPane } from '@/components/kyc-queue/KycDetailPane';
import { ApproveDialog } from '@/components/kyc-queue/modals/ApproveDialog';
import { RejectDialog } from '@/components/kyc-queue/modals/RejectDialog';
import { RequestInfoDialog } from '@/components/kyc-queue/modals/RequestInfoDialog';
import { EscalateDialog } from '@/components/kyc-queue/modals/EscalateDialog';
import {
  applyFilters,
  applySort,
  DEFAULT_KYC_FILTERS,
  type KycFilters,
  type KycSort,
} from '@/components/kyc-queue/types';
import {
  readKycState,
  writeKycState,
} from '@/components/kyc-queue/filterState';

/**
 * Master-detail KYC review queue.
 *
 * Routing:
 *   /operations/kyc-queue        — list-only on mobile, master-detail on lg+
 *   /operations/kyc-queue/:id    — focuses a row; on mobile renders detail-only
 *
 * Reviewing model:
 *   "reviewing" is NOT a canonical status (per docs/mermaid_schemas/
 *   kyc_state_machine.md it's pending/passed/failed/expired). It's derived
 *   from `pending + assigneeId set`. Header chip computes both counts.
 */
export function KycQueue() {
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const idFromUrl = params.id ?? null;

  // --- Data + filters ---
  const cached = readKycState();
  const [reviews, setReviews] = useState<KycReview[]>(getInitialKycList);
  const [filters, setFilters] = useState<KycFilters>(
    cached?.filters ?? DEFAULT_KYC_FILTERS,
  );
  const [sort, setSort] = useState<KycSort>(cached?.sort ?? 'newest');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    cached?.selectedIds ?? new Set(),
  );
  const [focusedIndex, setFocusedIndex] = useState<number>(
    cached?.focusedIndex ?? -1,
  );

  // 600ms initial-mount skeleton — also re-runs on `Refresh`
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  useEffect(() => {
    setLoading(true);
    const handle = window.setTimeout(() => setLoading(false), 600);
    return () => window.clearTimeout(handle);
  }, [refreshTick]);

  // --- Modals ---
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [requestInfoOpen, setRequestInfoOpen] = useState(false);
  const [escalateOpen, setEscalateOpen] = useState(false);

  // --- Derived ---
  const visibleReviews = useMemo(() => {
    return applySort(
      applyFilters(reviews, filters, CURRENT_ADMIN.id),
      sort,
    );
  }, [reviews, filters, sort]);

  const counts = useMemo(() => computeKycCounts(reviews), [reviews]);

  const selectedReview = useMemo(
    () => (idFromUrl ? reviews.find((r) => r.id === idFromUrl) ?? null : null),
    [reviews, idFromUrl],
  );

  // Persist state for mobile detail round-trip.
  useEffect(() => {
    writeKycState({
      filters,
      sort,
      selectedId: idFromUrl,
      focusedIndex,
      selectedIds,
      visibleIds: visibleReviews.map((r) => r.id),
    });
  }, [filters, sort, idFromUrl, focusedIndex, selectedIds, visibleReviews]);

  // --- Selection / focus helpers ---
  const selectRow = useCallback(
    (id: string) => {
      setFocusedIndex(visibleReviews.findIndex((r) => r.id === id));
      navigate(`/operations/kyc-queue/${id}`);
    },
    [navigate, visibleReviews],
  );

  const advanceToNextPending = useCallback(() => {
    if (!idFromUrl) return;
    const currentIdx = visibleReviews.findIndex((r) => r.id === idFromUrl);
    // Look forward first; if none, wrap to start.
    const candidates = [
      ...visibleReviews.slice(currentIdx + 1),
      ...visibleReviews.slice(0, currentIdx),
    ];
    const next = candidates.find((r) => r.status === 'pending');
    if (next) {
      navigate(`/operations/kyc-queue/${next.id}`, { replace: true });
      setFocusedIndex(visibleReviews.findIndex((r) => r.id === next.id));
    } else {
      navigate('/operations/kyc-queue', { replace: true });
      setFocusedIndex(-1);
    }
  }, [idFromUrl, navigate, visibleReviews]);

  // --- Mutations ---
  const updateReview = useCallback(
    (id: string, patch: Partial<KycReview>) => {
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      );
    },
    [],
  );

  // --- Action handlers (single-row) ---
  const handleApprove = () => {
    if (!selectedReview) return;
    if (approveBlocked(selectedReview)) return;

    const now = new Date();
    const expires = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    updateReview(selectedReview.id, {
      status: 'passed',
      verifiedAt: now,
      expiresAt: expires,
      assigneeId: CURRENT_ADMIN.id,
      assigneeName: CURRENT_ADMIN.name,
      claimedAt: selectedReview.claimedAt ?? now,
    });

    appendKycAudit({
      reviewId: selectedReview.id,
      action: 'approve',
      actorId: CURRENT_ADMIN.id,
      actorName: CURRENT_ADMIN.name,
      context: { resulting_tier: selectedReview.resultingTier },
    });

    toast.success(t('admin.kyc-queue.action.approve.success'));
    advanceToNextPending();
  };

  const handleReject = (payload: { failureReason: KycFailureReason; reason: string }) => {
    if (!selectedReview) return;
    updateReview(selectedReview.id, {
      status: 'failed',
      failureReason: payload.failureReason,
      failureNote: payload.reason,
      assigneeId: CURRENT_ADMIN.id,
      assigneeName: CURRENT_ADMIN.name,
    });
    appendKycAudit({
      reviewId: selectedReview.id,
      action: 'reject',
      actorId: CURRENT_ADMIN.id,
      actorName: CURRENT_ADMIN.name,
      reason: payload.reason,
      failureReason: payload.failureReason,
    });
    toast.success(t('admin.kyc-queue.action.reject.success'));
    advanceToNextPending();
  };

  const handleRequestInfo = (message: string) => {
    if (!selectedReview) return;
    updateReview(selectedReview.id, {
      infoRequests: selectedReview.infoRequests + 1,
    });
    appendKycAudit({
      reviewId: selectedReview.id,
      action: 'request_info',
      actorId: CURRENT_ADMIN.id,
      actorName: CURRENT_ADMIN.name,
      reason: message,
    });
    toast.success(t('admin.kyc-queue.action.request-info.success'));
  };

  const handleEscalate = (reason: string) => {
    if (!selectedReview) return;
    appendKycAudit({
      reviewId: selectedReview.id,
      action: 'escalate',
      actorId: CURRENT_ADMIN.id,
      actorName: CURRENT_ADMIN.name,
      reason,
    });
    toast.success(t('admin.kyc-queue.action.escalate.success'));
  };

  // --- Bulk actions ---
  const handleBulkApprove = () => {
    const selected = reviews.filter((r) => selectedIds.has(r.id));
    let approved = 0;
    let underAge = 0;
    let sanctions = 0;
    const now = new Date();
    const expires = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    for (const r of selected) {
      const block = approveBlocked(r);
      if (r.status !== 'pending') continue;
      if (block === 'under_18') {
        underAge++;
        continue;
      }
      if (block === 'sanctions_hit') {
        sanctions++;
        continue;
      }
      updateReview(r.id, {
        status: 'passed',
        verifiedAt: now,
        expiresAt: expires,
        assigneeId: CURRENT_ADMIN.id,
        assigneeName: CURRENT_ADMIN.name,
      });
      appendKycAudit({
        reviewId: r.id,
        action: 'approve',
        actorId: CURRENT_ADMIN.id,
        actorName: CURRENT_ADMIN.name,
        context: { bulk: true },
      });
      approved++;
    }

    const skipped = underAge + sanctions;
    if (skipped === 0) {
      toast.success(
        t('admin.kyc-queue.bulk.approve.result', { approved, skipped: 0 }),
      );
    } else {
      toast.warning(
        t('admin.kyc-queue.bulk.approve.result', { approved, skipped }),
        {
          description: t('admin.kyc-queue.bulk.approve.result-detail', {
            underAge,
            sanctions,
          }),
        },
      );
    }
    // Keep blocked rows still selected so reviewer addresses them.
    setSelectedIds(
      new Set(
        selected
          .filter((r) => approveBlocked(r) !== null && r.status === 'pending')
          .map((r) => r.id),
      ),
    );
  };

  const handleBulkAssignMe = () => {
    const ids = Array.from(selectedIds);
    setReviews((prev) =>
      prev.map((r) =>
        ids.includes(r.id)
          ? {
              ...r,
              assigneeId: CURRENT_ADMIN.id,
              assigneeName: CURRENT_ADMIN.name,
              claimedAt: r.claimedAt ?? new Date(),
            }
          : r,
      ),
    );
    for (const id of ids) {
      appendKycAudit({
        reviewId: id,
        action: 'claim',
        actorId: CURRENT_ADMIN.id,
        actorName: CURRENT_ADMIN.name,
        context: { bulk: true },
      });
    }
    toast.success(`Assigned ${ids.length} verification${ids.length === 1 ? '' : 's'} to you`);
    setSelectedIds(new Set());
  };

  const clearSelection = () => setSelectedIds(new Set());

  // --- Page-scoped keyboard shortcuts ---
  // Only fire when not typing, only when this page is mounted, only on lg+.
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
      // Disable hotkeys on touch viewports — spec says mobile is touch-only.
      if (window.matchMedia('(max-width: 1023px)').matches) return;

      // Modifier-free single keys
      switch (e.key) {
        case 'j': {
          e.preventDefault();
          if (visibleReviews.length === 0) return;
          const next = Math.min(focusedIndex + 1, visibleReviews.length - 1);
          setFocusedIndex(next);
          // Auto-select the focused row to keep detail in sync.
          const target = visibleReviews[next];
          if (target) navigate(`/operations/kyc-queue/${target.id}`, { replace: true });
          return;
        }
        case 'k': {
          e.preventDefault();
          if (visibleReviews.length === 0) return;
          const next = Math.max(focusedIndex - 1, 0);
          setFocusedIndex(next);
          const target = visibleReviews[next];
          if (target) navigate(`/operations/kyc-queue/${target.id}`, { replace: true });
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
        case 'a': {
          if (!selectedReview || selectedReview.status !== 'pending') return;
          if (approveBlocked(selectedReview)) return;
          e.preventDefault();
          setApproveOpen(true);
          return;
        }
        case 'r': {
          if (!selectedReview || selectedReview.status !== 'pending') return;
          e.preventDefault();
          setRejectOpen(true);
          return;
        }
        case 'i': {
          if (!selectedReview || selectedReview.status !== 'pending') return;
          e.preventDefault();
          setRequestInfoOpen(true);
          return;
        }
        case 'e': {
          if (!selectedReview || selectedReview.status !== 'pending') return;
          e.preventDefault();
          setEscalateOpen(true);
          return;
        }
        case 'm': {
          e.preventDefault();
          setFilters((prev) => ({
            ...prev,
            assigned: prev.assigned === 'me' ? 'anyone' : 'me',
          }));
          return;
        }
        default:
          return;
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [focusedIndex, visibleReviews, selectedReview, navigate, selectRow]);

  // Keep focusedIndex in bounds when filters change.
  useEffect(() => {
    if (focusedIndex >= visibleReviews.length) {
      setFocusedIndex(visibleReviews.length - 1);
    }
  }, [visibleReviews.length, focusedIndex]);

  // --- Mobile back ---
  const onMobileBack = () => navigate('/operations/kyc-queue');

  // ===================================================================
  // Render
  // ===================================================================

  // On mobile, the URL drives whether we show list or detail.
  const showListMobile = !idFromUrl;
  const showDetailMobile = !!idFromUrl;

  // The master-detail layout uses fixed page height so each pane scrolls
  // independently. Math: 100dvh − TopBar (3.5rem) − main padding
  // (2rem mobile / 3rem desktop). This puts the content exactly inside
  // main's content box; main's overflow-y-auto stays inactive.
  return (
    <div className="flex flex-col gap-4 lg:h-[calc(100dvh-6.5rem)]">
      {/* Page header — matches Overview/Transfers (text-2xl + subtitle below + action group right) */}
      <header
        className={cn(
          'flex flex-col gap-3 md:flex-row md:items-end md:justify-between shrink-0',
          showDetailMobile && 'hidden lg:flex',
        )}
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('admin.kyc-queue.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 tabular">
            {t('admin.kyc-queue.subtitle.counts', {
              pending: counts.pending,
              reviewing: counts.reviewing,
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AssigneeQuickToggle
            value={filters.assigned}
            onChange={(next) =>
              setFilters((prev) => ({ ...prev, assigned: next }))
            }
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefreshTick((n) => n + 1)}
            aria-label={t('admin.kyc-queue.refresh')}
            className="h-9"
          >
            <RotateCw className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
            {t('admin.kyc-queue.refresh')}
          </Button>
        </div>
      </header>

      {/* Filter chips — inline row, no own bg/border */}
      <div className={cn('shrink-0', showDetailMobile && 'hidden lg:block')}>
        <KycFilterBar
          filters={filters}
          setFilters={setFilters}
          loading={loading}
        />
      </div>

      {/* Master + detail body — wrapped as a card so it visually matches the rest of the dashboard */}
      <div className="rounded-lg border border-border bg-background overflow-hidden lg:flex lg:flex-1 lg:min-h-0">
        {/* List pane (left on desktop, full-width on mobile when no id) */}
        <div
          className={cn(
            'flex flex-col min-w-0',
            showListMobile ? 'flex-1' : 'hidden',
            'lg:flex lg:flex-none lg:w-[480px] lg:border-r lg:border-border',
          )}
        >
          <KycListPane
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
            onBulkApprove={handleBulkApprove}
            onBulkReject={() => {
              // For simple v1 — single-row reject modal handles the most
              // common case (reject one). Bulk reject is reachable via
              // selecting the focused row; tracked as future polish.
              toast.info('Bulk reject — coming soon. Reject rows one at a time for now.');
            }}
            onBulkAssignMe={handleBulkAssignMe}
            onClearSelection={clearSelection}
            loading={loading}
            hasError={false}
            onRetry={() => setRefreshTick((n) => n + 1)}
            totalCount={reviews.length}
          />
        </div>

        {/* Detail pane (right on desktop, full on mobile when id is set) */}
        <div
          className={cn(
            'flex flex-col flex-1 min-w-0',
            showDetailMobile ? 'flex' : 'hidden',
            'lg:flex',
          )}
        >
          {/* Mobile back bar — only when on detail */}
          {showDetailMobile && (
            <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-2 lg:hidden shrink-0">
              <Button variant="ghost" size="sm" onClick={onMobileBack}>
                <ArrowLeft className="h-4 w-4 mr-1.5" aria-hidden="true" />
                {t('admin.kyc-queue.mobile.back')}
              </Button>
            </div>
          )}

          <KycDetailPane
            review={selectedReview}
            onApprove={() => setApproveOpen(true)}
            onReject={() => setRejectOpen(true)}
            onRequestInfo={() => setRequestInfoOpen(true)}
            onEscalate={() => setEscalateOpen(true)}
            onOpenUser={() => {
              if (selectedReview) navigate(`/users?focus=${selectedReview.userId}`);
            }}
            variant="desktop"
          />
        </div>
      </div>

      {/* Modals */}
      {selectedReview && (
        <>
          <ApproveDialog
            open={approveOpen}
            onOpenChange={setApproveOpen}
            phone={selectedReview.userPhone}
            resultingTierLabel={t('admin.kyc-queue.tier-promotion.tier_2')}
            onConfirm={() => {
              setApproveOpen(false);
              handleApprove();
            }}
          />
          <RejectDialog
            open={rejectOpen}
            onOpenChange={setRejectOpen}
            prefillFailureReason={
              selectedReview.edgeFlag === 'under_18'
                ? 'under_18'
                : selectedReview.edgeFlag === 'sanctions_hit'
                  ? 'sanctions_hit'
                  : selectedReview.edgeFlag === 'data_mismatch'
                    ? 'data_mismatch'
                    : undefined
            }
            onSubmit={handleReject}
          />
          <RequestInfoDialog
            open={requestInfoOpen}
            onOpenChange={setRequestInfoOpen}
            onSubmit={handleRequestInfo}
          />
          <EscalateDialog
            open={escalateOpen}
            onOpenChange={setEscalateOpen}
            onSubmit={handleEscalate}
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
        {t('admin.kyc-queue.assignee.all')}
      </Button>
      <Button
        variant={isMe ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onChange('me')}
        className="h-7 rounded-sm"
      >
        {t('admin.kyc-queue.assignee.me')}
      </Button>
    </div>
  );
}
