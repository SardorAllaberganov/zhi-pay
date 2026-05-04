# Card

The structural backbone of mobile. Almost every screen — home, send-money review, history detail, settings, MyID confirm — composes from Card variants. Includes the **card-as-object** hero for the home screen, the only mobile-specific composition that earns special treatment.

> Status: **First-pass spec, in review.** Mirrors admin's [`<Card>`](../../../dashboard/src/components/ui/card.tsx) primitive shape with mobile additions: `card-as-object`, footer-action variant, sheet-friendly composition rules. Padding contract is **strict** per LESSON 2026-05-03 — don't half-override.

## Source of truth

- Admin reference: [`dashboard/src/components/ui/card.tsx`](../../../dashboard/src/components/ui/card.tsx) (CardHeader / CardContent / CardFooter / CardTitle / CardDescription)
- Primitives consumed: tokens (color / spacing / radii / shadows) — **not** other primitives directly; sub-elements like Buttons sit *inside* a Card, not composed at this layer
- Tokens: [`colors.md`](../../tokens/colors.md), [`spacing.md`](../../tokens/spacing.md), [`radii.md`](../../tokens/radii.md), [`shadows.md`](../../tokens/shadows.md)
- Lesson that binds this spec: [LESSON 2026-05-03 — Card primitive padding is a contract, not a buffet](../../../ai_context/LESSONS.md)

## Variants

Six variants. Pick by **role**, not surface preference. Each has a strict padding contract — see "Padding contract" below.

| Variant | Surface | Use |
|---|---|---|
| `resting` | `bg-card`, `shadow-sm`, `radius-md` | Default. Hosts content blocks on home, settings, history detail. |
| `header-body` | Same surface, `<CardHeader>` (`p-5 pb-0`) + `<CardContent>` (`p-5 pt-0`) | Sectioned content — title + body. |
| `footer-action` | `header-body` + `<CardFooter>` (`p-5 pt-0`) holding action buttons | "Save changes", "Add recipient" patterns. |
| `flat` | `bg-card`, no shadow, 1pt `--border` outline | Dense list contexts where shadows would create visual noise (settings, recipient list). |
| `interactive` | `resting` + `active:scale-[0.98]` + `transition-transform duration-fast` | Whole-card-as-tap-target — recipient cards, saved-card tiles. |
| `card-as-object` | Brand gradient surface, `radius-lg` (20pt), `shadow-hero` | The home hero. Mimics a physical card. **Mobile-specific**, no admin equivalent. |

## Padding contract — STRICT

**Per LESSON 2026-05-03**, the Card primitive's padding is a contract, not a buffet. Either consume the sub-primitives whole (`<CardHeader>` + `<CardContent>` + `<CardFooter>`) **or** replace them with raw elements that own their own padding. Never half-override.

| Slot | Padding | Override allowed |
|---|---|---|
| `<Card>` outer | none — sub-elements own it | ❌ never |
| `<CardHeader>` | `p-5` (20pt) all sides | ❌ never override individual sides (no `pb-0`, no `pt-2`) |
| `<CardContent>` | `p-5 pt-0` — keeps the rhythm with header above | ❌ never override (no `p-0`, no `px-4`) |
| `<CardFooter>` | `p-5 pt-0` | ❌ never |
| `<CardTitle>` | inherits from `<CardHeader>`, `text-base font-semibold` | typography only |
| `<CardDescription>` | inherits, `text-sm text-muted-foreground` | typography only |

**If the body needs to be flush** (e.g. a clickable accordion header + edge-to-edge table inside): replace `<CardHeader>` with a plain `<button className="px-5 py-4 ...">` and replace `<CardContent>` with a plain `<div className="border-t border-border">`. Then add `overflow-hidden` to the Card so the separator clips to the rounded corners. Pattern documented in LESSON 2026-05-03.

## Anatomy

### Resting + header-body + footer-action

```
╭──[ Card · radius-md (12pt) · bg-card · shadow-sm ]──╮
│                                                     │
│  ←─── space-5 (20pt) ───→                           │
│                                                     │
│  Recent activity                ← CardTitle         │
│  Last 30 days                   ← CardDescription   │
│                                                     │
│  ───────────────────────────────────                │
│                                                     │
│  [list rows or content body]                        │
│                                                     │
│  ───────────────────────────────                    │
│                                                     │
│  [footer actions, right-aligned]                    │
│                                                     │
╰─────────────────────────────────────────────────────╯
```

### Card-as-object (home hero only)

