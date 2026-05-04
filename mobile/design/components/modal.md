# Modal / Dialog (full-screen on mobile)

Used sparingly. Three variants: `confirm` (default), `destructive` (danger CTA), `info` (single OK). Reserved for: confirm-send-money, confirm-freeze-card, MyID-expiry warning, sign-out confirm. Anything that fits a Sheet should be a Sheet — modals are the heavier hammer.

> Status: **First-pass spec, in review.** Mirrors admin's [`<Dialog>`](../../../dashboard/src/components/ui/dialog.tsx) (radix-based) shape, mobile-tuned to full-screen layout.

## Source of truth

- Admin reference: [`dashboard/src/components/ui/dialog.tsx`](../../../dashboard/src/components/ui/dialog.tsx) (radix Dialog)
- Tokens: [`colors.md`](../../tokens/colors.md), [`spacing.md`](../../tokens/spacing.md), [`radii.md`](../../tokens/radii.md), [`shadows.md`](../../tokens/shadows.md), [`motion.md`](../../tokens/motion.md)
- Error display: [`.claude/rules/error-ux.md`](../../../.claude/rules/error-ux.md) for confirm-on-failure surfaces

## Variants

| Variant | Primary CTA tone | Secondary CTA | Use |
|---|---|---|---|
| `confirm` | `primary` (brand) | `secondary` ("Cancel") | Confirm-send-money review summary, "Save changes?", "Add this recipient?" |
| `destructive` | `destructive` (danger) | `secondary` ("Cancel") | "Remove card?", "Sign out?", "Delete recipient?", "Discard draft?" |
| `info` | `primary` ("OK" / "Got it" / "Continue") | none | "MyID expiry warning", "App updated — what's new", post-success acknowledgement |

## Layout — full-screen on mobile

Mobile modal = full viewport. **No centered card on a dimmed scrim** — that's a desktop pattern. On 360–430pt viewports, full-screen reads cleaner and gets out of the way of one-handed thumb interaction.

```
        ┌──[ Modal · full viewport ]────────────────┐
        │                                           │
        │  ✕                                        │   header (close)
        │                                           │
        │                                           │   space-8 (40pt) top
        │       (optional icon · 56pt)              │
        │                                           │
        │                                           │   space-6 (24pt) icon→title
        │       Confirm send                        │   text-2xl font-semibold
        │                                           │
        │                                           │   space-3 (12pt) title→body
        │       You're sending 5 000 000 UZS to     │   text-base font-normal
        │       Wang Lei via Alipay. Recipient      │
        │       gets 3 600.00 CNY at the locked     │
        │       rate.                                │
        │                                           │
        │                                           │
        │                                           │
        │  ───────────────────────────────────      │
        │                                           │
        │      [ Confirm send 5 000 000 UZS ]       │   primary CTA · lg · w-full
        │                                           │
        │      [ Edit details ]                     │   secondary CTA · md · w-full
        │                                           │
        └───────────────────────────────────────────┘
                                                    ↑
                                              safe-area-bottom
```

| Slot | Token / value |
|---|---|
| Container | `bg-card` — full viewport, no border, no radius |
| Close affordance (top-left) | lucide `<X>` 24pt in 44pt tap-area, top-left at `space-4` (16pt) padding from edges |
| Optional icon (above title) | 56pt visual; success/danger/warning context-appropriate |
| Title | `text-2xl font-semibold` (22pt at default scale) — slate-900 / slate-100 |
| Body | `text-base font-normal` (16pt) — slate-700 / slate-300, max-width `~290pt` for readable line length on 360pt viewports |
| Title → body gap | `space-3` (12pt) |
| Body block padding (X) | `space-5` (20pt) on either side; centered within viewport |
| CTA stack (mobile) | Vertical, primary on top, secondary below; both `w-full` |
| CTA stack gap | `space-3` (12pt) between buttons |
| CTA size | `lg` for primary (56pt), `md` for secondary (48pt) per [`button.md`](../primitives/button.md) |
| CTA stack padding (above safe-area) | `pb-{safe-area-bottom + space-4}` |
| Top decoration / illustration (optional) | up to 30% viewport height; image / lottie / illustration |

