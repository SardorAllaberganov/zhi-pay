import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMoneyCompact } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { MonthlyVolumeBucket } from '@/data/mockUsers';

interface Props {
  data: MonthlyVolumeBucket[];
}

export function MonthlyVolumeChart({ data }: Props) {
  const chartData = data.map((d) => ({
    month: d.monthLabel,
    volume: Number(d.volumeUzsTiyins) / 100,
  }));
  const total = chartData.reduce((s, d) => s + d.volume, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.users.detail.chart.monthly-volume')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          {total === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              {t('admin.users.detail.chart.empty')}
            </div>
          ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
              <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 13, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                tick={{ fontSize: 13, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(v: number) => formatMoneyCompact(BigInt(Math.round(v * 100)), 'UZS').replace(' UZS', '')}
                width={56}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                contentStyle={{
                  fontSize: 13,
                  borderRadius: 8,
                  border: '1px solid hsl(var(--border))',
                  background: 'hsl(var(--popover))',
                }}
                labelStyle={{ fontWeight: 500 }}
                formatter={(value: number) => [
                  formatMoneyCompact(BigInt(Math.round(value * 100)), 'UZS'),
                  t('admin.users.detail.chart.volume-tooltip'),
                ]}
              />
              <Bar dataKey="volume" fill="hsl(var(--brand-600))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
