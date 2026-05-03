import { Check, ArrowUpRight, UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WriteButton } from '@/components/zhipay/WriteButton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { AmlReview } from '@/data/mockAmlTriage';

interface ActionBarProps {
  review: AmlReview;
  onClear: () => void;
  onEscalate: () => void;
  onAssignMe: () => void;
  onReassign: () => void;
  className?: string;
}

export function ActionBar({
  review,
  onClear,
  onEscalate,
  onAssignMe,
  onReassign,
  className,
}: ActionBarProps) {
  const isTerminal = review.status === 'cleared' || review.status === 'escalated';
  const isSanctions = review.flagType === 'sanctions';

  const clearDisabled = isTerminal || isSanctions;
  const clearDisabledReason = isSanctions
    ? t('admin.aml-triage.action.clear.disabled.sanctions')
    : isTerminal
      ? t('admin.aml-triage.action.clear.disabled.terminal')
      : null;

  const escalateDisabled = isTerminal;

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
      data-aml-action-bar
    >
      <ClearButton
        disabled={clearDisabled}
        disabledReason={clearDisabledReason}
        onClick={onClear}
      />

      <WriteButton
        variant="destructive"
        onClick={onEscalate}
        disabled={escalateDisabled}
        className="w-full lg:w-auto"
      >
        <ArrowUpRight className="h-4 w-4 mr-1.5" aria-hidden="true" />
        {t('admin.aml-triage.action.escalate')}
      </WriteButton>

      <WriteButton
        variant="outline"
        onClick={onAssignMe}
        disabled={isTerminal}
        className="w-full lg:w-auto"
      >
        <UserPlus className="h-4 w-4 mr-1.5" aria-hidden="true" />
        {t('admin.aml-triage.action.assign-me')}
      </WriteButton>

      <WriteButton
        variant="outline"
        onClick={onReassign}
        disabled={isTerminal}
        className="w-full lg:w-auto"
      >
        <Users className="h-4 w-4 mr-1.5" aria-hidden="true" />
        {t('admin.aml-triage.action.reassign')}
      </WriteButton>
    </div>
  );
}

interface ClearButtonProps {
  disabled: boolean;
  disabledReason: string | null;
  onClick: () => void;
}

function ClearButton({ disabled, disabledReason, onClick }: ClearButtonProps) {
  // Two render paths — see KYC ActionBar's ApproveButton for the same
  // pattern. Online + enabled → WriteButton (offline gate); domain-
  // disabled → existing Tooltip wrap surfacing the reason.
  if (!disabled || !disabledReason) {
    return (
      <WriteButton onClick={onClick} disabled={disabled} className="w-full lg:w-auto">
        <Check className="h-4 w-4 mr-1.5" aria-hidden="true" />
        {t('admin.aml-triage.action.clear')}
      </WriteButton>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="w-full lg:w-auto">
            <Button onClick={onClick} disabled className="w-full lg:w-auto">
              <Check className="h-4 w-4 mr-1.5" aria-hidden="true" />
              {t('admin.aml-triage.action.clear')}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {disabledReason}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
