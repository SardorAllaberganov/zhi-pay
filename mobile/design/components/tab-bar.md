# Tab bar (bottom navigation)

Mobile bottom navigation. 4 tabs — Home / Send / History / More. Inactive tabs muted; active brand-tinted with slight bump. **No FAB. No diagonal cutout.** Restrained, not playful.

> Status: **First-pass spec, in review.** No direct admin equivalent (admin uses sidebar nav). Mobile-specific by definition.

## Source of truth

- Tokens: [`colors.md`](../../tokens/colors.md), [`spacing.md`](../../tokens/spacing.md), [`typography.md`](../../tokens/typography.md), [`shadows.md`](../../tokens/shadows.md), [`motion.md`](../../tokens/motion.md)
- Primitives consumed: [`icon.md`](../primitives/icon.md), [`chip.md`](../primitives/chip.md) (CountBadge overlay)
- Cross-cutting decisions: [`accessibility.md`](../../../.claude/rules/accessibility.md) (focus, tap targets, screen-reader semantics)

## The four tabs (canonical)

| # | Label key | Icon (lucide) | Default route |
|:-:|---|---|---|
| 1 | `mobile.tab-bar.home` | `Home` | `/` |
| 2 | `mobile.tab-bar.send` | `Send` | `/send` |
| 3 | `mobile.tab-bar.history` | `Clock` | `/history` |
| 4 | `mobile.tab-bar.more` | `Menu` | `/more` |

> 4 tabs is the v1 commitment. Adding a 5th turns the visual rhythm cluttered and forces the labels into ellipsis at the longer locales — adopt only after explicit revisit. Don't sneak in additions.

## Anatomy

```
        ╭──────────────────────────────────────────────────────╮
        │                                                      │
        │  ●         ●●         ●         ●                    │   active dot
        │ ╭───╮     ╭───╮     ╭───╮     ╭───╮                  │
        │ │ ⌂ │     │ ↗ │     │ ⏱ │     │ ☰ │                  │   icon row · 24pt
        │ ╰───╯     ╰───╯     ╰───╯     ╰───╯                  │
        │ Home       Send     History    More                  │   label row · text-xs
        │                                                      │
        ╰──────────────────────────────────────────────────────╯
                                                                    ← safe-area-bottom buffer
            ↑                ↑
            inactive         active (brand-600, label visible)
```

| Slot | Token / value |
|---|---|
| Container | `bg-card` light / `slate-900` dark; 1pt top border in `--border`; **no top shadow** (border carries separation) |
| Container height | 56pt content + safe-area-bottom inset |
| Tab cell | `flex-1`, `flex flex-col items-center justify-center`, `space-y-1` (icon-to-label gap of 4pt) |
| Tab cell tap-area | full cell — naturally ≥ 44pt at `flex-1` distribution on a 360+pt viewport |
| Icon size | 24pt (`size-6`) |
| Label type | `text-xs font-medium` (13pt) — permitted because tab-bar labels are short and tightly grouped |
| Active icon color | `--primary` (brand-600 / brand-500) |
| Inactive icon color | `slate-400` light / `slate-500` dark |
| Active label color | `--primary` (brand-600 / brand-500), `font-semibold` |
| Inactive label color | `slate-500` light / `slate-400` dark |
| Active dot indicator | 4pt circle in `--primary` above the icon at `top: 4pt` of tab cell — color + position pair, never color-alone |
| Active scale | `scale-[1.04]` on icon — slight bump per the foundation prompt |
| Center "Send" emphasis | the foundation prompt allows a slight scale (`scale-[1.06]`) — keep it that subtle. **No FAB. No diagonal cutout. No raised pill.** |
| Tap-down feedback | tab cell briefly tints `bg-muted/40` over `duration-fast` (90ms) |
| Stack-position offset | toasts and modals surface above; sheets push content up but stay above the tab bar; the tab bar always renders |

## Sizes

Single canonical size. The tab bar shape is fixed — variants would fragment the visual rhythm of the app shell.

## States

| State | Treatment |
|---|---|
| `idle` | active tab brand-tinted, others muted |
| `pressed` | brief `bg-muted/40` tint on the cell at `duration-fast` |
| `transitioning` (route changing) | active state moves to the new tab; brief opacity dip on the icon during navigation if the route is async-loading |
| `disabled` (rare — e.g. tier_0 trying to access a gated tab) | tab visible but `opacity-60`; tap shows a sheet explaining the gating, never silently fails |
| `with-badge` | CountBadge `sm` overlays the icon at `top: -4pt right: -4pt` (per [`chip.md`](../primitives/chip.md)) |

## CountBadge overlay (notifications, history)

When a tab needs to surface a count — unread notifications on `More`, new history entries — overlay a CountBadge at `top: -4pt right: -4pt` of the icon.

| Tab | Badge use | Variant |
|---|---|---|
| Home | unread notifications count | `danger-600` (default attention) |
| Send | none — sending isn't notification-bearing | — |
| History | new completed transfers since last visit | `brand-600` (informational, not alarming) |
| More | unread notifications + alerts (sometimes — depends on whether Home already carries it) | `danger-600` |

**Don't double-badge** the same notification across Home and More — pick one canonical surface and stick to it. (Default: Home carries the unread-notification badge; More may carry administrative or settings-related counts.)

## Token consumption summary

