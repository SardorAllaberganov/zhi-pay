/**
 * Stories CMS — mock single source of truth for the `/content/stories` surface.
 *
 * Schema reuses `docs/models.md` §8 STORIES verbatim:
 *   id · title_uz/ru/en · media_url · type · cta_label_uz/ru/en ·
 *   cta_deep_link {screen, params} · display_order · is_published ·
 *   published_at · expires_at · created_at
 *
 * Mock-only audit-trail surrogates: `createdBy / lastEditedAt / lastEditedBy`
 * (same precedent as `mockFxRates` / `mockCommissionRules` / `mockBlacklist` /
 * `mockServices` / `mockAppVersions`).
 *
 * Status is **derived**, not stored — see `getStatus(story)`. The four-value
 * derived enum (`draft | scheduled | published | expired`) is what the filter
 * bar and status-chip render off.
 *
 * Mutators: `addStory` / `editStory` / `publishStory` / `unpublishStory` /
 * `reorderStory` / `deleteStory`. All emit one audit row, bridged into the
 * central `mockAuditLog` surface via `bridgeStoriesAudit`.
 *
 * `display_order` is unique among `is_published=true` rows (matches the
 * partial unique index in models.md §9.2). On insert/publish, the editor
 * auto-suggests `nextDisplayOrder()` so authors never collide.
 */

import type { DeepLinkScreen } from '@/lib/deepLinkScreens';

// =====================================================================
// Types
// =====================================================================

export type StoryType = 'image' | 'video';

export type StoryStatus = 'draft' | 'scheduled' | 'published' | 'expired';

export interface CtaDeepLink {
  screen: DeepLinkScreen;
  params: Record<string, unknown>;
}

export interface Story {
  id: string;
  titleUz: string;
  titleRu: string;
  titleEn: string;
  mediaUrl: string;
  type: StoryType;
  /** When `null`, the story has no CTA (the toggle was off when authored). */
  ctaLabelUz: string | null;
  ctaLabelRu: string | null;
  ctaLabelEn: string | null;
  ctaDeepLink: CtaDeepLink | null;
  displayOrder: number;
  isPublished: boolean;
  /** NULL until the author hits Publish/Schedule. */
  publishedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;

  // Mock-only audit-trail surrogates (would live on a separate audit table
  // in the real backend).
  createdBy: string;
  lastEditedAt: Date | null;
  lastEditedBy: string | null;
}

// =====================================================================
// Reference time + admin pool — keep aligned with sibling modules
// =====================================================================

const NOW = new Date('2026-04-29T10:30:00Z');

function ago(days: number, hour = 9, minute = 0): Date {
  const d = new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);
  d.setUTCHours(hour, minute, 0, 0);
  return d;
}

function ahead(days: number, hour = 9, minute = 0): Date {
  const d = new Date(NOW.getTime() + days * 24 * 60 * 60 * 1000);
  d.setUTCHours(hour, minute, 0, 0);
  return d;
}

const SUPER_ADMIN = { id: 'admin_super_01', name: 'Sardor Tursunov' } as const;
const FINANCE_ADMIN = { id: 'admin_finance_02', name: 'Adel Ortiqova' } as const;

// =====================================================================
// Seed — 12 stories: 4 published / 4 scheduled / 4 drafts
//
// Display-order assignment:
//   - The 4 currently-published stories occupy slots 1..4
//   - Scheduled stories carry the slot they'll take when their publish_at
//     fires (real backend would re-resolve at publish time; here we pre-pick
//     slots 5..8 so the authoring UI shows a "next available" preview)
//   - Drafts have no slot yet (displayOrder = 0 — re-suggested at Publish)
// =====================================================================

