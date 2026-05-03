# Prompt — Settings screens (Home / Profile / KYC / Language / Notif prefs / Appearance / Security / Sign-in history / About / Sign out)

> **How to use:** open a fresh Claude.ai conversation. Paste in this order:
>
> 1. [`../00-shared-context.md`](../00-shared-context.md) (full content)
> 2. [`../01-foundation.md`](../01-foundation.md) (or rendered output)
> 3. [`../user-flows/flow-09-settings.md`](../user-flows/flow-09-settings.md)
> 4. This file
>
> The Help / Support sub-tree lives in
> [`./12-help-support-screens.md`](./12-help-support-screens.md) — same
> flow plan, different surface prompt.

---

## What I want from this pass

Design the **settings screen group** end to end:

1. **Settings home (root)** — profile card top + grouped settings tree
2. **Profile (edit)** — display name + email (phone read-only)
3. **Verification (KYC)** — tier card + limits + phone-verified row +
   MyID row (with re-verify CTA when expired)
4. **Language picker** — 3-locale radio
5. **Notification preferences** — per-type toggles
6. **Appearance** — System / Light / Dark
7. **Security** — PIN code + biometric + auto-lock
8. **Sign-in history** — devices + per-row sign-out + "Sign out
   everywhere"
9. **About / legal** — version + legal name + Privacy + Terms
10. **Sign-out confirmation sheet**
11. **Account deletion sub-flow** (rare, buried)

Render at 390 × 844pt mobile viewport. Multiple frames per screen for
the states listed in
[`../user-flows/flow-09-settings.md`](../user-flows/flow-09-settings.md).

## Per-screen designs

### Screen 1 — Settings home (root)

**Layout** (top → bottom):

- App bar: "Settings" heading; right-side empty (or close-X if mounted
  modally — pick one globally)
- **Profile card** (top, foundation Card primitive, padded):
  - Avatar (initials, large 64pt, foundation Avatar primitive — pure
    initials, no photo per v1 mock)
  - Display name (display-2)
  - Phone masked (`+998 90 ••• •• 23`, body, slate-500, mono)
  - Tier badge (foundation TierBadge primitive)
  - "Edit profile" tap-target chevron → step 2
