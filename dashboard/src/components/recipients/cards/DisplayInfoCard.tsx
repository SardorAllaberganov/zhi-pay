import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DestinationBadge } from '@/components/zhipay/DestinationBadge';
import { t } from '@/lib/i18n';
import type { RecipientEntry } from '@/data/mockRecipients';

interface DisplayInfoCardProps {
  recipient: RecipientEntry;
}

export function DisplayInfoCard({ recipient }: DisplayInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.recipients.detail.display-info')}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-[140px_1fr]">
          <Row label={t('admin.recipients.column.destination')}>
            <DestinationBadge destination={recipient.destination} />
          </Row>
          <Row label={t('admin.recipients.column.identifier')}>
            <span className="tabular font-mono break-all">{recipient.identifier}</span>
          </Row>
          <Row label={t('admin.recipients.column.display-name')}>
            {/* CJK script renders verbatim — no transliteration. */}
            <span>{recipient.displayName}</span>
          </Row>
          <Row label={t('admin.recipients.column.nickname')}>
            {recipient.nickname ? (
              <span>{recipient.nickname}</span>
            ) : (
              <span className="text-muted-foreground italic">
                {t('admin.recipients.detail.nickname.empty')}
              </span>
            )}
          </Row>
        </dl>
      </CardContent>
    </Card>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="text-foreground sm:pl-0">{children}</dd>
    </>
  );
}
