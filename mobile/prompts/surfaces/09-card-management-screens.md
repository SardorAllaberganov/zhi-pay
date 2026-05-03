# Prompt — Card-management screens (List · Detail · Action sheets)

> **How to use:** open a fresh Claude.ai conversation. Paste in this order:
>
> 1. [`../00-shared-context.md`](../00-shared-context.md) (full content)
> 2. [`../01-foundation.md`](../01-foundation.md) (or rendered output)
> 3. [`../user-flows/flow-07-card-management.md`](../user-flows/flow-07-card-management.md)
> 4. This file
>
> Adding a new card lives in
> [`./04-card-linking-screens.md`](./04-card-linking-screens.md). This
> prompt covers list / detail / action sheets only.

---

## What I want from this pass

Design the **card-management screen group** end to end:

1. **List** — Default section + Other cards section + Empty state
2. **Detail** — Card preview hero + status block (when not active) +
   recent activity card + quick actions + Remove footer
3. **Action sheets** — Freeze / Unfreeze / Remove (with default-card
   and last-card variants of Remove)
4. **Empty state** — first-time user

Render at 390 × 844pt mobile viewport. Multiple frames per screen for
the states listed in
[`../user-flows/flow-07-card-management.md`](../user-flows/flow-07-card-management.md)
§"States to render".

## Per-screen designs

### Screen 1 — List

**Layout** (top → bottom):

- App bar: "Cards" heading; right-side primary "+ Add card" icon button
  (foundation IconButton with plus icon, brand-tinted, h-44 hit area)
