import { useState } from 'react';
import { Copy, Check, RefreshCw, Activity } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { useCopyFeedback } from '@/hooks/useCopyFeedback';
import type { ServiceFull, HealthCheckPoint } from '@/data/mockServices';

interface HealthChecksCardProps {
  service: ServiceFull;
  onRunCheck: () => void;
  /** When the run-check tick is in flight, disables the button. */
  running?: boolean;
}

export function HealthChecksCard({ service, onRunCheck, running }: HealthChecksCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base">
            {t('admin.services.detail.health-checks')}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onRunCheck}
            disabled={running}
            aria-label={t('admin.services.detail.action.run-check')}
          >
            <RefreshCw
              className={cn('h-4 w-4 mr-1.5', running && 'animate-spin')}
              aria-hidden="true"
            />
            {t('admin.services.detail.action.run-check')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health-check URL row with copy */}
        <UrlRow url={service.healthCheckUrl} />

        {/* Pip strip + legend */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            {t('admin.services.detail.health-checks.last-20')}
          </div>
          <div className="flex items-center gap-1">
            {service.healthChecksLast20.map((p, idx) => (
              <Pip key={idx} point={p} />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <LegendItem tone="ok" />
            <LegendItem tone="slow" />
            <LegendItem tone="failed" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UrlRow({ url }: { url: string }) {
  const { copied, copy } = useCopyFeedback();
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
      <Activity className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
      <code className="flex-1 truncate text-sm font-mono">{url}</code>
      <button
        type="button"
        onClick={() => copy(url)}
        className={cn(
          'inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-sm transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          copied
            ? 'text-success-700 dark:text-success-600'
            : 'text-muted-foreground hover:text-foreground',
        )}
        aria-label={
          copied
            ? t('admin.services.detail.health-checks.copied')
            : t('admin.services.detail.health-checks.copy')
        }
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">
              {t('admin.services.detail.health-checks.copied')}
            </span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">
              {t('admin.services.detail.health-checks.copy')}
            </span>
          </>
        )}
      </button>
    </div>
  );
}

function Pip({ point }: { point: HealthCheckPoint }) {
  const tone =
    point.status === 'ok'
      ? 'bg-success-600 hover:bg-success-700'
      : point.status === 'slow'
        ? 'bg-warning-600 hover:bg-warning-700'
        : 'bg-danger-600 hover:bg-danger-700';
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          tabIndex={-1}
          className={cn(
            'h-6 w-2.5 rounded-sm transition-colors',
            tone,
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
          aria-label={`${point.status} · ${formatRelative(point.timestamp)}`}
        />
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-sm tabular">
          <div className="font-medium capitalize">
            {t(`admin.services.detail.health-checks.status.${point.status}`)}
          </div>
          <div className="text-muted-foreground">
            {formatRelative(point.timestamp)}
            {point.status !== 'failed' && ` · ${point.responseTimeMs} ms`}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function LegendItem({ tone }: { tone: 'ok' | 'slow' | 'failed' }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          'inline-block h-2 w-2 rounded-sm',
          tone === 'ok' && 'bg-success-600',
          tone === 'slow' && 'bg-warning-600',
          tone === 'failed' && 'bg-danger-600',
        )}
        aria-hidden="true"
      />
      {t(`admin.services.detail.health-checks.legend.${tone}`)}
    </span>
  );
}
