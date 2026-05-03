import { Fragment, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bell, Menu, ChevronRight } from 'lucide-react';
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

interface Crumb {
  label: string;
  to?: string;
}

const ROUTE_TITLES: Record<string, { title: string; section?: string }> = {
  '/': { title: t('admin.nav.overview'), section: t('admin.nav.section.operations') },
  '/operations/transfers': {
    title: t('admin.nav.transfers'),
    section: t('admin.nav.section.operations'),
  },
  '/kyc-queue': { title: t('admin.nav.kyc-queue'), section: t('admin.nav.section.operations') },
  '/aml-triage': { title: t('admin.nav.aml-triage'), section: t('admin.nav.section.operations') },
  '/users': { title: t('admin.nav.users'), section: t('admin.nav.section.customers') },
  '/cards': { title: t('admin.nav.cards'), section: t('admin.nav.section.customers') },
  '/recipients': { title: t('admin.nav.recipients'), section: t('admin.nav.section.customers') },
  '/fx-config': { title: t('admin.nav.fx-config'), section: t('admin.nav.section.finance') },
  '/commission-rules': {
    title: t('admin.nav.commission-rules'),
    section: t('admin.nav.section.finance'),
  },
  '/audit-log': { title: t('admin.nav.audit-log'), section: t('admin.nav.section.compliance') },
  '/compliance/blacklist': { title: t('admin.nav.blacklist'), section: t('admin.nav.section.compliance') },
  '/kyc-tiers': { title: t('admin.nav.kyc-tiers'), section: t('admin.nav.section.compliance') },
  '/system/services': { title: t('admin.nav.services'), section: t('admin.nav.section.system') },
  '/system/app-versions': { title: t('admin.nav.app-versions'), section: t('admin.nav.section.system') },
  '/system/error-codes': { title: t('admin.nav.error-codes'), section: t('admin.nav.section.system') },
  '/content/stories': { title: t('admin.nav.stories'), section: t('admin.nav.section.content') },
  '/content/news': { title: t('admin.nav.news'), section: t('admin.nav.section.content') },
  '/notifications': { title: t('admin.nav.notifications'), section: t('admin.nav.section.content') },
};

function titleCaseSegment(seg: string): string {
  return seg
    .split('-')
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function getBreadcrumbs(pathname: string): Crumb[] {
  // /operations/transfers/:id (detail page) — link Transfers back to its list.
  const transferDetailMatch = pathname.match(/^\/operations\/transfers\/(.+)$/);
  if (transferDetailMatch) {
    return [
      { label: t('admin.nav.section.operations') },
      { label: t('admin.nav.transfers'), to: '/operations/transfers' },
      { label: transferDetailMatch[1] },
    ];
  }

  // /system/services/:id — show System › Services & Health › <name>.
  const serviceDetailMatch = pathname.match(/^\/system\/services\/(.+)$/);
  if (serviceDetailMatch) {
    const id = serviceDetailMatch[1];
    return [
      { label: t('admin.nav.section.system') },
      { label: t('admin.nav.services'), to: '/system/services' },
      { label: id.replace(/^svc_/, '') },
    ];
  }

  // /customers/users/:id, /customers/cards/:id (placeholders for now).
  const customerEntityMatch = pathname.match(/^\/customers\/(users|cards)\/(.+)$/);
  if (customerEntityMatch) {
    const seg = customerEntityMatch[1];
    const id = customerEntityMatch[2];
    const labelKey = seg === 'users' ? 'admin.nav.users' : 'admin.nav.cards';
    const flatTo = `/${seg}`;
    return [
      { label: t('admin.nav.section.customers') },
      { label: t(labelKey), to: flatTo },
      { label: id },
    ];
  }

  // Direct ROUTE_TITLES lookup for known routes.
  const route = ROUTE_TITLES[pathname];
  if (route) {
    return [
      ...(route.section ? [{ label: route.section }] : []),
      { label: route.title },
    ];
  }

  // Fallback — derive crumbs from path segments, title-cased.
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return [{ label: t('common.app.name') }];
  return parts.map((p) => ({ label: titleCaseSegment(p) }));
}

export function TopBar({
  onCommandPalette,
  onMobileMenu,
  onShowHelp,
  searchInputRef,
  className,
}: TopBarProps) {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);
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

      <nav
        className="hidden md:flex items-center gap-1.5 min-w-0 flex-shrink"
        aria-label="Breadcrumb"
      >
        {breadcrumbs.map((bc, i) => {
          const isLast = i === breadcrumbs.length - 1;
          // Hide non-leaf crumbs below `lg` so the bar stays compact on tablets.
          const hideOnMd = !isLast && i < breadcrumbs.length - 2;
          return (
            <Fragment key={i}>
              {i > 0 && (
                <ChevronRight
                  className={cn(
                    'h-3.5 w-3.5 text-muted-foreground/60 shrink-0',
                    hideOnMd && 'hidden lg:inline-block',
                  )}
                  aria-hidden="true"
                />
              )}
              {bc.to && !isLast ? (
                <Link
                  to={bc.to}
                  className={cn(
                    'text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors truncate',
                    hideOnMd && 'hidden lg:inline-block',
                  )}
                >
                  {bc.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'text-sm truncate',
                    isLast ? 'font-medium text-foreground' : 'text-muted-foreground',
                    hideOnMd && 'hidden lg:inline-block',
                  )}
                >
                  {bc.label}
                </span>
              )}
            </Fragment>
          );
        })}
      </nav>

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
