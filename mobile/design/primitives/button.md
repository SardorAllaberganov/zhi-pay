# Button

The most important primitive. Every CTA — "Confirm send", "Verify with MyID", "Add card", "Try again" — anchors here. Get this shape right, the rest of the system gets easier.

> Status: **First-pass spec, in review.** Mirrors admin's [`<Button>`](../../../dashboard/src/components/ui/button.tsx) shape (shadcn + cva variants) with mobile sizing (44pt-tap floor) and one extra variant (`tertiary` for text-only, splits admin's `ghost`).

## Source of truth

- Admin reference: [`dashboard/src/components/ui/button.tsx`](../../../dashboard/src/components/ui/button.tsx)
- Tokens consumed: [`tokens/colors.md`](../tokens/colors.md), [`tokens/typography.md`](../tokens/typography.md), [`tokens/spacing.md`](../tokens/spacing.md), [`tokens/radii.md`](../tokens/radii.md), [`tokens/motion.md`](../tokens/motion.md)
- Accessibility floor: [`.claude/rules/accessibility.md`](../../../.claude/rules/accessibility.md)

## Variants

Five variants. Pick by **intent**, not by color preference. Money-moving CTAs always `primary`; destructive actions always `destructive`; everything else flows through `secondary` / `tertiary` / `link`.

| Variant | Surface | Label color | Use |
|---|---|---|---|
| `primary` | `--primary` (brand-600 light / brand-500 dark) | `--primary-foreground` (white) | The single most important action on a screen. "Confirm send", "Verify with MyID", "Add card", "Sign in". **Only one per screen.** |
| `secondary` | `--secondary` (slate-100 light / slate-800 dark) | `--secondary-foreground` (slate-900 / slate-100) | Secondary action paired with primary. "Cancel", "Edit recipient", "Use another card". |
| `tertiary` | transparent | `brand-700` light / `brand-400` dark | Text-only with weight. "Skip", "Not now", "Choose later". Hover: `bg-accent`. |
| `destructive` | `--destructive` (danger-600) | `--destructive-foreground` (white) | Irreversible / data-loss actions. "Remove card", "Sign out", "Delete recipient". Always paired with a confirm dialog. |
| `link` | transparent | `brand-700` light / `brand-400` dark + underline-on-hover | Inline text link inside flowing copy. "Forgot password?", "Why this fee?", "Read more". |

**Forbidden**: themeing `primary` with `danger-*` (red Send button), or using `destructive` for a recoverable action like "Cancel". Per [`core-principles.md`](../../../.claude/rules/core-principles.md), red is reserved for destructive / failure semantics.

## Sizes

Three sizes. Default to `md`. Use `lg` for hero CTAs at the bottom of the screen (review screens, sign-in, MyID confirm).

| Size | Height | Padding (X / Y) | Type | Use |
|---|---:|---|---|---|
| `sm` | 40pt | `space-3 / space-2` (12 / 8pt) | `text-sm` (14pt) `font-medium` | Chip-adjacent buttons, list-row inline action, modal stacked secondary. **Tap-area inflated to ≥44pt.** |
| `md` | 48pt | `space-5 / space-3` (20 / 12pt) | `text-sm` (14pt) `font-medium` | **Default.** Form CTAs, sheet primary, in-card action, banner action. Visual = tap-area. |
| `lg` | 56pt | `space-6 / space-4` (24 / 16pt) | `text-base` (16pt) `font-semibold` | Hero CTAs at screen bottom: "Confirm send", "Continue with MyID", "Sign in". One per screen. |

> **Tap-area rule**: every size lands ≥ 44 × 44pt tap target ([`accessibility.md`](../../../.claude/rules/accessibility.md)). `sm` is 40pt visual — wrap with `min-h-[44pt] min-w-[44pt]` or 4pt vertical tap-padding. `md` and `lg` already exceed the floor.

> **Type-floor rule**: per LESSON 2026-05-01, **every button size uses `text-sm` minimum**. The shadcn admin `size="sm"` carve-out for `text-xs` was explicitly retired. Don't reintroduce it on mobile.

## States

Six states per variant × size. Render every cell on a sample frame to verify color + motion + ring + opacity:

| State | Visual | Trigger |
|---|---|---|
| `idle` | base variant fill + label | default |
| `hover` | fill at `90%` opacity (primary / destructive) or `--secondary/80` (secondary) | mouse hover (web preview only — mobile has no hover) |
| `pressed` | fill at `brand-700` (primary), `slate-200` (secondary), `danger-700` (destructive); labels stay readable | `:active` / touch-down |
| `disabled` | `opacity-50` + `pointer-events-none` + cursor not-allowed | `disabled` prop |
| `focused` | 2pt ring `--ring` (brand-600 light / brand-400 dark) + 2pt offset against `--ring-offset-background` | keyboard focus / `focus-visible` |
| `loading` | spinner replaces leading icon (or sits before label if no leading icon); label unchanged; button stays enabled but `aria-busy="true"` | async action in flight |

