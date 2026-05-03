# Prompt — Card linking screens (Scheme picker · Tier-2 gate · Details · 3DS · Result)

> **How to use:** open a fresh Claude.ai conversation. Paste in this order:
>
> 1. [`../00-shared-context.md`](../00-shared-context.md) (full content)
> 2. [`../01-foundation.md`](../01-foundation.md) (or its rendered output)
> 3. [`../user-flows/flow-03-card-linking.md`](../user-flows/flow-03-card-linking.md)
> 4. This file
>
> Claude will respond with a single hi-fi rendered React + Tailwind
> artefact showing every screen + every state.

---

## What I want from this pass

Design the **card-linking screen group** end to end:

1. **Scheme picker** — 4 tiles (UzCard / Humo / Visa / Mastercard)
2. **Tier-2 gate sheet** — surfaced when tier_1 taps Visa / Mastercard
3. **Card details entry** — PAN / cardholder / expiry / CVV
4. **3DS WebView** — issuer challenge handover
5. **Linking (loading)** — brief calm state during backend write
6. **Result success** — masked card preview + next-step CTAs
7. **Result failure** — sourced from `error_codes`
8. **Max-cards-reached gate** — when user is at the cap

Render each screen at 390 × 844pt mobile viewport. Multiple frames per
screen for the states listed in
[`../user-flows/flow-03-card-linking.md`](../user-flows/flow-03-card-linking.md)
§"States to render".

## Per-screen designs

### Screen 1 — Scheme picker

**Layout** (top → bottom):

- App bar: back arrow left + "Add a card" heading
- Step indicator chip below heading: "Step 1 of 2 · Choose card type"
  (foundation Stepper primitive variant)
- Sub-heading: "Which card do you want to add?" (display-2)
- Body line: "We support these cards in Uzbekistan." (slate-500)
- 4-tile grid (2 × 2, foundation Card primitive):
  - Each tile is ~160pt square
  - Scheme logo centered, 80% of tile width max
  - Scheme name below logo (body, slate-900)
  - Tap → scheme details OR tier-gate sheet
- Tier-1 user: Visa + Mastercard tiles render with:
  - Subtle warning-tone overlay (warning-50 surface tint, NOT
    danger — this is a soft block)
  - Small lock chip top-right corner ("MyID required" — body small)
- Footer link: "Why don't I see my bank?" → opens an in-app help
  sheet (out of scope this pass; placeholder)

**States**:
- Idle — tier_1 (UzCard / Humo enabled, V/MC lock-tone)
- Idle — tier_2 (all 4 tiles enabled equally)
- Idle — tier_2-expired (UzCard / Humo enabled, V/MC lock-tone with
  same chip as tier_1)
- Max-cards-reached — top of screen shows banner "You've reached the
  card limit. Remove a card first." + tiles dimmed; tap any tile
  shows the same banner (NOT a sheet — one route fits all)

### Screen 2 — Tier-2 gate sheet

**Layout** (half-sheet, foundation Sheet primitive at half-snap):

- Sheet handle at top
- Hero icon: shield (lucide) in warning tone, large
- Heading: "Visa & Mastercard need full verification" (display-3,
  slate-900)
- Body: "Verify with MyID to add Visa or Mastercard cards. UzCard
  and Humo work right now." (body, slate-700)
- Two stacked CTAs:
  - Primary "Verify with MyID" → routes to MyID flow
  - Secondary "Use UzCard or Humo instead" → returns to scheme picker
- Tertiary "Cancel" / dismiss-X (top-right of sheet)

**States**:
- Idle (default)
- Network offline (banner inside the sheet at the top)

### Screen 3 — Card details entry

**Layout** (top → bottom):

- App bar: back arrow + "Step 2 of 2 · Card details"
- Page heading: "{Scheme name} card" (display-2) — e.g. "UzCard
  card" / "Visa card"
- Scheme logo small chip below heading (decorative confirmation of
  pick)
- PAN field:
  - Label: "Card number"
  - Numeric keyboard input
  - Auto-spacing every 4 digits (`4242 4242 4242 4242`)
  - Scheme-logo overlays the right edge of the input as the user
    types (BIN detection); on mismatch with picked scheme, helper
    line in danger-700: "This looks like a {detected scheme} card.
    Go back and choose {detected scheme}?"
- Cardholder name field:
  - Label: "Cardholder name"
  - Visible for all schemes
  - Required for Visa / MC (per scheme rules); optional for UzCard /
    Humo (issuer binds)
  - Helper sub-line: "As printed on the card"
- Expiry MM/YY field:
  - Label: "Expiry"
  - Mask `12/27`
  - Numeric keyboard
