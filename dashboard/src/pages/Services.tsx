import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';
import {
  type ServiceFull,
  listServices,
  getServiceById,
  setServiceStatus,
  runHealthCheck as runCheckMutator,
} from '@/data/mockServices';
import type { ServiceStatus } from '@/types';
import { CURRENT_USER_ADMIN } from '@/data/mockUsers';
import { ServicesGrid } from '@/components/services/ServicesGrid';
import { EmptyDetailPane } from '@/components/services/EmptyDetailPane';
import { DetailHeader } from '@/components/services/DetailHeader';
import { QuickStatsCard } from '@/components/services/QuickStatsCard';
import { HealthChecksCard } from '@/components/services/HealthChecksCard';
import { ConfigCard } from '@/components/services/ConfigCard';
import { RecentActivityCard } from '@/components/services/RecentActivityCard';
import { ActionBar } from '@/components/services/ActionBar';
import { StatusChangeDialog } from '@/components/services/modals/StatusChangeDialog';

/**
 * Services & Health page — single orchestrator.
 *
 * Routing:
 *   /system/services         → grid only (mobile) or grid + EmptyDetailPane (lg+)
 *   /system/services/:id     → full-page detail (mobile) or grid + detail pane (lg+)
 *
 * URL drives selection so deep-link / back-button / refresh all work.
 */
export function Services() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Initial-load skeleton (matches FX Config / Commission Rules cadence).
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(t);
  }, []);

  // Data version — bumped on every mutator so derived selectors refresh.
  const [version, setVersion] = useState(0);

  // 30s tile-metric tick. The mutator is internal-only (no audit-log
  // emission), so it just bumps `version` to re-render with fresh
  // formatRelative timestamps. Detail-pane stat values are frozen
  // intentionally (per spec "Status changes do NOT auto-update the detail
  // pane — admin sees the value they last set").
  useEffect(() => {
    const interval = window.setInterval(() => {
      setVersion((v) => v + 1);
    }, 30000);
    return () => window.clearInterval(interval);
  }, []);

  const services = useMemo<ServiceFull[]>(
    () => listServices(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );
  const selected = useMemo<ServiceFull | undefined>(
    () => (id ? getServiceById(id) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, version],
  );

  // Track 'last refresh' to show on the page header.
  const [lastRefreshedAt, setLastRefreshedAt] = useState(new Date());

  function handleRefresh() {
    setLastRefreshedAt(new Date());
    setVersion((v) => v + 1);
    toast.success(t('admin.services.toast.refreshed'));
  }

  function handleRunCheckAll() {
    services.forEach((s) => runCheckMutator(s.id));
    setVersion((v) => v + 1);
    setLastRefreshedAt(new Date());
    toast.success(t('admin.services.toast.run-all-done'));
  }

  // Status change dialog state.
  const [pickedTarget, setPickedTarget] = useState<ServiceStatus | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  function openConfirm(target: ServiceStatus) {
    setPickedTarget(target);
    setDialogOpen(true);
  }

  async function handleConfirm({
    target,
    reason,
    acknowledgeImpact,
  }: {
    target: ServiceStatus;
    reason: string;
    acknowledgeImpact?: boolean;
  }) {
    if (!selected) return;
    const updated = setServiceStatus({
      serviceId: selected.id,
      newStatus: target,
      reason,
      acknowledgeImpact,
      actor: { id: CURRENT_USER_ADMIN.id, name: CURRENT_USER_ADMIN.name },
    });
    if (updated) {
      setVersion((v) => v + 1);
      toast.success(
        t('admin.services.toast.status-changed', {
          name: t(`admin.services.name.${selected.name}`),
          status: t(`admin.services.status.${target}`),
        }),
      );
      setDialogOpen(false);
    } else {
      toast.error(t('admin.services.toast.status-change-failed'));
    }
  }

  function handleRunCheck() {
    if (!selected) return;
    const point = runCheckMutator(selected.id);
    setVersion((v) => v + 1);
    if (point) {
      const tone =
        point.status === 'failed'
          ? toast.error
          : point.status === 'slow'
            ? toast.warning
            : toast.success;
      tone(
        t(`admin.services.toast.health-check.${point.status}`, {
          ms: point.responseTimeMs,
        }),
      );
    }
  }

  // Page-scoped hotkeys.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement | null;
      const tag = tgt?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tgt?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // Detail-only hotkeys
      if (selected) {
        if (e.key === '1' && selected.status !== 'active') {
          e.preventDefault();
          openConfirm('active');
          return;
        }
        if (e.key === '2' && selected.status !== 'maintenance') {
          e.preventDefault();
          openConfirm('maintenance');
          return;
        }
        if (e.key === '3' && selected.status !== 'disabled') {
          e.preventDefault();
          openConfirm('disabled');
          return;
        }
        if (e.key === 'r') {
          e.preventDefault();
          handleRunCheck();
          return;
        }
        if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'b') {
          // Don't hijack Esc when the dialog is open.
          if (dialogOpen) return;
          e.preventDefault();
          navigate('/system/services');
          return;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected, dialogOpen],
  );
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Mobile: full-page detail at /system/services/:id
  // Desktop (lg+): always two-pane regardless of :id presence
  return (
    <div className="space-y-4">
      {/* Page header — hidden on mobile when in full-page detail. Stacks title
          above actions on narrow widths; side-by-side from `md+` onward. */}
      <header
        className={cn(
          'flex flex-col gap-3 md:flex-row md:flex-wrap md:items-start md:justify-between',
          selected && 'hidden lg:flex',
        )}
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('admin.services.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('admin.services.subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground hidden md:inline">
            {t('admin.services.refreshed-at', {
              time: formatRelative(lastRefreshedAt),
            })}
          </span>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {t('admin.services.action.refresh')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRunCheckAll}>
            {t('admin.services.action.refresh-all')}
          </Button>
        </div>
      </header>

      {/* Body */}
      {loading ? (
        <ServicesGrid services={[]} loading />
      ) : (
        <>
          {/* Desktop master-detail (`lg+`) — single-column list pane on the
              left + detail pane on the right. Right pane shows the empty
              state until a tile is clicked, then swaps to the service body. */}
          <div className="hidden lg:flex lg:gap-4 lg:items-start">
            <div className="lg:w-[380px] lg:shrink-0 min-w-0">
              <ServicesGrid services={services} />
            </div>
            <div className="lg:flex-1 min-w-0">
              {selected ? (
                <DetailPaneCard
                  service={selected}
                  onPickStatus={openConfirm}
                  onRunCheck={handleRunCheck}
                />
              ) : (
                <EmptyDetailPane />
              )}
            </div>
          </div>

          {/* Mobile (`<lg`) — render the list OR the full-page detail; never
              both at once. The single-column tile layout matches the desktop
              list pane so the tile content has the same density at every
              breakpoint. */}
          {!selected ? (
            <div className="lg:hidden">
              <ServicesGrid services={services} />
            </div>
          ) : (
            <div className="lg:hidden space-y-4 pb-28">
              <ServiceDetailBody
                service={selected}
                onPickStatus={openConfirm}
                onRunCheck={handleRunCheck}
                onBack={() => navigate('/system/services')}
                variant="mobile"
              />
            </div>
          )}
        </>
      )}

      {/* Status-change confirm dialog */}
      {selected && (
        <StatusChangeDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          service={selected}
          target={pickedTarget}
          onConfirm={handleConfirm}
        />
      )}

      {/* Service id not found (mobile + desktop). Render only when :id was set. */}
      {id && !selected && !loading && <NotFound id={id} />}
    </div>
  );
}

