# Prompt — Notifications screens (Inbox · Filter · Detail · Push handling)

> **How to use:** open a fresh Claude.ai conversation. Paste in this order:
>
> 1. [`../00-shared-context.md`](../00-shared-context.md) (full content)
> 2. [`../01-foundation.md`](../01-foundation.md) (or rendered output)
> 3. [`../user-flows/flow-08-notifications.md`](../user-flows/flow-08-notifications.md)
> 4. This file

---

## What I want from this pass

Design the **notifications screen group** end to end:

1. **Inbox list** — virtualized list with sticky day-dividers, type
   icons, unread dots, optional permission banner
2. **Filter sheet** — type chips + read-state + date-range
3. **Detail** — hero block + body + deep-link CTA
4. **Push permission states** — banner + inline pre-prompt screen
5. **In-app foreground push toast** — when a push arrives while user
   is on a different screen
6. **Empty + offline + 5xx states**

Render at 390 × 844pt mobile viewport. Multiple frames per screen for
the states listed in
[`../user-flows/flow-08-notifications.md`](../user-flows/flow-08-notifications.md).

## Per-screen designs

### Screen 1 — Inbox list

**Layout** (top → bottom):

- App bar: "Notifications" heading; right-side icons:
  - Filter icon (lucide `sliders-horizontal`) — brand-50 tinted when
    any filter is active
  - 3-dot kebab → step 4 inbox-level actions
