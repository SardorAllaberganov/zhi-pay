import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  RotateCw,
  ShieldAlert,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Money } from '@/components/zhipay/Money';
import { MaskedPan } from '@/components/zhipay/MaskedPan';
import { StatusBadge } from '@/components/zhipay/StatusBadge';
import { TierBadge } from '@/components/zhipay/TierBadge';
import { DestinationBadge } from '@/components/zhipay/DestinationBadge';
import { SeverityBadge } from '@/components/zhipay/SeverityBadge';
import { ErrorCell } from '@/components/zhipay/ErrorCell';
import {
  cn,
  formatDateTime,
  formatNumber,
  formatRelative,
  maskPinfl,
  statusLabel,
  statusToTone,
  toneClasses,
} from '@/lib/utils';
import { t } from '@/lib/i18n';
import { USERS, FX_RATES } from '@/data/mock';
import {
  getAmlFlagsForTransfer,
  getEventsForTransfer,
  getTransferById,
} from '@/data/mockTransfers';
import type { Transfer, TransferEvent, TransferStatus } from '@/types';

type ActionKey = 'reverse' | 'force-fail';

const TRANSFERS_BASE = '/operations/transfers';

export function TransferDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const transfer = id ? getTransferById(id) : undefined;

  // Local mutable state — admin actions update the transfer in place for the
  // mock prototype. Backend integration takes over when API lands.
  const [statusOverride, setStatusOverride] = useState<TransferStatus | null>(null);
  const [appendedEvents, setAppendedEvents] = useState<TransferEvent[]>([]);

  const events = useMemo(() => {
    if (!transfer) return [];
    return [...getEventsForTransfer(transfer.id), ...appendedEvents].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
  }, [transfer, appendedEvents]);

  const aml = useMemo(() => (transfer ? getAmlFlagsForTransfer(transfer.id) : []), [transfer]);

  // Action dialog state
  const [activeAction, setActiveAction] = useState<ActionKey | null>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Auto-open dialog when ?action=reverse|force-fail comes from list-page menu
  useEffect(() => {
    const a = searchParams.get('action');
    if (a === 'reverse' || a === 'force-fail') {
      setActiveAction(a as ActionKey);
      const next = new URLSearchParams(searchParams);
      next.delete('action');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // ----- Keyboard shortcuts -----
  // b / Backspace → back to list
  // r → reverse (when status=completed)
  // c → copy transfer id
  // u → open user profile
  // Esc → does nothing (per spec, no overlay to dismiss except action dialog)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Inside the action dialog the textarea handles its own Esc / typing.
      if (isTypingContext(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (activeAction) return; // dialog open — let Radix handle keys

      if (e.key === 'b' || e.key === 'Backspace') {
        e.preventDefault();
        navigate(TRANSFERS_BASE);
        return;
      }
      if (e.key === 'c' && transfer) {
        e.preventDefault();
        copyId(transfer.id);
        setToast(t('admin.transfers.action.success.id-copied'));
        return;
      }
      if (e.key === 'u' && transfer) {
        e.preventDefault();
        navigate(`/customers/users/${transfer.userId}`);
        return;
      }
      if (e.key === 'r' && transfer) {
        const status = statusOverride ?? transfer.status;
        if (status === 'completed') {
          e.preventDefault();
          setActiveAction('reverse');
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transfer, statusOverride, activeAction]);

  // ----- Not found -----
  if (!transfer) {
    return (
      <div className="space-y-4">
        <BackLink />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <AlertTriangle className="h-8 w-8 text-warning-700 mb-3" aria-hidden="true" />
            <div className="text-sm font-medium">
              {t('admin.transfers.detail.not-found.title')}
            </div>
            <div className="text-sm text-muted-foreground mt-1 max-w-md">
              {t('admin.transfers.detail.not-found.body')}
            </div>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate(TRANSFERS_BASE)}>
              {t('admin.transfers.detail.back-to-list')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sender = USERS.find((u) => u.id === transfer.userId);
  const fx = FX_RATES.find((f) => f.pair === 'UZS_CNY');
  const status: TransferStatus = statusOverride ?? transfer.status;
  const ageMs = Date.now() - transfer.createdAt.getTime();
  const stuck = status === 'processing' && ageMs > 10 * 60 * 1000;

  // ----- Action confirmation -----
  function confirmAction() {
    if (!activeAction || !transfer) return;
    if (reason.trim().length < 10) {
      setReasonError(t('admin.transfers.action.reason-too-short'));
      return;
    }
    const newStatus: TransferStatus = activeAction === 'reverse' ? 'reversed' : 'failed';
    setStatusOverride(newStatus);
    setAppendedEvents((prev) => [
      ...prev,
      {
        id: `e_local_${Date.now()}`,
        transferId: transfer.id,
        fromStatus: status,
        toStatus: newStatus,
        actor: 'admin',
        context: { reason: reason.trim(), admin_id: 'admin_super_01' },
        createdAt: new Date(),
      },
    ]);
    setToast(
      activeAction === 'reverse'
        ? t('admin.transfers.action.success.reversed')
        : t('admin.transfers.action.success.force-failed'),
    );
    setActiveAction(null);
    setReason('');
    setReasonError(null);
  }

  function onResendWebhook() {
    if (!transfer) return;
    setToast(
      t('admin.transfers.action.success.webhook-resent', {
        destination: transfer.destination,
      }),
    );
  }

  function onCopyId() {
    if (!transfer) return;
    copyId(transfer.id);
    setToast(t('admin.transfers.action.success.id-copied'));
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Sticky header zone */}
      <div
        className={cn(
          'sticky top-0 z-20 -mx-4 md:-mx-6 px-4 md:px-6 py-3',
          'bg-background/95 backdrop-blur border-b border-border',
        )}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 min-w-0">
            <BackLink />
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge
                status={status}
                domain="transfer"
                className="!text-sm !px-3 !py-1"
              />
              <CopyableId id={transfer.id} onCopy={onCopyId} />
              <span
                className="text-sm text-muted-foreground tabular hidden sm:inline"
                title={transfer.createdAt.toISOString()}
              >
                {formatDateTime(transfer.createdAt)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/customers/users/${transfer.userId}`)}
            >
              <UserIcon className="h-3.5 w-3.5" />
              {t('admin.transfers.detail.open-user')}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-6">
        {/* Amount + FX (full width) */}
        <AmountCard transfer={transfer} fx={fx} />
        <FxBreakdownCard transfer={transfer} />

        {/* Card + Recipient (2-col on lg, single below) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardCard
            transfer={transfer}
            onOpen={() => navigate(`/customers/cards/${transfer.cardId}`)}
          />
          <RecipientCard transfer={transfer} />
        </div>

        {/* Sender + AML (2-col on lg; sender alone if no AML) */}
        <div className={cn('grid grid-cols-1 gap-6', aml.length > 0 && 'lg:grid-cols-2')}>
          <SenderCard
            transfer={transfer}
            sender={sender}
            onOpen={() => navigate(`/customers/users/${transfer.userId}`)}
          />
          {aml.length > 0 && (
            <AmlCard flags={aml} onOpenTriage={() => navigate('/aml-triage')} />
          )}
        </div>

        <TimelineCard events={events} />
        <ProviderResponseCard transfer={transfer} events={events} />
      </div>

      {/* Sticky bottom admin actions bar */}
      <AdminActionsBar
        transfer={{ ...transfer, status }}
        stuck={stuck}
        onReverse={() => setActiveAction('reverse')}
        onForceFail={() => setActiveAction('force-fail')}
        onResendWebhook={onResendWebhook}
        onCopyId={onCopyId}
        onOpenAudit={() => navigate('/audit-log')}
      />

      {/* Reverse / Force-fail dialog */}
      <AlertDialog
        open={activeAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setActiveAction(null);
            setReason('');
            setReasonError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {activeAction === 'reverse'
                ? t('admin.transfers.action.reverse.title')
                : t('admin.transfers.action.force-fail.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {activeAction === 'reverse'
                ? t('admin.transfers.action.reverse.description')
                : t('admin.transfers.action.force-fail.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="action-reason">
              {t('admin.transfers.action.reason-label')}
            </Label>
            <textarea
              id="action-reason"
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (reasonError && e.target.value.trim().length >= 10) setReasonError(null);
              }}
              placeholder={t('admin.transfers.action.reason-placeholder')}
              className={cn(
                'w-full rounded-md border bg-background px-3 py-2 text-sm font-mono',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                reasonError ? 'border-danger-600/50' : 'border-border',
              )}
              autoFocus
            />
            {reasonError && (
              <p className="text-sm text-danger-600">{reasonError}</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('admin.transfers.action.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmAction();
              }}
              className="bg-danger-600 text-white hover:bg-danger-600/90"
            >
              {activeAction === 'reverse'
                ? t('admin.transfers.action.reverse.confirm')
                : t('admin.transfers.action.force-fail.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 rounded-md border border-border bg-card px-4 py-2 shadow-lg text-sm font-medium"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

// =====================================================================
// Header pieces
// =====================================================================

function BackLink() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(TRANSFERS_BASE)}
      className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
    >
      <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
      {t('admin.transfers.detail.back-to-list')}
    </button>
  );
}

function CopyableId({ id, onCopy }: { id: string; onCopy: () => void }) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className="group inline-flex items-center gap-1.5 rounded-sm px-1.5 py-0.5 font-mono tabular text-sm text-foreground/85 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      title={t('admin.transfers.detail.copy-id')}
      aria-label={t('admin.transfers.detail.copy-id')}
    >
      {id}
      <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100" aria-hidden="true" />
    </button>
  );
}

// =====================================================================
// Body cards
// =====================================================================

function AmountCard({
  transfer,
  fx,
}: {
  transfer: Transfer;
  fx?: (typeof FX_RATES)[number];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('admin.transfers.detail.amount.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
          <Money
            amount={transfer.amountUzs}
            currency="UZS"
            className="text-3xl font-bold"
          />
          <ArrowRight className="h-5 w-5 text-muted-foreground hidden lg:block" />
          <Money
            amount={transfer.amountCny}
            currency="CNY"
            className="text-3xl font-bold text-muted-foreground"
          />
        </div>
        <div
          className="mt-4 inline-flex items-center gap-1 rounded-sm bg-slate-100 px-2 py-1 text-sm dark:bg-slate-800"
          title={
            fx
              ? t('admin.transfers.detail.amount.tooltip', {
                  id: fx.id,
                  validFrom: formatDateTime(fx.validFrom),
                  source: fx.source,
                })
              : ''
          }
        >
          <span className="text-muted-foreground">
            {t('admin.transfers.detail.amount.locked-rate', {
              rate: formatNumber(transfer.clientRate),
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function FxBreakdownCard({ transfer }: { transfer: Transfer }) {
  const [open, setOpen] = useState(true);
  const feePct = (Number(transfer.feeUzs) / Number(transfer.amountUzs)) * 100;
  return (
    <Card>
      <CardHeader>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between text-left"
        >
          <CardTitle className="text-base">
            {t('admin.transfers.detail.fx-breakdown')}
          </CardTitle>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform',
              !open && '-rotate-90',
            )}
            aria-hidden="true"
          />
        </button>
      </CardHeader>
      {open && (
        <CardContent>
          <dl className="space-y-2.5 max-w-2xl">
            <FxRow
              label={t('admin.transfers.detail.fx.amount')}
              value={<Money amount={transfer.amountUzs} currency="UZS" />}
            />
            <FxRow
              label={`${t('admin.transfers.detail.fx.fee')} (${feePct.toFixed(1)}%)`}
              value={<Money amount={transfer.feeUzs} currency="UZS" />}
            />
            <FxRow
              label={t('admin.transfers.detail.fx.spread')}
              value={<Money amount={transfer.fxSpreadUzs} currency="UZS" />}
            />
            <div className="border-t pt-2.5">
              <FxRow
                label={t('admin.transfers.detail.fx.total')}
                value={
                  <Money
                    amount={transfer.totalChargeUzs}
                    currency="UZS"
                    className="font-semibold"
                  />
                }
                strong
              />
            </div>
            <div className="border-t pt-2.5">
              <FxRow
                label={t('admin.transfers.detail.fx.recipient-gets')}
                value={
                  <Money
                    amount={transfer.amountCny}
                    currency="CNY"
                    className="font-semibold"
                  />
                }
                strong
              />
            </div>
          </dl>
        </CardContent>
      )}
    </Card>
  );
}

function FxRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={cn('text-sm', strong ? 'text-foreground font-medium' : 'text-muted-foreground')}>
        {label}
      </dt>
      <dd className="text-sm tabular">{value}</dd>
    </div>
  );
}

function CardCard({
  transfer,
  onOpen,
}: {
  transfer: Transfer;
  onOpen: () => void;
}) {
  const country =
    transfer.cardScheme === 'uzcard' || transfer.cardScheme === 'humo' ? 'UZ' : 'INTL';
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{t('admin.transfers.detail.card.title')}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onOpen}>
            {t('admin.transfers.detail.card.details')}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <MaskedPan value={transfer.cardMaskedPan} scheme={transfer.cardScheme} size="md" />
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">{t('admin.transfers.detail.card.bank')}</dt>
              <dd className="mt-0.5">{transfer.cardBank}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('admin.transfers.detail.card.holder')}</dt>
              <dd className="mt-0.5">{transfer.userName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('admin.transfers.detail.card.country')}</dt>
              <dd className="mt-0.5 font-mono tabular">{country}</dd>
            </div>
          </dl>
        </div>
      </CardContent>
    </Card>
  );
}

function RecipientCard({ transfer }: { transfer: Transfer }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('admin.transfers.detail.recipient.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <DestinationBadge destination={transfer.destination} />
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">{t('admin.transfers.detail.recipient.handle')}</dt>
              <dd className="mt-0.5 font-mono tabular">{transfer.recipientIdentifier}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">
                {t('admin.transfers.detail.recipient.display-name')}
              </dt>
              <dd className="mt-0.5 text-muted-foreground">—</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted-foreground">{t('admin.transfers.detail.recipient.saved')}</dt>
              <dd className="mt-0.5 text-sm text-muted-foreground">
                {t('admin.transfers.detail.recipient.unsaved')}
              </dd>
            </div>
          </dl>
        </div>
      </CardContent>
    </Card>
  );
}

function SenderCard({
  transfer,
  sender,
  onOpen,
}: {
  transfer: Transfer;
  sender: (typeof USERS)[number] | undefined;
  onOpen: () => void;
}) {
  const initials = (transfer.userName || '?')
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{t('admin.transfers.detail.sender.title')}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onOpen}>
            {t('admin.transfers.detail.sender.open-profile')}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 text-xs font-semibold">
              {initials || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-medium">{transfer.userName}</div>
            <div className="text-sm text-muted-foreground tabular">{transfer.userPhone}</div>
            <div className="mt-2 flex items-center gap-2 text-sm">
              {sender && <TierBadge tier={sender.kycTier} />}
              {sender && (
                <span className="text-muted-foreground">
                  PINFL {maskPinfl(sender.pinflLast4 + '000000')}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TimelineCard({ events }: { events: TransferEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('admin.transfers.detail.timeline')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-4 border-l border-border pl-6">
          {events.map((event, idx) => (
            <TimelineItem key={event.id} event={event} isLast={idx === events.length - 1} />
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function TimelineItem({ event, isLast }: { event: TransferEvent; isLast: boolean }) {
  const [open, setOpen] = useState(false);
  const tone = statusToTone(event.toStatus, 'transfer');
  const tc = toneClasses(tone);
  const hasContext = event.context && Object.keys(event.context).length > 0;

  return (
    <li className="relative">
      <span
        className={cn(
          'absolute -left-[1.625rem] top-1 h-3 w-3 rounded-full border-2',
          isLast
            ? cn('bg-background animate-pulse-dot border-current', tc.text)
            : cn(tc.dot, 'border-transparent'),
        )}
        aria-hidden="true"
      />
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium">
            {statusLabel(event.toStatus, 'transfer')}
          </div>
          <div className="text-sm text-muted-foreground capitalize">{event.actor}</div>
          {event.failureCode && (
            <div className="text-sm text-danger-600 mt-1 font-mono">{event.failureCode}</div>
          )}
        </div>
        <div className="text-sm text-muted-foreground tabular shrink-0">
          {formatRelative(event.createdAt)}
        </div>
      </div>
      {hasContext && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-1.5 inline-flex items-center gap-1 text-xs text-brand-600 hover:underline dark:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          aria-expanded={open}
        >
          {t('admin.transfers.detail.timeline.context')}
          <ChevronRight
            className={cn('h-3 w-3 transition-transform', open && 'rotate-90')}
            aria-hidden="true"
          />
        </button>
      )}
      {hasContext && open && (
        <pre className="mt-2 overflow-x-auto rounded-md bg-slate-100 p-2 text-xs font-mono dark:bg-slate-900">
          {JSON.stringify(event.context, null, 2)}
        </pre>
      )}
    </li>
  );
}

function ProviderResponseCard({
  transfer,
  events,
}: {
  transfer: Transfer;
  events: TransferEvent[];
}) {
  const [open, setOpen] = useState(false);
  const lastProviderEvent = [...events].reverse().find((e) => e.actor === 'provider');
  const hasResponse = !!transfer.externalTxId || !!lastProviderEvent;
  return (
    <Card>
      <CardHeader>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between text-left"
        >
          <CardTitle className="text-base">
            {t('admin.transfers.detail.provider-response')}
          </CardTitle>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform',
              !open && '-rotate-90',
            )}
            aria-hidden="true"
          />
        </button>
      </CardHeader>
      {open && (
        <CardContent>
          {hasResponse ? (
            <>
              {transfer.externalTxId && (
                <div className="text-sm text-muted-foreground mb-2">
                  external_tx_id ={' '}
                  <span className="font-mono tabular text-foreground/90">
                    {transfer.externalTxId}
                  </span>
                </div>
              )}
              <pre className="overflow-x-auto rounded-md bg-slate-100 p-2 text-xs font-mono dark:bg-slate-900">
                {lastProviderEvent
                  ? JSON.stringify(lastProviderEvent.context ?? {}, null, 2)
                  : '{}'}
              </pre>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('admin.transfers.detail.provider-response.empty')}
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function AmlCard({
  flags,
  onOpenTriage,
}: {
  flags: ReturnType<typeof getAmlFlagsForTransfer>;
  onOpenTriage: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base inline-flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-danger-600" aria-hidden="true" />
            {t('admin.transfers.detail.aml-flags')}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onOpenTriage}>
            {t('admin.transfers.detail.aml.open-triage')}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {flags.map((f) => (
            <li
              key={f.id}
              className="flex items-start gap-3 rounded-md border border-border p-3"
            >
              <SeverityBadge severity={f.severity} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium capitalize">{f.flagType.replace('_', ' ')}</div>
                <div className="text-sm text-muted-foreground">{f.description}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
                  {f.status}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// =====================================================================
// Sticky bottom action bar
// =====================================================================

function AdminActionsBar({
  transfer,
  stuck,
  onReverse,
  onForceFail,
  onResendWebhook,
  onCopyId,
  onOpenAudit,
}: {
  transfer: Transfer;
  stuck: boolean;
  onReverse: () => void;
  onForceFail: () => void;
  onResendWebhook: () => void;
  onCopyId: () => void;
  onOpenAudit: () => void;
}) {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-10 -mx-4 md:-mx-6 px-4 md:px-6 py-3',
        'bg-background/95 backdrop-blur border-t border-border',
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {transfer.status === 'completed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReverse}
              className="border-danger-600/30 text-danger-700 hover:bg-danger-50 dark:text-danger-600 dark:hover:bg-danger-700/15"
            >
              <RotateCw className="h-3.5 w-3.5" />
              {t('admin.transfers.action.reverse')}
            </Button>
          )}
          {stuck && (
            <Button
              variant="outline"
              size="sm"
              onClick={onForceFail}
              className="border-danger-600/30 text-danger-700 hover:bg-danger-50 dark:text-danger-600 dark:hover:bg-danger-700/15"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              {t('admin.transfers.action.force-fail')}
            </Button>
          )}
          {transfer.status === 'failed' && (
            <Button variant="outline" size="sm" onClick={onResendWebhook}>
              <RotateCw className="h-3.5 w-3.5" />
              {t('admin.transfers.action.resend-webhook')}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onCopyId}>
            <Copy className="h-3.5 w-3.5" />
            {t('admin.transfers.action.copy-id')}
          </Button>
          <Button variant="outline" size="sm" onClick={onOpenAudit}>
            <ExternalLink className="h-3.5 w-3.5" />
            {t('admin.transfers.action.open-audit')}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5 ml-auto">
          <ShieldCheck className="h-3.5 w-3.5 text-success-600 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">
            All admin actions are logged to the audit log with the actor's super-admin id.
          </span>
        </p>
      </div>
    </div>
  );
}

// =====================================================================
// Helpers
// =====================================================================

function copyId(id: string) {
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(id);
}

const TYPING_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];
function isTypingContext(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (TYPING_TAGS.includes(target.tagName)) return true;
  if (target.isContentEditable) return true;
  return false;
}
