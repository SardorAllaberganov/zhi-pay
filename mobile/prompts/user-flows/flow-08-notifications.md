# User Flow — Notifications (in-app inbox + push handling)

> Plans the screen sequence for the notifications inbox that surfaces
> the operational, transactional, and compliance-driven messages that
> appear in the user's account. Includes how OS-level pushes deep-link
> back into the app. The matching surface prompt is
> [`../surfaces/10-notifications-screens.md`](../surfaces/10-notifications-screens.md).
>
> Canonical sources of truth:
> - [`docs/mermaid_schemas/notification_send_state_machine.md`](../../../docs/mermaid_schemas/notification_send_state_machine.md)
> - [`docs/models.md`](../../../docs/models.md) — `notifications`,
>   `notification_reads` (or per-user fan-out)

## Goal

Provide a calm, scannable inbox that lets the user catch up on every
account-relevant event — transfer status changes, MyID expiry warnings,
sanctioned-recipient reviews, security alerts, app updates, marketing
content (clearly separated). Tap any row to land on the relevant context
(transfer detail, MyID flow, settings, etc.).

## Out of scope (covered by other flows)

- Composing notifications (that's the admin dashboard surface, not the
  mobile end-user flow)
- Per-notification settings / opt-in/out (covered by
  [`flow-09-settings.md`](./flow-09-settings.md))
- The actual screens the deep-links land on (covered by their respective
  flows)

## Prerequisites

- User is signed in (any tier)
- Push permission state can be: granted / denied / not-yet-asked. The
  inbox works regardless; pushes only fire when granted

## State machine (Notification — read-only viz from the user side)

The notification's state machine is admin-side
([`docs/mermaid_schemas/notification_send_state_machine.md`](../../../docs/mermaid_schemas/notification_send_state_machine.md)):
`scheduled → sending → sent | failed | cancelled`. The user only sees
notifications in `sent` state (delivered to their inbox). Per-user state
is `read | unread` (managed in `notification_reads`).

## Screen sequence

1. **Entry**
   - Tab bar bell icon (4th tab; badge shows unread count, max "9+")
   - Push notification tap → deep-link to the notification's `deep_link`
     target if present; else lands on the inbox with the row scrolled
     to top
   - From settings: "Notifications" → "Inbox" sub-row
2. **Inbox list**
   - Top app bar: "Notifications" heading + right-side actions:
     - Filter icon (lucide `sliders-horizontal`) → step 3 filter sheet
     - 3-dot kebab → step 4 inbox actions
   - Optional banner-row (when push permission denied AND user hasn't
     dismissed the prompt): "Allow notifications to get transfer status
     updates" + "Allow" CTA → opens OS-level permission sheet
   - List body — virtualized list (foundation ListRow):
     - Icon (left): per `notification.type`
       - `transfer` → ArrowUpRight (brand-tinted)
       - `compliance` → Shield (warning-tinted)
       - `security` → Lock (slate-tinted)
       - `card` → CreditCard (slate-tinted)
       - `system` → Info (slate-tinted)
       - `marketing` → Sparkle (muted, slate-400 — least visual weight)
     - Title (top line): bold weight if `unread`; regular if `read`
     - Body (below title): 1-line preview, max 60 chars truncated with
       ellipsis
     - Right side: relative timestamp ("47m ago" / "3h ago" / "Apr 28")
     - Unread dot at the right edge if `unread` (brand-600 dot, 8pt)
   - Sticky day-divider headers ("Today", "Yesterday", "Apr 28, 2026")
   - Tap row → step 5 (detail)
   - Long-press row → context sheet ("Mark as read" / "Mark as unread"
     / "Delete")
