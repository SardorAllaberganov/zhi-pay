import { CalendarPlus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

interface Props {
  onEditReason: () => void;
  onExtendExpiry: () => void;
  onRemove: () => void;
}

/**
 * Detail-page action bar — canonical fixed-bottom overlay per LESSONS
 * 2026-05-02. Page wrapper carries `pb-28` to clear the overlay.
 */
export function BlacklistActionBar({ onEditReason, onExtendExpiry, onRemove }: Props) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card',
        'md:left-[var(--sidebar-width,4rem)]',
        'px-4 md:px-6 py-3',
      )}
    >
      <div
        className={cn(
          // Mobile: stacked grid (Edit + Extend share row 1; Remove on row 2)
          'grid grid-cols-2 gap-2',
          // Desktop: single flex row, primary destructive on the right
          'lg:flex lg:flex-row lg:items-center lg:gap-2',
        )}
      >
        <Button
          variant="outline"
          onClick={onEditReason}
          className="text-warning-700 hover:text-warning-700 dark:text-warning-600 border-warning-600/40"
        >
          <Pencil className="h-4 w-4 mr-2" aria-hidden="true" />
          {t('admin.blacklist.action.edit-reason')}
        </Button>
        <Button variant="outline" onClick={onExtendExpiry}>
          <CalendarPlus className="h-4 w-4 mr-2" aria-hidden="true" />
          {t('admin.blacklist.action.extend')}
        </Button>
        <div className="hidden lg:block lg:flex-1" aria-hidden="true" />
        <Button
          variant="destructive"
          onClick={onRemove}
          className="col-span-2 lg:col-span-1"
        >
          <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
          {t('admin.blacklist.action.remove')}
        </Button>
      </div>
    </div>
  );
}