const STORIES: Story[] = [
  // -------------------------------------------------------------------
  // PUBLISHED (4) — currently visible in the mobile carousel
  // -------------------------------------------------------------------
  {
    id: 'story_001',
    titleUz: 'Kartani 30 soniyada qo‘shing',
    titleRu: 'Привяжите карту за 30 секунд',
    titleEn: 'Add a card in 30 seconds',
    mediaUrl: 'https://cdn.zhipay.uz/stories/add-card-cover.jpg',
    type: 'image',
    ctaLabelUz: 'Karta qo‘shish',
    ctaLabelRu: 'Привязать карту',
    ctaLabelEn: 'Add a card',
    ctaDeepLink: { screen: 'profile', params: { section: 'cards', action: 'add' } },
    displayOrder: 1,
    isPublished: true,
    publishedAt: ago(8),
    expiresAt: ahead(22),
    createdAt: ago(9),
    createdBy: SUPER_ADMIN.name,
    lastEditedAt: ago(2),
    lastEditedBy: FINANCE_ADMIN.name,
  },
  {
    id: 'story_002',
    titleUz: 'Bu oy komissiyalar pastroq',
    titleRu: 'В этом месяце ниже комиссии',
    titleEn: 'Lower fees this month',
    mediaUrl: 'https://cdn.zhipay.uz/stories/lower-fees-cover.jpg',
    type: 'image',
    ctaLabelUz: 'Pul yuborish',
    ctaLabelRu: 'Отправить',
    ctaLabelEn: 'Send money',
    ctaDeepLink: { screen: 'send_money', params: {} },
    displayOrder: 2,
    isPublished: true,
    publishedAt: ago(5),
    expiresAt: ahead(2, 23, 30), // expires in <3 days — exercises the warning chip
    createdAt: ago(6),
    createdBy: FINANCE_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'story_003',
    titleUz: 'WeChat’ga 30 soniyada yuboring',
    titleRu: 'Отправьте в WeChat за 30 секунд',
    titleEn: 'Send to WeChat in 30s',
    mediaUrl: 'https://cdn.zhipay.uz/stories/wechat-30s-cover.mp4',
    type: 'video',
    ctaLabelUz: 'WeChat’ga yuborish',
    ctaLabelRu: 'В WeChat',
    ctaLabelEn: 'Send to WeChat',
    ctaDeepLink: { screen: 'send_money', params: { destination: 'wechat' } },
    displayOrder: 3,
    isPublished: true,
    publishedAt: ago(3),
    expiresAt: null,
    createdAt: ago(4),
    createdBy: SUPER_ADMIN.name,
    lastEditedAt: ago(1, 14, 22),
    lastEditedBy: SUPER_ADMIN.name,
  },
  {
    id: 'story_004',
    titleUz: 'MyID orqali tasdiqlash — nima kutiladi',
    titleRu: 'Верификация MyID — чего ожидать',
    titleEn: 'MyID verification — what to expect',
    mediaUrl: 'https://cdn.zhipay.uz/stories/myid-walkthrough-cover.jpg',
    type: 'image',
    // No CTA — informational story
    ctaLabelUz: null,
    ctaLabelRu: null,
    ctaLabelEn: null,
    ctaDeepLink: null,
    displayOrder: 4,
    isPublished: true,
    publishedAt: ago(2),
    expiresAt: ahead(28),
    createdAt: ago(3),
    createdBy: FINANCE_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },

  // -------------------------------------------------------------------
  // SCHEDULED (4) — published_at > now()
  // -------------------------------------------------------------------
  {
    id: 'story_005',
    titleUz: 'Yangi: kursni qulflash sanоqi',
    titleRu: 'Новинка: обратный отсчёт фиксации курса',
    titleEn: 'New: rate-lock countdown',
    mediaUrl: 'https://cdn.zhipay.uz/stories/rate-lock-cover.mp4',
    type: 'video',
    ctaLabelUz: 'Hozir yuborish',
    ctaLabelRu: 'Отправить сейчас',
    ctaLabelEn: 'Send now',
    ctaDeepLink: { screen: 'send_money', params: {} },
    displayOrder: 5,
    isPublished: true,
    publishedAt: ahead(1, 12, 0), // tomorrow noon UTC
    expiresAt: ahead(15),
    createdAt: ago(1),
    createdBy: SUPER_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'story_006',
    titleUz: 'Navruz bayrami kurslari',
    titleRu: 'Курсы на праздник Навруз',
    titleEn: 'Navruz holiday rates',
    mediaUrl: 'https://cdn.zhipay.uz/stories/navruz-rates-cover.jpg',
    type: 'image',
    ctaLabelUz: 'Yangiliklarni o‘qish',
    ctaLabelRu: 'Читать новость',
    ctaLabelEn: 'Read announcement',
    ctaDeepLink: { screen: 'news', params: { id: 'news_navruz_2026' } },
    displayOrder: 6,
    isPublished: true,
    publishedAt: ahead(2, 6, 0),
    expiresAt: ahead(9),
    createdAt: ago(2, 16, 12),
    createdBy: FINANCE_ADMIN.name,
    lastEditedAt: ago(0, 9, 30),
    lastEditedBy: SUPER_ADMIN.name,
  },
  {
    id: 'story_007',
    titleUz: 'Sevimli oluvchini saqlang',
    titleRu: 'Сохраните любимого получателя',
    titleEn: 'Save your favorite recipients',
    mediaUrl: 'https://cdn.zhipay.uz/stories/favorite-recipients-cover.jpg',
    type: 'image',
    ctaLabelUz: 'Oluvchilarni ochish',
    ctaLabelRu: 'Открыть получателей',
    ctaLabelEn: 'Open recipients',
    ctaDeepLink: { screen: 'profile', params: { section: 'recipients' } },
    displayOrder: 7,
    isPublished: true,
    publishedAt: ahead(4, 9, 0),
    expiresAt: null,
    createdAt: ago(4, 11, 0),
    createdBy: SUPER_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'story_008',
    titleUz: 'Do‘stga taklif qiling',
    titleRu: 'Пригласите друга',
    titleEn: 'Refer a friend',
    mediaUrl: 'https://cdn.zhipay.uz/stories/refer-a-friend-cover.mp4',
    type: 'video',
    ctaLabelUz: 'Taklif qilish',
    ctaLabelRu: 'Пригласить',
    ctaLabelEn: 'Invite',
    ctaDeepLink: { screen: 'profile', params: { section: 'referrals' } },
    displayOrder: 8,
    isPublished: true,
    publishedAt: ahead(7, 10, 0),
    expiresAt: ahead(37),
    createdAt: ago(1, 8, 45),
    createdBy: FINANCE_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },

  // -------------------------------------------------------------------
  // DRAFT (4) — not yet published, no display_order assignment
  // -------------------------------------------------------------------
  {
    id: 'story_009',
    titleUz: 'Treyderlar uchun: ko‘p o‘tkazma maslahatlari',
    titleRu: 'Для трейдеров: советы по массовой отправке',
    titleEn: 'Trader bulk-send tips',
    mediaUrl: 'https://cdn.zhipay.uz/stories/trader-bulk-cover.jpg',
    type: 'image',
    ctaLabelUz: 'Yuborishni boshlash',
    ctaLabelRu: 'Начать отправку',
    ctaLabelEn: 'Start sending',
    ctaDeepLink: { screen: 'send_money', params: { mode: 'bulk' } },
    displayOrder: 0, // unassigned
    isPublished: false,
    publishedAt: null,
    expiresAt: null,
    createdAt: ago(1, 13, 12),
    createdBy: SUPER_ADMIN.name,
    lastEditedAt: ago(0, 16, 4),
    lastEditedBy: SUPER_ADMIN.name,
  },
  {
    id: 'story_010',
    titleUz: 'Asosiy kartani belgilang',
    titleRu: 'Назначьте карту по умолчанию',
    titleEn: 'Set your default card',
    mediaUrl: 'https://cdn.zhipay.uz/stories/default-card-cover.jpg',
    type: 'image',
    ctaLabelUz: 'Kartalarni boshqarish',
    ctaLabelRu: 'Управление картами',
    ctaLabelEn: 'Manage cards',
    ctaDeepLink: { screen: 'profile', params: { section: 'cards' } },
    displayOrder: 0,
    isPublished: false,
    publishedAt: null,
    expiresAt: null,
    createdAt: ago(0, 8, 50),
    createdBy: FINANCE_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'story_011',
    titleUz: 'ZhiPay’ga xush kelibsiz',
    titleRu: 'Добро пожаловать в ZhiPay',
    titleEn: 'Welcome to ZhiPay',
    mediaUrl: 'https://cdn.zhipay.uz/stories/welcome-cover.mp4',
    type: 'video',
    // No CTA — informational welcome
    ctaLabelUz: null,
    ctaLabelRu: null,
    ctaLabelEn: null,
    ctaDeepLink: null,
    displayOrder: 0,
    isPublished: false,
    publishedAt: null,
    expiresAt: null,
    createdAt: ago(2, 9, 18),
    createdBy: SUPER_ADMIN.name,
    lastEditedAt: ago(1, 12, 0),
    lastEditedBy: SUPER_ADMIN.name,
  },
  {
    id: 'story_012',
    titleUz: 'Ramazon hayit kurslari',
    titleRu: 'Курсы на праздник Рамазан',
    titleEn: 'Ramadan holiday rates',
    mediaUrl: 'https://cdn.zhipay.uz/stories/ramazan-rates-cover.jpg',
    type: 'image',
    ctaLabelUz: 'Yangilikni o‘qish',
    ctaLabelRu: 'Читать',
    ctaLabelEn: 'Read more',
    ctaDeepLink: { screen: 'news', params: { id: 'news_ramadan_2026' } },
    displayOrder: 0,
    isPublished: false,
    publishedAt: null,
    expiresAt: null,
    createdAt: ago(3, 14, 0),
    createdBy: FINANCE_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },
];

