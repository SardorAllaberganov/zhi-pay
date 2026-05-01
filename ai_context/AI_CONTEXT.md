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

**Eight admin surfaces live** (Overview / Transfers / Transfer Detail / KYC Queue / AML Triage / Users / Cards / **Recipients**). Dashboard prototype under `dashboard/` (Vite + React 18 + TS + Tailwind + shadcn).
- **Overview** (`/`) — KPIs, throughput + status charts, FX spread health, services grid, 20-row recent activity.
- **Transfers Monitor** — list at `/operations/transfers` (200-row table w/ filters, sort, pagination, bulk actions, saved filters, Export CSV in page header).
- **Transfer Detail** at `/operations/transfers/:id` — full forensic view. Non-sticky page header (status / id / amounts / pager / Open user + Open audit outline buttons w/ icons). 12-col body: 8 cards on the left (FX & fees breakdown + rate popover; Sender; Recipient; Card used; AML flags; Internal notes w/ Add note dialog; Provider response — accordion-only toggle, when open shows stats + webhook events + RAW RESPONSE code panel with always-visible Copy; Admin action history); sticky right rail (Status timeline + Action panel — primary action button + secondary actions stacked as outline buttons inline, stuck-detection promotes Force-fail). Mobile bottom action bar (sticky 64px, Timeline / Primary / More via Sheets). 6 action modals (Add note, Resend webhook, Force fail, Mark completed, Reverse, Refund partial — Reverse/Refund have notify-user locked-on per compliance). 11 page-scoped keyboard shortcuts surfaced in the help overlay. Real-time refresh simulation for `processing` transfers (10s tick, 25% chance of advancing to completed + toast). Pager (`j`/`k`) walks the cached filtered list; disabled with tooltip when no list context.
- **KYC Review Queue** at `/operations/kyc-queue` (+ `/:id`) — master-detail (480px list pane + flex detail pane on lg+, single-pane stacked on mobile/tablet via the URL). 30-row deterministic mock spanning 4 edge classes (`clean` / `under_18` / `data_mismatch` / `sanctions_hit`) — 27 pending (4 with assignee = derived "reviewing") + 2 passed + 1 failed; 3 rows surface the soft auto-expire warning chip (>12min). List pane has sort header (newest/oldest), per-row select + select-all, bulk-action sticky bar (X-first layout · "N selected" · Approve / Reject (danger-tinted outline) / Assign to me), 8-row skeleton, empty / filtered-empty / error states. Detail pane has top bar (phone + status + Open user) + scrollable body with EdgeCaseBanners (under-18 / data-mismatch soft / sanctions-hit / expiring-soon) + IdentityCard (bilingual fields, masked PINFL + masked doc number with copy-session-id) + DocumentImageCard (minimal UZ-ID layout — title strip + photo box + 5-field bilingual grid, no flag/emblem/guilloche/watermark — blur overlays on face + ID number, both reveals audit-logged) + MyIdResponseCard (collapsible JSON viewer with Copy + redacted PINFL/doc-number at the data layer) + fixed-bottom ActionBar (Approve / Reject / Request info / Escalate; Approve auto-blocked with tooltip on under_18 / sanctions_hit / non-pending). 4 action modals — Approve (AlertDialog confirm, no reason), Reject (failure-reason select prefilled by edge-case + reason ≥10), Request info (message ≥10, increments `infoRequests` without status change), Escalate (reason ≥10, audit-log only). 8 page-scoped hotkeys (j/k auto-select, Enter, a/r/i/e gated by status, m toggles "Assigned to me" filter) — disabled on touch viewports per spec. Bulk approve uses skip-with-explanation for under_18/sanctions_hit. Advance-to-next-pending after every state-changing action.
- **Users** at `/customers/users` (+ `/:id`) — list/search + full-page detail. List has wide debounced search (300ms) over name/phone/PINFL/email, 6-filter chip row (tier multi · status multi · KYC multi · language multi · Created range single · Has-open-AML toggle), 3-column sortable table on `lg+` (created · last-login · lifetime volume), mobile card stack on `<lg`. Page-header "Add to blacklist" + "Export CSV" actions; row kebab → Block / Unblock / Open AML / Open audit log (Block + Unblock funnel into the detail page so the modal lives in one place). 50-row deterministic mock + cross-store linkage (`u_03 = Sardor Tursunov` shared with `mockTransfers` SENDERS — bumped to tier_2 for the demo profile). Detail page is single-column full-bleed: condensed sticky bar appears when full header scrolls out of view (IntersectionObserver sentinel); full header has avatar(xl) + name + masked PINFL + phone with tel: / Telegram / WhatsApp deep-links + chips (language flag · joined · last login · KYC expiry countdown if <30d) + admin kebab (Block / Unblock / Soft-delete / Re-verify KYC / Add phone to blacklist / Reset device trust / Generate audit report — all behind ≥20-char reason note, soft-delete + recipient hard-delete add a second AlertDialog confirm step). 8 sticky tabs (Overview / KYC / Cards / Transfers / Recipients / AML Flags / Devices / Audit) with `?tab=...` deep-link query-param + `1..8` hotkey jumps + `b` (block) + `e` (open audit) on `lg+`. AML tab shows live count badge. Overview tab has KPI trio (lifetime volume compact / tx count / success rate %) + side-by-side recharts (BarChart for monthly volume × 12 buckets, PieChart donut for status breakdown) + LimitsCard (daily/monthly progress bars colored ≥80% warning / ≥100% danger; tier_0 surfaces "limits not yet active" body) + 10-row recent-activity feed pulling from `mockTransfers` filtered by user_id (links land on `/operations/transfers/:id?context=user&user_id=...` so the transfer-detail pager scopes to this user). Cards tab is a 2-col grid with Freeze/Unfreeze inline buttons (≥20-char reason). Block side-effect auto-freezes every active card and cross-syncs to AML's `liveUsers` via `blockAmlUser()`. Generate-audit-report stubs PDF generation with a 1.2s loading toast → "ready" toast (no real PDF). Add-phone-to-blacklist navigates to `/blacklist/new?type=phone&identifier=...` (still a Placeholder route — query params will be read when blacklist is built).

