import { ArrowDown, ArrowUp, ArrowUpDown, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatDateTime } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { BlacklistEntry, BlacklistType } from '@/data/mockBlacklist';
import { getAffectedSummary } from '@/data/mockBlacklist';
import { IdentityCell } from './IdentityCell';
import { ExpiryCell } from './ExpiryCell';
import { AddedByCell } from './AddedByCell';
import type { BlacklistSort, BlacklistSortField } from './types';

interface Props {
  rows: BlacklistEntry[];
  loading: boolean;
  type: BlacklistType;
  sort: BlacklistSort;
  setSort: (sort: BlacklistSort) => void;
  focusedIndex: number;
  onRowClick: (id: string) => void;
  onRemove: (id: string) => void;
}

function truncate80(s: string): string {
  return s.length <= 80 ? s : `${s.slice(0, 80)}…`;
}

export function BlacklistTable({
  rows,
  loading,
  sort,
  setSort,
  focusedIndex,
  onRowClick,
  onRemove,
}: Props) {
  function toggleSort(field: BlacklistSortField) {
    if (sort.field === field) {
      setSort({ field, dir: sort.dir === 'asc' ? 'desc' : 'asc' });
    } else {
      setSort({ field, dir: 'desc' });
    }
  }

  if (loading) {
    return (
      <div className="rounded-md border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.blacklist.column.identifier')}</TableHead>
              <TableHead>{t('admin.blacklist.column.reason')}</TableHead>
              <TableHead>{t('admin.blacklist.column.added-by')}</TableHead>
              <TableHead>{t('admin.blacklist.column.created')}</TableHead>
              <TableHead>{t('admin.blacklist.column.expires')}</TableHead>
              <TableHead className="text-right">
                {t('admin.blacklist.column.affecting')}
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell><Skeleton className="h-4 w-72" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                <TableCell />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-border bg-card px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          {t('admin.blacklist.empty.body')}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('admin.blacklist.column.identifier')}</TableHead>
            <TableHead>{t('admin.blacklist.column.reason')}</TableHead>
            <TableHead>{t('admin.blacklist.column.added-by')}</TableHead>
            <TableHead>
              <SortableHeader
                label={t('admin.blacklist.column.created')}
                active={sort.field === 'createdAt'}
                dir={sort.dir}
                onClick={() => toggleSort('createdAt')}
              />
            </TableHead>
            <TableHead>
              <SortableHeader
                label={t('admin.blacklist.column.expires')}
                active={sort.field === 'expiresAt'}
                dir={sort.dir}
                onClick={() => toggleSort('expiresAt')}
              />
            </TableHead>
            <TableHead className="text-right">
              {t('admin.blacklist.column.affecting')}
            </TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => {
            const affected = getAffectedSummary(row);
            const focused = i === focusedIndex;
            return (
              <TableRow
                key={row.id}
                onClick={() => onRowClick(row.id)}
                className={cn(
                  'cursor-pointer',
                  focused && 'bg-muted/60',
                )}
              >
                <TableCell>
                  <IdentityCell type={row.type} identifier={row.identifier} />
                </TableCell>
                <TableCell className="max-w-[420px]">
                  <span className="text-sm text-foreground/90">
                    {truncate80(row.reason)}
                  </span>
                </TableCell>
                <TableCell>
                  <AddedByCell adminId={row.addedBy} />
                </TableCell>
                <TableCell>
                  <span className="text-sm">{formatDateTime(row.createdAt)}</span>
                </TableCell>
                <TableCell>
                  <ExpiryCell entry={row} />
                </TableCell>
                <TableCell className="text-right">
                  <AffectingCell count={affected.total} />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        aria-label={t('admin.blacklist.row.actions')}
                      >
                        <MoreVertical className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => onRowClick(row.id)}>
                        {t('admin.blacklist.row.open')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onRemove(row.id)}
                        className="text-danger-700 dark:text-danger-600 focus:text-danger-700"
                      >
                        {t('admin.blacklist.action.remove')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function AffectingCell({ count }: { count: number }) {
  if (count === 0) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  return (
    <span className="text-sm font-medium text-foreground tabular">{count}</span>
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
      className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      <span>{label}</span>
      <Icon className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
    </button>
  );
}
