import { ArrowRight, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SeverityBadge } from '@/components/zhipay/SeverityBadge';
import { StatusBadge } from '@/components/zhipay/StatusBadge';
import { formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { AmlFlag } from '@/types';

interface Props {
  flags: AmlFlag[];
  onOpenFlag: (flagId: string) => void;
}

export function AmlFlagsCard({ flags, onOpenFlag }: Props) {
  if (flags.length === 0) return null;

  const sanctionsHit = flags.some((f) => f.flagType === 'sanctions');

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-danger-600" aria-hidden="true" />
          {t('admin.transfer-detail.aml.title')}
          <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-600 px-1.5 text-xs font-bold text-white">
            {flags.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {sanctionsHit && (
          <div className="rounded-md border border-danger-600/40 bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:bg-danger-700/15 dark:text-danger-600">
            {t('admin.transfer-detail.aml.sanctions-banner')}
          </div>
        )}
        <ul className="divide-y rounded-md border border-border">
          {flags.map((flag) => (
            <li key={flag.id} className="flex items-start justify-between gap-3 p-3">
              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <SeverityBadge severity={flag.severity} />
                  <span className="inline-flex items-center rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {flag.flagType}
                  </span>
                  <StatusBadge status={flag.status} domain="aml" />
                  <span className="text-sm text-muted-foreground tabular">
                    {formatRelative(flag.createdAt)}
                  </span>
                </div>
                <div className="text-sm text-foreground/90">{flag.description}</div>
              </div>
              <button
                type="button"
                onClick={() => onOpenFlag(flag.id)}
                className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              >
                {t('admin.transfer-detail.aml.open')}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