interface DetailPaneProps {
  service: ServiceFull;
  onPickStatus: (next: ServiceStatus) => void;
  onRunCheck: () => void;
}

/**
 * Right-pane wrapper card on `lg+`. Wraps the same body in a `<Card>` with
 * a sticky-bottom action bar that scrolls within the pane (not the page).
 */
function DetailPaneCard({ service, onPickStatus, onRunCheck }: DetailPaneProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 space-y-6">
        <ServiceDetailBody
          service={service}
          onPickStatus={onPickStatus}
          onRunCheck={onRunCheck}
          variant="pane"
        />
      </CardContent>
      {/* Pane action bar — sticky-inside the card. */}
      <ActionBar
        service={service}
        onPickStatus={onPickStatus}
        onRunCheck={onRunCheck}
        variant="pane"
      />
    </Card>
  );
}

interface ServiceDetailBodyProps {
  service: ServiceFull;
  onPickStatus: (next: ServiceStatus) => void;
  onRunCheck: () => void;
  onBack?: () => void;
  variant: 'pane' | 'mobile';
}

/**
 * Detail composition shared between desktop right-pane and mobile full
 * page. Cards stack vertically. The mobile variant additionally renders
 * the canonical fixed-bottom overlay action bar (LESSON 2026-05-02).
 */
function ServiceDetailBody({
  service,
  onPickStatus,
  onRunCheck,
  onBack,
  variant,
}: ServiceDetailBodyProps) {
  return (
    <>
      <DetailHeader
        service={service}
        onPickStatus={onPickStatus}
        onBack={onBack}
      />
      <QuickStatsCard service={service} />
      <HealthChecksCard service={service} onRunCheck={onRunCheck} />
      <ConfigCard service={service} />
      <RecentActivityCard service={service} />
      {variant === 'mobile' && (
        <ActionBar
          service={service}
          onPickStatus={onPickStatus}
          onRunCheck={onRunCheck}
          variant="mobile"
        />
      )}
    </>
  );
}

function NotFound({ id }: { id: string }) {
  const navigate = useNavigate();
  return (
    <Card>
      <CardContent className="px-6 py-12 text-center">
        <AlertTriangle
          className="h-8 w-8 text-warning-700 dark:text-warning-600 mx-auto mb-3"
          aria-hidden="true"
        />
        <h2 className="text-lg font-semibold">
          {t('admin.services.not-found.title')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('admin.services.not-found.body', { id })}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/system/services')}
          className="mt-4"
        >
          {t('admin.services.not-found.cta')}
        </Button>
      </CardContent>
    </Card>
  );
}
