# Avatar

Recipient / user identity primitive. Three sizes, two render variants (initials / photo), optional status dot. Used by recipient picker, history rows, settings, MyID confirm, support handoff.

> Status: **First-pass spec, in review.** Mirrors admin's [`<Avatar>`](../../../dashboard/src/components/ui/avatar.tsx) (radix Avatar) with mobile-specific sizes and the optional status-dot affordance.

## Source of truth

- Admin reference: [`dashboard/src/components/ui/avatar.tsx`](../../../dashboard/src/components/ui/avatar.tsx)
- Tokens: [`colors.md`](../tokens/colors.md), [`typography.md`](../tokens/typography.md), [`radii.md`](../tokens/radii.md)
- Privacy: [`.claude/rules/core-principles.md`](../../../.claude/rules/core-principles.md) (no PII leakage), [`.claude/rules/card-schemes.md`](../../../.claude/rules/card-schemes.md) (no full PINFL / document number)

## Sizes

Three sizes. Pick by **host context**, not by personal preference.

| Size | Diameter | Type (initials) | Use |
|---|---:|---|---|
| `sm` | 32pt | `text-xs` (13pt) `font-semibold` | Inline meta in dense rows, small list rows, comment authors |
| `md` | 48pt | `text-sm` (14pt) `font-semibold` | **Default.** Recipient list rows, history rows, settings header, support thread |
| `lg` | 72pt | `text-2xl` (22pt) `font-semibold` | Hero contexts — MyID confirm screen, recipient detail header, profile screen |

> The `text-xs` (13pt) on the `sm` initials variant is permitted — avatar fallback initials are one of the reserved categories per LESSON 2026-04-29.

## Anatomy

### Initials variant

```
       ╭───╮
       │WL │      32pt — sm
       ╰───╯

      ╭─────╮
      │ WL  │     48pt — md (default)
      ╰─────╯

    ╭─────────╮
    │   WL    │   72pt — lg
    │         │
    ╰─────────╯
```

| Slot | Token / value |
|---|---|
| Container | `radius-pill` (9999px) — always perfectly circular |
| Surface | derived from name hash (see "Color derivation" below) |
| Initial(s) | first letter of first word + first letter of last word; single letter if only one word |
| Initial color | `--primary-foreground` (white) on color-derived surfaces; `slate-700` on `slate-100` fallback |
| Type | `text-xs` (sm), `text-sm` (md), `text-2xl` (lg) — `font-semibold`, locale-default fontFamily |
| Border | none — surface and content provide separation |

### Photo variant

```
      ╭─────╮
      │ 👤  │     same dimensions per size
      ╰─────╯       photo cropped square then masked to circle
```

| Slot | Token / value |
|---|---|
| Container | `radius-pill`, `overflow-hidden` |
| Image | `object-cover`, square crop centered |
| Loading state | renders the initials variant with derived color until image loads |
| Error / 404 / blocked | falls through to initials variant — never a broken-image icon |
| Decorative `aria-hidden` | only when paired with an adjacent name label that carries the meaning |

## Color derivation (initials variant)

Derive the surface color deterministically from the name string so the same recipient always shows the same color across sessions and surfaces.

| Hash bucket (name → first char of MD5 hex) | Surface | Initial color |
|---|---|---|
| `0`, `4`, `8`, `c` | `brand-600` | white |
| `1`, `5`, `9`, `d` | `slate-700` | white |
| `2`, `6`, `a`, `e` | `success-600` | white |
| `3`, `7`, `b`, `f` | `warning-600` | white |

Empty / unknown name → `slate-100` surface + `slate-700` initial. Never derive a danger-600 (red) avatar — red is reserved for failure semantics, not identity.

> **Why deterministic, not random?** Stable identity. A user's recipient avatar should look the same whether they open it from history, recipient picker, or transfer detail. Random avatars break the "is this the same person?" instinct.

## Status dot affordance (optional)

A small overlay dot for online / offline state. **Mostly unused at v1** — kept in the spec so it doesn't drift later when support-chat / agent-online surfaces land.

```
      ╭─────╮
      │ WL ●│     ← status dot at bottom-right
      ╰─────╯
```

| Slot | Token / value |
|---|---|
| Position | absolute, `bottom: 0`, `right: 0`; nudges in by 1pt at `sm`, 2pt at `md`/`lg` |
| Diameter | 8pt (sm), 10pt (md), 12pt (lg) |
| Surface | `success-600` (online), `slate-400` (offline) |
| Border | 2pt in `--background` — punches the dot out of the avatar visually |
| Aria | linked to a parent `aria-describedby` carrying "Online" / "Offline" |

