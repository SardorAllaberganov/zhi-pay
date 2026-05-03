import { LocaleTabInputs } from '@/components/zhipay/LocaleTabInputs';
import { LocaleTabTextarea } from '@/components/zhipay/LocaleTabTextarea';
import { Label } from '@/components/ui/label';
import { t } from '@/lib/i18n';
import type { LocaleCode } from '@/components/zhipay/LocaleFlag';
import type { ComposeForm } from '../types';
import { TITLE_MAX, BODY_MAX } from '../types';

interface ContentSectionProps {
  form: ComposeForm;
  activeLocale: LocaleCode;
  onActiveLocaleChange: (loc: LocaleCode) => void;
  onChange: (next: Partial<ComposeForm>) => void;
  invalidTitleLocales: ReadonlySet<LocaleCode>;
  invalidBodyLocales: ReadonlySet<LocaleCode>;
}

const LOCALE_LABEL_KEY: Record<LocaleCode, string> = {
  uz: 'admin.notifications.compose.locale.uz',
  ru: 'admin.notifications.compose.locale.ru',
  en: 'admin.notifications.compose.locale.en',
};

export function ContentSection({
  form,
  activeLocale,
  onActiveLocaleChange,
  onChange,
  invalidTitleLocales,
  invalidBodyLocales,
}: ContentSectionProps) {
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

  function setTitle(locale: LocaleCode, next: string) {
    if (locale === 'uz') onChange({ titleUz: next });
    if (locale === 'ru') onChange({ titleRu: next });
    if (locale === 'en') onChange({ titleEn: next });
  }
  function setBody(locale: LocaleCode, next: string) {
    // Hard-cap input at BODY_MAX so the counter can't run past 180.
    const clipped = next.length > BODY_MAX ? next.slice(0, BODY_MAX) : next;
    if (locale === 'uz') onChange({ bodyUz: clipped });
    if (locale === 'ru') onChange({ bodyRu: clipped });
    if (locale === 'en') onChange({ bodyEn: clipped });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('admin.notifications.compose.content.title')}</Label>
        <LocaleTabInputs
          values={titles}
          onChange={setTitle}
          active={activeLocale}
          onActiveChange={onActiveLocaleChange}
          invalidLocales={invalidTitleLocales}
          ariaLabelKey="admin.notifications.compose.content.title.aria"
          localeLabelKey={LOCALE_LABEL_KEY}
          placeholderKeyPrefix="admin.notifications.compose.content.title.placeholder"
          requiredErrorKey="admin.notifications.validation.titles-required"
          maxLength={TITLE_MAX}
          idPrefix="notif-title"
        />
      </div>

      <div className="space-y-2">
        <Label>{t('admin.notifications.compose.content.body')}</Label>
        <LocaleTabTextarea
          values={bodies}
          onChange={setBody}
          active={activeLocale}
          onActiveChange={onActiveLocaleChange}
          invalidLocales={invalidBodyLocales}
          idPrefix="notif-body"
          ariaLabelKey="admin.notifications.compose.content.body.aria"
          localeLabelKey={LOCALE_LABEL_KEY}
          placeholderKeyPrefix="admin.notifications.compose.content.body.placeholder"
          requiredErrorKey="admin.notifications.validation.bodies-required"
          hintKey="admin.notifications.compose.content.body.hint"
          charCountKey="admin.notifications.compose.content.body.char-count"
          minHeightPx={120}
          baseRows={3}
        />
      </div>
    </div>
  );
}
