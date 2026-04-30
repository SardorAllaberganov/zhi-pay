# AI Context — ZhiPay Project State

> Current state of the ZhiPay project. Read at the start of every task via `/start_task`.
> Updated whenever project state changes meaningfully (new artifacts, decisions, scope shifts).

## Project Identity

| | |
|---|---|
| **Name** | ZhiPay |
| **Type** | Cross-border remittance app |
| **Corridor** | Uzbekistan (UZ) → China (CN) |
| **Currencies** | UZS → CNY |
| **Source instruments** | UzCard, Humo, Visa, Mastercard |
| **Destination instruments** | Alipay, WeChat Pay |
| **KYC provider** | MyID (Uzbekistan national e-ID) |
| **Languages live** | `uz` (default), `ru`, `en` |
| **Languages planned** | `kz` (NOT `kk`), `kaa` |

## Two surfaces in scope

1. **Mobile app** — primary, end-user. Onboarding, KYC, card linking, send money, history, receipts.
2. **Internal admin dashboard** — secondary, ops / compliance / KYC review / AML triage / FX config / transfer monitoring. **Not customer-facing.**

## Current phase

**Transfers Monitor live.** Dashboard prototype under `dashboard/` (Vite + React 18 + TS + Tailwind + shadcn). Two surfaces are now functional:
- **Overview** (`/`) — KPIs, throughput + status charts, FX spread health, services grid, 20-row recent activity.
- **Transfers Monitor** — list at `/operations/transfers` (200-row table w/ filters, sort, pagination, bulk actions, saved filters) + detail at `/operations/transfers/:id` (sticky header, FX & fees breakdown, status timeline, provider response, AML flags, sticky-bottom admin actions).

Next phases: KYC queue, AML triage, and the rest of the 13 placeholder routes — driven by user prompts. Mobile app and full brand work still pending.

## Role

Acting as a **senior product designer with 10+ years of experience** in fintech / payments.
- **In scope:** research, IA, flows, screens, prototyping, specs, copy keys, accessibility, design QA, engineering handoff.
- **Out of scope:** implementation code, tech-stack choice, backend architecture.

## Decisions made

| Decision | Status |
|---|---|
| Two-surface scope (mobile + admin) | locked |
| Customer-facing web | non-goal for v1 |
| Dashboard tech stack | **locked** — Vite + React 18 + TS + Tailwind + shadcn/ui + recharts + lucide-react + react-router-dom |
| Mobile / backend tech stack | not decided |
| Brand color anchor | placeholder `#0a64bc` (trusted blue) — full brand still pending |
| Type scale (dashboard) | **locked** — 13px floor; xs=13/sm=14/base=15; `text-xs` reserved for chips/kbd/uppercase only |
| Visa / Mastercard rails in dashboard | **scoped out until user explicitly invokes them** (LESSONS 2026-04-30) — spec wording inside a phase prompt does NOT count as re-introduction; only a direct instruction does. Schema in `docs/models.md` unchanged, `SchemeLogo` keeps all four cases for the day they return |
| Compact money formatter (`formatMoneyCompact`) | **locked** — KPI / dashboard-aggregate tiles only; transactional displays (send-money review, transfer detail, activity rows) keep full grouping per [`money-and-fx.md`](../.claude/rules/money-and-fx.md) |
| Sticky table `<thead>` / column headers | **forbidden** (LESSONS 2026-04-30) — never apply `position: sticky` to data-table column headers. Filter bars + bulk-action bars may still be sticky |
| Routes (admin) | **partially nested** — Transfers uses nested `/operations/transfers` + `/operations/transfers/:id` per Phase-3 spec. Other admin pages stay flat (`/services`, `/fx-config`, `/kyc-queue`, etc.) until each phase migrates them. Sidebar entry for Transfers points to the nested path; `/transfers` redirects to `/operations/transfers` for back-compat |
| Brand / Figma | not started (real card-scheme + Alipay/WeChat + ZhiPay logos still needed) |
| KYC tier numbers | **placeholder**, pending Compliance sign-off |
| FX rate refresh cadence | open (PRD §12 q5) |
| Refund SLA copy | open (PRD §12 q1) |
| Tier upgrade decay (MyID expiry) | open (PRD §12 q2) |
| Visa / Mastercard fee differential | open (PRD §12 q3) |
| Recipient pre-validation | open (PRD §12 q4) |

## Where things live

