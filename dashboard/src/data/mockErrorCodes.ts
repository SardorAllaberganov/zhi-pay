/**
 * Mock data + helpers for the read-only Error Codes catalog at
 * `/system/error-codes`.
 *
 * Schema mirrors `docs/models.md §7` with one cascade flagged in Phase 16:
 * the singular `suggested_action` column is split into per-locale
 * `suggested_action_uz/ru/en` to parallel `message_*`. Each ErrorCode
 * row is the source of truth for its localized copy — the page reads
 * directly from this store instead of duplicating into i18n keys
 * (precedent: `mockServices` for status text, `mockBlacklist` for
 * masked identifiers).
 *
 * Stats (lastTriggeredAt + 30-day daily counts) are a **mock-only
 * observability cache** — these would normally be denormalized from a
 * metrics store / time-series DB into the admin UI. Synthesized here
 * with a deterministic seeded generator so the table renders realistic
 * per-code volume without a real backend. Same precedent as Services &
 * Health's observability cache.
 */

import type { LocaleCode } from '@/components/zhipay/LocaleFlag';

// =====================================================================
// Schema
// =====================================================================

export type ErrorCategory =
  | 'kyc'
  | 'acquiring'
  | 'fx'
  | 'provider'
  | 'compliance'
  | 'system';

export const ERROR_CATEGORIES: ErrorCategory[] = [
  'kyc',
  'acquiring',
  'fx',
  'provider',
  'compliance',
  'system',
];

export interface ErrorCode {
  /** Stable code string — matches the value pinned in `transfers.failure_code`. */
  code: string;
  category: ErrorCategory;
  retryable: boolean;
  // Localized message — the user-facing failure copy. Single field per
  // locale matching `docs/models.md §7`.
  message_uz: string;
  message_ru: string;
  message_en: string;
  // Localized suggested action — what the user (or operator) should do
  // next. Per-locale split flagged as a §7 doc cascade in Phase 16.
  suggested_action_uz: string;
  suggested_action_ru: string;
  suggested_action_en: string;
}

export interface ErrorCodeStats {
  /** Most recent trigger time. */
  lastTriggeredAt: Date;
  /** Per-day count for the last 30 days — index 0 = oldest, 29 = today. */
  dailyCounts: number[];
}

export interface ErrorCodeWithStats extends ErrorCode {
  stats: ErrorCodeStats;
}

// =====================================================================
// Locale accessor — keeps the consumer reading the right field per locale
// without authoring a 2-D switch each time.
// =====================================================================

/**
 * Read the message for a given locale. Falls back to English if the
 * localized field is empty (defensive — every seeded row has all 3).
 */
export function getMessage(ec: ErrorCode, locale: LocaleCode): string {
  if (locale === 'uz') return ec.message_uz || ec.message_en;
  if (locale === 'ru') return ec.message_ru || ec.message_en;
  return ec.message_en;
}

/** Read the suggested action for a given locale. */
export function getSuggestedAction(
  ec: ErrorCode,
  locale: LocaleCode,
): string {
  if (locale === 'uz') return ec.suggested_action_uz || ec.suggested_action_en;
  if (locale === 'ru') return ec.suggested_action_ru || ec.suggested_action_en;
  return ec.suggested_action_en;
}

// =====================================================================
// 15-row deterministic seed
// =====================================================================
//
// Authoring rules per locale (per `localization.md` + Phase 16 spec):
//   - `uz` — concise, direct
//   - `ru` — formal-respectful (вы / пожалуйста where natural)
//   - `en` — direct, plain
//
// Every code carries: localized message + localized suggested action.
// English sentences kept short (~50–90 chars) so the table preview at
// 80 chars rarely truncates mid-clause.
// =====================================================================

