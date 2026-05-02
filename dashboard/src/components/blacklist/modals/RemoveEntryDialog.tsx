import { useEffect, useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
}

const MIN_REASON = 30;

export function RemoveEntryDialog({ open, onOpenChange, onConfirm }: Props) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  const ok = reason.trim().length >= MIN_REASON;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[520px]">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('admin.blacklist.remove.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('admin.blacklist.remove.body')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="bl-remove-reason">
            {t('admin.blacklist.remove.field.reason')}
          </Label>
          <textarea
            id="bl-remove-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <p
            className={cn(
              'text-sm',
              ok ? 'text-muted-foreground' : 'text-warning-700 dark:text-warning-600',
            )}
          >
            {t('admin.blacklist.remove.help', {
              count: reason.trim().length,
              min: MIN_REASON,
            })}
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            disabled={!ok}
            onClick={() => onConfirm(reason.trim())}
            className="bg-danger-600 hover:bg-danger-700 text-white"
          >
            {t('admin.blacklist.remove.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
