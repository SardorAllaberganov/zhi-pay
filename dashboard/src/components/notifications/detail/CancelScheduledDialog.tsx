import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
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
import { CANCEL_REASON_MIN } from '../types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Title (en) of the notification — shown in the dialog body for context. */
  notificationTitle: string;
  onConfirm: (reason: string) => void;
}

export function CancelScheduledDialog({
  open,
  onOpenChange,
  notificationTitle,
  onConfirm,
}: Props) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) setReason('');
  }, [open]);

  const trimmed = reason.trim();
  const enabled = trimmed.length >= CANCEL_REASON_MIN;
  const charCount = trimmed.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('admin.notifications.detail.cancel-scheduled.title')}
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <span className="block">
              {t('admin.notifications.detail.cancel-scheduled.body').replace(
                '{title}',
                notificationTitle,
              )}
            </span>
            <span
              className={cn(
                'inline-flex items-start gap-2 rounded-md border px-3 py-2',
                'border-warning-300 bg-warning-50 text-warning-800',
                'dark:border-warning-700/40 dark:bg-warning-950/30 dark:text-warning-300',
              )}
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{t('admin.notifications.detail.cancel-scheduled.warning')}</span>
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="notif-cancel-reason">
            {t('admin.notifications.detail.cancel-scheduled.reason-label')}
          </Label>
          <textarea
            id="notif-cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder={t('admin.notifications.detail.cancel-scheduled.reason-placeholder')}
            className={cn(
              'w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'placeholder:text-muted-foreground/70 resize-y',
            )}
          />
          <div className="text-sm text-muted-foreground">
            {t('admin.notifications.detail.cancel-scheduled.reason-counter')
              .replace('{count}', String(charCount))
              .replace('{min}', String(CANCEL_REASON_MIN))}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            {t('admin.notifications.compose.action-bar.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => onConfirm(trimmed)}
            disabled={!enabled}
          >
            {t('admin.notifications.detail.cancel-scheduled.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
