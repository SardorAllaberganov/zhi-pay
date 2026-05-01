import { Cpu, User as UserIcon, Webhook, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { AuditActorType } from '@/data/mockAuditLog';

const PALETTE: Record<
  AuditActorType,
  { bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  system: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-300/60 dark:border-slate-700',
    icon: Cpu,
  },
  user: {
    bg: 'bg-brand-50 dark:bg-brand-950/40',
    text: 'text-brand-700 dark:text-brand-300',
    border: 'border-brand-600/20',
    icon: UserIcon,
  },
  provider: {
    bg: 'bg-success-50 dark:bg-success-700/15',
    text: 'text-success-700 dark:text-success-600',
    border: 'border-success-600/20',
    icon: Webhook,
  },
  admin: {
    bg: 'bg-warning-50 dark:bg-warning-700/15',
    text: 'text-warning-700 dark:text-warning-600',
    border: 'border-warning-600/20',
    icon: ShieldCheck,
  },
};

interface ActorTypeChipProps {
  type: AuditActorType;
  className?: string;
}

export function ActorTypeChip({ type, className }: ActorTypeChipProps) {
  const p = PALETTE[type];
  const Icon = p.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium',
        p.bg,
        p.text,
        p.border,
        className,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {t(`admin.audit-log.actor-type.${type}`)}
    </span>
  );
}