## States

| State | Treatment |
|---|---|
| `closed` | not rendered |
| `opening` | content fades in over `duration-base` (220ms), `ease-standard`; modal slides up subtly (`translateY(8px)` → `0`) |
| `idle` | rendered, focus trapped on first focusable element |
| `pending` (CTA in flight) | primary button shows loading; cancel button stays clickable; `aria-busy="true"` on dialog |
| `closing` | reverse of opening |
| `error` (CTA failed) | inline error block above CTAs sourced from `error_codes`; primary button re-enables; user retries or cancels |

## Token consumption summary

| Surface | Token |
|---|---|
| Container | `bg-card` (white light / slate-900 dark) |
| Title | `text-2xl font-semibold` (22pt) |
| Body | `text-base font-normal` |
| Icon (above title) | 56pt — variant-aware (`success-600` / `warning-600` / `danger-600` / `--primary`) |
| Close button | lucide `<X>` 24pt in 44pt tap-area |
| Padding (X) | `space-5` (20pt) on body; `space-4` (16pt) on header close |
| Bottom action area | `pb-{safe-area + space-4}` |
| Motion | `duration-base` (220ms), `ease-standard` |
| Backdrop | none — modal is full-screen |

## Composition rules

| Pattern | Rule |
|---|---|
| Modal opening from a sheet | Allowed — modal pushes the sheet to background; closing modal returns to sheet |
| Modal opening from a tab | Modal hides tab bar; closing modal returns to tab |
| Modal with embedded form | Forbidden — that's a screen, not a modal. Modal is for confirmation, not data entry beyond a single textarea (e.g. "Reason for removal") |
| Modal with multiple steps | Forbidden — use a screen flow with a back affordance. Modals don't paginate |
| Modal with both primary and secondary CTAs at top | Bottom-stack only on mobile — top affordances reserved for close-X |
| Toast above modal | Toasts surface above modal; verify they don't cover primary CTA |
| Sheet above modal | Forbidden — modal is the heavier surface; nest the other way |

## Use cases (canonical)

| Trigger | Variant | Title | Body | Primary CTA | Secondary CTA |
|---|---|---|---|---|---|
| Confirm send-money submission | `confirm` | "Confirm send" | "You're sending 5 000 000 UZS to Wang Lei via Alipay. Recipient gets 3 600.00 CNY at the locked rate." | "Confirm send 5 000 000 UZS" (`primary lg`) | "Edit details" (`secondary md`) |
| Remove a saved card | `destructive` | "Remove card?" | "Visa •••• 4242 will be removed. You can re-add it later via 3DS." | "Remove" (`destructive lg`) | "Cancel" (`secondary md`) |
| Sign out | `destructive` | "Sign out?" | "You'll need to sign in again to access ZhiPay." | "Sign out" (`destructive lg`) | "Cancel" (`secondary md`) |
| Discard draft | `destructive` | "Discard draft?" | "We'll lose the recipient and amount you entered." | "Discard" (`destructive lg`) | "Keep editing" (`secondary md`) |
| MyID expiry imminent | `info` | "MyID expiring in 3 days" | "Re-verify by May 11 to keep your tier-2 limits." | "Re-verify with MyID" (`primary lg`) | "Remind me later" (`tertiary md`) |
| Tier-2 unlocked (post-MyID success) | `info` | "You're verified" | "You can now send up to 50 000 000 UZS per day and link Visa or Mastercard." | "Continue" (`primary lg`) | none |
| Network error mid-send (`PROVIDER_UNAVAILABLE`) | `info` | "We couldn't reach Alipay" | "We've saved your transfer. We'll send when service is back." | "Got it" (`primary lg`) | none |
| Sanctions review (`SANCTIONS_HIT`) | `info` (calm review per [`error-ux.md`](../../../.claude/rules/error-ux.md)) | "We're reviewing this transfer" | "We'll notify you within 24 hours." | "OK" (`primary lg`) | none |

**Sourcing rule**: error / compliance modal copy comes from `error_codes` per [`error-ux.md`](../../../.claude/rules/error-ux.md). Modals never invent error copy.

## Accessibility

