import type { LocaleCode } from '@/components/zhipay/LocaleFlag';

export interface NewsEditorValues {
  imageUrl: string;
  titles: Record<LocaleCode, string>;
  bodies: Record<LocaleCode, string>;
  isPublished: boolean;
  /** ISO/local datetime string OR null when not yet set. */
  publishedAt: Date | null;
  reason: string;
}

export const TITLE_MAX = 120;
export const TITLE_WARN = 100;
export const BODY_MIN_PLAIN = 50;
export const REASON_MIN = 20;

export interface NewsEditorErrors {
  /** Locales whose title is missing or > MAX. */
  invalidTitles: ReadonlySet<LocaleCode>;
  /** Locales whose body is missing or below the plain-text minimum. */
  invalidBodies: ReadonlySet<LocaleCode>;
  imageUrlInvalid: boolean;
  reasonRequired: boolean;
}
