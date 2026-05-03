# Prompt — Send-money screens (Recipient · Amount · Review · 3DS · Submitting · Failure)

> **How to use:** open a fresh Claude.ai conversation. Paste in this order:
>
> 1. [`../00-shared-context.md`](../00-shared-context.md) (full content)
> 2. [`../01-foundation.md`](../01-foundation.md) (or rendered output)
> 3. [`../user-flows/flow-04-send-money.md`](../user-flows/flow-04-send-money.md)
> 4. This file
>
> The post-send receipt + status-watching screens are designed in a
> separate prompt: [`./07-receipt-screens.md`](./07-receipt-screens.md).

---

## What I want from this pass

Design the **send-money screen group** end to end through the SUBMIT
moment (the ack landing on `processing` is where this prompt ends; the
receipt + status timeline are in 07):

1. **Recipient picker** (Saved tab + New tab + New-recipient sub-flow)
2. **Amount entry**
3. **Review** (FX + fees + locked rate, the heart of the flow)
4. **3DS WebView** (when issuer requires)
5. **Submitting** (calm loading state)
6. **Failure** (per `error_codes`, with retry contextual to code)
7. **Tier-1 gate** (when a tier_1 user enters this flow — should
   route to upgrade BEFORE this flow renders, but design the pass-
   through gate for completeness)

Render at 390 × 844pt mobile viewport. Multiple frames per screen for
the states listed in
[`../user-flows/flow-04-send-money.md`](../user-flows/flow-04-send-money.md)
§"States to render".

## Per-screen designs

### Screen 1 — Recipient picker

**Layout** (top → bottom):

- App bar: back arrow + "Send to" heading
- Tab strip below app bar (horizontal, foundation TabBar primitive):
  "Saved" (default) | "New"
- **Saved tab content**:
  - Search input — full-width, foundation Input primitive, search
    icon leading, clear-X trailing when filled. Debounced 300ms.
    Searches across CN name, Alipay handle, WeChat ID, alias
  - Category strip (horizontal scrolling chips):
    "All" | "Favorites ⭐" | "Alipay" | "WeChat"
  - List body — virtualized list (foundation ListRow):
    - Avatar (CN-name initial or scheme icon when unnamed)
    - Title row: recipient name (CJK rendered VERBATIM — never
      transliterated per shared-context) + DestinationBadge
      (Alipay or WeChat) chip after name
    - Sub-line: alias OR Alipay handle / WeChat ID truncated to 24
      chars
    - Right-side: relative timestamp ("3 days ago"), star icon if
      `is_favorite=true`
- **New tab content** (or empty Saved state CTA):
  - Full-screen empty illustration (line-illustration of an open
    envelope or simple stylized recipient icon)
  - Heading: "Add a new recipient"
  - Sub-line: "Send to Alipay or WeChat in China"
  - Primary CTA: "Add new" → routes to step 2 (new-recipient sub-flow)
- **Empty saved state** (first-time user, never sent):
  - Same illustration as New tab
  - Heading: "No recipients yet"
  - Sub-line + primary CTA "Add new"
  - Tab strip hidden (no point showing Saved with 0 rows)

**States**:
- Idle saved — populated (3+ rows)
- Idle saved — empty (first-time)
- Idle saved — no search results ("No matches for `1234`" + Clear
  search link)
- Search debounce active (subtle skeleton overlay on the list)
- Initial mount skeleton (4 row skeletons)
- Network offline (banner at top; cached recipients still browsable)
- Server 5xx (full-screen calm error pattern with retry)
- Dark mode

### Screen 2 — New-recipient sub-flow

**Layout** (top → bottom):

- App bar: back arrow + "New recipient" heading
- Step chip: "Step 1 of 1 · Recipient details" (this is a single-step
  sub-flow, but the chip cues it as part of the broader send-money
  journey)
- Destination toggle (foundation SegmentedControl, fullWidth on mobile):
  - "Alipay" | "WeChat" — each segment shows the scheme icon
  - Required pick (radio) — neither pre-selected
- Identifier field (label changes per destination):
  - Alipay: "Phone, email, or Alipay user ID"
  - WeChat: "WeChat ID or phone"
  - Helper sub-line example per destination
  - Validation: format check inline (e.g. phone digits, email
    pattern, etc.); soft-validation (allow submit if uncertain — the
    backend RECIPIENT_INVALID error catches the real check)
