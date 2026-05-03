import { Bell, ChevronRight, ArrowRightLeft, Megaphone, Settings as SettingsIcon, ShieldAlert, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import {
  type DeepLinkScreen,
  DEEP_LINK_SCREEN_LABEL_KEY,
} from '@/lib/deepLinkScreens';
import type { NotificationType } from '@/data/mockNotifications';

interface InAppPreviewProps {
  type: NotificationType;
  title: string;
  body: string;
  deepLinkScreen: DeepLinkScreen | null;
}

const TYPE_ICONS: Record<NotificationType, LucideIcon> = {
  transfer: ArrowRightLeft,
  promo: Megaphone,
  system: SettingsIcon,
  compliance: ShieldAlert,
};

const TYPE_TONE: Record<NotificationType, string> = {
  transfer: 'bg-brand-100 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300',
  promo: 'bg-success-100 text-success-700 dark:bg-success-950/40 dark:text-success-400',
  system: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  compliance: 'bg-warning-100 text-warning-700 dark:bg-warning-950/40 dark:text-warning-400',
};

/**
 * In-app notifications-list-row preview — what the user sees inside
 * the ZhiPay app when they open the notifications inbox. Renders inside
 * the `<PhoneMockup>` frame in `<PreviewPane>`.
 *
 * Layout: faux app header at top (back chevron + title) + a list of one
 * or two row tiles. Active row is the user's content; ghost rows above
 * give context.
 */
export function InAppPreview({ type, title, body, deepLinkScreen }: InAppPreviewProps) {
  const safeTitle = title.trim().length > 0 ? title : t('admin.notifications.preview.empty-title');
  const safeBody = body.trim().length > 0 ? body : t('admin.notifications.preview.empty-body');
  const Icon = TYPE_ICONS[type];

  return (
    <div className="absolute inset-0 flex flex-col bg-background">
      {/* Faux app header */}
      <div className="flex items-center justify-between px-4 pt-9 pb-3 border-b border-border">
        <Bell className="h-5 w-5 text-muted-foreground" aria-hidden />
        <span className="text-sm font-semibold tracking-tight">
          {t('admin.notifications.preview.in-app.section-title')}
        </span>
        <span className="h-5 w-5" aria-hidden />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {/* Ghost row (older context) */}
        <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2.5 opacity-60">
          <div className="flex items-start gap-2.5">
            <div className={cn('mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md', TYPE_TONE.transfer)}>
              <ArrowRightLeft className="h-3.5 w-3.5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-medium truncate">
                  {t('admin.notifications.preview.in-app.ghost-row.title')}
                </span>
                <span className="text-sm text-muted-foreground shrink-0">2h</span>
              </div>
              <div className="text-sm text-muted-foreground truncate">
                {t('admin.notifications.preview.in-app.ghost-row.body')}
              </div>
            </div>
          </div>
        </div>

        {/* Active (user-authored) row */}
        <div className="rounded-md border border-brand-200 bg-brand-50/60 dark:bg-brand-950/20 px-3 py-2.5">
          <div className="flex items-start gap-2.5">
            <div className={cn('mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md', TYPE_TONE[type])}>
              <Icon className="h-3.5 w-3.5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-semibold truncate">{safeTitle}</span>
                <span className="text-sm text-muted-foreground shrink-0">
                  {t('admin.notifications.preview.now')}
                </span>
              </div>
              <div className="mt-0.5 text-sm leading-snug break-words">{safeBody}</div>
              {deepLinkScreen && (
                <div className="mt-1.5 inline-flex items-center gap-1 text-sm text-brand-700 dark:text-brand-300 font-medium">
                  <span className="truncate">
                    {t(DEEP_LINK_SCREEN_LABEL_KEY[deepLinkScreen])}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
