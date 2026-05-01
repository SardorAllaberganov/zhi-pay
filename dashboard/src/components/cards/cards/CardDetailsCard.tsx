import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatDate, formatDateTime, formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { isExpiringSoon, type CardEntry } from '@/data/mockCards';

const COUNTRY_FLAG: Record<string, string> = { UZ: '🇺🇿' };
const SCHEME_LABEL: Record<CardEntry['scheme'], string> = {
  uzcard: 'UzCard',
  humo: 'Humo',
};

interface Props {
  card: CardEntry;
}

export function CardDetailsCard({ card }: Props) {
  const expiringSoon = isExpiringSoon(card, 60);
  const isExpired = card.status === 'expired';
  const expiryStr = `${String(card.expiryMonth).padStart(2, '0')}/${String(card.expiryYear).slice(-2)}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('admin.cards.detail.section.card-details')}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <Row label={t('admin.cards.detail.field.scheme')} value={SCHEME_LABEL[card.scheme]} />
          <Row label={t('admin.cards.detail.field.bank')} value={card.bank} />
          <Row label={t('admin.cards.detail.field.holder')} value={card.holderName} />
          <Row
            label={t('admin.cards.detail.field.country')}
            value={
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden="true">{COUNTRY_FLAG[card.issuerCountry] ?? '🌐'}</span>
                <span>{card.issuerCountry}</span>
              </span>
            }
          />
          <Row
            label={t('admin.cards.detail.field.expiry')}
            value={
              <span
                className={cn(
                  'tabular',
                  isExpired && 'text-danger-700 dark:text-danger-600 font-medium',
                  !isExpired && expiringSoon && 'text-danger-700 dark:text-danger-600',
                )}
                title={
                  isExpired
                    ? t('admin.cards.detail.expiry-expired')
                    : expiringSoon
                      ? t('admin.cards.detail.expiry-soon')
                      : undefined
                }
              >
                {expiryStr}
                {expiringSoon && !isExpired && (
                  <span className="ml-2 text-xs uppercase tracking-wider">
                    {t('admin.cards.detail.expiry-soon-tag')}
                  </span>
                )}
              </span>
            }
          />
          <Row
            label={t('admin.cards.detail.field.tokenized-at')}
            value={
              <span className="tabular" title={formatDateTime(card.createdAt)}>
                {formatDate(card.createdAt)}
              </span>
            }
          />
          <Row
            label={t('admin.cards.detail.field.last-used')}
            value={
              card.lastUsedAt ? (
                <span title={formatDateTime(card.lastUsedAt)}>
                  {formatRelative(card.lastUsedAt)}
                </span>
              ) : (
                <span className="text-muted-foreground italic">
                  {t('admin.cards.last-used.never')}
                </span>
              )
            }
          />
          <Row
            label={t('admin.cards.detail.field.token')}
            value={
              <span className="font-mono tabular text-sm">{card.token}</span>
            }
          />
        </dl>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  );
}
