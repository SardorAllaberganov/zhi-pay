import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { LocaleCode } from '@/components/zhipay/LocaleFlag';
import { LOCALE_ORDER } from '@/components/zhipay/LocaleTabTextarea';
import {
  type News,
  addNews,
  editNews,
  getNews,
} from '@/data/mockNews';
import { FormSections } from '@/components/news/editor/FormSections';
import { NewsPhonePreview } from '@/components/news/editor/NewsPhonePreview';
import { MobilePreviewSheet } from '@/components/news/editor/MobilePreviewSheet';
import { EditorFooter } from '@/components/news/editor/EditorFooter';
import { PublishConfirmDialog } from '@/components/news/editor/PublishConfirmDialog';
import { plainTextLength } from '@/components/news/editor/RichTextEditor';
import {
  TITLE_MAX,
  BODY_MIN_PLAIN,
  REASON_MIN,
  type NewsEditorErrors,
  type NewsEditorValues,
} from '@/components/news/editor/types';

function emptyValues(): NewsEditorValues {
  return {
    imageUrl: '',
    titles: { uz: '', ru: '', en: '' },
    bodies: { uz: '', ru: '', en: '' },
    isPublished: false,
    publishedAt: null,
    reason: '',
  };
}

function valuesFromNews(n: News): NewsEditorValues {
  return {
    imageUrl: n.imageUrl ?? '',
    titles: { uz: n.titleUz, ru: n.titleRu, en: n.titleEn },
    bodies: { uz: n.bodyUz, ru: n.bodyRu, en: n.bodyEn },
    isPublished: n.isPublished,
    publishedAt: n.publishedAt,
    reason: '',
  };
}

