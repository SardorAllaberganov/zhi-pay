import { MoreVertical } from 'lucide-react';
import { cn, formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { TierBadge } from './TierBadge';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { AmlSeverity, KycStatus, KycTier, AmlFlagStatus } from '@/types';

type QueueRowKind = 'kyc' | 'aml';

interface KycRowData {
  kind: 'kyc';
  id: string;
  tier: KycTier;
  identifier: string; // phone
  pinflLast4: string;
  submittedAt: Date;
  status: KycStatus;
}

interface AmlRowData {
  kind: 'aml';
  id: string;
  severity: AmlSeverity;
  identifier: string; // user name
  flagType: string;
  submittedAt: Date;
  status: AmlFlagStatus;
}

type QueueRowData = KycRowData | AmlRowData;

interface ReviewQueueRowProps {
  data: QueueRowData;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onOpen?: (id: string) => void;
  onAction?: (action: 'approve' | 'reject' | 'escalate' | 'clear', id: string) => void;
  className?: string;
}

/**
 * Composable row for KYC and AML queues.
 * Uses checkbox + tier/severity badge + identifier + meta + status + actions.
 */
export function ReviewQueueRow({
  data,
  selected,
  onSelect,
  onOpen,
  onAction: _onAction,
  className,
}: ReviewQueueRowProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-3 border-b border-border px-3 py-2 transition-colors hover:bg-muted/50',
        selected && 'bg-brand-50 dark:bg-brand-950/40 border-l-2 border-l-brand-600',
        className,
      )}
      onClick={() => onOpen?.(data.id)}
      role="row"
      tabIndex={0}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={() => onSelect?.(data.id)}
        onClick={(e) => e.stopPropagation()}
        aria-label="Select row"
      />

      {data.kind === 'kyc' ? (
        <TierBadge tier={data.tier} className="shrink-0" />
      ) : (
        <SeverityBadge severity={data.severity} className="shrink-0" />
      )}

      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{data.identifier}</div>
        {data.kind === 'kyc' ? (
          <div className="text-sm text-muted-foreground tabular font-mono">
            ••••••••••{data.pinflLast4}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground capitalize">{data.flagType}</div>
        )}
      </div>

      <div className="text-sm text-muted-foreground tabular shrink-0">
        {formatRelative(data.submittedAt)}
      </div>

      {data.kind === 'kyc' ? (
        <StatusBadge status={data.status} domain="kyc" className="shrink-0" />
      ) : (
        <StatusBadge status={data.status} domain="aml" className="shrink-0" />
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={(e) => e.stopPropagation()}
        aria-label={t('common.actions.help')}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
    </div>
  );
}