// =====================================================================
// Helpers
// =====================================================================

/** Derives status from the (`is_published`, `published_at`, `expires_at`) triple. */
export function getStatus(s: Story, atTime: Date = new Date()): StoryStatus {
  if (!s.isPublished) return 'draft';
  if (s.expiresAt && s.expiresAt.getTime() < atTime.getTime()) return 'expired';
  if (s.publishedAt && s.publishedAt.getTime() > atTime.getTime()) return 'scheduled';
  return 'published';
}

export function listStories(): Story[] {
  return [...STORIES];
}

export function getStory(id: string): Story | undefined {
  return STORIES.find((s) => s.id === id);
}

export function getCounts(atTime: Date = new Date()): {
  draft: number;
  scheduled: number;
  published: number;
  expired: number;
  total: number;
} {
  const counts = { draft: 0, scheduled: 0, published: 0, expired: 0, total: STORIES.length };
  for (const s of STORIES) {
    counts[getStatus(s, atTime)] += 1;
  }
  return counts;
}

/** Next available display-order slot among published stories (max + 1, min 1). */
export function nextDisplayOrder(): number {
  const published = STORIES.filter((s) => s.isPublished);
  if (published.length === 0) return 1;
  return Math.max(...published.map((s) => s.displayOrder)) + 1;
}

