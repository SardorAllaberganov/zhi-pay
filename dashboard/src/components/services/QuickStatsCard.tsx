import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatNumber } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { type ServiceFull, formatLatencyMs, formatPct } from '@/data/mockServices';

interface QuickStatsCardProps {
  service: ServiceFull;
}

export function QuickStatsCard({ service }: QuickStatsCardProps) {
  const offline = service.status === 'maintenance' || service.status === 'disabled';
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {t('admin.services.detail.stats')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Row — Latency P50/P95/P99 (24h) */}
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            {t('admin.services.detail.stats.latency-24h')}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="P50" value={offline ? '—' : formatLatencyMs(service.latency24h.p50)} />
            <Stat label="P95" value={offline ? '—' : formatLatencyMs(service.latency24h.p95)} />
            <Stat label="P99" value={offline ? '—' : formatLatencyMs(service.latency24h.p99)} />
          </div>
        </div>

        {/* Row — success rates */}
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            {t('admin.services.detail.stats.success-rate')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat
              label={t('admin.services.detail.stats.window-24h')}
              value={offline ? '—' : formatPct(service.successRate24h)}
              degraded={service.successRate24h < 0.99}
            />
            <Stat
              label={t('admin.services.detail.stats.window-7d')}
              value={formatPct(service.successRate7d)}
              degraded={service.successRate7d < 0.99}
            />
          </div>
        </div>

        {/* Row — uptime / inflight / webhooks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Stat
            label={t('admin.services.detail.stats.uptime-30d')}
            value={formatPct(service.uptime30d, 2)}
          />
          <Stat
            label={t('admin.services.detail.stats.inflight')}
            value={offline ? '0' : formatNumber(service.inflightCount, 0)}
          />
          <Stat
            label={t('admin.services.detail.stats.webhooks-1h')}
            value={offline ? '0' : formatNumber(service.webhooksLastHour, 0)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  degraded,
}: {
  label: string;
  value: string;
  degraded?: boolean;
}) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <div className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
      <div
        className={cn(
          'mt-0.5 text-base font-semibold tabular',
          degraded && 'text-warning-700 dark:text-warning-600',
        )}
      >
        {value}
      </div>
    </div>
  );
}
