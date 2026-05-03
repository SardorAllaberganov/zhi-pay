import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { LocaleFlag, type LocaleCode } from '@/components/zhipay/LocaleFlag';
import { LOCALE_ORDER } from '@/components/zhipay/LocaleTabTextarea';
import { LOCALE_LABEL_KEY } from '@/components/app-versions/types';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import {
  type Story,
  addStory,
  editStory,
  getStory,
  nextDisplayOrder,
  publishStory,
  unpublishStory,
} from '@/data/mockStories';
import {
  CtaSection,
  DisplayOrderSection,
  MediaTypeSection,
  ReasonSection,
  ScheduleSection,
  TitlesSection,
} from '@/components/stories/editor/FormSections';
import { EditorFooter } from '@/components/stories/editor/EditorFooter';
import { MobilePreviewSheet } from '@/components/stories/editor/MobilePreviewSheet';
import { PublishConfirmDialog } from '@/components/stories/editor/PublishConfirmDialog';
import { StoryPhonePreview } from '@/components/stories/StoryPhonePreview';
import {
  type StoryFormState,
  emptyForm,
  hasErrors,
  validateForm,
} from '@/components/stories/editor/types';

function storyToForm(s: Story): StoryFormState {
  return {
    type: s.type,
    mediaUrl: s.mediaUrl,
    titles: { uz: s.titleUz, ru: s.titleRu, en: s.titleEn },
    displayOrder: s.displayOrder > 0 ? s.displayOrder : '',
    ctaEnabled: Boolean(s.ctaDeepLink && s.ctaLabelEn),
    ctaLabels: {
      uz: s.ctaLabelUz ?? '',
      ru: s.ctaLabelRu ?? '',
      en: s.ctaLabelEn ?? '',
    },
    ctaDeepLink: s.ctaDeepLink ?? { screen: 'home', params: {} },
    publishedAt: s.publishedAt,
    expiresAt: s.expiresAt,
    isPublished: s.isPublished,
    reason: '',
  };
}

