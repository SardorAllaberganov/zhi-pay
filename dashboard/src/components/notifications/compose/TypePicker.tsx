import { ArrowRightLeft, Megaphone, Settings as SettingsIcon, ShieldAlert, type LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { NotificationType } from '@/data/mockNotifications';
import {
  NOTIFICATION_TYPE_LABEL_KEY,
  NOTIFICATION_TYPE_ORDER,
  NOTIFICATION_TYPE_TOOLTIP_KEY,
} from '../types';
import { RadioCard } from './RadioCard';

const TYPE_ICONS: Record<NotificationType, LucideIcon> = {
  transfer: ArrowRightLeft,
  promo: Megaphone,
  system: SettingsIcon,
  compliance: ShieldAlert,
};

interface TypePickerProps {
  value: NotificationType;
  onChange: (next: NotificationType) => void;
}

export function TypePicker({ value, onChange }: TypePickerProps) {
  return (
    <div className="space-y-2">
      <Label>{t('admin.notifications.compose.type.title')}</Label>
      <TooltipProvider delayDuration={200}>
        <div role="radiogroup" className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {NOTIFICATION_TYPE_ORDER.map((type) => {
            const Icon = TYPE_ICONS[type];
            const checked = value === type;
            return (
              <Tooltip key={type}>
                <TooltipTrigger asChild>
                  <RadioCard
                    checked={checked}
                    onSelect={() => onChange(type)}
                    ariaLabel={t(NOTIFICATION_TYPE_LABEL_KEY[type])}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0',
                            checked ? 'text-brand-700 dark:text-brand-300' : 'text-muted-foreground',
                          )}
                          aria-hidden
                        />
                        <span
                          className={cn(
                            'text-sm font-medium',
                            checked && 'text-brand-700 dark:text-brand-300',
                          )}
                        >
                          {t(NOTIFICATION_TYPE_LABEL_KEY[type])}
                        </span>
                      </div>
                      <Info className="h-3.5 w-3.5 text-muted-foreground/70" aria-hidden />
                    </div>
                  </RadioCard>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-sm">{t(NOTIFICATION_TYPE_TOOLTIP_KEY[type])}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}
