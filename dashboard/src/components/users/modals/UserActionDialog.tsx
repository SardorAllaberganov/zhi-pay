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
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { UserListRow } from '@/data/mockUsers';

export type UserDialogAction =
  | 'block'
  | 'unblock'
  | 'soft_delete'
  | 'reverify_kyc'
  | 'reset_devices';

interface UserActionDialogProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  user: UserListRow;
  action: UserDialogAction;
  onSubmit: (reason: string) => void;
}

const COPY: Record<
  UserDialogAction,
  {
    titleKey: string;
    bodyKey: string;
    ctaKey: string;
    placeholderKey: string;
    severity: 'info' | 'danger' | 'warning';
    twoStep: boolean;
    confirmTitleKey?: string;
    confirmBodyKey?: string;
    confirmCtaKey?: string;
  }
> = {
  block: {
    titleKey: 'admin.users.action.block.title',
    bodyKey: 'admin.users.action.block.body',
    ctaKey: 'admin.users.action.block.cta',
    placeholderKey: 'admin.users.action.reason-placeholder',
    severity: 'danger',
    twoStep: false,
  },
  unblock: {
    titleKey: 'admin.users.action.unblock.title',
    bodyKey: 'admin.users.action.unblock.body',
    ctaKey: 'admin.users.action.unblock.cta',
    placeholderKey: 'admin.users.action.reason-placeholder',
    severity: 'info',
    twoStep: false,
  },
  soft_delete: {
    titleKey: 'admin.users.action.soft-delete.title',
    bodyKey: 'admin.users.action.soft-delete.body',
    ctaKey: 'admin.users.action.soft-delete.cta',
    placeholderKey: 'admin.users.action.reason-placeholder',
    severity: 'danger',
    twoStep: true,
    confirmTitleKey: 'admin.users.action.soft-delete.confirm-title',
    confirmBodyKey: 'admin.users.action.soft-delete.confirm-body',
    confirmCtaKey: 'admin.users.action.soft-delete.confirm-cta',
  },
  reverify_kyc: {
    titleKey: 'admin.users.action.reverify-kyc.title',
    bodyKey: 'admin.users.action.reverify-kyc.body',
    ctaKey: 'admin.users.action.reverify-kyc.cta',
    placeholderKey: 'admin.users.action.reason-placeholder',
    severity: 'info',
    twoStep: false,
  },
  reset_devices: {
    titleKey: 'admin.users.action.reset-devices.title',
    bodyKey: 'admin.users.action.reset-devices.body',
    ctaKey: 'admin.users.action.reset-devices.cta',
    placeholderKey: 'admin.users.action.reason-placeholder',
    severity: 'warning',
    twoStep: false,
  },
};

export function UserActionDialog({
  open,
  onOpenChange,
  user,
  action,
  onSubmit,
}: UserActionDialogProps) {
  const copy = COPY[action];
  const [reason, setReason] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setReason('');
      setConfirmOpen(false);
    }
  }, [open, action]);

  const valid = reason.trim().length >= 20;

  function handlePrimary() {
    if (!valid) return;
    if (copy.twoStep) {
      setConfirmOpen(true);
    } else {
      onSubmit(reason.trim());
      onOpenChange(false);
    }
  }

  function handleFinalConfirm() {
    onSubmit(reason.trim());
    setConfirmOpen(false);
    onOpenChange(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(copy.titleKey, { name: user.name })}</DialogTitle>
            <DialogDescription>{t(copy.bodyKey, { name: user.name, phone: user.phone })}</DialogDescription>
          </DialogHeader>

          {copy.severity === 'danger' && (
            <div className="rounded-md border border-danger-600/20 bg-danger-50 dark:bg-danger-700/15 px-3 py-2.5 text-sm text-danger-700 dark:text-danger-600 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{t(`admin.users.action.${action}.warning`)}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="user-action-reason">{t('admin.users.action.reason-label')}</Label>
            <Textarea
              id="user-action-reason"
              autoFocus
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t(copy.placeholderKey)}
            />
            <div
              className={cn(
                'text-sm tabular',
                valid ? 'text-muted-foreground' : 'text-muted-foreground',
              )}
            >
              {reason.trim().length} / {t('admin.users.action.confirm-reason-required')}
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {t('common.actions.cancel')}
            </Button>
            <Button
              onClick={handlePrimary}
              disabled={!valid}
              variant={copy.severity === 'danger' ? 'destructive' : 'default'}
            >
              {t(copy.ctaKey)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {copy.twoStep && (
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t(copy.confirmTitleKey!)}</AlertDialogTitle>
              <AlertDialogDescription>
                {t(copy.confirmBodyKey!, { name: user.name })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleFinalConfirm}
                className="bg-danger-600 hover:bg-danger-700 focus:ring-danger-600 text-white"
              >
                {t(copy.confirmCtaKey!)}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
