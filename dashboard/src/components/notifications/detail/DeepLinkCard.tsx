import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/lib/i18n';
import {
  DEEP_LINK_SCREEN_LABEL_KEY,
  previewDeepLink,
} from '@/lib/deepLinkScreens';
import type { Notification } from '@/data/mockNotifications';

interface Props {
  notification: Notification;
}

/**
 * Renders the deep-link card. Caller decides visibility — this component
 * still guards against `deepLink === null` so a future caller misuse just
 * renders nothing instead of crashing.
 */
export function DeepLinkCard({ notification }: Props) {
  const dl = notification.deepLink;
  if (!dl) return null;

  const previewString = previewDeepLink(dl.screen, dl.params);
  const paramEntries = Object.entries(dl.params);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.notifications.detail.section.deep-link')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {t('admin.notifications.compose.deep-link.screen')}
          </dt>
          <dd className="text-sm font-medium">{t(DEEP_LINK_SCREEN_LABEL_KEY[dl.screen])}</dd>
        </div>

        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {t('admin.notifications.compose.deep-link.params')}
          </span>
          <div className="rounded-md border border-border bg-background px-3 py-2 font-mono text-sm">
            {paramEntries.length === 0 ? (
              <span className="text-muted-foreground italic">
                {t('admin.notifications.detail.deep-link.no-params')}
              </span>
            ) : (
              <pre className="whitespace-pre-wrap break-all">
                {JSON.stringify(dl.params, null, 2)}
              </pre>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {t('admin.notifications.compose.deep-link.preview-label')}
          </span>
          <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-sm break-all">
            {previewString}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
