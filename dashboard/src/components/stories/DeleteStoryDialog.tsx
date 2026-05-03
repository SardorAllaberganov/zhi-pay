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
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { Story } from '@/data/mockStories';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  story: Story | null;
  onConfirm: (reason: string) => void;
}

/**
 * 2-step delete: Dialog gathers reason note (≥20 chars), confirm button
 * triggers AlertDialog second-step asking the irreversible-action question.
 */
export function DeleteStoryDialog({ open, onOpenChange, story, onConfirm }: Props) {
  const [reason, setReason] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setReason('');
      setConfirmOpen(false);
    }
  }, [open]);

  if (!story) return null;
  const reasonValid = reason.trim().length >= 20;

  function handleAccept() {
    setConfirmOpen(false);
    onConfirm(reason);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('admin.stories.delete.title')}</DialogTitle>
            <DialogDescription>
              {t('admin.stories.delete.body', { title: story.titleEn })}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border border-danger-200 bg-danger-50 px-3 py-2.5 text-sm text-danger-800 dark:border-danger-800/50 dark:bg-danger-950/30 dark:text-danger-300">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
              <span>{t('admin.stories.delete.warning')}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delete-reason">{t('admin.stories.delete.reason-label')}</Label>
            <textarea
              id="delete-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder={t('admin.stories.delete.reason-placeholder')}
              className={cn(
                'w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'placeholder:text-muted-foreground/70 resize-none',
              )}
            />
            <div className="flex items-center justify-between text-sm">
              <span className={cn(reasonValid ? 'text-muted-foreground' : 'text-warning-700 dark:text-warning-500')}>
                {t('admin.stories.delete.reason-hint')}
              </span>
              <span className={cn('tabular', reasonValid ? 'text-muted-foreground' : 'text-warning-700 dark:text-warning-500')}>
                {reason.trim().length}/20
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.actions.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
              disabled={!reasonValid}
            >
              {t('admin.stories.delete.confirm-cta')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.stories.delete.confirm-title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.stories.delete.confirm-body', { title: story.titleEn })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAccept}
              className="bg-danger-600 hover:bg-danger-700 focus-visible:ring-danger-600"
            >
              {t('admin.stories.delete.confirm-accept')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
