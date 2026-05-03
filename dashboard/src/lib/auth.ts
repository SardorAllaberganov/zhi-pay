/**
 * Mock admin auth orchestrator.
 *
 * Wraps `data/mockAdminAuth.ts` (the data layer — schema-aligned record
 * store + audit trail) with the surface-facing API the `/sign-in`,
 * `/settings`, and `<AuthGuard>` consumers use:
 *
 *   /sign-in:
 *     - `signIn(email, password)`      → email + password verification
 *     - `signOut({ reason })`          → from TopBar / forced revocation
 *
 *   <AuthGuard>:
 *     - `getSession()` + `useSession()` → AuthGuard subscriber
 *     - `markActivity()`               → bumps `last_seen_at`; resets idle
 *     - `useIdleTimeout()`             → React hook returning 'active' | 'idle'
 *
 *   /settings (Phase 21):
 *     - `updateMyProfile({ displayName, phone, reason })`
 *     - `changeMyPassword({ current, next })`
 *     - `useMyActiveSessions()` + `revokeMySession(id)` + `revokeMyOtherSessions()`
 *     - `useMySignInHistory(limit)`
 *
 * Admin auth is email + password only — there is no 2FA / OTP step on
 * the admin surface. (TOTP / SMS-OTP belongs to the mobile end-user
 * flow, which is a separate phase.)
 *
 * Session state lives in `sessionStorage` so refresh doesn't kick the
 * user back to /sign-in. Real backend would use an HttpOnly cookie + a
 * server-side session row. Each in-tab session carries an `id` matching
 * a row in `mockAdminSessions` so the /settings Sessions tab can mark
 * the right row as "This device".
 *
 * `useSyncExternalStore` contract per LESSON 2026-05-03: the parsed
 * session is held in a module-level `currentSession` variable; reads
 * are reference-stable; writes go through `writeSession()` which
 * mutates the variable + storage + notifies in one place.
 */

import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  applyProfilePatch,
  bumpAdminSessionActivity,
  clearFailedAttempts,
  findAdminByEmail,
  getAdminById,
  insertAdminSession,
  isLocked,
  listMyActiveSessions,
  mockAdminSignInHistory,
  recordFailedAttempt,
  recordLoginAudit,
  revokeAdminSession,
  revokeAllOtherSessions,
  rotatePassword,
  type AdminAuthFailureCode,
  type AdminLoginAuditEntry,
  type AdminSession,
  type AdminUser,
} from '@/data/mockAdminAuth';

// =====================================================================
// Public types
// =====================================================================

export interface AdminProfile {
  id: string;
  email: string;
  displayName: string;
  phone: string | null;
  role: AdminUser['role'];
  preferredLanguage: AdminUser['preferredLanguage'];
  createdAt: Date;
  lastPasswordChangedAt: Date | null;
  recoveryContact: string | null;
}

export interface ActiveSession {
  state: 'authenticated';
  /** matches `mockAdminSessions.id` so /settings can highlight current row. */
  id: string;
  profile: AdminProfile;
  /** ms since epoch — bumped on every `markActivity()`. */
  lastSeenAt: number;
  /** Absolute expiry (12h after creation by default). */
  expiresAt: number;
  ipAddress: string;
  userAgent: string;
}

export type AuthSignInResult =
  | { ok: true }
  | { ok: false; failureCode: AdminAuthFailureCode };

// =====================================================================
// Constants
// =====================================================================

const SESSION_STORAGE_KEY = 'zhipay-admin-session';

/**
 * Default 12h absolute lifetime for an admin session — see
 * `docs/mermaid_schemas/admin_session_state_machine.md` §
 * Configuration knobs.
 */
const SESSION_LIFETIME_MS = 12 * 60 * 60 * 1000;

/**
 * Idle timeout = 30 min. Configurable per the schema; held as a
 * const here for the prototype.
 */
export const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

const MOCK_IP = '127.0.0.1';
function getUserAgent(): string {
  return typeof navigator === 'undefined' ? 'unknown' : navigator.userAgent;
}

// =====================================================================
// Session storage + observer pattern (LESSON 2026-05-03)
// =====================================================================

type Listener = () => void;
const listeners = new Set<Listener>();

let currentSession: ActiveSession | null = null;

