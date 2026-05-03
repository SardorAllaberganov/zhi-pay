# ZhiPay Mobile — Shared Context (paste into every design prompt)

> Stable canon. Every Claude design conversation starts by reading this in
> full. Surface-specific prompts pile on top — they never contradict.

## Project

**ZhiPay** — a remittance app moving money from **Uzbekistan (UZS)** to
**China (CNY)**. The user is a UZ resident sending money to a CN-resident
recipient (family / friend / supplier). Source instruments are local cards
(UzCard, Humo). Destination instruments are Alipay or WeChat Pay.

**This brief is for the end-user mobile app**, not the internal admin
dashboard. The admin dashboard is already built (web, React, separate
surface).

## The user

Primary persona: a working-age UZ resident, fluent in Uzbek and likely
Russian, comfortable with smartphones (most likely Android, often a mid-tier
device, sometimes used in low-bandwidth conditions). Sends money 1–4 times a
month for family support, education, e-commerce purchases, or wholesale-trade
payments.

What they care about: **knowing the exact CNY their recipient gets**, not
hidden fees, not having to guess a "current rate." They've used Western Union
or hand-carry before and have been burned by fees that arrived as surprises.

## The corridor

| | |
|---|---|
| Source country | Uzbekistan |
| Source currencies | UZS (Uzbekistan som) |
| Source instruments (v1) | UzCard, Humo |
| Source instruments (deferred) | Visa, Mastercard — paused, do not include in v1 mock data |
| Destination country | China |
| Destination currency | CNY (Chinese yuan / renminbi) |
| Destination rails | Alipay, WeChat Pay |
| KYC | Uzbekistan **MyID** (national e-ID) |
| Languages live | `uz` (default), `ru`, `en` |
| Languages planned | `kz` (NOT `kk`), `kaa` (Karakalpak) — out of v1 scope |

## The KYC tier system (drives every limit)

Every screen that involves money, cards, or compliance must respect the
user's tier. Tier is the single biggest gate in the product.

| tier | how attained | per-tx (UZS) | daily (UZS) | monthly (UZS) | max cards | Visa/MC? |
|---|---|---:|---:|---:|---:|:---:|
| `tier_0` | just signed up, no phone verification | 0 | 0 | 0 | 1 | no |
| `tier_1` | phone verified via SMS OTP | 5,000,000 | 5,000,000 | 20,000,000 | 2 | no |
| `tier_2` | full MyID verified | 50,000,000 | 50,000,000 | 200,000,000 | 5 | yes (deferred) |

