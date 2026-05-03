# Aesthetic References — ZhiPay Mobile

> Visual + interaction direction for the mobile app. These are the apps and
> reference pieces the design language pulls from. Every prompt in
> `mobile/prompts/` should produce work that feels at home alongside these.

## North-star direction (one line)

**Wise's clean restraint × Apple Pay's surface materiality × Behance fintech's
modern composure** — a remittance app that reads as **trustworthy, fast,
elegant, and quietly confident**. No flashy gradients shouting for attention;
no playful illustrations; no heavy chrome. Money, FX rate, and recipient are
the heroes. Everything else gets out of the way.

## Reference apps

### Wise (formerly TransferWise) — primary anchor

**What we steal**:
- Generous whitespace; one decision per screen
- Big typography for currency amounts (sometimes 36–48pt)
- Currency code rendered next to the number, never as a symbol prefix
- Live FX rate displayed inline, with the lock-in moment made obvious
- Step-by-step send flow that feels like a conversation, not a form
- Fee transparency: every line of the breakdown visible, totals bolded
- Status pages that are calm, not alarming — timelines + clear next step

**What we don't steal**:
- Wise's brand-green-dominant palette — we use ZhiPay brand-tinted blues
- Multi-currency wallet metaphor — we're a single-corridor app (UZ→CN), not a
  wallet platform

### Apple Pay / Apple Wallet — surface treatment

**What we steal**:
- Card-as-physical-object metaphor (gradient + brand mark + masked PAN, slight
  parallax tilt on long-press)
- Glass / blur surfaces on overlays (sheets that respect the system blur)
- Restrained motion — every transition exists for a reason, never decorative
- System-respectful: honors light/dark mode, dynamic type, reduce-motion
- Receipt / detail screens use clear hierarchy: icon + title + amount + meta
- Privacy-by-default: amounts blurred until biometric unlock (consider for
  history screen)

**What we don't steal**:
- iOS-only motion patterns that don't translate to Android (no swipe-down-to-
  dismiss-as-the-only-affordance)
- Apple's specific San Francisco font (we'll use a free system-stack-friendly
  alternative — Inter or similar, locked at the foundation pass)

### Behance — fintech crypto app reference (user-supplied)

**Reference**: behance.net/gallery/243705045 (Fintech Product Design — Crypto
App / Web UI / Branding)

**What we steal**:
- Modern fintech composure — no playful illustrations, no skeuomorphic
  banking icons; clean geometric primitives only
- Card surfaces with subtle gradient depth (not flat, not glossy — somewhere
  in between, like brushed glass)
- Real-time data feel — small motion accents on amount changes, FX-rate
  ticks, and status transitions (subtle, never busy)
- Web3-era density: KPI tiles + sparkline + headline number stacked tightly
  but with breathing room
- Bold typography hierarchy — one giant number per screen, supporting text
  small and quiet

**What we don't steal**:
- Any crypto-specific iconography (circles labeled BTC / ETH, candle charts,
  token-list density). ZhiPay is fiat remittance, not crypto.
- Dark-mode-first composition — we ship light + dark, neither is canonical.
- Red as a primary accent — **forbidden** in our brand palette since red is
  reserved for `danger` semantic only (rejected transfers, sanctions hits,
  destructive confirms). Brand stays blue-anchored per `tailwind.config.ts`
  and `.claude/rules/` (`brand-50` → `brand-950`).

## What we do NOT want

- ❌ Playful illustrations of stick figures handing money to each other
- ❌ Marketing-heavy onboarding with rotating slides + "Welcome to ZhiPay!"
- ❌ Confetti / celebrations on transfer completion (calm acknowledgement
  is sufficient — see `transfer_state_machine.md` for the canonical states)
- ❌ Bottom-sheet-everywhere — sheets are reserved for contextual choice; the
  marquee path uses full-screen pages
- ❌ Excessive use of brand color — brand is the accent, slate / muted is the
  surface. Brand-tinted only on primary actions, status (sparingly), and the
  card-as-object metaphor on the home screen.
- ❌ Animated splash screens on every app launch
- ❌ Skeuomorphic textures (paper / leather / wood / felt)
- ❌ Locale-icon-flag overlays on the language picker (use language names in
  their native script: `O'zbek` / `Русский` / `English`)

## Color palette inheritance

Mobile inherits the admin dashboard's brand anchor:

| Token | Use |
|---|---|
| `brand-50 → brand-950` | Primary accent, status `processing`/`completed`, key buttons |
| `slate-50 → slate-950` | Neutral surfaces, text, dividers |
| `success-50 / 600 / 700` | `completed` transfers, `passed` KYC, `active` cards |
| `warning-50 / 600 / 700` | `reversed` transfers, `expired` KYC, `frozen` cards, tier-upgrade prompts |
| `danger-50 / 600 / 700` | `failed` transfers, sanctions, destructive confirms |

The mobile-specific hue is: **brand carries more weight visually than on the
admin dashboard** (the admin uses brand only for accents; mobile uses brand
on the home-screen card surface, the headline amount, and the primary action).

## Typography

- Sans-serif, system-friendly stack (Inter as the default; SF Pro / Roboto
  fallback per OS)
- 13px floor matching admin (no sub-13 on body text; chips and labels can use
  13)
- Mobile-specific scale will lift the display sizes:
  - Display 1 (hero amounts): 36pt
  - Display 2 (page titles): 28pt
  - Heading: 22pt
  - Body: 16pt
  - Body small: 14pt
  - Label / chip: 13pt

Final scale locks in the foundation pass.

## Motion

- Honors `prefers-reduced-motion` per `.claude/rules/accessibility.md`
- Default duration 200–250ms; default easing `cubic-bezier(0.4, 0, 0.2, 1)`
- Reserved animated moments:
  - Status transition on the transfer-detail screen (filled circle ticks
    forward as the status advances — see admin's `<StatusTimeline>`)
  - FX rate countdown on the review screen
  - Card flip on the home screen (long-press to see masked PAN ↔ default
    front face)
- No autoplaying video, no scroll-triggered parallax, no flashing > 3 Hz