function parseStoredSession(raw: string | null): ActiveSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ActiveSession;
    // Forward-compat: a Phase 20 session in sessionStorage has no `id`
    // (the field was added in Phase 21). If we read it back without an
    // id, mint one now — otherwise downstream code that uses the id as
    // a React list key (Sessions tab) renders unkeyed rows + the
    // Sessions store can't dedup.
    if (!parsed.id) {
      parsed.id = generateSessionId();
    }
    // Re-hydrate Date fields. JSON.parse turns Date instances into ISO
    // strings, which crashes downstream consumers calling
    // `format(date)` (RangeError: Invalid time value). Restore them to
    // real Date objects here so /settings + UserMenu work after refresh.
    if (parsed.profile) {
      const cAt = parsed.profile.createdAt as unknown as string | Date | undefined;
      const lpc = parsed.profile.lastPasswordChangedAt as unknown as string | Date | null | undefined;
      parsed.profile = {
        ...parsed.profile,
        // Phase 20 profiles didn't carry `createdAt` either — fall back
        // to the admin record so format() never receives undefined.
        createdAt:
          cAt instanceof Date ? cAt : cAt ? new Date(cAt) : new Date(),
        lastPasswordChangedAt:
          lpc === null || lpc === undefined
            ? null
            : lpc instanceof Date
              ? lpc
              : new Date(lpc),
        // Phone is also new in Phase 21.
        phone: parsed.profile.phone ?? null,
        recoveryContact: parsed.profile.recoveryContact ?? null,
      };
    }
    return parsed;
  } catch {
    return null;
  }
}

function initFromStorage(): void {
  if (typeof sessionStorage === 'undefined') {
    currentSession = null;
    return;
  }
  const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
  currentSession = parseStoredSession(raw);
  // Re-create the corresponding mockAdminSessions row if it doesn't
  // exist (page refresh re-evals the data module so the previously
  // inserted row is gone — but the in-tab session id still references
  // it, so the Sessions tab needs to find it).
  if (currentSession) {
    // If the parser had to mint an id or fill in a default Date for a
    // legacy Phase 20 session payload, persist the upgraded shape back
    // so subsequent refreshes don't re-mint and re-default.
    const upgraded = JSON.stringify(currentSession);
    if (upgraded !== raw) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, upgraded);
    }
    const ua = currentSession.userAgent;
    const parsed = parseUserAgent(ua);
    insertAdminSession({
      id: currentSession.id,
      adminUserId: currentSession.profile.id,
      createdAt: new Date(currentSession.expiresAt - SESSION_LIFETIME_MS),
      lastSeenAt: new Date(currentSession.lastSeenAt),
      expiresAt: new Date(currentSession.expiresAt),
      ipAddress: currentSession.ipAddress,
      userAgent: ua,
      device: parsed.device,
      browser: parsed.browser,
      os: parsed.os,
      geoCity: 'Tashkent',
    });
  }
}

initFromStorage();

function notify(): void {
  for (const l of listeners) l();
}

function readSession(): ActiveSession | null {
  return currentSession;
}

function writeSession(s: ActiveSession | null): void {
  currentSession = s;
  if (typeof sessionStorage !== 'undefined') {
    if (!s) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(s));
    }
  }
  notify();
}

function buildProfile(user: AdminUser): AdminProfile {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    phone: user.phone,
    role: user.role,
    preferredLanguage: user.preferredLanguage,
    createdAt: user.createdAt,
    lastPasswordChangedAt: user.lastPasswordChangedAt,
    recoveryContact: user.recoveryContact,
  };
}

// =====================================================================
// User-agent → device parser (Sessions tab labelling)
// =====================================================================

