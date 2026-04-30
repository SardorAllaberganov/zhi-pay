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

**Transfers Monitor + Transfer Detail (forensic) live.** Dashboard prototype under `dashboard/` (Vite + React 18 + TS + Tailwind + shadcn). Three admin surfaces functional:
- **Overview** (`/`) — KPIs, throughput + status charts, FX spread health, services grid, 20-row recent activity.
- **Transfers Monitor** — list at `/operations/transfers` (200-row table w/ filters, sort, pagination, bulk actions, saved filters, Export CSV in page header).
- **Transfer Detail** at `/operations/transfers/:id` — full forensic view. Non-sticky page header (status / id / amounts / pager / Open user + Open audit outline buttons w/ icons). 12-col body: 8 cards on the left (FX & fees breakdown + rate popover; Sender; Recipient; Card used; AML flags; Internal notes w/ Add note dialog; Provider response — accordion-only toggle, when open shows stats + webhook events + RAW RESPONSE code panel with always-visible Copy; Admin action history); sticky right rail (Status timeline + Action panel — primary action button + secondary actions stacked as outline buttons inline, stuck-detection promotes Force-fail). Mobile bottom action bar (sticky 64px, Timeline / Primary / More via Sheets). 6 action modals (Add note, Resend webhook, Force fail, Mark completed, Reverse, Refund partial — Reverse/Refund have notify-user locked-on per compliance). 11 page-scoped keyboard shortcuts surfaced in the help overlay. Real-time refresh simulation for `processing` transfers (10s tick, 25% chance of advancing to completed + toast). Pager (`j`/`k`) walks the cached filtered list; disabled with tooltip when no list context.

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
| Type scale (dashboard) | **locked** — 13px floor; xs=13/sm=14/base=15; `text-xs` reserved for chips/badges/kbd/uppercase-tracking-wider/avatar-fallback/tooltip-body only. **Forbidden in buttons (any size) and flowing meta spans** (timestamps, lifetime stats, character counters, form sub-labels). Shadcn `Button.size="sm"` patched to drop `text-xs`. See LESSONS 2026-04-29 + 2026-05-01 |
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
│       ├── components/transfer-detail/ # Pattern layer for the detail page
│       │   ├── ActionMenu.ts          # status→action plan (primary + More)
│       │   ├── RightRail.tsx          # desktop sticky timeline + ActionMenu
│       │   ├── MobileActionBar.tsx    # mobile sticky-bottom action bar
│       │   ├── cards/*.tsx            # 8 left-column cards (Fx&Fees, Sender, Recipient, CardUsed, Aml, Notes, Provider, AdminActions) + CollapsibleCard
│       │   └── modals/*.tsx           # 6 action modals + Textarea + RefundRecipientPicker
│       ├── data/mockTransferDetail.ts # detail-specific mock (notes, provider, audit, edge-case flags, stats, pager helpers)
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
  - **List** at `/operations/transfers` — Export CSV in page header, filter bar (search left, chip row, quick-pill row), 200-row mock dataset, sortable Created / Amount UZS / Amount CNY, 50/100/200 pagination, bulk-action sticky bar (Export selected / Mark for review; bulk reversal forbidden per regulatory rule), Saved filters (Dialog-based save/rename + 3-dot kebab per saved row, Save disabled when no active filters), 600ms initial-mount skeletons (chips + table rows), `j`/`k`/Enter/`f`/`/`/`e` keyboard shortcuts (`/` focuses search, `f` focuses first chip)
  - **Detail** at `/operations/transfers/:id` — full forensic view. Non-sticky page header (StatusBadge / 12-char copy-able id / amounts UZS→CNY at text-3xl / locked rate / fees / pager 12-of-N / context-aware back link / Open user + Open in audit log outline buttons w/ icons). 12-col body using `flex flex-col gap-4` on the left col (avoids phantom space-y from hidden tablet timeline) so left content top-aligns with the right-rail timeline. 8 left-column cards: FxFees (table breakdown + rate-source popover only — chart removed); Sender + lifetime stats; Recipient + saved badge + nth-transfer; Card used (single SchemeLogo on the left, MaskedPan rendered with `hideScheme`); AML flags w/ sanctions banner; Internal notes; Provider response (accordion title is the only toggle — collapsedSummary removed so it matches FX behavior; when open shows stats + webhook events + RAW RESPONSE code panel `<pre><code>` always visible with Copy button); Admin action history. **StatusTimeline rewritten** — flex marker column auto-centers the line with circles, lines render only between consecutive items (no overflow above first / below last), past-to-past is solid `bg-border`, the line from the current event to the appended hollow theoretical-next marker is dashed (`border-l border-dashed`); terminal states (completed/failed/reversed) end with a solid circle and no trailing line. Sticky right rail with StatusTimeline + Action panel — primary action button + **secondary actions stacked as outline buttons** (no More dropdown) — stuck ≥5min processing promotes Force-fail with "Stuck for Xm" chip; destructive secondaries get danger-bordered outline. Mobile sticky-bottom action bar opens Sheets for Timeline / More. 6 action modals: Add note (Dialog 480, 5-1000 chars + tag select); Resend webhook (AlertDialog, ≥10 chars + notify toggle); Force fail (Dialog 480, non-retryable failure-code select + ≥30 chars + AlertDialog confirm); Mark completed (Dialog 520, provider tx ID + ≥50 chars + acknowledge checkbox + AlertDialog confirm); Reverse (Dialog 520, ≥50 chars + recipient picker source/alternate/external-bank, notify-user **locked ON**); Refund partial (Dialog 520, amount input + ≥30 chars + recipient picker, notify-user **locked ON**, status stays completed). 11 page-scoped shortcuts in help overlay (j/k pager, n/r/f/m/w action triggers, c copy, u user, b back). Real-time `setInterval(10s)` simulation for `processing` transfers (25% chance to advance + toast). Linked-entity edge cases handled (sender deleted / card removed / recipient deleted shown on 3 deterministic transfers).
  - List ↔ detail round-trip preserves filter state via module-level cache (`components/transfers/filterState.ts`); pager `j/k` walks the cached filtered+sorted list, scoped to `?context=user&user_id=...` when arriving from a user page.
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