**State stack rule**: `disabled` overrides every other state. `loading` and `disabled` are mutually exclusive — don't render both at once.

### Loading state details

- Spinner: 16pt diameter (`size-4`), 2pt stroke, rotates `360deg` at `duration-base` (220ms) per [`tokens/motion.md`](../tokens/motion.md).
- Color: matches label color (white on `primary` / `destructive`, brand-700 on `tertiary` / `link`).
- Position: replaces leading icon if one exists; otherwise sits 8pt before the label.
- Width: button width is **frozen** at the idle width when entering `loading` — don't reflow as the spinner appears. Use `min-w` snapshot or fixed width.
- Auto-disable taps while loading: `aria-busy="true"` + `pointer-events: none` on the button itself (not the parent — the parent may need to remain interactive for cancel chrome).

## Anatomy

```
┌──── md (48pt height) ────────────────────────┐
│  [icon]   Confirm send                       │   primary
│  ←space-3→         ←space-3→ [icon]          │
└──────────────────────────────────────────────┘
   ↑ space-5 (20pt) horizontal padding ↑

┌──── lg (56pt height) — hero CTA ─────────────┐
│                                              │
│   ↑                                          │
│  16pt    Confirm send 5 000 000 UZS          │
│   ↓                                          │
│                                              │
└──────────────────────────────────────────────┘
   ↑ space-6 (24pt) horizontal padding ↑
```

- Leading icon: 20pt (`size-5`) for `lg`, 16pt (`size-4`) for `md` / `sm`.
- Icon → label gap: `space-2` (8pt) at `sm`, `space-3` (12pt) at `md` / `lg`.
- Trailing icon: same sizing rules; gap on the trailing side mirrors the leading-side gap.
- Border radius: `radius-md` (12pt) at all sizes — never `radius-sm` (looks like an input), never `radius-pill` (looks like a chip).

## Token consumption

| Surface / state | Token |
|---|---|
| `primary` fill | `--primary` (brand-600 light, brand-500 dark) |
| `primary` label | `--primary-foreground` (white) |
| `primary` pressed | `brand-700` |
| `secondary` fill | `--secondary` (slate-100 light, slate-800 dark) |
| `secondary` label | `--secondary-foreground` (slate-900 / slate-100) |
| `tertiary` label | `brand-700` light / `brand-400` dark |
| `tertiary` hover surface | `--accent` (slate-100 / slate-800) |
| `destructive` fill | `--destructive` (danger-600) |
| `destructive` label | `--destructive-foreground` (white) |
| `destructive` pressed | `danger-700` |
| `link` label | `brand-700` light / `brand-400` dark |
| Disabled | inherits variant fill + `opacity-50` |
| Focus ring | `--ring` (brand-600 light, brand-400 dark) |
| Padding (X / Y) | per Sizes table — `space-3..6` X / `space-2..4` Y |
| Border radius | `radius-md` (12pt) |
| Type | per Sizes table — `text-sm` (md/sm), `text-base` (lg) |
| Motion (color transition) | `duration-base` (220ms), `easing-standard` |

## Icon slots

