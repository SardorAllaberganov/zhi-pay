import { useRef, useState, type RefObject } from 'react';
import { Upload, X } from 'lucide-react';
import type { Editor } from '@tiptap/react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { DateTimeInput } from '@/components/zhipay/DateTimeInput';
import { LocaleTabInputs } from '@/components/zhipay/LocaleTabInputs';
import { LOCALE_LABEL_KEY } from '@/components/app-versions/types';
import { LOCALE_ORDER } from '@/components/zhipay/LocaleTabTextarea';
import type { LocaleCode } from '@/components/zhipay/LocaleFlag';
import { LocaleFlag } from '@/components/zhipay/LocaleFlag';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { RichTextEditor, plainTextLength } from './RichTextEditor';
import { Toolbar } from './Toolbar';
import { TITLE_MAX, TITLE_WARN, BODY_MIN_PLAIN, type NewsEditorErrors, type NewsEditorValues } from './types';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

const NEWS_LOCALE_LABEL_KEY: Record<LocaleCode, string> = LOCALE_LABEL_KEY;

// =====================================================================
// Cover image section
// =====================================================================

interface CoverImageSectionProps {
  imageUrl: string;
  onChange: (next: string) => void;
  errored?: boolean;
}

export function CoverImageSection({ imageUrl, onChange, errored }: CoverImageSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imgErrored, setImgErrored] = useState(false);

  const trimmed = imageUrl.trim();
  const hasImage = trimmed.length > 0 && !errored;

  function pickFile() {
    fileInputRef.current?.click();
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // reset so re-selecting the same file works
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error(t('admin.news.editor.image-upload.error-type'));
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error(t('admin.news.editor.image-upload.error-size'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      toast.error(t('admin.news.editor.image-upload.error-read'));
    };
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setImgErrored(false);
        onChange(result);
      }
    };
    reader.readAsDataURL(file);
  }

  function clear() {
    onChange('');
    setImgErrored(false);
  }

  return (
    <section className="space-y-3">
      <header className="space-y-1">
        <h2 className="text-sm font-semibold text-foreground">{t('admin.news.editor.section.image')}</h2>
        <p className="text-sm text-muted-foreground">{t('admin.news.editor.image-hint')}</p>
      </header>

      {/* Always-visible preview area (placeholder when empty) */}
      <CoverPreview
        url={hasImage ? trimmed : null}
        onPickFile={pickFile}
        onClear={clear}
        errored={imgErrored}
        onImgError={() => setImgErrored(true)}
        onImgLoad={() => setImgErrored(false)}
      />

      {/* URL input — accepts paste OR keeps the data: URL after upload */}
      <div className="space-y-1.5">
        <Label htmlFor="news-image-url">{t('admin.news.editor.image-url')}</Label>
        <div className="flex items-stretch gap-2">
          <Input
            id="news-image-url"
            type="url"
            value={imageUrl.startsWith('data:') ? '' : imageUrl}
            onChange={(e) => {
              setImgErrored(false);
              onChange(e.target.value);
            }}
            placeholder={
              imageUrl.startsWith('data:')
                ? t('admin.news.editor.image-url-uploaded')
                : 'https://cdn.zhipay.uz/news/cover.jpg'
            }
            disabled={imageUrl.startsWith('data:')}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={pickFile}
            className="shrink-0"
          >
            <Upload className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {t('admin.news.editor.image-upload.cta')}
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          onChange={handleFile}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
        <p className="text-sm text-muted-foreground">
          {t('admin.news.editor.image-upload.hint')}
        </p>
        {errored && (
          <div className="text-sm text-danger-700 dark:text-danger-500">
            {t('admin.news.editor.image-error')}
          </div>
        )}
      </div>
    </section>
  );
}