> Forbidden in v1: pairing `online` status with anything other than the support-agent context. Don't sprinkle online-dots on recipient avatars — they read as misleading availability.

## States

| State | Treatment |
|---|---|
| `idle` | base palette per derivation |
| `loading` (photo variant only) | skeleton shimmer at avatar diameter, `slate-100` light / `slate-800` dark; `duration-base` opacity pulse |
| `interactive` (avatar can be tapped to open profile) | inflates parent tap-area to ≥ 44pt; avatar itself doesn't visually change. No hover state on mobile |
| `selected` (recipient picker multi-select) | 2pt `--ring` (brand-600) outset around the avatar — leaves the avatar surface intact |

## Token consumption summary

| Surface | Token |
|---|---|
| Container shape | `radius-pill` |
| Surface (initials) | `brand-600` / `slate-700` / `success-600` / `warning-600` / `slate-100` per derivation |
| Initial color | white / `slate-700` |
| Type (sm / md / lg) | `text-xs` / `text-sm` / `text-2xl` `font-semibold` |
| Status dot (online) | `success-600` |
| Status dot (offline) | `slate-400` |
| Status dot border | `--background` 2pt |
| Selected ring | `--ring` (brand-600 / brand-400) 2pt outset |

## Accessibility

| Concern | Rule |
|---|---|
| Tap target | Avatars are usually non-interactive identity markers. When tappable, parent row provides ≥ 44pt; avatar visual stays at its size |
| Contrast (initial vs surface) | white-on-brand-600 = 5.6:1, white-on-success-600 = 4.7:1, white-on-warning-600 = 4.9:1, white-on-slate-700 = 12.6:1 — all pass AA body |
| Photo decoration | When paired with an adjacent name label, photo is decorative: `aria-hidden="true"` on the avatar, label carries identity. When standalone (rare), `aria-label="Avatar of {name}"` |
| Status dot | Never the only signal — adjacent label says "Online" / "Offline" or pairs with a longer text cue ("Last seen 2h ago") |
| Color derivation | Initials never appear in danger-600 (red) — keeps "this person is dangerous" misread off the table |
| Reduced motion | Loading shimmer falls back to a flat `slate-100` fill |

## Privacy

| Surface | Rule |
|---|---|
| Recipient avatars | Show initials derived from the recipient's display name only — never PINFL, never document number, never card last4 |
| User's own avatar | Photo variant via uploaded image; never pulls from MyID document scan automatically (would risk surfacing ID-card photo) |
| Admin / ops avatars | Initials variant only in customer-facing surfaces — admin photos stay inside admin dashboard |
| Compliance / sanctions context | Never overlay a "watched" / "flagged" badge on a recipient avatar in the customer surface — that's admin-dashboard-only per [`admin-dashboard-patterns.md`](../../../.claude/rules/admin-dashboard-patterns.md) |

## Composition rules

| Pattern | Rule |
|---|---|
| Avatar + name + meta in a list row | Avatar `md`, name `text-base font-medium`, meta `text-sm text-muted-foreground` per LESSON 2026-05-01 — never `text-xs` on flowing meta |
| Avatar + identity in a detail header | Avatar `lg` left, name + tier-badge + masked-PAN-or-phone right, all wrapped in `flex items-center gap-3` per LESSON 2026-05-02 (detail headers flow inline, NEVER sticky) |
| Avatar in a chip context (mention / tag) | Avatar `sm` inline before the name; chip surface stays neutral (slate-100), avatar carries the identity color |
| Avatar list (recipient picker, group chat) | Stack horizontally with `space-2` (8pt) gap; max 5 avatars before collapsing into a `+N` count badge |
| Avatar in receipt screen | `lg`, centered, paired with name underneath in `text-2xl` |

## Forbidden patterns

| Don't | Required |
|---|---|
| Random color per render | Deterministic derivation by name hash — same person = same color, every session |
| Danger-600 (red) avatar surface | Reserved for failure semantics; identity colors are brand / slate / success / warning |
| Square avatars or arbitrary radius | `radius-pill`, every size |
| Initials larger than two characters | First-of-first + first-of-last, single letter if one word |
| Photo with broken-image icon on error | Fall through to initials variant — never expose an error state |
| Status dot without a paired text cue | Color-only signal forbidden per [`accessibility.md`](../../../.claude/rules/accessibility.md) |
| Avatar that opens a sheet / modal but has no parent ≥ 44pt tap-area | Inflate the parent row, not the avatar visual |
| MyID document photo as user avatar | Privacy boundary — full document images stay in MyID flow, never become identity art |

