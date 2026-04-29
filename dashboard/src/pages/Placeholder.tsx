import { useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { t } from '@/lib/i18n';

export function Placeholder() {
  const location = useLocation();
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{t('admin.placeholder.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('admin.placeholder.body')}</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Construction className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-sm font-medium text-foreground">
            <code className="font-mono text-muted-foreground">{location.pathname}</code>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This route exists so keyboard shortcuts work end-to-end. Real content lands in a future phase.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