/** Distinct admin actor names for any "edited by" filter chip. */
export function getDistinctEditors(): string[] {
  const set = new Set<string>();
  for (const s of STORIES) {
    set.add(s.createdBy);
    if (s.lastEditedBy) set.add(s.lastEditedBy);
  }
  return Array.from(set).sort();
}

// =====================================================================
// Mutators — all emit a single audit row
// =====================================================================

export type StoryAuditAction =
  | 'add'
  | 'edit'
  | 'publish'
  | 'unpublish'
  | 'reorder'
  | 'delete';

export interface StoryAuditEntry {
  id: string;
  storyId: string;
  action: StoryAuditAction;
  actorId: string;
  actorName: string;
  reason: string;
  /** Snapshot at the moment of the action — read-stable even if the story is later deleted. */
  snapshot: {
    titleEn: string;
    type: StoryType;
    isPublished: boolean;
    displayOrder: number;
    publishedAt: Date | null;
    expiresAt: Date | null;
  };
  /** Per-field previous values for `edit` (changed fields only). */
  previous?: Record<string, unknown>;
  createdAt: Date;
}

const STORIES_AUDIT: StoryAuditEntry[] = [];
let auditSeq = 1;
function nextAuditId(): string {
  return `story_audit_${String(auditSeq++).padStart(4, '0')}`;
}

let storySeq = STORIES.length + 1;
function nextStoryId(): string {
  return `story_${String(storySeq++).padStart(3, '0')}`;
}

interface MutatorActor {
  id: string;
  name: string;
}

const DEFAULT_ACTOR: MutatorActor = SUPER_ADMIN;

function snapshotOf(s: Story): StoryAuditEntry['snapshot'] {
  return {
    titleEn: s.titleEn,
    type: s.type,
    isPublished: s.isPublished,
    displayOrder: s.displayOrder,
    publishedAt: s.publishedAt,
    expiresAt: s.expiresAt,
  };
}

export interface AddStoryInput {
  titleUz: string;
  titleRu: string;
  titleEn: string;
  mediaUrl: string;
  type: StoryType;
  ctaLabelUz: string | null;
  ctaLabelRu: string | null;
  ctaLabelEn: string | null;
  ctaDeepLink: CtaDeepLink | null;
  displayOrder: number;
  isPublished: boolean;
  publishedAt: Date | null;
  expiresAt: Date | null;
}

