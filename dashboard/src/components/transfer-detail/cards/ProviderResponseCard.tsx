import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CollapsibleCard } from './CollapsibleCard';
import { formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ProviderResponse } from '@/data/mockTransferDetail';
import type { TransferStatus } from '@/types';

interface Props {
  providerResponse: ProviderResponse;
  transferStatus: TransferStatus;
}

export function ProviderResponseCard({ providerResponse, transferStatus }: Props) {
  // Auto-open when transfer is in failed state.
  const defaultOpen = transferStatus === 'failed';

  const [copied, setCopied] = useState(false);

  const rawJson = JSON.stringify(providerResponse.rawResponse, null, 2);

  function copyJson() {
    if (!navigator.clipboard?.writeText) return;
    navigator.clipboard.writeText(rawJson).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <CollapsibleCard
      title={t('admin.transfer-detail.provider.title')}
      defaultOpen={defaultOpen}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <Stat label="external_tx_id" mono value={providerResponse.externalTxId} />
          <Stat label="provider" value={providerResponse.provider} />
          <Stat
            label="last webhook"
            value={
              providerResponse.lastReceivedAt
                ? formatRelative(providerResponse.lastReceivedAt)
                : '—'
            }
          />
        </div>

        {/* Webhook events */}
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {t('admin.transfer-detail.provider.events')}
          </div>
          <ul className="space-y-1.5">
            {providerResponse.webhookEvents.map((ev) => (
              <li
                key={ev.id}
                className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2 min-w-0 flex-wrap">
                  <span className="font-mono tabular text-sm">{ev.type}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground tabular">HTTP {ev.statusCode}</span>
                  {ev.retryCount > 0 && (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">retry {ev.retryCount}</span>
                    </>
                  )}
                </div>
                <span className="text-sm text-muted-foreground tabular shrink-0">
                  {formatRelative(ev.receivedAt)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Raw response — always shown when the accordion is open. The
            accordion title (one button only) is what opens / closes this. */}
        <div className="space-y-2">
          <div
            className="overflow-hidden rounded-md border border-border bg-muted/30"
          >
            {/* Code-panel header — section label + Copy button */}
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                {t('admin.transfer-detail.provider.raw')}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyJson}
                className="h-7 -my-1"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-success-600" aria-hidden="true" />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {copied ? 'Copied' : t('admin.transfer-detail.provider.copy-json')}
              </Button>
            </div>
            {/* Code body */}
            <pre className="overflow-x-auto p-3 text-sm leading-relaxed whitespace-pre">
              <code className="font-mono tabular text-foreground/90">{rawJson}</code>
            </pre>
          </div>
        </div>
      </div>
    </CollapsibleCard>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </div>
      <div className={`mt-1 text-sm break-all ${mono ? 'font-mono tabular' : ''}`}>{value}</div>
    </div>
  );
}
