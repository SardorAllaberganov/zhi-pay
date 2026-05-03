# User Flow — Tier upgrade journey (when / how / why a user is prompted to verify)

> Plans the **contextual prompts and journey wrappers** that lead a user
> from `tier_1` (or `tier_0`) into the MyID flow ([`flow-02-myid.md`](./flow-02-myid.md)).
> This flow does NOT cover the MyID screens themselves — those live in
> [`flow-02-myid.md`](./flow-02-myid.md). This flow covers the **moments**
> where the upgrade gate is surfaced: which screens, which copy, which CTA.
>
> The matching surface prompt is
> [`../surfaces/08-tier-upgrade-screens.md`](../surfaces/08-tier-upgrade-screens.md)
> (which renders BOTH the upgrade-prompt screens AND the MyID screens
> themselves — single surface group, two flow plans feeding it).
>
> Canonical sources of truth:
> - [`docs/mermaid_schemas/kyc_state_machine.md`](../../../docs/mermaid_schemas/kyc_state_machine.md)
> - [`.claude/rules/kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md)
> - [`.claude/rules/error-ux.md`](../../../.claude/rules/error-ux.md)
> - [`docs/models.md`](../../../docs/models.md) — `users`, `kyc_verifications`

## Goal

Surface the upgrade prompt at every moment the user feels the gate, with
copy that explains *what they unlock* and *why it's worth a few minutes
of MyID*. Never silent-block — always explain why the surface is locked
and offer a one-tap path forward.

## Out of scope (covered by other flows)

- The MyID verification flow itself ([`flow-02-myid.md`](./flow-02-myid.md))
- Phone OTP onboarding ([`flow-01-onboarding.md`](./flow-01-onboarding.md))
- Card-linking tier_2 gate (handled inline by
  [`flow-03-card-linking.md`](./flow-03-card-linking.md) step 3 sheet)

## Prerequisites

- Some user-initiated action that hits a tier gate (per the upgrade
  triggers below)
- User is `tier_0` or `tier_1` (tier_2 users never see these prompts;
  expired tier_2 users do — see "MyID expiry" trigger below)

## State machine

This flow doesn't mutate KYC state — it routes into the MyID flow which
does. State changes happen in [`flow-02-myid.md`](./flow-02-myid.md):
`tier_1 → tier_2` on MyID success.

## Upgrade triggers — where the prompt surfaces

The upgrade prompt is rendered as one of three shapes depending on the
trigger context: **inline banner** (always-visible context), **half-sheet**
(action-blocked context), or **full-screen state** (terminal context).
Pick the shape per trigger:

| Trigger | Shape | Where |
|---|---|---|
| Tier-1 user lands on home | Inline banner (top of home) | Home screen |
| Tier-1 user taps "Send money" | Half-sheet | Above tab bar |
| Tier-1 user taps a Visa/MC tile in card-linking | Half-sheet | Above scheme picker |
| Tier-1 user hits limit on something else | Inline banner (toast then persistent until upgraded) | Wherever the limit triggered |
| Tier-2 user's MyID expires (TTL) | Soft-demote: persistent banner + frozen V/MC cards | Home + card-management |
| Tier-0 user (mid-onboarding fail) attempts any in-app action | Full-screen state | Wherever attempted |
| First app launch after install | Inline banner (only after step 1: phone-OTP done) | Home |

### Inline banner shape (home + persistent contexts)

- Foundation Banner primitive (warning-tinted)
- Icon: shield (lucide), warning-700 stroke
- Title: short, action-oriented — "Verify with MyID to send money"
- Body: 1-line context — "Higher limits + Visa & Mastercard support."
- Primary CTA inline: "Verify"
- Secondary "Later" — dismisses for this session only; resurfaces on
  next cold launch (per [`.claude/rules/kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md))

### Half-sheet shape (action-blocked contexts)