- Library: **lucide-react**, same set as admin (don't fragment the visual language). See [`icon.md`](./icon.md) for the canonical 8.
- Sizes: 16pt (`size-4`) on `sm` / `md`; 20pt (`size-5`) on `lg`.
- Decorative-vs-meaningful:
  - **Decorative** (visual rhythm only — label carries meaning): `aria-hidden="true"`. E.g. `<ArrowRight>` after "Continue".
  - **Meaningful** (icon-only button, no label): always pair with `aria-label`. E.g. close-X on a sheet header.
- Per LESSON 2026-05-02, back-link icons use `<ArrowLeft>` (never `<ChevronLeft>`, never inline SVG, never `← ` text prefix).

## Disabled-because-X reasons

When a button is disabled because of a known reason, **always render the reason inline** — never make the user guess. Per [`core-principles.md`](../../../.claude/rules/core-principles.md) "Explicit over implicit".

```
[Confirm send · disabled]
↓
Daily limit reached — try tomorrow or upgrade with MyID.
```

The reason text sits **below** the button (`mt-2`, `text-sm text-muted-foreground` per LESSON 2026-05-01 — never `text-xs`). Source the message from `error_codes` per [`error-ux.md`](../../../.claude/rules/error-ux.md). Don't put the reason in a tooltip on mobile — touch users can't trigger tooltips.

Examples:
- `LIMIT_DAILY_EXCEEDED` → "Daily limit reached — try tomorrow or verify with MyID for higher limits."
- `KYC_REQUIRED` (tier_0 trying to send) → "Verify your phone to start sending."
- `PROVIDER_UNAVAILABLE` → "Alipay is temporarily unavailable. Try again in a moment."
- `INSUFFICIENT_FUNDS` → "Not enough balance on this card. Try another."

## Accessibility

| Concern | Rule |
|---|---|
| Tap target | ≥ 44 × 44pt every size; `sm` inflates via wrapper / padding |
| Contrast (label vs fill) | `primary` 8.4:1, `destructive` 5.4:1, `secondary` light 16:1 / dark 13:1, `tertiary`/`link` 7.4:1 light / 7.6:1 dark — all ≥ AA body |
| Focus ring | 2pt `--ring` + 2pt offset; **always visible**, never `outline: none` without a replacement |
| Screen-reader label | label text is the SR label by default; icon-only buttons need explicit `aria-label`; loading state announces via `aria-busy="true"` + `aria-live="polite"` parent |
| Reduced motion | spinner falls back to a static three-dot string when `prefers-reduced-motion: reduce`; color transitions drop to instantaneous |
| Color-only signals | never. Status conveyed by icon + label, not just fill color. Failed action shows error icon + reason text, not just a red button |

## Localization

- Label is a **key**, not a string. Per [`localization.md`](../../../.claude/rules/localization.md): `mobile.<surface>.<screen>.cta-<intent>`.
- Examples: `mobile.send-money.review.cta-confirm`, `mobile.cards.add.cta-verify-myid`, `mobile.history.detail.cta-retry`.
- Width-test with `ru` (15–25% longer than `uz`/`en`). If a Russian translation overflows, use `text-overflow: ellipsis` + truncate at the longest viewport — never wrap a button label across two lines.
- Loading state announces the intent in localized form: `aria-label="{label} · loading"` becomes `"Confirm send · loading"` (en) / `"Tasdiqlash · yuklanmoqda"` (uz).

## Composition rules

| Layout | Pattern |
|---|---|
| Stacked (mobile default) | Primary on top, secondary below. Both `w-full`. Gap `space-3` (12pt). |
| Inline pair (sm sizes only) | Secondary on left, primary on right. Both `flex-1`. Gap `space-2` (8pt). |
| Hero CTA at screen bottom | Single `lg` primary, sticky-bottom or sheet-bottom. Min `mb-8` (40pt) from safe-area to avoid home-indicator gestures (per [`spacing.md`](../tokens/spacing.md)). |
| Inside a banner | `tertiary` or `link` only — never primary, banners are not call-to-action surfaces |
| Inside a list-row | `tertiary` or `link` — preserves the row's tap-the-whole-row contract |

## Forbidden patterns

| Don't | Required |
|---|---|
| Two `primary` buttons on one screen | One primary intent per screen — others step down to `secondary` / `tertiary` |
| `primary` red ("Send" themed danger) | Money-moving = brand. Red reserved for destructive |
| `text-xs` (13pt) on any size | `text-sm` floor — LESSON 2026-05-01 |
| `rounded-full` button (looks like a pill chip) | `radius-md` (12pt) at all sizes |
| Tooltip-only disabled reason on mobile | Inline text below the button — touch can't trigger tooltips |
| Custom hex / arbitrary px in button.tsx | Tokens only — `--primary`, `space-*`, `radius-md` |
| `<ChevronLeft>` for back-link icon | `<ArrowLeft>` (LESSON 2026-05-02) |
| `← ` text prefix in CTA labels | Use the icon component; label is "Back to send", not "← Back to send" |
| Reflowing button width during loading | Freeze width at idle; spinner sits in place |
| `outline: none` on focus without a replacement ring | Always render `--ring` |
| Stacked buttons with no gap | `space-3` (12pt) gap minimum between stacked CTAs |

## Quick grep to verify (when implemented)

```bash
# Sub-13pt body / button text — must return 0 hits:
grep -rE 'text-\[1[0-2]px\]|fontSize:\s*1[0-2]\b' mobile/

# text-xs in buttons — must return 0 hits:
grep -rE '<Button[^>]*text-xs|buttonVariants.*text-xs' mobile/

# Arbitrary radius — every Button must use radius-md / rounded-md:
grep -rE 'rounded-\[' mobile/design/primitives/button*

# Back-link icon in CTAs — should be ArrowLeft, not ChevronLeft:
grep -rn 'ChevronLeft' mobile/design/primitives/button*
```

## Cross-references

- Tokens: [`colors.md`](../tokens/colors.md) · [`typography.md`](../tokens/typography.md) · [`spacing.md`](../tokens/spacing.md) · [`radii.md`](../tokens/radii.md) · [`motion.md`](../tokens/motion.md)
- Accessibility: [`accessibility.md`](../../../.claude/rules/accessibility.md)
- Error UX (disabled reasons): [`error-ux.md`](../../../.claude/rules/error-ux.md)
- Localization (CTA keys): [`localization.md`](../../../.claude/rules/localization.md)
- Admin button parity: [`dashboard/src/components/ui/button.tsx`](../../../dashboard/src/components/ui/button.tsx)
- Layer rules: [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md)
- Lessons that bind this spec: typography floor (2026-04-29), `text-xs` ban on buttons (2026-05-01), back-link icon (2026-05-02)
