import { useEffect, useState } from 'react';
import { Unlock } from 'lucide-react';
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
import type { CardEntry } from '@/data/mockCards';

const MIN_REASON_LENGTH = 10;

interface Props {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  card: CardEntry | null;
  onSubmit: (payload: { reason: string }) => void;
}

export function UnfreezeCardDialog({ open, onOpenChange, card, onSubmit }: Props) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  if (!card) return null;

  const valid = reason.trim().length >= MIN_REASON_LENGTH;

  function submit() {
    if (!valid) return;
    onSubmit({ reason: reason.trim() });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Unlock className="h-4 w-4" aria-hidden="true" />
            {t('admin.cards.action.unfreeze.title')}
          </DialogTitle>
          <DialogDescription>
            {t('admin.cards.action.unfreeze.body', {
              pan: card.maskedPan,
              bank: card.bank,
            })}
          </DialogDescription>
        </DialogHeader>

        {card.freezeReason && (
          <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">
              {t('admin.cards.action.unfreeze.previous-reason')}
            </div>
            <div className="text-foreground/80">{card.freezeReason}</div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="unfreeze-reason">
            {t('admin.cards.action.reason-required')}
          </Label>
          <Textarea
            id="unfreeze-reason"
            autoFocus
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('admin.cards.action.unfreeze.reason-placeholder')}
          />
          <div className="text-sm text-muted-foreground tabular">
            {reason.trim().length} / min {MIN_REASON_LENGTH}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {t('admin.cards.action.unfreeze.notify-note')}
        </p>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('common.actions.cancel')}
          </Button>
          <Button onClick={submit} disabled={!valid}>
            <Unlock className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {t('admin.cards.action.unfreeze')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
