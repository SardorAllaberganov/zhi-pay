# Toast

Transient feedback. Slides in from top, swipe-right to dismiss, auto-dismiss for non-error variants. **Never used for error states that need user action** — those are banners or inline errors per [`error-ux.md`](../../../.claude/rules/error-ux.md).

> Status: **First-pass spec, in review.** Mirrors admin's [Sonner-based `<Toaster>`](../../../dashboard/src/components/) shape, mobile-tuned for swipe + safe-area.

## Source of truth

- Admin reference: dashboard's Sonner toaster integration
- Tokens: [`colors.md`](../../tokens/colors.md), [`typography.md`](../../tokens/typography.md), [`spacing.md`](../../tokens/spacing.md), [`radii.md`](../../tokens/radii.md), [`motion.md`](../../tokens/motion.md), [`shadows.md`](../../tokens/shadows.md)
- Error display: [`.claude/rules/error-ux.md`](../../../.claude/rules/error-ux.md)

## Variants

Four tone variants. **Error variant exists but is reserved for cases where the error is non-blocking and self-resolved** — e.g. "Couldn't copy receipt link, try again" — never for transfer failure or compliance review.

| Variant | Surface | Icon | Auto-dismiss | Use |
|---|---|---|:---:|---|
| `success` | `success-50` light / `success-700/30` dark | lucide `<CheckCircle2>` `success-700 / success-600` | 4s | "Recipient added", "Card linked", "Copied to clipboard" |
| `info` | `slate-100` light / `slate-800` dark | lucide `<Info>` `slate-700 / slate-300` | 4s | "Draft saved", "Notifications updated" |
| `warning` | `warning-50` light / `warning-700/30` dark | lucide `<AlertTriangle>` `warning-700 / warning-600` | 6s | "FX rate moved — review again", "Cellular signal weak" |
| `error` | `danger-50` light / `danger-700/30` dark | lucide `<AlertCircle>` `danger-700 / danger-600` | **manual** | Non-blocking errors only — "Couldn't refresh balance" — banner if it blocks the user |

## Anatomy

```
                ╭──[ Toast — radius-md (12pt) · shadow-md ]────╮
                │                                              │
                │  ✓   Card linked                             │
                │      Visa •••• 4242 ready to use.            │
                │                                              │
                ╰──────────────────────────────────────────────╯
                   ↑   ↑                                ↑
                   icon title (text-sm font-semibold)   optional CTA
                       body  (text-sm font-normal)      (link, sm)
```

| Slot | Token / value |
|---|---|
| Container | `bg-card` (white light / slate-900 dark), `radius-md` (12pt), `shadow-md` |
| Container border | none — `shadow-md` carries separation from page |
| Variant accent (left edge) | 3pt left border in variant-600 — color signal at a glance |
| Padding (X / Y) | `space-4 / space-3` (16 / 12pt) |
| Icon | 20pt (`size-5`), variant-700 light / variant-600 dark |
| Icon → text gap | `space-3` (12pt) |
| Title | `text-sm font-semibold` (14pt) |
| Body (optional) | `text-sm font-normal` (14pt), slate-700 light / slate-300 dark |
| Title → body gap | `space-1` (4pt) |
| CTA (optional) | `<Button variant="link" size="sm">` aligned right, or inline as a trailing link |
| Dismiss | swipe-right gesture; no visible X button (saves vertical space, mobile pattern) |
| Container width | `min(viewport-width - 32, 380pt)` — caps at 380pt on tablet-ish viewports |
| Position | top of viewport, `top: safe-area-top + 8pt` |
| Stack | up to 3 toasts visible; older ones fade behind the newest |
| Stack offset | new toasts push the older down; vertical gap `space-2` (8pt) |

> **Type floor**: title and body both `text-sm` — never `text-xs` per LESSON 2026-05-01.

## Motion

| Phase | Behavior |
|---|---|
| Enter | Slide in from `translateY(-100%)` to `translateY(0)`, opacity 0 → 1, `duration-base` (220ms), `ease-standard` |
| Idle | Static; auto-dismiss timer countdown |
| Swipe-to-dismiss | `translateX` follows finger; release > 30% of width → animate out at `duration-fast` (90ms), `ease-out` |
| Auto-exit | Slide back up to `translateY(-100%)`, opacity 1 → 0, `duration-base`, `ease-standard` |
| Reduced motion | Enter / exit becomes opacity-only fade at `duration-fast` (90ms); swipe gesture still works but without translate-follow (binary dismiss) |

## States

