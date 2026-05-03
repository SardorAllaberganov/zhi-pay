import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// Note: the preview index card replaces CardHeader/CardContent with raw
// elements that own their own padding, per LESSON 2026-05-03 — half-
// overriding the Card primitive's `p-5` rhythm to make the body flush
// is the smell that lesson formalizes. The other previews still consume
// the primitives whole.
import { NotFoundState } from '@/components/system/NotFoundState';
import { ServerErrorState } from '@/components/system/ServerErrorState';
import { ForbiddenState } from '@/components/system/ForbiddenState';
import { MaintenanceState } from '@/components/system/MaintenanceState';
import { OfflineBanner } from '@/components/system/OfflineBanner';
import { useAppShell } from '@/components/layout/AppShellContext';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

/**
 * Dev-tooling preview surface for the seven error / system states.
 * Each child route renders its state with deterministic mock data so a
 * designer can eyeball each surface without triggering it for real.
 *
 * Not exposed in the sidebar — reached only via direct URL or from the
 * `/system/preview` index. All 7 routes live under `/system/preview/*`
 * and stay inside `<AuthGuard>`, so the admin must be signed in to view
 * them (preview != public surface).
 */

const PREVIEW_ROUTES: Array<{
  to: string;
  title: string;
  body: string;
}> = [
  {
    to: '/system/preview/404',
    title: '404 — Not found',
    body: 'In-shell variant with a fake requested path.',
  },
  {
    to: '/system/preview/500',
    title: '500 — Server error',
    body: 'In-shell variant with a fake reference id and copy-on-click.',
  },
  {
    to: '/system/preview/403',
    title: '403 — Forbidden',
    body: 'Future-RBAC fallback. Audit-log write is skipped in preview.',
  },
  {
    to: '/system/preview/offline',
    title: 'Offline banner',
    body: 'Sticky banner above a stale Overview-like page.',
  },
  {
    to: '/system/preview/maintenance',
    title: 'Maintenance',
    body: 'Full-page replacement; mock started 8m ago, est. end in 22m.',
  },
  {
    to: '/sign-in?reason=session-lost&next=%2F',
    title: 'Session lost',
    body: 'Sign-in page with the session-lost banner.',
  },
  {
    to: '/system/preview/shortcuts',
    title: 'Shortcuts overlay',
    body: 'Opens the keyboard shortcuts dialog.',
  },
];

export function SystemPreviewIndex() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">System state previews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dev-tooling surface for eyeballing each error and system state with
          deterministic mock data.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Preview routes
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Each link renders its state inline — browser back returns here.
          </p>
        </div>
        <ul className="divide-y divide-border">
          {PREVIEW_ROUTES.map((row) => (
            <li key={row.to}>
              <Link
                to={row.to}
                className={cn(
                  'flex items-center justify-between gap-4 px-5 py-3.5',
                  'hover:bg-muted/30 transition-colors',
                  'focus-visible:outline-none focus-visible:bg-muted/40',
                )}
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">
                    {row.title}
                  </div>
                  <div className="text-sm text-muted-foreground">{row.body}</div>
                </div>
                <ArrowRightIcon
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

// =====================================================================
// Per-state previews
// =====================================================================

function PreviewBackLink() {
  return (
    <Link
      to="/system/preview"
      className={cn(
        'inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm',
      )}
    >
      <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
      <span>{t('admin.system.preview.back-to-index')}</span>
    </Link>
  );
}

export function SystemPreview404() {
  const { openCommandPalette } = useAppShell();
  return (
    <div className="space-y-6">
      <PreviewBackLink />
      <NotFoundState
        requestedPath="/operations/transfersss"
        onOpenCommandPalette={openCommandPalette}
      />
    </div>
  );
}

export function SystemPreview500() {
  return (
    <div className="space-y-6">
      <PreviewBackLink />
      <ServerErrorState referenceId="8a7c-2f1e" />
    </div>
  );
}

export function SystemPreview403() {
  return (
    <div className="space-y-6">
      <PreviewBackLink />
      <ForbiddenState preview />
    </div>
  );
}

export function SystemPreviewOffline() {
  return (
    <div className="space-y-6">
      <PreviewBackLink />
      <OfflineBanner forceVisible cachedFromOverride={Date.now() - 8 * 60 * 1000} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stale Overview snapshot</CardTitle>
          <CardDescription>
            What an admin would see beneath the offline banner — cached data,
            no live updates, write actions disabled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Volume today', value: '—' },
              { label: 'Open transfers', value: '—' },
              { label: 'Pending KYC', value: '—' },
              { label: 'AML flags', value: '—' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-md border border-border p-4">
                <div className="text-sm text-muted-foreground">{stat.label}</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums text-muted-foreground">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Full-page maintenance preview — uses overrides so the timeline reads
 * "started 8 minutes ago, estimated end in 22 minutes" deterministically
 * regardless of when the designer opens the page.
 *
 * Renders the maintenance state directly in the route body (without
 * flipping the live `useMaintenanceState` flag) — designers can eyeball
 * the surface without locking everyone else out of the app.
 */
export function SystemPreviewMaintenance() {
  const startedAt = Date.now() - 8 * 60 * 1000;
  const estimatedEndAt = Date.now() + 22 * 60 * 1000;
  return (
    <MaintenanceState
      startedAtOverride={startedAt}
      estimatedEndAtOverride={estimatedEndAt}
    />
  );
}

/**
 * Shortcuts preview — opens the AppShell's HelpOverlay on mount, then
 * renders a lightweight inline note. Closing the overlay returns the
 * designer to this page; clicking back returns to the preview index.
 */
export function SystemPreviewShortcuts() {
  const { openHelp } = useAppShell();
  const navigate = useNavigate();
  useEffect(() => {
    openHelp();
    // mount-only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="space-y-6">
      <PreviewBackLink />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shortcuts overlay opened</CardTitle>
          <CardDescription>
            The keyboard shortcuts dialog has been opened. Press{' '}
            <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
              Esc
            </kbd>{' '}
            to close.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            onClick={() => {
              openHelp();
              navigate('/system/preview');
            }}
            className="text-sm text-brand-600 hover:underline"
          >
            Reopen and return to index
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
