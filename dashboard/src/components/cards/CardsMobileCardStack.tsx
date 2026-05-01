import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { SchemeLogo } from '@/components/zhipay/SchemeLogo';
import { MaskedPan } from '@/components/zhipay/MaskedPan';
import { CardStatusPill } from './CardsTable';
import { cn, formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { CardEntry } from '@/data/mockCards';
import type { UserListRow } from '@/data/mockUsers';

interface CardsMobileCardStackProps {
  rows: CardEntry[];
  totalCount: number;
  loading?: boolean;
  ownerLookup: (userId: string) => UserListRow | undefined;
}

export function CardsMobileCardStack({
  rows,
  totalCount,
  loading = false,
  ownerLookup,
}: CardsMobileCardStackProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-background py-12 text-center">
        <h3 className="text-base font-medium">{t('admin.cards.empty.title')}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalCount === 0
            ? t('admin.cards.empty.body-no-data')
            : t('admin.cards.empty.body-filtered')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((c) => {
        const isFrozen = c.status === 'frozen';
        const isMuted = c.status === 'expired' || c.status === 'removed';
        const owner = ownerLookup(c.userId);
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => navigate(`/customers/cards/${c.id}`)}
            className={cn(
              'w-full text-left rounded-lg border border-border bg-background p-4 hover:bg-muted/40 transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isFrozen &&
                'shadow-[inset_2px_0_0_theme(colors.warning.500)] dark:shadow-[inset_2px_0_0_theme(colors.warning.600)]',
              isMuted && 'opacity-60',
            )}
          >
            <div className="flex items-start gap-3">
              <SchemeLogo scheme={c.scheme} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <MaskedPan value={c.maskedPan} scheme={c.scheme} hideScheme />
                  {c.isDefault && (
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-brand-600"
                      aria-label={t('admin.cards.column.default')}
                    />
                  )}
                </div>
                <div className="mt-1 text-sm text-muted-foreground truncate">
                  {c.bank} · {c.holderName}
                </div>
              </div>
              <CardStatusPill status={c.status} />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t('admin.cards.column.owner')}
                </div>
                <div className="mt-0.5 tabular truncate">
                  {owner ? owner.phone : t('admin.cards.unknown-owner')}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t('admin.cards.column.last-used')}
                </div>
                <div className="mt-0.5 text-muted-foreground">
                  {c.lastUsedAt
                    ? formatRelative(c.lastUsedAt)
                    : t('admin.cards.last-used.never')}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
