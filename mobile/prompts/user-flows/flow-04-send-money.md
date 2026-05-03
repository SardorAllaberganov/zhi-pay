# User Flow — Send money (tier_2 → Alipay / WeChat recipient)

> Plans the screen sequence + state machine for the marquee end-user
> action: a `tier_2` user creating a UZS → CNY transfer to a Chinese-resident
> recipient via Alipay or WeChat. The matching surface prompt is
> [`../surfaces/05-send-money-screens.md`](../surfaces/05-send-money-screens.md);
> the receipt / status-watching screens are in
> [`../surfaces/07-receipt-screens.md`](../surfaces/07-receipt-screens.md).
>
> Canonical sources of truth:
> - [`docs/mermaid_schemas/transfer_send_flow.md`](../../../docs/mermaid_schemas/transfer_send_flow.md)
> - [`docs/mermaid_schemas/transfer_state_machine.md`](../../../docs/mermaid_schemas/transfer_state_machine.md)
> - [`docs/mermaid_schemas/transfer_failure_recovery_flow.md`](../../../docs/mermaid_schemas/transfer_failure_recovery_flow.md)
> - [`.claude/rules/money-and-fx.md`](../../../.claude/rules/money-and-fx.md)
> - [`.claude/rules/kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md)
> - [`docs/models.md`](../../../docs/models.md) — `transfers`, `transfer_fees`,
>   `fx_rates`, `recipients`, `linked_cards`, `user_limit_usage`,
>   `transfer_events`

## Goal

`tier_2` user picks a recipient → enters an amount → reviews FX + fees +
locked rate → confirms with their card → watches status from `created`
through `completed` (or `failed` / `reversed` per recovery flow). Land them
on a receipt that they can revisit any time from history.

## Out of scope (covered by other flows)

- Onboarding & MyID ([`flow-01-onboarding.md`](./flow-01-onboarding.md),
  [`flow-02-myid.md`](./flow-02-myid.md))
- Card linking ([`flow-03-card-linking.md`](./flow-03-card-linking.md))
- History / search / filtering ([`flow-05-history.md`](./flow-05-history.md))
- Card management ([`flow-07-card-management.md`](./flow-07-card-management.md))

## Prerequisites

- `users.kyc_tier = tier_2` (MyID verified). `tier_1` attempts route to
  the upgrade flow ([`flow-06-tier-upgrade.md`](./flow-06-tier-upgrade.md)).
- At least one `linked_cards` row with `status=active`. Zero-cards user
  routes to card-linking ([`flow-03-card-linking.md`](./flow-03-card-linking.md)).
- Daily / monthly headroom available (else trips
  `LIMIT_DAILY_EXCEEDED` / `LIMIT_MONTHLY_EXCEEDED`)
- Network connectivity (FX quote + 3DS require online)

## State machine (Transfer)

`(none)` → `transfers` row written with `status=created` → user confirms
+ acquirer auth captured → `processing` → provider (Alipay/WeChat) ack →
`completed` | `failed` (per `error_codes.failure_code`) | `reversed`
(after a partial / late provider response, see recovery flow).

## Screen sequence

1. **Entry** — multiple paths:
   - Tab bar "Send" (default for `tier_2`)
   - Home-screen primary "Send money" CTA
   - Recipient detail "Send to {name}" CTA (skips step 2)
   - History detail "Send again" on a completed transfer (pre-fills
     recipient + amount, user re-confirms)
2. **Recipient picker**
   - Top: tab strip — "Saved" (default) | "New" (visible only if at
     least 1 saved recipient exists)
   - Saved tab:
     - Search input (filters across CN name + Alipay handle / WeChat
       OpenID + saved alias)
     - List of recipient rows (foundation ListRow), each showing:
       - Avatar (initial of CN name, or scheme-icon if user added with
         no name)
       - Recipient display name (CJK rendered verbatim — never
         transliterated; per shared-context)
       - Destination chip (Alipay or WeChat)
       - Last-sent relative time
       - Star icon if `is_favorite=true`
     - Empty saved state (first-time): full-screen empty illustration
       + primary "Add new recipient" CTA → routes to step 3 sub-flow
   - New tab: routes to step 3 sub-flow (recipient creation)
3. **Recipient — new (sub-flow)**
   - Page heading: "Who are you sending to?"
   - Destination toggle (Alipay | WeChat) — segmented control,
     foundation primitive, full-width
   - Identifier field (changes per destination):
     - Alipay: phone number OR email OR Alipay user ID
     - WeChat: WeChat ID OR phone number
   - Display name field (CJK or Latin, max 64 chars)
   - Optional alias field ("How you'll find them in your saved list")
   - Save toggle ("Save to saved recipients") — default on
   - Sticky-bottom CTA: "Continue" → returns to step 4 with this
     recipient pre-selected
4. **Amount entry**
   - Top app bar: back arrow, recipient summary chip (avatar + name +
     destination)
   - Amount input — large display-1 numeric, locale-aware separators
     (per [`.claude/rules/money-and-fx.md`](../../../.claude/rules/money-and-fx.md)):
     - Default focus = UZS field
     - Live-computed CNY display below in slate-700 muted
     - Toggle to flip "I want recipient to receive X CNY" (recomputes
       UZS in real time using current quote)
   - Tier-headroom meter (foundation pattern):
     - Daily: `1 200 000 / 5 000 000 UZS` `24%` (color when ≥80% used)
     - Monthly: `8 400 000 / 50 000 000 UZS` `17%`
     - Hidden on `tier_0` (since 0/0)
   - Sticky-bottom CTA: "Continue" — disabled when amount = 0 OR
     amount > tier per-tx limit OR amount > daily-headroom
5. **Review (the heart of the flow)**
   - Recipient summary block at top (avatar + name + destination +
     "Edit" link → returns to step 2)
   - Send-money breakdown (canonical line set per `money-and-fx.md`):
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
   - Rate-lock countdown chip below the rate line: `Rate locked for 02:34`
     — color shifts amber when ≤ 30s, danger when expired
   - Card picker (foundation card-row primitive):
     - Default = user's `is_default` card
     - Tap → bottom sheet listing all `status=active` cards with
       scheme-logo + masked PAN; an "+ Add another card" tile at the
       bottom routes to card-linking
     - International-card disclosure: when Visa / MC selected, the fee
       differential is shown inline ("Service fee: 75 000.00 UZS (1.5%
       — international card)")
   - Notes field (optional, max 100 chars) — sub-line
   - Sticky-bottom primary CTA: "Confirm and send"
   - Below the CTA: tiny disclaimer line "By confirming, you agree to
     the locked rate above. The rate cannot change after you tap
     confirm."
6. **3DS WebView (when required by issuer / first-card-use)**
   - Same chrome as flow-03 step 5: top app bar with "Cancel", branded
     loading state before WebView mount, return to step 5 on cancel
   - On exit: detect via redirect URL → step 7 (success path) or
     step 9 (failure path)
7. **Submitting (loading)**
   - Calm full-screen loading state — branded illustration
     ("paper-airplane" or similar abstract calm icon)
   - Text: "Sending {amount} CNY to {name}…"
   - Status hint: "Status updates appear here as the transfer
     progresses." (Optimistic — most transfers complete in seconds.)
   - **No cancel CTA** — once `processing`, the transfer cannot be
     cancelled by the user (system / admin only per
     [`.claude/rules/status-machines.md`](../../../.claude/rules/status-machines.md))
   - This screen auto-navigates to step 8 (receipt) when status moves
     to `completed`, OR step 9 (failure) when status moves to `failed`
8. **Receipt — success**
   - Hero tick (success-700, scale-in)
   - Hero amount: `3 600.00 CNY` in display-1; secondary line `(from
     5 055 000.00 UZS)` in slate-600
   - Status timeline (4 events per `transfer_events`):
     1. ✓ Created
     2. ✓ Auth captured
     3. ✓ Sent to Alipay (or WeChat)
     4. ✓ Completed
   - Recipient block (read-only summary)
   - Card used block (masked PAN + scheme logo)
   - Locked rate + fee breakdown (collapsible, opens to the same line
     set as step 5)
   - Action row:
     - "Send again" (primary) → returns to step 4 with this recipient
       + amount pre-filled
     - "Share receipt" (secondary) → opens share sheet (PDF or
       PNG of the receipt)
     - "Download receipt" (tertiary) → saves PDF to device
   - "Back to home" link
9. **Status — failure**
   - Hero icon (calm, NOT alarming red — per `error-ux.md`)
   - Heading + body: per `error_codes.message_*` /
     `suggested_action_*`
   - Primary CTA: per `retryable` flag
     - `CARD_DECLINED`: "Try another card" → routes back to step 5
       with same amount + recipient + fresh card picker
     - `INSUFFICIENT_FUNDS`: "Top up your card" + "Try another card"
     - `FX_STALE`: refetch rate inline, return to step 5 with the
       refreshed quote (don't navigate away)
     - `LIMIT_*_EXCEEDED`: "Split transfer" or "Wait until tomorrow"
       (no retry until limit resets)
     - `SANCTIONS_HIT`: NO retry — calm-review pattern, body says
       "We're reviewing this transfer for compliance. We'll notify
       you within 24 hours." (per `error-ux.md`)
     - `PROVIDER_UNAVAILABLE`: "We're confirming this — we'll
       notify you when it's done"
   - Secondary CTA: "Contact support"
   - Tertiary "Back to home"
   - Status timeline still shows what was achieved before the failure
     (helps user understand "Was my card charged?")
10. **Status — reversed (post-completion / partial)**
    - Triggered by the recovery flow, not in the user's main path
    - Body: "We had to reverse this transfer. The full amount has been
      refunded to your card."
    - Status timeline shows the full progression including the
      reversal event with timestamp
    - No retry CTA (the user can start a fresh send-money if they
      want); "Contact support" if they have questions

## States to render (per screen)

| State | Recipient | Amount | Review | 3DS | Submitting | Receipt | Failure |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Idle | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Loading | search debounce | rate refetch | rate refetch | mounting | ✓ | — | — |
| Empty | first-time saved | — | — | — | — | — | — |
| Validation error | new-recipient | over-limit | rate stale | — | — | — | — |
| Network offline | banner | banner | banner | banner | hold + retry | banner | banner |
| Server 5xx | banner | banner | banner | banner | retry-on-reconnect | — | inline |
| Rate locked, ≤30s | — | — | amber chip | — | — | — | — |
| Rate expired | — | — | refetch button replaces CTA | — | — | — | — |

## Error states (sourced from `error_codes`)

- Tier_1 user attempts entry → routed to upgrade flow before this flow
  begins; never lands here
- Recipient destination invalid (Alipay handle doesn't exist) →
  `RECIPIENT_INVALID` non-retryable inline at step 3 ("Verify the
  Alipay/WeChat handle")
- Amount over per-tx → `LIMIT_PER_TX_EXCEEDED` inline at step 4
  with "Split transfer" suggestion
- Amount over daily / monthly → `LIMIT_DAILY_EXCEEDED` /
  `LIMIT_MONTHLY_EXCEEDED` inline at step 4
- Rate quote stale at confirm → `FX_STALE` retryable inline at step 5
- Card declined → `CARD_DECLINED` retryable, surface "Try another
  card" sheet
- Card has insufficient funds → `INSUFFICIENT_FUNDS` retryable
- 3DS challenge failed → `THREE_DS_FAILED` retryable
- Provider down (Alipay/WeChat) → `PROVIDER_UNAVAILABLE` calm-review
  pattern, transfer stays in `processing` and notifies user when it
  resolves
- Sanctions / AML hit → `SANCTIONS_HIT` calm-review pattern, NO retry,
  no underlying reason exposed; transfer stays in a hold state until
  reviewer disposition

## Edge cases to surface in the design

- Rate-lock countdown hits 0 mid-review → "Rate expired" pattern: the
  Confirm CTA is replaced with a "Refresh rate" CTA; on refresh, if
  the new quote is within ±0.5%, silently substitute and re-arm; if
  outside, render a diff banner ("Rate moved — was 1404.17, now
  1411.08 UZS / CNY") that requires explicit re-acknowledge before
  Confirm becomes available again
- User backgrounds the app during step 7 (submitting) → returning to
  foreground: status hydrates from server (cached optimistic if
  offline) and lands the user at step 8 / 9 / 10 as appropriate
- User attempts the same recipient + amount twice within ~10s →
  client-side soft duplicate guard ("You sent this same amount to
  {name} 8 seconds ago — send another?") with explicit confirm
- User offline at step 5 confirm → CTA disabled with WriteButton
  offline tooltip per `flow-05-onboarding`'s pattern; rate-lock
  countdown freezes when offline (no penalty)
- Card removed mid-flow → if the user removes the selected card from
  card-management while review is open in another part of the app
  (multi-tab on web; not really possible on native, but for parity
  the design must handle it gracefully on review-screen mount)
- First-card-use 3DS: every newly-linked card (or any card without a
  recent successful 3DS handshake) will trigger 3DS even on
  send-money flow → screen budget for the WebView regardless of
  card-linking step's 3DS pass

## Acceptance criteria (Gherkin fragments)

```
GIVEN  user.kyc_tier = tier_2
AND    user has 1+ active linked cards
AND    user_limit_usage.daily_used + amount ≤ tier_2.daily_limit_uzs
WHEN   user picks a saved recipient
AND    enters an amount
AND    reviews the FX + fees + locked rate
AND    confirms with a card that doesn't trigger 3DS
THEN   transfers row created (status=created)
AND    transfer_events row inserted (event=created, actor=user)
AND    fx_rates locked snapshot captured on the transfer row
AND    status moves to processing within 2s
AND    user_limit_usage row debited
AND    receipt screen renders with status timeline showing the
       progression

GIVEN  the rate-lock countdown reaches 0 mid-review
WHEN   user attempts to tap Confirm
THEN   Confirm CTA is replaced with "Refresh rate"
AND    on refresh, if rate moved beyond ±0.5%, a diff banner renders
       AND the user must re-acknowledge before Confirm becomes
       available again

GIVEN  the FX quote refresh fails (provider down)
WHEN   the user is on the review screen
THEN   error_codes.FX_STALE message renders inline
AND    the Confirm CTA stays disabled
AND    "Try again" CTA refetches without leaving the screen

GIVEN  user submits a transfer
AND    the issuer returns CARD_DECLINED
WHEN   the failure screen renders
THEN   transfers.status = failed
AND    transfer_events row inserted (event=failed, failure_code=
       CARD_DECLINED)
AND    user_limit_usage NOT debited
AND    primary CTA "Try another card" returns to review with same
       amount + recipient and fresh card picker

GIVEN  the AML engine flags the transfer as SANCTIONS_HIT
WHEN   the failure screen renders
THEN   no retry CTA visible
AND    no AML reason exposed in the body
AND    body says "We're reviewing this transfer for compliance.
       We'll notify you within 24 hours."
AND    "Contact support" is the only primary CTA
```

## Telemetry to consider

- `send.entry` (with entry surface — tab / home / recipient / history)
- `send.recipient.pick` (saved vs new)
- `send.amount.entered`
- `send.amount.over-limit` (with limit type)
- `send.review.view`
- `send.review.rate-expired`
- `send.review.rate-refresh.tap`
- `send.review.rate-diff` (with old → new)
- `send.review.card-pick`
- `send.review.confirm.tap`
- `send.three-ds.start`
- `send.three-ds.success`
- `send.three-ds.fail` (with error_code)
- `send.complete`
- `send.failed` (with error_code)
- `send.reversed` (post-completion)

## Cross-references

- Send sequence: [`docs/mermaid_schemas/transfer_send_flow.md`](../../../docs/mermaid_schemas/transfer_send_flow.md)
- Status state machine: [`docs/mermaid_schemas/transfer_state_machine.md`](../../../docs/mermaid_schemas/transfer_state_machine.md)
- Failure recovery: [`docs/mermaid_schemas/transfer_failure_recovery_flow.md`](../../../docs/mermaid_schemas/transfer_failure_recovery_flow.md)
- Money & FX rules: [`.claude/rules/money-and-fx.md`](../../../.claude/rules/money-and-fx.md)
- Tier rules: [`.claude/rules/kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md)
- Status display: [`.claude/rules/status-machines.md`](../../../.claude/rules/status-machines.md)
- Error UX: [`.claude/rules/error-ux.md`](../../../.claude/rules/error-ux.md)
- Send-money surface design prompt: [`../surfaces/05-send-money-screens.md`](../surfaces/05-send-money-screens.md)
- Receipt surface design prompt: [`../surfaces/07-receipt-screens.md`](../surfaces/07-receipt-screens.md)
