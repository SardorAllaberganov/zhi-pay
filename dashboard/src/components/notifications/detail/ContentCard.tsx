import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LocaleFlag, type LocaleCode } from '@/components/zhipay/LocaleFlag';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { Notification } from '@/data/mockNotifications';

interface Props {
  notification: Notification;
}

const LOCALE_ORDER: LocaleCode[] = ['uz', 'ru', 'en'];

const LOCALE_LABEL_KEY: Record<LocaleCode, string> = {
  uz: 'admin.notifications.compose.locale.uz',
  ru: 'admin.notifications.compose.locale.ru',
  en: 'admin.notifications.compose.locale.en',
};

export function ContentCard({ notification }: Props) {
  const [active, setActive] = useState<LocaleCode>('uz');

  const titles: Record<LocaleCode, string> = {
    uz: notification.titleUz,
    ru: notification.titleRu,
    en: notification.titleEn,
  };
  const bodies: Record<LocaleCode, string> = {
    uz: notification.bodyUz,
    ru: notification.bodyRu,
    en: notification.bodyEn,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.notifications.detail.section.content')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div role="tablist" aria-label={t('admin.notifications.detail.content.locale-tabs')} className="flex flex-wrap gap-1.5">
          {LOCALE_ORDER.map((loc) => {
            const isActive = loc === active;
            return (
              <button
                key={loc}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(loc)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-md px-3 h-9 text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isActive
                    ? 'bg-card text-brand-700 dark:text-brand-300 ring-1 ring-brand-300 dark:ring-brand-700/40 shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                )}
              >
                <LocaleFlag locale={loc} size="sm" />
                <span>{t(LOCALE_LABEL_KEY[loc])}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-3 rounded-md border border-border bg-muted/20 p-4">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {t('admin.notifications.compose.content.title')}
            </span>
            <p className="text-base font-semibold leading-snug break-words">{titles[active]}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {t('admin.notifications.compose.content.body')}
            </span>
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{bodies[active]}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground italic">
          {t('admin.notifications.detail.content.read-only-hint')}
        </p>
      </CardContent>
    </Card>
  );
}
