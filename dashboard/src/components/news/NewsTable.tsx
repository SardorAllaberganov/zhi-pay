import { type RefObject } from 'react';
import { MoreHorizontal, Pencil, Trash2, FileText, Send, Eye, ExternalLink } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  /** Active locale used when picking which title to render in the title cell. */
  adminLocale: LocaleCode;
  rowRefs?: RefObject<Record<string, HTMLTableRowElement | null>>;
}

const SKELETON_COUNT = 8;

export function NewsTable(props: Props) {
  const { rows, loading, focusedId, setFocusedId, onOpen, adminLocale, rowRefs } = props;

  return (
    <div className="rounded-md border border-border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[88px]">{t('admin.news.column.image')}</TableHead>
            <TableHead>{t('admin.news.column.title')}</TableHead>
            <TableHead className="w-[120px]">{t('admin.news.column.status')}</TableHead>
            <TableHead className="w-[180px]">{t('admin.news.column.published-at')}</TableHead>
            <TableHead className="w-[160px]">{t('admin.news.column.created-at')}</TableHead>
            <TableHead className="w-[60px] text-right">
              <span className="sr-only">{t('admin.news.column.actions')}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: SKELETON_COUNT }).map((_, i) => <SkeletonRow key={i} />)
            : rows.map((n) => (
                <Row
                  key={n.id}
                  row={n}
                  isFocused={focusedId === n.id}
                  onFocus={() => setFocusedId(n.id)}
                  onOpen={() => onOpen(n.id)}
                  onPublishNow={() => props.onPublishNow(n.id)}
                  onUnpublish={() => props.onUnpublish(n.id)}
                  onDelete={() => props.onDelete(n.id)}
                  onOpenAudit={() => props.onOpenAudit(n.id)}
                  adminLocale={adminLocale}
                  rowRef={(el) => {
                    if (rowRefs?.current) rowRefs.current[n.id] = el;
                  }}
                />
              ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Row({
  row,
  isFocused,
  onFocus,
  onOpen,
  onPublishNow,
  onUnpublish,
  onDelete,
  onOpenAudit,
  adminLocale,
  rowRef,
}: {
  row: News;
  isFocused: boolean;
  onFocus: () => void;
  onOpen: () => void;
  onPublishNow: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
  onOpenAudit: () => void;
  adminLocale: LocaleCode;
  rowRef: (el: HTMLTableRowElement | null) => void;
}) {
  const filled = computeLocaleFilled(row);
  const titleByLocale: Record<LocaleCode, string> = {
    uz: row.titleUz,
    ru: row.titleRu,
    en: row.titleEn,
  };
  const title = titleByLocale[adminLocale] || row.titleEn || row.titleUz || row.titleRu;

  return (
    <TableRow
      ref={rowRef}
      data-row-id={row.id}
      tabIndex={-1}
      onClick={onOpen}
      onFocus={onFocus}
      className={cn(
        'cursor-pointer transition-colors',
        isFocused && 'bg-brand-50/40 dark:bg-brand-950/20',
        'hover:bg-muted/50',
      )}
    >
      <TableCell className="py-2">
        <ImagePreview url={row.imageUrl} alt={title} size="thumb" />
      </TableCell>
      <TableCell className="py-2">
        <div className="space-y-1.5 min-w-0">
          <div className="text-sm font-medium text-foreground line-clamp-2 max-w-[640px]">
            {title || <span className="italic text-muted-foreground">{t('admin.news.column.title-empty')}</span>}
          </div>
          <LocaleFillIndicator filled={filled} />
        </div>
      </TableCell>
      <TableCell className="py-2">
        <StatusChip status={row.isPublished ? 'published' : 'draft'} />
      </TableCell>
      <TableCell className="py-2">
        {row.publishedAt ? (
          <div className="space-y-0.5">
            <div className="text-sm text-foreground tabular tabular-nums">
              {formatDateTime(row.publishedAt)}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatRelative(row.publishedAt)}
            </div>
          </div>
        ) : (
          <span className="text-sm italic text-muted-foreground">
            {t('admin.news.column.published-at-none')}
          </span>
        )}
      </TableCell>
      <TableCell className="py-2">
        <div className="space-y-0.5">
          <div className="text-sm text-foreground tabular tabular-nums">
            {formatDateTime(row.createdAt)}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatRelative(row.createdAt)}
          </div>
        </div>
      </TableCell>
      <TableCell className="py-2 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">{t('admin.news.column.actions')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={onOpen}>
              <Pencil className="h-4 w-4 mr-2" aria-hidden="true" />
              {t('admin.news.row.edit')}
            </DropdownMenuItem>
            {row.isPublished ? (
              <>
                <DropdownMenuItem onClick={() => window.open(`/content/news/${row.id}?preview=1`, '_blank', 'noopener')}>
                  <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
                  {t('admin.news.row.preview')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onUnpublish}>
                  <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
                  {t('admin.news.row.unpublish')}
                </DropdownMenuItem>
              </>
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
      </TableCell>
    </TableRow>
  );
}

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell className="py-2"><Skeleton className="h-10 w-[60px] rounded-md" /></TableCell>
      <TableCell className="py-2">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-20" />
        </div>
      </TableCell>
      <TableCell className="py-2"><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
      <TableCell className="py-2">
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </TableCell>
      <TableCell className="py-2">
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </TableCell>
      <TableCell className="py-2 text-right">
        <Skeleton className="h-8 w-8 rounded-md ml-auto" />
      </TableCell>
    </TableRow>
  );
}
