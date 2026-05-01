# Product States — ZhiPay

> Snapshot of build progress per surface across the two scopes (admin dashboard + mobile app).
> Source: [`ai_context/AI_CONTEXT.md`](../ai_context/AI_CONTEXT.md) + [`dashboard/src/router.tsx`](../dashboard/src/router.tsx).
> Last updated: 2026-05-03 (Phase 10 — Commission Rules).

## Legend

| Symbol | Meaning |
|:---:|---|
| ✅ | **Done** — built, deployed, and verified |
| 🚧 | **In progress** — partially built or actively being worked on |
| ❌ | **Todo** — not started; placeholder route or planned screen |

---

## Dashboard (admin / ops / compliance)

Tech stack: Vite + React 18 + TS + Tailwind + shadcn/ui · Router: HashRouter · Deployed via GitHub Pages.

### Foundation

| Layer | Status | Notes |
|---|:---:|---|
| Design tokens (brand 50→950, slate, semantic, shadcn light/dark) | ✅ | [`globals.css`](../dashboard/src/styles/globals.css) + [`tailwind.config.ts`](../dashboard/tailwind.config.ts) |
| Type scale (13px floor, locked) | ✅ | xs=13 / sm=14 / base=15. See [LESSONS](../ai_context/LESSONS.md) 2026-04-29 + 2026-05-01 |
| Table column-header style (locked) | ✅ | Title Case + `text-sm font-medium text-muted-foreground` everywhere — no uppercase/tracking, no active-sort color differential. See [LESSONS](../ai_context/LESSONS.md) 2026-05-02 |
| Detail-page header convention (locked) | ✅ | Inline (NEVER sticky) · structure: back-link / identity / chips · uniform `<ArrowLeft> Back to <list>` link. See [LESSONS](../ai_context/LESSONS.md) 2026-05-02 |
| Detail-page sticky-bottom action bar (locked) | ✅ | `fixed inset-x-0 bottom-0 md:left-[var(--sidebar-width,4rem)]` · AppShell exposes the live sidebar width as a CSS var. See [LESSONS](../ai_context/LESSONS.md) 2026-05-02 |
| shadcn primitives (21) | ✅ | [`components/ui/`](../dashboard/src/components/ui/) |
| ZhiPay domain primitives (12) | ✅ | StatusBadge · TierBadge · SeverityBadge · Money · MaskedPan · SchemeLogo · StatusTimeline · ErrorCell · KeyboardHint · ReviewQueueRow · DestinationBadge · DateRangePicker |
| App shell (Sidebar / TopBar / breadcrumbs / CommandPalette / HelpOverlay / ThemeProvider / keyboard shortcuts) | ✅ | [`components/layout/`](../dashboard/src/components/layout/) |
| Mock data layer (transfers · transfer-detail · KYC · AML) | ✅ | [`data/`](../dashboard/src/data/) |
| Master-detail layout pattern (locked) | ✅ | KYC + AML; future review surfaces follow |
| Action-bar layout pattern (locked) | ✅ | Fixed-bottom + 2×2 grid on mobile, in-flow on `lg+` |
| GitHub Pages deploy pipeline | ✅ | [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) |

### Surfaces

