import type { StoryStatus, StoryType } from '@/data/mockStories';

export type StorySortKey = 'display_order' | 'created' | 'expiring';

export interface StorySort {
  key: StorySortKey;
  /** Direction is implied per key (display_order ASC, created DESC, expiring ASC). */
  dir: 'asc' | 'desc';
}

export const DEFAULT_SORT: StorySort = { key: 'display_order', dir: 'asc' };

export const STORY_SORT_LABEL_KEY: Record<StorySortKey, string> = {
  display_order: 'admin.stories.sort.display-order',
  created: 'admin.stories.sort.created',
  expiring: 'admin.stories.sort.expiring',
};

export const STORY_STATUS_ORDER: StoryStatus[] = [
  'published',
  'scheduled',
  'draft',
  'expired',
];

export const STORY_STATUS_LABEL_KEY: Record<StoryStatus, string> = {
  published: 'admin.stories.status.published',
  scheduled: 'admin.stories.status.scheduled',
  draft: 'admin.stories.status.draft',
  expired: 'admin.stories.status.expired',
};

export const STORY_TYPE_ORDER: StoryType[] = ['image', 'video'];

export const STORY_TYPE_LABEL_KEY: Record<StoryType, string> = {
  image: 'admin.stories.type.image',
  video: 'admin.stories.type.video',
};

export interface StoryFilters {
  /** Selected status values; empty = no filter (show all). */
  statuses: StoryStatus[];
  /** Selected types; empty = no filter. */
  types: StoryType[];
  /** When true, only show stories with `expiresAt !== null`. */
  hasExpiration: boolean;
}

export const EMPTY_FILTERS: StoryFilters = {
  statuses: [],
  types: [],
  hasExpiration: false,
};

export function countActiveFilters(f: StoryFilters): number {
  let n = 0;
  if (f.statuses.length > 0) n += 1;
  if (f.types.length > 0) n += 1;
  if (f.hasExpiration) n += 1;
  return n;
}