- Display name field:
  - Label: "Recipient's name"
  - Sub-line: "How they'll appear in your saved recipients"
  - Max 64 chars
  - Supports CJK + Latin verbatim
- Optional alias field:
  - Label: "Alias (optional)"
  - Sub-line: "An easier nickname — e.g. 'Mom in Beijing'"
- Save toggle row (foundation ListRow with Switch):
  - "Save to my saved recipients" — default on
  - When OFF: this recipient is one-shot for this transfer; not
    persisted
- Sticky-bottom CTA: "Continue" — disabled until destination + identifier
  + name all valid

**States**:
- Idle (empty, both destinations enabled)
- Destination = Alipay (identifier label updates, examples cycle)
- Destination = WeChat (same)
- Filled valid (CTA enabled)
- Filled invalid (inline error per field)
- Loading (CTA tapped)
- Network offline (banner + WriteButton-disabled CTA)
- Dark mode

### Screen 3 — Amount entry

**Layout** (top → bottom):

- App bar: back arrow + "Send money" heading + recipient summary
  chip beneath heading (avatar + name + DestinationBadge — taps
  routes back to recipient picker step 1)
- Currency input pair:
  - Primary input: UZS amount
    - Display-1 weight, locale-aware formatting (per
      [`../../../.claude/rules/money-and-fx.md`](../../../.claude/rules/money-and-fx.md))
    - Numeric keyboard
    - Currency code "UZS" trailing
    - Sub-line: "Amount in Uzbekistan som"
  - Secondary derived display: CNY amount
    - Slate-700 muted, display-2 weight
    - Read-only
    - Currency code "CNY" trailing
    - Tap toggles "I want recipient to receive ___ CNY" mode (UZS
      becomes derived; the user types CNY)
- Below currency input pair:
  - Live FX rate row: "1 CNY = 1 404.17 UZS" + small "Today's rate"
    chip
- Tier-headroom meter card (foundation Card + 2-row meter):
  - Daily: `1 200 000 / 5 000 000 UZS` `24%`
    - Color when ≥80% used (warning-tone)
    - Sub-line: "Resets at midnight"
  - Monthly: `8 400 000 / 50 000 000 UZS` `17%`
    - Sub-line: "Resets {date}"
  - Card has slight elevation (foundation shadow-soft)
- Sticky-bottom CTA: "Continue" — disabled when:
  - amount = 0
  - amount > tier per-tx limit (with inline `LIMIT_PER_TX_EXCEEDED`
    error below the input)
  - amount > daily-headroom (with inline `LIMIT_DAILY_EXCEEDED` and
    "Split transfer" suggestion)
  - amount > monthly-headroom (with inline `LIMIT_MONTHLY_EXCEEDED`
    and "Wait until next month" suggestion)
- Below CTA: tiny line "We'll show fees + locked rate before you
  confirm." (slate-500)

**States**:
- Idle (UZS input mode, empty)
- Filled — within all limits (CTA enabled)
- Filled — over per-tx (inline error, CTA disabled, "Reduce amount"
  hint)
- Filled — over daily-headroom (inline error, "Split transfer" link
  + adjust amount or wait)
- Filled — over monthly-headroom (inline error)
- CNY input mode (UZS becomes derived)
- Rate refreshing (sub-line "Refreshing rate…", input keeps working)
- Rate stale (warning chip "Rate updated 6 min ago" with refresh
  link)
- Network offline (banner; FX rate frozen at last cached value with
  "Cached from 2 min ago" sub-line; CTA disabled with WriteButton)
- Server 5xx (rate fetch fails) — calm "Rate unavailable" with
  retry; CTA disabled until rate lands
- Dark mode

### Screen 4 — Review (the heart)

**Layout** (top → bottom):

- App bar: back arrow + "Review" heading
- Recipient summary card (foundation Card, padded, dense):
  - Avatar + name + DestinationBadge
  - "Edit" link top-right → returns to step 1 (recipient picker)
