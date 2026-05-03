import { Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updatePreferences, usePreferences } from '@/lib/preferences';
import { t } from '@/lib/i18n';
import type { AdminDateFormat, AdminTimeFormat } from '@/data/mockAdminAuth';
import { PreferenceRow, SegmentedRadio } from './SegmentedRadio';

// Common IANA timezone shortlist for the Select. Real implementation
// would surface the full IANA list via Intl.supportedValuesOf('timeZone').
const TIMEZONES: { value: string; label: string }[] = [
  { value: 'Asia/Tashkent', label: 'Asia/Tashkent (UTC+5)' },
  { value: 'Asia/Almaty', label: 'Asia/Almaty (UTC+5)' },
  { value: 'Europe/Moscow', label: 'Europe/Moscow (UTC+3)' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai (UTC+8)' },
  { value: 'Asia/Hong_Kong', label: 'Asia/Hong_Kong (UTC+8)' },
  { value: 'Europe/London', label: 'Europe/London (UTC+0/+1)' },
  { value: 'America/New_York', label: 'America/New_York (UTC−5/−4)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (UTC−8/−7)' },
  { value: 'UTC', label: 'UTC' },
];

export function LocalePrefsCard() {
  const prefs = usePreferences();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.settings.preferences.locale.title')}</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        <PreferenceRow
          label={t('admin.settings.preferences.locale.timezone')}
          hint={t('admin.settings.preferences.locale.timezone.hint')}
        >
          <Select
            value={prefs.timezone}
            onValueChange={(next) => updatePreferences({ timezone: next })}
          >
            <SelectTrigger className="h-10 w-[260px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </PreferenceRow>

        <PreferenceRow label={t('admin.settings.preferences.locale.date-format')}>
          <SegmentedRadio<AdminDateFormat>
            name="date_format"
            ariaLabel={t('admin.settings.preferences.locale.date-format')}
            value={prefs.date_format}
            options={[
              { value: 'us', label: 'Apr 28, 2026' },
              { value: 'eu', label: '28.04.2026' },
              { value: 'iso', label: '2026-04-28' },
            ]}
            onChange={(next) => updatePreferences({ date_format: next })}
          />
        </PreferenceRow>

        <PreferenceRow label={t('admin.settings.preferences.locale.time-format')}>
          <SegmentedRadio<AdminTimeFormat>
            name="time_format"
            ariaLabel={t('admin.settings.preferences.locale.time-format')}
            value={prefs.time_format}
            options={[
              { value: '12h', label: t('admin.settings.preferences.locale.time-format.12h') },
              { value: '24h', label: t('admin.settings.preferences.locale.time-format.24h') },
            ]}
            onChange={(next) => updatePreferences({ time_format: next })}
          />
        </PreferenceRow>

        <div className="pt-3 flex items-start gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
          <p>{t('admin.settings.preferences.locale.rollout-note')}</p>
        </div>
      </CardContent>
    </Card>
  );
}
