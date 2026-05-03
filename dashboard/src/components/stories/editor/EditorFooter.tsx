import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

interface Props {
  isEdit: boolean;
  /** When true, disable both submit buttons (form has errors). */
  disabled: boolean;
  saving: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
  /** Whether the publish button reads "Schedule" (publish_at in future) or "Publish". */
  isScheduled: boolean;
}

/**
 * Sticky-bottom action bar — canonical pattern from LESSON 2026-05-02.
 *   `fixed inset-x-0 bottom-0 md:left-[var(--sidebar-width,4rem)]`
 *
 * Page wrapper carries `pb-28` so the last form card clears the bar at full
 * scroll. Two CTAs: Save as draft (secondary) + Publish/Update (primary).
 */
export function EditorFooter({
  isEdit,
  disabled,
  saving,
  onSaveDraft,
  onPublish,
  isScheduled,
}: Props) {
  const navigate = useNavigate();
  const primaryLabel = isEdit
    ? t('admin.stories.editor.action.update')
    : isScheduled
      ? t('admin.stories.editor.action.schedule')
      : t('admin.stories.editor.action.publish');

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card',
        'md:left-[var(--sidebar-width,4rem)]',
        'px-4 md:px-6 py-3',
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" onClick={() => navigate('/content/stories')}>
          <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
          {t('admin.stories.editor.action.back')}
        </Button>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={onSaveDraft} disabled={disabled || saving}>
            <Save className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {t('admin.stories.editor.action.save-draft')}
          </Button>
          <Button onClick={onPublish} disabled={disabled || saving}>
            <Send className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {primaryLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
