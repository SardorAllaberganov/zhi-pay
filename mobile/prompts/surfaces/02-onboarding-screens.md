# Prompt — Onboarding Screens (Welcome / Language / Phone / OTP / Tier-1 home)

> **How to use:** open a fresh Claude.ai conversation. Paste in this order:
>
> 1. [`../00-shared-context.md`](../00-shared-context.md) (full content)
> 2. [`../01-foundation.md`](../01-foundation.md) (or its rendered output if
>    foundation is already locked — paste the token spec table back in so
>    Claude designs against the locked palette)
> 3. [`../user-flows/flow-01-onboarding.md`](../user-flows/flow-01-onboarding.md)
> 4. This file
>
> Claude will respond with a single hi-fi rendered React + Tailwind artefact
> showing every screen + every state.

---

## What I want from this pass

Design the **onboarding screen group** end to end:

1. **Welcome** (first launch only)
2. **Language picker** (sheet from Welcome)
3. **Phone entry**
4. **OTP entry**
5. **Tier-1 landing** (post-success home — the banner-heavy intermediate
   home, NOT the full home screen which is `03-home-screen.md`)

Render each screen in a 390 × 844pt mobile viewport. Multiple frames per
screen for the states listed in `flow-01-onboarding.md` §"States to render".

## Per-screen designs

### Screen 1 — Welcome

**Layout** (top → bottom):
- Top safe-area: empty (no status bar overlay needed in mock)
- Brand mark (ZhiPay wordmark only — no logomark + wordmark double-up; the
  wordmark IS the brand identity for v1) — centered, ~24pt above fold
- Hero copy block — one short value-prop sentence, 28pt-32pt display weight
- Sub-line: corridor + currency, body small, slate-600 muted
- Visual element: the foundation pass's card-as-object component, subtly
  scaled to ~70% width, with a placeholder UZ-flag and CN-flag composition
  that hints at the corridor (no nation-state imagery — abstract geometric
  placeholder is fine; designer can refine in Figma)
- Bottom-of-screen: language switcher row (current locale name + chevron)
  → tap opens language picker sheet
- Sticky-bottom: primary CTA "Get started" (full-width minus 24px margin,
  56pt tall — the foundation `lg` button)

**States**:
- Idle (default)
- Offline banner at top (dismissible? no — auto-clears when network returns)

**Tone**: minimal. No marketing carousel. No 3-slide intro. The user
opened the app to send money — get them started.

### Screen 2 — Language picker (bottom sheet, half-snap)

**Layout**:
- Sheet handle at top
- Title: "Choose language" (localised — note that the title itself flips
  language on each preview; show all 3)
- 3 selectable rows (ListRow primitive with radio-left variant):
  - `O'zbek` (selected by default)
  - `Русский`
  - `English`
- No flags. No country names.
- Bottom: "Done" primary button → confirms selection, dismisses sheet

**States**:
- Idle (each locale as the active selection — render 3 frames)

### Screen 3 — Phone entry

**Layout** (top → bottom):
- App bar: back arrow on left (iOS-style chevron OR Android-style arrow —
  designer picks the gesture-friendly default), no title
- Page heading: "What's your phone number?" — display-2 size
- Sub-line: "We'll text you a code to confirm." — body, slate-600
- Phone input field:
  - Locked `+998 ` prefix in slate-500
  - Mask `90 123 45 67`
  - Phone icon leading
  - Auto-focus on mount (Android: forces keyboard; iOS: same; reduce-motion:
    no animated focus ring)
- Helper line below input: "We use your phone only for sign-in and security
  alerts." — body small, slate-500
- (Skip terms-of-service for v1 mock — defer to legal sign-off)
- Sticky-bottom primary CTA: "Continue" — disabled until valid 9-digit input

**States**:
- Idle (empty)
- Filled (valid format, button enabled)
- Filled invalid (e.g. 8 digits, prefix not in allowlist) — inline error
  below input ring-danger-300
- Loading (CTA tapped — spinner replaces label, button stays at full width
  + height to prevent layout jump)
- Offline (banner at top of content area, CTA disabled with offline tooltip
  per the WriteButton primitive pattern)
- Server 5xx (banner: localised `error_codes.PROVIDER_UNAVAILABLE` calm-
  review pattern)

### Screen 4 — OTP entry

**Layout** (top → bottom):
- App bar: back arrow (returns to Phone screen, preserves entered phone)
- Page heading: "Enter the code" — display-2
- Sub-line: "We sent a 6-digit code to +998 90 ••• •• 23" — body, slate-600.
  Phone is masked beyond first 5 + last 2 to avoid full re-display.
