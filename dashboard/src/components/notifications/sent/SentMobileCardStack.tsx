import { ArrowRightLeft, Megaphone, Settings as SettingsIcon, ShieldAlert, type LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar } from '@/components/users/UserAvatar';
import { cn, formatDateTime, formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { LocaleCode } from '@/components/zhipay/LocaleFlag';
import type { Notification, NotificationType } from '@/data/mockNotifications';
import { StatusChip } from './StatusChip';
import { AudienceCell } from './AudienceCell';

interface Props {
  rows: Notification[];
  loading: boolean;
  onOpen: (id: string) => void;
  adminLocale: LocaleCode;
}

const TYPE_ICONS: Record<NotificationType, LucideIcon> = {
  transfer: ArrowRightLeft,
  promo: Megaphone,
  system: SettingsIcon,
  compliance: ShieldAlert,
};

export function SentMobileCardStack({ rows, loading, onOpen, adminLocale }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {rows.map((n) => {
        const Icon = TYPE_ICONS[n.type];
        const title = pickTitle(n, adminLocale);
        const sentAtRef = n.sentAt ?? n.scheduledFor ?? n.createdAt;
        const isSingle = n.audienceType === 'single';
        const hasStats =
          !isSingle && n.deliveredCount !== null && n.openedCount !== null && n.deliveredCount > 0;
        const pct = hasStats
          ? Math.round((n.openedCount! / n.deliveredCount!) * 100)
          : null;

        return (
          <button
            key={n.id}
            type="button"
            onClick={() => onOpen(n.id)}
            className={cn(
              'w-full text-left rounded-lg border border-border bg-card p-3 space-y-2.5',
              'transition-colors hover:bg-muted/30',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
                <span className="text-sm font-medium truncate">
                  {t(`admin.notifications.compose.type.${n.type}`)}
                </span>
              </div>
              <StatusChip status={n.status} />
            </div>

            <div className="text-sm font-semibold leading-snug break-words">{title}</div>

            <AudienceCell notification={n} />

            <div className="flex items-center justify-between gap-3 pt-1 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <UserAvatar name={n.composedBy.name} size="sm" />
                <span className="truncate">{n.composedBy.name}</span>
              </div>
              <span
                className="text-muted-foreground tabular shrink-0"
                title={formatDateTime(sentAtRef, adminLocale === 'en' ? 'en' : 'ru')}
              >
                {formatRelative(sentAtRef)}
              </span>
            </div>

            {pct !== null && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-sm text-muted-foreground shrink-0">
                  {t('admin.notifications.sent.column.read-rate')}:
                </span>
                <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-brand-500" style={{ width: `${pct}%` }} aria-hidden />
                </div>
                <span className="text-sm font-medium tabular shrink-0">{pct}%</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function pickTitle(n: Notification, locale: LocaleCode): string {
  if (locale === 'uz') return n.titleUz;
  if (locale === 'ru') return n.titleRu;
  return n.titleEn;
}
