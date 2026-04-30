import { ArrowRight, UserX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TierBadge } from '@/components/zhipay/TierBadge';
import { formatMoney, maskPinfl } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { User } from '@/types';
import type { UserLifetimeStats } from '@/data/mockTransferDetail';

interface Props {
  user: User | null;
  deleted: boolean;
  pinflLast4Fallback: string;
  userPhoneFallback: string;
  userNameFallback: string;
  lifetime: UserLifetimeStats;
  onOpenUser: (userId: string) => void;
}

export function SenderCard({
  user,
  deleted,
  pinflLast4Fallback,
  userPhoneFallback,
  userNameFallback,
  lifetime,
  onOpenUser,
}: Props) {
  const name = user?.fullName ?? userNameFallback;
  const phone = user?.phone ?? userPhoneFallback;
  const pinflLast4 = user?.pinflLast4 ?? pinflLast4Fallback;
  const initials = name
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('admin.transfer-detail.sender.title')}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                {deleted ? <UserX className="h-4 w-4" aria-hidden="true" /> : initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="font-semibold truncate">{name}</div>
              <div className="text-sm text-muted-foreground tabular font-mono">
                {maskPinfl('xxxxxx' + pinflLast4)}
              </div>
            </div>
          </div>
          <div className="text-right space-y-1 shrink-0">
            {deleted ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {t('admin.transfer-detail.sender.deleted')}
              </span>
            ) : (
              <>
                {user?.kycTier && <TierBadge tier={user.kycTier} />}
              </>
            )}
            <div className="text-sm text-muted-foreground">
              {t('admin.transfer-detail.sender.lifetime-stats', {
                count: lifetime.count,
                total: formatMoney(lifetime.totalUzsTiyins, 'UZS'),
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 border-t">
          <div className="text-sm font-mono tabular text-muted-foreground">{phone}</div>
          {!deleted && user && (
            <button
              type="button"
              onClick={() => onOpenUser(user.id)}
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              {t('admin.transfer-detail.sender.open-profile')}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