const ROWS: ErrorCode[] = [
  {
    code: 'KYC_REQUIRED',
    category: 'kyc',
    retryable: false,
    message_uz: 'Pul yuborishdan oldin MyID tasdiqlanishi shart.',
    message_ru: 'Перед отправкой требуется подтверждение MyID.',
    message_en: 'MyID verification is required before you can send money.',
    suggested_action_uz: 'Davom etish uchun MyID orqali tasdiqlang.',
    suggested_action_ru: 'Пожалуйста, подтвердите личность через MyID.',
    suggested_action_en: 'Verify with MyID to continue.',
  },
  {
    code: 'KYC_EXPIRED',
    category: 'kyc',
    retryable: false,
    message_uz: 'MyID tasdiqlanishi muddati tugagan.',
    message_ru: 'Срок действия подтверждения MyID истёк.',
    message_en: 'Your MyID verification has expired.',
    suggested_action_uz: 'Darajangizni tiklash uchun MyID orqali qayta tasdiqlang.',
    suggested_action_ru: 'Пройдите проверку MyID повторно, чтобы восстановить уровень.',
    suggested_action_en: 'Re-verify with MyID to restore your tier.',
  },
  {
    code: 'LIMIT_DAILY_EXCEEDED',
    category: 'compliance',
    retryable: false,
    message_uz: 'Kunlik limit tugadi. Ertaga qayta yuborish mumkin.',
    message_ru: 'Дневной лимит исчерпан. Вы сможете отправить снова завтра.',
    message_en: 'Daily limit reached. You can send again tomorrow.',
    suggested_action_uz: 'Ertangacha kuting yoki MyID orqali darajani oshiring.',
    suggested_action_ru: 'Подождите до завтра или повысьте уровень через MyID.',
    suggested_action_en: 'Wait until tomorrow or upgrade your tier with MyID.',
  },
  {
    code: 'LIMIT_MONTHLY_EXCEEDED',
    category: 'compliance',
    retryable: false,
    message_uz: 'Oylik limit tugadi.',
    message_ru: 'Месячный лимит исчерпан.',
    message_en: 'Monthly limit reached.',
    suggested_action_uz: 'Keyingi oyni kuting yoki MyID orqali darajani oshiring.',
    suggested_action_ru: 'Дождитесь следующего месяца или повысьте уровень через MyID.',
    suggested_action_en: 'Wait for next month or upgrade your tier with MyID.',
  },
  {
    code: 'LIMIT_PER_TX_EXCEEDED',
    category: 'compliance',
    retryable: false,
    message_uz: 'Summa bitta amaliyot limitidan oshib ketdi.',
    message_ru: 'Сумма превышает лимит одной транзакции.',
    message_en: 'Amount exceeds the per-transaction limit.',
    suggested_action_uz: "Pul o'tkazmasini bo'lib yuboring yoki MyID orqali darajani oshiring.",
    suggested_action_ru: 'Разделите перевод или повысьте уровень через MyID.',
    suggested_action_en: 'Split the transfer or upgrade your tier with MyID.',
  },
  {
    code: 'CARD_DECLINED',
    category: 'acquiring',
    retryable: true,
    message_uz: 'Karta sizning bankingiz tomonidan rad etildi.',
    message_ru: 'Карта отклонена вашим банком.',
    message_en: 'Card declined by your bank.',
    suggested_action_uz: "Boshqa karta sinab ko'ring yoki bankingizga murojaat qiling.",
    suggested_action_ru: 'Попробуйте другую карту или свяжитесь с банком.',
    suggested_action_en: 'Try a different card or contact your bank.',
  },
  {
    code: 'INSUFFICIENT_FUNDS',
    category: 'acquiring',
    retryable: true,
    message_uz: "Kartada mablag' yetarli emas.",
    message_ru: 'Недостаточно средств на карте.',
    message_en: 'Insufficient funds on the card.',
    suggested_action_uz: "Kartani to'ldiring yoki boshqa karta tanlang.",
    suggested_action_ru: 'Пополните карту или выберите другую.',
    suggested_action_en: 'Top up the card or use another card.',
  },
  {
    code: 'CARD_EXPIRED',
    category: 'acquiring',
    retryable: false,
    message_uz: 'Karta muddati tugagan.',
    message_ru: 'Срок действия карты истёк.',
    message_en: 'The card has expired.',
    suggested_action_uz: "Davom etish uchun yangi karta qo'shing.",
    suggested_action_ru: 'Добавьте новую карту, чтобы продолжить.',
    suggested_action_en: 'Add a new card to continue sending.',
  },
  {
    code: 'FX_STALE',
    category: 'fx',
    retryable: true,
    message_uz: 'Valyuta kursi yangilandi. Yuborishdan oldin tasdiqlang.',
    message_ru: 'Курс обмена обновился. Пожалуйста, подтвердите перед отправкой.',
    message_en: 'Exchange rate has updated. Please re-confirm before sending.',
    suggested_action_uz: "Hisob-kitobni yangilang va yangi kursni ko'rib chiqing.",
    suggested_action_ru: 'Обновите расчёт и проверьте новый курс.',
    suggested_action_en: 'Refresh the quote and review the new rate.',
  },
  {
    code: 'PROVIDER_UNAVAILABLE',
    category: 'provider',
    retryable: true,
    message_uz: "Xizmat vaqtinchalik mavjud emas.",
    message_ru: 'Сервис временно недоступен.',
    message_en: 'Service is temporarily unavailable.',
    suggested_action_uz: "Iltimos, bir necha daqiqadan so'ng qayta urinib ko'ring.",
    suggested_action_ru: 'Пожалуйста, попробуйте ещё раз через несколько минут.',
    suggested_action_en: 'Try again in a few minutes.',
  },
  {
    code: 'RECIPIENT_INVALID',
    category: 'provider',
    retryable: false,
    message_uz: "Alipay yoki WeChat identifikatorini tekshirib bo'lmadi.",
    message_ru: 'Не удалось проверить идентификатор Alipay или WeChat.',
    message_en: "We couldn't verify the Alipay or WeChat handle.",
    suggested_action_uz: "Qabul qiluvchi identifikatorini tekshiring va qayta urinib ko'ring.",
    suggested_action_ru: 'Проверьте идентификатор получателя и повторите попытку.',
    suggested_action_en: 'Verify the recipient handle and try again.',
  },
  {
    code: 'SANCTIONS_HIT',
    category: 'compliance',
    retryable: false,
    message_uz: "Bu o'tkazma talablarga muvofiqlik uchun tekshirilmoqda.",
    message_ru: 'Мы проверяем эту операцию на соответствие требованиям.',
    message_en: "We're reviewing this transfer for compliance.",
    suggested_action_uz: 'Sizga 24 soat ichida xabar beramiz. Hech qanday amal kerak emas.',
    suggested_action_ru: 'Мы уведомим вас в течение 24 часов. Действий не требуется.',
    suggested_action_en: "We'll notify you within 24 hours. No action needed.",
  },
  {
    code: 'SYSTEM_ERROR',
    category: 'system',
    retryable: true,
    message_uz: 'Bizning tomonimizda xatolik yuz berdi.',
    message_ru: 'Что-то пошло не так с нашей стороны.',
    message_en: 'Something went wrong on our side.',
    suggested_action_uz: "Qayta urinib ko'ring. Xato takrorlansa, qo'llab-quvvatlash xizmatiga murojaat qiling.",
    suggested_action_ru: 'Попробуйте ещё раз. Если ошибка повторится, обратитесь в поддержку.',
    suggested_action_en: 'Try again. If the problem persists, contact support.',
  },
  {
    code: 'THREE_DS_FAILED',
    category: 'acquiring',
    retryable: true,
    message_uz: 'Bank autentifikatsiyasi muvaffaqiyatsiz tugadi.',
    message_ru: 'Аутентификация банка не пройдена.',
    message_en: 'Bank authentication failed.',
    suggested_action_uz: "Qayta urinib ko'ring yoki boshqa karta tanlang.",
    suggested_action_ru: 'Попробуйте ещё раз или используйте другую карту.',
    suggested_action_en: 'Try again or use a different card.',
  },
  {
    code: '3DS_TIMEOUT',
    category: 'acquiring',
    retryable: true,
    message_uz: 'Bank autentifikatsiyasi vaqti tugadi.',
    message_ru: 'Время ожидания аутентификации банка истекло.',
    message_en: 'Bank authentication timed out.',
    suggested_action_uz: "Qayta urinib ko'ring. Bank ilovasi ochilmagan bo'lsa, telefonni tekshiring.",
    suggested_action_ru: 'Повторите попытку. Если приложение банка не открылось, проверьте телефон.',
    suggested_action_en: "Try again. If your bank app didn't open, check your phone.",
  },
];