function parseUserAgent(ua: string): { device: 'laptop' | 'phone' | 'tablet'; browser: string; os: string } {
  let device: 'laptop' | 'phone' | 'tablet' = 'laptop';
  if (/iPad|Tablet/i.test(ua)) device = 'tablet';
  else if (/iPhone|Android.*Mobile|Mobile.*Safari/i.test(ua)) device = 'phone';

  let browser = 'Browser';
  if (/Edg\//.test(ua)) browser = 'Edge';
  else if (/OPR\//.test(ua)) browser = 'Opera';
  else if (/Chrome\//.test(ua) && !/Edg\//.test(ua) && !/OPR\//.test(ua)) browser = 'Chrome';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) browser = 'Safari';
  else if (/ZhiPay-Admin/.test(ua)) browser = 'ZhiPay Admin app';

  let os = 'Unknown OS';
  if (/Windows NT/.test(ua)) os = 'Windows';
  else if (/Mac OS X/.test(ua)) os = 'macOS';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iOS/.test(ua)) os = 'iOS';
  else if (/Linux/.test(ua)) os = 'Linux';

  return { device, browser, os };
}

function generateSessionId(): string {
  // Crypto-grade ids would be ideal — random hex is fine for a mock.
  const rand = Math.random().toString(36).slice(2, 10);
  return `sess_${Date.now().toString(36)}_${rand}`;
}

function createSessionFor(user: AdminUser): ActiveSession {
  const now = Date.now();
  const ua = getUserAgent();
  const id = generateSessionId();
  const parsed = parseUserAgent(ua);
  // Mirror the session into the multi-device store so /settings
  // Sessions tab surfaces it alongside any other devices.
  insertAdminSession({
    id,
    adminUserId: user.id,
    createdAt: new Date(now),
    lastSeenAt: new Date(now),
    expiresAt: new Date(now + SESSION_LIFETIME_MS),
    ipAddress: MOCK_IP,
    userAgent: ua,
    device: parsed.device,
    browser: parsed.browser,
    os: parsed.os,
    geoCity: 'Tashkent',
  });
  return {
    state: 'authenticated',
    id,
    profile: buildProfile(user),
    lastSeenAt: now,
    expiresAt: now + SESSION_LIFETIME_MS,
    ipAddress: MOCK_IP,
    userAgent: ua,
  };
}

// =====================================================================
// signIn — email + password verification, then session creation
// =====================================================================

export function signIn(email: string, password: string): AuthSignInResult {
  const trimmedEmail = email.trim().toLowerCase();
  const user = findAdminByEmail(trimmedEmail);

  // Missing user — generic invalid-credentials response. NEVER reveal
  // whether the email is registered (security baseline).
  if (!user) {
    recordLoginAudit({
      emailAttempted: trimmedEmail,
      adminUserId: null,
      eventType: 'signin_failed_credentials',
      failureCode: 'AUTH_INVALID_CREDENTIALS',
      ipAddress: MOCK_IP,
      userAgent: getUserAgent(),
      context: { reason: 'unknown_email' },
    });
    return { ok: false, failureCode: 'AUTH_INVALID_CREDENTIALS' };
  }

  if (user.accountStatus === 'disabled') {
    recordLoginAudit({
      emailAttempted: trimmedEmail,
      adminUserId: user.id,
      eventType: 'signin_account_disabled',
      failureCode: 'AUTH_ACCOUNT_DISABLED',
      ipAddress: MOCK_IP,
      userAgent: getUserAgent(),
      context: { disabledReason: user.disabledReason },
    });
    return { ok: false, failureCode: 'AUTH_ACCOUNT_DISABLED' };
  }

  if (isLocked(user)) {
    recordLoginAudit({
      emailAttempted: trimmedEmail,
      adminUserId: user.id,
      eventType: 'signin_rate_limited',
      failureCode: 'AUTH_RATE_LIMITED',
      ipAddress: MOCK_IP,
      userAgent: getUserAgent(),
      context: {
        attemptsInWindow: user.failedLoginAttempts,
        windowSeconds: 900,
      },
    });
    return { ok: false, failureCode: 'AUTH_RATE_LIMITED' };
  }

  if (password !== user.expectedPassword) {
    recordFailedAttempt(user);
    recordLoginAudit({
      emailAttempted: trimmedEmail,
      adminUserId: user.id,
      eventType: 'signin_failed_credentials',
      failureCode: 'AUTH_INVALID_CREDENTIALS',
      ipAddress: MOCK_IP,
      userAgent: getUserAgent(),
      context: { attemptsInWindow: user.failedLoginAttempts },
    });
    return { ok: false, failureCode: 'AUTH_INVALID_CREDENTIALS' };
  }

  // Credentials valid → session created
  clearFailedAttempts(user);
  const session = createSessionFor(user);
  writeSession(session);
  recordLoginAudit({
    emailAttempted: user.email,
    adminUserId: user.id,
    eventType: 'signin_success',
    failureCode: null,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
    context: { sessionId: session.id },
  });
  return { ok: true };
}

// =====================================================================
// Sign-out
// =====================================================================

export interface SignOutOptions {
  reason?: 'user' | 'session_expired';
}

export function signOut(options: SignOutOptions = {}): void {
  const session = readSession();
  if (session) {
    const eventType = options.reason === 'session_expired' ? 'session_expired' : 'signout';
    // Only revoke the corresponding sessions-store row on user-initiated
    // signout; idle expiry doesn't revoke (it just lapses naturally).
    if (options.reason !== 'session_expired') {
      revokeAdminSession(session.id);
    }
    recordLoginAudit({
      emailAttempted: session.profile.email,
      adminUserId: session.profile.id,
      eventType,
      failureCode: null,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      context: { sessionId: session.id },
    });
  }
  writeSession(null);
}

// =====================================================================
// Activity tracking + getters
// =====================================================================

export function getSession(): ActiveSession | null {
  const session = readSession();
  if (!session) return null;
  if (Date.now() >= session.expiresAt) {
    signOut({ reason: 'session_expired' });
    return null;
  }
  return session;
}

export function markActivity(): void {
  const session = readSession();
  if (!session) return;
  session.lastSeenAt = Date.now();
  bumpAdminSessionActivity(session.id);
  writeSession(session);
}

// =====================================================================
// React hooks — session
// =====================================================================

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === SESSION_STORAGE_KEY) {
      currentSession = parseStoredSession(e.newValue);
      listener();
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
  };
}

