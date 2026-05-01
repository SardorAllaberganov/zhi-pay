import { useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowUp, ArrowUpDown, MoreVertical, Star } from 'lucide-react';
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
import { DestinationBadge } from '@/components/zhipay/DestinationBadge';
import { cn, formatRelative, formatDate } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { RecipientEntry } from '@/data/mockRecipients';
import type { UserListRow } from '@/data/mockUsers';
import type { RecipientsSort, RecipientsSortKey } from './types';

interface RecipientsTableProps {
  rows: RecipientEntry[];
  totalCount: number;
  loading?: boolean;
  focusedIndex: number;
  onFocusRow: (index: number) => void;
  sort: RecipientsSort;
  onSort: (key: RecipientsSortKey) => void;
  ownerLookup: (userId: string) => UserListRow | undefined;
  onRowAction: (
    action: 'open-owner' | 'open-transfers' | 'delete',
    recipient: RecipientEntry,
  ) => void;
}

export function RecipientsTable({
  rows,
  totalCount,
  loading = false,
  focusedIndex,
  onFocusRow,
  sort,
  onSort,
  ownerLookup,
  onRowAction,
}: RecipientsTableProps) {
  const navigate = useNavigate();

  if (loading) {
    return <RecipientsTableSkeleton />;
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-background py-16 text-center">
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
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">
                {t('admin.recipients.column.destination')}
              </TableHead>
              <TableHead className="min-w-[200px]">
                {t('admin.recipients.column.identifier')}
              </TableHead>
              <TableHead>{t('admin.recipients.column.display-name')}</TableHead>
              <TableHead>{t('admin.recipients.column.nickname')}</TableHead>
              <TableHead>{t('admin.recipients.column.owner')}</TableHead>
              <TableHead className="text-center">
                {t('admin.recipients.column.favorite')}
              </TableHead>
              <TableHead className="text-right">
                <SortableHeader
                  label={t('admin.recipients.column.transfer-count')}
                  active={sort.key === 'transfer-count'}
                  dir={sort.dir}
                  onClick={() => onSort('transfer-count')}
                  align="right"
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  label={t('admin.recipients.column.last-used')}
                  active={sort.key === 'last-used'}
                  dir={sort.dir}
                  onClick={() => onSort('last-used')}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  label={t('admin.recipients.column.created')}
                  active={sort.key === 'created'}
                  dir={sort.dir}
                  onClick={() => onSort('created')}
                />
              </TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, idx) => {
              const owner = ownerLookup(r.userId);
              return (
                <TableRow
                  key={r.id}
                  tabIndex={0}
                  aria-selected={idx === focusedIndex}
                  onClick={() => navigate(`/customers/recipients/${r.id}`)}
                  onFocus={() => onFocusRow(idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      navigate(`/customers/recipients/${r.id}`);
                    }
                  }}
                  className={cn(
                    'cursor-pointer hover:bg-muted/40 transition-colors',
                    idx === focusedIndex && 'bg-brand-50/50 dark:bg-brand-950/20',
                  )}
                >
                  <TableCell>
                    <DestinationBadge destination={r.destination} />
                  </TableCell>
                  <TableCell className="text-sm font-mono tabular truncate max-w-[240px]">
                    {r.identifier}
                  </TableCell>
                  <TableCell className="text-sm truncate max-w-[180px]">
                    {/* Native CJK script renders verbatim — no transliteration. */}
                    {r.displayName}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-[160px]">
                    {r.nickname ?? <span className="opacity-60">—</span>}
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
                        {t('admin.recipients.unknown-owner')}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {r.isFavorite ? (
                      <Star
                        className="inline-block h-4 w-4 text-warning-600 fill-warning-600"
                        aria-label={t('admin.recipients.favorite')}
                      />
                    ) : (
                      <span className="opacity-40">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular">
                    {r.transferCount.toLocaleString('en')}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatRelative(r.lastUsedAt)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(r.createdAt)}
                  </TableCell>
                  <TableCell>
                    <RowKebab recipient={r} onRowAction={onRowAction} />
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
  align = 'left',
}: {
  label: string;
  active: boolean;
  dir: 'asc' | 'desc';
  onClick: () => void;
  align?: 'left' | 'right';
}) {
  const Icon = !active ? ArrowUpDown : dir === 'asc' ? ArrowUp : ArrowDown;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 transition-colors',
        'text-sm font-medium text-muted-foreground hover:text-foreground',
        align === 'right' && 'flex-row-reverse',
      )}
    >
      <span>{label}</span>
      <Icon className="h-3 w-3" aria-hidden="true" />
    </button>
  );
}

function RowKebab({
  recipient,
  onRowAction,
}: {
  recipient: RecipientEntry;
  onRowAction: RecipientsTableProps['onRowAction'];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t('admin.recipients.row.actions')}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors"
        >
          <MoreVertical className="h-4 w-4" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onSelect={() => onRowAction('open-owner', recipient)}>
          {t('admin.recipients.row.open-owner')}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onRowAction('open-transfers', recipient)}>
          {t('admin.recipients.row.open-transfers')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => onRowAction('delete', recipient)}
          className="text-danger-700 focus:text-danger-700 focus:bg-danger-50 dark:focus:bg-danger-700/10"
        >
          {t('admin.recipients.row.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RecipientsTableSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead><Skeleton className="h-4 w-32" /></TableHead>
            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead><Skeleton className="h-4 w-28" /></TableHead>
            <TableHead><Skeleton className="h-4 w-12" /></TableHead>
            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-5 w-16 rounded-sm" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-28" /></TableCell>
              <TableCell><Skeleton className="h-4 w-4 mx-auto rounded-sm" /></TableCell>
              <TableCell><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
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
