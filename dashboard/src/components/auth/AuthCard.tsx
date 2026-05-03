import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  banner?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * 440px-wide centred card on `md+`, full-screen with `p-6` on `<md`.
 * White / slate-900 surface with `shadow-lg`.
 *
 * Banner slot lives ABOVE the title — used for the session-expired
 * banner that needs to read before "Sign in to admin". The card body
 * (children) follows the title + subtitle.
 */
export function AuthCard({ title, subtitle, banner, children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        'w-full max-w-[440px] overflow-hidden rounded-xl border border-border bg-card shadow-lg',
        className,
      )}
    >
      {banner ? <div className="border-b border-border">{banner}</div> : null}

      <div className="p-6 sm:p-8">
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
          {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
