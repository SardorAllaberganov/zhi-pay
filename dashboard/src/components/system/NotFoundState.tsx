import { CompassIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { SystemStateLayout } from './SystemStateLayout';
import { t } from '@/lib/i18n';

interface NotFoundStateProps {
  /** When `true`, renders the full-bleed layout (logo, gradient bg). */
  fullBleed?: boolean;
  /** Override the requested path — used by the preview route. */
  requestedPath?: string;
  /** Override the command-palette opener — used by the preview route. */
  onOpenCommandPalette?: () => void;
}

/**
 * 404 — Not found. Rendered by the catch-all `<Route path="*">` inside
 * `AppRoutes` (in-shell) and by `/system/preview/404` in either variant.
 *
 * In-shell:
 *   - Primary CTA: "Back to Overview" → `/`
 *   - Secondary CTA: "Open command palette (⌘K)" — wired via the
 *     `onOpenCommandPalette` prop. AppShell surfaces this via context-
 *     less prop drilling kept simple by routing through the page wrapper.
 *
 * Full-bleed (deep link before sign-in):
 *   - Primary CTA: "Sign in" → `/sign-in`
 *   - No secondary CTA.
 *
 * Footer in both variants: "requested: /operations/transferss" — useful
 * for typo diagnosis. Mono small line.
 *
 * Not logged to system events (404s are operational noise).
 */
export function NotFoundState({
  fullBleed,
  requestedPath,
  onOpenCommandPalette,
}: NotFoundStateProps) {
  const location = useLocation();
  const path = requestedPath ?? `${location.pathname}${location.search}`;

  return (
    <SystemStateLayout
      variant={fullBleed ? 'full-bleed' : 'in-shell'}
      icon={CompassIcon}
      iconTone="slate"
      title={t('admin.error.404.title')}
      body={t('admin.error.404.body')}
      primary={
        fullBleed
          ? { label: t('admin.error.404.action.sign-in'), to: '/sign-in' }
          : { label: t('admin.error.404.action.home'), to: '/' }
      }
      secondary={
        fullBleed
          ? undefined
          : onOpenCommandPalette
            ? {
                label: t('admin.error.404.action.command-palette'),
                onClick: onOpenCommandPalette,
              }
            : undefined
      }
      footer={
        <div className="text-sm text-muted-foreground">
          <span>{t('admin.error.404.requested')}</span>{' '}
          <code className="font-mono text-foreground/80">{path}</code>
        </div>
      }
    />
  );
}