- **Optional permission banner** (when push permission state =
  denied AND user hasn't dismissed for session):
  - Foundation Banner primitive, slate-tinted
  - Icon: bell-off (lucide), slate-500
  - Title: "Allow notifications"
  - Body: "Get transfer status updates, security alerts, and more."
  - Inline primary CTA: "Allow"
  - Top-right dismiss-X (per-session)
- **List body** (virtualized list, foundation ListRow):
  - Per row:
    - Icon (left, foundation IconBubble — small circle with type-
      tinted icon centered):
      - `transfer` → ArrowUpRight (brand-50 surface, brand-700 icon)
      - `compliance` → Shield (warning-50 surface, warning-700 icon)
      - `security` → Lock (slate-100 surface, slate-700 icon)
      - `card` → CreditCard (slate-100 surface, slate-700 icon)
      - `system` → Info (slate-100 surface, slate-700 icon)
      - `marketing` → Sparkle (slate-50 surface, slate-400 icon —
        least visual weight)
    - Title (top line): bold weight (display-3) if `unread`; regular
      weight if `read`
    - Body (below title): 1-line preview, max 60 chars truncated with
      ellipsis (body, slate-600 if read; slate-700 if unread)
    - Right side: relative timestamp ("47m ago" / "3h ago" / "Apr
      28") in slate-500, body small, tabular-nums
    - Right side bottom: unread dot (8pt, brand-600) only if `unread`
- **Sticky day-divider headers** ("Today" / "Yesterday" / "Apr 28,
  2026") — locale-aware date format
- **Tap row** → step 3 (detail)
- **Long-press row** → context sheet:
  - "Mark as read" / "Mark as unread"
  - "Delete notification"

**States**:
- Idle — populated (mix of read + unread, multiple types, multiple
  day-dividers)
- Idle — all unread (badge max — render with bold rows + dots
  prominently)
- Idle — all read (no dots, regular rows)
- Empty (zero notifications ever): full-screen empty illustration
  (line-illustration of an empty inbox or bell icon) + heading
  "No notifications yet" + sub-line "We'll notify you about transfer
  status, security, and more."
- Empty (zero matching filter): smaller inline empty pattern with
  "Clear filters" CTA
- Initial mount skeleton (8 row skeletons matching the list-row shape)
- Pagination loading (small spinner at the bottom)
- Push permission denied (banner visible above list)
- Push permission granted (no banner)
- Push permission not-yet-asked (banner visible — encouraging tone:
  "Get transfer status updates" with "Allow" CTA)
- Network offline (banner at top below permission banner, list shows
  cached set)
- Server 5xx (full-screen calm error pattern)
- Long-press context sheet open
- Filter applied — chip strip below app bar shows active filters as
  highlighted chips with X-clear affordance
- Dark mode

### Screen 2 — Filter sheet

**Layout** (foundation Sheet primitive, full-snap for richer
filtering):

- Sheet handle at top
- Heading row: "Filter notifications" left, "Reset" link right
- **Type section** (multi-select, foundation CheckboxCard primitive):
  - Each row: type icon + label + count badge (e.g. "Transfers · 12")
  - Types: All | Transfers | Security | Compliance | Cards | System
    | Marketing
- **Read state section** (single-chip):
  - All | Unread only
- **Date range section** (custom chip + drawer):
  - Default chip "All time"
  - Tap → expands to 4-tab presets row + date-range picker (custom
    range)
- Sticky-bottom row: "Apply N filters" primary CTA + "Cancel" tertiary

**States**:
- Idle (no filters)
- Filters applied (CTA reads "Apply 3 filters")
- Date range — custom range picker open
- Network offline (banner inside sheet)
- Dark mode

### Screen 3 — Detail

**Layout** (top → bottom):

- App bar: back arrow (no title — minimalism)
- **Hero block** (centered, padded):
  - Type icon (large, ~48pt, foundation IconBubble large variant in
    type-tinted background)
  - Title (display-1, slate-900)
  - Timestamp row: full date + relative time ("Apr 30, 2026 at 3:26
    PM · 47 minutes ago", body small, slate-500)
- **Body block** (foundation Card primitive, padded):
  - Full localized message body (per `notification.body_*`, locale-
    aware) — body weight, slate-800, line-height generous for
    readability
  - For transfer-related notifications, may include an inline mini-
    receipt summary (recipient + amount + status badge)
- **Deep-link CTA section** (when `notification.deep_link` is non-null):
  - Foundation Card primitive, brand-tinted
  - Heading: short label like "Take action"
  - Primary button with the contextual label from
    `notification.deep_link.label_*` (localized) — e.g.:
    - "View transfer" → routes to transfer detail
    - "Verify with MyID" → routes to MyID flow
    - "Manage card" → routes to card detail
    - "Open settings" → routes to settings
    - "Send money" → routes to send-money flow (may surface tier
      gate if user is tier_1)
- **Footer**:
  - "Marked as read" sub-line (silent — read state flips on mount)
  - Long-press anywhere on the screen → context sheet ("Delete
    notification" / "Mark as unread")

**States**:
- Idle — read (default; deep-link CTA visible if present)
- Idle — unread → flips to read on mount (animated dot fade-out 200ms;
  reduced-motion → instant)
- Deep-link target unreachable (e.g. transfer no longer exists):
  deep-link CTA hidden + sub-line "This transfer is no longer
  available" (slate-500)
- Tier-gated deep-link (e.g. "Send money" deep-link for tier_1 user):
  CTA tap routes to upgrade flow per
  [`../user-flows/flow-06-tier-upgrade.md`](../user-flows/flow-06-tier-upgrade.md)
- Network offline (banner at top, detail still renders from cache)
- Server 5xx (calm inline error)
- Long-press context sheet open
- Dark mode

### Screen 4 — Inbox-level actions sheet

**Layout** (foundation Sheet primitive, half-snap):

- "Mark all as read" → primary action
- "Notification settings" → routes to settings notification preferences
  ([`./11-settings-screens.md`](./11-settings-screens.md))

**States**:
- Idle
- Confirmation toast after "Mark all as read": "Marked N as read"
  (sonner toast, auto-dismiss 3s)

### Screen 5 — In-app foreground push toast

**Layout** (foundation Toast primitive, top of screen, stacks above
existing chrome):

- Type icon (small) left
- Title + body (1 line each, truncated)
- Right-side timestamp + dismiss-X
- Auto-dismiss after 3s OR persists until tapped
- Tap → routes to detail OR deep-link target (per `notification.
  deep_link`)

**States**:
- New transfer status update (brand-tone)
- Security alert (slate-tone)
- Compliance / verification reminder (warning-tone)
- Stacking — when a 2nd push arrives while a toast is visible: stack
  upward with 8pt gap; older toasts fade out faster

## Cross-screen patterns

### App bar pattern

- Wordmark heading on inbox; back arrow on detail
- Right-side icons consistent (filter + kebab) on inbox

### Bottom safe-area

- Tab bar respects iOS home-indicator (extra 16pt)
- No sticky-bottom action bar on detail (deep-link CTA is in-flow)

### Pull-to-refresh on inbox

- Triggers refetch; honors reduced-motion (instant refetch instead
  of bouncy spring)

### Sticky day-dividers

- Day labels remain pinned to the top of visible list as user scrolls
- Locale-aware: "Bugun" / "Сегодня" / "Today"; "Kecha" / "Вчера" /
  "Yesterday"; otherwise full date

### Foreground push toast vs banner

- Foreground push: in-app Toast (top-of-screen)
- Background push tap: deep-links directly into the detail screen,
  bypassing the inbox

## Localization annotations

Render each text string with its i18n key inline. Suggested keys:

```
mobile.notif.inbox.heading
mobile.notif.inbox.filter-icon-aria
mobile.notif.inbox.kebab-aria
mobile.notif.inbox.permission-banner.title
mobile.notif.inbox.permission-banner.body
mobile.notif.inbox.permission-banner.cta-allow
mobile.notif.inbox.permission-banner.dismiss-aria
mobile.notif.inbox.day-divider.today
mobile.notif.inbox.day-divider.yesterday
mobile.notif.inbox.empty.heading
mobile.notif.inbox.empty.subline
mobile.notif.inbox.empty.no-results.title
mobile.notif.inbox.empty.no-results.cta-clear
mobile.notif.inbox.context.mark-read
mobile.notif.inbox.context.mark-unread
mobile.notif.inbox.context.delete
mobile.notif.inbox.offline.cached-from (with {time})
mobile.notif.filter-sheet.heading
mobile.notif.filter-sheet.reset
mobile.notif.filter-sheet.section.type
mobile.notif.filter-sheet.section.read-state
mobile.notif.filter-sheet.section.date-range
mobile.notif.filter-sheet.read-state.all
mobile.notif.filter-sheet.read-state.unread-only
mobile.notif.filter-sheet.cta-apply (with {n})
mobile.notif.filter-sheet.cta-cancel
mobile.notif.detail.timestamp-format (with {date} {time} {relative})
mobile.notif.detail.deep-link.heading
mobile.notif.detail.deep-link.unreachable (with {entity})
mobile.notif.detail.context.delete
mobile.notif.detail.context.mark-unread
mobile.notif.actions-sheet.mark-all-read
mobile.notif.actions-sheet.notification-settings
mobile.notif.actions-sheet.toast.marked-read (with {n})
mobile.notif.toast.dismiss-aria
common.notif.type.transfer
common.notif.type.compliance
common.notif.type.security
common.notif.type.card
common.notif.type.system
common.notif.type.marketing
common.notif.deep-link.view-transfer
common.notif.deep-link.verify-myid
common.notif.deep-link.manage-card
common.notif.deep-link.open-settings
common.notif.deep-link.send-money
```

**Longest-translation test**: render the Russian variant of the
permission-banner body ("Получайте уведомления о статусе переводов,
безопасности и важных обновлениях") at 360pt — verify it doesn't
push the "Allow" CTA off the right edge or wrap to 3+ lines.

## Accessibility annotations

- Tap-target sizes: ListRow rows ≥ 64pt (row body + sub-line packs
  in well at this height); icon bubbles ≥ 32pt; toast dismiss ≥
  44pt × 44pt
- Focus order on inbox:
  1. Back arrow (none — wordmark) / Filter icon / Kebab
  2. Permission banner (when present): Allow / dismiss
  3. Each list row top → bottom (with day-dividers as section
     headers — screen reader announces them as "Today", "Yesterday")
- Focus order on detail:
  1. Back arrow
  2. Hero block (announced as block — type + title + timestamp)
  3. Body block (full message announced)
  4. Deep-link CTA (when present)
- Screen-reader labels:
  - List row: "Compliance notification, MyID verification expires
    soon, 47 minutes ago, unread" / "...read"
  - Type icons announced as their type semantic ("Compliance icon")
  - Unread dot: NOT announced separately; the "unread" state is
    announced as part of the row label
  - Detail timestamp: "Sent April 30, 2026 at 3:26 PM, 47 minutes
    ago"
  - Deep-link CTA: "View transfer — open transfer details"
- Reduced-motion fallbacks:
  - Unread dot fade-out on detail mount: instant
  - Toast slide-in: instant
  - Day-divider sticky reflow: works without smooth slide
  - Inbox row tap: no scale-down
- Color-only signals removed: type icons use shape (ArrowUpRight,
  Shield, Lock, CreditCard, Info, Sparkle) AND background color; the
  unread state pairs the dot WITH bold weight on the title

## Microinteractions to render

- Pull-to-refresh: spinner appears, list refetches, success → spinner
  fades, "Updated just now" sub-line at top (auto-clears 3s)
- Long-press list row: subtle haptic (200ms) + context sheet slides
  up (250ms ease-out)
- Detail mount: unread dot fade-out 200ms (visual feedback that the
  row has been marked read)
- Toast slide-in (foreground push): from top, 250ms ease-out;
  reduced-motion → instant
- Permission banner dismiss: slide-up + fade out 200ms; reduced-
  motion → instant
- Filter sheet open: slide-up 300ms ease-out
- Mark-all-read confirmation toast: standard sonner cadence

## Output format checklist

- [ ] Single Claude.ai artefact, mobile viewport 390pt
- [ ] React + Tailwind, using foundation tokens
- [ ] All 5 screens × all listed states (~25 frames)
- [ ] Light + dark variants
- [ ] Russian-longest-translation test on permission-banner body
- [ ] All copy annotated with i18n keys
- [ ] Microinteractions annotated
- [ ] Accessibility focus order overlaid on inbox + detail
- [ ] Acceptance criteria (Gherkin) appended (extending seeds from
      `flow-08-notifications.md`)

## Forbidden in this pass

- ❌ Aggressive permission prompts ("Notifications strongly
  recommended" with no dismiss path) — gentle banner, dismissible
- ❌ Marketing notifications ABOVE compliance / security in the list
  (sort by timestamp DESC always; types are visual differentiators,
  not priority)
- ❌ "Important" / "Critical" badges on notifications — type icon
  + warning tone communicates this; badges add visual noise
- ❌ Confirmation modals for "Mark as read" — silent action, optional
  toast
- ❌ Per-notification "Dismiss" / "Don't show again" affordance
  beyond the long-press delete (overcomplicates the inbox)
- ❌ Inventing notification types not in the schema's `type` enum
  (transfer / compliance / security / card / system / marketing only)

## Cross-references

- Foundation: [`../01-foundation.md`](../01-foundation.md)
- Flow plan: [`../user-flows/flow-08-notifications.md`](../user-flows/flow-08-notifications.md)
- Notification state machine (admin-side): [`../../../docs/mermaid_schemas/notification_send_state_machine.md`](../../../docs/mermaid_schemas/notification_send_state_machine.md)
- Settings (notification preferences sub-flow): [`./11-settings-screens.md`](./11-settings-screens.md)
- Tier upgrade (deep-link target for compliance pushes): [`./08-tier-upgrade-screens.md`](./08-tier-upgrade-screens.md)
- Card management (deep-link target for card pushes): [`./09-card-management-screens.md`](./09-card-management-screens.md)
- Send-money (deep-link target for transfer pushes): [`./05-send-money-screens.md`](./05-send-money-screens.md)
- Localization: [`../../../.claude/rules/localization.md`](../../../.claude/rules/localization.md)
- Accessibility: [`../../../.claude/rules/accessibility.md`](../../../.claude/rules/accessibility.md)
