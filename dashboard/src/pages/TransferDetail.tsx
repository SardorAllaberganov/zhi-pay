import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileText,
  Inbox,
  RefreshCw,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Money } from '@/components/zhipay/Money';
import { StatusBadge } from '@/components/zhipay/StatusBadge';
import { StatusTimeline } from '@/components/zhipay/StatusTimeline';
import { FxFeesCard } from '@/components/transfer-detail/cards/FxFeesCard';
import { SenderCard } from '@/components/transfer-detail/cards/SenderCard';
import { RecipientCard } from '@/components/transfer-detail/cards/RecipientCard';
import { CardUsedCard } from '@/components/transfer-detail/cards/CardUsedCard';
import { AmlFlagsCard } from '@/components/transfer-detail/cards/AmlFlagsCard';
import { InternalNotesCard } from '@/components/transfer-detail/cards/InternalNotesCard';
import { ProviderResponseCard } from '@/components/transfer-detail/cards/ProviderResponseCard';
import { AdminActionHistoryCard } from '@/components/transfer-detail/cards/AdminActionHistoryCard';
import { RightRail } from '@/components/transfer-detail/RightRail';
import { MobileActionBar } from '@/components/transfer-detail/MobileActionBar';
import { AddNoteDialog, type AddNoteSubmit } from '@/components/transfer-detail/modals/AddNoteDialog';
import {
  ResendWebhookDialog,
  type ResendWebhookSubmit,
} from '@/components/transfer-detail/modals/ResendWebhookDialog';
import {
  ForceFailDialog,
  type ForceFailSubmit,
} from '@/components/transfer-detail/modals/ForceFailDialog';
import {
  MarkCompletedDialog,
  type MarkCompletedSubmit,
} from '@/components/transfer-detail/modals/MarkCompletedDialog';
import {
  ReverseDialog,
  type ReverseSubmit,
} from '@/components/transfer-detail/modals/ReverseDialog';
import {
  RefundPartialDialog,
  type RefundSubmit,
} from '@/components/transfer-detail/modals/RefundPartialDialog';
import {
  STUCK_MS,
  type DetailActionKey,
} from '@/components/transfer-detail/ActionMenu';
import {
  TRANSFERS_FULL,
  getEventsForTransfer,
  getAmlFlagsForTransfer,
} from '@/data/mockTransfers';
import {
  computeNeighbors,
  getTransferDetail,
  type AdminActionEntry,
  type AdminActionType,
  type InternalNote,
  type PagerNeighbors,
  type TransferDetailBundle,
} from '@/data/mockTransferDetail';
import {
  applyFilters,
  sortTransfers,
  type SortState,
  type TransferFilters,
} from '@/components/transfers/types';
import { readTransfersState } from '@/components/transfers/filterState';
import { cn, formatDateTime, formatMoney, formatNumber, formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type {
  Transfer,
  TransferEvent,
  TransferStatus,
} from '@/types';

const TRANSFERS_BASE = '/operations/transfers';

// Anchor "now" so the prototype renders consistently with the seeded dataset.
const NOW = new Date('2026-04-29T10:30:00Z');

export function TransferDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Skeleton on initial mount and on pager nav (id change).
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const tid = window.setTimeout(() => setLoading(false), 600);
    return () => window.clearTimeout(tid);
  }, [id]);

  // Mock-only state — admin actions mutate locally so the UI reflects them.
  // Reset on every navigation so back-and-forth doesn't bleed state across rows.
  const [statusOverride, setStatusOverride] = useState<TransferStatus | null>(null);
  const [appendedEvents, setAppendedEvents] = useState<TransferEvent[]>([]);
  const [appendedNotes, setAppendedNotes] = useState<InternalNote[]>([]);
  const [appendedActions, setAppendedActions] = useState<AdminActionEntry[]>([]);
  const [activeModal, setActiveModal] = useState<DetailActionKey | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [realtimeHealthy, setRealtimeHealthy] = useState(true);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    setStatusOverride(null);
    setAppendedEvents([]);
    setAppendedNotes([]);
    setAppendedActions([]);
    setActiveModal(null);
    setCopiedId(false);
  }, [id]);

  const bundle = useMemo<TransferDetailBundle | null>(
    () => (id ? getTransferDetail(id) : null),
    [id],
  );

  const baseTransfer = bundle?.transfer ?? null;
  const effectiveTransfer = useMemo<Transfer | null>(() => {
    if (!baseTransfer) return null;
    return statusOverride
      ? { ...baseTransfer, status: statusOverride }
      : baseTransfer;
  }, [baseTransfer, statusOverride]);

  const mergedEvents = useMemo<TransferEvent[]>(() => {
    if (!bundle) return [];
    return [...bundle.events, ...appendedEvents].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
  }, [bundle, appendedEvents]);

  const mergedNotes = useMemo<InternalNote[]>(() => {
    if (!bundle) return [];
    return [...appendedNotes, ...bundle.internalNotes];
  }, [bundle, appendedNotes]);

  const mergedActions = useMemo<AdminActionEntry[]>(() => {
    if (!bundle) return [];
    return [...appendedActions, ...bundle.adminActions].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }, [bundle, appendedActions]);

  // Live stuck-detection — drives Force-fail promotion & "Stuck for Xm" chip.
  const stuckMs = useMemo(() => {
    if (!effectiveTransfer) return 0;
    if (effectiveTransfer.status !== 'processing') return 0;
    let last = 0;
    for (const ev of mergedEvents) {
      if (ev.toStatus === 'processing') {
        last = Math.max(last, ev.createdAt.getTime());
      }
    }
    const baseline = last || effectiveTransfer.createdAt.getTime();
    return Math.max(0, NOW.getTime() - baseline);
  }, [effectiveTransfer, mergedEvents]);

  // ---------- Pager (j/k between filtered list) ----------
  const pager = usePager(id, searchParams);

  // ---------- Real-time refresh simulation ----------
  useEffect(() => {
    if (!effectiveTransfer) return;
    if (effectiveTransfer.status !== 'processing') return;
    const tid = window.setInterval(() => {
      // 25% chance per tick to advance to completed.
      if (Math.random() < 0.25) {
        const newEvent: TransferEvent = {
          id: `e_local_${Date.now()}`,
          transferId: effectiveTransfer.id,
          fromStatus: 'processing',
          toStatus: 'completed',
          actor: 'provider',
          context: {
            simulated: true,
            external_tx_id: effectiveTransfer.externalTxId,
          },
          createdAt: new Date(),
        };
        setAppendedEvents((prev) => [...prev, newEvent]);
        setStatusOverride('completed');
        setToast(
          t('admin.transfer-detail.timeline.live-update-toast', {
            from: 'processing',
            to: 'completed',
          }),
        );
      }
    }, 10_000);
    return () => window.clearInterval(tid);
  }, [effectiveTransfer]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const tid = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(tid);
  }, [toast]);

  // ---------- Action submit handlers ----------
  const recordAdminAction = useCallback(
    (type: AdminActionType, reason: string) => {
      if (!effectiveTransfer) return;
      const entry: AdminActionEntry = {
        id: `act_local_${Date.now()}`,
        transferId: effectiveTransfer.id,
        type,
        actorName: 'You',
        actorInitials: 'YO',
        reason,
        createdAt: new Date(),
      };
      setAppendedActions((prev) => [entry, ...prev]);
    },
    [effectiveTransfer],
  );

  const appendEvent = useCallback(
    (toStatus: TransferStatus, fromStatus: TransferStatus, ctx: Record<string, unknown>) => {
      if (!effectiveTransfer) return;
      const ev: TransferEvent = {
        id: `e_local_${Date.now()}`,
        transferId: effectiveTransfer.id,
        fromStatus,
        toStatus,
        actor: 'admin',
        context: ctx,
        createdAt: new Date(),
      };
      setAppendedEvents((prev) => [...prev, ev]);
    },
    [effectiveTransfer],
  );

  const onAddNote = useCallback(
    (payload: AddNoteSubmit) => {
      if (!effectiveTransfer) return;
      const note: InternalNote = {
        id: `note_local_${Date.now()}`,
        transferId: effectiveTransfer.id,
        authorName: 'You',
        authorInitials: 'YO',
        authorRole: 'Operations',
        tag: payload.tag,
        body: payload.body,
        createdAt: new Date(),
      };
      setAppendedNotes((prev) => [note, ...prev]);
      recordAdminAction('note_added', `Tagged ${payload.tag}. ${payload.body.slice(0, 80)}`);
      setToast(
        t('admin.transfer-detail.action.toast.success', {
          action: t('admin.transfer-detail.action.add-note'),
        }),
      );
    },
    [effectiveTransfer, recordAdminAction],
  );

  const onResendWebhook = useCallback(
    (payload: ResendWebhookSubmit) => {
      if (!effectiveTransfer) return;
      recordAdminAction('webhook_resent', payload.reason);
      // No state transition on resend by itself.
      setToast(
        t('admin.transfer-detail.action.toast.success', {
          action: t('admin.transfer-detail.action.resend-webhook'),
        }),
      );
    },
    [effectiveTransfer, recordAdminAction],
  );

  const onForceFail = useCallback(
    (payload: ForceFailSubmit) => {
      if (!effectiveTransfer) return;
      const from: TransferStatus = effectiveTransfer.status;
      setStatusOverride('failed');
      appendEvent('failed', from, {
        force_failed: true,
        failure_code: payload.failureCode,
        reason: payload.reason,
        notify_user: payload.notifyUser,
      });
      recordAdminAction('force_failed', payload.reason);
      setToast(
        t('admin.transfer-detail.action.toast.success', {
          action: t('admin.transfer-detail.action.force-fail'),
        }),
      );
    },
    [effectiveTransfer, appendEvent, recordAdminAction],
  );

  const onMarkCompleted = useCallback(
    (payload: MarkCompletedSubmit) => {
      if (!effectiveTransfer) return;
      const from: TransferStatus = effectiveTransfer.status;
      setStatusOverride('completed');
      appendEvent('completed', from, {
        manual_completion: true,
        provider_tx_id: payload.providerTxId,
        reason: payload.reason,
      });
      recordAdminAction('marked_completed', payload.reason);
      setToast(
        t('admin.transfer-detail.action.toast.success', {
          action: t('admin.transfer-detail.action.mark-completed'),
        }),
      );
    },
    [effectiveTransfer, appendEvent, recordAdminAction],
  );

  const onReverse = useCallback(
    (payload: ReverseSubmit) => {
      if (!effectiveTransfer) return;
      const from: TransferStatus = effectiveTransfer.status;
      setStatusOverride('reversed');
      appendEvent('reversed', from, {
        reason: payload.reason,
        target: payload.recipient,
      });
      recordAdminAction('reversed', payload.reason);
      setToast(
        t('admin.transfer-detail.action.toast.success', {
          action: t('admin.transfer-detail.action.reverse'),
        }),
      );
    },
    [effectiveTransfer, appendEvent, recordAdminAction],
  );

  const onRefund = useCallback(
    (payload: RefundSubmit) => {
      if (!effectiveTransfer) return;
      // Partial refund does NOT change status — original transfer remains completed.
      recordAdminAction(
        'refunded',
        `${formatMoney(payload.amountTiyins, 'UZS')} — ${payload.reason}`,
      );
      setToast(
        t('admin.transfer-detail.action.toast.success', {
          action: t('admin.transfer-detail.action.refund'),
        }),
      );
    },
    [effectiveTransfer, recordAdminAction],
  );

  // ---------- Keyboard shortcuts ----------
  useEffect(() => {
    const tr = effectiveTransfer;
    if (!tr) return;
    function onKey(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (!tr) return;

      const k = e.key;
      // pager
      if (k === 'j' && pager?.nextId) {
        e.preventDefault();
        navigate(`${TRANSFERS_BASE}/${pager.nextId}`);
        return;
      }
      if (k === 'k' && pager?.prevId) {
        e.preventDefault();
        navigate(`${TRANSFERS_BASE}/${pager.prevId}`);
        return;
      }
      // back
      if (k === 'b' || k === 'Backspace') {
        e.preventDefault();
        navigate(TRANSFERS_BASE);
        return;
      }
      // copy id
      if (k === 'c') {
        e.preventDefault();
        copyTransferId();
        return;
      }
      // user nav
      if (k === 'u' && bundle?.user) {
        e.preventDefault();
        navigate(`/customers/users/${tr.userId}`);
        return;
      }
      // action shortcuts
      if (k === 'n') {
        e.preventDefault();
        setActiveModal('add-note');
        return;
      }
      if (k === 'r' && tr.status === 'completed') {
        e.preventDefault();
        setActiveModal('reverse');
        return;
      }
      if (k === 'f' && (tr.status === 'created' || tr.status === 'processing')) {
        e.preventDefault();
        setActiveModal('force-fail');
        return;
      }
      if (k === 'm' && tr.status === 'processing') {
        e.preventDefault();
        setActiveModal('mark-completed');
        return;
      }
      if (k === 'w' && (tr.status === 'processing' || tr.status === 'failed')) {
        e.preventDefault();
        setActiveModal('resend-webhook');
        return;
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveTransfer, pager, bundle]);

  function copyTransferId() {
    if (!effectiveTransfer) return;
    if (!navigator.clipboard?.writeText) return;
    navigator.clipboard.writeText(effectiveTransfer.id);
    setCopiedId(true);
    window.setTimeout(() => setCopiedId(false), 1500);
  }

  // ---------- Render: 404 / loading / page ----------

  if (loading) {
    return <DetailSkeleton />;
  }

  if (!bundle || !effectiveTransfer) {
    return <NotFoundState onBack={() => navigate(TRANSFERS_BASE)} />;
  }

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div
          role="status"
          className="fixed top-4 right-4 z-40 max-w-sm rounded-md border border-success-600/30 bg-success-50 px-4 py-2 text-sm text-success-700 shadow-lg dark:bg-success-700/15 dark:text-success-600"
        >
          {toast}
        </div>
      )}

      {/* Realtime feed lost banner (defensive — not currently triggered) */}
      {!realtimeHealthy && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-md border border-warning-600/30 bg-warning-50 px-3 py-2 text-sm dark:bg-warning-700/15"
        >
          <div className="flex items-start gap-2 text-warning-700 dark:text-warning-600">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {t('admin.transfer-detail.timeline.realtime-lost-banner')}
          </div>
          <Button variant="outline" size="sm" onClick={() => setRealtimeHealthy(true)}>
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            {t('admin.transfer-detail.timeline.realtime-retry')}
          </Button>
        </div>
      )}

      {/* Zone 1 — Page header (NOT sticky per project direction) */}
      <DetailHeader
        transfer={effectiveTransfer}
        copiedId={copiedId}
        onCopyId={copyTransferId}
        onBack={() => navigate(TRANSFERS_BASE)}
        backLabel={pagerBackLabel(searchParams)}
        pager={pager}
        feeUzs={effectiveTransfer.feeUzs + effectiveTransfer.fxSpreadUzs}
        onPagerPrev={() => pager?.prevId && navigate(`${TRANSFERS_BASE}/${pager.prevId}`)}
        onPagerNext={() => pager?.nextId && navigate(`${TRANSFERS_BASE}/${pager.nextId}`)}
        onOpenUser={() => navigate(`/customers/users/${effectiveTransfer.userId}`)}
        onOpenAudit={() => navigate(`/audit-log?entity=transfer&id=${effectiveTransfer.id}`)}
        userDeleted={bundle.senderDeleted}
      />

      {/* Zone 2 — Body grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left column — primary content. `flex flex-col gap-4` (not space-y)
            so the hidden-on-lg tablet timeline doesn't add a phantom 16px
            margin above the FX card on desktop. */}
        <div className="lg:col-span-8 flex flex-col gap-4 min-w-0">
          {/* Tablet (md → lg): timeline pinned just below the headline */}
          <div className="lg:hidden">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {t('admin.transfer-detail.timeline.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <StatusTimeline events={mergedEvents} domain="transfer" />
              </CardContent>
            </Card>
          </div>

          <FxFeesCard transfer={effectiveTransfer} />
          <SenderCard
            user={bundle.user}
            deleted={bundle.senderDeleted}
            pinflLast4Fallback={effectiveTransfer.userId.slice(-4)}
            userPhoneFallback={effectiveTransfer.userPhone}
            userNameFallback={effectiveTransfer.userName}
            lifetime={bundle.userLifetime}
            onOpenUser={(uid) => navigate(`/customers/users/${uid}`)}
          />
          <RecipientCard
            destination={effectiveTransfer.destination}
            identifier={effectiveTransfer.recipientIdentifier}
            recipientTransferCount={bundle.recipientTransferCount}
            recipientDeleted={bundle.recipientDeleted}
            onOpenRecipient={() =>
              navigate(`/recipients?identifier=${encodeURIComponent(effectiveTransfer.recipientIdentifier)}`)
            }
          />
          <CardUsedCard
            card={bundle.card}
            cardRemoved={bundle.cardRemoved}
            schemeFallback={effectiveTransfer.cardScheme}
            maskedPanFallback={effectiveTransfer.cardMaskedPan}
            bankFallback={effectiveTransfer.cardBank}
            holderName={effectiveTransfer.userName}
            onOpenCard={(cid) => navigate(`/customers/cards/${cid}`)}
          />
          <AmlFlagsCard
            flags={bundle.amlFlags}
            onOpenFlag={(flagId) => navigate(`/operations/aml-triage/${flagId}`)}
          />
          <InternalNotesCard
            notes={mergedNotes}
            onAdd={() => setActiveModal('add-note')}
          />
          {bundle.providerResponse && (
            <ProviderResponseCard
              providerResponse={bundle.providerResponse}
              transferStatus={effectiveTransfer.status}
            />
          )}
          <AdminActionHistoryCard
            actions={mergedActions}
            onViewFullAudit={() =>
              navigate(`/audit-log?entity=transfer&id=${effectiveTransfer.id}`)
            }
          />
        </div>

        {/* Right column — desktop sticky rail */}
        <aside className="lg:col-span-4 min-w-0">
          <RightRail
            transfer={effectiveTransfer}
            events={mergedEvents}
            stuckMs={stuckMs}
            onAction={(k) => setActiveModal(k)}
          />
        </aside>
      </div>

      {/* Zone 3 — mobile sticky bottom action bar */}
      <MobileActionBar
        transfer={effectiveTransfer}
        events={mergedEvents}
        stuckMs={stuckMs}
        onAction={(k) => setActiveModal(k)}
      />

      {/* Modals */}
      <AddNoteDialog
        open={activeModal === 'add-note'}
        onOpenChange={(o) => !o && setActiveModal(null)}
        onSubmit={onAddNote}
      />
      <ResendWebhookDialog
        open={activeModal === 'resend-webhook'}
        onOpenChange={(o) => !o && setActiveModal(null)}
        provider={effectiveTransfer.destination}
        externalTxId={effectiveTransfer.externalTxId ?? '—'}
        onSubmit={onResendWebhook}
      />
      <ForceFailDialog
        open={activeModal === 'force-fail'}
        onOpenChange={(o) => !o && setActiveModal(null)}
        onSubmit={onForceFail}
      />
      <MarkCompletedDialog
        open={activeModal === 'mark-completed'}
        onOpenChange={(o) => !o && setActiveModal(null)}
        amountCnyFen={effectiveTransfer.amountCny}
        onSubmit={onMarkCompleted}
      />
      <ReverseDialog
        open={activeModal === 'reverse'}
        onOpenChange={(o) => !o && setActiveModal(null)}
        userId={effectiveTransfer.userId}
        sourceCardId={effectiveTransfer.cardId}
        sourceCardScheme={effectiveTransfer.cardScheme}
        sourceCardMaskedPan={effectiveTransfer.cardMaskedPan}
        amountUzsTiyins={effectiveTransfer.amountUzs}
        onSubmit={onReverse}
      />
      <RefundPartialDialog
        open={activeModal === 'refund'}
        onOpenChange={(o) => !o && setActiveModal(null)}
        userId={effectiveTransfer.userId}
        sourceCardId={effectiveTransfer.cardId}
        sourceCardScheme={effectiveTransfer.cardScheme}
        sourceCardMaskedPan={effectiveTransfer.cardMaskedPan}
        originalAmountTiyins={effectiveTransfer.amountUzs}
        onSubmit={onRefund}
      />
    </div>
  );
}

