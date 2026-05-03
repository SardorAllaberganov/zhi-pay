import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateTimeInput } from '@/components/zhipay/DateTimeInput';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import {
  type AppVersion,
  isValidSemver,
  compareSemver,
} from '@/data/mockAppVersions';
import { LOCALE_ORDER, PLATFORM_LABEL_KEY, type Locale } from '../types';
import { PlatformIcon } from '../PlatformIcon';
import { ForceUpdatePill } from '../ForceUpdatePill';
import { ReleaseNotesEditor } from './ReleaseNotesEditor';
import { ReleaseNotesPreviewPane } from './ReleaseNotesPreviewPane';

/**
 * Edit an existing version. Same shape as the Add dialog with two
 * differences:
 *   - Platform + version are LOCKED (identifying fields, can't change)
 *   - Bottom adds a ≥20-char reason note (matches Users / Cards / Services
 *     convention)
 *
 * Reason note is required by the mutator + enforced here so the disabled
 * Save button surfaces the constraint immediately. Edits don't go through
 * an AlertDialog 2nd-step confirm — the reason note IS the friction.
 */

interface EditVersionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  version: AppVersion | null;
  onConfirm: (input: {
    id: string;
    forceUpdate: boolean;
    minSupported: string | null;
    releaseNotesUz: string;
    releaseNotesRu: string;
    releaseNotesEn: string;
    releasedAt: Date;
    reason: string;
  }) => Promise<void> | void;
}

interface FormState {
  forceUpdate: boolean;
  minSupported: string;
  releasedAt: Date;
  notes: Record<Locale, string>;
  reason: string;
}

const REASON_MIN = 20;

const initialState = (v: AppVersion): FormState => ({
  forceUpdate: v.forceUpdate,
  minSupported: v.minSupported ?? '',
  releasedAt: v.releasedAt,
  notes: {
    uz: v.releaseNotesUz,
    ru: v.releaseNotesRu,
    en: v.releaseNotesEn,
  },
  reason: '',
});