export function NewsEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = id === undefined;

  const existing: News | null = useMemo(() => {
    if (isNew) return null;
    return getNews(id) ?? null;
  }, [id, isNew]);

  // 404 — :id given but no record
  if (!isNew && !existing) {
    return (
      <div className="rounded-md border border-dashed border-border bg-card flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Inbox className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </div>
        <h3 className="text-base font-medium text-foreground mb-1">
          {t('admin.news.editor.not-found.title')}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md">
          {t('admin.news.editor.not-found.body')}
        </p>
        <Button variant="outline" onClick={() => navigate('/content/news')}>
          <ArrowLeft className="h-4 w-4 mr-1.5" aria-hidden="true" />
          {t('admin.news.editor.action.back-to-list')}
        </Button>
      </div>
    );
  }

  const isExistingPublished = !!existing?.isPublished;
  const initial = useRef<NewsEditorValues>(
    existing ? valuesFromNews(existing) : emptyValues(),
  ).current;

  const [values, setValues] = useState<NewsEditorValues>(initial);
  const [activeLocale, setActiveLocale] = useState<LocaleCode>('uz');
  const [previewLocale, setPreviewLocale] = useState<LocaleCode>('uz');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  // Auto-sync preview locale to form's active when not explicitly overridden
  useEffect(() => {
    setPreviewLocale(activeLocale);
  }, [activeLocale]);

  // ---------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------
  const errors: NewsEditorErrors = useMemo(() => {
    const invalidTitles = new Set<LocaleCode>();
    const invalidBodies = new Set<LocaleCode>();
    for (const loc of LOCALE_ORDER) {
      const title = values.titles[loc].trim();
      if (title.length === 0 || title.length > TITLE_MAX) invalidTitles.add(loc);
      const len = plainTextLength(values.bodies[loc]);
      if (len < BODY_MIN_PLAIN) invalidBodies.add(loc);
    }
    const trimmedImage = values.imageUrl.trim();
    const imageUrlInvalid =
      trimmedImage.length > 0 &&
      !/^https?:\/\/\S+/i.test(trimmedImage) &&
      !/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(trimmedImage);
    const reasonRequired =
      isExistingPublished && values.reason.trim().length < REASON_MIN;
    return { invalidTitles, invalidBodies, imageUrlInvalid, reasonRequired };
  }, [values, isExistingPublished]);

  /** Drafts: at least one locale's title + body must have content. */
  const draftHasAnyLocaleFilled = useMemo(() => {
    return LOCALE_ORDER.some(
      (loc) =>
        values.titles[loc].trim().length > 0 &&
        plainTextLength(values.bodies[loc]) > 0,
    );
  }, [values]);

  /** Publish requires all-3 locales valid + image URL ok + reason if needed. */
  const canPublish = useMemo(() => {
    return (
      errors.invalidTitles.size === 0 &&
      errors.invalidBodies.size === 0 &&
      !errors.imageUrlInvalid &&
      !errors.reasonRequired
    );
  }, [errors]);

  const canSaveDraft = useMemo(() => {
    return draftHasAnyLocaleFilled && !errors.imageUrlInvalid && !errors.reasonRequired;
  }, [draftHasAnyLocaleFilled, errors]);

  // ---------------------------------------------------------------
  // Submit handlers
  // ---------------------------------------------------------------
  function commit(asPublished: boolean) {
    setSaving(!asPublished);
    setPublishing(asPublished);
    try {
      if (isNew) {
        addNews({
          titleUz: values.titles.uz.trim(),
          titleRu: values.titles.ru.trim(),
          titleEn: values.titles.en.trim(),
          bodyUz: values.bodies.uz,
          bodyRu: values.bodies.ru,
          bodyEn: values.bodies.en,
          imageUrl: values.imageUrl.trim() || null,
          isPublished: asPublished,
          publishedAt: asPublished ? values.publishedAt ?? new Date() : null,
        });
        toast.success(asPublished ? t('admin.news.toast.published') : t('admin.news.toast.draft-saved'));
      } else if (existing) {
        editNews({
          id: existing.id,
          titleUz: values.titles.uz.trim(),
          titleRu: values.titles.ru.trim(),
          titleEn: values.titles.en.trim(),
          bodyUz: values.bodies.uz,
          bodyRu: values.bodies.ru,
          bodyEn: values.bodies.en,
          imageUrl: values.imageUrl.trim() || null,
          publishedAt: asPublished
            ? existing.publishedAt ?? values.publishedAt ?? new Date()
            : existing.publishedAt,
          reason: values.reason.trim(),
        });
        toast.success(t('admin.news.toast.updated'));
      }
      navigate('/content/news');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('admin.news.toast.save-failed'));
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  }

  /**
   * Build a single-line, human-readable summary of what's missing — surfaced as
   * a toast when the user clicks Publish / Update / Save with invalid fields.
   * The red-dot indicators on locale tabs handle the per-field detail; this is
   * the orientation cue that tells them where to look.
   */
  function summarizeMissing(forPublish: boolean): string | null {
    const parts: string[] = [];
    if (forPublish && errors.invalidTitles.size > 0) {
      parts.push(
        t('admin.news.editor.validation.summary.titles').replace(
          '{locales}',
          [...errors.invalidTitles].join(' · '),
        ),
      );
    }
    if (forPublish && errors.invalidBodies.size > 0) {
      parts.push(
        t('admin.news.editor.validation.summary.bodies')
          .replace('{locales}', [...errors.invalidBodies].join(' · '))
          .replace('{min}', String(BODY_MIN_PLAIN)),
      );
    }
    if (errors.imageUrlInvalid) {
      parts.push(t('admin.news.editor.validation.summary.image-url'));
    }
    if (errors.reasonRequired) {
      parts.push(
        t('admin.news.editor.validation.summary.reason').replace(
          '{min}',
          String(REASON_MIN),
        ),
      );
    }
    if (!forPublish && !draftHasAnyLocaleFilled) {
      parts.push(t('admin.news.editor.validation.summary.draft-empty'));
    }
    if (parts.length === 0) return null;
    return parts.join(' · ');
  }

  function flagAndToast(forPublish: boolean) {
    setShowErrors(true);
    const summary = summarizeMissing(forPublish);
    if (summary) toast.error(summary);
  }

  function onSaveDraft() {
    if (!canSaveDraft) {
      flagAndToast(false);
      return;
    }
    commit(false);
  }

  function onPrimary() {
    // Edit mode on a published article → "Update" — keep currently published unless user toggled off.
    if (isExistingPublished) {
      if (!canPublish) {
        flagAndToast(true);
        return;
      }
      setConfirmOpen(true);
      return;
    }
    if (values.isPublished) {
      if (!canPublish) {
        flagAndToast(true);
        return;
      }
      setConfirmOpen(true);
    } else {
      // Save draft
      onSaveDraft();
    }
  }

  // ---------------------------------------------------------------
  // Editor-scoped hotkeys: ⌘1/2/3 cycle locales, ⌘S draft, ⌘Enter publish
  // ---------------------------------------------------------------
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const cmd = isMac ? e.metaKey : e.ctrlKey;
      if (!cmd) return;
      if (e.key === '1' || e.key === '2' || e.key === '3') {
        e.preventDefault();
        const idx = parseInt(e.key, 10) - 1;
        const loc = LOCALE_ORDER[idx];
        if (loc) setActiveLocale(loc);
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSaveDraft();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onPrimary();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, errors]);

  const visibleErrors: NewsEditorErrors = showErrors
    ? errors
    : {
        invalidTitles: new Set(),
        invalidBodies: new Set(),
        imageUrlInvalid: false,
        reasonRequired: false,
      };

  const intent: 'publish' | 'update' = isExistingPublished ? 'update' : 'publish';

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <header className="space-y-3">
        <button
          type="button"
          onClick={() => navigate('/content/news')}
          className={cn(
            'inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm',
          )}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t('admin.news.editor.back-to-list')}
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isNew
              ? t('admin.news.editor.title.new')
              : t('admin.news.editor.title.edit')}
          </h1>
          {!isNew && existing && (
            <p className="text-sm text-muted-foreground mt-1">
              {existing.lastEditedBy
                ? t('admin.news.editor.last-edited')
                    .replace('{by}', existing.lastEditedBy)
                : t('admin.news.editor.created-by').replace('{by}', existing.createdBy)}
            </p>
          )}
        </div>
      </header>

      {/* Two-column body */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <FormSections
            values={values}
            onValuesChange={setValues}
            activeLocale={activeLocale}
            onActiveLocaleChange={setActiveLocale}
            errors={visibleErrors}
            isExistingPublished={isExistingPublished}
          />
        </div>
        <aside className="hidden lg:block min-w-0">
          <div className="sticky top-4">
            <NewsPhonePreview
              imageUrl={values.imageUrl}
              titles={values.titles}
              bodies={values.bodies}
              locale={previewLocale}
              onLocaleChange={setPreviewLocale}
            />
          </div>
        </aside>
      </div>

      {/* Mobile preview sheet trigger (lg-) */}
      <MobilePreviewSheet
        imageUrl={values.imageUrl}
        titles={values.titles}
        bodies={values.bodies}
        locale={previewLocale}
        onLocaleChange={setPreviewLocale}
      />

      {/* Footer */}
      <EditorFooter
        mode={isNew ? 'new' : 'edit'}
        isPublishedSnapshot={isExistingPublished}
        formIsPublished={values.isPublished}
        saving={saving}
        publishing={publishing}
        canSubmitDraft={canSaveDraft}
        // Publish/Update primary stays clickable so the click reaches the validator,
        // which raises a toast naming what's missing. Save-draft primary keeps the
        // canSaveDraft gate (saving an empty article is meaningless).
        canSubmitPublish={
          isExistingPublished
            ? true
            : values.isPublished
              ? true
              : canSaveDraft
        }
        onBack={() => navigate('/content/news')}
        onSaveDraft={onSaveDraft}
        onPrimary={onPrimary}
      />

      <PublishConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        intent={intent}
        publishedAt={values.publishedAt ?? new Date()}
        onConfirm={() => {
          setConfirmOpen(false);
          commit(true);
        }}
      />
    </div>
  );
}

export default NewsEditor;
