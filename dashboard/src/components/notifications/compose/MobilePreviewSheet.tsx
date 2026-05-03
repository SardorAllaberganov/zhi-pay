import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { t } from '@/lib/i18n';
import type { ComposeForm } from '../types';
import { PreviewPane } from './PreviewPane';

interface MobilePreviewSheetProps {
  form: ComposeForm;
  initialLocale: 'uz' | 'ru' | 'en';
}

/**
 * `<lg` mirror of `<PreviewPane>`. Opens via a "Preview" button. Inside,
 * the same component renders in `bare` mode so it doesn't double-style
 * with the sheet's chrome.
 */
export function MobilePreviewSheet({ form, initialLocale }: MobilePreviewSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="lg:hidden">
          <Eye className="mr-1.5 h-4 w-4" aria-hidden />
          {t('admin.notifications.compose.preview.open-mobile')}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t('admin.notifications.compose.preview.title')}</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <PreviewPane form={form} initialLocale={initialLocale} bare />
        </div>
      </SheetContent>
    </Sheet>
  );
}
