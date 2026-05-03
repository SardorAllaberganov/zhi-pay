# Spacing

8pt base scale. Named tokens map to Tailwind's `space-N` utilities for parity with admin and quick recall.

## Tokens

| Token | Value | Tailwind | Mobile-specific use |
|---|---:|---|---|
| `space-0` | 0pt | `0` | Reset / collapse |
| `space-1` | 4pt | `1` | Hairline gap (icon → text in a chip) |
| `space-2` | 8pt | `2` | Tight gap (chip row, kbd combo) |
| `space-3` | 12pt | `3` | List-row vertical padding (sm); button leading-icon → label |
| `space-4` | 16pt | `4` | Card content padding (sm); list-row default vertical; gap between input rows |
| `space-5` | 20pt | `5` | Card content padding (md, default); Sheet content padding |
| `space-6` | 24pt | `6` | Card section gap; modal body padding |
| `space-7` | 32pt | `8` | Section vertical rhythm; gap between Card blocks on home |
| `space-8` | 40pt | `10` | Page gutter top/bottom on hero screens (home, receipt) |
| `space-9` | 48pt | `12` | Hero card outer margin from viewport edge |
| `space-10` | 64pt | `16` | Empty-state vertical breathing |
| `space-11` | 80pt | `20` | Reserved (long-form content, currently unused at mobile) |
| `space-12` | 96pt | `24` | Reserved (long-form content, currently unused at mobile) |

> Tailwind utility note: Tailwind's `space-N` and `p-N` / `m-N` / `gap-N` all share the same scale — `space-1` token = `p-1` Tailwind class = 4pt. The named tokens above are spec-doc only; in code, reach for the Tailwind utility directly.

## Page-edge gutter

Mobile viewport (`390pt` reference) uses **`space-4` (16pt) horizontal page-gutter** by default. Hero screens (home card, receipt) widen to **`space-5` (20pt)** so the card-as-object surface has more breathing room from the screen edge.

```
┌──────────────────────────────────────┐
│ ←─ 16pt ─→                ←─ 16pt ─→ │   ← default page gutter
│                                      │
│        [content]                     │
│                                      │
│ ←─ 20pt ─→                ←─ 20pt ─→ │   ← hero-screen gutter (home, receipt)
└──────────────────────────────────────┘
```

## Content rhythm — vertical

The 4pt baseline is the smallest unit any content touches. Vertical rhythm between repeating elements snaps to:

| Between | Spacing |
|---|---|
| Lines inside a paragraph | `line-height` only (per [`typography.md`](./typography.md)) |
| Form rows in a stack | `space-4` (16pt) |
| List rows in a stack | `0` (rows own their padding); divider hairline at `slate-200` |
| Cards in a column | `space-6` (24pt) on hero screens; `space-4` (16pt) on dense screens |
| Page header → first card | `space-6` (24pt) |
| Last card → safe area bottom | `space-8` (40pt) — keep CTAs clear of home-indicator gestures |
| Section group → next section group | `space-7` (32pt) |

## Component padding presets

These are the "first-instinct" defaults. Components can override locally if a variant calls for tighter / looser, but document the override.

| Component | Inset (X / Y) | Notes |
|---|---|---|
| Button — sm | 12 / 8 (`space-3 / space-2`) | 40pt height target; tap-area extends beyond visual to 44pt |
| Button — md (default) | 20 / 12 (`space-5 / space-3`) | 48pt height |
| Button — lg | 24 / 16 (`space-6 / space-4`) | 56pt height; hero CTAs ("Confirm send") |
| Input | 16 / 12 (`space-4 / space-3`) | 48pt height; tap-area = visual |
| Card | 20 / 20 (`space-5 / space-5`) | Default; matches admin |
| Sheet content | 20 / 20 (`space-5 / space-5`) | Drag-handle adds 8pt above content |
| Modal body | 24 / 24 (`space-6 / space-6`) | Modal is full-screen on mobile — extra padding for breathing |
| Toast | 16 / 12 (`space-4 / space-3`) | Plus 8pt gap between consecutive toasts |
| Banner (inline) | 16 / 12 (`space-4 / space-3`) | Plus 8pt gap from preceding content |
| Chip / Badge | 8 / 4 (`space-2 / space-1`) | Visual gap; tap-area enforced at 44pt by parent row |
| List row | 16 / 12 (`space-4 / space-3`) | 56pt minimum visual; 64pt typical with avatar; tap-area = visual |
| Tab bar item | n/a / 8 (`space-2`) vertical | 56pt total height; Tab-bar wraps safe-area-bottom |

## Tap-target rule (cross-cuts spacing)

Per [`accessibility.md`](../../../.claude/rules/accessibility.md): every tap target ≥ **44 × 44pt**. When a control's *visual* size is smaller (e.g. a chip at 28pt high), extend the tap-area via `min-h-[44pt] min-w-[44pt]` or padding inflation — don't shrink the visual.

Avoid placing two tap targets within **8pt** of each other (`space-2`).

## Forbidden patterns

| Don't | Required |
|---|---|
| Arbitrary `gap-[7px]` / `padding: 11px` | Stick to scale tokens (`space-2 = 8pt`) |
| Negative margins to "fix" layout | Re-author the layout — negative margins create stacking-context bugs |
| Visual padding < 44pt tap area on interactive elements | Pad the tap-area via `min-h-[44pt]` or wrapper |
| Variable spacing per locale | Spacing is locale-agnostic; only width adapts to translation length |

## Cross-references

- Tap-target floor: [`accessibility.md`](../../../.claude/rules/accessibility.md)
- Layer rules: [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md)