```
        ╭──[ radius-lg (20pt) · shadow-hero · brand gradient ]──╮
        │                                                       │
        │   ZHIPAY                                              │
        │   ──────                                              │
        │                                                       │
        │                                                       │
        │   4242 42•• •••• 4242                                 │
        │                                                       │
        │                                                       │
        │   AGZAMOVA F.                          12 / 27        │
        │                                                       │
        ╰───────────────────────────────────────────────────────╯
                            ↑ 9 : 5.5 aspect ratio (think credit card)
```

| Slot | Token / value |
|---|---|
| Surface | gradient `brand-700` → `brand-900` (light) / `brand-600` → `brand-950` (dark) |
| Radius | `radius-lg` (20pt) |
| Shadow | `shadow-hero` (brand-tinted lift, mobile-specific per [`shadows.md`](../../tokens/shadows.md)) |
| Aspect ratio | 9 : 5.5 — same as ISO/IEC 7810 ID-1 credit card |
| Padding | `space-6` (24pt) all sides |
| Brand mark (top-left) | "ZHIPAY" wordmark in `text-base font-bold tracking-widest`, `--primary-foreground` (white) |
| Masked PAN (center) | `text-2xl tabular-nums tracking-widest`, white at 92% opacity |
| Holder name (bottom-left) | `text-sm font-medium tracking-wide uppercase`, white at 80% |
| Expiry (bottom-right) | `text-sm tabular-nums`, white at 80% |

**Privacy boundary**: masked PAN only (first 6 + 4 dots + last 4 — see [`card-schemes.md`](../../../.claude/rules/card-schemes.md)). Never the full PAN, even briefly. CVV never appears here.

## Token consumption summary

| Surface | Token |
|---|---|
| Resting / flat / interactive surface | `--card` (white light / slate-900 dark) |
| Resting shadow | `shadow-sm` |
| Flat outline | 1pt `--border` |
| Card-as-object surface | gradient `brand-700` → `brand-900` (light) / `brand-600` → `brand-950` (dark) |
| Card-as-object shadow | `shadow-hero` (brand-tinted) |
| Border radius (resting / flat / interactive / header-body / footer-action) | `radius-md` (12pt) |
| Border radius (card-as-object) | `radius-lg` (20pt) |
| Padding (header / content / footer) | `space-5` (20pt) — strict |
| Padding (card-as-object) | `space-6` (24pt) |
| Title type | `text-base font-semibold` |
| Description type | `text-sm text-muted-foreground` (never `text-xs` per LESSON 2026-05-01) |
| Section divider (between header and content when needed) | 1pt `--border` |
| Card-stack vertical gap | `space-6` (24pt) hero screens / `space-4` (16pt) dense screens (per [`spacing.md`](../../tokens/spacing.md)) |

## States

| State | Treatment |
|---|---|
| `idle` | base variant per palette |
| `pressed` (interactive variant only) | `scale-[0.98]` over `duration-fast` (90ms), `ease-standard`. **Reduced-motion**: drop the scale, keep the surface |
| `disabled` (interactive variant only) | `opacity-60`, `pointer-events-none`, no press response |
| `selected` (interactive — radio / picker) | 2pt `--ring` (brand-600 / brand-400) outset + `bg-brand-50/60` light tint |
| `loading` (content placeholder) | skeleton shimmer over content slot only — header keeps its padding rhythm |

## Composition rules

| Pattern | Rule |
|---|---|
| Card containing list rows | Card `radius-md`, `overflow-hidden`; list rows flush to card edges. First row inherits top corners, last row inherits bottom corners. **Don't pad the list rows separately from the card** — choose one pad-owner. |
| Card containing a clickable accordion | Replace `<CardHeader>` with `<button className="px-5 py-4 hover:bg-muted/30 focus-visible:ring-inset">`; body uses `<div className="border-t border-border">`. Add `overflow-hidden` to the Card. (Per LESSON 2026-05-03.) |
| Card with embedded smaller card | Outer `radius-md`, inner `radius-sm` (visual containment). Inner card uses `flat` variant — no nested shadows. |
| Card-stack (multiple cards in a column) | `space-y-6` on hero screens (home), `space-y-4` on dense screens (settings, history). |
| Card with footer at bottom of screen | Footer-action variant; if the action sits with primary CTA at screen-bottom, prefer a sticky-bottom action bar **outside** the card per [`spacing.md`](../../tokens/spacing.md) safe-area rule. |
| Card-as-object on home | One per home screen, `mx-5` (20pt page-gutter for hero), `mt-8` from app-bar bottom, `mb-7` to next card-stack. |

## Accessibility

