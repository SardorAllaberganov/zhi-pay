/**
 * Admin auth mock dataset — single source of truth for the
 * `/sign-in` surface.
 *
 * Schema (`docs/models.md` §10):
 *   admin_users         — pre-provisioned accounts (no self-signup)
 *   admin_sessions      — created on successful sign-in, tracked
 *                         client-side in sessionStorage for the prototype
 *   admin_login_audit   — append-only forensic trail (every signin
 *                         attempt — successful or failed — produces one row)
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
 *   2. **Audit isolation.** Sign-in events write to `mockAdminLoginAudit`
 *      (this module) and intentionally do NOT bridge into
 *      `mockAuditLog` — the central audit log is reserved for entity-
 *      state-change events (transfers, KYC, AML, cards, FX, services,
 *      content). Mixing high-volume auth events into that stream would
 *      drown out the signal compliance reviewers are scanning for.
 *      Auth forensics live here.
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
  | 'signout';

export type AdminAuthFailureCode =
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_RATE_LIMITED'
  | 'AUTH_ACCOUNT_DISABLED'
  | 'AUTH_NETWORK'
  | 'AUTH_SERVER_ERROR';

export interface AdminUser {
  id: string;
  email: string;
  /** Mock plaintext — real backend stores `password_hash`. */
  expectedPassword: string;
  displayName: string;
  role: AdminRole;
  accountStatus: AdminAccountStatus;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  lastSignedInAt: Date | null;
  preferredLanguage: 'uz' | 'ru' | 'en';
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

// =====================================================================
// Demo admin pool
// =====================================================================

/**
 * Shared demo password — every mock admin account accepts this. Real
 * backend would never have a shared credential; the prototype trades
 * that for fast, predictable design probing.
 *
 * Documented in plain text intentionally so the design reviewer can
 * sign in. There is no production deploy of this file.
 */
export const DEMO_PASSWORD = 'zhipay-demo-2026';

const NOW = new Date('2026-05-03T10:30:00Z');

function daysAgo(d: number): Date {
  return new Date(NOW.getTime() - d * 24 * 60 * 60 * 1000);
}

const SEED_USERS: AdminUser[] = [
  {
    id: 'admin_super_01',
    email: 'super.admin@zhipay.uz',
    expectedPassword: DEMO_PASSWORD,
    displayName: 'Yulduz Otaboeva',
    role: 'super_admin',
    accountStatus: 'active',
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastSignedInAt: daysAgo(0),
    preferredLanguage: 'uz',
    createdAt: daysAgo(180),
    disabledAt: null,
    disabledReason: null,
  },
  {
    id: 'admin_disabled_01',
    email: 'disabled.admin@zhipay.uz',
    expectedPassword: DEMO_PASSWORD,
    displayName: 'Adel Ortiqova',
    role: 'finance',
    accountStatus: 'disabled',
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastSignedInAt: daysAgo(45),
    preferredLanguage: 'ru',
    createdAt: daysAgo(300),
    disabledAt: daysAgo(30),
    disabledReason: 'Role no longer required after team restructure.',
  },
];

// =====================================================================
// Live store — mutable copy so the mock can record state across a
// session (failed-attempts counter, locked_until).
// =====================================================================

const USERS: AdminUser[] = SEED_USERS.map((u) => ({ ...u }));

export const mockAdminLoginAudit: AdminLoginAuditEntry[] = [];

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

// =====================================================================
// Mutation helpers
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
