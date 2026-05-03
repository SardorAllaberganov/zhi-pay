# Prompt — Tier-upgrade + MyID screens (Banner / Sheet / Full-screen + MyID journey)

> **How to use:** open a fresh Claude.ai conversation. Paste in this order:
>
> 1. [`../00-shared-context.md`](../00-shared-context.md) (full content)
> 2. [`../01-foundation.md`](../01-foundation.md) (or rendered output)
> 3. [`../user-flows/flow-06-tier-upgrade.md`](../user-flows/flow-06-tier-upgrade.md)
>    (the trigger surfaces and journey wrappers)
> 4. [`../user-flows/flow-02-myid.md`](../user-flows/flow-02-myid.md)
>    (the MyID flow itself — consent / ID-card / face / submit / result)
> 5. This file
>
> Two flow plans feed this one surface — both must be in context.

---

## What I want from this pass

Design the **tier-upgrade prompt + MyID verification** screens end to
end. Two tightly-coupled groups:

**Group A — Tier-upgrade prompts** (the moments where the gate appears):

1. **Inline upgrade banner** (home-screen + persistent contexts)
2. **Half-sheet upgrade gate** (action-blocked contexts: Send tap on
   tier_1, Visa/MC tap in card-linking, post-limit-trigger)
3. **Full-screen upgrade state** (tier_0 hard block — defensive)
4. **Pre-expiry warning banner** (tier_2 within 7 days of expiry)
5. **Post-expiry persistent banner** (tier_2 after expiry, soft-demoted)
6. **Resume-state banner** ("Continue MyID verification" — when user
   started the flow but didn't finish)

**Group B — MyID verification flow** (when the user taps "Verify"):

7. **Consent / intro**
8. **ID card front capture**
9. **ID card back capture**
10. **Face capture (liveness)**
11. **Submitting (loading)**
12. **Result success** (with contextual CTA based on original trigger)
13. **Result failure (retryable)** — per `error_codes`
14. **Result failure (terminal)** — calm-review pattern
15. **Result pending** (>30s provider response)

Render at 390 × 844pt mobile viewport. Multiple frames per state.

## Group A — Per-screen designs

### Screen 1 — Inline upgrade banner (home + persistent contexts)

**Layout**:

- Foundation Banner primitive, warning-tinted (warning-50 surface +
  warning-600 icon)
- Icon: shield (lucide), warning-700 stroke, ~24pt
- Heading: "Verify with MyID to send money" (display-3, slate-900)
- Body: "Higher limits · Visa & Mastercard support" (body, slate-700)
- Right-side primary CTA: "Verify" (compact button, brand-700)
- Top-right dismiss-X (slate-400) — dismisses for session only

**States**:
- Idle (default)
- Dismissed (banner is hidden — for visualization, render a "next
  cold launch" frame showing the banner re-surfaced)
- Reduced-motion (no slide-in on mount)
- Russian (longest copy variant — likely heavy)
- Dark mode

### Screen 2 — Half-sheet upgrade gate (action-blocked)

**Layout** (foundation Sheet primitive at half-snap):

- Sheet handle at top
- Hero icon: shield (lucide) in warning tone, large
- Heading (contextual to trigger):
  - Send-money tap: "Send money? Verify first." (display-2)
  - V/MC tap: "Visa & Mastercard need full verification" (display-2)
  - Post-limit: "Reached your limit?" (display-2)
- Body (2-line value-prop):
  - Generic: "Verify with MyID to unlock higher limits and send money."
  - V/MC: "Verify with MyID to add Visa or Mastercard cards. UzCard
    and Humo work right now."
  - Post-limit: "Higher tiers have larger daily and monthly limits.
    Verify with MyID to upgrade."
- Two stacked CTAs:
  - Primary: "Verify with MyID" → routes to step 7 consent
  - Secondary (when applicable):
    - V/MC trigger: "Use UzCard or Humo instead" → returns to scheme
      picker
    - Send-money trigger: NONE (only Verify CTA + Cancel)
- Tertiary "Cancel" / dismiss-X (top-right of sheet)

**States**:
- Idle (per trigger variant — render at least 3 variants: Send,
  V/MC, Post-limit)
- Network offline (banner inside the sheet at the top)

### Screen 3 — Full-screen upgrade state (tier_0 hard block)

**Layout** (centered foundation full-screen state):

- Hero icon: shield (lucide), warning-toned, large (~120pt)
- Heading: "Verify your identity to use ZhiPay" (display-1)
- Body: "We need to verify who you are before you can browse rates,
  link cards, or send money."
- Primary CTA: "Verify with MyID"
- No secondary CTA (tier_0 has no ungated actions)
- Footer: small line "Need help? Contact support" → routes to support

**States**:
- Idle
- Network offline
- Reduced-motion

### Screen 4 — Pre-expiry warning banner (tier_2, expires soon)

**Layout** (foundation Banner primitive, AMBER-tinted — distinct from
the warning-red post-expiry):

- Surface: amber/warning-50 (lighter than the post-expiry red)
- Icon: shield (lucide), amber-600 stroke
- Heading: "Your MyID verification expires in 5 days"
- Body: "Re-verify to keep higher limits and Visa/Mastercard."
- Right-side primary CTA: "Re-verify"
- Top-right dismiss-X (per-session)

**States**:
- 7-day variant ("expires in 7 days")
- 5-day variant ("expires in 5 days")
- 1-day variant ("expires tomorrow") — slightly more emphatic copy
- Dismissed

### Screen 5 — Post-expiry persistent banner (tier_2 → tier_1 demote)

**Layout** (foundation Banner primitive, WARNING-RED tinted — stronger
than pre-expiry; NOT dismissible):

- Surface: warning-50 (or danger-50 — designer's call; warning is the
  better fit since this is recoverable, not failed)
- Icon: shield-x or shield-alert (lucide), warning-700 stroke
- Heading: "MyID verification expired"
- Body: "Re-verify to restore higher limits and unfreeze Visa/MC cards."
- Right-side primary CTA: "Re-verify"
- **NO dismiss-X** (must be re-verified or accepted as terminal)

**States**:
- Idle (default)
- Render alongside frozen-V/MC sub-banner: "Your Visa & Mastercard
  cards are frozen until you re-verify"

### Screen 6 — Resume-state banner

**Layout** (foundation Banner primitive, brand-tinted — friendly):

- Surface: brand-50
- Icon: refresh (lucide), brand-600 stroke
- Heading: "Continue MyID verification"
- Body: "Pick up where you left off — should take a minute or two."
- Right-side primary CTA: "Continue"

**States**:
- Idle (resume from step N — we don't reveal the step in copy; just
  resume)
- Dismissed

## Group B — MyID flow per-screen designs

### Screen 7 — Consent / intro

**Layout** (top → bottom):

- App bar: back arrow (returns to entry surface)
- 3-step preview chip-row at top (foundation Stepper primitive):
  `1. Consent · 2. ID card · 3. Face` — current = step 1
- Heading: "Verify with MyID" (display-1)
- 3-line value-prop block (foundation IconRow primitive):
  - 🛡️ "Higher daily and monthly limits" (with tier_2 badge inline)
  - 💳 "Add Visa or Mastercard cards"
  - ⚡ "Send money to Alipay or WeChat"
- 2 explicit checkboxes (NOT pre-checked, foundation Checkbox primitive):
  - "I consent to MyID verifying my identity using my UZ ID card and
    a photo of my face."
  - "I understand my data is handled per ZhiPay's Privacy Policy."
    (link opens in-app sheet — out of scope; placeholder)
- Privacy line: "Your ID card image and face photo are sent to MyID
  and never stored on this device." (slate-500, body small, with a
  small lock icon leading)
- Sticky-bottom CTAs:
  - Primary "Continue" — disabled until both boxes checked
  - Secondary "Cancel" (returns to entry surface; flow can be resumed
    later)

**States**:
- Idle (both boxes unchecked, CTA disabled)
- Both boxes checked (CTA enabled)
- Loading (CTA tapped)
- Network offline (banner + WriteButton-disabled CTA)
- Dark mode

### Screen 8 — ID card front capture

**Layout**:

- App bar: back arrow + step chip "Step 2 of 3 · ID card front"
- Camera viewfinder fills the screen
- ID-card outline overlay (rounded-rectangle aspect-ratio matching the
  UZ ID card; mid-gray translucent border with corner anchors)
- Helper line at top: "Place your ID card flat. Make sure all 4 corners
  are visible."
- Auto-detect indicator (small pulsing dot top-right, brand-toned —
  fades when card detected and stable for 800ms)
- Manual capture button at bottom (foundation IconButton, large,
  circular, white surface with brand-toned border) — fallback for
  low-light / older devices
- Failure-to-detect hint after 8s: "Can't detect the card? Tap to
  capture manually." (slate-500, body, fade-in)

**States**:
- Detecting (auto-detect indicator pulsing)
- Stable (card aligned + detected; brief 200ms green-tone pulse on
  the outline, then auto-capture fires)
- Captured / preview (still-frame preview overlays the viewfinder
  with retake / continue buttons at the bottom)
- Manual capture mode (auto-detect indicator hidden; manual button
  prominent)
- Low-light hint (warning chip "Move to brighter light")
- Glare detected (warning chip "Tilt slightly to reduce glare")
- Camera permission denied (full-screen state replacing the
  viewfinder: heading, body explaining why, "Open Settings" CTA)
- Network offline (banner — capture works offline; submission later)
- Reduced-motion (no pulsing; static indicator)

### Screen 9 — ID card back capture

(Same shape as screen 8 with these copy updates):

- Step chip: "Step 2 of 3 · ID card back"
- Helper line: "Now flip the card. We need to read the machine-
  readable strip on the back."
- All states from screen 8 apply

### Screen 10 — Face capture (liveness)

**Layout**:

- App bar: back arrow + step chip "Step 3 of 3 · Selfie"
- Front-camera viewfinder fills the screen
- Circular face outline overlay (centered, mid-gray translucent
  border)
- Liveness instructions sequence (foundation Banner primitive at top
  of screen — one instruction visible at a time):
  - "Look straight at the camera"
  - "Turn your head slowly to the left"
  - "Turn your head slowly to the right"
- Progress ring around the circular outline fills as each instruction
  is satisfied (brand-toned)
- Retake button (foundation IconButton, secondary — bottom-left of
  screen)
- Reduced-motion variant: instructions appear as a numbered LIST
  (foundation List primitive), all 3 visible at once, user taps "Done"
  when complete

**States**:
- Idle / starting (first instruction visible)
- Mid-instruction 1 (progress ring 33%)
- Mid-instruction 2 (progress ring 66%)
- Mid-instruction 3 (progress ring 100%)
- All captured (brief tick animation, auto-advances to step 11)
- Manual retake mid-flow
- Camera permission denied
- Reduced-motion (list mode)

### Screen 11 — Submitting (loading)

**Layout** (centered foundation full-screen state):

- Branded illustration: passport-stamp visual or similar abstract
  calm icon — large, centered
- Heading: "Verifying with MyID" (display-2)
- Sub-line: "This usually takes under 30 seconds." (body, slate-500)
- Indeterminate progress strip OR step pulse (calm, NOT racy)
- Footer: "Cancel verification" link (slate-700, body) — taps confirm
  in a sheet before discarding

**States**:
- Active (default)
- 30s+ elapsed → falls through to screen 15 (pending)
- Cancel sheet open (overlay)
- Network offline mid-submit (calm "Reconnecting…" with retry-on-
  reconnect; if still offline after 30s, stash submission state)
- Reduced-motion (static illustration, no pulse)

### Screen 12 — Result success

**Layout**:

- App bar: NO back arrow (this is celebration; minimal chrome)
- Hero block:
  - Tick icon (success-700, large, scale-in animation 200ms ease-out)
  - Heading: "You're verified" (display-1)
  - Body: "Your tier is now Tier 2. You can send money, add Visa or
    Mastercard cards, and your limits are higher." (body)
- Tier-2 badge prominently shown (foundation TierBadge variant
  `tier_2`, large)
- 2 next-step CTAs (sticky-bottom):
  - Primary CTA — CONTEXTUAL to original trigger (per
    [`../user-flows/flow-06-tier-upgrade.md`](../user-flows/flow-06-tier-upgrade.md)):
    - Trigger was "Send money" → "Send money" (deep-links to
      send-money flow with any in-progress amount preserved)
    - Trigger was "Add Visa" → "Add Visa" (deep-links back to
      scheme-picker with Visa pre-selected)
    - Trigger was generic home banner → "Send money" (default
      forward-momentum CTA)
  - Secondary "Add a card"
- Tertiary "Back to home" link

**States**:
- Idle — Send-money trigger
- Idle — V/MC trigger
- Idle — Generic home trigger
- Re-verification variant (text adjusts to "You're re-verified")
- Reduced-motion (no scale-in tick)
- Dark mode

### Screen 13 — Result failure (retryable)

**Layout**:

- App bar: back arrow
- Hero block:
  - Icon: warning (NOT alarming red — this is recoverable), warning-
    600, large
  - Heading: localized `error_codes.message_*` (display-2) — e.g.
    "Couldn't verify your face"
  - Body: localized `error_codes.suggested_action_*` — e.g. "The face
    photo didn't match your ID card. Try again with better lighting."
- 3-CTA action stack:
  - Primary: "Try again" — returns to the appropriate step (face
    re-capture for `MYID_FACE_MISMATCH`; full restart for
    `MYID_DOC_INVALID`; etc.)
  - Secondary: "Contact support"
- Tertiary "Back to home" link

**States**:
- Per error code (≥3 representative variants — DOC_QUALITY,
  FACE_MISMATCH, PROVIDER_UNAVAILABLE)
- Reduced-motion (icon scale-in becomes instant)
- Dark mode

### Screen 14 — Result failure (terminal)

**Layout**:

- App bar: back arrow
- Hero block:
  - Icon: shield-x or info (calm, slate-toned — NOT red)
  - Heading: "We couldn't verify your identity" (display-2 — generic;
    NEVER expose underlying reason for terminal cases per `error-
    ux.md` calm-review pattern)
  - Body: "Please contact support to complete verification." (body)
- 2 CTAs:
  - Primary: "Contact support"
  - Secondary "Back to home"
- **NO retry CTA** (per `error_codes.retryable=false`)

**States**:
- Idle (terminal — same shape regardless of underlying reason)
- Reduced-motion
- Dark mode

### Screen 15 — Result pending (>30s)

**Layout**:

- App bar: back arrow
- Hero block:
  - Icon: clock (slate-600), large
  - Heading: "We're still verifying" (display-2)
  - Body: "MyID is taking longer than usual. We'll notify you when
    it's done — usually within a few minutes. You can leave this
    screen."
- Primary CTA: "Got it, take me home"
- Tertiary "Cancel verification" link (foundation destructive link
  variant) — opens cancel-confirm sheet

**States**:
- Idle (default)
- Cancel-confirm sheet open

## Cross-screen patterns

### App bar pattern

- Back arrow on most screens (returns user to previous step or entry
  surface)
- NO back arrow on screens 11 (submitting — transient) and 12 (success
  — celebration)
- Step chip below back arrow on screens 7, 8, 9, 10 (cues progress)

### Bottom safe-area

- Sticky-bottom CTAs respect iOS home-indicator
- Camera viewfinders (screens 8, 9, 10) extend below the home-indicator
  area but the manual capture button stays above it

### Sheet pattern (Group A)

- Half-snap on initial open
- Body scrolls if longer than half-screen height
- Action stack always sticky at the bottom of the sheet

## Localization annotations

Render each text string with its i18n key inline. Suggested keys:

```
mobile.tier-upgrade.banner.title
mobile.tier-upgrade.banner.body
mobile.tier-upgrade.banner.cta
mobile.tier-upgrade.banner.dismiss-aria
mobile.tier-upgrade.sheet.send.heading
mobile.tier-upgrade.sheet.send.body
mobile.tier-upgrade.sheet.vmc.heading
mobile.tier-upgrade.sheet.vmc.body
mobile.tier-upgrade.sheet.vmc.cta-uzcard
mobile.tier-upgrade.sheet.limit.heading
mobile.tier-upgrade.sheet.limit.body
mobile.tier-upgrade.sheet.cta-myid
mobile.tier-upgrade.sheet.cta-cancel
mobile.tier-upgrade.fullscreen.tier0.heading
mobile.tier-upgrade.fullscreen.tier0.body
mobile.tier-upgrade.fullscreen.tier0.cta
mobile.tier-upgrade.fullscreen.support-link
mobile.tier-upgrade.banner.pre-expiry.title (with {days})
mobile.tier-upgrade.banner.pre-expiry.body
mobile.tier-upgrade.banner.pre-expiry.cta
mobile.tier-upgrade.banner.expired.title
mobile.tier-upgrade.banner.expired.body
mobile.tier-upgrade.banner.expired.cta
mobile.tier-upgrade.banner.frozen-vmc.title
mobile.tier-upgrade.banner.frozen-vmc.body
mobile.tier-upgrade.banner.resume.title
mobile.tier-upgrade.banner.resume.body
mobile.tier-upgrade.banner.resume.cta
mobile.myid.consent.heading
mobile.myid.consent.value-prop.limits
mobile.myid.consent.value-prop.cards
mobile.myid.consent.value-prop.send
mobile.myid.consent.checkbox-1
mobile.myid.consent.checkbox-2
mobile.myid.consent.privacy-line
mobile.myid.consent.cta-continue
mobile.myid.consent.cta-cancel
mobile.myid.doc-front.step-chip
mobile.myid.doc-front.helper
mobile.myid.doc-front.manual-cta
mobile.myid.doc-front.manual-hint
mobile.myid.doc-front.low-light
mobile.myid.doc-front.glare
mobile.myid.doc-front.permission-denied.heading
mobile.myid.doc-front.permission-denied.body
mobile.myid.doc-front.permission-denied.cta
mobile.myid.doc-back.step-chip
mobile.myid.doc-back.helper
mobile.myid.face.step-chip
mobile.myid.face.instruction-1
mobile.myid.face.instruction-2
mobile.myid.face.instruction-3
mobile.myid.face.reduced-motion-list-heading
mobile.myid.face.reduced-motion-list-cta
mobile.myid.submitting.heading
mobile.myid.submitting.subline
mobile.myid.submitting.cancel-link
mobile.myid.submitting.cancel-confirm.heading
mobile.myid.submitting.cancel-confirm.body
mobile.myid.submitting.cancel-confirm.cta-discard
mobile.myid.submitting.cancel-confirm.cta-keep
mobile.myid.success.heading
mobile.myid.success.body
mobile.myid.success.cta-send
mobile.myid.success.cta-add-card
mobile.myid.success.cta-add-visa
mobile.myid.success.cta-back-home
mobile.myid.success.re-verify.heading
mobile.myid.failure.retryable.cta-try-again
mobile.myid.failure.retryable.cta-support
mobile.myid.failure.terminal.heading
mobile.myid.failure.terminal.body
mobile.myid.failure.terminal.cta-support
mobile.myid.pending.heading
mobile.myid.pending.body
mobile.myid.pending.cta-home
mobile.myid.pending.cta-cancel
common.errors.MYID_DOC_QUALITY.title
common.errors.MYID_DOC_QUALITY.body
common.errors.MYID_FACE_MISMATCH.title
common.errors.MYID_FACE_MISMATCH.body
common.errors.MYID_DOC_INVALID.title
common.errors.MYID_DOC_INVALID.body
common.errors.MYID_CAMERA_DENIED.title
common.errors.MYID_CAMERA_DENIED.body
common.errors.PROVIDER_UNAVAILABLE.title
common.errors.PROVIDER_UNAVAILABLE.body
```

**Longest-translation test**: render the Russian variant of the
post-expiry banner ("Срок действия проверки MyID истёк — пройдите
повторно, чтобы восстановить лимиты и разморозить карты Visa/MC") at
360pt — verify it doesn't push the "Re-verify" CTA off the right edge
or wrap to 4+ lines. If long, the body line should break before the
CTA squeezes; CTA can drop below body on narrow viewport.

## Accessibility annotations

- Tap-target sizes: every CTA ≥ 56pt; checkboxes ≥ 44pt × 44pt;
  manual capture button ≥ 80pt (large central control on camera
  screens); banner dismiss-X ≥ 44pt × 44pt
- Focus order on consent screen:
  1. Back arrow
  2. Stepper (announced as block, "Step 1 of 3")
  3. Heading
  4. Each value-prop line (or single block)
  5. Checkbox 1
  6. Checkbox 2
  7. Privacy Policy link
  8. Continue CTA
  9. Cancel
- Screen-reader labels:
  - Banner CTA: "Verify with MyID. Required to send money."
  - Stepper: "Step 1 of 3, Consent. Step 2, ID card. Step 3, Selfie.
    Currently on step 1."
  - Camera viewfinder: "ID card detection in progress. Move card into
    frame." (live region polite)
  - Auto-capture: "Capturing now" (live region; assertive — captures
    user attention so they hold still)
  - Liveness instruction changes: each new instruction announced via
    live region (assertive)
  - Result success: "Verification successful. Your tier is now Tier 2."
- Reduced-motion fallbacks:
  - Scale-in tick on success: instant
  - Auto-detect indicator pulse: static
  - Liveness sequence: list mode (all 3 instructions visible, user
    confirms manually)
  - Banner slide-in: instant
- Color-only signals removed: status icons pair color WITH icon shape
  AND text label

## Microinteractions to render

- Banner mount on home: slide-down 250ms ease-out from top (push
  content below); reduced-motion → instant
- Banner dismiss: slide-up + fade out 200ms; reduced-motion → instant
- Half-sheet open: slide-up 300ms ease-out from bottom; reduced-motion
  → instant
- Stepper progress: subtle highlight on current step; transitions
  150ms ease
- Auto-detect pulse on camera screens: 1Hz brand-toned pulse;
  reduced-motion → static
- ID-card outline corners: brief green-tone flash on stable detection
  (200ms); reduced-motion → instant
- Liveness progress ring: smooth fill animation (each segment ~33%
  fill in 600ms); reduced-motion → instant fill
- Submitting illustration: gentle pulse (1.5s, ease-in-out, infinite);
  reduced-motion → static
- Success hero tick: scale 0 → 1 in 200ms ease-out

## Output format checklist

- [ ] Single Claude.ai artefact, mobile viewport 390pt
- [ ] React + Tailwind, using foundation tokens
- [ ] Group A (6 prompt screens × all listed states) ~12 frames
- [ ] Group B (9 MyID screens × all listed states) ~30 frames
- [ ] Light + dark variants for each screen
- [ ] Reduced-motion variant of the liveness step (list mode)
- [ ] Russian-longest-translation test on post-expiry banner +
      consent screen heading
- [ ] All copy annotated with i18n keys
- [ ] Microinteractions annotated
- [ ] Accessibility focus order overlaid on consent + camera +
      submit screens
- [ ] Acceptance criteria (Gherkin) appended (extending seeds from
      both flow plans)

## Forbidden in this pass

- ❌ Exposing the underlying reason on terminal failures (per
  `error-ux.md` calm-review pattern — sanctions / under-18 / etc.
  are NEVER revealed)
- ❌ "Skip MyID" affordance — there is no skip path for the
  verification itself; only "Cancel" which discards
- ❌ Pre-checked consent boxes (consent must be explicit per
  privacy regulation)
- ❌ Showing the user's full PINFL or document number on any screen
- ❌ Persistent banner without explanation ("you should verify"
  with no value-prop body)
- ❌ Animations that race (stress) — calm pulse only on submitting
  illustration
- ❌ Selfie / liveness using rear camera (must be front camera)
- ❌ "Take a photo of your face holding your ID card" — that's not
  how MyID liveness works in v1; designs should NOT include that
  capture step

## Cross-references

- Foundation: [`../01-foundation.md`](../01-foundation.md)
- Tier-upgrade journey flow plan: [`../user-flows/flow-06-tier-upgrade.md`](../user-flows/flow-06-tier-upgrade.md)
- MyID flow plan: [`../user-flows/flow-02-myid.md`](../user-flows/flow-02-myid.md)
- KYC state machine: [`../../../docs/mermaid_schemas/kyc_state_machine.md`](../../../docs/mermaid_schemas/kyc_state_machine.md)
- Tier rules: [`../../../.claude/rules/kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md)
- Card scheme tier gating: [`../../../.claude/rules/card-schemes.md`](../../../.claude/rules/card-schemes.md)
- Error UX (calm-review pattern): [`../../../.claude/rules/error-ux.md`](../../../.claude/rules/error-ux.md)
- Localization: [`../../../.claude/rules/localization.md`](../../../.claude/rules/localization.md)
- Accessibility: [`../../../.claude/rules/accessibility.md`](../../../.claude/rules/accessibility.md)
