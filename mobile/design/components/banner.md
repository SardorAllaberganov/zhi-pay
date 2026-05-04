# Banner

Inline status / context message. **Never sticky.** Inline only. Used for tier-upgrade prompts on home, MyID-expiring soon, FX-rate-stale, offline indicator, post-action confirmations.

> Status: **First-pass spec, in review.** Mirrors admin's [`<Banner>`](../../../dashboard/src/components/) shape (the admin's offline / system-event banner pattern). Mobile sticks to **inline only** — no sticky banners — per LESSON 2026-05-02 + 2026-05-03 (chrome stickiness rules).

## Source of truth

- Admin banner pattern: see [`<OfflineBanner>`](../../../dashboard/src/components/system/) and Phase 22b error-state surfaces
- Tokens: [`colors.md`](../../tokens/colors.md), [`typography.md`](../../tokens/typography.md), [`spacing.md`](../../tokens/spacing.md), [`radii.md`](../../tokens/radii.md)
- Error display: [`.claude/rules/error-ux.md`](../../../.claude/rules/error-ux.md)

## Variants

Four tone variants. Tone derives from the **kind** of message, not personal preference.

| Variant | Surface | Icon | Use |
|---|---|---|---|
| `info` | `slate-100` light / `slate-800` dark | lucide `<Info>` `slate-700 / slate-300` | Neutral context — "Tap to learn more", "What does this fee mean?" |
| `success` | `success-50` light / `success-700/30` dark | lucide `<CheckCircle2>` `success-700 / success-600` | Confirmations — "Recipient added", "Card linked" |
| `warning` | `warning-50` light / `warning-700/30` dark | lucide `<AlertTriangle>` `warning-700 / warning-600` | Attention without blocking — "MyID expiring in 7 days", "FX rate may move", "Tier-1 limit at 80%" |
| `danger` | `danger-50` light / `danger-700/30` dark | lucide `<AlertCircle>` `danger-700 / danger-600` | Error states — "Transfer failed", "Card declined", "Sanctions review" |

## Anatomy

```
╭──[ Banner — inline, never sticky · radius-md (12pt) ]──╮
│                                                        │
│  ⓘ   MyID expiring in 7 days                           │
│      Re-verify before May 11 to keep tier-2 limits.    │
│                                                        │
│                                       Re-verify   →    │
│                                                        │
╰────────────────────────────────────────────────────────╯
   ↑   ↑                                          ↑
   icon title (text-sm font-semibold)             optional CTA (Button tertiary, sm)
       body (text-sm font-normal)
```

| Slot | Token / value |
|---|---|
| Container | `radius-md` (12pt), 1pt `--border` of variant 600-stop at 30% opacity |
| Padding (X / Y) | `space-4 / space-3` (16 / 12pt) per [`spacing.md`](../../tokens/spacing.md) |
| Icon | 20pt (`size-5`), variant-700 light / variant-600 dark, `aria-hidden="true"` (paired with text) |
| Icon → text gap | `space-3` (12pt) |
| Title | `text-sm font-semibold` (14pt) — slate-900 light / variant-foreground dark |
| Body | `text-sm font-normal` (14pt) — slate-700 light / slate-300 dark |
| Title → body gap | `space-1` (4pt) |
| CTA (optional) | `<Button variant="tertiary" size="sm">` aligned right, or `<Link>` inline if the action is in-context. Never `primary` — banners aren't call-to-action surfaces |
| Dismiss-X (optional) | lucide `<X>` 16pt in 32pt tap-area, `slate-500`, top-right; only on dismissible banners |
| Stack gap (banner above content) | `space-4` (16pt) before the banner, `space-4` after |

> **Type floor**: title and body are both `text-sm` (14pt) — never `text-xs` per LESSON 2026-05-01.

## States

