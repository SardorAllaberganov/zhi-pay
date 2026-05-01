import { useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowUp, ArrowUpDown, MoreVertical, Shield } from 'lucide-react';
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
import { TierBadge } from '@/components/zhipay/TierBadge';
import { StatusBadge } from '@/components/zhipay/StatusBadge';
import { Money } from '@/components/zhipay/Money';
import { UserAvatar } from './UserAvatar';
import { cn, formatRelative, formatDate, maskPinfl } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { UserListRow } from '@/data/mockUsers';
import type { UsersSort, UsersSortKey } from './types';

interface UsersTableProps {
  rows: UserListRow[];
  totalCount: number;
  loading?: boolean;
  focusedIndex: number;
  onFocusRow: (index: number) => void;
  sort: UsersSort;
  onSort: (key: UsersSortKey) => void;
  onRowAction: (action: 'block' | 'unblock' | 'open-aml' | 'open-audit', user: UserListRow) => void;
}

export function UsersTable({
  rows,
  totalCount,
  loading = false,
  focusedIndex,
  onFocusRow,
  sort,
  onSort,
  onRowAction,
}: UsersTableProps) {
  const navigate = useNavigate();

  if (loading) {
    return <UsersTableSkeleton />;
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-background py-16 text-center">
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
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[220px]">
                {t('admin.users.column.name')}
              </TableHead>
              <TableHead>{t('admin.users.column.phone')}</TableHead>
              <TableHead>{t('admin.users.column.tier')}</TableHead>
              <TableHead>{t('admin.users.column.status')}</TableHead>
              <TableHead>{t('admin.users.column.kyc')}</TableHead>
              <TableHead className="text-right">{t('admin.users.column.cards')}</TableHead>
              <TableHead className="text-right">
                <SortableHeader
                  label={t('admin.users.column.lifetime-volume')}
                  active={sort.key === 'volume'}
                  dir={sort.dir}
                  onClick={() => onSort('volume')}
                  align="right"
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  label={t('admin.users.column.last-login')}
                  active={sort.key === 'last-login'}
                  dir={sort.dir}
                  onClick={() => onSort('last-login')}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  label={t('admin.users.column.created')}
                  active={sort.key === 'created'}
                  dir={sort.dir}
                  onClick={() => onSort('created')}
                />
              </TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((u, idx) => (
              <TableRow
                key={u.id}
                tabIndex={0}
                aria-selected={idx === focusedIndex}
                onClick={() => navigate(`/customers/users/${u.id}`)}
                onFocus={() => onFocusRow(idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    navigate(`/customers/users/${u.id}`);
                  }
                }}
                className={cn(
                  'cursor-pointer hover:bg-muted/40 transition-colors',
                  idx === focusedIndex && 'bg-brand-50/50 dark:bg-brand-950/20',
                  u.status === 'deleted' && 'opacity-60',
                )}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <UserAvatar name={u.name} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium truncate">{u.name}</span>
                        {u.hasOpenAmlFlag && (
                          <Shield
                            className="h-3.5 w-3.5 shrink-0 text-danger-600"
                            aria-label={t('admin.users.aml-indicator')}
                          />
                        )}
                      </div>
                      {u.pinfl ? (
                        <div className="text-sm text-muted-foreground">
                          <span className="text-xs uppercase tracking-wider mr-1">
                            {t('admin.users.pinfl-label')}
                          </span>
                          <span className="tabular font-mono">{maskPinfl(u.pinfl)}</span>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground italic">
                          {t('admin.users.pinfl-not-verified')}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="tabular text-sm">{u.phone}</TableCell>
                <TableCell>
                  <TierBadge tier={u.tier} />
                </TableCell>
                <TableCell>
                  <UserStatusBadge status={u.status} />
                </TableCell>
                <TableCell>
                  {u.kycStatus === 'never' ? (
                    <span className="text-sm text-muted-foreground">
                      {t('admin.users.filter.kyc.never')}
                    </span>
                  ) : (
                    <StatusBadge status={u.kycStatus} domain="kyc" />
                  )}
                </TableCell>
                <TableCell className="text-right tabular">{u.linkedCardsCount}</TableCell>
                <TableCell className="text-right">
                  <Money amount={u.lifetimeVolumeUzsTiyins} currency="UZS" />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {u.lastLoginAt ? formatRelative(u.lastLoginAt) : t('admin.users.never')}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(u.createdAt)}
                </TableCell>
                <TableCell>
                  <RowKebab user={u} onRowAction={onRowAction} />
                </TableCell>
              </TableRow>
            ))}
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
        // Match TableHead exactly — Title Case, 14px, single muted color.
        // Active-sort state is conveyed by the arrow icon only; color stays
        // uniform with non-sortable column headers.
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
  user,
  onRowAction,
}: {
  user: UserListRow;
  onRowAction: UsersTableProps['onRowAction'];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t('admin.users.row.actions')}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors"
        >
          <MoreVertical className="h-4 w-4" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        {user.status === 'blocked' ? (
          <DropdownMenuItem onSelect={() => onRowAction('unblock', user)}>
            {t('admin.users.action.unblock')}
          </DropdownMenuItem>
        ) : user.status === 'active' ? (
          <DropdownMenuItem onSelect={() => onRowAction('block', user)}>
            {t('admin.users.action.block')}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onRowAction('open-aml', user)}>
          {t('admin.users.action.open-aml')}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onRowAction('open-audit', user)}>
          {t('admin.users.action.open-audit')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UsersTableSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead><Skeleton className="h-4 w-12" /></TableHead>
            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
            <TableHead><Skeleton className="h-4 w-12" /></TableHead>
            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3.5 w-24" />
                  </div>
                </div>
              </TableCell>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
              <TableCell><Skeleton className="h-4 w-6" /></TableCell>
              <TableCell><Skeleton className="h-4 w-28" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Local wrapper around StatusBadge for the user-status enum (active/blocked/pending/deleted),
// which is not in the canonical statusToTone() domains.
function UserStatusBadge({ status }: { status: UserListRow['status'] }) {
  const TONE = {
    active:  { bg: 'bg-success-50 dark:bg-success-700/15', text: 'text-success-700 dark:text-success-600', dot: 'bg-success-600', label: t('admin.users.filter.status.active') },
    blocked: { bg: 'bg-danger-50 dark:bg-danger-700/15',   text: 'text-danger-700 dark:text-danger-600',   dot: 'bg-danger-600',  label: t('admin.users.filter.status.blocked') },
    pending: { bg: 'bg-warning-50 dark:bg-warning-700/15', text: 'text-warning-700 dark:text-warning-600', dot: 'bg-warning-600', label: t('admin.users.filter.status.pending') },
    deleted: { bg: 'bg-slate-100 dark:bg-slate-800',       text: 'text-slate-600 dark:text-slate-300',     dot: 'bg-slate-400',   label: t('admin.users.filter.status.deleted') },
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
      <span className={cn('h-1.5 w-1.5 rounded-full', tone.dot)} aria-hidden="true" />
      {tone.label}
    </span>
  );
}

export { UserStatusBadge };
