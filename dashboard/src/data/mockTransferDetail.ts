/**
 * Transfer-detail-specific mock data — internal notes, provider response with
 * webhook events, admin action history, linked-entity edge cases, lifetime
 * and recipient-frequency stats.
 *
 * The list-page dataset (transfers, events, AML flags) lives in
 * `mockTransfers.ts`. This file augments those with the per-transfer bundle
 * the detail page needs.
 *
 * Built deterministically from the seeded transfer dataset. No backend.
 */

import { CARDS, USERS } from './mock';
import {
  TRANSFERS_FULL,
  getEventsForTransfer,
  getAmlFlagsForTransfer,
} from './mockTransfers';
import type {
  AmlFlag,
  Card,
  Transfer,
  TransferEvent,
  User,
} from '@/types';

// =====================================================================
// Types — exported for component use
// =====================================================================

export type NoteTag = 'compliance' | 'fraud' | 'customer-support' | 'general';

export interface InternalNote {
  id: string;
  transferId: string;
  authorName: string;
  authorInitials: string;
  authorRole: string;
  tag: NoteTag;
  body: string;
  createdAt: Date;
}

export interface WebhookEvent {
  id: string;
  type: string;
  statusCode: number;
  retryCount: number;
  receivedAt: Date;
}

export interface ProviderResponse {
  externalTxId: string;
  provider: 'alipay' | 'wechat';
  webhookEvents: WebhookEvent[];
  rawResponse: Record<string, unknown>;
  lastReceivedAt: Date | null;
}

export type AdminActionType =
  | 'note_added'
  | 'webhook_resent'
  | 'force_failed'
  | 'marked_completed'
  | 'reversed'
  | 'refunded';

export interface AdminActionEntry {
  id: string;
  transferId: string;
  type: AdminActionType;
  actorName: string;
  actorInitials: string;
  reason: string;
  createdAt: Date;
}

export interface UserLifetimeStats {
  count: number;
  totalUzsTiyins: bigint;
}

export interface TransferDetailBundle {
  transfer: Transfer;
  events: TransferEvent[];
  amlFlags: AmlFlag[];
  internalNotes: InternalNote[];
  providerResponse: ProviderResponse | null;
  adminActions: AdminActionEntry[];
  user: User | null;
  card: Card | null;
  senderDeleted: boolean;
  cardRemoved: boolean;
  recipientDeleted: boolean;
  userLifetime: UserLifetimeStats;
  recipientTransferCount: number;
}

// =====================================================================
// Anchor "now" — matches the rest of the prototype
// =====================================================================

const NOW = new Date('2026-04-29T10:30:00Z');

// =====================================================================
// Edge-case selection — pick 3 deterministic IDs
// =====================================================================

// Sender deleted, card removed, recipient deleted — three distinct IDs taken
// off the back of the seeded list so they're stable across reloads.
const REVERSED = TRANSFERS_FULL.filter((t) => t.status === 'reversed');
const COMPLETED = TRANSFERS_FULL.filter((t) => t.status === 'completed');

const SENDER_DELETED_IDS = new Set<string>(
  REVERSED.length > 0 ? [REVERSED[0].id] : [],
);
const CARD_REMOVED_IDS = new Set<string>(
  COMPLETED.length > 5 ? [COMPLETED[3].id] : [],
);
const RECIPIENT_DELETED_IDS = new Set<string>(
  COMPLETED.length > 10 ? [COMPLETED[7].id] : [],
);

// =====================================================================
// Internal notes — attach to ~10 transfers, mostly singletons
// =====================================================================

const NOTE_AUTHORS: Array<{
  name: string;
  initials: string;
  role: string;
}> = [
  { name: 'Nilufar Tohirova',  initials: 'NT', role: 'Compliance officer' },
  { name: 'Jamshid Rahimov',   initials: 'JR', role: 'Operations lead' },
  { name: 'Diana Sokolova',    initials: 'DS', role: 'Customer support' },
  { name: 'Bobur Allaberganov',initials: 'BA', role: 'Fraud analyst' },
];

interface NoteSeed {
  filter: (t: Transfer) => boolean;
  tag: NoteTag;
  authorIdx: number;
  body: string;
  ageMinutes: number;
}

