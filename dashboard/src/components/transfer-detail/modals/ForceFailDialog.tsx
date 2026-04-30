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
import { Label } from '@/components/ui/label';
import { Textarea } from './Textarea';
import { ERROR_CODES } from '@/data/mock';
import { t } from '@/lib/i18n';

export interface ForceFailSubmit {
  failureCode: string;
  reason: string;
  notifyUser: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onSubmit: (payload: ForceFailSubmit) => void;
}

export function ForceFailDialog({ open, onOpenChange, onSubmit }: Props) {
  const nonRetryable = ERROR_CODES.filter((e) => !e.retryable);
  const [failureCode, setFailureCode] = useState<string>(nonRetryable[0]?.code ?? '');
  const [reason, setReason] = useState('');
  const [notifyUser, setNotifyUser] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setFailureCode(nonRetryable[0]?.code ?? '');
      setReason('');
      setNotifyUser(true);
      setConfirmOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const valid = !!failureCode && reason.trim().length >= 30;

  function attemptSubmit() {
    if (!valid) return;
    setConfirmOpen(true);
  }

  function confirmSubmit() {
    onSubmit({ failureCode, reason: reason.trim(), notifyUser });
    setConfirmOpen(false);
    onOpenChange(false);
  }

  return (
    <>
      <Dialog open={open && !confirmOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('admin.transfer-detail.action.force-fail.title')}
            </DialogTitle>
            <DialogDescription>
              {t('admin.transfer-detail.action.force-fail.title')}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border border-warning-600/30 bg-warning-50 p-3 dark:bg-warning-700/15">
            <div className="flex items-start gap-2 text-sm text-warning-700 dark:text-warning-600">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{t('admin.transfer-detail.action.force-fail.warning')}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ff-code">
                {t('admin.transfer-detail.action.force-fail.failure-code')}
              </Label>
              <select
                id="ff-code"
                value={failureCode}
                onChange={(e) => setFailureCode(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {nonRetryable.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.messageEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ff-reason">
                {t('admin.transfer-detail.action.force-fail.reason')}
              </Label>
              <Textarea
                id="ff-reason"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('admin.transfer-detail.action.force-fail.reason-placeholder')}
              />
              <div className="text-sm text-muted-foreground tabular">
                {reason.trim().length} / min 30
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="ff-notify"
                checked={notifyUser}
                onCheckedChange={(v) => setNotifyUser(v === true)}
              />
              <Label htmlFor="ff-notify" className="cursor-pointer">
                {t('admin.transfer-detail.action.force-fail.notify-user')}
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {t('common.actions.cancel')}
            </Button>
            <Button variant="destructive" onClick={attemptSubmit} disabled={!valid}>
              {t('admin.transfer-detail.action.force-fail.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('admin.transfer-detail.action.force-fail.confirm-title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.transfer-detail.action.force-fail.confirm-body')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSubmit}
              className="bg-danger-600 text-white hover:bg-danger-700"
            >
              {t('admin.transfer-detail.action.force-fail.submit')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
