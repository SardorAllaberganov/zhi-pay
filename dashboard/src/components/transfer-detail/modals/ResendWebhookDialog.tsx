import { useEffect, useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from './Textarea';
import { t } from '@/lib/i18n';

export interface ResendWebhookSubmit {
  reason: string;
  notifyUser: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  provider: string;
  externalTxId: string;
  onSubmit: (payload: ResendWebhookSubmit) => void;
}

export function ResendWebhookDialog({
  open,
  onOpenChange,
  provider,
  externalTxId,
  onSubmit,
}: Props) {
  const [reason, setReason] = useState('');
  const [notifyUser, setNotifyUser] = useState(false);

  useEffect(() => {
    if (open) {
      setReason('');
      setNotifyUser(false);
    }
  }, [open]);

  const valid = reason.trim().length >= 10;

  function submit() {
    if (!valid) return;
    onSubmit({ reason: reason.trim(), notifyUser });
    onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('admin.transfer-detail.action.resend-webhook.title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('admin.transfer-detail.action.resend-webhook.body', {
              provider,
              id: externalTxId,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="resend-reason">
              {t('admin.transfer-detail.action.resend-webhook.reason')}
            </Label>
            <Textarea
              id="resend-reason"
              autoFocus
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="text-sm text-muted-foreground tabular">
              {reason.trim().length} / min 10
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="resend-notify"
              checked={notifyUser}
              onCheckedChange={(v) => setNotifyUser(v === true)}
            />
            <Label htmlFor="resend-notify" className="cursor-pointer">
              {t('admin.transfer-detail.action.resend-webhook.notify-user')}
            </Label>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={submit} disabled={!valid}>
            {t('admin.transfer-detail.action.resend-webhook.submit')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