// Targeted seeds — spread across status types so the detail page
// shows realistic mixes.
const NOTE_SEEDS: NoteSeed[] = [
  {
    filter: (t) => t.status === 'processing',
    tag: 'customer-support',
    authorIdx: 2,
    body: 'User called in — confirmed they meant to send to this recipient. No action needed.',
    ageMinutes: 4,
  },
  {
    filter: (t) => t.status === 'processing',
    tag: 'compliance',
    authorIdx: 0,
    body: 'Routine velocity check passed. Proceed without holds.',
    ageMinutes: 12,
  },
  {
    filter: (t) => t.failureCode === 'CARD_DECLINED',
    tag: 'customer-support',
    authorIdx: 2,
    body: 'User reported card was declined unexpectedly. Advised to try Humo card on retry.',
    ageMinutes: 35,
  },
  {
    filter: (t) => t.failureCode === 'RECIPIENT_INVALID',
    tag: 'customer-support',
    authorIdx: 2,
    body: 'Confirmed recipient handle was mistyped. User retried with correct handle.',
    ageMinutes: 90,
  },
  {
    filter: (t) => t.failureCode === 'INSUFFICIENT_FUNDS',
    tag: 'general',
    authorIdx: 1,
    body: 'Standard NSF — no follow-up required.',
    ageMinutes: 60,
  },
  {
    filter: (t) => t.failureCode === 'SANCTIONS_HIT',
    tag: 'compliance',
    authorIdx: 0,
    body: 'Auto-blocked on sanctions match. Escalating to AML triage. Do NOT release without legal sign-off.',
    ageMinutes: 5,
  },
  {
    filter: (t) => t.status === 'reversed',
    tag: 'fraud',
    authorIdx: 3,
    body: 'Reversed after fraud-flag escalation. Card frozen pending review. See AML 23-04.',
    ageMinutes: 600,
  },
  {
    filter: (t) => t.status === 'completed' && Number(t.amountUzs) > 30_000_000_00,
    tag: 'compliance',
    authorIdx: 0,
    body: 'Large-amount transfer — manually reviewed and approved per tier_2 limit policy.',
    ageMinutes: 240,
  },
];

const notesByTransfer = new Map<string, InternalNote[]>();

(function seedNotes() {
  let counter = 1;
  for (const seed of NOTE_SEEDS) {
    const candidate = TRANSFERS_FULL.find(
      (t) => seed.filter(t) && !notesByTransfer.has(t.id),
    );
    if (!candidate) continue;
    const author = NOTE_AUTHORS[seed.authorIdx];
    const note: InternalNote = {
      id: `note_${String(counter++).padStart(4, '0')}`,
      transferId: candidate.id,
      authorName: author.name,
      authorInitials: author.initials,
      authorRole: author.role,
      tag: seed.tag,
      body: seed.body,
      createdAt: new Date(NOW.getTime() - seed.ageMinutes * 60_000),
    };
    notesByTransfer.set(candidate.id, [note]);
  }

  // One transfer with two notes — first stuck-processing transfer.
  const stuck = TRANSFERS_FULL.find(
    (t) =>
      t.status === 'processing' &&
      NOW.getTime() - t.createdAt.getTime() > 5 * 60_000,
  );
  if (stuck) {
    const existing = notesByTransfer.get(stuck.id) ?? [];
    const a = NOTE_AUTHORS[1];
    existing.push({
      id: `note_${String(counter++).padStart(4, '0')}`,
      transferId: stuck.id,
      authorName: a.name,
      authorInitials: a.initials,
      authorRole: a.role,
      tag: 'general',
      body: 'Provider acknowledged but no completion webhook yet. Watching.',
      createdAt: new Date(NOW.getTime() - 2 * 60_000),
    });
    notesByTransfer.set(stuck.id, existing);
  }
})();

// =====================================================================
// Provider response with webhook events — for any transfer that has externalTxId
// =====================================================================

const providerByTransfer = new Map<string, ProviderResponse>();