// =====================================================================
// Synthetic per-code observability — last-triggered + 30-day daily counts
// =====================================================================
//
// Time anchor matches every other deterministic store in this codebase
// (mockTransfers / mockServices / mockAppVersions all share NOW).
// =====================================================================

const NOW = new Date('2026-04-29T10:30:00Z');
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ONE_MIN_MS = 60 * 1000;

/** Mulberry32 — same generator used by mockTransfers / mockServices. */
function makeRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Generate a 30-day count series with a centered base + jitter. */
function genDailyCounts(seed: number, base: number, jitter: number, days = 30): number[] {
  const rand = makeRandom(seed);
  return Array.from({ length: days }, () => {
    const r = rand();
    return Math.max(0, Math.round(base + (r - 0.5) * 2 * jitter));
  });
}

/** Sparse series — most days are 0; some days are 1. For SANCTIONS_HIT etc. */
function genSparseCounts(seed: number, hitProb: number, days = 30): number[] {
  const rand = makeRandom(seed);
  return Array.from({ length: days }, () => (rand() < hitProb ? 1 : 0));
}

interface StatsSeed {
  /** Centered base; jitter is the +/- range per day. */
  base: number;
  jitter: number;
  /** When non-null, generate a sparse series (probability of hit per day). */
  sparseProb?: number;
  /** Minutes ago — most-recent trigger relative to NOW. */
  lastTriggeredMinAgo: number;
}