**AML Triage** at `/operations/aml-triage` (+ `/:id` + `/new`) — master-detail (520px list pane + flex detail pane on lg+, single-pane stacked on mobile/tablet via the URL). 26-flag deterministic mock spanning 5 typed-context shapes (velocity / amount / pattern / sanctions / manual): 19 status=open (3 critical = 2 sanctions + 1 amount-anomaly · 12 warning · 4 info) + 7 status=reviewing (mix). Per-type structured `context` jsonb (now in [`docs/models.md`](../docs/models.md) §5.1). List rows are 4-line: severity badge + type chip + status / phone + masked PINFL + age / 80-char description / optional Tx-prefix + Reviewing pill. Critical rows pin to top regardless of user-selected sort; sanctions rows get a red shield prefix. Page-top **CriticalBanner** appears when any open+critical+unassigned flag exists (CTA "Assign first to me" claims oldest unassigned critical). Detail pane has top bar (severity + type + flag-id mono+copy + status + age) + scrollable body with **SanctionsBanner** (when applicable, top of detail) + UserCard (lifetime stats, BLOCKED chip when `users.status='blocked'`) + LinkedTransferCard (transfer summary + Open transfer) + FlagContextCard (typed-decorated per flag type — velocity has count + threshold + sparkline; amount has σ count + multiplier; pattern has rule + signal + description; sanctions has list + matched name + score + handle; manual has filer + note — plus collapsible raw JSON viewer with bigint-safe replacer + Copy) + resolution-notes echo (terminal status). 4 action modals — Clear (4 reason codes + ≥20 char notes; **permanently disabled for sanctions** with tooltip), Escalate (≥20 char reason; for **sanctions auto-fills compliance template** that reviewer must edit ≥30 chars beyond template; for **critical-severity warns of auto-block** + AlertDialog confirm), Reassign (admin select with "Unassigned" option), Assign to me (no modal). State transitions wired with `users.status='blocked'` side-effect on critical escalate; in-memory audit-log store with 6 action types. 6 page-scoped hotkeys (j/k auto-select / Enter / c clear / e escalate / m claim / a reassign) — disabled on touch viewports. **Manual flag full-page form** at `/new` (typeahead user picker + transfer-id-prefix picker + severity radio + type select + JSON context textarea + ≥20 char note); module-level `extraManualFlags` store so submissions appear on remount.

