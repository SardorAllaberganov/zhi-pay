import { useNavigate } from 'react-router-dom';
import { GripVertical, MoreVertical, ExternalLink, Pencil, Trash2, Send } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { type Story, getStatus } from '@/data/mockStories';
import { StatusChip } from './StatusChip';
import { TypeChip } from './TypeChip';
import { MediaPreview } from './MediaPreview';

interface StoryCardProps {
  story: Story;
  /** Drag-handle props from `useSortable` (only attached when published). */
  dragHandleProps?: {
    attributes: Record<string, unknown> | object;
    listeners: Record<string, unknown> | undefined;
    setActivatorNodeRef: (el: HTMLElement | null) => void;
    isDragging: boolean;
  };
  /** Card root listeners for keyboard focus (j/k) when grid is focused. */
  isFocused?: boolean;
  onFocus?: () => void;
  onPublish?: (story: Story) => void;
  onDelete?: (story: Story) => void;
}

function relativeFutureLabel(date: Date): { label: string; isUrgent: boolean } {
  const ms = date.getTime() - Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  return {
    label: formatDistanceToNow(date, { addSuffix: true }),
    isUrgent: ms > 0 && ms < oneDay,
  };
}

export function StoryCard({
  story,
  dragHandleProps,
  isFocused,
  onFocus,
  onPublish,
  onDelete,
}: StoryCardProps) {
  const navigate = useNavigate();
  const status = getStatus(story);
  const [menuOpen, setMenuOpen] = useState(false);

  const expiresLabel = story.expiresAt ? relativeFutureLabel(story.expiresAt) : null;
  const scheduledLabel =
    status === 'scheduled' && story.publishedAt ? relativeFutureLabel(story.publishedAt) : null;

  const isDragging = dragHandleProps?.isDragging ?? false;
  const showDragHandle = status === 'published' && Boolean(dragHandleProps);

  return (
    <div
      role="article"
      tabIndex={isFocused ? 0 : -1}
      onFocus={onFocus}
      className={cn(
        'group relative flex flex-col gap-3 rounded-lg border border-border bg-card p-3',
        'transition-shadow hover:shadow-md',
        isFocused && 'ring-2 ring-ring ring-offset-2',
        isDragging && 'opacity-60 ring-2 ring-brand-400 shadow-lg',
      )}
    >
      {/* Media preview with status chip + drag handle overlays */}
      <div className="relative">
        <MediaPreview url={story.mediaUrl} type={story.type} />

        {/* Top-left: status chip */}
        <div className="absolute left-2 top-2">
          <StatusChip status={status} />
        </div>

        {/* Top-right: drag handle (published only) */}
        {showDragHandle && dragHandleProps && (
          <button
            type="button"
            ref={dragHandleProps.setActivatorNodeRef}
            {...(dragHandleProps.attributes as Record<string, unknown>)}
            {...(dragHandleProps.listeners ?? {})}
            className={cn(
              'absolute right-2 top-2 inline-flex h-7 w-7 cursor-grab items-center justify-center rounded-md',
              'bg-background/80 text-muted-foreground ring-1 ring-border backdrop-blur-sm',
              'hover:text-foreground hover:bg-background',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'active:cursor-grabbing',
            )}
            aria-label={t('admin.stories.card.drag-handle')}
          >
            <GripVertical className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Title */}
      <div className="space-y-1">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
          {story.titleEn}
        </h3>
      </div>

      {/* Chips row: type + display order + cta-deep-link preview */}
      <div className="flex flex-wrap items-center gap-1.5">
        <TypeChip type={story.type} />
        {story.isPublished && story.displayOrder > 0 && (
          <span className="inline-flex items-center rounded-full bg-muted/60 px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-border tabular">
            #{story.displayOrder}
          </span>
        )}
        {story.ctaDeepLink && story.ctaLabelEn && (
          <span
            className="inline-flex max-w-[12rem] items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 ring-1 ring-brand-200 dark:bg-brand-900/30 dark:text-brand-300 dark:ring-brand-800/50"
            title={story.ctaLabelEn}
          >
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
            <span className="truncate">{story.ctaLabelEn}</span>
          </span>
        )}
      </div>

      {/* Expires / Scheduled meta */}
      <div className="text-sm text-muted-foreground tabular">
        {expiresLabel && (
          <span className={cn(expiresLabel.isUrgent && 'text-danger-700 dark:text-danger-500 font-medium')}>
            {t('admin.stories.card.expires-in', { rel: expiresLabel.label })}
          </span>
        )}
        {!expiresLabel && scheduledLabel && (
          <span>
            {t('admin.stories.card.scheduled-in', { rel: scheduledLabel.label })}
          </span>
        )}
        {!expiresLabel && !scheduledLabel && status === 'draft' && (
          <span>{t('admin.stories.card.draft-meta')}</span>
        )}
        {!expiresLabel && !scheduledLabel && status === 'published' && (
          <span>{t('admin.stories.card.no-expiry')}</span>
        )}
      </div>

      {/* Footer: actions menu + Edit link */}
      <div className="flex items-center justify-between border-t border-border/60 pt-3">
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label={t('admin.stories.card.actions')}
            >
              <MoreVertical className="h-4 w-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => navigate(`/content/stories/${story.id}`)}>
              <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
              {t('admin.stories.card.menu.edit')}
            </DropdownMenuItem>
            {(status === 'draft' || status === 'scheduled') && onPublish && (
              <DropdownMenuItem onClick={() => onPublish(story)}>
                <Send className="mr-2 h-4 w-4" aria-hidden="true" />
                {t('admin.stories.card.menu.publish-now')}
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(story)}
                  className="text-danger-700 focus:bg-danger-50 focus:text-danger-700 dark:text-danger-400 dark:focus:bg-danger-950/40"
                >
                  <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                  {t('admin.stories.card.menu.delete')}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          className="text-sm"
          onClick={() => navigate(`/content/stories/${story.id}`)}
        >
          {t('admin.stories.card.edit-link')}
        </Button>
      </div>
    </div>
  );
}

export function StoryCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3">
      <div className="aspect-[16/9] w-full animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
      <div className="flex gap-1.5">
        <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
        <div className="h-5 w-10 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="h-3 w-32 animate-pulse rounded bg-muted" />
      <div className="border-t border-border/60 pt-3">
        <div className="h-7 w-24 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