export function addStory(input: AddStoryInput, actor: MutatorActor = DEFAULT_ACTOR): Story {
  const story: Story = {
    id: nextStoryId(),
    titleUz: input.titleUz,
    titleRu: input.titleRu,
    titleEn: input.titleEn,
    mediaUrl: input.mediaUrl,
    type: input.type,
    ctaLabelUz: input.ctaLabelUz,
    ctaLabelRu: input.ctaLabelRu,
    ctaLabelEn: input.ctaLabelEn,
    ctaDeepLink: input.ctaDeepLink,
    displayOrder: input.displayOrder,
    isPublished: input.isPublished,
    publishedAt: input.publishedAt,
    expiresAt: input.expiresAt,
    createdAt: new Date(),
    createdBy: actor.name,
    lastEditedAt: null,
    lastEditedBy: null,
  };
  STORIES.unshift(story);
  STORIES_AUDIT.unshift({
    id: nextAuditId(),
    storyId: story.id,
    action: 'add',
    actorId: actor.id,
    actorName: actor.name,
    reason: '',
    snapshot: snapshotOf(story),
    createdAt: story.createdAt,
  });
  return story;
}

export interface EditStoryInput {
  id: string;
  titleUz: string;
  titleRu: string;
  titleEn: string;
  mediaUrl: string;
  type: StoryType;
  ctaLabelUz: string | null;
  ctaLabelRu: string | null;
  ctaLabelEn: string | null;
  ctaDeepLink: CtaDeepLink | null;
  displayOrder: number;
  publishedAt: Date | null;
  expiresAt: Date | null;
  reason: string;
}

export function editStory(input: EditStoryInput, actor: MutatorActor = DEFAULT_ACTOR): Story {
  const idx = STORIES.findIndex((s) => s.id === input.id);
  if (idx < 0) throw new Error(`Story not found: ${input.id}`);
  if (input.reason.trim().length < 20) {
    throw new Error('Reason must be at least 20 characters.');
  }
  const before = STORIES[idx];
  const previous: Record<string, unknown> = {};
  if (before.titleEn !== input.titleEn) previous.titleEn = before.titleEn;
  if (before.titleUz !== input.titleUz) previous.titleUz = before.titleUz;
  if (before.titleRu !== input.titleRu) previous.titleRu = before.titleRu;
  if (before.mediaUrl !== input.mediaUrl) previous.mediaUrl = before.mediaUrl;
  if (before.type !== input.type) previous.type = before.type;
  if (before.displayOrder !== input.displayOrder) previous.displayOrder = before.displayOrder;
  if ((before.publishedAt?.getTime() ?? null) !== (input.publishedAt?.getTime() ?? null)) {
    previous.publishedAt = before.publishedAt;
  }
  if ((before.expiresAt?.getTime() ?? null) !== (input.expiresAt?.getTime() ?? null)) {
    previous.expiresAt = before.expiresAt;
  }
  const updated: Story = {
    ...before,
    titleUz: input.titleUz,
    titleRu: input.titleRu,
    titleEn: input.titleEn,
    mediaUrl: input.mediaUrl,
    type: input.type,
    ctaLabelUz: input.ctaLabelUz,
    ctaLabelRu: input.ctaLabelRu,
    ctaLabelEn: input.ctaLabelEn,
    ctaDeepLink: input.ctaDeepLink,
    displayOrder: input.displayOrder,
    publishedAt: input.publishedAt,
    expiresAt: input.expiresAt,
    lastEditedAt: new Date(),
    lastEditedBy: actor.name,
  };
  STORIES[idx] = updated;
  STORIES_AUDIT.unshift({
    id: nextAuditId(),
    storyId: updated.id,
    action: 'edit',
    actorId: actor.id,
    actorName: actor.name,
    reason: input.reason.trim(),
    snapshot: snapshotOf(updated),
    previous,
    createdAt: updated.lastEditedAt!,
  });
  return updated;
}

/**
 * Flip `is_published=true`. If `publish_at` is null, sets it to now (publishes
 * immediately); else honors the supplied future date (schedules).
 */
export function publishStory(id: string, publishAt: Date | null, actor: MutatorActor = DEFAULT_ACTOR): Story {
  const idx = STORIES.findIndex((s) => s.id === id);
  if (idx < 0) throw new Error(`Story not found: ${id}`);
  const before = STORIES[idx];
  const effectivePublishedAt = publishAt ?? new Date();
  const displayOrder = before.displayOrder > 0 ? before.displayOrder : nextDisplayOrder();
  const updated: Story = {
    ...before,
    isPublished: true,
    publishedAt: effectivePublishedAt,
    displayOrder,
    lastEditedAt: new Date(),
    lastEditedBy: actor.name,
  };
  STORIES[idx] = updated;
  STORIES_AUDIT.unshift({
    id: nextAuditId(),
    storyId: updated.id,
    action: 'publish',
    actorId: actor.id,
    actorName: actor.name,
    reason: '',
    snapshot: snapshotOf(updated),
    previous: {
      isPublished: before.isPublished,
      publishedAt: before.publishedAt,
      displayOrder: before.displayOrder,
    },
    createdAt: updated.lastEditedAt!,
  });
  return updated;
}