- **Settings tree** (foundation ListRow primitive, grouped):
  - **Account** group:
    - "Profile" → step 2
    - "Verification" → step 3 (with sub-line "Tier 1" / "Tier 2 ·
      MyID verified" / "Tier 1 · MyID expired")
    - "Cards" → routes to card-management
      ([`./09-card-management-screens.md`](./09-card-management-screens.md))
      with sub-line "{count} cards"
  - **Preferences** group:
    - "Language" → step 4 (with sub-line of current locale name in
      its native script: "O'zbek" / "Русский" / "English")
    - "Notifications" → step 5 (with sub-line "Enabled" / "Limited"
      / "Disabled")
    - "Appearance" → step 6 (with sub-line current mode: "System" /
      "Light" / "Dark")
  - **Security** group:
    - "PIN code" → step 7 (with sub-line "Set up" if none, "Enabled"
      if set)
    - "Biometric unlock" → step 7 (with sub-line per device support:
      "Enabled" / "Disabled" / "Not supported")
    - "Sign-in history" → step 8 (with sub-line "{N} active sessions")
  - **About & legal** group:
    - "About ZhiPay" → step 9
    - "Privacy Policy" → step 9 (in-app sheet; out of scope this pass)
    - "Terms of Service" → step 9 (in-app sheet; out of scope this
      pass)
  - **Support** group:
    - "Help center" → routes to help screens
      ([`./12-help-support-screens.md`](./12-help-support-screens.md))
    - "Contact support" → routes to help screens
    - "Report an issue" → routes to help screens
  - **Sign out** row (separate from groups, danger-700 text label):
    - "Sign out" → step 10 (sign-out confirmation sheet)
- **App version footer** (slate-400, body small, centered): "ZhiPay
  v1.0.0 (build 42)" — tap 7x enables debug overlay (deferred in v1)

**States**:
- Idle (default)
- Tier_2 user (profile card shows tier_2 badge, KYC row sub-line "Tier
  2 · expires DD.MM.YYYY")
- Tier_2-expired (profile card shows tier_1 with warning-tinted
  expiry chip, KYC row sub-line "Tier 1 · MyID expired" with warning
  chip; "Verify" inline CTA on the row)
- Tier_1 user (profile card shows tier_1, KYC row sub-line "Tier 1 ·
  Verify with MyID" with brand chip CTA inline)
- Tier_0 user (profile card shows tier_0, KYC row sub-line "Verify
  your phone")
- Initial mount skeleton (profile card skeleton + 8 row skeletons)
- Network offline (banner at top)
- Dark mode

### Screen 2 — Profile (edit)

**Layout** (top → bottom):

- App bar: back arrow + "Profile" heading
- Avatar (initials, large, top-center, ~96pt) — placeholder for v1; tap
  shows "Change photo" sheet (out of scope; placeholder)
- Display name field (foundation Input primitive):
  - Label: "Name"
  - Value: current display name
  - Editable
- Phone field:
  - Label: "Phone number"
  - Value: full phone (`+998 90 123 45 67`)
  - **Read-only** (foundation Input variant)
  - Helper sub-line: "To change your phone number, contact support."
- Email field:
  - Label: "Email (optional)"
  - Value: current email or empty
  - Helper sub-line: "We'll use this for receipts and support."
  - Validation inline on blur (email format check)
- Sticky-bottom CTA: "Save" — disabled when no changes; enabled
  brand-700; offline-disabled with WriteButton tooltip pattern
- Tertiary "Delete my account" link (centered above CTA, slate-500
  underlined — buried) → routes to account-deletion sheet (step 11)

**States**:
- Idle (default — no changes, CTA disabled)
- Modified (CTA enabled)
- Validation error on email
- Loading (CTA tapped — spinner replaces label)
- Server error (e.g. email already used) — inline error in field
- Network offline (banner + WriteButton-disabled CTA)
- Dark mode

### Screen 3 — Verification (KYC)

**Layout** (top → bottom):

- App bar: back arrow + "Verification" heading
- **Tier card hero** (foundation Card, padded, large):
  - Foundation TierBadge primitive, large variant (display-1)
  - Tier name + status sub-line:
    - tier_0: "Verify your phone to use ZhiPay"
    - tier_1: "Phone verified · Tier 1"
    - tier_2: "MyID verified · Tier 2"
    - tier_2-expired: "MyID expired · Tier 1 (demoted)"
  - Body line per tier: short value-prop describing what's unlocked
- **Limits card** (foundation Card, padded):
  - Heading: "Your limits"
  - 3-cell stat grid:
    - Per transaction: foundation Money primitive, locale-aware
    - Daily: same
    - Monthly: same
  - All values pulled from current tier's limits (display 0/0 for
    tier_0)
  - Sub-line: "Limits reset at midnight (UZS) / start of month."
- **Phone verification row** (foundation ListRow):
  - Icon: phone (lucide), success-toned for tier_1+, slate for tier_0
  - Label: "Phone number"
  - Value: masked phone
  - Status chip: "✓ Verified" (success-tone) for tier_1+ or "Not
    verified" (slate) for tier_0
- **MyID verification row** (foundation ListRow with rich body):
  - Icon: shield (lucide), success for tier_2-active, warning for
    tier_2-expired, slate for tier_0/1
  - Label: "MyID"
  - Body sub-line per state:
    - tier_0/1: "Not verified — verify to unlock higher limits"
    - tier_2 active: "Verified · expires DD.MM.YYYY"
    - tier_2 expired: "Expired DD.MM.YYYY"
  - Inline primary CTA on the row:
    - tier_0/1: "Verify with MyID" (brand)
    - tier_2 active: "Re-verify now" (secondary, link)
    - tier_2 expired: "Re-verify with MyID" (warning-tone primary)

**States**:
- Tier_0 (no MyID, "Verify your phone first" copy)
- Tier_1 (verify CTA prominent)
- Tier_2 active (success-tone, expiry visible)
- Tier_2 within 7 days of expiry (amber-toned chip "Expires soon")
- Tier_2 expired (warning-tone, re-verify CTA)
- Initial mount skeleton
- Network offline
- Dark mode

### Screen 4 — Language picker

**Layout**:

- App bar: back arrow + "Language" heading
- 3 selectable rows (foundation ListRow with Radio leading):
  - `O'zbek` (Latin script — never `kk`, `kaa` not in v1)
  - `Русский`
  - `English`
- Each row: language name in its native script (left) + radio (right)
- Sub-line below the list: "Changes apply immediately." (slate-500)

**States**:
- Idle (current locale selected)
- Tap new locale → optimistic swap (radio moves) + locale-aware toast
  in NEW locale ("Til o'zgartirildi" / "Язык изменён" / "Language
  changed")
- Network offline (banner; selection still works locally — server
  sync deferred)

### Screen 5 — Notification preferences

**Layout** (top → bottom):

- App bar: back arrow + "Notifications" heading
- **Per-type toggles** (foundation ListRow with Switch trailing):
  - "Transfer status" (always on, disabled with tooltip "Transfer
    updates are essential and can't be turned off")
  - "Security alerts" (always on, same disabled pattern)
  - "Compliance & verification" (always on, same)
  - "Card events" (default on, can opt out)
  - "System & app updates" (default on, can opt out)
  - "Marketing & offers" (default OFF — opt-in)
- **OS notification permission row** (read-only foundation ListRow):
  - Label: "OS notification permission"
  - Sub-line: "Granted" / "Denied" / "Not yet asked"
  - Trailing CTA: "Open OS settings" (only visible when "Denied")

**States**:
- Idle (default — 4 always-on, 1 default-on opt-out, 1 default-off
  opt-in)
- Toggles flipped (live-saving)
- OS permission denied (banner-tone row + Open Settings CTA)
- Dark mode

### Screen 6 — Appearance

**Layout**:

- App bar: back arrow + "Appearance" heading
- 3 selectable rows (foundation ListRow with Radio):
  - "System" (default — follows OS)
  - "Light"
  - "Dark"
- Each row: small preview swatch on the left (mini-card showing the
  scheme) + label + radio
- Sub-line below: "Changes apply immediately."

**States**:
- Idle (System selected)
- Light selected
- Dark selected
- Live preview as user taps (entire app re-renders)

### Screen 7 — Security (PIN + biometric + auto-lock)

**Layout** (top → bottom):

- App bar: back arrow + "Security" heading
- **PIN code section** (foundation Card):
  - Heading: "PIN code"
  - When PIN not set: primary CTA "Set up PIN" → step 7a
  - When PIN set: status chip "Enabled" + 2 secondary actions: "Change
    PIN" (link) + "Remove PIN" (danger-tone link)
- **Biometric unlock section** (foundation Card):
  - Heading: "Biometric unlock"
  - Switch row: "Unlock with [Face ID / Touch ID / Fingerprint per
    device]"
  - Sub-line: "Required when opening the app, sending money, or
    changing security settings."
  - Disabled (with tooltip "PIN required first") when PIN not set
- **Auto-lock section** (foundation Card):
  - Heading: "Auto-lock"
  - Single-select radio rows: "Immediately" / "After 5 minutes"
    (default) / "Never"

**Step 7a — Set PIN sub-flow**:
- Sub-screen replaces this screen for the duration of PIN setup
- App bar: back arrow + "Set PIN"
- Heading: "Choose a 4-digit PIN" (display-2)
- 4-box numeric input (foundation OTPInput primitive — same as admin's;
  reused for mobile)
- Sub-line: "You'll need this PIN to unlock the app and confirm
  sensitive actions."
- After 4 digits entered: auto-advances to "Confirm your PIN" step
- On match: success-tone tick + auto-return to step 7 (Security home)
- On mismatch: "PINs don't match. Try again." inline + reset both PIN
  steps

**States**:
- Idle (no PIN, no biometric, default 5-minute auto-lock)
- PIN set, biometric off
- PIN set, biometric on
- Biometric not supported on device (row hidden OR row visible with
  "Not supported on this device" sub-line — designer's call;
  recommend hiding for v1)
- Set PIN sub-flow: empty / partially entered / 4 entered /
  confirming / success / mismatch
- Network offline (banner — security operations work locally; sync
  deferred)
- Dark mode

### Screen 8 — Sign-in history

**Layout** (top → bottom):

- App bar: back arrow + "Sign-in history" heading
- List of sessions (foundation ListRow):
  - Per row:
    - Icon: device type icon (phone / tablet / laptop, lucide)
    - Title: device name (e.g. "Samsung A52, Android 13")
    - Sub-line: location (city if available — never coordinates) +
      timestamp ("Tashkent · 3 hours ago")
    - "This device" badge for current session (brand-tone, body small)
    - Trailing: "Sign out" link (slate-700, body small) — visible
      only on non-current sessions
- Sticky-bottom danger CTA: "Sign out everywhere" — revokes ALL
  sessions including current; AlertDialog confirm before action

**States**:
- Idle (current session + 2-3 others)
- Single session (only current device — "Sign out everywhere" CTA
  hidden since current is the only session)
- Network offline (banner; sign-out actions queue per
  `lib/offlineActionQueue` pattern)
- Sign-out-row tapped → confirmation sheet ("Sign out of this
  session?")
- Sign-out-everywhere tapped → AlertDialog with primary destructive
  + cancel
- Dark mode

### Screen 9 — About / legal

**Layout** (top → bottom):

- App bar: back arrow + "About" heading
- ZhiPay branding block (logo + wordmark, large, centered)
- Version row: "v1.0.0 (build 42)" — tap 7x enables debug overlay
  (deferred in v1; design accommodates with no visible easter-egg
  affordance)
- Legal name row: "ZhiPay LLC, license #..."
- Contact info: email + phone
- 3 navigation rows (foundation ListRow with chevron):
  - "Privacy Policy" → opens in-app web sheet
  - "Terms of Service" → opens in-app web sheet
  - "Open-source licenses" → scroll list of dependencies (legally
    required)
- Footer: "© 2026 ZhiPay LLC. All rights reserved." (slate-400, body
  small, centered)

**States**:
- Idle
- Sheet open (Privacy / Terms / Licenses) — placeholder this pass
- Dark mode

### Screen 10 — Sign-out confirmation sheet

**Layout** (foundation Sheet primitive, half-snap):

- Sheet handle
- Hero icon: log-out (lucide), warning-toned
- Heading: "Sign out of ZhiPay?"
- Body: "You'll need to verify your phone number to sign in again."
  (or "...verify your phone number, fingerprint, and PIN" if
  biometric + PIN are set)
- Action stack:
  - Primary destructive CTA: "Sign out"
  - Secondary "Cancel"

**States**:
- Idle (no security set — body mentions phone-only)
- Idle (PIN + biometric set — body mentions all three)
- Loading (CTA tapped) — primary button shows spinner

### Screen 11 — Account deletion sub-flow

**Sheet 1 — Initial warning** (foundation Sheet, half-snap):

- Hero icon: alert-triangle (lucide), danger-toned
- Heading: "Delete your ZhiPay account?"
- Body: "Your account, transfer history, and saved recipients will
  be permanently deleted after a 30-day cool-off period during which
  you can recover them by signing in. Cards are removed immediately."
- Action stack:
  - Primary destructive CTA: "Continue"
  - Secondary "Cancel"

**Sheet 2 — Reason picker** (foundation Sheet, full-snap):

- Heading: "Help us improve — why are you leaving?"
- Multi-select chip row: "Don't need it" / "Privacy concern" /
  "Switched apps" / "Other"
- Freeform textarea (max 500 chars, optional)
- Sticky-bottom CTAs:
  - Primary "Continue with deletion"
  - Secondary "Cancel"

**Confirmation screen** (full-screen state):

- Hero icon: clock (slate-toned)
- Heading: "Account scheduled for deletion"
- Body: "Your account will be permanently deleted on DD.MM.YYYY (30
  days from now). Sign in any time before then to cancel."
- Primary CTA: "Sign out now" — ends the session and routes to
  Welcome ([`./02-onboarding-screens.md`](./02-onboarding-screens.md))

**States**:
- Sheet 1 idle
- Sheet 2 idle (no reason selected, no body)
- Sheet 2 with reasons + body
- Confirmation screen
- Network offline at any step (banner + WriteButton-disabled CTAs)

## Cross-screen patterns

### App bar pattern

- Back arrow on every screen except step 1 (Settings home is the
  root of the settings sub-tree; no back arrow but possibly a close-X
  if mounted modally)
- Heading text on every screen
- Right-side empty (no kebabs / extra icons in settings — keeps it
  calm)

### Bottom safe-area

- Tab bar (when settings is reached from the More tab) respects iOS
  home-indicator
- Sticky-bottom CTAs (Profile Save, Sign-out-everywhere) respect
  home-indicator

### List grouping

- Foundation ListGroup primitive — section headers in slate-500
  uppercase tracking-wider (chip-style label exception per
  typography rules)
- 8pt gap between groups; 12pt gap between rows within a group

### Live-apply preferences

- Language / Appearance / Notification toggles apply IMMEDIATELY
  (no Save button per
  [`../user-flows/flow-09-settings.md`](../user-flows/flow-09-settings.md))
- Profile / Email require an explicit Save (data with downstream
  validation)

## Localization annotations

Render each text string with its i18n key inline. Suggested keys (this
list is long because settings touches every preference; designer can
collapse into category sub-files if needed):

```
mobile.settings.home.heading
mobile.settings.home.profile-card.edit
mobile.settings.home.section.account
mobile.settings.home.section.preferences
mobile.settings.home.section.security
mobile.settings.home.section.about-legal
mobile.settings.home.section.support
mobile.settings.home.row.profile
mobile.settings.home.row.verification
mobile.settings.home.row.cards (with {count})
mobile.settings.home.row.language
mobile.settings.home.row.notifications
mobile.settings.home.row.appearance
mobile.settings.home.row.pin
mobile.settings.home.row.biometric
mobile.settings.home.row.signin-history (with {count})
mobile.settings.home.row.about
mobile.settings.home.row.privacy
mobile.settings.home.row.terms
mobile.settings.home.row.help-center
mobile.settings.home.row.contact-support
mobile.settings.home.row.report-issue
mobile.settings.home.row.signout
mobile.settings.home.version-format (with {version} {build})
mobile.settings.profile.heading
mobile.settings.profile.name.label
mobile.settings.profile.phone.label
mobile.settings.profile.phone.helper
mobile.settings.profile.email.label
mobile.settings.profile.email.helper
mobile.settings.profile.email.invalid
mobile.settings.profile.email.taken
mobile.settings.profile.cta-save
mobile.settings.profile.delete-account-link
mobile.settings.kyc.heading
mobile.settings.kyc.tier-card.tier-0.subline
mobile.settings.kyc.tier-card.tier-1.subline
mobile.settings.kyc.tier-card.tier-2.subline
mobile.settings.kyc.tier-card.tier-2-expired.subline
mobile.settings.kyc.tier-card.body.tier-0
mobile.settings.kyc.tier-card.body.tier-1
mobile.settings.kyc.tier-card.body.tier-2
mobile.settings.kyc.tier-card.body.tier-2-expired
mobile.settings.kyc.limits.heading
mobile.settings.kyc.limits.per-tx
mobile.settings.kyc.limits.daily
mobile.settings.kyc.limits.monthly
mobile.settings.kyc.limits.reset-info
mobile.settings.kyc.phone.label
mobile.settings.kyc.phone.verified
mobile.settings.kyc.phone.not-verified
mobile.settings.kyc.myid.label
mobile.settings.kyc.myid.tier-1.body
mobile.settings.kyc.myid.tier-1.cta
mobile.settings.kyc.myid.tier-2-active.body (with {date})
mobile.settings.kyc.myid.tier-2-active.cta
mobile.settings.kyc.myid.tier-2-expired.body (with {date})
mobile.settings.kyc.myid.tier-2-expired.cta
mobile.settings.language.heading
mobile.settings.language.subline
mobile.settings.language.toast.uz
mobile.settings.language.toast.ru
mobile.settings.language.toast.en
mobile.settings.notif-prefs.heading
mobile.settings.notif-prefs.row.transfer
mobile.settings.notif-prefs.row.transfer.disabled-tooltip
mobile.settings.notif-prefs.row.security
mobile.settings.notif-prefs.row.compliance
mobile.settings.notif-prefs.row.card
mobile.settings.notif-prefs.row.system
mobile.settings.notif-prefs.row.marketing
mobile.settings.notif-prefs.os-perm.label
mobile.settings.notif-prefs.os-perm.granted
mobile.settings.notif-prefs.os-perm.denied
mobile.settings.notif-prefs.os-perm.not-asked
mobile.settings.notif-prefs.os-perm.open-settings
mobile.settings.appearance.heading
mobile.settings.appearance.system
mobile.settings.appearance.light
mobile.settings.appearance.dark
mobile.settings.appearance.subline
mobile.settings.security.heading
mobile.settings.security.pin.heading
mobile.settings.security.pin.cta-set
mobile.settings.security.pin.enabled
mobile.settings.security.pin.cta-change
mobile.settings.security.pin.cta-remove
mobile.settings.security.biometric.heading
mobile.settings.security.biometric.row.face-id
mobile.settings.security.biometric.row.touch-id
mobile.settings.security.biometric.row.fingerprint
mobile.settings.security.biometric.subline
mobile.settings.security.biometric.disabled-tooltip
mobile.settings.security.auto-lock.heading
mobile.settings.security.auto-lock.immediately
mobile.settings.security.auto-lock.after-5min
mobile.settings.security.auto-lock.never
mobile.settings.security.set-pin.heading
mobile.settings.security.set-pin.subline
mobile.settings.security.set-pin.confirm-heading
mobile.settings.security.set-pin.mismatch
mobile.settings.signin-history.heading
mobile.settings.signin-history.this-device
mobile.settings.signin-history.signout-row
mobile.settings.signin-history.cta-signout-everywhere
mobile.settings.signin-history.signout-row.confirm.heading
mobile.settings.signin-history.signout-everywhere.confirm.heading
mobile.settings.signin-history.signout-everywhere.confirm.body
mobile.settings.about.heading
mobile.settings.about.legal-name
mobile.settings.about.contact
mobile.settings.about.copyright
mobile.settings.signout-sheet.heading
mobile.settings.signout-sheet.body.phone-only
mobile.settings.signout-sheet.body.with-security
mobile.settings.signout-sheet.cta-signout
mobile.settings.delete-account.sheet1.heading
mobile.settings.delete-account.sheet1.body
mobile.settings.delete-account.sheet1.cta-continue
mobile.settings.delete-account.sheet2.heading
mobile.settings.delete-account.sheet2.reason.dont-need
mobile.settings.delete-account.sheet2.reason.privacy
mobile.settings.delete-account.sheet2.reason.switched
mobile.settings.delete-account.sheet2.reason.other
mobile.settings.delete-account.sheet2.body-placeholder
mobile.settings.delete-account.sheet2.cta-continue
mobile.settings.delete-account.confirmation.heading
mobile.settings.delete-account.confirmation.body (with {date})
mobile.settings.delete-account.confirmation.cta-signout
common.tier.tier-0
common.tier.tier-1
common.tier.tier-2
```

**Longest-translation test**: render the Russian variants of:
1. The settings home Sign-out row label ("Выйти из аккаунта") —
   should fit comfortably as a danger-toned row label
2. The verification screen tier_2-expired body ("Срок действия проверки
   MyID истёк. Пройдите повторно, чтобы восстановить лимиты и
   разморозить карты Visa/MC") at 360pt — verify it doesn't overflow
   the limits card
3. The biometric subline ("Требуется при открытии приложения, отправке
   денег и изменении настроек безопасности") — verify it wraps to 2
   lines max within the foundation Card padding

## Accessibility annotations

- Tap-target sizes: every ListRow row ≥ 56pt; PIN-input boxes ≥ 56pt
  square; Switch trailing controls ≥ 44pt × 24pt
- Focus order on Settings home:
  1. App bar back / close
  2. Profile card (Edit profile)
  3. Each row top → bottom (group headings as section headers)
  4. Sign out row
  5. Version footer (decorative — skip)
- Screen-reader labels:
  - Profile card: "Sardor Allaberganov, phone ending in 23, Tier 2.
    Double-tap to edit profile."
  - Tier badge: "Tier 2, MyID verified" / variants per state
  - Switch rows: "Card events notifications, currently on. Double-
    tap to turn off."
  - PIN input boxes: "PIN box 1 of 4, currently empty"
  - Sign-in history rows: announce the device + location + relative
    time + "current session" suffix when applicable
  - Sign-out row: "Sign out of ZhiPay" — announced as destructive
- Reduced-motion fallbacks:
  - Theme switch live-apply: instant (no fade between schemes)
  - Language change: instant re-render (no slide)
  - Sheet open: instant (no slide-up)
  - Switch toggle: instant slide (no easing)
- Color-only signals: tier badges pair color WITH icon AND text
  label; status chips ALWAYS have icons + text

## Microinteractions to render

- Theme switch: live-apply with 200ms ease cross-fade between schemes
  — entire app re-renders; reduced-motion → instant
- Language change: apply immediately + locale-aware confirmation
  toast in NEW locale; reduced-motion → instant
- Switch toggle: knob slides 300ms ease-out; color transitions
  slate-300 → brand-600
- PIN box auto-advance: subtle 100ms scale-down on filled box
- PIN mismatch: 250ms shake on the input row (50pt translate-X);
  reduced-motion → static
- Sheet open / dismiss: 300ms ease-out slide
- Account-deletion confirmation hero icon: gentle scale-in 200ms

## Output format checklist

- [ ] Single Claude.ai artefact, mobile viewport 390pt
- [ ] React + Tailwind, using foundation tokens
- [ ] All 10 screens × all listed states (~40 frames)
- [ ] Light + dark variants
- [ ] Russian-longest-translation tests on Sign-out row label,
      verification body, biometric subline
- [ ] All copy annotated with i18n keys
- [ ] Microinteractions annotated
- [ ] Accessibility focus order overlaid on settings home + security +
      sign-in history
- [ ] Acceptance criteria (Gherkin) appended (extending seeds from
      `flow-09-settings.md`)

## Forbidden in this pass

- ❌ Showing the user's full PINFL or document number anywhere
- ❌ Marketing CTAs / promotional banners on settings screens
- ❌ Pre-checked marketing-notifications toggle (must be opt-in)
- ❌ "Are you sure?" modal for non-destructive preference toggles
  (live-apply with no friction)
- ❌ Hiding sign-out at the bottom of the screen as a "tip" or hint
  — sign-out is a clear, danger-toned row, in its own section
- ❌ Showing the full PAN of cards in settings (Cards row sub-line
  shows count only — full card-mgmt lives in its own surface)
- ❌ Confirmation modals for "Save" on profile when no changes were
  made (CTA stays disabled)
- ❌ Inventing tier names or KYC states not in the canonical machine

## Cross-references

- Foundation: [`../01-foundation.md`](../01-foundation.md)
- Flow plan: [`../user-flows/flow-09-settings.md`](../user-flows/flow-09-settings.md)
- Help / support sub-tree: [`./12-help-support-screens.md`](./12-help-support-screens.md)
- Card management (Cards row deep-link): [`./09-card-management-screens.md`](./09-card-management-screens.md)
- Tier upgrade (Verification CTA target): [`./08-tier-upgrade-screens.md`](./08-tier-upgrade-screens.md)
- Notifications inbox: [`./10-notifications-screens.md`](./10-notifications-screens.md)
- Welcome / sign-in target on sign-out: [`./02-onboarding-screens.md`](./02-onboarding-screens.md)
- KYC tier rules: [`../../../.claude/rules/kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md)
- Localization (UZ-first, language change live-apply): [`../../../.claude/rules/localization.md`](../../../.claude/rules/localization.md)
- Accessibility: [`../../../.claude/rules/accessibility.md`](../../../.claude/rules/accessibility.md)
