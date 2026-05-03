import { Monitor, Moon, Sun } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/providers/ThemeProvider';
import { syncThemeIntoPreferences, updatePreferences, usePreferences } from '@/lib/preferences';
import { t } from '@/lib/i18n';
import type { AdminDensity, AdminLanguage, AdminTheme } from '@/data/mockAdminAuth';
import { PreferenceRow, SegmentedRadio } from './SegmentedRadio';

const THEME_OPTS = (): { value: AdminTheme; label: string; icon: typeof Sun }[] => [
  { value: 'light', label: t('admin.settings.preferences.display.theme.light'), icon: Sun },
  { value: 'dark', label: t('admin.settings.preferences.display.theme.dark'), icon: Moon },
  { value: 'system', label: t('admin.settings.preferences.display.theme.system'), icon: Monitor },
];

export function DisplayPrefsCard() {
  const prefs = usePreferences();
  const { theme: liveTheme, setTheme } = useTheme();

  // Mirror the live ThemeProvider state into the preferences snapshot
  // so the radio group reads from one consistent place.
  if (liveTheme !== prefs.theme) {
    syncThemeIntoPreferences(liveTheme);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.settings.preferences.display.title')}</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        <PreferenceRow label={t('admin.settings.preferences.display.theme')}>
          <SegmentedRadio<AdminTheme>
            name="theme"
            ariaLabel={t('admin.settings.preferences.display.theme')}
            value={liveTheme}
            options={THEME_OPTS().map((o) => ({ value: o.value, label: o.label }))}
            onChange={(next) => setTheme(next)}
          />
        </PreferenceRow>

        <PreferenceRow label={t('admin.settings.preferences.display.language')}>
          <SegmentedRadio<AdminLanguage>
            name="language"
            ariaLabel={t('admin.settings.preferences.display.language')}
            value={prefs.language}
            options={[
              { value: 'en', label: 'English' },
              {
                value: 'ru',
                label: 'Русский',
                disabled: true,
                ariaLabel: t('admin.settings.preferences.display.language.coming-soon'),
              },
              {
                value: 'uz',
                label: "O'zbekcha",
                disabled: true,
                ariaLabel: t('admin.settings.preferences.display.language.coming-soon'),
              },
            ]}
            onChange={(next) => updatePreferences({ language: next })}
          />
        </PreferenceRow>

        <PreferenceRow
          label={t('admin.settings.preferences.display.density')}
          hint={t('admin.settings.preferences.display.density.hint')}
        >
          <SegmentedRadio<AdminDensity>
            name="density"
            ariaLabel={t('admin.settings.preferences.display.density')}
            value={prefs.density}
            options={[
              { value: 'compact', label: t('admin.settings.preferences.display.density.compact') },
              {
                value: 'comfortable',
                label: t('admin.settings.preferences.display.density.comfortable'),
              },
            ]}
            onChange={(next) => updatePreferences({ density: next })}
          />
        </PreferenceRow>

        <PreferenceRow
          label={t('admin.settings.preferences.display.tabular-numerals')}
          hint={t('admin.settings.preferences.display.tabular-numerals.hint')}
        >
          <Switch
            checked={prefs.tabular_numerals}
            onCheckedChange={(checked) => updatePreferences({ tabular_numerals: checked })}
            aria-label={t('admin.settings.preferences.display.tabular-numerals')}
          />
        </PreferenceRow>
      </CardContent>
    </Card>
  );
}
