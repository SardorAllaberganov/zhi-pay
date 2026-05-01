import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatNumber } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { type ChartRangeKey, getFxChartSeries } from '@/data/mockFxRates';

const RANGE_KEYS: ChartRangeKey[] = ['24h', '7d', '30d', '90d'];

interface RateTrendChartProps {
  loading?: boolean;
  className?: string;
}

export function RateTrendChart({ loading, className }: RateTrendChartProps) {
  const [range, setRange] = useState<ChartRangeKey>('24h');
  const data = useMemo(() => getFxChartSeries(range), [range]);

  if (loading) return <RateTrendChartSkeleton className={className} />;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle>{t('admin.fx-config.chart.title')}</CardTitle>
        <div
          role="tablist"
          aria-label={t('admin.fx-config.chart.range-aria')}
          className="inline-flex rounded-md border border-input bg-background px-1 py-0.5 gap-0.5"
        >
          {RANGE_KEYS.map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={range === k}
              onClick={() => setRange(k)}
              className={cn(
                'h-7 px-3.5 text-sm font-medium rounded-sm transition-colors',
                range === k
                  ? 'bg-brand-600 text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800',
              )}
            >
              {t(`admin.fx-config.chart.tab.${k}`)}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
            >
              <CartesianGrid stroke="rgba(148,163,184,0.18)" vertical={false} />
              <XAxis
                dataKey="t"
                tick={{ fontSize: 13 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(148,163,184,0.3)' }}
                minTickGap={32}
              />
              <YAxis
                tick={{ fontSize: 13 }}
                tickFormatter={(v: number) => formatNumber(v, 0)}
                tickLine={false}
                axisLine={{ stroke: 'rgba(148,163,184,0.3)' }}
                domain={['dataMin - 4', 'dataMax + 4']}
                width={56}
              />
              <Tooltip
                contentStyle={{ fontSize: 13 }}
                labelStyle={{ fontSize: 13, fontWeight: 600 }}
                formatter={(val: number, key: string) => [
                  `${formatNumber(val, 2)} ${t('admin.fx-config.unit.uzs-per-cny')}`,
                  key === 'midRate'
                    ? t('admin.fx-config.chart.legend.mid')
                    : t('admin.fx-config.chart.legend.client'),
                ]}
              />
              <Legend
                verticalAlign="top"
                align="right"
                height={28}
                iconType="line"
                wrapperStyle={{ fontSize: 13 }}
                formatter={(key: string) =>
                  key === 'midRate'
                    ? t('admin.fx-config.chart.legend.mid')
                    : t('admin.fx-config.chart.legend.client')
                }
              />
              <Line
                type="monotone"
                dataKey="midRate"
                name="midRate"
                stroke="rgb(148,163,184)"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="clientRate"
                name="clientRate"
                stroke="rgb(10,100,188)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function RateTrendChartSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-56 rounded-md" />
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className="h-[280px] w-full" />
      </CardContent>
    </Card>
  );
}