```
ZhiPay/
├── README.md                          # product positioning
├── CLAUDE.md                          # slim workflow orchestrator
├── .gitignore
├── ai_context/                        # ← orientation (this folder)
│   ├── AI_CONTEXT.md                  # this file
│   ├── LESSONS.md                     # user-correction-driven rules
│   └── HISTORY.md                     # session-by-session changelog
├── .claude/
│   ├── rules/                         # 13 rule files (auto-loaded)
│   ├── commands/                      # 3 slash commands: /start_task /doc_sync /commit
│   └── settings.json                  # project-shared (settings.local.json gitignored)
├── docs/                              # source of truth
│   ├── models.md                      # 7-domain data model reference
│   ├── product_requirements_document.md
│   └── mermaid_schemas/               # 8 mermaid diagrams
├── dashboard/                         # admin-dashboard prototype (Vite + React 18 + TS)
│   ├── package.json, vite.config.ts, tsconfig.json, tailwind.config.ts, components.json
│   └── src/
│       ├── styles/globals.css         # tokens (brand, slate, semantic, shadcn light/dark)
│       ├── lib/{utils,i18n}.ts        # cn, formatMoney, formatMoneyCompact, formatNumber, mask, statusToTone, t() stub
│       ├── types/                     # status enums aligned with docs/models.md
│       ├── providers/ThemeProvider.tsx
│       ├── hooks/useKeyboardShortcuts.ts
│       ├── data/mock.ts               # Uzbek-context sample data (UzCard/Humo only for now)
│       ├── data/mockTransfers.ts      # 200 transfers + events + AML flags (deterministic seeded build) for Transfers Monitor
│       ├── components/ui/*            # 21 shadcn primitives — adds calendar (react-day-picker v9 wrapper)
│       ├── components/layout/*        # AppShell, Sidebar, TopBar (breadcrumbs), CommandPalette, …
│       ├── components/zhipay/*        # 12 domain primitives — adds DestinationBadge, DateRangePicker
│       ├── components/transfers/*     # Pattern layer: types + filterState + TransfersFilterBar + TransfersTable
│       └── pages/{Overview,Transfers,TransferDetail,Placeholder}.tsx + router.tsx
├── design/                            # for mobile design assets (not started)
├── i18n/                              # for mobile copy keys (not started)
└── zhipay_database_schema.html        # LEGACY (stale, not authoritative)
```

## Source-of-truth hierarchy

1. **[`docs/`](../docs/)** — facts: schema, KYC tiers, status machines, error codes, personas, NFRs, flows
2. **[`.claude/rules/`](../.claude/rules/)** — project rules: how to design against the facts
3. **[`ai_context/`](.)** — orientation: project state, lessons, history
4. **[`CLAUDE.md`](../CLAUDE.md)** — workflow: how Claude operates here

If they conflict, **`docs/` wins.** Fix the doc, then propagate to rules / orientation.

## Active workstreams

> Update this section as work begins or completes.

- ☑ Admin dashboard foundation — DONE (Vite + React 18 + TS + Tailwind + shadcn under `dashboard/`)
- ☑ Design system tokens (dashboard) — DONE (brand-50→950, slate, semantic, shadcn mappings, radii, shadows, motion)
- ☑ ZhiPay primitives (12) — DONE (StatusBadge, TierBadge, SeverityBadge, Money, MaskedPan, SchemeLogo, StatusTimeline, ErrorCell, KeyboardHint, ReviewQueueRow, DestinationBadge, **DateRangePicker**)
- ☑ Admin Overview page (Phase 2) — DONE — header w/ refresh + DateRangePicker, 4 KPI cards (focusable, Enter→navigate, compact volume), donut + 60-min throughput, **FX spread health**, services health, recent activity (tfoot totals + mobile stacked cards), `r` shortcut
- ☑ Admin Transfers page (Phase 3) — DONE
  - **List** at `/operations/transfers` — sticky filter bar (search left + Export-CSV green right; chip row: Status / Date range / Destination / Scheme / Amount / Tier / Has AML / Has failure; quick-pill row), 200-row mock dataset, sortable Created / Amount UZS / Amount CNY, 50/100/200 pagination, bulk-action sticky bar (Export selected / Mark for review; bulk reversal forbidden per regulatory rule), Saved filters (Dialog-based save/rename + 3-dot kebab per saved row, Save disabled when no active filters), `j`/`k`/Enter/`f`/`/`/`e` keyboard shortcuts, `r` not bound here
  - **Detail** at `/operations/transfers/:id` — sticky header (StatusBadge + copy-id + breadcrumbs + Open user), Amount card, FX & fees breakdown (collapsible), Card + Recipient (grid-cols-2), Sender + AML (grid-cols-2), Status timeline (events click-to-expand JSON), Provider response (collapsible), sticky-bottom Admin actions (Reverse / Force-fail / Resend webhook / Copy ID / Open audit) w/ AlertDialog + reason note ≥10 chars, `b`/Backspace back / `r` reverse / `c` copy / `u` user
  - List ↔ detail round-trip preserves filter state via module-level cache (`components/transfers/filterState.ts`)
- ☐ Admin KYC review queue — placeholder route, content TBD
- ☐ Admin AML triage — placeholder route, content TBD
- ☐ Other 13 admin sub-pages — placeholder routes, content TBD
- ☐ Real brand assets (UzCard / Humo logos, Alipay / WeChat marks, ZhiPay wordmark) — currently stylized SVG placeholders
- ☐ Visa / Mastercard re-introduction in dashboard — paused per LESSONS, returns when user explicitly invokes
- ☐ Mobile design system tokens — not started
- ☐ Mobile onboarding screens — not started
- ☐ Mobile send-money flow — not started
- ☐ Mobile localization seed (`i18n/uz.json`) — not started

## Open questions (carried from PRD §12)

1. **Refund SLA** — what's the user-facing message timeline for `reversed` transfers?
2. **Tier upgrade decay** — when MyID expires, instant demote or grace period?
3. **Visa/Mastercard fee differential** — surface a higher fee, eat margin, or block at `tier_1`?
4. **Recipient pre-validation** — pre-validate via provider lookup, or accept-and-reverse on failure?
5. **FX rate refresh cadence** — seconds-level (fresh but stale-risk) or minutes-level (simpler, worse UX)?

## Quick links

- [`docs/models.md`](../docs/models.md) — data model
- [`docs/product_requirements_document.md`](../docs/product_requirements_document.md) — PRD
- [`docs/mermaid_schemas/`](../docs/mermaid_schemas/) — flows + state machines
- [`.claude/rules/`](../.claude/rules/) — design rules
- [`CLAUDE.md`](../CLAUDE.md) — workflow orchestrator
