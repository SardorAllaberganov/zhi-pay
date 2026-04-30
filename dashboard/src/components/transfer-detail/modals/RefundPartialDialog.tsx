import { useEffect, useState } from 'react';
import { AlertTriangle, Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Textarea } from './Textarea';
import {
  RefundRecipientPicker,
  isRecipientValid,
  type RefundRecipientValue,
} from './RefundRecipientPicker';
import { CARDS } from '@/data/mock';
import { formatMoney } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { CardScheme } from '@/types';

export interface RefundSubmit {
  amountTiyins: bigint;
  reason: string;
  recipient: RefundRecipientValue;
}

interface Props {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  userId: string;
  sourceCardId: string;
  sourceCardScheme: CardScheme;
  sourceCardMaskedPan: string;
  originalAmountTiyins: bigint;
  onSubmit: (payload: RefundSubmit) => void;
}

export function RefundPartialDialog({
  open,
  onOpenChange,
  userId,
  sourceCardId,
  sourceCardScheme,
  sourceCardMaskedPan,
  originalAmountTiyins,
  onSubmit,
}: Props) {
  const originalMajor = Number(originalAmountTiyins / 100n);
  const [amountInput, setAmountInput] = useState<string>(String(originalMajor));
  const [reason, setReason] = useState('');
  const [recipient, setRecipient] = useState<RefundRecipientValue>({ target: 'source' });
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setAmountInput(String(originalMajor));
      setReason('');
      setRecipient({ target: 'source' });
      setConfirmOpen(false);
    }
  }, [open, originalMajor]);

  const parsed = parseAmount(amountInput);
  const amountTiyins = parsed ? BigInt(Math.round(parsed * 100)) : null;
  const amountValid =
    amountTiyins !== null &&
    amountTiyins >= 100n &&
    amountTiyins <= originalAmountTiyins;
  const reasonValid = reason.trim().length >= 30;
  const valid = amountValid && reasonValid && isRecipientValid(recipient);

  function attemptSubmit() {
    if (!valid || amountTiyins === null) return;
    setConfirmOpen(true);
  }
  function confirmSubmit() {
    if (amountTiyins === null) return;
    onSubmit({ amountTiyins, reason: reason.trim(), recipient });
    setConfirmOpen(false);
    onOpenChange(false);
  }

  const previewTarget = describeTarget(recipient, userId, sourceCardId, sourceCardMaskedPan);

  return (
    <>
      <Dialog open={open && !confirmOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('admin.transfer-detail.action.refund.title')}
            </DialogTitle>
            <DialogDescription>
              {t('admin.transfer-detail.action.refund.title')}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border border-warning-600/30 bg-warning-50 p-3 dark:bg-warning-700/15">
            <div className="flex items-start gap-2 text-sm text-warning-700 dark:text-warning-600">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{t('admin.transfer-detail.action.refund.warning')}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ref-amount">
                {t('admin.transfer-detail.action.refund.amount')}
              </Label>
              <Input
                id="ref-amount"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                inputMode="numeric"
                className="font-mono tabular"
              />
              <div className="text-sm text-muted-foreground tabular">
                Up to {formatMoney(originalAmountTiyins, 'UZS')}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ref-reason">
                {t('admin.transfer-detail.action.refund.reason')}
              </Label>
              <Textarea
                id="ref-reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('admin.transfer-detail.action.refund.reason-placeholder')}
              />
              <div className="text-sm text-muted-foreground tabular">
                {reason.trim().length} / min 30
              </div>
            </div>

            <RefundRecipientPicker
              userId={userId}
              sourceCardId={sourceCardId}
              sourceCardScheme={sourceCardScheme}
              sourceCardMaskedPan={sourceCardMaskedPan}
              value={recipient}
              onChange={setRecipient}
            />

            <NotifyUserLockedRow />

            {amountTiyins !== null && amountValid && (
              <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
                <div className="font-medium text-foreground">
                  {t('admin.transfer-detail.action.refund.preview-line', {
                    refund: formatMoney(amountTiyins, 'UZS'),
                    original: formatMoney(originalAmountTiyins, 'UZS'),
                  })}
                </div>
                <div className="text-muted-foreground mt-0.5">
                  {t('admin.transfer-detail.action.refund.preview-target', {
                    target: previewTarget,
                  })}
                </div>
                <div className="text-muted-foreground mt-0.5">
                  {t('admin.transfer-detail.action.refund.preview-keeps')}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {t('common.actions.cancel')}
            </Button>
            <Button variant="destructive" onClick={attemptSubmit} disabled={!valid}>
              {t('admin.transfer-detail.action.refund.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('admin.transfer-detail.action.refund.confirm-title', {
                amount: amountTiyins ? formatMoney(amountTiyins, 'UZS') : '',
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.transfer-detail.action.refund.confirm-body')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSubmit}
              className="bg-danger-600 text-white hover:bg-danger-700"
            >
              {t('admin.transfer-detail.action.refund.submit')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function parseAmount(s: string): number | null {
  const cleaned = s.replace(/[\s,]/g, '');
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function describeTarget(
  v: RefundRecipientValue,
  userId: string,
  sourceCardId: string,
  sourceCardMaskedPan: string,
): string {
  if (v.target === 'source') return sourceCardMaskedPan;
  if (v.target === 'alternate') {
    const card = CARDS.find((c) => c.id === v.alternateCardId);
    return card ? `${card.bankName} ${card.maskedPan}` : 'alternate card';
  }
  if (v.target === 'bank' && v.bank) {
    return `${v.bank.name} (${v.bank.holder})`;
  }
  // unused params silenced
  void userId;
  void sourceCardId;
  return '—';
}

function NotifyUserLockedRow() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm cursor-help">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            <span className="flex-1">
              {t('admin.transfer-detail.action.reverse.notify-user')}
            </span>
            <span className="text-xs uppercase tracking-wider text-success-700 dark:text-success-600 font-medium">
              On
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {t('admin.transfer-detail.action.reverse.notify-locked-tooltip')}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
