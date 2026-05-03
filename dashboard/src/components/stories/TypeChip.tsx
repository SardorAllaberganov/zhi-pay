import { Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { StoryType } from '@/data/mockStories';
import { STORY_TYPE_LABEL_KEY } from './types';

export function TypeChip({
  type,
  duration,
  className,
}: {
  type: StoryType;
  /** Optional duration suffix for video, e.g. "0:30". */
  duration?: string;
  className?: string;
}) {
  const Icon = type === 'video' ? VideoIcon : ImageIcon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-border',
        className,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span>{t(STORY_TYPE_LABEL_KEY[type])}</span>
      {type === 'video' && duration && <span className="tabular text-muted-foreground/80">{duration}</span>}
    </span>
  );
}
