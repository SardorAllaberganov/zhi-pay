import { Send, Clock, Megaphone, Filter, User as UserIcon, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatDateTime } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ComposeForm } from '../types';
import type { NotificationAudienceType } from '@/data/mockNotifications';

interface ComposeActionBarProps {
  form: ComposeForm;
  recipientCount: number;
  /** Submit handler — composer parent decides whether to fire validation/raise toast. */
  onSubmit: () => void;
  onCancel: () => void;
  /** Disabled while a confirm dialog is open, or post-submit. */
  submitting: boolean;
}

const AUDIENCE_ICONS: Record<NotificationAudienceType, LucideIcon> = {
  broadcast: Megaphone,
  segment: Filter,
  single: UserIcon,
};

export function ComposeActionBar({
  form,
  recipientCount,
  onSubmit,
  onCancel,
  submitting,
}: ComposeActionBarProps) {
  const isScheduled = form.schedule === 'later';
  const AudIcon = AUDIENCE_ICONS[form.audienceType];

  const audienceSummary = (() => {
    switch (form.audienceType) {
      case 'broadcast':
        return t('admin.notifications.compose.action-bar.audience.broadcast').replace(
          '{count}',
          formatCount(recipientCount),
        );
      case 'segment':
        return t('admin.notifications.compose.action-bar.audience.segment').replace(
          '{count}',
          formatCount(recipientCount),
        );
      case 'single':
        return t('admin.notifications.compose.action-bar.audience.single');
    }
  })();

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card',
        'md:left-[var(--sidebar-width,4rem)]',
        'px-4 md:px-6 py-3',
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Summary chips (left side) */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 h-7 text-sm font-medium',
              'border-border bg-muted/40 text-foreground',
            )}
          >
            <AudIcon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            {audienceSummary}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 h-7 text-sm font-medium',
              'border-border bg-muted/40 text-foreground',
            )}
          >
            {t(`admin.notifications.compose.type.${form.type}`)}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 h-7 text-sm font-medium',
              isScheduled
                ? 'border-brand-300 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300'
                : 'border-border bg-muted/40 text-foreground',
            )}
          >
            {isScheduled ? <Clock className="h-3.5 w-3.5" aria-hidden /> : <Send className="h-3.5 w-3.5" aria-hidden />}
            {isScheduled
              ? t('admin.notifications.compose.action-bar.schedule.later').replace(
                  '{time}',
                  form.scheduledFor ? formatDateTime(form.scheduledFor) : '—',
                )
              : t('admin.notifications.compose.action-bar.schedule.now')}
          </span>
        </div>

        {/* Action buttons (right side) */}
        <div className="flex w-full items-center gap-2 md:w-auto">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 md:flex-none"
          >
            {t('admin.notifications.compose.action-bar.cancel')}
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="flex-1 md:flex-none"
          >
            {isScheduled ? <Clock className="mr-1.5 h-4 w-4" aria-hidden /> : <Send className="mr-1.5 h-4 w-4" aria-hidden />}
            {isScheduled
              ? t('admin.notifications.compose.action.schedule')
              : t('admin.notifications.compose.action.send')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatCount(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
