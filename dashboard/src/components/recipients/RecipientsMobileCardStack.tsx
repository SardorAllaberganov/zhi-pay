import { useNavigate } from 'react-router-dom';
import { Star, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { DestinationBadge } from '@/components/zhipay/DestinationBadge';
import { cn, formatRelative, formatDate } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { RecipientEntry } from '@/data/mockRecipients';
import type { UserListRow } from '@/data/mockUsers';

interface RecipientsMobileCardStackProps {
  rows: RecipientEntry[];
  totalCount: number;
  loading?: boolean;
  ownerLookup: (userId: string) => UserListRow | undefined;
}

export function RecipientsMobileCardStack({
  rows,
  totalCount,
  loading = false,
  ownerLookup,
}: RecipientsMobileCardStackProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-background py-12 text-center">
        <h3 className="text-base font-medium">{t('admin.recipients.empty.title')}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalCount === 0
            ? t('admin.recipients.empty.body-no-data')
            : t('admin.recipients.empty.body-filtered')}
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {rows.map((r) => {
        const owner = ownerLookup(r.userId);
        return (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => navigate(`/customers/recipients/${r.id}`)}
              className={cn(
                'w-full text-left rounded-md border bg-card text-card-foreground shadow-sm px-4 py-3',
                'hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <DestinationBadge destination={r.destination} />
                    {r.isFavorite && (
                      <Star
                        className="h-4 w-4 text-warning-600 fill-warning-600 shrink-0"
                        aria-label={t('admin.recipients.favorite')}
                      />
                    )}
                  </div>
                  <div className="font-medium truncate">{r.displayName}</div>
                  <div className="text-sm text-muted-foreground tabular font-mono truncate">
                    {r.identifier}
                  </div>
                  {r.nickname && (
                    <div className="text-sm text-muted-foreground italic truncate">
                      {t('admin.recipients.nickname-prefix', { value: r.nickname })}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground pt-0.5">
                    <span>
                      {t('admin.recipients.row.transfer-count', {
                        count: r.transferCount,
                      })}
                    </span>
                    <span>
                      {t('admin.recipients.row.last-used', {
                        value: formatRelative(r.lastUsedAt),
                      })}
                    </span>
                    <span>
                      {t('admin.recipients.row.added', {
                        value: formatDate(r.createdAt),
                      })}
                    </span>
                  </div>
                  {owner && (
                    <div className="text-sm text-muted-foreground tabular truncate">
                      {t('admin.recipients.row.owner-prefix', { value: owner.phone })}
                    </div>
                  )}
                </div>
                <ChevronRight
                  className="h-4 w-4 text-muted-foreground shrink-0 mt-1"
                  aria-hidden="true"
                />
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
