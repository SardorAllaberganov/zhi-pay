/**
 * App Versions mock dataset — single source of truth for the
 * `/system/app-versions` surface.
 *
 * Schema (`docs/models.md` §8 — `app_versions`):
 *   id              uuid PK              (`av_<plat>_<ver>` in mock)
 *   platform        enum                 ('ios' | 'android')
 *   version         string (semver)      e.g. '1.4.2'
 *   force_update    boolean
 *   min_supported   string (semver)
 *   release_notes_uz/ru/en  string
 *   released_at     timestamp
 *
 * Mock-only audit-trail surrogates (NOT in §8 — real backend records these
 * in a separate audit-log table; same precedent as fx_rates / commission_rules
 * / blacklist):
 *   created_by      string                ('admin_super_01' / 'admin_finance_02')
 *   last_edited_at  Date | null
 *   last_edited_by  string | null
 *
 * Active version derivation: latest by `released_at DESC` per platform.
 * Deliberately date-based, not version-string-based — a hotfix released
 * after a major could outrank if dated later, which matches release-mgmt
 * norm. Spec aligns ("Default sort: released_at DESC").
 *
 * Critical invariants (enforced by the mutators):
 *   1. (platform, version) is unique. `addAppVersion()` rejects duplicates.
 *   2. Versions are append-only by nature — no delete affordance.
 *   3. Edits preserve the prior value in `context.previous_*` on the audit
 *      row + carry a reason note.
 *   4. Both mutators emit a single granular audit-log row, bridged into
 *      `mockAuditLog` via `bridgeAppVersionAudit` (granular `add` / `edit`
 *      verbs preserved in `context.kind`; central log maps to `created` /
 *      `updated`).
 */

// =====================================================================
// Public types
// =====================================================================

export type Platform = 'ios' | 'android';

export interface AppVersion {
  id: string;
  platform: Platform;
  version: string;
  forceUpdate: boolean;
  /** Optional: when set, all sessions on a version below this string are forced to update. */
  minSupported: string | null;
  releaseNotesUz: string;
  releaseNotesRu: string;
  releaseNotesEn: string;
  releasedAt: Date;
  createdBy: string;
  lastEditedAt: Date | null;
  lastEditedBy: string | null;
}

// =====================================================================
// Reference time + admin pool — keep aligned with sibling modules
// =====================================================================

const NOW = new Date('2026-04-29T10:30:00Z');
function daysAgo(d: number, hour = 12, minute = 0): Date {
  const out = new Date(NOW.getTime() - d * 24 * 60 * 60 * 1000);
  out.setUTCHours(hour, minute, 0, 0);
  return out;
}
function weeksAgo(w: number, hour = 12, minute = 0): Date {
  return daysAgo(w * 7, hour, minute);
}

// Aligns with mockUsers' admin pool + mockAuditLog ADMIN_PROFILES.
const ADMIN_SUPER = 'admin_super_01';
const ADMIN_FIN = 'admin_finance_02';

// =====================================================================
// Seed — 9 iOS + 9 Android
// =====================================================================

/**
 * Authored release notes per language. EN is the base (closest to spec
 * sample); RU / UZ are realistic equivalents — natural copy, not
 * transliteration. Tone stays factual and platform-store-appropriate.
 */
interface ReleaseNotes {
  en: string;
  ru: string;
  uz: string;
}

