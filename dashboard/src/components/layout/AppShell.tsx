import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { OfflineBanner } from '@/components/system/OfflineBanner';
import { cn } from '@/lib/utils';
import { AppShellContext, type AppShellActions } from './AppShellContext';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { CommandPalette } from './CommandPalette';
import { HelpOverlay } from './HelpOverlay';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Auto-collapse on tablet width
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 1023px)');
    const apply = () => setCollapsed(mql.matches);
    apply();
    mql.addEventListener('change', apply);
    return () => mql.removeEventListener('change', apply);
  }, []);

  useKeyboardShortcuts({
    onCommandPalette: () => setPaletteOpen((v) => !v),
    onHelp: () => setHelpOpen(true),
    onToggleTheme: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
    onSearch: () => searchRef.current?.focus(),
    onEscape: () => {
      if (paletteOpen) setPaletteOpen(false);
      if (helpOpen) setHelpOpen(false);
      if (mobileOpen) setMobileOpen(false);
    },
  });

  // Expose the sidebar's current width as a CSS variable on the shell
  // root so fixed-bottom action bars can offset their `left` precisely
  // — `md:left-[var(--sidebar-width)]` — and stay inside the main
  // content area whether the sidebar is collapsed (64px) or expanded
  // (240px). On `<md` the sidebar is hidden behind a Sheet, so the var
  // is never read (the bar uses `inset-x-0` for full viewport width).
  const sidebarWidthPx = collapsed ? 64 : 240;

  // Imperative handles handed to deep descendants via context — used by
  // the in-shell 404 page's "Open command palette" secondary CTA, and
  // by the `/system/preview/shortcuts` route. Memoized with useCallback
  // so the context value is reference-stable across renders unless the
  // setters identity changes (they don't).
  const openCommandPalette = useCallback(() => setPaletteOpen(true), []);
  const openHelp = useCallback(() => setHelpOpen(true), []);
  const shellActions = useMemo<AppShellActions>(
    () => ({ openCommandPalette, openHelp }),
    [openCommandPalette, openHelp],
  );

  return (
    <TooltipProvider delayDuration={200}>
      <AppShellContext.Provider value={shellActions}>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <div
        className="flex h-dvh bg-background"
        style={{ '--sidebar-width': `${sidebarWidthPx}px` } as React.CSSProperties}
      >
        <div className="hidden md:flex">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-[280px] p-0">
            <Sidebar
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
              onItemClick={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 flex-col min-w-0">
          <TopBar
            onCommandPalette={() => setPaletteOpen(true)}
            onMobileMenu={() => setMobileOpen(true)}
            onShowHelp={() => setHelpOpen(true)}
            searchInputRef={searchRef}
          />

          {/* Offline banner sits between TopBar and main content. Renders
              only when `navigator.onLine` is `false`. Stale data stays
              visible below; write actions across the app gate themselves
              on `useNetworkState()`. */}
          <OfflineBanner />

          <main
            id="main-content"
            tabIndex={-1}
            className={cn('flex-1 overflow-y-auto outline-none', 'p-4 md:p-6')}
          >
            {children}
          </main>
        </div>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <HelpOverlay open={helpOpen} onOpenChange={setHelpOpen} />
      </AppShellContext.Provider>
    </TooltipProvider>
  );
}