function buildWebhookEvents(t: Transfer): WebhookEvent[] {
  const events: WebhookEvent[] = [];
  const created = t.createdAt.getTime();

  // Initial ack — always present.
  events.push({
    id: `wh_${t.id}_1`,
    type: 'pending',
    statusCode: 202,
    retryCount: 0,
    receivedAt: new Date(created + 30_000),
  });

  if (t.status === 'completed' || t.status === 'reversed') {
    events.push({
      id: `wh_${t.id}_2`,
      type: 'success',
      statusCode: 200,
      retryCount: 0,
      receivedAt: t.completedAt ?? new Date(created + 90_000),
    });
  }

  if (t.status === 'failed') {
    if (t.failureCode === 'PROVIDER_UNAVAILABLE') {
      events.push({
        id: `wh_${t.id}_2`,
        type: 'pending_retry',
        statusCode: 504,
        retryCount: 1,
        receivedAt: new Date(created + 60_000),
      });
      events.push({
        id: `wh_${t.id}_3`,
        type: 'pending_retry',
        statusCode: 504,
        retryCount: 2,
        receivedAt: new Date(created + 120_000),
      });
      events.push({
        id: `wh_${t.id}_4`,
        type: 'failed',
        statusCode: 504,
        retryCount: 3,
        receivedAt: new Date(created + 240_000),
      });
    } else {
      events.push({
        id: `wh_${t.id}_2`,
        type: 'failed',
        statusCode: t.failureCode === 'SANCTIONS_HIT' ? 200 : 422,
        retryCount: 0,
        receivedAt: new Date(created + 90_000),
      });
    }
  }

  if (t.status === 'processing') {
    const stuckMs = NOW.getTime() - created;
    if (stuckMs > 5 * 60_000) {
      events.push({
        id: `wh_${t.id}_2`,
        type: 'pending',
        statusCode: 202,
        retryCount: 0,
        receivedAt: new Date(created + 5 * 60_000),
      });
    }
  }

  return events;
}

(function seedProvider() {
  for (const t of TRANSFERS_FULL) {
    if (!t.externalTxId) continue;
    const webhookEvents = buildWebhookEvents(t);
    const lastReceivedAt =
      webhookEvents.length > 0
        ? webhookEvents[webhookEvents.length - 1].receivedAt
        : null;
    const rawResponse: Record<string, unknown> =
      t.status === 'completed' || t.status === 'reversed'
        ? {
            external_tx_id: t.externalTxId,
            provider: t.destination,
            status: 'SUCCESS',
            amount_received_cny: Number(t.amountCny) / 100,
            recipient_handle: t.recipientIdentifier,
            settlement_id: `set_${t.id.slice(-6)}`,
            received_at: (t.completedAt ?? new Date(t.createdAt.getTime() + 120_000)).toISOString(),
          }
        : t.status === 'failed'
          ? {
              external_tx_id: t.externalTxId,
              provider: t.destination,
              status: 'FAILED',
              failure_code: t.failureCode,
              recipient_handle: t.recipientIdentifier,
            }
          : {
              external_tx_id: t.externalTxId,
              provider: t.destination,
              status: 'PENDING',
              recipient_handle: t.recipientIdentifier,
              expected_completion_in_s: 90,
            };
    providerByTransfer.set(t.id, {
      externalTxId: t.externalTxId,
      provider: t.destination,
      webhookEvents,
      rawResponse,
      lastReceivedAt,
    });
  }
})();

// =====================================================================
// Admin action history — populate for reversed transfers + a couple others
// =====================================================================

const adminActionsByTransfer = new Map<string, AdminActionEntry[]>();

(function seedAdminActions() {
  let counter = 1;
  for (const t of TRANSFERS_FULL) {
    if (t.status !== 'reversed') continue;
    const entry: AdminActionEntry = {
      id: `act_${String(counter++).padStart(4, '0')}`,
      transferId: t.id,
      type: 'reversed',
      actorName: 'Jamshid Rahimov',
      actorInitials: 'JR',
      reason: 'Customer-requested refund — order cancelled by recipient.',
      createdAt: new Date((t.completedAt ?? t.createdAt).getTime() + 3 * 3_600_000),
    };
    adminActionsByTransfer.set(t.id, [entry]);
  }

  // For transfers that also have an internal note, log a note_added action.
  for (const [transferId, notes] of notesByTransfer.entries()) {
    const existing = adminActionsByTransfer.get(transferId) ?? [];
    for (const n of notes) {
      existing.push({
        id: `act_${String(counter++).padStart(4, '0')}`,
        transferId,
        type: 'note_added',
        actorName: n.authorName,
        actorInitials: n.authorInitials,
        reason: `Tagged ${n.tag}. ${n.body.slice(0, 80)}${n.body.length > 80 ? '…' : ''}`,
        createdAt: n.createdAt,
      });
    }
    existing.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    adminActionsByTransfer.set(transferId, existing);
  }
})();