| Concern | Rule |
|---|---|
| Tap target (interactive variant) | Whole card is the tap target, naturally ≥ 44pt. Never wrap a tappable card around a button — choose one tap-owner |
| Contrast (card-as-object white text on gradient) | brand-700 → brand-900: white at 8.6:1 (light) / 14.2:1 (dark) — pass AA body |
| Focus ring (interactive) | 2pt `--ring` outset + 2pt offset against page background. **Inset variant** (`focus-visible:ring-inset`) when the card sits flush against another element so the ring doesn't escape the visual frame |
| Screen-reader semantics | `<article>` for resting/header-body/footer-action; `<button>` for interactive; aria-label "{title}" if no visible title |
| Card-as-object decoration | The wordmark and design embellishments are decorative (`aria-hidden="true"`); the masked PAN + holder name + expiry carry semantic meaning, announced as a single group via `aria-label` |
| Reduced motion | Interactive press-scale falls back to a flat 1pt outline shift; card-as-object gradient stays static |

## Localization

| Slot | Key pattern |
|---|---|
| `<CardTitle>` | `mobile.<surface>.<screen>.<card>.title` |
| `<CardDescription>` | `mobile.<surface>.<screen>.<card>.description` |
| Card-as-object holder name | `users.full_name` from data, displayed `UPPERCASE` (Latin transliteration only — not all locales render Cyrillic well at the smaller weight) |
| Card-as-object expiry | locale-formatted per [`localization.md`](../../../.claude/rules/localization.md): `12/27` (uz/ru/en all the same — numeric short form) |

- Russian titles run 15–25% longer — verify `<CardHeader>` doesn't wrap to 3+ lines at 200% dynamic-type.
- Holder name on card-as-object truncates at the card's right edge (no wrap) with `…` ellipsis if it overflows.

## Privacy

| Surface | Rule |
|---|---|
| Card-as-object PAN | masked only (first 6 + 4 dots + last 4) per [`card-schemes.md`](../../../.claude/rules/card-schemes.md). Full PAN forbidden. |
| Card-as-object CVV | never displayed |
| Card-as-object full document number | forbidden — even though "card" is metaphorical, never overlay a PINFL or document image |
| Resting / flat cards holding PII | masked at all times — full PAN, full PINFL, full document number never in any card body |

## Forbidden patterns

| Don't | Required |
|---|---|
| Half-override `<CardHeader>` padding (`pb-0`, `pt-0`, `p-0`) | Take the contract whole, or replace with plain elements. LESSON 2026-05-03. |
| Nested shadows (resting card inside resting card) | Outer `resting`, inner `flat`. |
| `radius-sm` (8pt) on a Card | Reserved for inputs / chips. Cards = `radius-md` (12pt). Card-as-object = `radius-lg` (20pt). |
| Hardcoded `bg-white` / `#fff` | `bg-card` token. |
| Card-as-object on a screen other than home | Reserved. Receipt / detail screens may *render* a smaller card representation but it's a separate variant — propose if needed. |
| Sticky card | Cards flow inline. Only filter bars / bulk-action bars / right-rail action panels stick. (Per LESSON 2026-05-02 + 2026-05-03.) |
| `text-xs` (13pt) on `<CardDescription>` | `text-sm`, every time. LESSON 2026-05-01. |
| Tooltip-only "What does this card mean?" | If the meaning isn't obvious from the card itself, fix the card. (Per [`core-principles.md`](../../../.claude/rules/core-principles.md) "Explicit over implicit".) |
| Scaling card-as-object on press | It's identity, not action. Press lives on a button inside the card. |
| `interactive` card with embedded buttons | Choose one tap-owner: either the whole card, or buttons inside. Never both — "what did I just tap?" is a UX failure. |

## Quick grep to verify (when implemented)

```bash
# Half-overrides of Card padding (LESSON 2026-05-03):
grep -rnE 'CardHeader[^>]*pb-0|CardHeader[^>]*pt-0|CardContent[^>]*p-0' mobile/

# Nested shadows on cards:
grep -rnE 'shadow-(sm|md|lg).*Card.*shadow' mobile/design/

# Card-as-object outside home:
grep -rnE 'card-as-object|CardAsObject' mobile/design/screens/ | grep -v home/

# Hardcoded card backgrounds:
grep -rnE 'Card.*bg-white|Card.*bg-\[#' mobile/
```

## Cross-references

- Admin parity: [`dashboard/src/components/ui/card.tsx`](../../../dashboard/src/components/ui/card.tsx)
- Tokens: [`colors.md`](../../tokens/colors.md) · [`spacing.md`](../../tokens/spacing.md) · [`radii.md`](../../tokens/radii.md) · [`shadows.md`](../../tokens/shadows.md)
- Privacy: [`card-schemes.md`](../../../.claude/rules/card-schemes.md), [`core-principles.md`](../../../.claude/rules/core-principles.md)
- Layer rules: [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md)
- Lessons: padding contract (2026-05-03), flowing-text floor (2026-05-01), inline-not-sticky chrome (2026-05-02 + 2026-05-03)
