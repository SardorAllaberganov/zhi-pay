import { Card, CardContent } from '@/components/ui/card';
import { formatMoneyCompact, formatNumber } from '@/lib/utils';
import { t } from '@/lib/i18n';

interface KpiTrioProps {
  lifetimeVolumeTiyins: bigint;
  lifetimeCount: number;
  successRatePct: number;
}

export function KpiTrio({ lifetimeVolumeTiyins, lifetimeCount, successRatePct }: KpiTrioProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {t('admin.users.detail.kpi.volume')}
          </div>
          <div className="mt-1 text-2xl font-semibold tabular font-mono">
            {formatMoneyCompact(lifetimeVolumeTiyins, 'UZS')}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {t('admin.users.detail.kpi.count')}
          </div>
          <div className="mt-1 text-2xl font-semibold tabular">
            {formatNumber(lifetimeCount, 0)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {t('admin.users.detail.kpi.success-rate')}
          </div>
          <div className="mt-1 text-2xl font-semibold tabular">
            {lifetimeCount === 0 ? '—' : `${successRatePct}%`}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
