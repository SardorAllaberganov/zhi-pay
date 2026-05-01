import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { AuditAction } from '@/data/mockAuditLog';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const ACTION_TONES: Record<AuditAction, Tone> = {
  created:        'info',
  updated:        'neutral',
  deleted:        'danger',
  status_changed: 'neutral',
  approved:       'success',
  rejected:       'danger',
  cleared:        'success',
  escalated:      'warning',
  frozen:         'warning',
  unfrozen:       'success',
  reversed:       'warning',
  failed:         'danger',
};

const TONE_CLASSES: Record<Tone, { bg: string; text: string; border: string }> = {
  neutral: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-300/60 dark:border-slate-700',
  },
  success: {
    bg: 'bg-success-50 dark:bg-success-700/15',
    text: 'text-success-700 dark:text-success-600',
    border: 'border-success-600/20',
  },
  warning: {
    bg: 'bg-warning-50 dark:bg-warning-700/15',
    text: 'text-warning-700 dark:text-warning-600',
    border: 'border-warning-600/20',
  },
  danger: {
    bg: 'bg-danger-50 dark:bg-danger-700/15',
    text: 'text-danger-700 dark:text-danger-600',
    border: 'border-danger-600/20',
  },
  info: {
    bg: 'bg-brand-50 dark:bg-brand-950/40',
    text: 'text-brand-700 dark:text-brand-300',
    border: 'border-brand-600/20',
  },
};

interface ActionChipProps {
  action: AuditAction;
  className?: string;
}

export function ActionChip({ action, className }: ActionChipProps) {
  const tone = ACTION_TONES[action];
  const c = TONE_CLASSES[tone];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium',
        c.bg,
        c.text,
        c.border,
        className,
      )}
    >
      {t(`admin.audit-log.action.${action}`)}
    </span>
  );
}
