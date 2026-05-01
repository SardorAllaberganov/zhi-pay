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

**Five admin surfaces live** (Overview / Transfers / Transfer Detail / KYC Queue / **AML Triage**). Dashboard prototype under `dashboard/` (Vite + React 18 + TS + Tailwind + shadcn).
- **Overview** (`/`) — KPIs, throughput + status charts, FX spread health, services grid, 20-row recent activity.
- **Transfers Monitor** — list at `/operations/transfers` (200-row table w/ filters, sort, pagination, bulk actions, saved filters, Export CSV in page header).
- **Transfer Detail** at `/operations/transfers/:id` — full forensic view. Non-sticky page header (status / id / amounts / pager / Open user + Open audit outline buttons w/ icons). 12-col body: 8 cards on the left (FX & fees breakdown + rate popover; Sender; Recipient; Card used; AML flags; Internal notes w/ Add note dialog; Provider response — accordion-only toggle, when open shows stats + webhook events + RAW RESPONSE code panel with always-visible Copy; Admin action history); sticky right rail (Status timeline + Action panel — primary action button + secondary actions stacked as outline buttons inline, stuck-detection promotes Force-fail). Mobile bottom action bar (sticky 64px, Timeline / Primary / More via Sheets). 6 action modals (Add note, Resend webhook, Force fail, Mark completed, Reverse, Refund partial — Reverse/Refund have notify-user locked-on per compliance). 11 page-scoped keyboard shortcuts surfaced in the help overlay. Real-time refresh simulation for `processing` transfers (10s tick, 25% chance of advancing to completed + toast). Pager (`j`/`k`) walks the cached filtered list; disabled with tooltip when no list context.
- **KYC Review Queue** at `/operations/kyc-queue` (+ `/:id`) — master-detail (480px list pane + flex detail pane on lg+, single-pane stacked on mobile/tablet via the URL). 30-row deterministic mock spanning 4 edge classes (`clean` / `under_18` / `data_mismatch` / `sanctions_hit`) — 27 pending (4 with assignee = derived "reviewing") + 2 passed + 1 failed; 3 rows surface the soft auto-expire warning chip (>12min). List pane has sort header (newest/oldest), per-row select + select-all, bulk-action sticky bar (X-first layout · "N selected" · Approve / Reject (danger-tinted outline) / Assign to me), 8-row skeleton, empty / filtered-empty / error states. Detail pane has top bar (phone + status + Open user) + scrollable body with EdgeCaseBanners (under-18 / data-mismatch soft / sanctions-hit / expiring-soon) + IdentityCard (bilingual fields, masked PINFL + masked doc number with copy-session-id) + DocumentImageCard (minimal UZ-ID layout — title strip + photo box + 5-field bilingual grid, no flag/emblem/guilloche/watermark — blur overlays on face + ID number, both reveals audit-logged) + MyIdResponseCard (collapsible JSON viewer with Copy + redacted PINFL/doc-number at the data layer) + fixed-bottom ActionBar (Approve / Reject / Request info / Escalate; Approve auto-blocked with tooltip on under_18 / sanctions_hit / non-pending). 4 action modals — Approve (AlertDialog confirm, no reason), Reject (failure-reason select prefilled by edge-case + reason ≥10), Request info (message ≥10, increments `infoRequests` without status change), Escalate (reason ≥10, audit-log only). 8 page-scoped hotkeys (j/k auto-select, Enter, a/r/i/e gated by status, m toggles "Assigned to me" filter) — disabled on touch viewports per spec. Bulk approve uses skip-with-explanation for under_18/sanctions_hit. Advance-to-next-pending after every state-changing action.
- **AML Triage** at `/operations/aml-triage` (+ `/:id` + `/new`) — master-detail (520px list pane + flex detail pane on lg+, single-pane stacked on mobile/tablet via the URL). 26-flag deterministic mock spanning 5 typed-context shapes (velocity / amount / pattern / sanctions / manual): 19 status=open (3 critical = 2 sanctions + 1 amount-anomaly · 12 warning · 4 info) + 7 status=reviewing (mix). Per-type structured `context` jsonb (now in [`docs/models.md`](../docs/models.md) §5.1). List rows are 4-line: severity badge + type chip + status / phone + masked PINFL + age / 80-char description / optional Tx-prefix + Reviewing pill. Critical rows pin to top regardless of user-selected sort; sanctions rows get a red shield prefix. Page-top **CriticalBanner** appears when any open+critical+unassigned flag exists (CTA "Assign first to me" claims oldest unassigned critical). Detail pane has top bar (severity + type + flag-id mono+copy + status + age) + scrollable body with **SanctionsBanner** (when applicable, top of detail) + UserCard (lifetime stats, BLOCKED chip when `users.status='blocked'`) + LinkedTransferCard (transfer summary + Open transfer) + FlagContextCard (typed-decorated per flag type — velocity has count + threshold + sparkline; amount has σ count + multiplier; pattern has rule + signal + description; sanctions has list + matched name + score + handle; manual has filer + note — plus collapsible raw JSON viewer with bigint-safe replacer + Copy) + resolution-notes echo (terminal status). 4 action modals — Clear (4 reason codes + ≥20 char notes; **permanently disabled for sanctions** with tooltip), Escalate (≥20 char reason; for **sanctions auto-fills compliance template** that reviewer must edit ≥30 chars beyond template; for **critical-severity warns of auto-block** + AlertDialog confirm), Reassign (admin select with "Unassigned" option), Assign to me (no modal). State transitions wired with `users.status='blocked'` side-effect on critical escalate; in-memory audit-log store with 6 action types. 6 page-scoped hotkeys (j/k auto-select / Enter / c clear / e escalate / m claim / a reassign) — disabled on touch viewports. **Manual flag full-page form** at `/new` (typeahead user picker + transfer-id-prefix picker + severity radio + type select + JSON context textarea + ≥20 char note); module-level `extraManualFlags` store so submissions appear on remount.

