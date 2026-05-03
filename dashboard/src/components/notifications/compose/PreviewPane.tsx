import { useState } from 'react';
import { Lock, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { PhoneMockup } from '@/components/zhipay/PhoneMockup';
import { LocaleFlag, type LocaleCode } from '@/components/zhipay/LocaleFlag';
import type { ComposeForm } from '../types';
import { LockScreenPreview } from '../preview/LockScreenPreview';
import { InAppPreview } from '../preview/InAppPreview';

interface PreviewPaneProps {
  form: ComposeForm;
  /**
   * Initial preview locale. Defaults to admin's active locale (passed in)
   * but the user can switch via the locale strip inside the pane.
   */
  initialLocale?: LocaleCode;
  /** When true, suppress the section heading + sticky styling — used inside the mobile sheet. */
  bare?: boolean;
}

type PreviewMode = 'lock-screen' | 'in-app';

const LOCALE_ORDER: LocaleCode[] = ['uz', 'ru', 'en'];

export function PreviewPane({ form, initialLocale = 'uz', bare = false }: PreviewPaneProps) {
  const [mode, setMode] = useState<PreviewMode>('lock-screen');
  const [locale, setLocale] = useState<LocaleCode>(initialLocale);

  const titles: Record<LocaleCode, string> = {
    uz: form.titleUz,
    ru: form.titleRu,
    en: form.titleEn,
  };
  const bodies: Record<LocaleCode, string> = {
    uz: form.bodyUz,
    ru: form.bodyRu,
    en: form.bodyEn,
  };
  const screenForPreview = form.deepLink.enabled ? form.deepLink.screen : null;

  return (
    <aside
      className={cn(
        bare ? 'space-y-3' : 'rounded-md border border-border bg-card p-4 space-y-3',
        !bare && 'lg:sticky lg:top-4',
      )}
    >
      {!bare && (
        <h3 className="text-sm font-semibold tracking-tight">
          {t('admin.notifications.compose.preview.title')}
        </h3>
      )}

      {/* Mode toggle */}
      <div role="tablist" aria-label={t('admin.notifications.compose.preview.mode')} className="flex w-full rounded-md border border-border bg-muted/30 p-1">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'lock-screen'}
          onClick={() => setMode('lock-screen')}
          className={cn(
            'flex-1 inline-flex items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            mode === 'lock-screen'
              ? 'bg-card text-brand-700 dark:text-brand-300 shadow-sm ring-1 ring-brand-300 dark:ring-brand-700/40'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Lock className="h-3.5 w-3.5" aria-hidden />
          {t('admin.notifications.compose.preview.lock-screen')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'in-app'}
          onClick={() => setMode('in-app')}
          className={cn(
            'flex-1 inline-flex items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            mode === 'in-app'
              ? 'bg-card text-brand-700 dark:text-brand-300 shadow-sm ring-1 ring-brand-300 dark:ring-brand-700/40'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Smartphone className="h-3.5 w-3.5" aria-hidden />
          {t('admin.notifications.compose.preview.in-app')}
        </button>
      </div>

      {/* Locale strip — matches LocaleTabInputs label pattern */}
      <div
        role="tablist"
        aria-label={t('admin.notifications.compose.preview.locale')}
        className="flex flex-wrap gap-1"
      >
        {LOCALE_ORDER.map((loc) => {
          const active = loc === locale;
          return (
            <button
              key={loc}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setLocale(loc)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-2.5 h-8 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active
                  ? 'bg-card text-brand-700 dark:text-brand-300 ring-1 ring-brand-300 dark:ring-brand-700/40 shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
              )}
            >
              <LocaleFlag locale={loc} size="sm" />
              <span>{t(`admin.notifications.compose.locale.${loc}`)}</span>
            </button>
          );
        })}
      </div>

      {/* Phone frame */}
      <div className="flex justify-center pt-1">
        <div className="w-full max-w-[280px]">
          <PhoneMockup>
            {mode === 'lock-screen' ? (
              <LockScreenPreview
                title={titles[locale]}
                body={bodies[locale]}
                deepLinkScreen={screenForPreview}
                locale={locale}
              />
            ) : (
              <InAppPreview
                type={form.type}
                title={titles[locale]}
                body={bodies[locale]}
                deepLinkScreen={screenForPreview}
              />
            )}
          </PhoneMockup>
        </div>
      </div>
    </aside>
  );
}
