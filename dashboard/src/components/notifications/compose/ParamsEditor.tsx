import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import {
  type DeepLinkScreen,
  DEEP_LINK_PARAMS_HINT_KEY,
  DEEP_LINK_REQUIRED_PARAMS,
} from '@/lib/deepLinkScreens';

interface Props {
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  screen: DeepLinkScreen;
  /** Reports parse errors back to the parent so it can block submit. */
  onErrorChange?: (err: string | null) => void;
}

/**
 * Mono textarea for `deep_link.params`. Validates JSON-object shape on
 * blur: must parse + must be a plain object (not array, not primitive).
 * Empty input is treated as `{}` (no params). Soft-warns when a screen's
 * required params (per `DEEP_LINK_REQUIRED_PARAMS`) are missing — does
 * not block submit, the composer's `invalidDeepLink` flag handles that.
 *
 * Mirrors the Stories ParamsEditor pattern; lift to `zhipay/` planned for
 * a follow-up phase once a 3rd consumer appears.
 */
export function ParamsEditor({ value, onChange, screen, onErrorChange }: Props) {
  const [text, setText] = useState(() => stringify(value));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText(stringify(value));
    setError(null);
    onErrorChange?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueKey(value)]);

  function commit(raw: string) {
    if (raw.trim() === '') {
      onChange({});
      setError(null);
      onErrorChange?.(null);
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        const msg = 'admin.notifications.compose.deep-link.params-error-shape';
        setError(msg);
        onErrorChange?.(msg);
        return;
      }
      onChange(parsed as Record<string, unknown>);
      setError(null);
      onErrorChange?.(null);
    } catch {
      const msg = 'admin.notifications.compose.deep-link.params-error-invalid';
      setError(msg);
      onErrorChange?.(msg);
    }
  }

  const required = DEEP_LINK_REQUIRED_PARAMS[screen];
  const missingRequired = required.filter((k) => {
    const v = (value as Record<string, unknown>)[k];
    return v === undefined || v === null || v === '';
  });

  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => commit(text)}
        rows={4}
        spellCheck={false}
        className={cn(
          'w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm leading-relaxed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'placeholder:text-muted-foreground/70 resize-y',
          error && 'border-danger-600 focus-visible:ring-danger-600',
        )}
        placeholder={'{ "key": "value" }'}
        aria-label={t('admin.notifications.compose.deep-link.params-aria')}
      />
      <div className="flex items-start justify-between gap-3 text-sm">
        {error ? (
          <span className="inline-flex items-center gap-1.5 text-danger-700 dark:text-danger-500">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {t(error)}
          </span>
        ) : missingRequired.length > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-warning-700 dark:text-warning-500">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {t('admin.notifications.compose.deep-link.params-missing-required').replace(
              '{keys}',
              missingRequired.join(', '),
            )}
          </span>
        ) : (
          <span className="text-muted-foreground">{t(DEEP_LINK_PARAMS_HINT_KEY[screen])}</span>
        )}
      </div>
    </div>
  );
}

function stringify(v: Record<string, unknown>): string {
  if (Object.keys(v).length === 0) return '';
  return JSON.stringify(v, null, 2);
}

function valueKey(v: Record<string, unknown>): string {
  try {
    return JSON.stringify(v);
  } catch {
    return '';
  }
}
