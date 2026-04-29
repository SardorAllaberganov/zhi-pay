import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

interface TopBarProps {
  onCommandPalette: () => void;
  onMobileMenu?: () => void;
  onShowHelp?: () => void;
  searchInputRef?: React.RefObject<HTMLInputElement>;
  className?: string;
}

const ROUTE_TITLES: Record<string, { title: string; section?: string }> = {
  '/': { title: t('admin.nav.overview'), section: t('admin.nav.section.operations') },
  '/transfers': { title: t('admin.nav.transfers'), section: t('admin.nav.section.operations') },
  '/kyc-queue': { title: t('admin.nav.kyc-queue'), section: t('admin.nav.section.operations') },
  '/aml-triage': { title: t('admin.nav.aml-triage'), section: t('admin.nav.section.operations') },
  '/users': { title: t('admin.nav.users'), section: t('admin.nav.section.customers') },
  '/cards': { title: t('admin.nav.cards'), section: t('admin.nav.section.customers') },
  '/recipients': { title: t('admin.nav.recipients'), section: t('admin.nav.section.customers') },
  '/fx-config': { title: t('admin.nav.fx-config'), section: t('admin.nav.section.finance') },
  '/commission-rules': { title: t('admin.nav.commission-rules'), section: t('admin.nav.section.finance') },
  '/audit-log': { title: t('admin.nav.audit-log'), section: t('admin.nav.section.compliance') },
  '/blacklist': { title: t('admin.nav.blacklist'), section: t('admin.nav.section.compliance') },
  '/kyc-tiers': { title: t('admin.nav.kyc-tiers'), section: t('admin.nav.section.compliance') },
  '/services': { title: t('admin.nav.services'), section: t('admin.nav.section.system') },
  '/app-versions': { title: t('admin.nav.app-versions'), section: t('admin.nav.section.system') },
  '/error-codes': { title: t('admin.nav.error-codes'), section: t('admin.nav.section.system') },
  '/stories': { title: t('admin.nav.stories'), section: t('admin.nav.section.content') },
  '/news': { title: t('admin.nav.news'), section: t('admin.nav.section.content') },
  '/notifications': { title: t('admin.nav.notifications'), section: t('admin.nav.section.content') },
};

export function TopBar({
  onCommandPalette,
  onMobileMenu,
  onShowHelp,
  searchInputRef,
  className,
}: TopBarProps) {
  const location = useLocation();
  const route = ROUTE_TITLES[location.pathname] ?? { title: 'ZhiPay Admin' };
  const internalRef = useRef<HTMLInputElement>(null);
  const ref = searchInputRef ?? internalRef;

  useEffect(() => {
    // Focus inheritance for / shortcut handled at AppShell
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card px-4',
        className,
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMobileMenu}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden md:flex items-center gap-2 min-w-0">
        {route.section && (
          <span className="text-sm text-muted-foreground hidden lg:inline">{route.section}</span>
        )}
        {route.section && (
          <span className="text-sm text-muted-foreground hidden lg:inline" aria-hidden="true">
            /
          </span>
        )}
        <span className="text-sm font-medium truncate">{route.title}</span>
      </div>

      <div className="flex-1" />

      <button
        type="button"
        onClick={onCommandPalette}
        className="hidden md:flex items-center gap-2 h-9 w-[320px] lg:w-[420px] rounded-md border border-input bg-background px-3 text-sm text-muted-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Search"
      >
        <Search className="h-4 w-4 opacity-60" />
        <span className="flex-1 text-left truncate">{t('common.actions.search')}</span>
        <kbd className="inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-xs text-muted-foreground">
          <span>⌘</span>
          <span>K</span>
        </kbd>
      </button>

      <Input
        ref={ref}
        type="search"
        placeholder={t('common.actions.search')}
        className="md:hidden h-9"
        aria-label="Search"
      />

      <ThemeToggle />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" aria-label={t('common.actions.notifications')}>
            <Bell className="h-4 w-4" />
            <span
              className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger-600 ring-2 ring-card"
              aria-hidden="true"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('common.actions.notifications')}</TooltipContent>
      </Tooltip>

      <UserMenu onShowHelp={onShowHelp} />
    </header>
  );
}
