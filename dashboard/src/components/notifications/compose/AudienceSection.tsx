import { useMemo } from 'react';
import { Megaphone, Filter, User as UserIcon, Users as UsersIcon, type LucideIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ComposeForm } from '../types';
import {
  AUDIENCE_TYPE_LABEL_KEY,
  AUDIENCE_TYPE_ORDER,
  countCriteriaActive,
  type SegmentCriteria,
} from '../types';
import {
  broadcastAudienceCount,
  estimateAudience,
} from '../audienceEstimate';
import { RadioCard } from './RadioCard';
import { SegmentBuilder } from './SegmentBuilder';
import { UserPicker } from './UserPicker';
import type { NotificationAudienceType } from '@/data/mockNotifications';

interface AudienceSectionProps {
  form: ComposeForm;
  onChange: (next: Partial<ComposeForm>) => void;
  showErrors: boolean;
}

const AUDIENCE_ICONS: Record<NotificationAudienceType, LucideIcon> = {
  broadcast: Megaphone,
  segment: Filter,
  single: UserIcon,
};

export function AudienceSection({ form, onChange, showErrors }: AudienceSectionProps) {
  const broadcastTotal = useMemo(() => broadcastAudienceCount(), []);
  const segmentCount = useMemo(
    () => estimateAudience(form.segmentCriteria),
    [form.segmentCriteria],
  );

  function setAudienceType(audienceType: NotificationAudienceType) {
    onChange({ audienceType });
  }

  function setSegmentCriteria(next: SegmentCriteria) {
    onChange({ segmentCriteria: next });
  }

  const criteriaActiveCount = countCriteriaActive(form.segmentCriteria);

  return (
    <div className="space-y-3">
      <Label>{t('admin.notifications.compose.audience.title')}</Label>

      <div role="radiogroup" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {AUDIENCE_TYPE_ORDER.map((aud) => {
          const Icon = AUDIENCE_ICONS[aud];
          const checked = form.audienceType === aud;
          return (
            <RadioCard
              key={aud}
              checked={checked}
              onSelect={() => setAudienceType(aud)}
              ariaLabel={t(AUDIENCE_TYPE_LABEL_KEY[aud])}
            >
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
                  {t(AUDIENCE_TYPE_LABEL_KEY[aud])}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {t(`admin.notifications.compose.audience.${aud}.description`)}
              </span>
            </RadioCard>
          );
        })}
      </div>

      {/* Estimated audience line — broadcast / segment only */}
      {(form.audienceType === 'broadcast' || form.audienceType === 'segment') && (
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2.5">
          <UsersIcon className="h-4 w-4 text-muted-foreground" aria-hidden />
          <span className="text-sm text-muted-foreground">
            {t('admin.notifications.compose.audience.estimated')}:
          </span>
          <span className="text-sm font-semibold tabular">
            {form.audienceType === 'broadcast'
              ? formatCount(broadcastTotal)
              : formatCount(segmentCount)}
          </span>
          <span className="text-sm text-muted-foreground">
            {t('admin.notifications.compose.audience.users')}
          </span>
          {form.audienceType === 'segment' && criteriaActiveCount === 0 && (
            <span className="text-sm text-muted-foreground italic">
              · {t('admin.notifications.compose.audience.segment.no-filters-hint')}
            </span>
          )}
          {form.audienceType === 'segment' && segmentCount === 0 && criteriaActiveCount > 0 && (
            <span className="ml-auto text-sm text-danger-700 dark:text-danger-500">
              {t('admin.notifications.validation.audience-empty')}
            </span>
          )}
        </div>
      )}

      {/* Segment criteria builder */}
      {form.audienceType === 'segment' && (
        <SegmentBuilder value={form.segmentCriteria} onChange={setSegmentCriteria} />
      )}

      {/* Single-user picker */}
      {form.audienceType === 'single' && (
        <UserPicker
          value={form.singleUserId}
          onChange={(id) => onChange({ singleUserId: id })}
          showError={showErrors}
        />
      )}
    </div>
  );
}

function formatCount(n: number): string {
  // Locale-aware-ish thousand separator (space) — matches uz/ru convention.
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
