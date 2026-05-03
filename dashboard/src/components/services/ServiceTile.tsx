import { useNavigate, useParams } from 'react-router-dom';
import { cn, formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { type ServiceFull, formatLatencyMs, formatPct } from '@/data/mockServices';
import { ServiceLogo } from './ServiceLogo';
import { ServiceStatusBadge } from './ServiceStatusBadge';
import { HealthDot } from './HealthDot';
import { SuccessRateSparkline } from './SuccessRateSparkline';
import { healthOverlayTone } from './types';

interface ServiceTileProps {
  service: ServiceFull;
}

/**
 * Single service tile. Click navigates to `/system/services/:id` —
 * on `lg+` the right detail pane swaps to that service; on `<lg` the full
 * page swaps to the detail. Selected highlight reads off the URL.
 *
 * Hover lift via `hover:-translate-y-0.5` + softened shadow. Selected tile
 * gets the canonical `ring-2 ring-brand-600 bg-brand-50/60` treatment.
 */
export function ServiceTile({ service }: ServiceTileProps) {
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id: string }>();
  const selected = routeId === service.id;
  const overlayTone = healthOverlayTone(service);
  const degradedSparkline = service.successRate24h < 0.99;

  return (
    <button
      type="button"
      onClick={() => navigate(`/system/services/${service.id}`)}
      aria-pressed={selected}
      aria-label={t('admin.services.tile.aria-label', {
        name: service.name,
        status: t(`admin.services.status.${service.status}`),
      })}
      className={cn(
        'group flex flex-col gap-3 rounded-lg border bg-card p-4 text-left transition-all',
        'hover:-translate-y-0.5 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        selected
          ? 'border-brand-600 bg-brand-50/60 dark:bg-brand-950/40 shadow-sm'
          : 'border-border hover:border-border',
      )}
    >
      {/* Row 1 — logo + name + priority chip */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <ServiceLogo name={service.name} size="md" />
            {overlayTone && (
              <span className="absolute -top-0.5 -right-0.5">
                <HealthDot tone={overlayTone} />
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-base font-semibold capitalize truncate">
              {t(`admin.services.name.${service.name}`)}
            </div>
            <ServiceStatusBadge status={service.status} className="mt-1" />
          </div>
        </div>
        <span
          className={cn(
            'inline-flex h-6 items-center rounded-md border px-2 text-xs font-medium tabular',
            service.priority === 1
              ? 'border-brand-600/30 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
              : 'border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
          )}
        >
          P{service.priority}
        </span>
      </div>

      {/* Row 2 — last-checked */}
      <div className="text-sm text-muted-foreground">
        {t('admin.services.tile.last-checked', {
          time: formatRelative(service.lastCheckedAt),
        })}
      </div>

      {/* Row 3 — latency P50 + success rate sparkline */}
      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {t('admin.services.tile.latency')}
          </span>
          <span className="text-base font-semibold tabular">
            {service.status === 'maintenance' || service.status === 'disabled'
              ? '—'
              : formatLatencyMs(service.latency24h.p50)}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {t('admin.services.tile.success-rate')}
          </span>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-base font-semibold tabular',
                degradedSparkline && 'text-warning-700 dark:text-warning-600',
              )}
            >
              {service.status === 'maintenance' || service.status === 'disabled'
                ? '—'
                : formatPct(service.successRate24h)}
            </span>
            {service.status === 'active' && (
              <SuccessRateSparkline
                values={service.successSparkline24h}
                degraded={degradedSparkline}
              />
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export function ServiceTileSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="h-12 w-12 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-4 w-20 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-5 w-16 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
          </div>
        </div>
        <div className="h-6 w-8 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
      <div className="h-3.5 w-32 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <div className="h-2.5 w-12 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-4 w-14 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </div>
        <div className="space-y-1">
          <div className="h-2.5 w-16 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-4 w-20 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