const NOTES: Record<string, ReleaseNotes> = {
  v_1_4_2: {
    en:
      'Faster send-money flow.\nNew rate-lock countdown shows when the locked FX rate expires.\nBug fixes for card linking on iOS 16 and Android 12.',
    ru:
      'Ускорили процесс отправки денег.\nНовый таймер фиксации курса показывает, когда истечёт зафиксированный курс.\nИсправлены ошибки привязки карт на iOS 16 и Android 12.',
    uz:
      'Pul yuborish jarayoni tezlashtirildi.\nYangi kurs muzlatish taymeri qachon tugashini ko‘rsatadi.\niOS 16 va Android 12 da kartani bog‘lash xatolari tuzatildi.',
  },
  v_1_4_1: {
    en:
      'Improved transfer history search.\nFixed an issue where receipts could be cut off when sharing.\nMinor UI polish.',
    ru:
      'Улучшили поиск по истории переводов.\nИсправлена проблема обрезанных квитанций при отправке.\nНебольшие улучшения интерфейса.',
    uz:
      'Tranzaksiyalar tarixidagi qidiruv yaxshilandi.\nKvitansiyalar ulashilganda kesilib qolish xatosi tuzatildi.\nKichik interfeys yaxshilanishlari.',
  },
  v_1_4_0: {
    en:
      'New: save your favourite recipients for one-tap transfers.\n* Pin Alipay or WeChat handles\n* Add a personal nickname (e.g. "Mom", "Yiwu supplier")\n* Smart suggestions on the send-money screen\n\nAlso: redesigned settings, improved error messages, faster app launch.',
    ru:
      'Новое: сохраняйте любимых получателей для отправки в одно касание.\n* Закрепляйте номера Alipay или WeChat\n* Добавляйте личное прозвище (например, «Мама», «Поставщик из Иу»)\n* Подсказки на экране перевода\n\nТакже: обновлённые настройки, понятные сообщения об ошибках, ускоренный запуск.',
    uz:
      'Yangi: sevimli oluvchilarni bir bosishda yuborish uchun saqlang.\n* Alipay yoki WeChat raqamlarini biriktiring\n* Shaxsiy laqab qo‘shing (masalan, “Onam”, “Yiwu ta’minotchisi”)\n* Yuborish ekranida aqlli takliflar\n\nShuningdek: yangilangan sozlamalar, tushunarli xato xabarlari, ilovaning tezroq ishga tushishi.',
  },
  v_1_3_5: {
    en:
      'Performance improvements on older devices.\nFixed a rare crash when opening a transfer receipt.',
    ru:
      'Ускорили работу на старых устройствах.\nИсправили редкий сбой при открытии квитанции.',
    uz:
      'Eski qurilmalarda ish unumdorligi oshirildi.\nKvitansiyani ochishdagi noyob xato tuzatildi.',
  },
  v_1_3_4: {
    en:
      'Push notifications for completed transfers now arrive faster.\nMinor bug fixes.',
    ru:
      'Push-уведомления о завершённых переводах приходят быстрее.\nИсправления мелких ошибок.',
    uz:
      'Yakunlangan o‘tkazmalar haqida push-bildirishnomalar tezroq keladi.\nKichik xatolar tuzatildi.',
  },
  v_1_3_3: {
    en:
      'Added Russian as a fully-supported app language.\nFixed Uzbek translations on the support screen.',
    ru:
      'Добавлена полная поддержка русского языка.\nИсправлены переводы на узбекском на экране поддержки.',
    uz:
      'Rus tili to‘liq qo‘llab-quvvatlanadigan til sifatida qo‘shildi.\nYordam ekrandagi o‘zbekcha tarjimalar tuzatildi.',
  },
  v_1_3_2: {
    en: 'Bug fixes and stability improvements.',
    ru: 'Исправления и улучшения стабильности.',
    uz: 'Xato tuzatishlari va barqarorlik yaxshilanishlari.',
  },
  v_1_3_1: {
    en:
      'Card linking is now more reliable on slow networks.\nFixed an issue where the rate countdown could appear stuck.',
    ru:
      'Привязка карт надёжнее работает на медленных сетях.\nИсправлена ошибка зависания таймера курса.',
    uz:
      'Sekin tarmoqlarda karta biriktirish ishonchliroq ishlaydi.\nKurs taymeri qotib qolish xatosi tuzatildi.',
  },
  v_1_3_0: {
    en:
      'New: WeChat Pay support for transfers to mainland China.\nRedesigned send-money flow.\nFaster KYC verification screen.',
    ru:
      'Новое: поддержка WeChat Pay для переводов в материковый Китай.\nОбновлённый процесс отправки.\nБыстрее проходит проверка KYC.',
    uz:
      'Yangi: materik Xitoyga o‘tkazmalar uchun WeChat Pay qo‘llab-quvvatlanadi.\nYangilangan yuborish jarayoni.\nKYC tekshiruvi tezlashtirildi.',
  },
  v_1_2_0: {
    en:
      'Important security update.\nThis release fixes an authentication issue. All users on earlier versions must update before continuing.',
    ru:
      'Важное обновление безопасности.\nВ этой версии устранена ошибка аутентификации. Все пользователи на более ранних версиях должны обновиться, чтобы продолжить пользоваться приложением.',
    uz:
      'Muhim xavfsizlik yangilanishi.\nUshbu versiyada autentifikatsiya xatosi tuzatildi. Eski versiyadagi barcha foydalanuvchilar davom etish uchun yangilanishi kerak.',
  },
};