- CVV field:
  - Label: "CVV" (or "CVC" for Mastercard variants)
  - 3 or 4 digits depending on scheme
  - Masked dot input (foundation Input variant)
  - Tooltip icon trailing: tap shows "Where do I find this? — 3
    digits on the back of UzCard / Humo / Visa; 3 digits on the back
    of Mastercard"
- Privacy line: "Your card details are sent securely. We never store
  your full card number or CVV." (slate-500, body small)
- Sticky-bottom CTA: "Continue" — disabled until all fields valid;
  enabled state brand-700; offline-disabled state with WriteButton
  tooltip pattern

**States**:
- Idle (empty)
- Filled (all valid → CTA enabled)
- Filled invalid PAN (Luhn fail) — inline error below PAN field
- Filled invalid expiry (past date) — inline error below expiry
- Filled invalid CVV (length wrong for scheme) — inline error below
  CVV
- Scheme mismatch (BIN says Visa but user picked UzCard) — helper
  line in PAN field, CTA disabled
- Loading (CTA tapped) — spinner replaces label, button stays at
  full size to prevent layout jump
- Offline banner at top
- Server 5xx (banner: localized `error_codes.PROVIDER_UNAVAILABLE`)
- Dark mode (full re-render)

### Screen 4 — 3DS WebView

**Layout**:

- App bar: "Verifying with your bank" + visible "Cancel" button
  right (returns to step 3 with all fields preserved)
- Below app bar: branded loading state (during the brief moment
  before the WebView mounts) — small ZhiPay shield + spinner +
  "Connecting to your bank…"
- WebView fills the rest of the screen below
- Bottom strip (always visible above the WebView): tiny "Powered by
  {scheme name}" + lock icon — security signal