**Cards** at `/customers/cards` (+ `/:id`) — list/search + full-page detail. **`mockCards.ts` is the single source of truth for linked-card data** — `mockUsers.getUserCards/freezeCard/unfreezeCard` are now thin wrappers; the user-detail Cards tab + Users `linkedCardsCount` derive directly from it. 80-card deterministic mock across 33 distinct owners (existing `c_01`/`c_02`/`c_sa_uz`/etc. cardIds preserved so `?card_id=` ↔ Transfers history resolves). Status mix: 73 active / 4 frozen (3 auto-frozen on user-block + 1 admin-frozen) / 2 expired (1 deleted-user historic + 1 admin-active suspicious lifecycle) / 1 removed. List has wide debounced search (300ms) over PAN / holder / bank / owner phone-or-name, 6-filter chip row (scheme multi · status multi default `[active,frozen]` · bank searchable-multi · country multi · last-used **`DateRangePicker`** + Never-used toggle · Default-only toggle), sortable desktop table (created · last-used · expiry) on `lg+`, mobile card stack on `<lg`. Each row: scheme logo + masked PAN + bank + holder + country (UZ flag) + owner phone (links to `/customers/users/:id`) + status pill (frozen carries `Lock` icon + amber inset-shadow row indicator) + default brand-dot + last-used relative + created date + kebab (Open owner / Open transfers on this card / Copy token). Page header carries Export CSV. Detail page is single-column with inline header (back-link / scheme logo + masked PAN + status pill + default badge), then PrivacyBanner (PAN/CVV/holder-doc never displayed + admins-cannot-unlink-policy line), 2-col card-details + owner cards on `lg+`, full-width recent-activity card (desktop table + mobile list, "View all {count} transfers" outline button in card header, Showing-N-of-M caption at the bottom), and a fixed-bottom action bar. **Action bar layout**: mobile = 2-row grid (Freeze/Unfreeze + Copy token, Open transfers `col-span-2`); desktop (`lg+`) = single flex row with Freeze on the left, spacer, Copy token + Open transfers on the right. **Action bar position**: `fixed inset-x-0 bottom-0 md:left-[var(--sidebar-width,4rem)]` — left edge tracks the live sidebar width (64px collapsed / 240px expanded) via a CSS var set by AppShell. 2 action modals only — Freeze (4-option severity dropdown + ≥10 char reason, warning tone) + Unfreeze (≥10 char reason, prior-freeze-reason echo). **Force-expire was deliberately removed** — admin-unilateral termination of a card conflicts with the user-only-unlinks policy already covered in the privacy banner; backend `expired` enum stays for natural acquirer-driven expiry. Page-scoped hotkeys: `b`/Backspace back · `f` freeze (active) · `u` unfreeze (frozen) · `c` copy token. Card-context filter on Transfers list + transfer-detail pager (`?context=card&card_id=...`) with a dismissible context banner above the filter chips.

