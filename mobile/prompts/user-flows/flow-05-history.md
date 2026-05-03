# User Flow — Transfer history (browse, search, filter, view detail)

> Plans the screen sequence + state machine for browsing past transfers —
> the second-most-frequent surface after Send. Read-only views over the
> `transfers` table; the only mutator on this surface is "Send again"
> which deep-links into [`flow-04-send-money.md`](./flow-04-send-money.md).
> The matching surface prompt is
> [`../surfaces/06-history-screens.md`](../surfaces/06-history-screens.md).
>
> Canonical sources of truth:
> - [`docs/mermaid_schemas/transfer_state_machine.md`](../../../docs/mermaid_schemas/transfer_state_machine.md)
> - [`.claude/rules/status-machines.md`](../../../.claude/rules/status-machines.md)
> - [`.claude/rules/money-and-fx.md`](../../../.claude/rules/money-and-fx.md)
> - [`docs/models.md`](../../../docs/models.md) — `transfers`,
>   `transfer_events`, `recipients`

## Goal

Let the user find any past transfer fast (most-recent default; search +
filter when scanning); read its full status timeline; and trigger a
"Send again" or download/share receipt without re-entering all the data.

## Out of scope (covered by other flows)

- Creating a new transfer ([`flow-04-send-money.md`](./flow-04-send-money.md))
- Receipt screen for the just-completed transfer (lives in
  [`flow-04-send-money.md`](./flow-04-send-money.md) step 8 — same component
  is reused here for completed-transfer detail)
- Card-management edits ([`flow-07-card-management.md`](./flow-07-card-management.md))

## Prerequisites

- User is at least `tier_1` (history is visible from `tier_1` so the user
  can see their account is set up — but `tier_1` only ever has 0 rows)
- Network connectivity (history is a server-driven list; cached for
  offline view, capped at last 100 rows)

## State machine (Transfer — read-only viz)

History never mutates state — it visualizes the canonical machine:
`created` → `processing` → `completed` | `failed` | `reversed`. Per
[`.claude/rules/status-machines.md`](../../../.claude/rules/status-machines.md),
designs MUST NOT invent states or expose user-controllable transitions.

## Screen sequence

1. **List entry**
   - Reached from tab bar "History" (third tab) OR from home-screen
     "Recent activity" "View all →" link
   - Top app bar: "History" wordmark heading; right-side filter icon
     (lucide `sliders-horizontal`) badge-tinted brand-50 when any
     filter is active
2. **List**
   - Search input — full-width, foundation Input primitive, search-icon
     leading, clear-X trailing when filled. Debounced 300ms.
     Searches across:
     - Recipient name (CN or alias)
     - Recipient destination handle (Alipay handle / WeChat ID)
     - Transfer ID prefix (first 12 chars, mono)
     - Amount (numeric — matches UZS or CNY; locale-aware separators
       on entry stripped before matching)
   - Filter chip row beneath search (horizontally scrollable on
     narrow viewports):
     - Status (single-chip): All | Completed | Processing | Failed |
       Reversed (chip icon-only when collapsed; tap opens single-select
       sheet)
     - Destination (multi-chip): Alipay | WeChat (each with logo)
     - Date range (chip): default "Last 30 days"; tap opens date-range
       picker sheet
     - Card (multi-chip): masked PAN per linked card — tap opens
       checkbox sheet listing user's cards (active + frozen + expired
       + removed; user may want to look up history on a now-removed
       card)
   - List body — virtualized list (foundation ListRow, dense variant):
     - Avatar (recipient initial or scheme icon if no name)
     - Title row: recipient name + destination chip (small, foundation
       DestinationBadge)
     - Subtitle: relative timestamp + masked PAN of the card used
     - Right side:
       - Amount (CNY) in display-2 weight; UZS-equivalent in slate-500
         body small below
       - Status badge (foundation StatusBadge):
         - completed → success-tone
         - processing → brand-tone with motion (subtle pulse animation)
         - failed → danger-tone
         - reversed → warning-tone
   - Sticky day-divider headers as the user scrolls ("Today", "Yesterday",
     "Apr 30, 2026") — locale-aware date format
   - Tap row → step 4 (detail)
   - Long-press row → context sheet ("Send again" | "Share receipt" |
     "Copy transfer ID")
