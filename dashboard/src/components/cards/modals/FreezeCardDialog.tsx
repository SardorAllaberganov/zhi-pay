import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
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
import type { CardEntry, FreezeSeverity } from '@/data/mockCards';

const SEVERITY_OPTIONS: FreezeSeverity[] = [
  'suspicious_activity',
  'aml_flag',
  'user_request',
  'other',
];

const MIN_REASON_LENGTH = 10;

interface Props {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  card: CardEntry | null;
  onSubmit: (payload: { reason: string; severity: FreezeSeverity }) => void;
}

export function FreezeCardDialog({ open, onOpenChange, card, onSubmit }: Props) {
  const [reason, setReason] = useState('');
  const [severity, setSeverity] = useState<FreezeSeverity>('suspicious_activity');

  useEffect(() => {
    if (open) {
      setReason('');
      setSeverity('suspicious_activity');
    }
  }, [open]);

  if (!card) return null;

  const valid = reason.trim().length >= MIN_REASON_LENGTH;

  function submit() {
    if (!valid) return;
    onSubmit({ reason: reason.trim(), severity });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-warning-700 dark:text-warning-600" aria-hidden="true" />
            {t('admin.cards.action.freeze.title')}
          </DialogTitle>
          <DialogDescription>
            {t('admin.cards.action.freeze.body', {
              pan: card.maskedPan,
              bank: card.bank,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="freeze-severity">
              {t('admin.cards.action.freeze.severity-label')}
            </Label>
            <select
              id="freeze-severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as FreezeSeverity)}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {SEVERITY_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {t(`admin.cards.action.freeze.severity.${s}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="freeze-reason">
              {t('admin.cards.action.reason-required')}
            </Label>
            <Textarea
              id="freeze-reason"
              autoFocus
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('admin.cards.action.freeze.reason-placeholder')}
            />
            <div className="text-sm text-muted-foreground tabular">
              {reason.trim().length} / min {MIN_REASON_LENGTH}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {t('admin.cards.action.freeze.notify-note')}
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('common.actions.cancel')}
          </Button>
          <Button
            onClick={submit}
            disabled={!valid}
            className="bg-warning-600 text-white hover:bg-warning-700 dark:bg-warning-700 dark:hover:bg-warning-600"
          >
            <Lock className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {t('admin.cards.action.freeze')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