**Recipients** at `/customers/recipients` (+ `/:id`) — list/search + full-page detail. **`mockRecipients.ts` is the single source of truth for saved-recipient data** — `mockUsers.getUserRecipients/hardDeleteRecipient` are now thin wrappers; the user-detail Recipients tab consumes the new module. 60-recipient deterministic mock across 30 distinct owners (existing IDs `r_u01_01`/`r_u02_01`/`r_u03_01`/`r_u03_02` preserved). Destination mix: 36 alipay (60%) / 24 wechat (40%); 12 favorited / 48 non-favorited. Identifier types: CN mobile (`13800138000`), Alipay email, WeChat ID (`wxid_*`). Display names mix Pinyin (Wang Lei), CJK (`张伟`, `李娜`, `王芳`), Latin — all rendered verbatim, no transliteration. Some carry user-saved nicknames ("Mom", "Yiwu supplier", "Guangzhou hostel"). `transferCount` and `totalVolumeUzsTiyins` are stored as denormalized aggregates per recipient (mockTransfers' SENDERS pool only covers u_01..u_05, so derivation alone can't represent the long-tail spec; the seed values stand in for the rest). The detail page's "Last 5 transfers" mini-list filters `TRANSFERS_FULL` by the canonical `(userId, destination, identifier)` tuple. List has wide debounced search (300ms) over identifier / display-name / nickname / owner phone-or-name, 3-filter chip row (destination multi · favorites-only toggle · last-used `<DateRangePicker>` per Cards canonical pattern), sortable desktop table (created · last-used · transfer-count) + mobile card stack on `<lg`. Each row: destination badge · monospaced identifier · display name · nickname · owner phone (links to `/customers/users/:id`) · favorite star · transfer count · last-used relative · created date · kebab (Open owner / Open transfers / Delete). CSV export. Detail page is single-column full-bleed with inline header (back-link / destination badge + monospaced identifier + display name + favorite chip / chips row: created · last-used · nickname), 2-col card-grid on `lg+` (DisplayInfoCard + OwnerCard), full-width UsageCard with 4 KPI tiles (transfer count · total volume · first-used · last-used) + last-5 transfers (desktop table + mobile list) + "View all {count} transfers" CTA, and a fixed-bottom action bar carrying a single Hard-delete button. Action bar position: `fixed inset-x-0 bottom-0 md:left-[var(--sidebar-width,4rem)]` (canonical pattern). 1 action modal only — HardDeleteRecipientDialog (Dialog with ≥20-char reason note + danger-toned warning banner, then AlertDialog 2-step confirm). **No edit action** — recipients are user-owned data per spec; admin should not silently rewrite them. Page-scoped hotkeys: list = `j`/`k`/`Enter`/`/`; detail = `b`/Backspace back · `Delete` open hard-delete confirm. Recipient-context filter on Transfers list + transfer-detail pager (`?context=recipient&recipient_id=...`) with a dismissible context banner above the filter chips and a back-link that returns to the recipient detail page.

