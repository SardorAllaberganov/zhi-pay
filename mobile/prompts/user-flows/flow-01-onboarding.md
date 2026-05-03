# User Flow — Onboarding (welcome → tier_1)

> Plans the screen sequence + state machine for the first-time-user
> onboarding experience. The matching surface prompt is
> [`../surfaces/02-onboarding-screens.md`](../surfaces/02-onboarding-screens.md).
>
> Canonical sources of truth (do not contradict):
> - [`docs/mermaid_schemas/onboarding_flow.md`](../../../docs/mermaid_schemas/onboarding_flow.md)
> - [`docs/mermaid_schemas/kyc_state_machine.md`](../../../docs/mermaid_schemas/kyc_state_machine.md)
> - [`.claude/rules/kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md)
> - [`docs/models.md`](../../../docs/models.md) — `users` table, `kyc_verifications`

## Goal

Get a brand-new UZ resident from app-install to a usable `tier_1` account
(phone-verified, can browse, see services / FX rates, but cannot transfer
yet). Push toward MyID → `tier_2` is a separate flow ([`flow-02-myid.md`](./flow-02-myid.md))
so the user can defer it without friction.

## Out of scope (covered by other flows)

- MyID verification → `tier_2` ([`flow-02-myid.md`](./flow-02-myid.md))
- Card linking ([`flow-03-card-linking.md`](./flow-03-card-linking.md))
- First send-money ([`flow-04-send-money.md`](./flow-04-send-money.md))

## Prerequisites

- App installed (Android primary; iOS supported)
- Network connectivity (online required)
- Has a UZ phone number (`+998 XX XXX XX XX`)

## State machine (KYC)

`tier_0` (entry) → phone OTP submitted → `tier_1`

KYC state during phone-only verification: `pending` → `passed` (passed for
phone tier; full MyID is a separate KYC verification record).

## Screen sequence

1. **Welcome** — first launch only.
   - Hero amount/value-prop in one sentence (UZ default copy locked at i18n
     pass; placeholder English: "Send money to China in seconds.")
   - Tiny secondary line: corridor + currencies (UZ → CN, UZS → CNY)
   - Single primary CTA: "Get started"
   - Bottom-of-screen language switcher (3 options in their native scripts)
   - No registration, no email, no marketing carousel
2. **Language picker** — only shown if user taps the language switcher.
   - 3 rows: `O'zbek` (default selected) / `Русский` / `English`
   - No flags. Native script only.
   - Selecting a language returns to Welcome with the new locale applied.
   - Stored in `users.preferred_language` once a session exists; held in
     local storage before that.
3. **Phone entry**
   - `+998 ` prefix locked, mask `90 123 45 67`
   - One field, one CTA ("Continue")
   - Helper text: "We'll send you a 6-digit code." (or 4-digit per
     compliance — confirm at i18n pass)
   - Validation: must be 9 digits after the prefix; UZ-mobile-prefix
     allowlist (90 / 91 / 93 / 94 / 95 / 97 / 98 / 99)
   - Privacy line: "We use your phone only for sign-in and security
     alerts." Small, slate-700 muted.
4. **OTP entry**
   - 6-box (or 4-box) auto-focusing input
   - Heading: "Enter the code we sent to +998 90 123 45 67"
     (the entered phone, masked partially: `+998 90 ••• •• 23`)
   - Resend cooldown: 60s timer, then "Resend code" link
   - Wrong-code error inline below the OTP boxes (red ring on boxes +
     localized error message from `error_codes`)
   - Three failed attempts → block for 5min with countdown
   - Success → animated tick → navigate to Tier-1 landing
5. **Tier-1 landing** — first home-screen mount post-verification.
   - Welcome banner: "You're all set." (auto-dismiss after 4s OR persist
     until tapped)
   - Tier badge in the header showing `tier_1`
   - **Top-of-page banner**: "Verify with MyID to unlock higher limits"
     (warning-tinted, brand-tinted CTA, dismissible — but resurfaces every
     N sessions until completed)
   - Send-money CTA visible but **disabled** with helper "Verify with MyID
     to send" (since `tier_1` daily/monthly limits are placeholder 5M / 20M
     UZS, but MyID is the hard gate — see `kyc-tiers-and-limits.md` rule)
   - Card-linking CTA visible (UzCard / Humo allowed at `tier_1`)

> **NOTE on tier_1 send-money:** the schema's tier_1 placeholder limits are
> 5M / 20M UZS, but the locked product decision (per `AI_CONTEXT.md` +
> `compliance/kyc-tiers` admin reference) is that **MyID is the hard gate
> for transfers**, not phone OTP. So `tier_1` is a "view-only" intermediate:
> services / FX rates / cards visible, but no transfers until `tier_2`.
> Confirm with the design that the send-money button on the tier_1 home is
> disabled with the upgrade CTA.

