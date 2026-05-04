# Mobile Primitives — Layer 2

The second layer of the ZhiPay mobile design system. Primitives consume **only Tokens** — never sideways, never upward. Every Component, Pattern, Screen, and Flow above this layer composes from these.

> Status: **First-pass spec, in review.** All five primitives drafted to spec depth. Companion sample frame (light + dark + 200% dynamic-type) lands as part of the foundation handoff once specs are locked.

## What lives here

| File | Purpose |
|---|---|
| [`button.md`](./button.md) | 5 variants × 3 sizes × 6 states + icon slots + loading + disabled-because-X reasons |
| [`input.md`](./input.md) | 7 input variants — text · textarea · phone (`+998`) · OTP (4 / 6) · PIN · numberPad · search |
| [`chip.md`](./chip.md) | StatusChip (transfer / KYC / card states) + TierBadge (with MyID glyph on tier_2) + CountBadge |
| [`avatar.md`](./avatar.md) | 3 sizes (32 / 48 / 72pt) · initials + photo · deterministic name-hash color · status-dot |
| [`icon.md`](./icon.md) | lucide-react canonical set · 20pt default · canonical 8 demo icons · decorative-vs-meaningful rules |

## Layer rules (recap)

Per [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md):

```
Tokens     ←  consumed by this layer
Primitives ←  THIS LAYER (no sideways imports — primitives never import each other)
Components →  consume Tokens + Primitives
Patterns   →  consume Tokens + Primitives + Components
Screens    →  consume all layers above
Flows      →  compose Screens
```

**Strictly downward.** A Button doesn't import an Input. A Chip doesn't import an Avatar. If two primitives need to share something, it lives in Tokens. If a "primitive" wraps another primitive, it's a Component — move it up a layer.

## Cross-cutting decisions

These decisions cut across every primitive in this layer. Don't override per-primitive without documenting why.

| Concern | Rule |
|---|---|
| **Tap target** | ≥ 44 × 44pt every interactive primitive ([`accessibility.md`](../../../.claude/rules/accessibility.md)). Visual size can be smaller; tap-area must inflate via padding / wrapper. |
| **Type floor** | Buttons + flowing text ≥ `text-sm` (14pt). Input value text ≥ `text-base` (16pt) — prevents iOS auto-zoom on focus. `text-xs` (13pt) is RESERVED for chip/badge/kbd/uppercase/avatar-initials/tooltip-body only (LESSON 2026-04-29 + 2026-05-01). |
| **Color only** | Never. Every status conveys via color + icon + label together. |
| **Focus ring** | Every focusable primitive renders a visible 2pt `--ring` with 2pt offset. `outline: none` is forbidden without a replacement. |
| **Icon library** | `lucide-react` only. No inline SVG, no Unicode arrows, no other libraries. (Brand scheme logos live in a separate `SchemeLogo` primitive in Components.) |
| **Localization** | Every label is a key (`mobile.<surface>.<screen>.<element>`), never a string literal. Width-test `ru` (15–25% longer). |
| **Privacy** | No primitive accepts free-text PAN / CVV / full PINFL / full document number. Card flows go through hosted forms / 3DS WebView per [`card-schemes.md`](../../../.claude/rules/card-schemes.md). |

## Cross-surface parity

Five primitives in this layer mirror admin's primitive shape — props, variants, and most styling stay verbatim. Mobile-specific deviations are documented per-spec:

