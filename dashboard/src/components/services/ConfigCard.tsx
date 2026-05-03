import { useState } from 'react';
import { ChevronDown, ChevronRight, Lock, Pencil } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ServiceFull } from '@/data/mockServices';

interface ConfigCardProps {
  service: ServiceFull;
}

/**
 * Collapsible jsonb viewer (default collapsed). Sensitive keys are masked
 * as `••••••••` with NO reveal affordance — server-side data, never
 * round-tripped to the client. The "Edit config" affordance is rendered
 * disabled per spec ("out of v1 scope").
 */
export function ConfigCard({ service }: ConfigCardProps) {
  const [open, setOpen] = useState(false);
  const sensitive = new Set(service.configSensitiveKeys);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={cn(
              'flex items-center gap-2 text-left -ml-1 px-1 rounded-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            )}
            aria-expanded={open}
          >
            {open ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            )}
            <CardTitle className="text-base">
              {t('admin.services.detail.config')}
            </CardTitle>
          </button>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button variant="outline" size="sm" disabled aria-disabled="true">
                  <Pencil className="h-4 w-4 mr-1.5" aria-hidden="true" />
                  {t('admin.services.detail.config.edit')}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {t('admin.services.detail.config.edit-disabled')}
            </TooltipContent>
          </Tooltip>
        </div>
        {!open && (
          <p className="text-sm text-muted-foreground mt-2">
            {t('admin.services.detail.config.summary')}
          </p>
        )}
      </CardHeader>
      {open && (
        <CardContent>
          <pre className="rounded-md bg-slate-50 dark:bg-slate-900 border border-border p-3 overflow-x-auto overflow-y-hidden text-sm font-mono leading-relaxed">
            <code>
              <span className="text-muted-foreground">{'{'}</span>
              {Object.entries(service.config).map(([key, value], i, arr) => {
                const masked = sensitive.has(key);
                const last = i === arr.length - 1;
                return (
                  <span key={key} className="block pl-4">
                    <span className="text-brand-700 dark:text-brand-300">"{key}"</span>
                    <span className="text-muted-foreground">: </span>
                    {masked ? (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Lock className="h-3 w-3" aria-hidden="true" />
                        <span className="font-mono">"••••••••"</span>
                      </span>
                    ) : typeof value === 'string' ? (
                      <span className="text-foreground">"{String(value)}"</span>
                    ) : (
                      <span className="text-foreground">{String(value)}</span>
                    )}
                    {!last && <span className="text-muted-foreground">,</span>}
                  </span>
                );
              })}
              <span className="text-muted-foreground">{'}'}</span>
            </code>
          </pre>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('admin.services.detail.config.privacy-note')}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
