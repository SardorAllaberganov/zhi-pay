import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TierBadge } from '@/components/zhipay/TierBadge';
import { StatusBadge } from '@/components/zhipay/StatusBadge';
import { Money } from '@/components/zhipay/Money';
import { UserAvatar } from './UserAvatar';
import { UserStatusBadge } from './UsersTable';
import { cn, formatRelative, maskPinfl } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { UserListRow } from '@/data/mockUsers';

interface UsersMobileCardStackProps {
  rows: UserListRow[];
  totalCount: number;
  loading?: boolean;
}

export function UsersMobileCardStack({ rows, totalCount, loading = false }: UsersMobileCardStackProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-background py-12 text-center">
        <h3 className="text-base font-medium">{t('admin.users.empty.title')}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalCount === 0
            ? t('admin.users.empty.body-no-data')
            : t('admin.users.empty.body-filtered')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((u) => (
        <button
          key={u.id}
          type="button"
          onClick={() => navigate(`/customers/users/${u.id}`)}
          className={cn(
            'w-full text-left rounded-lg border border-border bg-background p-4 hover:bg-muted/40 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            u.status === 'deleted' && 'opacity-60',
          )}
        >
          <div className="flex items-center gap-3">
            <UserAvatar name={u.name} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-medium truncate">{u.name}</span>
                {u.hasOpenAmlFlag && (
                  <Shield
                    className="h-3.5 w-3.5 shrink-0 text-danger-600"
                    aria-label={t('admin.users.aml-indicator')}
                  />
                )}
              </div>
              <div className="text-sm text-muted-foreground tabular truncate">{u.phone}</div>
              {u.pinfl && (
                <div className="text-sm text-muted-foreground">
                  <span className="text-xs uppercase tracking-wider mr-1">
                    {t('admin.users.pinfl-label')}
                  </span>
                  <span className="tabular font-mono">{maskPinfl(u.pinfl)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <TierBadge tier={u.tier} />
            <UserStatusBadge status={u.status} />
            {u.kycStatus !== 'never' ? (
              <StatusBadge status={u.kycStatus} domain="kyc" />
            ) : (
              <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 h-6 text-xs text-slate-600 dark:text-slate-300">
                {t('admin.users.filter.kyc.never')}
              </span>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {t('admin.users.column.lifetime-volume')}
              </div>
              <div className="mt-0.5">
                <Money amount={u.lifetimeVolumeUzsTiyins} currency="UZS" />
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {t('admin.users.column.last-login')}
              </div>
              <div className="mt-0.5 text-muted-foreground">
                {u.lastLoginAt ? formatRelative(u.lastLoginAt) : t('admin.users.never')}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
