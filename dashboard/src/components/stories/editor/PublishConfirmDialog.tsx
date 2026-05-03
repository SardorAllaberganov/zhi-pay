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
import { format } from 'date-fns';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When non-null and in the future, dialog reads as Schedule rather than Publish-now. */
  publishedAt: Date | null;
  /** When true, the form is updating an existing story. */
  isEdit: boolean;
  onConfirm: () => void;
}

export function PublishConfirmDialog({
  open,
  onOpenChange,
  publishedAt,
  isEdit,
  onConfirm,
}: Props) {
  const isFuture = publishedAt && publishedAt.getTime() > Date.now();
  const title = isFuture
    ? t('admin.stories.editor.confirm.schedule.title')
    : isEdit
      ? t('admin.stories.editor.confirm.update.title')
      : t('admin.stories.editor.confirm.publish-now.title');
  const body = isFuture && publishedAt
    ? t('admin.stories.editor.confirm.schedule.body', {
        when: format(publishedAt, "MMM d, yyyy 'at' h:mm a"),
      })
    : isEdit
      ? t('admin.stories.editor.confirm.update.body')
      : t('admin.stories.editor.confirm.publish-now.body');
  const cta = isFuture
    ? t('admin.stories.editor.confirm.schedule.cta')
    : isEdit
      ? t('admin.stories.editor.confirm.update.cta')
      : t('admin.stories.editor.confirm.publish-now.cta');

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{body}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{cta}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
