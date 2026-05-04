# Scheme logo

Brand-accurate logos for the four card schemes (UzCard / Humo / Visa / Mastercard) and the two destination wallets (Alipay / WeChat Pay). Renders the official mark — never a generic credit-card icon.

> Status: **First-pass spec, in review.** Mirrors admin's [`<SchemeLogo>`](../../../dashboard/src/components/) primitive. Mobile inherits the same brand asset library; sizes shift to suit touch surfaces.

## Source of truth

- Admin reference: [`dashboard/src/components/scheme/SchemeLogo.tsx`](../../../dashboard/src/components/scheme/) (or wherever it lands)
- Card-scheme rules: [`.claude/rules/card-schemes.md`](../../../.claude/rules/card-schemes.md)
- Visa/MC scope: [LESSON 2026-04-30 — Visa / Mastercard rails are out of dashboard mock data until user explicitly invokes them](../../../ai_context/LESSONS.md)

## Supported schemes (canonical — per [`card-schemes.md`](../../../.claude/rules/card-schemes.md))

| `code` | Display name | Issuer | Mobile mock data | Asset format |
|---|---|---|:---:|---|
| `uzcard` | UzCard | UZ | ✓ included | brand-accurate logo (vector or licensed PNG) |
| `humo` | Humo | UZ | ✓ included | brand-accurate logo |
| `visa` | Visa | any | ✗ excluded from v1 mock per LESSON 2026-04-30 | brand-accurate logo (kept available for future enable) |
| `mastercard` | Mastercard | any | ✗ excluded from v1 mock per LESSON 2026-04-30 | brand-accurate logo (kept available) |
| `alipay` | Alipay | CN | ✓ included (destination) | brand-accurate logo |
| `wechat` | WeChat Pay | CN | ✓ included (destination) | brand-accurate logo |

> **The four-scheme primitive keeps all four cases registered** so the asset library is ready when Visa/MC are enabled. Don't trim Visa / MC code paths — only keep them out of mock data per the LESSON. This includes:
>
> - The `SchemeLogo` primitive renders any of the four card schemes when invoked.
> - Mock data (`mobile/data/*.ts` once it lands) ships with UzCard + Humo only.
> - Filter chips / scheme dropdowns / scheme-aware UI: UzCard + Humo only in v1.

## Sizes

| Size | Container | Use |
|---|---:|---|
| `sm` | 32 × 20pt | Inline meta on list rows, history-row trailing chip |
| `md` | 56 × 32pt | **Default.** Card-management list, send-from-card row, recipient-pay-via row |
| `lg` | 88 × 56pt | Onboarding screens, card-add success page, hero contexts where the logo is the focal element |

> Aspect ratio is fixed (~1.75:1, mirrors actual logo proportions). Width sets the size — height follows.

## Anatomy

```
sm size (history-row inline):

   ┌────────┐
   │ UzCard │           32 × 20pt  · vertical-center in row meta
   └────────┘

md size (card-management row, default):

   ┌──────────────┐
   │              │
   │   UzCard     │     56 × 32pt  · paired with masked-PAN line
   │              │
   └──────────────┘

lg size (onboarding):

   ┌────────────────────────┐
   │                        │
   │                        │
   │       Alipay           │   88 × 56pt  · standalone hero
   │                        │
   │                        │
   └────────────────────────┘
```

| Slot | Token / value |
|---|---|
| Container | `radius-sm` (8pt) for card-scheme logos with brand-required background; `radius-pill` for the round Alipay / WeChat marks; **fully-shaped vector**, no extra wrapper, when the asset has its own bounding shape |
| Background | brand-required colors only — never tint the asset. Some logos require a specific surface color (e.g. UzCard light blue, Humo orange); others are colorless and inherit the host card surface |
| Border | none — the brand asset carries its own visual frame |
| Shadow | none |
| `aria-label` | "{display-name} card" or "{display-name} payment" — surfaced for screen readers |
| Image vs SVG | prefer SVG vector for crispness at every size + reduced-motion compatibility; PNG @1x/@2x/@3x acceptable when license requires raster |

## Composition rules

| Pattern | Rule |
|---|---|
| Inside a card-management row | `md` size, leading slot, paired with `text-base font-medium` bank name + `text-sm text-muted-foreground` masked PAN |
| In a recipient-pay-via row | `sm` or `md`; identifies destination wallet (Alipay / WeChat) |
| Onboarding scheme picker (when Visa/MC enabled) | `lg` per scheme; arranged in a 2 × 2 grid for the four card schemes |
| Receipt screen | `md` paired with the destination wallet name and the recipient's localized handle |
| Filter chips (admin-style scheme filter) | `sm`; never bigger inside a chip |
| Stand-alone hero (e.g. "Add a Visa card" landing page) | `lg`; centered, paired with title + body beneath |

