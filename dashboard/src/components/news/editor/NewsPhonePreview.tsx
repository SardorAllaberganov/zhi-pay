import { Image as ImageIcon, ChevronLeft, Share2 } from 'lucide-react';
import { PhoneMockup } from '@/components/zhipay/PhoneMockup';
import { LocaleFlag, type LocaleCode } from '@/components/zhipay/LocaleFlag';
import { LOCALE_ORDER } from '@/components/zhipay/LocaleTabTextarea';
import { LOCALE_LABEL_KEY } from '@/components/app-versions/types';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { NEWS_EDITOR_PROSE_CLASSES } from './RichTextEditor';

const NEWS_LOCALE_LABEL_KEY: Record<LocaleCode, string> = LOCALE_LABEL_KEY;

interface Props {
  imageUrl: string;
  titles: Record<LocaleCode, string>;
  bodies: Record<LocaleCode, string>;
  /** Active preview locale — independent from the form's authoring locale. */
  locale: LocaleCode;
  onLocaleChange: (loc: LocaleCode) => void;
  className?: string;
}

/**
 * Live preview pane — renders the article body inside the 9:16 phone
 * frame so the author sees what the mobile reader sees as they type.
 */
export function NewsPhonePreview({ imageUrl, titles, bodies, locale, onLocaleChange, className }: Props) {
  const title = titles[locale];
  const body = bodies[locale];

  return (
    <div className={cn('space-y-3', className)}>
      <PreviewLocaleStrip active={locale} onChange={onLocaleChange} />
      <PhoneMockup>
        <div className="absolute inset-0 flex flex-col">
          {/* Faux app top bar */}
          <div className="flex items-center justify-between px-4 pt-9 pb-2 text-foreground/80">
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {t('admin.news.preview.section')}
            </span>
            <Share2 className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Cover image */}
            <div className="aspect-[16/9] w-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
              )}
            </div>
            {/* Title */}
            <div className="px-4 pt-3 pb-1.5">
              <h1 className="text-base font-semibold tracking-tight text-foreground leading-snug">
                {title || (
                  <span className="italic text-muted-foreground">
                    {t('admin.news.preview.title-placeholder')}
                  </span>
                )}
              </h1>
            </div>
            {/* Meta line */}
            <div className="px-4 pb-2 text-[13px] text-muted-foreground">
              {t('admin.news.preview.meta')}
            </div>
            {/* Body */}
            <div
              className={cn('px-4 pb-6 text-sm', NEWS_EDITOR_PROSE_CLASSES, 'prose-sm')}
            >
              {body && body !== '<p></p>' ? (
                <div dangerouslySetInnerHTML={{ __html: body }} />
              ) : (
                <p className="italic text-muted-foreground">
                  {t('admin.news.preview.body-placeholder')}
                </p>
              )}
            </div>
          </div>
        </div>
      </PhoneMockup>
    </div>
  );
}

function PreviewLocaleStrip({
  active,
  onChange,
}: {
  active: LocaleCode;
  onChange: (loc: LocaleCode) => void;
}) {
  return (
    <div role="tablist" className="flex items-center justify-center gap-1.5">
      {LOCALE_ORDER.map((loc) => {
        const isActive = loc === active;
        return (
          <button
            key={loc}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(loc)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 h-7 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              isActive
                ? 'bg-card text-brand-700 dark:text-brand-300 ring-1 ring-brand-300 dark:ring-brand-700/40 shadow-sm'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            )}
          >
            <LocaleFlag locale={loc} size="xs" />
            <span>{t(NEWS_LOCALE_LABEL_KEY[loc])}</span>
          </button>
        );
      })}
    </div>
  );
}
