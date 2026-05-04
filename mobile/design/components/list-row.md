# List row

The most-used composition in the mobile app. History rows, recipient rows, settings rows, language picker, card picker, notifications — all built from this. Five variants share an anatomy and a tap-target contract.

> Status: **First-pass spec, in review.** No direct admin equivalent (admin uses dense `<TableRow>` for similar ergonomics). Mobile list rows are touch-first — taller, more breathable, often with the avatar / chevron rhythm.

## Source of truth

- Tokens: [`colors.md`](../../tokens/colors.md), [`typography.md`](../../tokens/typography.md), [`spacing.md`](../../tokens/spacing.md), [`radii.md`](../../tokens/radii.md)
- Primitives consumed: Avatar (in row), Chip (in row meta), Icon (chevron / status), Button (when row hosts an inline action — rare)
- Accessibility floor: [`.claude/rules/accessibility.md`](../../../.claude/rules/accessibility.md)

## Variants

| Variant | Use |
|---|---|
| `single-line` | Settings rows, simple link rows ("Privacy policy", "About"), language picker entries |
| `two-line` | Most rows in the app — name + meta. Recipient rows, history rows, card picker, sender card list |
| `avatar` | Recipient picker, history with avatar, MyID flow recipient confirm. Identity is the focal element |
| `toggle` | Settings — push notifications, biometric unlock, dark mode. Switch on the right |
| `selectable` | Picker patterns — language, currency, send-from card. Radio on the left |

## Anatomy

```
┌──── 56pt minimum (single) / 64pt typical (two-line + avatar) ──┐
│                                                                │
│  ←space-4(16pt)→  ┌──────────────┐   ←space-3(12pt)→  ›       │
│                   │  primary     │                              │
│                   │  meta (sub)  │                              │
│                   └──────────────┘                              │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
   ↑                                                          ↑
   leading slot (avatar / icon / radio)                       trailing
                                                              (chevron / chip / amount / switch)
```

| Slot | Token / value |
|---|---|
| Container surface (idle) | `bg-card` (white light / slate-900 dark) |
| Container pressed | `bg-muted/50` (slate-100 / slate-800 at 50%) |
| Container surface (selected) | `bg-brand-50/60` (light) / `bg-brand-950/40` (dark) |
| Vertical padding | `space-3` (12pt) — yields 56pt visual minimum at single-line |
| Horizontal padding | `space-4` (16pt) — matches page-gutter |
| Divider | 1pt `--border` between rows; **not** below the last row in a card |
| Primary text | `text-base font-medium` (16pt) — slate-900 light / slate-100 dark |
| Meta / subline | `text-sm font-normal text-muted-foreground` (14pt) — never `text-xs` per LESSON 2026-05-01 |
| Trailing meta (amount, status) | `text-sm font-medium tabular-nums` (amounts), `text-sm` (status chip) |
| Chevron | lucide `<ChevronRight>` 20pt, `slate-400` (light) / `slate-500` (dark) — only for navigational rows |
| Min tap-area | 44pt (single-line); 56pt+ (two-line / avatar / toggle / selectable) — visual = tap-area |

## Variant: `single-line`

```
┌─────────────────────────────────────────────────────┐
│  Privacy policy                                  ›  │   56pt
└─────────────────────────────────────────────────────┘
```

- Primary text only, no meta.
- Trailing chevron when the row navigates; trailing chip when displaying status (e.g. "App version 2.4.1 · Up to date").
- Used for: settings entries, support links, terms / privacy links.

## Variant: `two-line`

```
┌─────────────────────────────────────────────────────┐
│  Wang Lei                          5 000 UZS     ›  │
│  Alipay · 2h ago                  Completed         │   64pt
└─────────────────────────────────────────────────────┘
```

- Primary on row 1, meta on row 2 (`text-sm text-muted-foreground`).
- Trailing column wraps amount + status chip vertically.
- Used for: history rows, transfer rows, sender card list.

## Variant: `avatar`

