/**
 * Admin auth mock dataset — single source of truth for the
 * `/sign-in` and `/settings` surfaces.
 *
 * Schema (`docs/models.md` §10):
 *   admin_users         — pre-provisioned accounts (no self-signup)
 *   admin_sessions      — created on successful sign-in; one row per
 *                         (admin × device). Surfaced in /settings Sessions
 *   admin_login_audit   — append-only forensic trail (every signin
 *                         attempt — successful or failed — produces one row;
 *                         /settings profile / password / session-revoke
 *                         actions also write here per §10.9)
 *
 * Admin auth is email + password only. No 2FA / OTP / TOTP — those belong
 * to the mobile end-user surface (phone OTP under the MyID flow).
 *
 * Mock simplifications versus real backend:
 *
 *   1. **Password "hashes"** are stored as `expectedPassword` plaintext.
 *      Real backend uses argon2id / bcrypt cost ≥ 12. The verifier in
 *      `lib/auth.ts` does a string compare; the schema field is named
 *      `password_hash` to keep the model contract intact.
 *
 *   2. **Audit isolation.** Sign-in events AND /settings profile / password /
 *      session events write to `mockAdminLoginAudit` (this module) and
 *      intentionally do NOT bridge into `mockAuditLog` — the central audit
 *      log is reserved for entity-state-change events (transfers, KYC,
 *      AML, cards, FX, services, content). Mixing high-volume auth events
 *      into that stream would drown out the signal compliance reviewers
 *      are scanning for. Auth + identity forensics live here.
 *
 *   3. **Sessions store.** `mockAdminSessions` holds one row per
 *      (admin × device) with revocation state. The in-tab `ActiveSession`
 *      in `lib/auth.ts` carries the corresponding session id so the
 *      Sessions tab can tell "this device" apart from other rows.
 *
 * Per LESSON 2026-04-30: zero Visa / Mastercard mentions anywhere — auth
 * surface doesn't touch card schemes.
 */

// =====================================================================
// Public types — mirror models.md §10
// =====================================================================

export type AdminRole = 'super_admin' | 'ops' | 'compliance' | 'finance' | 'engineering';

export type AdminAccountStatus = 'active' | 'disabled' | 'pending';

export type AdminLoginEventType =
  | 'signin_success'
  | 'signin_failed_credentials'
  | 'signin_rate_limited'
  | 'signin_account_disabled'
  | 'session_expired'
  | 'signout'
  // §10.9 — /settings audit verbs
  | 'profile_changed'
  | 'password_changed'
  | 'session_revoked'
  | 'session_revoked_all';

export type AdminAuthFailureCode =
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_RATE_LIMITED'
  | 'AUTH_ACCOUNT_DISABLED'
  | 'AUTH_NETWORK'
  | 'AUTH_SERVER_ERROR';

/**
 * §10.8 — `admin_users.preferences` jsonb shape. Cosmetic / locale /
 * notification-subscription preferences edited from /settings Preferences
 * tab. Theme + density + tabular-numerals apply live (no save). Date /
 * time / timezone are persisted but full rollout to date-formatting
 * helpers across the app is staged. Notification subscriptions document
 * intent only — actual delivery wiring is out-of-scope for v1.
 */
export type AdminTheme = 'light' | 'dark' | 'system';
export type AdminDensity = 'compact' | 'comfortable';
export type AdminLanguage = 'uz' | 'ru' | 'en';
export type AdminDateFormat = 'iso' | 'eu' | 'us';
export type AdminTimeFormat = '12h' | '24h';

export interface AdminNotificationSubscriptions {
  aml_critical: boolean;
  sanctions_hit: boolean;
  service_offline: boolean;
  fx_stale: boolean;
  daily_digest: boolean;
  failed_signin: boolean;
}

export interface AdminPreferences {
  theme: AdminTheme;
  density: AdminDensity;
  language: AdminLanguage;
  timezone: string;
  date_format: AdminDateFormat;
  time_format: AdminTimeFormat;
  tabular_numerals: boolean;
  notification_subscriptions: AdminNotificationSubscriptions;
}

