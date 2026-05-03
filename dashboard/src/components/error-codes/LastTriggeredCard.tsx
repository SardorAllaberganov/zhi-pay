import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';
import { t } from '@/lib/i18n';
import { formatRelative } from '@/lib/utils';
import {
  countTriggersInWindow,
  getDailyCountsLast7d,
  getLastTriggeredAt,
} from '@/data/mockErrorCodes';

/**
 * Per-code observability surface in the row-expanded body.
 *
 *   ┌── Last triggered ──────────────  47m ago
 *   │   24h         7d        30d
 *   │   28          184       720
 *   │   [7-day daily-count sparkline]
 *
 * Counts come from `mockErrorCodes` synthetic per-day series — these
 * are mock-only observability fields modelling what a metrics store
 * would surface to the admin UI. Same precedent as Services & Health.
 */
export function LastTriggeredCard({ code }: { code: string }) {
  const lastAt = getLastTriggeredAt(code);
  const c24 = countTriggersInWindow(code, 24);
  const c7 = countTriggersInWindow(code, 24 * 7);
  const c30 = countTriggersInWindow(code, 24 * 30);
  const series = getDailyCountsLast7d(code).map((value, i) => ({ day: i, value }));
  const total7 = series.reduce((sum, p) => sum + p.value, 0);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t('admin.error-codes.detail.last-triggered')}
        </h4>
        <span className="text-sm text-muted-foreground tabular tabular-nums">
          {lastAt
            ? formatRelative(lastAt)
            : t('admin.error-codes.detail.never-triggered')}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Tile label={t('admin.error-codes.detail.window.24h')} value={c24} />
        <Tile label={t('admin.error-codes.detail.window.7d')} value={c7} />
        <Tile label={t('admin.error-codes.detail.window.30d')} value={c30} />
      </div>

      {total7 > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t('admin.error-codes.detail.sparkline-label')}
            </span>
            <span className="text-sm text-muted-foreground tabular tabular-nums">
              {t('admin.error-codes.detail.sparkline-meta', { count: total7 })}
            </span>
          </div>
          <div className="h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                <YAxis hide domain={['auto', 'auto']} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="rgb(10,100,188)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-muted/30 dark:bg-muted/20 px-3 py-2.5">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold tabular tabular-nums">
        {value.toLocaleString('en')}
      </div>
    </div>
  );
}
