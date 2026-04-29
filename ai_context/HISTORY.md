# Change History

> Chronological log of significant changes. Updated after every meaningful change via `/doc_sync`.

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
