import { cn } from '@/lib/utils';
import { LOCALE_ORDER } from './types';
import { LocaleFlag } from '@/components/zhipay/LocaleFlag';

/**
 * Truncate to roughly N characters at a word boundary, append `…` when cut.
 * Newlines collapse to a single space for the inline preview.
 */
function truncatePreview(text: string, max: number): string {
  const collapsed = text.replace(/\s+/g, ' ').trim();
  if (collapsed.length <= max) return collapsed;
  const cut = collapsed.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

/**
 * Inline release-notes preview for the Versions table — 3 locale flag chips
 * + a 60-char `release_notes_en` snippet collapsed to a single line. Spec:
 * "show 3 small flag icons + first 60 chars of release_notes_en".
 */
export function ReleaseNotesPreview({
  notesEn,
  className,
}: {
  notesEn: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2 min-w-0', className)}>
      <span className="inline-flex items-center gap-1 shrink-0">
        {LOCALE_ORDER.map((loc) => (
          <LocaleFlag key={loc} locale={loc} size="xs" />
        ))}
      </span>
      <span className="text-sm text-muted-foreground truncate">
        {truncatePreview(notesEn, 60)}
      </span>
    </div>
  );
}