3. **Filter sheet**
   - Heading: "Filter notifications"
   - Type chips (multi-select): All | Transfers | Security | Compliance
     | Cards | System | Marketing (each chip with the type's icon)
   - Read state (single-chip): All | Unread only
   - Date range chip → date-range picker
   - Sticky-bottom "Apply" + "Reset" actions
4. **Inbox-level actions sheet**
   - "Mark all as read"
   - "Notification settings" → routes to settings
5. **Detail**
   - Top app bar: back arrow
   - Hero block:
     - Type icon (large, type-tinted)
     - Title (display-2)
     - Timestamp (full + relative)
   - Body block: full localized message body (per
     `notification.body_*`, locale-aware)
   - Deep-link CTA (when `notification.deep_link` is non-null):
     - Primary button with the contextual label from
       `notification.deep_link.label_*` (localized) — e.g.:
       - "View transfer" → routes to transfer detail
       - "Verify with MyID" → routes to MyID flow
       - "Manage card" → routes to card detail
       - "Open settings" → routes to settings
   - Footer: "Marked as read just now" (silent — read state flips on
     mount)
   - Long-press anywhere → "Delete notification" / "Mark as unread"
     contextual actions

## States to render (per screen)

| State | Inbox | Filter sheet | Detail |
|---|:---:|:---:|:---:|
| Idle | ✓ | ✓ | ✓ |
| Empty (zero notifications, ever) | ✓ illustration | — | — |
| Empty (zero matching filter) | ✓ inline | — | — |
| Loading (initial) | ✓ skeletons | — | ✓ skeleton |
| Loading (pagination) | ✓ inline | — | — |
| Push permission denied | ✓ permission banner above list | — | — |
| Push permission granted (no banner) | ✓ | — | — |
| Unread row | ✓ bold + dot | — | ✓ flips to read on mount |
| Read row | ✓ regular | — | ✓ |
| Network offline | banner + cached set | inline | banner + cached row |
| Server 5xx | full error | — | inline error |

## Error states (sourced from `error_codes`)

The inbox itself doesn't trigger user-facing error codes — it's read-
only. Detail-level deep-link tap may route to a flow that surfaces
`error_codes` (e.g. tapping "Verify with MyID" → MyID flow which may
fail per [`flow-02-myid.md`](./flow-02-myid.md)). The inbox handles
fetch errors with the standard offline / 5xx patterns.

## Edge cases to surface in the design

- Push notification arrives while user is on a different screen of the
  app → in-app toast banner (foundation Toast primitive, top of screen,
  3s auto-dismiss) showing the title; tap to deep-link
- Push notification arrives for a notification whose `deep_link` is
  for a screen that no longer applies (e.g. transfer was deleted by
  TTL) → tap surfaces the inbox detail screen with the deep-link CTA
  hidden + a calm sub-line "This transfer is no longer available"
- User has 1000+ notifications (high-volume sender) → inbox lazy-loads
  in pages of 50; "Mark all as read" still works server-side regardless
  of pagination state
- User taps "Mark all as read" then immediately receives a new push →
  badge count goes 0 → 1; new notification is unread at the top
- User has notifications in a language they've since changed away from
  → render in CURRENT `users.preferred_language` (per the same rule as
  history — language changes apply going forward but history surfaces
  re-render in current locale)
- Marketing notifications honor the per-type opt-out (set in settings):
  user with marketing opt-out never sees `type=marketing` rows in the
  inbox AND never receives marketing pushes
- Notification with a `deep_link` to a tier-gated surface (e.g. "Send
  money" deep-link for a tier_1 user) → tapping the CTA routes to
  upgrade flow per [`flow-06-tier-upgrade.md`](./flow-06-tier-upgrade.md)

## Acceptance criteria (Gherkin fragments)

```
GIVEN  user has 5 unread notifications
WHEN   user opens the Notifications tab
THEN   the bell-icon badge shows "5"
AND    each unread row renders with bold title + brand-600 unread dot
AND    each read row renders with regular title + no dot

GIVEN  user is on inbox list
WHEN   user taps a notification row
THEN   notification_reads.read_at = now() for that user + notification
AND    detail screen renders with the full body + deep-link CTA (if
       present)
AND    on return to inbox, the row is now in read state

GIVEN  user taps "Mark all as read" from inbox-level actions
WHEN   confirms the action
THEN   all currently-unread notifications for this user move to read
AND    badge count goes to 0
AND    inbox re-renders with all rows in read state

GIVEN  push permission state = denied
WHEN   user opens the Notifications tab
THEN   permission banner renders above the list
AND    "Allow" CTA opens the OS-level permission sheet
AND    banner is dismissible per-session

GIVEN  notification has deep_link.target = transfer_detail and
       deep_link.params.transfer_id = "tx_123"
WHEN   user taps the deep-link CTA
THEN   navigate to transfer detail screen with id "tx_123"
AND    if the transfer no longer exists, render the calm 404 detail
       state per flow-05-history step 4 edge case
```

## Telemetry to consider

- `notif.inbox.view` (with unread count)
- `notif.inbox.row-tap` (with type)
- `notif.inbox.mark-all-read.tap`
- `notif.inbox.filter.apply` (with chip values)
- `notif.detail.view` (with type)
- `notif.detail.deep-link.tap` (with deep-link target)
- `notif.detail.delete.tap`
- `notif.permission.denied-banner.view`
- `notif.permission.allow.tap`
- `notif.push.received` (when app is foreground; with type)
- `notif.push.tapped` (when app is background → foreground)

## Cross-references

- Notification state machine (admin-side): [`docs/mermaid_schemas/notification_send_state_machine.md`](../../../docs/mermaid_schemas/notification_send_state_machine.md)
- Localization (notification body locale-aware): [`.claude/rules/localization.md`](../../../.claude/rules/localization.md)
- Tier upgrade (deep-link to MyID from compliance pushes): [`./flow-06-tier-upgrade.md`](./flow-06-tier-upgrade.md)
- Send-money / history / card-mgmt (deep-link targets): [`./flow-04-send-money.md`](./flow-04-send-money.md), [`./flow-05-history.md`](./flow-05-history.md), [`./flow-07-card-management.md`](./flow-07-card-management.md)
- Settings (notification preferences sub-flow): [`./flow-09-settings.md`](./flow-09-settings.md)
- Surface design prompt: [`../surfaces/10-notifications-screens.md`](../surfaces/10-notifications-screens.md)
