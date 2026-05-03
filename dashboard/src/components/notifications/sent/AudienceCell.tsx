import { Megaphone, Filter } from 'lucide-react';
import { UserAvatar } from '@/components/users/UserAvatar';
import { getUserById } from '@/data/mockUsers';
import { t } from '@/lib/i18n';
import type { Notification } from '@/data/mockNotifications';

interface Props {
  notification: Notification;
}

/**
 * Audience cell rendered in the Sent table + Sent mobile cards. Renders
 * one of three layouts:
 *   - broadcast → Megaphone icon + "All users · {count}"
 *   - segment   → Filter icon + "Segment · {count}"
 *   - single    → UserAvatar + recipient name
 */
export function AudienceCell({ notification }: Props) {
  if (notification.audienceType === 'single') {
    const u = notification.userId ? getUserById(notification.userId) : undefined;
    return (
      <div className="flex items-center gap-2 min-w-0">
        {u ? (
          <>
            <UserAvatar name={u.name} size="sm" />
            <span className="text-sm font-medium truncate">{u.name}</span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground italic truncate">
            {t('admin.notifications.sent.audience.single.unknown')}
          </span>
        )}
      </div>
    );
  }

  const Icon = notification.audienceType === 'broadcast' ? Megaphone : Filter;
  const label =
    notification.audienceType === 'broadcast'
      ? t('admin.notifications.sent.audience.broadcast')
      : t('admin.notifications.sent.audience.segment');

  return (
    <div className="flex items-center gap-2 min-w-0">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
      <span className="text-sm font-medium truncate">{label}</span>
      <span className="text-sm text-muted-foreground tabular shrink-0">
        · {formatCount(notification.recipientCount)}
      </span>
    </div>
  );
}

function formatCount(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
