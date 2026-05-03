# User Flow — Card linking (UzCard / Humo for tier_1+, Visa/MC for tier_2)

> Plans the screen sequence + state machine for adding a payment card to a
> ZhiPay account. UzCard / Humo from `tier_1`; Visa / Mastercard gate on
> `tier_2` (currently paused for v1 mock per LESSON 2026-04-30 — designs
> render the gated path so the upgrade CTA is visible). The matching surface
> prompt is [`../surfaces/04-card-linking-screens.md`](../surfaces/04-card-linking-screens.md).
>
> Canonical sources of truth:
> - [`docs/mermaid_schemas/card_linking_flow.md`](../../../docs/mermaid_schemas/card_linking_flow.md)
> - [`docs/mermaid_schemas/card_state_machine.md`](../../../docs/mermaid_schemas/card_state_machine.md)
> - [`.claude/rules/card-schemes.md`](../../../.claude/rules/card-schemes.md)
> - [`.claude/rules/kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md)
> - [`docs/models.md`](../../../docs/models.md) — `linked_cards`,
>   `card_schemes`, `kyc_verifications`

## Goal

Get a phone-verified user (`tier_1+`) from "I want to add a card" to a
linked, 3DS-verified card row in `linked_cards` with `status=active`. Surface
the tier_2 gate cleanly when a `tier_1` user attempts Visa / Mastercard.

## Out of scope (covered by other flows)

- MyID upgrade ([`flow-02-myid.md`](./flow-02-myid.md))
- Card edit / freeze / unfreeze / remove
  ([`flow-07-card-management.md`](./flow-07-card-management.md))
- First send-money on the new card ([`flow-04-send-money.md`](./flow-04-send-money.md))

## Prerequisites

- User is at least `tier_1` (phone OTP completed)
- Network connectivity (3DS WebView requires online)
- Source-side card on hand (UzCard, Humo, or Visa / Mastercard at tier_2)
- User has not already hit the `max_cards` cap for their tier
  (`tier_1`=2, `tier_2`=5)

## State machine (Card)

A new `linked_cards` row is created on successful 3DS with
`status=active`. From there the row may move through:
`active` → `frozen` (admin or user freeze) → `active` (unfreeze) | `removed`
(user delete) | `expired` (TTL on `expiry_year/month`).

This flow only handles the **creation transition** (no row → `active`).
Lifecycle transitions belong to [`flow-07-card-management.md`](./flow-07-card-management.md).

## Screen sequence

1. **Entry** — multiple paths:
   - From the home-screen "Add card" tile (fresh user, no cards yet)
   - From card-management list "+ Add another card" CTA (user with cards
     but under the cap)
   - From send-money review when no card is selected and the user taps
     "Add a card to continue"
2. **Scheme picker**
   - Page heading: "Choose a card type"
   - 4 tiles in a 2 × 2 grid (foundation Card primitive, scheme-logo
     centered, scheme name below):
     - UzCard (active for tier_1+)
     - Humo (active for tier_1+)
     - Visa (gated — see step 3)
     - Mastercard (gated — see step 3)
   - Tier-1 user: Visa / Mastercard tiles render with a small
     warning-tinted lock badge on the corner
3. **Tier-2 gate (Visa / MC tap on tier_1)**
   - Half-sheet (NOT a modal — the user can dismiss easily)
   - Heading: "Visa & Mastercard need full verification"
   - Body: "Verify with MyID to add Visa or Mastercard cards. UzCard and
     Humo work right now."
   - Primary CTA: "Verify with MyID" → routes to MyID flow
     ([`flow-02-myid.md`](./flow-02-myid.md))
   - Secondary CTA: "Use UzCard or Humo instead" → returns to scheme
     picker (steps 2)
   - Tertiary "Cancel" — closes the sheet
4. **Card details entry**
   - Top app bar: back arrow + step chip "Card details · 1 of 2"
   - PAN field: 16-digit numeric, formatted as `4242 4242 4242 4242` with
     auto-spacing every 4 digits, scheme-logo overlays the right edge of
     the input as the user types (detects scheme from the BIN)
   - Cardholder name field (optional for UzCard / Humo since the issuer
     binds it; required for Visa / MC per scheme rules)
   - Expiry MM/YY field, mask `12/27`, numeric keyboard
   - CVV field, 3 or 4 digits depending on scheme, masked dot input
   - Validation:
     - PAN — Luhn check, scheme-BIN match (UzCard / Humo / Visa / MC)
     - Expiry — must be in the future
     - CVV — must match scheme rules (3 for UzCard/Humo/Visa, 4 for
       Mastercard variants in some markets)
   - Privacy line: "Your card details are sent securely. We never store
     your full card number or CVV."
   - Sticky-bottom CTA: "Continue" — disabled until all fields valid
5. **3DS WebView (handover)**
   - Top app bar: "Verifying with your bank" + visible "Cancel" button
     that always returns the user to step 4 with a clean slate
   - In-app WebView fills the rest of the screen
   - Before WebView mount: branded loading state (don't show raw bank
     chrome immediately — `card-schemes.md` 3DS rule)
   - WebView is the issuer's 3DS challenge: OTP, password, biometric,
     or whatever the issuer requires
   - On WebView exit: detect via redirect URL → step 6 or step 7
6. **Linking (loading)**
   - Brief calm loading state — "Linking your card…"
   - This is the moment the backend writes the `linked_cards` row
7. **Result — success**
   - Hero tick (success-700, scale-in)
   - Heading: "Card linked"
   - Card preview (foundation card-as-object component): scheme logo +
     masked PAN (first6 + last4) + expiry, all per `card-schemes.md`
     contract
   - Default toggle (foundation Switch primitive): "Set as default" — if
     this is the user's first card, default is true and the toggle is
     disabled (with a tooltip "First card is automatically your default")
   - Two next-step CTAs:
     - Primary: "Send money" (visible only if user is `tier_2`)
     - Secondary: "Add another card" (visible if user under `max_cards` cap)
   - Tertiary "Done" → returns to the entry surface
8. **Result — failure**
   - Per `error_codes.message_*` heading + body
   - Primary CTA: per `retryable` flag — "Try again" or "Choose a different
     card"
   - Secondary: "Contact support"
   - Tertiary "Back" → returns to scheme picker

## States to render (per screen)

| State | Scheme picker | Tier-2 gate | Details | 3DS WebView | Linking | Success | Failure |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Idle | ✓ | ✓ | ✓ (empty) | ✓ | ✓ | ✓ | ✓ |
| Filled / valid | — | — | ✓ | — | — | — | — |
| Loading | — | — | — | mounting | ✓ | — | — |
| Error (validation) | — | — | ✓ inline | — | — | — | — |
| Error (declined / 3DS fail) | — | — | — | — | — | — | ✓ |
| Error (network offline) | ✓ banner | ✓ banner | ✓ banner | ✓ banner | hold | — | — |
| Cap reached (max_cards) | ✓ blocking sheet | — | — | — | — | — | — |

## Error states (sourced from `error_codes`)

- PAN failed Luhn / unrecognised BIN → inline (no `error_codes` round-trip)
- Card declined by issuer → `CARD_DECLINED` retryable
- Insufficient funds during 3DS auth-test → `INSUFFICIENT_FUNDS` retryable
  (some issuers run a $0 test; some run a small auth that may decline)
- 3DS challenge timeout / abandoned → `THREE_DS_TIMEOUT` retryable
- 3DS challenge failed → `THREE_DS_FAILED` retryable
- Issuer unavailable → `ISSUER_UNAVAILABLE` provider-down calm pattern
- Duplicate card on this account → `CARD_DUPLICATE` non-retryable, body
  routes user to existing card in card-management
- Visa / MC attempted on `tier_1` → routed via step 3 sheet (NOT a thrown
  error — UI gate, not a backend failure)
- Max-cards cap reached → `CARD_CAP_REACHED` non-retryable, body routes
  user to card-management to remove an existing card first

## Edge cases to surface in the design

- User pastes a PAN with embedded spaces / dashes → input strips them
  silently
- User enters an expired card → inline at step 4 ("This card is expired —
  expiry must be in the future")
- User cancels 3DS WebView → returns to step 4 with all fields preserved
  (no force-clear)
- User attempts to add a card already linked under a different account
  (rare AML signal) → backend may return `CARD_DUPLICATE_GLOBAL`
  → calm "We can't add this card right now — contact support" pattern
- User offline during step 4 → CTA disabled with offline tooltip per
  WriteButton primitive pattern; can fill the form but cannot submit
- User offline during 3DS WebView → WebView fails to load; calm
  "Reconnecting…" with retry-on-reconnect; cancel always returns to step 4

## Acceptance criteria (Gherkin fragments)

```
GIVEN  user.kyc_tier = tier_1
AND    user has 0 linked cards
WHEN   user taps an UzCard tile in the scheme picker
AND    enters a valid PAN + expiry + CVV
AND    completes 3DS challenge with the issuer
THEN   new linked_cards row created (scheme=uzcard, status=active,
       is_default=true, masked_pan = first6+last4 from issuer)
AND    success screen renders with the masked card preview
AND    no UI surfaces ever the full PAN, even briefly

GIVEN  user.kyc_tier = tier_1
WHEN   user taps the Visa tile in the scheme picker
THEN   tier_2-gate sheet renders
AND    primary CTA routes to the MyID flow
AND    no linked_cards row created
AND    no PAN entry screen rendered

GIVEN  user.kyc_tier = tier_2
AND    user already has linked_cards count = 5 (max for tier_2)
WHEN   user taps "+ Add another card" from card-management
THEN   max-cards-reached sheet renders
AND    user is routed to card-management with a "Remove an existing card
       first" CTA
AND    no scheme picker rendered

GIVEN  user enters a valid PAN
AND    issuer 3DS challenge times out after 60s
WHEN   the 3DS WebView returns control
THEN   failure screen renders with error_code = THREE_DS_TIMEOUT
AND    retry CTA returns user to step 4 with PAN preserved
AND    no linked_cards row created
```

## Telemetry to consider

- `card.add.entry` (with entry surface — home / mgmt / send-money)
- `card.add.scheme.tap` (with scheme code)
- `card.add.tier-gate.view` (Visa/MC on tier_1)
- `card.add.tier-gate.cta-myid`
- `card.add.details.submit`
- `card.add.three-ds.start`
- `card.add.three-ds.success`
- `card.add.three-ds.fail` (with `error_code`)
- `card.add.success`
- `card.add.cancel` (with step at cancel time)

## Cross-references

- Card linking sequence: [`docs/mermaid_schemas/card_linking_flow.md`](../../../docs/mermaid_schemas/card_linking_flow.md)
- Card state machine: [`docs/mermaid_schemas/card_state_machine.md`](../../../docs/mermaid_schemas/card_state_machine.md)
- Card scheme rules (display, masking, 3DS, tier gating): [`.claude/rules/card-schemes.md`](../../../.claude/rules/card-schemes.md)
- Tier rules: [`.claude/rules/kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md)
- Error UX: [`.claude/rules/error-ux.md`](../../../.claude/rules/error-ux.md)
- Surface design prompt: [`../surfaces/04-card-linking-screens.md`](../surfaces/04-card-linking-screens.md)
