import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorCodesFilterBar } from '@/components/error-codes/ErrorCodesFilterBar';
import { ErrorCodesTable } from '@/components/error-codes/ErrorCodesTable';
import { ErrorCodesMobileCardStack } from '@/components/error-codes/ErrorCodesMobileCardStack';
import { ReadOnlyBanner } from '@/components/error-codes/ReadOnlyBanner';
import {
  DEFAULT_ERROR_CODE_FILTERS,
  DEFAULT_ERROR_CODE_SORT,
  applyErrorCodeFilters,
  applyErrorCodeSort,
  type ErrorCodeFilters,
  type ErrorCodeSort,
} from '@/components/error-codes/types';
import {
  readErrorCodeState,
  writeErrorCodeState,
} from '@/components/error-codes/filterState';
import { listErrorCodes } from '@/data/mockErrorCodes';
import { t } from '@/lib/i18n';

/**
 * Error Codes catalog at `/system/error-codes`.
 *
 * Read-only reference surface — code definitions live in deployment
 * migrations, not editable here. Same precedent as KYC Tiers and the
 * Audit Log read-only union view: page-scoped hotkeys (j/k/Enter//f),
 * 350ms initial-mount skeleton, click-to-expand inline, mobile card-
 * stack mirror.
 */
export function ErrorCodes() {
  const cached = readErrorCodeState();

  const [filters, setFilters] = useState<ErrorCodeFilters>(
    cached?.filters ?? DEFAULT_ERROR_CODE_FILTERS,
  );
  const [sort, setSort] = useState<ErrorCodeSort>(
    cached?.sort ?? DEFAULT_ERROR_CODE_SORT,
  );
  const [expandedCode, setExpandedCode] = useState<string | null>(
    cached?.expandedCode ?? null,
  );
  const [focusedIndex, setFocusedIndex] = useState<number>(
    cached?.focusedIndex ?? 0,
  );
  const [loading, setLoading] = useState(true);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const firstChipRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const tid = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(tid);
  }, []);

  const allCodes = useMemo(() => listErrorCodes(), []);
  const filteredSorted = useMemo(
    () => applyErrorCodeSort(applyErrorCodeFilters(allCodes, filters), sort),
    [allCodes, filters, sort],
  );

  useEffect(() => {
    writeErrorCodeState({ filters, sort, expandedCode, focusedIndex });
  }, [filters, sort, expandedCode, focusedIndex]);

  function toggleSort() {
    setSort((prev) => ({
      key: 'code',
      dir: prev.dir === 'asc' ? 'desc' : 'asc',
    }));
  }
  function toggleExpand(code: string) {
    setExpandedCode((cur) => (cur === code ? null : code));
  }

  // ---- Page-scoped hotkeys: j / k / Enter / / / f ----
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement | null;
      const tag = tgt?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tgt?.isContentEditable) {
        if (e.key === 'Escape' && tag === 'input') {
          (tgt as HTMLInputElement).blur();
        }
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      if (e.key === 'f') {
        e.preventDefault();
        firstChipRef.current?.focus();
        return;
      }
      if (e.key === 'j') {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(filteredSorted.length - 1, i + 1));
        return;
      }
      if (e.key === 'k') {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(0, i - 1));
        return;
      }
      if (e.key === 'Enter') {
        const row = filteredSorted[focusedIndex];
        if (row) {
          e.preventDefault();
          toggleExpand(row.code);
        }
      }
    },
    [filteredSorted, focusedIndex],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  function exportCsv() {
    const headers = [
      'code',
      'category',
      'retryable',
      'message_uz',
      'message_ru',
      'message_en',
      'suggested_action_uz',
      'suggested_action_ru',
      'suggested_action_en',
    ];
    const lines = [headers.join(',')];
    for (const r of allCodes) {
      lines.push(
        [
          r.code,
          r.category,
          String(r.retryable),
          escapeCsv(r.message_uz),
          escapeCsv(r.message_ru),
          escapeCsv(r.message_en),
          escapeCsv(r.suggested_action_uz),
          escapeCsv(r.suggested_action_ru),
          escapeCsv(r.suggested_action_en),
        ].join(','),
      );
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const stamp = new Date().toISOString().slice(0, 10);
    a.download = `error-codes-${stamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4 lg:space-y-5">
      {/* Page header */}
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('admin.error-codes.title')}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t('admin.error-codes.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportCsv}>
            <Download className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {t('admin.error-codes.action.export')}
          </Button>
        </div>
      </header>

      <ReadOnlyBanner />

      <ErrorCodesFilterBar
        filters={filters}
        setFilters={(next) => {
          setFilters(next);
          setFocusedIndex(0);
        }}
        loading={loading}
        searchInputRef={searchInputRef}
        firstChipRef={firstChipRef}
      />

      {/* Desktop */}
      <div className="hidden lg:block">
        <ErrorCodesTable
          rows={filteredSorted}
          totalCount={allCodes.length}
          loading={loading}
          focusedIndex={focusedIndex}
          onFocusRow={setFocusedIndex}
          expandedCode={expandedCode}
          onToggleExpand={toggleExpand}
          sort={sort}
          onSort={toggleSort}
        />
      </div>

      {/* Mobile / tablet */}
      <div className="lg:hidden">
        <ErrorCodesMobileCardStack
          rows={filteredSorted}
          totalCount={allCodes.length}
          loading={loading}
          expandedCode={expandedCode}
          onToggleExpand={toggleExpand}
        />
      </div>
    </div>
  );
}

function escapeCsv(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