Next phases: the rest of the 11 placeholder routes — driven by user prompts. Mobile app and full brand work still pending. Build-progress snapshot lives in [`docs/product_states.md`](../docs/product_states.md).

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
| Table column-header style | **locked** (LESSONS 2026-05-02) — Title Case + `text-sm font-medium text-muted-foreground` everywhere — no `uppercase`, no `tracking-wider`, no `text-xs`, no active-sort color differential. Active-sort state is conveyed by the arrow icon only. Applied to `<TableHead>` primitive + every `SortableHeader` / custom `Th` button across the codebase |
| Detail-page header convention | **locked** (LESSONS 2026-05-02) — inline (NEVER `position: sticky`); structure is back-link / identity / chips. Back link is `<ArrowLeft h-4 w-4> Back to <list>` — i18n strings authored without the `← ` text prefix (which double-rendered alongside the icon). User / Transfer / Card detail pages all conform |
| Detail-page action-bar position | **locked** (LESSONS 2026-05-02) — `fixed inset-x-0 bottom-0 md:left-[var(--sidebar-width,4rem)]`. AppShell exposes the live sidebar width as a CSS var (64px collapsed / 240px expanded) so the bar's left edge tracks the actual sidebar. Page wrapper carries `pb-28` to clear the overlay. Earlier hardcoded `md:left-16` is forbidden. Applied to KYC / AML / Cards action bars + Transfer-detail mobile bar |
| Routes (admin) | **partially nested** — Transfers + KYC Queue + AML Triage use nested `/operations/*` paths; **Users** uses nested `/customers/users` + `/:id`. Other admin pages stay flat (`/services`, `/fx-config`, etc.) until each phase migrates them. Sidebar entries for the nested pages point to the nested paths; `/transfers`, `/kyc-queue`, `/aml-triage`, `/users`, `/users/:id` all redirect to their nested forms for back-compat |
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
| Users page user-id overlap | **locked** — `mockUsers.ts` IDs `u_01..u_05` deliberately overlap with `mockTransfers.ts` SENDERS so the Transfers / KYC / AML tabs filter cleanly by `userId`. The detailed demo profile is `u_03 = Sardor Tursunov` (tier_2). When new mocks land, allocate IDs >= `u_51` to avoid collisions |
| Users admin actions | **locked — every state-changing action requires ≥20-char reason note**. Block freezes all linked active cards as a side effect (cards stay frozen on Unblock — admin must unfreeze each individually). Soft-delete and Recipient hard-delete use a 2-step Dialog → AlertDialog confirm. Generate-audit-report stubs PDF generation (1.2s loading toast → "ready" toast). Add-phone-to-blacklist navigates to `/blacklist/new?type=phone&identifier=...` with pre-fill query params (the route is still Placeholder; will read params when built) |
| Users sticky-condense header | **locked** — full header at top with avatar(xl) + name + chips; an IntersectionObserver sentinel triggers a thin sticky bar (avatar(sm) + name + tier + status + admin kebab) when the full header scrolls out of view. First sticky-condense pattern in the codebase |
| Users tabs deep-linking | **locked** — `?tab=overview\|kyc\|cards\|transfers\|recipients\|aml\|devices\|audit` query param drives the active tab (one route, eight tab states). `1..8` hotkey jumps to each tab on `lg+`; `b` opens the Block dialog; `e` jumps to the Audit tab |
| MyID is the hard gate for transfers | **locked** — only users with an active passing MyID (effectively `tier === 'tier_2'`) can initiate transfers. `tier_0` (just signed up) and `tier_1` (phone OTP only) are both **partial-registration** states with `0 / 0` daily and monthly limits in `_TIER_LIMITS_TIYINS`. The LimitsCard renders distinct "verify MyID to enable transfers" copy per tier; the seed enforces the rule (no cards, no transfers, no PINFL for `tier_1` partial-registration users; `tier_1 + kyc=expired` keeps historic stats since they were once `tier_2`) |
| Users PINFL nullability | **locked** — `users.pinfl` is `string \| null`. Populated only after MyID has passed at least once (`kycStatus ∈ {passed, expired}`). All consumers (search, filter, CSV export, `getUserKycHistory`) handle `null` safely. UI hides the PINFL row entirely on the detail header + mobile card stack; the desktop table shows an italic "PINFL not yet verified" placeholder so row heights stay consistent |
| Users lifetime stats are derived | **locked** — `lifetimeVolumeUzsTiyins`, `lifetimeTransferCount`, `getUserMonthlyVolume`, `getUserStatusBreakdown`, `getUserSuccessRatePct`, and `getUserLimitUsage` (today's / this-month's used) all derive from `TRANSFERS_FULL` filtered by `userId`. The seed's `lifetimeUzs` / `txCount` fields are ignored. Result: the user-detail KPI tile, monthly chart, status donut, recent activity feed, Transfers tab, and limits-used progress bars stay in sync with each other |
| MyID profile card | **locked** — when `kycStatus ∈ {passed, expired}` and `pinfl` is non-null, [`UserKycTab`](../dashboard/src/components/users/tabs/UserKycTab.tsx) renders a [`MyIdProfileCard`](../dashboard/src/components/users/cards/MyIdProfileCard.tsx) below the current-tier card. Five sections (identity / document / contacts / address / verification metadata) + a tone-coded match-score badge (≥95% green / ≥85% amber / red below) + a collapsible raw JSON viewer with a `replacer` that masks `pinfl` and `pass_data` so the raw view never leaks unmasked values. Sardor (`u_03`) gets a hand-authored realistic Uzbek MyID payload; other passed-KYC users get a deterministic synthesized response |
| Users header layout | **locked** — top row: avatar(xl) + name + masked PINFL all share one flex-wrap line at every breakpoint. Below row: phone (tel:) + Telegram brand pill (`bg-[#229ED9]`) + WhatsApp brand pill (`bg-[#25D366]`) + email — sibling of the avatar/name row, starts from the left, not nested under the name. Right group on the same row at md+ wraps to a new line on mobile but keeps tier badge + status badge + admin kebab inline (no orphaned kebab on its own line) |
| Users KYC tab structure | **locked** — three cards: `Current tier` summary (tier badge + verified-at + expires-at + masked doc-number + Re-verify button); `MyIdProfileCard` (5 sections + collapsible raw JSON, only when KYC passed); `Verification history` table |
| Users tabs strip | **locked — not sticky** — bottom-underline style with brand-tinted active text (`text-brand-700` + `border-brand-600`). Strip's own `border-b` provides the baseline; each tab's `-mb-px` makes the active brand underline punch the strip line cleanly. AML count badge recolors when the AML tab is active |
| Users card tile surface | **locked** — Cards / Recipients / Devices tab tiles use `bg-card text-card-foreground shadow-sm rounded-md border` (matches shadcn `<Card>`) instead of the page-bg `bg-background` to stand out against the page surface |
| Users search bar surface | **locked** — `Input` with `bg-card h-10 shadow-sm` so the search field is a distinct surface above the page bg (was `bg-background` which blended in) |
| Users tier filter labels | **locked** — descriptive: `Tier 0 · Just signed up`, `Tier 1 · Phone OTP only`, `Tier 2 · MyID verified` |
| Users language filter / chip | **dropped** — neither the list-page filter nor the detail-page header chip surfaces `preferred_language`. Underlying schema field stays in mock data + CSV export — just not user-facing in the dashboard |
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
│       ├── components/users/          # Pattern layer for the Users surface
│       │   ├── types.ts                # filter shape + applyFilters/applySort
│       │   ├── filterState.ts          # module-level cache (round-trip)
│       │   ├── UsersFilterBar.tsx      # search + chip row (tier / status / kyc / language / created / has-aml)
│       │   ├── UsersTable.tsx          # desktop sortable table (created / last-login / volume) + UserStatusBadge
│       │   ├── UsersMobileCardStack.tsx # <lg card stack
│       │   ├── UserAvatar.tsx          # initials circle (sm / md / lg / xl)
│       │   ├── UserHeader.tsx          # full header + sticky-condense bar via IntersectionObserver
│       │   ├── UserAdminMenu.tsx       # kebab dropdown (7 admin actions)
│       │   ├── UserTabs.tsx            # sticky scroll-x tab strip with AML count badge
│       │   ├── tabs/*.tsx              # 8 tab components (Overview/Kyc/Cards/Transfers/Recipients/Aml/Devices/Audit)
│       │   ├── cards/*.tsx             # KpiTrio, LimitsCard, MonthlyVolumeChart, TransfersByStatusDonut
│       │   └── modals/*.tsx            # UserActionDialog (5 admin actions), GenerateAuditReportDialog, UntrustDeviceDialog, CardActionDialog (freeze/unfreeze), HardDeleteRecipientDialog
│       ├── components/cards/          # Pattern layer for the Cards surface
│       │   ├── types.ts                # filter shape + applyFilters/applySort + DEFAULT_LAST_USED_RANGE
│       │   ├── filterState.ts          # module-level cache (round-trip)
│       │   ├── CardsFilterBar.tsx      # search + chip row (scheme / status / bank / country / last-used DateRangePicker / never-used / default-only)
│       │   ├── CardsTable.tsx          # desktop table (sortable: created / last-used / expiry) + CardStatusPill
│       │   ├── CardsMobileCardStack.tsx # <lg card stack
│       │   ├── CardActionBar.tsx       # fixed-bottom action bar (mobile 2-row grid, desktop single flex row with spacer)
│       │   ├── cards/*.tsx             # CardDetailsCard, CardOwnerCard, CardRecentActivityCard (desktop table + mobile list), PrivacyBanner
│       │   └── modals/*.tsx            # FreezeCardDialog (4-option severity), UnfreezeCardDialog
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
│       ├── components/recipients/      # Pattern layer for the Recipients surface
│       │   ├── types.ts                 # filter shape + applyFilters/applySort + DEFAULT_LAST_USED_RANGE
│       │   ├── filterState.ts           # module-level cache (round-trip)
│       │   ├── RecipientsFilterBar.tsx  # search + chip row (destination · favorites-only · last-used DateRangePicker)
│       │   ├── RecipientsTable.tsx      # desktop sortable table (created · last-used · transfer-count) — Title Case headers per LESSON 2026-05-02
│       │   ├── RecipientsMobileCardStack.tsx # <lg card stack
│       │   ├── RecipientActionBar.tsx   # fixed-bottom single-button bar (Hard-delete only)
│       │   ├── cards/*.tsx              # DisplayInfoCard, OwnerCard, UsageCard (4 KPI tiles + last-5 transfers + "View all" CTA)
│       │   └── modals/*.tsx             # HardDeleteRecipientDialog (Dialog → AlertDialog 2-step confirm, ≥20-char reason)
│       ├── data/mockUsers.ts          # 50-user deterministic mock + Sardor demo profile + per-user devices/limit-usage/kyc-history + admin mutators (block/unblock/soft-delete/untrust/hard-delete-recipient/reset-devices/reverify-kyc/blacklist-phone/generate-report) + cross-store sync to AML's blockAmlUser AND to mockCards.freezeAllUserActiveCards on block. Card data + freeze/unfreeze are re-exports from mockCards. Recipient data + hard-delete are wrappers around mockRecipients (single source of truth)
│       ├── data/mockCards.ts          # 80-card deterministic mock across 33 owners (single source of truth for card data) + helpers (listCards/getCardById/getCardsByUserId/getDistinctBanks/getDistinctCountries/getCardCountsByStatus/isExpiringSoon) + mutators (freezeCard/unfreezeCard/freezeAllUserActiveCards/recordTokenCopy) + audit-log store. Existing mockTransfers cardIds (c_01..c_be_h) preserved so ?card_id= filter on Transfers resolves end-to-end
│       ├── data/mockRecipients.ts     # 60-recipient deterministic mock across 30 distinct owners (single source of truth for saved-recipient data) + helpers (listRecipients/getRecipientById/getRecipientsByUserId/getRecipientCounts/getRecipientTransfers) + mutator (hardDeleteRecipient) + audit-log store. Existing IDs r_u01_01/r_u02_01/r_u03_01/r_u03_02 preserved. transferCount + totalVolumeUzsTiyins stored as denormalized aggregates; getRecipientTransfers filters TRANSFERS_FULL by (userId, destination, identifier) tuple for the detail page's last-5 mini-list
│       └── pages/{Overview,Transfers,TransferDetail,KycQueue,AmlTriage,AmlTriageNew,Users,UserDetail,Cards,CardDetail,Recipients,RecipientDetail,Placeholder}.tsx + router.tsx
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
- ☑ Admin Users surface (Phase 6) — DONE — list at `/customers/users` (50-row mock + 6-filter chip row + sortable desktop table + mobile card stack + Export CSV) + full-page detail at `/customers/users/:id` (sticky-condense header + 8 tabs Overview/KYC/Cards/Transfers/Recipients/AML/Devices/Audit with `?tab=` deep link + 11 admin/contextual modals + cross-store sync to AML `liveUsers` on Block / soft-delete). First sticky-condense header in the codebase. KPI trio + recharts BarChart (monthly volume) + PieChart donut (status breakdown) + LimitsCard with progress bars + 10-row recent activity feed
- ☑ Admin Cards surface (Phase 7) — DONE — list at `/customers/cards` (80-card mock across 33 owners; mockCards is single source of truth, mockUsers thin wrappers) + full-page detail at `/customers/cards/:id` (inline header matching User/Transfer convention, 2-col card-details + owner cards, recent-activity card with desktop table + mobile list + "View all {count} transfers" outline button, fixed-bottom action bar tracking `--sidebar-width` CSS var). 6-filter chip row including DateRangePicker for last-used. 2 action modals (Freeze with severity dropdown / Unfreeze) — Force-expire deliberately removed. `?context=card&card_id=` filter wired into Transfers list + transfer-detail pager + back-link preservation. Three convention-locking lessons logged 2026-05-02 (table-header style, detail-page-header consistency, action-bar fixed-bottom + `--sidebar-width` CSS var)
- ☑ Admin Recipients surface (Phase 8) — DONE — list at `/customers/recipients` (60-recipient mock across 30 owners; mockRecipients is single source of truth, mockUsers thin wrappers; preserves existing r_u01_01/r_u02_01/r_u03_01/r_u03_02 IDs) + full-page detail at `/customers/recipients/:id` (inline header / DisplayInfoCard + OwnerCard 2-col / full-width UsageCard with 4 KPI tiles + last-5 transfers mini-list + "View all" CTA / fixed-bottom action bar with single Hard-delete button). 3-filter chip row (destination · favorites-only · last-used DateRangePicker). 1 action modal (HardDeleteRecipientDialog — Dialog → AlertDialog 2-step confirm, ≥20-char reason). No edit action — recipients are user-owned data. `?context=recipient&recipient_id=` filter wired into Transfers list + transfer-detail pager + back-link preservation. CJK display names render verbatim (no transliteration). Visa/MC remain absent from this surface (recipients are Alipay/WeChat only by domain).
- ☐ Other 11 admin sub-pages — placeholder routes, content TBD (`/blacklist`, `/kyc-tiers`, `/audit-log`, `/fx-config`, `/commission-rules`, `/services`, `/app-versions`, `/error-codes`, `/stories`, `/news`, `/notifications`)
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
