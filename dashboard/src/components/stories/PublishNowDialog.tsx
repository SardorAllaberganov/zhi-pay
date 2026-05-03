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
import type { Story } from '@/data/mockStories';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  story: Story | null;
  onConfirm: () => void;
}

/**
 * Single-step confirm to publish a draft (or override a scheduled story to
 * publish immediately). Shape matches the spec's "Publish story now?" line.
 * Heavier 2-step flow is reserved for delete + reorder, which carry larger
 * blast radius.
 */
export function PublishNowDialog({ open, onOpenChange, story, onConfirm }: Props) {
  if (!story) return null;
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('admin.stories.publish-now.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('admin.stories.publish-now.body', { title: story.titleEn })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {t('admin.stories.publish-now.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
