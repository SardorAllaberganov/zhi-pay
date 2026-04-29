import { cn } from '@/lib/utils';

interface ZhiPayLogoProps {
  collapsed?: boolean;
  className?: string;
}

/**
 * Stylized placeholder ZhiPay mark + wordmark.
 * Real brand assets land later — drop them in here.
 */
export function ZhiPayLogo({ collapsed, className }: ZhiPayLogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        className="shrink-0"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="6" fill="hsl(var(--brand-600))" />
        <path
          d="M9 9h14l-9 11h9v3H9v-2.5L18 9.5H9V9z"
          fill="#fff"
        />
      </svg>
      {!collapsed && (
        <span className="font-semibold tracking-tight text-base text-foreground">
          ZhiPay
        </span>
      )}
    </div>
  );
}
