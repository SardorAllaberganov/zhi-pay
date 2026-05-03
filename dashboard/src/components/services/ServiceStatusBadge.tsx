import { CheckCircle2, Wrench, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ServiceStatus } from '@/types';
import { STATUS_TONES } from './types';

interface ServiceStatusBadgeProps {
  status: ServiceStatus;
  size?: 'sm' | 'md';
  className?: string;
}

const ICONS = {
  active: CheckCircle2,
  maintenance: Wrench,
  disabled: Ban,
} as const;

export function ServiceStatusBadge({ status, size = 'sm', className }: ServiceStatusBadgeProps) {
  const tone = STATUS_TONES[status];
  const Icon = ICONS[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' ? 'h-6 px-2.5 text-xs' : 'h-7 px-3 text-sm',
        tone.bg,
        tone.text,
        className,
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden="true" />
      {t(`admin.services.status.${status}`)}
    </span>
  );
}
