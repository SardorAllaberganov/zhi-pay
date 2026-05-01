import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { statusLabel } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { StatusBreakdownEntry } from '@/data/mockUsers';

interface Props {
  data: StatusBreakdownEntry[];
}

const COLORS: Record<StatusBreakdownEntry['status'], string> = {
  completed: 'hsl(var(--success-600))',
  processing: 'hsl(var(--brand-600))',
  failed: 'hsl(var(--danger-600))',
  reversed: 'hsl(var(--warning-600))',
  created: 'hsl(var(--muted-foreground))',
};

export function TransfersByStatusDonut({ data }: Props) {
  const filtered = data.filter((d) => d.count > 0);
  const total = filtered.reduce((sum, d) => sum + d.count, 0);

  const chartData = filtered.map((d) => ({
    name: statusLabel(d.status, 'transfer'),
    value: d.count,
    fill: COLORS[d.status],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.users.detail.chart.status-breakdown')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          {total === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              {t('admin.users.detail.chart.empty')}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={2}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    fontSize: 13,
                    borderRadius: 8,
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--popover))',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 13, paddingTop: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
