import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Activity,
  TrendingUp,
  Network,
  ShieldAlert,
  UserCog,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatMoney, formatNumber } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type {
  AmountContext,
  AmlReview,
  ManualContext,
  PatternContext,
  SanctionsContext,
  VelocityContext,
} from '@/data/mockAmlTriage';

interface FlagContextCardProps {
  review: AmlReview;
}

export function FlagContextCard({ review }: FlagContextCardProps) {
  const [jsonOpen, setJsonOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(review.context, replacer, 2);

  function copy() {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle>{t('admin.aml-triage.detail.context')}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Typed decoration per flagType */}
        {review.context.type === 'velocity' && (
          <VelocityBlock ctx={review.context} />
        )}
        {review.context.type === 'amount' && <AmountBlock ctx={review.context} />}
        {review.context.type === 'pattern' && <PatternBlock ctx={review.context} />}
        {review.context.type === 'sanctions' && (
          <SanctionsBlock ctx={review.context} />
        )}
        {review.context.type === 'manual' && <ManualBlock ctx={review.context} />}

        {/* Raw JSON viewer (collapsible) */}
        <div className="border-t border-border pt-3">
          <button
            type="button"
            onClick={() => setJsonOpen((o) => !o)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
            aria-expanded={jsonOpen}
          >
            {jsonOpen ? (
              <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{t('admin.aml-triage.detail.context.json-toggle')}</span>
          </button>

          {jsonOpen && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  JSON
                </span>
                <Button size="sm" variant="ghost" onClick={copy}>
                  {copied ? (
                    <>
                      <Check
                        className="h-3.5 w-3.5 mr-1.5 text-success-600"
                        aria-hidden="true"
                      />
                      {t('admin.aml-triage.detail.context.json-copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                      {t('admin.aml-triage.detail.context.json-copy')}
                    </>
                  )}
                </Button>
              </div>
              <pre className="rounded-md bg-muted/60 dark:bg-muted/40 p-3 text-sm overflow-x-auto overflow-y-hidden">
                <code className="font-mono tabular text-foreground/90">{json}</code>
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================================
// Typed blocks
// =====================================================================

function BlockHeader({
  Icon,
  text,
  tone = 'default',
}: {
  Icon: React.ComponentType<{ className?: string }>;
  text: string;
  tone?: 'default' | 'danger';
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon
        className={cn(
          'h-4 w-4',
          tone === 'danger' ? 'text-danger-600' : 'text-muted-foreground',
        )}
        aria-hidden="true"
      />
      <span
        className={cn(
          'text-sm font-semibold',
          tone === 'danger' && 'text-danger-700 dark:text-danger-600',
        )}
      >
        {text}
      </span>
    </div>
  );
}

function VelocityBlock({ ctx }: { ctx: VelocityContext }) {
  return (
    <div className="space-y-3">
      <BlockHeader
        Icon={Activity}
        text={t('admin.aml-triage.detail.context.velocity', {
          count: ctx.transfer_count,
          minutes: ctx.window_minutes,
        })}
      />
      <div className="text-sm text-muted-foreground tabular">
        {t('admin.aml-triage.detail.context.velocity.threshold', {
          threshold: ctx.threshold,
        })}
      </div>

      {/* Tiny bar sparkline — count vs threshold */}
      <SparkBar count={ctx.transfer_count} threshold={ctx.threshold} />

      {ctx.recent_transfer_ids.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5">
            {t('admin.aml-triage.detail.context.recent-transfers')}
          </div>
          <ul className="flex flex-wrap gap-1.5">
            {ctx.recent_transfer_ids.map((id) => (
              <li
                key={id}
                className="inline-flex items-center rounded-sm border border-border bg-muted/40 px-2 py-0.5 text-sm font-mono tabular"
              >
                {id}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function AmountBlock({ ctx }: { ctx: AmountContext }) {
  return (
    <div className="space-y-3">
      <BlockHeader
        Icon={TrendingUp}
        text={t('admin.aml-triage.detail.context.amount', {
          amount: formatMoney(ctx.amount_uzs, 'UZS'),
          sigma: formatNumber(ctx.std_dev_count, 1),
        })}
      />
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        <div>
          <dt className="text-sm text-muted-foreground mb-0.5">
            {t('admin.aml-triage.detail.context.amount.user-avg', { amount: '' })}
          </dt>
          <dd className="text-sm font-mono tabular">
            {formatMoney(ctx.user_avg_uzs, 'UZS')}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground mb-0.5">
            {t('admin.aml-triage.detail.context.amount.multiplier', {
              multiplier: formatNumber(ctx.multiplier, 1),
            })}
          </dt>
          <dd className="text-sm font-mono tabular">
            {formatNumber(ctx.std_dev_count, 1)}σ
          </dd>
        </div>
      </dl>
    </div>
  );
}

function PatternBlock({ ctx }: { ctx: PatternContext }) {
  return (
    <div className="space-y-3">
      <BlockHeader
        Icon={Network}
        text={t('admin.aml-triage.detail.context.pattern', { rule: ctx.rule_name })}
      />
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-0.5">
          {t('admin.aml-triage.detail.context.pattern.signal')}
        </div>
        <div className="text-sm font-mono tabular">{ctx.matched_signal}</div>
      </div>
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-0.5">
          {t('admin.aml-triage.detail.context.pattern.description')}
        </div>
        <p className="text-sm text-foreground/90">{ctx.pattern_description}</p>
      </div>
    </div>
  );
}

function SanctionsBlock({ ctx }: { ctx: SanctionsContext }) {
  return (
    <div className="space-y-3">
      <BlockHeader
        Icon={ShieldAlert}
        tone="danger"
        text={t('admin.aml-triage.detail.context.sanctions')}
      />
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        <div>
          <dt className="text-sm text-muted-foreground mb-0.5">
            {t('admin.aml-triage.detail.context.sanctions.list')}
          </dt>
          <dd className="text-sm font-semibold">{ctx.matched_list}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground mb-0.5">
            {t('admin.aml-triage.detail.context.sanctions.matched-name')}
          </dt>
          <dd className="text-sm font-semibold">{ctx.matched_name}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground mb-0.5">
            {t('admin.aml-triage.detail.context.sanctions.match-score')}
          </dt>
          <dd className="text-sm font-mono tabular">
            {formatNumber(ctx.match_score, 2)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground mb-0.5">
            {t('admin.aml-triage.detail.context.sanctions.recipient-handle')}
          </dt>
          <dd className="text-sm font-mono tabular">{ctx.recipient_handle}</dd>
        </div>
      </dl>
    </div>
  );
}

function ManualBlock({ ctx }: { ctx: ManualContext }) {
  return (
    <div className="space-y-3">
      <BlockHeader
        Icon={UserCog}
        text={t('admin.aml-triage.detail.context.manual')}
      />
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-0.5">
          {t('admin.aml-triage.detail.context.manual.filer')}
        </div>
        <div className="text-sm font-medium">{ctx.filer_admin_name}</div>
      </div>
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-0.5">
          {t('admin.aml-triage.detail.context.manual.note')}
        </div>
        <p className="text-sm text-foreground/90 whitespace-pre-wrap">
          {ctx.filer_note}
        </p>
      </div>
    </div>
  );
}

// =====================================================================
// Tiny bar sparkline for velocity context
// =====================================================================

function SparkBar({ count, threshold }: { count: number; threshold: number }) {
  const pct = Math.min(count / Math.max(threshold * 1.5, 1), 1) * 100;
  const overThreshold = count >= threshold;
  return (
    <div className="space-y-1">
      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full',
            overThreshold ? 'bg-danger-600' : 'bg-warning-600',
          )}
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        />
        {/* Threshold marker */}
        <div
          className="absolute inset-y-0 w-px bg-foreground/40"
          style={{ left: `${(threshold / Math.max(threshold * 1.5, 1)) * 100}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="flex justify-between text-xs uppercase tracking-wider text-muted-foreground">
        <span>0</span>
        <span>threshold {threshold}</span>
        <span>{count}</span>
      </div>
    </div>
  );
}

// =====================================================================
// JSON serializer that handles bigint
// =====================================================================

function replacer(_key: string, value: unknown): unknown {
  if (typeof value === 'bigint') return value.toString();
  return value;
}