const STATS_SEEDS: Record<string, StatsSeed> = {
  KYC_REQUIRED:           { base: 22, jitter: 8,  lastTriggeredMinAgo: 9 },
  KYC_EXPIRED:            { base: 2,  jitter: 2,  lastTriggeredMinAgo: 6 * 60 + 14 },
  LIMIT_DAILY_EXCEEDED:   { base: 50, jitter: 14, lastTriggeredMinAgo: 12 },
  LIMIT_MONTHLY_EXCEEDED: { base: 2,  jitter: 2,  lastTriggeredMinAgo: 4 * 60 + 33 },
  LIMIT_PER_TX_EXCEEDED:  { base: 14, jitter: 5,  lastTriggeredMinAgo: 38 },
  CARD_DECLINED:          { base: 30, jitter: 10, lastTriggeredMinAgo: 8 },
  INSUFFICIENT_FUNDS:     { base: 21, jitter: 6,  lastTriggeredMinAgo: 22 },
  CARD_EXPIRED:           { base: 3,  jitter: 2,  lastTriggeredMinAgo: 2 * 60 + 47 },
  FX_STALE:               { base: 14, jitter: 4,  lastTriggeredMinAgo: 41 },
  PROVIDER_UNAVAILABLE:   { base: 5,  jitter: 3,  lastTriggeredMinAgo: 1 * 60 + 18 },
  RECIPIENT_INVALID:      { base: 11, jitter: 4,  lastTriggeredMinAgo: 27 },
  SANCTIONS_HIT:          { base: 0,  jitter: 0,  sparseProb: 0.18, lastTriggeredMinAgo: 4 * 24 * 60 + 90 },
  SYSTEM_ERROR:           { base: 7,  jitter: 3,  lastTriggeredMinAgo: 2 * 60 + 16 },
  THREE_DS_FAILED:        { base: 8,  jitter: 3,  lastTriggeredMinAgo: 51 },
  '3DS_TIMEOUT':          { base: 5,  jitter: 2,  lastTriggeredMinAgo: 1 * 60 + 33 },
};

/**
 * Pure offset of the code-string into a stable numeric seed so the
 * generated arrays are reproducible across reloads but distinct per code.
 */
function seedForCode(code: string): number {
  let h = 2166136261; // FNV-1a
  for (let i = 0; i < code.length; i++) {
    h ^= code.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const STATS: Record<string, ErrorCodeStats> = Object.fromEntries(
  ROWS.map((r) => {
    const seed = STATS_SEEDS[r.code];
    if (!seed) {
      throw new Error(`Missing STATS_SEEDS entry for ${r.code}`);
    }
    const codeSeed = seedForCode(r.code);
    const dailyCounts =
      seed.sparseProb !== undefined
        ? genSparseCounts(codeSeed, seed.sparseProb)
        : genDailyCounts(codeSeed, seed.base, seed.jitter);
    return [
      r.code,
      {
        lastTriggeredAt: new Date(NOW.getTime() - seed.lastTriggeredMinAgo * ONE_MIN_MS),
        dailyCounts,
      },
    ];
  }),
);

// =====================================================================
// Public API
// =====================================================================

/** Sorted by code ASC — matches the page's default sort. */
export function listErrorCodes(): ErrorCodeWithStats[] {
  return ROWS.slice()
    .sort((a, b) => a.code.localeCompare(b.code))
    .map((r) => ({ ...r, stats: STATS[r.code] }));
}

export function getErrorCode(code: string): ErrorCodeWithStats | undefined {
  const r = ROWS.find((x) => x.code === code);
  if (!r) return undefined;
  return { ...r, stats: STATS[r.code] };
}

/**
 * Sum the per-day counts within the trailing window. Hours are
 * day-aligned at the right edge — the most recent slot is "today",
 * "today + yesterday" for 48h, etc.
 *
 *   24   → dailyCounts[29]
 *   168  → sum of last 7 days
 *   720  → sum of all 30 days
 */
export function countTriggersInWindow(code: string, hours: number): number {
  const stats = STATS[code];
  if (!stats) return 0;
  const days = Math.max(1, Math.min(30, Math.ceil(hours / 24)));
  return stats.dailyCounts.slice(-days).reduce((sum, n) => sum + n, 0);
}

export function getLastTriggeredAt(code: string): Date | undefined {
  return STATS[code]?.lastTriggeredAt;
}

/** 7-day daily-count slice for the per-row sparkline. */
export function getDailyCountsLast7d(code: string): number[] {
  return STATS[code]?.dailyCounts.slice(-7) ?? [];
}

// =====================================================================
// Codes referenced by the existing audit / mockTransfers `failure_code`
// pool — kept for sanity tests / cross-checks.
// =====================================================================

/** Codes that the Transfers list deep-link (`?failure_code=…`) will hit. */
export const CODES_TRIGGERABLE_VIA_TRANSFERS = new Set<string>([
  'CARD_DECLINED',
  'RECIPIENT_INVALID',
  'INSUFFICIENT_FUNDS',
  'PROVIDER_UNAVAILABLE',
  'LIMIT_DAILY_EXCEEDED',
  'SANCTIONS_HIT',
]);

/** Total row count for the page footer / count chip. */
export function totalErrorCodeCount(): number {
  return ROWS.length;
}