export interface AdminUser {
  id: string;
  email: string;
  /** Mock plaintext — real backend stores `password_hash`. */
  expectedPassword: string;
  displayName: string;
  /** Optional emergency contact — never used for auth. */
  phone: string | null;
  role: AdminRole;
  accountStatus: AdminAccountStatus;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  lastSignedInAt: Date | null;
  /** Drives the >90d staleness warning in /settings Security. */
  lastPasswordChangedAt: Date | null;
  /** Out-of-band recovery channel — read-only in /settings v1. */
  recoveryContact: string | null;
  preferredLanguage: AdminLanguage;
  preferences: AdminPreferences;
  createdAt: Date;
  disabledAt: Date | null;
  disabledReason: string | null;
}

export interface AdminLoginAuditEntry {
  id: string;
  emailAttempted: string;
  adminUserId: string | null;
  eventType: AdminLoginEventType;
  failureCode: AdminAuthFailureCode | null;
  ipAddress: string;
  userAgent: string;
  context: Record<string, unknown>;
  createdAt: Date;
}

/**
 * §10.3 — admin_sessions row. Multi-device session tracking surfaced in
 * /settings Sessions tab. The current in-tab session's id is held in
 * `lib/auth.ts`'s `ActiveSession.id` so the page can mark the right row
 * as "This device".
 */
export interface AdminSession {
  id: string;
  adminUserId: string;
  createdAt: Date;
  lastSeenAt: Date;
  expiresAt: Date;
  /** Set on revoke (per-row or revoke-all-others) or password rotation. */
  revokedAt: Date | null;
  ipAddress: string;
  userAgent: string;
  /** Parsed UA — surfaces in the Sessions row for quick scanning. */
  device: 'laptop' | 'phone' | 'tablet';
  browser: string;
  os: string;
  /** Approximate geo from ip (city-level only). */
  geoCity: string | null;
}

// =====================================================================
// Demo admin pool
// =====================================================================

/**
 * Shared demo password — every mock admin account accepts this. Real
 * backend would never have a shared credential; the prototype trades
 * that for fast, predictable design probing.
 */
export const DEMO_PASSWORD = 'zhipay-demo-2026';

const NOW = new Date('2026-05-03T10:30:00Z');

function daysAgo(d: number): Date {
  return new Date(NOW.getTime() - d * 24 * 60 * 60 * 1000);
}

function hoursAgo(h: number): Date {
  return new Date(NOW.getTime() - h * 60 * 60 * 1000);
}

/**
 * Default preferences applied to every newly-provisioned admin. Editable
 * per-user via /settings Preferences tab.
 */
const DEFAULT_PREFERENCES: AdminPreferences = {
  theme: 'system',
  density: 'compact',
  language: 'en',
  timezone: 'Asia/Tashkent',
  date_format: 'eu',
  time_format: '24h',
  tabular_numerals: true,
  notification_subscriptions: {
    aml_critical: true,
    sanctions_hit: true,
    service_offline: true,
    fx_stale: true,
    daily_digest: false,
    failed_signin: true,
  },
};

const SEED_USERS: AdminUser[] = [
  {
    id: 'admin_super_01',
    email: 'sardor@zhipay.uz',
    expectedPassword: DEMO_PASSWORD,
    // Demo super-admin profile — Phase 21 /settings sample data.
    displayName: 'Sardor Tursunov',
    phone: '+998 90 123 45 67',
    role: 'super_admin',
    accountStatus: 'active',
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastSignedInAt: hoursAgo(2),
    lastPasswordChangedAt: daysAgo(47),
    recoveryContact: 'operator@anthropic.com',
    preferredLanguage: 'en',
    preferences: { ...DEFAULT_PREFERENCES, language: 'en' },
    // ~8 months ago.
    createdAt: daysAgo(240),
    disabledAt: null,
    disabledReason: null,
  },
  {
    id: 'admin_disabled_01',
    email: 'disabled.admin@zhipay.uz',
    expectedPassword: DEMO_PASSWORD,
    displayName: 'Adel Ortiqova',
    phone: null,
    role: 'finance',
    accountStatus: 'disabled',
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastSignedInAt: daysAgo(45),
    lastPasswordChangedAt: daysAgo(120),
    recoveryContact: null,
    preferredLanguage: 'ru',
    preferences: { ...DEFAULT_PREFERENCES, language: 'ru', date_format: 'eu', time_format: '24h' },
    createdAt: daysAgo(300),
    disabledAt: daysAgo(30),
    disabledReason: 'Role no longer required after team restructure.',
  },
];

