import { CheckCircle2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { NewsStatus } from '@/data/mockNews';
import { NEWS_STATUS_LABEL_KEY } from './types';

const PALETTE: Record<NewsStatus, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
  published: {
    bg: 'bg-success-50 dark:bg-success-900/30',
    text: 'text-success-700 dark:text-success-300',
    icon: CheckCircle2,
  },
  draft: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    icon: FileText,
  },
};

interface Props {
  status: NewsStatus;
  className?: string;
}

export function StatusChip({ status, className }: Props) {
  const { bg, text, icon: Icon } = PALETTE[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        bg,
        text,
        className,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {t(NEWS_STATUS_LABEL_KEY[status])}
    </span>
  );
}