| Concern | Rule |
|---|---|
| Focus trap | Modal traps focus; Esc closes (except for `dismissible: false`); first focusable element receives focus on open |
| Initial focus | First interactive element — usually close-X if present, else primary CTA. **For destructive variants, initial focus moves to secondary CTA ("Cancel")** so users don't accidentally confirm destruction |
| Screen reader | `role="dialog"` `aria-modal="true"` `aria-labelledby="title"` `aria-describedby="body"` |
| Tap target | Close-X 24pt in 44pt; CTAs 48pt (md) / 56pt (lg) |
| Color-only signals | Variant icon (success / warning / danger) + label color + button color — multi-signal |
| Reduced motion | Slide replaced with opacity-only fade |
| Background | Underlying screen `aria-hidden="true"` while modal is open |
| Keyboard | Esc closes (when dismissible); Tab cycles within modal; Enter activates focused button |
| Dynamic type | Title / body / CTAs all reflow at 200% — modal is full-screen so no clipping risk |

## Localization

| Slot | Key pattern |
|---|---|
| Title | `mobile.<surface>.<screen>.modal-<id>.title` or `common.errors.<CODE>.title` for error-sourced |
| Body | `mobile.<surface>.<screen>.modal-<id>.body` or `common.errors.<CODE>.body` |
| Primary CTA | `mobile.<surface>.<screen>.modal-<id>.cta-primary` |
| Secondary CTA | `mobile.<surface>.<screen>.modal-<id>.cta-secondary` |
| Close aria-label | `common.modal.dismiss.aria-label` |

- Russian title runs 15–25% longer; full-screen layout absorbs the wrap.
- Body should stay under ~3 sentences in any locale — beyond that, the user is processing a screen, not a confirmation.
- Localized currency formatting in body / CTA labels follows [`money-and-fx.md`](../../../.claude/rules/money-and-fx.md).

## Forbidden patterns

| Don't | Required |
|---|---|
| Centered-card-on-dim modal on mobile | Full-screen on mobile |
| Modal with embedded form (multiple inputs) | That's a screen, not a modal |
| Multi-step modal | Use a screen flow with back navigation |
| Auto-dismiss modal | Dismisses only on user action |
| `text-xs` (13pt) anywhere | `text-sm` floor on flowing text; title is `text-2xl`, body `text-base` |
| Hardcoded variant hex | Tokens only |
| Three CTAs in mobile bottom stack | Two max — primary + secondary. Three signals decision paralysis |
| Modal that opens automatically on screen mount ("Welcome back!") | Modals respond to user actions; landings stay clean |
| Inverting primary / secondary positions (cancel on top, destruct on bottom) | Primary action on top, secondary below — predictable |
| Skipping initial-focus-on-cancel for destructive variant | Default focus to safe action — prevents accidental confirms |

## Quick grep to verify (when implemented)

```bash
# Centered-card modal (anti-pattern):
grep -rnE 'Modal.*max-w-\[|Modal.*rounded-' mobile/design/

# 3+ CTAs in modal:
grep -rnE '<Modal[^>]*\n([^<]*<Button){3,}' mobile/

# Auto-open on mount (anti-pattern):
grep -rnE 'Modal.*useEffect.*open|Modal.*open.*onMount' mobile/

# Hardcoded modal hex:
grep -rnE 'Modal.*bg-\[#|Modal.*text-\[#' mobile/
```

## Cross-references

- Admin parity: [`dashboard/src/components/ui/dialog.tsx`](../../../dashboard/src/components/ui/dialog.tsx)
- Tokens: [`colors.md`](../../tokens/colors.md) · [`spacing.md`](../../tokens/spacing.md) · [`radii.md`](../../tokens/radii.md) · [`motion.md`](../../tokens/motion.md)
- Adjacent: [`sheet.md`](./sheet.md) (preferred for non-confirmation actions) · [`banner.md`](./banner.md) (inline non-blocking)
- Error display: [`error-ux.md`](../../../.claude/rules/error-ux.md)
- Money formatting: [`money-and-fx.md`](../../../.claude/rules/money-and-fx.md)
- Layer rules: [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md)
- Lessons: type floor (2026-05-01), error-copy sourcing (error_codes)