3. **Empty / loading / error states**
   - Empty (first-time user): full-screen empty illustration ("Your
     transfers will appear here") + primary "Send your first transfer"
     CTA
   - Empty (no results from filter): smaller inline empty pattern with
     "Clear filters" CTA
   - Loading (initial): 8 skeleton rows matching the list-row shape
     (avatar circle + 2 text lines + amount block); 350ms cadence
     matching admin's KYC Tiers / Services skeleton
   - Loading (pagination): spinner at the bottom of the list
   - Network offline: top-of-screen offline banner; list shows the
     last-cached 100 rows with a "Cached from {time}" sub-line in the
     header chip; search and filter still work over the cached set
   - Server 5xx: full-screen calm error pattern with "Try again" CTA
4. **Detail** — same component as flow-04 step 8 (receipt). Adapted as
   read-only:
   - Top app bar: back arrow + transfer-id chip mono (tap to copy with
     in-place feedback per the Phase 14 `useCopyFeedback` pattern in
     the admin)
   - Status hero block:
     - Status icon (success / processing / danger / warning per state)
     - Hero amount in display-1 (CNY received OR UZS sent — picker
       toggle; default CNY for completed, UZS for failed/processing/
       reversed)
     - Status badge below hero
   - Status timeline (canonical pattern, sourced from
     `transfer_events`): one row per event, with actor (`user` /
     `system` / `provider` / `admin`), timestamp, and status chip.
     Filled circle = past, ring = current, hollow = future. Lines
     between events solid for past-to-past, dashed for current-to-
     theoretical-next (matches admin's StatusTimeline rewrite from
     Phase 3)
   - Failure block (when `status=failed`):
     - Localized `error_codes.message_*` heading
     - Localized `error_codes.suggested_action_*` body
     - Primary CTA per `retryable` flag (e.g. "Try again" routes to
       send-money pre-filled; "Contact support" otherwise)
   - Reversal block (when `status=reversed`):
     - "Reversed on {date} at {time} — full amount refunded to your
       card."
     - Card masked PAN line linking to card-management
   - Recipient block (read-only summary)
   - Card used block (masked PAN, scheme logo)
   - Locked rate + fee breakdown (collapsible, opens to the canonical
     send-money review line set per `money-and-fx.md`)
   - Action row at bottom:
     - "Send again" (primary, foundation Button) — visible for ALL
       statuses (including failed — user retries with same recipient
       + amount, fresh quote and rate-lock)
     - "Share receipt" (secondary) — opens share sheet (PDF or PNG)
     - "Download receipt" (tertiary) — saves PDF to device
     - "Copy transfer ID" (tertiary) — copies first-12-chars mono ID
   - "Back to History" link

## States to render (per screen)

| State | List | Detail |
|---|:---:|:---:|
| Idle | ✓ | ✓ |
| Loading (initial) | ✓ skeletons | ✓ skeletons |
| Loading (pagination) | ✓ inline | — |
| Empty (first-time) | ✓ | — |
| Empty (no filter results) | ✓ | — |
| Filter applied | ✓ chips show count | — |
| Search debounce active | ✓ | — |
| Status — completed | rows visible | full hero + timeline |
| Status — processing | rows visible (pulse) | full hero + live updates |
| Status — failed | rows visible | full hero + failure block |
| Status — reversed | rows visible | full hero + reversal block |
| Network offline | banner + cached set | banner + cached row |
| Server 5xx | full error | full error |

## Error states (sourced from `error_codes`)

History itself doesn't trigger user-facing error codes (it's read-only).
The detail screen surfaces `error_codes.message_*` for any transfer in
`failed` state — same code as the original failure (e.g.
`CARD_DECLINED`, `INSUFFICIENT_FUNDS`, `LIMIT_DAILY_EXCEEDED`,
`PROVIDER_UNAVAILABLE`, `SANCTIONS_HIT`, etc.).

For the `SANCTIONS_HIT` case specifically: the detail screen body
copy stays generic per `error-ux.md` calm-review pattern — "We're
reviewing this transfer for compliance. We'll notify you within 24
hours." — never expose the underlying AML reason.