const _IOS: AppVersion[] = [
  {
    id: 'av_ios_1_4_2',
    platform: 'ios',
    version: '1.4.2',
    forceUpdate: false,
    minSupported: '1.2.0',
    releaseNotesEn: NOTES.v_1_4_2.en,
    releaseNotesRu: NOTES.v_1_4_2.ru,
    releaseNotesUz: NOTES.v_1_4_2.uz,
    releasedAt: daysAgo(5, 14, 30),
    createdBy: ADMIN_SUPER,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'av_ios_1_4_1',
    platform: 'ios',
    version: '1.4.1',
    forceUpdate: false,
    minSupported: '1.2.0',
    releaseNotesEn: NOTES.v_1_4_1.en,
    releaseNotesRu: NOTES.v_1_4_1.ru,
    releaseNotesUz: NOTES.v_1_4_1.uz,
    releasedAt: weeksAgo(3, 11, 0),
    createdBy: ADMIN_SUPER,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'av_ios_1_4_0',
    platform: 'ios',
    version: '1.4.0',
    forceUpdate: false,
    minSupported: '1.2.0',
    releaseNotesEn: NOTES.v_1_4_0.en,
    releaseNotesRu: NOTES.v_1_4_0.ru,
    releaseNotesUz: NOTES.v_1_4_0.uz,
    releasedAt: weeksAgo(6, 10, 0),
    createdBy: ADMIN_SUPER,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'av_ios_1_3_5',
    platform: 'ios',
    version: '1.3.5',
    forceUpdate: false,
    minSupported: '1.2.0',
    releaseNotesEn: NOTES.v_1_3_5.en,
    releaseNotesRu: NOTES.v_1_3_5.ru,
    releaseNotesUz: NOTES.v_1_3_5.uz,
    releasedAt: weeksAgo(9, 14, 0),
    createdBy: ADMIN_SUPER,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'av_ios_1_3_4',
    platform: 'ios',
    version: '1.3.4',
    forceUpdate: false,
    minSupported: '1.2.0',
    releaseNotesEn: NOTES.v_1_3_4.en,
    releaseNotesRu: NOTES.v_1_3_4.ru,
    releaseNotesUz: NOTES.v_1_3_4.uz,
    releasedAt: weeksAgo(12, 9, 30),
    createdBy: ADMIN_SUPER,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'av_ios_1_3_3',
    platform: 'ios',
    version: '1.3.3',
    forceUpdate: false,
    minSupported: '1.2.0',
    releaseNotesEn: NOTES.v_1_3_3.en,
    releaseNotesRu: NOTES.v_1_3_3.ru,
    releaseNotesUz: NOTES.v_1_3_3.uz,
    releasedAt: weeksAgo(15, 16, 0),
    createdBy: ADMIN_FIN,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'av_ios_1_3_2',
    platform: 'ios',
    version: '1.3.2',
    forceUpdate: false,
    minSupported: '1.2.0',
    releaseNotesEn: NOTES.v_1_3_2.en,
    releaseNotesRu: NOTES.v_1_3_2.ru,
    releaseNotesUz: NOTES.v_1_3_2.uz,
    releasedAt: weeksAgo(18, 11, 0),
    createdBy: ADMIN_SUPER,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'av_ios_1_3_1',
    platform: 'ios',
    version: '1.3.1',
    forceUpdate: false,
    minSupported: '1.2.0',
    releaseNotesEn: NOTES.v_1_3_1.en,
    releaseNotesRu: NOTES.v_1_3_1.ru,
    releaseNotesUz: NOTES.v_1_3_1.uz,
    releasedAt: weeksAgo(21, 10, 0),
    createdBy: ADMIN_SUPER,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'av_ios_1_3_0',
    platform: 'ios',
    version: '1.3.0',
    forceUpdate: false,
    minSupported: '1.2.0',
    releaseNotesEn: NOTES.v_1_3_0.en,
    releaseNotesRu: NOTES.v_1_3_0.ru,
    releaseNotesUz: NOTES.v_1_3_0.uz,
    releasedAt: weeksAgo(26, 14, 0),
    createdBy: ADMIN_SUPER,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'av_ios_1_2_0',
    platform: 'ios',
    version: '1.2.0',
    forceUpdate: true,
    minSupported: '1.2.0',
    releaseNotesEn: NOTES.v_1_2_0.en,
    releaseNotesRu: NOTES.v_1_2_0.ru,
    releaseNotesUz: NOTES.v_1_2_0.uz,
    releasedAt: weeksAgo(34, 9, 0),
    createdBy: ADMIN_SUPER,
    lastEditedAt: null,
    lastEditedBy: null,
  },
];

