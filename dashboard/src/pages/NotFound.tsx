import { NotFoundState } from '@/components/system/NotFoundState';
import { useAppShell } from '@/components/layout/AppShellContext';

/**
 * Catch-all `*` route inside `AppRoutes`. Renders the in-shell 404 with
 * a secondary CTA wired to the AppShell's command palette.
 */
export function NotFound() {
  const { openCommandPalette } = useAppShell();
  return <NotFoundState onOpenCommandPalette={openCommandPalette} />;
}
