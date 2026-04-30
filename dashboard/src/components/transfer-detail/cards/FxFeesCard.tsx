import { useMemo } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Money } from '@/components/zhipay/Money';
import { CollapsibleCard } from './CollapsibleCard';
import { FX_RATES } from '@/data/mock';
import { formatDateTime, formatNumber } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { Transfer } from '@/types';

interface Props {
  transfer: Transfer;
}

export function FxFeesCard({ transfer }: Props) {
  // The dataset is small — pick the most-recent rate as the canonical row.
  // Production would resolve transfer.fxRateId.
  const fxRate = FX_RATES[0];

  const feePct = useMemo(() => {
    const denom = Number(transfer.amountUzs / 100n);
    const fee = Number(transfer.feeUzs / 100n);
    if (denom === 0) return 0;
    return (fee / denom) * 100;
  }, [transfer.amountUzs, transfer.feeUzs]);

  const spreadPct = fxRate?.spreadPct ?? 0;

  return (
    <CollapsibleCard
      title={t('admin.transfer-detail.fx-fees.title')}
      defaultOpen
    >
      <div className="space-y-3">
        {/* Tabular breakdown */}
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              <FxRow
                label={t('admin.transfer-detail.fx-fees.amount-sent')}
                value={<Money amount={transfer.amountUzs} currency="UZS" />}
              />
              <FxRow
                label={`${t('admin.transfer-detail.fx-fees.service-fee')}  (${formatNumber(feePct, 1)}%)`}
                value={<Money amount={transfer.feeUzs} currency="UZS" />}
                muted
              />
              <FxRow
                label={`${t('admin.transfer-detail.fx-fees.fx-spread')}  (${formatNumber(spreadPct, 2)}%)`}
                value={<Money amount={transfer.fxSpreadUzs} currency="UZS" />}
                muted
              />
              <tr className="border-t bg-muted/40">
                <td className="px-3 py-2 text-sm font-medium">
                  {t('admin.transfer-detail.fx-fees.total-charged')}
                </td>
                <td className="px-3 py-2 text-right">
                  <Money amount={transfer.totalChargeUzs} currency="UZS" className="font-semibold" />
                </td>
              </tr>
              <tr className="border-t">
                <td className="px-3 py-3 text-sm font-medium">
                  {t('admin.transfer-detail.fx-fees.recipient-receives')}
                </td>
                <td className="px-3 py-3 text-right">
                  <Money amount={transfer.amountCny} currency="CNY" className="text-base font-semibold" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Rate row */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="text-left text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              {t('admin.transfer-detail.fx-fees.rate-source', {
                rate: formatNumber(transfer.clientRate, 2),
                source: fxRate?.source ?? 'central_bank',
                time: formatDateTime(transfer.createdAt),
              })}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 text-sm" align="start">
            <div className="font-semibold mb-2">
              {t('admin.transfer-detail.fx-fees.rate-popover-title')}
            </div>
            <dl className="grid grid-cols-[120px_1fr] gap-y-1.5">
              <dt className="text-muted-foreground">
                {t('admin.transfer-detail.fx-fees.rate-popover.id')}
              </dt>
              <dd className="font-mono tabular text-sm">{fxRate?.id ?? '—'}</dd>
              <dt className="text-muted-foreground">
                {t('admin.transfer-detail.fx-fees.rate-popover.source')}
              </dt>
              <dd>{fxRate?.source ?? '—'}</dd>
              <dt className="text-muted-foreground">
                {t('admin.transfer-detail.fx-fees.rate-popover.mid-rate')}
              </dt>
              <dd className="tabular">{fxRate ? formatNumber(fxRate.midRate, 2) : '—'}</dd>
              <dt className="text-muted-foreground">
                {t('admin.transfer-detail.fx-fees.rate-popover.spread')}
              </dt>
              <dd className="tabular">{fxRate ? `${formatNumber(fxRate.spreadPct, 2)}%` : '—'}</dd>
              <dt className="text-muted-foreground">
                {t('admin.transfer-detail.fx-fees.rate-popover.valid-from')}
              </dt>
              <dd>{fxRate ? formatDateTime(fxRate.validFrom) : '—'}</dd>
              <dt className="text-muted-foreground">
                {t('admin.transfer-detail.fx-fees.rate-popover.valid-to')}
              </dt>
              <dd>{fxRate ? formatDateTime(fxRate.validTo) : '—'}</dd>
            </dl>
          </PopoverContent>
        </Popover>
      </div>
    </CollapsibleCard>
  );
}

function FxRow({ label, value, muted }: { label: string; value: React.ReactNode; muted?: boolean }) {
  return (
    <tr className="border-b last:border-b-0">
      <td className={`px-3 py-2 text-sm ${muted ? 'text-muted-foreground' : ''}`}>{label}</td>
      <td className="px-3 py-2 text-right">{value}</td>
    </tr>
  );
}
