import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
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

  return (
    <TooltipProvider delayDuration={200}>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <div className="flex h-dvh bg-background">
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
    </TooltipProvider>
  );
}