export function StoryEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const existing = useMemo(() => (id ? getStory(id) : null), [id]);

  const [form, setForm] = useState<StoryFormState>(() =>
    existing ? storyToForm(existing) : emptyForm(nextDisplayOrder()),
  );
  const [activeLocale, setActiveLocale] = useState<LocaleCode>('uz');
  const [paramsError, setParamsError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLocale, setPreviewLocale] = useState<LocaleCode>('uz');

  const errors = useMemo(() => validateForm(form, { isEdit }), [form, isEdit]);
  const hasFormErrors = hasErrors(errors) || Boolean(paramsError);

  // Edit-mode: if id is invalid, surface a 404 stub.
  if (isEdit && !existing) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <h2 className="text-lg font-semibold">{t('admin.stories.editor.not-found.title')}</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          {t('admin.stories.editor.not-found.body', { id: id ?? '' })}
        </p>
        <Button variant="outline" onClick={() => navigate('/content/stories')}>
          <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
          {t('admin.stories.editor.action.back-to-list')}
        </Button>
      </div>
    );
  }

  // Hotkeys: Cmd/Ctrl+1/2/3 cycle locales, Cmd+S save draft, Cmd+Enter publish
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const cmdOrCtrl = e.metaKey || e.ctrlKey;
      if (!cmdOrCtrl) return;
      if (e.key === '1' || e.key === '2' || e.key === '3') {
        e.preventDefault();
        const idx = Number(e.key) - 1;
        const loc = LOCALE_ORDER[idx];
        if (loc) {
          setActiveLocale(loc);
          setPreviewLocale(loc);
        }
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (!hasFormErrors && !saving) handleSaveDraft();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (!hasFormErrors && !saving) requestPublish();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasFormErrors, saving, form]);

  // ---------------------------------------------------------------
  // Save flows
  // ---------------------------------------------------------------
  function buildPayload(forcePublish: boolean) {
    const payload = {
      titleUz: form.titles.uz.trim(),
      titleRu: form.titles.ru.trim(),
      titleEn: form.titles.en.trim(),
      mediaUrl: form.mediaUrl.trim(),
      type: form.type,
      ctaLabelUz: form.ctaEnabled ? form.ctaLabels.uz.trim() : null,
      ctaLabelRu: form.ctaEnabled ? form.ctaLabels.ru.trim() : null,
      ctaLabelEn: form.ctaEnabled ? form.ctaLabels.en.trim() : null,
      ctaDeepLink: form.ctaEnabled ? form.ctaDeepLink : null,
      displayOrder:
        typeof form.displayOrder === 'number' ? form.displayOrder : nextDisplayOrder(),
      publishedAt: forcePublish && !form.publishedAt ? new Date() : form.publishedAt,
      expiresAt: form.expiresAt,
    };
    return payload;
  }

  function handleSaveDraft() {
    commit(false);
  }

  function requestPublish() {
    setConfirmOpen(true);
  }

  function commitPublish() {
    setConfirmOpen(false);
    commit(true);
  }

  function commit(publish: boolean) {
    setSaving(true);
    try {
      if (isEdit && existing) {
        editStory({
          id: existing.id,
          ...buildPayload(publish),
          reason: form.reason.trim() || t('admin.stories.editor.reason-fallback-draft'),
        });
        // Reconcile published-state flag via the dedicated mutator so audit
        // captures the transition cleanly. editStory leaves isPublished alone.
        if (publish && !existing.isPublished) {
          publishStory(existing.id, form.publishedAt);
        } else if (!publish && existing.isPublished) {
          unpublishStory(
            existing.id,
            form.reason.trim().length >= 20
              ? form.reason.trim()
              : t('admin.stories.editor.reason-fallback-unpublish'),
          );
        }
        toast.success(
          publish
            ? t('admin.stories.editor.toast.updated-published')
            : t('admin.stories.editor.toast.updated'),
        );
      } else {
        const created = addStory({
          ...buildPayload(publish),
          isPublished: publish,
        });
        toast.success(
          publish
            ? t('admin.stories.editor.toast.created-published', { title: created.titleEn })
            : t('admin.stories.editor.toast.created-draft', { title: created.titleEn }),
        );
      }
      navigate('/content/stories');
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : t('admin.stories.editor.toast.save-failed'),
      );
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------
  const futurePublish =
    form.publishedAt !== null && form.publishedAt.getTime() > Date.now();

  return (
    <div className="space-y-5 pb-28">
      {/* Inline back-link header */}
      <header className="space-y-3">
        <button
          type="button"
          onClick={() => navigate('/content/stories')}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t('admin.stories.editor.back-link')}
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {isEdit ? t('admin.stories.editor.title.edit') : t('admin.stories.editor.title.new')}
          </h1>
          {isEdit && existing && (
            <span className="inline-flex items-center rounded-full bg-muted/60 px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-border tabular">
              {existing.titleEn}
            </span>
          )}
        </div>
      </header>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Form (3/5 = 60%) */}
        <div className="space-y-4 lg:col-span-3">
          <MediaTypeSection
            type={form.type}
            onTypeChange={(type) => setForm((f) => ({ ...f, type }))}
            mediaUrl={form.mediaUrl}
            onMediaUrlChange={(mediaUrl) => setForm((f) => ({ ...f, mediaUrl }))}
            errors={errors}
          />
          <TitlesSection
            titles={form.titles}
            onTitleChange={(loc, next) =>
              setForm((f) => ({ ...f, titles: { ...f.titles, [loc]: next } }))
            }
            active={activeLocale}
            onActiveChange={(loc) => {
              setActiveLocale(loc);
              setPreviewLocale(loc);
            }}
            errors={errors}
          />
          <DisplayOrderSection
            value={form.displayOrder}
            onChange={(displayOrder) => setForm((f) => ({ ...f, displayOrder }))}
            suggested={nextDisplayOrder()}
          />
          <CtaSection
            enabled={form.ctaEnabled}
            onEnabledChange={(ctaEnabled) => setForm((f) => ({ ...f, ctaEnabled }))}
            labels={form.ctaLabels}
            onLabelChange={(loc, next) =>
              setForm((f) => ({ ...f, ctaLabels: { ...f.ctaLabels, [loc]: next } }))
            }
            active={activeLocale}
            onActiveChange={(loc) => {
              setActiveLocale(loc);
              setPreviewLocale(loc);
            }}
            deepLink={form.ctaDeepLink}
            onDeepLinkChange={(ctaDeepLink) => setForm((f) => ({ ...f, ctaDeepLink }))}
            onParamsErrorChange={setParamsError}
            errors={errors}
          />
          <ScheduleSection
            publishedAt={form.publishedAt}
            onPublishedAtChange={(publishedAt) => setForm((f) => ({ ...f, publishedAt }))}
            expiresAt={form.expiresAt}
            onExpiresAtChange={(expiresAt) => setForm((f) => ({ ...f, expiresAt }))}
            errors={errors}
          />
          {isEdit && (
            <ReasonSection
              value={form.reason}
              onChange={(reason) => setForm((f) => ({ ...f, reason }))}
              errors={errors}
            />
          )}
        </div>

        {/* Sticky preview (2/5 = 40%, lg+ only) */}
        <div className="lg:col-span-2">
          <div className="hidden lg:block lg:sticky lg:top-4 space-y-3 rounded-lg border border-border bg-card p-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">{t('admin.stories.editor.preview.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('admin.stories.editor.preview.subtitle')}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              {LOCALE_ORDER.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setPreviewLocale(loc)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md px-3 h-8 text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    loc === previewLocale
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-700/15 dark:text-brand-300 ring-1 ring-brand-200 dark:ring-brand-700/30'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                  )}
                >
                  <LocaleFlag locale={loc} size="sm" />
                  <span>{t(LOCALE_LABEL_KEY[loc])}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-center pt-2">
              <StoryPhonePreview
                type={form.type}
                mediaUrl={form.mediaUrl}
                titles={form.titles}
                ctaLabels={form.ctaEnabled ? form.ctaLabels : null}
                ctaDeepLink={form.ctaEnabled ? form.ctaDeepLink : null}
                locale={previewLocale}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-only floating Preview button */}
      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        className={cn(
          'fixed bottom-24 right-4 z-20 inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 h-11 text-sm font-medium shadow-lg lg:hidden',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        )}
        aria-label={t('admin.stories.editor.preview.open-mobile')}
      >
        <Eye className="h-4 w-4" aria-hidden="true" />
        {t('admin.stories.editor.preview.button')}
      </button>

      <MobilePreviewSheet
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        type={form.type}
        mediaUrl={form.mediaUrl}
        titles={form.titles}
        ctaLabels={form.ctaEnabled ? form.ctaLabels : null}
        ctaDeepLink={form.ctaEnabled ? form.ctaDeepLink : null}
        locale={previewLocale}
        onLocaleChange={setPreviewLocale}
      />

      <EditorFooter
        isEdit={isEdit}
        disabled={hasFormErrors}
        saving={saving}
        onSaveDraft={handleSaveDraft}
        onPublish={requestPublish}
        isScheduled={futurePublish}
      />

      <PublishConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        publishedAt={form.publishedAt}
        isEdit={isEdit}
        onConfirm={commitPublish}
      />
    </div>
  );
}
