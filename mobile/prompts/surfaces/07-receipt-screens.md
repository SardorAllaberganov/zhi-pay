# Prompt — Receipt screens (Hero · Status timeline · Action row · Share / Download)

> **How to use:** open a fresh Claude.ai conversation. Paste in this order:
>
> 1. [`../00-shared-context.md`](../00-shared-context.md) (full content)
> 2. [`../01-foundation.md`](../01-foundation.md) (or rendered output)
> 3. [`../user-flows/flow-04-send-money.md`](../user-flows/flow-04-send-money.md)
>    (the receipt is the post-submit landing of this flow; it's also re-
>    used by [`../user-flows/flow-05-history.md`](../user-flows/flow-05-history.md))
> 4. This file
>
> The receipt component designed here is **the same component** that
> History detail re-mounts in read-only mode. Render it as a single
> shared component with two entry contexts (post-send and history).

---

## What I want from this pass

Design the **receipt component** end to end, with both entry contexts:

1. **Post-send receipt** — first mount immediately after a successful
   transfer. Celebrates calmly, shows the locked rate immutable, action
   row primarily forward-momentum CTAs ("Send again", "Share").
2. **History detail receipt** — re-mount of the same component when
   the user revisits an old transfer. Action row tilts slightly
   different (Send again is still primary, but Share / Download /
   Copy ID are equal-weight tertiaries).
3. **Live-status receipt** (transfer in `processing`) — same component
   but the timeline animates as events arrive
4. **Failed receipt** — failure block + status timeline showing the
   failure point + retry CTAs per `error_codes.code`
5. **Reversed receipt** — reversal banner + completed timeline +
   appended ✗ Reversed event

Render at 390 × 844pt mobile viewport. Multiple frames per state.

## Per-section designs (single screen, multiple sections)

### Section 1 — Status hero block (top)

**Layout** (top → bottom):

