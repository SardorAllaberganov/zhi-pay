import { AlertTriangle, AlertOctagon, Info, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import {
  ageInYears,
  pendingMinutesAge,
  isExpiringSoon,
  type KycReview,
} from '@/data/mockKycQueue';

interface EdgeCaseBannersProps {
  review: KycReview;
}

export function EdgeCaseBanners({ review }: EdgeCaseBannersProps) {
  const banners: React.ReactNode[] = [];

  if (review.edgeFlag === 'sanctions_hit') {
    banners.push(
      <Banner
        key="sanctions"
        tone="danger"
        Icon={AlertOctagon}
        title={t('admin.kyc-queue.warning.sanctions-hit.title')}
        body={t('admin.kyc-queue.warning.sanctions-hit.body')}
      />,
    );
  }

  if (review.edgeFlag === 'under_18') {
    banners.push(
      <Banner
        key="under-18"
        tone="danger"
        Icon={AlertTriangle}
        title={t('admin.kyc-queue.warning.under-18.title')}
        body={t('admin.kyc-queue.warning.under-18.body', {
          age: ageInYears(review.dob),
        })}
      />,
    );
  }

  if (review.edgeFlag === 'data_mismatch') {
    banners.push(
      <Banner
        key="data-mismatch"
        tone="warning"
        Icon={Info}
        title={t('admin.kyc-queue.warning.data-mismatch.title')}
        body={t('admin.kyc-queue.warning.data-mismatch.body', {
          myid: review.myidFullName,
          user: review.userFullName,
        })}
      />,
    );
  }

  if (review.status === 'pending' && isExpiringSoon(review)) {
    const minutesLeft = Math.max(0, 15 - pendingMinutesAge(review));
    banners.push(
      <Banner
        key="expiring"
        tone="warning"
        Icon={Clock}
        title={t('admin.kyc-queue.warning.expiring-soon.title', {
          minutes: minutesLeft,
        })}
        body={t('admin.kyc-queue.warning.expiring-soon.body')}
      />,
    );
  }

  if (banners.length === 0) return null;
  return <div className="space-y-2">{banners}</div>;
}

interface BannerProps {
  tone: 'danger' | 'warning';
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}

function Banner({ tone, Icon, title, body }: BannerProps) {
  return (
    <div
      className={cn(
        'rounded-md border p-3',
        tone === 'danger'
          ? 'border-danger-600/30 bg-danger-50 dark:bg-danger-700/15'
          : 'border-warning-600/30 bg-warning-50 dark:bg-warning-700/15',
      )}
    >
      <div className="flex items-start gap-2.5">
        <Icon
          className={cn(
            'mt-0.5 h-4 w-4 shrink-0',
            tone === 'danger'
              ? 'text-danger-700 dark:text-danger-600'
              : 'text-warning-700 dark:text-warning-600',
          )}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              'text-sm font-medium',
              tone === 'danger'
                ? 'text-danger-700 dark:text-danger-600'
                : 'text-warning-700 dark:text-warning-600',
            )}
          >
            {title}
          </div>
          <div
            className={cn(
              'text-sm mt-0.5',
              tone === 'danger'
                ? 'text-danger-700/90 dark:text-danger-600/90'
                : 'text-warning-700/90 dark:text-warning-600/90',
            )}
          >
            {body}
          </div>
        </div>
      </div>
    </div>
  );
}