## Edge cases to surface in the design

- User has a `processing` transfer that's been stuck > 5 min →
  badge tone shifts to warning + sub-line "Confirming with provider"
  (matches admin Transfer Detail's stuck-indicator pattern but
  user-friendly)
- User taps "Send again" on a `failed` transfer with `SANCTIONS_HIT`
  → soft-block with "We're still reviewing your previous transfer.
  Please wait." (don't let the user re-attempt the exact same
  recipient + amount until the review resolves)
- User has a `reversed` transfer → "Send again" is visible and
  works normally (the reversal isn't a block on future transfers,
  just a refund on this specific one)
- User scrolls past the last 100-row cache offline → "Reconnect to
  see older transfers" inline at the bottom of the list
- User taps a transfer that's been deleted server-side (rare —
  data retention TTL or admin force-purge) → calm 404 detail screen:
  "This transfer is no longer available." + "Back to History" CTA
- Locked-rate display on a years-old transfer where the FX rate
  source has been deprecated → still shows the historical rate
  (per `money-and-fx.md` rule: "rate immutability after submit")
- Currency-format drift if the user has changed their preferred
  language since the transfer happened → render in CURRENT locale
  format (per `users.preferred_language`); historical raw values
  on the transfer row are unchanged

## Acceptance criteria (Gherkin fragments)

```
GIVEN  user has 23 transfers in the last 90 days
WHEN   user opens the History tab
THEN   the list renders the most recent 50 in DESC order by created_at
AND    sticky day dividers separate by date
AND    pagination loads the next 50 on scroll-end

GIVEN  user is on History list
AND    user types "1500" in the search input
WHEN   debounce settles after 300ms
THEN   the list filters to rows where amount_uzs OR amount_cny matches
       1500 within the loaded set
AND    no full-page reload is triggered

GIVEN  user has 1 transfer in status=processing for >5 min
WHEN   the History list renders
THEN   that row's status badge shows the warning-tone "Confirming with
       provider" sub-line
AND    no user-controllable retry / cancel CTA appears on the row

GIVEN  user taps a transfer in status=failed with error_code=
       SANCTIONS_HIT
WHEN   the detail screen renders
THEN   the failure block body copy is the calm-review pattern (never
       exposes the AML reason)
AND    no retry CTA visible
AND    "Send again" tap shows a soft-block sheet ("Please wait while we
       review your previous transfer.")

GIVEN  user is offline
WHEN   the History tab opens
THEN   offline banner renders at top
AND    the list shows the last-cached 100 rows with a "Cached from
       {time}" sub-line
AND    the detail screen for any cached row renders without network
       (best-effort; live status fields render with a "Last updated
       {time}" disclaimer)
```

## Telemetry to consider

- `history.list.view`
- `history.search.input` (with query length, not query content)
- `history.filter.chip-tap` (with chip type)
- `history.filter.applied` (with chip values)
- `history.row.tap` (with status of tapped row)
- `history.detail.view` (with status)
- `history.detail.send-again.tap`
- `history.detail.share.tap`
- `history.detail.download.tap`
- `history.detail.copy-id.tap`
- `history.list.pagination`
- `history.list.empty.cta-tap` (first-time user only)

## Cross-references

- Status state machine: [`docs/mermaid_schemas/transfer_state_machine.md`](../../../docs/mermaid_schemas/transfer_state_machine.md)
- Status display rules: [`.claude/rules/status-machines.md`](../../../.claude/rules/status-machines.md)
- Money & FX (locked-rate immutability + display): [`.claude/rules/money-and-fx.md`](../../../.claude/rules/money-and-fx.md)
- Error UX (failure block, sanctions calm-review): [`.claude/rules/error-ux.md`](../../../.claude/rules/error-ux.md)
- Send-money flow (Send-again deep link target): [`./flow-04-send-money.md`](./flow-04-send-money.md)
- Surface design prompt: [`../surfaces/06-history-screens.md`](../surfaces/06-history-screens.md)
- Receipt component (shared with flow-04): [`../surfaces/07-receipt-screens.md`](../surfaces/07-receipt-screens.md)