- App bar:
  - Post-send mount: NO back arrow — the user can't navigate "back" to
    the in-flight submitting state. Closes via a "Done" link top-right
    that lands on home.
  - History mount: back arrow + transfer-id chip mono (tap-to-copy
    with `useCopyFeedback` pattern from admin's Phase 14 — `Copy →
    Check` icon swap with `text-success-700` flip for 1.5s)
- Status icon (large, 80–96pt):
  - Completed → success-700 tick (scale-in 200ms ease-out post-send;
    static on history mount)
  - Processing → brand-600 spinning circle (subtle, 1Hz; honors
    reduced-motion → static)
  - Failed → danger-600 X-in-circle (scale-in 200ms post-send; static
    on history)
  - Reversed → warning-600 reverse-arrow icon (static)
- Heading:
  - Completed: "Sent" (display-1)
  - Processing: "Sending…" (display-1)
  - Failed: localized `error_codes.message_*` (display-2 — failure
    text typically longer)
  - Reversed: "Transfer reversed" (display-1)
- Hero amount:
  - Completed: large CNY amount (`3 600.00 CNY`, display-1, mono);
    sub-line slate-500 "(from 5 055 000.00 UZS)"
  - Processing: same as completed but with sub-line "Recipient gets
    when complete"
  - Failed: large UZS amount (`5 055 000.00 UZS`, display-1, mono);
    sub-line "Was attempting to send 3 600.00 CNY"
  - Reversed: large UZS amount (refunded back) with sub-line "Refunded
    to your card"
- Sent-on row (history mount only): "Sent on Apr 30, 2026 at 3:26 PM"
  (locale-aware date format, body small, slate-500)

**States**:
- Completed
- Processing (in-flight)
- Failed (per representative `error_codes` codes — at least 3)
- Reversed
- Reduced motion (no scale-in icon)
- Dark mode

### Section 2 — Status timeline

**Layout**:

- Foundation StatusTimeline primitive, mobile variant (canonical pattern
  per [`../../../.claude/rules/status-machines.md`](../../../.claude/rules/status-machines.md))
- Marker column: filled circle = past, ring = current, hollow = future
- Lines between events: solid for past-to-past, dashed for current-to-
  theoretical-next
- Per event row:
  - Marker circle
  - Event label (e.g. "Created", "Auth captured", "Sent to Alipay",
    "Completed")
  - Timestamp (locale-aware: `15:26` for uz/ru, `3:26 PM` for en)
  - Actor sub-line ("by you" / "by system" / "by provider" / "by
    admin")
- For `completed` transfers, all 4 events shown solid:
  1. ✓ Created
  2. ✓ Auth captured
  3. ✓ Sent to {Alipay|WeChat}
  4. ✓ Completed
- For `processing` (in-flight): events progressed are solid; current
  event is the ring marker; future events are hollow circles with
  dashed connector lines above
- For `failed`: events progressed are solid; the failure event is a
  danger-tone filled circle with a localized `error_codes.message_*`
  body line; subsequent events render hollow
- For `reversed`: full completed timeline + appended danger-tone ✗
  Reversed event with reversal timestamp

**States**:
- Completed (4 solid)
- Processing — auth captured (2 solid + 1 ring + 2 hollow)
- Processing — sent to provider (3 solid + 1 ring + 1 hollow)
- Processing — stuck >5 min (warning sub-line on the current event:
  "Confirming with provider — usually under a minute")
- Failed at auth (1 solid + 1 danger event + rest hollow)
- Failed at provider (3 solid + 1 danger event + rest hollow)
- Reversed (4 solid + 1 appended danger)
- Reduced motion (event scale-in becomes instant)

### Section 3 — Failure block (only when status=failed)

**Layout**:

- Foundation Card primitive, danger-tinted left border (4pt) + slate-50
  surface tint
- Heading row: localized `error_codes.message_*` + small icon (matches
  status hero icon)
- Body: localized `error_codes.suggested_action_*`
- Ref-id sub-line (only for `system` category): mono `8a7c-2f1e` with
  copy-on-click feedback
- Per `error_codes.code` and `retryable` flag, primary CTA varies:
  - `CARD_DECLINED` → "Try another card" (returns to send-money review
    with same amount + recipient + fresh card picker)
  - `INSUFFICIENT_FUNDS` → "Try another card" (primary) + "Top up your
    card" (secondary)
  - `LIMIT_DAILY_EXCEEDED` → "Reduce amount" (returns to amount entry)
  - `LIMIT_PER_TX_EXCEEDED` → "Split transfer" (returns to amount
    entry, halved suggestion)
  - `RECIPIENT_INVALID` → "Edit recipient" (returns to recipient
    picker)
  - `PROVIDER_UNAVAILABLE` → calm "Try again" + "Back to home"
  - `SANCTIONS_HIT` → calm-review pattern, NO retry CTA, only
    "Contact support"
  - `THREE_DS_FAILED` → "Try again"

**States**:
- Per representative error code (≥5 variants)

### Section 4 — Reversal block (only when status=reversed)

**Layout**:

- Foundation Card primitive, warning-tinted left border + warning-50
  surface tint
- Icon: refund / reverse-arrow icon (lucide)
- Heading: "Transfer reversed"
- Body: "Reversed on Apr 30, 2026 at 4:13 PM — full amount refunded to
  your card."
- Card masked PAN row (linked-style — taps route to card-mgmt detail)
- Tertiary "Why was this reversed?" link → opens an in-app help sheet
  (out of scope this pass; placeholder)

**States**:
- Idle
- Help link tapped (placeholder sheet)

### Section 5 — Recipient summary

**Layout**:

- Foundation Card, dense
- Avatar + name (CJK rendered verbatim) + DestinationBadge
- Sub-line: handle / WeChat ID truncated to 24 chars
- Tap → routes to recipient detail (out of scope this pass — there's
  no separate recipient-management surface in v1; tap could route to
  history filtered by this recipient as a fallback)

**States**:
- Idle
- Long name (CJK 6 chars) — verify wrapping
- Long Latin alias — verify truncation

### Section 6 — Card used summary

**Layout**:

- Foundation Card, dense
- Scheme logo + masked PAN center (mono, body) + cardholder
- "View card" link tap → routes to card-mgmt detail for this card

**States**:
- Idle
- Card now removed (status=removed) — banner inside the card "This
  card was removed after this transfer" + tap-disabled

### Section 7 — Locked rate + fee breakdown (collapsible)

**Layout**:

- Foundation Card, foundation Collapsible primitive
- Default state: collapsed; chip "View rate + fees" with chevron
- Expanded state: full canonical send-money breakdown line set per
  [`../../../.claude/rules/money-and-fx.md`](../../../.claude/rules/money-and-fx.md):
  ```
  You sent                  5 000 000.00 UZS
  Service fee                  50 000.00 UZS  (1.0%)
  FX spread                     5 000.00 UZS
  ─────────────────────────────────────────
  Total charge              5 055 000.00 UZS
  ─────────────────────────────────────────
  Recipient got                 3 600.00 CNY
  Rate                  1 CNY = 1 404.17 UZS  (locked)
  ```
  - Note tense shift: "You sent" / "Recipient got" (past tense for
    completed/reversed; "You're sending" / "Recipient gets" for
    processing); for failed: "Was sending" / "Was to receive"
- Locked rate row: `(locked)` suffix in slate-500 — emphasizes
  immutability per `money-and-fx.md` rule

**States**:
- Collapsed
- Expanded
- Per tense (completed / processing / failed / reversed)

### Section 8 — Notes block (only when user added a note)

**Layout**:

- Foundation Card, dense
- Heading: "Your note"
- Body: the note content (max 100 chars)

**States**:
- Idle
- Hidden (no note attached — section absent)

### Section 9 — Action row (sticky-bottom)

**Layout**:

- Foundation ActionBar primitive, mobile variant (canonical pattern
  matching admin's Phase 14 fixed-bottom — `fixed inset-x-0 bottom-0`
  overlay equivalent for mobile)
- Post-send mount:
  - Primary "Send again" (full-width-leaning) → routes to send-money
    flow with this recipient + amount pre-filled
  - Secondary "Share receipt" → opens share sheet (PDF or PNG)
  - Tertiary "Done" link below buttons → routes to home
- History mount:
  - Primary "Send again" (full-width-leaning) → same routing as post-
    send
  - Secondary "Share receipt"
  - Tertiary "Download receipt" → saves PDF to device
  - Tertiary "Copy transfer ID" — copy-feedback pattern
- Failed (any mount):
  - Primary CTA per `error_codes.code` (see Section 3)
  - Secondary "Contact support"
  - Tertiary "Back to home" / "Back to History"
- `SANCTIONS_HIT`-failed:
  - "Send again" attempt → soft-block sheet "Please wait while we
    review your previous transfer."
  - Action row primary: "Contact support" (NO Send again)

**States**:
- Post-send completed
- Post-send processing (Send-again + Done; Share visible but disabled
  with tooltip "Available when complete")
- Post-send failed (per error code)
- History completed
- History processing
- History failed (per error code)
- History reversed
- Reduced motion (no slide-in on mount)

## Cross-screen patterns

### App bar pattern

- Post-send: "Done" top-right link (NOT a back arrow)
- History: back arrow left + transfer-id chip mono
- Live-processing post-send: NO close affordance during the first 30s
  (let the user see the live updates); after 30s, "Done" link appears

### Bottom safe-area

- Action bar respects iOS home-indicator (extra 16pt padding)

### Pull-to-refresh

- Live-processing receipt: pull-to-refresh on the screen → polls for
  updated status (in case the auto-poll missed an update); honors
  reduced-motion (instant refetch)

### Share / download flows

- Share sheet: opens native iOS / Android share sheet with a generated
  PDF receipt as the attachment + a default share text "I sent
  3,600 CNY to Wei via ZhiPay" (localized, can be edited)
- Download: writes the PDF to the platform's share-able file location;
  shows a confirmation toast "Receipt saved to Files / Downloads"
- The PDF receipt itself: branded ZhiPay header, receipt body matching
  the on-screen layout (status hero + timeline + recipient + card +
  breakdown + notes), reference ID footer; renders bilingual (user's
  preferred language as primary, English as secondary)

## Localization annotations

Render each text string with its i18n key inline. Suggested keys:

```
mobile.receipt.app-bar.done
mobile.receipt.app-bar.id-chip-aria
mobile.receipt.hero.completed.heading
mobile.receipt.hero.processing.heading
mobile.receipt.hero.reversed.heading
mobile.receipt.hero.amount.cny
mobile.receipt.hero.amount.uzs.subline
mobile.receipt.hero.processing.subline
mobile.receipt.hero.sent-on (with {date} {time})
mobile.receipt.timeline.created
mobile.receipt.timeline.created.actor.user
mobile.receipt.timeline.auth-captured
mobile.receipt.timeline.auth-captured.actor.system
mobile.receipt.timeline.sent-to.alipay
mobile.receipt.timeline.sent-to.wechat
mobile.receipt.timeline.sent-to.actor.provider
mobile.receipt.timeline.completed
mobile.receipt.timeline.completed.actor.provider
mobile.receipt.timeline.failed
mobile.receipt.timeline.failed.actor.provider
mobile.receipt.timeline.reversed
mobile.receipt.timeline.reversed.actor.system
mobile.receipt.timeline.processing-stuck (with {duration})
mobile.receipt.failure.cta-support
mobile.receipt.failure.ref-id-aria
mobile.receipt.reversal.heading
mobile.receipt.reversal.body (with {date} {time})
mobile.receipt.reversal.help-link
mobile.receipt.recipient.heading
mobile.receipt.recipient.tap-aria
mobile.receipt.card.heading
mobile.receipt.card.view-card
mobile.receipt.card.removed-banner
mobile.receipt.breakdown.toggle.collapsed
mobile.receipt.breakdown.toggle.expanded
mobile.receipt.breakdown.you-sent
mobile.receipt.breakdown.you-sending
mobile.receipt.breakdown.you-attempted
mobile.receipt.breakdown.fee
mobile.receipt.breakdown.spread
mobile.receipt.breakdown.total
mobile.receipt.breakdown.recipient-got
mobile.receipt.breakdown.recipient-gets
mobile.receipt.breakdown.rate
mobile.receipt.breakdown.rate-locked-suffix
mobile.receipt.notes.heading
mobile.receipt.action.send-again
mobile.receipt.action.share
mobile.receipt.action.download
mobile.receipt.action.copy-id
mobile.receipt.action.done
mobile.receipt.action.back-to-history
mobile.receipt.action.back-to-home
mobile.receipt.action.support
mobile.receipt.send-again.soft-block.sanctions
mobile.receipt.share.default-text (with {amount} {name})
mobile.receipt.download.toast.success
common.copy.copied
common.copy.copy
```

**Longest-translation test**: render the Russian variant of the
breakdown labels — Russian "Комиссия за обмен валюты" (FX spread)
runs longer than English. Verify the breakdown card right-aligns the
amounts cleanly and that the locked-rate sub-row doesn't wrap. Same
test for the reversal banner body.

## Accessibility annotations

- Tap-target sizes: action-bar buttons ≥ 56pt; copy-id chip ≥ 44pt;
  collapsible toggle ≥ 44pt
- Focus order on post-send mount:
  1. Done (top-right close)
  2. Status hero (announced as block)
  3. Each timeline event (with actor)
  4. Failure block CTAs (when present)
  5. Reversal block (when present)
  6. Recipient block
  7. Card block
  8. Breakdown toggle
  9. Notes block (when present)
  10. Action bar buttons left → right
- Focus order on history mount:
  1. Back arrow
  2. Transfer-id chip (with copy action)
  3. (rest same as post-send)
- Screen-reader labels:
  - Status hero: "Transfer completed. Recipient received 3,600 yuan,
    sent from 5,055,000 som."
  - Live-processing icon: "Sending in progress" + announces each
    event via live region (polite) as it lands
  - Timeline event: "Created at 3:26 PM by you, completed"
  - Reversal banner: "This transfer was reversed on May 1, 2026.
    Full amount refunded to your card."
  - Locked rate: "Rate, 1 yuan equals 1404.17 som, locked"
- Reduced-motion fallbacks:
  - Hero icon scale-in: instant
  - Timeline event stagger-fade-in: all instant
  - Action bar slide-in: instant
- Color-only signals: every status icon pairs color WITH icon shape
  (tick / spinning-arc / X / reverse-arrow) AND text label

## Microinteractions to render

- Post-send hero icon: scale 0 → 1 in 200ms ease-out; reduced-motion
  → instant
- Timeline event scale-in on mount: stagger 80ms each (oldest first);
  reduced-motion → instant
- Live-processing event arrives: timeline updates in place — current
  ring marker fills to solid + new ring marker appears one row down;
  brief 250ms pulse on the new ring; reduced-motion → instant
- Breakdown toggle: chevron 180° rotation (200ms); body slides down
  (300ms ease-out)
- Copy-id chip: icon swap with `text-success-700` 1.5s flip (matches
  admin's Phase 14 useCopyFeedback)
- Share sheet: native platform animation (no override needed)

## Output format checklist

- [ ] Single Claude.ai artefact, mobile viewport 390pt
- [ ] React + Tailwind, using foundation tokens
- [ ] Render the receipt component with both entry contexts (post-
      send + history) — minimum 2 frames per status state
- [ ] Status states: completed (post-send + history) · processing
      (live-updating, post-send) · failed (per error code, both
      contexts) · reversed (history)
- [ ] Light + dark variants
- [ ] Russian-longest-translation test on breakdown
- [ ] All copy annotated with i18n keys
- [ ] Microinteractions annotated
- [ ] Accessibility focus order overlaid on both mount contexts
- [ ] Acceptance criteria (Gherkin) appended

## Forbidden in this pass

- ❌ Re-computing the FX rate post-confirm (rate is immutable per
  `money-and-fx.md`)
- ❌ Showing AML reasons on `SANCTIONS_HIT` (calm-review only)
- ❌ Confetti / celebration animations beyond the calm scale-in tick
- ❌ "Cancel transfer" CTA on the live-processing receipt (transfer
  cannot be user-cancelled once `processing`)
- ❌ Showing the full PAN of the card used (masked only)
- ❌ Marketing CTAs ("Send to a new recipient!") on the receipt —
  keep it focused on the transfer at hand
- ❌ Inventing new transfer states (only `created`, `processing`,
  `completed`, `failed`, `reversed`)

## Cross-references

- Foundation: [`../01-foundation.md`](../01-foundation.md)
- Send-money flow (post-send entry context): [`../user-flows/flow-04-send-money.md`](../user-flows/flow-04-send-money.md)
- History flow (history entry context): [`../user-flows/flow-05-history.md`](../user-flows/flow-05-history.md)
- Send-money screens (Send-again deep link target): [`./05-send-money-screens.md`](./05-send-money-screens.md)
- History screens (re-mount of this component): [`./06-history-screens.md`](./06-history-screens.md)
- Status state machine: [`../../../docs/mermaid_schemas/transfer_state_machine.md`](../../../docs/mermaid_schemas/transfer_state_machine.md)
- Status display: [`../../../.claude/rules/status-machines.md`](../../../.claude/rules/status-machines.md)
- Money & FX: [`../../../.claude/rules/money-and-fx.md`](../../../.claude/rules/money-and-fx.md)
- Error UX: [`../../../.claude/rules/error-ux.md`](../../../.claude/rules/error-ux.md)
- Localization: [`../../../.claude/rules/localization.md`](../../../.claude/rules/localization.md)
- Accessibility: [`../../../.claude/rules/accessibility.md`](../../../.claude/rules/accessibility.md)
