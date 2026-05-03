import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { updatePreferences, usePreferences } from '@/lib/preferences';
import { t } from '@/lib/i18n';
import type { AdminNotificationSubscriptions } from '@/data/mockAdminAuth';
import { PreferenceRow } from './SegmentedRadio';

const ROW_KEYS: { key: keyof AdminNotificationSubscriptions; labelKey: string; hintKey?: string }[] = [
  {
    key: 'aml_critical',
    labelKey: 'admin.settings.preferences.notifications.aml-critical',
    hintKey: 'admin.settings.preferences.notifications.aml-critical.hint',
  },
  {
    key: 'sanctions_hit',
    labelKey: 'admin.settings.preferences.notifications.sanctions',
    hintKey: 'admin.settings.preferences.notifications.sanctions.hint',
  },
  {
    key: 'service_offline',
    labelKey: 'admin.settings.preferences.notifications.service-offline',
    hintKey: 'admin.settings.preferences.notifications.service-offline.hint',
  },
  {
    key: 'fx_stale',
    labelKey: 'admin.settings.preferences.notifications.fx-stale',
    hintKey: 'admin.settings.preferences.notifications.fx-stale.hint',
  },
  {
    key: 'daily_digest',
    labelKey: 'admin.settings.preferences.notifications.daily-digest',
    hintKey: 'admin.settings.preferences.notifications.daily-digest.hint',
  },
  {
    key: 'failed_signin',
    labelKey: 'admin.settings.preferences.notifications.failed-sign-in',
    hintKey: 'admin.settings.preferences.notifications.failed-sign-in.hint',
  },
];

export function NotificationPrefsCard() {
  const prefs = usePreferences();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.settings.preferences.notifications.title')}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('admin.settings.preferences.notifications.subtitle')}
        </p>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {ROW_KEYS.map((row) => (
          <PreferenceRow
            key={row.key}
            label={t(row.labelKey)}
            hint={row.hintKey ? t(row.hintKey) : undefined}
          >
            <Switch
              checked={prefs.notification_subscriptions[row.key]}
              onCheckedChange={(checked) =>
                updatePreferences({ notification_subscriptions: { [row.key]: checked } })
              }
              aria-label={t(row.labelKey)}
            />
          </PreferenceRow>
        ))}
      </CardContent>
    </Card>
  );
}
