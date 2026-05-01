import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/zhipay/StatusBadge';
import { Money } from '@/components/zhipay/Money';
import { DestinationBadge } from '@/components/zhipay/DestinationBadge';
import { KpiTrio } from '../cards/KpiTrio';
import { LimitsCard } from '../cards/LimitsCard';
import { MonthlyVolumeChart } from '../cards/MonthlyVolumeChart';
import { TransfersByStatusDonut } from '../cards/TransfersByStatusDonut';
import {
  getUserMonthlyVolume,
  getUserStatusBreakdown,
  getUserSuccessRatePct,
  getUserLimitUsage,
  type UserListRow,
} from '@/data/mockUsers';
import { TRANSFERS_FULL } from '@/data/mockTransfers';
import { formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';

interface Props {
  user: UserListRow;
}

export function UserOverviewTab({ user }: Props) {
  const navigate = useNavigate();
  const usage = getUserLimitUsage(user.id);
  const monthly = getUserMonthlyVolume(user.id);
  const breakdown = getUserStatusBreakdown(user.id);
  const successRate = getUserSuccessRatePct(user.id);

  const recent = TRANSFERS_FULL.filter((tx) => tx.userId === user.id)
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);

  return (
    <div className="space-y-4">
      <KpiTrio
        lifetimeVolumeTiyins={user.lifetimeVolumeUzsTiyins}
        lifetimeCount={user.lifetimeTransferCount}
        successRatePct={successRate}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MonthlyVolumeChart data={monthly} />
        <TransfersByStatusDonut data={breakdown} />
      </div>

      {usage && <LimitsCard usage={usage} tier={user.tier} />}

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.users.detail.recent-activity.title')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recent.length === 0 ? (
            <div className="px-6 py-10 text-sm text-muted-foreground text-center">
              {t('admin.users.detail.recent-activity.empty')}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((tx) => (
                <li key={tx.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/operations/transfers/${tx.id}?context=user&user_id=${user.id}`)}
                    className="w-full text-left px-6 py-3 hover:bg-muted/40 transition-colors flex items-center gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <DestinationBadge destination={tx.destination} />
                        <span className="text-sm text-muted-foreground tabular truncate">
                          {tx.recipientIdentifier}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {formatRelative(tx.createdAt)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div>
                        <Money amount={tx.amountUzs} currency="UZS" />
                      </div>
                      <div className="mt-1">
                        <StatusBadge status={tx.status} domain="transfer" />
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
        {recent.length > 0 && (
          <div className="px-6 pb-4 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate(`/customers/users/${user.id}?tab=transfers`)
              }
            >
              {t('admin.users.detail.recent-activity.view-all')}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
