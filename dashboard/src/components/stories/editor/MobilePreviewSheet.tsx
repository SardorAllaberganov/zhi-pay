import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { LocaleFlag, type LocaleCode } from '@/components/zhipay/LocaleFlag';
import { LOCALE_ORDER } from '@/components/zhipay/LocaleTabTextarea';
import { LOCALE_LABEL_KEY } from '@/components/app-versions/types';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { CtaDeepLink, StoryType } from '@/data/mockStories';
import { StoryPhonePreview } from '../StoryPhonePreview';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: StoryType;
  mediaUrl: string;
  titles: Record<LocaleCode, string>;
  ctaLabels: Record<LocaleCode, string> | null;
  ctaDeepLink: CtaDeepLink | null;
  locale: LocaleCode;
  onLocaleChange: (loc: LocaleCode) => void;
}

/**
 * Bottom sheet containing the same `<StoryPhonePreview>` as the desktop
 * sticky right pane. Used by `<lg` viewports where the form takes the
 * full width — opens via a fixed-bottom-right Eye button on the page.
 */
export function MobilePreviewSheet({
  open,
  onOpenChange,
  type,
  mediaUrl,
  titles,
  ctaLabels,
  ctaDeepLink,
  locale,
  onLocaleChange,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto px-4 pb-6 pt-5">
        <SheetHeader className="text-left">
          <SheetTitle>{t('admin.stories.editor.preview.title')}</SheetTitle>
          <SheetDescription>
            {t('admin.stories.editor.preview.subtitle')}
          </SheetDescription>
        </SheetHeader>

        {/* Locale switcher */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {LOCALE_ORDER.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => onLocaleChange(loc)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 h-9 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                loc === locale
                  ? 'bg-card text-brand-700 dark:text-brand-300 ring-1 ring-brand-300 dark:ring-brand-700/40 shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
              )}
            >
              <LocaleFlag locale={loc} size="sm" />
              <span>{t(LOCALE_LABEL_KEY[loc])}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 flex justify-center">
          <StoryPhonePreview
            type={type}
            mediaUrl={mediaUrl}
            titles={titles}
            ctaLabels={ctaLabels}
            ctaDeepLink={ctaDeepLink}
            locale={locale}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