export function unpublishStory(id: string, reason: string, actor: MutatorActor = DEFAULT_ACTOR): Story {
  const idx = STORIES.findIndex((s) => s.id === id);
  if (idx < 0) throw new Error(`Story not found: ${id}`);
  if (reason.trim().length < 20) {
    throw new Error('Reason must be at least 20 characters.');
  }
  const before = STORIES[idx];
  const updated: Story = {
    ...before,
    isPublished: false,
    lastEditedAt: new Date(),
    lastEditedBy: actor.name,
  };
  STORIES[idx] = updated;
  STORIES_AUDIT.unshift({
    id: nextAuditId(),
    storyId: updated.id,
    action: 'unpublish',
    actorId: actor.id,
    actorName: actor.name,
    reason: reason.trim(),
    snapshot: snapshotOf(updated),
    previous: { isPublished: true },
    createdAt: updated.lastEditedAt!,
  });
  return updated;
}

/**
 * Re-slot one published story. The `newOrder` slot may be currently occupied —
 * we shift conflicting rows up or down by one to keep the partial unique index
 * satisfied. Real backend would do the same in a single transaction.
 */
export function reorderStory(id: string, newOrder: number, reason: string, actor: MutatorActor = DEFAULT_ACTOR): Story {
  const idx = STORIES.findIndex((s) => s.id === id);
  if (idx < 0) throw new Error(`Story not found: ${id}`);
  if (reason.trim().length < 20) {
    throw new Error('Reason must be at least 20 characters.');
  }
  const before = STORIES[idx];
  if (!before.isPublished) {
    throw new Error('Only published stories carry a display_order — publish first.');
  }
  const oldOrder = before.displayOrder;
  if (oldOrder === newOrder) return before;

  // Shift other published rows in the affected range
  for (let i = 0; i < STORIES.length; i++) {
    const s = STORIES[i];
    if (s.id === id || !s.isPublished) continue;
    if (oldOrder < newOrder) {
      // Moving down — anything currently between (oldOrder, newOrder] shifts up by 1
      if (s.displayOrder > oldOrder && s.displayOrder <= newOrder) {
        STORIES[i] = { ...s, displayOrder: s.displayOrder - 1 };
      }
    } else {
      // Moving up — anything currently between [newOrder, oldOrder) shifts down by 1
      if (s.displayOrder >= newOrder && s.displayOrder < oldOrder) {
        STORIES[i] = { ...s, displayOrder: s.displayOrder + 1 };
      }
    }
  }
  const updated: Story = {
    ...before,
    displayOrder: newOrder,
    lastEditedAt: new Date(),
    lastEditedBy: actor.name,
  };
  STORIES[idx] = updated;
  STORIES_AUDIT.unshift({
    id: nextAuditId(),
    storyId: updated.id,
    action: 'reorder',
    actorId: actor.id,
    actorName: actor.name,
    reason: reason.trim(),
    snapshot: snapshotOf(updated),
    previous: { displayOrder: oldOrder },
    createdAt: updated.lastEditedAt!,
  });
  return updated;
}

export function deleteStory(id: string, reason: string, actor: MutatorActor = DEFAULT_ACTOR): Story {
  const idx = STORIES.findIndex((s) => s.id === id);
  if (idx < 0) throw new Error(`Story not found: ${id}`);
  if (reason.trim().length < 20) {
    throw new Error('Reason must be at least 20 characters.');
  }
  const before = STORIES[idx];
  STORIES.splice(idx, 1);
  STORIES_AUDIT.unshift({
    id: nextAuditId(),
    storyId: before.id,
    action: 'delete',
    actorId: actor.id,
    actorName: actor.name,
    reason: reason.trim(),
    snapshot: snapshotOf(before),
    createdAt: new Date(),
  });
  return before;
}

export function listStoriesAudit(): StoryAuditEntry[] {
  return [...STORIES_AUDIT];
}
