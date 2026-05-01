import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/zhipay/StatusBadge';
import { Money } from '@/components/zhipay/Money';
import { cn, formatDate, formatDateTime, formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { RecipientEntry } from '@/data/mockRecipients';
import type { Transfer } from '@/types';

interface UsageCardProps {
  recipient: RecipientEntry;
  transfers: Transfer[];
}

/**
 * Full-width usage card for the recipient-detail page. Surfaces:
 *   - 4 KPI tiles: total transfer count / total volume / first-used / last-used
 *   - Last-5 mini-list of real transfers (filtered from TRANSFERS_FULL by
 *     the canonical (userId, identifier, destination) tuple)
 *   - "View all transfers to this recipient →" CTA → routes to the
 *     Transfers list scoped to this recipient via search params.
 *
 * Note: for users not in mockTransfers' SENDERS pool the `transfers` array
 * is empty (no real records). The `transferCount` and `totalVolumeUzsTiyins`
 * fields on the recipient row are denormalized aggregates and remain the
 * source of truth for the KPI tiles. The mini-list shows an empty state
 * in that case.
 */
export function UsageCard({ recipient, transfers }: UsageCardProps) {
  const navigate = useNavigate();
  const recent = transfers.slice(0, 5);

  // First / last derived from real transfer records when available; fall
  // back to the recipient row's `lastUsedAt` and `createdAt` so the tiles
  // remain meaningful for users without mock-transfer history.
  const firstUsed = transfers.length > 0
    ? transfers[transfers.length - 1].createdAt
    : recipient.createdAt;
  const lastUsed = transfers.length > 0 ? transfers[0].createdAt : recipient.lastUsedAt;

  function openTransfer(id: string) {
    navigate(
      `/operations/transfers/${id}?context=recipient&recipient_id=${recipient.id}`,
    );
  }

  function openAllTransfers() {
    navigate(
      `/operations/transfers?context=recipient&recipient_id=${recipient.id}`,
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle>{t('admin.recipients.detail.usage')}</CardTitle>
        {recipient.transferCount > 0 && (
          <Button variant="outline" size="sm" onClick={openAllTransfers}>
            {t('admin.recipients.detail.view-all-cta', {
              count: recipient.transferCount,
            })}
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" aria-hidden="true" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-5 px-0">
        {/* KPI tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-6">
          <KpiTile
            label={t('admin.recipients.detail.kpi.transfer-count')}
            value={recipient.transferCount.toLocaleString('en')}
          />
          <KpiTile
            label={t('admin.recipients.detail.kpi.total-volume')}
            value={
              <Money amount={recipient.totalVolumeUzsTiyins} currency="UZS" />
            }
          />
          <KpiTile
            label={t('admin.recipients.detail.kpi.first-used')}
            value={formatDate(firstUsed)}
            subtitle={formatRelative(firstUsed)}
          />
          <KpiTile
            label={t('admin.recipients.detail.kpi.last-used')}
            value={formatDate(lastUsed)}
            subtitle={formatRelative(lastUsed)}
          />
        </div>

        {/* Last-5 transfers */}
        <div>
          <div className="px-6 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t('admin.recipients.detail.last-transfers')}
          </div>

          {recent.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-muted-foreground">
              {t('admin.recipients.detail.last-transfers.empty')}
            </div>
          ) : (
            <>
              {/* Desktop — table */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-6">
                        {t('admin.transfers.column.created')}
                      </TableHead>
                      <TableHead>{t('admin.transfers.column.status')}</TableHead>
                      <TableHead className="text-right px-6">
                        {t('admin.transfers.column.amount-uzs')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recent.map((tx) => (
                      <TableRow
                        key={tx.id}
                        tabIndex={0}
                        onClick={() => openTransfer(tx.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            openTransfer(tx.id);
                          }
                        }}
                        className="cursor-pointer"
                      >
                        <TableCell
                          className="px-6 text-sm text-muted-foreground tabular"
                          title={formatDateTime(tx.createdAt)}
                        >
                          {formatRelative(tx.createdAt)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={tx.status} domain="transfer" />
                        </TableCell>
                        <TableCell className="text-right px-6">
                          <Money amount={tx.amountUzs} currency="UZS" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile / tablet — stacked list */}
              <ul className="lg:hidden divide-y divide-border">
                {recent.map((tx) => (
                  <li key={tx.id}>
                    <button
                      type="button"
                      onClick={() => openTransfer(tx.id)}
                      className={cn(
                        'w-full text-left px-6 py-3 hover:bg-muted/40 transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                        'flex flex-wrap items-center gap-x-4 gap-y-1.5',
                      )}
                    >
                      <StatusBadge status={tx.status} domain="transfer" />
                      <div className="min-w-0 flex-1 text-sm text-right">
                        <Money amount={tx.amountUzs} currency="UZS" />
                      </div>
                      <div className="text-sm text-muted-foreground shrink-0 tabular">
                        {formatRelative(tx.createdAt)}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>

              {recipient.transferCount > recent.length && (
                <div className="px-6 pt-3 text-sm text-muted-foreground tabular">
                  {t('admin.recipients.detail.last-transfers.count-with-more', {
                    shown: recent.length,
                    total: recipient.transferCount,
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function KpiTile({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card px-4 py-3">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-base font-semibold tabular">{value}</div>
      {subtitle && (
        <div className="text-sm text-muted-foreground tabular">{subtitle}</div>
      )}
    </div>
  );
}
