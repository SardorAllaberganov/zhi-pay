import { useNavigate } from 'react-router-dom';
import { RefreshCw, ScrollText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ServiceFull } from '@/data/mockServices';
import type { ServiceStatus } from '@/types';
import { StatusToggleGroup } from './StatusToggleGroup';

interface ActionBarProps {
  service: ServiceFull;
  onPickStatus: (next: ServiceStatus) => void;
  onRunCheck: () => void;
  /**
   * Layout mode:
   *   - `pane`  → sticky inside the right pane on desktop (no fixed positioning;
   *               the wrapper supplies its own sticky bottom).
   *   - `mobile`→ full-page detail uses the canonical `fixed inset-x-0 bottom-0
   *               md:left-[var(--sidebar-width,4rem)]` overlay per LESSON 2026-05-02.
   */
  variant?: 'pane' | 'mobile';
}

export function ActionBar({ service, onPickStatus, onRunCheck, variant = 'pane' }: ActionBarProps) {
  const navigate = useNavigate();

  const wrapper =
    variant === 'mobile'
      ? cn(
          'fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card',
          'md:left-[var(--sidebar-width,4rem)] lg:hidden',
          'px-4 py-3',
        )
      : cn(
          // Pane variant: rendered as the Card's footer row inside the
          // right pane on `lg+`. Non-sticky — the StatusToggleGroup
          // already lives in the DetailHeader at the top of the pane, so
          // admins don't need a duplicate at the bottom of the viewport.
          'hidden lg:flex border-t border-border bg-card',
          'px-6 py-3',
        );

  if (variant === 'mobile') {
    // Mobile: stacked rows that all span the full bar width — toggle on top
    // (full-width 3-segment), action buttons on the second row split 50/50.
    return (
      <div className={wrapper}>
        <div className="flex flex-col gap-2">
          <StatusToggleGroup
            current={service.status}
            onPick={onPickStatus}
            fullWidth
          />
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRunCheck}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-1.5" aria-hidden="true" />
              {t('admin.services.detail.action.run-check')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate(`/compliance/audit-log?entity=service&id=${service.id}`)
              }
              className="flex-1"
            >
              <ScrollText className="h-4 w-4 mr-1.5" aria-hidden="true" />
              {t('admin.services.detail.action.open-audit-log')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop pane variant — toggle on the left, action buttons on the right.
  return (
    <div className={wrapper}>
      <div className="flex w-full flex-wrap items-center gap-2">
        <StatusToggleGroup current={service.status} onPick={onPickStatus} compact />
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={onRunCheck}>
            <RefreshCw className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {t('admin.services.detail.action.run-check')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(`/compliance/audit-log?entity=service&id=${service.id}`)
            }
          >
            <ScrollText className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {t('admin.services.detail.action.open-audit-log')}
          </Button>
        </div>
      </div>
    </div>
  );
}
