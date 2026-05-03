# Prompt — ZhiPay Mobile Foundation (tokens · primitives · core components)

> **How to use:** open a fresh Claude.ai conversation. Paste
> [`00-shared-context.md`](./00-shared-context.md) first (full content),
> then paste this file. Claude will respond with a single hi-fi rendered
> React + Tailwind artefact + a structured Figma library spec.

---

## What I want from this pass

Design and render the **complete foundation layer** for ZhiPay's mobile app:
**tokens** (color, type, spacing, radii, shadows, motion) + **primitives**
(buttons, inputs, chips, badges, icons, avatars) + **core components** (card,
list-row, sheet, modal, toast, banner, segmented control, tab bar, headline-
number display).

Then assemble them into a single **sample app shell** showing every primitive
in three states (light / dark / large-text) so I can review the language as a
whole. No surface screens yet — those land in subsequent prompts.

The output should be **two artefacts**:

1. A rendered React + Tailwind component library + sample shell (claude.ai
   artefact, mobile viewport 390 × 844 pt — multiple frames stacked).
2. A **structured spec doc** (markdown table) listing every token + primitive
   so I can recreate it as a Figma library file. Per-token: name, value
   (light + dark), purpose, example use. Per-primitive: name, props,
   states, accessibility annotations.

## Aesthetic direction

(See [`mobile/research/references.md`](../research/references.md) for the
fuller version.)

- **Wise × Apple Pay × modern fintech composure.** Trustworthy, fast,
  elegant, quietly confident.
- Money + FX rate + recipient are the heroes. Everything else gets out of
  the way.
- Subtle gradients on card-as-object surfaces (home-screen card, receipt
  hero); flat / solid everywhere else.
- Generous whitespace; one decision per screen.
- Brand carries more visual weight than on the admin dashboard — but red is
  forbidden as a primary accent (red is reserved for `danger` semantic).
- Honors light + dark mode equally; honors `prefers-reduced-motion`.

## Token requirements

### Color tokens

Inherit the admin dashboard's token names verbatim (so cross-surface
consistency holds). The mobile foundation should produce concrete HSL values
for every token below — pick a coherent set that:

- Anchors brand in the blue family (matches the admin's `brand-600` ≈
  ZhiPay's signature blue — replicate or refine, but don't drift to a
  different hue family).
- Provides 11 stops (`50 / 100 / 200 / 300 / 400 / 500 / 600 / 700 / 800 /
  900 / 950`) for `brand` and `slate`.
- Provides 3 stops (`50 / 600 / 700`) for `success`, `warning`, `danger`.
- Maps cleanly to a dark-mode palette (each light token has a dark
  counterpart, named identically).
