import type { Platform } from '@/data/mockAppVersions';

/** Sort key — only `released_at` is sortable per spec. */
export type AppVersionSortDir = 'asc' | 'desc';

export interface AppVersionSort {
  /** Always 'released_at' for now — kept as object for parity with other surfaces. */
  key: 'released_at';
  dir: AppVersionSortDir;
}

export const DEFAULT_SORT: AppVersionSort = { key: 'released_at', dir: 'desc' };

export const PLATFORM_ORDER: Platform[] = ['ios', 'android'];

export const PLATFORM_LABEL_KEY: Record<Platform, string> = {
  ios: 'admin.app-versions.tab.ios',
  android: 'admin.app-versions.tab.android',
};

/** Single source of truth for the locale order in release-notes editor + preview. */
export type Locale = 'uz' | 'ru' | 'en';
export const LOCALE_ORDER: Locale[] = ['uz', 'ru', 'en'];
export const LOCALE_LABEL_KEY: Record<Locale, string> = {
  uz: 'admin.app-versions.locale.uz',
  ru: 'admin.app-versions.locale.ru',
  en: 'admin.app-versions.locale.en',
};
