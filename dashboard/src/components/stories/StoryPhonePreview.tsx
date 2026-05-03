import { ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { LocaleCode } from '@/components/zhipay/LocaleFlag';
import type { CtaDeepLink, StoryType } from '@/data/mockStories';
import { PhoneMockup } from '@/components/zhipay/PhoneMockup';
import { MediaPreviewPortrait } from './MediaPreview';

/**
 * Full-fidelity preview of a single story as the mobile user will see it.
 * Title overlay (top), CTA button (bottom), close affordance (top-right).
 *
 * Pure presentation — drives off the form values directly so the editor's
 * live preview updates as the author types.
 */
export function StoryPhonePreview({
  type,
  mediaUrl,
  titles,
  ctaLabels,
  ctaDeepLink,
  locale,
  className,
}: {
  type: StoryType;
  mediaUrl: string;
  titles: Record<LocaleCode, string>;
  ctaLabels: Record<LocaleCode, string> | null;
  ctaDeepLink: CtaDeepLink | null;
  locale: LocaleCode;
  className?: string;
}) {
  const title = titles[locale]?.trim() || t('admin.stories.preview.title-fallback');
  const ctaLabel = ctaLabels?.[locale]?.trim() ?? null;
  const showCta = ctaLabels !== null && ctaDeepLink !== null && ctaLabel !== null && ctaLabel.length > 0;

  return (
    <PhoneMockup className={className}>
      <div className="relative h-full w-full">
        {/* Media (full-bleed) */}
        <MediaPreviewPortrait url={mediaUrl} type={type} />

        {/* Top gradient + close affordance */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 via-black/20 to-transparent" />
        <button
          type="button"
          aria-label={t('admin.stories.preview.close')}
          className="absolute right-3 top-9 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm pointer-events-none"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Title overlay (top) */}
        <div className="absolute inset-x-4 top-12 text-white">
          <h4 className="text-base font-semibold leading-snug drop-shadow line-clamp-3">
            {title}
          </h4>
        </div>

        {/* Bottom gradient + CTA button */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
        {showCta && (
          <div className="absolute inset-x-4 bottom-6">
            <button
              type="button"
              className={cn(
                'w-full inline-flex items-center justify-center gap-2 rounded-full bg-white text-foreground',
                'h-11 px-5 text-sm font-semibold shadow-lg pointer-events-none',
              )}
            >
              <span className="truncate">{ctaLabel}</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Progress strip (faux — single segment fully filled) */}
        <div className="pointer-events-none absolute left-4 right-4 top-7 flex gap-1">
          <div className="h-0.5 flex-1 rounded-full bg-white/85" />
          <div className="h-0.5 flex-1 rounded-full bg-white/35" />
          <div className="h-0.5 flex-1 rounded-full bg-white/35" />
        </div>
      </div>
    </PhoneMockup>
  );
}
