import { ArrowUpRight, Copy, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { CardEntry } from '@/data/mockCards';

interface CardActionBarProps {
  card: CardEntry;
  onFreeze: () => void;
  onUnfreeze: () => void;
  onCopyToken: () => void;
  onOpenTransferFlow: () => void;
}

/**
 * Fixed-bottom action bar for the Card Detail page.
 *
 * Layout:
 *   Mobile / tablet (<lg) — 2-row grid:
 *     ┌──────────────────────┬──────────────────────┐
 *     │ Freeze / Unfreeze    │ Copy token           │
 *     ├──────────────────────┴──────────────────────┤
 *     │ Open transfers on this card                 │
 *     └─────────────────────────────────────────────┘
 *
 *   Desktop (lg+) — single row, max-content widths:
 *     ┌─────────────────┐  ┌────────────┐  ┌────────────────┐
 *     │ Freeze/Unfreeze │ →│ Copy token │  │ Open transfers │
 *     └─────────────────┘  └────────────┘  └────────────────┘
 *     ↑ left                ↑ right cluster ─────────────────↑
 *
 * On `expired` / `removed` cards the state-change button is hidden and
 * the secondary cluster anchors the right edge alone.
 */
export function CardActionBar({
  card,
  onFreeze,
  onUnfreeze,
  onCopyToken,
  onOpenTransferFlow,
}: CardActionBarProps) {
  const isActive = card.status === 'active';
  const isFrozen = card.status === 'frozen';
  const showStateButton = isActive || isFrozen;

  return (
    <div
      className={cn(
        // Fixed-bottom overlay matching the canonical action-bar pattern.
        // The left edge tracks AppShell's `--sidebar-width` var on md+ so
        // the bar stays inside the main content area (64px collapsed /
        // 240px expanded). Page wrapper carries `pb-28` to clear it.
        'fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card',
        'md:left-[var(--sidebar-width,4rem)]',
        'px-4 md:px-6 py-3',
      )}
      data-card-action-bar
    >
      <div
        className={cn(
          // Mobile: 2-col grid (Freeze + Copy on row 1, Open transfers
          //         spans both columns on row 2).
          // lg+:    flex row, max-content widths, spacer between
          //         Freeze and the right cluster.
          'grid grid-cols-2 gap-2',
          'lg:flex lg:items-center lg:gap-2',
        )}
      >
        {showStateButton && isActive && (
          <Button
            variant="outline"
            onClick={onFreeze}
            className={cn(
              'w-full lg:w-auto',
              'border-warning-600/40 text-warning-700 hover:bg-warning-50 hover:text-warning-700',
              'dark:border-warning-600/40 dark:text-warning-600 dark:hover:bg-warning-700/15 dark:hover:text-warning-600',
            )}
          >
            <Lock className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {t('admin.cards.action.freeze')}
          </Button>
        )}

        {showStateButton && isFrozen && (
          <Button onClick={onUnfreeze} className="w-full lg:w-auto">
            <Unlock className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {t('admin.cards.action.unfreeze')}
          </Button>
        )}

        {/* Spacer (lg+) — pushes secondary cluster to the right edge.
            Hidden on mobile so it doesn't claim a grid cell. */}
        <div className="hidden lg:block lg:flex-1" aria-hidden="true" />

        <Button
          variant="outline"
          onClick={onCopyToken}
          className={cn(
            'w-full lg:w-auto',
            !showStateButton && 'col-span-2 lg:col-span-1',
          )}
        >
          <Copy className="h-4 w-4 mr-1.5" aria-hidden="true" />
          {t('admin.cards.action.copy-token')}
        </Button>

        <Button
          variant="outline"
          onClick={onOpenTransferFlow}
          className="w-full col-span-2 lg:col-span-1 lg:w-auto"
        >
          <ArrowUpRight className="h-4 w-4 mr-1.5" aria-hidden="true" />
          {t('admin.cards.action.open-transfer-flow')}
        </Button>
      </div>
    </div>
  );
}