function getSnapshot(): ActiveSession | null {
  return currentSession;
}

function getServerSnapshot(): ActiveSession | null {
  return null;
}

export function useSession(): ActiveSession | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Returns `'idle'` once the user has been inactive for IDLE_TIMEOUT_MS
 * within the current session. Re-evaluates every minute and on user
 * activity events. Consumers (`<AuthGuard>`) react by calling
 * `signOut({ reason: 'session_expired' })`.
 */
export function useIdleTimeout(): 'active' | 'idle' {
  const session = useSession();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!session) return;

    const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const onActivity = () => {
      const s = readSession();
      if (s && Date.now() - s.lastSeenAt > 30 * 1000) markActivity();
    };
    for (const e of events) window.addEventListener(e, onActivity, { passive: true });

    const interval = window.setInterval(() => {
      setTick((t) => t + 1);
      const s = readSession();
      if (s && Date.now() >= s.expiresAt) {
        signOut({ reason: 'session_expired' });
      }
    }, 60 * 1000);

    return () => {
      for (const e of events) window.removeEventListener(e, onActivity);
      window.clearInterval(interval);
    };
  }, [session]);

  if (!session) return 'active';
  void tick;
  const idleMs = Date.now() - session.lastSeenAt;
  return idleMs > IDLE_TIMEOUT_MS ? 'idle' : 'active';
}

// =====================================================================
// /settings — Profile mutations
// =====================================================================

export interface ProfileUpdateInput {
  displayName: string;
  phone: string | null;
  reason: string;
}

export type ProfileUpdateResult =
  | { ok: true; changed: ('displayName' | 'phone')[] }
  | { ok: false; reason: 'no_session' | 'reason_too_short' | 'no_changes' };

export function updateMyProfile(input: ProfileUpdateInput): ProfileUpdateResult {
  const session = readSession();
  if (!session) return { ok: false, reason: 'no_session' };
  if (input.reason.trim().length < 10) return { ok: false, reason: 'reason_too_short' };

  const { previous, changed } = applyProfilePatch(session.profile.id, {
    displayName: input.displayName.trim(),
    phone: input.phone ? input.phone.trim() : null,
  });

  if (changed.length === 0) return { ok: false, reason: 'no_changes' };

  // Refresh the in-tab session snapshot so TopBar / UserMenu reflect
  // the new name immediately.
  const user = getAdminById(session.profile.id);
  if (user) {
    writeSession({ ...session, profile: buildProfile(user) });
  }

  recordLoginAudit({
    emailAttempted: session.profile.email,
    adminUserId: session.profile.id,
    eventType: 'profile_changed',
    failureCode: null,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
    context: {
      fields: changed,
      previous,
      reason: input.reason.trim(),
    },
  });

  return { ok: true, changed };
}

