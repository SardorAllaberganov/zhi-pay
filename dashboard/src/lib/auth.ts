/**
 * Mock admin auth orchestrator.
 *
 * Wraps `data/mockAdminAuth.ts` (the data layer — schema-aligned record
 * store + audit trail) with the surface-facing API the `/sign-in` page
 * and `<AuthGuard>` consume:
 *
 *   - `signIn(email, password)`      → email + password verification
 *   - `signOut()`                    → from TopBar / forced revocation
 *   - `getSession()` + `useSession()` → AuthGuard subscriber
 *   - `markActivity()`               → bumps `last_seen_at`; resets idle
 *   - `useIdleTimeout()`             → React hook returning 'active' | 'idle'
 *
 * Admin auth is email + password only — there is no 2FA / OTP step on
 * the admin surface. (TOTP / SMS-OTP belongs to the mobile end-user
 * flow, which is a separate phase.) If 2FA is reintroduced for admin
 * accounts later, the schema in `models.md §10` already has the fields
 * laid out (`totp_secret`, `backup_codes`, etc.) — just rewire here.
 *
 * Session state lives in `sessionStorage` so refresh doesn't kick the
 * user back to /sign-in. Real backend would use an HttpOnly cookie + a
 * server-side session row.
 *
 * Idle-timeout logic is encapsulated in the `useIdleTimeout` hook —
 * when `now - last_seen_at > IDLE_TIMEOUT_MS` and no activity since,
 * the hook returns `'idle'`. The `<AuthGuard>` reacts by calling
 * `signOut({ reason: 'session_expired' })` and redirecting to
 * `/sign-in?expired=1&next=<path>`.
 */

import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  clearFailedAttempts,
  findAdminByEmail,
  isLocked,
  recordFailedAttempt,
  recordLoginAudit,
  type AdminAuthFailureCode,
  type AdminUser,
} from '@/data/mockAdminAuth';

// =====================================================================
// Public types
// =====================================================================

export interface AdminProfile {
  id: string;
  email: string;
  displayName: string;
  role: AdminUser['role'];
  preferredLanguage: AdminUser['preferredLanguage'];
}

export interface ActiveSession {
  state: 'authenticated';
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
// Session storage + observer pattern (so React components can subscribe)
//
// `useSyncExternalStore` requires `getSnapshot` to return a reference-
// equal value across calls when state hasn't changed. JSON-parsing on
// every read returns a fresh object every time, which trips React's
// "getSnapshot should be cached to avoid an infinite loop" guard.
// We hold the parsed session in a module-level variable that's only
// rewritten on actual mutation (or cross-tab `storage` event).
// =====================================================================

type Listener = () => void;
const listeners = new Set<Listener>();

let currentSession: ActiveSession | null = null;

function parseStoredSession(raw: string | null): ActiveSession | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ActiveSession;
  } catch {
    return null;
  }
}

function initFromStorage(): void {
  if (typeof sessionStorage === 'undefined') {
    currentSession = null;
    return;
  }
  currentSession = parseStoredSession(sessionStorage.getItem(SESSION_STORAGE_KEY));
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
    role: user.role,
    preferredLanguage: user.preferredLanguage,
  };
}

function createSessionFor(user: AdminUser): ActiveSession {
  const now = Date.now();
  return {
    state: 'authenticated',
    profile: buildProfile(user),
    lastSeenAt: now,
    expiresAt: now + SESSION_LIFETIME_MS,
    ipAddress: MOCK_IP,
    userAgent: getUserAgent(),
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
    context: {},
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
    recordLoginAudit({
      emailAttempted: session.profile.email,
      adminUserId: session.profile.id,
      eventType,
      failureCode: null,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      context: {},
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
  writeSession(session);
}

// =====================================================================
// React hooks
// =====================================================================

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === SESSION_STORAGE_KEY) {
      // Cross-tab sync: re-parse and refresh the cached snapshot.
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
