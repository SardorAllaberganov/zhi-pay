# Colors

Color tokens for the ZhiPay mobile app. **Inherited verbatim from the admin dashboard** so cross-surface parity holds (admin already runs in production prototype). Anchor brand: ZhiPay blue, `brand-600 = #0a64bc`.

## Source of truth

- Tailwind config: [`dashboard/tailwind.config.ts`](../../../dashboard/tailwind.config.ts)
- HSL values: [`dashboard/src/styles/globals.css`](../../../dashboard/src/styles/globals.css) lines 13–49

If the admin shifts a value, this doc shifts with it. **Don't drift.**

## Token model

Two ladder families + three semantic 3-stop families. Each stop has **one HSL value** that's identical in light and dark mode — what flips per mode is the **semantic mapping** (`--background`, `--foreground`, `--primary`, etc.) at the bottom of this doc.

Format: `H S% L%` (Tailwind's HSL-component CSS-var pattern). Compose at use site as `hsl(var(--brand-600))`.

## Brand (11 stops — primary accent)

| Token | HSL | Hex (approx) | Mobile-specific use |
|---|---|---|---|
| `brand-50` | `210 80% 95%` | `#e8f1fc` | Subtle brand-tinted surface (selected list-row, banner background) |
| `brand-100` | `210 78% 88%` | `#c9def8` | Hover surface for brand-tinted rows; quote-card background |
| `brand-200` | `210 76% 76%` | `#92bef0` | Disabled-on-brand fill; gradient stop on home card |
| `brand-300` | `210 70% 64%` | `#5b9be3` | Decorative only — too light for body text on slate-50 |
| `brand-400` | `210 66% 53%` | `#3879cc` | Dark-mode focus ring |
| `brand-500` | `209 77% 45%` | `#1c70b9` | Dark-mode primary CTA fill (replaces brand-600 in dark) |
| `brand-600` | `209 90% 39%` | `#0a64bc` | **Anchor.** Light-mode primary CTA, headline amounts on home card, focus ring, status `processing` / `completed` chip |
| `brand-700` | `211 91% 32%` | `#0c569b` | CTA pressed state; section heading on light surfaces |
| `brand-800` | `213 89% 25%` | `#0e4274` | Hero-card gradient end stop |
| `brand-900` | `215 86% 18%` | `#0e3155` | Reserved — currently unused at mobile |
| `brand-950` | `217 92% 12%` | `#062148` | Reserved — currently unused at mobile |

## Slate (11 stops — neutral surfaces, text, dividers)

| Token | HSL | Hex (approx) | Use |
|---|---|---|---|
| `slate-50` | `210 40% 98%` | `#f8fafc` | Light-mode `background`; receipt page surface |
| `slate-100` | `210 40% 96%` | `#f1f5f9` | Secondary fill; muted button background; sheet handle |
| `slate-200` | `214 32% 91%` | `#e2e8f0` | Border / divider on light; input border |
| `slate-300` | `213 27% 84%` | `#cbd5e1` | Disabled border; secondary button outline |
| `slate-400` | `215 20% 65%` | `#94a3b8` | Decorative meta; dark-mode `muted-foreground` |
| `slate-500` | `215 16% 47%` | `#64748b` | Light-mode `muted-foreground` (timestamps, helper text) |
| `slate-600` | `215 19% 35%` | `#475569` | Body text on dark mode (alternative to slate-100) |
| `slate-700` | `215 25% 27%` | `#334155` | Card stroke on dark mode |
| `slate-800` | `217 33% 17%` | `#1e293b` | Dark-mode border / divider; secondary button surface |
| `slate-900` | `222 47% 11%` | `#0f172a` | Light-mode `foreground` (body text); dark-mode card surface |
| `slate-950` | `229 84% 5%` | `#020617` | Dark-mode `background` |

## Semantic — Success (3 stops)

Calm green — never lime / mint.

| Token | HSL | Hex (approx) | Use |
|---|---|---|---|
| `success-50` | `138 76% 97%` | `#f0fdf4` | Banner / chip background ("Transfer completed", "MyID passed") |
| `success-600` | `142 71% 45%` | `#22c55e` | Status icon / dot for `completed` / `passed` / `active` |
| `success-700` | `142 76% 36%` | `#15803d` | Status text on light surfaces |

## Semantic — Warning (3 stops)

Amber, not yellow.

| Token | HSL | Hex (approx) | Use |
|---|---|---|---|
| `warning-50` | `48 100% 96%` | `#fefce8` | Banner background ("MyID expiring soon", "Tier-1 limit at 80%", "FX rate stale") |
| `warning-600` | `32 95% 44%` | `#dc8a05` | Status icon / dot for `reversed` / `expired` / `frozen` |
| `warning-700` | `26 90% 37%` | `#b45309` | Status text on light surfaces |

## Semantic — Danger (3 stops) — **reserved, never primary accent**

| Token | HSL | Hex (approx) | Use |
|---|---|---|---|
| `danger-50` | `0 86% 97%` | `#fef2f2` | Banner background for `failed` transfers, sanctions hits, destructive confirm screens |
| `danger-600` | `0 72% 51%` | `#dc2626` | Destructive CTA fill; status icon for `failed`; danger ring |
| `danger-700` | `0 74% 42%` | `#b91c1c` | Pressed state; status text on light surfaces |

**Forbidden:** Don't use any `danger-*` stop as a primary accent — e.g. don't theme a "Send" CTA red. Per [`core-principles.md`](../../../.claude/rules/core-principles.md), red is reserved for destructive / failure semantics.

## Semantic mappings (light + dark)

These are the role-anchored aliases that flip per mode. Use these in screens — not raw `brand-600` etc — wherever a role exists.

| Mapping | Light value | Dark value |
|---|---|---|
| `--background` | `slate-50` | `slate-950` |
| `--foreground` | `slate-900` | `slate-100` |
| `--card` | `0 0% 100%` (pure white) | `slate-900` |
| `--card-foreground` | `slate-900` | `slate-100` |
| `--popover` | `0 0% 100%` | `slate-900` |
| `--popover-foreground` | `slate-900` | `slate-100` |
| `--primary` | `brand-600` | `brand-500` |
| `--primary-foreground` | `0 0% 100%` | `0 0% 100%` |
| `--secondary` | `slate-100` | `slate-800` |
| `--secondary-foreground` | `slate-900` | `slate-100` |
| `--muted` | `slate-100` | `slate-800` |
| `--muted-foreground` | `slate-500` | `slate-400` |
| `--accent` | `slate-100` | `slate-800` |
| `--accent-foreground` | `slate-900` | `slate-100` |
| `--destructive` | `danger-600` | `danger-600` |
| `--destructive-foreground` | `0 0% 100%` | `0 0% 100%` |
| `--border` | `slate-200` | `slate-800` |
| `--input` | `slate-200` | `slate-800` |
| `--ring` | `brand-600` | `brand-400` |

**Why brand-500 in dark for `--primary`:** brand-600 on a slate-950 surface reads slightly muddy at the lightness contrast; brand-500 lifts to ~5.0:1 contrast against slate-950 vs brand-600's ~3.8:1. Same reason `--ring` shifts to brand-400 (high contrast on dark, focus visibility per WCAG 2.4.7).

## Contrast — WCAG 2.1 AA verification

Body text needs ≥ 4.5:1; large text (≥ 18pt regular / 14pt bold) and non-text UI need ≥ 3:1. Per [`accessibility.md`](../../../.claude/rules/accessibility.md).

### Light mode (foreground vs `slate-50` background)

| Foreground | Contrast | AA body (≥4.5) | AA large (≥3) | Use verdict |
|---|---:|:---:|:---:|---|
| `brand-300` | 1.9 | ✗ | ✗ | Decorative only — never on text |
| `brand-400` | 3.0 | ✗ | ✓ | Large text / icons only |
| `brand-500` | 4.4 | ✗ | ✓ | Borderline — prefer brand-600 for body |
| `brand-600` | 5.6 | ✓ | ✓ | **Body text safe** — primary CTA / link / amount |
| `brand-700` | 7.4 | ✓ | ✓ | Body text safe — pressed CTA, section heading |
| `brand-800` | 10.2 | ✓ | ✓ | Body text safe |
| `slate-400` | 2.7 | ✗ | ✗ | Decorative — never used for text |
| `slate-500` | 4.6 | ✓ | ✓ | **Body text safe** — `muted-foreground` (timestamps, helper) |
| `slate-600` | 7.0 | ✓ | ✓ | Body text safe |
| `slate-700` | 10.1 | ✓ | ✓ | Body text safe |
| `slate-900` | 16.4 | ✓ | ✓ | **Default body** — `foreground` |
| `success-600` | 2.8 | ✗ | ✗ | Icon-only — never text |
| `success-700` | 4.6 | ✓ | ✓ | **Body text safe** — status copy "Completed" |
| `warning-600` | 3.0 | ✗ | ✓ | Icon / large only |
| `warning-700` | 4.6 | ✓ | ✓ | **Body text safe** — status copy "Reversed" |
| `danger-600` | 4.5 | ✓ | ✓ | Body text safe — borderline; prefer danger-700 for runs of text |
| `danger-700` | 6.1 | ✓ | ✓ | **Body text safe** — error copy |

### Dark mode (foreground vs `slate-950` background)

| Foreground | Contrast | AA body (≥4.5) | AA large (≥3) | Use verdict |
|---|---:|:---:|:---:|---|
| `brand-300` | 7.0 | ✓ | ✓ | Body text safe |
| `brand-400` | 5.4 | ✓ | ✓ | Body text safe |
| `brand-500` | 4.0 | ✗ | ✓ | Large text / fills only — **but `--primary` fill targets white-on-brand-500 so OK as button** |
| `brand-600` | 3.0 | ✗ | ✓ | Large only — don't use for body text on dark |
| `slate-100` | 17.4 | ✓ | ✓ | **Default body** — `foreground` |
| `slate-300` | 11.4 | ✓ | ✓ | Body text safe |
| `slate-400` | 6.7 | ✓ | ✓ | **Body text safe** — `muted-foreground` |
| `slate-500` | 3.4 | ✗ | ✓ | Large only |
| `success-600` | 5.7 | ✓ | ✓ | Body text safe |
| `warning-600` | 6.5 | ✓ | ✓ | Body text safe |
| `danger-600` | 4.6 | ✓ | ✓ | Body text safe — borderline |

### Non-text UI (≥ 3:1 against background)

| Pair | Contrast | AA non-text (≥3) |
|---|---:|:---:|
| `brand-600` ring on `slate-50` background | 5.6 | ✓ |
| `brand-400` ring on `slate-950` background | 5.4 | ✓ |
| `slate-200` border on `slate-50` background | 1.2 | ✗ — by design, dividers stay subtle; not a focus surface |
| `slate-800` border on `slate-950` background | 1.4 | ✗ — same |
| `success-600` icon on `success-50` chip background | 2.6 | ✗ — pair the icon with `success-700` text or use `success-700` icon |
| `success-700` icon on `success-50` chip background | 4.4 | ✓ |
| `warning-700` icon on `warning-50` chip background | 4.5 | ✓ |
| `danger-700` icon on `danger-50` chip background | 5.9 | ✓ |

> **Rule:** when an icon is the only signal of a status, use the `-700` stop, not `-600`. Pair color with icon AND label per [`accessibility.md`](../../../.claude/rules/accessibility.md) "no color-only signals".

Contrast values computed via WCAG 2.1 relative-luminance; rounded to 1 decimal. Verify with a contrast tool before locking any new pairing.

## Forbidden patterns

- ❌ Inventing new color tokens. If you need a new role, add a **semantic mapping** (e.g. `--info`), not a new ramp.
- ❌ Using arbitrary HSL or hex in a screen file. Always reference a token via Tailwind class (`bg-brand-600`) or CSS var (`hsl(var(--brand-600))`).
- ❌ Using `danger-*` as a primary accent.
- ❌ Drifting from admin's HSL values. Cross-surface consistency is the point — fix the admin doc first if a stop needs to change.

## Cross-references

- Admin parity: [`dashboard/tailwind.config.ts`](../../../dashboard/tailwind.config.ts), [`dashboard/src/styles/globals.css`](../../../dashboard/src/styles/globals.css)
- Aesthetic direction: [`mobile/research/references.md`](../../research/references.md)
- Layer rules: [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md)
- Accessibility floor: [`accessibility.md`](../../../.claude/rules/accessibility.md)
- Status mapping: [`status-machines.md`](../../../.claude/rules/status-machines.md)
