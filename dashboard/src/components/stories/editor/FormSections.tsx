import { Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { StepperNumberInput } from '@/components/zhipay/StepperNumberInput';
import { DateTimeInput } from '@/components/zhipay/DateTimeInput';
import { LOCALE_LABEL_KEY } from '@/components/app-versions/types';
import type { LocaleCode } from '@/components/zhipay/LocaleFlag';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { CtaDeepLink, StoryType } from '@/data/mockStories';
import { LocaleTabInputs } from '@/components/zhipay/LocaleTabInputs';
import { DeepLinkBuilder } from './DeepLinkBuilder';
import type { StoryFormErrors } from './types';

const STORIES_LOCALE_LABEL_KEY: Record<LocaleCode, string> = LOCALE_LABEL_KEY;

// =====================================================================
// Type + Media URL
// =====================================================================

export function MediaTypeSection({
  type,
  onTypeChange,
  mediaUrl,
  onMediaUrlChange,
  errors,
}: {
  type: StoryType;
  onTypeChange: (next: StoryType) => void;
  mediaUrl: string;
  onMediaUrlChange: (next: string) => void;
  errors: StoryFormErrors;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">{t('admin.stories.editor.section.media')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('admin.stories.editor.section.media-subtitle')}
        </p>
      </div>

      {/* Type radio cards */}
      <div className="space-y-2">
        <Label>{t('admin.stories.editor.type-label')}</Label>
        <div role="radiogroup" className="grid grid-cols-2 gap-2">
          <TypeRadioCard
            type="image"
            checked={type === 'image'}
            onSelect={() => onTypeChange('image')}
          />
          <TypeRadioCard
            type="video"
            checked={type === 'video'}
            onSelect={() => onTypeChange('video')}
          />
        </div>
      </div>

      {/* Media URL */}
      <div className="space-y-2">
        <Label htmlFor="media-url">{t('admin.stories.editor.media-url')}</Label>
        <Input
          id="media-url"
          type="url"
          value={mediaUrl}
          onChange={(e) => onMediaUrlChange(e.target.value)}
          placeholder={
            type === 'video'
              ? t('admin.stories.editor.media-url.placeholder-video')
              : t('admin.stories.editor.media-url.placeholder-image')
          }
          className={cn(errors.mediaUrl && 'border-danger-600 focus-visible:ring-danger-600')}
        />
        {errors.mediaUrl && (
          <div className="text-sm text-danger-700 dark:text-danger-500">
            {t(errors.mediaUrl)}
          </div>
        )}
      </div>
    </div>
  );
}

function TypeRadioCard({
  type,
  checked,
  onSelect,
}: {
  type: StoryType;
  checked: boolean;
  onSelect: () => void;
}) {
  const Icon = type === 'video' ? VideoIcon : ImageIcon;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={cn(
        'flex flex-col items-start gap-1 rounded-md border p-3 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        checked
          ? 'border-brand-600 bg-brand-50/60 ring-1 ring-brand-200 dark:bg-brand-950/30'
          : 'border-border bg-background hover:bg-muted/50',
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn('h-4 w-4', checked ? 'text-brand-700' : 'text-muted-foreground')} aria-hidden="true" />
        <span className={cn('text-sm font-medium', checked && 'text-brand-700 dark:text-brand-300')}>
          {t(`admin.stories.type.${type}`)}
        </span>
      </div>
      <span className="text-sm text-muted-foreground">
        {t(`admin.stories.editor.type.${type}.description`)}
      </span>
    </button>
  );
}

// =====================================================================
// Titles (per locale)
// =====================================================================

export function TitlesSection({
  titles,
  onTitleChange,
  active,
  onActiveChange,
  errors,
}: {
  titles: Record<LocaleCode, string>;
  onTitleChange: (loc: LocaleCode, next: string) => void;
  active: LocaleCode;
  onActiveChange: (loc: LocaleCode) => void;
  errors: StoryFormErrors;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">{t('admin.stories.editor.section.titles')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('admin.stories.editor.section.titles-subtitle')}
        </p>
      </div>
      <LocaleTabInputs
        values={titles}
        onChange={onTitleChange}
        active={active}
        onActiveChange={onActiveChange}
        invalidLocales={errors.titles}
        ariaLabelKey="admin.stories.editor.titles-locale-strip"
        localeLabelKey={STORIES_LOCALE_LABEL_KEY}
        placeholderKeyPrefix="admin.stories.editor.title-placeholder"
        requiredErrorKey="admin.stories.editor.validation.titles-required"
        idPrefix="title"
        maxLength={80}
      />
    </div>
  );
}

// =====================================================================
// Display order
// =====================================================================

export function DisplayOrderSection({
  value,
  onChange,
  suggested,
}: {
  value: number | '';
  onChange: (next: number | '') => void;
  suggested: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">{t('admin.stories.editor.section.display-order')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('admin.stories.editor.section.display-order-subtitle')}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-32">
          <StepperNumberInput
            value={value}
            onValueChange={onChange}
            precision={0}
            step={1}
            shiftStep={5}
            min={0}
            ariaLabel={t('admin.stories.editor.display-order')}
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {t('admin.stories.editor.display-order-suggested', { n: suggested })}
        </span>
      </div>
    </div>
  );
}

// =====================================================================
// CTA — toggle + per-locale labels + deep-link builder
// =====================================================================

export function CtaSection({
  enabled,
  onEnabledChange,
  labels,
  onLabelChange,
  active,
  onActiveChange,
  deepLink,
  onDeepLinkChange,
  onParamsErrorChange,
  errors,
}: {
  enabled: boolean;
  onEnabledChange: (next: boolean) => void;
  labels: Record<LocaleCode, string>;
  onLabelChange: (loc: LocaleCode, next: string) => void;
  active: LocaleCode;
  onActiveChange: (loc: LocaleCode) => void;
  deepLink: CtaDeepLink;
  onDeepLinkChange: (next: CtaDeepLink) => void;
  onParamsErrorChange?: (err: string | null) => void;
  errors: StoryFormErrors;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">{t('admin.stories.editor.section.cta')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('admin.stories.editor.section.cta-subtitle')}
          </p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={onEnabledChange}
          aria-label={t('admin.stories.editor.cta.enable')}
        />
      </div>

      {enabled && (
        <div className="space-y-4 border-t border-border/60 pt-4">
          {/* Per-locale CTA labels */}
          <div className="space-y-2">
            <Label>{t('admin.stories.editor.cta.label-locale')}</Label>
            <LocaleTabInputs
              values={labels}
              onChange={onLabelChange}
              active={active}
              onActiveChange={onActiveChange}
              invalidLocales={errors.ctaLabels}
              ariaLabelKey="admin.stories.editor.cta-locale-strip"
              localeLabelKey={STORIES_LOCALE_LABEL_KEY}
              placeholderKeyPrefix="admin.stories.editor.cta-label-placeholder"
              requiredErrorKey="admin.stories.editor.validation.cta-labels-required"
              idPrefix="cta-label"
              maxLength={40}
            />
          </div>

          {/* Deep link builder */}
          <div className="border-t border-border/60 pt-4">
            <DeepLinkBuilder
              value={deepLink}
              onChange={onDeepLinkChange}
              onParamsErrorChange={onParamsErrorChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// Schedule
// =====================================================================

export function ScheduleSection({
  publishedAt,
  onPublishedAtChange,
  expiresAt,
  onExpiresAtChange,
  errors,
}: {
  publishedAt: Date | null;
  onPublishedAtChange: (next: Date | null) => void;
  expiresAt: Date | null;
  onExpiresAtChange: (next: Date | null) => void;
  errors: StoryFormErrors;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">{t('admin.stories.editor.section.schedule')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('admin.stories.editor.section.schedule-subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{t('admin.stories.editor.schedule.publish-at')}</Label>
          <DateTimeInput
            value={publishedAt}
            onValueChange={onPublishedAtChange}
            allowEmpty
            ariaLabel={t('admin.stories.editor.schedule.publish-at')}
          />
          <p className="text-sm text-muted-foreground">
            {t('admin.stories.editor.schedule.publish-at-hint')}
          </p>
        </div>
        <div className="space-y-2">
          <Label>{t('admin.stories.editor.schedule.expires-at')}</Label>
          <DateTimeInput
            value={expiresAt}
            onValueChange={onExpiresAtChange}
            allowEmpty
            min={publishedAt ?? undefined}
            ariaLabel={t('admin.stories.editor.schedule.expires-at')}
          />
          <p className="text-sm text-muted-foreground">
            {t('admin.stories.editor.schedule.expires-at-hint')}
          </p>
          {errors.expiresAt && (
            <p className="text-sm text-danger-700 dark:text-danger-500">
              {t(errors.expiresAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// Reason note — Edit-only
// =====================================================================

export function ReasonSection({
  value,
  onChange,
  errors,
}: {
  value: string;
  onChange: (next: string) => void;
  errors: StoryFormErrors;
}) {
  const valid = value.trim().length >= 20;
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">{t('admin.stories.editor.section.reason')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('admin.stories.editor.section.reason-subtitle')}
        </p>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={t('admin.stories.editor.reason-placeholder')}
        className={cn(
          'w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'placeholder:text-muted-foreground/70 resize-none',
          errors.reason && 'border-danger-600 focus-visible:ring-danger-600',
        )}
      />
      <div className="flex items-center justify-between text-sm">
        <span className={cn(valid ? 'text-muted-foreground' : 'text-warning-700 dark:text-warning-500')}>
          {t('admin.stories.editor.reason-hint')}
        </span>
        <span className={cn('tabular', valid ? 'text-muted-foreground' : 'text-warning-700 dark:text-warning-500')}>
          {value.trim().length}/20
        </span>
      </div>
    </div>
  );
}
