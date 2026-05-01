import { useState } from 'react';
import { Clock, MoreHorizontal } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/zhipay/StatusBadge';
import { StatusTimeline } from '@/components/zhipay/StatusTimeline';
import {
  computeActionPlan,
  ACTION_ICONS,
  ACTION_LABELS,
  type DetailActionKey,
} from './ActionMenu';
import { formatRelative, cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { Transfer, TransferEvent } from '@/types';

interface Props {
  transfer: Transfer;
  events: TransferEvent[];
  stuckMs: number;
  onAction: (key: DetailActionKey) => void;
}

/**
 * Lighter mobile drawer pattern: persistent 64px bottom bar with status +
 * primary action + Timeline / More triggers. The Timeline trigger opens a
 * Sheet showing the full timeline; the More trigger opens a Sheet with all
 * available actions. Avoids custom drag-handle plumbing — Radix Sheet
 * already handles backdrop / focus / swipe close.
 */
export function MobileActionBar({ transfer, events, stuckMs, onAction }: Props) {
  const plan = computeActionPlan(transfer, stuckMs);
  const PrimaryIcon = ACTION_ICONS[plan.primary.key];
  const [moreOpen, setMoreOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          // <lg only — desktop uses the right-rail action panel. The bar
          // is fixed-bottom; on md the left edge tracks AppShell's
          // `--sidebar-width` var so the bar stays inside the main
          // content area instead of overlapping the collapsed sidebar.
          'lg:hidden fixed bottom-0 left-0 right-0 z-30',
          'md:left-[var(--sidebar-width,4rem)]',
          'bg-background border-t border-border',
          'pb-[env(safe-area-inset-bottom)]',
        )}
        role="toolbar"
      >
        <div className="flex items-center gap-2 px-3 py-2">
          {/* Status + relative time on the left */}
          <div className="flex items-center gap-2 min-w-0">
            <StatusBadge status={transfer.status} domain="transfer" />
            <span className="text-sm text-muted-foreground tabular truncate">
              {formatRelative(transfer.createdAt)}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Sheet open={timelineOpen} onOpenChange={setTimelineOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">
                    {t('admin.transfer-detail.mobile.timeline-button')}
                  </span>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
                <SheetHeader className="text-left pb-3">
                  <SheetTitle>{t('admin.transfer-detail.timeline.title')}</SheetTitle>
                </SheetHeader>
                <div className="pt-2">
                  <StatusTimeline events={events} domain="transfer" />
                </div>
              </SheetContent>
            </Sheet>

            {/* Primary action — the headline tap target */}
            <Button
              variant={plan.primary.destructive ? 'destructive' : 'default'}
              size="sm"
              className={cn(
                'gap-1.5 h-9',
                !plan.primary.destructive && 'bg-brand-600 text-white hover:bg-brand-700',
              )}
              disabled={!plan.primary.enabled}
              onClick={() => onAction(plan.primary.key)}
            >
              <PrimaryIcon className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">
                {t(ACTION_LABELS[plan.primary.key])}
              </span>
              {plan.primary.chip && (
                <span className="ml-1 hidden sm:inline-flex items-center rounded-full bg-white/20 px-1.5 py-0.5 text-xs font-medium">
                  {plan.primary.chip}
                </span>
              )}
            </Button>

            {plan.more.length > 0 && (
              <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" aria-label={t('admin.transfer-detail.mobile.more-button')}>
                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[60vh] overflow-y-auto">
                  <SheetHeader className="text-left pb-3">
                    <SheetTitle>{t('admin.transfer-detail.mobile.more-button')}</SheetTitle>
                  </SheetHeader>
                  <ul className="space-y-2 pt-2">
                    {plan.more.map((d) => {
                      const Icon = ACTION_ICONS[d.key];
                      return (
                        <li key={d.key}>
                          <Button
                            variant={d.destructive && d.enabled ? 'destructive' : 'outline'}
                            className="w-full justify-start gap-2 h-11"
                            disabled={!d.enabled}
                            onClick={() => {
                              setMoreOpen(false);
                              if (d.enabled) onAction(d.key);
                            }}
                          >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                            {t(ACTION_LABELS[d.key])}
                          </Button>
                          {!d.enabled && d.disabledReason && (
                            <div className="mt-1 px-1 text-sm text-muted-foreground">
                              {d.disabledReason}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
      {/* Spacer so content doesn't sit under the sticky bar */}
      <div className="h-16 lg:hidden" aria-hidden="true" />
    </>
  );
}
