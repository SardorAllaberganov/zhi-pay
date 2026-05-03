import { Link } from 'react-router-dom';
import { ArrowUpRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type {
  ServiceFull,
  WebhookEventStatus,
  LatencySpikeAlert,
} from '@/data/mockServices';

interface RecentActivityCardProps {
  service: ServiceFull;
}

export function RecentActivityCard({ service }: RecentActivityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {t('admin.services.detail.recent-activity')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Webhook events */}
        <section>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            {t('admin.services.detail.recent-activity.webhooks')}
          </div>
          {service.recentWebhookEvents.length === 0 ? (
            <div className="text-sm text-muted-foreground italic">
              {t('admin.services.detail.recent-activity.no-webhooks')}
            </div>
          ) : (
            <ul className="divide-y divide-border rounded-md border border-border bg-background">
              {service.recentWebhookEvents.map((evt) => (
                <li key={evt.id}>
                  <Link
                    to={`/compliance/audit-log?entity=service&id=${service.id}`}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 text-sm transition-colors',
                      'hover:bg-accent/40',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-sm',
                    )}
                  >
                    <span className="w-24 shrink-0 text-muted-foreground tabular">
                      {formatRelative(evt.timestamp)}
                    </span>
                    <span className="flex-1 truncate font-mono">{evt.eventType}</span>
                    <WebhookStatusChip status={evt.status} />
                    <ArrowUpRight
                      className="h-3.5 w-3.5 text-muted-foreground shrink-0"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Latency spike alerts */}
        <section>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            {t('admin.services.detail.recent-activity.alerts')}
          </div>
          {service.latencySpikeAlerts.length === 0 ? (
            <div className="text-sm text-muted-foreground italic">
              {t('admin.services.detail.recent-activity.no-alerts')}
            </div>
          ) : (
            <ul className="space-y-1.5">
              {service.latencySpikeAlerts.map((a) => (
                <AlertRow key={a.id} alert={a} />
              ))}
            </ul>
          )}
        </section>
      </CardContent>
    </Card>
  );
}

function WebhookStatusChip({ status }: { status: WebhookEventStatus }) {
  const tone =
    status === 'processed'
      ? 'bg-success-50 text-success-700 dark:bg-success-700/15 dark:text-success-600'
      : status === 'received'
        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
        : 'bg-danger-50 text-danger-700 dark:bg-danger-700/15 dark:text-danger-600';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 h-5 text-xs font-medium shrink-0',
        tone,
      )}
    >
      {t(`admin.services.detail.recent-activity.webhook-status.${status}`)}
    </span>
  );
}

function AlertRow({ alert }: { alert: LatencySpikeAlert }) {
  const Icon = alert.resolved ? CheckCircle2 : AlertTriangle;
  return (
    <li
      className={cn(
        'flex items-center gap-3 rounded-md border px-3 py-2 text-sm',
        alert.resolved
          ? 'border-border bg-background'
          : 'border-warning-600/30 bg-warning-50 dark:bg-warning-700/15',
      )}
    >
      <Icon
        className={cn(
          'h-4 w-4 shrink-0',
          alert.resolved
            ? 'text-success-700 dark:text-success-600'
            : 'text-warning-700 dark:text-warning-600',
        )}
        aria-hidden="true"
      />
      <span className="flex-1 truncate">
        {t('admin.services.detail.recent-activity.alert-line', {
          ms: alert.p95SpikedToMs,
          duration: alert.durationMin,
        })}
      </span>
      <span className="text-muted-foreground tabular shrink-0">
        {formatRelative(alert.timestamp)}
      </span>
    </li>
  );
}
