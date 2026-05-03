import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import {
  cancelScheduledNotification,
  getNotificationById,
  type Notification,
} from '@/data/mockNotifications';
import { DetailHeader } from '@/components/notifications/detail/DetailHeader';
import { ContentCard } from '@/components/notifications/detail/ContentCard';
import { AudienceCard } from '@/components/notifications/detail/AudienceCard';
import { DeepLinkCard } from '@/components/notifications/detail/DeepLinkCard';
import { StatsCard } from '@/components/notifications/detail/StatsCard';
import { AuditCard } from '@/components/notifications/detail/AuditCard';
import { CancelScheduledActionBar } from '@/components/notifications/detail/CancelScheduledActionBar';
import { CancelScheduledDialog } from '@/components/notifications/detail/CancelScheduledDialog';

export function SentNotificationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);
  const [cancelOpen, setCancelOpen] = useState(false);

  const notification: Notification | undefined = useMemo(
    () => (id ? getNotificationById(id) : undefined),
    [id, version],
  );

  useEffect(() => {
    if (!id) return;
    if (!notification) {
      // Unknown id — bounce back to the list with a toast.
      toast.error(t('admin.notifications.detail.not-found'));
      navigate('/content/notifications', { replace: true });
    }
  }, [id, notification, navigate]);

  if (!notification) return null;

  const showCancelBar = notification.status === 'scheduled';

  function handleCancel(reason: string) {
    if (!notification) return;
    const updated = cancelScheduledNotification(notification.id, reason);
    if (updated) {
      toast.success(t('admin.notifications.detail.cancel-scheduled.toast-success'));
      setCancelOpen(false);
      setVersion((v) => v + 1);
    } else {
      toast.error(t('admin.notifications.detail.cancel-scheduled.toast-failure'));
    }
  }

  return (
    <div className={showCancelBar ? 'space-y-6 pb-28' : 'space-y-6'}>
      <DetailHeader notification={notification} />

      {/* Two-column on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <ContentCard notification={notification} />
          <AudienceCard notification={notification} />
          {notification.deepLink && <DeepLinkCard notification={notification} />}
          <AuditCard notification={notification} />
        </div>
        <div className="space-y-4 lg:col-span-1">
          <StatsCard notification={notification} />
        </div>
      </div>

      {showCancelBar && (
        <>
          <CancelScheduledActionBar onCancelClick={() => setCancelOpen(true)} />
          <CancelScheduledDialog
            open={cancelOpen}
            onOpenChange={setCancelOpen}
            notificationTitle={notification.titleEn}
            onConfirm={handleCancel}
          />
        </>
      )}
    </div>
  );
}
