import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TierBadge } from '@/components/zhipay/TierBadge';
import {
  cn,
  formatDateTime,
  formatRelative,
  maskDocNumber,
  maskPinfl,
} from '@/lib/utils';
import { t } from '@/lib/i18n';
import { ageInYears, type KycReview } from '@/data/mockKycQueue';

interface IdentityCardProps {
  review: KycReview;
}

export function IdentityCard({ review }: IdentityCardProps) {
  const [copiedSession, setCopiedSession] = useState(false);

  function copySession() {
    navigator.clipboard.writeText(review.myidSessionId);
    setCopiedSession(true);
    setTimeout(() => setCopiedSession(false), 1200);
  }

  const docTypeLabel =
    review.documentType === 'passport'
      ? t('admin.kyc-queue.row.passport')
      : t('admin.kyc-queue.row.id-card');

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle>{t('admin.kyc-queue.detail.identity')}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <Field label={t('admin.kyc-queue.detail.identity.full-name')}>
            <span className="font-medium">{review.myidFullName}</span>
          </Field>

          <Field label={t('admin.kyc-queue.detail.identity.dob')}>
            <span className="tabular">
              {formatDateTime(review.dob).split(' at ')[0]}
              <span className="ml-2 text-muted-foreground">
                ({t('admin.kyc-queue.detail.identity.age', {
                  count: ageInYears(review.dob),
                })})
              </span>
            </span>
          </Field>

          <Field label={t('admin.kyc-queue.detail.identity.document-type')}>
            <span>{docTypeLabel}</span>
          </Field>

          <Field label={t('admin.kyc-queue.detail.identity.document-number')}>
            <span className="font-mono tabular">
              {maskDocNumber(review.documentNumber)}
            </span>
          </Field>

          <Field label={t('admin.kyc-queue.detail.identity.pinfl')}>
            <span className="font-mono tabular">{maskPinfl(review.pinfl)}</span>
          </Field>

          <Field label={t('admin.kyc-queue.detail.identity.session-id')}>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono tabular truncate">{review.myidSessionId}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={copySession}
                aria-label={t('admin.kyc-queue.detail.copy-session')}
              >
                {copiedSession ? (
                  <Check className="h-3.5 w-3.5 text-success-600" aria-hidden="true" />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </Button>
            </div>
          </Field>

          <Field label={t('admin.kyc-queue.detail.identity.submitted-at')}>
            <span
              className="tabular"
              title={formatDateTime(review.submittedAt)}
            >
              {formatRelative(review.submittedAt)}
            </span>
          </Field>

          <Field label={t('admin.kyc-queue.detail.identity.resulting-tier')}>
            <TierBadge tier={review.resultingTier} />
          </Field>

          {review.verifiedAt && (
            <Field label={t('admin.kyc-queue.detail.identity.verified-at')}>
              <span className="tabular">{formatDateTime(review.verifiedAt)}</span>
            </Field>
          )}

          {review.expiresAt && (
            <Field label={t('admin.kyc-queue.detail.identity.expires-at')}>
              <span className="tabular">{formatDateTime(review.expiresAt)}</span>
            </Field>
          )}

          <Field label={t('admin.kyc-queue.detail.identity.assignee')}>
            <span className={cn(!review.assigneeName && 'text-muted-foreground italic')}>
              {review.assigneeName ?? t('admin.kyc-queue.detail.identity.unassigned')}
            </span>
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

// Re-export ExternalLink in case the calling page wants to render an
// "Open user profile →" link nearby. Avoids importing lucide twice.
export { ExternalLink };