## Quick grep to verify (when implemented)

```bash
# Hardcoded avatar colors — must return 0 hits:
grep -rnE 'Avatar.*#[0-9a-fA-F]|Avatar.*bg-\[#' mobile/

# Square avatars — must return 0 hits:
grep -rnE '<Avatar[^>]*rounded-md|<Avatar[^>]*rounded-sm|<Avatar[^>]*rounded-none' mobile/

# Random color derivation — must return 0 hits:
grep -rnE 'Avatar.*Math\.random|Avatar.*hash.*Date' mobile/
```

## Figma component-set

Two component sets under the `Avatar / *` namespace per [`tokens/figma-setup.md`](../tokens/figma-setup.md). Split by render mode — initials and photo have completely different anatomies (initials = colored circle + text; photo = circle with image fill), so authoring them as separate sets keeps the asset palette clean.

> Built in Figma 2026-05-04 alongside the Chip + Input primitives as part of Pass 2.

### Set 1 · `Avatar / Initials` (15 cells)

#### Variant axes

| Property | Values | Count |
|---|---|---:|
| `Color` | `Brand` · `Slate` · `Success` · `Warning` · `Fallback` | 5 |
| `Size` | `Sm` (32pt) · `Md` (48pt) · `Lg` (72pt) | 3 |

The 5 `Color` values surface the **deterministic name-hash buckets** documented above as a visual showcase. In code, the consumer derives the bucket from the recipient's name via `firstChar(md5(name)) → bucket`; in Figma, designers picking a static-screen avatar select the correct bucket manually. Stable identity means designers should rarely pick — but variant cells exist so all four hash colors + the fallback are visually inspectable.

#### Naming

```
Avatar / Initials   →   Color=<Color>, Size=<Size>
```

Examples: `Color=Brand, Size=Md`, `Color=Slate, Size=Lg`, `Color=Fallback, Size=Sm`.

#### Variable bindings — per cell

##### Container (frame)

| Property | Bound to |
|---|---|
| Layout | Auto Layout HORIZONTAL · `primaryAxisAlignItems: CENTER` · `counterAxisAlignItems: CENTER` |
| Width × Height (fixed) | 32×32 (`Sm`) · 48×48 (`Md`) · 72×72 (`Lg`) |
| Padding | 0 (initials are centered via auto-layout alignment) |
| Item spacing | 0 |
| Corner radius (all 4) | `radius/pill` |
| Fill | per Color (see mapping below) |

##### Color mapping

| Color | Surface (fill) | Initial color |
|---|---|---|
| `Brand` | `color/brand/600` | `color/base/white` |
| `Slate` | `color/slate/700` | `color/base/white` |
| `Success` | `color/success/600` | `color/base/white` |
| `Warning` | `color/warning/600` | `color/base/white` |
| `Fallback` | `color/slate/100` | `color/slate/700` |

> **No `Danger` / red avatar.** Per spec line "Never derive a danger-600 (red) avatar — red is reserved for failure semantics, not identity." — confirmed in build, `Danger` not in the Color axis.

##### Initial(s) text

