import { cn } from '@/lib/utils';
import type { CardScheme } from '@/types';

/**
 * Stylized placeholder SVGs.
 * Real brand assets require licensing — drop them in here when available.
 * NEVER substitute a generic credit-card icon (per `.claude/rules/card-schemes.md`).
 */

interface SchemeLogoProps {
  scheme: CardScheme;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES: Record<NonNullable<SchemeLogoProps['size']>, { w: number; h: number }> = {
  xs: { w: 24, h: 16 },
  sm: { w: 32, h: 20 },
  md: { w: 40, h: 24 },
  lg: { w: 56, h: 32 },
};

export function SchemeLogo({ scheme, size = 'sm', className }: SchemeLogoProps) {
  const { w, h } = SIZES[size];
  const common = {
    width: w,
    height: h,
    className: cn('inline-block shrink-0 rounded-sm', className),
    'aria-label': scheme,
    role: 'img' as const,
  };

  switch (scheme) {
    case 'visa':
      return (
        <svg {...common} viewBox="0 0 56 32">
          <rect width="56" height="32" rx="4" fill="#1A1F71" />
          <text
            x="28"
            y="22"
            textAnchor="middle"
            fontFamily="Inter, system-ui, sans-serif"
            fontSize="14"
            fontWeight="700"
            fontStyle="italic"
            fill="#fff"
            letterSpacing="1"
          >
            VISA
          </text>
        </svg>
      );
    case 'mastercard':
      return (
        <svg {...common} viewBox="0 0 56 32">
          <rect width="56" height="32" rx="4" fill="#0a0a0a" />
          <circle cx="23" cy="16" r="8" fill="#EB001B" />
          <circle cx="33" cy="16" r="8" fill="#F79E1B" fillOpacity="0.85" />
        </svg>
      );
    case 'uzcard':
      return (
        <svg {...common} viewBox="0 0 56 32">
          <rect width="56" height="32" rx="4" fill="#00A859" />
          <text
            x="28"
            y="20"
            textAnchor="middle"
            fontFamily="Inter, system-ui, sans-serif"
            fontSize="9"
            fontWeight="700"
            fill="#fff"
            letterSpacing="0.5"
          >
            UZCARD
          </text>
        </svg>
      );
    case 'humo':
      return (
        <svg {...common} viewBox="0 0 56 32">
          <rect width="56" height="32" rx="4" fill="#0066B3" />
          <text
            x="28"
            y="21"
            textAnchor="middle"
            fontFamily="Inter, system-ui, sans-serif"
            fontSize="11"
            fontWeight="700"
            fill="#fff"
            letterSpacing="1"
          >
            HUMO
          </text>
        </svg>
      );
  }
}
