/**
 * Notifications — mock single source of truth for the `/content/notifications`
 * surface (admin composer + sent history) AND the per-user inbox surrogate.
 *
 * Schema reuses `docs/models.md` §7 NOTIFICATIONS verbatim, with the Phase
 * 19 extensions for composer-side fields:
 *   - status, audience_type, audience_criteria
 *   - scheduled_for, cancelled_at, cancellation_reason
 *   - composed_by, recipient_count, delivered_count, opened_count,
 *     click_through_count
 *
 * Lifecycle: docs/mermaid_schemas/notification_send_state_machine.md.
 *
 * Mock-only audit-trail surrogates live on `NotificationAuditEntry` (same
 * precedent as mockStories / mockAppVersions / mockNews / mockBlacklist).
 *
 * Mutators: `createNotification` / `cancelScheduledNotification`. Both
 * emit one audit row, bridged into the central `mockAuditLog` surface
 * via `bridgeNotificationAudit`.
 *
 * Seed scope (Phase 19): 38 rows total —
 *   32 sent (16 transfer single + 8 promo broadcast + 5 system broadcast
 *            + 2 compliance single + 1 promo segment)
 *    4 scheduled (2 promo broadcast + 1 system broadcast + 1 compliance single)
 *    2 cancelled (1 promo broadcast + 1 promo segment)
 *
 * Per LESSON 2026-04-30 — sample copy mentions UzCard/Humo only. Visa /
 * Mastercard are deliberately absent until the user re-introduces them.
 */

import type { DeepLinkScreen } from '@/lib/deepLinkScreens';
import type { LastLoginBucket } from '@/components/notifications/types';

// =====================================================================
// Domain types
// =====================================================================

export type NotificationType = 'transfer' | 'promo' | 'system' | 'compliance';
export type NotificationStatus = 'scheduled' | 'sending' | 'sent' | 'cancelled' | 'failed';
export type NotificationAudienceType = 'broadcast' | 'segment' | 'single';

export interface NotificationDeepLink {
  screen: DeepLinkScreen;
  params: Record<string, unknown>;
}

export interface NotificationAudienceCriteria {
  tiers?: ('tier_0' | 'tier_1' | 'tier_2')[];
  languages?: ('uz' | 'ru' | 'en')[];
  hasLinkedCard?: boolean | null;
  hasCompletedTransfer?: boolean | null;
  lastLogin?: LastLoginBucket | null;
}

export interface Notification {
  id: string;
  /** Set only when audience_type = single. NULL for broadcast/segment. */
  userId: string | null;
  type: NotificationType;
  status: NotificationStatus;
  audienceType: NotificationAudienceType;
  /** Persisted segment filter (immutable post-send). NULL for broadcast/single. */
  audienceCriteria: NotificationAudienceCriteria | null;

  titleUz: string;
  titleRu: string;
  titleEn: string;
  bodyUz: string;
  bodyRu: string;
  bodyEn: string;

  /** Per-user inbox flag — meaningful only when audienceType=single. */
  isRead: boolean;
  deepLink: NotificationDeepLink | null;

  composedBy: { id: string; name: string };
  recipientCount: number;
  /** NULL until status=sent. */
  deliveredCount: number | null;
  openedCount: number | null;
  /** NULL when no deep link or pre-send. */
  clickThroughCount: number | null;

  scheduledFor: Date | null;
  cancelledAt: Date | null;
  cancellationReason: string | null;