- OTP input: 6 (or 4) auto-focusing boxes
  - Each box ~48pt square, ~16pt gap
  - Active box: brand-500 ring 2pt + slight scale
  - Filled box: slate-900 text, brand-50 fill
  - Error box: danger-500 ring + brief shake animation (50pt translateX
    over 250ms — honors reduced-motion)
- Resend cooldown row below the boxes:
  - 60s countdown: "Resend in 0:58" — body small, slate-500
  - 0s: "Resend code" — link variant of button, brand-700
- (No primary CTA — submit fires automatically when all boxes are filled,
  or via the on-screen keyboard's "Done" if available)
- Footer: "Wrong number?" — link → returns to Phone screen, retains
  partial input

**States**:
- Idle (empty)
- 1–5 boxes filled
- 6 boxes filled, submitting (loading — boxes go slate-200, briefly)
- Wrong code (1 of 3) — boxes danger-ring + inline localised
  `error_codes.OTP_INVALID` body
- Wrong code (3 of 3) — boxes locked, full-screen inline lock icon +
  "Too many attempts. Try again in 4:32." with countdown — calm warning
  tone, NOT alarming red
- Resend during cooldown (link disabled, count visible)
- Resend after cooldown (link enabled, brand-700, with subtle press feedback
  on tap)
- Offline banner (top)
- Provider down (calm `error_codes.PROVIDER_UNAVAILABLE` banner)
- Success — tick animation plays for 800ms, then navigates

**Microinteractions to render** (mark with arrow + brief annotation):
- Auto-focus next box on type
- Auto-submit on 6th box filled
- Backspace empties current box, focuses previous
- Paste full code: distributes across all boxes
- Keyboard appears on mount; doesn't dismiss until success or back

### Screen 5 — Tier-1 landing (post-OTP home preview)

> This is the FIRST home-screen mount post-onboarding. The full home design
> for `tier_1` AND `tier_2` users lives in `03-home-screen.md`. Here we
> only render the post-onboarding-specific view: the "you're all set" toast
> moment + the upgrade-to-MyID banner.

**Layout** (top → bottom):
- App bar: ZhiPay wordmark left, avatar (initials) right (taps → settings)
- Tier badge row: pill showing "Tier 1 · Phone verified" (foundation
  TierBadge primitive at `tier_1` style — slate-tinted, body small)
- Welcome banner (info, dismissible): "You're all set. Welcome to ZhiPay."
  — auto-dismisses 4s OR on tap. Subtle slide-down animation on mount
  (250ms, ease-out).
- Upgrade-to-MyID banner (warning-tinted, persistent until completed):
  - Icon: shield (lucide)
  - Title: "Verify with MyID to unlock higher limits"
  - Body: "Tier 1 lets you browse rates and link cards. Verify with MyID to
    start sending."
  - Primary CTA inline: "Verify with MyID" → routes to `flow-02-myid.md`
  - Secondary "Later" — dismisses for this session only; resurfaces on next
    cold launch
- Quick action row (3 chip-buttons):
  - Add card → routes to card-linking flow (enabled at `tier_1` for
    UzCard / Humo)
  - View FX rates → routes to a static FX rates screen (out of scope for
    this prompt; placeholder)
  - Help → routes to support (out of scope for this prompt; placeholder)
- Send-money entry block (visually emphasized but **disabled**):
  - Headline: "Ready to send" — display-2 size
  - Sub-line: "Verify with MyID first" — body small, warning-700 (not
    danger — this is a soft block)
  - Disabled primary button "Send money" with the foundation
    WriteButton-style `disabled` variant + tooltip on long-press
- Recent activity placeholder: "Your transfers will appear here" — empty
  state with line illustration of an envelope (or skip illustration —
  designer's call, but keep restrained)
- Tab bar at bottom (foundation primitive): Home (active) / Send (visible
  but tap-disabled until `tier_2`) / History (visible, empty) / More

**States**:
- Initial mount (skeleton during the brief moment data hydrates)
- Welcome-banner visible (first 4s)
- Welcome-banner dismissed (banner gone, MyID upgrade banner remains)
- MyID upgrade banner dismissed-this-session (banner gone, one less item
  in the layout — recompose gracefully)
- Offline banner at top (yet another stacked banner — show how 3 banners
  stack: offline at top, welcome below it, MyID below welcome)
- Dark mode

## Cross-screen patterns

### App bar pattern (used 3, 4, 5)

- Back arrow left, no title text on Phone + OTP screens (the page heading
  serves as the title); wordmark on Tier-1 home
- Right-side: empty on 3 + 4; avatar on 5
- Height 56pt iOS / 64pt Android — pick one and stick to it

### Bottom safe-area

- Sticky-bottom primary CTAs respect the iOS home-indicator bar
  (extra 16pt padding on devices with the indicator; designer marks this
  as a `safe-area-inset-bottom` consideration)

### Keyboard handling

- Keyboard pushes content up (default react-native-keyboard-aware-scroll-
  view behavior) — primary CTA stays visible above the keyboard
- On Phone screen, keyboard auto-shows; on OTP screen, keyboard auto-
  shows + numeric layout; on Welcome, keyboard never appears

## Localization annotations

Render each text string with its i18n key inline (small annotation in
slate-400). Suggested keys:

```
mobile.onboarding.welcome.title
mobile.onboarding.welcome.subtitle
mobile.onboarding.welcome.cta
mobile.onboarding.lang-picker.title
mobile.onboarding.lang-picker.confirm
mobile.onboarding.phone.heading
mobile.onboarding.phone.subheading
mobile.onboarding.phone.privacy-note
mobile.onboarding.phone.cta
mobile.onboarding.otp.heading
mobile.onboarding.otp.subheading
mobile.onboarding.otp.resend
mobile.onboarding.otp.resend-cooldown
mobile.onboarding.otp.wrong-number
mobile.onboarding.tier1.welcome-banner
mobile.onboarding.tier1.tier-pill
mobile.onboarding.tier1.upgrade-banner.title
mobile.onboarding.tier1.upgrade-banner.body
mobile.onboarding.tier1.upgrade-banner.cta
mobile.onboarding.tier1.upgrade-banner.dismiss
mobile.onboarding.tier1.send-disabled.heading
mobile.onboarding.tier1.send-disabled.subheading
mobile.onboarding.tier1.empty-history
```

**Longest-translation test**: render the Russian variant of the OTP
sub-heading ("Мы отправили шестизначный код на +998 90 ••• •• 23") at the
default viewport — verify it doesn't wrap to 3 lines or clip. If it does,
adjust the heading hierarchy / line-height / font-size in the foundation
pass.

## Accessibility annotations (call out per screen)

- Tap-target sizes annotated where ≥ 44pt is non-obvious
- Focus order annotated as a numbered overlay on each screen
- Screen-reader labels written into a sidebar or the spec doc:
  - "ZhiPay" (wordmark, decorative on Welcome — actually NOT decorative,
    it announces the app)
  - "Choose language" (sheet title)
  - "Phone number" (input label, + announcement of country code prefix)
  - "Code box 1 of 6" (each OTP box)
  - "Resend code in 58 seconds" (countdown — live region, polite)
- Reduced-motion fallback for the OTP shake + the welcome-banner slide-in:
  reduce to instantaneous on `prefers-reduced-motion`

## Output format checklist

- [ ] Single Claude.ai artefact, mobile viewport 390pt
- [ ] React + Tailwind, using foundation tokens
- [ ] All 5 screens × all states (~25 frames)
- [ ] Light + dark variants for screens that meaningfully differ (Tier-1
      home definitely; Welcome maybe)
- [ ] Russian-longest-translation test frame
- [ ] All copy annotated with i18n keys
- [ ] Microinteractions annotated with arrows + 1-line description
- [ ] Accessibility focus order overlaid as a numbered guide
- [ ] Acceptance criteria (Gherkin) appended at the end (extending the
      seed AC from `flow-01-onboarding.md`)

## Forbidden in this pass

- ❌ Marketing carousel on Welcome (one-screen, one-CTA only)
- ❌ Email field anywhere (mobile auth is phone OTP only — admin uses email,
      mobile does not)
- ❌ Visa / Mastercard logos on Tier-1 home's "add card" affordance
- ❌ Confetti on OTP success (calm tick is sufficient)
- ❌ Skipping any state in the table from `flow-01-onboarding.md` §"States
      to render" — every cell must render

## Cross-references

- Foundation tokens + primitives: [`../01-foundation.md`](../01-foundation.md)
- Flow plan: [`../user-flows/flow-01-onboarding.md`](../user-flows/flow-01-onboarding.md)
- Onboarding flow diagram:
  [`../../../docs/mermaid_schemas/onboarding_flow.md`](../../../docs/mermaid_schemas/onboarding_flow.md)
- Tier rules:
  [`../../../.claude/rules/kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md)
- Error UX:
  [`../../../.claude/rules/error-ux.md`](../../../.claude/rules/error-ux.md)
- Localization:
  [`../../../.claude/rules/localization.md`](../../../.claude/rules/localization.md)
- Accessibility:
  [`../../../.claude/rules/accessibility.md`](../../../.claude/rules/accessibility.md)