// =====================================================================
// User lifetime stats + recipient transfer counts
// =====================================================================

const userLifetimeMap = new Map<string, UserLifetimeStats>();
const recipientCountMap = new Map<string, number>(); // key = `${userId}::${recipientIdentifier}`

(function seedStats() {
  for (const t of TRANSFERS_FULL) {
    const cur = userLifetimeMap.get(t.userId) ?? { count: 0, totalUzsTiyins: 0n };
    cur.count += 1;
    if (t.status === 'completed') cur.totalUzsTiyins += t.amountUzs;
    userLifetimeMap.set(t.userId, cur);

    const k = `${t.userId}::${t.recipientIdentifier}`;
    recipientCountMap.set(k, (recipientCountMap.get(k) ?? 0) + 1);
  }
})();

// =====================================================================
// Helpers
// =====================================================================

const userById = new Map<string, User>(USERS.map((u) => [u.id, u]));
const cardById = new Map<string, Card>(CARDS.map((c) => [c.id, c]));

export function getInternalNotes(transferId: string): InternalNote[] {
  return notesByTransfer.get(transferId) ?? [];
}

export function getProviderResponse(transferId: string): ProviderResponse | null {
  return providerByTransfer.get(transferId) ?? null;
}

export function getAdminActions(transferId: string): AdminActionEntry[] {
  return adminActionsByTransfer.get(transferId) ?? [];
}

export function getUserLifetime(userId: string): UserLifetimeStats {
  return userLifetimeMap.get(userId) ?? { count: 0, totalUzsTiyins: 0n };
}

export function getRecipientTransferCount(
  userId: string,
  recipientIdentifier: string,
): number {
  return recipientCountMap.get(`${userId}::${recipientIdentifier}`) ?? 0;
}

/**
 * Time (ms) since the transfer entered its current `processing` state. Used
 * to detect "stuck" transfers (≥ 5 min). Returns 0 for non-processing rows.
 */
export function getStuckMs(transfer: Transfer): number {
  if (transfer.status !== 'processing') return 0;
  const events = getEventsForTransfer(transfer.id);
  // Find the latest event that transitioned INTO processing.
  let lastProcessingAt: number | null = null;
  for (const ev of events) {
    if (ev.toStatus === 'processing') {
      lastProcessingAt = Math.max(lastProcessingAt ?? 0, ev.createdAt.getTime());
    }
  }
  const baseline = lastProcessingAt ?? transfer.createdAt.getTime();
  return Math.max(0, NOW.getTime() - baseline);
}

/**
 * Aggregated bundle for the detail page.
 */
export function getTransferDetail(id: string): TransferDetailBundle | null {
  const transfer = TRANSFERS_FULL.find((t) => t.id === id);
  if (!transfer) return null;

  const senderDeleted = SENDER_DELETED_IDS.has(id);
  const cardRemoved = CARD_REMOVED_IDS.has(id);
  const recipientDeleted = RECIPIENT_DELETED_IDS.has(id);

  return {
    transfer,
    events: getEventsForTransfer(id),
    amlFlags: getAmlFlagsForTransfer(id),
    internalNotes: getInternalNotes(id),
    providerResponse: getProviderResponse(id),
    adminActions: getAdminActions(id),
    user: senderDeleted ? null : (userById.get(transfer.userId) ?? null),
    card: cardRemoved ? null : (cardById.get(transfer.cardId) ?? null),
    senderDeleted,
    cardRemoved,
    recipientDeleted,
    userLifetime: getUserLifetime(transfer.userId),
    recipientTransferCount: getRecipientTransferCount(
      transfer.userId,
      transfer.recipientIdentifier,
    ),
  };
}

/**
 * Walk the cached filtered list of IDs to produce pager state.
 * Returns null entries when out of bounds; pager component disables them.
 */
export interface PagerNeighbors {
  position: number;        // 1-based
  total: number;
  prevId: string | null;
  nextId: string | null;
}

export function computeNeighbors(
  currentId: string,
  sortedIds: string[],
): PagerNeighbors | null {
  const idx = sortedIds.indexOf(currentId);
  if (idx === -1) return null;
  return {
    position: idx + 1,
    total: sortedIds.length,
    prevId: idx > 0 ? sortedIds[idx - 1] : null,
    nextId: idx + 1 < sortedIds.length ? sortedIds[idx + 1] : null,
  };
}
