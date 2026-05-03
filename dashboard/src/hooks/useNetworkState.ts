/**
 * Online/offline state hook.
 *
 * Backed by `useSyncExternalStore` per LESSON 2026-05-03 contract:
 *   - Module-level cached state (`isOnline`)
 *   - `getSnapshot()` returns a stable boolean reference
 *   - `online` / `offline` event listeners mutate the cache, then notify
 *
 * The browser fires `online` / `offline` events on `window` when
 * `navigator.onLine` flips. We subscribe once at module load and then
 * every consumer reads the cached value.
 *
 * Consumer pattern:
 *   const online = useNetworkState();
 *   if (!online) <OfflineBanner />
 *
 * Also exports a `triggerOfflinePreview()` helper used by the
 * `/system/preview/offline` route to render the banner over a stale
 * Overview without requiring the designer to physically disconnect
 * their network. Toggling the preview flag does NOT touch
 * `navigator.onLine` — it just forces the cached value to `false` until
 * cleared.
 */

import { useSyncExternalStore } from 'react';

type Listener = () => void;
const listeners = new Set<Listener>();

let isOnline = typeof navigator === 'undefined' ? true : navigator.onLine;
let previewForced = false;

function notify(): void {
  for (const l of listeners) l();
}

function handleOnline(): void {
  if (previewForced) return; // preview wins until cleared
  if (isOnline) return;
  isOnline = true;
  notify();
}

function handleOffline(): void {
  if (isOnline === false) return;
  isOnline = false;
  notify();
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): boolean {
  return isOnline;
}

function getServerSnapshot(): boolean {
  return true;
}

/** Returns `true` when online, `false` when offline. */
export function useNetworkState(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Imperative read — for non-React consumers (write-action gating). */
export function getNetworkState(): boolean {
  return isOnline;
}

/**
 * Toggle the offline-preview override. Used by
 * `/system/preview/offline` so designers can eyeball the banner without
 * killing their network. When `force=true`, the cached state is locked
 * to `false`; when `false`, the cache snaps back to whatever
 * `navigator.onLine` reports.
 */
export function setOfflinePreview(force: boolean): void {
  previewForced = force;
  const next = force ? false : typeof navigator === 'undefined' ? true : navigator.onLine;
  if (isOnline !== next) {
    isOnline = next;
    notify();
  }
}
