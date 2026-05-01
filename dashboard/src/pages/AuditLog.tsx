import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AuditLogBanner } from '@/components/audit-log/AuditLogBanner';
import { AuditFilterBar } from '@/components/audit-log/AuditFilterBar';
import { AuditTable } from '@/components/audit-log/AuditTable';
import { AuditMobileCardStack } from '@/components/audit-log/AuditMobileCardStack';
import { ExportDialog } from '@/components/audit-log/ExportDialog';
import {
  DEFAULT_AUDIT_FILTERS,
  DEFAULT_AUDIT_SORT,
  applyAuditFilters,
  applyAuditSort,
  type AuditFilters,
  type AuditSort,
} from '@/components/audit-log/types';
import {
  readAuditState,
  writeAuditState,
} from '@/components/audit-log/filterState';
import {
  getDistinctAdminActors,
  listAuditEvents,
  type AuditEntityType,
} from '@/data/mockAuditLog';
import { t } from '@/lib/i18n';

const PAGE_SIZE = 100;

const DEEP_LINK_TYPES: Record<string, AuditEntityType> = {
  transfer: 'transfer',
  user: 'user',
  card: 'card',
  kyc: 'kyc',
  aml: 'aml',
  blacklist: 'blacklist',
  fx_rate: 'fx',
  fx: 'fx',
  commission_rule: 'commission',
  commission: 'commission',
  service: 'service',
  app_version: 'app_version',
  notification: 'notification',
};

