import { Fragment } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
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
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ErrorCodeWithStats } from '@/data/mockErrorCodes';
import { CategoryChip } from './CategoryChip';
import { RetryableChip } from './RetryableChip';
import { RowExpanded } from './RowExpanded';
import type { ErrorCodeSort } from './types';

interface Props {
  rows: ErrorCodeWithStats[];
  totalCount: number;
  loading?: boolean;
  focusedIndex: number;
  onFocusRow: (index: number) => void;
  expandedCode: string | null;
  onToggleExpand: (code: string) => void;
  sort: ErrorCodeSort;
  onSort: () => void;
}

const MESSAGE_PREVIEW_MAX = 80;

function truncate(text: string, max: number): string {
  const collapsed = text.replace(/\s+/g, ' ').trim();
  if (collapsed.length <= max) return collapsed;
  const cut = collapsed.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

export function ErrorCodesTable({
  rows,
  totalCount,
  loading = false,
  focusedIndex,
  onFocusRow,
  expandedCode,
  onToggleExpand,
  sort,
  onSort,
}: Props) {
  if (loading) return <TableSkeleton />;

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-background py-16 text-center">
        <h3 className="text-base font-medium">
          {totalCount === 0
            ? t('admin.error-codes.empty.no-data.title')
            : t('admin.error-codes.empty.no-results.title')}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalCount === 0
            ? t('admin.error-codes.empty.no-data.body')
            : t('admin.error-codes.empty.no-results.body')}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {/* Per LESSON 2026-04-30 — never sticky <thead>. */}
            <TableRow>
              <TableHead className="w-8" />
              <TableHead className="min-w-[220px]">
                <SortableHeader
                  label={t('admin.error-codes.column.code')}
                  active
                  dir={sort.dir}
                  onClick={onSort}
                />
              </TableHead>
              <TableHead className="min-w-[140px]">
                {t('admin.error-codes.column.category')}
              </TableHead>
              <TableHead className="min-w-[110px]">
                {t('admin.error-codes.column.retryable')}
              </TableHead>
              <TableHead className="min-w-[320px]">
                {t('admin.error-codes.column.message')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, idx) => {
              const isExpanded = row.code === expandedCode;
              return (
                <Fragment key={row.code}>
                  <TableRow
                    tabIndex={0}
                    aria-selected={idx === focusedIndex}
                    aria-expanded={isExpanded}
                    onClick={() => {
                      onFocusRow(idx);
                      onToggleExpand(row.code);
                    }}
                    onFocus={() => onFocusRow(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        onToggleExpand(row.code);
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
                    <TableCell className="font-mono text-sm tabular tabular-nums">
                      {row.code}
                    </TableCell>
                    <TableCell>
                      <CategoryChip category={row.category} />
                    </TableCell>
                    <TableCell>
                      <RetryableChip retryable={row.retryable} />
                    </TableCell>
                    <TableCell className="text-sm text-foreground/80 max-w-[480px]">
                      <span className="line-clamp-1">
                        {truncate(row.message_en, MESSAGE_PREVIEW_MAX)}
                      </span>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow
                      className="hover:bg-transparent data-[state=selected]:bg-transparent"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TableCell colSpan={5} className="p-0">
                        <RowExpanded row={row} />
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
  const Icon = !active ? ArrowUpDown : dir === 'asc' ? ArrowUp : ArrowDown;
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

function TableSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>{t('admin.error-codes.column.code')}</TableHead>
              <TableHead>{t('admin.error-codes.column.category')}</TableHead>
              <TableHead>{t('admin.error-codes.column.retryable')}</TableHead>
              <TableHead>{t('admin.error-codes.column.message')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="w-8">
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-44" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-sm" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-14 rounded-sm" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-72" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
