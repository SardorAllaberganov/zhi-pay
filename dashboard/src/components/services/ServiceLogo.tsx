import { cn } from '@/lib/utils';
import type { ServiceName } from '@/types';

/**
 * Stylized placeholder logos for service rails.
 * Brand-correct primitives — never substitute a generic icon. Real brand
 * assets require licensing and replace these in-place when available
 * (same precedent as `SchemeLogo` for card schemes).
 */

interface ServiceLogoProps {
  name: ServiceName;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES: Record<NonNullable<ServiceLogoProps['size']>, { w: number; h: number }> = {
  sm: { w: 32, h: 32 },
  md: { w: 48, h: 48 },
  lg: { w: 64, h: 64 },
};

export function ServiceLogo({ name, size = 'md', className }: ServiceLogoProps) {
  const { w, h } = SIZES[size];
  const common = {
    width: w,
    height: h,
    className: cn('inline-block shrink-0 rounded-md', className),
    'aria-label': name,
    role: 'img' as const,
  };

  switch (name) {
    case 'alipay':
      return (
        <svg {...common} viewBox="0 0 64 64">
          <rect width="64" height="64" rx="12" fill="#1677FF" />
          <text
            x="32"
            y="42"
            textAnchor="middle"
            fontFamily="Inter, system-ui, sans-serif"
            fontSize="22"
            fontWeight="800"
            fill="#fff"
            letterSpacing="-0.5"
          >
            支付宝
          </text>
        </svg>
      );
    case 'wechat':
      return (
        <svg {...common} viewBox="0 0 64 64">
          <rect width="64" height="64" rx="12" fill="#07C160" />
          <text
            x="32"
            y="42"
            textAnchor="middle"
            fontFamily="Inter, system-ui, sans-serif"
            fontSize="22"
            fontWeight="800"
            fill="#fff"
            letterSpacing="-0.5"
          >
            微信
          </text>
        </svg>
      );
    case 'uzcard':
      return (
        <svg {...common} viewBox="0 0 64 64">
          <rect width="64" height="64" rx="12" fill="#00A859" />
          <text
            x="32"
            y="38"
            textAnchor="middle"
            fontFamily="Inter, system-ui, sans-serif"
            fontSize="13"
            fontWeight="700"
            fill="#fff"
            letterSpacing="1"
          >
            UZCARD
          </text>
        </svg>
      );
    case 'humo':
      return (
        <svg {...common} viewBox="0 0 64 64">
          <rect width="64" height="64" rx="12" fill="#0066B3" />
          <text
            x="32"
            y="40"
            textAnchor="middle"
            fontFamily="Inter, system-ui, sans-serif"
            fontSize="16"
            fontWeight="700"
            fill="#fff"
            letterSpacing="1"
          >
            HUMO
          </text>
        </svg>
      );
    case 'myid':
      return (
        <svg {...common} viewBox="0 0 64 64">
          <rect width="64" height="64" rx="12" fill="#0A5EBA" />
          <text
            x="32"
            y="40"
            textAnchor="middle"
            fontFamily="Inter, system-ui, sans-serif"
            fontSize="16"
            fontWeight="700"
            fill="#fff"
            letterSpacing="1"
          >
            MyID
          </text>
        </svg>
      );
    case 'visa':
    case 'mastercard':
      // Out-of-scope rails for v1 — never rendered from this surface.
      return null;
  }
}