export function EditVersionDialog({
  open,
  onOpenChange,
  version,
  onConfirm,
}: EditVersionDialogProps) {
  const [form, setForm] = useState<FormState | null>(version ? initialState(version) : null);
  const [activeLocale, setActiveLocale] = useState<Locale>('uz');
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [submitting, setSubmitting] = useState(false);

  // Sync local state every time the dialog reopens with a (possibly
  // different) version.
  useEffect(() => {
    if (open && version) {
      setForm(initialState(version));
      setActiveLocale('uz');
      setTab('edit');
      setSubmitting(false);
    }
  }, [open, version]);

  // Validation
  const minSuppliedAndValid = useMemo(() => {
    if (!form || !version) return true;
    const ms = form.minSupported.trim();
    if (ms === '') return true;
    if (!isValidSemver(ms)) return false;
    return compareSemver(ms, version.version) !== 1;
  }, [form, version]);
  const invalidLocales = useMemo(() => {
    const set = new Set<Locale>();
    if (!form) return set;
    for (const loc of LOCALE_ORDER) {
      if (form.notes[loc].trim() === '') set.add(loc);
    }
    return set;
  }, [form]);
  const reasonValid = (form?.reason.trim().length ?? 0) >= REASON_MIN;
  const formValid =
    !!form && !!version && minSuppliedAndValid && invalidLocales.size === 0 && reasonValid && !submitting;

  // Cmd+1/2/3 + Cmd+Enter hotkeys.
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
        if (formValid) handleConfirm();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, formValid]);

  function setNotes(loc: Locale, next: string) {
    setForm((cur) => (cur ? { ...cur, notes: { ...cur.notes, [loc]: next } } : cur));
  }

  async function handleConfirm() {
    if (!form || !version || !formValid) return;
    setSubmitting(true);
    try {
      await onConfirm({
        id: version.id,
        forceUpdate: form.forceUpdate,
        minSupported: form.minSupported.trim() === '' ? null : form.minSupported.trim(),
        releaseNotesUz: form.notes.uz,
        releaseNotesRu: form.notes.ru,
        releaseNotesEn: form.notes.en,
        releasedAt: form.releasedAt,
        reason: form.reason.trim(),
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (!version || !form) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md p-6">
          <DialogTitle className="text-lg font-semibold">
            {t('admin.app-versions.edit.no-version.title')}
          </DialogTitle>
          <DialogDescription>{t('admin.app-versions.edit.no-version.body')}</DialogDescription>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'p-0 overflow-hidden flex flex-col gap-0',
          'h-screen max-h-screen w-screen max-w-full rounded-none',
          'sm:h-auto sm:max-h-[85vh] sm:max-w-[640px] sm:rounded-lg',
        )}
      >
        {/* Header — locked identifiers */}
        <div className="px-6 py-4 border-b border-border shrink-0">
          <DialogTitle className="text-lg font-semibold leading-none tracking-tight">
            {t('admin.app-versions.edit.title')}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
              <PlatformIcon platform={version.platform} className="h-4 w-4" tone="muted" />
              <span>{t(PLATFORM_LABEL_KEY[version.platform])}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-foreground">v{version.version}</span>
              {version.forceUpdate && <ForceUpdatePill />}
            </div>
          </DialogDescription>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <p className="text-sm text-muted-foreground">
            {t('admin.app-versions.edit.subtitle')}
          </p>

          {/* min_supported */}
          <div className="space-y-1.5">
            <label htmlFor="edit-min-supported" className="text-sm font-medium">
              {t('admin.app-versions.add.min-supported')}
            </label>
            <input
              id="edit-min-supported"
              type="text"
              placeholder="1.2.0"
              value={form.minSupported}
              onChange={(e) => setForm((cur) => (cur ? { ...cur, minSupported: e.target.value } : cur))}
              className={cn(
                'w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-mono tabular',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                form.minSupported !== '' && !minSuppliedAndValid &&
                  'border-danger-600 focus-visible:ring-danger-600',
              )}
            />
            {form.minSupported !== '' && !minSuppliedAndValid && (
              <p className="text-sm text-danger-700 dark:text-danger-600">
                {t('admin.app-versions.add.validation.min-supported')}
              </p>
            )}
          </div>

          {/* Force update toggle */}
          <div className="space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.forceUpdate}
                onChange={(e) => setForm((cur) => (cur ? { ...cur, forceUpdate: e.target.checked } : cur))}
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
            <label htmlFor="edit-released-at" className="text-sm font-medium">
              {t('admin.app-versions.add.released-at')}
            </label>
            <DateTimeInput
              id="edit-released-at"
              value={form.releasedAt}
              onValueChange={(d) =>
                setForm((cur) => (cur ? { ...cur, releasedAt: d ?? new Date() } : cur))
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
                <TabsTrigger value="edit">{t('admin.app-versions.add.tab.edit')}</TabsTrigger>
                <TabsTrigger value="preview">{t('admin.app-versions.add.tab.preview')}</TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="mt-3">
                <ReleaseNotesEditor
                  values={form.notes}
                  onChange={setNotes}
                  active={activeLocale}
                  onActiveChange={setActiveLocale}
                  invalidLocales={invalidLocales}
                  idPrefix="edit-notes"
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-3">
                <ReleaseNotesPreviewPane
                  platform={version.platform}
                  version={version.version}
                  values={form.notes}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Reason note — required, ≥ 20 chars */}
          <div className="space-y-1.5">
            <label htmlFor="edit-reason" className="text-sm font-medium">
              {t('admin.app-versions.edit.reason-label')}
            </label>
            <textarea
              id="edit-reason"
              rows={3}
              value={form.reason}
              onChange={(e) => setForm((cur) => (cur ? { ...cur, reason: e.target.value } : cur))}
              placeholder={t('admin.app-versions.edit.reason-placeholder', { min: REASON_MIN })}
              className={cn(
                'w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'placeholder:text-muted-foreground/70',
              )}
            />
            <p
              className={cn(
                'text-sm tabular',
                reasonValid ? 'text-muted-foreground' : 'text-warning-700 dark:text-warning-600',
              )}
            >
              {t('admin.app-versions.edit.reason-counter', {
                count: form.reason.trim().length,
                min: REASON_MIN,
              })}
            </p>
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
          <Button onClick={handleConfirm} disabled={!formValid}>
            <Save className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {submitting
              ? t('admin.app-versions.edit.saving')
              : t('admin.app-versions.edit.cta')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
