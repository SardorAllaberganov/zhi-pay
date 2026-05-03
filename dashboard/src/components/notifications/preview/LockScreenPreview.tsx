import { ChevronRight, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { LocaleCode } from '@/components/zhipay/LocaleFlag';
import {
  type DeepLinkScreen,
  DEEP_LINK_SCREEN_LABEL_KEY,
} from '@/lib/deepLinkScreens';

interface LockScreenPreviewProps {
  title: string;
  body: string;
  /** Deep-link screen — when present, the card shows a "tap to open <screen>" affordance. */
  deepLinkScreen: DeepLinkScreen | null;
  /** Active locale — drives the "now" timestamp + RTL/numerals (uz/ru/en all LTR for v1). */
  locale: LocaleCode;
}

/**
 * iOS-style lock-screen notification card. Renders inside the
 * `<PhoneMockup>` frame in `<PreviewPane>`.
 *
 * Layout: faux dark wallpaper + clock area at top, then a single
 * notification card centered low in the frame. The card itself is the
 * focus of the preview — we don't try to mimic real iOS chrome perfectly.
 */
export function LockScreenPreview({
  title,
  body,
  deepLinkScreen,
  locale,
}: LockScreenPreviewProps) {
  const safeTitle = title.trim().length > 0 ? title : t('admin.notifications.preview.empty-title');
  const safeBody = body.trim().length > 0 ? body : t('admin.notifications.preview.empty-body');

  return (
    <div
      className={cn(
        'absolute inset-0 flex flex-col items-stretch justify-between',
        'bg-gradient-to-b from-slate-700 via-slate-900 to-black',
        'text-white px-3 pb-6 pt-12',
      )}
    >
      {/* Lock-screen clock / faux date */}
      <div className="text-center">
        <div className="text-5xl font-light tabular tracking-tight">9:41</div>
        <div className="mt-1 text-sm font-medium opacity-90">
          {t(`admin.notifications.preview.lock-screen.weekday.${locale}`)}
        </div>
      </div>

      {/* Notification card */}
      <div
        className={cn(
          'rounded-2xl bg-white/15 backdrop-blur-md text-white shadow-lg',
          'border border-white/10',
          'px-3 py-2.5',
        )}
      >
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-500 text-white">
            <Bell className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="font-semibold tracking-tight">
                {t('admin.notifications.preview.lock-screen.app-name')}
              </span>
              <span className="text-sm opacity-75">
                {t('admin.notifications.preview.now')}
              </span>
            </div>
            <div className="mt-0.5 text-sm font-semibold leading-snug break-words">
              {safeTitle}
            </div>
            <div className="mt-0.5 text-sm leading-snug opacity-95 break-words">
              {safeBody}
            </div>
            {deepLinkScreen && (
              <div className="mt-1.5 inline-flex items-center gap-1 text-sm opacity-80">
                <span className="truncate">
                  {t('admin.notifications.preview.tap-to-open').replace(
                    '{screen}',
                    t(DEEP_LINK_SCREEN_LABEL_KEY[deepLinkScreen]),
                  )}
                </span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