| State | Treatment |
|---|---|
| `enter` | sliding in; not yet interactive |
| `idle` | visible, auto-dismiss timer running |
| `paused` | timer paused on hover (mouse) or finger-down |
| `swiping` | user dragging; container follows finger |
| `dismiss-out` | sliding out; ignores further taps |
| `manual` (error variant) | timer disabled; persists until user dismisses |

## Token consumption summary

| Surface | Token |
|---|---|
| Container fill | `bg-card` |
| Container shadow | `shadow-md` |
| Variant accent | 3pt border-left in variant-600 |
| Icon color | variant-700 light / variant-600 dark |
| Title type | `text-sm font-semibold` |
| Body type | `text-sm font-normal text-muted-foreground` |
| Padding | `space-4 / space-3` |
| Radius | `radius-md` |
| Stack gap | `space-2` (8pt) |
| Position offset | `safe-area-top + space-2` |
| Motion | `duration-base` (220ms) enter / exit, `duration-fast` (90ms) swipe |

## Composition rules

| Pattern | Rule |
|---|---|
| Toast + Banner on same screen | Allowed — Toasts are transient, Banners are persistent. They occupy different screen real estate (top vs inline) |
| Toast + Modal | Toasts surface above modals; verify they don't obscure the modal's primary CTA |
| Toast + Sheet | Toasts surface above sheets; same rule |
| Toast inside a sheet (scoped) | Forbidden — toasts are app-level. Inside a sheet, use a Banner instead |
| Stacking | Max 3 visible. New toasts push older down. Past 3, the oldest dismisses early to make room |
| Long-running async confirmations | Use a banner instead — toasts auto-dismiss before the user can read a long message |

## Use cases (canonical)

| Trigger | Variant | Title | Body (optional) | CTA |
|---|---|---|---|---|
| Recipient added successfully | `success` | "Wang Lei added" | — | — |
| Card linked successfully | `success` | "Card linked" | "Visa •••• 4242 ready to use." | — |
| Receipt link copied | `success` | "Link copied" | — | — |
| Settings change saved | `success` | "Saved" | — | — |
| Draft saved (offline) | `info` | "Draft saved" | "We'll send when you're back online." | — |
| Notification preferences updated | `info` | "Preferences updated" | — | — |
| FX rate moved while reviewing | `warning` | "Rate updated" | "Refresh to see the new amount." | "Refresh" |
| Cellular signal weak | `warning` | "Connection unstable" | "Some actions may take longer." | — |
| Balance fetch failed (non-blocking) | `error` | "Couldn't refresh balance" | "Pull down to retry." | — |
| Copy-to-clipboard failed | `error` | "Couldn't copy" | "Try again." | "Retry" |

**Sourcing rule**: error variant titles / bodies pull from `error_codes` if a code applies. If the situation isn't a coded error (e.g. clipboard failure), author plain copy in i18n. Per [`error-ux.md`](../../../.claude/rules/error-ux.md).

## Accessibility

| Concern | Rule |
|---|---|
| Live region | `role="status"` (info / success / warning) `aria-live="polite"`; `role="alert"` (error) `aria-live="assertive"` |
| Color-only | Variant icon required — never color alone |
| Tap target (CTA) | ≥ 44pt — CTA inflates via padding |
| Swipe-to-dismiss | Pair with a visible "Dismiss" affordance on screen-reader / keyboard variant (focus + Enter dismisses); never swipe-only |
| Auto-dismiss timer | Pauses when user has the toast focused (keyboard) or hovered (mouse); ensures users with slower readers can finish |
| Reduced motion | Slide replaced with opacity fade |
| Persistence (error variant) | manual-dismiss; never auto-time-out an error message |
| Stack announcement | Each new toast announces; older toasts in stack don't re-announce |

## Localization

| Slot | Key pattern |
|---|---|
| Title | `mobile.<surface>.<screen>.toast-<id>.title` or `common.errors.<CODE>.title` |
| Body | `mobile.<surface>.<screen>.toast-<id>.body` or `common.errors.<CODE>.body` |
| CTA | `mobile.<surface>.<screen>.toast-<id>.cta` |
| Aria-label dismiss | `common.toast.dismiss.aria-label` |

- Russian titles run 15–25% longer — verify they fit single-line at 380pt; if not, drop to two lines (max).
- Auto-dismiss durations are locale-agnostic (4s / 6s) — those tune to reading speed, not language length.

## Forbidden patterns

