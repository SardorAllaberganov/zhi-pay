import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { Platform } from '@/data/mockAppVersions';
import {
  PLATFORM_LABEL_KEY,
  LOCALE_LABEL_KEY,
  LOCALE_ORDER,
  type Locale,
} from '../types';
import { LocaleFlag } from '@/components/zhipay/LocaleFlag';
import { PlatformIcon } from '../PlatformIcon';
import { MarkdownView } from '../MarkdownView';

/**
 * App Store / Play Store update prompt mockup, one card per locale.
 *
 * Each card carries a faux header (platform glyph + "What's new in version
 * X") and the markdown-rendered notes body. Renders a calm "—" placeholder
 * when the locale's notes are empty.
 *
 * Visual treatment is platform-agnostic — the spec asks for one preview
 * "for each locale", not a per-platform pixel-faithful App Store / Play
 * Store mock. A subtle divider + platform glyph sets the context without
 * trying to reproduce real store chrome.
 */
export function ReleaseNotesPreviewPane({
  platform,
  version,
  values,
}: {
  platform: Platform;
  version: string;
  values: Record<Locale, string>;
}) {
  const platformName = t(PLATFORM_LABEL_KEY[platform]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <PlatformIcon platform={platform} className="h-4 w-4" tone="muted" />
        <span>
          {t('admin.app-versions.preview.subtitle', {
            platform: platformName,
            version: version || '?.?.?',
          })}
        </span>
      </div>

      {LOCALE_ORDER.map((loc) => (
        <div
          key={loc}
          className={cn(
            'rounded-lg border border-border bg-card overflow-hidden',
            'shadow-sm',
          )}
        >
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <LocaleFlag locale={loc} size="md" />
              <span className="text-sm font-medium">{t(LOCALE_LABEL_KEY[loc])}</span>
            </div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {t('admin.app-versions.preview.whats-new')}
            </span>
          </div>
          <div className="px-4 py-4">
            {values[loc].trim() === '' ? (
              <p className="text-sm text-muted-foreground italic">
                {t('admin.app-versions.preview.empty-locale')}
              </p>
            ) : (
              <MarkdownView text={values[loc]} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
