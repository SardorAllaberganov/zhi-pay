# Change History

> Chronological log of significant changes. Updated after every meaningful change via `/doc_sync`.

---

### 2026-04-29 — Build admin-dashboard foundation (Vite + React 18 + TS + Tailwind + shadcn) under `dashboard/`

- **Summary**: Scaffolded a working static React prototype at `dashboard/` per the user's Phase-1 spec. Stack: Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui (canonical) + lucide-react + recharts + react-router-dom + cmdk + sonner + class-variance-authority + tailwind-merge + tailwindcss-animate + Inter (UI) + JetBrains Mono (numerics). Brand anchor `#0a64bc`. Full token set (brand-50→950, slate, semantic, shadcn light/dark, radii, shadows, motion). 20 shadcn primitives + 10 ZhiPay domain primitives (StatusBadge, TierBadge, SeverityBadge, Money, MaskedPan, SchemeLogo with stylized placeholder SVGs, StatusTimeline, ErrorCell, KeyboardHint, ReviewQueueRow). AppShell + collapsible Sidebar (240/64px, 6 sections, 19 nav items, mobile drawer) + TopBar (breadcrumbs, ⌘K trigger, theme toggle, notifications, user menu) + CommandPalette + HelpOverlay. Global keyboard shortcuts (⌘K, ?, /, t, Esc, g+{o,t,k,a,u,c,r,f,s,l,b,n}). Overview page: 4 KPI cards w/ sparklines, status-breakdown donut, throughput line chart, services-health grid (7 services), recent activity table (10 transfers). 18 placeholder routes wired up so `g+<key>` shortcuts work end-to-end. Mock data: 6 users, 5 cards, 10 transfers, 2 KYC verifications, 3 AML flags, FX rate, commission rule, 7 services, 9 error codes — all Uzbek context. `npm install` clean (304 packages), `npx tsc --noEmit` passes, `npx vite build` 244 KB gzipped, `npm run dev` boots in 212 ms with HTTP 200 on `/`.
- **Files created (under `dashboard/`)**: project shell (`package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `index.html`, `.gitignore`, `components.json`, `public/favicon.svg`); entry (`src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`, `src/router.tsx`, `src/styles/globals.css`); lib + types (`src/lib/{utils,i18n}.ts`, `src/types/index.ts`); provider (`src/providers/ThemeProvider.tsx`); hook (`src/hooks/useKeyboardShortcuts.ts`); data (`src/data/mock.ts`); shadcn UI (`src/components/ui/{button,badge,card,input,label,dialog,sheet,dropdown-menu,tooltip,popover,command,table,separator,skeleton,avatar,scroll-area,alert,alert-dialog,tabs,checkbox}.tsx`); layout (`src/components/layout/{AppShell,Sidebar,TopBar,CommandPalette,UserMenu,ThemeToggle,HelpOverlay,ZhiPayLogo}.tsx`); ZhiPay primitives (`src/components/zhipay/{StatusBadge,TierBadge,SeverityBadge,Money,MaskedPan,SchemeLogo,StatusTimeline,ErrorCell,KeyboardHint,ReviewQueueRow}.tsx`); pages (`src/pages/{Overview,Placeholder}.tsx`). ~50 files, ~3000 LOC.
- **Files modified**: `ai_context/LESSONS.md` (3 new lessons added: never commit without explicit `/commit`; dashboard content full-bleed — no `max-width` on `<main>` children; typography 13px floor + `text-xs` reserved for chips/kbd/uppercase only). `ai_context/AI_CONTEXT.md` (current phase, decisions, file map, active workstreams refreshed). `ai_context/HISTORY.md` (this entry).
- **Docs updated**: `ai_context/AI_CONTEXT.md`, `ai_context/HISTORY.md`.
- **Key decisions**: Dashboard tech stack locked. Brand color anchor `#0a64bc` (placeholder, full brand pending). Type scale: `xs=13 / sm=14 / base=15 / lg=16 / xl=18 / 2xl=22 / 3xl=28 / 4xl=36`. `text-xs` reserved for chips/kbd/uppercase only — flowing meta text uses `text-sm`. Main content area is full-bleed at all widths (no `max-width`). Inline `style={{ fontSize: <13 }}` forbidden (including in recharts `contentStyle`).
- **Open items**: Real brand assets (UzCard / Humo / Visa / Mastercard logos, ZhiPay wordmark) — currently stylized SVG placeholders. 18 placeholder routes (`/transfers`, `/kyc-queue`, `/aml-triage`, `/users`, `/cards`, `/recipients`, `/fx-config`, `/commission-rules`, `/audit-log`, `/blacklist`, `/kyc-tiers`, `/services`, `/app-versions`, `/error-codes`, `/stories`, `/news`, `/notifications`, fallback) — content lands in future phases. No backend / API — data hardcoded in `src/data/mock.ts`. No real auth — assumes super-admin signed in.

---

### 2026-04-28 — Add `/doc_sync` slash command

- **Summary**: Created `/doc_sync` slash command to keep `docs/` and `ai_context/` aligned after meaningful changes. Uses `git diff --name-only` for change detection (assumes git is set up). Takes optional free-text `[scope-hint]` argument that becomes the HISTORY entry title. Proposes the full update package and waits for approval before writing. Scoped to `docs/` and `ai_context/` only — `.claude/rules/`, `CLAUDE.md`, and `LESSONS.md` remain manual. Updated `CLAUDE.md` commands list to surface `/start_task` and `/doc_sync` first and rename `/sync_docs` → `/doc_sync`.
- **Files created**: `.claude/commands/doc_sync.md`
- **Files modified**: `CLAUDE.md` (commands list reordered + renamed)
- **Docs updated**: `ai_context/HISTORY.md`

---

### 2026-04-28 — Restyle `ai_context/` folder (UPPERCASE filenames + HISTORY format)

- **Summary**: Renamed orientation files to UPPERCASE (`ai_context.md` → `AI_CONTEXT.md`, `lessons.md` → `LESSONS.md`, `history.md` → `HISTORY.md`) for consistency with reference convention. Reformatted `HISTORY.md` to use bullet-field style (`Summary`, `Files created`, `Files modified`, `Docs updated`) per example. Updated all cross-references in `CLAUDE.md`, `.claude/commands/start_task.md`, and `AI_CONTEXT.md` file map to point at the new uppercase paths.
- **Files renamed**: `ai_context/ai_context.md → AI_CONTEXT.md`, `ai_context/lessons.md → LESSONS.md`, `ai_context/history.md → HISTORY.md`
- **Files modified**: `CLAUDE.md` (Sources of Truth table, Self-Improvement Loop), `.claude/commands/start_task.md` (steps 3, 5, 6), `ai_context/AI_CONTEXT.md` (file-map block), `ai_context/HISTORY.md` (full restyle)
- **Docs updated**: `ai_context/HISTORY.md`

---

### 2026-04-28 — Initial project bootstrap (docs + design rules + AI scaffolding)

- **Summary**: Started from a single legacy HTML schema. Built data model reference (7 domains: Identity & KYC, Cards & Wallet, Transfers, Limits & Compliance, Commissions, Errors & Notifications, Services & CMS). Wrote PRD with personas, KYC tier table, features, sequence flows, state machines, NFRs, open questions. Extracted 8 mermaid diagrams to dedicated files. Authored slim workflow orchestrator (`CLAUDE.md`) plus 13 detailed rule files in `.claude/rules/`. Set up `ai_context/` orientation folder. Created `/start_task` slash command. Schema gaps fixed vs original HTML: KYC tier table that drives transfer limits, wallet ledger, transfer events, Visa / Mastercard support, recipients table, AML flags, user devices, user limit usage, MyID validity expiry.
- **Docs created**: `docs/models.md`, `docs/product_requirements_document.md`, `docs/mermaid_schemas/feature_overview_mindmap.md`, `docs/mermaid_schemas/onboarding_flow.md`, `docs/mermaid_schemas/card_linking_flow.md`, `docs/mermaid_schemas/transfer_send_flow.md`, `docs/mermaid_schemas/transfer_failure_recovery_flow.md`, `docs/mermaid_schemas/transfer_state_machine.md`, `docs/mermaid_schemas/kyc_state_machine.md`, `docs/mermaid_schemas/card_state_machine.md`
- **Rules created**: `.claude/rules/core-principles.md`, `.claude/rules/design-system-layers.md`, `.claude/rules/kyc-tiers-and-limits.md`, `.claude/rules/money-and-fx.md`, `.claude/rules/status-machines.md`, `.claude/rules/error-ux.md`, `.claude/rules/card-schemes.md`, `.claude/rules/localization.md`, `.claude/rules/accessibility.md`, `.claude/rules/admin-dashboard-patterns.md`, `.claude/rules/acceptance-criteria.md`, `.claude/rules/handoff.md`, `.claude/rules/design-review-checklist.md`
- **Commands created**: `.claude/commands/start_task.md`
- **Orientation files created**: `ai_context/AI_CONTEXT.md`, `ai_context/LESSONS.md`, `ai_context/HISTORY.md`
- **Files modified**: `CLAUDE.md` (initial empty → slim orchestrator with `ai_context/` integration)
- **Files flagged stale**: `zhipay_database_schema.html` (kept on disk; marked not authoritative in `CLAUDE.md` and `AI_CONTEXT.md`)
- **Key decisions**: Senior product designer role (10+ years, fintech / payments). Two surfaces — mobile (primary) + internal admin dashboard (secondary). Customer-facing web is v1 non-goal. Stack-agnostic (no implementation framework). Design system from scratch, no Figma yet. `docs/` is source of truth; `.claude/rules/` is how-to-design-against-it; `ai_context/` is orientation.
- **Open items**: 5 product questions carried in PRD §12. KYC tier limits are placeholders pending Compliance sign-off. Brand identity not started. Tech stack not chosen.

---
