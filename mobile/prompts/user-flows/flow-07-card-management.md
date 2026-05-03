# User Flow — Card management (list, freeze / unfreeze, set default, remove)

> Plans the screen sequence + state machine for the card-management surface
> where a user views their linked cards, freezes / unfreezes a card,
> changes their default, or removes a card. Adding a new card lives in
> [`flow-03-card-linking.md`](./flow-03-card-linking.md). The matching
> surface prompt is
> [`../surfaces/09-card-management-screens.md`](../surfaces/09-card-management-screens.md).
>
> Canonical sources of truth:
> - [`docs/mermaid_schemas/card_state_machine.md`](../../../docs/mermaid_schemas/card_state_machine.md)
> - [`.claude/rules/card-schemes.md`](../../../.claude/rules/card-schemes.md)
> - [`.claude/rules/status-machines.md`](../../../.claude/rules/status-machines.md)
> - [`docs/models.md`](../../../docs/models.md) — `linked_cards`,
>   `card_schemes`

## Goal

Let the user manage their existing card set: see all linked cards in one
place, set a different default, freeze a card temporarily (vacation,
suspicious activity, etc.), unfreeze it later, or remove a card
permanently.

## Out of scope (covered by other flows)

- Adding a new card ([`flow-03-card-linking.md`](./flow-03-card-linking.md))
- Per-card transfer history (browseable from
  [`flow-05-history.md`](./flow-05-history.md) with the card filter chip)
- Tier-2 gate for Visa / Mastercard (handled in
  [`flow-03-card-linking.md`](./flow-03-card-linking.md) step 3)

## Prerequisites

- User is at least `tier_1`
- User has at least 1 linked card (zero-cards user lands on the empty
  state and is routed to add a card)
- Network connectivity (state changes are server-driven)

## State machine (Card)

`active` → `frozen` (user freeze) → `active` (unfreeze) | `removed` (user
delete from frozen state) | `expired` (TTL on `expiry_year/month`)
`active` → `removed` (direct delete from active state) — confirmation
required

PAN can NEVER be edited per `card-schemes.md` — to change the PAN, user
removes the card and re-adds. This invariant must be visible in the UI
("To change your card number, remove this card and add a new one").

## Screen sequence

1. **List entry**
   - Reached from:
     - Tab bar "More" → "Cards" sub-row
     - Settings → Cards
     - Send-money review → "Manage cards" link from card picker sheet
2. **List**
   - Top app bar: "Cards" heading; right-side primary "+ Add card"
     button (foundation IconButton with plus icon, brand-tinted)
   - Default card section (top):
     - Heading chip: "Default" (small, slate-500 uppercase tracking-
       wider — minor exception to the 13px floor since this is a
       chip-style label)
     - One foundation card-as-object component for the default card
       (large, scheme-logo top-left, masked PAN center, expiry +
       cardholder bottom)
   - Other cards section:
     - Heading chip: "Other cards" (only if 2+ cards)
     - Compact card-row primitive (foundation ListRow): scheme logo
       on the left + masked PAN + expiry on the center + tap-target
       chevron on the right
   - Each card row has a status badge if not active:
     - `frozen` → lock icon + "Frozen" warning-tone chip
     - `expired` → calendar icon + "Expired MM/YY" muted-tone chip
   - Empty state (zero cards): full-screen empty illustration + "+
     Add your first card" primary CTA
   - Tap a card → step 3 (detail)
