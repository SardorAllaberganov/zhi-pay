# ZhiPay — Mobile App Design Brief

> Paste this as the kickoff message in Claude Design. Attach `rules-pack.md` as the reference document.

---

## 1. Product, in one paragraph

**ZhiPay** is a UZ → CN cross-border remittance mobile app. Senders in Uzbekistan use a UzCard or Humo card to send UZS, and the recipient receives CNY in Alipay or WeChat Pay. KYC runs through Uzbekistan's national e-ID service (MyID); KYC tier drives every limit decision. FX rate is **locked at transfer creation** and never recomputed mid-flight. Money is stored in minor units (UZS in tiyins, CNY in fen) and only divided by 100 at display time. The app launches in **Uzbek (default)**, **Russian**, and **English**. Visa / Mastercard exist in the schema but are **out of scope for v1 mock data** — design with UzCard and Humo only.

## 2. Personas (PRD §3)

- **Trader (SME)** — buys goods from Yiwu / Guangzhou suppliers, pays via Alipay business. High limits, fast settlement, predictable rate.
- **Migrant family** — has relatives studying or working in China. Recurring transfers, low fees, saved recipients.
- **Tourist** — traveling to China, needs to top up Alipay / WeChat. One-shot, no friction, rate transparency.
- **Student** — studying in China, receives funds from parents. Low minimum, occasional use.

## 3. The design system already exists in Figma

**Figma file** (everything built — read it directly):
`https://www.figma.com/design/p8pxXYApMNCpzQn0XkoIw9/ZhiPay---v0.1--Project-`

On page **`❖ Components`** you will find:

- **Tokens** (Variables): 33 color primitives (brand 50-950, slate 50-950, success/warning/danger 50/500/900, base white/black) · 19 semantic aliases (`color/background`, `color/foreground`, `color/primary`, `color/destructive`, `color/border`, `color/ring`, etc.) with **Light + Dark modes** · 13 spacing stops (`space/1` … `space/13`) · 4 radius stops (`radius/sm/md/lg/pill`) · 3 motion durations.
- **Text Styles**: `text/display-1` (44/700) · `text/display-2` (32/700) · `text/heading` (22/600) · `text/body` (16/400) + `text/body-medium` + `text/body-semibold` · `text/body-sm` (14/400) + `text/body-sm-medium` + `text/body-sm-semibold` · `text/label` (13/500 UPPER +0.04em) · `text/mono/body` · `text/mono/body-sm` · `text/mono/label`. **Floor: 13px (`text/label`).** Body text is 14–16. Buttons and flowing meta never below 14.
- **Effect Styles**: `effect/shadow-{sm,md,lg,hero}/{light,dark}`.
- **20 component sets** + **19 individual lucide icon components**. Use these — **do not redraw primitives**:

| Layer | Component sets |
|---|---|
| Primitives | `Button` (5 variants × 3 sizes; `Show leading icon` / `Leading icon` / `Show trailing icon` / `Trailing icon` INSTANCE_SWAP props) · `Chip / Status` (10 statuses × 3 sizes) · `Chip / Tier` (3 × 3) · `Chip / Count` (3 digits × 3 tones × 2 borders) · `Input / Field` (Text / TextArea / Phone / Search × Default / Focused / Error; Search has `Leading icon` + `Trailing icon` INSTANCE_SWAP) · `Input / Otp` (4-box / 6-box × 3 states) · `Input / NumberPad` (Locale Comma / Period; `Delete icon` INSTANCE_SWAP) · `Avatar / Initials` (5 colors × 3 sizes) · `Avatar / Photo` (3 sizes) |
| Components | `Card` (Resting / Header-Body / Footer-Action / Flat / Interactive / Card-as-Object) · `Banner` (Info / Success / Warning / Danger) · `Headline Number` (Display / Hero / Inline) · `List Row` (Single-line / Two-line / Avatar / Toggle / Selectable) · `Toast` (Success / Info / Warning / Error) · `Segmented control` (InlineFlex / FullWidth × Sm / Md / Lg) · `Tab bar` (4 tabs · ActiveTab=Home / Send / History / More) · `Sheet` (Peek 240 / Half 480 / Full 700) · `Modal` (Confirm / Destructive / Info — full mobile viewport 360 × 760) · `Status timeline` (Processing / Completed / Failed / Reversed) · `Scheme logo` (UzCard / Humo / Alipay / WeChat × Sm / Md / Lg — Visa / MC excluded for v1) |
| Icons | 19 lucide components: `Send · ArrowDownToLine · CreditCard · User · ShieldCheck · Clock · ArrowRight · Check · Info · CheckCircle2 · AlertTriangle · AlertCircle · ChevronRight · Search · X · Delete · Lock · Home · Menu` |

