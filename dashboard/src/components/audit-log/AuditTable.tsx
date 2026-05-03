import { Fragment } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
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
import { cn, formatDateTime, formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import {
  entityRefPrefix,
  summarizeContext,
  type AuditEvent,
} from '@/data/mockAuditLog';
import { ActorTypeChip } from './ActorTypeChip';
import { ActionChip } from './ActionChip';
import { StatusTransitionPill } from './StatusTransitionPill';
import { AuditRowExpanded } from './AuditRowExpanded';
import { useCopyFeedback } from '@/hooks/useCopyFeedback';
import type { AuditSort } from './types';

interface AuditTableProps {
  rows: AuditEvent[];
  totalCount: number;
  loading?: boolean;
  focusedIndex: number;
  onFocusRow: (index: number) => void;
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  sort: AuditSort;
  onSort: () => void;
  onScopeToEntity: (entityId: string) => void;
}

export function AuditTable({
  rows,
  totalCount,
  loading = false,
  focusedIndex,
  onFocusRow,
  expandedId,
  onToggleExpand,
  sort,
  onSort,
  onScopeToEntity,
}: AuditTableProps) {
  if (loading) return <AuditTableSkeleton />;

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-background py-16 text-center">
        <h3 className="text-base font-medium">
          {totalCount === 0
            ? t('admin.audit-log.empty.no-data.title')
            : t('admin.audit-log.empty.no-results.title')}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalCount === 0
            ? t('admin.audit-log.empty.no-data.body')
            : t('admin.audit-log.empty.no-results.body')}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {/* Per LESSON 2026-04-30 — column headers are NOT sticky even when
                a spec asks for it. Page-scrolling continues to surface them
                naturally. */}
            <TableRow>
              <TableHead className="w-8" />
              <TableHead className="min-w-[160px]">
                <SortableHeader
                  label={t('admin.audit-log.column.timestamp')}
                  active
                  dir={sort.dir}
                  onClick={onSort}
                />
              </TableHead>
              <TableHead>{t('admin.audit-log.column.actor-type')}</TableHead>
              <TableHead className="min-w-[200px]">{t('admin.audit-log.column.actor')}</TableHead>
              <TableHead>{t('admin.audit-log.column.action')}</TableHead>
              <TableHead>{t('admin.audit-log.column.entity-type')}</TableHead>
              <TableHead>{t('admin.audit-log.column.entity-ref')}</TableHead>
              <TableHead>{t('admin.audit-log.column.transition')}</TableHead>
              <TableHead className="min-w-[260px]">{t('admin.audit-log.column.context')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, idx) => {
              const isExpanded = row.id === expandedId;
              return (
                <Fragment key={row.id}>
                  <TableRow
                    tabIndex={0}
                    aria-selected={idx === focusedIndex}
                    aria-expanded={isExpanded}
                    onClick={() => {
                      onFocusRow(idx);
                      onToggleExpand(row.id);
                    }}
                    onFocus={() => onFocusRow(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        onToggleExpand(row.id);
                      }
                    }}
                    className={cn(
                      'cursor-pointer hover:bg-muted/40',
                      idx === focusedIndex && 'bg-muted/30',
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
                      <TimestampCell ts={row.timestamp} />
                    </TableCell>
                    <TableCell>
                      <ActorTypeChip type={row.actorType} />
                    </TableCell>
                    <TableCell>
                      <ActorCell event={row} />
                    </TableCell>
                    <TableCell>
                      <ActionChip action={row.action} />
                    </TableCell>
                    <TableCell className="text-sm text-foreground/80">
                      {t(`admin.audit-log.entity-type.${row.entity.type}`)}
                    </TableCell>
                    <TableCell>
                      <EntityRefCell id={row.entity.id} />
                    </TableCell>
                    <TableCell>
                      <StatusTransitionPill from={row.fromStatus} to={row.toStatus} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[420px]">
                      <span className="line-clamp-1 break-all">{summarizeContext(row)}</span>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow
                      className="hover:bg-transparent data-[state=selected]:bg-transparent"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TableCell colSpan={9} className="p-0">
                        <AuditRowExpanded event={row} onScopeToEntity={onScopeToEntity} />
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

// =====================================================================

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
  const Icon = !active ? ArrowUpDown : dir === 'desc' ? ArrowDown : ArrowUp;
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

function TimestampCell({ ts }: { ts: Date }) {
  return (
    <div className="flex flex-col leading-tight">
      <span className="text-sm font-mono tabular tabular-nums">{formatDateTime(ts)}</span>
      <span className="text-sm text-muted-foreground" title={formatDateTime(ts)}>
        {formatRelative(ts)}
      </span>
    </div>
  );
}

function ActorCell({ event }: { event: AuditEvent }) {
  const a = event.actor;
  if (event.actorType === 'admin') {
    const initials = a.name
      ? a.name
          .split(/\s+/)
          .slice(0, 2)
          .map((p) => p.charAt(0).toUpperCase())
          .join('')
      : 'A';
    return (
      <div className="flex items-center gap-2">
        <span
          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-warning-50 dark:bg-warning-700/15 text-warning-700 text-xs font-semibold"
          aria-hidden="true"
        >
          {initials}
        </span>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-sm font-medium truncate">{a.name ?? a.id}</span>
          {a.id && a.id !== a.name && (
            <span className="text-sm text-muted-foreground font-mono truncate">{a.id}</span>
          )}
        </div>
      </div>
    );
  }
  if (event.actorType === 'user') {
    return (
      <span className="text-sm font-mono">{a.phone ?? a.id ?? t('admin.audit-log.actor-type.user')}</span>
    );
  }
  if (event.actorType === 'provider') {
    return (
      <span className="text-sm">{a.name ?? a.id ?? t('admin.audit-log.actor-type.provider')}</span>
    );
  }
  return (
    <span className="text-sm text-muted-foreground italic">
      {t('admin.audit-log.actor-type.system')}
    </span>
  );
}

function EntityRefCell({ id }: { id: string }) {
  const { copied, copy } = useCopyFeedback();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        copy(id);
      }}
      title={id}
      className={cn(
        'inline-flex items-center gap-1 font-mono text-sm transition-colors rounded-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        copied
          ? 'text-success-700 dark:text-success-600'
          : 'text-foreground/80 hover:text-foreground',
      )}
      aria-label={t('admin.audit-log.column.entity-ref')}
      aria-live="polite"
    >
      <span>{entityRefPrefix(id)}</span>
      {copied ? (
        <Check className="h-3 w-3" aria-hidden="true" />
      ) : (
        <Copy className="h-3 w-3 opacity-60" aria-hidden="true" />
      )}
    </button>
  );
}

function AuditTableSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>{t('admin.audit-log.column.timestamp')}</TableHead>
              <TableHead>{t('admin.audit-log.column.actor-type')}</TableHead>
              <TableHead>{t('admin.audit-log.column.actor')}</TableHead>
              <TableHead>{t('admin.audit-log.column.action')}</TableHead>
              <TableHead>{t('admin.audit-log.column.entity-type')}</TableHead>
              <TableHead>{t('admin.audit-log.column.entity-ref')}</TableHead>
              <TableHead>{t('admin.audit-log.column.transition')}</TableHead>
              <TableHead>{t('admin.audit-log.column.context')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="w-8">
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-sm" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-sm" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-32 rounded-sm" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
