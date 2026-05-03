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
import { formatDateTime } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 'publish' = drafting → publishing now. 'update' = editing an already-published article. */
  intent: 'publish' | 'update';
  publishedAt: Date | null;
  onConfirm: () => void;
}

export function PublishConfirmDialog({ open, onOpenChange, intent, publishedAt, onConfirm }: Props) {
  const isUpdate = intent === 'update';
  const title = isUpdate
    ? t('admin.news.editor.confirm.update.title')
    : t('admin.news.editor.confirm.publish.title');

  const body = isUpdate
    ? t('admin.news.editor.confirm.update.body')
    : t('admin.news.editor.confirm.publish.body').replace(
        '{when}',
        publishedAt ? formatDateTime(publishedAt) : t('admin.news.editor.confirm.publish.now'),
      );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{body}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {isUpdate
              ? t('admin.news.editor.confirm.update.action')
              : t('admin.news.editor.confirm.publish.action')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
