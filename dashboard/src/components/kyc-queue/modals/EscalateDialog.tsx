import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/transfer-detail/modals/Textarea';
import { t } from '@/lib/i18n';

interface Props {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onSubmit: (reason: string) => void;
}

export function EscalateDialog({ open, onOpenChange, onSubmit }: Props) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  const valid = reason.trim().length >= 10;

  function submit() {
    if (!valid) return;
    onSubmit(reason.trim());
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('admin.kyc-queue.action.escalate.title')}</DialogTitle>
          <DialogDescription>
            {t('admin.kyc-queue.action.escalate.body')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="kyc-escalate-reason">
            {t('admin.kyc-queue.action.escalate.reason-label')}
          </Label>
          <Textarea
            id="kyc-escalate-reason"
            autoFocus
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('admin.kyc-queue.action.escalate.reason-placeholder')}
          />
          <div className="text-sm text-muted-foreground tabular">
            {reason.trim().length} / min 10
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('common.actions.cancel')}
          </Button>
          <Button variant="outline" onClick={submit} disabled={!valid}>
            {t('admin.kyc-queue.action.escalate.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