3. **Card detail**
   - Top app bar: back arrow + "Card" heading + 3-dot kebab right
     (kebab opens action sheet — see step 4)
   - Card preview hero (foundation card-as-object component, full-
     width minus 24pt margins, ~200pt tall):
     - Scheme logo top-left
     - Masked PAN center (display-2 weight, mono)
     - Expiry MM/YY + cardholder name (if present) bottom
     - Default-badge top-right if `is_default=true`
   - Status block (when not active):
     - `frozen`: warning-tinted banner with body copy "This card is
       frozen — it can't be used for new transfers. Unfreeze when
       you're ready." + primary CTA "Unfreeze"
     - `expired`: muted banner with body "This card expired on
       MM/YY. Add a new card to keep sending." + primary CTA "+ Add
       card" → routes to flow-03
   - Last-used row: "Last used 3 days ago" with relative-time +
     locale-aware date format (sub-line)
   - Recent activity card: "5 transfers in the last 30 days" with a
     "View transfers" link → routes to history filtered by this card
   - Quick-actions row (3 chip buttons; only relevant ones rendered):
     - "Set as default" (visible when `is_default=false` AND
       `status=active`) — taps writes default-flag flip, shows in-
       place success-tone confirmation chip for 1.5s
     - "Freeze" (visible when `status=active`) — taps step 4 freeze
       sheet
     - "Unfreeze" (visible when `status=frozen`) — taps step 4
       unfreeze sheet
   - "Remove card" footer link (danger-700 muted) → step 4 remove
     sheet
   - Privacy line at the very bottom: "We never show your full card
     number or CVV — only the first 6 and last 4 digits are visible."
4. **Action sheets** (each is a half-sheet, foundation Sheet primitive)
   - **Freeze sheet**:
     - Heading: "Freeze this card?"
     - Body: "Freezing pauses this card. You can still see it in your
       cards list, and you can unfreeze it any time."
     - Primary destructive CTA: "Freeze" (warning-tone)
     - Secondary "Cancel"
   - **Unfreeze sheet**:
     - Heading: "Unfreeze this card?"
     - Body: "Your card will be active again right away."
     - Primary CTA: "Unfreeze" (brand-tone)
     - Secondary "Cancel"
   - **Remove sheet**:
     - Heading: "Remove this card?"
     - Body: "Removing means you'll need to re-add this card to use
       it again. Past transfers using this card stay in your history."
     - Primary destructive CTA: "Remove" (danger-tone)
     - Secondary "Cancel"
     - For default-card removal: extra preface "This is your default
       card. Another card will become your default when this is
       removed." (only if 2+ cards remain)
     - For last-card removal: extra preface "This is your last card.
       You won't be able to send money until you add another card."

## States to render (per screen)

| State | List | Detail | Freeze sheet | Unfreeze sheet | Remove sheet |
|---|:---:|:---:|:---:|:---:|:---:|
| Idle | ✓ | ✓ | ✓ | ✓ | ✓ |
| Empty (zero cards) | ✓ | — | — | — | — |
| Loading (initial) | ✓ skeleton | ✓ skeleton | — | — | — |
| Loading (action submit) | — | — | ✓ button | ✓ button | ✓ button |
| Status — active | ✓ rows | ✓ hero | applicable | — | applicable |
| Status — frozen | ✓ rows | ✓ hero + banner | — | applicable | applicable |
| Status — expired | ✓ rows | ✓ hero + banner | — | — | applicable |
| Default-card variant of remove | — | — | — | — | ✓ preface |
| Last-card variant of remove | — | — | — | — | ✓ preface |
| Network offline | banner | banner + actions disabled | inline + WriteButton | inline + WriteButton | inline + WriteButton |
| Server 5xx (action fail) | — | — | inline error + retry | inline error + retry | inline error + retry |

## Error states (sourced from `error_codes`)

- Action fails server-side (rare) → `CARD_ACTION_FAILED` retryable inline
  in the action sheet
- Set-as-default fails because the new default card isn't `active` →
  client-side guard: button is disabled + tooltip "Set as default
  requires an active card" (no `error_codes` round-trip)
- Remove fails because the card has an in-flight `processing` transfer
  attached → `CARD_HAS_INFLIGHT_TRANSFER` non-retryable inline:
  "This card has a transfer in progress. Wait until it completes,
  then try again." with a "View transfer" deep-link

## Edge cases to surface in the design

