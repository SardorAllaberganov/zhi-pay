import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { LocaleCode } from '@/components/zhipay/LocaleFlag';
import type { UserTier } from '@/data/mockUsers';
import type { LastLoginBucket, SegmentCriteria } from '../types';
import { LAST_LOGIN_LABEL_KEY, LAST_LOGIN_ORDER } from '../types';

interface SegmentBuilderProps {
  value: SegmentCriteria;
  onChange: (next: SegmentCriteria) => void;
}

const TIER_ORDER: UserTier[] = ['tier_0', 'tier_1', 'tier_2'];
const LANGUAGE_ORDER: LocaleCode[] = ['uz', 'ru', 'en'];

const TIER_LABEL_KEY: Record<UserTier, string> = {
  tier_0: 'admin.notifications.compose.segment.tier.tier_0',
  tier_1: 'admin.notifications.compose.segment.tier.tier_1',
  tier_2: 'admin.notifications.compose.segment.tier.tier_2',
};

const LANGUAGE_LABEL_KEY: Record<LocaleCode, string> = {
  uz: 'admin.notifications.compose.locale.uz',
  ru: 'admin.notifications.compose.locale.ru',
  en: 'admin.notifications.compose.locale.en',
};

function ChipToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 h-8 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        active
          ? 'border-brand-600 bg-card text-brand-700 dark:text-brand-300 shadow-sm'
          : 'border-border bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground',
      )}
    >
      {active && <Check className="h-3.5 w-3.5" aria-hidden />}
      {children}
    </button>
  );
}

function TristateGroup({
  value,
  onChange,
  labelKey,
}: {
  value: boolean | null;
  onChange: (next: boolean | null) => void;
  labelKey: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{t(labelKey)}</Label>
      <div className="flex flex-wrap gap-2">
        <ChipToggle active={value === null} onClick={() => onChange(null)}>
          {t('admin.notifications.compose.segment.any')}
        </ChipToggle>
        <ChipToggle active={value === true} onClick={() => onChange(true)}>
          {t('admin.notifications.compose.segment.yes')}
        </ChipToggle>
        <ChipToggle active={value === false} onClick={() => onChange(false)}>
          {t('admin.notifications.compose.segment.no')}
        </ChipToggle>
      </div>
    </div>
  );
}

export function SegmentBuilder({ value, onChange }: SegmentBuilderProps) {
  function toggleTier(tier: UserTier) {
    if (value.tiers.includes(tier)) {
      onChange({ ...value, tiers: value.tiers.filter((x) => x !== tier) });
    } else {
      onChange({ ...value, tiers: [...value.tiers, tier] });
    }
  }
  function toggleLanguage(lang: LocaleCode) {
    if (value.languages.includes(lang)) {
      onChange({ ...value, languages: value.languages.filter((x) => x !== lang) });
    } else {
      onChange({ ...value, languages: [...value.languages, lang] });
    }
  }
  function setLastLogin(bucket: LastLoginBucket | null) {
    onChange({ ...value, lastLogin: bucket });
  }

  const noCriteriaSet =
    value.tiers.length === 0 &&
    value.languages.length === 0 &&
    value.hasLinkedCard === null &&
    value.hasCompletedTransfer === null &&
    value.lastLogin === null;

  return (
    <div className="space-y-4 rounded-md border border-border bg-muted/20 p-4">
      {/* Tiers */}
      <div className="space-y-2">
        <Label>{t('admin.notifications.compose.segment.tier')}</Label>
        <div className="flex flex-wrap gap-2">
          {TIER_ORDER.map((tier) => (
            <ChipToggle
              key={tier}
              active={value.tiers.includes(tier)}
              onClick={() => toggleTier(tier)}
            >
              {t(TIER_LABEL_KEY[tier])}
            </ChipToggle>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className="space-y-2">
        <Label>{t('admin.notifications.compose.segment.language')}</Label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGE_ORDER.map((lang) => (
            <ChipToggle
              key={lang}
              active={value.languages.includes(lang)}
              onClick={() => toggleLanguage(lang)}
            >
              {t(LANGUAGE_LABEL_KEY[lang])}
            </ChipToggle>
          ))}
        </div>
      </div>

      {/* Has linked card */}
      <TristateGroup
        value={value.hasLinkedCard}
        onChange={(next) => onChange({ ...value, hasLinkedCard: next })}
        labelKey="admin.notifications.compose.segment.has-card"
      />

      {/* Has completed transfer */}
      <TristateGroup
        value={value.hasCompletedTransfer}
        onChange={(next) => onChange({ ...value, hasCompletedTransfer: next })}
        labelKey="admin.notifications.compose.segment.has-transfer"
      />

      {/* Last login */}
      <div className="space-y-2">
        <Label>{t('admin.notifications.compose.segment.last-login')}</Label>
        <div className="flex flex-wrap gap-2">
          <ChipToggle active={value.lastLogin === null} onClick={() => setLastLogin(null)}>
            {t('admin.notifications.compose.segment.any')}
          </ChipToggle>
          {LAST_LOGIN_ORDER.map((bucket) => (
            <ChipToggle
              key={bucket}
              active={value.lastLogin === bucket}
              onClick={() => setLastLogin(bucket)}
            >
              {t(LAST_LOGIN_LABEL_KEY[bucket])}
            </ChipToggle>
          ))}
        </div>
      </div>

      {!noCriteriaSet && (
        <div className="flex justify-end pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              onChange({
                tiers: [],
                languages: [],
                hasLinkedCard: null,
                hasCompletedTransfer: null,
                lastLogin: null,
              })
            }
          >
            {t('admin.notifications.compose.segment.clear-all')}
          </Button>
        </div>
      )}
    </div>
  );
}