| Don't | Required |
|---|---|
| Toast for blocking error states (transfer failure, compliance review) | Banner or inline error — Toasts auto-dismiss, blocking errors must persist |
| Toast for compliance / sanctions messaging | Calm-review banner pattern per [`error-ux.md`](../../../.claude/rules/error-ux.md) |
| `text-xs` (13pt) on title or body | `text-sm` floor |
| Multiple stacked toasts of the same kind ("Saved · Saved · Saved") | Debounce repeats; replace existing toast with the latest |
| Toast with `primary` CTA | `link` variant only — toasts aren't decision surfaces |
| Toast as the only failure feedback | Pair with inline error in the source surface; toast is supplemental |
| Auto-dismiss on the error variant | Error toasts are manual-dismiss |
| Sticky / persistent toast that doesn't dismiss | That's a banner — pick the right primitive |
| Toast on first paint of a screen ("Welcome back!") | Don't decorate landings with toasts; they should land in response to user actions |

## Quick grep to verify (when implemented)

```bash
# text-xs in toast — LESSON 2026-05-01:
grep -rnE 'Toast.*text-xs|toast\(.*text-xs' mobile/

# Primary CTA in toast:
grep -rnE 'toast\(.*action.*primary|<Toast[^>]*\n[^<]*<Button[^>]*variant="primary"' mobile/

# Hardcoded toast hex:
grep -rnE 'Toast.*bg-\[#|toast\(.*style.*#' mobile/

# Toast usage for transfer failure (anti-pattern):
grep -rnE 'toast\(.*type:\s*"error".*transfer.*failed|toast.*KYC|toast.*SANCTIONS' mobile/
```

## Figma component-set

Single component set `Toast` with one Variant axis. Mirrors Banner's 4-tone structure but on a `bg-card` surface with shadow, 3pt left accent, and stack-of-2 (title + body) text rhythm — distinct from Banner's flush inline pattern.

> Built in Figma 2026-05-04 alongside the Components Pass 2 sweep.

### Variant axes

| Property | Values | Count |
|---|---|---:|
| `Variant` | `Success` · `Info` · `Warning` · `Error` | 4 |

`State`, `Auto-dismiss`, `with-CTA` are runtime concerns — handled at instance-time / code time, not authored as variants.

### Naming

```
Toast   →   Variant=<Variant>
```

### Variable bindings — per cell

| Slot | Bound to (per Variant) |
|---|---|
| Container fill | Success → `color/success/50` · Info → `color/slate/100` · Warning → `color/warning/50` · Error → `color/danger/50` |
| Container border-left (3pt accent) | Success → `color/success/600` · Info → `color/slate/500` · Warning → `color/warning/600` · Error → `color/danger/600` |
| Container effect | `effect/shadow-md/light` |
| Container radius (all 4) | `radius/md` |
| Container width × height | 380 fixed × hug (typically 80pt with title + body) |
| Padding | `space/4` X (16pt) · `space/3` Y (12pt) |
| Item spacing (icon → text) | `space/3` (12pt) |
| Icon | INSTANCE per Variant: `Icon / CheckCircle2` · `Icon / Info` · `Icon / AlertTriangle` · `Icon / AlertCircle`. Stroke bound to variant-700: success/700 · slate/700 · warning/700 · danger/700. Sized 20pt. |
| Title | `text/body-sm-semibold` (14/600), `color/slate/900` |
| Body | `text/body-sm` (14/400), `color/slate/700` |
| Title → body gap | `space/1` (4pt) |

### File placement

| Asset | Component-set ID | Position (page `❖ Components`) | Size |
|---|---|---|---|
| `Toast` | `110:160` | (100, 7028) | 500 × 520 |

### Deviations from spec, tracked

| Deviation | Reason | Recovery path |
|---|---|---|
| CTA slot not authored as a variant axis | Per spec "CTA (optional) — `<Button variant="link" size="sm">` aligned right". Adding `WithCTA: Yes/No` would double the cells; CTA is rare per spec ("Refresh" warning, "Retry" error) | Designers detach + add a Button instance manually for CTA-bearing toasts |
| Stack behavior not authored | Stack offset is a runtime layout concern (cron-scheduled toasts push older down) — not a static frame concern | No work — toast manager handles stacking at code time |
| Auto-dismiss timer + swipe gesture not animated | Static spec frames don't show timers / gestures | Smart Animate prototype connections + `duration-base` enter / exit per the Motion table |

## Cross-references

- Tokens: [`colors.md`](../../tokens/colors.md) · [`shadows.md`](../../tokens/shadows.md) · [`motion.md`](../../tokens/motion.md)
- Primitives: [`icon.md`](../primitives/icon.md) · [`button.md`](../primitives/button.md)
- When-to-use-what: [`banner.md`](./banner.md) (persistent, inline) · this file (transient, top)
- Error display: [`error-ux.md`](../../../.claude/rules/error-ux.md)
- Layer rules: [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md)
- Lessons: type floor (2026-05-01)
