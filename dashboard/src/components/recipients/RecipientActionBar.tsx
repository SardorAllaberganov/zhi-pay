import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

interface RecipientActionBarProps {
  onDelete: () => void;
}

/**
 * Sticky-bottom overlay action bar for the Recipient detail page.
 *
 * Position pattern is locked across all detail pages (LESSONS 2026-05-02):
 *   `fixed inset-x-0 bottom-0 md:left-[var(--sidebar-width,4rem)]`
 *
 * The CSS var is set by `AppShell` based on the live sidebar collapsed
 * state (64px collapsed / 240px expanded), so the bar's left edge tracks
 * the actual sidebar regardless of user toggle. Page wrapper carries
 * `pb-28` to clear this overlay at full scroll.
 *
 * Single action — Hard-delete is the only admin action on recipients per
 * the Phase-8 spec (no edit, no force-anything; recipients are user-owned
 * data). Mobile renders full-width; desktop right-aligns to leave room
 * for navigation breathing.
 */
export function RecipientActionBar({ onDelete }: RecipientActionBarProps) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card',
        'md:left-[var(--sidebar-width,4rem)]',
        'px-4 md:px-6 py-3',
      )}
    >
      <div className="flex w-full items-center lg:justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className={cn(
            'w-full lg:w-auto',
            'border-danger-600/40 text-danger-700 hover:bg-danger-50 hover:text-danger-700',
            'dark:text-danger-600 dark:hover:bg-danger-700/10',
            'focus-visible:ring-danger-600',
          )}
        >
          <Trash2 className="h-4 w-4 mr-1.5" aria-hidden="true" />
          {t('admin.recipients.action.hard-delete')}
        </Button>
      </div>
    </div>
  );
}
