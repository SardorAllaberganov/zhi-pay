import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { getUserById } from '@/data/mockUsers';
import type { Notification } from '@/data/mockNotifications';
import { audienceLanguageBreakdown, broadcastLanguageBreakdown } from '../audienceEstimate';

interface Props {
  notification: Notification;
}

/**
 * Right-rail stats for a sent notification. Renders:
 *   - Total sent (recipient_count)
 *   - Delivered % (with progress bar)
 *   - Opened % (with progress bar)
 *   - Click-through % (when deep_link present + opened > 0)
 *   - Recipient breakdown by language (3-segment horizontal stacked bar)
 *
 * For scheduled / cancelled rows the stats are placeholders ("—") since
 * delivered/opened/click haven't fired yet.
 */
export function StatsCard({ notification }: Props) {
  const langBreakdown = useMemo(() => {
    if (notification.audienceType === 'single') {
      const u = notification.userId ? getUserById(notification.userId) : undefined;
      const total = u ? 1 : 0;
      return {
        uz: u?.preferredLanguage === 'uz' ? 1 : 0,
        ru: u?.preferredLanguage === 'ru' ? 1 : 0,
        en: u?.preferredLanguage === 'en' ? 1 : 0,
        total,
      };
    }
    if (notification.audienceType === 'broadcast') return broadcastLanguageBreakdown();
    if (notification.audienceCriteria) {
      return audienceLanguageBreakdown({
        tiers: notification.audienceCriteria.tiers ?? [],
        languages: notification.audienceCriteria.languages ?? [],
        hasLinkedCard: notification.audienceCriteria.hasLinkedCard ?? null,
        hasCompletedTransfer: notification.audienceCriteria.hasCompletedTransfer ?? null,
        lastLogin: notification.audienceCriteria.lastLogin ?? null,
      });
    }
    return { uz: 0, ru: 0, en: 0, total: 0 };
  }, [notification]);

  const isPostSend = notification.deliveredCount !== null && notification.openedCount !== null;
  const showClickthrough = notification.deepLink !== null && isPostSend;

  const recipientPct = (n: number | null): string => {
    if (n === null || notification.recipientCount === 0) return '—';
    const pct = Math.round((n / notification.recipientCount) * 100);
    return `${pct}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.notifications.detail.section.stats')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Stat
          labelKey="admin.notifications.detail.stats.total"
          value={formatCount(notification.recipientCount)}
        />

        <ProgressStat
          labelKey="admin.notifications.detail.stats.delivered"
          count={notification.deliveredCount}
          total={notification.recipientCount}
          pctLabel={recipientPct(notification.deliveredCount)}
        />

        <ProgressStat
          labelKey="admin.notifications.detail.stats.opened"
          count={notification.openedCount}
          total={notification.recipientCount}
          pctLabel={recipientPct(notification.openedCount)}
        />

        {showClickthrough && (
          <ProgressStat
            labelKey="admin.notifications.detail.stats.click-through"
            count={notification.clickThroughCount}
            total={notification.openedCount ?? 0}
            pctLabel={
              notification.clickThroughCount === null || notification.openedCount === 0
                ? '—'
                : `${Math.round(
                    ((notification.clickThroughCount ?? 0) / (notification.openedCount ?? 1)) * 100,
                  )}%`
            }
          />
        )}

        <div className="pt-1 space-y-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {t('admin.notifications.detail.stats.language-breakdown')}
          </div>
          <LanguageStackedBar breakdown={langBreakdown} />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ labelKey, value }: { labelKey: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-sm text-muted-foreground">{t(labelKey)}</span>
      <span className="text-base font-semibold tabular">{value}</span>
    </div>
  );
}

function ProgressStat({
  labelKey,
  count,
  total,
  pctLabel,
}: {
  labelKey: string;
  count: number | null;
  total: number;
  pctLabel: string;
}) {
  const pct = count === null || total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-muted-foreground">{t(labelKey)}</span>
        <span className="text-sm font-medium tabular">
          {count === null ? '—' : formatCount(count)}{' '}
          <span className="text-muted-foreground">· {pctLabel}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-brand-500 transition-all"
          style={{ width: `${pct}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}

function LanguageStackedBar({
  breakdown,
}: {
  breakdown: { uz: number; ru: number; en: number; total: number };
}) {
  if (breakdown.total === 0) {
    return (
      <div className="rounded-full bg-muted h-2.5">
        <span className="sr-only">{t('admin.notifications.detail.stats.no-recipients')}</span>
      </div>
    );
  }
  const uzPct = (breakdown.uz / breakdown.total) * 100;
  const ruPct = (breakdown.ru / breakdown.total) * 100;
  const enPct = (breakdown.en / breakdown.total) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full bg-brand-500 transition-all')}
          style={{ width: `${uzPct}%` }}
          aria-label={t('admin.notifications.compose.locale.uz')}
        />
        <div
          className={cn('h-full bg-success-500 transition-all')}
          style={{ width: `${ruPct}%` }}
          aria-label={t('admin.notifications.compose.locale.ru')}
        />
        <div
          className={cn('h-full bg-warning-500 transition-all')}
          style={{ width: `${enPct}%` }}
          aria-label={t('admin.notifications.compose.locale.en')}
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <LegendDot toneClass="bg-brand-500" labelKey="admin.notifications.compose.locale.uz" pct={Math.round(uzPct)} />
        <LegendDot toneClass="bg-success-500" labelKey="admin.notifications.compose.locale.ru" pct={Math.round(ruPct)} />
        <LegendDot toneClass="bg-warning-500" labelKey="admin.notifications.compose.locale.en" pct={Math.round(enPct)} />
      </div>
    </div>
  );
}

function LegendDot({ toneClass, labelKey, pct }: { toneClass: string; labelKey: string; pct: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('h-2 w-2 rounded-full', toneClass)} aria-hidden />
      <span className="text-muted-foreground">{t(labelKey)}</span>
      <span className="tabular font-medium">{pct}%</span>
    </span>
  );
}

function formatCount(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
