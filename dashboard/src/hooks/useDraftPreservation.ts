/**
 * Auto-save form state to localStorage with maintenance-aware UX.
 *
 * Continuously snapshots `value` to localStorage (debounced 500ms) so
 * if maintenance kicks in mid-action — or the user accidentally closes
 * the tab — their work isn't lost. On mount, restores any saved draft.
 * When the maintenance flag flips on (`useMaintenanceState().active`
 * goes from false → true), surfaces a toast confirming the draft was
 * saved locally.
 *
 * Consumers call `clearDraft()` after a successful submit so the next
 * mount starts fresh.
 *
 * Date / non-JSON values: pass custom `serialize` / `deserialize` to
 * handle them. Per LESSON 2026-05-03, every parser that round-trips
 * Date through JSON must rehydrate explicitly — same contract here.
 *
 * SSR-safe: the localStorage access is gated on `typeof localStorage`.
 */

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useMaintenanceState } from '@/lib/maintenanceState';
import { t } from '@/lib/i18n';

export interface UseDraftPreservationOptions<T> {
  /** localStorage key — should be unique per form. */
  key: string;
  /** Live value to snapshot. */
  value: T;
  /** Setter to call when restoring a saved draft on mount. */
  setValue: (next: T) => void;
  /** When false, skip both restore + auto-save. Default true. */
  enabled?: boolean;
  /** Custom JSON serializer for values containing Date / Map / etc. */
  serialize?: (v: T) => string;
  /** Custom JSON parser; return `null` to skip restore on parse fail. */
  deserialize?: (raw: string) => T | null;
}

export interface UseDraftPreservationApi {
  /** Wipe the saved draft. Call on successful submit. */
  clearDraft: () => void;
}

const DEBOUNCE_MS = 500;

export function useDraftPreservation<T>(
  options: UseDraftPreservationOptions<T>,
): UseDraftPreservationApi {
  const { key, value, setValue, enabled = true } = options;
  const serialize = options.serialize ?? ((v: T) => JSON.stringify(v));
  const deserialize =
    options.deserialize ??
    ((raw: string): T | null => {
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    });

  const restoredRef = useRef(false);
  const maintenance = useMaintenanceState();
  const prevMaintenanceRef = useRef(maintenance.active);

  // Mount restore — runs once per key, gated on `enabled`.
  useEffect(() => {
    if (!enabled || restoredRef.current) return;
    if (typeof localStorage === 'undefined') {
      restoredRef.current = true;
      return;
    }
    restoredRef.current = true;
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const restored = deserialize(raw);
    if (restored !== null && restored !== undefined) {
      setValue(restored);
    }
    // mount-only — re-restore on key change is intentional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, key]);

  // Auto-save (debounced).
  useEffect(() => {
    if (!enabled) return;
    if (typeof localStorage === 'undefined') return;
    const handle = window.setTimeout(() => {
      try {
        localStorage.setItem(key, serialize(value));
      } catch {
        // localStorage quota or disabled — silent. Real backend would
        // queue the snapshot to a server-side draft store.
      }
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [value, enabled, key, serialize]);

  // Surface a toast when maintenance flips ON, confirming the draft
  // is preserved. Doesn't fire when maintenance flips OFF — the next
  // mount of the form restores the saved draft naturally.
  useEffect(() => {
    if (!prevMaintenanceRef.current && maintenance.active) {
      toast.info(t('admin.system.maintenance.draft-saved'), {
        duration: 8000,
      });
    }
    prevMaintenanceRef.current = maintenance.active;
  }, [maintenance.active]);

  function clearDraft(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(key);
      } catch {
        // silent
      }
    }
  }

  return { clearDraft };
}