**Numbers are placeholders** pending Compliance sign-off — designs should
display them via tokens (or the schema's actual fields), not hard-code.

### Tier UX rules (locked)

- `tier_0` cannot transfer. Home screen must show the upgrade path: phone
  verification → MyID. Send-money entry points are visible but disabled with
  a clear "Verify to send" CTA.
- Tier headroom must be visible on the send-money entry screen as a meter
  (used / total, with percentage). Color the meter `warning` when ≥ 80% used
  and `danger` when ≥ 100% (i.e. the proposed transfer would overflow). Hide
  the row entirely on `tier_0` (since it's 0/0).
- Limit-exceeded is **an upgrade moment**, not a hard block. When
  `LIMIT_DAILY_EXCEEDED` / `LIMIT_MONTHLY_EXCEEDED` triggers, surface the
  next-higher-tier upgrade as the CTA (when applicable). When
  `LIMIT_PER_TX_EXCEEDED` triggers, suggest splitting the transfer.
- MyID expiry → user demoted to `tier_1`. Banner: "MyID verification expired
  — re-verify to restore higher limits." Linked Visa/MC cards transition to
  `frozen`.

## Status state machines (NEVER invent states)

### Transfer

`created` → `processing` → `completed` | `failed` | `reversed`

### KYC

`pending` → `passed` | `failed` | `expired`

### Card

`active` → `frozen` | `expired` | `removed`

If a design needs a state that doesn't exist in the canonical state machine,
**propose a model + state-machine update first**. Update the canonical doc,
then design against it. Never invent a state in the UI.

Cross-reference: `docs/mermaid_schemas/transfer_state_machine.md` /
`kyc_state_machine.md` / `card_state_machine.md`.

## Money rules (locked, non-negotiable)

- Backend stores amounts in **smallest currency unit** (`bigint`):
  UZS in **tiyins** (1 UZS = 100 tiyins), CNY in **fen** (1 CNY = 100 fen).
- UI **always** divides by 100 at display time. **Never store, pass, or
  render floats.**
- Currency code follows the amount, separated by a non-breaking space.
  `5 000 000.00 UZS` (not `UZS 5,000,000`).
- Group separator + decimal separator follow locale:
  - `uz` / `ru`: space group, comma decimal → `5 000 000,00 UZS`
  - `en`: comma group, period decimal → `5,000,000.00 UZS`
- Backend already enforces flooring on FX conversion
  (`amount_cny = floor(amount_uzs × client_rate)`). UI never rounds.

### FX rate transparency

Send-money review must render this exact line set (sourced from
`transfers`, `transfer_fees`, `fx_rates`):

```
You send                  5 000 000.00 UZS
Service fee                  50 000.00 UZS  (1.0%)
FX spread                     5 000.00 UZS
─────────────────────────────────────────
Total charge              5 055 000.00 UZS
─────────────────────────────────────────
Recipient gets                3 600.00 CNY
Rate                  1 CNY = 1 404.17 UZS  (locked)
```

- Rate-lock countdown is mandatory when the FX quote has a TTL: e.g.
  `Rate locked for 02:34`. When countdown hits 0, fetch a new quote and show
  a diff if the rate moved beyond a threshold.
- **Never silently substitute a new rate.**
- After `transfer.status = processing`, the locked rate is **immutable** for
  that transfer. Detail screens display the historical `client_rate`, not
  the current market rate.

## Privacy invariants

- **Full PAN, full PINFL, full document number never shown in UI.** Not on
  tap-to-reveal, not in receipt screens, not in support chat handoffs.
- Card display: first 6 + 4 dots + last 4 → `4242 42•• •••• 4242`.
- PINFL display: `••••••••••<last4>` (10 dots + last 4).
- Document number: `••••••<last6>` (mask all but last 6).
- The `linked_cards.masked_pan` field comes formatted as `first6+last4` from
  the backend — UI inserts dots / spacing for visual rhythm only.

## Error UX

User-facing error messages come from the `error_codes` table — designs
**never invent error copy**. Every code carries: `code`, `category`,
`message_uz` / `message_ru` / `message_en`, `retryable` (bool),
`suggested_action_uz` / `suggested_action_ru` / `suggested_action_en`.

Component contract:

```
[icon by category]
[localized title — derived from message_*]
[localized body / suggested_action]
[primary CTA — only if retryable=true OR a navigation makes sense]
[secondary CTA — "Contact support" or "Get help"]
```

Category-specific patterns:

| Category | Pattern |
|---|---|
| `kyc` | Route to MyID flow; never expose internal KYC plumbing |
| `acquiring` | Suggest another card; show card-management deep link |
| `fx` | Refresh quote inline; don't navigate away |
| `provider` | Calm "We're confirming this" — no scary error face |
| `compliance` | Calm "We're reviewing this" — never expose AML logic, no retry |
| `system` | Generic apology + "Try again" + support link |

For sanctions / AML hits: body copy "We're reviewing this transfer for
compliance. We'll notify you within 24 hours." **Hide retry. Hide reason.
Never expose internal AML logic.**

Cross-reference: `docs/models.md §7` and `.claude/rules/error-ux.md`.

## Localization

- Every user-facing string is a **key**, not a string. Keys live in
  `i18n/{uz,ru,en}.json` (mobile root has its own pair separate from
  `dashboard/src/lib/i18n.ts`).
- UZ locks first. Once `uz` is locked, RU and EN translate in parallel.
- Russian runs 15–25% longer than English. **Re-test every viewport with
  the longest translation.**
- Pluralization: ICU MessageFormat; Russian needs one / few / many forms.
- Numbers / dates / currency follow `users.preferred_language`, not device
  locale.

| Concern | `uz` / `ru` | `en` |
|---|---|---|
| Number grouping | space (` `) | comma (`,`) |
| Decimal separator | comma (`,`) | period (`.`) |
| Date format | `DD.MM.YYYY` | `MMM D, YYYY` |
| Time format | 24-hour | 12-hour |

RTL not required for v1.

## Design language (locked direction)

**Wise's clean restraint × Apple Pay's surface materiality × Behance fintech's
modern composure.** See `mobile/research/references.md` for what we do and
do not steal.

### Color tokens (inherited from admin dashboard)

| Token family | Range | Primary use |
|---|---|---|
| `brand-50` → `brand-950` | full | primary accent, status `processing`/`completed`, headline amounts on home screen |
| `slate-50` → `slate-950` | full | neutral surfaces, text, dividers |
| `success-50 / 600 / 700` | 3 stops | `completed`, `passed`, `active` |
| `warning-50 / 600 / 700` | 3 stops | `reversed`, `expired`, `frozen`, tier-upgrade prompts |
| `danger-50 / 600 / 700` | 3 stops | `failed`, sanctions, destructive confirms |

**Brand carries more weight on mobile than on admin** — admin uses brand for
chip accents only; mobile uses brand on the home-screen card surface, the
headline currency amount, and the primary action button.

**Red is forbidden as a primary accent.** Red is reserved for `danger` semantic
only. Brand-anchor stays in the blue family.

### Typography (locks in foundation pass)

Inter (or system stack: SF Pro on iOS, Roboto on Android). 13px floor.
Locked scale comes out of `01-foundation.md`.

### Forbidden patterns

- ❌ Playful illustrations of money
- ❌ Confetti / celebrations on transfer completion
- ❌ Marketing-heavy onboarding with rotating slides
- ❌ Bottom-sheet-everywhere (sheets are for contextual choice; marquee path
  uses full-screen pages)
- ❌ Locale-flag overlays on the language picker (use names in native script)
- ❌ Skeuomorphic textures (paper / leather / wood)
- ❌ Animated splash on every launch
- ❌ Visa / Mastercard scheme logos in any v1 mock data, list, or filter

## Forbidden facts (v1 scope-out)

- Visa / Mastercard rails: schema supports them but **mock data must not
  include them** until explicitly invoked.
- 2FA / TOTP / SMS-OTP for the **admin** flow — admin is email + password
  only. SMS OTP is the **mobile** end-user mechanism for `tier_0 → tier_1`.
- Self-service password reset for admin. (Mobile end-user reset is in scope
  via MyID re-verify.)

## Output format expected

When this prompt set is fed into Claude design (claude.ai), the response
should be a **rendered, mobile-viewport-sized React + Tailwind artefact**
that:

1. Uses the brand-tinted token names from this doc (or the foundation pass
   when those land first), via Tailwind classes like `bg-brand-600`,
   `text-slate-900`, `text-success-700`, etc.
2. Stays inside a 390 × 844 pt viewport (iPhone 14 size — the canonical
   reference) by default. Tablet / large-screen variants are out of scope
   for v1.
3. Demonstrates light + dark variants when the surface meaningfully differs
   between them (most do).
4. Includes every state for every screen: empty, loading, success, error,
   offline, partial-data.
5. Uses placeholder copy that follows the `error_codes` shape (don't invent
   error strings — use `t('common.errors.LIMIT_DAILY_EXCEEDED.title')`-style
   keys, even if the localised string is hardcoded for prototype purposes).

A separate **Figma export** is also expected — the rendered design should be
re-creatable as a Figma frame using the same tokens. The foundation pass will
deliver the Figma library schema; surface passes deliver per-screen frames.

## Cross-references (canonical)

- Schema, tiers, statuses, ledger, error codes →
  [`docs/models.md`](../../docs/models.md)
- Personas, features, NFRs, non-goals →
  [`docs/product_requirements_document.md`](../../docs/product_requirements_document.md)
- State machines + flows → [`docs/mermaid_schemas/`](../../docs/mermaid_schemas/)
- Design rules → [`.claude/rules/`](../../.claude/rules/), specifically:
  - `core-principles.md` — mobile-first, trust-through-transparency, etc.
  - `money-and-fx.md` — money rendering + FX disclosure
  - `kyc-tiers-and-limits.md` — tier UX rules
  - `card-schemes.md` — masked PAN, scheme logos, 3DS
  - `error-ux.md` — error component contract
  - `status-machines.md` — status display rules
  - `localization.md` — copy keys + locale formatting
  - `accessibility.md` — WCAG 2.1 AA
  - `design-system-layers.md` — token / primitive / component / pattern / screen taxonomy
- Aesthetic direction → [`mobile/research/references.md`](../research/references.md)
