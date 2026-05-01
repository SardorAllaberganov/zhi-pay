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
import type { AmlClearReason } from '@/data/mockAmlTriage';

const REASONS: AmlClearReason[] = [
  'false_positive',
  'verified_legitimate',
  'low_risk',
  'other',
];

export interface ClearSubmit {
  reasonCode: AmlClearReason;
  notes: string;
}

interface Props {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onSubmit: (payload: ClearSubmit) => void;
}

export function ClearDialog({ open, onOpenChange, onSubmit }: Props) {
  const [reasonCode, setReasonCode] = useState<AmlClearReason>('false_positive');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      setReasonCode('false_positive');
      setNotes('');
    }
  }, [open]);

  const valid = notes.trim().length >= 20;

  function submit() {
    if (!valid) return;
    onSubmit({ reasonCode, notes: notes.trim() });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('admin.aml-triage.action.clear.title')}</DialogTitle>
          <DialogDescription>{t('admin.aml-triage.action.clear.body')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="aml-clear-reason">
              {t('admin.aml-triage.action.clear.reason-code')}
            </Label>
            <select
              id="aml-clear-reason"
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value as AmlClearReason)}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {t(`admin.aml-triage.action.clear.reason-code.${r}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="aml-clear-notes">
              {t('admin.aml-triage.action.clear.notes-label')}
            </Label>
            <Textarea
              id="aml-clear-notes"
              autoFocus
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('admin.aml-triage.action.clear.notes-placeholder')}
            />
            <div className="text-sm text-muted-foreground tabular">
              {notes.trim().length} / min 20
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('common.actions.cancel')}
          </Button>
          <Button onClick={submit} disabled={!valid}>
            {t('admin.aml-triage.action.clear.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
