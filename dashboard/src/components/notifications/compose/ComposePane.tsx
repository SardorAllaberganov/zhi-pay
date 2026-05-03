import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { t } from '@/lib/i18n';
import type { LocaleCode } from '@/components/zhipay/LocaleFlag';
import { getUserById } from '@/data/mockUsers';
import { useDraftPreservation } from '@/hooks/useDraftPreservation';
import {
  type CreateNotificationInput,
  createNotification,
} from '@/data/mockNotifications';
import {
  type ComposeForm,
  type ComposeErrors,
  emptyComposeForm,
  noErrors,
  hasAnyError,
  TITLE_MAX,
  BODY_MAX,
} from '../types';
import { broadcastAudienceCount, estimateAudience } from '../audienceEstimate';
import { AudienceSection } from './AudienceSection';
import { TypePicker } from './TypePicker';
import { ContentSection } from './ContentSection';
import { DeepLinkSection } from './DeepLinkSection';
import { ScheduleSection } from './ScheduleSection';
import { PreviewPane } from './PreviewPane';
import { MobilePreviewSheet } from './MobilePreviewSheet';
import { ComposeActionBar } from './ComposeActionBar';
import { SendConfirmDialog } from './SendConfirmDialog';

interface ComposePaneProps {
  /**
   * Called after a successful create — parent typically navigates to
   * the Sent tab + bumps a refresh version so the new row shows up.
   */
  onCreated: (newId: string) => void;
  /** Cancel = reset form to defaults. */
  onCancel: () => void;
  /** Active admin locale — drives initial preview locale + active locale tab. */
  adminLocale: LocaleCode;
}

/**
 * Composer orchestrator — owns the form state, derives errors/recipient
 * count, renders the 6 sections + sticky preview + action bar + confirm
 * dialog. Keyboard chords (Cmd+1/2/3 locale tab + Cmd+Enter submit) are
 * registered here so they only fire while the compose pane is mounted.
 */
