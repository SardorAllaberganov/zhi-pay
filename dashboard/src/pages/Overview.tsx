import {
  ArrowDown,
  ArrowUp,
  ArrowRight,
  Activity,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Money } from '@/components/zhipay/Money';
import { MaskedPan } from '@/components/zhipay/MaskedPan';
import { StatusBadge } from '@/components/zhipay/StatusBadge';
import { cn, formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import {
  KPI_SPARKLINE_AML,
  KPI_SPARKLINE_KYC,
  KPI_SPARKLINE_TRANSFERS,
  KPI_SPARKLINE_VOLUME,
  OVERVIEW_KPIS,
  SERVICES,
  STATUS_BREAKDOWN_24H,
  THROUGHPUT_60M,
  TRANSFERS,
} from '@/data/mock';
import type { ServiceHealth } from '@/types';

const SERVICE_HEALTH_DOT: Record<ServiceHealth, string> = {
  green: 'bg-success-600',
  amber: 'bg-warning-600',
  red: 'bg-danger-600',
};

const SERVICE_LABELS: Record<string, string> = {
  alipay: 'Alipay',
  wechat: 'WeChat Pay',
  uzcard: 'UzCard',
  humo: 'Humo',
  visa: 'Visa',
  mastercard: 'Mastercard',
  myid: 'MyID',
};

export function Overview() {
  const recent = TRANSFERS.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t('admin.overview.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('admin.overview.subtitle')}</p>
      </header>

      {/* KPI cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label={t('admin.overview.kpi.transfers-today')}
          value={OVERVIEW_KPIS.transfersToday.value.toLocaleString('en')}
          deltaPct={OVERVIEW_KPIS.transfersToday.deltaPct}
          sparkline={KPI_SPARKLINE_TRANSFERS}
          tone="brand"
        />
        <KpiCard
          label={t('admin.overview.kpi.volume-today')}
          valueNode={
            <Money
              amount={OVERVIEW_KPIS.volumeTodayUzs}
              currency="UZS"
              className="text-3xl font-bold"
            />
          }
          deltaPct={OVERVIEW_KPIS.volumeTodayDeltaPct}
          sparkline={KPI_SPARKLINE_VOLUME}
          tone="success"
        />
        <KpiCard
          label={t('admin.overview.kpi.pending-kyc')}
          value={String(OVERVIEW_KPIS.pendingKyc.value)}
          deltaPct={OVERVIEW_KPIS.pendingKyc.deltaPct}
          sparkline={KPI_SPARKLINE_KYC}
          tone="warning"
          invertDeltaTone
        />
        <KpiCard
          label={t('admin.overview.kpi.open-aml')}
          value={String(OVERVIEW_KPIS.openAml.value)}
          deltaPct={OVERVIEW_KPIS.openAml.deltaPct}
          sparkline={KPI_SPARKLINE_AML}
          tone="danger"
          invertDeltaTone
        />
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-baseline justify-between">
              <div>
                <CardTitle>{t('admin.overview.status-breakdown.title')}</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t('admin.overview.status-breakdown.subtitle')}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 items-center gap-4">
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={STATUS_BREAKDOWN_24H}
                      dataKey="count"
                      nameKey="status"
                      innerRadius={48}
                      outerRadius={70}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {STATUS_BREAKDOWN_24H.map((entry) => (
                        <Cell key={entry.status} fill={entry.fill} />
                      ))}
                    </Pie>
                    <RTooltip
                      contentStyle={{
                        background: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 13,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-2 text-sm">
                {STATUS_BREAKDOWN_24H.map((s) => (
                  <li key={s.status} className="flex items-center gap-2 text-sm">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ background: s.fill }}
                      aria-hidden="true"
                    />
                    <span className="capitalize text-foreground/80 flex-1">{s.status}</span>
                    <span className="tabular font-mono text-muted-foreground">
                      {s.count.toLocaleString('en')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('admin.overview.throughput.title')}</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t('admin.overview.throughput.subtitle')}
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={THROUGHPUT_60M}>
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--brand-600))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <RTooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 13,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Services health */}
      <section>
        <Card>
          <CardHeader>
            <div className="flex items-baseline justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  {t('admin.overview.services.title')}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t('admin.overview.services.subtitle')}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              {SERVICES.map((service) => (
                <div
                  key={service.id}
                  className="rounded-md border border-border bg-background p-3 flex flex-col gap-1"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn('h-2 w-2 rounded-full', SERVICE_HEALTH_DOT[service.health])}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium truncate">
                      {SERVICE_LABELS[service.name] ?? service.name}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground tabular font-mono">
                    {service.latencyMs}ms
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatRelative(service.lastCheckedAt)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Recent activity */}
      <section>
        <Card>
          <CardHeader>
            <div className="flex items-baseline justify-between">
              <div>
                <CardTitle>{t('admin.overview.recent-activity.title')}</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t('admin.overview.recent-activity.subtitle')}
                </p>
              </div>
              <a
                href="/transfers"
                className="text-sm text-brand-600 dark:text-brand-300 hover:underline inline-flex items-center gap-1 font-medium"
              >
                View all <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </a>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.overview.recent-activity.column.user')}</TableHead>
                  <TableHead>{t('admin.overview.recent-activity.column.card')}</TableHead>
                  <TableHead className="text-right">
                    {t('admin.overview.recent-activity.column.amount')}
                  </TableHead>
                  <TableHead>{t('admin.overview.recent-activity.column.recipient')}</TableHead>
                  <TableHead>{t('admin.overview.recent-activity.column.status')}</TableHead>
                  <TableHead className="text-right">
                    {t('admin.overview.recent-activity.column.time')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((tr) => (
                  <TableRow key={tr.id} className="cursor-pointer">
                    <TableCell>
                      <div className="font-medium">{tr.userName}</div>
                      <div className="text-sm text-muted-foreground tabular">{tr.userPhone}</div>
                    </TableCell>
                    <TableCell>
                      <MaskedPan value={tr.cardMaskedPan} scheme={tr.cardScheme} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Money amount={tr.amountUzs} currency="UZS" />
                      <div className="text-sm text-muted-foreground">
                        → <Money amount={tr.amountCny} currency="CNY" className="text-sm" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono tabular font-medium">
                        {tr.recipientIdentifier}
                      </div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground mt-0.5">
                        {tr.destination}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={tr.status} domain="transfer" />
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground tabular">
                      {formatRelative(tr.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value?: string;
  valueNode?: React.ReactNode;
  deltaPct: number;
  sparkline: { i: number; v: number }[];
  tone: 'brand' | 'success' | 'warning' | 'danger';
  /** When true, a positive delta is BAD (e.g. open AML flags going up). */
  invertDeltaTone?: boolean;
}

function KpiCard({
  label,
  value,
  valueNode,
  deltaPct,
  sparkline,
  tone,
  invertDeltaTone,
}: KpiCardProps) {
  const isPositive = deltaPct >= 0;
  const goodDirection = invertDeltaTone ? !isPositive : isPositive;
  const Icon = isPositive ? ArrowUp : ArrowDown;
  const color =
    tone === 'brand'
      ? 'hsl(var(--brand-600))'
      : tone === 'success'
        ? 'hsl(var(--success-600))'
        : tone === 'warning'
          ? 'hsl(var(--warning-600))'
          : 'hsl(var(--danger-600))';

  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="mt-2 flex items-end justify-between gap-3">
          {valueNode ?? (
            <div className="text-3xl font-bold tracking-tight tabular">{value}</div>
          )}
          <div className="h-10 w-20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkline}>
                <defs>
                  <linearGradient id={`spark-${tone}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={color}
                  strokeWidth={1.5}
                  fill={`url(#spark-${tone})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div
          className={cn(
            'mt-2 flex items-center gap-1 text-sm font-medium tabular',
            goodDirection ? 'text-success-700 dark:text-success-600' : 'text-danger-600',
          )}
        >
          <Icon className="h-3 w-3" aria-hidden="true" />
          <span>{Math.abs(deltaPct).toFixed(1)}%</span>
          <span className="text-muted-foreground font-normal">
            {t('admin.overview.kpi.delta.up')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
