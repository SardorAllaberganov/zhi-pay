import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Clock,
  Inbox,
  RefreshCw,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Money } from '@/components/zhipay/Money';
import { MaskedPan } from '@/components/zhipay/MaskedPan';
import { StatusBadge } from '@/components/zhipay/StatusBadge';
import { DestinationBadge } from '@/components/zhipay/DestinationBadge';
import { cn, formatMoney, formatMoneyCompact, formatNumber, formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import {
  AML_FLAGS,
  FX_RATE_24H,
  FX_RATES,
  KPI_SPARKLINE_AML,
  KPI_SPARKLINE_KYC,
  KPI_SPARKLINE_TRANSFERS,
  KPI_SPARKLINE_VOLUME,
  OVERVIEW_KPIS,
  SERVICES,
  STATUS_BREAKDOWN_TODAY,
  THROUGHPUT_60M,
  TRANSFERS,
} from '@/data/mock';
import type { Service, ServiceHealth } from '@/types';

// =====================================================================
// State flags — flip in dev to preview empty / error variants.
// HAS_DATA=false → KPIs em-dash, charts empty, recent activity empty.
// FEED_HEALTHY=false → top banner + stale indicator on KPIs/charts.
// =====================================================================
const HAS_DATA = true;
const FEED_HEALTHY = true;

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

type RangeKey = 'today' | 'yesterday' | '7d' | '30d';

const RANGE_LABELS: Record<RangeKey, string> = {
  today: 'admin.overview.range.today',
  yesterday: 'admin.overview.range.yesterday',
  '7d': 'admin.overview.range.7d',
  '30d': 'admin.overview.range.30d',
};

// =====================================================================
// Page
// =====================================================================
export function Overview() {
  const navigate = useNavigate();

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [, setTick] = useState(0);
  const [range, setRange] = useState<RangeKey>('today');
  const [feedHealthy, setFeedHealthy] = useState(FEED_HEALTHY);

  // Initial skeleton — clears after 600ms.
  useEffect(() => {
    const id = window.setTimeout(() => setIsInitialLoading(false), 600);
    return () => window.clearTimeout(id);
  }, []);

  // Auto-refresh every 30s. Subtle pulse only — never re-show skeleton.
  useEffect(() => {
    const id = window.setInterval(() => {
      setLastRefreshedAt(new Date());
      setPulse((p) => p + 1);
    }, 30_000);
    return () => window.clearInterval(id);
  }, []);

  // Tick every 5s so relative timestamps stay fresh.
  useEffect(() => {
    const id = window.setInterval(() => setTick((c) => c + 1), 5_000);
    return () => window.clearInterval(id);
  }, []);

  // Page-level shortcut: `r` refresh (skips when `g` was just pressed
  // so the global g+r shortcut can route to /recipients first).
  const lastKeyRef = useRef<string | null>(null);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isTypingContext(e.target)) return;

      if (e.key === 'g') {
        lastKeyRef.current = 'g';
        window.setTimeout(() => {
          if (lastKeyRef.current === 'g') lastKeyRef.current = null;
        }, 1000);
        return;
      }

      if (
        e.key === 'r' &&
        lastKeyRef.current !== 'g' &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.shiftKey
      ) {
        e.preventDefault();
        handleRefresh();
        return;
      }

      lastKeyRef.current = null;
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleRefresh() {
    setIsRefreshing(true);
    setLastRefreshedAt(new Date());
    setPulse((p) => p + 1);
    window.setTimeout(() => setIsRefreshing(false), 500);
  }

  const recentTransfers = HAS_DATA ? TRANSFERS : [];
  const hasCriticalAml = AML_FLAGS.some(
    (f) => f.severity === 'critical' && (f.status === 'open' || f.status === 'reviewing'),
  );

  const stale = !feedHealthy;

  return (
    <div className="space-y-6">
      <PageHeader
        range={range}
        onRangeChange={setRange}
        lastRefreshedAt={lastRefreshedAt}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      {!feedHealthy && (
        <ErrorBanner
          lastRefreshedAt={lastRefreshedAt}
          onRetry={() => {
            setFeedHealthy(true);
            handleRefresh();
          }}
        />
      )}

      {/* KPI strip */}
      <section
        aria-label="Key performance indicators"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {isInitialLoading ? (
          <>
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
          </>
        ) : (
          <>
            <KpiCard
              label={t('admin.overview.kpi.transfers-today')}
              value={HAS_DATA ? OVERVIEW_KPIS.transfersToday.value.toLocaleString('en') : '—'}
              deltaPct={OVERVIEW_KPIS.transfersToday.deltaPct}
              sparkline={KPI_SPARKLINE_TRANSFERS}
              tone="brand"
              hasData={HAS_DATA}
              stale={stale}
              pulseKey={pulse}
              onActivate={() => navigate('/transfers')}
            />
            <KpiCard
              label={t('admin.overview.kpi.volume-today')}
              valueNode={
                HAS_DATA ? (
                  <span
                    className="font-mono text-3xl font-bold tabular-nums"
                    title={formatMoney(OVERVIEW_KPIS.volumeTodayUzs, 'UZS', 'en')}
                  >
                    {formatMoneyCompact(OVERVIEW_KPIS.volumeTodayUzs, 'UZS')}
                  </span>
                ) : (
                  <span className="text-3xl font-bold tabular-nums">—</span>
                )
              }
              deltaPct={OVERVIEW_KPIS.volumeTodayDeltaPct}
              sparkline={KPI_SPARKLINE_VOLUME}
              tone="success"
              hasData={HAS_DATA}
              stale={stale}
              pulseKey={pulse}
              onActivate={() => navigate('/transfers')}
            />
            <KpiCard
              label={t('admin.overview.kpi.pending-kyc')}
              value={HAS_DATA ? String(OVERVIEW_KPIS.pendingKyc.value) : '—'}
              deltaPct={OVERVIEW_KPIS.pendingKyc.deltaPct}
              sparkline={KPI_SPARKLINE_KYC}
              tone="warning"
              invertDeltaTone
              hasData={HAS_DATA}
              stale={stale}
              alert={HAS_DATA && OVERVIEW_KPIS.pendingKyc.value > 50}
              pulseKey={pulse}
              onActivate={() => navigate('/kyc-queue')}
            />
            <KpiCard
              label={t('admin.overview.kpi.open-aml')}
              value={HAS_DATA ? String(OVERVIEW_KPIS.openAml.value) : '—'}
              deltaPct={OVERVIEW_KPIS.openAml.deltaPct}
              sparkline={KPI_SPARKLINE_AML}
              tone="danger"
              invertDeltaTone
              hasData={HAS_DATA}
              stale={stale}
              alert={HAS_DATA && hasCriticalAml}
              pulseKey={pulse}
              onActivate={() => navigate('/aml-triage')}
            />
          </>
        )}
      </section>

      {/* Two-column charts row */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isInitialLoading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <StatusBreakdownCard hasData={HAS_DATA} />
            <ThroughputCard hasData={HAS_DATA} />
          </>
        )}
      </section>

      {/* FX spread health */}
      {isInitialLoading ? (
        <ChartSkeleton tall />
      ) : (
        <FxSpreadHealthCard onUpdateRate={() => navigate('/fx-config')} />
      )}

      {/* Services & health */}
      {isInitialLoading ? (
        <ServicesSkeleton />
      ) : (
        <ServicesHealthCard
          services={SERVICES}
          onSelect={(s) => navigate(`/services?service=${s.name}`)}
        />
      )}

      {/* Recent activity */}
      {isInitialLoading ? (
        <ActivitySkeleton />
      ) : (
        <RecentActivityCard
          transfers={recentTransfers}
          onRowClick={(id) => navigate(`/transfers?id=${id}`)}
          onViewAll={() => navigate('/transfers')}
        />
      )}
    </div>
  );
}

