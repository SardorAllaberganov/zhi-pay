import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActiveRateCard } from '@/components/fx-config/ActiveRateCard';
import { RateTrendChart } from '@/components/fx-config/RateTrendChart';
import { VersionHistoryTable } from '@/components/fx-config/VersionHistoryTable';
import { VersionHistoryMobileCardStack } from '@/components/fx-config/VersionHistoryMobileCardStack';
import {
  getActiveFxRate,
  getInFlightCount,
  listFxRates,
  setInFlightCounter,
} from '@/data/mockFxRates';
import { TRANSFERS_FULL } from '@/data/mockTransfers';
import { t } from '@/lib/i18n';

// Wire the in-flight counter once at module load — keeps mockFxRates
// free of a circular import on mockTransfers.
setInFlightCounter({
  count: () => TRANSFERS_FULL.filter((t) => t.status === 'processing').length,
});

export function FxConfig() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Re-render trigger when a rate is added (mutator runs in update page,
  // but the list reflects the new row when we navigate back here).
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const tid = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(tid);
  }, []);

  // Re-fetch on focus / pop-state — covers the back-from-update flow.
  useEffect(() => {
    function bump() {
      setVersion((v) => v + 1);
    }
    window.addEventListener('focus', bump);
    window.addEventListener('popstate', bump);
    return () => {
      window.removeEventListener('focus', bump);
      window.removeEventListener('popstate', bump);
    };
  }, []);

  const active = useMemo(
    () => getActiveFxRate(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );
  const inFlight = useMemo(
    () => getInFlightCount(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );
  const history = useMemo(
    () => listFxRates(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );

  function goToUpdate() {
    navigate('/finance/fx-config/new');
  }

  // Page-scoped hotkeys: `u` opens the update form.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement | null;
      const tag = tgt?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tgt?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'u') {
        e.preventDefault();
        goToUpdate();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="space-y-4">
      {/* Page header */}
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('admin.fx-config.title')}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t('admin.fx-config.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={goToUpdate} className="flex-1 md:flex-none">
            <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {t('admin.fx-config.action.update')}
          </Button>
        </div>
      </header>

      {/* Active rate card — full width */}
      <ActiveRateCard rate={active} inFlightCount={inFlight} loading={loading} />

      {/* Trend chart */}
      <RateTrendChart loading={loading} />

      {/* Version history — table on lg+, card stack on <lg */}
      <div className="hidden lg:block">
        <VersionHistoryTable
          rows={history}
          activeId={active?.id}
          loading={loading}
        />
      </div>
      <div className="lg:hidden">
        <VersionHistoryMobileCardStack
          rows={history}
          activeId={active?.id}
          loading={loading}
        />
      </div>
    </div>
  );
}
