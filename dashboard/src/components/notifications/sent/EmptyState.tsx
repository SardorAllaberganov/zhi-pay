import { Bell, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';

interface Props {
  /** When true → "no records ever sent yet" variant; primary CTA jumps to Compose. */
  totalEmpty: boolean;
  onCompose: () => void;
  onClearFilters: () => void;
}

export function EmptyState({ totalEmpty, onCompose, onClearFilters }: Props) {
  if (totalEmpty) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background py-12 text-center">
        <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Bell className="h-5 w-5 text-muted-foreground" aria-hidden />
        </div>
        <h3 className="text-base font-medium">
          {t('admin.notifications.sent.empty.no-records.title')}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
          {t('admin.notifications.sent.empty.no-records.body')}
        </p>
        <div className="mt-4">
          <Button type="button" onClick={onCompose}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden />
            {t('admin.notifications.sent.empty.no-records.cta')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-dashed border-border bg-background py-12 text-center">
      <h3 className="text-base font-medium">
        {t('admin.notifications.sent.empty.no-matches.title')}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
        {t('admin.notifications.sent.empty.no-matches.body')}
      </p>
      <div className="mt-4">
        <Button type="button" variant="outline" onClick={onClearFilters}>
          <X className="mr-1.5 h-4 w-4" aria-hidden />
          {t('admin.notifications.sent.empty.no-matches.cta')}
        </Button>
      </div>
    </div>
  );
}