Next phases: the rest of the 14 placeholder routes — driven by user prompts. Mobile app and full brand work still pending. Build-progress snapshot lives in [`docs/product_states.md`](../docs/product_states.md).

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
| Routes (admin) | **partially nested** — Transfers + KYC Queue + **AML Triage** use nested `/operations/*` paths. Other admin pages stay flat (`/services`, `/fx-config`, etc.) until each phase migrates them. Sidebar entries for the nested pages point to the nested paths; `/transfers`, `/kyc-queue`, and `/aml-triage` redirect to their nested forms for back-compat |
| AML Triage manual-flag form | **separate full-page route** at `/operations/aml-triage/new`, not a modal — per spec. Submits create an `AmlReview` in module-level `extraManualFlags` store so the new flag appears on next AmlTriage mount |
| AML "reviewing" status | **derived UI, not canonical** — same pattern as KYC Queue. `aml_flags.status` enum stays `open / reviewing / cleared / escalated` as defined in [`models.md` §5.1](../docs/models.md#51-er-diagram); the page header chip "X reviewing" computes from `status='reviewing'` |
| AML sanctions special handling | **locked** — Clear is permanently disabled for `flag_type='sanctions'` (UI shows tooltip explaining "escalate only"); Escalate auto-fills a compliance template that the reviewer must edit ≥30 chars beyond the template before submit; SanctionsBanner at the top of the detail pane reminds the reviewer not to communicate match details to the user. PRD §9.2 documents the rule |
| AML critical-escalate auto-blocks user | **locked** — Escalating a `severity='critical'` flag transitions the linked `users.status` to `'blocked'`; reviewer is warned in the EscalateDialog body + AlertDialog confirm-step before submit. PRD §9.2 documents the rule |
| Master-detail layout pattern | **locked** — list pane (480px KYC / 520px AML) + flex detail pane on `lg+`, single-pane stacked on mobile/tablet via URL. `lg:overflow-hidden` on the master-detail wrapper for clean rounded corners; panes use `lg:flex-1 lg:min-h-0` and `lg:overflow-y-auto` on body for internal scroll on `lg+` only. Future review surfaces (KYC tier admin, blacklist, etc.) follow this template |
| Action-bar layout pattern | **locked** — `fixed inset-x-0 bottom-0 z-30 md:left-16 lg:static lg:left-auto lg:right-auto`; mobile uses `grid grid-cols-2` so 4 buttons → 2 rows of equal-width. `position: fixed` escapes the wrapper's `overflow-hidden`. Detail-pane body adds `pt-4 pb-28 space-y-4 lg:pb-4` so the last card stays visible above the fixed bar |
| Row indicators (critical / selected) | **locked** — `shadow-[inset_2px_0_0_theme(colors.danger.600 / colors.brand.600)]` instead of `border-l + -ml-[2px]`. Survives `overflow-hidden` on the pane wrapper. Applies to `KycRow` + `AmlRow` |
| JSON code viewers | **locked** — `<pre>` panels in `MyIdResponseCard` (KYC) and `FlagContextCard` (AML) use `overflow-x-auto overflow-y-hidden` (no internal vertical scroll cap). Long single lines still scroll horizontally; the page handles vertical scroll |
| KYC `reviewing` status | **derived UI, not canonical** — the KYC state machine in [`docs/mermaid_schemas/kyc_state_machine.md`](../docs/mermaid_schemas/kyc_state_machine.md) stays at 4 states (`pending` / `passed` / `failed` / `expired`). The KYC Queue's "X reviewing" header chip computes from `pending + assignee_id set`. Status badges always show the canonical 4 |
| `kyc_verifications.assignee_id` | **schema gap** — modeled in mock only ([`dashboard/src/data/mockKycQueue.ts`](../dashboard/src/data/mockKycQueue.ts)) so the KYC Queue's "Assigned to me / unassigned" filter and bulk Assign-to-me work in the prototype. Backend `kyc_verifications` does NOT have this column today. Resolution gated on PRD §12 q6 (claim semantics) |
| `maskDocNumber` format | **locked** — `<series 2 chars>••••<last 3 chars>` (e.g. `AB••••567`) per [docs/models.md](../docs/models.md) document-number examples and the KYC Queue spec. Updated 2026-05-01 from the older `••••<last 4>` format. UZ passport numbers (`AB1234567`) and id-card numbers (`IC4456778`) both flow through this masker |
| Router type | **HashRouter** — chosen over BrowserRouter so GitHub Pages can serve the SPA without a 404.html redirect shim. URLs render as `/#/operations/transfers/:id`. Switch to BrowserRouter + spa-github-pages 404 trick if/when clean URLs become a requirement |
| Deployment | **GitHub Pages** at https://sardorallaberganov.github.io/zhi-pay/ — auto-deployed by `.github/workflows/deploy.yml` on every push to `main` (or manual `workflow_dispatch`). Build runs `npx tsc --noEmit && npm run build` in `dashboard/`, uploads `dashboard/dist`, deploys via `actions/deploy-pages@v4`. Vite `base` is `/zhi-pay/` only at build time so local dev stays at `/` |
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
├── .github/
│   └── workflows/deploy.yml           # GitHub Actions — build dashboard/ + deploy to GH Pages on push to main
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
│   ├── product_states.md              # build-progress snapshot (dashboard + mobile)
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
│       ├── components/kyc-queue/      # Pattern layer for the KYC review queue
│       │   ├── types.ts               # filter shape + applyFilters/applySort + bucket helpers
│       │   ├── filterState.ts         # module-level cache (mobile round-trip + visible-id list)
│       │   ├── KycFilterBar.tsx       # inline chip row (status / doc-type / tier / age / assigned)
│       │   ├── KycRow.tsx             # 2-line row (phone + status / tier + masked doc + age + assignee/expiring chip)
│       │   ├── KycListPane.tsx        # sort header + rows + bulk-action sticky bar + skeletons / empty / error
│       │   ├── KycDetailPane.tsx      # top bar + scrollable body + fixed-bottom ActionBar
│       │   ├── ActionBar.tsx          # Approve (gated) / Reject / Request info / Escalate
│       │   ├── cards/*.tsx            # IdentityCard, DocumentImageCard (minimal UZ-ID layout), MyIdResponseCard, EdgeCaseBanners
│       │   └── modals/*.tsx           # Approve (AlertDialog), Reject, RequestInfo, Escalate
│       ├── components/aml-triage/     # Pattern layer for the AML triage queue
│       │   ├── types.ts               # filter shape + applyFilters/applySort (critical-pin) + assigned/sort enums
│       │   ├── filterState.ts         # module-level cache
│       │   ├── AmlFilterBar.tsx       # inline chip row (severity / type / status / assigned / has-tx toggle)
│       │   ├── AmlRow.tsx             # 4-line row (severity + type + status / phone + pinfl + age / description / optional Tx + assignee)
│       │   ├── AmlListPane.tsx        # select-all + count + sort dropdown + rows + bulk-bar + skeletons / empty / error
│       │   ├── AmlDetailPane.tsx      # top bar (severity + type + flag-id) + scrollable body + fixed-bottom ActionBar
│       │   ├── ActionBar.tsx          # Clear (gated for sanctions) / Escalate / Assign to me / Reassign
│       │   ├── cards/*.tsx            # UserCard, LinkedTransferCard, FlagContextCard (typed-decorated), SanctionsBanner, CriticalBanner
│       │   └── modals/*.tsx           # ClearDialog, EscalateDialog (sanctions auto-fill + critical-block warn), ReassignDialog
│       ├── data/mockTransferDetail.ts # detail-specific mock (notes, provider, audit, edge-case flags, stats, pager helpers)
│       ├── data/mockKycQueue.ts       # 30-row KYC deterministic mock (4 edge classes) + audit-log store + counts/age helpers
│       ├── data/mockAmlTriage.ts      # 26-flag AML mock (5 typed contexts) + lifetime user stats + audit-log + sanctions template + manual-flag store
│       └── pages/{Overview,Transfers,TransferDetail,KycQueue,AmlTriage,AmlTriageNew,Placeholder}.tsx + router.tsx
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
- ☑ Admin KYC review queue (Phase 4) — DONE — master-detail at `/operations/kyc-queue` (+ `/:id`), 30-row mock, 4 edge classes, 4 action modals, 8 page-scoped hotkeys, minimal UZ-ID-card document placeholder, audit-logged face / doc-number reveals, derived "reviewing" UI state, `assignee_id` schema gap flagged in PRD §12 q6
- ☑ Admin AML triage (Phase 5) — DONE — master-detail at `/operations/aml-triage` (+ `/:id` + `/new`), 26-flag mock, 5 typed-context shapes, page-top critical banner + sanctions-only-escalate / critical-blocks-user compliance rules wired (PRD §9.2), 6 page-scoped hotkeys, manual-flag full-page form, in-memory audit + manual-flags stores, cross-surface mobile fix-up (fixed-bottom action bar, always-on `overflow-hidden` on master-detail wrapper, `overflow-y-hidden` on JSON code panels, inset-shadow row indicators)
- ☐ Other 14 admin sub-pages — placeholder routes, content TBD (`/users`, `/cards`, `/recipients`, `/blacklist`, `/kyc-tiers`, `/audit-log`, `/fx-config`, `/commission-rules`, `/services`, `/app-versions`, `/error-codes`, `/stories`, `/news`, `/notifications`)
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
6. **KYC admin claim semantics** — does picking up a verification create a soft claim (`assignee_id` set, others can override) or a hard reservation with TTL? Multiple admins on the same row allowed? Schema gap: `assignee_id` not in `kyc_verifications` today; backend addition gated on this answer.
7. **AML manual-flag context shape** — should the manual-flag form expose a typed structured form per flag-type (velocity / amount / pattern / sanctions fields), or stay as a freeform JSON textarea? v1 ships with freeform JSON; the typed `aml_flags.context` jsonb shape (now in `models.md` §5.1) accommodates either approach.

## Quick links

- [`docs/models.md`](../docs/models.md) — data model
- [`docs/product_requirements_document.md`](../docs/product_requirements_document.md) — PRD
- [`docs/product_states.md`](../docs/product_states.md) — build-progress snapshot
- [`docs/mermaid_schemas/`](../docs/mermaid_schemas/) — flows + state machines
- [`.claude/rules/`](../.claude/rules/) — design rules
- [`CLAUDE.md`](../CLAUDE.md) — workflow orchestrator