| Surface | Route | Status | Notes |
|---|---|:---:|---|
| Overview | `/` | ✅ | KPIs · throughput + status charts · FX spread health · services grid · 20-row recent activity |
| Transfers Monitor | `/operations/transfers` | ✅ | 200-row mock · filters · sort · pagination · bulk actions · saved filters · Export CSV |
| Transfer Detail | `/operations/transfers/:id` | ✅ | 8 left cards · sticky right rail · 6 action modals · real-time refresh sim · 11 hotkeys |
| KYC Review Queue | `/operations/kyc-queue` (+ `/:id`) | ✅ | Master-detail · 30-row mock · 4 edge classes · 4 action modals · 8 hotkeys |
| AML Triage | `/operations/aml-triage` (+ `/:id` + `/new`) | ✅ | Master-detail · 26-flag mock · 5 typed contexts · 4 action modals · manual-flag form · 6 hotkeys |
| Customers — Users | `/customers/users` (+ `/:id`) | ✅ | List + full-page detail · 50-row mock · 8 tabs (`?tab=...` deep-link) · 7 admin actions · 4 contextual modals · cross-store sync to AML on block/soft-delete · MyID profile card (5 sections + raw JSON) · lifetime stats derived from `TRANSFERS_FULL` so KPIs / charts / recent activity / Transfers tab stay consistent · MyID enforced as the hard gate for transfers (`tier_0` / `tier_1` are partial-registration with 0 limits) |
| Customers — Cards | `/customers/cards` (+ `/:id`) | ✅ | List + full-page detail · 80-card mock across 33 owners (73 active / 4 frozen / 2 expired / 1 removed) · 6-filter chip row (scheme · status · bank · country · last-used date-range picker · default-only / never-used toggles) · sortable desktop table + mobile card stack · CSV export · 4-button action bar (Freeze ↔ Unfreeze · Copy token · Open transfers) · 2 action modals (Freeze · Unfreeze) — Force-expire dropped (admin-unilateral termination conflicts with the user-only-unlinks policy) · `?context=card&card_id=` filter on Transfers list + transfer-detail pager · cross-store sync via `mockCards.freezeAllUserActiveCards` invoked from `mockUsers.blockUser` |
| Customers — Recipients | `/customers/recipients` (+ `/:id`) | ✅ | List + full-page detail · 60-recipient mock across 30 distinct owners (36 alipay · 24 wechat · 12 favorites) · `mockRecipients.ts` is single source of truth · 3-filter chip row (destination · favorites-only · last-used `<DateRangePicker>` per Cards convention) · sortable desktop table (created · last-used · transfer-count) + mobile card stack · CSV export · full-bleed detail page (display info · owner · usage card with 4 KPI tiles + last-5 transfers + "View all" CTA) · single Hard-delete action with 2-step Dialog → AlertDialog confirm and ≥20 char reason · `?context=recipient&recipient_id=` filter on Transfers list + transfer-detail pager + back-link · `getUserRecipients` / `hardDeleteRecipient` in `mockUsers` are now thin wrappers · CJK display names render verbatim · 4 page-scoped hotkeys (j/k/Enter/`/` on list; b/Backspace/Del on detail) |
| Compliance — Blacklist | `/blacklist` | ❌ | Placeholder |
| Compliance — KYC Tiers admin | `/kyc-tiers` | ❌ | Placeholder · tier-limit configuration |
| Compliance — Audit log | `/audit-log` | ❌ | Placeholder · referenced from transfer detail "Open in audit log" |
| Finance — FX config | `/finance/fx-config` (+ `/new`) | ✅ | List + full-page Update form · 19-version mock spanning 60 days (incl. one historic 1.5% manual-override version) · `mockFxRates.ts` is single source of truth (immutable rows — `addFxRate` only inserts new versions and closes the previous active window) · active rate card with 4-cell grid (mid · spread · client · source) + health badge (Healthy / Drifting / Stale based on spread bands + `validTo` expiry) · trend chart with 24h/7d/30d/90d range tabs (mid line dashed slate, client line solid brand) · sortable version history table with inline expand showing full record + diff vs previous · mobile card stack mirrors the table · Update form with Source select (central_bank locks numeric inputs · provider_x / manual unlock) · `<StepperNumberInput>` (↑↓ ±0.01, Shift+↑↓ ±0.10) · auto-computed client rate · 2-pane layout (form left, sticky DiffPreview right · mobile "Show diff" toggle) · ≥20-char reason note · AlertDialog confirms with in-flight count line · `setInFlightCounter` wiring keeps mockFxRates free of a circular import on mockTransfers · Cmd/Ctrl+Enter submit · `u` hotkey from list opens Update page |
| Finance — Commission rules | `/finance/commissions` (+ `/new`) | ✅ | List + full-page New-version form · Tabs split Personal vs Corporate · 12 personal versions + 8 corporate versions deterministic mock · `mockCommissionRules.ts` is single source of truth (immutable rows — `addCommissionRule` only inserts new versions per accountType and closes the previous active window) · Active rule card with 4-cell grid (personal) / 6-cell (corporate adds volume_threshold + corporate_pct) · live worked example on a 5,000,000 UZS sample (commission %, commission UZS, min-fee floor check, total fee + corporate above-threshold variant) · sortable version history table with inline expand showing full record + diff vs previous + reason note · mobile card stack mirrors the table · New-version form pre-fills from active rule · Lifted `<StepperNumberInput>` (↑↓ ±0.01 / ±100, Shift+↑↓ ±0.10 / ±1000) and `<DateTimeInput>` to `components/zhipay/` so commissions can consume without a Pattern→Pattern import · 4-rule client-side validation (min ≤ max, min_fee ≥ 0, from < to, corporate_pct ≤ min_pct) · ≥20-char reason note · 2-pane layout (form left, sticky DiffPreview + WorkedExample right · mobile "Show diff & worked example" toggle) · AlertDialog confirm with effective_from line · Cmd/Ctrl+Enter submit · `n` hotkey from list opens New-version page for the active tab · `g+m` global hotkey routes here |
| System — Services & Health | `/services` | ❌ | Placeholder · provider availability + kill switches |
| System — App versions | `/app-versions` | ❌ | Placeholder · mobile build manifest + force-update flags |
| System — Error codes | `/error-codes` | ❌ | Placeholder · localized message table |
| Content — Stories | `/stories` | ❌ | Placeholder |
| Content — News | `/news` | ❌ | Placeholder |
| Content — Notifications | `/notifications` | ❌ | Placeholder |

