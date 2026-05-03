/**
 * Domain types + filter/sort/label scaffolding for the admin Notifications
 * surface at `/content/notifications`. Mirrors the structure used by News
 * (Phase 18) and Stories (Phase 17): the surface owns its own row shape +
 * filter resolver + label-key map; the live data source lives in
 * `data/mockNotifications.ts`.
 *
 * Schema reference: docs/models.md §7 NOTIFICATIONS.
 * Lifecycle: docs/mermaid_schemas/notification_send_state_machine.md.
 */

import type { DateRangeValue } from '@/components/zhipay/DateRangePicker';
import { resolveDateRange } from '@/components/zhipay/DateRangePicker';
import type { DeepLinkScreen } from '@/lib/deepLinkScreens';
import type {
  Notification,
  NotificationStatus,
  NotificationType,
  NotificationAudienceType,
} from '@/data/mockNotifications';

// =====================================================================
// Compose-side constants (push-notification ergonomic limits)
// =====================================================================

/** Max title length — push notification title length matters for OS preview. */
export const TITLE_MAX = 60;
/** Max body length — push notification body cap. */
export const BODY_MAX = 180;
/** Min reason length when cancelling a scheduled send — matches App Versions / Stories. */
export const CANCEL_REASON_MIN = 20;
/** Audience size beyond which the send-confirmation dialog raises an extra warning. */
export const LARGE_AUDIENCE_THRESHOLD = 5_000;
/** Debounce window for the single-user picker search input. */
export const USER_SEARCH_DEBOUNCE_MS = 300;

// =====================================================================
// Last-login enum (segment criterion)
// =====================================================================

export type LastLoginBucket = 'lt7d' | 'lt30d' | 'gt30d' | 'never';

export const LAST_LOGIN_ORDER: LastLoginBucket[] = ['lt7d', 'lt30d', 'gt30d', 'never'];

export const LAST_LOGIN_LABEL_KEY: Record<LastLoginBucket, string> = {
  lt7d: 'admin.notifications.compose.segment.last-login.lt7d',
  lt30d: 'admin.notifications.compose.segment.last-login.lt30d',
  gt30d: 'admin.notifications.compose.segment.last-login.gt30d',
  never: 'admin.notifications.compose.segment.last-login.never',
};

// =====================================================================
// Audience criteria — the persisted shape under
// `notifications.audience_criteria` (jsonb) when audience_type=segment.
// =====================================================================

export interface SegmentCriteria {
  /** Empty array = no tier filter (any tier). */
  tiers: ('tier_0' | 'tier_1' | 'tier_2')[];
  /** Empty array = no language filter. */
  languages: ('uz' | 'ru' | 'en')[];
  /** null = no filter; true/false = require the boolean. */
  hasLinkedCard: boolean | null;
  /** null = no filter; true/false = require the boolean. */
  hasCompletedTransfer: boolean | null;
  /** null = no filter; bucket = required band. */
  lastLogin: LastLoginBucket | null;
}

export const EMPTY_CRITERIA: SegmentCriteria = {
  tiers: [],
  languages: [],
  hasLinkedCard: null,
  hasCompletedTransfer: null,
  lastLogin: null,
};

export function criteriaIsEmpty(c: SegmentCriteria): boolean {
  return (
    c.tiers.length === 0 &&
    c.languages.length === 0 &&
    c.hasLinkedCard === null &&
    c.hasCompletedTransfer === null &&
    c.lastLogin === null
  );
}

export function countCriteriaActive(c: SegmentCriteria): number {
  let n = 0;
  if (c.tiers.length > 0) n += 1;
  if (c.languages.length > 0) n += 1;
  if (c.hasLinkedCard !== null) n += 1;
  if (c.hasCompletedTransfer !== null) n += 1;
  if (c.lastLogin !== null) n += 1;
  return n;
}

// =====================================================================
// Type / status / audience-type label maps
// =====================================================================

export const NOTIFICATION_TYPE_ORDER: NotificationType[] = [
  'transfer',
  'promo',
  'system',
  'compliance',
];

export const NOTIFICATION_TYPE_LABEL_KEY: Record<NotificationType, string> = {
  transfer: 'admin.notifications.compose.type.transfer',
  promo: 'admin.notifications.compose.type.promo',
  system: 'admin.notifications.compose.type.system',
  compliance: 'admin.notifications.compose.type.compliance',
};

