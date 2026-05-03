import { Eye } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import type { LocaleCode } from '@/components/zhipay/LocaleFlag';
import { NewsPhonePreview } from './NewsPhonePreview';

interface Props {
  imageUrl: string;
  titles: Record<LocaleCode, string>;
  bodies: Record<LocaleCode, string>;
  locale: LocaleCode;
  onLocaleChange: (loc: LocaleCode) => void;
}

/** Floating fixed-bottom-right Eye button (`<lg`) opens this sheet with the same preview. */
export function MobilePreviewSheet(props: Props) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="sm"
          className="lg:hidden fixed right-4 bottom-24 z-30 shadow-lg h-11 w-11 rounded-full p-0"
          aria-label={t('admin.news.editor.preview.open')}
        >
          <Eye className="h-5 w-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[88vh] p-0 overflow-hidden flex flex-col">
        <SheetHeader className="px-4 py-3 border-b border-border shrink-0">
          <SheetTitle>{t('admin.news.editor.preview.title')}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <NewsPhonePreview {...props} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