const _ANDROID: AppVersion[] = [
  {
    id: 'av_android_1_4_2',
    platform: 'android',
    version: '1.4.2',
    forceUpdate: false,
    minSupported: '1.2.0',
    releaseNotesEn: NOTES.v_1_4_2.en,
    releaseNotesRu: NOTES.v_1_4_2.ru,
    releaseNotesUz: NOTES.v_1_4_2.uz,
    releasedAt: daysAgo(6, 10, 0),
    createdBy: ADMIN_SUPER,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'av_android_1_4_1',
    platform: 'android',
    version: '1.4.1',
    forceUpdate: false,
    minSupported: '1.2.0',
    releaseNotesEn: NOTES.v_1_4_1.en,
    releaseNotesRu: NOTES.v_1_4_1.ru,
    releaseNotesUz: NOTES.v_1_4_1.uz,
    releasedAt: weeksAgo(3, 13, 0),
    createdBy: ADMIN_SUPER,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'av_android_1_4_0',
    platform: 'android',
    version: '1.4.0',
    forceUpdate: false,
    minSupported: '1.2.0',
    releaseNotesEn: NOTES.v_1_4_0.en,
    releaseNotesRu: NOTES.v_1_4_0.ru,
    releaseNotesUz: NOTES.v_1_4_0.uz,
    releasedAt: weeksAgo(6, 12, 0),
    createdBy: ADMIN_SUPER,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'av_android_1_3_5',
    platform: 'android',
    version: '1.3.5',
    forceUpdate: false,
    minSupported: '1.2.0',
    releaseNotesEn: NOTES.v_1_3_5.en,
    releaseNotesRu: NOTES.v_1_3_5.ru,
    releaseNotesUz: NOTES.v_1_3_5.uz,
    releasedAt: weeksAgo(9, 16, 0),
    createdBy: ADMIN_SUPER,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'av_android_1_3_4',
    platform: 'android',
    version: '1.3.4',
    forceUpdate: false,
    minSupported: '1.2.0',
    releaseNotesEn: NOTES.v_1_3_4.en,
    releaseNotesRu: NOTES.v_1_3_4.ru,
    releaseNotesUz: NOTES.v_1_3_4.uz,
    releasedAt: weeksAgo(12, 11, 30),
    createdBy: ADMIN_SUPER,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'av_android_1_3_3',
    platform: 'android',
    version: '1.3.3',
    forceUpdate: false,
    minSupported: '1.2.0',
    releaseNotesEn: NOTES.v_1_3_3.en,
    releaseNotesRu: NOTES.v_1_3_3.ru,
    releaseNotesUz: NOTES.v_1_3_3.uz,
    releasedAt: weeksAgo(15, 14, 0),
    createdBy: ADMIN_FIN,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'av_android_1_3_2',
    platform: 'android',
    version: '1.3.2',
    forceUpdate: false,
    minSupported: '1.2.0',
    releaseNotesEn: NOTES.v_1_3_2.en,
    releaseNotesRu: NOTES.v_1_3_2.ru,
    releaseNotesUz: NOTES.v_1_3_2.uz,
    releasedAt: weeksAgo(18, 9, 0),
    createdBy: ADMIN_SUPER,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'av_android_1_3_0',
    platform: 'android',
    version: '1.3.0',
    forceUpdate: false,
    minSupported: '1.2.0',
    releaseNotesEn: NOTES.v_1_3_0.en,
    releaseNotesRu: NOTES.v_1_3_0.ru,
    releaseNotesUz: NOTES.v_1_3_0.uz,
    releasedAt: weeksAgo(24, 12, 0),
    createdBy: ADMIN_SUPER,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'av_android_1_2_0',
    platform: 'android',
    version: '1.2.0',
    forceUpdate: true,
    minSupported: '1.2.0',
    releaseNotesEn: NOTES.v_1_2_0.en,
    releaseNotesRu: NOTES.v_1_2_0.ru,
    releaseNotesUz: NOTES.v_1_2_0.uz,
    releasedAt: weeksAgo(34, 11, 0),
    createdBy: ADMIN_SUPER,
    lastEditedAt: null,
    lastEditedBy: null,
  },
];

