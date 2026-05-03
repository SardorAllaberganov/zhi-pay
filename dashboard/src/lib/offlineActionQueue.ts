/**
 * Offline action queue + replay-on-reconnect.
 *
 * When the app is offline (`navigator.onLine === false`) and an admin
 * triggers a write that bypasses the UI-level `<WriteButton>` gate
 * (e.g. via keyboard chord), the action is queued instead of dropped.
 * On reconnect, queued actions replay in order and a single toast
 * surfaces the count ("Synced N actions.").
 *
 * Two consumer-facing APIs:
 *   - `tryWriteOrQueue({label, executor})` — invoke from any
 *     synchronous mutator handler. If online, executes immediately.
 *     If offline, queues for replay.
 *   - `getQueuedActionCount()` — imperative read for read-only
 *     consumers (e.g. a future "queued actions" status indicator).
 *
 * Boot: `window.addEventListener('online', …)` is registered at module
 * load to drain the queue. SSR-safe — the listener is only registered
 * inside `typeof window !== 'undefined'`.
 *
 * Replay errors are caught and logged to the console — a failed
 * action doesn't block subsequent ones. Real backend would surface
 * each failure as its own toast / retry ticket; v1 mock keeps it
 * minimal.
 */

import { toast } from 'sonner';
import { getNetworkState } from '@/hooks/useNetworkState';
import { t } from '@/lib/i18n';

interface QueuedAction {
  id: string;
  label: string;
  executor: () => void | Promise<void>;
}

let queue: QueuedAction[] = [];
let nextId = 0;

function generateId(): string {
  nextId += 1;
  return `qa_${Date.now().toString(36)}_${nextId}`;
}

export interface TryWriteOrQueueInput {
  /** User-facing label — shown in console logs on replay failure. */
  label: string;
  executor: () => void | Promise<void>;
}

/**
 * Run the executor immediately if online; queue for replay if offline.
 * Returns `'executed'` or `'queued'` so callers can adjust toast copy
 * (e.g. swap a success toast for a "queued" message when offline).
 */
export function tryWriteOrQueue(
  input: TryWriteOrQueueInput,
): 'executed' | 'queued' {
  if (getNetworkState()) {
    void input.executor();
    return 'executed';
  }
  queue.push({
    id: generateId(),
    label: input.label,
    executor: input.executor,
  });
  return 'queued';
}

/** Synchronously drain the queue. Returns the count drained. */
async function replayAll(): Promise<number> {
  if (queue.length === 0) return 0;
  const toReplay = [...queue];
  queue = [];
  for (const action of toReplay) {
    try {
      await action.executor();
    } catch (error) {
      // Don't let one failure block the rest. Real backend would
      // surface per-action failures separately.
      // eslint-disable-next-line no-console
      console.error(`[offline-queue] replay failed for "${action.label}":`, error);
    }
  }
  return toReplay.length;
}

export function getQueuedActionCount(): number {
  return queue.length;
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    void replayAll().then((count) => {
      if (count > 0) {
        toast.success(
          t('admin.system.offline.toast.synced').replace('{n}', String(count)),
        );
      }
    });
  });
}