// =====================================================================
// Page header
// =====================================================================
interface PageHeaderProps {
  range: RangeKey;
  onRangeChange: (r: RangeKey) => void;
  lastRefreshedAt: Date;
  isRefreshing: boolean;
  onRefresh: () => void;
}

function PageHeader({
  range,
  onRangeChange,
  lastRefreshedAt,
  isRefreshing,
  onRefresh,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('admin.overview.title')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t('admin.overview.subtitle')}</p>
      </div>

      <div className="flex items-center gap-2">
        <span
          className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted-foreground tabular"
          aria-live="polite"
        >
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {t('admin.overview.refreshed-at', { time: formatRelative(lastRefreshedAt) })}
        </span>

        <button
          type="button"
          onClick={onRefresh}
          aria-label={t('admin.overview.refresh')}
          title={`${t('admin.overview.refresh')} (R)`}
          className={cn(
            'inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground/80',
            'hover:bg-accent hover:text-accent-foreground transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          )}
        >
          <RefreshCw
            className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
            aria-hidden="true"
          />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium',
                'hover:bg-accent hover:text-accent-foreground transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              )}
            >
              {t(RANGE_LABELS[range])}
              <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            <DropdownMenuRadioGroup
              value={range}
              onValueChange={(v) => onRangeChange(v as RangeKey)}
            >
              <DropdownMenuRadioItem value="today">
                {t('admin.overview.range.today')}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="yesterday">
                {t('admin.overview.range.yesterday')}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="7d">
                {t('admin.overview.range.7d')}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="30d">
                {t('admin.overview.range.30d')}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

// =====================================================================
// Error banner
// =====================================================================
interface ErrorBannerProps {
  lastRefreshedAt: Date;
  onRetry: () => void;
}

function ErrorBanner({ lastRefreshedAt, onRetry }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-2 rounded-md border border-warning-600/30 bg-warning-50 p-3 text-sm dark:bg-warning-700/15 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-2">
        <AlertTriangle
          className="mt-0.5 h-4 w-4 shrink-0 text-warning-700 dark:text-warning-600"
          aria-hidden="true"
        />
        <div>
          <div className="font-medium text-warning-700 dark:text-warning-600">
            {t('admin.overview.error.title')}
          </div>
          <div className="text-muted-foreground">
            {t('admin.overview.error.body', { time: formatRelative(lastRefreshedAt) })}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="self-start rounded-md border border-warning-600/40 bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:self-auto"
      >
        {t('admin.overview.error.retry')}
      </button>
    </div>
  );
}

// =====================================================================
// KPI card
// =====================================================================
interface KpiCardProps {
  label: string;
  value?: string;
  valueNode?: React.ReactNode;
  deltaPct: number;
  sparkline: { i: number; v: number }[];
  tone: 'brand' | 'success' | 'warning' | 'danger';
  /** When true, a positive delta is BAD (e.g. open AML flags going up). */
  invertDeltaTone?: boolean;
  /** Show a small red attention dot (e.g. critical AML, KYC backlog). */
  alert?: boolean;
  hasData: boolean;
  stale: boolean;
  pulseKey: number;
  onActivate: () => void;
}

function KpiCard({
  label,
  value,
  valueNode,
  deltaPct,
  sparkline,
  tone,
  invertDeltaTone,
  alert,
  hasData,
  stale,
  pulseKey,
  onActivate,
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
    <button
      type="button"
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onActivate();
        }
      }}
      className={cn(
        'group relative text-left',
        'rounded-lg border border-border bg-card text-card-foreground shadow-sm',
        'hover:bg-accent/40 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      )}
    >
      <div className="p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="flex items-center gap-1.5">
            {alert && (
              <span
                className="h-2 w-2 rounded-full bg-danger-600 animate-pulse-dot"
                aria-label="Attention required"
              />
            )}
            {stale && (
              <span className="rounded-sm bg-warning-50 px-1.5 py-0.5 text-xs font-medium text-warning-700 dark:bg-warning-700/15 dark:text-warning-600">
                {t('admin.overview.error.stale')}
              </span>
            )}
            <ChevronRight
              className="h-3.5 w-3.5 text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="mt-2 flex items-end justify-between gap-3">
          <div
            key={`val-${pulseKey}`}
            className={cn(
              'text-3xl font-bold tabular-nums tracking-tight',
              pulseKey > 0 && 'animate-in fade-in-0 duration-300',
            )}
          >
            {valueNode ?? value}
          </div>
          {hasData && (
            <div className="h-10 w-20 shrink-0">
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
          )}
        </div>

        {hasData ? (
          <div
            className={cn(
              'mt-2 flex items-center gap-1 text-sm font-medium tabular',
              goodDirection ? 'text-success-700 dark:text-success-600' : 'text-danger-600',
            )}
          >
            <Icon className="h-3 w-3" aria-hidden="true" />
            <span>{Math.abs(deltaPct).toFixed(1)}%</span>
            <span className="text-muted-foreground font-normal">
              {t(isPositive ? 'admin.overview.kpi.delta.up' : 'admin.overview.kpi.delta.down')}
            </span>
          </div>
        ) : (
          <div className="mt-2 text-sm text-muted-foreground">—</div>
        )}
      </div>
    </button>
  );
}

function KpiSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <Skeleton className="h-3 w-24" />
      <div className="mt-2 flex items-end justify-between gap-3">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-10 w-20" />
      </div>
      <Skeleton className="mt-3 h-3 w-28" />
    </div>
  );
}

