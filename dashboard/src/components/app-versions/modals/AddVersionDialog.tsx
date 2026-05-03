import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateTimeInput } from '@/components/zhipay/DateTimeInput';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import {
  type AppVersion,
  type Platform,
  isValidSemver,
  compareSemver,
  findDuplicate,
} from '@/data/mockAppVersions';
import { LOCALE_ORDER, LOCALE_LABEL_KEY, PLATFORM_LABEL_KEY, type Locale } from '../types';
import { PlatformIcon } from '../PlatformIcon';
import { LocaleTabTextarea } from '@/components/zhipay/LocaleTabTextarea';
import { ReleaseNotesPreviewPane } from './ReleaseNotesPreviewPane';

/**
 * Add a new app version. Responsive Dialog: full-screen on `<sm`, capped at
 * 640px × 85vh from `sm+`. Header pinned at top, footer pinned at bottom,
 * body scrolls inside.
 *
 * Validation:
 *   - Semver `^\d+\.\d+\.\d+$`
 *   - No duplicate (platform + version)
 *   - `min_supported` ≤ `version` when supplied
 *   - All three release notes non-empty (per-locale inline error)
 *   - Force-update warning rendered inline below the toggle when on
 *
 * Hotkeys:
 *   - Cmd/Ctrl+1 / 2 / 3 — switch active locale tab
 *   - Cmd/Ctrl+Enter   — submit when valid (opens AlertDialog confirm)
 *
 * Submit flow: Save Version → AlertDialog 2-step confirm → onConfirm
 * (parent does the actual mutator + toast). Mutator failure surfaces a
 * toast in the parent — the modal stays open so the admin can retry.
 */

interface AddVersionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPlatform: Platform;
  onConfirm: (input: {
    platform: Platform;
    version: string;
    forceUpdate: boolean;
    minSupported: string | null;
    releaseNotesUz: string;
    releaseNotesRu: string;
    releaseNotesEn: string;
    releasedAt: Date;
  }) => Promise<void> | void;
}

interface FormState {
  platform: Platform;
  version: string;
  minSupported: string;
  forceUpdate: boolean;
  releasedAt: Date;
  notes: Record<Locale, string>;
}

const initialState = (platform: Platform): FormState => ({
  platform,
  version: '',
  minSupported: '',
  forceUpdate: false,
  releasedAt: new Date(),
  notes: { uz: '', ru: '', en: '' },
});

