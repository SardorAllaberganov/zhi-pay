import { Clock, Send } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { DateTimeInput } from '@/components/zhipay/DateTimeInput';
import { t } from '@/lib/i18n';
import type { ScheduleMode } from '../types';
import { RadioCard } from './RadioCard';

interface ScheduleSectionProps {
  mode: ScheduleMode;
  scheduledFor: Date | null;
  onModeChange: (next: ScheduleMode) => void;
  onScheduledForChange: (next: Date | null) => void;
  scheduleError: boolean;
}

export function ScheduleSection({
  mode,
  scheduledFor,
  onModeChange,
  onScheduledForChange,
  scheduleError,
}: ScheduleSectionProps) {
  // Min datetime — 5 minutes in the future, snapped to next 5-minute step
  const min = (() => {
    const d = new Date(Date.now() + 5 * 60 * 1000);
    d.setSeconds(0, 0);
    const m = d.getMinutes();
    d.setMinutes(Math.ceil(m / 5) * 5);
    return d;
  })();

  return (
    <div className="space-y-3">
      <Label>{t('admin.notifications.compose.schedule.title')}</Label>
      <div role="radiogroup" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <RadioCard
          checked={mode === 'now'}
          onSelect={() => onModeChange('now')}
          ariaLabel={t('admin.notifications.compose.schedule.now')}
        >
          <div className="flex items-center gap-2">
            <Send
              className={
                mode === 'now'
                  ? 'h-4 w-4 text-brand-700 dark:text-brand-300'
                  : 'h-4 w-4 text-muted-foreground'
              }
              aria-hidden
            />
            <span
              className={
                mode === 'now'
                  ? 'text-sm font-medium text-brand-700 dark:text-brand-300'
                  : 'text-sm font-medium'
              }
            >
              {t('admin.notifications.compose.schedule.now')}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {t('admin.notifications.compose.schedule.now.description')}
          </span>
        </RadioCard>
        <RadioCard
          checked={mode === 'later'}
          onSelect={() => onModeChange('later')}
          ariaLabel={t('admin.notifications.compose.schedule.later')}
        >
          <div className="flex items-center gap-2">
            <Clock
              className={
                mode === 'later'
                  ? 'h-4 w-4 text-brand-700 dark:text-brand-300'
                  : 'h-4 w-4 text-muted-foreground'
              }
              aria-hidden
            />
            <span
              className={
                mode === 'later'
                  ? 'text-sm font-medium text-brand-700 dark:text-brand-300'
                  : 'text-sm font-medium'
              }
            >
              {t('admin.notifications.compose.schedule.later')}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {t('admin.notifications.compose.schedule.later.description')}
          </span>
        </RadioCard>
      </div>

      {mode === 'later' && (
        <div className="space-y-2">
          <Label htmlFor="notif-scheduled-for">
            {t('admin.notifications.compose.schedule.datetime-label')}
          </Label>
          <DateTimeInput
            id="notif-scheduled-for"
            value={scheduledFor}
            onValueChange={onScheduledForChange}
            min={min}
            ariaLabel={t('admin.notifications.compose.schedule.datetime-aria')}
          />
          {scheduleError && (
            <p className="text-sm text-danger-700 dark:text-danger-500">
              {t('admin.notifications.validation.schedule-required')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