- Modal half-sheet (foundation Sheet primitive, half-snap)
- Heading: contextual to what the user just tapped
  - "Send money? Verify first." (Send-money tap)
  - "Visa & Mastercard need full verification." (V/MC tap)
- Body: 2-line value-prop tied to the user's action
- Primary CTA: "Verify with MyID"
- Secondary CTA: "Use another option" (where applicable — e.g. UzCard
  for V/MC tap; nothing for Send-money tap on tier_1)
- Tertiary "Cancel" / dismiss-X

### Full-screen state (tier_0 hard block)

- Foundation full-screen state (mirrors error/system states pattern from
  the admin)
- Icon: shield (lucide), large
- Heading: "Verify your identity to use ZhiPay"
- Body: explains that phone is set up but full ID is needed
- Primary CTA: "Verify with MyID"
- No secondary CTA — tier_0 users have no ungated actions in v1

## Screen sequence (a typical tier_1 → tier_2 journey)

1. **Trigger event** — user taps Send / V/MC / hits limit / etc.
2. **Upgrade prompt** — banner / sheet / full-screen per shape table
   above
3. **Pre-MyID intro** (re-uses MyID flow step 1 from
   [`flow-02-myid.md`](./flow-02-myid.md)) — consent
4. **MyID journey** ([`flow-02-myid.md`](./flow-02-myid.md) steps 2–9)
5. **Post-MyID return** — on success:
   - Full-screen tier_2 success state (re-uses MyID step 6) — "You're
     verified. You're now Tier 2."
   - Primary CTA: contextual to the original trigger
     - Trigger was "Send money" → primary becomes "Send money" (deep-
       links to send-money flow with any in-progress amount preserved)
     - Trigger was "Add Visa" → primary becomes "Add Visa" (deep-links
       back to scheme-picker with Visa pre-selected)
     - Trigger was generic home banner → primary becomes "Send money"
       (default forward-momentum CTA)
   - Secondary CTA: "Back to home"
   - On failure (terminal): same as MyID step 8 — calm "Contact support"
6. **Tier_2 home** — banner gone, send-money enabled, V/MC tiles
   ungated, headroom meters now show tier_2 limits

## States to render (per shape)

| State | Banner | Half-sheet | Full-screen |
|---|:---:|:---:|:---:|
| Idle | ✓ | ✓ | ✓ |
| Dismissed (session) | ✓ → hidden until next launch | — | — |
| Loading (CTA tap → routing) | ✓ brief | ✓ brief | ✓ brief |
| Network offline | ✓ banner stacks above | ✓ inline | ✓ inline |
| Reduced motion | ✓ no slide-in | ✓ no slide-in | ✓ no slide-in |
| Dark mode | ✓ | ✓ | ✓ |

## Soft-demote on MyID expiry — special sub-flow

When `kyc_verifications.expires_at` passes for a tier_2 user:

1. User is silently demoted to `tier_1` server-side (not a flow step)
2. **On next app open** OR push notification arrival (whichever first):
   - Top-of-home **persistent banner** (NOT dismissible — must be
     re-verified or accepted as terminal state):
     - Warning tone + shield icon
     - "MyID verification expired"
     - "Re-verify to restore higher limits and Visa/Mastercard."
     - Primary inline CTA: "Re-verify"
3. Visa / Mastercard cards in `linked_cards` are auto-frozen
   (`status=active` → `status=frozen` per
   [`.claude/rules/card-schemes.md`](../../../.claude/rules/card-schemes.md));
   on card-management list those cards render with the lock-tone
4. Send-money entry attempts → same half-sheet as tier_1 send-money
   gate, but with extra "Your verification expired" preface line
5. On successful re-MyID: cards auto-unfreeze (if no AML flags),
   banner clears, full functionality returns

This soft-demote pattern is critical — never silently block the user;
always show them what happened and offer the one-tap fix.

## Edge cases to surface in the design

- User dismisses the upgrade banner 5 sessions in a row → banner
  resurfaces every cold launch but copy DOES NOT escalate to nagging
  ("hey come on, just verify already"). Stays calm and value-prop-
  forward; the user has agency to remain at tier_1