| State | Treatment |
|---|---|
| `idle` | base palette per variant |
| `dismissible idle` | `idle` + dismiss-X visible top-right |
| `pressed` (whole banner is tappable, e.g. "Tap to learn") | surface darkens by ~6% over `duration-fast`; very rare — banners usually aren't tap-to-navigate |
| `loading` (e.g. "Refreshing FX rate…") | inline `<Loader2>` 16pt replaces the variant icon, label updates to in-progress copy, `aria-busy="true"` |
| `dismissed` | banner removes itself from the layout; surrounding content reflows; `aria-live="polite"` announces "Banner dismissed: {title}" only if dismissal is consequential (rare) |

## Token consumption summary

| Surface | Token |
|---|---|
| Container fill (info / success / warning / danger) | `slate-100` / `success-50` / `warning-50` / `danger-50` (light); variant-700 at 30% opacity (dark) |
| Border | 1pt variant-600 at 30% opacity |
| Icon color | variant-700 light / variant-600 dark |
| Title | `text-sm font-semibold`, slate-900 / slate-100 |
| Body | `text-sm font-normal`, slate-700 / slate-300 |
| Padding | `space-4 / space-3` |
| Radius | `radius-md` (12pt) |
| Stack gap | `space-4` before / after |

## Composition rules

| Pattern | Rule |
|---|---|
| Banner above a card | Banner sits in the page-stack flow; `space-4` (16pt) gap to next card |
| Banner inside a sheet | Banner uses the same anatomy; sheet's own padding owns the side margins |
| Banner with action CTA | Single CTA, right-aligned, `tertiary` or `link` variant. Never `primary` |
| Multiple banners on one screen | Discouraged. If two contexts truly need banners simultaneously, stack them — `space-4` between — but reconsider whether they can merge |
| Banner in app-shell area | Forbidden if it would behave as sticky chrome. Use a ToastBanner / PersistentToast (Components layer) instead — those are different primitives |
| Banner replacing a screen | Forbidden. If the message is screen-blocking, use an EmptyState or a Modal — banners are inline-only |
| Maintenance / outage banner across all screens | Use the `MaintenanceGate` pattern (Patterns layer) — that's a route-level banner, not this primitive |

## Use cases (canonical)

These are the banner moments in the mobile app — keep the language consistent.

| Trigger | Variant | Title | Body | CTA | Dismissible |
|---|---|---|---|---|---|
| `tier_0` user lands on home | `info` | "Verify your phone to start sending" | "It takes a minute — we'll text you a code." | "Verify" → phone-verify flow | no |
| `tier_1` daily-headroom ≥ 80% | `warning` | "Tier-1 daily limit at 82%" | "Verify with MyID for higher limits." | "Verify with MyID" | yes (per session) |
| MyID expiring within 14 days | `warning` | "MyID expiring in 7 days" | "Re-verify before May 11 to keep tier-2 limits." | "Re-verify" | yes (re-emerges next session) |
| MyID expired (`KYC_EXPIRED`) | `danger` | "MyID verification expired" | "You've been moved to tier-1. Re-verify to restore higher limits." | "Re-verify with MyID" | no |
| FX rate stale on review screen (`FX_STALE`) | `warning` | "Rate updating…" | "We're fetching a fresh rate." | inline refresh | no (auto-resolves) |
| Provider outage (`PROVIDER_UNAVAILABLE`) | `info` | "Alipay temporarily unavailable" | "We're confirming with our partner. Try again in a moment." | "Try again" | no |
| Sanctions review (`SANCTIONS_HIT`) | `info` (calm review pattern per [`error-ux.md`](../../../.claude/rules/error-ux.md)) | "We're reviewing this transfer" | "We'll notify you within 24 hours." | none | no |
| Transfer succeeded (in-app confirmation, history landing page) | `success` | "Transfer to Wang Lei completed" | "3 600.00 CNY received via Alipay." | "View receipt" | yes |
| Offline detected | `warning` | "You're offline" | "We've saved your draft. We'll send when you're back." | none | yes (reappears on next event) |
| Card frozen | `warning` | "Card 4242 frozen" | "Contact support to unfreeze." | "Contact support" | no |