export const NOTIFICATION_TYPE_TOOLTIP_KEY: Record<NotificationType, string> = {
  transfer: 'admin.notifications.compose.type.tooltip.transfer',
  promo: 'admin.notifications.compose.type.tooltip.promo',
  system: 'admin.notifications.compose.type.tooltip.system',
  compliance: 'admin.notifications.compose.type.tooltip.compliance',
};

export const NOTIFICATION_STATUS_ORDER: NotificationStatus[] = [
  'sent',
  'scheduled',
  'cancelled',
  'failed',
  'sending',
];

export const NOTIFICATION_STATUS_LABEL_KEY: Record<NotificationStatus, string> = {
  scheduled: 'admin.notifications.status.scheduled',
  sending: 'admin.notifications.status.sending',
  sent: 'admin.notifications.status.sent',
  cancelled: 'admin.notifications.status.cancelled',
  failed: 'admin.notifications.status.failed',
};

export const AUDIENCE_TYPE_ORDER: NotificationAudienceType[] = [
  'broadcast',
  'segment',
  'single',
];

export const AUDIENCE_TYPE_LABEL_KEY: Record<NotificationAudienceType, string> = {
  broadcast: 'admin.notifications.compose.audience.all',
  segment: 'admin.notifications.compose.audience.segment',
  single: 'admin.notifications.compose.audience.single',
};

// =====================================================================
// Compose-form input shape (in-memory; never persisted as a draft row)
// =====================================================================

export type ScheduleMode = 'now' | 'later';

export interface DeepLinkInput {
  enabled: boolean;
  screen: DeepLinkScreen;
  /** Free-form key/value pairs; jsonb on persist. Matches `notifications.deep_link.params`. */
  params: Record<string, unknown>;
}

export const EMPTY_DEEP_LINK: DeepLinkInput = {
  enabled: false,
  screen: 'home',
  params: {},
};

export interface ComposeForm {
  audienceType: NotificationAudienceType;
  segmentCriteria: SegmentCriteria;
  /** Selected user id when audienceType=single. Empty string until picked. */
  singleUserId: string;
  type: NotificationType;
  titleUz: string;
  titleRu: string;
  titleEn: string;
  bodyUz: string;
  bodyRu: string;
  bodyEn: string;
  deepLink: DeepLinkInput;
  schedule: ScheduleMode;
  /** Date object when schedule='later'. null when schedule='now'. */
  scheduledFor: Date | null;
}

export function emptyComposeForm(): ComposeForm {
  return {
    audienceType: 'broadcast',
    segmentCriteria: { ...EMPTY_CRITERIA, tiers: [], languages: [] },
    singleUserId: '',
    type: 'promo',
    titleUz: '',
    titleRu: '',
    titleEn: '',
    bodyUz: '',
    bodyRu: '',
    bodyEn: '',
    deepLink: { ...EMPTY_DEEP_LINK, params: {} },
    schedule: 'now',
    scheduledFor: null,
  };
}

// =====================================================================
// Validation surface (used by the compose page's "always-clickable
// primary button + toast naming missing fields" pattern from Phase 18b)
// =====================================================================

import type { LocaleCode } from '@/components/zhipay/LocaleFlag';

export interface ComposeErrors {
  /** Locales whose title is empty or > TITLE_MAX. */
  invalidTitles: ReadonlySet<LocaleCode>;
  /** Locales whose body is empty or > BODY_MAX. */
  invalidBodies: ReadonlySet<LocaleCode>;
  /** True when single audience selected but no user picked. */
  missingSingleUser: boolean;
  /** True when segment audience selected but criteria filter to 0 users. */
  emptyAudience: boolean;
  /** True when schedule='later' but no datetime set, or datetime <= now. */
  invalidSchedule: boolean;
  /** True when deepLink.enabled but a required param key is missing. */
  invalidDeepLink: boolean;
}

export function noErrors(): ComposeErrors {
  return {
    invalidTitles: new Set(),
    invalidBodies: new Set(),
    missingSingleUser: false,
    emptyAudience: false,
    invalidSchedule: false,
    invalidDeepLink: false,
  };
}

export function hasAnyError(e: ComposeErrors): boolean {
  return (
    e.invalidTitles.size > 0 ||
    e.invalidBodies.size > 0 ||
    e.missingSingleUser ||
    e.emptyAudience ||
    e.invalidSchedule ||
    e.invalidDeepLink
  );
}