export function AddVersionDialog({
  open,
  onOpenChange,
  initialPlatform,
  onConfirm,
}: AddVersionDialogProps) {
  const [form, setForm] = useState<FormState>(() => initialState(initialPlatform));
  const [activeLocale, setActiveLocale] = useState<Locale>('uz');
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reset every time the dialog (re-)opens for a fresh add. Honor the
  // initialPlatform from the active page tab so the radio default matches
  // what the admin was looking at.
  useEffect(() => {
    if (open) {
      setForm(initialState(initialPlatform));
      setActiveLocale('uz');
      setTab('edit');
      setConfirmOpen(false);
      setSubmitting(false);
    }
  }, [open, initialPlatform]);

  // Validation
  const versionValid = isValidSemver(form.version.trim());
  const minSuppliedAndValid =
    form.minSupported.trim() === '' ||
    (isValidSemver(form.minSupported.trim()) &&
      versionValid &&
      compareSemver(form.minSupported.trim(), form.version.trim()) !== 1);
  const duplicate = useMemo(
    () => (versionValid ? findDuplicate(form.platform, form.version.trim()) : undefined),
    [form.platform, form.version, versionValid],
  );
  const invalidLocales = useMemo(() => {
    const set = new Set<Locale>();
    for (const loc of LOCALE_ORDER) {
      if (form.notes[loc].trim() === '') set.add(loc);
    }
    return set;
  }, [form.notes]);
  const notesValid = invalidLocales.size === 0;
  const formValid =
    versionValid && minSuppliedAndValid && !duplicate && notesValid && !submitting;

  // Cmd+1/2/3 + Cmd+Enter hotkeys, scoped to the dialog.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      if (e.key === '1' || e.key === '2' || e.key === '3') {
        const next = LOCALE_ORDER[Number(e.key) - 1];
        if (next) {
          e.preventDefault();
          setActiveLocale(next);
          setTab('edit');
        }
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (formValid) setConfirmOpen(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, formValid]);

  function setNotes(loc: Locale, next: string) {
    setForm((cur) => ({ ...cur, notes: { ...cur.notes, [loc]: next } }));
  }

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await onConfirm({
        platform: form.platform,
        version: form.version.trim(),
        forceUpdate: form.forceUpdate,
        minSupported: form.minSupported.trim() === '' ? null : form.minSupported.trim(),
        releaseNotesUz: form.notes.uz,
        releaseNotesRu: form.notes.ru,
        releaseNotesEn: form.notes.en,
        releasedAt: form.releasedAt,
      });
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          // Responsive: full-screen on mobile, capped 640 × 85vh from sm+.
          // `p-0 overflow-hidden flex flex-col` lets the body scroll inside
          // a fixed header / footer.
          'p-0 overflow-hidden flex flex-col gap-0',
          'h-screen max-h-screen w-screen max-w-full rounded-none',
          'sm:h-auto sm:max-h-[85vh] sm:max-w-[640px] sm:rounded-lg',
        )}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border shrink-0">
          <DialogTitle className="text-lg font-semibold leading-none tracking-tight">
            {t('admin.app-versions.add.title')}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            {t('admin.app-versions.add.subtitle')}
          </DialogDescription>
        </div>

        {/* Body — scrolls */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Platform radio */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">{t('admin.app-versions.add.platform')}</legend>
            <div className="grid grid-cols-2 gap-2">
              {(['ios', 'android'] as Platform[]).map((p) => {
                const isActive = form.platform === p;
                return (
                  <label
                    key={p}
                    className={cn(
                      'flex items-center gap-2 rounded-md border px-3 h-10 cursor-pointer text-sm transition-colors',
                      isActive
                        ? 'border-brand-600 bg-brand-50/60 text-brand-700 dark:bg-brand-700/15 dark:text-brand-300'
                        : 'border-input hover:bg-muted/30',
                    )}
                  >
                    <input
                      type="radio"
                      name="platform"
                      value={p}
                      checked={isActive}
                      onChange={() => setForm((cur) => ({ ...cur, platform: p }))}
                      className="sr-only"
                    />
                    <PlatformIcon platform={p} className="h-4 w-4" />
                    <span className="font-medium">{t(PLATFORM_LABEL_KEY[p])}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* Version + min_supported */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="add-version" className="text-sm font-medium">
                {t('admin.app-versions.add.version')}
              </label>
              <input
                id="add-version"
                type="text"
                inputMode="numeric"
                placeholder="1.4.3"
                value={form.version}
                onChange={(e) => setForm((cur) => ({ ...cur, version: e.target.value }))}
                className={cn(
                  'w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-mono tabular',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  form.version !== '' && !versionValid &&
                    'border-danger-600 focus-visible:ring-danger-600',
                )}
              />
              {form.version !== '' && !versionValid && (
                <p className="text-sm text-danger-700 dark:text-danger-600">
                  {t('admin.app-versions.add.validation.semver')}
                </p>
              )}
              {duplicate && (
                <p className="text-sm text-danger-700 dark:text-danger-600">
                  {t('admin.app-versions.add.validation.duplicate', {
                    platform: t(PLATFORM_LABEL_KEY[form.platform]),
                    version: form.version.trim(),
                  })}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="add-min-supported" className="text-sm font-medium">
                {t('admin.app-versions.add.min-supported')}
              </label>
              <input
                id="add-min-supported"
                type="text"
                placeholder="1.2.0"
                value={form.minSupported}
                onChange={(e) => setForm((cur) => ({ ...cur, minSupported: e.target.value }))}
                className={cn(
                  'w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-mono tabular',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  form.minSupported !== '' && !minSuppliedAndValid &&
                    'border-danger-600 focus-visible:ring-danger-600',
                )}
              />
              <p className="text-sm text-muted-foreground">
                {t('admin.app-versions.add.min-supported.hint')}
              </p>
              {form.minSupported !== '' && !minSuppliedAndValid && (
                <p className="text-sm text-danger-700 dark:text-danger-600">
                  {t('admin.app-versions.add.validation.min-supported')}
                </p>
              )}
            </div>
          </div>

          {/* Force update toggle */}
          <div className="space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.forceUpdate}
                onChange={(e) => setForm((cur) => ({ ...cur, forceUpdate: e.target.checked }))}
                className="mt-0.5 h-4 w-4 rounded border-input text-brand-600 focus:ring-2 focus:ring-ring"
              />
              <span className="text-sm">
                <span className="font-medium block">
                  {t('admin.app-versions.add.force-update')}
                </span>
                <span className="text-muted-foreground">
                  {t('admin.app-versions.add.force-update.body')}
                </span>
              </span>
            </label>
            {form.forceUpdate && (
              <div className="rounded-md border border-danger-600/30 bg-danger-50 dark:bg-danger-700/15 px-3 py-2.5 flex gap-2.5">
                <AlertTriangle
                  className="h-4 w-4 mt-0.5 shrink-0 text-danger-700 dark:text-danger-600"
                  aria-hidden="true"
                />
                <p className="text-sm text-danger-700 dark:text-danger-600 leading-snug">
                  {t('admin.app-versions.add.force-update.warning', {
                    minSupported:
                      form.minSupported.trim() !== ''
                        ? form.minSupported.trim()
                        : t('admin.app-versions.add.force-update.warning.all'),
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Released at */}
          <div className="space-y-1.5">
            <label htmlFor="add-released-at" className="text-sm font-medium">
              {t('admin.app-versions.add.released-at')}
            </label>
            <DateTimeInput
              id="add-released-at"
              value={form.releasedAt}
              onValueChange={(d) =>
                setForm((cur) => ({ ...cur, releasedAt: d ?? new Date() }))
              }
              ariaLabel={t('admin.app-versions.add.released-at')}
            />
          </div>

          {/* Release notes — Edit / Preview tabs */}
          <div className="space-y-3">
            <div className="text-sm font-medium">
              {t('admin.app-versions.add.release-notes.title')}
            </div>
            <Tabs value={tab} onValueChange={(v) => setTab(v as 'edit' | 'preview')}>
              <TabsList>
                <TabsTrigger value="edit">
                  {t('admin.app-versions.add.tab.edit')}
                </TabsTrigger>
                <TabsTrigger value="preview">
                  {t('admin.app-versions.add.tab.preview')}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="mt-3">
                <LocaleTabTextarea
                  values={form.notes}
                  onChange={setNotes}
                  active={activeLocale}
                  onActiveChange={setActiveLocale}
                  invalidLocales={invalidLocales}
                  idPrefix="add-notes"
                  ariaLabelKey="admin.app-versions.editor.locale-strip"
                  localeLabelKey={LOCALE_LABEL_KEY}
                  placeholderKeyPrefix="admin.app-versions.editor.placeholder"
                  requiredErrorKey="admin.app-versions.editor.locale-required"
                  hintKey="admin.app-versions.editor.markdown-hint"
                  charCountKey="admin.app-versions.editor.char-count"
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-3">
                <ReleaseNotesPreviewPane
                  platform={form.platform}
                  version={form.version.trim()}
                  values={form.notes}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/20 shrink-0 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            {t('common.actions.cancel')}
          </Button>
          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={!formValid}
          >
            <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {t('admin.app-versions.add.cta')}
          </Button>
        </div>
      </DialogContent>

      {/* AlertDialog 2-step confirm */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('admin.app-versions.action.confirm-publish.title', {
                platform: t(PLATFORM_LABEL_KEY[form.platform]),
                version: form.version.trim(),
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {form.forceUpdate
                ? t('admin.app-versions.action.confirm-publish.body-force')
                : t('admin.app-versions.action.confirm-publish.body')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>
              {t('common.actions.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
              disabled={submitting}
            >
              {submitting
                ? t('admin.app-versions.action.publishing')
                : t('admin.app-versions.action.confirm-publish.cta')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}

/** Helper for the page to satisfy `onConfirm` typing. */
export type AddVersionInput = Parameters<AddVersionDialogProps['onConfirm']>[0];

/** Re-export so the page-level handler signature stays one-shot to import. */
export type { AppVersion };
