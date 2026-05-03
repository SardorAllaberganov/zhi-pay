import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { t } from '@/lib/i18n';

/**
 * Cross-surface deep-links shown in the row-expanded body. Always shows
 * the Transfers deep-link (works for codes already in `mockTransfers`,
 * lands on the canonical empty-results state for codes that don't
 * create transfer rows — accurate behavior for KYC_REQUIRED etc.).
 *
 * The AML link is rendered only on `SANCTIONS_HIT` since that's the
 * only error code with a clean correlation to a typed AML flag — other
 * compliance codes (LIMIT_*, KYC_*) don't generate flags.
 */

const SANCTIONS_CODE = 'SANCTIONS_HIT';

const LINK_CLASS =
  'inline-flex items-center gap-1.5 text-sm text-brand-700 dark:text-brand-300 hover:text-brand-800 dark:hover:text-brand-200 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm';

export function WhereReferencedLinks({ code }: { code: string }) {
  const isSanctions = code === SANCTIONS_CODE;
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
        {t('admin.error-codes.detail.where-referenced')}
      </h4>
      <ul className="space-y-2">
        <li>
          <Link
            to={`/operations/transfers?failure_code=${encodeURIComponent(code)}`}
            className={LINK_CLASS}
          >
            <span>{t('admin.error-codes.detail.link.transfers')}</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </li>
        {isSanctions && (
          <li>
            <Link to="/compliance/aml-triage?type=sanctions" className={LINK_CLASS}>
              <span>{t('admin.error-codes.detail.link.aml')}</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}