**Composition rule**: Tokens → Primitives → Components → Patterns → Screens → Flows. Imports flow strictly downward — Patterns may consume Primitives + Components + Tokens; Screens may consume everything below; Patterns may NOT cross-import other Patterns. (Full hierarchy and the "what goes where" matrix are in `rules-pack.md` §10.)

## 4. Constraints — these are non-negotiable

(All elaborated in `rules-pack.md`. Quick reminders:)

- **Locale: `uz` first.** Every text element references an i18n key (`mobile.send-money.review.cta-confirm`), never a literal string. Russian runs 15–25% longer than Uzbek — test layouts at the longest translation. Number grouping: space (uz/ru) vs comma (en); decimal: comma vs period.
- **Money**: backend stores `bigint` minor units (UZS tiyins, CNY fen); UI displays divided by 100 with locale separator + currency code. Never display raw `bigint`. Never display floats. Send-money review must show **client_rate · fee_uzs · fx_spread_uzs · total_charge_uzs · amount_cny · "rate locked" disclaimer**.
- **KYC tiers**: `tier_0` cannot transfer (visible upgrade path) · `tier_1` 5M / 5M / 20M UZS (per-tx / daily / monthly), 2 cards, no Visa / MC · `tier_2` 50M / 50M / 200M UZS, 5 cards, full access. **Limit-exceeded is an upgrade moment, not a hard block** — show the localized error + the next-tier upgrade CTA.
- **Cards**: UzCard / Humo only in v1 mock data. Visa / MC cards in the schema but not in any mock list, picker, or scheme tile. Masked PAN format: first 6 + 4 dots + last 4 (`4242 42•• •••• 4242`). Full PAN, full PINFL, full document number **never** shown — not on tap-to-reveal, not in admin.
- **Status machines** are canonical — never invent states. Transfer: `created → processing → completed | failed`; `completed → reversed`. KYC: `pending → passed | failed | expired`; `passed → expired`. Card: `active ↔ frozen`; `active → expired | removed`.
- **Errors**: pull from `error_codes` (15 codes — see `rules-pack.md` §6). Title from message_*, body from suggested_action_*, retry CTA visible only when `retryable=true`. Compliance category (e.g. `SANCTIONS_HIT`) uses calm-review pattern — no AML logic exposed, no retry, no reason.
- **Accessibility (WCAG 2.1 AA)**: contrast ≥ 4.5:1 body / ≥ 3:1 large + non-text · tap targets ≥ 44 × 44 pt · dynamic type to 200% · focus order documented · screen-reader labels documented · honor `prefers-reduced-motion` · never rely on color alone for status.
- **Privacy**: full PAN / full PINFL / full document number never appear in UI — even briefly, even on admin.

## 5. Cover all states

Every screen ships with **six states**: `empty · loading · success · error · offline · partial-data`. Plus tier variants (`tier_0` / `tier_1` / `tier_2`) where the screen's behavior gates on tier. No screen is "done" until every state is drawn.

## 6. The task

Design **ZhiPay mobile v1**, layer by layer, in this order:

### Phase 1 — Patterns layer (compose Primitives + Components against domain rules)

Build these patterns first; each is a reusable composition that screens will instance:

| # | Pattern | Composes | Drives which screens |
|---|---|---|---|
| 1 | **FX-quote breakdown** | Card + Headline Number + List Row + Banner | Send-money review |
| 2 | **Rate-lock countdown** | Banner + Chip + animated time string | Send-money review · Receipt |
| 3 | **Send-money review block** | Pattern 1 + Pattern 2 + Card-as-Object + Button | Send-money review |
| 4 | **KYC step** (phone OTP, MyID hand-off, MyID success) | Headline Number + Input/Otp + Button + Banner | Onboarding · Tier upgrade |
| 5 | **Tier-gating banner** (limit-exceeded → upgrade) | Banner + Button | Send-money entry · Card add · Recipient pick |
| 6 | **Recipient picker** | List Row + Avatar + Chip + Search input | Send-money flow |
| 7 | **Transfer status timeline composition** (with current-step pulse + meta strip) | Status timeline + Chip + List Row | Transfer detail · Receipt |
| 8 | **Card row** (masked PAN + scheme logo + status + default badge) | List Row + Scheme logo + Chip + Avatar | Card management · Send-money card picker |
| 9 | **Empty state block** (illustration + heading + body + primary CTA) | Headline Number + Button | every list / detail screen |
| 10 | **Error state block** (icon + title + body sourced from `error_codes` + retry / nav CTA) | Banner + Button | every screen's error state |

