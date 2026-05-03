import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSession } from '@/lib/auth';
import { listAuditEvents, summarizeContext, type AuditEvent } from '@/data/mockAuditLog';
import { cn, formatDateTime, formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { ActionChip } from '@/components/audit-log/ActionChip';
import { StatusTransitionPill } from '@/components/audit-log/StatusTransitionPill';

const PAGE_SIZE = 25;

const ENTITY_LINK: Partial<Record<AuditEvent['entity']['type'], (id: string) => string>> = {
  transfer: (id) => `/operations/transfers/${id}`,
  user: (id) => `/customers/users/${id}`,
  card: (id) => `/customers/cards/${id}`,
  story: (id) => `/content/stories/${id}`,
  news: (id) => `/content/news/${id}`,
  notification: (id) => `/content/notifications/sent/${id}`,
  blacklist: (id) => `/compliance/blacklist/${id}`,
  service: (id) => `/system/services/${id}`,
  // kyc / aml / fx / commission / app_version → no per-entity detail
  // page in v1; rendered as plain mono id without link.
};

const TWENTY_FOUR_H = 24 * 60 * 60 * 1000;
const SEVEN_D = 7 * 24 * 60 * 60 * 1000;

export function MyAuditTab() {
  const session = useSession();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [shown, setShown] = useState(PAGE_SIZE);

  // Match the AuditLog page's 400ms initial-mount skeleton cadence.
  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(id);
  }, []);

  const rows = useMemo(() => {
    if (!session) return [];
    return listAuditEvents()
      .filter((e) => e.actorType === 'admin' && e.actor.id === session.profile.id)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [session]);

  const stats = useMemo(() => {
    const now = Date.now();
    let last24h = 0;
    let last7d = 0;
    for (const r of rows) {
      const age = now - r.timestamp.getTime();
      if (age <= TWENTY_FOUR_H) last24h += 1;
      if (age <= SEVEN_D) last7d += 1;
    }
    return { last24h, last7d, total: rows.length };
  }, [rows]);

  if (!session) return null;

  return (
    <div className="space-y-6">
      {/* Quick stat row */}
      <Card>
        <CardContent className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-brand-50 p-2 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              <Activity className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                {t('admin.settings.my-audit.stats')}
              </div>
              <div className="text-base font-medium text-foreground">
                {loading ? (
                  <Skeleton className="h-5 w-64" />
                ) : (
                  <span>
                    <span className="font-semibold tabular">{stats.last24h}</span>{' '}
                    {t('admin.settings.my-audit.stats.in-24h')}{' '}
                    <span className="text-muted-foreground">·</span>{' '}
                    <span className="font-semibold tabular">{stats.last7d}</span>{' '}
                    {t('admin.settings.my-audit.stats.in-7d')}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/compliance/audit-log?actor=${encodeURIComponent(session.profile.id)}`)}
          >
            {t('admin.settings.my-audit.open-full')}
            <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
          </Button>
        </CardContent>
      </Card>

      {/* Activity list */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.settings.my-audit.title')}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t('admin.settings.my-audit.subtitle')}
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <ul className="divide-y divide-border">
              {Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="p-4 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </li>
              ))}
            </ul>
          ) : rows.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              {t('admin.settings.my-audit.empty')}
            </div>
          ) : (
            <>
              <ul className="divide-y divide-border">
                {rows.slice(0, shown).map((row) => {
                  const linker = ENTITY_LINK[row.entity.type];
                  const target = linker ? linker(row.entity.id) : null;
                  return (
                    <li key={row.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between md:gap-4">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <ActionChip action={row.action} />
                            <span className="text-sm text-muted-foreground">
                              {t('admin.settings.my-audit.row.entity-prefix')}
                            </span>
                            <span className="text-sm font-medium text-foreground">
                              {t(`admin.audit-log.entity-type.${row.entity.type}`)}
                            </span>
                            {target ? (
                              <button
                                type="button"
                                onClick={() => navigate(target)}
                                className={cn(
                                  'font-mono text-sm text-brand-600 hover:underline',
                                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded',
                                )}
                              >
                                {row.entity.id}
                              </button>
                            ) : (
                              <span className="font-mono text-sm text-muted-foreground">
                                {row.entity.id}
                              </span>
                            )}
                          </div>
                          {row.fromStatus && row.toStatus ? (
                            <StatusTransitionPill from={row.fromStatus} to={row.toStatus} />
                          ) : null}
                          <div className="text-sm text-muted-foreground">
                            {summarizeContext(row).slice(0, 120)}
                            {summarizeContext(row).length > 120 ? '…' : ''}
                          </div>
                          {row.reason ? (
                            <div className="text-sm text-foreground italic">
                              "{row.reason.slice(0, 140)}"
                              {row.reason.length > 140 ? '…' : ''}
                            </div>
                          ) : null}
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-sm text-muted-foreground tabular shrink-0">
                              {formatRelative(row.timestamp)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{formatDateTime(row.timestamp)}</TooltipContent>
                        </Tooltip>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {shown < rows.length ? (
                <div className="border-t border-border p-3 text-center">
                  <Button variant="ghost" size="sm" onClick={() => setShown(shown + PAGE_SIZE)}>
                    {t('admin.settings.my-audit.load-more').replace(
                      '{n}',
                      String(Math.min(PAGE_SIZE, rows.length - shown)),
                    )}
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
