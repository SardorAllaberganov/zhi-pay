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
import { t } from '@/lib/i18n';

interface UpdateConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  inFlightCount: number;
}

/**
 * Final confirm before creating a new fx_rates row.
 * Surfaces the locked-at-old-rate count so the operator understands no
 * existing transfer is recomputed.
 */
export function UpdateConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  inFlightCount,
}: UpdateConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('admin.fx-config.update.confirm.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('admin.fx-config.update.confirm.body', {
              count: inFlightCount.toLocaleString('en'),
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {t('admin.fx-config.update.confirm.cta')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
