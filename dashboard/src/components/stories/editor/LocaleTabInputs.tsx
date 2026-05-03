import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { LocaleFlag, type LocaleCode } from '@/components/zhipay/LocaleFlag';
import { LOCALE_ORDER } from '@/components/zhipay/LocaleTabTextarea';

/**
 * Locale tab strip + single-line `<Input>` — single-line analogue of
 * `<LocaleTabTextarea>` for short fields like titles + cta labels.
 * Stays Stories-internal until a second consumer appears.
 */

interface Props {
  values: Record<LocaleCode, string>;
  onChange: (locale: LocaleCode, next: string) => void;
  active: LocaleCode;
  onActiveChange: (loc: LocaleCode) => void;
  invalidLocales?: ReadonlySet<LocaleCode>;
  /** i18n key for the tablist aria-label. */
  ariaLabelKey: string;
  /** i18n key map per locale for tab labels. */
  localeLabelKey: Record<LocaleCode, string>;
  /** i18n key prefix for placeholders — full key is `${placeholderKeyPrefix}.${locale}`. */
  placeholderKeyPrefix: string;
  /** i18n key for the per-locale required-error message. */
  requiredErrorKey: string;
  /** Optional max length. */
  maxLength?: number;
  /** Optional id prefix for `aria-controls`. */
  idPrefix?: string;
}

export function LocaleTabInputs({
  values,
  onChange,
  active,
  onActiveChange,
  invalidLocales,
  ariaLabelKey,
  localeLabelKey,
  placeholderKeyPrefix,
  requiredErrorKey,
  maxLength,
  idPrefix = 'locale-input',
}: Props) {
  const value = values[active];
  const showError = invalidLocales?.has(active) ?? false;

  return (
    <div className="space-y-2">
      <div role="tablist" aria-label={t(ariaLabelKey)} className="flex flex-wrap items-center gap-2">
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
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-700/15 dark:text-brand-300 ring-1 ring-brand-200 dark:ring-brand-700/30'
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
      <div id={`${idPrefix}-${active}`} role="tabpanel">
        <Input
          value={value}
          onChange={(e) => onChange(active, e.target.value)}
          placeholder={t(`${placeholderKeyPrefix}.${active}`)}
          maxLength={maxLength}
          className={cn(showError && 'border-danger-600 focus-visible:ring-danger-600')}
        />
        {showError && (
          <div className="mt-1 text-sm text-danger-700 dark:text-danger-500">
            {t(requiredErrorKey)}
          </div>
        )}
      </div>
    </div>
  );
}
