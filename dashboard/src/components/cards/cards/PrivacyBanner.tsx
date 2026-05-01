import { ShieldCheck } from 'lucide-react';
import { t } from '@/lib/i18n';

/**
 * Always-visible privacy + policy reminder on the card-detail page.
 *
 * Per `.claude/rules/card-schemes.md` + `core-principles.md` "No PII
 * leakage": full PAN, CVV, full holder document number are never
 * displayed and cannot be retrieved by admin tooling. The unlink-policy
 * line covers the spec requirement that admins cannot remove a card on
 * the user's behalf — communicated here in plain text instead of a
 * disabled-with-tooltip button.
 */
export function PrivacyBanner() {
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-md border border-brand-600/25 bg-brand-50/50 dark:bg-brand-950/20 px-4 py-3"
    >
      <ShieldCheck
        className="mt-0.5 h-4 w-4 shrink-0 text-brand-700 dark:text-brand-400"
        aria-hidden="true"
      />
      <div className="text-sm text-foreground/80 space-y-1">
        <p>{t('admin.cards.privacy-banner')}</p>
        <p className="text-muted-foreground">
          {t('admin.cards.privacy-banner.unlink-policy')}
        </p>
      </div>
    </div>
  );
}
