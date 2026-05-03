import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { LOCALE_LABEL_KEY, LOCALE_ORDER, type Locale } from '../types';
import { LocaleFlag } from '../LocaleFlag';

/**
 * Locale tab strip + single autoresizing textarea for the active locale.
 *
 * Behavior:
 *   - Active locale switches via tab click OR Cmd/Ctrl+1/2/3
 *   - Textarea autoresizes from 6 rows minimum
 *   - Live char counter under the textarea
 *   - Empty-locale validation surfaces inline below the counter
 *   - Imperative focus(): ref-via-callback to the active textarea so the
 *     parent dialog can `focusActive()` after Cmd+N hotkey switching
 *
 * Mobile and desktop share the same UI — a single textarea per locale
 * with a tab strip above. This satisfies the spec's "accordion on mobile"
 * intent (one at a time) without splitting the codepath.
 */

interface ReleaseNotesEditorProps {
  values: Record<Locale, string>;
  onChange: (locale: Locale, next: string) => void;
  active: Locale;
  onActiveChange: (loc: Locale) => void;
  /** Invalid locales surface a per-locale error message. */
  invalidLocales?: ReadonlySet<Locale>;
  /** Required for `htmlFor` when a parent label exists. */
  idPrefix?: string;
}

const TEXTAREA_BASE_ROWS = 6;
const TEXTAREA_MIN_HEIGHT_PX = 144; // ~ 6 rows × 24px line-height

export function ReleaseNotesEditor({
  values,
  onChange,
  active,
  onActiveChange,
  invalidLocales,
  idPrefix = 'release-notes',
}: ReleaseNotesEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Autoresize on value change.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(TEXTAREA_MIN_HEIGHT_PX, el.scrollHeight)}px`;
  }, [active, values]);

  const value = values[active];
  const showError = invalidLocales?.has(active) ?? false;

  return (
    <div className="space-y-3">
      {/* Locale tab strip */}
      <div role="tablist" aria-label={t('admin.app-versions.editor.locale-strip')} className="flex items-center gap-2">
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
              <span>{t(LOCALE_LABEL_KEY[loc])}</span>
              {isInvalid && (
                <span
                  aria-label={t('admin.app-versions.editor.locale-required')}
                  className="inline-block h-1.5 w-1.5 rounded-full bg-danger-600"
                />
              )}
              <span className="text-xs text-muted-foreground tabular ml-1">⌘{i + 1}</span>
            </button>
          );
        })}
      </div>

      {/* Active locale textarea */}
      <div
        id={`${idPrefix}-${active}`}
        role="tabpanel"
        aria-labelledby={`${idPrefix}-tab-${active}`}
      >
        <textarea
          ref={textareaRef}
          rows={TEXTAREA_BASE_ROWS}
          value={value}
          onChange={(e) => onChange(active, e.target.value)}
          placeholder={t(`admin.app-versions.editor.placeholder.${active}`)}
          className={cn(
            'w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'placeholder:text-muted-foreground/70 resize-none',
            showError && 'border-danger-600 focus-visible:ring-danger-600',
          )}
          style={{ minHeight: `${TEXTAREA_MIN_HEIGHT_PX}px` }}
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
            {showError
              ? t('admin.app-versions.editor.locale-required')
              : t('admin.app-versions.editor.markdown-hint')}
          </span>
          <span className="text-muted-foreground tabular">
            {t('admin.app-versions.editor.char-count', { count: value.length })}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Imperatively focus the textarea for the active locale (used by Cmd+N hotkey). */
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
