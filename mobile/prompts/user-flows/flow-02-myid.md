# User Flow — MyID verification (tier_1 → tier_2)

> Plans the screen sequence + state machine for the MyID identity-verification
> journey that takes a phone-verified user (`tier_1`) up to fully verified
> (`tier_2`) — the only gate that unlocks transfers, Visa/Mastercard linking,
> and higher daily/monthly limits. The matching surface prompt is
> [`../surfaces/08-tier-upgrade-screens.md`](../surfaces/08-tier-upgrade-screens.md).
>
> Canonical sources of truth (do not contradict):
> - [`docs/mermaid_schemas/kyc_state_machine.md`](../../../docs/mermaid_schemas/kyc_state_machine.md)
> - [`.claude/rules/kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md)
> - [`docs/models.md`](../../../docs/models.md) — `users`, `kyc_verifications`,
>   `audit_log`
>
> No separate `myid_verification_flow.md` exists — MyID is modeled as a single
> `kyc_verifications` record with `level=myid_full`, transitioning through the
> KYC state machine (`pending → passed | failed | expired`).

## Goal

Take a `tier_1` user (phone-verified) through Uzbekistan's MyID identity
verification — consent → ID-card capture → face capture (liveness) → submit
→ provider response — and on success promote to `tier_2`. On failure, surface
a calm reason + the user's next move (retry, contact support, or accept the
terminal block).

## Out of scope (covered by other flows)

- Phone OTP onboarding ([`flow-01-onboarding.md`](./flow-01-onboarding.md))
- The home-screen banner that prompts the upgrade
  ([`flow-06-tier-upgrade.md`](./flow-06-tier-upgrade.md))
- First card-linking after upgrade ([`flow-03-card-linking.md`](./flow-03-card-linking.md))

## Prerequisites

- User is `tier_1` (phone OTP completed, `users.kyc_tier = tier_1`)
- Possesses a UZ government-issued ID card (not passport — v1 supports the
  national ID card only; passport support deferred)
- Front camera available (liveness step requires it)
- Adequate lighting (warned in advance if device sensors detect low light)

## State machine (KYC)

`tier_1` (entry) → MyID journey starts → new `kyc_verifications` row
(level=`myid_full`, status=`pending`) → MyID provider returns →
`passed` (promote `users.kyc_tier = tier_2`) | `failed` (stay at `tier_1`,
surface reason) | `expired` (rare mid-flow; usually post-completion via
TTL expiry — separate flow).

## Screen sequence

1. **Intro / consent**
   - Page heading: "Verify with MyID"
   - 3-step preview chip-row at top: `1. Consent · 2. ID card · 3. Face`
     (foundation Stepper primitive — current = step 1)
   - Body: short value-prop ("Higher limits · Send money · Add Visa or
     Mastercard later") with a tiny tier_2-icon next to each line
   - Consent block: 2 explicit checkboxes (NOT pre-checked):
     - "I consent to MyID verifying my identity using my UZ ID card and a
       photo of my face."
     - "I understand my data is handled per ZhiPay's Privacy Policy."
       (link opens an in-app sheet — out of scope for this prompt)
   - Privacy line: "Your ID card image and face photo are sent to MyID and
     never stored on this device."
   - Sticky-bottom CTA: "Continue" — disabled until both boxes checked
   - Secondary "Cancel" — returns to home; flow can be resumed later
2. **ID card — front capture**
   - Top app bar: back arrow + step indicator chip "Step 2 of 3"
   - Heading: "Front of your ID card"
   - Camera viewfinder fills the screen with a placeholder ID-card outline
     overlay (rounded rectangle aspect-ratio matching the UZ ID card)
   - Auto-capture when card is detected in-frame and stable for 800ms
     (manual capture button as fallback for low-light / older devices)
   - Helper line: "Place your ID card flat. Make sure all 4 corners are
     visible."
   - Failure-to-detect hint after 8s: "Can't detect the card? Tap to capture
     manually."
   - On capture: brief still-frame preview with retake / continue
3. **ID card — back capture**
   - Same pattern as step 2 but for the back of the card
   - Heading: "Back of your ID card"
   - Hint: "We need to read the machine-readable strip on the back."
4. **Face capture (liveness)**
   - Heading: "Take a selfie"
   - Front camera viewfinder with circular face outline
   - Liveness instructions sequence (one at a time, ~3s each):
     1. "Look straight at the camera"
     2. "Turn your head slowly to the left"
     3. "Turn your head slowly to the right"
   - Progress ring around the circle fills as each instruction is satisfied
   - On all 3 instructions captured: brief tick animation, auto-advances
   - Manual retake button always visible
   - Reduce-motion fallback: instructions appear as a numbered list, all 3
     visible at once, user taps "Done" when complete
5. **Submitting (loading)**
   - Full-screen calm loading state — branded illustration (passport stamp
     visual or similar abstract calm icon, NOT scanning lines or anything
     "surveillance-y")
   - Text: "Verifying with MyID. This usually takes under 30 seconds."
   - Progress: an indeterminate slow bar OR step pulse (stays calm, doesn't
     race)
   - Cancel link below ("This will discard your verification") — confirms in
     a sheet before discarding
6. **Result — success**
   - Hero tick (success-700, large, 200ms scale-in)
   - Heading: "You're verified."
   - Body: "Your tier is now Tier 2. You can send money, add Visa or
     Mastercard cards, and your limits are higher."
   - Tier-2 badge prominently shown (foundation TierBadge variant `tier_2`)
   - Two next-step CTAs:
     - Primary: "Send money" → routes to send-money flow
     - Secondary: "Add a card" → routes to card-linking flow
   - Tertiary "Back to home" link
7. **Result — failure (retryable)**
   - Hero icon (warning, NOT alarming red — this is recoverable)
   - Heading: per `error_codes.message_*` (e.g. `MYID_FACE_MISMATCH`)
   - Body: per `error_codes.suggested_action_*` (e.g. "The face photo
     didn't match your ID card. Try again with better lighting.")
   - Primary CTA: "Try again" → returns to step 4 (face capture) OR step 2
     (full restart) depending on the error code's hint
   - Secondary: "Contact support"
   - Tertiary "Back to home"
8. **Result — failure (terminal)**
   - Hero icon (calm warning, slate-toned)
   - Heading: "We couldn't verify your identity"
   - Body: "Please contact support to complete verification." — NEVER
     expose the underlying reason for terminal failures (sanctions,
     watchlist hits, under-18, document mismatch); per
     [`error-ux.md`](../../../.claude/rules/error-ux.md) calm-review pattern
   - Primary CTA: "Contact support"
   - Secondary "Back to home"
   - **No retry CTA.** Per `error_codes.retryable=false` rule.
9. **Result — pending (provider taking longer than 30s)**
   - Falls back from step 5 if provider hasn't responded
   - Heading: "We're still verifying"
   - Body: "MyID is taking longer than usual. We'll notify you when it's
     done — usually within a few minutes. You can leave this screen."
   - Primary CTA: "Got it, take me home"
   - Tier stays at `tier_1` until the result lands; user is notified via
     push (`notifications.type='kyc'`) on completion

## States to render (per screen)

| State | Intro | Card front | Card back | Face | Submitting | Success | Failure-retry | Failure-terminal | Pending |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Idle | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Loading | — | detecting | detecting | detecting | ✓ active | — | — | — | — |
| Error (low-light hint) | — | ✓ | ✓ | ✓ | — | — | — | — | — |
| Error (camera permission denied) | — | ✓ | ✓ | ✓ | — | — | — | — | — |
| Error (network offline) | ✓ banner | ✓ banner | ✓ banner | ✓ banner | ✓ banner + hold | — | — | — | — |
| Error (provider 5xx) | — | — | — | — | falls back to ✓ retry | — | — | — | — |
| Reduced-motion variant | — | — | — | ✓ list-mode | — | — | — | — | — |

## Error states (sourced from `error_codes`)

- Camera permission denied → `MYID_CAMERA_DENIED` (or platform-equivalent
  inline copy that routes the user to OS settings)
- Document image quality fail (blur / glare / cropped) → `MYID_DOC_QUALITY`
  retryable inline at step 2 / 3 with auto-rerun guidance
- Face/document mismatch → `MYID_FACE_MISMATCH` retryable
- Document not recognised → `MYID_DOC_INVALID` (rare — most likely user
  scanned a passport instead of ID card) retryable with a clarifying line
- Provider unavailable → `PROVIDER_UNAVAILABLE` calm "We're confirming this"
  pattern; user can retry
- Sanctions / watchlist hit → terminal, `SANCTIONS_HIT` calm-review pattern,
  no retry, no reason exposed
- Under-18 detected → terminal, generic "We couldn't verify your identity"
  message; never reveal the underlying age check
- KYC already passed (idempotent re-entry) → silently skip to success
  screen, no error

## Edge cases to surface in the design

- User backgrounds the app during step 2/3/4 → on return, viewfinder
  re-initializes; captured stills before background-event are preserved
  for 5min then expire (security)
- User backgrounds during step 5 (submitting) → notification fires when
  provider responds; tapping the notification deep-links to the result
  screen
- Network goes offline during step 5 → retry-on-reconnect with calm
  "Reconnecting…" line; if still offline after 30s, stash the submission
  state and let the user resume later
- User cancels mid-flow → all captured stills are discarded immediately
  (privacy invariant); intro screen on next entry shows the same step-1
  consent (no resume mid-flow)
- User attempts MyID while already `tier_2` (e.g. re-verifying after
  expiry) → flow proceeds normally; result success-screen wording adjusts
  to "You're re-verified"
- Device camera missing / mocked (emulator) → graceful fail with "We need
  a camera to verify your identity" + Contact support fallback

## Acceptance criteria (Gherkin fragments)

```
GIVEN  user.kyc_tier = tier_1
AND    user has tapped "Verify with MyID" from the home banner
WHEN   user completes consent + ID card front + ID card back + face
       capture
AND    submits the verification
AND    MyID provider returns passed within 30s
THEN   new kyc_verifications row created (level=myid_full, status=passed,
       expires_at = now() + interval per tier policy)
AND    users.kyc_tier transitions tier_1 → tier_2
AND    success screen renders with tier_2 badge + next-step CTAs
AND    notifications row inserted (type=compliance, message localized)

GIVEN  MyID returns failed with retryable=true
WHEN   the failure screen renders
THEN   primary CTA "Try again" returns to the appropriate step
AND    no users.kyc_tier change
AND    failed kyc_verifications row preserved (forensic; user can re-attempt
       which creates a NEW row, never overwriting the prior one)

GIVEN  MyID returns failed with retryable=false (sanctions / watchlist /
       under-18 / document mismatch)
WHEN   the failure screen renders
THEN   no retry CTA
AND    no underlying reason in the body copy
AND    only "Contact support" CTA present
AND    failed kyc_verifications row preserved
```

Full AC lives in `mobile/prompts/surfaces/08-tier-upgrade-screens.md` once
the designs land.

## Telemetry to consider (for the design — visualise where events fire)

- `myid.intro.view`
- `myid.consent.tap` (with both checkboxes confirmed)
- `myid.doc-front.capture` (auto vs manual, attempt #)
- `myid.doc-back.capture`
- `myid.face.start`
- `myid.face.complete` (with liveness pass count)
- `myid.submit` (provider request fired)
- `myid.result.success`
- `myid.result.failed.retryable` (with `error_code`)
- `myid.result.failed.terminal` (with `error_code`)
- `myid.result.pending` (provider >30s)
- `myid.cancel` (with step at cancel time)

## Cross-references

- KYC state machine: [`docs/mermaid_schemas/kyc_state_machine.md`](../../../docs/mermaid_schemas/kyc_state_machine.md)
- Tier rules: [`.claude/rules/kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md)
- Error UX (sanctions calm-review pattern): [`.claude/rules/error-ux.md`](../../../.claude/rules/error-ux.md)
- Localization: [`.claude/rules/localization.md`](../../../.claude/rules/localization.md)
- Accessibility (camera + reduced motion): [`.claude/rules/accessibility.md`](../../../.claude/rules/accessibility.md)
- Surface design prompt: [`../surfaces/08-tier-upgrade-screens.md`](../surfaces/08-tier-upgrade-screens.md)
- Tier-upgrade journey wrapper: [`./flow-06-tier-upgrade.md`](./flow-06-tier-upgrade.md)
