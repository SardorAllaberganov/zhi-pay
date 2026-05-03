import { t } from '@/lib/i18n';

/**
 * Inline page header — flows in the page rhythm (NEVER sticky per
 * LESSON 2026-05-02 detail-page header rule). The sticky element on
 * this page is the tab strip below, not the title band.
 */
export function SettingsHeader() {
  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {t('admin.settings.title')}
      </h1>
      <p className="text-sm text-muted-foreground">{t('admin.settings.subtitle')}</p>
    </header>
  );
}
