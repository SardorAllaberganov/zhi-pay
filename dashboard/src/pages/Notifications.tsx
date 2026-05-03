import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';
import type { LocaleCode } from '@/components/zhipay/LocaleFlag';
import { listNotifications } from '@/data/mockNotifications';
import { SentPane } from '@/components/notifications/sent/SentPane';

/**
 * Notifications list page at `/content/notifications`.
 *
 * Lists every sent / scheduled / cancelled notification — the admin's
 * landing surface. The compose flow lives at `/content/notifications/new`
 * (dedicated page following the Stories / News editor pattern).
 */
export function Notifications() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // 350ms initial-mount skeleton — matches News / Stories cadence.
  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(id);
  }, []);

  // Counts driving the subtitle.
  const counts = useMemo(() => {
    const all = listNotifications();
    return {
      total: all.length,
      sent: all.filter((n) => n.status === 'sent').length,
      scheduled: all.filter((n) => n.status === 'scheduled').length,
      cancelled: all.filter((n) => n.status === 'cancelled').length,
    };
  }, []);

  // Page-scoped chord: `n` opens the compose page (matches News' `n`).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      const inField =
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        (e.target as HTMLElement | null)?.isContentEditable;
      if (inField || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'n') {
        e.preventDefault();
        navigate('/content/notifications/new');
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  // Admin locale — for v1 we hardcode 'uz'.
  const adminLocale: LocaleCode = 'uz';

  return (
    <div className="space-y-4">
      {/* Page header — matches News / AppVersions flex pattern */}
      <header className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-start md:justify-between">
        <div className="space-y-1 min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('admin.notifications.title')}
          </h1>
          {loading ? (
            <Skeleton className="h-5 w-72" />
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('admin.notifications.subtitle.counts')
                .replace('{sent}', String(counts.sent))
                .replace('{scheduled}', String(counts.scheduled))
                .replace('{cancelled}', String(counts.cancelled))}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={() => navigate('/content/notifications/new')}>
            <Plus className="h-4 w-4 mr-1.5" aria-hidden />
            {t('admin.notifications.action.new')}
          </Button>
        </div>
      </header>

      <SentPane
        adminLocale={adminLocale}
        onCreateNew={() => navigate('/content/notifications/new')}
      />
    </div>
  );
}