let liveVersions: AppVersion[] = [..._IOS, ..._ANDROID];

// =====================================================================
// Public read API
// =====================================================================

/** All versions for a platform, newest first (`released_at DESC`). */
export function listAppVersions(platform: Platform): AppVersion[] {
  return liveVersions
    .filter((v) => v.platform === platform)
    .slice()
    .sort((a, b) => b.releasedAt.getTime() - a.releasedAt.getTime());
}

export function getAppVersionById(id: string): AppVersion | undefined {
  return liveVersions.find((v) => v.id === id);
}

/** Active = latest by `released_at DESC` per platform. */
export function getLatestAppVersion(platform: Platform): AppVersion | undefined {
  return listAppVersions(platform)[0];
}

export function getCounts(): Record<Platform, number> {
  let ios = 0;
  let android = 0;
  for (const v of liveVersions) {
    if (v.platform === 'ios') ios++;
    else if (v.platform === 'android') android++;
  }
  return { ios, android };
}

// =====================================================================
// Validation helpers
// =====================================================================

const SEMVER_RE = /^\d+\.\d+\.\d+$/;

export function isValidSemver(v: string): boolean {
  return SEMVER_RE.test(v.trim());
}

/** Compare two semver strings numerically. Returns -1 / 0 / 1. */
export function compareSemver(a: string, b: string): -1 | 0 | 1 {
  const [a1, a2, a3] = a.split('.').map((n) => Number(n));
  const [b1, b2, b3] = b.split('.').map((n) => Number(n));
  if (a1 !== b1) return a1 < b1 ? -1 : 1;
  if (a2 !== b2) return a2 < b2 ? -1 : 1;
  if (a3 !== b3) return a3 < b3 ? -1 : 1;
  return 0;
}

export function findDuplicate(platform: Platform, version: string): AppVersion | undefined {
  return liveVersions.find((v) => v.platform === platform && v.version === version);
}

