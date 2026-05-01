import { ShieldAlert } from 'lucide-react';
import { t } from '@/lib/i18n';

export function SanctionsBanner() {
  return (
    <div className="rounded-md border border-danger-600/50 bg-danger-50 dark:bg-danger-700/15 p-3">
      <div className="flex items-start gap-2.5">
        <ShieldAlert
          className="mt-0.5 h-5 w-5 shrink-0 text-danger-700 dark:text-danger-600"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-danger-700 dark:text-danger-600">
            {t('admin.aml-triage.detail.sanctions-banner.title')}
          </div>
          <div className="text-sm text-danger-700/90 dark:text-danger-600/90 mt-0.5">
            {t('admin.aml-triage.detail.sanctions-banner.body')}
          </div>
        </div>
      </div>
    </div>
  );
}