  sentAt: Date | null;
  readAt: Date | null;
  createdAt: Date;
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
function agoMins(mins: number): Date {
  return new Date(NOW.getTime() - mins * 60 * 1000);
}
function inDays(days: number, hour = 9, minute = 0): Date {
  const d = new Date(NOW.getTime() + days * 24 * 60 * 60 * 1000);
  d.setUTCHours(hour, minute, 0, 0);
  return d;
}

const SUPER_ADMIN = { id: 'admin_super_01', name: 'Sardor Tursunov' } as const;
const FINANCE_ADMIN = { id: 'admin_finance_02', name: 'Adel Ortiqova' } as const;
/** Communications team — authors most promo / system broadcasts. */
const COMMS_ADMIN = { id: 'admin_comms_03', name: 'Bobur Yusupov' } as const;
/** Operations / compliance team — authors compliance-typed sends. */
const OPS_ADMIN = { id: 'admin_ops_04', name: 'Madina Kholmatova' } as const;
/**
 * Synthetic system actor for transactional per-user pushes (transfer status
 * updates, KYC reminders) — these are not admin-authored in production
 * but the audit row still needs a stable composed_by for the dashboard
 * to display alongside admin-authored sends.
 */
const SYSTEM_BOT = { id: 'admin_system_notifications', name: 'System Notifications' } as const;

export const NOTIFICATION_ADMIN_POOL = [
  SUPER_ADMIN,
  FINANCE_ADMIN,
  COMMS_ADMIN,
  OPS_ADMIN,
  SYSTEM_BOT,
];

// =====================================================================
// Seed — 38 rows (32 sent + 4 scheduled + 2 cancelled)
//
// Realistic deliverability ratios:
//   - delivered ≈ 96–99% of recipient_count (some devices offline)
//   - opened   ≈ 30–55% of delivered (push CTR varies by type)
//   - click-through ≈ 12–28% of opened (only when deep_link present)
//
// Single-user transactional pushes (transfer / compliance) have higher
// open rates (60–85%) since they're tied to user-initiated actions.
// =====================================================================

const NOTIFICATIONS: Notification[] = [
  // -------------------------------------------------------------------
  // SCHEDULED (4) — future-fire
  // -------------------------------------------------------------------
  {
    id: 'notif_001',
    userId: null,
    type: 'promo',
    status: 'scheduled',
    audienceType: 'broadcast',
    audienceCriteria: null,
    titleUz: "Hayit munosabati bilan pasaytirilgan tariflar",
    titleRu: "Сниженные тарифы по случаю Эйда",
    titleEn: "Eid promotion — lower fees this week",
    bodyUz: "Hayit munosabati bilan barcha o'tkazmalar bo'yicha 0.5% chegirma. 1–7 may.",
    bodyRu: "В честь праздника — скидка 0.5% на все переводы. 1–7 мая.",
    bodyEn: "Holiday promo: 0.5% off all transfers, May 1–7. Don't miss it.",
    isRead: false,
    deepLink: { screen: 'send_money', params: {} },
    composedBy: COMMS_ADMIN,
    recipientCount: 47,
    deliveredCount: null,
    openedCount: null,
    clickThroughCount: null,
    scheduledFor: inDays(2, 9, 0),
    cancelledAt: null,
    cancellationReason: null,
    sentAt: null,
    readAt: null,
    createdAt: ago(0, 8, 30),
  },
  {
    id: 'notif_002',
    userId: null,
    type: 'promo',
    status: 'scheduled',
    audienceType: 'segment',
    audienceCriteria: {
      tiers: ['tier_2'],
      languages: ['uz', 'ru'],
      hasLinkedCard: true,
      hasCompletedTransfer: true,
      lastLogin: 'lt30d',
    },
    titleUz: "Faol foydalanuvchilar uchun maxsus chegirma",
    titleRu: "Специальная скидка для активных клиентов",
    titleEn: "Special offer for active customers",
    bodyUz: "Sizning faolligingiz uchun rahmat — keyingi o'tkazmangiz bepul.",
    bodyRu: "Спасибо за активность — следующий перевод бесплатно.",
    bodyEn: "Thanks for being active — your next transfer is free.",
    isRead: false,
    deepLink: { screen: 'send_money', params: {} },
    composedBy: COMMS_ADMIN,
    recipientCount: 12,
    deliveredCount: null,
    openedCount: null,
    clickThroughCount: null,
    scheduledFor: inDays(3, 10, 0),
    cancelledAt: null,
    cancellationReason: null,
    sentAt: null,
    readAt: null,
    createdAt: ago(0, 9, 15),
  },
  {
    id: 'notif_003',
    userId: null,
    type: 'system',
    status: 'scheduled',
    audienceType: 'broadcast',
    audienceCriteria: null,
    titleUz: "Rejalashtirilgan xizmat ko'rsatish ishlari",
    titleRu: "Запланированные технические работы",
    titleEn: "Scheduled maintenance window",
    bodyUz: "5-mayda 02:00–04:00 oralig'ida o'tkazmalar vaqtincha to'xtatiladi.",
    bodyRu: "5 мая с 02:00 до 04:00 переводы будут временно недоступны.",
    bodyEn: "May 5, 02:00–04:00: transfers temporarily unavailable for maintenance.",
    isRead: false,
    deepLink: null,
    composedBy: SUPER_ADMIN,
    recipientCount: 47,
    deliveredCount: null,
    openedCount: null,
    clickThroughCount: null,
    scheduledFor: inDays(5, 6, 0),
    cancelledAt: null,
    cancellationReason: null,
    sentAt: null,
    readAt: null,
    createdAt: ago(1, 14, 0),
  },
  {
    id: 'notif_004',
    userId: 'u_42',
    type: 'compliance',
    status: 'scheduled',
    audienceType: 'single',
    audienceCriteria: null,
    titleUz: "MyID muddati 7 kun ichida tugaydi",
    titleRu: "MyID истекает через 7 дней",
    titleEn: "MyID expiring in 7 days",
    bodyUz: "Yuqori limitlarni saqlab qolish uchun MyID orqali qayta tasdiqlang.",
    bodyRu: "Чтобы сохранить высокие лимиты, повторно подтвердите MyID.",
    bodyEn: "Re-verify with MyID to keep your higher limits active.",
    isRead: false,
    deepLink: { screen: 'kyc', params: {} },
    composedBy: OPS_ADMIN,
    recipientCount: 1,
    deliveredCount: null,
    openedCount: null,
    clickThroughCount: null,
    scheduledFor: inDays(1, 9, 0),
    cancelledAt: null,
    cancellationReason: null,
    sentAt: null,
    readAt: null,
    createdAt: ago(0, 7, 30),
  },

  // -------------------------------------------------------------------
  // CANCELLED (2)
  // -------------------------------------------------------------------
  {
    id: 'notif_005',
    userId: null,
    type: 'promo',
    status: 'cancelled',
    audienceType: 'broadcast',
    audienceCriteria: null,
    titleUz: "1.5% chegirma — shu kunga maxsus",
    titleRu: "Скидка 1.5% — только сегодня",
    titleEn: "1.5% off — today only",
    bodyUz: "Bugun barcha o'tkazmalar bo'yicha 1.5% chegirma.",
    bodyRu: "Сегодня скидка 1.5% на все переводы.",
    bodyEn: "1.5% discount on all transfers — today only.",
    isRead: false,
    deepLink: { screen: 'send_money', params: {} },
    composedBy: COMMS_ADMIN,
    recipientCount: 47,
    deliveredCount: null,
    openedCount: null,
    clickThroughCount: null,
    scheduledFor: ago(2, 6, 0),
    cancelledAt: ago(3, 16, 0),
    cancellationReason:
      "Tariff strategy revised — discount rate adjusted before launch. Replaced by /notif_006.",
    sentAt: null,
    readAt: null,
    createdAt: ago(4, 11, 0),
  },
  {
    id: 'notif_006',
    userId: null,
    type: 'promo',
    status: 'cancelled',
    audienceType: 'segment',
    audienceCriteria: {
      tiers: ['tier_1'],
      languages: ['en'],
      hasLinkedCard: false,
      hasCompletedTransfer: false,
      lastLogin: 'gt30d',
    },
    titleUz: "Sizni qaytib kelishingizni kutmoqdamiz",
    titleRu: "Мы скучаем — возвращайтесь",
    titleEn: "We miss you — come back to ZhiPay",
    bodyUz: "Birinchi o'tkazmangiz uchun komissiya yo'q. Bir bosishda boshlang.",
    bodyRu: "Первый перевод без комиссии. Откройте приложение и начните.",
    bodyEn: "Your first transfer is on us. Open the app to get started.",
    isRead: false,
    deepLink: { screen: 'home', params: {} },
    composedBy: COMMS_ADMIN,
    recipientCount: 0,
    deliveredCount: null,
    openedCount: null,
    clickThroughCount: null,
    scheduledFor: ago(5, 11, 0),
    cancelledAt: ago(6, 14, 30),
    cancellationReason:
      "Segment criteria filtered to 0 users — re-scoping the campaign before re-scheduling.",
    sentAt: null,
    readAt: null,
    createdAt: ago(7, 9, 0),
  },

  // -------------------------------------------------------------------
  // SENT (32) — newest first
  // -------------------------------------------------------------------

  // Compliance — single (3) — KYC reminders
  {
    id: 'notif_007',
    userId: 'u_19',
    type: 'compliance',
    status: 'sent',
    audienceType: 'single',
    audienceCriteria: null,
    titleUz: "MyID muddati 14 kun ichida tugaydi",
    titleRu: "MyID истекает через 14 дней",
    titleEn: "MyID expiring in 14 days",
    bodyUz: "MyID orqali qayta tasdiqlang — yuqori limitlar saqlanib qoladi.",
    bodyRu: "Повторно подтвердите MyID — высокие лимиты сохранятся.",
    bodyEn: "Re-verify with MyID to keep your higher limits.",
    isRead: false,
    deepLink: { screen: 'kyc', params: {} },
    composedBy: OPS_ADMIN,
    recipientCount: 1,
    deliveredCount: 1,
    openedCount: 0,
    clickThroughCount: 0,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: agoMins(45),
    readAt: null,
    createdAt: agoMins(45),
  },
  {
    id: 'notif_008',
    userId: 'u_07',
    type: 'compliance',
    status: 'sent',
    audienceType: 'single',
    audienceCriteria: null,
    titleUz: "Hujjatni qayta tekshirish so'ralmoqda",
    titleRu: "Требуется повторная проверка документа",
    titleEn: "Document re-check requested",
    bodyUz: "Compliance jamoasi sizning hisobingizni qayta tekshirishni so'radi.",
    bodyRu: "Команда комплаенса запросила повторную проверку аккаунта.",
    bodyEn: "Our compliance team has requested a re-check on your account.",
    isRead: true,
    deepLink: { screen: 'profile', params: {} },
    composedBy: OPS_ADMIN,
    recipientCount: 1,
    deliveredCount: 1,
    openedCount: 1,
    clickThroughCount: 1,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: ago(2, 11, 30),
    readAt: ago(2, 12, 0),
    createdAt: ago(2, 11, 30),
  },

  // System broadcast (5) — version, maintenance, status
  {
    id: 'notif_009',
    userId: null,
    type: 'system',
    status: 'sent',
    audienceType: 'broadcast',
    audienceCriteria: null,
    titleUz: "Yangi versiya mavjud — 2.4.0",
    titleRu: "Доступна новая версия — 2.4.0",
    titleEn: "New version available — 2.4.0",
    bodyUz: "Yangilanishlar va xatolarni tuzatishlar bilan yangilang.",
    bodyRu: "Обновитесь, чтобы получить улучшения и исправления.",
    bodyEn: "Update to get the latest improvements and fixes.",
    isRead: false,
    deepLink: { screen: 'settings', params: {} },
    composedBy: SUPER_ADMIN,
    recipientCount: 47,
    deliveredCount: 46,
    openedCount: 19,
    clickThroughCount: 8,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: ago(1, 10, 0),
    readAt: null,
    createdAt: ago(1, 10, 0),
  },
  {
    id: 'notif_010',
    userId: null,
    type: 'system',
    status: 'sent',
    audienceType: 'broadcast',
    audienceCriteria: null,
    titleUz: "Xizmatlar tiklandi",
    titleRu: "Сервисы восстановлены",
    titleEn: "Services restored",
    bodyUz: "Barcha to'lov yo'nalishlari yana ishlamoqda. Noqulayliklar uchun uzr.",
    bodyRu: "Все направления переводов снова работают. Извините за неудобства.",
    bodyEn: "All transfer rails are back online. Apologies for the inconvenience.",
    isRead: false,
    deepLink: null,
    composedBy: SUPER_ADMIN,
    recipientCount: 46,
    deliveredCount: 45,
    openedCount: 22,
    clickThroughCount: null,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: ago(3, 14, 0),
    readAt: null,
    createdAt: ago(3, 14, 0),
  },
  {
    id: 'notif_011',
    userId: null,
    type: 'system',
    status: 'sent',
    audienceType: 'broadcast',
    audienceCriteria: null,
    titleUz: "Xizmat ko'rsatish ishlari",
    titleRu: "Технические работы",
    titleEn: "Scheduled maintenance",
    bodyUz: "Bugun 23:00–01:00 oralig'ida xizmat vaqtincha cheklanadi.",
    bodyRu: "Сегодня 23:00–01:00 сервис будет временно ограничен.",
    bodyEn: "Tonight 23:00–01:00: brief maintenance window.",
    isRead: false,
    deepLink: null,
    composedBy: SUPER_ADMIN,
    recipientCount: 46,
    deliveredCount: 45,
    openedCount: 18,
    clickThroughCount: null,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: ago(4, 16, 0),
    readAt: null,
    createdAt: ago(4, 16, 0),
  },
  {
    id: 'notif_012',
    userId: null,
    type: 'system',
    status: 'sent',
    audienceType: 'broadcast',
    audienceCriteria: null,
    titleUz: "Yangi xususiyat — Saqlangan oluvchilar",
    titleRu: "Новая функция — Сохранённые получатели",
    titleEn: "New: Saved recipients",
    bodyUz: "Tez-tez pul yuboradigan kishilarni saqlang va keyingi safar tezroq jo'nating.",
    bodyRu: "Сохраняйте получателей, которым часто отправляете переводы.",
    bodyEn: "Save recipients you transfer to often — speeds up your next send.",
    isRead: false,
    deepLink: { screen: 'send_money', params: {} },
    composedBy: COMMS_ADMIN,
    recipientCount: 45,
    deliveredCount: 44,
    openedCount: 24,
    clickThroughCount: 11,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: ago(7, 11, 0),
    readAt: null,
    createdAt: ago(7, 11, 0),
  },
  {
    id: 'notif_013',
    userId: null,
    type: 'system',
    status: 'sent',
    audienceType: 'broadcast',
    audienceCriteria: null,
    titleUz: "Til sozlamalari yangilandi",
    titleRu: "Языковые настройки обновлены",
    titleEn: "Language preferences updated",
    bodyUz: "Endi sozlamalardan til o'zgartirishingiz mumkin.",
    bodyRu: "Теперь язык можно изменить в настройках.",
    bodyEn: "You can now change your language in Settings.",
    isRead: false,
    deepLink: { screen: 'settings', params: {} },
    composedBy: SUPER_ADMIN,
    recipientCount: 44,
    deliveredCount: 43,
    openedCount: 17,
    clickThroughCount: 6,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: ago(11, 10, 0),
    readAt: null,
    createdAt: ago(11, 10, 0),
  },

  // Promo broadcast (8) — rate sales, holidays, awareness
  {
    id: 'notif_014',
    userId: null,
    type: 'promo',
    status: 'sent',
    audienceType: 'broadcast',
    audienceCriteria: null,
    titleUz: "Yaxshilangan kursi — bugundan",
    titleRu: "Улучшенный курс — с сегодня",
    titleEn: "Better rate — starting today",
    bodyUz: "CNY → UZS yangi yaxshilangan kursi: 1 CNY = 1 384 UZS.",
    bodyRu: "Новый улучшенный курс CNY → UZS: 1 CNY = 1 384 UZS.",
    bodyEn: "Better CNY → UZS rate: 1 CNY = 1,384 UZS, starting today.",
    isRead: false,
    deepLink: { screen: 'send_money', params: {} },
    composedBy: FINANCE_ADMIN,
    recipientCount: 44,
    deliveredCount: 43,
    openedCount: 21,
    clickThroughCount: 9,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: ago(2, 9, 30),
    readAt: null,
    createdAt: ago(2, 9, 30),
  },
  {
    id: 'notif_015',
    userId: null,
    type: 'promo',
    status: 'sent',
    audienceType: 'broadcast',
    audienceCriteria: null,
    titleUz: "Hafta oxiri tariflari",
    titleRu: "Тарифы выходного дня",
    titleEn: "Weekend tariffs",
    bodyUz: "Shanba va yakshanba kunlari komissiya 0.7% ga pasaytirildi.",
    bodyRu: "По субботам и воскресеньям комиссия снижена до 0.7%.",
    bodyEn: "Saturday + Sunday: fees down to 0.7%.",
    isRead: false,
    deepLink: { screen: 'send_money', params: {} },
    composedBy: COMMS_ADMIN,
    recipientCount: 44,
    deliveredCount: 43,
    openedCount: 18,
    clickThroughCount: 8,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: ago(5, 9, 0),
    readAt: null,
    createdAt: ago(5, 9, 0),
  },
  {
    id: 'notif_016',
    userId: null,
    type: 'promo',
    status: 'sent',
    audienceType: 'broadcast',
    audienceCriteria: null,
    titleUz: "Tezroq o'tkazmalar",
    titleRu: "Переводы стали быстрее",
    titleEn: "Faster transfers",
    bodyUz: "O'rtacha o'tkazma vaqti 45 soniyaga qisqardi.",
    bodyRu: "Среднее время перевода сократилось до 45 секунд.",
    bodyEn: "Average transfer time is now 45 seconds.",
    isRead: false,
    deepLink: { screen: 'history', params: {} },
    composedBy: COMMS_ADMIN,
    recipientCount: 43,
    deliveredCount: 42,
    openedCount: 16,
    clickThroughCount: 5,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: ago(8, 13, 0),
    readAt: null,
    createdAt: ago(8, 13, 0),
  },
  {
    id: 'notif_017',
    userId: null,
    type: 'promo',
    status: 'sent',
    audienceType: 'broadcast',
    audienceCriteria: null,
    titleUz: "Navro'z muborak!",
    titleRu: "С праздником Навруз!",
    titleEn: "Navruz greetings",
    bodyUz: "Navro'z munosabati bilan barcha o'tkazmalar 0.5% chegirma bilan.",
    bodyRu: "В честь Навруза — скидка 0.5% на все переводы.",
    bodyEn: "Happy Navruz! 0.5% off all transfers this week.",
    isRead: false,
    deepLink: { screen: 'send_money', params: {} },
    composedBy: COMMS_ADMIN,
    recipientCount: 41,
    deliveredCount: 40,
    openedCount: 23,
    clickThroughCount: 11,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: ago(15, 9, 0),
    readAt: null,
    createdAt: ago(15, 9, 0),
  },
  {
    id: 'notif_018',
    userId: null,
    type: 'promo',
    status: 'sent',
    audienceType: 'broadcast',
    audienceCriteria: null,
    titleUz: "1 yil ZhiPay bilan",
    titleRu: "Год вместе с ZhiPay",
    titleEn: "One year with ZhiPay",
    bodyUz: "Bizga ishonganingiz uchun rahmat. Yangi imkoniyatlar yo'lda.",
    bodyRu: "Спасибо за доверие. Впереди ещё больше возможностей.",
    bodyEn: "Thanks for being with us. More features are on the way.",
    isRead: false,
    deepLink: { screen: 'home', params: {} },
    composedBy: SUPER_ADMIN,
    recipientCount: 39,
    deliveredCount: 38,
    openedCount: 20,
    clickThroughCount: 6,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: ago(18, 11, 0),
    readAt: null,
    createdAt: ago(18, 11, 0),
  },
  {
    id: 'notif_019',
    userId: null,
    type: 'promo',
    status: 'sent',
    audienceType: 'broadcast',
    audienceCriteria: null,
    titleUz: "Mukofot — eng yaxshi cross-border ilova",
    titleRu: "Награда — лучшее приложение трансграничных переводов",
    titleEn: "Award: best cross-border app",
    bodyUz: "Sizning yordamingiz bilan biz Best Cross-border App 2025 mukofotini oldik.",
    bodyRu: "С вашей поддержкой мы получили награду Best Cross-border App 2025.",
    bodyEn: "With your support we won Best Cross-border App 2025.",
    isRead: false,
    deepLink: null,
    composedBy: COMMS_ADMIN,
    recipientCount: 38,
    deliveredCount: 37,
    openedCount: 14,
    clickThroughCount: null,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: ago(22, 14, 0),
    readAt: null,
    createdAt: ago(22, 14, 0),
  },
  {
    id: 'notif_020',
    userId: null,
    type: 'promo',
    status: 'sent',
    audienceType: 'broadcast',
    audienceCriteria: null,
    titleUz: "Talabalar uchun arzon tariflar",
    titleRu: "Студенческие тарифы",
    titleEn: "Student tariffs",
    bodyUz: "Xitoyda o'qiydigan talabalar uchun komissiya 50% pastroq.",
    bodyRu: "Для студентов в Китае комиссия на 50% ниже.",
    bodyEn: "Students in China: 50% off our standard fees.",
    isRead: false,
    deepLink: { screen: 'send_money', params: {} },
    composedBy: COMMS_ADMIN,
    recipientCount: 36,
    deliveredCount: 35,
    openedCount: 19,
    clickThroughCount: 7,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: ago(25, 9, 0),
    readAt: null,
    createdAt: ago(25, 9, 0),
  },
  {
    id: 'notif_021',
    userId: null,
    type: 'promo',
    status: 'sent',
    audienceType: 'broadcast',
    audienceCriteria: null,
    titleUz: "Yiwu savdogarlari uchun yangi imkoniyat",
    titleRu: "Новые возможности для торговцев Иу",
    titleEn: "New for Yiwu traders",
    bodyUz: "Korxona tarifi — kunlik 50 mln UZS gacha o'tkazmalar.",
    bodyRu: "Бизнес-тариф — переводы до 50 млн UZS в день.",
    bodyEn: "Business tier — transfers up to 50M UZS per day.",
    isRead: false,
    deepLink: { screen: 'profile', params: {} },
    composedBy: FINANCE_ADMIN,
    recipientCount: 34,
    deliveredCount: 33,
    openedCount: 12,
    clickThroughCount: 4,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: ago(28, 10, 0),
    readAt: null,
    createdAt: ago(28, 10, 0),
  },

  // Promo segment (1) — narrow audience
  {
    id: 'notif_022',
    userId: null,
    type: 'promo',
    status: 'sent',
    audienceType: 'segment',
    audienceCriteria: {
      tiers: ['tier_2'],
      languages: ['uz'],
      hasLinkedCard: true,
      hasCompletedTransfer: true,
      lastLogin: 'lt7d',
    },
    titleUz: "VIP foydalanuvchilar uchun maxsus kurs",
    titleRu: "Особый курс для VIP-клиентов",
    titleEn: "VIP-only rate",
    bodyUz: "Sizga maxsus kurs: 1 CNY = 1 392 UZS. 24 soatga amal qiladi.",
    bodyRu: "Специальный курс: 1 CNY = 1 392 UZS. Действует 24 часа.",
    bodyEn: "VIP rate: 1 CNY = 1,392 UZS. Valid for 24 hours.",
    isRead: false,
    deepLink: { screen: 'send_money', params: {} },
    composedBy: COMMS_ADMIN,
    recipientCount: 8,
    deliveredCount: 8,
    openedCount: 7,
    clickThroughCount: 5,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: ago(6, 10, 0),
    readAt: null,
    createdAt: ago(6, 10, 0),
  },

  // Transfer single (16) — transactional pushes
  {
    id: 'notif_023',
    userId: 'u_03',
    type: 'transfer',
    status: 'sent',
    audienceType: 'single',
    audienceCriteria: null,
    titleUz: "Pul jo'natildi — 5 000 000 UZS / 3 562 CNY",
    titleRu: "Перевод отправлен — 5 000 000 UZS / 3 562 CNY",
    titleEn: "Transfer sent — 5,000,000 UZS / 3,562 CNY",
    bodyUz: "Olim — Alipay. Holatni ko'rish uchun bosing.",
    bodyRu: "Олиму через Alipay. Нажмите, чтобы посмотреть статус.",
    bodyEn: "Sent to Olim via Alipay. Tap to view status.",
    isRead: true,
    deepLink: { screen: 'transfer_detail', params: { transfer_id: 'tx_01' } },
    composedBy: SYSTEM_BOT,
    recipientCount: 1,
    deliveredCount: 1,
    openedCount: 1,
    clickThroughCount: 1,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: agoMins(120),
    readAt: agoMins(118),
    createdAt: agoMins(120),
  },
  {
    id: 'notif_024',
    userId: 'u_03',
    type: 'transfer',
    status: 'sent',
    audienceType: 'single',
    audienceCriteria: null,
    titleUz: "Pul yetib bordi",
    titleRu: "Перевод доставлен",
    titleEn: "Transfer delivered",
    bodyUz: "Olim Alipay hisobiga 3 562 CNY oldi.",
    bodyRu: "Олим получил 3 562 CNY на Alipay.",
    bodyEn: "Olim received 3,562 CNY on Alipay.",
    isRead: true,
    deepLink: { screen: 'transfer_detail', params: { transfer_id: 'tx_01' } },
    composedBy: SYSTEM_BOT,
    recipientCount: 1,
    deliveredCount: 1,
    openedCount: 1,
    clickThroughCount: 0,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: agoMins(118),
    readAt: agoMins(115),
    createdAt: agoMins(118),
  },
  {
    id: 'notif_025',
    userId: 'u_15',
    type: 'transfer',
    status: 'sent',
    audienceType: 'single',
    audienceCriteria: null,
    titleUz: "Pul jo'natildi — 1 200 000 UZS / 855 CNY",
    titleRu: "Перевод отправлен — 1 200 000 UZS / 855 CNY",
    titleEn: "Transfer sent — 1,200,000 UZS / 855 CNY",
    bodyUz: "WeChat Pay orqali. UzCard •• 4242.",
    bodyRu: "Через WeChat Pay. UzCard •• 4242.",
    bodyEn: "Via WeChat Pay. UzCard •• 4242.",
    isRead: false,
    deepLink: { screen: 'transfer_detail', params: { transfer_id: 'tx_15' } },
    composedBy: SYSTEM_BOT,
    recipientCount: 1,
    deliveredCount: 1,
    openedCount: 0,
    clickThroughCount: 0,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: agoMins(180),
    readAt: null,
    createdAt: agoMins(180),
  },
  {
    id: 'notif_026',
    userId: 'u_07',
    type: 'transfer',
    status: 'sent',
    audienceType: 'single',
    audienceCriteria: null,
    titleUz: "Pul yetib bordi",
    titleRu: "Перевод доставлен",
    titleEn: "Transfer delivered",
    bodyUz: "Mei Alipay hisobiga 1 426 CNY oldi.",
    bodyRu: "Мэй получила 1 426 CNY на Alipay.",
    bodyEn: "Mei received 1,426 CNY on Alipay.",
    isRead: true,
    deepLink: { screen: 'transfer_detail', params: { transfer_id: 'tx_07' } },
    composedBy: SYSTEM_BOT,
    recipientCount: 1,
    deliveredCount: 1,
    openedCount: 1,
    clickThroughCount: 1,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: ago(1, 11, 30),
    readAt: ago(1, 11, 32),
    createdAt: ago(1, 11, 30),
  },
  {
    id: 'notif_027',
    userId: 'u_12',
    type: 'transfer',
    status: 'sent',
    audienceType: 'single',
    audienceCriteria: null,
    titleUz: "O'tkazma muvaffaqiyatsiz tugadi",
    titleRu: "Перевод не выполнен",
    titleEn: "Transfer failed",
    bodyUz: "Karta rad etildi. Boshqa kartani sinab ko'ring.",
    bodyRu: "Карта отклонена. Попробуйте другую карту.",
    bodyEn: "Card declined. Try a different card.",
    isRead: true,
    deepLink: { screen: 'transfer_detail', params: { transfer_id: 'tx_12' } },
    composedBy: SYSTEM_BOT,
    recipientCount: 1,
    deliveredCount: 1,
    openedCount: 1,
    clickThroughCount: 1,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: ago(2, 14, 0),
    readAt: ago(2, 14, 1),
    createdAt: ago(2, 14, 0),
  },
  {
    id: 'notif_028',
    userId: 'u_24',
    type: 'transfer',
    status: 'sent',
    audienceType: 'single',
    audienceCriteria: null,
    titleUz: "Pul jo'natildi — 800 000 UZS / 570 CNY",
    titleRu: "Перевод отправлен — 800 000 UZS / 570 CNY",
    titleEn: "Transfer sent — 800,000 UZS / 570 CNY",
    bodyUz: "Humo •• 7821 dan Alipay ga.",
    bodyRu: "С Humo •• 7821 на Alipay.",
    bodyEn: "From Humo •• 7821 to Alipay.",
    isRead: true,
    deepLink: { screen: 'transfer_detail', params: { transfer_id: 'tx_24' } },
    composedBy: SYSTEM_BOT,
    recipientCount: 1,
    deliveredCount: 1,
    openedCount: 1,
    clickThroughCount: 0,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: ago(3, 16, 0),
    readAt: ago(3, 16, 5),
    createdAt: ago(3, 16, 0),
  },
  {
    id: 'notif_029',
    userId: 'u_28',
    type: 'transfer',
    status: 'sent',
    audienceType: 'single',
    audienceCriteria: null,
    titleUz: "Pul yetib bordi",
    titleRu: "Перевод доставлен",
    titleEn: "Transfer delivered",
    bodyUz: "Chen WeChat Pay hisobiga 1 070 CNY oldi.",
    bodyRu: "Чен получил 1 070 CNY на WeChat Pay.",
    bodyEn: "Chen received 1,070 CNY on WeChat Pay.",
    isRead: false,
    deepLink: { screen: 'transfer_detail', params: { transfer_id: 'tx_28' } },
    composedBy: SYSTEM_BOT,
    recipientCount: 1,
    deliveredCount: 1,
    openedCount: 0,
    clickThroughCount: 0,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: ago(4, 11, 0),
    readAt: null,
    createdAt: ago(4, 11, 0),
  },
  {
    id: 'notif_030',
    userId: 'u_03',
    type: 'transfer',
    status: 'sent',
    audienceType: 'single',
    audienceCriteria: null,
    titleUz: "Pul jo'natildi — 2 500 000 UZS / 1 783 CNY",
    titleRu: "Перевод отправлен — 2 500 000 UZS / 1 783 CNY",
    titleEn: "Transfer sent — 2,500,000 UZS / 1,783 CNY",
    bodyUz: "Olim — Alipay. Tezroq tugadi.",
    bodyRu: "Олиму — Alipay. Готово быстрее обычного.",
    bodyEn: "Sent to Olim via Alipay. Done faster than usual.",
    isRead: true,
    deepLink: { screen: 'transfer_detail', params: { transfer_id: 'tx_30' } },
    composedBy: SYSTEM_BOT,
    recipientCount: 1,
    deliveredCount: 1,
    openedCount: 1,
    clickThroughCount: 1,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: ago(5, 13, 0),
    readAt: ago(5, 13, 1),
    createdAt: ago(5, 13, 0),
  },
  {
    id: 'notif_031',
    userId: 'u_37',
    type: 'transfer',
    status: 'sent',
    audienceType: 'single',
    audienceCriteria: null,
    titleUz: "Pul yetib bordi",
    titleRu: "Перевод доставлен",
    titleEn: "Transfer delivered",
    bodyUz: "Liu Alipay hisobiga 215 CNY oldi.",
    bodyRu: "Лю получил 215 CNY на Alipay.",
    bodyEn: "Liu received 215 CNY on Alipay.",
    isRead: true,
    deepLink: { screen: 'transfer_detail', params: { transfer_id: 'tx_37' } },
    composedBy: SYSTEM_BOT,
    recipientCount: 1,
    deliveredCount: 1,
    openedCount: 1,
    clickThroughCount: 0,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: ago(6, 9, 0),
    readAt: ago(6, 9, 4),
    createdAt: ago(6, 9, 0),
  },
  {
    id: 'notif_032',
    userId: 'u_45',
    type: 'transfer',
    status: 'sent',
    audienceType: 'single',
    audienceCriteria: null,
    titleUz: "O'tkazma to'xtatilgan",
    titleRu: "Перевод приостановлен",
    titleEn: "Transfer on hold",
    bodyUz: "Compliance tomonidan ko'rib chiqilmoqda. 24 soat ichida xabar olasiz.",
    bodyRu: "На рассмотрении в комплаенсе. Сообщим в течение 24 часов.",
    bodyEn: "Under compliance review. We'll notify you within 24 hours.",
    isRead: true,
    deepLink: { screen: 'transfer_detail', params: { transfer_id: 'tx_45' } },
    composedBy: SYSTEM_BOT,
    recipientCount: 1,
    deliveredCount: 1,
    openedCount: 1,
    clickThroughCount: 1,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: ago(7, 12, 0),
    readAt: ago(7, 12, 2),
    createdAt: ago(7, 12, 0),
  },
  {
    id: 'notif_033',
    userId: 'u_19',
    type: 'transfer',
    status: 'sent',
    audienceType: 'single',
    audienceCriteria: null,
    titleUz: "Pul jo'natildi — 600 000 UZS / 428 CNY",
    titleRu: "Перевод отправлен — 600 000 UZS / 428 CNY",
    titleEn: "Transfer sent — 600,000 UZS / 428 CNY",
    bodyUz: "WeChat Pay orqali. UzCard •• 1108.",
    bodyRu: "Через WeChat Pay. UzCard •• 1108.",
    bodyEn: "Via WeChat Pay. UzCard •• 1108.",
    isRead: false,
    deepLink: { screen: 'transfer_detail', params: { transfer_id: 'tx_33' } },
    composedBy: SYSTEM_BOT,
    recipientCount: 1,
    deliveredCount: 1,
    openedCount: 0,
    clickThroughCount: 0,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: ago(8, 14, 0),
    readAt: null,
    createdAt: ago(8, 14, 0),
  },
  {
    id: 'notif_034',
    userId: 'u_03',
    type: 'transfer',
    status: 'sent',
    audienceType: 'single',
    audienceCriteria: null,
    titleUz: "Pul yetib bordi",
    titleRu: "Перевод доставлен",
    titleEn: "Transfer delivered",
    bodyUz: "Wang Alipay hisobiga 4 282 CNY oldi.",
    bodyRu: "Ван получил 4 282 CNY на Alipay.",
    bodyEn: "Wang received 4,282 CNY on Alipay.",
    isRead: true,
    deepLink: { screen: 'transfer_detail', params: { transfer_id: 'tx_34' } },
    composedBy: SYSTEM_BOT,
    recipientCount: 1,
    deliveredCount: 1,
    openedCount: 1,
    clickThroughCount: 1,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: ago(10, 10, 0),
    readAt: ago(10, 10, 1),
    createdAt: ago(10, 10, 0),
  },
  {
    id: 'notif_035',
    userId: 'u_33',
    type: 'transfer',
    status: 'sent',
    audienceType: 'single',
    audienceCriteria: null,
    titleUz: "Pul jo'natildi — 950 000 UZS / 677 CNY",
    titleRu: "Перевод отправлен — 950 000 UZS / 677 CNY",
    titleEn: "Transfer sent — 950,000 UZS / 677 CNY",
    bodyUz: "Humo •• 5503 dan Alipay ga.",
    bodyRu: "С Humo •• 5503 на Alipay.",
    bodyEn: "From Humo •• 5503 to Alipay.",
    isRead: true,
    deepLink: { screen: 'transfer_detail', params: { transfer_id: 'tx_35' } },
    composedBy: SYSTEM_BOT,
    recipientCount: 1,
    deliveredCount: 1,
    openedCount: 1,
    clickThroughCount: 0,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: ago(12, 9, 0),
    readAt: ago(12, 9, 2),
    createdAt: ago(12, 9, 0),
  },
  {
    id: 'notif_036',
    userId: 'u_07',
    type: 'transfer',
    status: 'sent',
    audienceType: 'single',
    audienceCriteria: null,
    titleUz: "Pul yetib bordi",
    titleRu: "Перевод доставлен",
    titleEn: "Transfer delivered",
    bodyUz: "Yu WeChat Pay hisobiga 2 140 CNY oldi.",
    bodyRu: "Юй получила 2 140 CNY на WeChat Pay.",
    bodyEn: "Yu received 2,140 CNY on WeChat Pay.",
    isRead: false,
    deepLink: { screen: 'transfer_detail', params: { transfer_id: 'tx_36' } },
    composedBy: SYSTEM_BOT,
    recipientCount: 1,
    deliveredCount: 1,
    openedCount: 0,
    clickThroughCount: 0,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: ago(14, 11, 0),
    readAt: null,
    createdAt: ago(14, 11, 0),
  },
  {
    id: 'notif_037',
    userId: 'u_24',
    type: 'transfer',
    status: 'sent',
    audienceType: 'single',
    audienceCriteria: null,
    titleUz: "O'tkazma muvaffaqiyatsiz tugadi",
    titleRu: "Перевод не выполнен",
    titleEn: "Transfer failed",
    bodyUz: "Yetarli mablag' yo'q. Kartani to'ldiring va qayta urinib ko'ring.",
    bodyRu: "Недостаточно средств. Пополните карту и повторите.",
    bodyEn: "Insufficient funds. Top up your card and try again.",
    isRead: true,
    deepLink: { screen: 'transfer_detail', params: { transfer_id: 'tx_37b' } },
    composedBy: SYSTEM_BOT,
    recipientCount: 1,
    deliveredCount: 1,
    openedCount: 1,
    clickThroughCount: 1,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: ago(17, 13, 0),
    readAt: ago(17, 13, 1),
    createdAt: ago(17, 13, 0),
  },
  {
    id: 'notif_038',
    userId: 'u_15',
    type: 'transfer',
    status: 'sent',
    audienceType: 'single',
    audienceCriteria: null,
    titleUz: "Pul yetib bordi",
    titleRu: "Перевод доставлен",
    titleEn: "Transfer delivered",
    bodyUz: "Zhang Alipay hisobiga 855 CNY oldi.",
    bodyRu: "Чжан получила 855 CNY на Alipay.",
    bodyEn: "Zhang received 855 CNY on Alipay.",
    isRead: true,
    deepLink: { screen: 'transfer_detail', params: { transfer_id: 'tx_38' } },
    composedBy: SYSTEM_BOT,
    recipientCount: 1,
    deliveredCount: 1,
    openedCount: 1,
    clickThroughCount: 0,
    scheduledFor: null,
    cancelledAt: null,
    cancellationReason: null,
    sentAt: ago(20, 10, 0),
    readAt: ago(20, 10, 3),
    createdAt: ago(20, 10, 0),
  },
];

// =====================================================================
// Listing helpers
// =====================================================================

export function listNotifications(): Notification[] {
  return NOTIFICATIONS.slice();
}

export function getNotificationById(id: string): Notification | undefined {
  return NOTIFICATIONS.find((n) => n.id === id);
}

// =====================================================================
// Mutators — emit one audit row each
// =====================================================================

export type NotificationAuditAction = 'send' | 'schedule' | 'cancel_scheduled';

export interface NotificationAuditEntry {
  id: string;
  notificationId: string;
  action: NotificationAuditAction;
  actorId: string;
  actorName: string;
  reason: string;
  /** Snapshot at the moment of the action — read-stable even if the row mutates. */
  snapshot: {
    titleEn: string;
    type: NotificationType;
    audienceType: NotificationAudienceType;
    recipientCount: number;
    status: NotificationStatus;
    scheduledFor: Date | null;
    sentAt: Date | null;
  };
  createdAt: Date;
}

const NOTIFICATION_AUDIT: NotificationAuditEntry[] = [];
let auditSeq = 1;
function nextAuditId(): string {
  return `notification_audit_${String(auditSeq++).padStart(4, '0')}`;
}

let notifSeq = NOTIFICATIONS.length + 1;
function nextNotificationId(): string {
  return `notif_${String(notifSeq++).padStart(3, '0')}`;
}

interface MutatorActor {
  id: string;
  name: string;
}

const DEFAULT_ACTOR: MutatorActor = SUPER_ADMIN;

function snapshotOf(n: Notification): NotificationAuditEntry['snapshot'] {
  return {
    titleEn: n.titleEn,
    type: n.type,
    audienceType: n.audienceType,
    recipientCount: n.recipientCount,
    status: n.status,
    scheduledFor: n.scheduledFor,
    sentAt: n.sentAt,
  };
}

export interface CreateNotificationInput {
  type: NotificationType;
  audienceType: NotificationAudienceType;
  audienceCriteria: NotificationAudienceCriteria | null;
  /** Required when audienceType=single. */
  userId: string | null;
  titleUz: string;
  titleRu: string;
  titleEn: string;
  bodyUz: string;
  bodyRu: string;
  bodyEn: string;
  deepLink: NotificationDeepLink | null;
  /**
   * When null → "send now" → status='sent'; when Date → status='scheduled'.
   * (The mock simulates immediate delivery for "send now" — no sending state.)
   */
  scheduledFor: Date | null;
  /** Snapshot taken at submit time. */
  recipientCount: number;
}

/**
 * Create a notification row and write the corresponding audit entry.
 *
 * - If `scheduledFor` is null → the row is created with status='sent' and
 *   delivered/opened/click stats simulated (95%/40%/12% of recipient_count).
 * - If `scheduledFor` is a future date → status='scheduled', stats null.
 *
 * Real production would fan out via push gateway; the mock skips that step
 * and seeds plausible delivery numbers so the Sent tab demos cleanly.
 */
export function createNotification(
  input: CreateNotificationInput,
  actor: MutatorActor = DEFAULT_ACTOR,
): Notification {
  const isScheduled = input.scheduledFor !== null;
  const status: NotificationStatus = isScheduled ? 'scheduled' : 'sent';
  const auditAction: NotificationAuditAction = isScheduled ? 'schedule' : 'send';

  const created = new Date();
  const sentAt = isScheduled ? null : created;

  // Mock realistic stats for "send now" so the row's read-rate column
  // doesn't render `0%` immediately. Numbers tuned to sit inside the
  // ranges the seed already exhibits (delivered ~96–99%, opened ~30–55%).
  const deliveredCount = isScheduled
    ? null
    : Math.max(1, Math.round(input.recipientCount * 0.97));
  const openedCount = isScheduled
    ? null
    : input.audienceType === 'single'
      ? Math.round((deliveredCount ?? 0) * 0.7)
      : Math.round((deliveredCount ?? 0) * 0.4);
  const clickThroughCount = isScheduled
    ? null
    : input.deepLink === null
      ? null
      : Math.round((openedCount ?? 0) * 0.25);

  const item: Notification = {
    id: nextNotificationId(),
    userId: input.audienceType === 'single' ? input.userId : null,
    type: input.type,
    status,
    audienceType: input.audienceType,
    audienceCriteria: input.audienceType === 'segment' ? input.audienceCriteria : null,
    titleUz: input.titleUz,
    titleRu: input.titleRu,
    titleEn: input.titleEn,
    bodyUz: input.bodyUz,
    bodyRu: input.bodyRu,
    bodyEn: input.bodyEn,
    isRead: false,
    deepLink: input.deepLink,
    composedBy: { id: actor.id, name: actor.name },
    recipientCount: input.recipientCount,
    deliveredCount,
    openedCount,
    clickThroughCount,
    scheduledFor: input.scheduledFor,
    cancelledAt: null,
    cancellationReason: null,
    sentAt,
    readAt: null,
    createdAt: created,
  };
  NOTIFICATIONS.unshift(item);
  NOTIFICATION_AUDIT.unshift({
    id: nextAuditId(),
    notificationId: item.id,
    action: auditAction,
    actorId: actor.id,
    actorName: actor.name,
    reason: '',
    snapshot: snapshotOf(item),
    createdAt: created,
  });
  return item;
}

/**
 * Cancel a scheduled-but-not-yet-fired notification. Required reason ≥ 20
 * chars (matches Stories / App Versions cancel-edit precedent).
 *
 * Returns the updated row, or undefined if the id doesn't exist or the
 * row isn't in `scheduled` status (cancel only valid pre-firing).
 */
export function cancelScheduledNotification(
  id: string,
  reason: string,
  actor: MutatorActor = DEFAULT_ACTOR,
): Notification | undefined {
  const idx = NOTIFICATIONS.findIndex((n) => n.id === id);
  if (idx === -1) return undefined;
  const row = NOTIFICATIONS[idx];
  if (row.status !== 'scheduled') return undefined;
  if (reason.trim().length < 20) return undefined;
  const cancelledAt = new Date();
  const updated: Notification = {
    ...row,
    status: 'cancelled',
    cancelledAt,
    cancellationReason: reason.trim(),
  };
  NOTIFICATIONS[idx] = updated;
  NOTIFICATION_AUDIT.unshift({
    id: nextAuditId(),
    notificationId: updated.id,
    action: 'cancel_scheduled',
    actorId: actor.id,
    actorName: actor.name,
    reason: reason.trim(),
    snapshot: snapshotOf(updated),
    createdAt: cancelledAt,
  });
  return updated;
}

export function listNotificationAudit(): NotificationAuditEntry[] {
  return NOTIFICATION_AUDIT.slice();
}

// =====================================================================
// Seed audit rows — one row per seeded notification so the audit log has
// matching entries for every existing row (admin filter `entity_type =
// notification` shows the full history out of the box).
// =====================================================================

(function seedAudit() {
  for (const n of NOTIFICATIONS) {
    let action: NotificationAuditAction;
    let createdAt: Date;
    let reason = '';
    if (n.status === 'cancelled') {
      // Two rows: schedule + cancel_scheduled, in chronological order
      // (oldest first so unshift produces newest-first ordering).
      NOTIFICATION_AUDIT.unshift({
        id: nextAuditId(),
        notificationId: n.id,
        action: 'schedule',
        actorId: n.composedBy.id,
        actorName: n.composedBy.name,
        reason: '',
        snapshot: { ...snapshotOf(n), status: 'scheduled', sentAt: null },
        createdAt: n.createdAt,
      });
      action = 'cancel_scheduled';
      createdAt = n.cancelledAt ?? n.createdAt;
      reason = n.cancellationReason ?? '';
    } else if (n.status === 'scheduled') {
      action = 'schedule';
      createdAt = n.createdAt;
    } else {
      action = 'send';
      createdAt = n.sentAt ?? n.createdAt;
    }
    NOTIFICATION_AUDIT.unshift({
      id: nextAuditId(),
      notificationId: n.id,
      action,
      actorId: n.composedBy.id,
      actorName: n.composedBy.name,
      reason,
      snapshot: snapshotOf(n),
      createdAt,
    });
  }
  // Sort newest-first overall.
  NOTIFICATION_AUDIT.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
})();
