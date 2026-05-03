import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { LocaleFlag, type LocaleCode } from '@/components/zhipay/LocaleFlag';

/**
 * Locale tab strip + single autoresizing textarea for the active locale.
 *
 * 3rd-consumer lift from `components/app-versions/modals/ReleaseNotesEditor`
 * (App Versions, Error Codes preview, now Stories editor). Generic over the
 * i18n key set so each consumer keeps its own surface-scoped strings.
 */

export const LOCALE_ORDER: LocaleCode[] = ['uz', 'ru', 'en'];

interface LocaleTabTextareaProps {
  values: Record<LocaleCode, string>;
  onChange: (locale: LocaleCode, next: string) => void;
  active: LocaleCode;
  onActiveChange: (loc: LocaleCode) => void;
  /** Invalid locales surface a per-locale red dot + inline error message. */
  invalidLocales?: ReadonlySet<LocaleCode>;
  /** Required for `htmlFor` and aria-controls when nested in labeled forms. */
  idPrefix?: string;
  /** i18n key for the tablist aria-label. */
  ariaLabelKey: string;
  /** i18n key map per locale for tab labels. */
  localeLabelKey: Record<LocaleCode, string>;
  /** i18n key prefix for placeholders — full key resolves as `${placeholderKeyPrefix}.${locale}`. */
  placeholderKeyPrefix: string;
  /** i18n key for the per-locale required-error message. */
  requiredErrorKey: string;
  /** i18n key for the hint text shown below textarea (when not error). */
  hintKey: string;
  /** i18n key for the char-count interpolation `{count}`. */
  charCountKey: string;
  /** Min height in px (default 144 — ~ 6 rows × 24px line-height). */
  minHeightPx?: number;
  /** Min rows on the textarea element (default 6). */
  baseRows?: number;
}

export function LocaleTabTextarea({
  values,
  onChange,
  active,
  onActiveChange,
  invalidLocales,
  idPrefix = 'locale-textarea',
  ariaLabelKey,
  localeLabelKey,
  placeholderKeyPrefix,
  requiredErrorKey,
  hintKey,
  charCountKey,
  minHeightPx = 144,
  baseRows = 6,
}: LocaleTabTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(minHeightPx, el.scrollHeight)}px`;
  }, [active, values, minHeightPx]);

  const value = values[active];
  const showError = invalidLocales?.has(active) ?? false;

  return (
    <div className="space-y-3">
      {/* Locale tab strip */}
      <div role="tablist" aria-label={t(ariaLabelKey)} className="flex items-center gap-2">
        {LOCALE_ORDER.map((loc, i) => {
          const isActive = loc === active;
          const isInvalid = invalidLocales?.has(loc) ?? false;
          return (
            <button
              key={loc}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${idPrefix}-${loc}`}
              onClick={() => onActiveChange(loc)}
              className={cn(
                'inline-flex items-center gap-2 rounded-md px-3 h-9 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isActive
                  ? 'bg-card text-brand-700 dark:text-brand-300 ring-1 ring-brand-300 dark:ring-brand-700/40 shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
              )}
            >
              <LocaleFlag locale={loc} size="sm" />
              <span>{t(localeLabelKey[loc])}</span>
              {isInvalid && (
                <span
                  aria-label={t(requiredErrorKey)}
                  className="inline-block h-1.5 w-1.5 rounded-full bg-danger-600"
                />
              )}
              <span className="text-xs text-muted-foreground tabular ml-1">⌘{i + 1}</span>
            </button>
          );
        })}
      </div>

      {/* Active locale textarea */}
      <div id={`${idPrefix}-${active}`} role="tabpanel">
        <textarea
          ref={textareaRef}
          rows={baseRows}
          value={value}
          onChange={(e) => onChange(active, e.target.value)}
          placeholder={t(`${placeholderKeyPrefix}.${active}`)}
          className={cn(
            'w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'placeholder:text-muted-foreground/70 resize-none',
            showError && 'border-danger-600 focus-visible:ring-danger-600',
          )}
          style={{ minHeight: `${minHeightPx}px` }}
          aria-describedby={`${idPrefix}-${active}-counter`}
        />
        <div
          id={`${idPrefix}-${active}-counter`}
          className="mt-1 flex items-center justify-between text-sm"
        >
          <span
            className={cn(
              showError ? 'text-danger-700 dark:text-danger-600' : 'text-muted-foreground',
            )}
          >
            {showError ? t(requiredErrorKey) : t(hintKey)}
          </span>
          <span className="text-muted-foreground tabular">
            {t(charCountKey, { count: value.length })}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Imperative-focus helper for parent dialogs that switch locale via Cmd+N. */
export function useFocusableTextarea(): {
  ref: (el: HTMLTextAreaElement | null) => void;
  focus: () => void;
} {
  const elRef = useRef<HTMLTextAreaElement | null>(null);
  return {
    ref: (el) => {
      elRef.current = el;
    },
    focus: () => elRef.current?.focus(),
  };
}