// =====================================================================
// /settings — Password rotation
// =====================================================================

export interface PasswordChangeInput {
  current: string;
  next: string;
}

export type PasswordChangeResult =
  | { ok: true; revokedOthers: number }
  | { ok: false; reason: 'no_session' | 'wrong_current' | 'invalid_new' };

export function changeMyPassword(input: PasswordChangeInput): PasswordChangeResult {
  const session = readSession();
  if (!session) return { ok: false, reason: 'no_session' };

  const result = rotatePassword(session.profile.id, input.current, input.next, session.id);
  if (!result.ok) return result;

  // Refresh the session's profile snapshot so the Password card's
  // "Last changed Nd ago" line updates immediately.
  const user = getAdminById(session.profile.id);
  if (user) {
    writeSession({ ...session, profile: buildProfile(user) });
  }

  recordLoginAudit({
    emailAttempted: session.profile.email,
    adminUserId: session.profile.id,
    eventType: 'password_changed',
    failureCode: null,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
    context: { signed_out_other_sessions: result.revokedOthers },
  });

  return { ok: true, revokedOthers: result.revokedOthers };
}

// =====================================================================
// /settings — Sessions (multi-device)
// =====================================================================

/**
 * Bump on every revoke so the React hook re-derives. Sessions live in
 * `mockAdminSessions` (a plain mutable array) so we use a tiny version
 * counter to make the hook reactive without holding the array itself
 * in React state.
 */
let sessionsVersion = 0;
const sessionsListeners = new Set<Listener>();
function bumpSessionsVersion(): void {
  sessionsVersion += 1;
  for (const l of sessionsListeners) l();
}

export interface SessionRevokeOutcome {
  ok: boolean;
  /** Set when revoke-all-others fires. */
  count?: number;
}

export function revokeMySession(sessionId: string): SessionRevokeOutcome {
  const session = readSession();
  if (!session) return { ok: false };
  if (sessionId === session.id) return { ok: false }; // current session not self-revocable

  const revoked = revokeAdminSession(sessionId);
  if (!revoked) return { ok: false };

  recordLoginAudit({
    emailAttempted: session.profile.email,
    adminUserId: session.profile.id,
    eventType: 'session_revoked',
    failureCode: null,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
    context: {
      session_id: revoked.id,
      ip_address: revoked.ipAddress,
      user_agent: revoked.userAgent,
    },
  });

  bumpSessionsVersion();
  return { ok: true };
}

export function revokeMyOtherSessions(): SessionRevokeOutcome {
  const session = readSession();
  if (!session) return { ok: false };

  const count = revokeAllOtherSessions(session.profile.id, session.id);

  recordLoginAudit({
    emailAttempted: session.profile.email,
    adminUserId: session.profile.id,
    eventType: 'session_revoked_all',
    failureCode: null,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
    context: { count },
  });

  bumpSessionsVersion();
  return { ok: true, count };
}

function subscribeSessions(listener: Listener): () => void {
  sessionsListeners.add(listener);
  return () => {
    sessionsListeners.delete(listener);
  };
}

function getSessionsSnapshot(): number {
  return sessionsVersion;
}

/**
 * Returns the current admin's active sessions (revoked / expired
 * filtered out). Re-derives on every revoke.
 */
export function useMyActiveSessions(): AdminSession[] {
  const session = useSession();
  // Subscribe via a small version counter so the list re-derives on
  // mutation. Returning the array itself from getSnapshot would trip
  // the reference-stability guard since we'd need a fresh slice.
  useSyncExternalStore(subscribeSessions, getSessionsSnapshot, () => 0);
  if (!session) return [];
  return listMyActiveSessions(session.profile.id);
}

// =====================================================================
// /settings — Sign-in history
// =====================================================================

export function useMySignInHistory(limit = 30): AdminLoginAuditEntry[] {
  const session = useSession();
  if (!session) return [];
  return mockAdminSignInHistory
    .filter((e) => e.adminUserId === session.profile.id)
    .slice(0, limit);
}