- Send-money breakdown card (canonical line set per
  [`../../../.claude/rules/money-and-fx.md`](../../../.claude/rules/money-and-fx.md)):
  ```
  You send                  5 000 000.00 UZS
  Service fee                  50 000.00 UZS  (1.0%)
  FX spread                     5 000.00 UZS
  ─────────────────────────────────────────
  Total charge              5 055 000.00 UZS
  ─────────────────────────────────────────
  Recipient gets                3 600.00 CNY
  Rate                  1 CNY = 1 404.17 UZS  (locked)
  ```
  - Each row: label left, value right
  - Total charge in display-2 weight (heavier than the rest)
  - Recipient-gets row: brand-50 surface tint (subtle)
  - Locked-rate sub-row: tabular-nums mono
- Rate-lock countdown chip below breakdown:
  - Default tone: slate, "Rate locked for 02:34"
  - ≤30s: amber tone, "Rate locked for 0:28"
  - Expired: danger tone, replaced by "Refresh rate" CTA chip
- Card picker row (foundation ListRow, taps open card-pick sheet):
  - Scheme logo on the left + masked PAN center + chevron right
  - Sub-line: "Default card" if `is_default=true`
  - International-card disclosure: when V/MC card selected, sub-line
    becomes "1.5% fee — international card" (warning-toned)
  - Tap → bottom sheet listing all `status=active` cards + "+ Add
    another card" tile at the bottom (routes to card-linking)
- Notes field (optional, max 100 chars) — collapsible:
  - "Add a note for the recipient" link + textarea on tap
- Sticky-bottom primary CTA: "Confirm and send" — bg-brand-700,
  full-width
- Below CTA: tiny disclaimer "By confirming, you agree to the locked
  rate above. The rate cannot change after you tap confirm." (slate-500)

**States**:
- Idle (rate locked >30s, CTA enabled)
- Rate locked, ≤30s (chip amber)
- Rate expired — CTA replaced with "Refresh rate" until refreshed;
  on refresh:
  - Rate within ±0.5% → silently substitute, re-arm countdown
  - Rate outside threshold → diff banner: "Rate moved — was 1404.17,
    now 1411.08 UZS / CNY" + explicit "Continue with new rate" CTA
- Rate refresh failed (`FX_STALE` from `error_codes`) — inline
  banner with retry, CTA stays disabled
- Card pick sheet open (overlay)
- Card-removed mid-session (rare) — "Selected card no longer
  available — pick another" with picker auto-opened
- International-card disclosure variant (V/MC)
- Insufficient daily headroom mid-flow (inline `LIMIT_DAILY_EXCEEDED`
  banner + "Reduce amount" link → returns to step 3)
- Network offline — CTA disabled with WriteButton tooltip; countdown
  freezes
- Sanctions-flagged recipient (rare; auto-detected pre-confirm) —
  calm "We're reviewing this transfer for compliance — we'll notify
  you within 24 hours" replacing the CTA, transfer not submitted
- Dark mode

### Screen 5 — 3DS WebView

(Same shape as 04-card-linking step 4 — the 3DS chrome is identical
across card-linking-time and send-time. Re-render per the same spec
from
[`./04-card-linking-screens.md`](./04-card-linking-screens.md).)

**States**:
- Mounting
- Active
- Cancelled (returns to step 4 with state preserved)
- Network mid-flight failure
- Timeout (>60s)

### Screen 6 — Submitting (calm loading)

**Layout**:

