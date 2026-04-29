import { AlertCircle, Ban, RefreshCw, ShieldAlert, Clock, Server } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { ERROR_CODES } from '@/data/mock';
import type { ErrorCode } from '@/types';

interface ErrorCellProps {
  code: string;
  showDescription?: boolean;
  className?: string;
}

const CATEGORY_ICONS: Record<ErrorCode['category'], React.ComponentType<{ className?: string }>> = {
  kyc: ShieldAlert,
  acquiring: Ban,
  fx: RefreshCw,
  provider: Server,
  compliance: ShieldAlert,
  system: AlertCircle,
};

/**
 * Looks up a code from `error_codes` and renders the localized message.
 * Never displays raw failure codes — always resolves to a human-readable label.
 */
export function ErrorCell({ code, showDescription, className }: ErrorCellProps) {
  const errorCode = ERROR_CODES.find((e) => e.code === code);
  const Icon = errorCode ? CATEGORY_ICONS[errorCode.category] : AlertCircle;
  const title = errorCode
    ? t(`common.errors.${code}.title`) || errorCode.messageEn
    : code;
  const body = showDescription && errorCode
    ? t(`common.errors.${code}.body`) || errorCode.suggestedAction
    : null;

  return (
    <span className={cn('inline-flex items-start gap-1.5 text-sm text-foreground', className)}>
      <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0 text-danger-600" aria-hidden="true" />
      <span>
        <span className="font-medium">{title}</span>
        {body && <span className="block text-muted-foreground mt-0.5">{body}</span>}
        {errorCode?.retryable && (
          <span className="ml-1 inline-flex items-center gap-0.5 text-xs uppercase tracking-wider text-muted-foreground">
            <Clock className="h-2.5 w-2.5" aria-hidden="true" /> retryable
          </span>
        )}
      </span>
    </span>
  );
}
