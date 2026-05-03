/**
 * Admin cosmetic + locale + notification preferences store.
 *
 * Backs the /settings Preferences tab. Theme integration delegates to
 * the existing `<ThemeProvider>` (single source of truth for theme +
 * resolvedTheme); density / tabular-numerals / language / timezone /
 * date format / time format / notification subscriptions live here.
 *
 * Persistence: localStorage (cosmetic prefs survive sign-out — they're
 * a per-browser preference, not session state).
 *
 * DOM application:
 *   - `data-density="compact|comfortable"` on `<html>` — read by
 *     `globals.css` to set the `--row-h` CSS var consumed by
 *     `<TableRow>` primitive (one-line cascade across every table)
 *   - `data-tabular-nums="true|false"` on `<html>` — read by
 *     `globals.css` to apply `font-variant-numeric: tabular-nums`
 *     to body text
 *
 * Theme is intentionally NOT held in this store — `<ThemeProvider>`
 * already owns it via the `zhipay-theme` localStorage key. Settings UI
 * calls `useTheme().setTheme()` directly. The store carries `theme` in
 * its returned snapshot so the radio group has one read-source, but
 * writes go through ThemeProvider.
 *
 * `useSyncExternalStore` contract per LESSON 2026-05-03:
 * `getSnapshot()` returns a module-level reference-stable object that's
 * only rewritten on actual mutation. Cross-tab sync via `storage`
 * events updates the cached object before notifying subscribers.
 */

import { useSyncExternalStore } from 'react';
import type {
  AdminPreferences,
  AdminDensity,
  AdminLanguage,
  AdminDateFormat,
  AdminTimeFormat,
  AdminNotificationSubscriptions,
} from '@/data/mockAdminAuth';

const STORAGE_KEY = 'zhipay-admin-preferences';

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

// =====================================================================
// Module-level cache + observer pattern (LESSON 2026-05-03)
// =====================================================================

type Listener = () => void;
const listeners = new Set<Listener>();

let currentPreferences: AdminPreferences = DEFAULT_PREFERENCES;

function parseStored(raw: string | null): AdminPreferences | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AdminPreferences>;
    return mergeWithDefaults(parsed);
  } catch {
    return null;
  }
}

function mergeWithDefaults(patch: Partial<AdminPreferences>): AdminPreferences {
  return {
    ...DEFAULT_PREFERENCES,
    ...patch,
    notification_subscriptions: {
      ...DEFAULT_PREFERENCES.notification_subscriptions,
      ...(patch.notification_subscriptions ?? {}),
    },
  };
}

function initFromStorage(): void {
  if (typeof localStorage === 'undefined') {
    currentPreferences = DEFAULT_PREFERENCES;
    return;
  }
  const fromStorage = parseStored(localStorage.getItem(STORAGE_KEY));
  currentPreferences = fromStorage ?? DEFAULT_PREFERENCES;
}

initFromStorage();

function notify(): void {
  for (const l of listeners) l();
}

function persist(prefs: AdminPreferences): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }
}

// =====================================================================
// DOM hooks — `data-*` attributes on <html> drive globals.css cascades
// =====================================================================

function applyDom(prefs: AdminPreferences): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-density', prefs.density);
  root.setAttribute('data-tabular-nums', prefs.tabular_numerals ? 'true' : 'false');
}

/**
 * Apply preferences to the DOM at app boot. Safe to call multiple
 * times — DOM attribute writes are idempotent.
 */
export function bootPreferences(): void {
  applyDom(currentPreferences);
}

// =====================================================================
// Public API
// =====================================================================

export function getPreferences(): AdminPreferences {
  return currentPreferences;
}

export interface PreferencesPatch {
  density?: AdminDensity;
  language?: AdminLanguage;
  timezone?: string;
  date_format?: AdminDateFormat;
  time_format?: AdminTimeFormat;
  tabular_numerals?: boolean;
  notification_subscriptions?: Partial<AdminNotificationSubscriptions>;
}

/**
 * Partial-merge update. Returns the new snapshot. Theme writes are NOT
 * accepted here — call `useTheme().setTheme()` from `<ThemeProvider>`
 * directly. The store's `theme` field mirrors ThemeProvider via the
 * `syncThemeIntoPreferences` helper called by the Settings page.
 */
export function updatePreferences(patch: PreferencesPatch): AdminPreferences {
  currentPreferences = {
    ...currentPreferences,
    ...patch,
    notification_subscriptions: {
      ...currentPreferences.notification_subscriptions,
      ...(patch.notification_subscriptions ?? {}),
    },
  };
  persist(currentPreferences);
  applyDom(currentPreferences);
  notify();
  return currentPreferences;
}

/**
 * Mirror the live theme state (from `<ThemeProvider>`) into the
 * preferences snapshot so consumers reading via `usePreferences()` see
 * a consistent shape. Does not persist the theme — ThemeProvider owns
 * its own `zhipay-theme` localStorage key.
 */
export function syncThemeIntoPreferences(theme: AdminPreferences['theme']): void {
  if (currentPreferences.theme === theme) return;
  currentPreferences = { ...currentPreferences, theme };
  notify();
}

// =====================================================================
// React hook
// =====================================================================

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    const next = parseStored(e.newValue);
    if (next) {
      currentPreferences = next;
      applyDom(currentPreferences);
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

function getSnapshot(): AdminPreferences {
  return currentPreferences;
}

function getServerSnapshot(): AdminPreferences {
  return DEFAULT_PREFERENCES;
}

export function usePreferences(): AdminPreferences {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
