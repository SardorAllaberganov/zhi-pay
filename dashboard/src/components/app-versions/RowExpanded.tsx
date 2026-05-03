import { formatDateTime, formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { AppVersion } from '@/data/mockAppVersions';
import { LOCALE_ORDER, LOCALE_LABEL_KEY } from './types';
import { LocaleFlag } from './LocaleFlag';
import { MarkdownView } from './MarkdownView';

/**
 * Inline expanded body for a versions table row. Renders the full release
 * notes per locale as a 3-column grid on `lg+` and stacks vertically on
 * `<lg`. Mirrors the audit-log expand-inline pattern (no Sheet, no modal).
 *
 * Footer carries the `last edited` line when the version has been edited
 * via `editAppVersion()` so admins can scan recent changes at a glance.
 */
export function RowExpanded({ version }: { version: AppVersion }) {
  const notes: Record<(typeof LOCALE_ORDER)[number], string> = {
    uz: version.releaseNotesUz,
    ru: version.releaseNotesRu,
    en: version.releaseNotesEn,
  };
  return (
    <div className="bg-muted/20 border-t border-border px-4 py-5 md:px-6">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {LOCALE_ORDER.map((loc) => (
          <div key={loc} className="space-y-2 min-w-0">
            <div className="flex items-center gap-2">
              <LocaleFlag locale={loc} size="sm" />
              <span className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
                {t(LOCALE_LABEL_KEY[loc])}
              </span>
            </div>
            <MarkdownView text={notes[loc]} className="text-foreground/90" />
          </div>
        ))}
      </div>
      {version.lastEditedAt && (
        <div className="mt-5 pt-3 border-t border-border/60 text-sm text-muted-foreground">
          {t('admin.app-versions.row-expanded.last-edited', {
            time: formatRelative(version.lastEditedAt),
          })}
          <span className="mx-1.5">·</span>
          <span title={formatDateTime(version.lastEditedAt)} className="font-mono">
            {formatDateTime(version.lastEditedAt)}
          </span>
        </div>
      )}
    </div>
  );
}
