import { CheckCircle2, Clock, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { NotificationStatus } from '@/data/mockNotifications';
import { NOTIFICATION_STATUS_LABEL_KEY } from '../types';

const TONE: Record<NotificationStatus, string> = {
  sent: 'border-success-300 bg-success-50 text-success-700 dark:border-success-700/40 dark:bg-success-950/30 dark:text-success-400',
  scheduled: 'border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-700/40 dark:bg-brand-950/30 dark:text-brand-300',
  cancelled: 'border-border bg-muted text-muted-foreground',
  failed: 'border-danger-300 bg-danger-50 text-danger-700 dark:border-danger-700/40 dark:bg-danger-950/30 dark:text-danger-400',
  sending: 'border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-700/40 dark:bg-brand-950/30 dark:text-brand-300',
};

const ICON: Record<NotificationStatus, React.ReactElement> = {
  sent: <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />,
  scheduled: <Clock className="h-3.5 w-3.5" aria-hidden />,
  cancelled: <XCircle className="h-3.5 w-3.5" aria-hidden />,
  failed: <AlertTriangle className="h-3.5 w-3.5" aria-hidden />,
  sending: <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />,
};

interface Props {
  status: NotificationStatus;
  className?: string;
}

export function StatusChip({ status, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 h-6 text-xs font-medium',
        TONE[status],
        className,
      )}
    >
      {ICON[status]}
      {t(NOTIFICATION_STATUS_LABEL_KEY[status])}
    </span>
  );
}
