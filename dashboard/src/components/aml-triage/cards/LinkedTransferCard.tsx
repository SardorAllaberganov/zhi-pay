import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/zhipay/StatusBadge';
import { SchemeLogo } from '@/components/zhipay/SchemeLogo';
import { DestinationBadge } from '@/components/zhipay/DestinationBadge';
import { formatMoney } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { getTransferById } from '@/data/mockTransfers';

interface LinkedTransferCardProps {
  transferId: string | undefined;
  onOpen: (transferId: string) => void;
}

export function LinkedTransferCard({ transferId, onOpen }: LinkedTransferCardProps) {
  if (!transferId) {
    return (
      <Card>
        <CardHeader className="py-4">
          <CardTitle>{t('admin.aml-triage.detail.linked-transfer')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            {t('admin.aml-triage.detail.linked-transfer.none')}
          </p>
        </CardContent>
      </Card>
    );
  }

  const transfer = getTransferById(transferId);

  if (!transfer) {
    return (
      <Card>
        <CardHeader className="py-4">
          <CardTitle>{t('admin.aml-triage.detail.linked-transfer')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            Transfer record not found ({transferId.slice(0, 8)}…). It may have been hard-deleted.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="py-4 flex-row items-center justify-between space-y-0">
        <CardTitle>{t('admin.aml-triage.detail.linked-transfer')}</CardTitle>
        <Button variant="outline" size="sm" onClick={() => onOpen(transfer.id)}>
          <ExternalLink className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
          {t('admin.aml-triage.detail.linked-transfer.open')}
        </Button>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center gap-2">
          <span className="font-mono tabular text-sm">{transfer.id}</span>
          <StatusBadge status={transfer.status} domain="transfer" />
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <Field label={t('admin.aml-triage.detail.linked-transfer.amount')}>
            <div className="flex items-center gap-2 text-sm font-semibold tabular">
              <span>{formatMoney(transfer.amountUzs, 'UZS')}</span>
              <span aria-hidden="true">→</span>
              <span>{formatMoney(transfer.amountCny, 'CNY')}</span>
            </div>
          </Field>

          <Field label={t('admin.aml-triage.detail.linked-transfer.recipient')}>
            <div className="flex items-center gap-2">
              <DestinationBadge destination={transfer.destination} />
              <span className="font-mono tabular text-sm truncate">
                {transfer.recipientIdentifier}
              </span>
            </div>
          </Field>

          <Field label={t('admin.aml-triage.detail.linked-transfer.scheme')}>
            <div className="flex items-center gap-2">
              <SchemeLogo scheme={transfer.cardScheme} size="sm" />
              <span className="font-mono tabular text-sm">{transfer.cardMaskedPan}</span>
            </div>
          </Field>
        </dl>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-muted-foreground mb-0.5">{label}</dt>
      <dd className="text-sm min-w-0">{children}</dd>
    </div>
  );
}
