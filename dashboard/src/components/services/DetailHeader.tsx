import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ServiceFull } from '@/data/mockServices';
import type { ServiceStatus } from '@/types';
import { ServiceLogo } from './ServiceLogo';
import { ServiceStatusBadge } from './ServiceStatusBadge';
import { HealthDot } from './HealthDot';
import { StatusToggleGroup } from './StatusToggleGroup';
import { healthOverlayTone } from './types';

interface DetailHeaderProps {
  service: ServiceFull;
  onPickStatus: (next: ServiceStatus) => void;
  /** Mobile-only — back to grid. Hidden on `lg+`. */
  onBack?: () => void;
}

/**
 * Detail-pane header. Inline on `lg+` (back-link hidden — the grid stays
 * visible to the left). On `<lg`, full-page detail surfaces the canonical
 * `<ArrowLeft> Back to services` link per LESSONS 2026-05-02.
 */
export function DetailHeader({ service, onPickStatus, onBack }: DetailHeaderProps) {
  const overlay = healthOverlayTone(service);
  return (
    <header className="space-y-3">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className={cn(
            'lg:hidden inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm',
          )}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t('admin.services.detail.back')}
        </button>
      )}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <ServiceLogo name={service.name} size="lg" />
            {overlay && (
              <span className="absolute -top-0.5 -right-0.5">
                <HealthDot tone={overlay} />
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold capitalize truncate">
                {t(`admin.services.name.${service.name}`)}
              </h1>
              <ServiceStatusBadge status={service.status} />
            </div>
            {service.note && (
              <p className="mt-1 text-sm text-muted-foreground">{service.note}</p>
            )}
          </div>
        </div>
        <div className="self-start md:self-auto">
          <StatusToggleGroup current={service.status} onPick={onPickStatus} />
        </div>
      </div>
    </header>
  );
}
