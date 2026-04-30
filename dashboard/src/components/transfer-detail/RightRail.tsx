import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { StatusTimeline } from '@/components/zhipay/StatusTimeline';
import {
  computeActionPlan,
  ACTION_ICONS,
  ACTION_LABELS,
  type ActionDescriptor,
  type DetailActionKey,
} from './ActionMenu';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { Transfer, TransferEvent } from '@/types';

interface Props {
  transfer: Transfer;
  events: TransferEvent[];
  stuckMs: number;
  onAction: (key: DetailActionKey) => void;
  /** Pixel offset for the sticky container's `top`. */
  topOffsetPx?: number;
}

export function RightRail({
  transfer,
  events,
  stuckMs,
  onAction,
  topOffsetPx = 16,
}: Props) {
  const plan = computeActionPlan(transfer, stuckMs);
  const PrimaryIcon = ACTION_ICONS[plan.primary.key];

  return (
    <div
      className="hidden lg:flex lg:flex-col gap-4 sticky max-h-[calc(100vh-2rem)] overflow-y-auto"
      style={{ top: topOffsetPx }}
    >
      {/* Status timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {t('admin.transfer-detail.timeline.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <StatusTimeline events={events} domain="transfer" />
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="p-4 space-y-2">
          {/* Primary action */}
          <Button
            variant={plan.primary.destructive ? 'destructive' : 'default'}
            className={cn(
              'w-full justify-center gap-2 h-11',
              !plan.primary.destructive && 'bg-brand-600 text-white hover:bg-brand-700',
            )}
            disabled={!plan.primary.enabled}
            onClick={() => onAction(plan.primary.key)}
          >
            <PrimaryIcon className="h-4 w-4" aria-hidden="true" />
            {t(ACTION_LABELS[plan.primary.key])}
            {plan.primary.chip && (
              <span className="ml-1 inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
                {plan.primary.chip}
              </span>
            )}
          </Button>

          {/* Secondary actions — stacked, no dropdown */}
          {plan.more.length > 0 && (
            <div className="pt-1 space-y-2">
              {plan.more.map((descriptor) => (
                <SecondaryAction
                  key={descriptor.key}
                  descriptor={descriptor}
                  onAction={onAction}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SecondaryAction({
  descriptor,
  onAction,
}: {
  descriptor: ActionDescriptor;
  onAction: (key: DetailActionKey) => void;
}) {
  const Icon = ACTION_ICONS[descriptor.key];
  const button = (
    <Button
      type="button"
      variant="outline"
      onClick={() => descriptor.enabled && onAction(descriptor.key)}
      disabled={!descriptor.enabled}
      className={cn(
        'w-full justify-start gap-2.5 h-10',
        descriptor.destructive && descriptor.enabled
          ? cn(
              'border-danger-600/30 bg-background',
              'text-danger-700 dark:text-danger-600',
              'hover:bg-danger-50 hover:text-danger-700 hover:border-danger-600/40',
              'dark:hover:bg-danger-700/15',
            )
          : '',
      )}
    >
      <Icon
        className={cn(
          'h-4 w-4 shrink-0',
          descriptor.destructive && descriptor.enabled
            ? 'text-danger-600 dark:text-danger-600'
            : 'text-muted-foreground',
        )}
        aria-hidden="true"
      />
      <span className="flex-1 text-left">{t(ACTION_LABELS[descriptor.key])}</span>
    </Button>
  );

  if (!descriptor.enabled && descriptor.disabledReason) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="block">{button}</span>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            {descriptor.disabledReason}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return button;
}
