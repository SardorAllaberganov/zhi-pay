import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/zhipay/StatusBadge';
import { DestinationBadge } from '@/components/zhipay/DestinationBadge';
import { SchemeLogo } from '@/components/zhipay/SchemeLogo';
import { Money } from '@/components/zhipay/Money';
import { TRANSFERS_FULL } from '@/data/mockTransfers';
import { formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { UserListRow } from '@/data/mockUsers';

interface Props {
  user: UserListRow;
}

export function UserTransfersTab({ user }: Props) {
  const navigate = useNavigate();
  const transfers = TRANSFERS_FULL.filter((tx) => tx.userId === user.id)
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  if (transfers.length === 0) {
    return (
      <Card>
        <CardContent className="px-6 py-12 text-center">
          <h3 className="text-base font-medium">{t('admin.users.detail.transfers.empty-title')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('admin.users.detail.transfers.empty-body')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.users.detail.transfers.col.created')}</TableHead>
              <TableHead>{t('admin.users.detail.transfers.col.recipient')}</TableHead>
              <TableHead>{t('admin.users.detail.transfers.col.card')}</TableHead>
              <TableHead className="text-right">{t('admin.users.detail.transfers.col.uzs')}</TableHead>
              <TableHead className="text-right">{t('admin.users.detail.transfers.col.cny')}</TableHead>
              <TableHead>{t('admin.users.detail.transfers.col.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transfers.map((tx) => (
              <TableRow
                key={tx.id}
                onClick={() =>
                  navigate(`/operations/transfers/${tx.id}?context=user&user_id=${user.id}`)
                }
                className="cursor-pointer hover:bg-muted/40"
              >
                <TableCell className="text-sm text-muted-foreground">
                  {formatRelative(tx.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <DestinationBadge destination={tx.destination} />
                    <span className="text-sm tabular truncate max-w-[180px]">
                      {tx.recipientIdentifier}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <SchemeLogo scheme={tx.cardScheme} className="h-5 w-8" />
                </TableCell>
                <TableCell className="text-right">
                  <Money amount={tx.amountUzs} currency="UZS" />
                </TableCell>
                <TableCell className="text-right">
                  <Money amount={tx.amountCny} currency="CNY" />
                </TableCell>
                <TableCell>
                  <StatusBadge status={tx.status} domain="transfer" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
