import { LocaleFlag, type LocaleCode } from '@/components/zhipay/LocaleFlag';
import { t } from '@/lib/i18n';
import {
  getMessage,
  getSuggestedAction,
  type ErrorCodeWithStats,
} from '@/data/mockErrorCodes';
import { LastTriggeredCard } from './LastTriggeredCard';
import { WhereReferencedLinks } from './WhereReferencedLinks';

/**
 * Inline expanded body for one error-code row. Renders:
 *   1. Three localized message cards (uz / ru / en) — flag header + message.
 *   2. Three suggested-action cards (uz / ru / en) — flag header + action.
 *   3. A 2-column footer:
 *        - WhereReferencedLinks (transfers + AML deep-links)
 *        - LastTriggeredCard (relative time + 24h/7d/30d tiles + sparkline)
 *
 * The two top sections collapse to single-column on narrow viewports
 * (md breakpoint) so each locale card stays readable on tablet and mobile.
 */

const LOCALES: LocaleCode[] = ['uz', 'ru', 'en'];

const LOCALE_LABEL_KEY: Record<LocaleCode, string> = {
  uz: 'admin.error-codes.locale.uz',
  ru: 'admin.error-codes.locale.ru',
  en: 'admin.error-codes.locale.en',
};

export function RowExpanded({ row }: { row: ErrorCodeWithStats }) {
  return (
    <div className="px-4 lg:px-6 py-5 bg-muted/20 dark:bg-muted/10 space-y-5">
      {/* Localized messages */}
      <section>
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
          {t('admin.error-codes.detail.localized-messages')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {LOCALES.map((loc) => (
            <LocaleCard
              key={`msg-${loc}`}
              locale={loc}
              text={getMessage(row, loc)}
            />
          ))}
        </div>
      </section>

      {/* Suggested actions */}
      <section>
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
          {t('admin.error-codes.detail.suggested-action')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {LOCALES.map((loc) => (
            <LocaleCard
              key={`act-${loc}`}
              locale={loc}
              text={getSuggestedAction(row, loc)}
            />
          ))}
        </div>
      </section>

      {/* Footer: cross-references + observability */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <WhereReferencedLinks code={row.code} />
        <LastTriggeredCard code={row.code} />
      </section>
    </div>
  );
}

function LocaleCard({ locale, text }: { locale: LocaleCode; text: string }) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
        <LocaleFlag locale={locale} size="md" />
        <span className="text-sm font-medium">{t(LOCALE_LABEL_KEY[locale])}</span>
      </div>
      <p className="px-4 py-3 text-sm leading-relaxed">{text}</p>
    </div>
  );
}
