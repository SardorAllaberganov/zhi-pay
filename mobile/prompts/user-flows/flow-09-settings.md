# User Flow — Settings & support (profile, preferences, language, security, help)

> Plans the screen sequence for the user's account-management surface:
> profile, language preference, notification preferences, security (PIN /
> biometrics), legal docs, and support / help. Two surface prompts feed
> off this flow plan: [`../surfaces/11-settings-screens.md`](../surfaces/11-settings-screens.md)
> for the main settings tree, and
> [`../surfaces/12-help-support-screens.md`](../surfaces/12-help-support-screens.md)
> for the help / support sub-tree.
>
> Canonical sources of truth:
> - [`.claude/rules/localization.md`](../../../.claude/rules/localization.md)
> - [`.claude/rules/accessibility.md`](../../../.claude/rules/accessibility.md)
> - [`.claude/rules/kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md)
> - [`docs/models.md`](../../../docs/models.md) — `users`,
>   `kyc_verifications`, `audit_log`

## Goal

Single home for everything-not-in-the-marquee-flow: viewing the user's
profile + tier, managing language preference, toggling biometric / PIN
unlock, opting into / out of marketing notifications, viewing legal
documents, contacting support, signing out, and (rarely) initiating
account deletion.

## Out of scope (covered by other flows)

- Card management ([`flow-07-card-management.md`](./flow-07-card-management.md))
- Notification preferences are LISTED in settings but the inbox lives
  at [`flow-08-notifications.md`](./flow-08-notifications.md)
- MyID re-verification ([`flow-02-myid.md`](./flow-02-myid.md))
- Tier upgrade journey ([`flow-06-tier-upgrade.md`](./flow-06-tier-upgrade.md))

## Prerequisites

- User is signed in (any tier)
- Network connectivity for state changes; preference reads work offline
  from cached state

## State machine

Settings doesn't have a state machine of its own. Settings actions feed
into the user / KYC / card state machines as appropriate. The most
mutating actions on this surface are:
- **Sign out** → ends session (no schema state change beyond auth audit)
- **Account deletion** → starts a deletion request that admins review
  (separate ticket — not a self-service hard delete in v1)

## Screen sequence

1. **Settings home (root)**
   - Reached from:
     - Tab bar "More" (4th or 5th tab depending on layout)
     - Avatar tap from any screen with the avatar in the app bar
   - Top app bar: "Settings" heading
   - Profile card (top): foundation Card primitive
     - Avatar (initials), centered or left-aligned
     - Display name (display-2 weight)
     - Phone number masked (`+998 90 ••• •• 23`)
     - Tier badge (foundation TierBadge primitive — `tier_0` / `tier_1` /
       `tier_2`)
     - "Edit profile" tap-target → step 2
   - Settings tree (foundation ListRow primitive, grouped sections):
     - **Account** group:
       - Profile → step 2
       - Verification (KYC) → step 3
       - Cards → routes to card-management
         ([`flow-07-card-management.md`](./flow-07-card-management.md))
     - **Preferences** group:
       - Language → step 4 language picker
       - Notifications → step 5
       - Appearance (light / dark / system) → step 6
     - **Security** group:
       - PIN code → step 7
       - Biometric unlock (Touch ID / Face ID / fingerprint) → step 7
       - Sign-in history → step 8
     - **About & legal** group:
       - About ZhiPay (version, legal name, contact) → step 9
       - Privacy Policy → step 9 (in-app sheet)
       - Terms of Service → step 9 (in-app sheet)
     - **Support** group:
       - Help center → step 10
       - Contact support → step 11
       - Report an issue → step 11
     - **Sign out** → step 12 (danger-tinted row, separate from groups)
2. **Profile (edit)**
   - Top app bar: back arrow + "Profile" heading
   - Avatar (initials, large, top-center) — tap shows "Pick photo" sheet
     (out of scope for v1 mock; placeholder)
   - Display name field (editable)
   - Phone number field (read-only — phone is the immutable identity;
     "To change your phone number, contact support")
   - Email field (optional — added for receipt delivery / support)
   - Save sticky-bottom CTA (with offline-aware WriteButton pattern)
3. **Verification (KYC)**
   - Top app bar: back arrow + "Verification" heading
   - Tier card hero — large foundation TierBadge + body copy explaining
     what's unlocked at this tier (per
     [`.claude/rules/kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md))
   - Limits card: per-tx + daily + monthly limits in foundation Money
     primitive format, locale-aware
   - Phone-verification status row: ✓ Verified (always true at `tier_1+`)
   - MyID-verification status row:
     - tier_0/1: "Not verified" with primary "Verify with MyID" CTA →
       routes to MyID flow
     - tier_2 active: "Verified · expires DD.MM.YYYY" with secondary
       "Re-verify now" link
     - tier_2 expired (soft-demoted): "Expired DD.MM.YYYY" with
       primary "Re-verify with MyID" CTA
