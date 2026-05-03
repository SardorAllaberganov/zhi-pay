# Prompt — Home screen (tier_1 view-only · tier_2 full · tier_2-expired soft-demote)

> **How to use:** open a fresh Claude.ai conversation. Paste in this order:
>
> 1. [`../00-shared-context.md`](../00-shared-context.md) (full content)
> 2. [`../01-foundation.md`](../01-foundation.md) (or its rendered output —
>    paste the token spec table back in so Claude designs against the
>    locked palette)
> 3. [`../user-flows/flow-06-tier-upgrade.md`](../user-flows/flow-06-tier-upgrade.md)
>    (the upgrade banners surfaced on home)
> 4. This file
>
> Claude will respond with a single hi-fi rendered React + Tailwind
> artefact showing the home screen across all three tier variants + every
> state.

---

## What I want from this pass

Design the **full home screen** end to end across the three tier variants:

1. **tier_1 (phone-verified, no MyID)** — view-only home: services /
   FX rates visible; send-money disabled with upgrade-to-MyID banner +
   gate; card-linking visible (UzCard / Humo only, V/MC routes to
   upgrade)
2. **tier_2 (MyID-verified, full functionality)** — primary home: send-
   money hero, recent activity, tier_2 limits (NOT visible as a meter
   here — limits live on the send-money entry per
   [`flow-04-send-money.md`](../user-flows/flow-04-send-money.md))
3. **tier_2-expired (soft-demoted to tier_1, V/MC frozen)** — warning-
   tinted persistent banner; card-linking visible but V/MC tiles show
   the lock-tone; otherwise renders like tier_1

