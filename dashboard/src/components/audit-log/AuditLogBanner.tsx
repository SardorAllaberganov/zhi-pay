import { Info } from 'lucide-react';
import { t } from '@/lib/i18n';

/**
 * Top-of-page banner — always visible. `bg-slate-100` per spec.
 * No dismiss control: append-only is a contract, not a hint.
 */
export function AuditLogBanner() {
  return (
    <div
      className="flex items-start gap-3 rounded-md bg-slate-100 dark:bg-slate-800 px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
      role="note"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden="true" />
      <p className="leading-snug">{t('admin.audit-log.banner.append-only')}</p>
    </div>
  );
}
