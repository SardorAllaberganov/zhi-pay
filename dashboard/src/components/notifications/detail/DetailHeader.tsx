import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRightLeft, Megaphone, Settings as SettingsIcon, ShieldAlert, type LucideIcon } from 'lucide-react';
import { cn, formatDateTime, formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { Notification, NotificationType } from '@/data/mockNotifications';
import { StatusChip } from '../sent/StatusChip';
import { AudienceCell } from '../sent/AudienceCell';

interface Props {
  notification: Notification;
}

const TYPE_ICONS: Record<NotificationType, LucideIcon> = {
  transfer: ArrowRightLeft,
  promo: Megaphone,
  system: SettingsIcon,
  compliance: ShieldAlert,
};

/**
 * Detail-page header — flows inline (NEVER sticky per LESSON 2026-05-02),
 * back-link uses `<ArrowLeft> Back to notifications` (no `← ` prefix per
 * LESSON 2026-05-02). Layout matches `UserHeader` / Cards / Transfer detail.
 */
export function DetailHeader({ notification }: Props) {
  const Icon = TYPE_ICONS[notification.type];
  const sentRef = notification.sentAt ?? notification.scheduledFor ?? notification.createdAt;
  const dateLabel = notification.sentAt
    ? t('admin.notifications.detail.sent-at').replace(
        '{value}',
        `${formatRelative(sentRef)} · ${formatDateTime(sentRef, 'ru')}`,
      )
    : notification.status === 'scheduled'
      ? t('admin.notifications.detail.scheduled-for').replace(
          '{value}',
          `${formatRelative(sentRef)} · ${formatDateTime(sentRef, 'ru')}`,
        )
      : notification.status === 'cancelled' && notification.cancelledAt
        ? t('admin.notifications.detail.cancelled-at').replace(
            '{value}',
            `${formatRelative(notification.cancelledAt)} · ${formatDateTime(notification.cancelledAt, 'ru')}`,
          )
        : '';

  return (
    <header className="space-y-3 lg:space-y-4">
      {/* Row 1 — back link */}
      <div>
        <Link
          to="/content/notifications"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-sm text-sm transition-colors',
            'text-muted-foreground hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          )}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t('admin.notifications.detail.back-to-list')}
        </Link>
      </div>

      {/* Row 2 — identity */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md border px-2 h-7 text-sm font-medium',
                'border-border bg-muted/40',
              )}
            >
              <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
              {t(`admin.notifications.compose.type.${notification.type}`)}
            </span>
            <StatusChip status={notification.status} />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
              {notification.titleEn}
            </h1>
          </div>
          {dateLabel && (
            <div className="text-sm text-muted-foreground">{dateLabel}</div>
          )}
        </div>
      </div>

      {/* Row 3 — audience chip */}
      <div className="rounded-md border border-border bg-card px-3 py-2">
        <AudienceCell notification={notification} />
      </div>
    </header>
  );
}