// =====================================================================
// Live store — mutable copies so the mock can record state across a
// session (failed-attempts counter, locked_until, profile edits,
// password rotations, preferences updates).
// =====================================================================

const USERS: AdminUser[] = SEED_USERS.map((u) => ({
  ...u,
  preferences: { ...u.preferences, notification_subscriptions: { ...u.preferences.notification_subscriptions } },
}));

export const mockAdminLoginAudit: AdminLoginAuditEntry[] = [];

/**
 * §10.3 — admin_sessions live store. Two seed sessions for the demo
 * super-admin (Sardor):
 *   - The current Chrome / macOS / Tashkent session for *this* tab is
 *     inserted on sign-in by `lib/auth.ts`, NOT seeded here (so it
 *     reflects the actual UA and gets matched by id).
 *   - One historical iOS-app session signed-in 2 days ago that's still
 *     active — proves the multi-device list end-to-end without depending
 *     on the user actually owning a second device.
 */
export const mockAdminSessions: AdminSession[] = [
  {
    id: 'sess_seed_ios_01',
    adminUserId: 'admin_super_01',
    createdAt: daysAgo(2),
    lastSeenAt: daysAgo(1),
    expiresAt: new Date(NOW.getTime() + 10 * 60 * 60 * 1000),
    revokedAt: null,
    ipAddress: '95.214.10.42',
    userAgent: 'ZhiPay-Admin-iOS/1.0.2 (iPhone; iOS 17.4)',
    device: 'phone',
    browser: 'ZhiPay Admin app',
    os: 'iOS 17',
    geoCity: 'Tashkent',
  },
];

/**
 * §10.4 — last 30 deterministic sign-in attempts surfaced in the
 * /settings Sessions tab → "Sign-in history" collapsible. Mostly
 * successful logins; a couple failed credential attempts mid-stream
 * representing a genuine fat-finger episode.
 */
export const mockAdminSignInHistory: AdminLoginAuditEntry[] = (() => {
  const rows: AdminLoginAuditEntry[] = [];
  let id = 0;
  const next = () => `ala_seed_${String(++id).padStart(3, '0')}`;
  const ALA: Omit<AdminLoginAuditEntry, 'id' | 'createdAt' | 'eventType' | 'failureCode' | 'context'> = {
    emailAttempted: 'sardor@zhipay.uz',
    adminUserId: 'admin_super_01',
    ipAddress: '95.214.10.42',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Chrome/132.0 Safari/605.1.15',
  };
  // Spread 30 entries across the last 14 days — 1-3 sign-ins per day.
  const dayPattern: number[] = [
    14, 13, 13, 12, 12, 11, 10, 10, 9, 9, 8, 8, 7, 7, 7, 6, 5, 5, 4, 4, 3, 3, 3, 2, 2, 1, 1, 0, 0, 0,
  ];
  dayPattern.forEach((d, idx) => {
    // Two failed attempts on day 7 — a fat-finger story
    const isFailed = idx === 14 || idx === 15;
    const hour = (idx * 7) % 12 + 8; // pseudo-spread across business hours
    const t = new Date(NOW.getTime() - d * 24 * 60 * 60 * 1000 - (12 - hour) * 60 * 60 * 1000);
    rows.push({
      ...ALA,
      id: next(),
      eventType: isFailed ? 'signin_failed_credentials' : 'signin_success',
      failureCode: isFailed ? 'AUTH_INVALID_CREDENTIALS' : null,
      context: isFailed ? { attemptsInWindow: idx === 14 ? 1 : 2 } : {},
      createdAt: t,
    });
  });
  return rows;
})();

// =====================================================================
// Query helpers
// =====================================================================