Note: the **tier_1 landing variant** (the post-onboarding "you're all
set" moment with welcome-banner + auto-dismiss) is a sub-case rendered
in [`02-onboarding-screens.md`](./02-onboarding-screens.md) step 5.
This prompt is the LIVE home users land on every cold launch
afterwards.

Render at mobile viewport 390 × 844pt. Multiple frames per variant for
the states listed in the table below.

## Per-variant designs

### Variant A — tier_2 home (full functionality, primary path)

**Layout** (top → bottom):

- **App bar**:
  - Left: ZhiPay wordmark (small)
  - Right: bell icon (with optional unread-count badge — slate-tinted
    background-100 if zero, brand-tinted if 1+) + avatar (initials) →
    Settings
- **Greeting block**:
  - Greeting line: "Hi, Sardor" (display-2 weight, slate-900). Time-of-
    day variants: "Good morning" / "Good afternoon" / "Good evening" —
    pick ONE convention; designer's call. Sub-line in slate-500: "Send
    money to China in seconds."
- **Tier badge row**: small pill below greeting — "Tier 2 · Verified"
  with success-tinted dot (NOT a chip-row since it's solo)
- **Hero card-as-object** (foundation card-as-object component, ~220pt
  tall, brand-50 → brand-100 subtle gradient surface):
  - Top-left: small "Today's rate" label
  - Center: large rate display — `1 CNY = 1 404.17 UZS`, display-1
  - Below: tiny chip showing rate provenance + a "Refreshed 2 min ago"
    sub-line in slate-500
  - Bottom-right corner: small "Send money" arrow icon (decorative —
    the hero card itself is tappable, the arrow visualizes intent)
  - Whole card is tappable → routes to send-money entry
    ([`flow-04-send-money.md`](../user-flows/flow-04-send-money.md))
- **Recent activity preview**:
  - Section heading row: "Recent transfers" left, "View all" link right
    → routes to History tab
  - Top 3 transfer rows (foundation ListRow, dense variant — same shape
    as History list):
    - Avatar / name / destination chip
    - Amount CNY + status badge
  - Empty state (zero transfers ever): line-illustration "No transfers
    yet" + sub-line "Tap above to send your first one"
- **Quick actions row** (3 chip-buttons, horizontal scroll on narrow):
  - "Add card" → routes to card-linking
    ([`flow-03-card-linking.md`](../user-flows/flow-03-card-linking.md))
  - "FX rates" → routes to a static rates screen (out of scope this pass)
  - "Help" → routes to help center
    ([`flow-09-settings.md`](../user-flows/flow-09-settings.md) step 10)
- **Tab bar** at bottom (foundation primitive): Home (active) / Send /
  History / Notifications / More

**States** (tier_2):
- Idle (default with 3+ recent transfers)
- Idle (zero recent transfers — empty state above)
- Idle (FX rate refreshing — sub-line shows "Refreshing…")
- Idle (rate older than 5 min — chip turns amber-tinted "Refresh" link)
- Initial mount (skeleton — hero rate placeholder, 3 row skeletons)
- Network offline banner at the top (above app bar OR below — pick one
  globally and stick to it)
- Server 5xx (rate fails to load) → calm "Couldn't load today's rate"
  with retry chip; recent activity still renders from cache
- Dark mode

### Variant B — tier_1 home (view-only)

**Same layout as variant A**, with these differences:

- Tier badge row: "Tier 1 · Phone verified" (slate-tinted, NOT success)
- **Upgrade-to-MyID banner inserted between tier badge and hero**:
  - Foundation Banner primitive (warning-tinted)
  - Icon: shield (lucide), warning-700 stroke
  - Title: "Verify with MyID to send money" (display-3)
  - Body: "Higher limits · Visa & Mastercard · Send to Alipay or WeChat"
  - Primary CTA inline (right side): "Verify"
  - Dismiss-X top-right (dismisses for session only — see
    [`flow-06-tier-upgrade.md`](../user-flows/flow-06-tier-upgrade.md))
- **Hero card-as-object**:
  - Same rate display, but tappable target shows a half-sheet "Verify
    first" gate per
    [`flow-06-tier-upgrade.md`](../user-flows/flow-06-tier-upgrade.md)
    — the hero is NOT disabled-looking, since FX rate is still visible
    info
- **Recent activity preview**:
  - Empty state ALWAYS — tier_1 users have 0 transfers (since they
    can't send)
  - Empty state copy: "Verify your identity to start sending"
- **Quick actions row**:
  - "Add card" — same; routes to card-linking, V/MC tiles will gate
    in the linking flow (per
    [`flow-03-card-linking.md`](../user-flows/flow-03-card-linking.md)
    step 3)
  - "FX rates" — same
  - "Help" — same
- Tab bar: Send tab is visible but tap shows the "Verify first" gate;
  History tab visible (lands on empty state); other tabs unchanged

**States** (tier_1):
- Idle (default with banner visible)
- Idle (banner dismissed for session — banner hidden, more vertical
  room for hero + activity empty state)
- Banner re-surfaced (next cold launch after dismiss)
- All states from variant A (offline / 5xx / dark / initial mount) +
  the upgrade banner consistently visible

### Variant C — tier_2-expired home (soft-demoted)

**Same layout as variant B (tier_1)**, with these differences:

- Tier badge row: "Tier 1" (warning-tinted dot, NOT slate — visually
  cues that something needs attention)
- **Persistent expired banner** above hero:
  - Warning-tinted (NOT amber — this is a more serious state than
    pre-expiry)
  - Icon: shield-x or shield-alert (lucide)
  - Title: "MyID verification expired"
  - Body: "Re-verify to restore higher limits and Visa/Mastercard."
  - Primary CTA inline: "Re-verify"
  - **NOT dismissible** (per
    [`flow-06-tier-upgrade.md`](../user-flows/flow-06-tier-upgrade.md))
- **Recent activity preview**: shows previously-completed transfers
  (history is preserved on demotion); the user just can't make NEW
  ones until re-verification
- **Quick actions row**:
  - "Add card" tile shows lock-tone for V/MC implicitly via the
    linking flow's gate (no special UI here — the gate is downstream)
  - "Manage cards" replaces "Add card" if the user has 1+ V/MC cards
    that are now frozen — directs them to card-management to see the
    frozen state

**States** (tier_2-expired):
- Idle (default)
- All offline / 5xx / dark / initial mount states from variant A

### Pre-expiry warning sub-state (tier_2 within 7 days of expiry)

A tier_2 user whose MyID expires within 7 days sees an amber-tinted
banner instead of the post-expiry warning-red one (per
[`flow-06-tier-upgrade.md`](../user-flows/flow-06-tier-upgrade.md)):

- Banner: "Your MyID expires in 5 days — re-verify to keep higher
  limits"
- Tone: amber (warning-50 surface + warning-600 icon)
- Dismissible per-session
- Hero + recent activity render unchanged (full tier_2 functionality
  still active)

## States to render — combined matrix

| State | tier_2 | tier_1 | tier_2-expired | tier_2 within 7d expiry |
|---|:---:|:---:|:---:|:---:|
| Idle | ✓ | ✓ banner visible | ✓ banner visible | ✓ amber banner |
| Banner dismissed (session) | — | ✓ | not allowed | ✓ |
| Initial mount skeleton | ✓ | ✓ | ✓ | ✓ |
| Network offline | ✓ | ✓ | ✓ | ✓ |
| Server 5xx (rate) | ✓ | ✓ | ✓ | ✓ |
| FX rate refreshing | ✓ sub-line | ✓ | ✓ | ✓ |
| FX rate stale (>5 min) | ✓ amber chip | ✓ | ✓ | ✓ |
| Dark mode | ✓ | ✓ | ✓ | ✓ |
| Recent activity — populated | ✓ 3 rows | ✗ (always empty) | ✓ from history | ✓ |
| Recent activity — empty | ✓ | ✓ "Verify first" copy | — | — |

## Cross-screen patterns

### App bar pattern

- Wordmark left, bell + avatar right
- Height 56pt iOS / 64pt Android (pick one globally)
- No back arrow (home is root)

### Bottom safe-area

- Tab bar respects iOS home-indicator (extra 16pt padding)
- Last content card has `pb-24` rhythm so it clears the tab bar at
  full scroll

### Pull-to-refresh

- Native pull-to-refresh on the home screen → refreshes FX rate +
  recent activity in parallel; honors `prefers-reduced-motion` (no
  bouncy spring animation if reduced)

### Banner stacking

- When multiple banners apply (offline + upgrade + pre-expiry), stack
  in this order top → bottom: offline (highest priority) → expired /
  pre-expiry (compliance signal) → upgrade-to-MyID (CTA)
- 8pt gap between stacked banners
- All banners share the same chrome — don't mix sizes / paddings

## Localization annotations

Render each text string with its i18n key inline (small annotation in
slate-400). Suggested keys:

```
mobile.home.greeting.morning
mobile.home.greeting.afternoon
mobile.home.greeting.evening
mobile.home.greeting.subline
mobile.home.tier-badge.tier-1
mobile.home.tier-badge.tier-2
mobile.home.tier-badge.tier-2-expired
mobile.home.hero.label
mobile.home.hero.refreshed
mobile.home.hero.refreshing
mobile.home.hero.refresh-cta
mobile.home.hero.error
mobile.home.recent.heading
mobile.home.recent.view-all
mobile.home.recent.empty.title
mobile.home.recent.empty.subline.tier-1
mobile.home.recent.empty.subline.tier-2
mobile.home.actions.add-card
mobile.home.actions.fx-rates
mobile.home.actions.help
mobile.home.banner.upgrade.title
mobile.home.banner.upgrade.body
mobile.home.banner.upgrade.cta
mobile.home.banner.upgrade.dismiss
mobile.home.banner.expired.title
mobile.home.banner.expired.body
mobile.home.banner.expired.cta
mobile.home.banner.pre-expiry.title (with {days} placeholder)
mobile.home.banner.pre-expiry.body
mobile.home.banner.pre-expiry.cta
mobile.home.banner.offline.title
mobile.home.banner.offline.cached-from
common.tab-bar.home
common.tab-bar.send
common.tab-bar.history
common.tab-bar.notifications
common.tab-bar.more
```

**Longest-translation test**: render the Russian variant of the upgrade
banner title ("Подтвердите личность через MyID, чтобы отправлять") at
the default viewport — verify it doesn't wrap to 3 lines or push the
"Verify" CTA out of the right edge. If it does, the body line should
break before the title squeezes; CTA should drop below body on a
narrow viewport rather than crushing.

## Accessibility annotations

- Tap-target sizes: hero card-as-object ≥ 88pt tall (it's the primary
  CTA on the screen; bigger than the 44pt minimum is intentional),
  ListRow rows ≥ 56pt tall
- Focus order overlaid as a numbered guide:
  1. App bar bell
  2. App bar avatar
  3. Banner CTA (if any)
  4. Hero card (Send money entry)
  5. View all
  6. Each recent transfer row
  7. Each quick-action chip
  8. Tab bar items left → right
- Screen-reader labels:
  - Hero card: "Today's exchange rate, 1 CNY equals 1404.17 UZS,
    refreshed 2 minutes ago. Double tap to send money."
  - Tier badge: "Tier 2, MyID verified" / "Tier 1, phone verified" /
    "Tier 1, MyID verification expired"
  - Bell with unread: "Notifications, 3 unread"
  - Each banner: full title + body announced as a single utterance,
    CTA announced separately
- Reduced-motion fallback: banner slide-in becomes instant; hero
  shimmer skeleton becomes a static placeholder; pull-to-refresh
  bounce becomes immediate

## Microinteractions to render (mark with arrow + brief annotation)

- Pull-to-refresh: spinner appears, FX rate + activity refetch in
  parallel; success → spinner fades, sub-line updates "Just now"
- FX rate update animation: number scrambles briefly (200ms) on
  refresh — honors reduced-motion (instant flip)
- Bell badge: count increments with subtle scale-pop (150ms,
  ease-out); reduced-motion → instant
- Banner dismiss: slide-out + recent-activity slides up to fill the
  gap (250ms, ease-in-out); reduced-motion → instant
- Tab bar active-item highlight: brand-tone underline + icon fill
  brand-700; transitions 200ms

## Output format checklist

- [ ] Single Claude.ai artefact, mobile viewport 390pt
- [ ] React + Tailwind, using foundation tokens
- [ ] All 3 variants × all states (~30 frames total)
- [ ] Light + dark variants for each tier
- [ ] Russian-longest-translation test frame
- [ ] All copy annotated with i18n keys
- [ ] Microinteractions annotated with arrows + 1-line description
- [ ] Accessibility focus order overlaid as a numbered guide
- [ ] Acceptance criteria (Gherkin) appended at the end

## Forbidden in this pass

- ❌ Showing a tier-headroom meter on home (limits live on send-money
  entry per [`flow-04-send-money.md`](../user-flows/flow-04-send-money.md))
- ❌ Marketing carousel or promotional banners
- ❌ Visa / Mastercard logos on the quick-actions tiles (the logos
  appear inside card-linking, not on home — keep home calm)
- ❌ Confetti / celebration animations on the FX-rate refresh
- ❌ Showing more than 3 recent transfer rows on home (full list
  lives in History)
- ❌ Tier_1 home with the send-money hero looking visually disabled —
  the hero stays vibrant, the GATE shows up only when the user taps
- ❌ Inventing a "tier_3" or any state not in the canonical KYC state
  machine

## Cross-references

- Foundation tokens + primitives: [`../01-foundation.md`](../01-foundation.md)
- Onboarding (post-OTP first-mount variant): [`./02-onboarding-screens.md`](./02-onboarding-screens.md)
- Send-money flow: [`../user-flows/flow-04-send-money.md`](../user-flows/flow-04-send-money.md)
- Card linking flow: [`../user-flows/flow-03-card-linking.md`](../user-flows/flow-03-card-linking.md)
- Tier upgrade journey: [`../user-flows/flow-06-tier-upgrade.md`](../user-flows/flow-06-tier-upgrade.md)
- KYC tier rules: [`../../../.claude/rules/kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md)
- Money & FX rules (rate display): [`../../../.claude/rules/money-and-fx.md`](../../../.claude/rules/money-and-fx.md)
- Localization: [`../../../.claude/rules/localization.md`](../../../.claude/rules/localization.md)
- Accessibility: [`../../../.claude/rules/accessibility.md`](../../../.claude/rules/accessibility.md)
