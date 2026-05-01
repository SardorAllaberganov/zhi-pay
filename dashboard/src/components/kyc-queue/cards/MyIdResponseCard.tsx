import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CollapsibleCard } from '@/components/transfer-detail/cards/CollapsibleCard';
import { t } from '@/lib/i18n';
import type { KycReview } from '@/data/mockKycQueue';

interface MyIdResponseCardProps {
  review: KycReview;
}

export function MyIdResponseCard({ review }: MyIdResponseCardProps) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(review.myidResponse, null, 2);

  function copy() {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <CollapsibleCard
      title={t('admin.kyc-queue.detail.myid-response')}
      defaultOpen={false}
    >
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {t('admin.kyc-queue.detail.myid-response.note')}
        </p>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {t('admin.kyc-queue.detail.myid-response.label')}
          </span>
          <Button size="sm" variant="ghost" onClick={copy}>
            {copied ? (
              <>
                <Check
                  className="h-3.5 w-3.5 mr-1.5 text-success-600"
                  aria-hidden="true"
                />
                {t('admin.kyc-queue.detail.myid-response.copied')}
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                {t('admin.kyc-queue.detail.myid-response.copy')}
              </>
            )}
          </Button>
        </div>

        <pre className="rounded-md bg-muted/60 dark:bg-muted/40 p-3 text-sm overflow-x-auto overflow-y-hidden">
          <code className="font-mono tabular text-foreground/90">{json}</code>
        </pre>
      </div>
    </CollapsibleCard>
  );
}
