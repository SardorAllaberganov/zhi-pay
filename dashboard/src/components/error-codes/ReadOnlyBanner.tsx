import { Info } from 'lucide-react';
import { t } from '@/lib/i18n';

/**
 * Top-of-page read-only banner. Slate-tinted info treatment per spec —
 * communicates "code definitions live in deployment migrations, not
 * editable here" without alarming the reviewer. Not dismissable: the
 * read-only contract is a fact about this surface, not a hint.
 */
export function ReadOnlyBanner() {
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-md bg-slate-100 dark:bg-slate-800 px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
    >
      <Info
        className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400"
        aria-hidden="true"
      />
      <p className="leading-snug">{t('admin.error-codes.banner.read-only')}</p>
    </div>
  );
}