- **Default card section** (when 1+ cards):
  - Section heading row: small "Default" chip-style label (slate-500
    uppercase tracking-wider, body small — chip-style label exception
    per typography rules)
  - One foundation card-as-object component for the default card
    (~200pt tall, full-width minus 24pt margins, gradient surface
    matching the home-screen hero's brand-50 → brand-100):
    - Scheme logo top-left (UzCard / Humo / Visa / Mastercard per
      [`.claude/rules/card-schemes.md`](../../../.claude/rules/card-schemes.md))
    - Masked PAN center (display-2 weight, mono — `4242 42•• ••••
      4242`)
    - Expiry MM/YY + cardholder name (if present) bottom
    - "Default" badge top-right (brand-700, body small)
  - Tap → step 2 (detail)
- **Other cards section** (when 2+ cards):
  - Section heading row: "Other cards" chip-style label
  - Compact card-row primitive (foundation ListRow, dense variant) per
    card:
    - Scheme logo on the left
    - Masked PAN center (mono, body)
    - Expiry sub-line (slate-500, body small)
    - Status chip if not `active`:
      - frozen → lock icon + "Frozen" (warning-tone)
      - expired → calendar icon + "Expired MM/YY" (slate-tone, muted)
    - Right-side chevron (decorative — row is tappable)
  - Tap → step 2 (detail)
- **Empty state** (zero cards):
  - Full-screen empty illustration (line-illustration of a credit
    card or simple stylized card icon)
  - Heading: "No cards yet" (display-2)
  - Sub-line: "Add a card to get started." (body, slate-600)
  - Primary "+ Add your first card" CTA → routes to card-linking

**States**:
- Idle — populated (1 default + 2 others)
- Idle — single card (default only, no Other section)
- Idle — multiple cards (default + 4 others, exercising the cap)
- Default has `frozen` status (rare but possible) — default section's
  card-as-object component renders with the frozen status chip
  visible inside the card body
- Initial mount skeleton (1 large card-skeleton + 2 row skeletons)
- Empty state (zero cards)
- Network offline (banner at top, list still browsable from cache)
- Server 5xx (full-screen calm error pattern with retry)
- Dark mode

### Screen 2 — Detail

**Layout** (top → bottom):

- App bar: back arrow + "Card" heading + 3-dot kebab right (kebab
  opens the action sheet listing Set as default / Freeze / Unfreeze
  / Remove based on current state)
- **Card preview hero** (foundation card-as-object component, full-
  width minus 24pt margins, ~220pt tall, gradient surface):
  - Scheme logo top-left
  - Masked PAN center (display-2 weight, mono)
  - Expiry MM/YY + cardholder name (if present) bottom
  - "Default" badge top-right when `is_default=true`
  - Status overlay (when not active):
    - frozen → semi-transparent slate overlay + lock icon center + "Frozen" label
    - expired → semi-transparent slate overlay + calendar icon center
      + "Expired MM/YY" label
- **Status block** (when not active):
  - Foundation Banner primitive
  - frozen variant (warning-tone):
    - Heading: "This card is frozen"
    - Body: "It can't be used for new transfers. Unfreeze when you're
      ready."
    - Inline primary CTA: "Unfreeze"
  - expired variant (slate-tone):
    - Heading: "This card expired on MM/YY"
    - Body: "Add a new card to keep sending."
    - Inline primary CTA: "+ Add card" → routes to card-linking
- **Last-used row** (foundation ListRow, dense):
  - Label: "Last used"
  - Value: relative time + locale-aware date ("3 days ago · Apr 27,
    2026")
- **Recent activity card** (foundation Card):
  - Heading row: "Recent activity" left, "View transfers" link right
  - Body: "5 transfers in the last 30 days"
  - Mini stats row (3 tiles): total volume / avg amount / latest
    transfer date
  - Tap "View transfers" → routes to History filtered by this card
- **Quick-actions row** (3 chip buttons, foundation Chip primitive —
  only relevant chips render):
  - "Set as default" (visible when `is_default=false` AND
    `status=active`) — taps writes default-flag flip + shows in-place
    success-tone confirmation chip for 1.5s using `useCopyFeedback`
    pattern
  - "Freeze" (visible when `status=active`) — taps step 3 freeze
    sheet
  - "Unfreeze" (visible when `status=frozen`) — taps step 3 unfreeze
    sheet
- **Remove card footer link** (danger-700, body, centered, with
  underline on press) — taps step 3 remove sheet
- **Privacy line** at the very bottom: "We never show your full card
  number or CVV — only the first 6 and last 4 digits are visible."
  (slate-500, body small, with lock icon leading)

**States**:
- Active card (full quick-actions row + Remove footer)
- Active default card (Set-as-default chip absent — already default)
- Frozen card (status block + Unfreeze chip + Remove footer; no Freeze
  / Set-as-default chips)
- Expired card (status block + "+ Add card" CTA replaces quick-actions
  row; Remove footer remains)
- Initial mount skeleton
- Network offline (banner + WriteButton-disabled action chips)
- Server 5xx on action submit (calm inline error in the action sheet)
- Dark mode

### Screen 3 — Action sheets

(Three sheet variants — each is a foundation Sheet primitive, half-snap)

**Freeze sheet**:
- Sheet handle at top
- Hero icon: lock (lucide), warning-toned
- Heading: "Freeze this card?" (display-2)
- Body: "Freezing pauses this card. You can still see it in your cards
  list, and you can unfreeze it any time." (body)
- Sticky-bottom action stack:
  - Primary destructive CTA: "Freeze" (warning-tone, NOT danger — this
    is reversible)
  - Secondary "Cancel"

**Unfreeze sheet**:
- Sheet handle
- Hero icon: lock-open (lucide), brand-toned
- Heading: "Unfreeze this card?"
- Body: "Your card will be active again right away."
- Action stack:
  - Primary "Unfreeze" (brand-tone)
  - Secondary "Cancel"

**Remove sheet**:
- Sheet handle
- Hero icon: trash (lucide), danger-toned
- Heading: "Remove this card?"
- Body: "Removing means you'll need to re-add this card to use it
  again. Past transfers using this card stay in your history."
- Conditional preface (above body, foundation Banner inline-tone):
  - **Default-card removal** (1+ cards remain): "This is your default
    card. Another card will become your default when this is
    removed." (slate-tone, info)
  - **Last-card removal**: "This is your last card. You won't be able
    to send money until you add another card." (warning-tone)
- Action stack:
  - Primary destructive CTA: "Remove" (danger-tone)
  - Secondary "Cancel"

**States** (per sheet):
- Idle
- Loading (action submit) — primary button shows spinner
- Network offline — primary button uses WriteButton tooltip pattern
- Inline server error (e.g. `CARD_HAS_INFLIGHT_TRANSFER`) — banner
  inside sheet with "View transfer" deep-link
- Default-card variant of Remove sheet
- Last-card variant of Remove sheet

## Cross-screen patterns

### App bar pattern

- Back arrow on detail; no back on list (root of card-mgmt sub-tree)
- Right-side icon: "+ Add card" button on list; 3-dot kebab on detail
- Wordmark / extra branding NEVER on these screens (focus stays on the
  card)

### Bottom safe-area

- Action sheets respect iOS home-indicator (extra 16pt at bottom)
- Detail screen's Remove-card footer has 24pt margin from bottom
  edge before the tab bar / home-indicator

### Sheet pattern

- Half-snap on initial open
- Tap-out-of-sheet dismisses (Cancel)
- Swipe-down to dismiss
- Body scrolls if longer than sheet height (prefaces + body) — but in
  practice these sheets are short

### useCopyFeedback pattern

- "Set as default" chip on detail uses the same feedback pattern from
  admin's Phase 14 — chip-content swap (e.g. "Set as default →
  Default ✓") for 1.5s with `text-success-700` flip; reduced-motion
  → instant

## Localization annotations

Render each text string with its i18n key inline. Suggested keys:

```
mobile.card-mgmt.list.heading
mobile.card-mgmt.list.add-card-aria
mobile.card-mgmt.list.section.default
mobile.card-mgmt.list.section.other
mobile.card-mgmt.list.row.expiry-format
mobile.card-mgmt.list.row.status.frozen
mobile.card-mgmt.list.row.status.expired (with {date})
mobile.card-mgmt.list.empty.heading
mobile.card-mgmt.list.empty.subline
mobile.card-mgmt.list.empty.cta
mobile.card-mgmt.detail.heading
mobile.card-mgmt.detail.kebab-aria
mobile.card-mgmt.detail.frozen-banner.heading
mobile.card-mgmt.detail.frozen-banner.body
mobile.card-mgmt.detail.frozen-banner.cta
mobile.card-mgmt.detail.expired-banner.heading (with {date})
mobile.card-mgmt.detail.expired-banner.body
mobile.card-mgmt.detail.expired-banner.cta
mobile.card-mgmt.detail.last-used.label
mobile.card-mgmt.detail.activity.heading
mobile.card-mgmt.detail.activity.view-transfers
mobile.card-mgmt.detail.activity.summary (with {count} {days})
mobile.card-mgmt.detail.activity.tile.volume
mobile.card-mgmt.detail.activity.tile.avg
mobile.card-mgmt.detail.activity.tile.latest
mobile.card-mgmt.detail.action.set-default
mobile.card-mgmt.detail.action.set-default-confirmation
mobile.card-mgmt.detail.action.freeze
mobile.card-mgmt.detail.action.unfreeze
mobile.card-mgmt.detail.action.remove
mobile.card-mgmt.detail.privacy
mobile.card-mgmt.freeze-sheet.heading
mobile.card-mgmt.freeze-sheet.body
mobile.card-mgmt.freeze-sheet.cta-confirm
mobile.card-mgmt.unfreeze-sheet.heading
mobile.card-mgmt.unfreeze-sheet.body
mobile.card-mgmt.unfreeze-sheet.cta-confirm
mobile.card-mgmt.remove-sheet.heading
mobile.card-mgmt.remove-sheet.body
mobile.card-mgmt.remove-sheet.preface.default-card
mobile.card-mgmt.remove-sheet.preface.last-card
mobile.card-mgmt.remove-sheet.cta-confirm
common.action.cancel
common.errors.CARD_ACTION_FAILED.title
common.errors.CARD_ACTION_FAILED.body
common.errors.CARD_HAS_INFLIGHT_TRANSFER.title
common.errors.CARD_HAS_INFLIGHT_TRANSFER.body
```

**Longest-translation test**: render the Russian variant of the
last-card Remove preface ("Это ваша последняя карта. Вы не сможете
отправлять деньги, пока не добавите другую карту.") at the default
viewport — verify the sheet height grows to accommodate the preface
without crushing the body or the action stack. Sheet body should be
scrollable if needed.

## Accessibility annotations

- Tap-target sizes: card-as-object hero ≥ 200pt tall (well above
  44pt); ListRow rows ≥ 64pt; chip buttons ≥ 44pt × 36pt; kebab
  ≥ 44pt × 44pt
- Focus order on detail:
  1. Back arrow
  2. Kebab
  3. Card-as-object hero (announced as block)
  4. Status block CTAs (when present)
  5. Last-used row (decorative — skip)
  6. Activity card (and "View transfers" link)
  7. Each quick-action chip (left → right)
  8. Remove footer link
- Screen-reader labels:
  - Card-as-object: "Default UzCard, ending in 4242, expires December
    2027" — announces "Default" first as a pre-attribute for the
    default card; for non-default cards: "UzCard, ending in 4242,
    expires December 2027, currently frozen" (when applicable)
  - **NEVER announce the full PAN** — the masked first6 + last4 reads
    as "ending in 4242" only
  - Status chip in row: "Status: frozen" / "Status: expired
    December 2024"
  - Action chip: "Set as default — current card is not default"
- Reduced-motion fallbacks:
  - "Set as default" chip-content swap: instant
  - Sheet slide-up: instant
  - Status overlay fade-in on frozen / expired hero: instant
- Color-only signals removed: status chips ALWAYS pair color WITH
  icon (lock / calendar) AND text label

## Microinteractions to render

- "Set as default" chip tap: chip-content swap (chip text + icon
  flip from "Set as default" → "Default ✓") for 1.5s, brand → success
  tone; reduced-motion → instant
- Action sheet open: slide-up 300ms ease-out; reduced-motion → instant
- Action sheet primary destructive CTA press: subtle 100ms scale-down;
  reduced-motion → instant
- Card-as-object hero gradient: static, no animation
- Frozen overlay fade-in (when navigating to a frozen card detail):
  150ms ease-out; reduced-motion → instant

## Output format checklist

- [ ] Single Claude.ai artefact, mobile viewport 390pt
- [ ] React + Tailwind, using foundation tokens
- [ ] All 3 screens × all listed states (~15 frames)
- [ ] Light + dark variants
- [ ] Russian-longest-translation test on last-card Remove preface
- [ ] All copy annotated with i18n keys
- [ ] Microinteractions annotated
- [ ] Accessibility focus order overlaid on detail
- [ ] Acceptance criteria (Gherkin) appended (extending seeds from
      `flow-07-card-management.md`)

## Forbidden in this pass

- ❌ Showing the full PAN of any card (mask is first6 + last4 only)
- ❌ "Edit card" affordance — PAN cannot be edited per
  [`../../../.claude/rules/card-schemes.md`](../../../.claude/rules/card-schemes.md);
  remove + re-add only
- ❌ Showing the CVV anywhere (never stored, never echoed)
- ❌ Showing the holder's full document number alongside the card
- ❌ Bulk actions (multi-select + bulk freeze) — single-card actions
  only in v1
- ❌ Confetti / over-celebration on Set-as-default — quiet feedback only
- ❌ Auto-removing expired cards — they stay visible until user
  explicitly removes (so the user understands their card is gone)

## Cross-references

- Foundation: [`../01-foundation.md`](../01-foundation.md)
- Flow plan: [`../user-flows/flow-07-card-management.md`](../user-flows/flow-07-card-management.md)
- Card-linking screens (Add-card target): [`./04-card-linking-screens.md`](./04-card-linking-screens.md)
- History screens (View-transfers target): [`./06-history-screens.md`](./06-history-screens.md)
- Card scheme rules: [`../../../.claude/rules/card-schemes.md`](../../../.claude/rules/card-schemes.md)
- Card state machine: [`../../../docs/mermaid_schemas/card_state_machine.md`](../../../docs/mermaid_schemas/card_state_machine.md)
- Tier rules (V/MC frozen on tier_2 expiry): [`../../../.claude/rules/kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md)
- Status display: [`../../../.claude/rules/status-machines.md`](../../../.claude/rules/status-machines.md)
- Localization: [`../../../.claude/rules/localization.md`](../../../.claude/rules/localization.md)
- Accessibility: [`../../../.claude/rules/accessibility.md`](../../../.claude/rules/accessibility.md)