// =====================================================================
// Sent-tab filters + sort
// =====================================================================

export type NotificationSortKey = 'default' | 'sent-at' | 'created-at';

export interface NotificationSort {
  key: NotificationSortKey;
}

export const DEFAULT_SORT: NotificationSort = { key: 'default' };

export const NOTIFICATION_SORT_LABEL_KEY: Record<NotificationSortKey, string> = {
  default: 'admin.notifications.sort.default',
  'sent-at': 'admin.notifications.sort.sent-at',
  'created-at': 'admin.notifications.sort.created-at',
};

export interface NotificationFilters {
  /** Selected types; empty = no filter. */
  types: NotificationType[];
  /** Selected audience types; empty = no filter. */
  audienceTypes: NotificationAudienceType[];
  /** Date range applied to `sent_at` (or `scheduled_for` for scheduled rows). */
  dateRange: DateRangeValue;
  /** Debounced query — matches across title_uz/ru/en. Empty = no filter. */
  search: string;
}

export const EMPTY_FILTERS: NotificationFilters = {
  types: [],
  audienceTypes: [],
  dateRange: { range: 'today' },
  search: '',
};

function dateRangeIsActive(d: DateRangeValue): boolean {
  if (d.range === 'today') return false;
  return true;
}

export function countActiveFilters(f: NotificationFilters): number {
  let n = 0;
  if (f.types.length > 0) n += 1;
  if (f.audienceTypes.length > 0) n += 1;
  if (dateRangeIsActive(f.dateRange)) n += 1;
  if (f.search.trim().length > 0) n += 1;
  return n;
}

// =====================================================================
// Sort + filter resolution (operates on the live row set)
// =====================================================================

function effectiveTimestamp(n: Notification): number {
  // Prefer sent_at; fall back to scheduled_for (for scheduled rows that
  // haven't fired yet); fall back to createdAt as the absolute floor so
  // newly-scheduled rows still slot ahead of older sent ones when sorted.
  if (n.sentAt) return n.sentAt.getTime();
  if (n.scheduledFor) return n.scheduledFor.getTime();
  return n.createdAt.getTime();
}

function defaultSort(rows: Notification[]): Notification[] {
  // Scheduled (future-fire) rows pinned on top, then sent/cancelled/failed
  // by effective timestamp DESC (newest first).
  return [...rows].sort((a, b) => {
    const aScheduledFuture = a.status === 'scheduled' ? 1 : 0;
    const bScheduledFuture = b.status === 'scheduled' ? 1 : 0;
    if (aScheduledFuture !== bScheduledFuture) {
      return bScheduledFuture - aScheduledFuture;
    }
    return effectiveTimestamp(b) - effectiveTimestamp(a);
  });
}

function sentAtDescSort(rows: Notification[]): Notification[] {
  return [...rows].sort((a, b) => {
    const aT = a.sentAt?.getTime() ?? 0;
    const bT = b.sentAt?.getTime() ?? 0;
    return bT - aT;
  });
}

function createdAtDescSort(rows: Notification[]): Notification[] {
  return [...rows].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function applyNotificationSort(
  rows: Notification[],
  sort: NotificationSort,
): Notification[] {
  switch (sort.key) {
    case 'sent-at':
      return sentAtDescSort(rows);
    case 'created-at':
      return createdAtDescSort(rows);
    default:
      return defaultSort(rows);
  }
}

export function applyNotificationFilters(
  rows: Notification[],
  f: NotificationFilters,
): Notification[] {
  let out = rows;
  if (f.types.length > 0) {
    out = out.filter((n) => f.types.includes(n.type));
  }
  if (f.audienceTypes.length > 0) {
    out = out.filter((n) => f.audienceTypes.includes(n.audienceType));
  }
  if (dateRangeIsActive(f.dateRange)) {
    const range = resolveDateRange(f.dateRange);
    if (range?.from && range?.to) {
      const from = new Date(range.from);
      from.setHours(0, 0, 0, 0);
      const to = new Date(range.to);
      to.setHours(23, 59, 59, 999);
      out = out.filter((n) => {
        const ref = n.sentAt ?? n.scheduledFor ?? n.createdAt;
        const t = ref.getTime();
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