// =====================================================================
// Audit log — append-only
// =====================================================================

export type AppVersionAuditAction = 'add' | 'edit';

export interface AppVersionAuditEntry {
  id: string;
  versionId: string;
  platform: Platform;
  version: string;
  action: AppVersionAuditAction;
  actorId: string;
  actorName: string;
  /** Reason note — required for `edit`, omitted for `add`. */
  reason?: string;
  /** Snapshot of the value at the time of the action (add: full row; edit: post-image). */
  snapshot: {
    forceUpdate: boolean;
    minSupported: string | null;
    releasedAt: Date;
  };
  /** Per-field previous values for `edit` rows. Populated only for changed fields. */
  previous?: Partial<{
    forceUpdate: boolean;
    minSupported: string | null;
    releasedAt: Date;
    releaseNotesUz: string;
    releaseNotesRu: string;
    releaseNotesEn: string;
  }>;
  createdAt: Date;
}

const versionAudit: AppVersionAuditEntry[] = [];
let versionAuditSeq = 1;

function appendAudit(
  entry: Omit<AppVersionAuditEntry, 'id' | 'createdAt'>,
): AppVersionAuditEntry {
  const e: AppVersionAuditEntry = {
    ...entry,
    id: `avaud_${String(versionAuditSeq++).padStart(4, '0')}`,
    createdAt: new Date(),
  };
  versionAudit.push(e);
  return e;
}

/** Bridge for the central audit-log surface — full module store, newest first. */
export function listAppVersionsAudit(): AppVersionAuditEntry[] {
  return versionAudit.slice().reverse();
}

// =====================================================================
// Mutators
// =====================================================================

export interface AppVersionActor {
  id: string;
  name: string;
}

export type AddAppVersionResult =
  | { ok: true; entry: AppVersion }
  | { ok: false; error: 'invalid_version' | 'invalid_min_supported' | 'duplicate' | 'missing_notes' };

export interface AddAppVersionInput {
  platform: Platform;
  version: string;
  forceUpdate: boolean;
  minSupported: string | null;
  releaseNotesUz: string;
  releaseNotesRu: string;
  releaseNotesEn: string;
  releasedAt: Date;
  actor: AppVersionActor;
}

/**
 * Add a new app version. Validates uniqueness + semver + min-supported
 * relationship. On success appends the new row + emits a single audit-log
 * row.
 */
export function addAppVersion(input: AddAppVersionInput): AddAppVersionResult {
  if (!isValidSemver(input.version)) return { ok: false, error: 'invalid_version' };
  if (
    input.minSupported !== null &&
    input.minSupported.trim() !== '' &&
    (!isValidSemver(input.minSupported) || compareSemver(input.minSupported, input.version) === 1)
  ) {
    return { ok: false, error: 'invalid_min_supported' };
  }
  if (findDuplicate(input.platform, input.version)) {
    return { ok: false, error: 'duplicate' };
  }
  if (
    input.releaseNotesUz.trim() === '' ||
    input.releaseNotesRu.trim() === '' ||
    input.releaseNotesEn.trim() === ''
  ) {
    return { ok: false, error: 'missing_notes' };
  }

  const minSupported =
    input.minSupported && input.minSupported.trim() !== '' ? input.minSupported.trim() : null;

  const entry: AppVersion = {
    id: `av_${input.platform}_${input.version.replace(/\./g, '_')}`,
    platform: input.platform,
    version: input.version,
    forceUpdate: input.forceUpdate,
    minSupported,
    releaseNotesUz: input.releaseNotesUz.trim(),
    releaseNotesRu: input.releaseNotesRu.trim(),
    releaseNotesEn: input.releaseNotesEn.trim(),
    releasedAt: input.releasedAt,
    createdBy: input.actor.id,
    lastEditedAt: null,
    lastEditedBy: null,
  };
  liveVersions = [...liveVersions, entry];

  appendAudit({
    versionId: entry.id,
    platform: entry.platform,
    version: entry.version,
    action: 'add',
    actorId: input.actor.id,
    actorName: input.actor.name,
    snapshot: {
      forceUpdate: entry.forceUpdate,
      minSupported: entry.minSupported,
      releasedAt: entry.releasedAt,
    },
  });

  return { ok: true, entry };
}