- Exports as both Tailwind config (HSL CSS vars per the admin's pattern)
  and a Figma-importable JSON.

| Token family | Mobile-specific use |
|---|---|
| `brand-50` → `brand-950` | Primary accent. Headline amounts. Home-screen card surface. Primary CTA. Status `processing` / `completed`. |
| `slate-50` → `slate-950` | Neutral surfaces, text, dividers, secondary actions, disabled states. |
| `success-50 / 600 / 700` | `completed` transfers, `passed` KYC, `active` cards. Calm green — never lime / mint. |
| `warning-50 / 600 / 700` | `reversed` transfers, `expired` KYC, `frozen` cards, tier-upgrade prompts, FX rate stale warnings. Amber, not yellow. |
| `danger-50 / 600 / 700` | `failed` transfers, sanctions reviews, destructive confirms. **Reserved — never used as a primary accent.** |

For each token, surface in the spec table:
- Light HSL value
- Dark HSL value
- Contrast ratio against `slate-50` (light) and `slate-950` (dark)
- Example use ("primary CTA background", "amount text on home card", etc.)

### Typography scale

Inter as the base (system fallback: SF Pro / Roboto). 13px floor (no body
text below 13). Mobile lifts the display sizes higher than admin's web scale.
Propose and lock:

| Role | Size | Weight | Line-height | Usage |
|---|---:|:---:|:---:|---|
| Display 1 | ?pt | ?w | ? | Hero amount on home / receipt screens |
| Display 2 | ?pt | ?w | ? | Page titles |
| Heading | ?pt | ?w | ? | Section heads |
| Body | ?pt | ?w | ? | Default body text |
| Body small | ?pt | ?w | ? | Secondary text, meta |
| Label | ?pt | ?w | ? | Chips, kbd, uppercase labels |

Render an actual specimen page — every role typeset on a sample sentence,
with the tokenised name beneath each.

### Spacing scale

8pt base. Provide named tokens (`space-1` through `space-12`, e.g. 4 / 8 /
12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96) and demonstrate them in a
visual ruler.

### Radii

Pick 4 stops: small (input + chip), medium (cards + buttons), large
(sheets + hero card), pill (badges + segmented control). Render samples.

### Shadows

3 elevations: subtle (resting card), medium (modal / sheet), pronounced
(home-screen card-as-object — the only place this gets heavy treatment).

Light + dark variants for each — dark-mode shadows lean on contrast
opacity, not blur intensity.

### Motion

- Default duration: 200–250ms
- Default easing: `cubic-bezier(0.4, 0, 0.2, 1)` (Material standard ease)
- Reduced-motion fallback: instantaneous
- Reserved animated patterns:
  - Status timeline tick-forward (transfer detail screen)
  - FX rate countdown (review screen)
  - Card-flip on long-press (home screen)
  - Sheet slide-in (modal / picker)
  - Toast slide-in-from-top
- **Forbidden**: parallax, scroll-triggered effects, autoplay.

## Primitive requirements

Render each below as a labelled component with **all states** visible
side-by-side (idle / hover / pressed / disabled / focused / loading / error
where applicable). Each ships with the prop signature in the spec table.

### Button (the most important — get this right)

- Variants: `primary` (brand, the only one used for confirm money actions),
  `secondary` (slate, ghost-like fill), `tertiary` (text-only), `destructive`
  (danger), `link` (inline text)
- Sizes: `sm` (40pt height — chip-adjacent), `md` (48pt — default),
  `lg` (56pt — hero CTAs like "Confirm send")
- States: idle / hover / pressed / disabled / focused / loading
- Optional: leading icon, trailing icon (lucide-react names — match the
  admin's icon library so we don't fragment the visual language)
- Min tap target ≥ 44×44pt per `.claude/rules/accessibility.md`

### Input

- Text input (single line)
- Multi-line textarea
- Phone input (with `+998 ` prefix locked, mask `90 123 45 67`)
- OTP input (4 or 6 boxes — auto-focus next on type)
- PIN dot input (for biometric fallback flows, future)
- Number keypad (custom — large hit targets, for amount entry on send-money)
- Search input
- Each with: label / placeholder / helper text / error text / disabled /
  with leading or trailing icon

### Chip / Badge

- Status chip (color per status state — `processing` brand / `completed`
  success / `failed` danger / `reversed` warning)
- Tier badge (`tier_0` muted / `tier_1` brand-tint / `tier_2` brand-solid +
  small MyID checkmark icon)
- Count badge (small circle, brand by default)

### Avatar

- 3 sizes (32 / 48 / 72pt)
- Initials variant + photo variant
- Status dot affordance (online / offline) — minor variant, mostly unused

### Icon

- Lucide-react base set
- Standard size: 20pt (matches Tailwind `size-5`)
- Demonstrate 8 commonly-used: send / receive / card / user / shield / clock
  / arrow-right / check

## Component requirements

Compositions of primitives. Render each in light + dark.

### Card

- Resting card (slight elevation, `bg-card`)
- Card with header / body (matches admin's `<Card><CardHeader><CardContent>`
  shape — header padded `p-5`, content `p-5 pt-0`)
- Card with footer action row
- **Card-as-object** (the home-screen hero) — gradient surface, masked PAN,
  brand mark, 9:5.5 aspect ratio (think credit card)

### List row / cell

- Single-line row (label only)
- Two-line row (label + helper)
- Avatar + content + trailing chevron + optional trailing meta (amount /
  status / date)
- Toggle row (Switch on the right)
- Selectable row (radio left)

Used heavily on history list, recipient list, language picker, settings.

### Sheet (bottom sheet)

- Drag handle at top, content area, optional sticky-bottom action row
- Snap points (peek / half / full) — at least demonstrate "half" and "full"
- Used for: recipient picker, currency picker, status detail, contextual
  overflow actions

### Modal / Dialog (full-screen on mobile)

- Title + body + 1–2 actions (vertically stacked on mobile)
- Variants: confirm (default), destructive (danger CTA), info (single OK)
- Used for: confirm send, confirm freeze, MyID expiry warning, sign-out

### Toast

- Variants: success (auto-dismiss 4s), warning, error (manual dismiss),
  info
- Slide in from top, swipe-right to dismiss

### Banner (inline, not sticky)

- Variants: info / warning / danger
- Inline icon + title + body + optional action link
- Used for: tier-upgrade prompt on home, MyID-expiring soon, offline state

### Segmented control

- 2- or 3-segment (e.g. recent / saved / new for recipient picker)
- Brand-tinted active segment

### Tab bar (bottom navigation)

- 4 tabs: Home / Send / History / More
- Active tab: brand color, slight bump, label visible
- Inactive: muted slate, label visible
- Center "Send" can be slightly emphasised (slight scale) but no FAB / no
  diagonal cutout — keep restrained

### Headline number (the FX hero)

A composable component that renders an amount + currency code, with a
prop for which side gets bigger emphasis. Three sizes:
- `display` (home screen balance, 36pt)
- `hero` (send-money review screen, 28pt)
- `inline` (list rows, 16pt)

For each: render the number in tabular numerals, the currency code in body
weight + slight muted color, with a non-breaking space between them.

### Status timeline

- Vertical list of events, current event highlighted
- Past events: filled circle + connecting line solid
- Current event: ring circle + connecting line dashed
- Future events: hollow circle + line dashed
- Timestamp + actor + label per event
- (Same shape as admin's `<StatusTimeline>` — render the mobile-first
  variant with smaller timestamps and tighter spacing)

## Sample app shell

Stitch the primitives + components together into **one sample frame** that
shows:

- App bar (back button on the left, title, optional trailing action)
- Tab bar (bottom)
- A single content area demonstrating: a card, a list row, a banner, a
  primary button, a status chip, the headline number component, an inline
  segmented control

The point is not to design a real screen — it's to show the primitives in
context, sharing the same surface, so the typography hierarchy and spacing
rhythm read correctly.

Render this sample in **three frames**: light mode default text size, dark
mode default text size, light mode at 200% dynamic type (proves the layout
reflows without clipping per the accessibility rule).

## Accessibility callouts (mark on every primitive)

- Min tap target: ≥ 44×44pt mobile (per
  [`.claude/rules/accessibility.md`](../../.claude/rules/accessibility.md))
- Contrast: ≥ 4.5:1 for body text, ≥ 3:1 for large text + non-text UI
- Focus ring: visible on every focusable element (use `brand-500` ring with
  2pt offset)
- Screen-reader label on every interactive element + decorative icons
  marked decorative
- No color-only signals — pair every status color with an icon and a label

## Output format checklist

- [ ] Single Claude.ai artefact, mobile viewport 390pt wide
- [ ] React + Tailwind, using token names defined in this pass
- [ ] Light mode + dark mode + 200% dynamic-type frames
- [ ] Each primitive shown with all states side-by-side, labelled
- [ ] Sample app shell at the bottom showing primitives in context
- [ ] Spec table appended in markdown — all tokens with HSL values + use,
      all primitives with prop signatures + states
- [ ] No surface screens (those come in subsequent passes)

## Forbidden in this pass

- ❌ Inventing token names not listed above
- ❌ Sub-13pt body text
- ❌ Red as a primary accent (only as `danger` semantic)
- ❌ Visa / Mastercard logos anywhere
- ❌ Skeuomorphic textures
- ❌ Marketing copy / illustrations / mascots

## Cross-references (canonical, do not contradict)

- [`docs/models.md`](../../docs/models.md) — schema, tiers, statuses, ledger,
  error codes
- [`.claude/rules/design-system-layers.md`](../../.claude/rules/design-system-layers.md)
  — token / primitive / component / pattern / screen taxonomy
- [`.claude/rules/accessibility.md`](../../.claude/rules/accessibility.md) —
  contrast, tap targets, dynamic type, focus rings
- [`.claude/rules/money-and-fx.md`](../../.claude/rules/money-and-fx.md) —
  number formatting per locale
- [`mobile/research/references.md`](../research/references.md) — aesthetic
  direction
