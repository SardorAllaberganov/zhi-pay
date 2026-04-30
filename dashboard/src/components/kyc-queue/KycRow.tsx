import { CreditCard, FileText } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { TierBadge } from '@/components/zhipay/TierBadge';
import { StatusBadge } from '@/components/zhipay/StatusBadge';
import { cn, formatRelative, maskDocNumber } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { KycReview } from '@/data/mockKycQueue';
import { isExpiringSoon, pendingMinutesAge } from '@/data/mockKycQueue';

interface KycRowProps {
  review: KycReview;
  selected: boolean;
  focused: boolean;
  checked: boolean;
  onCheckedChange: (id: string) => void;
  onSelect: (id: string) => void;
}

/**
 * KYC-queue list row — two stacked lines:
 *   line 1: [✓] phone           [status badge]
 *   line 2: [tier]  [doc-icon Passport AB••••567 · 2h ago · "Reviewing: …"]
 */
export function KycRow({
  review,
  selected,
  focused,
  checked,
  onCheckedChange,
  onSelect,
}: KycRowProps) {
  const masked = maskDocNumber(review.documentNumber);
  const docLabel =
    review.documentType === 'passport'
      ? t('admin.kyc-queue.row.passport')
      : t('admin.kyc-queue.row.id-card');

  const expiring = isExpiringSoon(review);
  const pendingMin = pendingMinutesAge(review);

  return (
    <div
      role="button"
      tabIndex={focused ? 0 : -1}
      onClick={() => onSelect(review.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onSelect(review.id);
        }
      }}
      className={cn(
        'flex flex-col gap-1.5 border-b border-border px-3 py-2.5 cursor-pointer transition-colors min-w-0',
        'hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
        selected && 'bg-brand-50 dark:bg-brand-950/40 border-l-2 border-l-brand-600 -ml-[2px]',
        !selected && focused && 'bg-muted/40',
      )}
      data-kyc-row
      data-row-id={review.id}
    >
      {/* line 1: checkbox + phone + status badge */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div onClick={(e) => e.stopPropagation()} className="shrink-0">
          <Checkbox
            checked={checked}
            onCheckedChange={() => onCheckedChange(review.id)}
            aria-label={`Select ${review.userPhone}`}
          />
        </div>
        <div className="flex-1 min-w-0 truncate text-sm font-medium tabular">
          {review.userPhone}
        </div>
        <StatusBadge status={review.status} domain="kyc" className="shrink-0" />
      </div>

      {/* line 2: tier + doc-icon + masked + submitted-age */}
      <div className="flex items-center gap-2 min-w-0 pl-[26px]">
        <TierBadge tier={review.resultingTier} className="shrink-0" />
        <div className="flex items-center gap-1.5 min-w-0 text-sm text-muted-foreground">
          {review.documentType === 'passport' ? (
            <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          ) : (
            <CreditCard className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          )}
          <span className="truncate font-mono tabular">
            {docLabel} {masked}
          </span>
          <span aria-hidden="true">·</span>
          <span className="shrink-0 tabular">{formatRelative(review.submittedAt)}</span>
        </div>
      </div>

      {/* Optional line 3: assignee + expiring chip (only when relevant) */}
      {(review.assigneeName || expiring) && (
        <div className="flex items-center gap-2 pl-[26px]">
          {review.assigneeName && (
            <span className="text-sm text-muted-foreground truncate">
              {t('admin.kyc-queue.row.assignee-prefix', { name: review.assigneeName })}
            </span>
          )}
          {expiring && (
            <span className="inline-flex items-center rounded-full border border-warning-600/30 bg-warning-50 px-2 py-px text-xs font-medium text-warning-700 dark:bg-warning-700/15 dark:text-warning-600">
              {t('admin.kyc-queue.row.expiring-in', {
                minutes: 15 - pendingMin,
              })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
