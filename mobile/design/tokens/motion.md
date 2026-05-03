# Motion

Quiet, purposeful motion. Mobile reading distance and one-handed thumb interaction make even subtle motion feel meaningful — so motion gets reserved for state transitions that benefit from continuity, not for decoration.

## Source of truth

Inherits admin's two ease curves and three duration stops. Mobile bumps the **default** duration up one stop (180 → 220ms) because hand interaction reads better at slightly longer fade/slide durations than mouse interaction. Reserved animated patterns are mobile-specific.

- Admin reference: [`dashboard/tailwind.config.ts`](../../../dashboard/tailwind.config.ts) lines 117–125, [`globals.css`](../../../dashboard/src/styles/globals.css) lines 85–89

## Duration tokens

| Token | Value | Use |
|---|---:|---|
| `duration-fast` | 140ms | Press-state on buttons, chip hover, toggle thumb |
| `duration-base` | 220ms | **Default.** Sheet open/close, toast in, banner reveal, segmented switch |
| `duration-slow` | 320ms | Modal open, sheet snap-point change, full-screen page transition |

> Why 220ms default vs admin's 180ms: mobile motion is hand-driven; transitions under ~200ms feel "snappy" on web/mouse but read as "abrupt" or "skipped" on mobile finger contact. 220ms is the sweet spot before motion starts feeling sluggish.

## Easing tokens

| Token | Value | Use |
|---|---|---|
| `ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | **Default.** Enter from offscreen, fade-in, slide-up |
| `ease-emphasized` | `cubic-bezier(0.2, 0, 0, 1.2)` | Button press release ("punch"), card-as-object reveal |
| `ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Sheet close, modal dismiss, leave-to-offscreen |

> Why not Material's `cubic-bezier(0.4, 0, 0.2, 1)`: admin already runs `cubic-bezier(0.2, 0, 0, 1)` for cross-surface consistency. The two curves are visually similar; we keep admin's verbatim so a designer working on both surfaces builds one muscle memory. The brief's reference to Material standard ease is overridden — flagged here so the deviation is explicit.

## Reduced motion