- User completes MyID but leaves the success screen before tapping the
  contextual CTA → the original trigger context is preserved for 5min;
  return to home and tap "Send money" within that window deep-links
  to the in-progress amount; outside the window resets to fresh
- User starts MyID flow, backgrounds the app, returns to home →
  banner shows "Continue MyID verification →" instead of starting fresh
  (resume-state)
- User abandons MyID at consent screen 3 times → banner copy adjusts
  on the 3rd-or-later session to "Verifying takes about 2 minutes"
  (gentle reassurance, not nagging)
- Tier-2 user has MyID-expiry-pending warning (within 7 days of
  expiry, before actual expiry) → soft persistent banner: "Your MyID
  verification expires in 5 days — re-verify to keep higher limits"
  (yellow-amber tone, NOT the warning-red of post-expiry)
- User's session is in a different language than the MyID provider's
  default → MyID flow honors `users.preferred_language` for chrome
  (titles, CTAs, hints) but the provider's WebView (if used) is in
  the provider's default; document this hand-off in the surface
  prompt

## Acceptance criteria (Gherkin fragments)

```
GIVEN  user.kyc_tier = tier_1
WHEN   user opens the home screen
THEN   the upgrade banner renders at the top of the home content area
AND    the banner is dismissible for the session
AND    on dismiss, the banner is hidden until next cold launch

GIVEN  user.kyc_tier = tier_1
WHEN   user taps the Send-money tab bar item
THEN   half-sheet renders with the "Verify first" prompt
AND    primary CTA routes to MyID flow
AND    no Send-money screen is rendered until verified

GIVEN  user completes MyID successfully
AND    the original trigger was tapping "Send money"
WHEN   the success screen renders
THEN   primary CTA is "Send money" (contextual)
AND    tapping it deep-links into the send-money flow

GIVEN  user.kyc_tier = tier_2
AND    kyc_verifications.expires_at < now()
WHEN   user opens the app
THEN   user is soft-demoted to tier_1 server-side
AND    persistent banner renders ("MyID verification expired")
AND    Visa/MC cards in linked_cards are auto-frozen
AND    notifications row inserted (type=compliance, message localized)
AND    user_limit_usage limits revert to tier_1 thresholds

GIVEN  user is at tier_2 with MyID expiring in 5 days
WHEN   user opens the home screen
THEN   amber-toned warning banner renders ("Verification expires in 5
       days")
AND    banner is dismissible per-session (gentler than the post-expiry
       red banner)
```

## Telemetry to consider

- `tier-upgrade.banner.view` (with surface — home / send / etc)
- `tier-upgrade.banner.cta-tap`
- `tier-upgrade.banner.dismiss`
- `tier-upgrade.sheet.view` (with trigger — send / vmc / limit)
- `tier-upgrade.sheet.cta-tap`
- `tier-upgrade.sheet.dismiss`
- `tier-upgrade.fullscreen.view` (tier_0 only)
- `tier-upgrade.expiry-warning.view` (within-7-days)
- `tier-upgrade.expired.view` (post-expiry)
- `tier-upgrade.success-context-cta-tap` (with original trigger)

## Cross-references

- KYC state machine: [`docs/mermaid_schemas/kyc_state_machine.md`](../../../docs/mermaid_schemas/kyc_state_machine.md)
- Tier rules + soft-demote: [`.claude/rules/kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md)
- Card-frozen on expiry: [`.claude/rules/card-schemes.md`](../../../.claude/rules/card-schemes.md)
- Error UX: [`.claude/rules/error-ux.md`](../../../.claude/rules/error-ux.md)
- MyID verification flow: [`./flow-02-myid.md`](./flow-02-myid.md)
- Surface design prompt: [`../surfaces/08-tier-upgrade-screens.md`](../surfaces/08-tier-upgrade-screens.md)
