# Prompt — History screens (List · Filter sheet · Detail)

> **How to use:** open a fresh Claude.ai conversation. Paste in this order:
>
> 1. [`../00-shared-context.md`](../00-shared-context.md) (full content)
> 2. [`../01-foundation.md`](../01-foundation.md) (or rendered output)
> 3. [`../user-flows/flow-05-history.md`](../user-flows/flow-05-history.md)
> 4. This file
>
> The receipt component used on the detail screen is shared with the
> post-send experience — render the canonical receipt block in
> [`./07-receipt-screens.md`](./07-receipt-screens.md). On this surface
> we focus on its read-only re-mount inside History.

---

## What I want from this pass

Design the **History screen group** end to end:

1. **List** — virtualized, with sticky day-dividers + search + filter
   chip-row + per-row status badges
2. **Filter sheet** — multi-dimension filter (status, destination,
   date range, card)
3. **Detail** — read-only receipt with status timeline + failure block
   + action row (Send again / Share / Download / Copy ID)
4. **Empty states** — first-time user vs no-filter-results vs offline-
   cached
5. **Failure / reversed detail variants** — error block + reversal
   banner + status timeline showing failure point

Render at 390 × 844pt mobile viewport. Multiple frames per screen for
the states listed in
[`../user-flows/flow-05-history.md`](../user-flows/flow-05-history.md).

## Per-screen designs

### Screen 1 — List

**Layout** (top → bottom):

- App bar: "History" wordmark heading; right-side icons:
  - Filter icon (lucide `sliders-horizontal`) — brand-50 tinted when
    any filter is active; small dot-indicator on the icon top-right
    when filters applied
  - 3-dot kebab → contextual sheet (Export to PDF — out of scope for
    v1 mock; placeholder)
- Search input — full-width below app bar, foundation Input primitive,
  search-icon leading, clear-X trailing when filled. Debounced 300ms.
  Searches:
  - Recipient name (CN / Latin)
  - Recipient handle / WeChat ID
  - Transfer ID prefix (first 12 chars, mono)
  - Amount numeric (locale-aware separator stripped before match)
- Filter chip row — horizontally scrollable on narrow viewports:
  - **Status** (single-chip): All | Completed | Processing | Failed |
    Reversed (chip icon when collapsed, opens single-select sheet on
    tap)
  - **Destination** (multi-chip): Alipay | WeChat (each with logo;
    chip count badge if 2 selected)
  - **Date range** (chip): default "Last 30 days"; tap opens date-
    range picker sheet
  - **Card** (multi-chip): masked PAN per linked card (active +
    frozen + expired + removed — user may want to look up history
    on a now-removed card)
  - All chips have consistent rhythm — h-10 brand-50 surface when
    active, slate-100 when inactive; foundation Chip primitive
- List body — virtualized list (foundation ListRow, dense variant):
  - Avatar (recipient initial or scheme icon if no name)
  - Title row: recipient name + DestinationBadge chip
  - Subtitle: relative timestamp (Apr 30, 2026 at 3:26 PM, locale-
    aware) + masked PAN of the card used (mono, slate-500)
  - Right side, top: amount CNY — display-2 weight, mono numerics
  - Right side, bottom: amount UZS — body small, slate-500 (sub-
    line of CNY)
  - Right side: StatusBadge (foundation primitive) — completed =
    success-tone; processing = brand-tone with subtle pulse
    animation; failed = danger-tone; reversed = warning-tone
- Sticky day-divider headers as the user scrolls:
  - "Today" / "Yesterday" / "Apr 30, 2026" — locale-aware date
    format per shared-context (uz/ru: `DD.MM.YYYY`; en: `MMM D,
    YYYY`)
  - Foundation Section-Header primitive, slate-500 uppercase
    tracking-wider exception (chip-style label, NOT body text — per
    LESSON 2026-04-29)
- Long-press row → context sheet:
  - "Send again" → routes to send-money flow with this recipient +
    amount pre-filled (see [`./05-send-money-screens.md`](./05-send-money-screens.md))
  - "Share receipt"
  - "Copy transfer ID"
- Tap row → step 3 (detail)

