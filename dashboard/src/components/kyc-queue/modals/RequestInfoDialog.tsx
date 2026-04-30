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
  onSubmit: (message: string) => void;
}

export function RequestInfoDialog({ open, onOpenChange, onSubmit }: Props) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (open) setMessage('');
  }, [open]);

  const valid = message.trim().length >= 10;

  function submit() {
    if (!valid) return;
    onSubmit(message.trim());
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('admin.kyc-queue.action.request-info.title')}</DialogTitle>
          <DialogDescription>
            {t('admin.kyc-queue.action.request-info.body')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="kyc-info-message">
            {t('admin.kyc-queue.action.request-info.message')}
          </Label>
          <Textarea
            id="kyc-info-message"
            autoFocus
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('admin.kyc-queue.action.request-info.message-placeholder')}
          />
          <div className="text-sm text-muted-foreground tabular">
            {message.trim().length} / min 10
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('common.actions.cancel')}
          </Button>
          <Button onClick={submit} disabled={!valid}>
            {t('admin.kyc-queue.action.request-info.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
