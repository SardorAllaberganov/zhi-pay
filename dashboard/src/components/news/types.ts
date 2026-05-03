import type { News, NewsStatus } from '@/data/mockNews';
import type { DateRangeValue } from '@/components/zhipay/DateRangePicker';
import { resolveDateRange } from '@/components/zhipay/DateRangePicker';

export type NewsSortKey = 'default' | 'published' | 'created';

export interface NewsSort {
  key: NewsSortKey;
}

export const DEFAULT_SORT: NewsSort = { key: 'default' };

export const NEWS_SORT_LABEL_KEY: Record<NewsSortKey, string> = {
  default: 'admin.news.sort.default',
  published: 'admin.news.sort.published',
  created: 'admin.news.sort.created',
};

export const NEWS_STATUS_ORDER: NewsStatus[] = ['published', 'draft'];

export const NEWS_STATUS_LABEL_KEY: Record<NewsStatus, string> = {
  published: 'admin.news.status.published',
  draft: 'admin.news.status.draft',
};

export interface NewsFilters {
  /** Selected status values; empty = no filter (show all). */
  statuses: NewsStatus[];
  /** Date range applied to `published_at`. `today` = no filter when `range==='today'` and no custom dates. */
  dateRange: DateRangeValue;
  /** Debounced query — matches across `titleUz/Ru/En`. Empty = no filter. */
  search: string;
}

export const EMPTY_FILTERS: NewsFilters = {
  statuses: [],
  dateRange: { range: 'today' },
  search: '',
};

function dateRangeIsActive(d: DateRangeValue): boolean {
  // Treat the default `today` selection as inactive — same convention as
  // AuditLog's date-range chip.
  if (d.range === 'today') return false;
  return true;
}

export function countActiveFilters(f: NewsFilters): number {
  let n = 0;
  if (f.statuses.length > 0) n += 1;
  if (dateRangeIsActive(f.dateRange)) n += 1;
  if (f.search.trim().length > 0) n += 1;
  return n;
}

// =====================================================================
// Sort + filter resolution
// =====================================================================

function defaultSort(rows: News[]): News[] {
  return [...rows].sort((a, b) => {
    if (a.isPublished !== b.isPublished) return a.isPublished ? 1 : -1;
    if (!a.isPublished && !b.isPublished) {
      return b.createdAt.getTime() - a.createdAt.getTime();
    }
    const aT = a.publishedAt?.getTime() ?? 0;
    const bT = b.publishedAt?.getTime() ?? 0;
    return bT - aT;
  });
}

function publishedDescSort(rows: News[]): News[] {
  return [...rows].sort((a, b) => {
    const aT = a.publishedAt?.getTime() ?? 0;
    const bT = b.publishedAt?.getTime() ?? 0;
    return bT - aT;
  });
}

function createdDescSort(rows: News[]): News[] {
  return [...rows].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function applyNewsSort(rows: News[], sort: NewsSort): News[] {
  switch (sort.key) {
    case 'published':
      return publishedDescSort(rows);
    case 'created':
      return createdDescSort(rows);
    default:
      return defaultSort(rows);
  }
}

export function applyNewsFilters(rows: News[], f: NewsFilters): News[] {
  let out = rows;
  if (f.statuses.length > 0) {
    out = out.filter((n) =>
      f.statuses.some((s) => (s === 'published' ? n.isPublished : !n.isPublished)),
    );
  }
  if (dateRangeIsActive(f.dateRange)) {
    const range = resolveDateRange(f.dateRange);
    if (range?.from && range?.to) {
      const from = new Date(range.from);
      from.setHours(0, 0, 0, 0);
      const to = new Date(range.to);
      to.setHours(23, 59, 59, 999);
      out = out.filter((n) => {
        if (!n.publishedAt) return false;
        const t = n.publishedAt.getTime();
        return t >= from.getTime() && t <= to.getTime();
      });
    }
  }
  const q = f.search.trim().toLowerCase();
  if (q.length > 0) {
    out = out.filter(
      (n) =>
        n.titleUz.toLowerCase().includes(q) ||
        n.titleRu.toLowerCase().includes(q) ||
        n.titleEn.toLowerCase().includes(q),
    );
  }
  return out;
}
