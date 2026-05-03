# ZhiPay Mobile — Design Workspace

> Holds the prompts, user-flow specs, references, and rendered design artefacts
> for the **end-user mobile app**. This is the design surface, not the
> implementation — implementation tech-stack (React Native vs Flutter) is
> still open. Designs here stay tech-stack-agnostic.

## What lives where

```
mobile/
├── README.md                       ← this file
├── research/
│   └── references.md               Wise + Apple Pay + Behance fintech notes
└── prompts/                        Briefs to feed Claude design / Figma
    ├── 00-shared-context.md        Pasted INTO every prompt — PRD recap, money/FX,
    │                               tier system, status states, error codes, privacy,
    │                               aesthetic direction, brand tokens. Stable canon.
    ├── 01-foundation.md            Tokens + primitives + components + sample shell
    ├── user-flows/                 Plan-the-sequence: each .md references the
    │                               canonical mermaid_schemas + lays out the screen
    │                               sequence the surface prompt then designs.
    │   ├── flow-01-onboarding.md
    │   ├── flow-02-myid.md
    │   ├── flow-03-card-linking.md
    │   ├── flow-04-send-money.md
    │   ├── flow-05-history.md
    │   ├── flow-06-tier-upgrade.md
    │   ├── flow-07-card-management.md
    │   ├── flow-08-notifications.md
    │   └── flow-09-settings.md
    └── surfaces/                   Design briefs — one per surface group
        ├── 02-onboarding-screens.md
        ├── 03-home-screen.md
        ├── 04-card-linking-screens.md
        ├── 05-send-money-screens.md
        ├── 06-history-screens.md
        ├── 07-receipt-screens.md
        ├── 08-tier-upgrade-screens.md
        ├── 09-card-management-screens.md
        ├── 10-notifications-screens.md
        ├── 11-settings-screens.md
        └── 12-help-support-screens.md
└── design/                         Where rendered designs land when brought back
    ├── tokens/                     Design-token files (json / css / dart / tsx)
    ├── primitives/                 Per-primitive specs + rendered components
    ├── components/                 Shared compositions (card / list-row / sheet)
    ├── patterns/                   Domain patterns (FX-quote breakdown, KYC step)
    ├── screens/                    Per-screen rendered designs
    └── flows/                      Animated / interactive prototypes
```

## How to use this

For each design pass:

1. **Pick the next user flow** from `prompts/user-flows/`. The flow doc references
   the canonical mermaid state-machine in `docs/mermaid_schemas/` and lists the
   screens that compose it.
2. **Open a fresh Claude conversation** (claude.ai) and paste:
   - The full content of `prompts/00-shared-context.md`
   - The relevant `prompts/user-flows/flow-XX.md`
   - The matching `prompts/surfaces/YY-screens.md`
3. Claude will respond with a hi-fi rendered prototype (React + Tailwind,
   styled to ZhiPay's brand tokens, mobile viewport).
4. Iterate. Once satisfied, save the design artefact code into
   `design/screens/<flow>-<screen>.tsx` and link the Figma frame URL in a
   sibling `.md` of the same name.
5. Mirror the design tokens from the foundation pass into a Figma file (one
   library file per token category) so designers can extend visually.

## Sequencing

**Foundation first** (`01-foundation.md`) — tokens, primitives, core components,
sample app shell. Locks the aesthetic + reusable parts before any surface lands.

**Then surfaces in marquee-path order**:

1. Onboarding (welcome → language → phone OTP → tier_1 home)
2. MyID verification (handoff + result)
3. Home (balance card + quick send + recent activity)
4. Card linking (UzCard / Humo + 3DS WebView)
5. Send-money (recipient → amount → FX review → 3DS → status)
6. History (list + filters + receipt)
7. Card management (list / freeze / remove)
8. Tier upgrade (tier_1 → tier_2)
9. Notifications inbox
10. Settings (profile / language / sign-out)
11. Help / Support

Visa / Mastercard surfaces stay deferred per LESSON 2026-04-30 — they re-enter
when explicitly invoked.

## Sources of truth

The `docs/` folder is canon. The prompts in this directory **summarise but never
contradict** the docs. If a brief here drifts from `docs/models.md` or any
`docs/mermaid_schemas/*.md`, fix the brief — the docs win.

Cross-references:
- Schema, tiers, statuses, ledger, error codes → [`docs/models.md`](../docs/models.md)
- Personas, features, NFRs, non-goals → [`docs/product_requirements_document.md`](../docs/product_requirements_document.md)
- Flows + state machines → [`docs/mermaid_schemas/`](../docs/mermaid_schemas/)
- Design rules (color, money rendering, error UX, status, accessibility, l10n)
  → [`.claude/rules/`](../.claude/rules/)