`prefers-reduced-motion: reduce` collapses every transition to **instantaneous** (`0.01ms` per admin's CSS). Honor universally — never override per component.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

The exception: **status-change announcements** (e.g. transfer moving from `processing` to `completed`) still fire as live-region screen-reader updates — the visual skip doesn't disable the semantic update.

## Reserved animated patterns

Each reserved pattern below is the **only** sanctioned use of that motion idiom in the mobile app. Adding a new motion idiom requires a token addition here first.

### 1. Status timeline tick-forward — Transfer detail

When a transfer transitions `processing → completed` while the user is viewing the detail screen, the timeline reveals the new event with a **filled-circle pulse** + `ease-emphasized` 220ms slide-down for the new event row.

- Pulse: `brand-600` filled circle scales 1.0 → 1.4 → 1.0 across 320ms with `ease-standard`. Plays once.
- Slide-down: new event row enters from `translateY(-12px) opacity 0` to `translateY(0) opacity 1` over 220ms with `ease-emphasized`.
- Reduced-motion: no pulse, no slide. Event row appears instantaneously.

### 2. FX rate countdown — Send-money review

The locked-rate badge (`Rate locked for 02:34`) ticks down each second. The seconds digit **fades** rather than slides — slide reads as movement, fade reads as count.

- Old digit: opacity 1 → 0 over 140ms (`duration-fast`), `ease-standard`.
- New digit: opacity 0 → 1 over 140ms, `ease-standard`, no offset.
- At T-15s: badge color shifts from `slate-500` to `warning-700` over 220ms.
- At T-0: rate refetch fires; badge replaces with "Rate updated — review the new rate" with a 220ms fade-cross.

### 3. Card-flip on long-press — Home card-as-object

Long-press (≥ 600ms touch hold) on the home card flips the card front-to-back to reveal the masked card details. **3D flip via `transform: rotateY(180deg)`**, 400ms, `ease-emphasized`.

- Backside surface: same `shadow-hero` brand-tinted shadow; content is masked PAN, scheme logo, expiry.
- Backside is a presentational view only — no actions live there. Tap dismisses with the inverse flip.
- Reduced-motion: replace flip with instant cross-fade at 0.01ms; no rotation.

### 4. Sheet slide-in — Picker / contextual overflow

Sheet enters from off-screen-bottom to its snap-point with `ease-standard`, 220ms. Drag-handle becomes draggable immediately.

- Backdrop scrim: 50% `slate-950` opacity, fades 0 → 1 over 220ms.
- Snap-point change (peek → half → full): 220ms `ease-emphasized` height tween.
- Dismiss: 220ms `ease-exit` slide-down + 180ms scrim fade-out.

### 5. Toast slide-in-from-top

Toast enters from `translateY(-100%)` to `translateY(0)` over 220ms `ease-standard`. Auto-dismiss after **4s** for `success` / `info` toasts; **6s** for `warning`; **manual dismiss only** for `error`. Swipe-right-to-dismiss honors gesture velocity (snap to dismissed if swipe > 30% of width or velocity > 0.5).

### 6. Tab-bar active dot indicator

Switching bottom tabs animates the active-state dot/underline horizontally to the new tab over 220ms `ease-standard`. No icon scale-up, no glow — restraint per [`core-principles.md`](../../../.claude/rules/core-principles.md).

### 7. Segmented-control thumb

The brand-tinted thumb under the active segment slides to the new segment over 180ms `ease-standard` (slightly faster than `duration-base` since the surface is small and motion reads otherwise as drag).

### 8. Skeleton shimmer

Loading skeletons pulse opacity 0.6 → 1.0 → 0.6 over **1600ms** with a gentle `ease-in-out` (admin's `pulse-dot` keyframe). Frequency is intentionally slow — fast shimmer reads as anxiety; slow shimmer reads as patience.

## Forbidden motion patterns

| Don't | Why |
|---|---|
| Parallax (background lags content on scroll) | Reads as gimmick on mobile; breaks one-handed thumb-scroll feel |
| Scroll-triggered reveal animations | Mobile users expect content to be there; sequenced reveal feels withholding |
| Autoplay video / animated hero on launch | Marketing-heavy; conflicts with restrained-fintech aesthetic |
| Spring physics with overshoot > 1.05 | Reads as "playful" / Material You — wrong vocabulary for fintech |
| Particle effects on success (confetti, fireworks) | Forbidden — see [`00-shared-context.md`](../../prompts/00-shared-context.md) "Confetti / celebrations" forbidden list |
| Per-screen unique transitions | Stay inside the 8 reserved patterns; surfaces shouldn't compete on motion |
| Duration > 400ms on user-initiated transitions | Reads as sluggish; users tap again or scroll past |
| Easings other than the three tokens above | One vocabulary across the app |

## Accessibility annotations

- `prefers-reduced-motion`: collapse to instantaneous (above)
- Status change announcements: live-region screen-reader updates fire regardless of visual motion
- No flashing > 3 Hz (per [`accessibility.md`](../../../.claude/rules/accessibility.md))
- No autoplay with motion in onboarding

## Specimen

Render this as part of the foundation pass: a single screen frame showing each reserved pattern in a labeled list with a "Replay" button per pattern, plus a `prefers-reduced-motion` toggle that re-renders all patterns as instant.

## Cross-references

- Reduced-motion rule: [`accessibility.md`](../../../.claude/rules/accessibility.md)
- Forbidden marketing motion: [`00-shared-context.md`](../../prompts/00-shared-context.md), [`core-principles.md`](../../../.claude/rules/core-principles.md)
- Admin parity: [`dashboard/tailwind.config.ts`](../../../dashboard/tailwind.config.ts), [`dashboard/src/styles/globals.css`](../../../dashboard/src/styles/globals.css)
