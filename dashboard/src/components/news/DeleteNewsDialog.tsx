import { useEffect, useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { News } from '@/data/mockNews';

const REASON_MIN = 20;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: News | null;
  onConfirm: (reason: string) => void;
}

export function DeleteNewsDialog({ open, onOpenChange, item, onConfirm }: Props) {
  const [reason, setReason] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setReason('');
      setConfirmOpen(false);
    }
  }, [open]);

  if (!item) return null;

  const trimmed = reason.trim();
  const valid = trimmed.length >= REASON_MIN;

  return (
    <>
      <Dialog open={open && !confirmOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{t('admin.news.delete.title')}</DialogTitle>
            <DialogDescription>{t('admin.news.delete.description')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-md border border-danger-200 bg-danger-50 dark:border-danger-900 dark:bg-danger-950/40 p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-danger-700 dark:text-danger-300 mt-0.5 shrink-0" aria-hidden="true" />
              <div className="text-sm text-danger-800 dark:text-danger-200">
                <div className="font-medium mb-1">{t('admin.news.delete.warning-title')}</div>
                <div>{t('admin.news.delete.warning-body')}</div>
              </div>
            </div>

            <div className="text-sm">
              <div className="text-muted-foreground mb-1">{t('admin.news.delete.target')}</div>
              <div className="font-medium text-foreground line-clamp-2">{item.titleEn || item.titleUz || item.titleRu}</div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="news-delete-reason" className="block text-sm font-medium">
                {t('admin.news.delete.reason-label')}
              </label>
              <textarea
                id="news-delete-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                placeholder={t('admin.news.delete.reason-placeholder')}
              />
              <div
                className={cn(
                  'text-sm',
                  trimmed.length < REASON_MIN ? 'text-muted-foreground' : 'text-success-700 dark:text-success-400',
                )}
              >
                {t('admin.news.delete.reason-counter').replace('{count}', String(trimmed.length))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.actions.cancel')}
            </Button>
            <Button
              variant="destructive"
              disabled={!valid}
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-1.5" aria-hidden="true" />
              {t('admin.news.delete.continue')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.news.delete.confirm-title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('admin.news.delete.confirm-body')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-danger-600 hover:bg-danger-700 focus-visible:ring-danger-600 text-white"
              onClick={() => {
                onConfirm(trimmed);
                setConfirmOpen(false);
                onOpenChange(false);
              }}
            >
              {t('admin.news.delete.confirm-action')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
