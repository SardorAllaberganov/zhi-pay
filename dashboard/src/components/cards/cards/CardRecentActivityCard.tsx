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
import { DestinationBadge } from '@/components/zhipay/DestinationBadge';
import { cn, formatDateTime, formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { Transfer } from '@/types';

interface Props {
  cardId: string;
  transfers: Transfer[];
}

export function CardRecentActivityCard({ cardId, transfers }: Props) {
  const navigate = useNavigate();
  const recent = transfers.slice(0, 10);

  function open(id: string) {
    navigate(`/operations/transfers/${id}?context=card&card_id=${cardId}`);
  }

  const hasMore = transfers.length > recent.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">
          {t('admin.cards.detail.recent-activity')}
        </CardTitle>
        {transfers.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/operations/transfers?context=card&card_id=${cardId}`)}
          >
            {t('admin.cards.detail.recent-activity.view-all-cta', {
              count: transfers.length,
            })}
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" aria-hidden="true" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="px-0">
        {recent.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-muted-foreground">
            {t('admin.cards.detail.recent-activity.empty')}
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
                    <TableHead>{t('admin.transfers.column.destination')}</TableHead>
                    <TableHead>{t('admin.transfers.column.recipient')}</TableHead>
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
                      onClick={() => open(tx.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          open(tx.id);
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
                      <TableCell>
                        <DestinationBadge destination={tx.destination} />
                      </TableCell>
                      <TableCell className="text-sm truncate max-w-[280px]">
                        {tx.recipientIdentifier}
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
                    onClick={() => open(tx.id)}
                    className={cn(
                      'w-full text-left px-6 py-3 hover:bg-muted/40 transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                      'flex flex-wrap items-center gap-x-4 gap-y-1.5',
                    )}
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={tx.status} domain="transfer" />
                      <DestinationBadge destination={tx.destination} />
                    </div>
                    <div className="min-w-0 flex-1 text-sm truncate">
                      <span className="text-foreground">{tx.recipientIdentifier}</span>
                    </div>
                    <div className="text-sm text-right shrink-0">
                      <Money amount={tx.amountUzs} currency="UZS" />
                    </div>
                    <div className="text-sm text-muted-foreground shrink-0 tabular">
                      {formatRelative(tx.createdAt)}
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            {/* Footer caption — total transfer count for this card. The
                "+ N more" suffix is dropped when all rows are visible. */}
            <div className="px-6 pt-3 text-sm text-muted-foreground tabular">
              {hasMore
                ? t('admin.cards.detail.recent-activity.count-with-more', {
                    shown: recent.length,
                    total: transfers.length,
                  })
                : t('admin.cards.detail.recent-activity.count', {
                    count: transfers.length,
                  })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
