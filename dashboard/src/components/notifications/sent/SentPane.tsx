import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from '@/lib/i18n';
import type { LocaleCode } from '@/components/zhipay/LocaleFlag';
import { listNotifications } from '@/data/mockNotifications';
import {
  applyNotificationFilters,
  applyNotificationSort,
  countActiveFilters,
  type NotificationFilters,
  type NotificationSort,
} from '../types';
import {
  getFilterState,
  setFilters as cacheFilters,
  setSort as cacheSort,
  setFocusedId as cacheFocused,
} from '../filterState';
import { NotificationsFilterBar } from './NotificationsFilterBar';
import { SentTable } from './SentTable';
import { SentMobileCardStack } from './SentMobileCardStack';
import { EmptyState } from './EmptyState';

interface Props {
  /** Active admin locale — drives which title to render in table cells. */
  adminLocale: LocaleCode;
  /** Navigate to the dedicated compose page (used by empty-state CTAs). */
  onCreateNew: () => void;
}

export function SentPane({ adminLocale, onCreateNew }: Props) {
  const navigate = useNavigate();
  const initial = useRef(getFilterState()).current;
  const [filters, setFiltersState] = useState<NotificationFilters>(initial.filters);
  const [sort] = useState<NotificationSort>(initial.sort);
  const [focusedId, setFocusedIdState] = useState<string | null>(initial.focusedId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cacheFilters(filters);
  }, [filters]);
  useEffect(() => {
    cacheSort(sort);
  }, [sort]);
  useEffect(() => {
    cacheFocused(focusedId);
  }, [focusedId]);

  // 350ms initial-mount skeleton — matches News/Stories
  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(id);
  }, []);

  const all = useMemo(() => listNotifications(), []);
  const filtered = useMemo(() => applyNotificationFilters(all, filters), [all, filters]);
  const sorted = useMemo(() => applyNotificationSort(filtered, sort), [filtered, sort]);

  const totalEmpty = !loading && all.length === 0;
  const filteredEmpty = !loading && all.length > 0 && sorted.length === 0;

  const searchInputRef = useRef<HTMLInputElement>(null);
  const firstChipRef = useRef<HTMLButtonElement>(null);
  const sortedRef = useRef(sorted);
  useEffect(() => {
    sortedRef.current = sorted;
  }, [sorted]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      const inField =
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        (e.target as HTMLElement | null)?.isContentEditable;
      if (inField || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }
      if (e.key === 'f') {
        e.preventDefault();
        firstChipRef.current?.focus();
        return;
      }
      const list = sortedRef.current;
      if (list.length === 0) return;
      const idx = focusedId ? list.findIndex((n) => n.id === focusedId) : -1;
      if (e.key === 'j') {
        e.preventDefault();
        const next = list[Math.min(list.length - 1, idx + 1)] ?? list[0];
        setFocusedIdState(next.id);
      } else if (e.key === 'k') {
        e.preventDefault();
        const prev = list[Math.max(0, idx - 1)] ?? list[0];
        setFocusedIdState(prev.id);
      } else if (e.key === 'Enter') {
        if (idx >= 0) {
          e.preventDefault();
          navigate(`/content/notifications/sent/${list[idx].id}`);
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedId]);

  const activeFilterCount = countActiveFilters(filters);

  return (
    <div className="space-y-4">
      <NotificationsFilterBar
        filters={filters}
        setFilters={setFiltersState}
        loading={loading}
        searchInputRef={searchInputRef}
        firstChipRef={firstChipRef}
      />

      {totalEmpty ? (
        <EmptyState
          totalEmpty
          onCompose={onCreateNew}
          onClearFilters={() => {
            /* no-op when totally empty */
          }}
        />
      ) : filteredEmpty ? (
        <EmptyState
          totalEmpty={false}
          onCompose={onCreateNew}
          onClearFilters={() => {
            setFiltersState({
              types: [],
              audienceTypes: [],
              dateRange: { range: 'today' },
              search: '',
            });
          }}
        />
      ) : (
        <>
          {/* Result count line */}
          <div className="text-sm text-muted-foreground">
            {t('admin.notifications.sent.count')
              .replace('{filtered}', String(sorted.length))
              .replace('{total}', String(all.length))}
            {activeFilterCount > 0 ? '' : ''}
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block">
            <SentTable
              rows={sorted}
              loading={loading}
              focusedId={focusedId}
              setFocusedId={setFocusedIdState}
              onOpen={(id) => navigate(`/content/notifications/sent/${id}`)}
              adminLocale={adminLocale}
            />
          </div>

          {/* Mobile card stack */}
          <div className="lg:hidden">
            <SentMobileCardStack
              rows={sorted}
              loading={loading}
              onOpen={(id) => navigate(`/content/notifications/sent/${id}`)}
              adminLocale={adminLocale}
            />
          </div>
        </>
      )}
    </div>
  );
}
