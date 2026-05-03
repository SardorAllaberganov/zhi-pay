import { useNavigate } from 'react-router-dom';
import { ImageOff, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';

export function EmptyStoriesState() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <ImageOff className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold">{t('admin.stories.empty.title')}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        {t('admin.stories.empty.body')}
      </p>
      <Button onClick={() => navigate('/content/stories/new')}>
        <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
        {t('admin.stories.empty.cta')}
      </Button>
    </div>
  );
}

export function EmptyStoriesFilteredState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Search className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold">{t('admin.stories.empty.filtered-title')}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        {t('admin.stories.empty.filtered-body')}
      </p>
      <Button variant="outline" onClick={onClear}>
        {t('admin.stories.filter.clear-all')}
      </Button>
    </div>
  );
}
