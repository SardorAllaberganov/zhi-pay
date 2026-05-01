import { useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowUp, ArrowUpDown, Lock, MoreVertical } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { SchemeLogo } from '@/components/zhipay/SchemeLogo';
import { MaskedPan } from '@/components/zhipay/MaskedPan';
import { cn, formatRelative, formatDate } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { CardEntry } from '@/data/mockCards';
import type { UserListRow } from '@/data/mockUsers';
import type { CardsSort, CardsSortKey } from './types';

const COUNTRY_FLAG: Record<string, string> = {
  UZ: '🇺🇿',
};

interface CardsTableProps {
  rows: CardEntry[];
  totalCount: number;
  loading?: boolean;
  focusedIndex: number;
  onFocusRow: (index: number) => void;
  sort: CardsSort;
  onSort: (key: CardsSortKey) => void;
  ownerLookup: (userId: string) => UserListRow | undefined;
  onRowAction: (action: 'open-owner' | 'open-transfers' | 'copy-token', card: CardEntry) => void;
}

export function CardsTable({
  rows,
  totalCount,
  loading = false,
  focusedIndex,
  onFocusRow,
  sort,
  onSort,
  ownerLookup,
  onRowAction,
}: CardsTableProps) {
  const navigate = useNavigate();

  if (loading) {
    return <CardsTableSkeleton />;
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-background py-16 text-center">
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
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">{t('admin.cards.column.card')}</TableHead>
              <TableHead>{t('admin.cards.column.bank')}</TableHead>
              <TableHead>{t('admin.cards.column.holder')}</TableHead>
              <TableHead>{t('admin.cards.column.country')}</TableHead>
              <TableHead>{t('admin.cards.column.owner')}</TableHead>
              <TableHead>{t('admin.cards.column.status')}</TableHead>
              <TableHead className="text-center">{t('admin.cards.column.default')}</TableHead>
              <TableHead>
                <SortableHeader
                  label={t('admin.cards.column.last-used')}
                  active={sort.key === 'last-used'}
                  dir={sort.dir}
                  onClick={() => onSort('last-used')}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  label={t('admin.cards.column.created')}
                  active={sort.key === 'created'}
                  dir={sort.dir}
                  onClick={() => onSort('created')}
                />
              </TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c, idx) => {
              const isFrozen = c.status === 'frozen';
              const isMuted = c.status === 'expired' || c.status === 'removed';
              const owner = ownerLookup(c.userId);
              return (
                <TableRow
                  key={c.id}
                  tabIndex={0}
                  aria-selected={idx === focusedIndex}
                  onClick={() => navigate(`/customers/cards/${c.id}`)}
                  onFocus={() => onFocusRow(idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      navigate(`/customers/cards/${c.id}`);
                    }
                  }}
                  className={cn(
                    'cursor-pointer hover:bg-muted/40 transition-colors',
                    idx === focusedIndex && 'bg-brand-50/50 dark:bg-brand-950/20',
                    isFrozen &&
                      'shadow-[inset_2px_0_0_theme(colors.warning.500)] dark:shadow-[inset_2px_0_0_theme(colors.warning.600)]',
                    isMuted && 'opacity-60',
                  )}
                >
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <SchemeLogo scheme={c.scheme} size="sm" />
                      <MaskedPan value={c.maskedPan} scheme={c.scheme} hideScheme />
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{c.bank}</TableCell>
                  <TableCell className="text-sm truncate max-w-[180px]">
                    {c.holderName}
                  </TableCell>
                  <TableCell className="tabular text-sm">
                    <span className="inline-flex items-center gap-1.5">
                      <span aria-hidden="true">{COUNTRY_FLAG[c.issuerCountry] ?? '🌐'}</span>
                      <span>{c.issuerCountry}</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {owner ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customers/users/${owner.id}`);
                        }}
                        className={cn(
                          'inline-flex items-center text-brand-700 dark:text-brand-300 tabular',
                          'hover:underline focus-visible:underline focus-visible:outline-none',
                        )}
                      >
                        {owner.phone}
                      </button>
                    ) : (
                      <span className="text-muted-foreground italic">
                        {t('admin.cards.unknown-owner')}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <CardStatusPill status={c.status} />
                  </TableCell>
                  <TableCell className="text-center">
                    {c.isDefault && (
                      <span
                        className="inline-block h-2 w-2 rounded-full bg-brand-600"
                        aria-label={t('admin.cards.column.default')}
                        title={t('admin.cards.column.default')}
                      />
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.lastUsedAt
                      ? formatRelative(c.lastUsedAt)
                      : t('admin.cards.last-used.never')}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(c.createdAt)}
                  </TableCell>
                  <TableCell>
                    <RowKebab card={c} onRowAction={onRowAction} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function SortableHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: 'asc' | 'desc';
  onClick: () => void;
}) {
  const Icon = !active ? ArrowUpDown : dir === 'asc' ? ArrowUp : ArrowDown;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        // Match the static <TableHead> treatment exactly — Title Case, 14px,
        // single muted color. Active-sort state is conveyed by the arrow
        // icon only; color stays uniform across every column header.
        'inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 transition-colors',
        'text-sm font-medium text-muted-foreground hover:text-foreground',
      )}
    >
      <span>{label}</span>
      <Icon className="h-3 w-3" aria-hidden="true" />
    </button>
  );
}

function RowKebab({
  card,
  onRowAction,
}: {
  card: CardEntry;
  onRowAction: CardsTableProps['onRowAction'];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t('admin.cards.row.actions')}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors"
        >
          <MoreVertical className="h-4 w-4" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onSelect={() => onRowAction('open-owner', card)}>
          {t('admin.cards.row.open-owner')}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onRowAction('open-transfers', card)}>
          {t('admin.cards.row.open-transfers')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onRowAction('copy-token', card)}>
          {t('admin.cards.row.copy-token')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CardsTableSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><Skeleton className="h-4 w-32" /></TableHead>
            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
            <TableHead><Skeleton className="h-4 w-12" /></TableHead>
            <TableHead><Skeleton className="h-4 w-28" /></TableHead>
            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
            <TableHead><Skeleton className="h-4 w-12" /></TableHead>
            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-5 w-8 rounded" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-28" /></TableCell>
              <TableCell><Skeleton className="h-4 w-12" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16 rounded-sm" /></TableCell>
              <TableCell><Skeleton className="h-2 w-2 rounded-full mx-auto" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * Card-status pill. Frozen carries a lock icon per spec; expired/removed
 * use muted tones since the card is no longer transactable.
 */
export function CardStatusPill({ status }: { status: CardEntry['status'] }) {
  const TONE = {
    active: {
      bg: 'bg-success-50 dark:bg-success-700/15',
      text: 'text-success-700 dark:text-success-600',
      dot: 'bg-success-600',
      label: t('admin.cards.status.active'),
    },
    frozen: {
      bg: 'bg-warning-50 dark:bg-warning-700/15',
      text: 'text-warning-700 dark:text-warning-600',
      dot: 'bg-warning-600',
      label: t('admin.cards.status.frozen'),
    },
    expired: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-600 dark:text-slate-300',
      dot: 'bg-slate-400',
      label: t('admin.cards.status.expired'),
    },
    removed: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-600 dark:text-slate-300',
      dot: 'bg-slate-400',
      label: t('admin.cards.status.removed'),
    },
  } as const;
  const tone = TONE[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 h-6 text-xs font-medium',
        tone.bg,
        tone.text,
      )}
    >
      {status === 'frozen' ? (
        <Lock className="h-3 w-3" aria-hidden="true" />
      ) : (
        <span className={cn('h-1.5 w-1.5 rounded-full', tone.dot)} aria-hidden="true" />
      )}
      {tone.label}
    </span>
  );
}
