# Segmented control

Two- or three-segment toggle. Used for recipient picker (Recent / Saved / New), history filters (All / Sent / Received — though "received" not in v1), settings sub-tabs.

> Status: **First-pass spec, in review.** Mirrors admin's [`<SegmentedControl>`](../../../dashboard/src/components/ui/) pattern. Mobile-specific: `fullWidth` mode for fixed-bottom action bars per LESSON 2026-05-03 (services & health mobile bar consistency).

## Source of truth

- Admin reference: [admin's StatusToggleGroup](../../../dashboard/src/components/) and segmented-control patterns
- Tokens: [`colors.md`](../../tokens/colors.md), [`spacing.md`](../../tokens/spacing.md), [`radii.md`](../../tokens/radii.md), [`motion.md`](../../tokens/motion.md)
- Lesson that binds: [LESSON 2026-05-03 — Fixed-bottom mobile action bars: every row spans the same edge-to-edge width](../../../ai_context/LESSONS.md)

## Variants

Two, by sizing mode.

| Variant | Sizing | Use |
|---|---|---|
| `inline-flex` (default) | Content-sized; segments span their natural label width | Recipient picker on a sheet, settings sub-tabs, history filters mid-page |
| `fullWidth` | Each segment `flex-1`, equal-width across the parent | Fixed-bottom mobile action bars (per LESSON 2026-05-03), full-width filter bars where consistency with adjacent full-width chrome matters |

## Sizes

| Size | Track height | Segment padding (X / Y) | Type | Use |
|---|---:|---|---|---|
| `sm` | 32pt | `space-3 / space-1` (12 / 4pt) | `text-xs font-medium` (chip-adjacent context) | Toolbar chips, secondary in-row toggles |
| `md` | 40pt | `space-4 / space-2` (16 / 8pt) | `text-sm font-medium` | **Default.** Recipient picker, history filters |
| `lg` | 48pt | `space-5 / space-3` (20 / 12pt) | `text-sm font-medium` | Hero contexts, main-screen sub-navigation |

> The `text-xs` (13pt) on `sm` is permitted because segmented-control segments are chip-adjacent (per LESSON 2026-04-29 reserved category). However, `md` and `lg` segments use `text-sm` — segmented control labels in flowing-text contexts follow the LESSON 2026-05-01 floor.

## Anatomy

```
inline-flex variant (md size):

   ╭─[ track · radius-pill · bg-muted ]─────────────────╮
   │                                                    │
   │ ╭─ Active ─╮                                       │
   │ │  Recent  │     Saved     New recipient           │
   │ ╰──────────╯                                       │
   ╰────────────────────────────────────────────────────╯
       ↑
       thumb · radius-pill · bg-card · shadow-sm · text-foreground


fullWidth variant (md size):

   ╭───────────────────────────────────────────────────────╮
   │ ╭───── Active ─────╮                                  │
   │ │      Recent       │      Saved      │     New        │
   │ ╰──────────────────╯                                  │
   ╰───────────────────────────────────────────────────────╯
       ↑
       each segment flex-1, justify-center
```

| Slot | Token / value |
|---|---|
| Track surface | `bg-muted` (slate-100 light / slate-800 dark) |
| Track radius | `radius-pill` (9999px) |
| Track padding | `space-1` (4pt) all sides — provides 4pt breathing for the thumb |
| Thumb surface (active segment) | `bg-card` light (white) / `slate-700` dark |
| Thumb radius | `radius-pill` |
| Thumb shadow | `shadow-sm` (light); `shadow-none` (dark — surface contrast carries it) |
| Active label color | `slate-900` light / `slate-100` dark — `font-medium` |
| Inactive label color | `slate-700` light / `slate-300` dark |
| Inactive hover (mouse) | label shifts to `slate-900` / `slate-100` over `duration-fast` |
| Segment padding | per Sizes table |
| Type | per Sizes table |
| Min tap-area per segment | ≥ 44pt — track height does the heavy lifting (`md`/`lg`); `sm` segments inflate via parent row padding |

## States

| State | Treatment |
|---|---|
| `idle` | thumb on selected segment; inactive labels muted |
| `pressed` (segment user is currently tapping) | label color shifts toward active immediately; thumb begins translating after release |
| `transitioning` | thumb slides between segments at `duration-base` (220ms) `ease-standard`; label colors swap at the same tempo |
| `disabled` (whole control) | `opacity-60` `pointer-events-none`; thumb stays on idle selection |
| `disabled` (single segment) | that segment's label `opacity-50`; tap returns no-op; tooltip / inline helper explains why on a non-touch surface |
| `focused` (keyboard nav with arrow keys) | active segment shows 2pt `--ring` outset around the thumb |

## Token consumption summary

| Surface | Token |
|---|---|
| Track fill | `bg-muted` (slate-100 / slate-800) |
| Thumb fill | `bg-card` light / `slate-700` dark |
| Thumb shadow | `shadow-sm` light / none dark |
| Track + thumb radius | `radius-pill` |
| Track padding | `space-1` (4pt) |
| Segment padding | `space-3..5 / space-1..3` per size |
| Type (sm / md / lg) | `text-xs` (sm) / `text-sm` (md / lg), `font-medium` |
| Motion | `duration-base` (220ms), `ease-standard` |
| Focus ring | `--ring` 2pt + 2pt offset |

## Composition rules

| Pattern | Rule |
|---|---|
| Fixed-bottom mobile action bar | Use `fullWidth` variant. Place above any button row in the bar — both rows match edge-to-edge width per LESSON 2026-05-03 |
| Full-width filter bar above a list | `fullWidth`, sits flush to top of the list pane, `mb-4` to first row |
| Centered in a content area | `inline-flex` variant; `mx-auto` to center; max 3 segments — beyond, switch to a Tabs component |
| Inside a Sheet | `fullWidth` if the sheet's actions/content are full-width below; `inline-flex` if surrounded by other inline-flex controls |
| In a card body | `inline-flex` `mx-auto` for centered alignment; `mt-3 mb-4` for vertical rhythm |
| Sub-navigation on a settings tab | Avoid — use Tabs (a separate Components-layer artefact) for sub-navigation. Segmented control is for filtering / view-switching, not nav |

## Accessibility

| Concern | Rule |
|---|---|
| ARIA role | `role="tablist"` if the control is filtering content panels; `role="radiogroup"` if it's selecting a single value |
| Tab semantics | `role="tab"` per segment with `aria-selected`; or `role="radio"` with `aria-checked` if radiogroup |
| Tap target | ≥ 44pt visual at `md` / `lg`; `sm` inflates via parent |
| Keyboard | Left/Right arrow moves between segments; Home/End jumps to first/last; Enter/Space activates |
| Focus ring | always visible — `--ring` outset around the thumb on the focused segment |
| Color-only signals | Active state combines thumb surface + label color shift + (optional) shadow — not color alone |
| Reduced motion | Thumb translation falls back to instantaneous; label color swap stays |

## Localization

| Slot | Key pattern |
|---|---|
| Segment label | `mobile.<surface>.<screen>.segment-<id>.label` |
| ARIA group label | `mobile.<surface>.<screen>.segment-group.aria-label` |

- Russian segment labels run 15–25% longer — `fullWidth` accommodates (each segment expands); `inline-flex` may cause overflow on small viewports. Test at 360pt viewport in `ru`.
- Three-segment controls in `ru` at `md` size on a 360pt viewport may need to drop to two segments + overflow menu, or switch to `lg` size for breathing.

## Forbidden patterns

| Don't | Required |
|---|---|
| Mixing `inline-flex` segmented control with full-width sibling rows in a fixed-bottom action bar | `fullWidth` variant — per LESSON 2026-05-03 |
| 4+ segments | Use Tabs (Components layer) — segmented control caps at 3 |
| `radius-md` / `rounded-lg` track | `radius-pill` always — segmented controls are pill-shaped |
| Color-only active state (no thumb surface change) | Thumb surface + label color + shadow — multi-signal |
| Hardcoded thumb hex / arbitrary px | Tokens only |
| Disabled segment without an explanation | Inline helper or banner explains the gating (e.g. "Verify with MyID to enable") |
| Segmented control as a navigation primitive (replacing a Tabs / TabBar) | Filtering / view-switching only — never nav |

## Quick grep to verify (when implemented)

```bash
# inline-flex segmented control in mobile action bars (LESSON 2026-05-03):
grep -rnE 'self-center.*SegmentedControl|self-center.*ToggleGroup' mobile/design/

# Hardcoded segmented hex:
grep -rnE 'SegmentedControl.*bg-\[#|SegmentedControl.*text-\[#' mobile/

# Non-pill radius:
grep -rnE 'SegmentedControl.*rounded-md|SegmentedControl.*rounded-lg' mobile/
```

## Cross-references

- Tokens: [`colors.md`](../../tokens/colors.md) · [`spacing.md`](../../tokens/spacing.md) · [`radii.md`](../../tokens/radii.md) · [`motion.md`](../../tokens/motion.md)
- Adjacent components: Tab bar (bottom nav, different primitive) — [`tab-bar.md`](./tab-bar.md)
- Action-bar composition: [LESSON 2026-05-03 — Fixed-bottom mobile action bars](../../../ai_context/LESSONS.md)
- Layer rules: [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md)
- Lessons: full-width consistency (2026-05-03), reserved typography categories for chips (2026-04-29), button text floor (2026-05-01)
