import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { StoryStatus } from '@/data/mockStories';
import { STORY_STATUS_LABEL_KEY } from './types';

const TONE: Record<StoryStatus, string> = {
  published:
    'bg-success-50 text-success-700 ring-success-200 dark:bg-success-900/30 dark:text-success-300 dark:ring-success-800/50',
  scheduled:
    'bg-brand-50 text-brand-700 ring-brand-200 dark:bg-brand-900/30 dark:text-brand-300 dark:ring-brand-800/50',
  draft:
    'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-700',
  expired:
    'bg-muted text-muted-foreground ring-border',
};

export function StatusChip({
  status,
  className,
}: {
  status: StoryStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 tabular',
        TONE[status],
        className,
      )}
    >
      {t(STORY_STATUS_LABEL_KEY[status])}
    </span>
  );
}