- User has only 1 card and freezes it → still allowed; on next send-
  money attempt, the user gets a calm "All your cards are frozen.
  Unfreeze a card to send money." sheet routing back to card
  management
- User removes their default card with 1+ remaining → server picks
  the most-recently-used card as the new default automatically;
  detail screen of the new default shows the "Default" badge on the
  next mount
- User adds a brand-new card while one is frozen → new card defaults
  to `is_default=false` (never auto-replaces existing default unless
  user explicitly sets); user must tap "Set as default" on the new
  card if they want it
- Card auto-expires (TTL) while user is browsing the list →
  optimistic re-render: row's status badge flips to `expired` on
  next mount; no jarring mid-screen flip
- Visa / MC cards become frozen on tier_2 → tier_1 demote (per
  [`flow-06-tier-upgrade.md`](./flow-06-tier-upgrade.md)) — list
  reflects the frozen state; banner on the home screen explains why
- User attempts to freeze a card that has an in-flight `processing`
  transfer → soft-block: "This card has a transfer in progress.
  Freezing now might cancel it. Continue?" — explicit confirm
  required, NOT auto-allowed

## Acceptance criteria (Gherkin fragments)

```
GIVEN  user has 3 active linked cards (one default)
WHEN   user opens Cards
THEN   the default card renders in the "Default" section at the top
AND    the other 2 cards render in the "Other cards" section
AND    no UI exposes the full PAN of any card

GIVEN  user is on a card detail screen for an active card
WHEN   user taps "Freeze" → "Freeze" in the sheet
THEN   linked_cards.status moves active → frozen
AND    UI updates to show the frozen banner + "Unfreeze" CTA
AND    no transfer attempts using this card succeed until unfrozen

GIVEN  user is on a card detail for the default card
AND    user has 2+ linked cards remaining
WHEN   user taps "Remove" → "Remove" in the sheet
THEN   linked_cards.status moves to removed
AND    server picks the most-recently-used remaining card as the new
       default
AND    UI returns to the card list with the new default visible

GIVEN  user has only 1 linked card
WHEN   user taps "Remove" → "Remove" in the sheet
THEN   linked_cards.status moves to removed
AND    UI returns to the empty state
AND    "Send money" entry on home is disabled with a "Add a card"
       CTA per the existing send-money gating

GIVEN  user attempts to remove a card with an in-flight processing
       transfer
WHEN   user taps "Remove" in the sheet
THEN   inline error renders with error_code = CARD_HAS_INFLIGHT_
       TRANSFER
AND    no linked_cards mutation
AND    "View transfer" link routes to the in-flight transfer detail
```

## Telemetry to consider

- `card-mgmt.list.view` (with card count)
- `card-mgmt.card.tap`
- `card-mgmt.detail.view` (with status)
- `card-mgmt.action.set-default.tap`
- `card-mgmt.action.freeze.tap`
- `card-mgmt.action.unfreeze.tap`
- `card-mgmt.action.remove.tap`
- `card-mgmt.action.remove.confirm` (with card was-default flag)
- `card-mgmt.empty.add-card.tap`
- `card-mgmt.detail.view-transfers.tap`

## Cross-references

- Card state machine: [`docs/mermaid_schemas/card_state_machine.md`](../../../docs/mermaid_schemas/card_state_machine.md)
- Card scheme rules (PAN masking, no edit, status visuals): [`.claude/rules/card-schemes.md`](../../../.claude/rules/card-schemes.md)
- Status display rules: [`.claude/rules/status-machines.md`](../../../.claude/rules/status-machines.md)
- Tier expiry → frozen V/MC: [`.claude/rules/kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md)
- Card linking flow: [`./flow-03-card-linking.md`](./flow-03-card-linking.md)
- History (per-card filter): [`./flow-05-history.md`](./flow-05-history.md)
- Surface design prompt: [`../surfaces/09-card-management-screens.md`](../surfaces/09-card-management-screens.md)
