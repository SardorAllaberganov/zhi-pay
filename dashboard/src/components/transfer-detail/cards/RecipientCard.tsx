import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DestinationBadge } from '@/components/zhipay/DestinationBadge';
import { t } from '@/lib/i18n';
import type { Destination } from '@/types';

interface Props {
  destination: Destination;
  identifier: string;
  recipientTransferCount: number;
  recipientDeleted: boolean;
  /** Optional saved-recipient nickname (none on file in current mock). */
  nickname?: string;
  onOpenRecipient: () => void;
}

export function RecipientCard({
  destination,
  identifier,
  recipientTransferCount,
  recipientDeleted,
  nickname,
  onOpenRecipient,
}: Props) {
  const displayName = destination === 'wechat' ? '张伟' : '王明';

  const countLabel =
    recipientTransferCount <= 1
      ? t('admin.transfer-detail.recipient.transfer-count.first')
      : t('admin.transfer-detail.recipient.transfer-count.nth', { count: recipientTransferCount });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('admin.transfer-detail.recipient.title')}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <DestinationBadge destination={destination} />
            <div className="min-w-0">
              <div className="font-semibold truncate">{displayName}</div>
              {nickname && (
                <div className="text-sm text-muted-foreground truncate">"{nickname}"</div>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            {recipientDeleted ? (
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {t('admin.transfer-detail.recipient.deleted')}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full border border-success-600/30 bg-success-50 px-2 py-0.5 text-xs font-medium text-success-700 dark:bg-success-700/15 dark:text-success-600">
                {t('admin.transfer-detail.recipient.saved-badge')}
              </span>
            )}
          </div>
        </div>

        <div className="text-sm font-mono tabular text-foreground/90 break-all">
          {identifier}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 border-t text-sm">
          <div className="text-muted-foreground">{countLabel}</div>
          {!recipientDeleted && (
            <button
              type="button"
              onClick={onOpenRecipient}
              className="inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              {t('admin.transfer-detail.recipient.open')}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
