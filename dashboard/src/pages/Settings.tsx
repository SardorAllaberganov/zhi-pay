import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import {
  SettingsTabs,
  SETTINGS_TAB_IDS,
  type SettingsTabId,
} from '@/components/settings/SettingsTabs';
import { ProfileTab } from '@/components/settings/profile/ProfileTab';
import { SecurityTab } from '@/components/settings/security/SecurityTab';
import { SessionsTab } from '@/components/settings/sessions/SessionsTab';
import { PreferencesTab } from '@/components/settings/preferences/PreferencesTab';
import { MyAuditTab } from '@/components/settings/my-audit/MyAuditTab';

const TAB_INDEX: Record<SettingsTabId, number> = {
  profile: 1,
  security: 2,
  sessions: 3,
  preferences: 4,
  'my-audit': 5,
};

function isValidTab(t: string | null): t is SettingsTabId {
  return SETTINGS_TAB_IDS.includes((t ?? '') as SettingsTabId);
}

export function Settings() {
  const [params, setParams] = useSearchParams();
  const fromUrl = params.get('tab');
  const active: SettingsTabId = isValidTab(fromUrl) ? fromUrl : 'profile';

  const setActive = (next: SettingsTabId) => {
    const nextParams = new URLSearchParams(params);
    if (next === 'profile') nextParams.delete('tab');
    else nextParams.set('tab', next);
    setParams(nextParams, { replace: true });
  };

  // Page-scoped 1-5 chords jump tabs (per spec). Skipped while typing
  // in inputs — same convention as the global keyboard handler.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      const idx = parseInt(e.key, 10);
      if (idx >= 1 && idx <= 5) {
        const id = SETTINGS_TAB_IDS[idx - 1];
        e.preventDefault();
        setActive(id);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return (
    <div className="space-y-6 pb-12">
      <SettingsHeader />
      <SettingsTabs active={active} onChange={setActive} />

      <section
        role="tabpanel"
        id={`settings-panel-${active}`}
        aria-labelledby={`settings-tab-${active}`}
        tabIndex={0}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
      >
        {active === 'profile' && <ProfileTab />}
        {active === 'security' && <SecurityTab />}
        {active === 'sessions' && <SessionsTab />}
        {active === 'preferences' && <PreferencesTab />}
        {active === 'my-audit' && <MyAuditTab />}
      </section>

      {/* `TAB_INDEX` exists to document the chord mapping; reference it
          here so it doesn't get tree-shaken away if the chord handler
          is ever refactored to read from this map. */}
      <span className="sr-only" data-tab-count={Object.keys(TAB_INDEX).length} />
    </div>
  );
}