**States**:
- Mounting (branded loading state above)
- Active (WebView visible, user is inside the bank's challenge UI)
- Returning (WebView dismissed, brief "Confirming…" state — fades
  into screen 5)
- User-cancelled (back to screen 3 with state preserved)
- Network mid-flight failure → calm "Reconnecting…" with retry-on-
  reconnect; cancel always returns to screen 3
- Timeout (>60s in WebView with no response) → falls through to
  screen 7 with `error_codes.THREE_DS_TIMEOUT`

### Screen 5 — Linking (loading)

**Layout**:

- Centered foundation full-screen state component (matches admin's
  SystemStateLayout pattern but with mobile sizing):
  - Large illustration: card icon being attached to a board (or a
    similar abstract calm icon — designer's call)
  - Title: "Linking your card…" (display-2)
  - Sub-line: "Just a moment." (body, slate-500)
  - Indeterminate progress strip (subtle, brand-tinted; honors
    reduced-motion)
- No buttons (this is a transient state, ≤2s typical)

**States**:
- Idle / active (default)

### Screen 6 — Result: success

**Layout**:

- Top app bar: nothing (this is celebration; minimal chrome)
- Hero block:
  - Tick icon (success-700, large, scale-in animation 200ms ease-out)
  - Heading: "Card linked" (display-1)
  - Sub-line: "You can now send money with this card." (body)
- Card preview (foundation card-as-object component, full-width minus
  24pt margins, ~200pt tall):
  - Scheme logo top-left
  - Masked PAN center, mono, display-2 (`4242 42•• •••• 4242`)
  - Expiry + cardholder bottom
- "Set as default" toggle row (foundation ListRow with Switch
  trailing):
  - Visible if user has 2+ cards now; disabled with "First card is
    automatically your default" tooltip if this is the user's first
    card (toggle pre-checked + disabled)
- Two next-step CTAs (sticky-bottom):
  - Primary: "Send money" (visible only if user is `tier_2` and has
    sufficient daily headroom)
  - Secondary: "Add another card" (visible if user under `max_cards`
    cap)
- Tertiary "Done" link (centered below buttons) → returns to entry
  surface

**States**:
- Idle (default — first-card variant: "Set as default" toggle pre-
  checked + disabled)
- Idle (default — N-th card variant: toggle interactable)
- Tier-1 user post-link (rare — user just linked UzCard / Humo at
  tier_1; "Send money" CTA hidden, "Add another card" + "Done"
  visible — the upgrade banner on home will continue to surface)
- Reduced motion: scale-in tick → instant
- Dark mode

### Screen 7 — Result: failure

**Layout**:

- Top app bar: back arrow + (no title)
- Hero block (matches success but with calm warning tone):
  - Icon (per error category — see error-ux.md): warning for
    `acquiring` / `system`; shield for `compliance`; alert-circle
    for generic
  - Heading: localized `error_codes.message_*` (display-2)
  - Body: localized `error_codes.suggested_action_*`
- Reference ID footer (only for `system` category errors): mono
  reference id `8a7c-2f1e` with copy-on-click feedback (matches
  admin's Phase 14 useCopyFeedback pattern)
- Two stacked CTAs:
  - Primary: per `retryable` flag
    - retryable=true: "Try again" → returns to step 3 with PAN /
      expiry / CVV cleared, scheme retained
    - retryable=false (e.g. CARD_DUPLICATE): "Choose a different
      card" → returns to scheme picker
  - Secondary: "Contact support"
- Tertiary "Cancel" link (returns to entry surface)

**States**:
- Per error code (CARD_DECLINED, INSUFFICIENT_FUNDS, THREE_DS_TIMEOUT,
  THREE_DS_FAILED, ISSUER_UNAVAILABLE, CARD_DUPLICATE) — render at
  least 3 representative variants
- Reduced motion (icon scale-in becomes instant)
- Dark mode

### Screen 8 — Max-cards-reached gate

**Layout** (centered foundation full-screen state):

- Icon: stack of cards (lucide `wallet` or similar)
- Heading: "You've reached the card limit"
- Body: "Tier {1|2} accounts can have {2|5} cards. Remove a card to
  add a new one."
- Primary CTA: "Manage cards" → routes to card-management
- Secondary "Cancel" / back

**States**:
- Tier_1 variant ("2 cards max")
- Tier_2 variant ("5 cards max")
- Reduced motion (no animation needed)
- Dark mode

## Cross-screen patterns

### App bar pattern

- Back arrow left for steps 1, 3, 4, 7
- "Cancel" button right for step 4 (3DS WebView — replaces back arrow)
- No app bar on step 5 (transient) and step 6 (success — minimal
  chrome)
- Heading text on steps 1 and 3 (with step indicator chip below)
- Wordmark / scheme-logo never on step 4 (don't compete with bank
  chrome)

### Bottom safe-area

- Sticky-bottom primary CTAs respect iOS home-indicator (extra 16pt)
- Step 6's two stacked CTAs have a 12pt gap between them

### Keyboard handling

- Step 3 keyboard auto-shows on PAN field mount
- Step 3 numeric keyboard for PAN / expiry / CVV; standard for
  cardholder name
- Step 3 primary CTA stays visible above the keyboard (typical RN /
  Flutter keyboard-avoiding-view behavior)

## Localization annotations

Render each text string with its i18n key inline. Suggested keys:

```
mobile.card-linking.scheme-picker.heading
mobile.card-linking.scheme-picker.subline
mobile.card-linking.scheme-picker.tile.uzcard
mobile.card-linking.scheme-picker.tile.humo
mobile.card-linking.scheme-picker.tile.visa
mobile.card-linking.scheme-picker.tile.mastercard
mobile.card-linking.scheme-picker.locked-chip
mobile.card-linking.scheme-picker.help-link
mobile.card-linking.tier-gate.heading
mobile.card-linking.tier-gate.body
mobile.card-linking.tier-gate.cta-myid
mobile.card-linking.tier-gate.cta-uzcard-humo
mobile.card-linking.details.heading (with {scheme} placeholder)
mobile.card-linking.details.pan.label
mobile.card-linking.details.pan.scheme-mismatch (with {detected})
mobile.card-linking.details.cardholder.label
mobile.card-linking.details.cardholder.helper
mobile.card-linking.details.expiry.label
mobile.card-linking.details.cvv.label.uzcard
mobile.card-linking.details.cvv.label.humo
mobile.card-linking.details.cvv.label.visa
mobile.card-linking.details.cvv.label.mastercard
mobile.card-linking.details.cvv.tooltip
mobile.card-linking.details.privacy
mobile.card-linking.details.cta-continue
mobile.card-linking.three-ds.title
mobile.card-linking.three-ds.cancel
mobile.card-linking.three-ds.connecting
mobile.card-linking.three-ds.powered-by
mobile.card-linking.linking.title
mobile.card-linking.linking.subline
mobile.card-linking.success.heading
mobile.card-linking.success.subline
mobile.card-linking.success.set-default-toggle
mobile.card-linking.success.set-default-tooltip-first-card
mobile.card-linking.success.cta-send
mobile.card-linking.success.cta-add-another
mobile.card-linking.success.cta-done
mobile.card-linking.failure.cta-retry
mobile.card-linking.failure.cta-different-card
mobile.card-linking.failure.cta-support
mobile.card-linking.max-cards.heading
mobile.card-linking.max-cards.body (with {max} placeholder)
mobile.card-linking.max-cards.cta
common.errors.CARD_DECLINED.title
common.errors.CARD_DECLINED.body
common.errors.INSUFFICIENT_FUNDS.title
common.errors.INSUFFICIENT_FUNDS.body
common.errors.THREE_DS_TIMEOUT.title
common.errors.THREE_DS_TIMEOUT.body
common.errors.THREE_DS_FAILED.title
common.errors.THREE_DS_FAILED.body
common.errors.ISSUER_UNAVAILABLE.title
common.errors.ISSUER_UNAVAILABLE.body
common.errors.CARD_DUPLICATE.title
common.errors.CARD_DUPLICATE.body
common.errors.CARD_CAP_REACHED.title
common.errors.CARD_CAP_REACHED.body
```

**Longest-translation test**: render the Russian variant of the tier-
gate body ("Подтвердите личность через MyID, чтобы добавить карты Visa
или Mastercard. Карты UzCard и Humo работают сейчас.") at the default
viewport — verify the sheet height grows to accommodate the body
without crushing the CTAs. The sheet should support a scrollable body
if needed (handle stays at top, CTAs stay sticky-bottom).

## Accessibility annotations

- Tap-target sizes: scheme tiles ≥ 88pt × 88pt; CTAs ≥ 56pt tall;
  CVV tooltip icon hit-area ≥ 44pt × 44pt even though the icon is
  smaller
- Focus order on step 3:
  1. Back arrow
  2. PAN
  3. Cardholder
  4. Expiry
  5. CVV
  6. Privacy line (decorative — skip)
  7. Continue CTA
- Screen-reader labels:
  - PAN field: "Card number, 16 digits, currently empty" (after
    typing: "Card number, currently 4242, 1234, 5678, 9012")
  - **NEVER read out the full PAN aloud** — when reading the masked
    PAN preview on screen 6, screen reader should announce "Card
    ending in 4242" (NOT the full digit sequence)
  - CVV field: announces label only — value is masked dots, never
    announced
  - 3DS WebView: announces "Verifying with your bank — challenge in
    progress" on mount; user inside WebView gets the bank's own
    accessibility surface
- Reduced-motion fallback: scale-in tick on success screen → instant;
  3DS branded-loading spinner → solid (no spin)

## Microinteractions to render

- PAN field auto-spacing: every 4th digit triggers a tiny brief
  expansion (just space-character insertion, no animation)
- Scheme-logo overlay slide-in on PAN field as BIN is detected
  (fade + slight slide from right, 200ms)
- "Set as default" toggle on screen 6: smooth slide of the knob (300ms
  ease-out), color transition slate → brand
- Step 6 hero tick: scale-in 200ms ease-out
- Step 6 next-step CTAs: stagger-fade-in 250ms after tick lands
- Step 7 hero icon: gentle wobble (15° rotation each side, 1 cycle,
  300ms total) — honors reduced-motion → instant

## Output format checklist

- [ ] Single Claude.ai artefact, mobile viewport 390pt
- [ ] React + Tailwind, using foundation tokens
- [ ] All 8 screens × all listed states (~30 frames total)
- [ ] Light + dark variants for each screen
- [ ] Russian-longest-translation test frame on the tier-gate sheet
- [ ] All copy annotated with i18n keys
- [ ] Microinteractions annotated with arrows + 1-line description
- [ ] Accessibility focus order overlaid as a numbered guide
- [ ] Acceptance criteria (Gherkin) appended at the end (extending
      the seeds from `flow-03-card-linking.md`)

## Forbidden in this pass

- ❌ Showing the full PAN at any point (success screen masked PAN
  only, per [`.claude/rules/card-schemes.md`](../../../.claude/rules/card-schemes.md))
- ❌ Echoing the CVV anywhere (mask only)
- ❌ Generic credit-card icon when the scheme is known (use the
  scheme-specific logo per primitive)
- ❌ Bank-chrome WebView with no ZhiPay framing (always wrap with
  step 4's app bar + return affordance)
- ❌ Confetti / celebration animation beyond the calm scale-in tick
- ❌ "Edit card" affordance on success or any future screen — PAN
  cannot be edited; remove + re-add only

## Cross-references

- Foundation tokens + primitives: [`../01-foundation.md`](../01-foundation.md)
- Flow plan: [`../user-flows/flow-03-card-linking.md`](../user-flows/flow-03-card-linking.md)
- Card linking sequence: [`../../../docs/mermaid_schemas/card_linking_flow.md`](../../../docs/mermaid_schemas/card_linking_flow.md)
- Card state machine: [`../../../docs/mermaid_schemas/card_state_machine.md`](../../../docs/mermaid_schemas/card_state_machine.md)
- Card scheme rules (PAN masking, 3DS, tier gating): [`../../../.claude/rules/card-schemes.md`](../../../.claude/rules/card-schemes.md)
- Tier rules: [`../../../.claude/rules/kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md)
- Error UX: [`../../../.claude/rules/error-ux.md`](../../../.claude/rules/error-ux.md)
- Localization: [`../../../.claude/rules/localization.md`](../../../.claude/rules/localization.md)
- Accessibility: [`../../../.claude/rules/accessibility.md`](../../../.claude/rules/accessibility.md)