export function AuditLog() {
  const [params, setParams] = useSearchParams();
  const cached = readAuditState();

  // Deep-link from kebab actions: /compliance/audit-log?entity=fx_rate&id=fxr_010
  const initial = useMemo<{ filters: AuditFilters; sort: AuditSort }>(() => {
    if (cached) return { filters: cached.filters, sort: cached.sort };
    const ent = params.get('entity');
    const id = params.get('id');
    const next: AuditFilters = { ...DEFAULT_AUDIT_FILTERS };
    if (ent && DEEP_LINK_TYPES[ent]) {
      next.entityTypes = [DEEP_LINK_TYPES[ent]];
      // Keep date range broad so deep-link rows actually show up.
      next.dateRange = { range: '30d' };
    }
    if (id) next.entityRef = id;
    return { filters: next, sort: DEFAULT_AUDIT_SORT };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [filters, setFilters] = useState<AuditFilters>(initial.filters);
  const [sort, setSort] = useState<AuditSort>(initial.sort);
  const [page, setPage] = useState<number>(cached?.page ?? 1);
  const [focusedIndex, setFocusedIndex] = useState<number>(cached?.focusedIndex ?? 0);
  const [expandedId, setExpandedId] = useState<string | null>(cached?.expandedId ?? null);
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);

  // Force re-derivation when bridged stores mutate (panels write to them
  // directly; audit log doesn't get a notification).
  const [version, setVersion] = useState(0);

  const firstChipRef = useRef<HTMLButtonElement>(null);

  // Initial-mount mock-load skeleton (10 rows per spec).
  useEffect(() => {
    const tid = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(tid);
  }, []);

  // Re-derive on focus / popstate — covers actions taken on other pages.
  useEffect(() => {
    function bump() {
      setVersion((v) => v + 1);
    }
    window.addEventListener('focus', bump);
    window.addEventListener('popstate', bump);
    return () => {
      window.removeEventListener('focus', bump);
      window.removeEventListener('popstate', bump);
    };
  }, []);

  // Strip the deep-link query params after they've been applied — keeps
  // subsequent navigation (filter clear) from snapping back to them.
  useEffect(() => {
    if (params.get('entity') || params.get('id')) {
      const next = new URLSearchParams(params);
      next.delete('entity');
      next.delete('id');
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allEvents = useMemo(
    () => listAuditEvents(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );
  const adminOptions = useMemo(
    () => getDistinctAdminActors(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );

  const filteredSorted = useMemo(
    () => applyAuditSort(applyAuditFilters(allEvents, filters), sort),
    [allEvents, filters, sort],
  );

  const totalCount = allEvents.length;
  const filteredCount = filteredSorted.length;
  const pageCount = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filteredSorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset to page 1 when filter / sort changes if we'd otherwise overshoot.
  useEffect(() => {
    setPage((p) => (p > pageCount ? 1 : p));
  }, [pageCount]);

  // Persist filter / page / focus state on every change so a kebab
  // round-trip restores the page.
  useEffect(() => {
    writeAuditState({
      filters,
      sort,
      page: safePage,
      focusedIndex,
      expandedId,
    });
  }, [filters, sort, safePage, focusedIndex, expandedId]);

  function toggleSort() {
    setSort((prev) => ({
      key: 'timestamp',
      dir: prev.dir === 'desc' ? 'asc' : 'desc',
    }));
  }

  function toggleExpand(id: string) {
    setExpandedId((cur) => (cur === id ? null : id));
  }

  function scopeToEntity(entityId: string) {
    setFilters((prev) => ({ ...prev, entityRef: entityId, dateRange: { range: '30d' } }));
    setPage(1);
    setExpandedId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---- Page-scoped hotkeys: j / k / Enter / e / f --------------------
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement | null;
      const tag = tgt?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tgt?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'j') {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(pageRows.length - 1, i + 1));
        return;
      }
      if (e.key === 'k') {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(0, i - 1));
        return;
      }
      if (e.key === 'Enter') {
        const row = pageRows[focusedIndex];
        if (row) {
          e.preventDefault();
          toggleExpand(row.id);
        }
        return;
      }
      if (e.key === 'e') {
        e.preventDefault();
        setExportOpen(true);
        return;
      }
      if (e.key === 'f') {
        e.preventDefault();
        firstChipRef.current?.focus();
        return;
      }
    },
    [pageRows, focusedIndex],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  function onExportSuccess(format: 'csv' | 'ndjson', count: number) {
    toast.success(t('admin.audit-log.export.toast.success.title'), {
      description: t('admin.audit-log.export.toast.success.body', {
        count,
        format: format.toUpperCase(),
      }),
    });
  }
  function onExportError() {
    toast.error(t('admin.audit-log.export.toast.error.title'), {
      description: t('admin.audit-log.export.toast.error.body'),
      action: {
        label: t('common.actions.retry'),
        onClick: () => setExportOpen(true),
      },
    });
  }

  return (
    <div className="space-y-4 lg:space-y-5">
      {/* Page header */}
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('admin.audit-log.title')}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t('admin.audit-log.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setExportOpen(true)}>
            <Download className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {t('admin.audit-log.action.export')}
          </Button>
        </div>
      </header>

      <AuditLogBanner />

      <AuditFilterBar
        filters={filters}
        setFilters={(next) => {
          setFilters(next);
          setPage(1);
          setFocusedIndex(0);
        }}
        adminOptions={adminOptions}
        loading={loading}
        firstChipRef={firstChipRef}
      />

      {/* Desktop table */}
      <div className="hidden lg:block">
        <AuditTable
          rows={pageRows}
          totalCount={totalCount}
          loading={loading}
          focusedIndex={focusedIndex}
          onFocusRow={setFocusedIndex}
          expandedId={expandedId}
          onToggleExpand={toggleExpand}
          sort={sort}
          onSort={toggleSort}
          onScopeToEntity={scopeToEntity}
        />
      </div>

      {/* Mobile / tablet card stack */}
      <div className="lg:hidden">
        <AuditMobileCardStack
          rows={pageRows}
          totalCount={totalCount}
          loading={loading}
          expandedId={expandedId}
          onToggleExpand={toggleExpand}
          onScopeToEntity={scopeToEntity}
        />
      </div>

      {/* Pagination strip */}
      {!loading && filteredCount > 0 && (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-sm">
          <span className="text-muted-foreground">
            {t('admin.audit-log.pagination.showing', {
              start: (safePage - 1) * PAGE_SIZE + 1,
              end: Math.min(safePage * PAGE_SIZE, filteredCount),
              total: filteredCount,
            })}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
            >
              {t('admin.audit-log.pagination.prev')}
            </Button>
            <span className="px-2 text-sm tabular tabular-nums">
              {safePage} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={safePage === pageCount}
            >
              {t('admin.audit-log.pagination.next')}
            </Button>
          </div>
        </div>
      )}

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        rows={filteredSorted}
        dateRange={filters.dateRange}
        onSuccess={onExportSuccess}
        onError={onExportError}
      />
    </div>
  );
}
