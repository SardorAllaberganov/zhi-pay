import { type RefObject } from 'react';
import { MoreHorizontal, Pencil, Trash2, FileText, Send, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatDateTime, formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { LocaleCode } from '@/components/zhipay/LocaleFlag';
import type { News } from '@/data/mockNews';
import { ImagePreview } from './ImagePreview';
import { StatusChip } from './StatusChip';
import { LocaleFillIndicator, computeLocaleFilled } from './LocaleFillIndicator';

interface Props {
  rows: News[];
  loading: boolean;
  focusedId: string | null;
  setFocusedId: (id: string | null) => void;
  onOpen: (id: string) => void;
  onPublishNow: (id: string) => void;
  onUnpublish: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenAudit: (id: string) => void;
  adminLocale: LocaleCode;
  rowRefs?: RefObject<Record<string, HTMLDivElement | null>>;
}

const SKELETON_COUNT = 8;

export function NewsMobileCardStack(props: Props) {
  const { rows, loading, focusedId, setFocusedId, onOpen, adminLocale, rowRefs } = props;

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => {
        const filled = computeLocaleFilled(row);
        const titleByLocale: Record<LocaleCode, string> = {
          uz: row.titleUz,
          ru: row.titleRu,
          en: row.titleEn,
        };
        const title = titleByLocale[adminLocale] || row.titleEn || row.titleUz || row.titleRu;
        const isFocused = focusedId === row.id;
        return (
          <div
            key={row.id}
            ref={(el) => {
              if (rowRefs?.current) rowRefs.current[row.id] = el;
            }}
            data-row-id={row.id}
            tabIndex={-1}
            onClick={() => onOpen(row.id)}
            onFocus={() => setFocusedId(row.id)}
            className={cn(
              'flex gap-3 rounded-md border bg-card p-3 cursor-pointer transition-colors',
              isFocused
                ? 'border-brand-600 bg-brand-50/40 dark:bg-brand-950/20 shadow-sm'
                : 'border-border hover:bg-muted/50',
            )}
          >
            <ImagePreview url={row.imageUrl} alt={title} size="rail" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-medium text-foreground line-clamp-2 break-words">
                  {title || <span className="italic text-muted-foreground">{t('admin.news.column.title-empty')}</span>}
                </div>
                <RowKebab
                  isPublished={row.isPublished}
                  onOpen={() => onOpen(row.id)}
                  onPublishNow={() => props.onPublishNow(row.id)}
                  onUnpublish={() => props.onUnpublish(row.id)}
                  onDelete={() => props.onDelete(row.id)}
                  onOpenAudit={() => props.onOpenAudit(row.id)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusChip status={row.isPublished ? 'published' : 'draft'} />
                <LocaleFillIndicator filled={filled} />
              </div>
              <div className="text-sm text-muted-foreground">
                {row.publishedAt
                  ? `${t('admin.news.column.published-at')} · ${formatRelative(row.publishedAt)}`
                  : t('admin.news.column.published-at-none')}
                <span className="mx-1.5 opacity-50">·</span>
                {formatDateTime(row.createdAt)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RowKebab({
  isPublished,
  onOpen,
  onPublishNow,
  onUnpublish,
  onDelete,
  onOpenAudit,
}: {
  isPublished: boolean;
  onOpen: () => void;
  onPublishNow: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
  onOpenAudit: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0">
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">{t('admin.news.column.actions')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={onOpen}>
          <Pencil className="h-4 w-4 mr-2" aria-hidden="true" />
          {t('admin.news.row.edit')}
        </DropdownMenuItem>
        {isPublished ? (
          <DropdownMenuItem onClick={onUnpublish}>
            <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
            {t('admin.news.row.unpublish')}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={onPublishNow}>
            <Send className="h-4 w-4 mr-2" aria-hidden="true" />
            {t('admin.news.row.publish-now')}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onOpenAudit}>
          <ExternalLink className="h-4 w-4 mr-2" aria-hidden="true" />
          {t('admin.news.row.open-audit')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="text-danger-700 focus:text-danger-700 dark:text-danger-500 dark:focus:text-danger-500"
        >
          <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
          {t('admin.news.row.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SkeletonCard() {
  return (
    <div className="flex gap-3 rounded-md border border-border bg-card p-3">
      <Skeleton className="h-16 w-[88px] rounded-md shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