## States to render (per screen)

For each screen above, design these states:

| State | Welcome | Lang picker | Phone | OTP | Tier-1 home |
|---|:---:|:---:|:---:|:---:|:---:|
| Idle | ✓ | ✓ | ✓ | ✓ | ✓ |
| Loading | — | — | submit | submit + resend | initial mount (skeleton) |
| Error (invalid input) | — | — | ✓ | ✓ | — |
| Error (rate-limited) | — | — | ✓ | ✓ | — |
| Error (network offline) | ✓ banner | — | ✓ banner | ✓ banner | ✓ banner |
| Error (server 5xx) | — | — | ✓ banner | ✓ banner | ✓ banner |
| Success / cleared | — | confirmed selection | accepted | tick → nav | tier_1 ready |

## Error states (sourced from `error_codes`)

- Wrong OTP → `OTP_INVALID` (placeholder code; confirm at i18n pass)
- Rate-limited → `OTP_RATE_LIMITED` w/ countdown
- Phone format invalid → inline validation, no `error_codes` round-trip
- Provider unavailable (SMS gateway down) → `PROVIDER_UNAVAILABLE` calm
  banner: "We're confirming this." (per `error-ux.md`)
- Sanctions hit (rare on phone-tier alone but possible) → `SANCTIONS_HIT`
  calm-review pattern, no retry, no reason exposed

## Edge cases to surface in the design

- User changed language mid-OTP → OTP screen re-renders in new locale,
  countdown preserved
- User backgrounds the app during OTP wait → returning to foreground,
  countdown is the same wall-clock value (not paused)
- Existing user re-installs → same phone returns existing account; OTP
  success goes to existing tier (could be `tier_1` or `tier_2`)
- User on `tier_2` resets phone → OTP-locks them at `tier_1` until MyID
  re-verifies (but mobile shouldn't surface a reset path in v1; deferred)

## Acceptance criteria (Gherkin fragments)

```
GIVEN  brand-new install
WHEN   user enters +998 90 123 45 67 on the Phone screen and submits
AND    SMS provider responds within 5s
THEN   OTP screen renders with masked phone in heading
AND    6-box auto-focused input ready for the first digit
AND    "Resend code" link disabled with 60s countdown

GIVEN  user enters correct OTP
WHEN   submit succeeds
THEN   users.kyc_tier transitions tier_0 → tier_1
AND    new kyc_verifications row created (level=phone_otp, status=passed)
AND    success-tick animation plays for 800ms
AND    navigate to Tier-1 home with the upgrade-to-MyID banner visible

GIVEN  user enters incorrect OTP 3 times in a row
WHEN   the 3rd attempt fails
THEN   submit button disables for 5min
AND    inline message localised from error_codes.OTP_RATE_LIMITED
AND    "Resend code" link disabled
AND    countdown visible
```

Full AC lives in `mobile/prompts/surfaces/02-onboarding-screens.md` once the
designs land — these are seed criteria.

## Telemetry to consider (for the design — visualise where events fire)

Mark in the design where these events would fire (small annotation):

- `onb.welcome.view` (Welcome mount)
- `onb.welcome.cta-tap` (Get started tap)
- `onb.lang.change` (language switched, with new locale)
- `onb.phone.submit` (Phone CTA tap)
- `onb.phone.invalid` (validation failed)
- `onb.otp.view` (OTP mount)
- `onb.otp.submit` (OTP CTA tap)
- `onb.otp.success` (OTP accepted)
- `onb.otp.failed` (OTP rejected — 1st / 2nd / 3rd)
- `onb.otp.resend` (Resend tap)
- `onb.tier1.land` (Tier-1 home first mount)
- `onb.upgrade-banner.tap` (MyID upgrade banner tapped)

## Cross-references

- Onboarding flow diagram: [`docs/mermaid_schemas/onboarding_flow.md`](../../../docs/mermaid_schemas/onboarding_flow.md)
- KYC state machine: [`docs/mermaid_schemas/kyc_state_machine.md`](../../../docs/mermaid_schemas/kyc_state_machine.md)
- Tier rules: [`.claude/rules/kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md)
- Error UX: [`.claude/rules/error-ux.md`](../../../.claude/rules/error-ux.md)
- Localization: [`.claude/rules/localization.md`](../../../.claude/rules/localization.md)
- Surface design prompt: [`../surfaces/02-onboarding-screens.md`](../surfaces/02-onboarding-screens.md)
