import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAvatar } from '@/components/users/UserAvatar';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { Notification } from '@/data/mockNotifications';

interface Props {
  notification: Notification;
}

/**
 * Audit / authoring card. Shows who composed it, when, and a deep-link
 * back to the central audit-log filtered to this notification.
 */
export function AuditCard({ notification }: Props) {
  const auditLink = `/compliance/audit-log?entityType=notification&entityId=${encodeURIComponent(
    notification.id,
  )}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.notifications.detail.section.audit')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {t('admin.notifications.detail.audit.composed-by')}
          </span>
          <div className="flex items-center gap-2.5">
            <UserAvatar name={notification.composedBy.name} size="sm" />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{notification.composedBy.name}</div>
              <div className="text-sm text-muted-foreground tabular truncate">
                {notification.composedBy.id}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            {t('admin.notifications.detail.audit.created-at')}
          </span>
          <span className="text-sm font-medium tabular">
            {formatDateTime(notification.createdAt, 'ru')}
          </span>
        </div>

        {notification.sentAt && (
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              {t('admin.notifications.detail.audit.sent-at')}
            </span>
            <span className="text-sm font-medium tabular">
              {formatDateTime(notification.sentAt, 'ru')}
            </span>
          </div>
        )}

        {notification.scheduledFor && (
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              {t('admin.notifications.detail.audit.scheduled-for')}
            </span>
            <span className="text-sm font-medium tabular">
              {formatDateTime(notification.scheduledFor, 'ru')}
            </span>
          </div>
        )}

        {notification.cancelledAt && notification.cancellationReason && (
          <div className="space-y-1.5 rounded-md border border-warning-300 bg-warning-50 dark:border-warning-700/40 dark:bg-warning-950/20 px-3 py-2">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs uppercase tracking-wider font-medium text-warning-800 dark:text-warning-300">
                {t('admin.notifications.detail.audit.cancelled')}
              </span>
              <span className="text-sm font-medium tabular text-warning-800 dark:text-warning-300">
                {formatDateTime(notification.cancelledAt, 'ru')}
              </span>
            </div>
            <p className="text-sm text-warning-800 dark:text-warning-300 whitespace-pre-wrap">
              {notification.cancellationReason}
            </p>
          </div>
        )}

        <div className="pt-1">
          <Button asChild variant="outline" size="sm">
            <Link to={auditLink}>
              <ExternalLink className="mr-1.5 h-4 w-4" aria-hidden />
              {t('admin.notifications.detail.audit.view-in-log')}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