| Property | Bound to |
|---|---|
| Demo content | `WL` (the canonical sample — Wang Lei) at all 15 cells |
| Text Style | `text/label` (`Sm`) · `text/body-sm-semibold` (`Md`) · `text/heading` (`Lg`) |
| **Weight override** | **`Inter Semi Bold` (600)** — applied to all sizes for consistency. `text/body-sm-semibold` (Md) and `text/heading` (Lg) are already 600; `Sm` overrides `text/label`'s default Medium (500) at the layer level (one-off, same pattern as CountBadge in chip.md) |
| `textCase` | `ORIGINAL` (chip-style override on `text/label` to avoid the foundation's baked uppercase + tracking) |
| `letterSpacing` | `0%` |
| Fill | per Color (see mapping above) |

### Set 2 · `Avatar / Photo` (3 cells)

#### Variant axes

| Property | Values | Count |
|---|---|---:|
| `Size` | `Sm` (32pt) · `Md` (48pt) · `Lg` (72pt) | 3 |

#### Naming

```
Avatar / Photo   →   Size=<Size>
```

#### Variable bindings — per cell

##### Container

| Property | Bound to |
|---|---|
| Layout | Auto Layout HORIZONTAL · centered |
| Width × Height (fixed) | per Size (32 / 48 / 72) |
| Corner radius (all 4) | `radius/pill` |
| Fill (placeholder) | `color/slate/300` — **temporary; replaced at instance time** by an image fill (`fillType: IMAGE`) when a real photo is attached |
| Clips content | `true` — masks any image overflow to the circle |

##### Placeholder (when no photo attached)

| Property | Bound to |
|---|---|
| Glyph | `Icon / User` instance, sized 0.55× the avatar diameter (18 / 26 / 40pt) |
| Glyph stroke | `color/base/white` |

> **How designers attach a photo**: select an `Avatar / Photo` instance, target the container's fill in the right panel, change the fill type from Solid → Image, drop the photo. The User-icon placeholder remains as a child (visible behind the image fill if the image is transparent — but for typical photos it gets fully covered). Fall-through to initials variant on image error is a runtime concern, not authored in Figma.

### Component properties (deferred)

The status-dot affordance and the selected-ring (recipient multi-select) were **not authored** in this Pass 2 build. Both are documented in the spec as v1.1+ / instance-time concerns:

- **Status dot** — spec line "Mostly unused at v1." Defer until support-chat / agent-online surfaces land. Recovery path: add a `Show status dot` BOOL component property + a `Status` VARIANT (Online/Offline) on `Avatar / Initials` and `Avatar / Photo`.
- **Selected ring** (recipient multi-select) — handled at instance time via a 2pt `color/ring` outset stroke override on the avatar's container. No component property needed; the visual contract is "outset stroke when the parent row is selected."

### Effect

None on either set. Avatars are flat surfaces — no shadow, no focus ring (focus is on the parent row's tap-area, not the avatar visual).

### Skip cells

| Set | Authored | Skipped |
|---|---|---|
| `Avatar / Initials` | 15 | None — all 5 colors × 3 sizes built |
| `Avatar / Photo` | 3 | Per-photo content variants (designers swap image fills at instance time) |

**Total: 18 cells across 2 component sets.**

### Deviations from spec, tracked

| Deviation | Reason | Recovery path |
|---|---|---|
| `Sm` initials use `text/label` Style with layer-level `Inter Semi Bold` weight override | No 13pt Semibold Style exists in the foundation (`text/label` is 13/500). Adding a new Style for one consumer is foundation creep | If a 2nd 13pt-Semibold consumer appears (e.g. count badges in dense lists), promote to a `text/label-semibold` Style and update both consumers in one pass |
| `Avatar / Initials` `Color` axis surfaces hash buckets visually rather than being designer-pickable | Spec is firm: color derives deterministically from `firstChar(md5(name))` — designers picking would break stable identity. The variant matrix exists for inspection / static-screen authoring only | Document the picker convention: designers should use the `Color=Fallback` variant for unknown / placeholder names; pick brand/slate/success/warning only when they match what the runtime hash would produce. A small in-Figma prototype could expose a "name → bucket" calculator — out of scope for v1 |
| Status-dot affordance not built | Spec marks "Mostly unused at v1" | Add `Show status dot` BOOL + `Status` (Online/Offline) VARIANT axis to both sets when support-chat lands |
| Selected-ring (multi-select) not built | Handled at instance time via outset stroke override | No work — designer applies a 2pt `color/ring` outset stroke to the avatar's container when authoring a multi-select recipient picker |
| `Avatar / Photo` cells default to a `slate-300` + `Icon / User` placeholder, not an actual photo | Photos are content, not chrome — designer attaches images at instance time via image-fill swap | Designers select the avatar's container fill, switch to Image fill, attach the photo. No fallback handling in Figma — runtime falls through to initials |

### File placement

| Set | Component-set ID | Position (page `❖ Components`) | Size |
|---|---|---|---|
| `Avatar / Initials` | `105:116` | (100, 6308) | 480 × 620 |
| `Avatar / Photo` | `105:129` | (700, 6308) | 480 × 220 |

Sits below the three Input sets (Input / NumberPad ends at y=6208), with the standard 100pt gap. Both sets are smaller than the chip / input rows, so they fit side-by-side on a single row at y=6308.

## Cross-references

- Tokens: [`colors.md`](../tokens/colors.md) · [`typography.md`](../tokens/typography.md) · [`radii.md`](../tokens/radii.md)
- Accessibility: [`accessibility.md`](../../../.claude/rules/accessibility.md)
- Privacy / PII: [`core-principles.md`](../../../.claude/rules/core-principles.md), [`card-schemes.md`](../../../.claude/rules/card-schemes.md)
- Layer rules: [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md)
- Lessons: typography reserved categories (2026-04-29), flowing-text floor (2026-05-01), detail-header inline (2026-05-02)