- Centered foundation full-screen state:
  - Illustration: paper-airplane (or similar abstract calm icon —
    designer's call, NOT scanning lines, NOT receipts)
  - Title: "Sending {amount} CNY to {name}…" (display-2)
  - Sub-line: "Status updates appear here as the transfer
    progresses." (body, slate-500)
  - Indeterminate progress strip (subtle, brand-tinted)
- **No cancel CTA** — once `processing`, the transfer cannot be
  cancelled by the user

**States**:
- Idle / active (default)
- Auto-navigates to receipt (step 8 in flow-04, designed in
  [`./07-receipt-screens.md`](./07-receipt-screens.md)) on
  `transfer.status=completed`
- Auto-navigates to step 7 (failure) on `transfer.status=failed`
- Network offline mid-submit — calm "Reconnecting…" with retry-on-
  reconnect + state-preserved
- Reduced motion — strip becomes static; airplane illustration
  doesn't animate

### Screen 7 — Failure

**Layout**:

- Top app bar: back arrow + (no title)
- Hero block:
  - Icon (per error category — see error-ux.md): warning, alert-
    circle, shield, etc.
  - Heading: localized `error_codes.message_*` (display-2)
  - Body: localized `error_codes.suggested_action_*`
- Status timeline mini (4 events, but the failure event is at the
  current step — shows what was achieved before the failure):
  - ✓ Created
  - ✓ Auth captured
  - ✗ Failed (highlighted, danger-tone)
  - ○ Sent to provider (hollow)
  - ○ Completed (hollow)
- Reference ID footer (only for `system` errors): mono with copy-
  on-click feedback
- Two stacked CTAs:
  - Primary: per `error_codes.code` and `retryable` flag
    - `CARD_DECLINED` → "Try another card" → returns to step 4
      with same amount + recipient + fresh card picker
    - `INSUFFICIENT_FUNDS` → "Try another card" + secondary "Top
      up your card"
    - `FX_STALE` → "Refresh rate" — inline at step 4 instead, this
      shouldn't land here; if it does, "Try again" returns to step 4
    - `LIMIT_*_EXCEEDED` → "Reduce amount" → returns to step 3
    - `RECIPIENT_INVALID` → "Edit recipient" → returns to step 1
    - `PROVIDER_UNAVAILABLE` → calm "We're confirming this — we'll
      notify you" + "Back to home"; NO retry (provider down is
      backend-driven recovery)
    - `SANCTIONS_HIT` → calm-review pattern: "We're reviewing this
      transfer for compliance. We'll notify you within 24 hours."
      NO retry CTA, only "Contact support"
    - `THREE_DS_FAILED` → "Try again" (returns to step 5 / 4)
  - Secondary: "Contact support"
- Tertiary "Back to home" link

**States**:
- Per error code (render at least 5 representative variants:
  CARD_DECLINED, FX_STALE, LIMIT_DAILY_EXCEEDED, PROVIDER_UNAVAILABLE,
  SANCTIONS_HIT)
- Reduced motion (icon scale-in becomes instant)
- Dark mode

### Screen 8 — Tier-1 gate (defensive)

(This screen should not normally render — flow-06 routes tier_1 users
to upgrade BEFORE the send-money flow opens. Design it as a
defensive fallback in case the gate is bypassed.)

Same shape as
[`./04-card-linking-screens.md`](./04-card-linking-screens.md) step 2
"tier-2 gate sheet" but worded for send-money:

- Heading: "Send money? Verify first."
- Body: "Verify with MyID to start sending. Phone verification only
  unlocks browsing — sending needs full identity."
- Primary CTA: "Verify with MyID"
- Tertiary "Cancel"

## Cross-screen patterns

### App bar pattern

- Back arrow left on every screen except step 6 (transient — no
  navigation)
- Heading text on screens 1, 2, 3, 4 (no heading on 5/6/7 — those
  use full-bleed centered states)
- Recipient summary chip below heading on screens 3 and 4 (taps
  return to step 1)

### Bottom safe-area

- Sticky-bottom CTAs respect iOS home-indicator (extra 16pt)
- Step 4 CTA has the disclaimer line tucked between CTA and home-
  indicator gap (~12pt)

### Keyboard handling

- Step 2 keyboards: identifier field opens with appropriate
  keyboard (numeric for phone, email for email, default for IDs)
- Step 3 keyboard: numeric for amount input
- Step 4: no keyboard (no inputs unless notes field opens)
- Step 5 (3DS WebView): keyboard is bank-controlled

### Card picker sheet

- Half-snap on initial open; can swipe to full-snap
- Scrollable list of all `status=active` cards (frozen / expired /
  removed cards NOT shown — user must unfreeze in card-mgmt)
- "+ Add another card" tile fixed at the bottom (NOT inside the
  scrollable list — always tappable)
- Tap a card → sheet dismisses, picker row updates with new selection

## Localization annotations

Render each text string with its i18n key inline. Suggested keys:

