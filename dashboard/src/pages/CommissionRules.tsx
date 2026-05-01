import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActiveRuleCard } from '@/components/commissions/ActiveRuleCard';
import { WorkedExampleCard } from '@/components/commissions/WorkedExampleCard';
import { VersionHistoryTable } from '@/components/commissions/VersionHistoryTable';
import { VersionHistoryMobileCardStack } from '@/components/commissions/VersionHistoryMobileCardStack';
import {
  getActiveCommissionRule,
  listCommissionRules,
  type AccountType,
} from '@/data/mockCommissionRules';
import { t } from '@/lib/i18n';

function parseAccountType(raw: string | null): AccountType {
  return raw === 'corporate' ? 'corporate' : 'personal';
}

export function CommissionRules() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  // Re-render trigger when a rule version is added (mutator runs on the
  // new-version page, list reflects on return — same pattern as FxConfig).
  const [version, setVersion] = useState(0);

  const accountType = parseAccountType(searchParams.get('account_type'));

  useEffect(() => {
    const tid = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(tid);
  }, []);

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

  const personalActive = useMemo(
    () => getActiveCommissionRule('personal'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );
  const personalHistory = useMemo(
    () => listCommissionRules('personal'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );
  const corporateActive = useMemo(
    () => getActiveCommissionRule('corporate'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );
  const corporateHistory = useMemo(
    () => listCommissionRules('corporate'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );

  const goToNewVersion = useCallback(
    (forType: AccountType) => {
      navigate(`/finance/commissions/new?account_type=${forType}`);
    },
    [navigate],
  );

  // Page-scoped hotkey: `n` opens the new-version page for the visible tab.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement | null;
      const tag = tgt?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tgt?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'n') {
        e.preventDefault();
        goToNewVersion(accountType);
      }
    },
    [accountType, goToNewVersion],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  function setTab(next: string) {
    const nextParams = new URLSearchParams(searchParams);
    if (next === 'corporate') {
      nextParams.set('account_type', 'corporate');
    } else {
      nextParams.delete('account_type');
    }
    setSearchParams(nextParams, { replace: true });
  }

  return (
    <div className="space-y-4">
      {/* Page header */}
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('admin.commissions.title')}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t('admin.commissions.subtitle')}
          </p>
        </div>
      </header>

      <Tabs value={accountType} onValueChange={setTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">
            {t('admin.commissions.tab.personal')}
          </TabsTrigger>
          <TabsTrigger value="corporate">
            {t('admin.commissions.tab.corporate')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <ActiveRuleCard
            rule={personalActive}
            loading={loading}
            onNewVersion={() => goToNewVersion('personal')}
          />
          <WorkedExampleCard rule={personalActive} loading={loading} />
          <div className="hidden lg:block">
            <VersionHistoryTable
              rows={personalHistory}
              activeId={personalActive?.id}
              accountType="personal"
              loading={loading}
            />
          </div>
          <div className="lg:hidden">
            <VersionHistoryMobileCardStack
              rows={personalHistory}
              activeId={personalActive?.id}
              accountType="personal"
              loading={loading}
            />
          </div>
        </TabsContent>

        <TabsContent value="corporate" className="space-y-4">
          <ActiveRuleCard
            rule={corporateActive}
            loading={loading}
            onNewVersion={() => goToNewVersion('corporate')}
          />
          <WorkedExampleCard rule={corporateActive} loading={loading} />
          <div className="hidden lg:block">
            <VersionHistoryTable
              rows={corporateHistory}
              activeId={corporateActive?.id}
              accountType="corporate"
              loading={loading}
            />
          </div>
          <div className="lg:hidden">
            <VersionHistoryMobileCardStack
              rows={corporateHistory}
              activeId={corporateActive?.id}
              accountType="corporate"
              loading={loading}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
