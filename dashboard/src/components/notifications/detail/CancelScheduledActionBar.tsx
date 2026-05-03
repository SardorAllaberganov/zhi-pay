import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

interface Props {
  onCancelClick: () => void;
}

/**
 * Sticky-bottom action bar shown only on `status='scheduled'` detail
 * pages. Pinned to the viewport bottom edge per LESSON 2026-05-02 (uses
 * `--sidebar-width` so it tracks the live main-content edge on `md+`).
 */
export function CancelScheduledActionBar({ onCancelClick }: Props) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card',
        'md:left-[var(--sidebar-width,4rem)]',
        'px-4 md:px-6 py-3',
      )}
    >
      <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          {t('admin.notifications.detail.cancel-scheduled.action-bar-hint')}
        </p>
        <Button
          type="button"
          variant="destructive"
          onClick={onCancelClick}
          className="w-full md:w-auto"
        >
          <XCircle className="mr-1.5 h-4 w-4" aria-hidden />
          {t('admin.notifications.detail.cancel-scheduled.button')}
        </Button>
      </div>
    </div>
  );
}
