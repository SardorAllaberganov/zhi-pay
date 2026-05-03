import { Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { t } from '@/lib/i18n';

/**
 * Right-pane empty state on `lg+` when no service is selected.
 * Quiet, centered, no CTA — the grid on the left already drives selection.
 */
export function EmptyDetailPane() {
  return (
    <Card className="flex h-full min-h-[480px] items-center justify-center">
      <CardContent className="text-center px-6 py-12">
        <Activity
          className="h-10 w-10 text-muted-foreground mx-auto mb-4"
          aria-hidden="true"
        />
        <h2 className="text-base font-semibold">
          {t('admin.services.empty-pane.title')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
          {t('admin.services.empty-pane.body')}
        </p>
      </CardContent>
    </Card>
  );
}