// ====================================================================
// Header
// ====================================================================

interface DetailHeaderProps {
  transfer: Transfer;
  copiedId: boolean;
  onCopyId: () => void;
  onBack: () => void;
  backLabel: string;
  pager: PagerNeighbors | null;
  feeUzs: bigint;
  onPagerPrev: () => void;
  onPagerNext: () => void;
  onOpenUser: () => void;
  onOpenAudit: () => void;
  userDeleted: boolean;
}

function DetailHeader({
  transfer,
  copiedId,
  onCopyId,
  onBack,
  backLabel,
  pager,
  feeUzs,
  onPagerPrev,
  onPagerNext,
  onOpenUser,
  onOpenAudit,
  userDeleted,
}: DetailHeaderProps) {
  const idPreview = transfer.id.length > 12 ? `${transfer.id.slice(0, 12)}…` : transfer.id;

  return (
    <header className="space-y-3 lg:space-y-4">
      {/* Row 1 — back + pager */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {backLabel}
        </button>

        <div className="flex items-center gap-2">
          {pager ? (
            <>
              <span className="text-xs text-muted-foreground tabular bg-muted/50 rounded-full px-2.5 py-1">
                {t('admin.transfer-detail.pager.position', {
                  position: pager.position,
                  total: pager.total,
                })}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!pager.prevId}
                onClick={onPagerPrev}
                aria-label={t('admin.transfer-detail.pager.prev')}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pager.nextId}
                onClick={onPagerNext}
                aria-label={t('admin.transfer-detail.pager.next')}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/70 cursor-help">
                    <ChevronLeft className="h-3.5 w-3.5 opacity-50" />
                    <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  {t('admin.transfer-detail.pager.disabled-tooltip')}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Row 2 — identity */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <StatusBadge status={transfer.status} domain="transfer" />
          <button
            type="button"
            onClick={onCopyId}
            className="inline-flex items-center gap-1.5 rounded-sm font-mono tabular text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title={transfer.id}
          >
            <span>{transfer.id.split('').slice(0, 12).join('')}</span>
            {copiedId ? (
              <Check className="h-3.5 w-3.5 text-success-600" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
          <span
            className="text-sm text-muted-foreground tabular"
            title={formatDateTime(transfer.createdAt)}
          >
            {formatRelative(transfer.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!userDeleted && (
            <Button
              variant="outline"
              onClick={onOpenUser}
              className="gap-2"
            >
              <UserIcon className="h-4 w-4" aria-hidden="true" />
              {t('admin.transfer-detail.header.open-user')}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onOpenAudit}
            className="gap-2"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            {t('admin.transfer-detail.header.open-audit')}
          </Button>
        </div>
      </div>

      {/* Row 3 — headline numbers */}
      <div className="flex items-end justify-between gap-3 flex-wrap pt-1">
        <div className="space-y-1 min-w-0">
          <div className="flex items-baseline gap-3 flex-wrap text-2xl lg:text-3xl">
            <Money amount={transfer.amountUzs} currency="UZS" className="font-semibold" />
            <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />
            <Money amount={transfer.amountCny} currency="CNY" className="font-semibold" />
          </div>
          <div className="text-sm text-muted-foreground tabular">
            {t('admin.transfer-detail.header.locked-rate', {
              rate: formatNumber(transfer.clientRate, 2),
            })}
          </div>
        </div>
        <div className="text-sm text-muted-foreground tabular">
          {t('admin.transfer-detail.header.total-fees', {
            amount: formatMoney(feeUzs, 'UZS'),
          })}
        </div>
      </div>
    </header>
  );
}

// ====================================================================
// Pager hook — reads cached list state to compute neighbors
// ====================================================================

function usePager(currentId: string | undefined, search: URLSearchParams) {
  return useMemo<PagerNeighbors | null>(() => {
    if (!currentId) return null;
    const ctx = search.get('context');
    if (ctx === 'aml') {
      // AML detail navigation has no list context.
      return null;
    }
    if (ctx === 'user') {
      const userId = search.get('user_id');
      if (!userId) return null;
      const ids = TRANSFERS_FULL.filter((t) => t.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((t) => t.id);
      return computeNeighbors(currentId, ids);
    }
    // Default: read transfers-list cache
    const cache = readTransfersState();
    if (!cache) return null;
    const filters: TransferFilters = cache.filters;
    const sort: SortState = cache.sort;
    const filtered = applyFilters(
      TRANSFERS_FULL,
      filters,
      (id) => getAmlFlagsForTransfer(id).length > 0,
    );
    const sorted = sortTransfers(filtered, sort);
    return computeNeighbors(currentId, sorted.map((t) => t.id));
  }, [currentId, search]);
}

function pagerBackLabel(search: URLSearchParams): string {
  const ctx = search.get('context');
  if (ctx === 'aml') return t('admin.transfer-detail.back-link.aml');
  if (ctx === 'user') {
    const userName = search.get('user_name');
    if (userName) return t('admin.transfer-detail.back-link.user', { name: userName });
  }
  return t('admin.transfer-detail.back-link.list');
}

// ====================================================================
// Skeleton + Not-found
// ====================================================================

function DetailSkeleton() {
  return (
    <div className="space-y-4 lg:space-y-6">
      <header className="space-y-3 lg:space-y-4">
        <div className="flex justify-between gap-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex items-end justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-9 w-[420px]" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        <div className="lg:col-span-8 space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="lg:col-span-4 space-y-4">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}

function NotFoundState({ onBack }: { onBack: () => void }) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-16 gap-4')}>
      <Inbox className="h-12 w-12 text-muted-foreground/60" aria-hidden="true" />
      <div>
        <div className="text-base font-semibold">
          {t('admin.transfer-detail.error.not-found.title')}
        </div>
        <div className="mt-1 text-sm text-muted-foreground max-w-md">
          {t('admin.transfer-detail.error.not-found.body')}
        </div>
      </div>
      <Button onClick={onBack}>
        {t('admin.transfer-detail.error.not-found.cta')}
      </Button>
    </div>
  );
}

const TYPING_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (TYPING_TAGS.includes(target.tagName)) return true;
  if (target.isContentEditable) return true;
  return false;
}

// silence unused-event import in some setups (TransferEvent already used above)
void getEventsForTransfer;
