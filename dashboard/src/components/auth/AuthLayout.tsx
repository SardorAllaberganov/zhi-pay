import { type ReactNode } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ZhiPayLogo } from '@/components/layout/ZhiPayLogo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { t } from '@/lib/i18n';

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Full-bleed auth-page chrome. Lives outside <AppShell> — no sidebar,
 * no topbar, no breadcrumbs. Background is a soft radial gradient
 * tinted with the brand anchor.
 *
 * Light: slate-50 base + brand-50 radial in the top-right.
 * Dark:  slate-950 base + brand-950 radial in the top-right.
 *
 * Logo + ZhiPay wordmark sit centred above the content slot. Theme
 * toggle pinned top-right. Footer chip pinned bottom-centre.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <TooltipProvider delayDuration={200}>
    <div className="relative min-h-dvh overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Brand-tinted radial gradient — hsl(var(--brand-50/-950)) sits in
          the top-right corner and fades out smoothly. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--brand-50)),transparent_55%)] dark:bg-[radial-gradient(circle_at_top_right,hsl(var(--brand-950)),transparent_55%)]"
      />

      {/* Theme toggle — top-right corner */}
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      {/* Main column */}
      <div className="relative z-0 flex min-h-dvh flex-col items-center justify-center px-4 py-12 sm:px-6">
        {/* Logo above card */}
        <div className="mb-6 sm:mb-8">
          <ZhiPayLogo />
        </div>

        {children}

        {/* Footer chip — copyright + version */}
        <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
          <span>{t('admin.sign-in.footer.copyright')}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono">{t('admin.sign-in.footer.version')}</span>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