**States**:
- Idle — populated (10+ rows, multiple day-dividers visible)
- Idle — single row (one transfer ever — should not show the day-
  divider strip with rich format; just one row + small "Today" label)
- Empty — first-time user (full-screen empty illustration, line-
  illustration of an envelope or clock; copy "Your transfers will
  appear here" + primary "Send your first transfer" CTA)
- Empty — no results from filter ("No transfers match" + "Clear
  filters" link)
- Loading — initial mount (8 row skeletons matching the list-row
  shape: avatar circle + 2 text lines + amount block + status badge
  block; 350ms cadence)
- Loading — pagination at bottom of list (small spinner + "Loading
  more…")
- Network offline (banner at top: "You're offline · Cached from {time}";
  list shows last-cached 100 rows; filter + search work over the
  cached set)
- Network offline + scrolled past cached set ("Reconnect to see older
  transfers" inline at the bottom of the list)
- Server 5xx (full-screen calm error pattern + "Try again" CTA)
- Filter applied — chip row shows active filters as separate
  highlighted chips at the top with X-clear affordance per chip
- Search debounce active — subtle skeleton overlay on the list
- Long-press context sheet open
- Dark mode

### Screen 2 — Filter sheet

**Layout** (foundation Sheet primitive, full-snap; the sheet replaces
the screen for richer filter editing):

- Sheet handle at top
- Heading row: "Filter transfers" left, "Reset" link right (slate-700,
  body)
- Status section (single-select, foundation RadioCard primitive):
  - "All" (default)
  - "Completed" (success-tone icon)
  - "Processing" (brand-tone icon)
  - "Failed" (danger-tone icon)
  - "Reversed" (warning-tone icon)
- Destination section (multi-select, foundation CheckboxCard primitive):
  - "Alipay" (with logo)
  - "WeChat" (with logo)
- Date range section (custom chip + drawer):
  - Default chip "Last 30 days" (slate-tinted)
  - Tap → expands to a 4-tab date-range presets row + date-range
    picker (custom range)
- Card section (multi-select, foundation CheckboxCard primitive):
  - One row per linked card — scheme logo + masked PAN + status
    suffix ("frozen" / "expired" / "removed" if applicable)
- Sticky-bottom row: "Apply N filters" primary CTA + "Cancel" tertiary

**States**:
- Idle (no filters applied)
- Filters applied (CTA reads "Apply 3 filters")
- Date range — custom range picker open
- Card list empty (rare — user has 0 linked cards) — Card section
  hidden entirely
- Network offline (banner at top of sheet)
- Dark mode

### Screen 3 — Detail (read-only receipt + timeline)

This screen shares its receipt component with
[`./07-receipt-screens.md`](./07-receipt-screens.md) — render the
canonical receipt block; this section calls out the read-only
adaptations.

**Layout** (top → bottom):

- App bar: back arrow + transfer-id chip mono (tap-to-copy with
  `useCopyFeedback` pattern: `Copy → Check` icon swap, `text-
  success-700` flip for 1.5s)
- Status hero block:
  - Status icon (success-700 / brand-600 / danger-600 / warning-600
    per state)
  - Hero amount in display-1 (CNY received OR UZS sent — picker toggle
    chip below; default CNY for completed, UZS for failed/processing/
    reversed)
  - StatusBadge below hero
  - Timestamp sub-line: "Sent on Apr 30, 2026 at 3:26 PM"
- Status timeline (canonical pattern from
  [`../../../.claude/rules/status-machines.md`](../../../.claude/rules/status-machines.md)):
  - Foundation StatusTimeline primitive, mobile variant
  - Marker column (filled circle = past, ring = current, hollow =
    future)
  - Lines between events solid for past-to-past, dashed for current-
    to-future
  - Per event: timestamp + actor (user / system / provider / admin) +
    body line
  - For `completed` transfers, all 4 events shown as solid past:
    1. ✓ Created (timestamp + "by you")
    2. ✓ Auth captured (timestamp + "by system")
    3. ✓ Sent to {Alipay|WeChat} (timestamp + "by provider")
    4. ✓ Completed (timestamp + "by provider")
  - For `failed` transfers: events progressed up to failure point
    are solid; failure event is danger-toned circle with localized
    error message
  - For `reversed` transfers: completed timeline + appended ✗
    Reversed event in warning-tone
- Failure block (when `status=failed`) — appears below the timeline:
  - Heading: localized `error_codes.message_*`
  - Body: localized `error_codes.suggested_action_*`
  - Primary CTA per `retryable` flag — see flow-04 step 7 list
  - For `SANCTIONS_HIT`: calm-review body, NO retry, only "Contact
    support"
- Reversal block (when `status=reversed`):
  - Heading: "Transfer reversed"
  - Body: "Reversed on {date} at {time} — full amount refunded to
    your card."
  - Card masked PAN line (brand-tinted) → tap routes to card-mgmt
- Recipient block (read-only summary): avatar + name + DestinationBadge
  + handle/ID
- Card used block: scheme logo + masked PAN + cardholder + tap → routes
  to card-mgmt for that card
- Locked rate + fee breakdown (collapsible, opens to canonical
  send-money review line set per `money-and-fx.md`):
  - Default state: collapsed, single chip "View fees + rate"
  - Expanded state: full breakdown with `(locked)` suffix on rate
    line — this is historical rate, NOT current
- Notes block (if user added a note pre-confirm):
  - Heading: "Your note"
  - Body: the note content
- Action row at bottom (sticky-bottom, foundation ActionBar primitive):
  - Primary "Send again" — visible for ALL statuses (including
    failed; user can retry with same recipient + amount, fresh quote)
  - Secondary "Share receipt" → opens share sheet (PDF or PNG)
  - Tertiary "Download receipt" → saves PDF to device
  - Tertiary "Copy transfer ID" — copy-feedback pattern
- "Back to History" link (centered above sticky-bottom action bar)

**States**:
- Status — completed (full timeline, all 4 events solid)
- Status — processing (3 events solid + 1 ring (current))
- Status — processing >5 min (warning sub-line "Confirming with
  provider — usually under a minute" — calm, NOT alarming)
- Status — failed (timeline up to failure point + danger event +
  failure block below)
- Status — failed with `SANCTIONS_HIT` (calm-review body, NO retry)
- Status — reversed (full timeline + appended reversal event +
  reversal block)
- Action: Send-again attempt on `SANCTIONS_HIT`-failed transfer —
  soft-block sheet "Please wait while we review your previous
  transfer."
- 404 — transfer no longer available (retention TTL or admin force-
  purge): centered foundation full-screen state, "This transfer is
  no longer available." + "Back to History" CTA
- Network offline — detail still renders from cached data; live
  status fields render with "Last updated 2 min ago" disclaimer
- Server 5xx — calm error with retry
- Notes block hidden (no note attached)
- Locked-rate breakdown collapsed / expanded variants
- Reduced motion (timeline event scale-in becomes instant)
- Dark mode

## Cross-screen patterns

### App bar pattern

- Wordmark on list (no back arrow — this is a tab-bar root)
- Back arrow on detail
- Right-side icons on list: filter + kebab (consistent right-side
  density)
- Transfer-ID chip on detail (mono, tap-to-copy) — replaces the
  heading text since the ID is the canonical handle

### Bottom safe-area

- Tab bar respects iOS home-indicator on list (extra 16pt)
- Detail action bar respects home-indicator (sticky-bottom, full-
  width per the canonical pattern from admin's Phase 14 — `fixed
  inset-x-0 bottom-0` overlay equivalent on mobile)

### Pull-to-refresh on list

- Triggers refetch of the list (not the cached subset — actively
  pulls from server)
- Honors reduced-motion (instant refetch instead of bouncy spring)

### Sticky day-dividers

- Day labels remain pinned to the top of the visible list as the
  user scrolls past their group
- Formatted per locale: uz/ru = `DD.MM.YYYY` (with "Bugun" / "Сегодня"
  / "Today" relative); en = `MMM D, YYYY`

## Localization annotations

Render each text string with its i18n key inline. Suggested keys:

```
mobile.history.list.heading
mobile.history.list.search.placeholder
mobile.history.list.filter.icon-aria
mobile.history.list.filter.chip.status.all
mobile.history.list.filter.chip.status.completed
mobile.history.list.filter.chip.status.processing
mobile.history.list.filter.chip.status.failed
mobile.history.list.filter.chip.status.reversed
mobile.history.list.filter.chip.destination.alipay
mobile.history.list.filter.chip.destination.wechat
mobile.history.list.filter.chip.date-range.last-30d
mobile.history.list.filter.chip.date-range.last-90d
mobile.history.list.filter.chip.date-range.custom
mobile.history.list.filter.chip.card.label
mobile.history.list.day-divider.today
mobile.history.list.day-divider.yesterday
mobile.history.list.empty.first-time.title
mobile.history.list.empty.first-time.subline
mobile.history.list.empty.first-time.cta
mobile.history.list.empty.no-results.title
mobile.history.list.empty.no-results.cta-clear
mobile.history.list.context.send-again
mobile.history.list.context.share
mobile.history.list.context.copy-id
mobile.history.list.offline.cached-from (with {time})
mobile.history.list.offline.reconnect-for-older
mobile.history.filter-sheet.heading
mobile.history.filter-sheet.reset
mobile.history.filter-sheet.section.status
mobile.history.filter-sheet.section.destination
mobile.history.filter-sheet.section.date-range
mobile.history.filter-sheet.section.card
mobile.history.filter-sheet.cta-apply (with {n})
mobile.history.filter-sheet.cta-cancel
mobile.history.detail.id-chip-aria
mobile.history.detail.hero.sent-on (with {date} {time})
mobile.history.detail.hero.toggle-uzs
mobile.history.detail.hero.toggle-cny
mobile.history.detail.timeline.created
mobile.history.detail.timeline.auth-captured
mobile.history.detail.timeline.sent-to-alipay
mobile.history.detail.timeline.sent-to-wechat
mobile.history.detail.timeline.completed
mobile.history.detail.timeline.failed
mobile.history.detail.timeline.reversed
mobile.history.detail.timeline.processing-stuck (with {duration})
mobile.history.detail.failure.cta-support
mobile.history.detail.reversal.heading
mobile.history.detail.reversal.body (with {date} {time})
mobile.history.detail.recipient.heading
mobile.history.detail.card.heading
mobile.history.detail.breakdown.toggle.collapsed
mobile.history.detail.breakdown.toggle.expanded
mobile.history.detail.notes.heading
mobile.history.detail.action.send-again
mobile.history.detail.action.share
mobile.history.detail.action.download
mobile.history.detail.action.copy-id
mobile.history.detail.send-again.soft-block.sanctions
mobile.history.detail.404.title
mobile.history.detail.404.body
mobile.history.detail.404.cta
mobile.history.detail.offline.last-updated (with {time})
```

**Longest-translation test**: render the Russian variant of the
detail-page hero subline ("Отправлено 30 апреля 2026 года в 15:26") —
verify it doesn't wrap or push the StatusBadge out of frame.

## Accessibility annotations

- Tap-target sizes: list rows ≥ 64pt; chip row chips ≥ 44pt × 36pt
  (height fine for chips by spec); StatusBadge purely informational
  (no tap target)
- Focus order on list:
  1. App bar back (none on list — wordmark heading) / Filter icon /
     Kebab
  2. Search input
  3. Each filter chip (left → right)
  4. Each list row (top → bottom, with day-dividers as headings —
     screen reader announces them as headers)
- Focus order on detail:
  1. Back arrow
  2. Transfer-ID chip (copy)
  3. Hero amount + status (single utterance)
  4. Each timeline event (top → bottom — with the actor announced)
  5. Failure block CTAs (when present)
  6. Reversal block (when present)
  7. Recipient block
  8. Card block
  9. Breakdown toggle (then breakdown rows when expanded)
  10. Notes block (when present)
  11. Action bar buttons left → right
- Screen-reader labels:
  - StatusBadge: "Status: completed" / "Status: processing, 5
    minutes elapsed" / "Status: failed, card declined" — pull from
    `error_codes.message_*` for failed
  - Timeline events: "Created at 3:26 PM by you, completed" /
    "Failed at 3:27 PM by provider, card was declined"
  - Hero amount in CNY mode: "Recipient received 3,600 yuan"
  - Hero amount in UZS mode: "You sent 5,055,000 som"
  - Reversal banner: "This transfer was reversed on May 1, 2026.
    Full amount refunded to your card."
- Reduced-motion fallback:
  - Pulse on processing rows: static (StatusBadge stays one tone)
  - Day-divider sticky reflow: still works; just no smooth slide
  - Action-bar slide-in from bottom on detail mount: instant
- Color-only signals removed: StatusBadge always pairs color WITH
  icon AND text label

## Microinteractions to render

- Pull-to-refresh: spinner appears, list refetches, success → spinner
  fades, "Updated just now" sub-line at top of list (auto-clears 3s)
- Search debounce: 300ms after typing stops, list filters (no jank)
- Filter chip-tap: chip pop-in 150ms (slate → brand-50 surface, color
  transition); reduced-motion → instant
- Long-press list row: subtle haptic (200ms) + context sheet slides
  up (250ms ease-out)
- Detail mount: status timeline events stagger-fade-in (150ms each,
  starting from oldest); reduced-motion → all instant
- Detail copy-id: icon swap with `text-success-700` 1.5s flip
  (matching admin's Phase 14 pattern)
- Detail breakdown toggle: chevron rotates 180° (200ms ease-out);
  body slides down (300ms ease-out); reduced-motion → instant

## Output format checklist

- [ ] Single Claude.ai artefact, mobile viewport 390pt
- [ ] React + Tailwind, using foundation tokens
- [ ] All 3 screens × all listed states (~30 frames total — list
      alone has 12 listed states)
- [ ] Light + dark variants
- [ ] Russian-longest-translation test on detail hero subline
- [ ] All copy annotated with i18n keys
- [ ] Microinteractions annotated with arrows + 1-line description
- [ ] Accessibility focus order overlaid on list AND detail
- [ ] Acceptance criteria (Gherkin) appended at the end (extending
      seeds from `flow-05-history.md`)

## Forbidden in this pass

- ❌ Inventing transfer states (only `created`, `processing`,
  `completed`, `failed`, `reversed` per
  [`../../../docs/mermaid_schemas/transfer_state_machine.md`](../../../docs/mermaid_schemas/transfer_state_machine.md))
- ❌ User-controllable retry/cancel CTAs ON the list rows (status
  moves only via system / provider / admin)
- ❌ Showing AML reasons on `SANCTIONS_HIT` failures (calm-review
  pattern per `error-ux.md`)
- ❌ Re-computing the FX rate on the breakdown — historical rate is
  immutable per `money-and-fx.md`
- ❌ Showing the full PAN of any card on the detail screen
- ❌ Top-of-list "promo" banners ("Try sending to a new recipient")
  — keep History calm and read-only
- ❌ Sticky filter chip row across the entire list (chip row scrolls
  with content — only the day-dividers stick)

## Cross-references

- Foundation: [`../01-foundation.md`](../01-foundation.md)
- Flow plan: [`../user-flows/flow-05-history.md`](../user-flows/flow-05-history.md)
- Receipt component (shared with post-send): [`./07-receipt-screens.md`](./07-receipt-screens.md)
- Send-money flow (Send-again deep link target): [`./05-send-money-screens.md`](./05-send-money-screens.md)
- Status state machine: [`../../../docs/mermaid_schemas/transfer_state_machine.md`](../../../docs/mermaid_schemas/transfer_state_machine.md)
- Status display rules: [`../../../.claude/rules/status-machines.md`](../../../.claude/rules/status-machines.md)
- Money & FX: [`../../../.claude/rules/money-and-fx.md`](../../../.claude/rules/money-and-fx.md)
- Error UX: [`../../../.claude/rules/error-ux.md`](../../../.claude/rules/error-ux.md)
- Localization: [`../../../.claude/rules/localization.md`](../../../.claude/rules/localization.md)
- Accessibility: [`../../../.claude/rules/accessibility.md`](../../../.claude/rules/accessibility.md)
