import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

export type SettingsTabId = 'profile' | 'security' | 'sessions' | 'preferences' | 'my-audit';

export const SETTINGS_TAB_IDS: SettingsTabId[] = [
  'profile',
  'security',
  'sessions',
  'preferences',
  'my-audit',
];

const TAB_LABEL_KEYS: Record<SettingsTabId, string> = {
  profile: 'admin.settings.tab.profile',
  security: 'admin.settings.tab.security',
  sessions: 'admin.settings.tab.sessions',
  preferences: 'admin.settings.tab.preferences',
  'my-audit': 'admin.settings.tab.my-audit',
};

interface SettingsTabsProps {
  active: SettingsTabId;
  onChange: (tab: SettingsTabId) => void;
}

/**
 * Inline horizontal tab strip — flows in the page rhythm (NOT sticky).
 * The strip extends edge-to-edge via negative horizontal margins so the
 * border-b separator spans the full main-content area, but the strip
 * itself scrolls with the page — title + tabs + body all move together.
 *
 * Mobile (`<sm`): horizontal scroll on overflow; the active tab stays
 * visible as the strip scrolls. Desktop: full width, distributed.
 */
export function SettingsTabs({ active, onChange }: SettingsTabsProps) {
  return (
    <div
      className={cn(
        '-mx-4 md:-mx-6 px-4 md:px-6',
        'border-b border-border bg-background',
      )}
      role="tablist"
      aria-label={t('admin.settings.title')}
    >
      <div className="flex gap-1 overflow-x-auto -mb-px">
        {SETTINGS_TAB_IDS.map((id) => {
          const isActive = id === active;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`settings-panel-${id}`}
              id={`settings-tab-${id}`}
              onClick={() => onChange(id)}
              className={cn(
                'shrink-0 px-3 md:px-4 py-3 text-sm font-medium transition-colors',
                'border-b-2 border-transparent',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-t-sm',
                isActive
                  ? 'border-brand-600 text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:border-border',
              )}
            >
              {t(TAB_LABEL_KEYS[id])}
            </button>
          );
        })}
      </div>
    </div>
  );
}
