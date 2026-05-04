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

## Cross-references

- Tokens: [`colors.md`](../tokens/colors.md) · [`typography.md`](../tokens/typography.md) · [`radii.md`](../tokens/radii.md)
- Accessibility: [`accessibility.md`](../../../.claude/rules/accessibility.md)
- Privacy / PII: [`core-principles.md`](../../../.claude/rules/core-principles.md), [`card-schemes.md`](../../../.claude/rules/card-schemes.md)
- Layer rules: [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md)
- Lessons: typography reserved categories (2026-04-29), flowing-text floor (2026-05-01), detail-header inline (2026-05-02)
