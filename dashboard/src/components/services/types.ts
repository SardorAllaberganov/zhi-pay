import type { ServiceStatus } from '@/types';
import type { ServiceFull } from '@/data/mockServices';
import { deriveHealth } from '@/data/mockServices';

/**
 * Compute the "status disagrees with health" overlay shown on tiles.
 * Returns a tone color when there's an overlay to render, or `null` when
 * configured-status + observed-health agree.
 *
 *   - active service with red health   → 'red'
 *   - active service with amber health → 'amber'
 *   - maintenance / disabled           → null (status badge is the truth)
 *   - active service with green health → null
 */
export function healthOverlayTone(svc: ServiceFull): 'amber' | 'red' | null {
  if (svc.status !== 'active') return null;
  const h = deriveHealth(svc);
  if (h === 'red') return 'red';
  if (h === 'amber') return 'amber';
  return null;
}

/** Stable button-tone helpers. */
export const STATUS_TONES: Record<ServiceStatus, { dot: string; bg: string; text: string; ring: string }> = {
  active: {
    dot: 'bg-success-600',
    bg: 'bg-success-50 dark:bg-success-700/15',
    text: 'text-success-700 dark:text-success-600',
    ring: 'ring-success-600/30',
  },
  maintenance: {
    dot: 'bg-warning-600',
    bg: 'bg-warning-50 dark:bg-warning-700/15',
    text: 'text-warning-700 dark:text-warning-600',
    ring: 'ring-warning-600/30',
  },
  disabled: {
    dot: 'bg-danger-600',
    bg: 'bg-danger-50 dark:bg-danger-700/15',
    text: 'text-danger-700 dark:text-danger-600',
    ring: 'ring-danger-600/30',
  },
};
