import { cn } from '@/lib/utils';
import type { Locale } from './types';
import uzFlag from '@/assets/flags/uz.png';
import ruFlag from '@/assets/flags/ru.png';
import gbFlag from '@/assets/flags/gb.png';

/**
 * Locale flag chip for the 3 live languages — uz / ru / en.
 *
 * Backed by Wikimedia commons rasters bundled into the app via Vite's
 * asset pipeline (so they hash + respect the `/zhi-pay/` production
 * base path). Files live under `src/assets/flags/`. The `en` locale
 * uses the historical "Flag of Great Britain (1707-1800)" per the
 * source-of-truth chosen for this surface.
 *
 * Sizes follow the consumer pattern: `xs` for inline preview chips
 * (table column), `sm` for tab triggers (dialog locale strip), `md`
 * for the modal preview header.
 *
 * Kept under `components/app-versions/` until a 2nd consumer arrives,
 * per design-system-layers.md ("Components layer when used on ≥ 2
 * screens").
 */

const SOURCE: Record<Locale, { src: string; alt: string }> = {
  uz: { src: uzFlag, alt: 'Uzbek' },
  ru: { src: ruFlag, alt: 'Russian' },
  en: { src: gbFlag, alt: 'English' },
};

const SIZE_CLASS: Record<'xs' | 'sm' | 'md', string> = {
  xs: 'h-3 w-4',
  sm: 'h-3.5 w-5',
  md: 'h-4 w-6',
};

export function LocaleFlag({
  locale,
  size = 'xs',
  className,
}: {
  locale: Locale;
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
