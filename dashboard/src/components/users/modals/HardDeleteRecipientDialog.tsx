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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/transfer-detail/modals/Textarea';
import { t } from '@/lib/i18n';
import type { UserRecipientEntry } from '@/data/mockUsers';

interface Props {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  recipient: UserRecipientEntry | null;
  onSubmit: (reason: string) => void;
}

export function HardDeleteRecipientDialog({ open, onOpenChange, recipient, onSubmit }: Props) {
  const [reason, setReason] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setReason('');
      setConfirmOpen(false);
    }
  }, [open]);

  const valid = reason.trim().length >= 20;

  function handlePrimary() {
    if (!valid) return;
    setConfirmOpen(true);
  }

  function handleConfirm() {
    onSubmit(reason.trim());
    setConfirmOpen(false);
    onOpenChange(false);
  }

  if (!recipient) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.users.action.delete-recipient.title')}</DialogTitle>
            <DialogDescription>
              {t('admin.users.action.delete-recipient.body', {
                destination: recipient.destination,
                identifier: recipient.identifier,
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border border-danger-600/20 bg-danger-50 dark:bg-danger-700/15 px-3 py-2.5 text-sm text-danger-700 dark:text-danger-600 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{t('admin.users.action.delete-recipient.warning')}</span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="delete-recipient-reason">{t('admin.users.action.reason-label')}</Label>
            <Textarea
              id="delete-recipient-reason"
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
            <Button onClick={handlePrimary} disabled={!valid} variant="destructive">
              {t('admin.users.action.delete-recipient.cta')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('admin.users.action.delete-recipient.confirm-title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.users.action.delete-recipient.confirm-body', {
                destination: recipient.destination,
                identifier: recipient.identifier,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-danger-600 hover:bg-danger-700 focus:ring-danger-600 text-white"
            >
              {t('admin.users.action.delete-recipient.confirm-cta')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
