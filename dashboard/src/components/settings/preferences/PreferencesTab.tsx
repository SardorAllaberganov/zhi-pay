import { DisplayPrefsCard } from './DisplayPrefsCard';
import { LocalePrefsCard } from './LocalePrefsCard';
import { NotificationPrefsCard } from './NotificationPrefsCard';

/**
 * Preferences tab — three cards: Display (live-apply), Locale (live-
 * apply, dates / times persisted but full rollout deferred), Notifications
 * (live-apply toggles document delivery intent).
 *
 * Spec mentioned a Save button at the bottom — we deviate to live-apply
 * for every preference. Cosmetic prefs are obvious + reversible (toggle
 * back); notification subscriptions persist on toggle and the user can
 * undo by toggling back. No save button means no save-state confusion.
 * Documented in HISTORY.md.
 */
export function PreferencesTab() {
  return (
    <div className="space-y-6">
      <DisplayPrefsCard />
      <LocalePrefsCard />
      <NotificationPrefsCard />
    </div>
  );
}