For each pattern: full Figma frame on the `❖ Components` page (or a new `🧬 Patterns` page) + a 1–2 page spec ("what it composes / variant axes / variable bindings / states / a11y notes").

### Phase 2 — Screens layer (per surface, all states + tier variants)

The 11 marquee surfaces from PRD §6:

1. **Onboarding** — splash · phone entry · OTP · MyID prompt · MyID hand-off · MyID success · tier_1 home (skipped MyID).
2. **Home** — `tier_0` ("Verify to start") · `tier_1` (limited home + upgrade nudge) · `tier_2` (full home with balance, recent recipients, recent transfers, stories).
3. **Send-money flow** (5 screens): destination pick · recipient pick · amount entry (with NumberPad) · review (uses Pattern 3) · 3DS in-app WebView.
4. **Receipt** — completed · processing · failed (per error code) · reversed.
5. **History** — list with filters (date range · destination · status) · empty · paginated · search.
6. **Transfer detail** — full status timeline · FX breakdown · receipt actions · sheet for "Reverse this transfer" CTA (visible when `completed`).
7. **Card management** — list (uses Pattern 8) · add card flow (form · 3DS WebView · success) · card detail (masked PAN, status, last used, freeze action) · `tier_1` "Add Visa / MC" upgrade gate.
8. **Recipients** — list · add new · edit favorite / nickname · delete confirm.
9. **Notifications** — feed · per-item (transfer / KYC / promo / compliance) · empty.
10. **Settings** — language picker (uz / ru / en) · device trust · sign out · about · legal links.
11. **MyID re-verify** — when `kyc_verifications.expires_at` passes (soft demote to tier_1, banner everywhere).

For each screen:
- Frame on a per-surface page (`📱 Onboarding`, `📱 Send-money`, etc.) at iPhone 14 Pro size (393 × 852).
- All 6 generic states.
- Tier variants where applicable.
- Both light AND dark mode (Variables already wired).
- Spec MD: states list · variant axes · i18n keys list · acceptance criteria (Gherkin or checklist) referencing schema fields / state-machine states / error codes.

### Phase 3 — Flows layer (mermaid + frame-to-frame prototype links)

Wire the screens against the canonical mermaid diagrams in `rules-pack.md` §11:
- Onboarding flow
- Card linking flow
- Transfer send flow (golden path)
- Transfer failure recovery
- KYC re-verification

Each flow = a Figma board view of the participating frames + arrows + a flow.md doc that mirrors the mermaid sequence.

## 7. How to deliver — work in cadence

**Don't ship the whole app in one shot.** Work iteratively, one artifact per turn:

1. Start with **one pattern** (recommend pattern #1: FX-quote breakdown). Draft Figma frame + spec MD. Pause for review.
2. After approval, do the next pattern. Repeat through all 10.
3. Then start screens — pick the highest-value surface first (recommend **send-money review screen**, since it exercises 4 patterns at once). Pause for review.
4. Continue surface-by-surface.
5. After all screens are drawn, draw flows (Phase 3) last — those are compositional and depend on the screens existing.

For every output, also list:
- Which Primitives / Components / Patterns / Tokens / Text Styles / Effect Styles you instanced.
- Which states / tiers / locales are drawn.
- Which i18n keys are referenced (don't invent values for `ru` / `en`; mark as `[needs translation]` and lock `uz` first).
- Which deviations from the rules you took — and why.

## 8. Quality bar — before you mark anything "done"

Run through the **design review checklist** in `rules-pack.md` §9. Anything not checked = not done:

- All 6 states covered.
- All KYC tiers handled where relevant.
- All money in localized format with currency code.
- Send-money review shows the full breakdown.
- Masked PAN only.
- Every text is an i18n key.
- Every error pulls from `error_codes`.
- Contrast verified.
- Tap targets ≥ 44 pt.
- Dynamic type tested at 200%.
- Focus order documented.
- No PII leakage anywhere.

## 9. What to ask back

If anything in this brief or `rules-pack.md` is ambiguous, ask before drawing — don't invent. Specifically watch out for:
- States not in the canonical state machines → propose a model update before designing.
- Copy that doesn't have an obvious i18n key → propose a key name following the `<surface>.<screen>.<element>` convention.
- Components that don't exist in the Figma library → flag, propose the addition, get approval before adding.

---

**Start here**: Read `rules-pack.md`. Then propose a frame for **Pattern 1 (FX-quote breakdown)** plus its spec MD. Pause for review.