export function findAdminByEmail(email: string): AdminUser | null {
  const normalized = email.trim().toLowerCase();
  return USERS.find((u) => u.email.toLowerCase() === normalized) ?? null;
}

export function getAdminById(id: string): AdminUser | null {
  return USERS.find((u) => u.id === id) ?? null;
}

export function getDemoSuperAdminEmail(): string {
  return SEED_USERS[0].email;
}

// =====================================================================
// Mutation helpers — sign-in flow
// =====================================================================

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 min
const RATE_LIMIT_THRESHOLD = 5;

export function recordFailedAttempt(user: AdminUser): void {
  user.failedLoginAttempts += 1;
  if (user.failedLoginAttempts >= RATE_LIMIT_THRESHOLD) {
    user.lockedUntil = new Date(Date.now() + RATE_LIMIT_WINDOW_MS);
  }
}

export function clearFailedAttempts(user: AdminUser): void {
  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  user.lastSignedInAt = new Date();
}

export function isLocked(user: AdminUser): boolean {
  return user.lockedUntil !== null && user.lockedUntil.getTime() > Date.now();
}

// =====================================================================
// Mutation helpers — /settings (Phase 21)
// =====================================================================

export interface ProfileUpdatePatch {
  displayName?: string;
  phone?: string | null;
}

/**
 * Apply a profile patch and return the {previous, next} fields touched
 * so the caller can stash them in the audit row's `context.previous`.
 */
export function applyProfilePatch(
  adminId: string,
  patch: ProfileUpdatePatch,
): { previous: ProfileUpdatePatch; changed: (keyof ProfileUpdatePatch)[] } {
  const user = getAdminById(adminId);
  if (!user) throw new Error(`admin ${adminId} not found`);
  const previous: ProfileUpdatePatch = {};
  const changed: (keyof ProfileUpdatePatch)[] = [];
  if (patch.displayName !== undefined && patch.displayName !== user.displayName) {
    previous.displayName = user.displayName;
    user.displayName = patch.displayName;
    changed.push('displayName');
  }
  if (patch.phone !== undefined && patch.phone !== user.phone) {
    previous.phone = user.phone;
    user.phone = patch.phone;
    changed.push('phone');
  }
  return { previous, changed };
}

/**
 * Rotate the admin's password. Returns the count of OTHER active
 * sessions that were revoked as a side-effect (used for the audit row's
 * `context.signed_out_other_sessions`).
 */
export function rotatePassword(
  adminId: string,
  currentPassword: string,
  nextPassword: string,
  currentSessionId: string | null,
): { ok: true; revokedOthers: number } | { ok: false; reason: 'wrong_current' | 'invalid_new' } {
  const user = getAdminById(adminId);
  if (!user) throw new Error(`admin ${adminId} not found`);
  if (currentPassword !== user.expectedPassword) {
    return { ok: false, reason: 'wrong_current' };
  }
  if (!isPasswordStrong(nextPassword)) {
    return { ok: false, reason: 'invalid_new' };
  }
  user.expectedPassword = nextPassword;
  user.lastPasswordChangedAt = new Date();
  // Side-effect: revoke every OTHER active session for this admin.
  let revokedOthers = 0;
  for (const s of mockAdminSessions) {
    if (s.adminUserId !== adminId) continue;
    if (s.revokedAt !== null) continue;
    if (s.id === currentSessionId) continue;
    s.revokedAt = new Date();
    revokedOthers += 1;
  }
  return { ok: true, revokedOthers };
}

/**
 * Apply a preferences patch (partial merge — top-level + nested
 * notification_subscriptions). Cosmetic; no audit row.
 */
export function applyPreferencesPatch(
  adminId: string,
  patch: Partial<AdminPreferences> & {
    notification_subscriptions?: Partial<AdminNotificationSubscriptions>;
  },
): AdminPreferences {
  const user = getAdminById(adminId);
  if (!user) throw new Error(`admin ${adminId} not found`);
  const next: AdminPreferences = {
    ...user.preferences,
    ...patch,
    notification_subscriptions: {
      ...user.preferences.notification_subscriptions,
      ...(patch.notification_subscriptions ?? {}),
    },
  };
  user.preferences = next;
  // Keep the top-level preferred_language column in sync with prefs.language.
  if (patch.language && patch.language !== user.preferredLanguage) {
    user.preferredLanguage = patch.language;
  }
  return { ...next, notification_subscriptions: { ...next.notification_subscriptions } };
}

