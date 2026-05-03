import { Plus, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { t } from '@/lib/i18n';
import type { Platform } from '@/data/mockAppVersions';
import { PLATFORM_LABEL_KEY } from './types';

/**
 * Empty state for a platform tab with no versions yet. Calm muted body +
 * inline "Add the first version" CTA so the admin doesn't have to hunt for
 * the page-header button on first load.
 */
export function EmptyState({
  platform,
  onAdd,
}: {
  platform: Platform;
  onAdd: () => void;
}) {
  return (
    <Card>
      <CardContent className="px-6 py-12 text-center">
        <Smartphone
          className="h-8 w-8 text-muted-foreground mx-auto mb-3"
          aria-hidden="true"
        />
        <h3 className="text-base font-medium">
          {t('admin.app-versions.empty.title', {
            platform: t(PLATFORM_LABEL_KEY[platform]),
          })}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('admin.app-versions.empty.body')}
        </p>
        <Button size="sm" onClick={onAdd} className="mt-4">
          <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
          {t('admin.app-versions.action.add')}
        </Button>
      </CardContent>
    </Card>
  );
}