| Surface | Token |
|---|---|
| Container | `bg-card`, 1pt top `--border` |
| Active icon + label | `--primary` (brand-600 / brand-500) |
| Inactive icon | `slate-400` / `slate-500` |
| Inactive label | `slate-500` / `slate-400` |
| Active dot | 4pt circle in `--primary` |
| Cell padding | top `space-2` (8pt), bottom safe-area + `space-2` |
| Icon → label gap | `space-1` (4pt) |
| Icon size | 24pt (`size-6`) |
| Label type | `text-xs font-medium` (active `font-semibold`) |
| Press tint | `bg-muted/40`, `duration-fast` (90ms) |
| Active scale | `scale-[1.04]` (or `scale-[1.06]` for Send center) |
| Active dot motion | spring-pop on tab change at `duration-base` (220ms), `ease-out` |

## Composition rules

| Pattern | Rule |
|---|---|
| Tab bar + content area | Tab bar `bottom: 0`; content area `pb-{56 + safe-area-bottom}` to clear the bar. App-shell handles this — screens never apply their own bottom padding for the bar |
| Tab bar + sticky bottom action bar (e.g. Send-money review CTA) | The action bar **replaces** the tab bar on screens with a primary CTA at bottom. Don't stack both — pick one. App shell hides the tab bar on routes that declare `hideTabBar: true` |
| Tab bar + sheet | Sheet renders above tab bar; tab bar visible behind the sheet's backdrop. Tab bar non-interactive while sheet is open |
| Tab bar + modal (full-screen) | Modal hides the tab bar; modal owns the full viewport |
| Tab bar + onboarding screens | Onboarding, sign-in, MyID flow — tab bar hidden. Tab bar shows only after onboarding completes (user lands on Home) |
| Routes that hide the tab bar | `/onboarding/*`, `/sign-in`, `/myid/*`, `/send/review`, `/send/processing`, `/send/result`, `/cards/add`, `/notifications/:id` (full-screen detail), any modal-style route |

## Accessibility

| Concern | Rule |
|---|---|
| Tap target | Each tab cell `flex-1` distributes width; on the smallest viewport (360pt) each cell is ~90pt wide × 56pt tall — well over the 44pt floor |
| Active state announcement | `role="tab"` with `aria-current="page"` on the active tab; `aria-label="{tab label}"` on each |
| Focus | Visible focus ring (`--ring` 2pt outset around the tab cell, inset variant `focus-visible:ring-inset` to stay within the bar's frame) |
| Keyboard navigation | Left/Right arrow moves between tabs; Enter / Space activates. Tab key flows through tab bar after main content |
| Color-only signals | Active state uses brand color + dot indicator + slight scale + label weight — never color alone |
| Reduced motion | Active scale and dot spring-pop fall back to instantaneous; press tint stays |
| Badge announcement | `aria-label="{tab label}, {count} unread"` when CountBadge overlays |
| Screen reader landmark | Tab bar wraps in `<nav aria-label="Primary navigation">` |

## Localization

| Slot | Key pattern |
|---|---|
| Tab label | `mobile.tab-bar.<tab-id>.label` |
| Tab aria-label (with count) | `mobile.tab-bar.<tab-id>.aria-label` (ICU plural for count) |
| Navigation landmark | `mobile.tab-bar.aria-label` |

- Russian labels run 15–25% longer; verify "История" and "Отправить" don't truncate at 360pt viewport. If they do, drop to icon-only on that locale at small viewports — but keep labels for screen readers.
- Labels stay in Title Case as authored — never `uppercase tracking-wider` (per LESSON 2026-05-02 narrowing of reserved typography categories).

## Forbidden patterns

| Don't | Required |
|---|---|
| Floating Action Button (FAB) | Send tab gets a slight `scale-[1.06]` only — no FAB, no raised pill, no diagonal cutout |
| 5+ tabs | 4-tab commitment for v1; revisit before adding |
| Tab without a label (icon-only) | Labels visible at all times; Apple HIG / Material both keep labels for the small label space they provide. Icon-only at small viewports as a localization fallback only |
| Hide-on-scroll behavior | Tab bar persists. Hide-on-scroll bars feel modern but they break the "always-reachable nav" expectation |
| Custom tab heights | 56pt content + safe-area-bottom — fixed |
| Hardcoded brand color (`text-[#0a64bc]`) | `text-primary` token |
| Tab bar that overlays sheet content | Tab bar renders **below** the sheet (z-order); sheet covers it |
| Stacking tab bar with sticky action bar on the same screen | Action bar replaces the tab bar; route declares `hideTabBar: true` |
| Color-only active state | Color + active dot + slight scale + label weight — multi-signal |
| Center-tab visual treatment beyond `scale-[1.06]` | The foundation prompt is explicit: "slightly emphasised but no FAB / no diagonal cutout" |

## Quick grep to verify (when implemented)

```bash
# FAB / diagonal-cutout patterns:
grep -rnE 'TabBar.*FAB|FAB.*TabBar|TabBar.*cutout' mobile/

# Custom tab heights:
grep -rnE 'TabBar.*h-\[' mobile/

# 5+ tabs:
grep -rnE 'tabs:\s*\[.*\].*\.length\s*>\s*4|TabBar.*<Tab[^>]*5' mobile/

# Hardcoded brand color:
grep -rnE 'TabBar.*text-\[#|TabBar.*bg-\[#' mobile/
```

## Cross-references

- Tokens: [`colors.md`](../../tokens/colors.md) · [`spacing.md`](../../tokens/spacing.md) · [`typography.md`](../../tokens/typography.md)
- Primitives: [`icon.md`](../primitives/icon.md) · [`chip.md`](../primitives/chip.md) (CountBadge)
- Adjacent: Segmented control (filtering, not navigation) — [`segmented-control.md`](./segmented-control.md)
- Layer rules: [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md)
- Lessons: reserved typography categories for tab labels (2026-04-29), no-sticky-chrome principle for non-app-shell elements (2026-05-02 + 2026-05-03)
