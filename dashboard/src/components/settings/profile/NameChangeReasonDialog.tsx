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

const MIN_REASON = 10;

interface NameChangeReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string) => void;
  previousName: string;
  nextName: string;
}

export function NameChangeReasonDialog({
  open,
  onOpenChange,
  onSubmit,
  previousName,
  nextName,
}: NameChangeReasonDialogProps) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  const valid = reason.trim().length >= MIN_REASON;
  const nameChanged = previousName !== nextName;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('admin.settings.profile.confirm.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('admin.settings.profile.confirm.body')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {nameChanged ? (
          <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
            <span className="text-muted-foreground line-through">{previousName}</span>
            <span className="mx-2 text-muted-foreground">→</span>
            <span className="font-medium text-foreground">{nextName}</span>
          </div>
        ) : null}

        <div className="space-y-2 pt-2">
          <Label htmlFor="settings-name-reason" className="text-sm font-medium">
            {t('admin.settings.profile.confirm.reason-label')}
          </Label>
          <textarea
            id="settings-name-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className={cn(
              'w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'placeholder:text-muted-foreground resize-none',
            )}
            placeholder={t('admin.settings.profile.confirm.reason-placeholder')}
          />
          <p className="text-sm text-muted-foreground">
            {reason.trim().length}/{MIN_REASON}+ {t('admin.settings.profile.confirm.reason-hint')}
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            disabled={!valid}
            onClick={(e) => {
              if (!valid) {
                e.preventDefault();
                return;
              }
              onSubmit(reason.trim());
            }}
          >
            {t('admin.settings.profile.confirm.submit')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