```
┌─────────────────────────────────────────────────────┐
│ ╭───╮  Wang Lei                    5 000 UZS     ›  │
│ │WL │  Alipay · Verified           Completed        │   72pt
│ ╰───╯                                               │
└─────────────────────────────────────────────────────┘
```

| Slot | Detail |
|---|---|
| Avatar size | `md` (48pt) per [`avatar.md`](../primitives/avatar.md) |
| Avatar → text gap | `space-3` (12pt) |
| Row height | 72pt typical (avatar 48 + 12 vertical pad) |

- Used heavily on recipient picker, history with identity, support thread.
- When a recipient is `tier_2`-MyID-verified, the meta line shows "Alipay · Verified" with a `<BadgeCheck>` 14pt inline.

## Variant: `toggle`

```
┌─────────────────────────────────────────────────────┐
│  Push notifications                          [ ●  ] │   56pt
│  We'll only message you about transfers             │
└─────────────────────────────────────────────────────┘
```

| Slot | Detail |
|---|---|
| Switch (radix) | 32 × 20pt track + 16pt thumb; brand-600 active, slate-300 inactive |
| Switch tap-area | inflates to 44pt via padding |
| Description | optional second line, `text-sm text-muted-foreground` |
| Whole-row tap | toggles the switch (entire row is the tap target) |

- Per [`accessibility.md`](../../../.claude/rules/accessibility.md): switch announces as `role="switch"` `aria-checked={value}`; primary text is the label, description linked via `aria-describedby`.

## Variant: `selectable`

```
┌─────────────────────────────────────────────────────┐
│  ◉  Uzbek (default)                                 │   56pt
│     +998 — UZ                                        │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│  ○  Russian                                         │   56pt
│     +998 — UZ                                        │
└─────────────────────────────────────────────────────┘
```

| Slot | Detail |
|---|---|
| Radio | 20pt circle, 8pt inner dot when selected; `slate-300` border idle, `brand-600` border + dot when selected |
| Radio → text gap | `space-3` (12pt) |
| Selected row surface | `bg-brand-50/60` (light tint) — color + icon-state pair, never color-only |
| Whole-row tap | selects the radio |

- Used for: language picker (in MyID flow + settings), source-card picker (send-money), currency picker, recipient-flow disambiguation.

## States (cross-variant)

| State | Treatment |
|---|---|
| `idle` | base palette per variant |
| `pressed` | `bg-muted/50` over `duration-fast` (90ms) |
| `selected` (selectable / toggle / picker) | `bg-brand-50/60` light tint + ring/dot indicator |
| `disabled` | `opacity-60` + `pointer-events-none`; descriptive helper text below explains why |
| `loading` (e.g. switch async-saving) | switch shows `<Loader2>` overlay; row stays visible, `aria-busy="true"` |
| `error` (e.g. failed save) | inline error helper below row; danger-600 icon `<AlertCircle>` 16pt before the helper |

## Token consumption summary

| Surface | Token |
|---|---|
| Container | `bg-card`, pressed `bg-muted/50`, selected `bg-brand-50/60` |
| Primary text | `text-base font-medium`, slate-900 / slate-100 |
| Meta text | `text-sm font-normal text-muted-foreground` |
| Padding | `space-3 / space-4` (12 / 16pt) |
| Divider | 1pt `--border` |
| Chevron | lucide `<ChevronRight>` size-5, `slate-400 / slate-500` |
| Avatar gap | `space-3` (12pt) |
| Switch / radio | per [`primitives/`](../primitives/) (Switch is admin-shared; Radio is composed at this layer) |

## Composition rules

| Pattern | Rule |
|---|---|
| List rows inside a Card | Card `radius-md` + `overflow-hidden`; rows flush to card edges. Card owns the side padding; rows zero out their `px`. (Per [`card.md`](./card.md) composition rules.) |
| List rows in a full-width sheet | Rows extend to sheet edges with their own `px-4` padding. |
| Mixed row variants in one list | Allowed if each variant's height is consistent within its run. Don't alternate `single-line` and `two-line` randomly — group by type. |
| Sectioned list (e.g. settings groups) | Section header `text-sm font-medium uppercase tracking-wider text-muted-foreground` (`text-xs` is allowed for uppercase tracking-wider section labels per LESSON 2026-04-29), `mb-2` before group, `mt-6` after group. |
| Empty state (no rows) | Render an `<EmptyState>` (Components layer) inside the card body, not a placeholder row. |

