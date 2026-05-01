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
import type { RecipientEntry } from '@/data/mockRecipients';

const REASON_MIN = 20;

interface Props {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  recipient: RecipientEntry | null;
  onSubmit: (reason: string) => void;
}

/**
 * Hard-delete confirmation for a saved recipient.
 *
 * Two-step pattern: Dialog (reason note ≥20 chars + warning banner) →
 * AlertDialog (final confirm). Mirrors the user-detail Recipients tab's
 * delete flow but lives in `components/recipients/modals/` because it
 * is the cross-user-page version. Reason note is mandatory and
 * minimum-length-validated client-side.
 *
 * Hard-delete is permanent: the recipient row is removed from the live
 * list (the `mockRecipients` mutator marks `isDeleted=true` so audit
 * history outlives the row). Past transfers are unaffected — the
 * identifier is denormalized on the transfer row per `docs/models.md` §4.1.
 */
export function HardDeleteRecipientDialog({
  open,
  onOpenChange,
  recipient,
  onSubmit,
}: Props) {
  const [reason, setReason] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setReason('');
      setConfirmOpen(false);
    }
  }, [open]);

  const trimmed = reason.trim();
  const valid = trimmed.length >= REASON_MIN;

  function handlePrimary() {
    if (!valid) return;
    setConfirmOpen(true);
  }

  function handleConfirm() {
    onSubmit(trimmed);
    setConfirmOpen(false);
    onOpenChange(false);
  }

  if (!recipient) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('admin.recipients.action.hard-delete.title')}
            </DialogTitle>
            <DialogDescription>
              {t('admin.recipients.action.hard-delete.body', {
                destination: t(
                  `admin.overview.destination.${recipient.destination}`,
                ),
                identifier: recipient.identifier,
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border border-danger-600/20 bg-danger-50 dark:bg-danger-700/15 px-3 py-2.5 text-sm text-danger-700 dark:text-danger-600 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{t('admin.recipients.action.hard-delete.warning')}</span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="delete-recipient-reason">
              {t('admin.recipients.action.reason-label')}
            </Label>
            <Textarea
              id="delete-recipient-reason"
              autoFocus
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('admin.recipients.action.reason-placeholder')}
            />
            <div className="text-sm text-muted-foreground tabular">
              {t('admin.recipients.action.reason-count', {
                current: trimmed.length,
                min: REASON_MIN,
              })}
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {t('common.actions.cancel')}
            </Button>
            <Button onClick={handlePrimary} disabled={!valid} variant="destructive">
              {t('admin.recipients.action.hard-delete.cta')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('admin.recipients.action.hard-delete.confirm-title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.recipients.action.hard-delete.confirm-body', {
                destination: t(
                  `admin.overview.destination.${recipient.destination}`,
                ),
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
              {t('admin.recipients.action.hard-delete.confirm-cta')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
