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
import type { News } from '@/data/mockNews';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: News | null;
  onConfirm: () => void;
}

export function PublishNowDialog({ open, onOpenChange, item, onConfirm }: Props) {
  if (!item) return null;
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('admin.news.publish-now.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('admin.news.publish-now.body').replace(
              '{title}',
              item.titleEn || item.titleUz || item.titleRu,
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {t('admin.news.publish-now.action')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
