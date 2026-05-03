# Mobile Tokens — Foundation Layer

The lowest layer of the ZhiPay mobile design system. Every primitive, component, pattern, and screen consumes tokens from here. Tokens **never** consume from above.

> Status: **Foundation pass complete**, locked `2026-05-04`. Inherits brand + slate + semantic palettes from the admin dashboard for cross-surface parity. Mobile-specific additions: lifted display-tier typography (44pt / 32pt), `shadow-hero` for the home card-as-object, `radius-lg` 20pt, `duration-base` 220ms (vs admin's 180ms).

## What lives here

| File | Purpose |
|---|---|
| [`colors.md`](./colors.md) | 11-stop brand + slate ramps, 3-stop semantic ramps, semantic mappings (light + dark), WCAG contrast verification |
| [`typography.md`](./typography.md) | 6-role scale (Display 1 / Display 2 / Heading / Body / Body small / Label), font stack, numerals, dynamic-type rules |
| [`spacing.md`](./spacing.md) | 8pt base, `space-0` … `space-12`, page-gutter and component-padding presets, tap-target rule |
| [`radii.md`](./radii.md) | 4 stops + pill, per-component spec, composition rules |
| [`shadows.md`](./shadows.md) | 3 elevations × 2 modes + `shadow-hero` (brand-tinted, hero card-as-object only) |
| [`motion.md`](./motion.md) | Duration + easing tokens, 8 reserved animated patterns, reduced-motion fallback |
| [`tokens.json`](./tokens.json) | Tokens Studio / Style Dictionary export — drop into Figma via the "Tokens Studio" plugin or convert to Figma Variables via `style-dictionary build` |
| [`tailwind.tokens.css`](./tailwind.tokens.css) | CSS vars block (HSL components, no `hsl()` wrap) ready for Tailwind's `hsl(var(--brand-600))` pattern; includes a paste-into `tailwind.config.ts` extend snippet |

## Layer rules (cross-cuts everything above)

Per [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md):

```
Tokens     ←  this layer (no upstream dependencies)
Primitives →  consume Tokens
Components →  consume Tokens + Primitives
Patterns   →  consume Tokens + Primitives + Components
Screens    →  consume all layers above
Flows      →  compose Screens
```

**Imports go downward only — never sideways, never upward.** A primitive can read a Token, but a Token never reads a primitive. If you find yourself wanting a Token to know about a primitive, the primitive belongs deeper or the Token is misnamed.

## How to consume

### From a screen / component (Tailwind utility classes)

```tsx
// Use the Tailwind class directly — semantic mapping resolves per mode
<button className="bg-primary text-primary-foreground px-5 py-3 rounded-md">
  Confirm send
</button>

// Or reach for the raw ramp stop when you need a specific shade
<div className="bg-brand-50 text-brand-700">
  Tier-1 limit at 80%
</div>
```

### From a primitive (CSS-in-JS / inline)

```tsx
// Reach for the CSS var, not a hardcoded HSL
const styles = {
  background: 'hsl(var(--card))',
  color: 'hsl(var(--card-foreground))',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-md)',
};
```

### From a Figma file (designer)

1. Install the **Tokens Studio for Figma** plugin.
2. Import [`tokens.json`](./tokens.json) into the plugin (Settings → Import → JSON).
3. Apply tokens to layers as Variables. Light + dark themes resolve via the `color.semantic.light` / `color.semantic.dark` groups.

Alternatively, run `style-dictionary build` against `tokens.json` to generate native Figma Variables JSON, iOS Swift, Android Kotlin, or any other platform format.

## Cross-surface parity rule

Brand + slate + semantic palettes, radii (`sm` / `md`), shadows (`sm` / `md` / `lg`), and motion easing curves are **shared verbatim with the admin dashboard**. If the admin dashboard updates an HSL value, this layer follows. If a mobile-specific need arises, fix the admin dashboard first or document the deviation explicitly (see "Mobile-specific deviations" below).

The shared source of truth: [`dashboard/src/styles/globals.css`](../../../dashboard/src/styles/globals.css).

## Mobile-specific deviations from admin

These are intentional — flagged so future updates know what's deliberate and what's drift:

| Token | Admin | Mobile | Why |
|---|---|---|---|
| `radius-lg` | 12px (admin's `lg`) | 20px | Mobile hero card-as-object needs softer corners |
| `radius-sm` | 4px | 8px | 48pt-tall mobile inputs read tinny at 4pt corners |
| `shadow-hero` | (none) | brand-tinted lift | Mobile has a hero card-as-object surface; admin doesn't |
| `duration-base` | 180ms | 220ms | Hand interaction reads better at slightly longer durations than mouse |
| `font-size` Display 1 | 36px (admin's `4xl`) | 44px | Mobile hero amount needs to outrank everything |
| `font-size` Display 2 | 28px (admin's `3xl`) | 32px | Page titles need clear step from Display 1 to Heading |
| `font-size` Body | 15px (admin's `base`) | 16px | Mobile reading distance + one-handed thumb interaction |

Everything else is verbatim parity.

## Adding to this layer

If you need a new color stop, font size, spacing value, radius, shadow, or motion token:

1. **Check first**: can you compose what you need from existing tokens? If yes, do that.
2. **Check the admin**: does it already exist there? If yes, inherit verbatim.
3. **If new**: propose the addition in a PR that updates **both** the spec doc (e.g. `colors.md`) and the exports (`tokens.json` + `tailwind.tokens.css`) in the same commit. Document the rationale in the doc, not just the export.
4. **Cascade**: if the new token shifts an existing screen's reading, run [`design-review-checklist.md`](../../../.claude/rules/design-review-checklist.md) on every consumer before merging.

Don't add to the export files (`tokens.json`, `tailwind.tokens.css`) without updating the spec doc — designers reference the markdown, devs reference the exports, and divergence between them causes drift.

## What's next

The Tokens layer is locked. Per the layer hierarchy, the next pass is **Primitives** — buttons, inputs, chips, badges, icons, avatars. Open the foundation brief for primitive specs:

- [`mobile/prompts/01-foundation.md`](../../prompts/01-foundation.md) §"Primitive requirements"

Subsequent passes follow the marquee path in [`mobile/README.md`](../../README.md):

```
Primitives → Components → Patterns → Onboarding → MyID → Home → ...
```

## Cross-references

- Layer rules: [`.claude/rules/design-system-layers.md`](../../../.claude/rules/design-system-layers.md)
- Accessibility floor: [`.claude/rules/accessibility.md`](../../../.claude/rules/accessibility.md)
- Money formatting: [`.claude/rules/money-and-fx.md`](../../../.claude/rules/money-and-fx.md)
- Localization: [`.claude/rules/localization.md`](../../../.claude/rules/localization.md)
- Admin parity source: [`dashboard/src/styles/globals.css`](../../../dashboard/src/styles/globals.css), [`dashboard/tailwind.config.ts`](../../../dashboard/tailwind.config.ts)
- Aesthetic direction: [`mobile/research/references.md`](../../research/references.md)
- Foundation brief: [`mobile/prompts/01-foundation.md`](../../prompts/01-foundation.md)
- Lessons (typography floor, motion rules): [`ai_context/LESSONS.md`](../../../ai_context/LESSONS.md)
