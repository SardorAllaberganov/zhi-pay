import { cn } from '@/lib/utils';
import { LocaleFlag, type LocaleCode } from '@/components/zhipay/LocaleFlag';
import { LOCALE_ORDER } from '@/components/zhipay/LocaleTabTextarea';

/**
 * Three small flag chips indicating which of `uz / ru / en` carry both
 * a non-empty title and body. Filled locales render at full opacity;
 * missing locales render muted (greyscale + reduced opacity) so the
 * author can spot incomplete drafts at a glance from the list page.
 */

interface Props {
  filled: Record<LocaleCode, boolean>;
  className?: string;
}

export function LocaleFillIndicator({ filled, className }: Props) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)} aria-hidden="true">
      {LOCALE_ORDER.map((loc) => (
        <LocaleFlag
          key={loc}
          locale={loc}
          size="xs"
          className={cn(filled[loc] ? '' : 'opacity-30 grayscale')}
        />
      ))}
    </span>
  );
}

/** Helper for callers — checks both title + body for the locale. */
export function computeLocaleFilled(item: {
  titleUz: string;
  titleRu: string;
  titleEn: string;
  bodyUz: string;
  bodyRu: string;
  bodyEn: string;
}): Record<LocaleCode, boolean> {
  return {
    uz: hasContent(item.titleUz) && hasContent(item.bodyUz),
    ru: hasContent(item.titleRu) && hasContent(item.bodyRu),
    en: hasContent(item.titleEn) && hasContent(item.bodyEn),
  };
}

function hasContent(s: string): boolean {
  return s.replace(/<[^>]*>/g, '').trim().length > 0;
}