```
mobile.send.recipient.heading
mobile.send.recipient.tab.saved
mobile.send.recipient.tab.new
mobile.send.recipient.search.placeholder
mobile.send.recipient.category.all
mobile.send.recipient.category.favorites
mobile.send.recipient.empty.heading
mobile.send.recipient.empty.subline
mobile.send.recipient.empty.cta
mobile.send.new-recipient.heading
mobile.send.new-recipient.destination.alipay
mobile.send.new-recipient.destination.wechat
mobile.send.new-recipient.identifier.label.alipay
mobile.send.new-recipient.identifier.label.wechat
mobile.send.new-recipient.identifier.helper.alipay
mobile.send.new-recipient.identifier.helper.wechat
mobile.send.new-recipient.name.label
mobile.send.new-recipient.name.helper
mobile.send.new-recipient.alias.label
mobile.send.new-recipient.alias.helper
mobile.send.new-recipient.save-toggle
mobile.send.amount.heading
mobile.send.amount.uzs.label
mobile.send.amount.cny.label
mobile.send.amount.fx-row
mobile.send.amount.headroom.daily
mobile.send.amount.headroom.daily.reset-info
mobile.send.amount.headroom.monthly
mobile.send.amount.headroom.monthly.reset-info
mobile.send.amount.cta
mobile.send.amount.disclaimer
mobile.send.review.heading
mobile.send.review.recipient.edit
mobile.send.review.breakdown.you-send
mobile.send.review.breakdown.fee
mobile.send.review.breakdown.spread
mobile.send.review.breakdown.total
mobile.send.review.breakdown.recipient-gets
mobile.send.review.breakdown.rate
mobile.send.review.breakdown.rate-locked-suffix
mobile.send.review.countdown.locked (with {time})
mobile.send.review.countdown.expiring (with {time})
mobile.send.review.countdown.expired
mobile.send.review.refresh-rate.cta
mobile.send.review.rate-diff.banner (with {old} {new})
mobile.send.review.rate-diff.continue-cta
mobile.send.review.card.default-label
mobile.send.review.card.international-disclosure (with {pct})
mobile.send.review.card.add-another
mobile.send.review.notes.add-link
mobile.send.review.notes.label
mobile.send.review.cta-confirm
mobile.send.review.disclaimer
mobile.send.three-ds.title
mobile.send.three-ds.cancel
mobile.send.submitting.title (with {amount} {name})
mobile.send.submitting.subline
mobile.send.failure.timeline.created
mobile.send.failure.timeline.auth-captured
mobile.send.failure.timeline.failed
mobile.send.failure.timeline.sent-to-provider
mobile.send.failure.timeline.completed
mobile.send.failure.cta-support
mobile.send.failure.back-to-home
mobile.send.tier-gate.heading
mobile.send.tier-gate.body
common.errors.LIMIT_PER_TX_EXCEEDED.title
common.errors.LIMIT_PER_TX_EXCEEDED.body
common.errors.LIMIT_DAILY_EXCEEDED.title
common.errors.LIMIT_DAILY_EXCEEDED.body
common.errors.LIMIT_MONTHLY_EXCEEDED.title
common.errors.LIMIT_MONTHLY_EXCEEDED.body
common.errors.RECIPIENT_INVALID.title
common.errors.RECIPIENT_INVALID.body
common.errors.FX_STALE.title
common.errors.FX_STALE.body
common.errors.SANCTIONS_HIT.title
common.errors.SANCTIONS_HIT.body
common.errors.PROVIDER_UNAVAILABLE.title
common.errors.PROVIDER_UNAVAILABLE.body
```

**Longest-translation test**: render the Russian variant of the review
breakdown labels — Russian "Получатель получает" runs longer than
English "Recipient gets". Verify the breakdown card right-aligns the
amounts cleanly and that the locked-rate sub-row doesn't wrap. Same
test for the disclaimer line below the Confirm CTA.

## Accessibility annotations

- Tap-target sizes: list rows ≥ 56pt; CTAs ≥ 56pt; rate-lock chip
  44pt minimum; card picker row ≥ 64pt
- Focus order on step 4:
  1. Back arrow
  2. Recipient summary (Edit)
  3. Breakdown card (read as a single block by screen readers)
  4. Rate-lock countdown chip
  5. Card picker row
  6. Notes link (if not yet expanded)
  7. Confirm CTA
- Screen-reader labels:
  - Amount input: "Amount in Uzbekistan som, currently 5 million" —
    locale-aware number-to-speech
  - Locked rate: "Rate, 1 yuan equals 1404.17 som, locked for 2
    minutes 34 seconds" (live region for the countdown — polite,
    every 30s tick is okay; not every-second to avoid screen-reader
    chatter)
  - Headroom meter: "Daily limit, 24% used, 1.2 million of 5 million
    som" (single utterance per row)
  - Failure status timeline: each event announced with its state
    (✓/✗/○ as "completed / failed / pending")
