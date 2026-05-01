import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SeverityBadge } from '@/components/zhipay/SeverityBadge';
import { StatusBadge } from '@/components/zhipay/StatusBadge';
import { KeyboardHint } from '@/components/zhipay/KeyboardHint';
import { cn, formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import {
  type AmlReview,
  getAmlUserById,
} from '@/data/mockAmlTriage';
import { UserCard } from './cards/UserCard';
import { LinkedTransferCard } from './cards/LinkedTransferCard';
import { FlagContextCard } from './cards/FlagContextCard';
import { SanctionsBanner } from './cards/SanctionsBanner';
import { ActionBar } from './ActionBar';

interface AmlDetailPaneProps {
  review: AmlReview | null;
  onClear: () => void;
  onEscalate: () => void;
  onAssignMe: () => void;
  onReassign: () => void;
  onOpenUserProfile: () => void;
  onOpenTransfer: (transferId: string) => void;
  className?: string;
}

export function AmlDetailPane({
  review,
  onClear,
  onEscalate,
  onAssignMe,
  onReassign,
  onOpenUserProfile,
  onOpenTransfer,
  className,
}: AmlDetailPaneProps) {
  const [copied, setCopied] = useState(false);

  if (!review) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center text-center px-6 py-12',
          'lg:flex-1 lg:min-h-0',
          className,
        )}
      >
        <h3 className="text-base font-semibold mb-1">
          {t('admin.aml-triage.empty.no-selection.title')}
        </h3>
        <p className="text-sm text-muted-foreground max-w-[320px] mb-3">
          {t('admin.aml-triage.empty.no-selection.body', { key: '↵' })}
        </p>
        <KeyboardHint keys={['↵']} />
      </div>
    );
  }

  const reviewRecord = review;
  const user = getAmlUserById(reviewRecord.userId);
  const isSanctions = reviewRecord.flagType === 'sanctions';

  function copyId() {
    navigator.clipboard.writeText(reviewRecord.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div
      className={cn(
        'flex flex-col bg-background',
        // Constrain height + flex-grow only on lg+ — mobile uses natural
        // page scroll so the main element does the scrolling.
        'lg:flex-1 lg:min-h-0',
        className,
      )}
    >
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-3 shrink-0">
        <SeverityBadge severity={reviewRecord.severity} />
        <span className="inline-flex items-center rounded-sm border border-border bg-muted/40 px-1.5 py-px text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t(`admin.aml-triage.filter.type.${reviewRecord.flagType}`)}
        </span>

        <div className="flex items-center gap-1">
          <span className="font-mono tabular text-sm text-foreground/90">
            {reviewRecord.id}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={copyId}
            aria-label={t('admin.aml-triage.detail.copy-id')}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-success-600" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </Button>
        </div>

        <StatusBadge status={reviewRecord.status} domain="aml" />

        <span className="ml-auto text-sm text-muted-foreground tabular">
          {formatRelative(reviewRecord.createdAt)}
        </span>
      </div>

      {/* Body — internal scroll only on lg+; mobile lets main scroll.
          pb-28 on mobile reserves space for the fixed action bar so the
          last card isn't permanently hidden underneath it. */}
      <div
        className="flex-1 px-4 pt-4 pb-28 space-y-4 lg:pb-4 lg:overflow-y-auto lg:min-h-0"
        data-aml-detail-body
      >
        {isSanctions && <SanctionsBanner />}

        {user ? (
          <UserCard user={user} onOpenProfile={onOpenUserProfile} />
        ) : (
          <div className="rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            User record not found ({reviewRecord.userId}). May be hard-deleted.
          </div>
        )}

        <LinkedTransferCard transferId={reviewRecord.transferId} onOpen={onOpenTransfer} />

        <FlagContextCard review={review} />

        {/* Resolution-notes history (only when cleared/escalated) */}
        {reviewRecord.resolutionNotes && (
          <div className="rounded-md border border-border bg-muted/20 p-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5">
              {t('admin.aml-triage.detail.resolution-notes')}
            </div>
            {reviewRecord.clearReason && (
              <div className="text-sm font-medium mb-1">
                {t(`admin.aml-triage.action.clear.reason-code.${reviewRecord.clearReason}`)}
              </div>
            )}
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">
              {reviewRecord.resolutionNotes}
            </p>
          </div>
        )}

        {/* Open user profile shortcut at the bottom — convenience for the
            ActionBar's "Open user" path on smaller screens. */}
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onOpenUserProfile}>
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
            {t('admin.aml-triage.detail.user-card.open-profile')}
          </Button>
        </div>
      </div>

      <ActionBar
        review={review}
        onClear={onClear}
        onEscalate={onEscalate}
        onAssignMe={onAssignMe}
        onReassign={onReassign}
      />
    </div>
  );
}
