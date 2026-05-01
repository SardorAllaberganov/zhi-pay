import { ShieldAlert } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { SeverityBadge } from '@/components/zhipay/SeverityBadge';
import { StatusBadge } from '@/components/zhipay/StatusBadge';
import { cn, formatRelative, maskPinfl } from '@/lib/utils';
import { t } from '@/lib/i18n';
import {
  type AmlReview,
  getAmlUserById,
} from '@/data/mockAmlTriage';

interface AmlRowProps {
  review: AmlReview;
  selected: boolean;
  focused: boolean;
  checked: boolean;
  onCheckedChange: (id: string) => void;
  onSelect: (id: string) => void;
}

export function AmlRow({
  review,
  selected,
  focused,
  checked,
  onCheckedChange,
  onSelect,
}: AmlRowProps) {
  const user = getAmlUserById(review.userId);
  const phone = user?.phone ?? '+998 ••• ••• •• ••';
  const pinflMasked = user ? maskPinfl(user.pinfl) : '••••••••••••••';
  const description = review.description.length > 80
    ? review.description.slice(0, 80) + '…'
    : review.description;

  const isSanctions = review.flagType === 'sanctions';
  const isCritical = review.severity === 'critical';
  const hasFooter = !!review.transferId || !!review.assigneeName;

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
        // Critical / selected indicator drawn as an INSET box-shadow on the
        // left edge — sits inside the row's box so overflow-hidden / clip-path
        // on the master-detail wrapper doesn't clip it.
        isCritical && !selected && 'shadow-[inset_2px_0_0_theme(colors.danger.600)]',
        selected && 'bg-brand-50 dark:bg-brand-950/40 shadow-[inset_2px_0_0_theme(colors.brand.600)]',
        !selected && focused && 'bg-muted/40',
      )}
      data-aml-row
      data-row-id={review.id}
    >
      {/* line 1: checkbox · severity · type · {push} · status */}
      <div className="flex items-center gap-2 min-w-0">
        <div onClick={(e) => e.stopPropagation()} className="shrink-0">
          <Checkbox
            checked={checked}
            onCheckedChange={() => onCheckedChange(review.id)}
            aria-label={`Select flag ${review.id}`}
          />
        </div>

        {isSanctions && (
          <ShieldAlert
            className="h-4 w-4 shrink-0 text-danger-600"
            aria-label="Sanctions flag"
          />
        )}

        <SeverityBadge severity={review.severity} className="shrink-0" />
        <FlagTypeChip flagType={review.flagType} />

        <div className="ml-auto shrink-0">
          <StatusBadge status={review.status} domain="aml" className="shrink-0" />
        </div>
      </div>

      {/* line 2: phone · masked PINFL · {push} · age */}
      <div className="flex items-center gap-2 min-w-0 pl-[26px] text-sm text-muted-foreground tabular">
        <span className="font-medium text-foreground/90 truncate">{phone}</span>
        <span aria-hidden="true" className="shrink-0">·</span>
        <span className="font-mono shrink-0">{pinflMasked}</span>
        <span className="ml-auto shrink-0 tabular">
          {formatRelative(review.createdAt)}
        </span>
      </div>

      {/* line 3: description (truncated to 80) */}
      <div className="pl-[26px] text-sm text-foreground/80 truncate min-w-0">
        {description}
      </div>

      {/* line 4 (optional): linked-tx prefix · {push} · assignee */}
      {hasFooter && (
        <div className="flex items-center gap-2 pl-[26px] min-w-0 text-sm">
          {review.transferId && (
            <span className="font-mono tabular text-muted-foreground truncate">
              {t('admin.aml-triage.row.linked-transfer', {
                prefix: review.transferId.slice(0, 8),
              })}
            </span>
          )}
          {review.assigneeName ? (
            <span className="ml-auto text-muted-foreground truncate">
              {t('admin.aml-triage.row.assigned-prefix', {
                name: review.assigneeName,
              })}
            </span>
          ) : (
            <span className="ml-auto inline-flex items-center rounded-full border border-border bg-muted/40 px-2 py-px text-xs uppercase tracking-wider text-muted-foreground shrink-0">
              {t('admin.aml-triage.row.unassigned')}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- subcomponents ----------

function FlagTypeChip({ flagType }: { flagType: AmlReview['flagType'] }) {
  return (
    <span className="inline-flex items-center rounded-sm border border-border bg-muted/40 px-1.5 py-px text-xs font-medium uppercase tracking-wider text-muted-foreground shrink-0">
      {t(`admin.aml-triage.filter.type.${flagType}`)}
    </span>
  );
}