// =====================================================================
// Status-breakdown donut
// =====================================================================
function StatusBreakdownCard({ hasData }: { hasData: boolean }) {
  const slices = hasData ? STATUS_BREAKDOWN_TODAY : [];
  const total = slices.reduce((acc, s) => acc + s.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.overview.status-breakdown.title')}</CardTitle>
        <p className="text-sm text-muted-foreground mt-0.5">
          {t('admin.overview.status-breakdown.subtitle')}
        </p>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
            <div className="relative h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={slices}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={56}
                    outerRadius={84}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {slices.map((entry) => (
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
                    formatter={(v: number, name: string) => [v.toLocaleString('en'), name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div
                className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
                aria-hidden="true"
              >
                <div className="text-3xl font-bold tabular-nums tracking-tight">
                  {total.toLocaleString('en')}
                </div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
                  {t('admin.overview.status-breakdown.total')}
                </div>
              </div>
            </div>
            <ul className="space-y-2">
              {slices.map((s) => {
                const pct = total > 0 ? (s.count / total) * 100 : 0;
                return (
                  <li key={s.status} className="flex items-center gap-2 text-sm">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ background: s.fill }}
                      aria-hidden="true"
                    />
                    <span className="capitalize text-foreground/85 flex-1">{s.status}</span>
                    <span className="font-mono tabular text-foreground">
                      {s.count.toLocaleString('en')}
                    </span>
                    <span className="font-mono tabular text-muted-foreground w-12 text-right">
                      {pct.toFixed(1)}%
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <EmptyBlock
            icon={<Inbox className="h-8 w-8" aria-hidden="true" />}
            title={t('admin.overview.status-breakdown.empty')}
          />
        )}
      </CardContent>
    </Card>
  );
}

// =====================================================================
// Throughput line
// =====================================================================
function ThroughputCard({ hasData }: { hasData: boolean }) {
  const series = hasData ? THROUGHPUT_60M : [];
  const hasAnyData = series.some((p) => p.count > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.overview.throughput.title')}</CardTitle>
        <p className="text-sm text-muted-foreground mt-0.5">
          {t('admin.overview.throughput.subtitle')}
        </p>
      </CardHeader>
      <CardContent>
        {hasAnyData ? (
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={series}
                margin={{ top: 8, right: 12, bottom: 8, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="t"
                  tick={{ fontSize: 13, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  interval={9}
                />
                <YAxis
                  tick={{ fontSize: 13, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  allowDecimals={false}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--brand-600))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <RTooltip
                  contentStyle={{
                    background: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 13,
                  }}
                  labelFormatter={(label) => `Time ${label}`}
                  formatter={(v: number) => [v, 'Transfers']}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyBlock
            icon={<Activity className="h-8 w-8" aria-hidden="true" />}
            title={t('admin.overview.throughput.empty')}
          />
        )}
      </CardContent>
    </Card>
  );
}

// =====================================================================
// FX spread health
// =====================================================================
interface FxSpreadHealthCardProps {
  onUpdateRate: () => void;
}

function FxSpreadHealthCard({ onUpdateRate }: FxSpreadHealthCardProps) {
  const fx = FX_RATES[0];
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const remainingMs = fx.validTo.getTime() - now;
  const ttl = formatTtl(remainingMs);

  // Health bands: spread <= 1.5 healthy, <= 2.5 drifting, beyond → drifting.
  // TTL <= 0 forces stale.
  const health: 'healthy' | 'drifting' | 'stale' =
    remainingMs <= 0 ? 'stale' : fx.spreadPct <= 1.5 ? 'healthy' : 'drifting';

  const badgeClasses: Record<typeof health, string> = {
    healthy:
      'bg-success-50 text-success-700 border-success-600/20 dark:bg-success-700/15 dark:text-success-600',
    drifting:
      'bg-warning-50 text-warning-700 border-warning-600/20 dark:bg-warning-700/15 dark:text-warning-600',
    stale:
      'bg-danger-50 text-danger-700 border-danger-600/20 dark:bg-danger-700/15 dark:text-danger-600',
  };
  const badgeLabel: Record<typeof health, string> = {
    healthy: t('admin.overview.fx-health.badge.healthy'),
    drifting: t('admin.overview.fx-health.badge.drifting'),
    stale: t('admin.overview.fx-health.badge.stale'),
  };

  const sourceLabel =
    fx.source === 'central_bank'
      ? t('admin.overview.fx-health.source.central_bank')
      : fx.source === 'provider_x'
        ? t('admin.overview.fx-health.source.provider_x')
        : fx.source;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{t('admin.overview.fx-health.title')}</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t('admin.overview.fx-health.subtitle')}
            </p>
          </div>
          <span
            className={cn(
              'self-start inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium',
              badgeClasses[health],
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                health === 'healthy' && 'bg-success-600',
                health === 'drifting' && 'bg-warning-600',
                health === 'stale' && 'bg-danger-600',
              )}
              aria-hidden="true"
            />
            {badgeLabel[health]}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: rate + meta */}
          <div className="lg:col-span-1 space-y-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t('admin.overview.fx-health.rate-label')}
              </div>
              <div className="mt-1 text-3xl font-bold tabular-nums tracking-tight font-mono">
                1 CNY = {formatNumber(fx.clientRate)}
                <span className="ml-1 text-base font-medium text-muted-foreground">UZS</span>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">
                  {t('admin.overview.fx-health.mid-rate')}
                </dt>
                <dd className="mt-0.5 font-mono tabular text-foreground">
                  {formatNumber(fx.midRate)} UZS
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  {t('admin.overview.fx-health.spread')}
                </dt>
                <dd className="mt-0.5 font-mono tabular text-foreground">
                  {formatNumber(fx.spreadPct)}%
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  {t('admin.overview.fx-health.source')}
                </dt>
                <dd className="mt-0.5 text-foreground">{sourceLabel}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  {t('admin.overview.fx-health.valid-from')}
                </dt>
                <dd className="mt-0.5 font-mono tabular text-foreground">
                  {formatRelative(fx.validFrom)}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">{t('admin.overview.fx-health.ttl')}</dt>
                <dd
                  className={cn(
                    'mt-0.5 font-mono tabular',
                    health === 'stale' ? 'text-danger-600' : 'text-foreground',
                  )}
                >
                  {ttl ?? t('admin.overview.fx-health.expired')}
                </dd>
              </div>
            </dl>
          </div>

          {/* Right: 24h mini chart */}
          <div className="lg:col-span-2">
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={FX_RATE_24H}
                  margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="t"
                    tick={{ fontSize: 13, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    interval={3}
                  />
                  <YAxis
                    tick={{ fontSize: 13, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    width={56}
                    domain={['dataMin - 2', 'dataMax + 2']}
                    tickFormatter={(v: number) => formatNumber(v, 0)}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="hsl(var(--brand-600))"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <RTooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 13,
                    }}
                    formatter={(v: number) => [`${formatNumber(v)} UZS`, 'Rate']}
                    labelFormatter={(label) => `Hour ${label}`}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={onUpdateRate}
                className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
              >
                {t('admin.overview.fx-health.update-rate')}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatTtl(ms: number): string | null {
  if (ms <= 0) return null;
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// =====================================================================
// Services & health
// =====================================================================
interface ServicesHealthCardProps {
  services: Service[];
  onSelect: (service: Service) => void;
}

function ServicesHealthCard({ services, onSelect }: ServicesHealthCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          {t('admin.overview.services.title')}
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-0.5">
          {t('admin.overview.services.subtitle')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {services.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => onSelect(service)}
              className={cn(
                'group flex flex-col gap-1 rounded-md border border-border bg-background p-3 text-left',
                'hover:bg-accent/40 hover:border-border transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full shrink-0',
                    SERVICE_HEALTH_DOT[service.health],
                  )}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium truncate">
                  {SERVICE_LABELS[service.name] ?? service.name}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {service.note ?? t(`admin.overview.services.status.${service.status}`)}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono tabular text-foreground/80">
                  {service.latencyMs}ms
                </span>
                <span className="text-muted-foreground">
                  {formatRelative(service.lastCheckedAt)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ServicesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-40" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-md border border-border bg-background p-3 space-y-2"
            >
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================================
// Recent activity
// =====================================================================
interface RecentActivityCardProps {
  transfers: typeof TRANSFERS;
  onRowClick: (id: string) => void;
  onViewAll: () => void;
}

function RecentActivityCard({ transfers, onRowClick, onViewAll }: RecentActivityCardProps) {
  const totalUzs = transfers.reduce((acc, tr) => acc + tr.amountUzs, 0n);
  const totalCny = transfers.reduce((acc, tr) => acc + tr.amountCny, 0n);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{t('admin.overview.recent-activity.title')}</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t('admin.overview.recent-activity.subtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex items-center gap-1 rounded-sm text-sm font-medium text-brand-600 hover:underline dark:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {t('admin.overview.recent-activity.view-all')}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {transfers.length === 0 ? (
          <div className="px-6 pb-6">
            <EmptyBlock
              icon={<Inbox className="h-8 w-8" aria-hidden="true" />}
              title={t('admin.overview.recent-activity.empty.title')}
              body={t('admin.overview.recent-activity.empty.body')}
            />
          </div>
        ) : (
          <>
            {/* Desktop / tablet: data table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t('admin.overview.recent-activity.column.time')}
                    </TableHead>
                    <TableHead>
                      {t('admin.overview.recent-activity.column.card')}
                    </TableHead>
                    <TableHead>
                      {t('admin.overview.recent-activity.column.sender')}
                    </TableHead>
                    <TableHead>
                      {t('admin.overview.recent-activity.column.recipient')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('admin.overview.recent-activity.column.amount-uzs')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('admin.overview.recent-activity.column.amount-cny')}
                    </TableHead>
                    <TableHead>
                      {t('admin.overview.recent-activity.column.status')}
                    </TableHead>
                    <TableHead aria-label="row action" className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((tr) => (
                    <TableRow
                      key={tr.id}
                      tabIndex={0}
                      onClick={() => onRowClick(tr.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick(tr.id);
                        }
                      }}
                      className="group cursor-pointer focus-visible:outline-none focus-visible:bg-accent/40"
                    >
                      <TableCell className="text-sm text-muted-foreground tabular whitespace-nowrap">
                        {formatRelative(tr.createdAt)}
                      </TableCell>
                      <TableCell>
                        <MaskedPan value={tr.cardMaskedPan} scheme={tr.cardScheme} />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{tr.userName}</div>
                        <div className="text-sm text-muted-foreground tabular">
                          {tr.userPhone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono tabular font-medium text-foreground">
                          {tr.recipientIdentifier}
                        </div>
                        <div className="mt-0.5">
                          <DestinationBadge destination={tr.destination} />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Money amount={tr.amountUzs} currency="UZS" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Money
                          amount={tr.amountCny}
                          currency="CNY"
                          className="text-muted-foreground"
                        />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={tr.status} domain="transfer" />
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-300 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                          {t('admin.overview.recent-activity.row-action')}
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={4}>
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {t('admin.overview.recent-activity.total')}
                      </span>
                      <span className="ml-2 text-sm text-muted-foreground tabular">
                        {t('admin.overview.recent-activity.total.count', {
                          count: transfers.length,
                        })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Money
                        amount={totalUzs}
                        currency="UZS"
                        className="font-semibold text-foreground"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Money
                        amount={totalCny}
                        currency="CNY"
                        className="font-semibold text-foreground"
                      />
                    </TableCell>
                    <TableCell colSpan={2} />
                  </TableRow>
                </TableFooter>
              </Table>
            </div>

            {/* Mobile: stacked cards */}
            <ul className="md:hidden divide-y divide-border">
              {transfers.map((tr) => (
                <li key={tr.id}>
                  <button
                    type="button"
                    onClick={() => onRowClick(tr.id)}
                    className="w-full px-4 py-3 text-left hover:bg-accent/40 focus-visible:outline-none focus-visible:bg-accent/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-muted-foreground tabular">
                        {formatRelative(tr.createdAt)}
                      </span>
                      <StatusBadge status={tr.status} domain="transfer" />
                    </div>
                    <div className="mt-2 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{tr.userName}</div>
                        <div className="text-sm text-muted-foreground tabular truncate">
                          {tr.userPhone}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <DestinationBadge destination={tr.destination} />
                          <span className="font-mono tabular text-sm text-foreground/80 truncate">
                            {tr.recipientIdentifier}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <Money
                          amount={tr.amountUzs}
                          currency="UZS"
                          className="font-medium"
                        />
                        <div className="mt-0.5">
                          <Money
                            amount={tr.amountCny}
                            currency="CNY"
                            className="text-sm text-muted-foreground"
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
              <li className="bg-muted/30 px-4 py-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t('admin.overview.recent-activity.total')}
                  </span>
                  <span className="text-xs text-muted-foreground tabular">
                    {t('admin.overview.recent-activity.total.count', {
                      count: transfers.length,
                    })}
                  </span>
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-2">
                  <Money
                    amount={totalUzs}
                    currency="UZS"
                    className="font-semibold text-foreground"
                  />
                  <Money
                    amount={totalCny}
                    currency="CNY"
                    className="font-semibold text-foreground"
                  />
                </div>
              </li>
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ActivitySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28 hidden md:block" />
              <Skeleton className="h-4 w-24 ml-auto" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================================
// Shared blocks
// =====================================================================
function ChartSkeleton({ tall }: { tall?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className={cn('w-full', tall ? 'h-[220px]' : 'h-[180px]')} />
      </CardContent>
    </Card>
  );
}

interface EmptyBlockProps {
  icon: React.ReactNode;
  title: string;
  body?: string;
}

function EmptyBlock({ icon, title, body }: EmptyBlockProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
      <div className="mb-2 text-muted-foreground/60">{icon}</div>
      <div className="text-sm font-medium text-foreground">{title}</div>
      {body && <div className="text-sm mt-1 max-w-md">{body}</div>}
    </div>
  );
}

// =====================================================================
// Helpers
// =====================================================================
const TYPING_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];
function isTypingContext(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (TYPING_TAGS.includes(target.tagName)) return true;
  if (target.isContentEditable) return true;
  return false;
}

