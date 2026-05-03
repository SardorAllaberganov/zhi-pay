import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { LocaleCode } from '@/components/zhipay/LocaleFlag';
import { ComposePane } from '@/components/notifications/compose/ComposePane';

/**
 * Dedicated compose page at `/content/notifications/new`.
 *
 * Mirrors the Stories / News editor pattern — full-page editor with a
 * back-link header at top and the heavy form + sticky preview + sticky-
 * bottom action bar consuming the full viewport.
 */
export function NotificationsCompose() {
  const navigate = useNavigate();

  // Admin locale — for v1 we hardcode 'uz'. Once an admin-locale switcher
  // ships this can read from a global setting/store.
  const adminLocale: LocaleCode = 'uz';

  return (
    <div className="space-y-4">
      {/* Inline header — flow inline (NEVER sticky) per LESSON 2026-05-02 */}
      <header className="space-y-3">
        <div>
          <Link
            to="/content/notifications"
            className={cn(
              'inline-flex items-center gap-1.5 rounded-sm text-sm transition-colors',
              'text-muted-foreground hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            )}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t('admin.notifications.compose.back-to-list')}
          </Link>
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('admin.notifications.compose.page-title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('admin.notifications.compose.page-subtitle')}
          </p>
        </div>
      </header>

      <ComposePane
        adminLocale={adminLocale}
        onCreated={(id) => {
          navigate(`/content/notifications/sent/${id}`);
        }}
        onCancel={() => navigate('/content/notifications')}
      />
    </div>
  );
}
