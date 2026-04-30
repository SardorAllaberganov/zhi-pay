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
import { formatMoney } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { CardScheme } from '@/types';

export interface ReverseSubmit {
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
  amountUzsTiyins: bigint;
  onSubmit: (payload: ReverseSubmit) => void;
}

export function ReverseDialog({
  open,
  onOpenChange,
  userId,
  sourceCardId,
  sourceCardScheme,
  sourceCardMaskedPan,
  amountUzsTiyins,
  onSubmit,
}: Props) {
  const [reason, setReason] = useState('');
  const [recipient, setRecipient] = useState<RefundRecipientValue>({ target: 'source' });
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setReason('');
      setRecipient({ target: 'source' });
      setConfirmOpen(false);
    }
  }, [open]);

  const valid = reason.trim().length >= 50 && isRecipientValid(recipient);

  function attemptSubmit() {
    if (!valid) return;
    setConfirmOpen(true);
  }
  function confirmSubmit() {
    onSubmit({ reason: reason.trim(), recipient });
    setConfirmOpen(false);
    onOpenChange(false);
  }

  return (
    <>
      <Dialog open={open && !confirmOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('admin.transfer-detail.action.reverse.title')}
            </DialogTitle>
            <DialogDescription>
              {t('admin.transfer-detail.action.reverse.title')}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border border-danger-600/30 bg-danger-50 p-3 dark:bg-danger-700/15">
            <div className="flex items-start gap-2 text-sm text-danger-700 dark:text-danger-600">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{t('admin.transfer-detail.action.reverse.warning')}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="rev-reason">
                {t('admin.transfer-detail.action.reverse.reason')}
              </Label>
              <Textarea
                id="rev-reason"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('admin.transfer-detail.action.reverse.reason-placeholder')}
              />
              <div className="text-sm text-muted-foreground tabular">
                {reason.trim().length} / min 50
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
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {t('common.actions.cancel')}
            </Button>
            <Button variant="destructive" onClick={attemptSubmit} disabled={!valid}>
              {t('admin.transfer-detail.action.reverse.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('admin.transfer-detail.action.reverse.confirm-title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.transfer-detail.action.reverse.confirm-body', {
                amount: formatMoney(amountUzsTiyins, 'UZS'),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSubmit}
              className="bg-danger-600 text-white hover:bg-danger-700"
            >
              {t('admin.transfer-detail.action.reverse.submit')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
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