| Primitive | Admin parity | Mobile-specific deviations |
|---|---|---|
| Button | shadcn cva variants | `tertiary` (text-only) splits admin's `ghost`; sizes shift to 40/48/56pt; `lg` uses `text-base font-semibold` |
| Input | shadcn `<Input>` | `phone` (`+998` prefix locked), `otp`, `pin`, `numberPad`, `search` are mobile-specific. Value type bumps to `text-base` (16pt) to dodge iOS auto-zoom. Radius `radius-sm` (8pt vs admin's 4pt). |
| Chip / Badge | StatusBadge / TierBadge / shadcn `<Badge>` | TierBadge gains MyID `<BadgeCheck>` glyph on `tier_2` — only mobile-specific addition |
| Avatar | radix `<Avatar>` | Sizes shift (32 / 48 / 72pt); status-dot affordance scaffolded but mostly unused at v1 |
| Icon | lucide-react | Default size bumps `size-4` → `size-5` (16 → 20pt) for touch ergonomics |

Admin source-of-truth files (linked per spec): [`dashboard/src/components/ui/`](../../../dashboard/src/components/ui/).

## Sample app shell (deferred)

The foundation prompt asks for a single sample frame stitching primitives together — light mode default, dark mode default, light mode 200% dynamic-type. Per the layer separation, that frame is a **Components-layer artefact** (it stitches Button + Input + Chip + Avatar + Icon into a Card + ListRow + Banner + AppBar context).

This README locks the primitive specs first. The sample frame lands when the Components layer kicks off.

## Lessons that bind every primitive in this layer

These have been hard-won across the admin build. Re-reading them before adding a sixth primitive (or a new variant of one of these five) is part of the Definition of Done:

| Lesson | Bite |
|---|---|
| 2026-04-29 — Typography 13pt floor + `text-xs` reserved | Buttons & flowing text never `text-xs`. `text-xs` reserved for chip/kbd/uppercase/avatar-initials/tooltip. |
| 2026-05-01 — `text-xs` ban on buttons (size="sm" included) | Every button size = `text-sm` minimum. shadcn carve-out retired. |
| 2026-05-02 — Detail-page back-link is `<ArrowLeft>` icon component | No Unicode `← `, no `<ChevronLeft>`. Label is `Back to <list>`. |
| 2026-05-02 — Title Case + `text-sm font-medium text-muted-foreground` for table column headers | Chips stay Title Case too — never `uppercase tracking-wider` on chip labels. |
| 2026-05-03 — Half-overrides of Card primitive padding are a smell | Anticipates Components layer; primitives shouldn't expose half-buffet padding APIs. |
| 2026-04-30 — No sticky `<thead>` / column headers | Anticipates table primitives in Components — heads up. |

Full ledger: [`ai_context/LESSONS.md`](../../../ai_context/LESSONS.md).

## How to consume (preview)

These are previews of how primitives will be consumed. The actual `<Button>`, `<Input>`, etc. React components don't exist yet — they land at code-time. The specs here drive the prop signatures and the visual contract.

```tsx
// Button — primary CTA on send-money review
<Button variant="primary" size="lg" className="w-full">
  {t('mobile.send-money.review.cta-confirm')}
</Button>

// Input — phone number with +998 prefix locked
<Input
  variant="phone"
  label={t('mobile.sign-in.phone.label')}
  helperText={t('mobile.sign-in.phone.helper')}
  inputMode="tel"
  autoComplete="tel"
/>

// StatusChip — transfer status in a history row
<StatusChip state="processing" size="sm" />

// TierBadge — home banner
<TierBadge tier="tier_2" size="md" />

// Avatar — recipient row
<Avatar name="Wang Lei" size="md" />

// Icon — back-link in detail header
<button className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
  <ArrowLeft className="size-4" aria-hidden="true" />
  {t('mobile.history.detail.back')}
</button>
```

## What's next

Primitives layer locks the prop signatures and visual contract for Button / Input / Chip / Avatar / Icon. The next pass is **Components**:

```
Tokens (locked) → Primitives (this pass) → Components (next) → Patterns → Screens → Flows
```

Per [`mobile/prompts/01-foundation.md`](../../prompts/01-foundation.md) §"Component requirements", Components covers:
- Card (resting · header/body · footer-action · **card-as-object** for the home hero)
- List row / cell (single · two-line · avatar+content+chevron · toggle · selectable)
- Sheet (bottom sheet — drag handle + snap points)
- Modal / Dialog (full-screen on mobile)
- Toast (success / warning / error / info — slide from top, swipe to dismiss)
- Banner (inline, not sticky — info / warning / danger)
- Segmented control (2- or 3-segment)
- Tab bar (4 tabs — Home / Send / History / More)
- Headline number (the FX hero — `display` / `hero` / `inline`)
- Status timeline (mobile-first variant of admin's `<StatusTimeline>`)
- `SchemeLogo` (UzCard / Humo / Alipay / WeChat — `Visa` / `Mastercard` reserved per LESSON 2026-04-30)

Plus the **sample app shell** that stitches it all together in light / dark / 200% dynamic-type.

## Adding to this layer

If a new primitive is genuinely needed:

1. **Check first**: can it compose from existing primitives at the Components layer? If yes, do that.
2. **Check the admin**: does it already exist there? If yes, inherit the shape verbatim and document mobile-specific deviations in the spec.
3. **If new**: add a `<name>.md` spec file matching the rhythm of the existing five (status header → source of truth → variants → sizes → states → anatomy → token consumption → accessibility → localization → forbidden patterns → quick grep → cross-references).
4. **Update this README**: extend the "What lives here" table.
5. **Doc cascade**: if the new primitive shifts an existing spec, run [`design-review-checklist.md`](../../../.claude/rules/design-review-checklist.md) on every consumer before merging.

## Cross-references

- Layer rules: [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md)
- Tokens (consumed): [`mobile/design/tokens/`](../tokens/) — [README](../tokens/README.md), [colors](../tokens/colors.md), [typography](../tokens/typography.md), [spacing](../tokens/spacing.md), [radii](../tokens/radii.md), [shadows](../tokens/shadows.md), [motion](../tokens/motion.md)
- Accessibility: [`accessibility.md`](../../../.claude/rules/accessibility.md)
- Money / FX rendering: [`money-and-fx.md`](../../../.claude/rules/money-and-fx.md)
- Localization: [`localization.md`](../../../.claude/rules/localization.md)
- Error UX: [`error-ux.md`](../../../.claude/rules/error-ux.md)
- Card-scheme rules (PAN/CVV out-of-scope): [`card-schemes.md`](../../../.claude/rules/card-schemes.md)
- Lessons: [`ai_context/LESSONS.md`](../../../ai_context/LESSONS.md)
- Foundation brief: [`mobile/prompts/01-foundation.md`](../../prompts/01-foundation.md)
- Aesthetic direction: [`mobile/research/references.md`](../../research/references.md)