## States

| State | Treatment |
|---|---|
| `idle` | brand asset rendered at size |
| `disabled` (e.g. tier_1 sees Visa logo greyed because it's gated) | `opacity-50` over the asset; combined with helper text "Verify with MyID to enable" — color/brightness pair, never opacity-only |
| `loading` (asset hasn't loaded) | skeleton shimmer at the container dimensions, `slate-100 / slate-800` background, `duration-base` opacity pulse |
| `selected` (in a picker) | 2pt `--ring` outset around the container, 2pt offset against the page background — never tint the asset itself |

## Figma component-set

Single component set `Scheme logo` with `Scheme × Size` axes. **Visa / Mastercard variants are NOT authored** in v1 per [LESSON 2026-04-30](../../../ai_context/LESSONS.md) — only UzCard, Humo, Alipay, WeChat ship in the Figma component set.

> Built in Figma 2026-05-04. Brand-color placeholder marks (white wordmark on brand-tinted surface) — designers swap to real licensed brand assets at instance time when those assets land.

### Variant axes

| Property | Values | Count |
|---|---|---:|
| `Scheme` | `UzCard` · `Humo` · `Alipay` · `WeChat` | 4 |
| `Size` | `Sm` (32×20) · `Md` (56×32) · `Lg` (88×56) | 3 |

= **12 cells**. Visa / Mastercard variants would land if the LESSON 2026-04-30 scope-out is lifted.

### Naming

```
Scheme logo   →   Scheme=<Scheme>, Size=<Size>
```

### Variable bindings — per cell

| Slot | Bound to |
|---|---|
| Container fill | **Hardcoded brand color** per Scheme (cannot bind to existing variables since brand colors don't have semantic equivalents): UzCard `#0066B3` · Humo `#F58220` · Alipay `#1677FF` · WeChat `#07C160` |
| Container radius | UzCard / Humo → `radius/sm` (8pt) · Alipay / WeChat → `radius/pill` (round wallet marks) |
| Container width × height | per `Size`: 32×20 / 56×32 / 88×56 |
| Wordmark text | Scheme display name (`UzCard` / `Humo` / `Alipay` / `WeChat`), `Inter Bold` (700) at `fontSize` 8 (Sm) / 12 (Md) / 18 (Lg) |
| Wordmark color | `color/base/white` |

> **Why hardcoded brand colors?** Each scheme has a specific brand color that doesn't map to any token in the foundation. Introducing semantic variables for `color/scheme/uzcard` etc. would creep the foundation token surface for an asset-replacement use case (the placeholder marks get replaced by licensed PNG/SVG assets in production). The hardcoded approach is acceptable per the existing dashboard precedent — admin dashboard's `SchemeLogo` primitive also uses placeholder hex.

### File placement

| Asset | Component-set ID | Position (page `❖ Components`) | Size |
|---|---|---|---|
| `Scheme logo` | `132:217` | (100, 9500) | 510 × 440 |

### Deviations from spec, tracked

| Deviation | Reason | Recovery path |
|---|---|---|
| Visa / Mastercard variants not built | Per [LESSON 2026-04-30](../../../ai_context/LESSONS.md) — Visa/MC scoped out of v1 mock until user explicitly invokes them. Spec says "The four-scheme primitive keeps all four cases registered" — the registration is in code/tokens, not Figma | When LESSON's scope-out lifts, add `Scheme=Visa` and `Scheme=Mastercard` cells (Visa: blue/yellow `#1A1F71`/`#F7B600` mark; Mastercard: red/yellow circles overlapping `#EB001B`/`#F79E1B`). Add 2 schemes × 3 sizes = 6 new cells |
| Brand-color hex hardcoded (not token-bound) | Brand colors are licensed assets with their own color rules; foundation tokens shouldn't be polluted with per-brand colors. The hardcoded approach matches the dashboard's existing pattern | Replace placeholder marks with licensed brand SVG/PNG assets when those land (instance-time swap or full re-author) |
| Wordmark uses Inter Bold instead of brand-correct typography | Real licensed brand assets would have their own brand typography baked into the SVG | Same — replaced when licensed assets land |
| `loading` skeleton + `selected` ring states not authored | Static frames | Apply at instance time — `slate-100` skeleton fill for loading; 2pt `color/ring` outset stroke + 2pt offset for selected |
| `disabled` state (e.g. tier_1 sees Visa logo greyed) not authored | Same — instance-time `opacity-50` override + helper text adjacency | No work — designer applies at composition time |

## Token consumption summary

| Surface | Token |
|---|---|
| Container radius | `radius-sm` (8pt) for rectangular schemes / `radius-pill` for round |
| Container size | per Sizes table |
| Disabled | `opacity-50` + helper text |
| Selected | 2pt `--ring` outset + 2pt offset |
| Loading | `bg-muted` shimmer |

## Accessibility

| Concern | Rule |
|---|---|
| `aria-label` | Required when the logo is the only identifier. When paired with a text label (most cases), the logo can be `aria-hidden="true"` — text carries identity |
| Color-only signals | The logo IS the brand identity — color is part of the asset; it doesn't need pairing with text in addition to the visible bank name |
| Tap target | Logo itself isn't tappable; the parent row owns the tap-target ≥ 44pt |
| Contrast (logo vs surface) | Brand-required surface colors verified to ≥ 3:1 against host backgrounds; if a logo's brand surface clashes with the page surface (rare), wrap in `bg-card` to provide separation |
| Reduced motion | Loading shimmer falls back to flat `bg-muted` |

## Localization

The logos themselves are language-agnostic. The text identifiers are:

| Slot | Key pattern |
|---|---|
| `aria-label` (logo standalone) | `common.scheme.<code>.aria-label` |
| Display name (paired text) | `common.scheme.<code>.display-name` |

- Display names ARE localized: "UzCard" / "ЎзКарт" / "UzCard" — but the logos are brand assets, not translated.
- Don't include the `Pay` suffix in WeChat unless required by brand: `WeChat` for short, `WeChat Pay` for full disclosure on receipt.

## Privacy

| Surface | Rule |
|---|---|
| Logo + masked PAN row | Always pair logos with the **masked** PAN (first6 + last4 with dots), never the full PAN per [`card-schemes.md`](../../../.claude/rules/card-schemes.md) |
| Logo on the card-as-object hero | The home hero is decorative — masked PAN included is the canonical privacy boundary |
| Logo + holder name | Allowed; holder name is non-sensitive |
| Logo + CVV | Forbidden — CVV never appears on any surface |

## Forbidden patterns

| Don't | Required |
|---|---|
| Generic credit-card icon as fallback | Use the actual brand asset; if asset isn't loaded yet, render skeleton, not a fallback |
| Tinting the brand asset (e.g. `filter: grayscale(1)`) | Never. Brand colors are part of the asset. Disabled state uses `opacity-50` + helper text |
| Custom radius beyond `radius-sm` / `radius-pill` | Match the brand mark's natural shape |
| Stretched / compressed asset (non-aspect-ratio) | Width sets size; height follows aspect ratio (~1.75:1 for cards, 1:1 for round wallets) |
| Visa / Mastercard surfaced in v1 mock data without explicit user invocation | Per LESSON 2026-04-30 |
| Logo without aria-label / paired text | Always identify, either via aria-label or adjacent text |
| Resizing logos at arbitrary sizes outside sm / md / lg | Stick to the three sizes; if a new size is genuinely needed, propose a `xs` (16 × 10pt) for chip contexts |
| Using the SchemeLogo primitive for non-payment marks (e.g. MyID logo, country flag) | Each separate brand mark gets its own primitive — don't overload SchemeLogo |

## Quick grep to verify (when implemented)

```bash
# Generic credit-card icon used in place of brand asset:
grep -rnE 'CreditCard.*(masked|mock|card.*list)' mobile/design/screens/

# Tinted brand assets:
grep -rnE 'SchemeLogo.*filter|SchemeLogo.*grayscale|SchemeLogo.*brightness' mobile/

# Visa / Mastercard in v1 mock data (anti-pattern):
grep -rnE "scheme:\s*['\"](visa|mastercard)['\"]" mobile/data/ 2>/dev/null
# (must return 0 hits in v1; opens up only when user invokes Visa/MC)

# Stretched logos (custom width without aspect-ratio constraint):
grep -rnE 'SchemeLogo.*w-\[\d+px\]' mobile/
```

## Cross-references

- Card-scheme rules: [`card-schemes.md`](../../../.claude/rules/card-schemes.md)
- Tokens: [`radii.md`](../../tokens/radii.md), [`spacing.md`](../../tokens/spacing.md)
- Adjacent: [`card.md`](./card.md) (card-as-object surface displays scheme logo on home hero), [`list-row.md`](./list-row.md) (logos in card-management rows)
- Lessons: Visa/MC out of mock until invoked (2026-04-30)
- Layer rules: [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md)