export function ComposePane({ onCreated, onCancel, adminLocale }: ComposePaneProps) {
  const [form, setForm] = useState<ComposeForm>(() => {
    const f = emptyComposeForm();
    return f;
  });
  const [showErrors, setShowErrors] = useState(false);
  const [activeLocale, setActiveLocale] = useState<LocaleCode>(adminLocale);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paramsParseError, setParamsParseError] = useState<string | null>(null);

  // Draft preservation — auto-save the compose form to localStorage so
  // a maintenance flip mid-typing doesn't lose work, and a refresh
  // restores the in-progress draft. Custom (de)serializer rehydrates
  // the `scheduledFor: Date` field per LESSON 2026-05-03 (storage
  // round-trips lose Date semantics that the type system can't see).
  const serializeDraft = useCallback((f: ComposeForm): string => {
    return JSON.stringify({
      ...f,
      scheduledFor: f.scheduledFor ? f.scheduledFor.toISOString() : null,
    });
  }, []);
  const deserializeDraft = useCallback((raw: string): ComposeForm | null => {
    try {
      const parsed = JSON.parse(raw) as ComposeForm & { scheduledFor: string | null };
      if (parsed.scheduledFor && typeof parsed.scheduledFor === 'string') {
        return { ...parsed, scheduledFor: new Date(parsed.scheduledFor) };
      }
      return { ...parsed, scheduledFor: null };
    } catch {
      return null;
    }
  }, []);
  const { clearDraft } = useDraftPreservation<ComposeForm>({
    key: 'zhipay-admin-notifications-compose-draft',
    value: form,
    setValue: setForm,
    serialize: serializeDraft,
    deserialize: deserializeDraft,
  });

  // Recipient count snapshot — recomputed when audience changes
  const recipientCount = useMemo(() => {
    if (form.audienceType === 'broadcast') return broadcastAudienceCount();
    if (form.audienceType === 'segment') return estimateAudience(form.segmentCriteria);
    return form.singleUserId ? 1 : 0;
  }, [form.audienceType, form.segmentCriteria, form.singleUserId]);

  // Errors
  const errors: ComposeErrors = useMemo(() => {
    const invalidTitles = new Set<LocaleCode>();
    if (form.titleUz.trim().length === 0 || form.titleUz.length > TITLE_MAX) invalidTitles.add('uz');
    if (form.titleRu.trim().length === 0 || form.titleRu.length > TITLE_MAX) invalidTitles.add('ru');
    if (form.titleEn.trim().length === 0 || form.titleEn.length > TITLE_MAX) invalidTitles.add('en');

    const invalidBodies = new Set<LocaleCode>();
    if (form.bodyUz.trim().length === 0 || form.bodyUz.length > BODY_MAX) invalidBodies.add('uz');
    if (form.bodyRu.trim().length === 0 || form.bodyRu.length > BODY_MAX) invalidBodies.add('ru');
    if (form.bodyEn.trim().length === 0 || form.bodyEn.length > BODY_MAX) invalidBodies.add('en');

    const missingSingleUser =
      form.audienceType === 'single' && form.singleUserId.trim().length === 0;
    const emptyAudience = form.audienceType === 'segment' && recipientCount === 0;
    const invalidSchedule =
      form.schedule === 'later' &&
      (!form.scheduledFor || form.scheduledFor.getTime() <= Date.now());
    const invalidDeepLink = form.deepLink.enabled && paramsParseError !== null;

    return {
      invalidTitles,
      invalidBodies,
      missingSingleUser,
      emptyAudience,
      invalidSchedule,
      invalidDeepLink,
    };
  }, [form, recipientCount, paramsParseError]);

  // Keyboard chords scoped to compose pane
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      const inField =
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        (e.target as HTMLElement | null)?.isContentEditable;

      if (e.metaKey || e.ctrlKey) {
        if (e.key === '1') {
          e.preventDefault();
          setActiveLocale('uz');
        } else if (e.key === '2') {
          e.preventDefault();
          setActiveLocale('ru');
        } else if (e.key === '3') {
          e.preventDefault();
          setActiveLocale('en');
        } else if (e.key === 'Enter' && !inField) {
          e.preventDefault();
          handlePrimary();
        } else if (e.key === 'Enter' && inField) {
          // In a field — still attempt submit (matches NewsEditor pattern)
          e.preventDefault();
          handlePrimary();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, recipientCount, paramsParseError]);

  const updateForm = (patch: Partial<ComposeForm>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  function summarizeMissing(): string | null {
    const parts: string[] = [];
    if (errors.invalidTitles.size > 0) {
      parts.push(
        t('admin.notifications.validation.summary.titles').replace(
          '{locales}',
          [...errors.invalidTitles].join(' · '),
        ),
      );
    }
    if (errors.invalidBodies.size > 0) {
      parts.push(
        t('admin.notifications.validation.summary.bodies').replace(
          '{locales}',
          [...errors.invalidBodies].join(' · '),
        ),
      );
    }
    if (errors.missingSingleUser) {
      parts.push(t('admin.notifications.validation.user-required'));
    }
    if (errors.emptyAudience) {
      parts.push(t('admin.notifications.validation.audience-empty'));
    }
    if (errors.invalidSchedule) {
      parts.push(t('admin.notifications.validation.schedule-required'));
    }
    if (errors.invalidDeepLink) {
      parts.push(t('admin.notifications.validation.deep-link-invalid'));
    }
    return parts.length === 0 ? null : parts.join(' · ');
  }

  function handlePrimary() {
    if (submitting) return;
    if (hasAnyError(errors)) {
      setShowErrors(true);
      const missing = summarizeMissing();
      if (missing) toast.error(missing);
      return;
    }
    setConfirmOpen(true);
  }

  function handleConfirm() {
    setSubmitting(true);
    try {
      const input: CreateNotificationInput = {
        type: form.type,
        audienceType: form.audienceType,
        audienceCriteria:
          form.audienceType === 'segment'
            ? {
                tiers: form.segmentCriteria.tiers,
                languages: form.segmentCriteria.languages,
                hasLinkedCard: form.segmentCriteria.hasLinkedCard,
                hasCompletedTransfer: form.segmentCriteria.hasCompletedTransfer,
                lastLogin: form.segmentCriteria.lastLogin,
              }
            : null,
        userId: form.audienceType === 'single' ? form.singleUserId : null,
        titleUz: form.titleUz.trim(),
        titleRu: form.titleRu.trim(),
        titleEn: form.titleEn.trim(),
        bodyUz: form.bodyUz.trim(),
        bodyRu: form.bodyRu.trim(),
        bodyEn: form.bodyEn.trim(),
        deepLink: form.deepLink.enabled
          ? { screen: form.deepLink.screen, params: form.deepLink.params }
          : null,
        scheduledFor: form.schedule === 'later' ? form.scheduledFor : null,
        recipientCount,
      };
      const created = createNotification(input);
      const successKey =
        form.schedule === 'later'
          ? 'admin.notifications.compose.toast.scheduled'
          : 'admin.notifications.compose.toast.sent';
      toast.success(t(successKey));
      // Draft submitted successfully — wipe the saved draft so the
      // next mount starts fresh.
      clearDraft();
      setConfirmOpen(false);
      onCreated(created.id);
    } finally {
      setSubmitting(false);
    }
  }

  const singleUserName = form.singleUserId
    ? getUserById(form.singleUserId)?.name ?? null
    : null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 pb-28">
      {/* Form column (left, 3/5 on lg+) */}
      <div className="space-y-6 lg:col-span-3">
        {/* Mobile preview button */}
        <div className="flex items-center justify-end lg:hidden">
          <MobilePreviewSheet form={form} initialLocale={activeLocale} />
        </div>

        <AudienceSection form={form} onChange={updateForm} showErrors={showErrors} />
        <Separator />

        <TypePicker value={form.type} onChange={(type) => updateForm({ type })} />
        <Separator />

        <ContentSection
          form={form}
          activeLocale={activeLocale}
          onActiveLocaleChange={setActiveLocale}
          onChange={updateForm}
          invalidTitleLocales={showErrors ? errors.invalidTitles : new Set()}
          invalidBodyLocales={showErrors ? errors.invalidBodies : new Set()}
        />
        <Separator />

        <DeepLinkSection
          value={form.deepLink}
          onChange={(patch) =>
            updateForm({ deepLink: { ...form.deepLink, ...patch } })
          }
          onParamsErrorChange={setParamsParseError}
        />
        <Separator />

        <ScheduleSection
          mode={form.schedule}
          scheduledFor={form.scheduledFor}
          onModeChange={(mode) =>
            updateForm({ schedule: mode, scheduledFor: mode === 'now' ? null : form.scheduledFor })
          }
          onScheduledForChange={(d) => updateForm({ scheduledFor: d })}
          scheduleError={showErrors && errors.invalidSchedule}
        />
      </div>

      {/* Preview column (right, 2/5 on lg+) — hidden on <lg, opens via sheet */}
      <div className="hidden lg:block lg:col-span-2">
        <PreviewPane form={form} initialLocale={activeLocale} />
      </div>

      {/* Sticky bottom action bar */}
      <ComposeActionBar
        form={form}
        recipientCount={recipientCount}
        onSubmit={handlePrimary}
        onCancel={onCancel}
        submitting={submitting}
      />

      {/* Send confirmation dialog */}
      <SendConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        form={form}
        recipientCount={recipientCount}
        singleUserName={singleUserName}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
