import { Fragment } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Pencil,
  ScrollText,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn, formatDateTime, formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { AppVersion } from '@/data/mockAppVersions';
import { ForceUpdatePill } from './ForceUpdatePill';
import { ReleaseNotesPreview } from './ReleaseNotesPreview';
import { RowExpanded } from './RowExpanded';
import type { AppVersionSort } from './types';

interface VersionsTableProps {
  rows: AppVersion[];
  loading?: boolean;
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  sort: AppVersionSort;
  onSort: () => void;
  onEdit: (v: AppVersion) => void;
  onOpenAudit: (v: AppVersion) => void;
}

export function VersionsTable({
  rows,
  loading = false,
  expandedId,
  onToggleExpand,
  sort,
  onSort,
  onEdit,
  onOpenAudit,
}: VersionsTableProps) {
  if (loading) return <VersionsTableSkeleton />;

  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {/* Non-sticky thead per LESSON 2026-04-30 */}
            <TableRow>
              <TableHead className="w-8" />
              <TableHead className="min-w-[140px]">
                {t('admin.app-versions.column.version')}
              </TableHead>
              <TableHead className="min-w-[160px]">
                <SortableHeader
                  label={t('admin.app-versions.column.released-at')}
                  active
                  dir={sort.dir}
                  onClick={onSort}
                />
              </TableHead>
              <TableHead className="min-w-[120px]">
                {t('admin.app-versions.column.min-supported')}
              </TableHead>
              <TableHead className="min-w-[110px]">
                {t('admin.app-versions.column.force-update')}
              </TableHead>
              <TableHead className="min-w-[260px]">
                {t('admin.app-versions.column.release-notes')}
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const isExpanded = row.id === expandedId;
              return (
                <Fragment key={row.id}>
                  <TableRow
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    onClick={() => onToggleExpand(row.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        onToggleExpand(row.id);
                      }
                    }}
                    className={cn(
                      'cursor-pointer hover:bg-muted/40',
                      isExpanded && 'bg-muted/30',
                    )}
                  >
                    <TableCell className="w-8 text-muted-foreground">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">v{row.version}</span>
                        {row.forceUpdate && <ForceUpdatePill />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ReleasedAtCell value={row.releasedAt} />
                    </TableCell>
                    <TableCell>
                      {row.minSupported ? (
                        <span className="font-mono text-sm tabular">{row.minSupported}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.forceUpdate ? (
                        <span className="text-sm text-danger-700 dark:text-danger-600 font-medium">
                          {t('admin.app-versions.cell.force-update.yes')}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {t('admin.app-versions.cell.force-update.no')}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[420px]">
                      <ReleaseNotesPreview notesEn={row.releaseNotesEn} />
                    </TableCell>
                    <TableCell className="w-10 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={t('admin.app-versions.row-actions.label')}
                          >
                            <MoreVertical className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => onEdit(row)}>
                            <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                            {t('admin.app-versions.row-actions.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => onOpenAudit(row)}>
                            <ScrollText className="mr-2 h-4 w-4" aria-hidden="true" />
                            {t('admin.app-versions.row-actions.audit')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow
                      className="hover:bg-transparent data-[state=selected]:bg-transparent"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TableCell colSpan={7} className="p-0">
                        <RowExpanded version={row} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
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
  const Icon = !active ? ArrowDown : dir === 'desc' ? ArrowDown : ArrowUp;
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
    >
      {label}
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
}

function ReleasedAtCell({ value }: { value: Date }) {
  return (
    <div className="flex flex-col leading-tight">
      <span className="text-sm">{formatRelative(value)}</span>
      <span className="text-sm text-muted-foreground font-mono" title={formatDateTime(value)}>
        {formatDateTime(value)}
      </span>
    </div>
  );
}

function VersionsTableSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>{t('admin.app-versions.column.version')}</TableHead>
              <TableHead>{t('admin.app-versions.column.released-at')}</TableHead>
              <TableHead>{t('admin.app-versions.column.min-supported')}</TableHead>
              <TableHead>{t('admin.app-versions.column.force-update')}</TableHead>
              <TableHead>{t('admin.app-versions.column.release-notes')}</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="w-8">
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-56" />
                </TableCell>
                <TableCell className="w-10">
                  <Skeleton className="h-8 w-8 rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
