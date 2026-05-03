/**
 * Mobile-app deep-link screen taxonomy.
 *
 * Locked vocabulary for both `stories.cta_deep_link.screen` and (later)
 * `notifications.deep_link.screen`. Adding a screen requires a backend
 * + mobile-app contract change — this constant is the single source of
 * truth for what the admin dashboard can offer in deep-link builders.
 *
 * Cross-references:
 *   - models.md §8 STORIES `cta_deep_link "{screen, params}"`
 *   - models.md §6 NOTIFICATIONS `deep_link "{screen, params}"` (when wired)
 */

export type DeepLinkScreen =
  | 'home'
  | 'send_money'
  | 'history'
  | 'profile'
  | 'kyc'
  | 'transfer_detail'
  | 'news'
  | 'story'
  | 'card_detail'
  | 'settings';

export const DEEP_LINK_SCREEN_ORDER: DeepLinkScreen[] = [
  'home',
  'send_money',
  'history',
  'profile',
  'kyc',
  'transfer_detail',
  'card_detail',
  'news',
  'story',
  'settings',
];

export const DEEP_LINK_SCREEN_LABEL_KEY: Record<DeepLinkScreen, string> = {
  home: 'admin.deep-link.screen.home',
  send_money: 'admin.deep-link.screen.send-money',
  history: 'admin.deep-link.screen.history',
  profile: 'admin.deep-link.screen.profile',
  kyc: 'admin.deep-link.screen.kyc',
  transfer_detail: 'admin.deep-link.screen.transfer-detail',
  news: 'admin.deep-link.screen.news',
  story: 'admin.deep-link.screen.story',
  card_detail: 'admin.deep-link.screen.card-detail',
  settings: 'admin.deep-link.screen.settings',
};

/**
 * Hint keys per screen — surfaced under the params editor to suggest
 * which keys belong on each screen's params object. Authoring guidance
 * only, not enforced.
 */
export const DEEP_LINK_PARAMS_HINT_KEY: Record<DeepLinkScreen, string> = {
  home: 'admin.deep-link.params-hint.home',
  send_money: 'admin.deep-link.params-hint.send-money',
  history: 'admin.deep-link.params-hint.history',
  profile: 'admin.deep-link.params-hint.profile',
  kyc: 'admin.deep-link.params-hint.kyc',
  transfer_detail: 'admin.deep-link.params-hint.transfer-detail',
  news: 'admin.deep-link.params-hint.news',
  story: 'admin.deep-link.params-hint.story',
  card_detail: 'admin.deep-link.params-hint.card-detail',
  settings: 'admin.deep-link.params-hint.settings',
};

/**
 * Required param keys per screen — soft-validated in the composer (a missing
 * required key surfaces a non-blocking warning). Empty array = no required keys.
 */
export const DEEP_LINK_REQUIRED_PARAMS: Record<DeepLinkScreen, readonly string[]> = {
  home: [],
  send_money: [],
  history: [],
  profile: [],
  kyc: [],
  transfer_detail: ['transfer_id'],
  news: [],
  story: [],
  card_detail: ['card_id'],
  settings: [],
};

/**
 * Build a preview deep-link string of the form `zhipay://<screen>?<params>`.
 * Pure presentation — the real client maps the same `(screen, params)` pair
 * onto its native navigator.
 */
export function previewDeepLink(
  screen: DeepLinkScreen,
  params: Record<string, unknown>,
): string {
  const screenSegment = screen.replace(/_/g, '-');
  const queryEntries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  );
  if (queryEntries.length === 0) {
    return `zhipay://${screenSegment}`;
  }
  const query = queryEntries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return `zhipay://${screenSegment}?${query}`;
}