## Accessibility

| Concern | Rule |
|---|---|
| Tap target | `single-line` 56pt visual = ≥ 44pt tap. `two-line` / `avatar` / `toggle` / `selectable` ≥ 56pt. Whole row is the tap-target |
| Focus ring | `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset` — inset so the ring stays within the row's visual frame inside cards |
| Screen reader | Navigational row: `<button>` or `<a>` with primary + meta read together; toggle: `role="switch"` with `aria-checked`; selectable: `role="radio"` with `aria-checked`; group container: `role="radiogroup"` |
| Reduced motion | Press-state surface change is instantaneous (no fade) |
| Color-only signals | Selected state combines `bg-brand-50/60` + radio dot / chevron — never color alone |

## Localization

| Slot | Key pattern |
|---|---|
| Primary text | `mobile.<surface>.<screen>.<row>.label` |
| Meta text | `mobile.<surface>.<screen>.<row>.meta` (often composed: ICU MessageFormat for plurals — `{count, plural, one {# transfer} other {# transfers}}`) |
| Toggle description | `mobile.<surface>.<screen>.<row>.description` |
| Section header | `mobile.<surface>.<screen>.section-<group>.title` |

- Russian primary text runs 15–25% longer — verify two-line variant doesn't truncate the primary. If it does, drop meta to a single line or move to a stacked layout.
- Number / date in meta follows `users.preferred_language` — `2h ago`, `Apr 29, 2026 at 3:26 PM` (en), `2 ч назад`, `29.04.2026 в 15:26` (ru).

## Forbidden patterns

| Don't | Required |
|---|---|
| `text-xs` (13pt) on meta / sublines | `text-sm` floor — LESSON 2026-05-01 |
| Both whole-row tap AND a tappable button inside | Choose one tap-owner. Embedded buttons disable the row's outer tap |
| Chevron on a non-navigational row | Chevron means "this opens detail" — never decorative |
| Toggle without a clear label | Switch in isolation is meaningless — always pair with `text-base` primary |
| Radio inside an open-ended list (no group) | Selectables are part of a `radiogroup` — never solo |
| Custom row height (e.g. `h-[40px]`) | Stick to the variant heights — 56 / 64 / 72pt |
| Status color signal without the status chip | Failure = chip + reason text, not red row tint |
| Inline-button row in a recipient picker | Picker rows are tap-to-select. Inline actions belong on a `<Sheet>` after selection |
| Removing the divider on the last row in a card | Divider only between rows — last-row divider creates a double border with the card edge |

## Quick grep to verify (when implemented)

```bash
# text-xs on meta / sublines — LESSON 2026-05-01:
grep -rnE 'ListRow.*text-xs|RowMeta.*text-xs' mobile/design/

# Custom heights bypassing variant scale:
grep -rnE 'ListRow.*h-\[' mobile/

# Whole-row tap + nested buttons (anti-pattern):
grep -rnE 'ListRow.*onClick.*<Button' mobile/design/screens/
```

## Cross-references

- Tokens: [`spacing.md`](../../tokens/spacing.md) · [`typography.md`](../../tokens/typography.md) · [`colors.md`](../../tokens/colors.md)
- Primitives consumed: [`avatar.md`](../primitives/avatar.md) · [`chip.md`](../primitives/chip.md) · [`icon.md`](../primitives/icon.md)
- Card composition: [`card.md`](./card.md)
- Accessibility: [`accessibility.md`](../../../.claude/rules/accessibility.md)
- Localization: [`localization.md`](../../../.claude/rules/localization.md)
- Layer rules: [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md)
- Lessons: flowing-text floor (2026-05-01), reserved typography categories for section headers (2026-04-29)