function CoverPreview({
  url,
  onPickFile,
  onClear,
  errored,
  onImgError,
  onImgLoad,
}: {
  url: string | null;
  onPickFile: () => void;
  onClear: () => void;
  errored: boolean;
  onImgError: () => void;
  onImgLoad: () => void;
}) {
  const showImage = !!url && !errored;

  return (
    <div className="space-y-1.5">
      <div className="relative w-full max-w-md">
        <div
          className={cn(
            'relative rounded-md border overflow-hidden',
            showImage ? 'border-border' : 'border-dashed border-border bg-muted/40',
          )}
        >
          <div className="aspect-[16/9] w-full flex items-center justify-center">
            {showImage ? (
              <img
                src={url!}
                alt={t('admin.news.editor.image-preview-alt')}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                onError={onImgError}
                onLoad={onImgLoad}
              />
            ) : (
              <PlaceholderGlyph onPick={onPickFile} />
            )}
          </div>
        </div>

        {/* Remove-image button (only when image is set) */}
        {showImage && (
          <button
            type="button"
            onClick={onClear}
            aria-label={t('admin.news.editor.image-upload.remove')}
            className={cn(
              'absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center',
              'rounded-md bg-foreground/70 hover:bg-foreground/85 text-background backdrop-blur-sm',
              'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            )}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {showImage
          ? t('admin.news.editor.image-upload.caption-loaded')
          : t('admin.news.editor.image-upload.caption-empty')}
      </p>
    </div>
  );
}

/** Slate placeholder w/ mountain+sun glyph — clickable to open the file picker. */
function PlaceholderGlyph({ onPick }: { onPick: () => void }) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={cn(
        'group relative flex h-full w-full items-center justify-center',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      )}
      aria-label={t('admin.news.editor.image-upload.cta')}
    >
      <svg
        viewBox="0 0 64 64"
        className="h-14 w-14 text-slate-400 transition-colors group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400"
        aria-hidden="true"
      >
        <rect
          x="8"
          y="14"
          width="48"
          height="36"
          rx="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <circle cx="40" cy="24" r="3.5" fill="currentColor" />
        <path
          d="M14 46 L26 32 L36 42 L44 34 L50 46 Z"
          fill="currentColor"
          opacity="0.85"
        />
      </svg>
    </button>
  );
}

// =====================================================================
// Titles section — single-line per-locale
// =====================================================================

interface TitlesSectionProps {
  values: Record<LocaleCode, string>;
  onChange: (loc: LocaleCode, next: string) => void;
  active: LocaleCode;
  onActiveChange: (loc: LocaleCode) => void;
  invalidLocales: ReadonlySet<LocaleCode>;
}

export function TitlesSection({ values, onChange, active, onActiveChange, invalidLocales }: TitlesSectionProps) {
  const len = values[active].length;
  const warn = len > TITLE_WARN;

  return (
    <section className="space-y-3">
      <header className="space-y-1">
        <h2 className="text-sm font-semibold text-foreground">{t('admin.news.editor.section.titles')}</h2>
        <p className="text-sm text-muted-foreground">{t('admin.news.editor.titles-hint')}</p>
      </header>

      <LocaleTabInputs
        values={values}
        onChange={onChange}
        active={active}
        onActiveChange={onActiveChange}
        invalidLocales={invalidLocales}
        ariaLabelKey="admin.news.editor.titles-tab-aria"
        localeLabelKey={NEWS_LOCALE_LABEL_KEY}
        placeholderKeyPrefix="admin.news.editor.title-placeholder"
        requiredErrorKey="admin.news.editor.validation.title-required"
        maxLength={TITLE_MAX}
        idPrefix="news-title"
      />

      <div
        className={cn(
          'text-sm flex items-center justify-end',
          warn ? 'text-warning-700 dark:text-warning-500' : 'text-muted-foreground',
        )}
      >
        {t('admin.news.editor.title-counter')
          .replace('{count}', String(len))
          .replace('{max}', String(TITLE_MAX))}
      </div>
    </section>
  );
}

// =====================================================================
// Bodies section — locale tabs + RichTextEditor for active locale
// =====================================================================

interface BodiesSectionProps {
  values: Record<LocaleCode, string>;
  onChange: (loc: LocaleCode, html: string) => void;
  active: LocaleCode;
  onActiveChange: (loc: LocaleCode) => void;
  invalidLocales: ReadonlySet<LocaleCode>;
}

export function BodiesSection({ values, onChange, active, onActiveChange, invalidLocales }: BodiesSectionProps) {
  const html = values[active];
  const plainLen = plainTextLength(html);
  const isInvalid = invalidLocales.has(active);

  return (
    <section className="space-y-3">
      <header className="space-y-1">
        <h2 className="text-sm font-semibold text-foreground">{t('admin.news.editor.section.bodies')}</h2>
        <p className="text-sm text-muted-foreground">{t('admin.news.editor.bodies-hint')}</p>
      </header>

      <BodyLocaleTabStrip
        active={active}
        onActiveChange={onActiveChange}
        invalidLocales={invalidLocales}
      />

      <RichTextEditor
        keyById={`news-body-${active}`}
        value={html}
        onChange={(next) => onChange(active, next)}
        placeholder={t(`admin.news.editor.body-placeholder.${active}`)}
        renderToolbar={(editor) => <Toolbar editor={editor} />}
      />

      <div className="flex items-center justify-between text-sm">
        {isInvalid ? (
          <span className="text-danger-700 dark:text-danger-500">
            {t('admin.news.editor.validation.body-required')
              .replace('{min}', String(BODY_MIN_PLAIN))}
          </span>
        ) : (
          <span className="text-muted-foreground">{t('admin.news.editor.body-format-hint')}</span>
        )}
        <span
          className={cn(
            'tabular tabular-nums',
            plainLen < BODY_MIN_PLAIN
              ? 'text-warning-700 dark:text-warning-500'
              : 'text-muted-foreground',
          )}
        >
          {t('admin.news.editor.body-counter')
            .replace('{count}', String(plainLen))
            .replace('{min}', String(BODY_MIN_PLAIN))}
        </span>
      </div>
    </section>
  );
}

function BodyLocaleTabStrip({
  active,
  onActiveChange,
  invalidLocales,
}: {
  active: LocaleCode;
  onActiveChange: (loc: LocaleCode) => void;
  invalidLocales: ReadonlySet<LocaleCode>;
}) {
  return (
    <div role="tablist" aria-label={t('admin.news.editor.bodies-tab-aria')} className="flex flex-wrap items-center gap-2">
      {LOCALE_ORDER.map((loc, i) => {
        const isActive = loc === active;
        const isInvalid = invalidLocales.has(loc);
        return (
          <button
            key={loc}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onActiveChange(loc)}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-3 h-9 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isActive
                ? 'bg-card text-brand-700 dark:text-brand-300 ring-1 ring-brand-300 dark:ring-brand-700/40 shadow-sm'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            )}
          >
            <LocaleFlag locale={loc} size="sm" />
            <span>{t(NEWS_LOCALE_LABEL_KEY[loc])}</span>
            {isInvalid && (
              <span
                aria-label={t('admin.news.editor.validation.body-incomplete')}
                className="inline-block h-1.5 w-1.5 rounded-full bg-danger-600"
              />
            )}
            <span className="text-xs text-muted-foreground tabular ml-1">⌘{i + 1}</span>
          </button>
        );
      })}
    </div>
  );
}

