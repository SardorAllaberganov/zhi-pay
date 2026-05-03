/**
 * Maintenance-mode state store.
 *
 * Mirrors `lib/preferences.ts` shape per LESSON 2026-05-03:
 *   - Module-level cached state
 *   - Reference-stable `getSnapshot`
 *   - Cross-tab sync via `storage` events
 *   - Persistence in localStorage so a refresh doesn't drop the flag
 *
 * In production, the feature flag would come from a backend health
 * check or a toggle service (LaunchDarkly etc). For the prototype:
 *
 *   - `?maintenance=on` URL param flips the flag on (preview / QA)
 *   - `?maintenance=off` flips it off
 *   - `enterMaintenance({ estimatedEndAt })` sets manually
 *   - `exitMaintenance()` clears
 *
 * Once flipped, the `<MaintenanceGate>` in the router renders the
 * full-page `<Maintenance>` view instead of the route children. Toggle
 * is per-browser (localStorage), not per-tab — so opening a second tab
 * mid-maintenance shows the same state.
 */

import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'zhipay-admin-maintenance';

export interface MaintenanceState {
  active: boolean;
  /** ms since epoch — set when `enterMaintenance` was called. */
  startedAt: number | null;
  /** ms since epoch — admin-supplied; null when unknown. */
  estimatedEndAt: number | null;
}

const DEFAULT_STATE: MaintenanceState = {
  active: false,
  startedAt: null,
  estimatedEndAt: null,
};

// =====================================================================
// Module-level cache (LESSON 2026-05-03)
// =====================================================================

type Listener = () => void;
const listeners = new Set<Listener>();

let currentState: MaintenanceState = DEFAULT_STATE;

function parseStored(raw: string | null): MaintenanceState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<MaintenanceState>;
    return {
      active: !!parsed.active,
      startedAt: typeof parsed.startedAt === 'number' ? parsed.startedAt : null,
      estimatedEndAt:
        typeof parsed.estimatedEndAt === 'number' ? parsed.estimatedEndAt : null,
    };
  } catch {
    return null;
  }
}

function persist(state: MaintenanceState): void {
  if (typeof localStorage === 'undefined') return;
  if (!state.active) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

function initFromStorage(): void {
  if (typeof localStorage === 'undefined') {
    currentState = DEFAULT_STATE;
    return;
  }
  const fromStorage = parseStored(localStorage.getItem(STORAGE_KEY));
  currentState = fromStorage ?? DEFAULT_STATE;
}

initFromStorage();

function notify(): void {
  for (const l of listeners) l();
}

function setState(next: MaintenanceState): void {
  currentState = next;
  persist(next);
  notify();
}

// =====================================================================
// URL-param trigger (preview / QA)
// =====================================================================

/**
 * Read `?maintenance=on|off` from the current URL and apply on first
 * mount. Strips the param afterwards so subsequent navigations don't
 * keep re-applying. Called once from `<App>` at boot.
 */
export function bootMaintenanceFromUrl(): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  const param = url.searchParams.get('maintenance');
  if (param === 'on') {
    enterMaintenance({
      // Default 30-minute window when triggered via URL — admin-friendly
      // preview shape with realistic timing rather than null endpoints.
      estimatedEndAt: Date.now() + 30 * 60 * 1000,
    });
    url.searchParams.delete('maintenance');
    window.history.replaceState({}, '', url.toString());
  } else if (param === 'off') {
    exitMaintenance();
    url.searchParams.delete('maintenance');
    window.history.replaceState({}, '', url.toString());
  }
}

// =====================================================================
// Public API
// =====================================================================

export interface EnterMaintenanceInput {
  estimatedEndAt?: number | null;
}

export function enterMaintenance(input: EnterMaintenanceInput = {}): void {
  setState({
    active: true,
    startedAt: Date.now(),
    estimatedEndAt: input.estimatedEndAt ?? null,
  });
}

export function exitMaintenance(): void {
  setState(DEFAULT_STATE);
}

export function getMaintenanceState(): MaintenanceState {
  return currentState;
}

/** No-op refresh — the local mock has no remote source. Bumps notify so
 * any time-derived UI (e.g. relative-time on `startedAt`) re-renders. */
export function refreshMaintenanceState(): void {
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
    currentState = next ?? DEFAULT_STATE;
    listener();
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

function getSnapshot(): MaintenanceState {
  return currentState;
}

function getServerSnapshot(): MaintenanceState {
  return DEFAULT_STATE;
}

export function useMaintenanceState(): MaintenanceState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
