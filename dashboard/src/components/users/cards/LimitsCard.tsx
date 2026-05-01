import { ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatMoney } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { UserLimitUsage, UserTier } from '@/data/mockUsers';

interface LimitsCardProps {
  usage: UserLimitUsage;
  tier: UserTier;
}

export function LimitsCard({ usage, tier }: LimitsCardProps) {
  if (tier !== 'tier_2') {
    const bodyKey =
      tier === 'tier_0'
        ? 'admin.users.detail.limits.tier-zero-body'
        : 'admin.users.detail.limits.tier-one-body';
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.users.detail.limits.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-warning-600/20 bg-warning-50 dark:bg-warning-700/15 px-3 py-2.5 text-sm text-warning-700 dark:text-warning-600 flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{t(bodyKey)}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const dailyPct =
    usage.dailyLimitTiyins === 0n
      ? 0
      : Math.min(100, Math.round((Number(usage.dailyUsedTiyins) / Number(usage.dailyLimitTiyins)) * 100));
  const monthlyPct =
    usage.monthlyLimitTiyins === 0n
      ? 0
      : Math.min(
          100,
          Math.round((Number(usage.monthlyUsedTiyins) / Number(usage.monthlyLimitTiyins)) * 100),
        );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.users.detail.limits.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <Bar
          label={t('admin.users.detail.limits.daily')}
          used={usage.dailyUsedTiyins}
          limit={usage.dailyLimitTiyins}
          pct={dailyPct}
        />
        <Bar
          label={t('admin.users.detail.limits.monthly')}
          used={usage.monthlyUsedTiyins}
          limit={usage.monthlyLimitTiyins}
          pct={monthlyPct}
        />
      </CardContent>
    </Card>
  );
}

interface BarProps {
  label: string;
  used: bigint;
  limit: bigint;
  pct: number;
}

function Bar({ label, used, limit, pct }: BarProps) {
  const tone = pct >= 100 ? 'danger' : pct >= 80 ? 'warning' : 'brand';
  const fill =
    tone === 'danger'
      ? 'bg-danger-600'
      : tone === 'warning'
        ? 'bg-warning-600'
        : 'bg-brand-600';
  const text =
    tone === 'danger'
      ? 'text-danger-700'
      : tone === 'warning'
        ? 'text-warning-700'
        : 'text-muted-foreground';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <span className={cn('text-sm tabular', text)}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full transition-all', fill)}
          style={{ width: `${Math.max(2, pct)}%` }}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />
      </div>
      <div className="text-sm text-muted-foreground tabular font-mono">
        {formatMoney(used, 'UZS')} / {formatMoney(limit, 'UZS')}
      </div>
    </div>
  );
}