// =====================================================================
// Sessions store — mutators surfaced by /settings Sessions tab
// =====================================================================

export function insertAdminSession(row: Omit<AdminSession, 'revokedAt'>): AdminSession {
  // Idempotent — re-inserting the same id (e.g. after a page refresh
  // resets the module-level `mockAdminSessions` array but the in-tab
  // sessionStorage still carries the same session) updates the existing
  // row in place rather than pushing a duplicate.
  const existing = mockAdminSessions.find((s) => s.id === row.id);
  if (existing) {
    existing.lastSeenAt = row.lastSeenAt;
    existing.expiresAt = row.expiresAt;
    existing.userAgent = row.userAgent;
    existing.device = row.device;
    existing.browser = row.browser;
    existing.os = row.os;
    existing.geoCity = row.geoCity;
    existing.revokedAt = null;
    return existing;
  }
  const full: AdminSession = { ...row, revokedAt: null };
  mockAdminSessions.push(full);
  return full;
}

export function listMyActiveSessions(adminId: string): AdminSession[] {
  const now = Date.now();
  return mockAdminSessions
    .filter((s) => s.adminUserId === adminId)
    .filter((s) => s.revokedAt === null)
    .filter((s) => s.expiresAt.getTime() > now)
    .slice()
    .sort((a, b) => b.lastSeenAt.getTime() - a.lastSeenAt.getTime());
}

export function revokeAdminSession(sessionId: string): AdminSession | null {
  const s = mockAdminSessions.find((x) => x.id === sessionId);
  if (!s || s.revokedAt !== null) return null;
  s.revokedAt = new Date();
  return s;
}

export function revokeAllOtherSessions(adminId: string, exceptSessionId: string): number {
  let n = 0;
  for (const s of mockAdminSessions) {
    if (s.adminUserId !== adminId) continue;
    if (s.id === exceptSessionId) continue;
    if (s.revokedAt !== null) continue;
    s.revokedAt = new Date();
    n += 1;
  }
  return n;
}

export function bumpAdminSessionActivity(sessionId: string): void {
  const s = mockAdminSessions.find((x) => x.id === sessionId);
  if (!s || s.revokedAt !== null) return;
  s.lastSeenAt = new Date();
}

// =====================================================================
// Audit recording
// =====================================================================

export function recordLoginAudit(entry: Omit<AdminLoginAuditEntry, 'id' | 'createdAt'>): AdminLoginAuditEntry {
  const row: AdminLoginAuditEntry = {
    ...entry,
    id: `ala_${mockAdminLoginAudit.length + 1}_${Date.now().toString(36)}`,
    createdAt: new Date(),
  };
  mockAdminLoginAudit.push(row);
  return row;
}

// =====================================================================
// Password strength — kept in this module so it stays close to the
// rotate mutator and the /settings ChangePasswordModal consumer.
// =====================================================================

export interface PasswordStrengthCheck {
  rules: {
    length: boolean; // ≥12 chars
    mixedCase: boolean;
    number: boolean;
    symbol: boolean;
  };
  score: 0 | 1 | 2 | 3 | 4;
  ok: boolean;
}

export function checkPasswordStrength(pw: string): PasswordStrengthCheck {
  const length = pw.length >= 12;
  const mixedCase = /[a-z]/.test(pw) && /[A-Z]/.test(pw);
  const number = /[0-9]/.test(pw);
  const symbol = /[^A-Za-z0-9]/.test(pw);
  const score = (length ? 1 : 0) + (mixedCase ? 1 : 0) + (number ? 1 : 0) + (symbol ? 1 : 0);
  return {
    rules: { length, mixedCase, number, symbol },
    score: score as 0 | 1 | 2 | 3 | 4,
    ok: length && mixedCase && number && symbol,
  };
}

function isPasswordStrong(pw: string): boolean {
  return checkPasswordStrength(pw).ok;
}
