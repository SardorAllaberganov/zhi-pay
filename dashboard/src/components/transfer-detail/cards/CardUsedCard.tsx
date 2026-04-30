import { ArrowRight, CreditCard as CreditCardIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MaskedPan } from '@/components/zhipay/MaskedPan';
import { SchemeLogo } from '@/components/zhipay/SchemeLogo';
import { StatusBadge } from '@/components/zhipay/StatusBadge';
import { t } from '@/lib/i18n';
import type { Card as UserCard, CardScheme } from '@/types';

interface Props {
  card: UserCard | null;
  cardRemoved: boolean;
  schemeFallback: CardScheme;
  maskedPanFallback: string;
  bankFallback: string;
  holderName: string;
  onOpenCard: (cardId: string) => void;
}

export function CardUsedCard({
  card,
  cardRemoved,
  schemeFallback,
  maskedPanFallback,
  bankFallback,
  holderName,
  onOpenCard,
}: Props) {
  const scheme = card?.scheme ?? schemeFallback;
  const maskedPan = card?.maskedPan ?? maskedPanFallback;
  const bank = card?.bankName ?? bankFallback;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('admin.transfer-detail.card.title')}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {cardRemoved ? (
              <CreditCardIcon className="h-7 w-7 text-muted-foreground/60" aria-hidden="true" />
            ) : (
              <SchemeLogo scheme={scheme} size="md" />
            )}
            <div className="min-w-0">
              <MaskedPan value={maskedPan} scheme={scheme} hideScheme className="text-base" />
              <div className="text-sm text-muted-foreground">
                {bank} · {holderName}
              </div>
            </div>
          </div>
          <div className="shrink-0">
            {cardRemoved ? (
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {t('admin.transfer-detail.card.removed')}
              </span>
            ) : card ? (
              <StatusBadge status={card.status} domain="card" />
            ) : null}
          </div>
        </div>

        {!cardRemoved && card && (
          <div className="flex items-center justify-end pt-3 mt-3 border-t">
            <button
              type="button"
              onClick={() => onOpenCard(card.id)}
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              {t('admin.transfer-detail.card.open')}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