**Sourcing rule**: titles and bodies for error / compliance / failure states pull from `error_codes` per [`error-ux.md`](../../../.claude/rules/error-ux.md). Never invent error copy in screens.

## Accessibility

| Concern | Rule |
|---|---|
| Color-only signals | Variant icon is required — color + icon + label trio |
| Icon | `aria-hidden="true"` (label carries meaning) |
| Banner role | `role="status"` for non-blocking info/success; `role="alert"` for danger; warning gets `role="status"` unless it requires immediate user action |
| Live region | `aria-live="polite"` for info/success/warning; `aria-live="assertive"` for danger |
| Tap target (CTA, dismiss) | ≥ 44pt — dismiss-X inflates from 16pt visual to 32pt tap-area + surrounding 12pt of slack |
| Focus | Dismiss-X reaches focus before the CTA; both visibly ringed with `--ring` |
| Reduced motion | Slide-in / slide-out animation falls back to instantaneous |

## Localization

| Slot | Key pattern |
|---|---|
| Title | `mobile.<surface>.<screen>.banner-<id>.title` or `common.errors.<CODE>.title` for error sourcing |
| Body | `mobile.<surface>.<screen>.banner-<id>.body` or `common.errors.<CODE>.body` |
| CTA | `mobile.<surface>.<screen>.banner-<id>.cta` |
| Dismiss aria-label | `common.banner.dismiss.aria-label` ("Dismiss banner" / "Bannerni yopish" / "Скрыть баннер") |

- Russian title runs 15–25% longer — banners can wrap title to two lines but never four; if a translation runs over, shorten the source.
- Date references (e.g. "May 11") follow `users.preferred_language` per [`localization.md`](../../../.claude/rules/localization.md).

## Forbidden patterns

| Don't | Required |
|---|---|
| `position: sticky` / `position: fixed` on a banner | Inline only — chrome stickiness reserved for filter bars / bulk-action bars / right-rail action panels (LESSON 2026-05-02 + 2026-05-03) |
| `text-xs` (13pt) on title or body | `text-sm` floor — LESSON 2026-05-01 |
| `primary` button as the banner CTA | `tertiary` or `link` only — banners are context surfaces, not call-to-action |
| Multiple equally-loud banners on one screen | Pick the one that matters most; demote others to inline helpers |
| Inventing error copy | Pull from `error_codes` per [`error-ux.md`](../../../.claude/rules/error-ux.md) |
| Color-only signal (red border, no icon) | Icon + color + label trio |
| Hardcoded variant hex (`bg-[#fef2f2]`) | `bg-danger-50` token |
| Banner that disappears on its own with no signal | Auto-dismiss is for Toasts. Banners persist until dismissed or the underlying state changes |

## Quick grep to verify (when implemented)

```bash
# Sticky / fixed banners — LESSON 2026-05-02 + 2026-05-03:
grep -rnE 'Banner.*sticky|Banner.*fixed' mobile/

# text-xs in banner — LESSON 2026-05-01:
grep -rnE 'Banner.*text-xs' mobile/

# Hardcoded banner hex:
grep -rnE 'Banner.*bg-\[#|Banner.*text-\[#' mobile/

# Primary CTAs in banners:
grep -rnE 'Banner[^>]*\n[^<]*<Button[^>]*variant="primary"' mobile/
```

## Cross-references

- Tokens: [`colors.md`](../../tokens/colors.md) · [`spacing.md`](../../tokens/spacing.md) · [`typography.md`](../../tokens/typography.md) · [`radii.md`](../../tokens/radii.md)
- Primitives: [`button.md`](../primitives/button.md) · [`icon.md`](../primitives/icon.md)
- Error UX (canonical copy): [`error-ux.md`](../../../.claude/rules/error-ux.md)
- KYC tier banners: [`kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md)
- Layer rules: [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md)
- Lessons: type floor (2026-05-01), no-sticky-chrome on tabbed/inline surfaces (2026-05-02 + 2026-05-03)
