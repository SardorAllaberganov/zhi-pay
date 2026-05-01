import { Check, X, MessageSquarePlus, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { approveBlocked, type KycReview } from '@/data/mockKycQueue';

interface ActionBarProps {
  review: KycReview;
  onApprove: () => void;
  onReject: () => void;
  onRequestInfo: () => void;
  onEscalate: () => void;
  variant?: 'desktop' | 'mobile';
  className?: string;
}

export function ActionBar({
  review,
  onApprove,
  onReject,
  onRequestInfo,
  onEscalate,
  variant = 'desktop',
  className,
}: ActionBarProps) {
  const isPending = review.status === 'pending';
  const block = approveBlocked(review);

  const approveDisabled = !isPending || block !== null;
  const rejectDisabled = !isPending;
  const infoDisabled = !isPending;
  const escalateDisabled = !isPending;

  const approveDisabledReason = !isPending
    ? t('admin.kyc-queue.action.approve.disabled.terminal')
    : block === 'under_18'
      ? t('admin.kyc-queue.action.approve.disabled.under-18')
      : block === 'sanctions_hit'
        ? t('admin.kyc-queue.action.approve.disabled.sanctions')
        : null;

  return (
    <div
      className={cn(
        // <lg: fixed bottom of viewport, full-width on mobile. On md+ the
        //      left edge tracks the live sidebar width via AppShell's
        //      `--sidebar-width` CSS var (64px collapsed / 240px expanded),
        //      so the bar stays inside the main content area regardless of
        //      sidebar state. Escapes ancestor overflow.
        // lg+: static, inline flex-wrap row inside the detail pane.
        'fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-2 border-t border-border bg-card px-4 py-3',
        'md:left-[var(--sidebar-width,4rem)]',
        'lg:static lg:left-auto lg:right-auto lg:flex lg:flex-wrap lg:items-center',
        className,
      )}
      data-kyc-action-bar={variant}
    >
      <ApproveButton
        disabled={approveDisabled}
        disabledReason={approveDisabledReason}
        onClick={onApprove}
      />

      <Button
        variant="destructive"
        onClick={onReject}
        disabled={rejectDisabled}
        className="w-full lg:w-auto"
      >
        <X className="h-4 w-4 mr-1.5" aria-hidden="true" />
        {t('admin.kyc-queue.action.reject')}
      </Button>

      <Button
        variant="outline"
        onClick={onRequestInfo}
        disabled={infoDisabled}
        className="w-full lg:w-auto"
      >
        <MessageSquarePlus className="h-4 w-4 mr-1.5" aria-hidden="true" />
        {t('admin.kyc-queue.action.request-info')}
      </Button>

      <Button
        variant="outline"
        onClick={onEscalate}
        disabled={escalateDisabled}
        className="w-full lg:w-auto"
      >
        <ArrowUpRight className="h-4 w-4 mr-1.5" aria-hidden="true" />
        {t('admin.kyc-queue.action.escalate')}
      </Button>
    </div>
  );
}

interface ApproveButtonProps {
  disabled: boolean;
  disabledReason: string | null;
  onClick: () => void;
}

function ApproveButton({ disabled, disabledReason, onClick }: ApproveButtonProps) {
  const button = (
    <Button onClick={onClick} disabled={disabled} className="w-full lg:w-auto">
      <Check className="h-4 w-4 mr-1.5" aria-hidden="true" />
      {t('admin.kyc-queue.action.approve')}
    </Button>
  );

  if (!disabled || !disabledReason) return button;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="w-full lg:w-auto">
            {button}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {disabledReason}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
