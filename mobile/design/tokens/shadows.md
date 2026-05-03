# Shadows

Three elevations × two modes. Dark-mode shadows lean on **opacity**, not blur — light spilling from a brighter surface against a darker base reads naturally; pumping blur in dark mode reads as "dirty," not depth.

## Source of truth

Inherits admin's three stops verbatim, adds `shadow-hero` for the home card-as-object (admin doesn't have a hero surface).

- Admin reference: [`dashboard/src/styles/globals.css`](../../../dashboard/src/styles/globals.css) lines 80–82, 119–121

## Tokens — light mode

| Token | Value | Tailwind | Use |
|---|---|---|---|
| `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.04)` | `shadow-sm` | Resting card, list-row hover |
| `shadow-md` | `0 4px 12px -2px rgb(0 0 0 / 0.08), 0 1px 3px -1px rgb(0 0 0 / 0.04)` | `shadow` | Sheet (when open), modal scrim-card, popover |
| `shadow-lg` | `0 12px 32px -8px rgb(0 0 0 / 0.12), 0 4px 12px -2px rgb(0 0 0 / 0.06)` | `shadow-lg` | Toast, dropdown menu, picker overlay |
| `shadow-hero` | `0 24px 48px -12px hsl(var(--brand-900) / 0.20), 0 8px 24px -4px hsl(var(--brand-800) / 0.12)` | `shadow-[var(--shadow-hero)]` | Home card-as-object — **only place this gets heavy treatment** |

## Tokens — dark mode

Same blur values, same offsets. Opacity bumps ~2–3× because the base surface is `slate-950` and blacker shadows blend less.

| Token | Value (dark) | Tailwind |
|---|---|---|
| `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.40)` | `shadow-sm` (auto via dark mode) |
| `shadow-md` | `0 4px 12px -2px rgb(0 0 0 / 0.50), 0 1px 3px -1px rgb(0 0 0 / 0.30)` | `shadow` |
| `shadow-lg` | `0 12px 32px -8px rgb(0 0 0 / 0.60), 0 4px 12px -2px rgb(0 0 0 / 0.40)` | `shadow-lg` |
| `shadow-hero` | `0 24px 48px -12px hsl(var(--brand-950) / 0.65), 0 8px 24px -4px hsl(var(--brand-900) / 0.45)` | `shadow-[var(--shadow-hero)]` |

> Dark-mode opacity rule: **never duplicate the light-mode shadow's blur radius and just bump opacity.** That makes the surface look smudgy. Keep blur identical, push opacity. The visual depth comes from the brand-tint hue mixing into the dark base.

## Per-elevation use map

### `shadow-sm` — resting

The default for any card sitting on the page background. Subtle enough to read as a surface, not as "elevated UI."

```
─────────────  body bg
  ╭────────╮   ←─ shadow-sm
  │ card   │
  ╰────────╯
─────────────
```

### `shadow-md` — interactive

The sheet, modal-card, and popover live one notch up — visibly off the surface, but not hovering.

### `shadow-lg` — transient

Toast, dropdown, picker overlay — these float above everything and need to read as transient. The blur reads larger so the surface clearly belongs to a different plane.

### `shadow-hero` — card-as-object (home, receipt)

The home-screen card-as-object and the receipt amount card are designed as **objects in space**, not panels. The shadow gets a brand-tinted lift from `brand-900` / `brand-800` to give the feeling that the card is "yours" — slightly anchored, slightly proud.

```
                   ╭───────────────╮
                   │   ZHIPAY      │
                   │               │
                   │   ●           │
                   ╰───────────────╯
                ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  ←─ shadow-hero (brand-tinted blur)
              ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
```

**Limit one `shadow-hero` per screen.** If two surfaces wear it, neither is the hero — drop one to `shadow-md`.

## Layering and composition

- Shadows compose via `box-shadow`; never stacked through nested wrappers.
- A toast on top of a modal: toast carries `shadow-lg`; the modal stays `shadow-md`. The visual depth ladder is preserved.
- A sheet *opening over* the home card: sheet carries `shadow-md`; the home card's `shadow-hero` mutes via the sheet's backdrop scrim (50% slate-950 opacity), so the depth contention resolves automatically.

## Reduced-motion + reduced-transparency

- `prefers-reduced-transparency`: drop the brand-tint from `shadow-hero` and use the plain `shadow-lg` value instead. Hue tints are ornamentation; the elevation cue is the offset + blur.
- `prefers-reduced-motion` doesn't affect shadows directly (shadows don't move), but **shadow transitions on press** (e.g. button shrinks `shadow-sm → none` on `:active`) drop to instantaneous per [`motion.md`](./motion.md).

## Forbidden patterns

| Don't | Required |
|---|---|
| Stacking 4+ shadow layers to "make it pop" | Pick one elevation token; redesign the layout if depth is unclear |
| Using `shadow-hero` on cards that aren't object-like | Reserve for the home card and receipt card |
| Bright-colored shadows (purple, green, etc.) for ornament | Brand-tint only on `shadow-hero`; everything else stays neutral |
| Inverted (inset) shadows | Forbidden — reads as form-field nesting and breaks ladder |
| Per-screen one-off shadow values | Add to this doc first; don't drift |

## Cross-references

- Admin reference: [`dashboard/src/styles/globals.css`](../../../dashboard/src/styles/globals.css)
- Motion (shadow transitions on press): [`motion.md`](./motion.md)
- Layer rules: [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md)
