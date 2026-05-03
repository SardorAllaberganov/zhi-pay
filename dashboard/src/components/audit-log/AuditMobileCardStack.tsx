import { Check, ChevronDown, ChevronRight, Copy } from 'lucide-react';
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

interface AuditMobileCardStackProps {
  rows: AuditEvent[];
  totalCount: number;
  loading?: boolean;
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  onScopeToEntity: (entityId: string) => void;
}

export function AuditMobileCardStack({
  rows,
  totalCount,
  loading = false,
  expandedId,
  onToggleExpand,
  onScopeToEntity,
}: AuditMobileCardStackProps) {
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
      <div className="rounded-lg border border-border bg-background py-12 px-6 text-center">
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
    <ul className="space-y-2.5">
      {rows.map((row) => {
        const isExpanded = row.id === expandedId;
        return (
          <li
            key={row.id}
            className={cn(
              'rounded-lg border border-border bg-background overflow-hidden',
              isExpanded && 'ring-1 ring-brand-300 dark:ring-brand-700',
            )}
          >
            <button
              type="button"
              onClick={() => onToggleExpand(row.id)}
              className="w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors"
              aria-expanded={isExpanded}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="text-sm font-mono tabular tabular-nums">
                    {formatDateTime(row.timestamp)}
                  </span>
                  <span className="text-sm text-muted-foreground">{formatRelative(row.timestamp)}</span>
                </div>
                <div className="shrink-0 mt-0.5">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  )}
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <ActorTypeChip type={row.actorType} />
                <ActionChip action={row.action} />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-sm">
                <span className="text-foreground/80">
                  {t(`admin.audit-log.entity-type.${row.entity.type}`)}
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="font-mono text-foreground/80">{entityRefPrefix(row.entity.id)}</span>
                <CopyEntityIdButton id={row.entity.id} />
              </div>

              {(row.fromStatus || row.toStatus) && (
                <div className="mt-2">
                  <StatusTransitionPill from={row.fromStatus} to={row.toStatus} />
                </div>
              )}

              <p className="mt-2 text-sm text-muted-foreground line-clamp-2 break-all">
                {summarizeContext(row)}
              </p>
            </button>

            {isExpanded && (
              <AuditRowExpanded event={row} onScopeToEntity={onScopeToEntity} />
            )}
          </li>
        );
      })}
    </ul>
  );
}

function CopyEntityIdButton({ id }: { id: string }) {
  const { copied, copy } = useCopyFeedback();
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        copy(id);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          copy(id);
        }
      }}
      aria-label={t('admin.audit-log.column.entity-ref')}
      aria-live="polite"
      className={cn(
        'inline-flex h-5 w-5 items-center justify-center rounded-sm transition-colors',
        copied
          ? 'text-success-700 dark:text-success-600 bg-success-50 dark:bg-success-700/15'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
      )}
    >
      {copied ? (
        <Check className="h-3 w-3" aria-hidden="true" />
      ) : (
        <Copy className="h-3 w-3" aria-hidden="true" />
      )}
    </span>
  );
}

