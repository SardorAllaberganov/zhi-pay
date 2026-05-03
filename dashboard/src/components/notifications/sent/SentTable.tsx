import { type RefObject } from 'react';
import { ArrowRightLeft, Megaphone, Settings as SettingsIcon, ShieldAlert, type LucideIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar } from '@/components/users/UserAvatar';
import { cn, formatDateTime, formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { LocaleCode } from '@/components/zhipay/LocaleFlag';
import type { Notification, NotificationType } from '@/data/mockNotifications';
import { StatusChip } from './StatusChip';
import { AudienceCell } from './AudienceCell';

interface Props {
  rows: Notification[];
  loading: boolean;
  focusedId: string | null;
  setFocusedId: (id: string | null) => void;
  onOpen: (id: string) => void;
  adminLocale: LocaleCode;
  rowRefs?: RefObject<Record<string, HTMLTableRowElement | null>>;
}

const SKELETON_COUNT = 8;

const TYPE_ICONS: Record<NotificationType, LucideIcon> = {
  transfer: ArrowRightLeft,
  promo: Megaphone,
  system: SettingsIcon,
  compliance: ShieldAlert,
};

export function SentTable({
  rows,
  loading,
  focusedId,
  setFocusedId,
  onOpen,
  adminLocale,
  rowRefs,
}: Props) {
  return (
    <div className="rounded-md border border-border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">
              {t('admin.notifications.sent.column.sent-at')}
            </TableHead>
            <TableHead className="w-[140px]">
              {t('admin.notifications.sent.column.type')}
            </TableHead>
            <TableHead className="w-[240px]">
              {t('admin.notifications.sent.column.audience')}
            </TableHead>
            <TableHead>{t('admin.notifications.sent.column.title')}</TableHead>
            <TableHead className="w-[180px]">
              {t('admin.notifications.sent.column.read-rate')}
            </TableHead>
            <TableHead className="w-[160px]">
              {t('admin.notifications.sent.column.sent-by')}
            </TableHead>
            <TableHead className="w-[100px]">
              {t('admin.notifications.sent.column.status')}
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
  adminLocale,
  rowRef,
}: {
  row: Notification;
  isFocused: boolean;
  onFocus: () => void;
  onOpen: () => void;
  adminLocale: LocaleCode;
  rowRef: (el: HTMLTableRowElement | null) => void;
}) {
  const Icon = TYPE_ICONS[row.type];
  const title = pickTitle(row, adminLocale);
  const sentAtRef = row.sentAt ?? row.scheduledFor ?? row.createdAt;

  return (
    <TableRow
      ref={rowRef}
      onClick={(e) => {
        // Avoid navigating when text is being selected
        if ((e.target as HTMLElement).closest('button, a, [role="button"]')) return;
        onOpen();
      }}
      onFocus={onFocus}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen();
      }}
      className={cn(
        'cursor-pointer transition-colors',
        isFocused && 'bg-muted/40',
      )}
    >
      <TableCell>
        <div className="flex flex-col">
          <span
            className="text-sm font-medium tabular"
            title={formatDateTime(sentAtRef, adminLocale === 'en' ? 'en' : 'ru')}
          >
            {row.sentAt
              ? formatRelative(sentAtRef)
              : row.scheduledFor
                ? t('admin.notifications.sent.scheduled-for').replace(
                    '{time}',
                    formatRelative(sentAtRef),
                  )
                : '—'}
          </span>
          <span className="text-sm text-muted-foreground tabular">
            {formatDateTime(sentAtRef, adminLocale === 'en' ? 'en' : 'ru')}
          </span>
        </div>
      </TableCell>

      <TableCell>
        <div className="inline-flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          <span className="text-sm">{t(`admin.notifications.compose.type.${row.type}`)}</span>
        </div>
      </TableCell>

      <TableCell className="min-w-0">
        <AudienceCell notification={row} />
      </TableCell>

      <TableCell className="min-w-0">
        <span className="text-sm font-medium truncate block max-w-[420px]" title={title}>
          {title}
        </span>
      </TableCell>

      <TableCell>
        <ReadRateCell notification={row} />
      </TableCell>

      <TableCell className="min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <UserAvatar name={row.composedBy.name} size="sm" />
          <span className="text-sm truncate">{row.composedBy.name}</span>
        </div>
      </TableCell>

      <TableCell>
        <StatusChip status={row.status} />
      </TableCell>
    </TableRow>
  );
}

function ReadRateCell({ notification }: { notification: Notification }) {
  // Single-user audience: no aggregate read-rate concept — em-dash.
  if (notification.audienceType === 'single') {
    return <span className="text-sm text-muted-foreground tabular">—</span>;
  }
  // Pre-send (scheduled) or no stats yet: em-dash.
  if (notification.deliveredCount === null || notification.openedCount === null) {
    return <span className="text-sm text-muted-foreground tabular">—</span>;
  }
  if (notification.deliveredCount === 0) {
    return <span className="text-sm text-muted-foreground tabular">0%</span>;
  }
  const rate = (notification.openedCount / notification.deliveredCount) * 100;
  const pct = Math.round(rate);

  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-brand-500"
          style={{ width: `${pct}%` }}
          aria-hidden
        />
      </div>
      <span className="text-sm font-medium tabular shrink-0">{pct}%</span>
    </div>
  );
}

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-40" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-64" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-28" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16 rounded-full" />
      </TableCell>
    </TableRow>
  );
}

function pickTitle(n: Notification, locale: LocaleCode): string {
  if (locale === 'uz') return n.titleUz;
  if (locale === 'ru') return n.titleRu;
  return n.titleEn;
}
