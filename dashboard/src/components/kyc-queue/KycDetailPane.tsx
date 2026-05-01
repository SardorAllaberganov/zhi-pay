import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/zhipay/StatusBadge';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { KeyboardHint } from '@/components/zhipay/KeyboardHint';
import type { KycReview } from '@/data/mockKycQueue';
import { EdgeCaseBanners } from './cards/EdgeCaseBanners';
import { IdentityCard } from './cards/IdentityCard';
import { DocumentImageCard } from './cards/DocumentImageCard';
import { MyIdResponseCard } from './cards/MyIdResponseCard';
import { ActionBar } from './ActionBar';

interface KycDetailPaneProps {
  review: KycReview | null;
  onApprove: () => void;
  onReject: () => void;
  onRequestInfo: () => void;
  onEscalate: () => void;
  onOpenUser: () => void;
  variant?: 'desktop' | 'mobile';
  className?: string;
}

export function KycDetailPane({
  review,
  onApprove,
  onReject,
  onRequestInfo,
  onEscalate,
  onOpenUser,
  variant = 'desktop',
  className,
}: KycDetailPaneProps) {
  if (!review) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center text-center px-6 py-12 lg:flex-1 lg:min-h-0',
          className,
        )}
      >
        <h3 className="text-base font-semibold mb-1">
          {t('admin.kyc-queue.empty.no-selection.title')}
        </h3>
        <p className="text-sm text-muted-foreground max-w-[320px] mb-3">
          {t('admin.kyc-queue.empty.no-selection.body', { key: '↵' })}
        </p>
        <KeyboardHint keys={['↵']} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col bg-background lg:flex-1 lg:min-h-0',
        className,
      )}
    >
      {/* Top bar — phone + status + open-user link */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 shrink-0">
        <div className="text-base font-semibold tabular truncate">
          {review.userPhone}
        </div>
        <StatusBadge status={review.status} domain="kyc" />
        <div className="ml-auto">
          <Button variant="outline" size="sm" onClick={onOpenUser}>
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
            {t('admin.kyc-queue.detail.open-user')}
          </Button>
        </div>
      </div>

      {/* Scrollable body */}
      <div
        className="flex-1 px-4 pt-4 pb-28 space-y-4 lg:pb-4 lg:overflow-y-auto lg:min-h-0"
        data-kyc-detail-body
      >
        <EdgeCaseBanners review={review} />
        <IdentityCard review={review} />
        <DocumentImageCard review={review} />
        <MyIdResponseCard review={review} />

        {review.status === 'failed' && review.failureNote && (
          <div className="rounded-md border border-danger-600/30 bg-danger-50 dark:bg-danger-700/15 p-3">
            <div className="text-sm font-medium text-danger-700 dark:text-danger-600 mb-1">
              {t(`admin.kyc-queue.action.reject.failure-reason.${review.failureReason ?? 'other'}`)}
            </div>
            <div className="text-sm text-danger-700/90 dark:text-danger-600/90">
              {review.failureNote}
            </div>
          </div>
        )}

        {review.infoRequests > 0 && (
          <div className="text-sm text-muted-foreground">
            {t('admin.kyc-queue.detail.info-requests', { count: review.infoRequests })}
          </div>
        )}
      </div>

      {/* Action bar — sticky bottom */}
      <ActionBar
        review={review}
        onApprove={onApprove}
        onReject={onReject}
        onRequestInfo={onRequestInfo}
        onEscalate={onEscalate}
        variant={variant}
      />
    </div>
  );
}