- Reduced-motion fallbacks:
  - Submitting paper-airplane illustration: static
  - Rate-lock countdown chip: still updates every second textually,
    but no color-fade animation between tones
  - 3DS branded loading: solid spinner becomes static
  - Failure hero icon: no wobble
- Color-only signals removed: rate-lock countdown pairs color (slate
  → amber → danger) WITH icon (clock → clock-warning → clock-x) AND
  text changes ("locked for X" → "expiring in X" → "expired")

## Microinteractions to render

- Step 3: amount input live-formats with locale-aware separators
  (space/comma) as user types
- Step 3: derived CNY amount updates per-keystroke (or per-debounce
  100ms) — flickerless
- Step 4: rate-lock countdown ticks 1Hz with no jank
- Step 4: rate refresh — old rate fades, new rate fades in (200ms);
  if outside threshold, the diff banner slides down from above
  (250ms ease-out), pushing the breakdown down
- Step 4: card-pick sheet — slides up from bottom (300ms ease-out)
- Step 4: Confirm CTA on hover (touch device: on long-press) — small
  haptic feedback (no visual change)
- Step 6: paper-airplane gentle hover (4pt vertical bob, 1.5s ease-
  in-out, 2 cycles) — reduced-motion = static
- Step 7: status timeline failure event scale-in (200ms), red-X icon
  pop

## Output format checklist

- [ ] Single Claude.ai artefact, mobile viewport 390pt
- [ ] React + Tailwind, using foundation tokens
- [ ] All 8 screens × all listed states (~45 frames total — the
      failure screen alone has 5 representative error variants)
- [ ] Light + dark variants for each screen
- [ ] Russian-longest-translation test on the review breakdown
- [ ] All copy annotated with i18n keys
- [ ] Microinteractions annotated with arrows + 1-line description
- [ ] Accessibility focus order overlaid as a numbered guide on the
      review screen specifically (the densest)
- [ ] Acceptance criteria (Gherkin) appended at the end (extending
      the seeds from `flow-04-send-money.md`)

## Forbidden in this pass

- ❌ Hidden fees — every fee row in the breakdown is visible
- ❌ FX rate that floats / changes silently after Confirm tap
- ❌ Confetti / over-celebration animations
- ❌ "Cancel" CTA on the submitting screen (transfer cannot be
  user-cancelled once `processing`)
- ❌ Exposing AML / sanctions reasons in error copy (calm-review
  pattern only)
- ❌ Pre-validating recipient via aggressive provider lookup that
  shows partial PAN-like info (privacy)
- ❌ Tier-headroom meter on the home screen (lives only on amount-
  entry screen per [`./03-home-screen.md`](./03-home-screen.md))
- ❌ Visa / Mastercard branding ANYWHERE except the card picker (the
  rest of the flow stays scheme-agnostic)
- ❌ Designs that contradict
  [`../../../.claude/rules/money-and-fx.md`](../../../.claude/rules/money-and-fx.md)
  breakdown line set or display rules

## Cross-references

- Foundation: [`../01-foundation.md`](../01-foundation.md)
- Flow plan: [`../user-flows/flow-04-send-money.md`](../user-flows/flow-04-send-money.md)
- Receipt + status timeline (post-submit): [`./07-receipt-screens.md`](./07-receipt-screens.md)
- Send sequence: [`../../../docs/mermaid_schemas/transfer_send_flow.md`](../../../docs/mermaid_schemas/transfer_send_flow.md)
- State machine: [`../../../docs/mermaid_schemas/transfer_state_machine.md`](../../../docs/mermaid_schemas/transfer_state_machine.md)
- Money & FX: [`../../../.claude/rules/money-and-fx.md`](../../../.claude/rules/money-and-fx.md)
- Tier rules: [`../../../.claude/rules/kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md)
- Error UX: [`../../../.claude/rules/error-ux.md`](../../../.claude/rules/error-ux.md)
- Localization: [`../../../.claude/rules/localization.md`](../../../.claude/rules/localization.md)
- Accessibility: [`../../../.claude/rules/accessibility.md`](../../../.claude/rules/accessibility.md)
