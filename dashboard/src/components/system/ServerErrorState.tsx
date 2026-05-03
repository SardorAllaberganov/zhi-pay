import { useState } from 'react';
import { AlertTriangleIcon, CheckIcon, CopyIcon } from 'lucide-react';
import { SystemStateLayout } from './SystemStateLayout';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface ServerErrorStateProps {
  /** From the SystemErrorBoundary; null if rendered without a logged event. */
  referenceId: string | null;
  /** Re-mount the boundary children. Falls back to `window.location.reload()`. */
  onRetry?: () => void;
  /** When `true`, renders the full-bleed layout (logo + gradient). */
  fullBleed?: boolean;
}

/**
 * 500 / 503 — Server / page error. Rendered by `<SystemErrorBoundary>`
 * when a child throws during render, or by `/system/preview/500` for
 * QA. Logs a `page_error` system event on mount via the boundary's
 * `componentDidCatch` (NOT here — the boundary owns the audit write).
 *
 * Footer carries a mono reference id with copy-on-click. Admin support
 * uses this id to find the corresponding trace.
 *
 * Try-again behaviour:
 *   - Calls `onRetry()` to reset the boundary state, which re-mounts
 *     children. If the same render path crashes again, we land back
 *     here — that's correct.
 *   - If no `onRetry` is wired (preview mode), falls back to a hard
 *     `window.location.reload()`.
 */
export function ServerErrorState({
  referenceId,
  onRetry,
  fullBleed,
}: ServerErrorStateProps) {
  function handleRetry() {
    if (onRetry) onRetry();
    else if (typeof window !== 'undefined') window.location.reload();
  }

  return (
    <SystemStateLayout
      variant={fullBleed ? 'full-bleed' : 'in-shell'}
      icon={AlertTriangleIcon}
      iconTone="danger"
      title={t('admin.error.500.title')}
      body={t('admin.error.500.body')}
      primary={{ label: t('admin.error.500.action.retry'), onClick: handleRetry }}
      secondary={{ label: t('admin.error.500.action.home'), to: '/' }}
      footer={referenceId ? <ReferenceIdRow referenceId={referenceId} /> : null}
    />
  );
}

function ReferenceIdRow({ referenceId }: { referenceId: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    void navigator.clipboard.writeText(referenceId).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors',
        'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      )}
      aria-label={t('admin.error.500.reference-id-copy')}
    >
      <span className="text-muted-foreground">{t('admin.error.500.reference-id')}</span>
      <code className="font-mono text-foreground/80">{referenceId}</code>
      {copied ? (
        <CheckIcon className="h-3.5 w-3.5 text-success-700" aria-hidden="true" />
      ) : (
        <CopyIcon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      )}
    </button>
  );
}