export type EditAppVersionResult =
  | { ok: true; entry: AppVersion }
  | { ok: false; error: 'not_found' | 'invalid_min_supported' | 'missing_notes' | 'missing_reason' };

export interface EditAppVersionInput {
  id: string;
  forceUpdate: boolean;
  minSupported: string | null;
  releaseNotesUz: string;
  releaseNotesRu: string;
  releaseNotesEn: string;
  releasedAt: Date;
  /** Reason for the edit — required, ≥ 20 chars (enforced here to keep parity). */
  reason: string;
  actor: AppVersionActor;
}

/**
 * Edit an existing app version. Platform + version cannot change (they're
 * identifying). Records the previous values per-field on the audit row for
 * surfacing in the central log.
 */
export function editAppVersion(input: EditAppVersionInput): EditAppVersionResult {
  const idx = liveVersions.findIndex((v) => v.id === input.id);
  if (idx === -1) return { ok: false, error: 'not_found' };
  const existing = liveVersions[idx];

  if (
    input.minSupported !== null &&
    input.minSupported.trim() !== '' &&
    (!isValidSemver(input.minSupported) ||
      compareSemver(input.minSupported, existing.version) === 1)
  ) {
    return { ok: false, error: 'invalid_min_supported' };
  }
  if (
    input.releaseNotesUz.trim() === '' ||
    input.releaseNotesRu.trim() === '' ||
    input.releaseNotesEn.trim() === ''
  ) {
    return { ok: false, error: 'missing_notes' };
  }
  if (input.reason.trim().length < 20) {
    return { ok: false, error: 'missing_reason' };
  }

  const minSupported =
    input.minSupported && input.minSupported.trim() !== '' ? input.minSupported.trim() : null;

  const previous: AppVersionAuditEntry['previous'] = {};
  if (existing.forceUpdate !== input.forceUpdate) previous.forceUpdate = existing.forceUpdate;
  if (existing.minSupported !== minSupported) previous.minSupported = existing.minSupported;
  if (existing.releasedAt.getTime() !== input.releasedAt.getTime()) {
    previous.releasedAt = existing.releasedAt;
  }
  if (existing.releaseNotesUz !== input.releaseNotesUz.trim()) {
    previous.releaseNotesUz = existing.releaseNotesUz;
  }
  if (existing.releaseNotesRu !== input.releaseNotesRu.trim()) {
    previous.releaseNotesRu = existing.releaseNotesRu;
  }
  if (existing.releaseNotesEn !== input.releaseNotesEn.trim()) {
    previous.releaseNotesEn = existing.releaseNotesEn;
  }

  const updated: AppVersion = {
    ...existing,
    forceUpdate: input.forceUpdate,
    minSupported,
    releaseNotesUz: input.releaseNotesUz.trim(),
    releaseNotesRu: input.releaseNotesRu.trim(),
    releaseNotesEn: input.releaseNotesEn.trim(),
    releasedAt: input.releasedAt,
    lastEditedAt: new Date(),
    lastEditedBy: input.actor.id,
  };
  liveVersions = [
    ...liveVersions.slice(0, idx),
    updated,
    ...liveVersions.slice(idx + 1),
  ];

  appendAudit({
    versionId: updated.id,
    platform: updated.platform,
    version: updated.version,
    action: 'edit',
    actorId: input.actor.id,
    actorName: input.actor.name,
    reason: input.reason.trim(),
    snapshot: {
      forceUpdate: updated.forceUpdate,
      minSupported: updated.minSupported,
      releasedAt: updated.releasedAt,
    },
    previous,
  });

  return { ok: true, entry: updated };
}