4. **Language picker**
   - Top app bar: back arrow + "Language" heading
   - 3 selectable rows (radio-left ListRow):
     - `O'zbek` (Latin script — never `kk`, `kaa` not in v1)
     - `Русский`
     - `English`
   - On selection: writes `users.preferred_language`, surface re-renders
     immediately in new locale + toast confirmation in NEW locale
   - Note: device locale is NOT used (per
     [`.claude/rules/localization.md`](../../../.claude/rules/localization.md))
5. **Notification preferences**
   - Top app bar: back arrow + "Notifications" heading
   - Per-type toggle list (foundation Switch primitive on each row):
     - Transfer status updates (always on, disabled with tooltip "We
       always send transfer status — these are essential")
     - Security alerts (always on, same disabled pattern)
     - Compliance / verification reminders (always on)
     - Card-related events (default on, can opt out)
     - System / app updates (default on, can opt out)
     - Marketing & offers (default OFF — opt-in)
   - "OS notification permission" status row (read-only): "Granted /
     Denied / Not yet asked" + "Open OS settings" CTA when denied
6. **Appearance**
   - Top app bar: back arrow + "Appearance" heading
   - 3 radio rows: System (default) | Light | Dark
   - On selection: writes preference (local + server) + applies
     immediately, no re-mount
7. **Security (PIN / biometrics)**
   - Top app bar: back arrow + "Security" heading
   - PIN code section:
     - "Set up PIN" CTA → step 7a (set PIN)
     - Once set: "Change PIN" link + "Remove PIN" link (danger-tone)
   - Biometric unlock section (only if device supports it):
     - Switch row: "Unlock with [Face ID / Touch ID / Fingerprint]"
     - Sub-line: "Required when opening the app, sending money, or
       changing security settings"
     - Disabled when PIN not set (with tooltip "PIN required first")
   - Auto-lock setting: "After 5 minutes" / "Immediately" / "Never"
     (default: After 5 minutes)
   - Step 7a — Set PIN sub-flow:
     - 4-box numeric input (foundation OTPInput primitive — same as
       admin's; reused here)
     - "Choose a 4-digit PIN" → "Confirm your PIN" → success tick
     - On mismatch: "PINs don't match. Try again." inline + reset
8. **Sign-in history**
   - Top app bar: back arrow + "Sign-in history" heading
   - List of recent sign-ins (last 30 days, max 50 rows):
     - Device name (e.g. "Samsung A52, Android 13")
     - Location (city if available — never coordinates)
     - Timestamp (locale-aware)
     - "This device" badge for the current session
   - Per-row "Sign out" link (revokes that session's token —
     equivalent to admin's session-revocation pattern from Phase 21)
   - Sticky-bottom "Sign out everywhere" danger CTA (revokes all
     sessions including current → forces re-sign-in on this device)
9. **About / legal**
   - Top app bar: back arrow + "About" heading
   - ZhiPay branding block (logo + wordmark)
   - Version row ("v1.0.0 (build 42)") — tap 7 times to enable debug
     overlay (developer easter egg, off by default — flag in v2)
   - Legal name + license number (regulatory disclosure)
   - Contact info (email + phone)
   - Privacy Policy → opens in-app web sheet
   - Terms of Service → opens in-app web sheet
   - Open-source licenses → opens scroll list of dependencies (legally
     required)
10. **Help center**
    - Top app bar: back arrow + "Help" heading
    - Search input (full-width) — searches the FAQ knowledge base
    - Category chips: Sending money | Cards | Verification | Limits &
      fees | Receiving money (CN-side) | Account & security | Other
    - List of articles (foundation ListRow): question + 1-line preview
    - Article detail: full markdown-rendered article body + "Was this
      helpful?" Yes/No row at the bottom
11. **Contact support / report an issue**
    - Top app bar: back arrow + "Contact support" heading
    - Subject field (single-select list: Transfer issue / Card issue /
      MyID problem / Account access / Other)
    - When "Transfer issue" selected: "Which transfer?" picker (list of
      recent transfers; tap to attach)
    - Body field (multi-line, max 1000 chars)
    - "Attach screenshot" button (optional, photo picker)
    - Submit CTA → calm "We received your message. We'll respond in
      24 hours." confirmation screen
    - Email + phone fallback ("Or contact us directly at
      support@zhipay.uz / +998 71 ...")
12. **Sign out**
    - Half-sheet confirmation:
      - Heading: "Sign out of ZhiPay?"
      - Body: "You'll need to verify your phone number to sign in
        again." (or fingerprint + PIN, if security is set up)
      - Primary destructive CTA: "Sign out"
      - Secondary "Cancel"
    - On confirm: ends session locally + clears cached preferences;
      navigates to Welcome ([`flow-01-onboarding.md`](./flow-01-onboarding.md)
      step 1) or to a sign-in screen (mobile sign-in is phone OTP
      re-entry — not its own flow plan; the same Welcome → Phone →
      OTP path covers re-entry)

## Account deletion sub-flow (rare path)

Buried inside Settings → Account → Profile → "Delete my account" link
(NOT highlighted; intentionally lower-friction than other apps because
delete-account is irreversible AND triggers compliance review):

- Half-sheet warning:
  - Heading: "Delete your ZhiPay account?"
  - Body: "Your account, transfer history, and saved recipients will be
    permanently deleted after a 30-day cool-off period during which you
    can recover them by signing in. Cards are removed immediately."
  - Primary destructive CTA: "Continue"
  - Secondary "Cancel"
- On continue: long-form reason picker (multi-select chips: "Don't
  need it" / "Privacy concern" / "Switched apps" / "Other") + freeform
  textarea
- Submit → enters server-side review queue (NOT immediate hard delete);
  user lands on confirmation screen explaining the 30-day window
- During the cool-off, all transfers / cards / recipients are read-only;
  signing in shows a banner "Your account is scheduled for deletion on
  DD.MM.YYYY" with a "Cancel deletion" CTA

## States to render (per screen)

| State | Settings home | Profile | Verification | Language | Notif prefs | Security | Sign-in hist | Help center | Contact | Sign out |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Idle | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Loading | initial skel | save | initial | — | — | — | initial | initial | submit | — |
| Empty | — | — | — | — | — | — | "No other sessions" | "No results" | — | — |
| Tier-0 variant | profile shows tier_0 | "Tier 0" hero | "Verify phone first" | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tier-1 variant | profile shows tier_1 | "Tier 1" hero + Verify CTA | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tier-2 variant | profile shows tier_2 | "Tier 2" hero + expiry | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tier-2 expired | profile shows demoted tier_1 + warning | "Expired" hero + Re-verify CTA | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Network offline | banner | banner + WriteButton on Save | banner | banner | banner | banner | banner | banner + cached articles | banner | banner |
| Reduced motion | ✓ no slide | — | — | — | — | — | — | — | — | — |

## Error states

- Save profile fails → inline error in the field that failed (e.g.
  email already used) + WriteButton retry pattern
- Set PIN mismatch → inline at step 7a; no `error_codes` round-trip
- Sign out fails (network) → retry-on-reconnect; sign-out is local-
  first so the user is signed out locally even if the server revoke
  hasn't landed
- Account deletion request fails → calm error pattern + retry CTA
- Help center search returns no results → "No articles found. Try
  different keywords or contact support" with deep-link to step 11

## Edge cases to surface in the design

- User changes language while a screen is rendered → entire app re-
  renders in new locale; no app restart needed
- Tier_0 user has no MyID-related rows in Verification (just phone-
  verification entry: "Verify your phone number to use ZhiPay" routing
  to onboarding)
- Tier_2-expired user lands on Settings → profile section shows
  warning chip + "Re-verify with MyID" CTA prominently (mirrors home-
  screen banner pattern)
- User with biometric unlock enabled tries to disable PIN → blocked:
  "Disable biometric unlock first" sheet
- User initiates account deletion, then signs in within the 30-day
  window → "Welcome back. Your account deletion has been cancelled."
  banner on home; deletion record marked cancelled in audit
- Help center articles in user's preferred language unavailable
  (gap in content) → fall back to `en` with a small "Available in
  English only — sorry, we're working on translations" sub-line

## Acceptance criteria (Gherkin fragments)

```
GIVEN  user.kyc_tier = tier_2
AND    kyc_verifications.expires_at > now() + interval '7 days'
WHEN   user opens Settings → Verification
THEN   tier hero shows "Tier 2 · MyID verified"
AND    expiry row shows the formatted expiry date
AND    "Re-verify now" link is visible (secondary, not primary)

GIVEN  user.preferred_language = 'uz'
WHEN   user opens Settings → Language → selects "Русский" → confirms
THEN   users.preferred_language = 'ru'
AND    the entire app re-renders in Russian immediately
AND    a toast confirmation in Russian renders ("Язык изменён")

GIVEN  user has biometric unlock enabled
WHEN   user opens Settings → Security → taps "Remove PIN"
THEN   blocking sheet renders ("Disable biometric unlock first")
AND    no users mutation
AND    PIN remains set

GIVEN  user submits an account deletion request
WHEN   the deletion confirmation screen renders
THEN   audit_log row inserted (action=deletion_requested,
       actor=user)
AND    server schedules permanent deletion for now() + 30 days
AND    on home screen, banner renders explaining the cool-off
AND    cards in linked_cards move to status=removed immediately
AND    the user can sign in during cool-off and tap "Cancel deletion"
       to abort

GIVEN  user is signed in on 3 devices
WHEN   user opens Settings → Sign-in history → taps "Sign out
       everywhere"
THEN   all session tokens are revoked server-side
AND    audit_log rows inserted (action=session_revoked_all)
AND    current device is signed out + lands on Welcome / sign-in flow
```

## Telemetry to consider

- `settings.home.view`
- `settings.profile.edit.tap`
- `settings.profile.save` (with field changed)
- `settings.kyc.view` (with tier)
- `settings.kyc.verify.tap` (with current tier)
- `settings.language.change` (with old → new locale)
- `settings.notif-prefs.toggle` (with type + new state)
- `settings.security.pin-set`
- `settings.security.pin-remove`
- `settings.security.biometric-toggle`
- `settings.signin-history.signout-row`
- `settings.signin-history.signout-everywhere`
- `settings.help.search` (with query length)
- `settings.help.article.view`
- `settings.support.submit` (with subject)
- `settings.signout.tap`
- `settings.signout.confirm`
- `settings.account-delete.initiate`
- `settings.account-delete.confirm`
- `settings.account-delete.cancel` (during cool-off)

## Cross-references

- Localization: [`.claude/rules/localization.md`](../../../.claude/rules/localization.md)
- Accessibility: [`.claude/rules/accessibility.md`](../../../.claude/rules/accessibility.md)
- Tier rules: [`.claude/rules/kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md)
- MyID re-verification: [`./flow-02-myid.md`](./flow-02-myid.md)
- Card management (deep-linked from Settings → Cards): [`./flow-07-card-management.md`](./flow-07-card-management.md)
- Notification preferences feed inbox: [`./flow-08-notifications.md`](./flow-08-notifications.md)
- Settings surface design prompt: [`../surfaces/11-settings-screens.md`](../surfaces/11-settings-screens.md)
- Help / support surface design prompt: [`../surfaces/12-help-support-screens.md`](../surfaces/12-help-support-screens.md)
