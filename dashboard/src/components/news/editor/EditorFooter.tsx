import { ArrowLeft, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

interface Props {
  /** Edit mode shows "Update" instead of "Publish". */
  mode: 'new' | 'edit';
  /** When the article is currently published, the primary stays "Update". */
  isPublishedSnapshot: boolean;
  /** Form values' isPublished — drives whether primary is enabled. */
  formIsPublished: boolean;
  saving: boolean;
  publishing: boolean;
  canSubmitDraft: boolean;
  canSubmitPublish: boolean;
  onBack: () => void;
  onSaveDraft: () => void;
  onPrimary: () => void;
}

export function EditorFooter({
  mode,
  isPublishedSnapshot,
  formIsPublished,
  saving,
  publishing,
  canSubmitDraft,
  canSubmitPublish,
  onBack,
  onSaveDraft,
  onPrimary,
}: Props) {
  const primaryKey =
    mode === 'edit' && isPublishedSnapshot
      ? 'admin.news.editor.action.update'
      : formIsPublished
        ? 'admin.news.editor.action.publish'
        : 'admin.news.editor.action.update-draft';

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card',
        'md:left-[var(--sidebar-width,4rem)]',
        'px-4 md:px-6 py-3',
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1.5" aria-hidden="true" />
          {t('admin.news.editor.action.back')}
        </Button>
        <div className="flex flex-wrap items-center gap-2 ml-auto">
          <Button
            variant="outline"
            onClick={onSaveDraft}
            disabled={!canSubmitDraft || saving || publishing}
          >
            <Save className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {saving ? t('admin.news.editor.action.saving') : t('admin.news.editor.action.save-draft')}
          </Button>
          <Button
            onClick={onPrimary}
            disabled={!canSubmitPublish || saving || publishing}
          >
            <Send className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {publishing
              ? t('admin.news.editor.action.publishing')
              : t(primaryKey)}
          </Button>
        </div>
      </div>
    </div>
  );
}