### Cross-cutting open items

| Item | Status | Notes |
|---|:---:|---|
| Real brand assets (UzCard / Humo / Alipay / WeChat / ZhiPay logos) | ❌ | Stylized SVG placeholders today |
| Visa / Mastercard re-introduction in mock | ❌ | Paused; gated on explicit user instruction. See [LESSONS](../ai_context/LESSONS.md) 2026-04-30 |
| Senior-role wiring for AML / KYC escalate | 🚧 | Audit-log entry only; real role gate pending |
| Bulk reject (KYC) / bulk clear+escalate (AML) | ❌ | Single-row pattern covers common path |

---

## Mobile app (end-user)

Nothing built yet. Tech stack not chosen — no tokens, no primitives, no screens.

### Foundation

| Layer | Status | Notes |
|---|:---:|---|
| Tech stack decision (RN / Flutter / native iOS+Android) | ❌ | Open — see [`AI_CONTEXT.md`](../ai_context/AI_CONTEXT.md) "Decisions made" |
| Design tokens (mobile-first) | ❌ | Will share brand anchor with dashboard; density rules differ |
| Mobile primitives + components + patterns | ❌ | See [design-system-layers](../.claude/rules/design-system-layers.md) |
| Localization seed (`i18n/{uz,ru,en}.json`) | ❌ | UZ default · RU + EN co-equal · see [localization](../.claude/rules/localization.md) |
| Real brand assets (logo · scheme marks · destination marks) | ❌ | Same gap as dashboard |

### Surfaces

| Surface | Status | Notes |
|---|:---:|---|
| Onboarding (welcome · language picker) | ❌ | First-run only |
| Phone verification (SMS OTP) → `tier_1` | ❌ | KYC state machine: [`kyc_state_machine.md`](./mermaid_schemas/kyc_state_machine.md) |
| MyID verification → `tier_2` | ❌ | WebView + result handling |
| Home (balance · quick send · recent activity) | ❌ | Mobile primary surface |
| Card linking (UzCard / Humo; Visa/MC `tier_2`-gated) | ❌ | 3DS WebView · see [card-schemes](../.claude/rules/card-schemes.md) |
| Card management (list · freeze · remove) | ❌ | Status mapping per [card-schemes](../.claude/rules/card-schemes.md) |
| Send money (recipient → amount → FX review → 3DS → status) | ❌ | Rate-lock + breakdown per [money-and-fx](../.claude/rules/money-and-fx.md) |
| Transfer history (list + filters) | ❌ | Mirrors `transfers` table with locale formatting |
| Transfer detail / receipt | ❌ | Timeline from [`transfer_state_machine.md`](./mermaid_schemas/transfer_state_machine.md) |
| Tier upgrade flow (`tier_0 → tier_1 → tier_2`) | ❌ | Banner + CTA per [kyc-tiers-and-limits](../.claude/rules/kyc-tiers-and-limits.md) |
| Notifications inbox | ❌ | `type ∈ {compliance, transfer, system}` |
| Settings (profile · language · sign-out) | ❌ | `users.preferred_language` drives all formatting |
| Help / Support | ❌ | Routes to `error_codes.suggested_action` for in-context help |

---

## Cross-references

- Authoritative facts → [`docs/models.md`](./models.md) · [`docs/product_requirements_document.md`](./product_requirements_document.md) · [`docs/mermaid_schemas/`](./mermaid_schemas/)
- Project state + decisions → [`ai_context/AI_CONTEXT.md`](../ai_context/AI_CONTEXT.md)
- Lessons → [`ai_context/LESSONS.md`](../ai_context/LESSONS.md)
- Change log → [`ai_context/HISTORY.md`](../ai_context/HISTORY.md)
- Workflow → [`CLAUDE.md`](../CLAUDE.md)
