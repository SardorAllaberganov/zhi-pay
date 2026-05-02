import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  ShieldCheck,
  AlertTriangle,
  Users,
  CreditCard,
  UserCircle,
  TrendingUp,
  Percent,
  ScrollText,
  Ban,
  Layers,
  Activity,
  Smartphone,
  AlertCircle,
  Image,
  Newspaper,
  Bell,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ZhiPayLogo } from './ZhiPayLogo';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavItem {
  to: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  titleKey: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    titleKey: 'admin.nav.section.operations',
    items: [
      { to: '/', labelKey: 'admin.nav.overview', icon: LayoutDashboard },
      { to: '/operations/transfers', labelKey: 'admin.nav.transfers', icon: ArrowLeftRight },
      { to: '/operations/kyc-queue', labelKey: 'admin.nav.kyc-queue', icon: ShieldCheck },
      { to: '/operations/aml-triage', labelKey: 'admin.nav.aml-triage', icon: AlertTriangle },
    ],
  },
  {
    titleKey: 'admin.nav.section.customers',
    items: [
      { to: '/customers/users', labelKey: 'admin.nav.users', icon: Users },
      { to: '/customers/cards', labelKey: 'admin.nav.cards', icon: CreditCard },
      { to: '/customers/recipients', labelKey: 'admin.nav.recipients', icon: UserCircle },
    ],
  },
  {
    titleKey: 'admin.nav.section.finance',
    items: [
      { to: '/finance/fx-config', labelKey: 'admin.nav.fx-config', icon: TrendingUp },
      { to: '/finance/commissions', labelKey: 'admin.nav.commission-rules', icon: Percent },
    ],
  },
  {
    titleKey: 'admin.nav.section.compliance',
    items: [
      { to: '/compliance/audit-log', labelKey: 'admin.nav.audit-log', icon: ScrollText },
      { to: '/compliance/blacklist', labelKey: 'admin.nav.blacklist', icon: Ban },
      { to: '/kyc-tiers', labelKey: 'admin.nav.kyc-tiers', icon: Layers },
    ],
  },
  {
    titleKey: 'admin.nav.section.system',
    items: [
      { to: '/services', labelKey: 'admin.nav.services', icon: Activity },
      { to: '/app-versions', labelKey: 'admin.nav.app-versions', icon: Smartphone },
      { to: '/error-codes', labelKey: 'admin.nav.error-codes', icon: AlertCircle },
    ],
  },
  {
    titleKey: 'admin.nav.section.content',
    items: [
      { to: '/stories', labelKey: 'admin.nav.stories', icon: Image },
      { to: '/news', labelKey: 'admin.nav.news', icon: Newspaper },
      { to: '/notifications', labelKey: 'admin.nav.notifications', icon: Bell },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onItemClick?: () => void;
  className?: string;
}

export function Sidebar({ collapsed, onToggle, onItemClick, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border bg-card transition-[width] duration-base ease-standard',
        collapsed ? 'w-[64px]' : 'w-[240px]',
        className,
      )}
      aria-label="Primary navigation"
    >
      <div
        className={cn(
          'flex h-14 items-center border-b border-border px-4',
          collapsed && 'justify-center px-0',
        )}
      >
        <ZhiPayLogo collapsed={collapsed} />
      </div>

      <ScrollArea className="flex-1">
        <nav className="px-2 py-3 space-y-4">
          {SECTIONS.map((section) => (
            <NavSectionView
              key={section.titleKey}
              section={section}
              collapsed={collapsed}
              onItemClick={onItemClick}
            />
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn('w-full justify-center', !collapsed && 'justify-end')}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}

function NavSectionView({
  section,
  collapsed,
  onItemClick,
}: {
  section: NavSection;
  collapsed: boolean;
  onItemClick?: () => void;
}) {
  return (
    <div>
      {!collapsed && (
        <div className="px-3 mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t(section.titleKey)}
        </div>
      )}
      <ul className="space-y-0.5">
        {section.items.map((item) => (
          <NavItemView key={item.to} item={item} collapsed={collapsed} onClick={onItemClick} />
        ))}
      </ul>
    </div>
  );
}

function NavItemView({
  item,
  collapsed,
  onClick,
}: {
  item: NavItem;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <li>
      <NavLink
        to={item.to}
        end={item.to === '/'}
        onClick={onClick}
        className={({ isActive }) =>
          cn(
            'group relative flex h-9 items-center gap-2.5 rounded-md px-3 text-sm font-medium transition-colors',
            'hover:bg-slate-100 dark:hover:bg-slate-800',
            collapsed && 'justify-center px-0',
            isActive
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[2px] before:rounded-r before:bg-brand-600'
              : 'text-foreground/80',
          )
        }
        aria-label={collapsed ? t(item.labelKey) : undefined}
        title={collapsed ? t(item.labelKey) : undefined}
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
      </NavLink>
    </li>
  );
}
