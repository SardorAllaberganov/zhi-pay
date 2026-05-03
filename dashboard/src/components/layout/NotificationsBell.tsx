import { useState } from 'react';
import { Bell, Shield, ArrowUpDown, Snowflake } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * In-app notifications popover for the admin TopBar.
 *
 * Distinct from the `/content/notifications` surface (which authors
 * push notifications to mobile end-users). This bell surfaces
 * admin-side activity — recent escalations, rate updates, automated
 * actions — that the signed-in admin should know about.
 *
 * Backed by a small hand-coded mock for now. Once a real
 * `admin_inbox` table lands, swap the items source.
 */

type ItemTone = 'danger' | 'warning' | 'info';

interface Item {
  id: string;
  title: string;
  body: string;
  relative: string;
  to: string;
  tone: ItemTone;
  Icon: typeof Bell;
}

const ITEMS: Item[] = [
  {
    id: 'n_01',
    title: 'AML flag escalated to compliance',
    body: 'Sanctions hit detected — auto-blocked sender.',
    relative: '12m ago',
    to: '/operations/aml-triage/aml_01',
    tone: 'danger',
    Icon: Shield,
  },
  {
    id: 'n_02',
    title: 'FX rate updated',
    body: 'New active version live · open audit entry.',
    relative: '1h ago',
    to: '/compliance/audit-log?entity=fx_rate',
    tone: 'info',
    Icon: ArrowUpDown,
  },
  {
    id: 'n_03',
    title: 'Card frozen by ops',
    body: 'Card 8600 11•• •••• 4242 frozen — repeated declines.',
    relative: '3h ago',
    to: '/customers/cards/c_01',
    tone: 'warning',
    Icon: Snowflake,
  },
];

const TONE_CLASSES: Record<ItemTone, { ring: string; bg: string; text: string }> = {
  danger: {
    ring: 'ring-danger-200 dark:ring-danger-900/40',
    bg: 'bg-danger-50 dark:bg-danger-950/40',
    text: 'text-danger-700 dark:text-danger-300',
  },
  warning: {
    ring: 'ring-amber-200 dark:ring-amber-900/40',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
  },
  info: {
    ring: 'ring-brand-200 dark:ring-brand-900/40',
    bg: 'bg-brand-50 dark:bg-brand-950/40',
    text: 'text-brand-700 dark:text-brand-300',
  },
};

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const unreadCount = ITEMS.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label={t('common.actions.notifications')}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 ? (
                <span
                  className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger-600 ring-2 ring-card"
                  aria-hidden="true"
                />
              ) : null}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>{t('common.actions.notifications')}</TooltipContent>
      </Tooltip>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] p-0 overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold text-foreground">
            {t('common.actions.notifications')}
          </span>
          {unreadCount > 0 ? (
            <span className="text-sm text-muted-foreground">
              {unreadCount} new
            </span>
          ) : null}
        </div>

        {ITEMS.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Bell className="mx-auto h-6 w-6 text-muted-foreground/60" aria-hidden="true" />
            <p className="mt-2 text-sm text-muted-foreground">
              You&apos;re all caught up.
            </p>
          </div>
        ) : (
          <ul className="max-h-[360px] overflow-y-auto">
            {ITEMS.map((it) => {
              const tone = TONE_CLASSES[it.tone];
              return (
                <li key={it.id}>
                  <Link
                    to={it.to}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:bg-muted/60"
                  >
                    <span
                      className={cn(
                        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1',
                        tone.ring,
                        tone.bg,
                      )}
                      aria-hidden="true"
                    >
                      <it.Icon className={cn('h-4 w-4', tone.text)} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {it.title}
                      </span>
                      <span className="block text-sm text-muted-foreground line-clamp-2">
                        {it.body}
                      </span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">
                        {it.relative}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <div className="border-t border-border px-4 py-2.5">
          <Link
            to="/compliance/audit-log"
            onClick={() => setOpen(false)}
            className="block text-center text-sm font-medium text-brand-700 dark:text-brand-300 hover:underline focus-visible:outline-none focus-visible:underline"
          >
            View audit log
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
