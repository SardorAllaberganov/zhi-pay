import { Newspaper, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';

interface Props {
  variant: 'no-records' | 'no-matches';
  onAction: () => void;
  onClearFilters?: () => void;
}

export function EmptyState({ variant, onAction, onClearFilters }: Props) {
  if (variant === 'no-records') {
    return (
      <div className="rounded-md border border-dashed border-border bg-card flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Newspaper className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </div>
        <h3 className="text-base font-medium text-foreground mb-1">
          {t('admin.news.empty.no-records-title')}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md">
          {t('admin.news.empty.no-records-body')}
        </p>
        <Button onClick={onAction}>
          <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
          {t('admin.news.action.new')}
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-dashed border-border bg-card flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
        <Filter className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="text-base font-medium text-foreground mb-1">
        {t('admin.news.empty.no-matches-title')}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        {t('admin.news.empty.no-matches-body')}
      </p>
      {onClearFilters && (
        <Button variant="outline" onClick={onClearFilters}>
          {t('admin.news.filter.clear-all')}
        </Button>
      )}
    </div>
  );
}
