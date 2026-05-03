import { type ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { cn } from '@/lib/utils';

export type SystemStateTone = 'slate' | 'danger' | 'warning';

export interface SystemStateAction {
  label: string;
  /** Hand off to react-router. Mutually exclusive with `onClick`. */
  to?: string;
  onClick?: () => void;
  /** Render as `<a target="_blank">`. Used by Print shortcuts only. */
  external?: boolean;
}

export interface SystemStateLayoutProps {
  /**
   * `in-shell` — renders inside `<AppShell>`'s `<main>` so sidebar + topbar
   *   stay visible. Centered card.
   * `full-bleed` — renders outside `<AppShell>` via `<AuthLayout>` chrome
   *   (logo + theme toggle + footer). Used for deep-link 404 before
   *   sign-in and the maintenance state.
   */
  variant?: 'in-shell' | 'full-bleed';
  icon: LucideIcon;
  iconTone: SystemStateTone;
  title: string;
  body: string;
  primary?: SystemStateAction;
  secondary?: SystemStateAction;
  /** Reference id, requested-path readout, or any other small footer slot. */
  footer?: ReactNode;
}

const TONE_CLASSES: Record<SystemStateTone, string> = {
  slate: 'text-slate-400 dark:text-slate-500',
  danger: 'text-danger-600',
  warning: 'text-warning-600',
};

/**
 * Shared frame for every error / system state. Centered card with
 * lucide icon, text-2xl title, max-2-sentence muted body, primary +
 * optional ghost CTA, and an optional footer slot for the reference id
 * or requested path.
 *
 * Card padding is owned here (not via `<Card>` primitive) per LESSON
 * 2026-05-03 — half-overrides of the Card primitive's `p-5` rhythm read
 * as layout errors, so this layout uses raw elements with explicit
 * padding instead.
 *
 * On mobile the CTAs stack vertically with primary on top
 * (`flex-col-reverse`); on `sm+` they sit side-by-side, ghost-then-primary.
 */
export function SystemStateLayout({
  variant = 'in-shell',
  icon: Icon,
  iconTone,
  title,
  body,
  primary,
  secondary,
  footer,
}: SystemStateLayoutProps) {
  const card = (
    <div
      className={cn(
        'mx-auto w-full max-w-md rounded-xl border border-border bg-card',
        variant === 'in-shell' ? 'shadow-sm' : 'shadow-lg',
        'p-6 sm:p-8',
      )}
    >
      <div className="flex flex-col items-center text-center">
        <Icon
          className={cn('h-24 w-24 mb-5', TONE_CLASSES[iconTone])}
          aria-hidden="true"
          strokeWidth={1.5}
        />
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>

        {(primary || secondary) && (
          <div className="mt-6 flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-center">
            {secondary && <ActionButton action={secondary} variant="ghost" />}
            {primary && (
              <ActionButton action={primary} variant="default" autoFocus />
            )}
          </div>
        )}

        {footer && (
          <div className="mt-6 w-full border-t border-border pt-5">{footer}</div>
        )}
      </div>
    </div>
  );

  if (variant === 'in-shell') {
    return <div className="flex min-h-[60vh] items-center justify-center">{card}</div>;
  }

  // Full-bleed wraps with the AuthLayout chrome — logo, gradient bg,
  // ThemeToggle top-right, footer chip, TooltipProvider (per LESSON
  // 2026-05-03 — outside-AppShell surfaces own their TooltipProvider).
  return <AuthLayout>{card}</AuthLayout>;
}

function ActionButton({
  action,
  variant,
  autoFocus,
}: {
  action: SystemStateAction;
  variant: 'default' | 'ghost';
  /** When true, focuses on mount so Enter triggers this action. Used
   * for the primary CTA on 404 / 500 / 403 per the keyboard contract. */
  autoFocus?: boolean;
}) {
  const className = 'w-full sm:w-auto';
  if (action.to) {
    return (
      <Button asChild variant={variant} className={className}>
        <Link to={action.to} autoFocus={autoFocus}>
          {action.label}
        </Link>
      </Button>
    );
  }
  return (
    <Button
      variant={variant}
      onClick={action.onClick}
      className={className}
      autoFocus={autoFocus}
    >
      {action.label}
    </Button>
  );
}
