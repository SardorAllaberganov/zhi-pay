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
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentReason: string;
  onConfirm: (newReason: string, changeNote: string) => void;
}

const MIN_CHANGE_NOTE = 20;

export function EditReasonDialog({ open, onOpenChange, currentReason, onConfirm }: Props) {
  const [reason, setReason] = useState(currentReason);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open) {
      setReason(currentReason);
      setNote('');
    }
  }, [open, currentReason]);

  const reasonChanged = reason.trim() !== currentReason.trim() && reason.trim().length >= 30;
  const noteOk = note.trim().length >= MIN_CHANGE_NOTE;
  const canSubmit = reasonChanged && noteOk;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{t('admin.blacklist.edit-reason.title')}</DialogTitle>
          <DialogDescription>
            {t('admin.blacklist.edit-reason.body')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="bl-edit-reason">
              {t('admin.blacklist.edit-reason.field.reason')}
            </Label>
            <textarea
              id="bl-edit-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <p className="text-sm text-muted-foreground">
              {t('admin.blacklist.edit-reason.help.reason')}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bl-change-note">
              {t('admin.blacklist.edit-reason.field.change-note')}
            </Label>
            <textarea
              id="bl-change-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <p
              className={cn(
                'text-sm',
                noteOk ? 'text-muted-foreground' : 'text-warning-700 dark:text-warning-600',
              )}
            >
              {t('admin.blacklist.edit-reason.help.change-note', {
                count: note.trim().length,
                min: MIN_CHANGE_NOTE,
              })}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.actions.cancel')}
          </Button>
          <Button
            disabled={!canSubmit}
            onClick={() => onConfirm(reason.trim(), note.trim())}
            className="bg-warning-600 hover:bg-warning-700 text-white"
          >
            {t('admin.blacklist.edit-reason.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
