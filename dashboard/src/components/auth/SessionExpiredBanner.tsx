import { Clock } from 'lucide-react';
import { t } from '@/lib/i18n';

/**
 * Amber-toned banner that renders inside `<AuthCard banner={...}>` when
 * the user lands on /sign-in via `?expired=1` (idle timeout or absolute
 * session expiry).
 */
export function SessionExpiredBanner() {
  return (
    <div className="flex items-start gap-3 bg-amber-50 px-6 py-4 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
      <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p className="text-sm leading-relaxed">{t('admin.sign-in.banner.session-expired')}</p>
    </div>
  );
}