// =====================================================================
// Publish + scheduling section
// =====================================================================

interface PublishSectionProps {
  isPublished: boolean;
  onIsPublishedChange: (next: boolean) => void;
  publishedAt: Date | null;
  onPublishedAtChange: (next: Date | null) => void;
  /** True when this article was already published before opening the editor. */
  lockPublishedAt: boolean;
}

export function PublishSection({
  isPublished,
  onIsPublishedChange,
  publishedAt,
  onPublishedAtChange,
  lockPublishedAt,
}: PublishSectionProps) {
  return (
    <section className="space-y-3">
      <header className="space-y-1">
        <h2 className="text-sm font-semibold text-foreground">{t('admin.news.editor.section.publish')}</h2>
        <p className="text-sm text-muted-foreground">{t('admin.news.editor.publish-hint')}</p>
      </header>
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2">
          <Switch
            id="news-is-published"
            checked={isPublished}
            onCheckedChange={onIsPublishedChange}
          />
          <Label htmlFor="news-is-published" className="cursor-pointer">
            {t('admin.news.editor.is-published')}
          </Label>
        </div>
      </div>
      {isPublished && (
        <div className="space-y-1.5">
          <Label>{t('admin.news.editor.published-at')}</Label>
          <DateTimeInput
            value={publishedAt}
            onValueChange={onPublishedAtChange}
            allowEmpty={false}
            disabled={lockPublishedAt}
          />
          {lockPublishedAt && (
            <p className="text-sm text-muted-foreground">
              {t('admin.news.editor.published-at-locked')}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

// =====================================================================
// Reason note (edit-on-published)
// =====================================================================

interface ReasonSectionProps {
  reason: string;
  onChange: (next: string) => void;
  required: boolean;
  invalid?: boolean;
}

export function ReasonSection({ reason, onChange, required, invalid }: ReasonSectionProps) {
  if (!required) return null;
  const len = reason.trim().length;
  return (
    <section className="space-y-3">
      <header className="space-y-1">
        <h2 className="text-sm font-semibold text-foreground">{t('admin.news.editor.section.reason')}</h2>
        <p className="text-sm text-muted-foreground">{t('admin.news.editor.reason-hint')}</p>
      </header>
      <textarea
        value={reason}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className={cn(
          'w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none',
          invalid ? 'border-danger-600' : 'border-input',
        )}
        placeholder={t('admin.news.editor.reason-placeholder')}
      />
      <div
        className={cn(
          'text-sm',
          invalid && len < 20
            ? 'text-danger-700 dark:text-danger-500'
            : len < 20
              ? 'text-muted-foreground'
              : 'text-success-700 dark:text-success-400',
        )}
      >
        {t('admin.news.editor.reason-counter').replace('{count}', String(len))}
      </div>
    </section>
  );
}

// =====================================================================
// Compose helper — mirror StorySection structure but lift to a single
// usable component prop. Used by the editor page to call all sections.
// =====================================================================

export interface FormSectionsProps {
  values: NewsEditorValues;
  onValuesChange: (next: NewsEditorValues) => void;
  activeLocale: LocaleCode;
  onActiveLocaleChange: (loc: LocaleCode) => void;
  errors: NewsEditorErrors;
  /** True when this article was already published before opening the editor. */
  isExistingPublished: boolean;
  imageRefRemote?: RefObject<HTMLInputElement>;
}

/**
 * Convenience wrapper used by the page to render every section in order.
 * Sections are also exported individually for finer-grained layout.
 */
export function FormSections({
  values,
  onValuesChange,
  activeLocale,
  onActiveLocaleChange,
  errors,
  isExistingPublished,
}: FormSectionsProps) {
  return (
    <div className="space-y-8">
      <CoverImageSection
        imageUrl={values.imageUrl}
        onChange={(next) => onValuesChange({ ...values, imageUrl: next })}
        errored={errors.imageUrlInvalid}
      />
      <TitlesSection
        values={values.titles}
        onChange={(loc, next) => onValuesChange({ ...values, titles: { ...values.titles, [loc]: next } })}
        active={activeLocale}
        onActiveChange={onActiveLocaleChange}
        invalidLocales={errors.invalidTitles}
      />
      <BodiesSection
        values={values.bodies}
        onChange={(loc, html) => onValuesChange({ ...values, bodies: { ...values.bodies, [loc]: html } })}
        active={activeLocale}
        onActiveChange={onActiveLocaleChange}
        invalidLocales={errors.invalidBodies}
      />
      <PublishSection
        isPublished={values.isPublished}
        onIsPublishedChange={(next) => onValuesChange({ ...values, isPublished: next })}
        publishedAt={values.publishedAt}
        onPublishedAtChange={(next) => onValuesChange({ ...values, publishedAt: next })}
        lockPublishedAt={isExistingPublished}
      />
      <ReasonSection
        reason={values.reason}
        onChange={(next) => onValuesChange({ ...values, reason: next })}
        required={isExistingPublished}
        invalid={errors.reasonRequired}
      />
    </div>
  );
}
