import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from './Textarea';
import { formatMoney } from '@/lib/utils';
import { t } from '@/lib/i18n';

export interface MarkCompletedSubmit {
  providerTxId: string;
  reason: string;
}

interface Props {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  amountCnyFen: bigint;
  onSubmit: (payload: MarkCompletedSubmit) => void;
}

export function MarkCompletedDialog({
  open,
  onOpenChange,
  amountCnyFen,
  onSubmit,
}: Props) {
  const [providerTxId, setProviderTxId] = useState('');
  const [reason, setReason] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setProviderTxId('');
      setReason('');
      setAcknowledged(false);
      setConfirmOpen(false);
    }
  }, [open]);

  const valid =
    providerTxId.trim().length > 0 &&
    reason.trim().length >= 50 &&
    acknowledged;

  function attemptSubmit() {
    if (!valid) return;
    setConfirmOpen(true);
  }
  function confirmSubmit() {
    onSubmit({ providerTxId: providerTxId.trim(), reason: reason.trim() });
    setConfirmOpen(false);
    onOpenChange(false);
  }

  const cnyDisplay = formatMoney(amountCnyFen, 'CNY');

  return (
    <>
      <Dialog open={open && !confirmOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[520px]">
          <DialogHeader>
            <DialogTitle>
              {t('admin.transfer-detail.action.mark-completed.title')}
            </DialogTitle>
            <DialogDescription>
              {t('admin.transfer-detail.action.mark-completed.title')}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border border-danger-600/30 bg-danger-50 p-3 dark:bg-danger-700/15">
            <div className="flex items-start gap-2 text-sm text-danger-700 dark:text-danger-600">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{t('admin.transfer-detail.action.mark-completed.warning')}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="mc-tx-id">
                {t('admin.transfer-detail.action.mark-completed.provider-tx-id')}
              </Label>
              <Input
                id="mc-tx-id"
                value={providerTxId}
                onChange={(e) => setProviderTxId(e.target.value)}
                placeholder={t('admin.transfer-detail.action.mark-completed.provider-tx-id-placeholder')}
                className="font-mono tabular"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mc-reason">
                {t('admin.transfer-detail.action.mark-completed.reason')}
              </Label>
              <Textarea
                id="mc-reason"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('admin.transfer-detail.action.mark-completed.reason-placeholder')}
              />
              <div className="text-sm text-muted-foreground tabular">
                {reason.trim().length} / min 50
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-md border border-border bg-card p-3">
              <Checkbox
                id="mc-ack"
                checked={acknowledged}
                onCheckedChange={(v) => setAcknowledged(v === true)}
              />
              <Label htmlFor="mc-ack" className="cursor-pointer text-sm leading-snug">
                {t('admin.transfer-detail.action.mark-completed.acknowledge', {
                  amount: cnyDisplay,
                })}
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {t('common.actions.cancel')}
            </Button>
            <Button variant="destructive" onClick={attemptSubmit} disabled={!valid}>
              {t('admin.transfer-detail.action.mark-completed.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('admin.transfer-detail.action.mark-completed.confirm-title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.transfer-detail.action.mark-completed.confirm-body')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSubmit}
              className="bg-danger-600 text-white hover:bg-danger-700"
            >
              {t('admin.transfer-detail.action.mark-completed.submit')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
