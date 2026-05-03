import { cn } from '@/lib/utils';
import uzFlag from '@/assets/flags/uz.png';
import ruFlag from '@/assets/flags/ru.png';
import gbFlag from '@/assets/flags/gb.png';

/**
 * Single source of truth for the 3 live languages — `uz` / `ru` / `en`.
 *
 * Re-used by every surface that renders per-locale data alongside its
 * flag chip (App Versions release-notes preview, Error Codes catalog,
 * future content-CMS surfaces). Structurally identical to the
 * `Locale` alias in `components/app-versions/types.ts` so values from
 * either side are interchangeable at the call site.
 */
export type LocaleCode = 'uz' | 'ru' | 'en';

const SOURCE: Record<LocaleCode, { src: string; alt: string }> = {
  uz: { src: uzFlag, alt: 'Uzbek' },
  ru: { src: ruFlag, alt: 'Russian' },
  en: { src: gbFlag, alt: 'English' },
};

const SIZE_CLASS: Record<'xs' | 'sm' | 'md', string> = {
  xs: 'h-3 w-4',
  sm: 'h-3.5 w-5',
  md: 'h-4 w-6',
};

/**
 * Locale flag chip for the 3 live languages.
 *
 * Backed by Wikimedia commons rasters bundled into the app via Vite's
 * asset pipeline (hash + production base path). Assets live under
 * `src/assets/flags/`. The `en` locale uses the historical
 * "Flag of Great Britain (1707-1800)" per the source-of-truth chosen
 * for the App Versions surface and reused here.
 *
 * Sizes follow the original consumer pattern:
 *   - `xs` — inline preview chips (table column cells, tight strips)
 *   - `sm` — tab triggers (dialog locale strip)
 *   - `md` — modal preview headers and row-expanded section headers
 */
export function LocaleFlag({
  locale,
  size = 'xs',
  className,
}: {
  locale: LocaleCode;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}) {
  const { src, alt } = SOURCE[locale];
  return (
    <img
      src={src}
      alt={alt}
      width={size === 'xs' ? 16 : size === 'sm' ? 20 : 24}
      height={size === 'xs' ? 12 : size === 'sm' ? 14 : 16}
      className={cn(
        'inline-block rounded-[1px] border border-black/10 object-cover shrink-0',
        SIZE_CLASS[size],
        className,
      )}
      loading="lazy"
      decoding="async"
    />
  );
}
