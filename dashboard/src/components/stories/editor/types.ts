import type { LocaleCode } from '@/components/zhipay/LocaleFlag';
import type { CtaDeepLink, StoryType } from '@/data/mockStories';

/**
 * The editor's working form shape. Mirrors the Story interface 1:1 except
 * - locale fields collapsed into `Record<LocaleCode, string>` for tab UX
 * - `displayOrder` is `number | ''` to support the empty-state stepper input
 * - `ctaEnabled` is the explicit toggle, derived on save into nullability of
 *   `ctaLabels` + `ctaDeepLink`
 */
export interface StoryFormState {
  type: StoryType;
  mediaUrl: string;
  titles: Record<LocaleCode, string>;
  displayOrder: number | '';
  ctaEnabled: boolean;
  ctaLabels: Record<LocaleCode, string>;
  ctaDeepLink: CtaDeepLink;
  publishedAt: Date | null;
  expiresAt: Date | null;
  isPublished: boolean;
  reason: string; // edit-only; ignored on add
}

export const EMPTY_LOCALES: Record<LocaleCode, string> = { uz: '', ru: '', en: '' };

export function emptyForm(defaultDisplayOrder: number): StoryFormState {
  return {
    type: 'image',
    mediaUrl: '',
    titles: { ...EMPTY_LOCALES },
    displayOrder: defaultDisplayOrder,
    ctaEnabled: false,
    ctaLabels: { ...EMPTY_LOCALES },
    ctaDeepLink: { screen: 'home', params: {} },
    publishedAt: null,
    expiresAt: null,
    isPublished: false,
    reason: '',
  };
}

export interface StoryFormErrors {
  mediaUrl?: string;
  titles?: ReadonlySet<LocaleCode>;
  displayOrder?: string;
  ctaLabels?: ReadonlySet<LocaleCode>;
  ctaParams?: string;
  expiresAt?: string;
  reason?: string;
}

/** Build the validation result; returns an empty object when the form is valid. */
export function validateForm(form: StoryFormState, opts: { isEdit: boolean }): StoryFormErrors {
  const errors: StoryFormErrors = {};

  if (!form.mediaUrl.trim()) {
    errors.mediaUrl = 'admin.stories.editor.validation.media-required';
  } else if (!/^https?:\/\//i.test(form.mediaUrl.trim())) {
    errors.mediaUrl = 'admin.stories.editor.validation.media-invalid';
  }

  const invalidTitles = new Set<LocaleCode>();
  for (const loc of ['uz', 'ru', 'en'] as LocaleCode[]) {
    if (!form.titles[loc]?.trim()) invalidTitles.add(loc);
  }
  if (invalidTitles.size > 0) errors.titles = invalidTitles;

  if (form.ctaEnabled) {
    const invalidLabels = new Set<LocaleCode>();
    for (const loc of ['uz', 'ru', 'en'] as LocaleCode[]) {
      if (!form.ctaLabels[loc]?.trim()) invalidLabels.add(loc);
    }
    if (invalidLabels.size > 0) errors.ctaLabels = invalidLabels;
  }

  if (typeof form.displayOrder === 'number') {
    if (form.displayOrder < 0 || !Number.isInteger(form.displayOrder)) {
      errors.displayOrder = 'admin.stories.editor.validation.display-order-integer';
    }
  }

  if (
    form.expiresAt &&
    form.publishedAt &&
    form.expiresAt.getTime() <= form.publishedAt.getTime()
  ) {
    errors.expiresAt = 'admin.stories.editor.validation.expires-after-publish';
  }

  if (opts.isEdit && form.reason.trim().length < 20) {
    errors.reason = 'admin.stories.editor.validation.reason-short';
  }

  return errors;
}

export function hasErrors(e: StoryFormErrors): boolean {
  return Boolean(
    e.mediaUrl ||
      (e.titles && e.titles.size > 0) ||
      e.displayOrder ||
      (e.ctaLabels && e.ctaLabels.size > 0) ||
      e.ctaParams ||
      e.expiresAt ||
      e.reason,
  );
}
