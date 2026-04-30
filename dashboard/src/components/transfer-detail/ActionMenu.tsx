/**
 * Action plan computation — given a transfer status (and stuck-detection),
 * produce the primary action + ordered list of "more" actions per the spec.
 */

import {
  Plus,
  RotateCw,
  XCircle,
  CheckCircle2,
  Undo2,
  HandCoins,
  type LucideIcon,
} from 'lucide-react';
import { ERROR_CODES } from '@/data/mock';
import type { Transfer, TransferStatus } from '@/types';

export type DetailActionKey =
  | 'add-note'
  | 'resend-webhook'
  | 'force-fail'
  | 'mark-completed'
  | 'reverse'
  | 'refund';

export const STUCK_MS = 5 * 60 * 1000;

export interface ActionDescriptor {
  key: DetailActionKey;
  /** Whether the action is enabled in the current state. */
  enabled: boolean;
  /** Whether the action's button should be styled destructive. */
  destructive: boolean;
  /** Tooltip explaining a disabled state. */
  disabledReason?: string;
  /** Optional chip rendered next to the label (e.g. "Stuck for 7m"). */
  chip?: string;
}

export interface ActionPlan {
  primary: ActionDescriptor;
  more: ActionDescriptor[];
}

export const ACTION_LABELS: Record<DetailActionKey, string> = {
  'add-note':         'admin.transfer-detail.action.add-note',
  'resend-webhook':   'admin.transfer-detail.action.resend-webhook',
  'force-fail':       'admin.transfer-detail.action.force-fail',
  'mark-completed':   'admin.transfer-detail.action.mark-completed',
  reverse:            'admin.transfer-detail.action.reverse',
  refund:             'admin.transfer-detail.action.refund',
};

export const ACTION_ICONS: Record<DetailActionKey, LucideIcon> = {
  'add-note': Plus,
  'resend-webhook': RotateCw,
  'force-fail': XCircle,
  'mark-completed': CheckCircle2,
  reverse: Undo2,
  refund: HandCoins,
};

/**
 * Compute the action plan for a transfer.
 *
 * `stuckMs` should be 0 for non-processing rows; the page passes
 * `getStuckMs(transfer)`.
 */
export function computeActionPlan(
  transfer: Transfer,
  stuckMs: number,
): ActionPlan {
  const status: TransferStatus = transfer.status;
  const failureCode = transfer.failureCode;
  const errorRow = failureCode
    ? ERROR_CODES.find((e) => e.code === failureCode)
    : undefined;
  const failedRetryable = !!errorRow?.retryable;
  const stuck = status === 'processing' && stuckMs >= STUCK_MS;

  const stuckChip = stuck
    ? `Stuck for ${Math.floor(stuckMs / 60_000)}m`
    : undefined;

  if (status === 'created') {
    return {
      primary: en('add-note'),
      more: [en('force-fail')],
    };
  }

  if (status === 'processing') {
    if (stuck) {
      return {
        primary: { ...en('force-fail'), destructive: true, chip: stuckChip },
        more: [en('resend-webhook'), en('mark-completed'), en('add-note')],
      };
    }
    return {
      primary: en('add-note'),
      more: [en('force-fail'), en('resend-webhook'), en('mark-completed')],
    };
  }

  if (status === 'completed') {
    return {
      primary: en('add-note'),
      more: [
        { ...en('reverse'), destructive: true },
        { ...en('refund'), destructive: true },
      ],
    };
  }

  if (status === 'failed') {
    if (failedRetryable) {
      return {
        primary: en('resend-webhook'),
        more: [en('add-note')],
      };
    }
    return {
      primary: en('add-note'),
      more: [
        {
          ...en('resend-webhook'),
          enabled: false,
          disabledReason: 'Failure code is not retryable.',
        },
      ],
    };
  }

  // reversed — terminal
  return {
    primary: en('add-note'),
    more: [],
  };
}

function en(key: DetailActionKey): ActionDescriptor {
  return {
    key,
    enabled: true,
    destructive: false,
  };
}
