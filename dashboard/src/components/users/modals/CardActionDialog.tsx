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
import type { UserCardEntry } from '@/data/mockUsers';

type Mode = 'freeze' | 'unfreeze';

interface Props {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  card: UserCardEntry | null;
  mode: Mode;
  onSubmit: (reason: string) => void;
}

export function CardActionDialog({ open, onOpenChange, card, mode, onSubmit }: Props) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  const valid = reason.trim().length >= 20;

  function submit() {
    if (!valid || !card) return;
    onSubmit(reason.trim());
    onOpenChange(false);
  }

  if (!card) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'freeze'
              ? t('admin.users.action.freeze-card.title')
              : t('admin.users.action.unfreeze-card.title')}
          </DialogTitle>
          <DialogDescription>
            {mode === 'freeze'
              ? t('admin.users.action.freeze-card.body', { pan: card.maskedPan, bank: card.bank })
              : t('admin.users.action.unfreeze-card.body', { pan: card.maskedPan, bank: card.bank })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="card-reason">{t('admin.users.action.reason-label')}</Label>
          <Textarea
            id="card-reason"
            autoFocus
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('admin.users.action.reason-placeholder')}
          />
          <div className="text-sm text-muted-foreground tabular">
            {reason.trim().length} / {t('admin.users.action.confirm-reason-required')}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('common.actions.cancel')}
          </Button>
          <Button
            onClick={submit}
            disabled={!valid}
            variant={mode === 'freeze' ? 'destructive' : 'default'}
          >
            {mode === 'freeze'
              ? t('admin.users.action.freeze-card.cta')
              : t('admin.users.action.unfreeze-card.cta')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
