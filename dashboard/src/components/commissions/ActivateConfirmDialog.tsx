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
import { formatDateTime } from '@/lib/utils';
import { t } from '@/lib/i18n';

interface ActivateConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  effectiveFrom: Date;
}

/**
 * Final confirm before creating a new commission_rules row.
 *
 * Spec copy:
 *   "Activate new version now? Transfers created after [effective_from]
 *    will use the new rule. The old version remains read-only in history."
 */
export function ActivateConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  effectiveFrom,
}: ActivateConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('admin.commissions.new.confirm.title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('admin.commissions.new.confirm.body', {
              effectiveFrom: formatDateTime(effectiveFrom),
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {t('admin.commissions.new.confirm.cta')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
