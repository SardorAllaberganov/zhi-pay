# Change History

> Chronological log of significant changes. Updated after every meaningful change via `/doc_sync`.

---

### 2026-05-04 — `/doc_sync` checkpoint — primitive-count drift fixed (shadcn 21→25, ZhiPay 12→19) + foundation row extended

- **Summary**: Post-Phase-22b `/doc_sync` discovered the shadcn and ZhiPay primitive counts in `docs/product_states.md` + `ai_context/AI_CONTEXT.md` had been drifting since around Phase 10 — never updated as later phases added Switch / Select / OTP / scroll-area / qr-placeholder shadcn primitives, and as several pattern-layer components (LocaleFlag · LocaleTabInputs · LocaleTabTextarea · PhoneMockup) were lifted to `components/zhipay/` to satisfy the 3rd-consumer rule. Updated both docs to reflect current state: shadcn primitives (25) · ZhiPay domain primitives (19, ending with WriteButton from Phase 22b).
- **Verified**: `ls dashboard/src/components/ui/ | wc -l` = 25 · `ls dashboard/src/components/zhipay/ | wc -l` = 19. No code change.
- **Files modified**:
  - `docs/product_states.md` — Foundation table primitive-count rows updated; ZhiPay primitive list extended with the lifted primitives + WriteButton
  - `ai_context/AI_CONTEXT.md` — File-tree comment block updated (counts + lift sequence + new `components/system/*` line); workstreams entry "ZhiPay primitives" line refreshed

- **Other docs verified clean (no cascade needed)**:
  - `docs/models.md` — no schema changes (Phase 22+22b are mock-only operational layers; D1=a kept the system-event enum out of the central audit-log table)
  - `docs/product_requirements_document.md` — no PRD/persona/feature changes (error/maintenance/offline states are operational UX, not product features)
  - `docs/mermaid_schemas/*` — no flow / state-machine changes (no new entity transitions)

---

### 2026-05-04 — Phase 22b — gap-fill on Error & System States · outside-shell 404 organic flow · `<WriteButton>` offline-aware primitive applied across 7 action bars · `lib/offlineActionQueue` (queue + replay on reconnect) · `useDraftPreservation` hook with maintenance-flip toast · 3 deviation fixes (mobile icon 96, autofocus primary CTA, overlay max-h 80vh)

- **Summary**: Audited Phase 22 against the spec, identified 4 unbuilt items + 3 minor deviations, then built all of them. Six new files + selective sweep across 7 existing surfaces. Build remains clean. **No schema cascade** — operational states are mock-only.

  **(1) Outside-shell 404 organic flow** — new `<PathAwareAuthGuard>` in `router.tsx` wraps the catch-all `*` route. When a request is signed-out AND the pathname doesn't match any known top-level prefix, it renders the full-bleed `<NotFoundState />` directly instead of redirecting to `/sign-in?next=...` first. The spec's intent is that a malformed deep-link is communicated up-front, not after the user authenticates. Known-prefixes list (`/operations/`, `/customers/`, `/finance/`, `/compliance/`, `/system/`, `/content/`, `/settings`, plus the Phase 11+ back-compat flat routes for `/transfers`, `/users`, `/cards`, etc.) is maintained alongside the route registrations in the same file. Signed-in users always fall through to `<AuthGuard>` — the in-shell `<NotFound>` inside `AppRoutes` handles unknown paths for them.

  **(2) Offline write gating** — new `<WriteButton>` primitive in `components/zhipay/` (drop-in replacement for `<Button>` that gates on `useNetworkState()`). When offline, renders disabled + surfaces an `admin.system.offline.action.disabled-tooltip` Tooltip ("Reconnect to perform this action."). Tooltip wrapping pattern uses a `<span tabIndex={0}>` around the disabled button so Radix's TooltipTrigger still receives hover/focus events (a `disabled` button doesn't fire mouseenter, blocking the tooltip otherwise). Forwards `ref` + the standard Button prop surface. Swept across 7 sticky-bottom action bars: KYC Queue (Reject / Request info / Escalate + Approve when not domain-disabled) · AML Triage (Escalate / Assign-me / Reassign + Clear when not domain-disabled) · Cards Detail (Freeze / Unfreeze) · Recipients Detail (Hard-delete) · Blacklist Detail (Edit reason / Extend / Remove) · Notifications Compose (Send/Schedule) · Notifications Cancel-Scheduled (Cancel button). Domain-disabled buttons (KYC Approve gated by under-18 / sanctions; AML Clear gated by sanctions / terminal) keep their existing reason-tooltip wrap; offline gating layers in only when the button isn't already domain-disabled. Read-only actions (Copy token, Open transfers, Open audit log) and ghost cancel buttons stay as plain `<Button>` — they don't mutate state.

  **(3) Offline action queue + replay-on-reconnect** — new `lib/offlineActionQueue.ts` exposes `tryWriteOrQueue({label, executor})`. When online, runs the executor synchronously and returns `'executed'`. When offline, queues for replay and returns `'queued'`. Module-level `window.addEventListener('online', …)` drains the queue on reconnect (synchronously, in order) and fires a single `toast.success(t('admin.system.offline.toast.synced').replace('{n}', N))`. Replay errors caught + logged to console; one failure doesn't block the rest. Wired as a demo to AML Triage's `handleAssignMe` (the `m` keyboard chord bypasses the WriteButton UI gate, so the queue catches it). New `admin.system.offline.toast.queued` info-toast surfaces on queue ("You're offline. Action queued — we'll sync it when you reconnect."). Demo-scope only — other mutators across the dashboard can adopt the same pattern as needed; the primitive is documented and ready.

  **(4) Maintenance draft preservation** — new `hooks/useDraftPreservation.ts` exposes `useDraftPreservation({key, value, setValue, serialize, deserialize, enabled})` returning `{clearDraft}`. Auto-saves `value` to localStorage debounced 500ms; on mount, deserializes any saved draft and calls `setValue` to restore. Watches `useMaintenanceState().active` — when it transitions false→true, surfaces a `toast.info(t('admin.system.maintenance.draft-saved'))` confirming the draft is preserved. Default (de)serializer is plain JSON; consumers pass custom ones to handle Date / Map / etc. Applied as a demo to Notifications Compose (`ComposePane.tsx`) — the heaviest-state form in the dashboard (3-locale title + body + audience criteria + schedule + deep-link). Custom (de)serializer rehydrates `scheduledFor: Date` per LESSON 2026-05-03 (storage round-trips lose Date semantics that the type system can't see). `clearDraft()` called after successful submit so the next mount starts fresh.

  **Quick deviation fixes** (3 minor):
  - **Mobile icon size** — `<SystemStateLayout>` icon was `h-20 w-20 sm:h-24 sm:w-24` (80→96px). Spec says 96×96 on mobile. Bumped to flat `h-24 w-24` (96×96) across breakpoints.
  - **Autofocus primary CTA on 404/500/403** — spec's keyboard contract says "Enter triggers primary CTA" on these states. `<SystemStateLayout>`'s primary `<ActionButton>` now receives `autoFocus` so on mount it gets focus and Enter naturally activates it.
  - **Shortcuts overlay max-height** — was 85vh (existing project convention), spec says 80vh. Updated `HelpOverlay`'s DialogContent to `max-h-[80vh]`.

- **Files added**:
  - `dashboard/src/components/zhipay/WriteButton.tsx`
  - `dashboard/src/lib/offlineActionQueue.ts`
  - `dashboard/src/hooks/useDraftPreservation.ts`

- **Files modified**:
  - `dashboard/src/router.tsx` — `<PathAwareAuthGuard>` + `KNOWN_PATH_PREFIXES` list + `isKnownPath()` helper
  - `dashboard/src/components/system/SystemStateLayout.tsx` — icon bumped to flat `h-24 w-24`; `<ActionButton>` now accepts `autoFocus` prop; primary action receives `autoFocus`
  - `dashboard/src/components/layout/HelpOverlay.tsx` — DialogContent max-h 85vh → 80vh
  - `dashboard/src/components/kyc-queue/ActionBar.tsx` — `<Button>` → `<WriteButton>` for Reject / Request info / Escalate; `ApproveButton` refactored: WriteButton when not domain-disabled, existing Tooltip wrap when domain-disabled
  - `dashboard/src/components/aml-triage/ActionBar.tsx` — same shape as KYC: `<Button>` → `<WriteButton>` for Escalate / Assign-me / Reassign; `ClearButton` refactored same way
  - `dashboard/src/components/cards/CardActionBar.tsx` — Freeze / Unfreeze → `<WriteButton>`
  - `dashboard/src/components/recipients/RecipientActionBar.tsx` — Hard-delete → `<WriteButton>`
  - `dashboard/src/components/blacklist/ActionBar.tsx` — Edit reason / Extend / Remove → `<WriteButton>`
  - `dashboard/src/components/notifications/compose/ComposeActionBar.tsx` — Send/Schedule primary → `<WriteButton>`
  - `dashboard/src/components/notifications/detail/CancelScheduledActionBar.tsx` — Cancel button → `<WriteButton>`
  - `dashboard/src/components/notifications/compose/ComposePane.tsx` — `useDraftPreservation` hook wired with custom Date-aware (de)serializer; `clearDraft()` called after successful submit
  - `dashboard/src/pages/AmlTriage.tsx` — `handleAssignMe` wrapped through `tryWriteOrQueue` (demo wiring)
  - `dashboard/src/lib/i18n.ts` — added `admin.system.offline.toast.queued` key
  - `docs/product_states.md` — foundation row + surface row extended with Phase 22b notes; last-updated bumped
  - `ai_context/AI_CONTEXT.md` — workstreams entry rewritten to cover Phase 22 + 22b
  - `ai_context/HISTORY.md` — this entry

- **Verified**: `npx tsc --noEmit` (exit 0) · `npx vite build` (exit 0; 4.37s). HMR clean during sweep. Lessons-compliance grep sweep: sub-13px / `← ` prefix in back-link i18n / text-xs in buttons / sticky tab-strip in tablists — all 0 hits.

- **Browser-eyeball checks** (dev server still up at `http://127.0.0.1:5175/`):
  - Sign out, then visit `/#/operations/transferss` (typo) → full-bleed 404 with logo + "Sign in" CTA, NOT redirected to sign-in first.
  - Toggle offline (DevTools → Network → Offline) on any surface → action bar primary buttons show as disabled with "Reconnect to perform this action" tooltip on hover. The OfflineBanner shows above the content area.
  - On AML Triage detail (`/operations/aml-triage/aml_01`), with offline toggled: press `m` (Assign-me chord). Info toast: "You're offline. Action queued — we'll sync it when you reconnect." Re-enable network → success toast: "Synced 1 actions."
  - Open Notifications Compose (`/content/notifications/new`), type a title in any locale, then visit `/#/?maintenance=on` to flip maintenance: full-page maintenance state replaces the shell. Visit `/#/?maintenance=off` to clear. Return to Notifications Compose → previously-typed title is restored from localStorage.

- **Adoption-pending** (deferred — primitives ready, the 21-surface sweep is its own follow-up): WriteButton across the remaining ~30 dialog confirmation buttons (Transfer Detail's 6 modals, KYC's 4, AML's 3, Cards' 2, Settings password / profile reason dialogs, FX Update form's submit, Commission new-version submit, Blacklist Add submit, Stories editor publish, News editor publish, App Versions add/edit, Services status-change confirms). Same drop-in pattern; same primitive.

---

### 2026-05-03 — Admin Error & System States (Phase 22) — cross-cutting layer wrapping every route · `<SystemErrorBoundary>` + `<MaintenanceGate>` + `<OfflineBanner>` + 4 state components + 7-route preview index + print-friendly shortcuts view · NEW `mockSystemEvents` forensic store (NOT bridged to central audit log per Phase 20 precedent) · HelpOverlay i18n keys migrated `admin.help.*` → `admin.shortcuts.*`

- **Summary**: Built the Phase 22 error & system states layer — minimal, calm, brand-consistent. Cross-cutting layer that wraps every other route in the dashboard. **No PRD / models / mermaid cascade** — these are operational states surfaced via mock-only stores; they don't add new entity types or state machines.

  **Locked decisions** (D1–D4 from the plan):
  - **D1** = audit landing for 500 / 403 events — new `mockSystemEvents` forensic store, NOT bridged to central `mockAuditLog`. Mirrors Phase 20's precedent of separating auth events (`mockAdminLoginAudit`) from compliance entity-state-change events. Page errors and permission denials are operational signals; mixing them into the central audit log would dilute the surface compliance reviewers scan.
  - **D2** = session-lost redirect param — keep the established `?next=` (Phase 20 wording), add `&reason=session-lost` as the discriminator. Reuses the existing `<SessionExpiredBanner>` — copy matches the spec verbatim ("Session expired. Sign in again to continue.").
  - **D3** = maintenance trigger surface — `lib/maintenanceState.ts` with `?maintenance=on|off` URL param + localStorage persistence. Lets QA flip the state without going through a UI control; the param strips itself after application so subsequent navigation doesn't keep re-applying.
  - **D4** = shortcuts overlay vs new ShortcutsOverlay component — extend HelpOverlay in place. Renamed i18n keys `admin.help.*` → `admin.shortcuts.*` (2 keys retired); SHORTCUTS catalogue lifted to shared `components/layout/shortcuts.ts` so HelpOverlay + the new print-friendly route share one source.

  **Foundation layer (5 modules)**:
  - `dashboard/src/lib/referenceId.ts` — generates `[a-f0-9]{4}-[a-f0-9]{4}` ids (32 bits, fine for mock-side correlation; real backend would mint a longer trace id and the UI would shorten).
  - `dashboard/src/data/mockSystemEvents.ts` — forensic-only append-only store w/ `recordSystemEvent()` mutator + `listSystemEvents()` reader. Two event types: `page_error` (carries reference id + optional message + componentStack) · `permission_denied` (carries optional requiredRole). No UI surface today — intentional minimal shape.
  - `dashboard/src/lib/systemEvents.ts` — surface-facing API: `logPageError({route, error, componentStack})` returns the reference id (for the boundary to display); `logPermissionDenied({route, requiredRole?})` is fire-and-forget. Both swallow errors so telemetry never crashes the already-broken page.
  - `dashboard/src/hooks/useNetworkState.ts` — `useSyncExternalStore`-backed online/offline state per LESSON 2026-05-03. Module-level cached `isOnline`, reference-stable `getSnapshot`, `online` / `offline` event listeners on `window`. `setOfflinePreview(force)` override for `/system/preview/offline` so designers can render the banner without disconnecting their network. Preview override wins until cleared (won't snap back to `navigator.onLine` on `online` event while forced).
  - `dashboard/src/lib/maintenanceState.ts` — `useSyncExternalStore` per LESSON 2026-05-03. Persistence in localStorage. `bootMaintenanceFromUrl()` reads `?maintenance=on|off` from the URL on first load + strips the param. `enterMaintenance({estimatedEndAt})` / `exitMaintenance()` programmatic API. `?maintenance=on` defaults to a 30-minute window so the timeline reads realistically out of the box.

  **Components (`dashboard/src/components/system/`)**:
  - `SystemStateLayout.tsx` — shared centered-card frame. Lucide icon (h-20→24 w-20→24 stroke-1.5 in tone-mapped color: slate / danger-600 / warning-600), text-2xl semibold title, text-sm muted body, primary CTA brand-default + optional ghost secondary, optional footer slot. Two variants: `in-shell` (centered inside `<main>`'s `<flex min-h-[60vh] items-center justify-center>`) and `full-bleed` (wraps with `<AuthLayout>` for the gradient bg + logo + ThemeToggle + footer chip + TooltipProvider per LESSON 2026-05-03). Card padding owned here w/ raw elements — does NOT consume `<CardHeader>` / `<CardContent>` per LESSON 2026-05-03 padding-contract rule. CTAs stack mobile (flex-col-reverse so primary stays on top) → side-by-side `sm+`.
  - `NotFoundState.tsx` — 404 (compass-off icon, slate tone). In-shell: "Back to Overview" primary + "Open command palette (⌘K)" secondary (wired via `useAppShell()` from the new context). Full-bleed: "Sign in" primary, no secondary. Footer renders requested path mono ("requested: /operations/transferss").
  - `ServerErrorState.tsx` — 500/503 (alert-triangle icon, danger tone). "Try again" primary (calls `onRetry` from boundary; falls back to `window.location.reload()`) + "Back to Overview" secondary. Footer renders mono reference id w/ in-place copy feedback (Copy→Check icon swap, success-700 flip for 1.5s; matches `useCopyFeedback` pattern from audit-log + services).
  - `ForbiddenState.tsx` — 403 (shield-x icon, warning tone). "Back to Overview" primary, no secondary, no reference id (permission outcome, not a system error). Logs `permission_denied` to `mockSystemEvents` on mount; skipped in preview mode.
  - `MaintenanceState.tsx` — full-bleed only (uses `<AuthLayout>` chrome). Wrench icon, warning tone. Body interpolates estimated-end time via `format(date, 'p')`; falls back to "we'll be back as soon as we can" when `estimatedEndAt` is null. Mini timeline footer: "Started at" + "Estimated end" w/ `formatDistanceToNow` relative-time. Refresh-status secondary CTA bumps `notify()` so relative-time strings re-render. No primary CTA — admin can only wait. Override props (`startedAtOverride` / `estimatedEndAtOverride`) used by the preview.
  - `SystemErrorBoundary.tsx` — class component with `getDerivedStateFromError` + `componentDidCatch`. Catches render-time crashes anywhere in `<AppRoutes>`, captures the reference id from `logPageError()` for display, exposes `reset()` for the Try-again CTA. Doesn't catch event-handler / async / effect errors (those need a global handler — out of scope for v1).
  - `OfflineBanner.tsx` — slate-toned banner (`bg-slate-100` / `dark:bg-slate-800` w/ `border-b`). WifiOff icon left + "You're offline" + "Showing cached data from {time}" + Retry button (outline, sm). Renders inside `<AppShell>` between TopBar and `<main>` when `useNetworkState()` returns false. `cachedFrom` captured in `useMemo([cachedFromOverride, visible])` so the time label stays stable for the duration of the offline window (a fresh `Date.now()` per render would tick the label every paint).

  **Pages**:
  - `pages/NotFound.tsx` — catch-all `<Route path="*">` inside `AppRoutes`. Renders the in-shell variant + wires `onOpenCommandPalette` from `useAppShell()`.
  - `pages/Forbidden.tsx` — defensive 403 mounted at `/system/403`; not in sidebar.
  - `pages/Maintenance.tsx` — full-page replacement when `<MaintenanceGate>` flips on.
  - `pages/SystemPreview.tsx` — single file exporting 7 components (`SystemPreviewIndex` + 6 per-state previews). Index card uses raw `<div className="border-b border-border px-5 py-4">` + `<ul>` directly (NOT `<CardHeader>` / `<CardContent>`) per LESSON 2026-05-03 — half-overrides of the Card primitive's `p-5` rhythm are forbidden. Per-preview Cards use the primitives whole. Preview maintenance route renders `<MaintenanceState>` directly with `startedAtOverride` / `estimatedEndAtOverride` so the timeline reads "started 8 minutes ago, estimated end in 22 minutes" deterministically without flipping the live flag.
  - `pages/ShortcutsPrint.tsx` — print-friendly 2-column layout (`md:grid-cols-2 print:grid-cols-2`); auto-fires `window.print()` 250ms after first paint via `useEffect`. Each section uses `break-inside-avoid` so groups don't split mid-page. Uses shared SHORTCUTS + SHORTCUT_GROUPS from `components/layout/shortcuts.ts`.

  **Layout wiring**:
  - `components/layout/AppShellContext.tsx` (new) — small context exposing `{openCommandPalette, openHelp}`. Default value is no-op (so consumers outside AppShell don't crash). Used today by `<NotFound>` and `/system/preview/shortcuts`.
  - `components/layout/AppShell.tsx` — wraps children in `<AppShellContext.Provider>` w/ memoized actions; mounts `<OfflineBanner />` between `<TopBar>` and `<main>`.
  - `components/layout/HelpOverlay.tsx` — replaced inline SHORTCUTS array with import from `./shortcuts`; renamed i18n keys `admin.help.{title,subtitle}` → `admin.shortcuts.{title,subtitle}`; updated subtitle copy to "Press ? anywhere to open this. Press Esc to close."; added Print-shortcuts footer link that opens `/#/system/shortcuts-print` in a new tab.
  - `components/layout/shortcuts.ts` (new) — exports `SHORTCUTS` flat list (96 rows) + `SHORTCUT_GROUPS` order array. Single source for HelpOverlay + ShortcutsPrint. Keep in sync with the actual chord wiring in `useKeyboardShortcuts.ts` and per-page `useEffect` listeners.

  **Auth wiring**:
  - `lib/auth.ts` — added `triggerSessionLost(currentPath)` exported function. Calls `signOut({reason: 'session_expired'})` (existing audit verb — no schema cascade needed) + redirects via `window.location.assign('<base>#/sign-in?next=...&reason=session-lost')`. Today: enabling-only (no real backend in v1). When real backend lands and 401-mid-app needs distinct audit semantics, extend the enum + schema.
  - `pages/SignIn.tsx` — reads `?reason=session-lost` (in addition to existing `?expired=1`); shows the existing `<SessionExpiredBanner>` for either trigger.

  **Routing**:
  - `router.tsx` — restructured top-level: `<Router>` now wraps `<Routes>` in a new `<MaintenanceGate>`; `<AppRoutes>` (inside `<AuthGuard><AppShell>`) now wraps its inner `<Routes>` in `<SystemErrorBoundary>`. Added 7 preview routes (`/system/preview` + 6 children — session-lost preview is just a link to `/sign-in?reason=session-lost&next=%2F`, no separate route). Added `/system/403` for the defensive RBAC fallback. Added `/system/shortcuts-print`. Catch-all `*` swapped from `<Placeholder />` to `<NotFound />` (Placeholder kept in tree for future single-route placeholders — `PLACEHOLDER_ROUTES` is empty).
  - `App.tsx` — added `bootMaintenanceFromUrl()` call at module load alongside the existing `bootPreferences()` call.

  **i18n**: ~37 new keys (EN-only matching project i18n stub):
  - `admin.error.404.*` (6 keys: title · body · 3 actions [home, command-palette, sign-in] · requested label)
  - `admin.error.500.*` (6 keys: title · body · 2 actions · reference-id label · reference-id-copy aria-label)
  - `admin.error.403.*` (3 keys: title · body · home action)
  - `admin.system.offline.*` (5 keys: banner title · cached-from · retry · disabled-tooltip · synced toast)
  - `admin.system.maintenance.*` (8 keys: title · body · body-unknown · started-at · estimated-end · refresh action · draft-saved)
  - `admin.system.session-lost.*` (1 key: banner)
  - `admin.shortcuts.*` (10 keys: title · subtitle · 5 group labels · print action · print subtitle)
  - `admin.system.preview.*` (1 key: back-to-index)
  - **Retired**: `admin.help.title` and `admin.help.subtitle` removed (no remaining references after HelpOverlay namespace migration).

- **Files added**:
  - `dashboard/src/lib/referenceId.ts`
  - `dashboard/src/lib/systemEvents.ts`
  - `dashboard/src/lib/maintenanceState.ts`
  - `dashboard/src/data/mockSystemEvents.ts`
  - `dashboard/src/hooks/useNetworkState.ts`
  - `dashboard/src/components/system/SystemStateLayout.tsx`
  - `dashboard/src/components/system/NotFoundState.tsx`
  - `dashboard/src/components/system/ServerErrorState.tsx`
  - `dashboard/src/components/system/ForbiddenState.tsx`
  - `dashboard/src/components/system/MaintenanceState.tsx`
  - `dashboard/src/components/system/SystemErrorBoundary.tsx`
  - `dashboard/src/components/system/OfflineBanner.tsx`
  - `dashboard/src/components/layout/AppShellContext.tsx`
  - `dashboard/src/components/layout/shortcuts.ts`
  - `dashboard/src/pages/NotFound.tsx`
  - `dashboard/src/pages/Forbidden.tsx`
  - `dashboard/src/pages/Maintenance.tsx`
  - `dashboard/src/pages/SystemPreview.tsx`
  - `dashboard/src/pages/ShortcutsPrint.tsx`

- **Files modified**:
  - `dashboard/src/App.tsx` — added `bootMaintenanceFromUrl()` invocation
  - `dashboard/src/router.tsx` — `<MaintenanceGate>` top-level wrap · `<SystemErrorBoundary>` wraps `AppRoutes`' inner Routes · 7 preview routes + `/system/403` + `/system/shortcuts-print` registered · catch-all swapped to `<NotFound>`
  - `dashboard/src/components/layout/AppShell.tsx` — `<AppShellContext.Provider>` wrap + `<OfflineBanner>` mount + `useCallback`/`useMemo` for action stability
  - `dashboard/src/components/layout/HelpOverlay.tsx` — SHORTCUTS import from shared module · i18n keys `admin.help.*` → `admin.shortcuts.*` · Print-shortcuts footer link
  - `dashboard/src/lib/auth.ts` — `triggerSessionLost(currentPath)` exported
  - `dashboard/src/pages/SignIn.tsx` — reads `?reason=session-lost` in addition to `?expired=1`
  - `dashboard/src/lib/i18n.ts` — 37 new keys; 2 retired
  - `docs/product_states.md` — new "System — Error & system states" surface row + new foundation row + last-updated bumped to Phase 22
  - `ai_context/AI_CONTEXT.md` — current-phase paragraph + workstreams entry
  - `ai_context/HISTORY.md` — this entry

- **Verified**: `npx tsc --noEmit` (exit 0) · `npx vite build` (exit 0; 4.54s). Dev server boots clean on `127.0.0.1:5175`. Lessons-compliance grep sweep: sub-13px / `← ` prefix in back-link i18n / text-xs in buttons / sticky-on-tab-strips / Card primitive padding half-overrides in Phase 22 files / removed `admin.help.*` references — all 0 hits.

- **Browser-eyeball preview routes** (dev server up at `http://127.0.0.1:5175/`):
  - `/#/system/preview` → preview index
  - `/#/system/preview/404` → 404 in-shell w/ "requested: /operations/transfersss"
  - `/#/system/preview/500` → 500 in-shell w/ "req-id: 8a7c-2f1e" + copy-on-click
  - `/#/system/preview/403` → 403 (audit write skipped)
  - `/#/system/preview/offline` → banner over a stale Overview-like view
  - `/#/system/preview/maintenance` → full-page maintenance ("started 8m ago, est end in 22m")
  - `/#/sign-in?reason=session-lost&next=%2F` → sign-in w/ session-lost banner
  - `/#/system/preview/shortcuts` → opens HelpOverlay
  - **Live trigger** (not just preview): `/#/?maintenance=on` flips the real flag; `/#/?maintenance=off` clears it.

---

### 2026-05-03 — `/doc_sync` checkpoint — Phase 21 polish (sticky tab strip removed) + Sign-in history padding rebalanced + AI_CONTEXT bumped to Phase 21

- **Summary**: Two follow-up fixes to the Phase 21 Settings surface landed during browser eyeballing, plus the AI_CONTEXT.md catch-up that was deferred until after the build verified.

  **Sticky tab strip removed** ([components/settings/SettingsTabs.tsx](../dashboard/src/components/settings/SettingsTabs.tsx)): user reported "the tab bar stickyness is not gone". Two iterations during the browser probe — first try made the bg solid (was `bg-background/95 backdrop-blur` which let table rows + card borders bleed through when scrolling under), then user direction was to drop the stickiness entirely. Tab strip now flows inline in the page rhythm — title, tabs, and active tab body all scroll together as one unit. Edge-to-edge `border-b` separator stays via negative horizontal margins. `product_states.md` row updated to reflect the change ("inline tab strip — NOT sticky — title, tabs, and body scroll together as one unit").

  **Sign-in history accordion padding rebalanced** ([components/settings/sessions/SignInHistoryCollapsible.tsx](../dashboard/src/components/settings/sessions/SignInHistoryCollapsible.tsx)): the Card initially overrode `CardHeader pb-0`, making the closed state cramped (title pulled hard against the bottom edge), and used `<CardContent className="p-0 pt-4">` for the open body — no horizontal padding meant the table edges hit the Card edges with mismatched left edges between header (`px-5`) and body. Replaced with: full-width `<button className="px-5 py-4">` as the click target (matches every other Card's padding rhythm), `border-t border-border` separator instead of `<CardContent>` for the open body, table flush to card edges (cells provide their own `px-3` padding via the Table primitive), mobile list keeps `<li className="px-4 py-3">` rhythm. Added `overflow-hidden` to the Card so the `border-t` doesn't bleed past rounded corners. Switched focus ring to `focus-visible:ring-inset` so the outline stays inside the card frame.

  **AI_CONTEXT.md updates**: Current phase paragraph extended to cover Phase 21 (Twenty admin surfaces + auth + settings; full Settings phase summary mentioning the no-2FA decision, live-apply preferences, density var rollout, demo-admin rename, schema cascade, 2 latent bug fixes, new chord). New full Settings surface bullet inserted (mirroring the depth of the other surface entries — describes all 5 tabs + new lib files + density rollout + audit decision + super-admin rename rationale + schema cascade + 18 new pattern files + i18n). Routes (admin) decision row extended with Phase 21 note (flat top-level `/settings`, no nested `/account/*` prefix). Active workstreams gained "Admin Profile & Settings surface (Phase 21) — DONE" entry; "Other 2 admin sub-pages — none remaining" line updated to add Settings to the ✓ list. `Next phases` line updated — all admin placeholder routes are now filled (PLACEHOLDER_ROUTES is empty).

- **Files modified**:
  - `dashboard/src/components/settings/SettingsTabs.tsx` — dropped `sticky -top-px z-20` + simplified outer band classes
  - `dashboard/src/components/settings/sessions/SignInHistoryCollapsible.tsx` — rewrote header + body padding rhythm; dropped `<CardHeader>` + `<CardContent>` in favour of inline `<button>` + `<div border-t>`
  - `docs/product_states.md` — Settings row tab-strip wording updated
  - `ai_context/AI_CONTEXT.md` — Current phase para + Settings surface bullet + Routes (admin) decision + Active workstreams entry + Next-phases line
  - `ai_context/HISTORY.md` — this entry

- **Verified**: `npx tsc --noEmit` (exit 0) · `npx vite build` (exit 0; 6.55s & 6.73s across iterations).

---

### 2026-05-03 — Admin Settings (Phase 21) — `/settings` · 5-tabbed page · Profile / Security / Sessions / Preferences / My audit · density CSS var threaded into `<TableRow>` (live across every table) · super-admin renamed Yulduz → Sardor across all mock stores · g+, chord + 1-5 page-scoped chords · NO 2FA card per Phase 20 direction "the otp is for mobile auth"

- **Summary**: Built the admin profile & settings surface at `/settings` — single page with five tabbed sections (Profile · Security · Sessions · Preferences · My audit), reachable from the TopBar avatar dropdown ("Settings" — replaced the old placeholder "Profile" item). Full-bleed (no max-width per LESSON 2026-04-29). Inline page header (NEVER sticky per LESSON 2026-05-02) + sticky tab strip (allowed — chrome, not column header per LESSON 2026-04-30 carve-out). `?tab=` URL param (default `profile`) is the source of truth for active tab; `1`–`5` page-scoped chords jump tabs.

  **2FA decision (locked)**: NO 2FA card on the Security tab. Phase 20 stripped TOTP / backup-codes / 2FA setup from admin auth per direction "the otp is for mobile auth"; the schema documents the absence and this surface honors it. Spec deviation called out — the spec asked for a full 2FA card (status / view backup codes / reset 2FA flow), but adding it would have either required re-introducing 2FA in the schema (reversing Phase 20) or shipping a fake UI. Cleanest match to current decisions: drop the card. If 2FA is reintroduced for admin accounts later, a `<TwoFactorCard>` lands in `components/settings/security/` between Password and Recovery.

  **Audit-write decision (locked)**: profile / password / session events write to **`mockAdminLoginAudit`** (the Phase 20 forensic-only auth-events store), NOT the central `mockAuditLog`. Preserves the Phase 20 separation between auth/identity events and entity-state-change events — auth events would drown the entity-state-change signal compliance reviewers are scanning for in `/compliance/audit-log`. The "My audit" tab inside `/settings` reads from the central log filtered by `actor.id = current admin id`, surfacing entity-state-change actions the admin took (KYC approvals, transfer reversals, FX edits, etc.). Auth events stay in their own forensic stream.

  **Save-button decision (deviated from spec)**: ALL preferences apply LIVE (no Save button anywhere on the Preferences tab). Spec mentioned a Save button at the bottom; deviated to live-apply for every preference because cosmetic prefs are obvious + reversible (toggle back) and notification subscriptions persist on toggle (user can undo by toggling back). Removes save-state confusion. Documented as a deviation in `components/settings/preferences/PreferencesTab.tsx`.

  **Schema cascade (D1–D5)** — landed BEFORE any code per CLAUDE.md "Match the schema" rule:
  - **D1** `docs/models.md §10.2` extended `admin_users` with: `phone` (nullable, emergency contact only — never used for auth) · `last_password_changed_at` (drives the >90d staleness warning) · `recovery_contact` (nullable; read-only in v1) · `preferences` jsonb. New §10.8 documents the `preferences` jsonb shape (theme · density · language · timezone · date_format · time_format · tabular_numerals · notification_subscriptions). New §10.9 documents the 4 new `admin_login_event` enum values: `profile_changed` · `password_changed` · `session_revoked` · `session_revoked_all` with their context jsonb shapes.
  - **D2** New mermaid `docs/mermaid_schemas/admin_session_revocation_flow.md` — sequence diagrams for single-session revoke + revoke-all-others; documents why current-session self-revocation is forbidden from this surface (use TopBar Sign out instead).
  - **D3** PRD §6.1 row 15 added "Admin profile & settings" P0 + Gherkin AC fragment covering profile name change requires reason / password change signs out other sessions / session revoke is logged / preferences are not audited / current session cannot self-revoke / passwords NEVER appear in audit context / My audit tab reads filtered central log (auth events excluded).
  - **D4** `docs/product_states.md` — new "Settings" row in Surfaces table; last-updated bumped to "Phase 21".
  - **D5** Existing `docs/mermaid_schemas/admin_session_state_machine.md` unchanged (active → idle → expired | revoked already covered the surface).

  **Mock data**: `mockAdminAuth.ts` extended:
  - `AdminUser` extended with `phone` / `lastPasswordChangedAt` / `recoveryContact` / `preferences` (typed via new `AdminPreferences` interface + `AdminTheme` / `AdminDensity` / `AdminLanguage` / `AdminDateFormat` / `AdminTimeFormat` / `AdminNotificationSubscriptions` exports).
  - **Demo super-admin renamed Yulduz Otaboeva → Sardor Tursunov** (id `admin_super_01` preserved so existing seed audit-log rows still attribute correctly). Sample data per spec: email `sardor@zhipay.uz` · phone `+998 90 123 45 67` · created 8 months ago (`daysAgo(240)`) · last password change 47 days ago · recovery contact `operator@anthropic.com`. **4 sibling mock files renamed in lockstep** so the audit-log surface stays coherent: `mockAuditLog.ts` (`SUPER_ADMIN.name`) · `mockBlacklist.ts` · `mockStories.ts` · `mockNews.ts` · `mockNotifications.ts`. (The end-user `Yulduz Saidkarimova` at `u_46` in `mockUsers.ts` / `mockCards.ts` is a different person — left untouched.)
  - New `AdminLoginEventType` values: `profile_changed` · `password_changed` · `session_revoked` · `session_revoked_all`.
  - New `AdminSession` type + `mockAdminSessions` live store. 1 seed historical iOS-app session signed-in 2 days ago for Sardor (current Chrome / macOS / Tashkent session is inserted on sign-in by `lib/auth.ts`, NOT seeded — so it carries the actual UA + matched id). `insertAdminSession()` is idempotent on id (re-inserting the same id refreshes in place rather than pushing a duplicate — required for page-refresh continuity since the module re-evals).
  - New `mockAdminSignInHistory` — 30-row deterministic seed spanning last 14 days (mostly successful logins; 2 failed-credential attempts mid-stream representing a fat-finger episode).
  - New mutators: `applyProfilePatch(adminId, patch)` returns `{previous, changed}` for audit-row hydration · `rotatePassword(adminId, current, next, currentSessionId)` returns `{ok, revokedOthers}` (revokes every OTHER session as a side-effect; password validation enforced via `checkPasswordStrength`) · `applyPreferencesPatch` with deep-merge on `notification_subscriptions` · `listMyActiveSessions(adminId)` · `revokeAdminSession(id)` · `revokeAllOtherSessions(adminId, exceptId)` · `bumpAdminSessionActivity(id)` · new exported `checkPasswordStrength(pw)` → 4-rule validator (length ≥12 · mixed case · number · symbol).

  **lib/auth.ts** extended (per LESSON 2026-05-03 useSyncExternalStore reference-stable getSnapshot rule throughout):
  - `ActiveSession` gained an `id: string` field (matches `mockAdminSessions.id`) so `/settings` Sessions tab can mark the right row as "This device".
  - `AdminProfile` gained `phone` / `createdAt` / `lastPasswordChangedAt` / `recoveryContact`.
  - `signIn` now generates a session id, calls `insertAdminSession()` to mirror the row into the multi-device store, and stamps the id into both the in-tab session AND the audit row's `context.sessionId`.
  - `signOut({ reason: 'user' })` revokes the corresponding sessions-store row; idle-expiry signout doesn't (it just lapses naturally via `expires_at`).
  - `markActivity()` now also calls `bumpAdminSessionActivity(id)` so the Sessions tab's "Last activity" stays fresh.
  - `initFromStorage()` re-creates the corresponding `mockAdminSessions` row on page refresh (the data module re-evals, so the previously inserted row would otherwise be gone) — uses the idempotent `insertAdminSession()`.
  - **New /settings APIs** (all write to `admin_login_audit` per §10.9): `updateMyProfile({ displayName, phone, reason })` returns `{ok, changed[]}` (validates reason ≥10 chars; refreshes the in-tab session profile snapshot so TopBar / UserMenu reflect the new name immediately) · `changeMyPassword({ current, next })` returns `{ok, revokedOthers}` (validates strong-password rules; rotates + revokes all other sessions + writes audit row with `context.signed_out_other_sessions`) · `useMyActiveSessions()` (subscribes to a tiny version counter so the list re-derives on revoke; returns sessions sorted by last-activity DESC) · `revokeMySession(id)` (refuses if id matches current session — current session is not self-revocable from this surface) · `revokeMyOtherSessions()` (single audit row with `context.count`) · `useMySignInHistory(limit=30)` (slice from the seed for the current admin).
  - New `parseUserAgent(ua)` helper categorizes UA into `{device, browser, os}` for the Sessions tab labelling. Recognizes Chrome / Firefox / Safari / Edge / Opera / ZhiPay-Admin-iOS; macOS / Windows / iOS / Android / Linux.

  **lib/preferences.ts (new)** — `useSyncExternalStore`-backed cosmetic-prefs store (LESSON 2026-05-03 contract: module-level cached state, reference-stable `getSnapshot`, only writers mutate + notify, cross-tab `storage` event updates the cache before notifying). Persistence: `localStorage` under `zhipay-admin-preferences` (cosmetic prefs survive sign-out — they're a per-browser preference, not session state). DOM hooks: `data-density="compact|comfortable"` + `data-tabular-nums="true|false"` on `<html>`, applied via `applyDom(prefs)` on every update + on initial mount via `bootPreferences()` called once from `App.tsx` at module load. **Theme is intentionally NOT held in this store** — `<ThemeProvider>` already owns it via `zhipay-theme` localStorage key; the store carries `theme` in its returned snapshot for read-side consistency (via `syncThemeIntoPreferences` mirror) but writes go through `setTheme()` from `useTheme()` directly. Public API: `getPreferences()` / `usePreferences()` / `updatePreferences(patch)` (partial-merge with deep-merge on `notification_subscriptions`) / `bootPreferences()` / `syncThemeIntoPreferences(theme)`.

  **Density CSS var rollout (single-file cascade across every table)**: `globals.css` declares `--row-h` token (40px compact / 44px comfortable; `compact` is the admin default per spec). `<TableRow>` primitive (`components/ui/table.tsx`) reads `style={{ height: 'var(--row-h)', ...style }}` so every existing data table in the dashboard (Users / Cards / Recipients / Transfers / KYC Queue / AML Triage / Audit Log / FX / Commissions / Services / App Versions / Error Codes / News / Notifications / Sessions + Sign-in history within Settings) responds live the moment the admin toggles density. `min-height` semantics — cells with multi-line content can still grow past the density floor. `--tabular-nums` toggles `font-variant-numeric: tabular-nums` on body via `html[data-tabular-nums='true'] body`; the existing `.tabular` opt-in class is unaffected (still works regardless of the global setting).

  **Keyboard chords**:
  - **New global chord `g+,`** routes to `/settings` (Mac Cmd+, convention; clearer than the alternatives — `g+p` for "Profile" is opaque). Listed in HelpOverlay Navigation group + CommandPalette Navigate group. UserMenu Settings item shows the chord hint inline.
  - **Latent `g+i → /content/notifications` chord binding fixed** — the chord was documented in HelpOverlay since Phase 18b but the actual handler in `useKeyboardShortcuts.ts` never bound it. Now wired to the canonical Notifications path.
  - **Page-scoped `1`–`5`** jump tabs (Profile / Security / Sessions / Preferences / My audit). Skipped while typing in inputs / textareas / contentEditable. Added to HelpOverlay under a new `Settings` group at the end of the page-scoped sections.
  - **Cmd/Ctrl+Enter** inside the Change-password modal submits when the form is valid (gated by 4 strength rules + confirm-match + non-empty current).
  - Existing `t` (global theme toggle) continues to work everywhere including inside Settings.

  **Patterns (`components/settings/`)** — 18 new files organized by tab:
  - **Page chrome**: `SettingsHeader.tsx` (inline title + subtitle, NEVER sticky) · `SettingsTabs.tsx` (sticky `top-0 z-20` strip with `bg-background/95 backdrop-blur` band; mobile horizontal scroll on overflow; ARIA `role="tablist"` + per-tab `role="tab"` + brand-tinted `border-b-2` active state).
  - **Profile tab**: `IdentityCard.tsx` (72×72 avatar with slate-200/700 background and initials; "Change avatar" disabled with Tooltip "Avatars are derived from initials"; editable `displayName` Input · read-only Email Input with "Managed out-of-band" chip · editable Phone Input · read-only Role chip with brand-tinted CheckCircle pill · read-only Created-at line; Save button enabled only when `dirty` via `useMemo` against current vs proposed values) · `NameChangeReasonDialog.tsx` (AlertDialog with previous→next visual diff + reason textarea ≥10 chars + character counter + disabled submit until valid) · `ProfileTab.tsx` (orchestrator).
  - **Security tab**: `PasswordCard.tsx` (Lock icon + last-changed line via `formatRelative` with danger-tinted text when >90 days; Change password button) · `ChangePasswordModal.tsx` (Dialog with 3 password fields using shared `<PasswordField>` w/ eye/eye-off toggle inset on right; live `<PasswordStrengthMeter>` after `next` typed; confirm-match inline error; primary disabled until form valid; on click → `<AlertDialog>` "Change password? You will be signed out of all other sessions." → confirm executes; toast on success/error; Cmd/Ctrl+Enter submits when form valid) · `PasswordStrengthMeter.tsx` (4 progress bars colored by score + 4-rule checklist with Check/X icons in success-700 / muted) · `RecoveryCard.tsx` (LifeBuoy icon + read-only "Self-service recovery is not available in v1" copy + optional out-of-band contact display in mono when populated) · `SecurityTab.tsx` (orchestrator — header comment documents the no-2FA-card decision and Phase 20 link).
  - **Sessions tab**: `DeviceIcon.tsx` (laptop/phone/tablet glyph from lucide) · `ActiveSessionsList.tsx` (Card with desktop dense table on `md+` / mobile stacked list on `<md`; columns Device w/ DeviceIcon + browser + OS + "This device" success-tinted chip on current row · IP + city · Signed-in relative-with-tooltip-absolute · Last-activity relative-with-tooltip · Revoke button warning-toned, disabled on current row; "Revoke all other sessions" warning-outline button on the right side of CardHeader, hidden when only 1 session active; on revoke → AlertDialog confirms; toast on success) · `RevokeSessionDialog.tsx` (per-row AlertDialog showing the device summary in a muted-bg pre-strip; warning-tinted CTA) · `RevokeAllDialog.tsx` (AlertDialog with `{n}` count interpolation; warning-tinted CTA) · `SignInHistoryCollapsible.tsx` (Card with collapsible chevron-toggleable header, default closed; renders last 30 sign-ins on expand — desktop table with non-sticky thead per LESSON 2026-04-30, columns Outcome icon + When relative-with-tooltip + IP mono + Device UA-truncated-60-chars + Outcome label success-700/danger-700; mobile stacked list mirror) · `SessionsTab.tsx` (orchestrator).
  - **Preferences tab**: `SegmentedRadio.tsx` (small button-segmented radio control with brand-tinted active state via `bg-card shadow-sm` lifted-pill, supports `disabled` per option for "Coming soon" pills; ARIA `role="radiogroup"` + per-option `role="radio"` aria-checked) + `PreferenceRow` layout helper (label-on-left / control-on-right desktop, stacked mobile) — both lifted-from-zero in this same file rather than separate primitives since they're settings-scoped · `DisplayPrefsCard.tsx` (Theme radio Light/Dark/System integrating with existing `<ThemeProvider>` via `useTheme().setTheme` AND mirroring back via `syncThemeIntoPreferences()`; Language radio English/Russian (Coming soon)/Uzbek (Coming soon) with disabled options showing "soon" pill; Density radio Compact/Comfortable applies live via `updatePreferences({density})`; Tabular-numerals Switch applies live) · `LocalePrefsCard.tsx` (Timezone Select 9 IANA shortlist defaulting to Asia/Tashkent · Date format radio US/EU/ISO · Time format radio 12h/24h; closing Info-icon banner explains the "saved but full rollout deferred" status) · `NotificationPrefsCard.tsx` (6 Switch rows mapped from `ROW_KEYS` array driving labels + hints from i18n; updates write `notification_subscriptions: { [key]: checked }` partial-merge) · `PreferencesTab.tsx` (orchestrator — header comment documents the Save-button deviation).
  - **My audit tab**: `MyAuditTab.tsx` (single file: quick-stat Card with Activity icon + "{N} actions in last 24h · {M} in last 7 days" computed from `listAuditEvents()` filtered by `actor.id = currentAdminId AND actorType = 'admin'` + "Open in audit log" Button → `/compliance/audit-log?actor=...`; activity-list Card with 400ms initial-mount skeleton matching the AuditLog page cadence; renders rows showing `<ActionChip>` (reused from `components/audit-log/`) + entity-type label from `admin.audit-log.entity-type.*` keys + clickable mono entity ref (when `ENTITY_LINK` has an entry — transfers/users/cards/stories/news/notifications/blacklist/services; KYC/AML/FX/commission/app_version render as plain mono since no per-entity detail page in v1) + optional `<StatusTransitionPill>` + truncated context summary + italic reason quote + relative-time-with-tooltip; `Load N more` Button paginates 25 at a time).

  **Topbar wiring**: `UserMenu.tsx` "Profile" item replaced with "Settings" → `/settings` (single nav target; Profile is now a tab inside Settings); kbd hint shows `g ,`. Router (`router.tsx`) gains `<Route path="/settings" element={<Settings />} />` inside the `<AuthGuard>`-wrapped `<AppRoutes>` (signed-in only). No Sidebar entry — Settings is intentionally only reachable via the avatar dropdown.

  **i18n**: 110 new `admin.settings.*` keys (EN-only matching project i18n stub state). Tab labels · profile fields + reason dialog · password card + change modal + 4 strength rules + 5 toast variants · recovery card · active-sessions list + 5 column headers + revoke dialogs + 3 toast variants · sign-in history + 5 column headers · display prefs + 5 row labels · locale prefs + rollout-note · 6 notification subscriptions with hints · my-audit stats + activity list. All keys authored in Title Case where rendered as table column headers (per LESSON 2026-05-02). All flowing meta uses `text-sm` (14px) — never `text-xs` — per LESSON 2026-05-01. No `← ` literal in any back-link string (no detail subpages on this surface, but the rule is honored regardless).

- **Files modified**:
  - `docs/models.md` — §10.2 extended w/ 4 new `admin_users` fields + new §10.8 (preferences jsonb shape) + new §10.9 (settings audit verbs) + §9.1 enum row extended w/ 4 new `admin_login_event` values
  - `docs/product_requirements_document.md` — §6.1 row 15 + AC fragment
  - `docs/product_states.md` — new Settings row + last-updated bumped to Phase 21
  - `dashboard/src/data/mockAdminAuth.ts` — full rewrite extending AdminUser w/ new fields + new AdminPreferences/AdminSession types + 30-row signin-history seed + 4 new audit verbs + 6 new mutators (applyProfilePatch / rotatePassword / applyPreferencesPatch / insertAdminSession / listMyActiveSessions / revokeAdminSession / revokeAllOtherSessions / bumpAdminSessionActivity) + checkPasswordStrength validator
  - `dashboard/src/data/mockAuditLog.ts` — SUPER_ADMIN renamed Yulduz Otaboeva → Sardor Tursunov
  - `dashboard/src/data/mockBlacklist.ts` — SUPER_ADMIN renamed
  - `dashboard/src/data/mockStories.ts` — SUPER_ADMIN renamed
  - `dashboard/src/data/mockNews.ts` — SUPER_ADMIN renamed
  - `dashboard/src/data/mockNotifications.ts` — SUPER_ADMIN renamed
  - `dashboard/src/lib/auth.ts` — full rewrite extending ActiveSession w/ id field + AdminProfile w/ 4 new fields + parseUserAgent helper + 6 new /settings APIs (updateMyProfile / changeMyPassword / useMyActiveSessions / revokeMySession / revokeMyOtherSessions / useMySignInHistory) + idempotent session row re-insert on page-refresh
  - `dashboard/src/styles/globals.css` — added `--row-h` density var + `[data-density=compact|comfortable]` selectors + `[data-tabular-nums=true] body` font-variant rule
  - `dashboard/src/components/ui/table.tsx` — `<TableRow>` reads `style={{ height: 'var(--row-h)' }}` for live density cascade across every table
  - `dashboard/src/hooks/useKeyboardShortcuts.ts` — added `g+,` → /settings + fixed latent `g+i` → /content/notifications binding
  - `dashboard/src/components/layout/HelpOverlay.tsx` — added `g+,` Navigation row + new Settings group with 5 page-scoped tab chords + groups array updated
  - `dashboard/src/components/layout/CommandPalette.tsx` — added Settings entry under Navigate (Settings icon + `g ,` hint)
  - `dashboard/src/components/layout/UserMenu.tsx` — replaced "Profile" item with "Settings" (Settings icon + navigate hook + `g ,` kbd hint)
  - `dashboard/src/router.tsx` — `Settings` page imported + `/settings` route added inside `<AuthGuard>`-wrapped `<AppRoutes>`
  - `dashboard/src/App.tsx` — `bootPreferences()` invoked at module load so first paint reflects persisted density / tabular-numerals
  - `dashboard/src/lib/i18n.ts` — 110 new `admin.settings.*` keys
  - `ai_context/HISTORY.md` — this entry

- **Files added**:
  - `docs/mermaid_schemas/admin_session_revocation_flow.md` — single-revoke + revoke-all sequence diagrams + cross-tab behavior + forbidden-from-this-surface notes
  - `dashboard/src/lib/preferences.ts` — useSyncExternalStore-backed cosmetic-prefs store + DOM-hook applier
  - `dashboard/src/pages/Settings.tsx` — orchestrator: header + sticky tabs + tab-panel switch + page-scoped 1–5 chords
  - `dashboard/src/components/settings/SettingsHeader.tsx`
  - `dashboard/src/components/settings/SettingsTabs.tsx`
  - `dashboard/src/components/settings/profile/ProfileTab.tsx`
  - `dashboard/src/components/settings/profile/IdentityCard.tsx`
  - `dashboard/src/components/settings/profile/NameChangeReasonDialog.tsx`
  - `dashboard/src/components/settings/security/SecurityTab.tsx`
  - `dashboard/src/components/settings/security/PasswordCard.tsx`
  - `dashboard/src/components/settings/security/ChangePasswordModal.tsx`
  - `dashboard/src/components/settings/security/PasswordStrengthMeter.tsx`
  - `dashboard/src/components/settings/security/RecoveryCard.tsx`
  - `dashboard/src/components/settings/sessions/SessionsTab.tsx`
  - `dashboard/src/components/settings/sessions/ActiveSessionsList.tsx`
  - `dashboard/src/components/settings/sessions/DeviceIcon.tsx`
  - `dashboard/src/components/settings/sessions/RevokeSessionDialog.tsx`
  - `dashboard/src/components/settings/sessions/RevokeAllDialog.tsx`
  - `dashboard/src/components/settings/sessions/SignInHistoryCollapsible.tsx`
  - `dashboard/src/components/settings/preferences/PreferencesTab.tsx`
  - `dashboard/src/components/settings/preferences/SegmentedRadio.tsx` (also exports `PreferenceRow`)
  - `dashboard/src/components/settings/preferences/DisplayPrefsCard.tsx`
  - `dashboard/src/components/settings/preferences/LocalePrefsCard.tsx`
  - `dashboard/src/components/settings/preferences/NotificationPrefsCard.tsx`
  - `dashboard/src/components/settings/my-audit/MyAuditTab.tsx`

- **Runtime fix during browser probe (1)**: `/settings?tab=profile` crashed on first refresh with `RangeError: Invalid time value` from `formatDate(profile.createdAt)` inside `IdentityCard.tsx:169`. Root cause: `AdminProfile` carries `createdAt: Date` and `lastPasswordChangedAt: Date | null`; the in-tab `ActiveSession` is JSON-stringified into `sessionStorage`, and on rehydrate `JSON.parse` returns ISO strings — TypeScript's `as ActiveSession` cast hid the runtime drift, so the first date-fns `format()` call crashed. Fix: `lib/auth.ts` `parseStoredSession()` now re-hydrates `profile.createdAt` and `profile.lastPasswordChangedAt` via `instanceof Date ? value : new Date(value)` so the parser is the single boundary where strings cross back into runtime Date semantics.

- **Runtime fix during browser probe (2)**: After the Date-rehydrate fix landed, the Sessions tab tripped React's "each child in a list should have a unique key prop" warning pointing at `ActiveSessionsList`. Root cause: a Phase-20-era session in sessionStorage lacked the new Phase 21 `ActiveSession.id` field. `<TableRow key={s.id}>` rendered with `key={undefined}` for the legacy session row. Fix: same parser (`parseStoredSession`) now mints a fresh `id` when missing (`if (!parsed.id) parsed.id = generateSessionId()`), defaults `phone` and `recoveryContact` to null, and writes the upgraded payload back to sessionStorage so subsequent refreshes don't re-mint. Both fixes documented under one LESSON 2026-05-03 ("Anything serialized to sessionStorage / localStorage loses Date semantics on rehydrate") with a schema-evolution corollary covering field-absence drift — the parser is the single seam where stored data meets the current schema and must handle runtime-semantics drift, missing optional fields (default), and missing required fields (mint or reject).

- **Verified**: `npx tsc --noEmit` (exit 0; ran twice — initial / post-Date-rehydrate fix) · `npx vite build` (exit 0; 6.71s) · grep sweep clean (sub-13px hits / `text-xs` in buttons / `← ` prefix / sticky thead / `uppercase tracking-wider` in TableHead / Visa-Mastercard mentions in any new file / `ChevronLeft` in Settings — all 0 hits; only documentation comments referencing the LESSONS) · dev-server probe returned HTTP 200 for `/`, `/#/settings`, `/#/settings?tab=security` (HashRouter so the SPA shell serves all paths the same — the meaningful verification is browser-eyeballing). **Browser eyeballing deferred to user — please spot-check**:
  - `/settings` lands on Profile tab by default; Save button disabled until any field changes; clicking Save opens AlertDialog with reason textarea (must be ≥10 chars to enable submit); on confirm, toast "Profile updated" + UserMenu updates display name immediately
  - `/settings?tab=security` shows Password card (Sardor's seed = 47 days ago; not yet stale; bump to >90d in `mockAdminAuth.ts` to see the danger-tinted text); Change password modal accepts any password matching `zhipay-demo-2026` as current, validates new w/ live strength meter against 4 rules, blocks confirm-mismatch, AlertDialog warns "signed out of other sessions" before commit; Cmd/Ctrl+Enter submits when valid
  - `/settings?tab=sessions` shows 2 rows for Sardor (current Chrome/macOS w/ "This device" success-tinted chip + iOS-app row signed-in 2 days ago); Revoke disabled on current; Revoke on iOS row → AlertDialog → toast; "Revoke all other sessions" appears in CardHeader when otherCount > 0; Sign-in history collapsible shows 30 entries on expand
  - `/settings?tab=preferences` — toggle Theme: live across the app (existing ThemeProvider integration); toggle Density: every existing data table re-renders with new row height live (try /customers/users or /operations/transfers in another tab); toggle Tabular numerals: body font-variant flips; Language Russian/Uzbek show "soon" pills + are non-clickable; Timezone Select; Date/Time format radios; 6 notification toggles persist
  - `/settings?tab=my-audit` shows quick-stat row with Sardor's actions across 24h/7d (~12 expected today + ~20 across last 7d from existing seed) + activity list with entity-type label + clickable mono entity ref (transfers/users/cards/stories/news/notifications/blacklist/services link out; KYC/AML/FX/commission/app_version render as plain mono); "Open in audit log" navigates to `/compliance/audit-log?actor=admin_super_01`
  - **Topbar avatar dropdown** — "Settings" item replaces "Profile"; kbd hint `g ,` visible inline; clicking navigates to `/settings`
  - **Keyboard chords** — `g ,` from anywhere routes to `/settings`; `g i` (previously latent) routes to `/content/notifications`; inside Settings, `1`–`5` jumps tabs (skipped while typing in inputs); `t` toggles theme everywhere
  - **Page refresh on /settings** — session preserved via `sessionStorage`; the iOS-app row + the current Chrome row both visible after refresh (idempotent re-insert worked); "This device" chip on the right row
  - **Sign-out via TopBar** — current session row removed from `mockAdminSessions`; auth audit `signout` event recorded; redirect to `/sign-in?next=/settings`

---

### 2026-05-03 — `/doc_sync` checkpoint — Phase 20 follow-ups: auth UX polish + TopBar foundation enhancements + 2 new LESSONS

- **Summary**: Captured the post-Phase-20 polish landed during browser probing — items that are too small for their own phase entry but worth pinning to product_states / LESSONS so future work doesn't re-discover them.

  **UX polish** on the sign-in surface:
  - `<EmailPasswordStep>` gained a `defaultPassword` prop; `pages/SignIn.tsx` passes `DEMO_PASSWORD` from `mockAdminAuth` so the password field pre-fills alongside the email — one Sign-in click lands on `/`.
  - Email + password inputs use canonical `h-10` height matching the project's filter-bar / Select pattern (was rendering at the shadcn primitive default `h-9`); aligns with the `size="lg"` submit button.

  **TopBar foundation enhancements**:
  - `<UserMenu>` now subscribes to `useSession()` — display name + email + avatar initials reflect the signed-in admin (initials = first+last word of `displayName`, falling back to first 2 chars for single-word names). The Sign-out menu item gained `onClick={() => signOut({ reason: 'user' })}` — `<AuthGuard>` handles the redirect back to `/sign-in?next=...` automatically.
  - `<HelpOverlay>` (keyboard shortcuts dialog) capped at `max-h-[85vh]` w/ flex-col + scrollable body so the 95-row shortcuts list reaches every viewport; header pinned at top w/ `border-b`. Was previously running off the bottom of the viewport with no scroll.
  - New `<NotificationsBell>` component in `components/layout/` — wraps the TopBar Bell button in a Radix Popover. 360px-wide panel anchored under the bell with header / 3-item list / footer. 3 deterministic mock items (AML escalation → `/operations/aml-triage/aml_01` · FX rate update → `/compliance/audit-log?entity=fx_rate` · card frozen → `/customers/cards/c_01`) — each item closes the popover on click via controlled `useState` + `setOpen(false)`. Empty-state branch renders "You're all caught up" when items=0; red unread dot only when count > 0; footer link → `/compliance/audit-log`. Distinct from the `/content/notifications` composer surface (outbound pushes to mobile end-users) — naming distinction documented in the file header. Replaces the previous placeholder Bell button which had no `onClick` handler at all (clicking did nothing).

  **2 new LESSONS** (both 2026-05-03):
  - **`useSyncExternalStore`'s `getSnapshot` MUST return reference-equal values when state is unchanged** — `lib/auth.ts` initially had `getSnapshot()` calling `JSON.parse(sessionStorage.getItem(...))` per call → React panicked with "should be cached to avoid an infinite loop" → cascading "Maximum update depth exceeded" → blank screen on every authenticated route. Fix pattern documented: hold the parsed state in a module-level variable, only mutate from writer fn, init once at module load, cross-tab `storage` listener updates the variable before notifying.
  - **Surfaces outside `<AppShell>` must own their own `<TooltipProvider>`** — `/sign-in` reused `<ThemeToggle>` from `components/layout/` which uses Radix Tooltip; the missing Provider ancestor crashed the very first mount with "Tooltip must be used within TooltipProvider". Fix: `<AuthLayout>` wraps its root in `<TooltipProvider delayDuration={200}>` matching AppShell's value.

- **Files modified**:
  - `dashboard/src/components/auth/EmailPasswordStep.tsx` — `defaultPassword` prop + `h-10` on inputs
  - `dashboard/src/components/auth/AuthLayout.tsx` — wraps root in `<TooltipProvider>`
  - `dashboard/src/lib/auth.ts` — module-level `currentSession` cache; `getSnapshot()` returns cached reference; `subscribe` `storage` listener updates the cache before notifying
  - `dashboard/src/components/layout/UserMenu.tsx` — reads `useSession()`; sign-out wired
  - `dashboard/src/components/layout/HelpOverlay.tsx` — `max-h-[85vh]` flex-col + scrollable body + pinned header
  - `dashboard/src/components/layout/TopBar.tsx` — replaced placeholder Bell with `<NotificationsBell>` import
  - `dashboard/src/pages/SignIn.tsx` — passes `defaultPassword={DEMO_PASSWORD}`
  - `docs/product_states.md` — App shell row + Auth machinery row + Auth Sign-in row updated to reflect the additions
  - `ai_context/LESSONS.md` — 2 new entries (useSyncExternalStore + TooltipProvider-outside-AppShell)
  - `ai_context/HISTORY.md` — this entry

- **Files added**:
  - `dashboard/src/components/layout/NotificationsBell.tsx` — TopBar Popover w/ 3 mock items + close-on-click + empty-state branch + footer link

- **Verified**: `npx tsc --noEmit` (exit 0) · `npx vite build` (exit 0) · cross-references resolve.

---

### 2026-05-03 — Admin Sign-in (Phase 20) — `/sign-in` · email + password only · `<AuthGuard>` wraps every other route · 30-min idle session-timeout · schema cascade in `models.md §10` (admin_users / admin_sessions / admin_login_audit) · 2FA scaffolding stripped mid-build per direction "the otp is for mobile auth"

- **Summary**: Built the admin auth entry point at `/sign-in`. **Email + password only** — admin surface does NOT use 2FA / TOTP / SMS-OTP (those belong to the mobile end-user flow under MyID). Original spec proposed TOTP 2FA + first-time-2FA-setup branch (QR + manual secret + 6-digit confirm + 8 backup codes); shipped that scaffolding first, then stripped it mid-build per user direction. Kept `<OTPInput>` and `<QrPlaceholder>` primitives in `components/ui/` for future mobile reuse — they're currently unused on the admin surface but represent finished work that mobile signup will need.

  **Routing refactor**:
  - `dashboard/src/router.tsx` split into auth route + `<AuthGuard>`-wrapped `AppRoutes()`. The outer `<Routes>` has two cases: `/sign-in` renders bare (no `<AppShell>`); everything else hits the catch-all `<Route path="*">` which guards + wraps in shell.
  - `<AuthGuard>` reads `useSession()` + `useIdleTimeout()`. No session → `<Navigate>` to `/sign-in?next=<encoded current path>`. Idle-timeout fires `signOut({ reason: 'session_expired' })` and `<Navigate>` to `/sign-in?expired=1&next=...` rendering `<SessionExpiredBanner>` above the auth card.
  - Inner `<AppRoutes>` keeps every existing surface route + redirects unchanged.

  **Mock store** (`dashboard/src/lib/auth.ts`):
  - Public API: `signIn(email, password)` · `signOut({ reason })` · `getSession()` · `useSession()` · `useIdleTimeout()` · `markActivity()`. All session state in `sessionStorage` so refresh doesn't kick out (real backend = HttpOnly cookie + server-side row).
  - Idle hook listens to `mousemove`/`keydown`/`click`/`scroll`/`touchstart`; throttles `markActivity` to once per 30s; re-evaluates idleness on a 60s interval; force-reaps absolutely-expired sessions.
  - Cross-tab sync via `storage` events on the SESSION_STORAGE_KEY.
  - 12h absolute session lifetime (configurable per `admin_session_state_machine.md`); 30 min idle timeout.

  **`mockAdminAuth.ts`** = single source of truth for admin pool + login audit:
  - 2 seed accounts: `super.admin@zhipay.uz` (super_admin, Yulduz Otaboeva, lands on `/`) + `disabled.admin@zhipay.uz` (finance, Adel Ortiqova, surfaces `AUTH_ACCOUNT_DISABLED`). Shared password `zhipay-demo-2026`.
  - Per-email rate limit: 5 failed in 15 min → `locked_until = now() + 15min` → subsequent attempts return `AUTH_RATE_LIMITED`.
  - `mockAdminLoginAudit` is a separate forensic-only store — intentionally NOT bridged into `mockAuditLog`. Central audit log is reserved for entity-state-change events (transfers / KYC / AML / cards / FX / services / content); auth events would drown the signal.

  **Layered**:
  - **Primitives** (new): `components/ui/otp-input.tsx` (6-digit OTP boxes, mono large, autofocus first, auto-advance, paste fills all 6, `onComplete` callback) · `components/ui/qr-placeholder.tsx` (deterministic SVG QR placeholder; real `qrcode` library can drop in later — same consumer API). Both kept despite the 2FA-strip — mobile signup will reuse OTPInput, and any future admin-2FA reintroduction will reuse both.
  - **Patterns** (new): `components/auth/AuthLayout.tsx` (full-bleed radial-gradient bg `slate-50→brand-50` light / `slate-950→brand-950` dark + ZhiPay logo above card + ThemeToggle pinned top-right + footer chip "© 2026 ZhiPay · admin v0.1.0" pinned bottom-center; owns its own `<TooltipProvider>` since it lives outside `<AppShell>` — fixed runtime "Tooltip must be used within TooltipProvider" crash exposed during browser probe) · `AuthCard.tsx` (440px on `md+`, full-screen w/ `p-6` on `<md`, optional banner slot above title for the session-expired banner) · `EmailPasswordStep.tsx` (Email + Password fields w/ `h-10` height matching project filter-bar / Select pattern after design-system-consistency feedback; password field has eye/eye-off show/hide toggle inset on right; ForgotPasswordDialog opens out-of-band-reset modal — no self-service reset by compliance posture; submit button `size="lg"` brand-primary full-width) · `SessionExpiredBanner.tsx` · `ForgotPasswordDialog.tsx`.
  - **Screen** (new): `pages/SignIn.tsx` orchestrator — single email + password step. Reads `?next=` and `?expired=` query params. On success: toast `admin.sign-in.toast.welcome` w/ `{name}` interpolation + `<Navigate to={next}>`.

  **Auth errors** are surface-scoped under `admin.sign-in.error.*` keys — intentionally NOT in user-facing `error_codes` table per security baseline (generic "Email or password is incorrect", no field-level reveal). Documented as a deviation from `error-ux.md` since auth errors have a different security contract than transactional errors.

  **i18n**: 9 new `admin.sign-in.*` keys (title / subtitle / field labels / show-hide labels / submit + submitting / link.forgot / 5 error variants / banner / toast / footer copyright + version + forgot-dialog title/body/ok). EN-only matching the project's i18n stub; uz/ru parallel deferred per existing convention.

  **Schema cascade** (D1–D5):
  - **D1** `docs/models.md §10 ADMIN & AUTH` (new section) — `admin_users` (id / email / password_hash / display_name / role / account_status / failed_login_attempts / locked_until / last_signed_in_at / preferred_language / created_at / disabled_at / disabled_reason), `admin_sessions` (id / admin_user_id / created_at / last_seen_at / expires_at / revoked_at / ip_address / user_agent / device_fingerprint), `admin_login_audit` (id / email_attempted / admin_user_id / event_type / failure_code / ip_address / user_agent / context / created_at). 2 new enums in §9.1: `admin_role` and `admin_account_status` and `admin_login_event` (6 values: `signin_success / signin_failed_credentials / signin_rate_limited / signin_account_disabled / session_expired / signout`). 7 new indexes in §9.2 covering email lookup / active-roster scans / per-admin sessions / reaper sweeps / per-email + per-IP rate-limit windows / per-admin sign-in history. Soft-delete entries added for the 3 new tables. §10.6 documents per-email + per-IP rate-limit windows; §10.7 documents the 5 privacy invariants (generic credential errors / no password echo / idle-timeout client + server / TLS-only / out-of-band password reset).
  - **D2** `docs/mermaid_schemas/admin_signin_flow.md` (new) — sequence diagram covering credential / disabled / rate-limit / network / 5xx paths.
  - **D3** `docs/mermaid_schemas/admin_session_state_machine.md` (new) — `active → idle → expired | revoked` with reaper retention. Configuration knobs documented.
  - **D4** `docs/product_requirements_document.md` — §6.1 row 14 added "Admin sign-in (email + password)" P0 + Gherkin AC fragment covering wrong-creds genericity / rate-limit / disabled / session-expired / privacy invariants.
  - **D5** `docs/product_states.md` — new "Auth — Sign-in" row in Surfaces table; new "Auth machinery (mock auth store · `<AuthGuard>` route wrapper · 30-min idle session-timeout hook · sessionStorage persistence)" row in Foundation table; last-updated timestamp bumped to "Phase 20 — Sign-in".

  **Mid-build pivot**: original spec (and first-pass implementation) included TOTP 2FA challenge (`TwoFAStep`) + first-time-setup branch (`Setup2FAStep` with QR / manual secret / 6-digit confirm / 8 backup codes / Download .txt / acknowledge checkbox) + slide-left transition between steps. User direction "the otp is for mobile auth" landed mid-build — stripped 2FA scaffolding entirely:
  - Deleted `components/auth/TwoFAStep.tsx`, `components/auth/Setup2FAStep.tsx`.
  - Simplified `lib/auth.ts` (removed `verifyTotp` / `useBackupCode` / `confirmTotpSetup` / `acknowledgeBackupCodes` / `restartSignIn` / `getPendingSignIn` + the half-auth pending-signin sessionStorage handling).
  - Simplified `mockAdminAuth.ts` (removed `totpSecret` / `totpSetupCompletedAt` / `backupCodes` / `BackupCode` / `DEMO_TOTP_CODE` / `consumeBackupCode` / `completeTotpSetup` / `generateTotpEnrollment` / `buildOtpauthUri` / `new.admin@zhipay.uz` first-time-setup demo account; dropped `signin_failed_2fa` and `2fa_setup_completed` from the event-type enum + `AUTH_INVALID_2FA_CODE` and `AUTH_2FA_TOO_MANY_ATTEMPTS` from the failure-code enum).
  - Simplified `pages/SignIn.tsx` (single email+pw step; removed slide-track + step state machine + Setup2FAStep mount + Setup2FAStep props plumbing).
  - Trimmed i18n: dropped 30 `admin.sign-in.2fa.*` and `admin.sign-in.setup-2fa.*` keys.
  - Doc cascade rollback: removed 2FA fields + 2FA enum values from `models.md §10` + §9.1; rewrote `admin_signin_flow.md` without 2FA branches; simplified PRD AC (dropped 2FA Gherkin clauses); simplified product_states row + AI_CONTEXT description.

  Kept `<OTPInput>` and `<QrPlaceholder>` primitives even though no consumer remains on the admin surface — they're general-purpose primitives that mobile signup will inevitably need (and re-deleting is cheap if mobile diverges).

  **Design-system input fix** (mid-build feedback "the inputs in sign-in page should be consistent to our design system"): Email + Password `<Input>` were rendering at the shadcn primitive default `h-9` (36px). The canonical form-input height in this codebase is `h-10` (40px) — set on every filter-bar search input + Select primitive default + every other form across Users / Cards / News / Notifications / Blacklist. Bumped both auth inputs to `className="h-10"` so they visually align with the `size="lg"` (h-10) submit button.

- **Files modified**:
  - `docs/models.md` — new §10 ADMIN & AUTH (after 2FA strip) · §9.1 enum table (3 new enums) · §9.2 index table (7 new indexes) · §9.4 soft-delete table (3 new entries)
  - `docs/product_requirements_document.md` — §6.1 row 14 + AC fragment
  - `docs/product_states.md` — new Auth row + Auth-machinery foundation row + last-updated timestamp
  - `dashboard/src/router.tsx` — split into auth route + `<AuthGuard>`-wrapped AppRoutes
  - `dashboard/src/lib/i18n.ts` — 9 new `admin.sign-in.*` keys
  - `ai_context/AI_CONTEXT.md` — Current phase paragraph + Routes (admin) decision row + Active workstreams entry
  - `ai_context/HISTORY.md` — this entry

- **Files added**:
  - `docs/mermaid_schemas/admin_signin_flow.md`
  - `docs/mermaid_schemas/admin_session_state_machine.md`
  - `dashboard/src/lib/auth.ts`
  - `dashboard/src/data/mockAdminAuth.ts`
  - `dashboard/src/components/ui/otp-input.tsx`
  - `dashboard/src/components/ui/qr-placeholder.tsx`
  - `dashboard/src/components/auth/AuthLayout.tsx`
  - `dashboard/src/components/auth/AuthCard.tsx`
  - `dashboard/src/components/auth/EmailPasswordStep.tsx`
  - `dashboard/src/components/auth/ForgotPasswordDialog.tsx`
  - `dashboard/src/components/auth/SessionExpiredBanner.tsx`
  - `dashboard/src/pages/SignIn.tsx`

- **Files deleted (mid-build, after 2FA strip)**:
  - `dashboard/src/components/auth/TwoFAStep.tsx`
  - `dashboard/src/components/auth/Setup2FAStep.tsx`

- **Runtime fixes during browser probe**:
  - `<TooltipProvider>` missing on `/sign-in` (lives outside `<AppShell>` which normally provides it). Added `<TooltipProvider>` to `AuthLayout` so the embedded `<ThemeToggle>` doesn't crash with "Tooltip must be used within TooltipProvider".
  - **`useSyncExternalStore` infinite-loop fix.** `getSnapshot()` was returning a fresh `JSON.parse` result on every call → React panicked with "The result of getSnapshot should be cached to avoid an infinite loop" → cascading "Maximum update depth exceeded". Restructured `lib/auth.ts` to hold the parsed session in a module-level `currentSession` variable that's only rewritten on actual mutation (writeSession) or cross-tab `storage` event. `getSnapshot()` returns the cached reference; reads are now reference-stable across calls when the session is unchanged. Module init reads from `sessionStorage` once at import.

- **Verified**: `npx tsc --noEmit` (exit 0 — three times; initial / post-2FA-strip / post-cache-fix) · `npx vite build` (exit 0) · lessons-compliance grep sweep clean (sub-13px / Visa-Mastercard runtime usage / sticky-thead / `← ` prefix / uppercase-tracking-wider all 0 hits — Visa/Mastercard reference in `mockAdminAuth.ts` is a comment naming the lesson itself). Browser eyeballing deferred to user — please spot-check: signing in as `super.admin@zhipay.uz` w/ `zhipay-demo-2026` lands on `/` w/ welcome toast; signing in as `disabled.admin@zhipay.uz` surfaces "This account has been disabled" inline alert; entering wrong password 5x within 15 min trips `AUTH_RATE_LIMITED`; visiting any non-`/sign-in` route while signed-out redirects to `/sign-in?next=...` and back after auth; idle-timeout (30 min) redirects to `/sign-in?expired=1&next=...` with the amber session-expired banner; theme toggle works inside the auth layout (the TooltipProvider fix); `Forgot password?` opens the modal with the out-of-band-reset copy; password show/hide toggle works; inputs render at `h-10` matching the submit button height.

---

### 2026-05-03 — `/doc_sync` checkpoint — flip Notifications row to ✅ in product_states.md

- **Summary**: Caught one stale row in `docs/product_states.md` line 62 — Notifications was still listed at `/notifications` ❌ Placeholder. Flipped to `/content/notifications` (+ `/new` + `/sent/:id`) ✅ with the full Phase 19 + Phase 19a description (composer dedicated route, sent-history list, sent-detail, schema cascade, audit bridge, etc.). Other product_states rows already current. `docs/models.md` + `docs/product_requirements_document.md` + `docs/mermaid_schemas/notification_send_state_machine.md` + `ai_context/AI_CONTEXT.md` + `ai_context/HISTORY.md` were all updated inline during the Phase 19 + Phase 19a work — no further changes needed in this sync.
- **Files modified**: `docs/product_states.md` (Notifications row) · `ai_context/HISTORY.md` (this entry)
- **Verified**: no schema / state-machine / PRD drift; cross-references resolve.

---

### 2026-05-03 — Notifications restructure (Phase 19a) — Compose moved out of in-page tab into dedicated `/content/notifications/new` route · list page now Sent-only with `+ New notification` CTA · matches Stories / News editor sibling pattern

- **Summary**: Followed up on Phase 19 by restructuring the surface to match the rest of the `/content/*` family. The original spec called for tabbed Compose / Sent inside one page, but on review the in-tab composer was inconsistent with Stories (`/content/stories/new` + `/:id`) and News (`/content/news/new` + `/:id`) — both of which use a list page + dedicated editor route. Admin mental model is "open Notifications → scan recent sends → click `+ New notification` to compose", which matches every other admin surface. Tradeoff accepted: lost the in-tab Compose↔Sent quick-flip via `c`/`s` chords, but `n` (matching News) replaces the relevant entry chord cleanly.

  **Routing**:
  - `/content/notifications` — list-only (was tabbed page); renders the former `<SentPane>` content directly. Page header has `+ New notification` CTA on the right (`Plus` icon + label, brand-primary, matches News' `+ New article`).
  - `/content/notifications/new` — new dedicated page (`pages/NotificationsCompose.tsx`); inline header w/ `<ArrowLeft> Back to notifications` + `New notification` title + subtitle, then the existing `<ComposePane>` consuming the full viewport with its sticky preview + sticky-bottom `<ComposeActionBar>`.
  - `/content/notifications/sent/:id` — unchanged.

  **Page-scoped chord changes**:
  - List page: `c` / `s` removed (no tabs); `n` added → navigates to `/new` (matches News pattern). `j/k/Enter` row focus + `/` focus search + `f` focus first chip stay.
  - Compose page: existing `Cmd/Ctrl+1/2/3` (locale tabs) + `Cmd/Ctrl+Enter` (submit) inside `<ComposePane>` unchanged.

  **Component changes**:
  - `pages/Notifications.tsx` — full rewrite. Dropped `<Tabs>`/`<TabsList>`/`<TabsTrigger>`/`<TabsContent>` wrappers + `?tab=compose|sent` query-param plumbing + `c`/`s` chords + `refreshVersion`/`onSwitchToCompose`/`onCreated` callbacks. Now just renders `<header>` + `<SentPane>` directly. Counts subtitle stays.
  - `pages/NotificationsCompose.tsx` — new file. Mirrors `NewsEditor.tsx` shape: 350ms loading flag NOT needed (no list to fetch), inline header with back-link + title + subtitle, then `<ComposePane onCreated={navigate(`/sent/:id`)} onCancel={navigate('/content/notifications')} />`.
  - `components/notifications/sent/SentPane.tsx` — `Props.onSwitchToCompose` renamed to `Props.onCreateNew`; `Props.refreshVersion` removed (no longer plumbed). `useMemo(() => listNotifications(), [])` lost its `refreshVersion` dep.
  - `components/notifications/detail/DetailHeader.tsx` — back-link `to="/content/notifications?tab=sent"` → `to="/content/notifications"` (no tabs to target).
  - `pages/SentNotificationDetail.tsx` — not-found fallback `navigate('/content/notifications?tab=sent', { replace: true })` → `navigate('/content/notifications', { replace: true })`.
  - `components/notifications/filterState.ts` — doc-comment trimmed (the `?tab=` URL-driven note is no longer relevant).

  **Router**: `pages/NotificationsCompose` imported in `router.tsx`; new `<Route path="/content/notifications/new" element={<NotificationsCompose />} />` added between the list + detail routes. Back-compat redirect `/notifications` → `/content/notifications` via `RedirectPreservingQuery` unchanged (still works; the `?tab=` param it preserved is now ignored by the destination, harmless).

  **i18n**:
  - **Removed** (no longer referenced): `admin.notifications.tab.compose`, `admin.notifications.tab.sent` (the Tabs triggers).
  - **Added**: `admin.notifications.action.new` ("New notification" — header CTA), `admin.notifications.compose.back-to-list` ("Back to notifications" — Compose page back-link, no `← ` prefix per LESSON 2026-05-02), `admin.notifications.compose.page-title` ("New notification"), `admin.notifications.compose.page-subtitle` ("Compose and dispatch a push notification — broadcast, segmented, or single-recipient.").
  - **Reused**: `admin.notifications.title`, `admin.notifications.subtitle.counts` (still drives the list page's count subtitle), all `compose.*` body keys consumed by `<ComposePane>`.

- **Files modified**:
  - `dashboard/src/pages/Notifications.tsx` — full rewrite to list-only
  - `dashboard/src/components/notifications/sent/SentPane.tsx` — Props rename `onSwitchToCompose` → `onCreateNew`; drop `refreshVersion` plumbing
  - `dashboard/src/components/notifications/detail/DetailHeader.tsx` — back-link path simplified
  - `dashboard/src/components/notifications/filterState.ts` — doc-comment trimmed
  - `dashboard/src/pages/SentNotificationDetail.tsx` — not-found fallback path simplified
  - `dashboard/src/router.tsx` — `/new` route added; `NotificationsCompose` import
  - `dashboard/src/lib/i18n.ts` — 4 keys added, 2 removed
  - `ai_context/HISTORY.md` — this entry
  - `ai_context/AI_CONTEXT.md` — Current phase paragraph + Routes (admin) decision row + Active workstreams entry updated

- **Files added**:
  - `dashboard/src/pages/NotificationsCompose.tsx` — new dedicated compose page

- **Verified**: `npx tsc --noEmit` (exit 0) · `npx vite build` (exit 0) · dev-server probes returned HTTP 200 for `/content/notifications`, `/content/notifications/new`, and `/content/notifications/sent/notif_023`. Lessons-compliance grep sweep clean (sub-13px / sticky-thead / Visa-Mastercard / `← ` prefix / uppercase-tracking-wider all 0 hits). Browser eyeballing deferred — please spot-check: list page shows `+ New notification` CTA in header that routes to `/new`; compose page renders inline back-link + title + subtitle then the form + sticky preview + sticky-bottom action bar; Cancel button on action bar navigates back to list; submit (send/schedule) navigates to the new row's detail page; `n` chord on list opens compose; back-link on detail page returns to list (no `?tab=` query); browser back/forward + direct URL navigation works on every route.

---

### 2026-05-03 — Admin Notifications (Phase 19) — `/content/notifications` · composer + sent history · 38-row uz/ru/en seed · schema cascade (notifications status / audience / scheduling / send-stats fields + state machine doc) · `/notifications` placeholder retired in favor of `/content/notifications`

- **Summary**: Built the admin Notifications surface — third `/content/*` admin CMS after Stories (Phase 17) and News (Phase 18). Two-tab page (Compose / Sent) at `/content/notifications` plus full-page detail at `/content/notifications/sent/:id`. **`mockNotifications.ts` is single source of truth** — 38 deterministic records (32 sent + 4 scheduled + 2 cancelled) covering 4 types (transfer / promo / system / compliance) × 3 audience types (broadcast / segment / single). Seed authored in 3 locales (uz default, ru, en) with realistic content per spec ("Pul jo'natildi — 5 000 000 UZS / 3 562 CNY", "Sniženные тарифы", "MyID expiring in 14 days"). Per LESSON 2026-04-30: zero Visa/Mastercard mentions in mock copy — all card-themed transfer notifications use UzCard/Humo only. Five admin authors in the pool: Yulduz Otaboeva (super), Adel Ortiqova (finance), Bobur Yusupov (comms — new this phase), Madina Kholmatova (ops/compliance — new this phase), and a synthetic "System Notifications" actor for transactional per-user pushes.

  **Schema cascade (D1–D4)** — landed BEFORE any code per CLAUDE.md "Match the schema" rule:
  - **D1** `docs/models.md §7 NOTIFICATIONS` extended with 11 composer-side fields: `status` (`scheduled / sending / sent / cancelled / failed`), `audience_type` (`broadcast / segment / single`), `audience_criteria` (jsonb, segment-only), `scheduled_for`, `cancelled_at`, `cancellation_reason` (text, ≥20 chars), `composed_by` (FK admin_users), `recipient_count`, `delivered_count` / `opened_count` / `click_through_count` (nullable until status=sent). `user_id NULL = broadcast/segment` semantics preserved verbatim. `is_read` / `read_at` clarified as per-user-only (audience_type=single).
  - **D2** New state machine doc `docs/mermaid_schemas/notification_send_state_machine.md` — terminal states `sent / failed / cancelled` are immutable (push notifications non-recallable); audit verbs mapped to `send / schedule / cancel_scheduled` for the `entity_type=notification` rows.
  - **D3** `dashboard/src/lib/deepLinkScreens.ts` extended to 10 screens — added `card_detail` (requires `card_id`) and `settings` (no params). New `DEEP_LINK_REQUIRED_PARAMS` map provides soft-validation hints in the composer's params editor.
  - **D4** `notification_type` enum unchanged — already matched spec (`transfer / promo / system / compliance`). Compliance typed-confirm ("I confirm" / "Подтверждаю" / "Tasdiqlayman") is a UI-layer rule only, not schema.
  - **D5** Route move `/notifications` (placeholder) → `/content/notifications` with back-compat redirect. Sidebar entry rewired to the new path; the `/notifications` route is now a `RedirectPreservingQuery` to `/content/notifications`.
  - **D6** Keyboard chord `g+i` reserved for the route — added to `HelpOverlay` and `CommandPalette` (the dashboard's chord prefix-handler is documentation-only at this point; cosmetic listing only).
  - **D9** Mock seed scope: 32 sent + 4 scheduled + 2 cancelled = 38 rows. Stats numbers tuned (delivered ~96–99%, opened 30–55% for broadcasts / 60–85% for single-user transactional, click-through 12–28% of opened when deep_link present).

  **`docs/product_requirements_document.md` updated**: added feature row 13 ("Admin push notification composer | P0 | broadcast / segment / single · 3-locale · scheduled · audit-trailed") + Gherkin AC fragment covering the broadcast / segment / compliance / cancel-scheduled / immutability paths.

  **Pattern layer** (`dashboard/src/components/notifications/`):
  - `types.ts` — `ComposeForm`, `ComposeErrors`, `SegmentCriteria`, `LastLoginBucket`, `NotificationFilters`, `NotificationSort`, `applyNotificationFilters`, `applyNotificationSort`, `countActiveFilters`, `TITLE_MAX=60`, `BODY_MAX=180`, `CANCEL_REASON_MIN=20`, `LARGE_AUDIENCE_THRESHOLD=5000`, `USER_SEARCH_DEBOUNCE_MS=300`, label-key maps for status / audience / type / last-login enums
  - `filterState.ts` — module-level UI cache (filters / sort / focusedId) for Sent tab; URL-driven active-tab is NOT cached (URL is source of truth)
  - `audienceEstimate.ts` — pure-function `estimateAudience(criteria)` against `mockUsers.ts` (50-user seed) + `audienceLanguageBreakdown` for Stats card + `searchUsersForPicker(query)` for the single-user picker (debounced)
  - `compose/RadioCard.tsx` — branded radio-card primitive (mirrors Stories' `TypeRadioCard` styling)
  - `compose/AudienceSection.tsx` — radio (broadcast / segment / single) with conditional `<SegmentBuilder>` and `<UserPicker>`, live `Estimated audience: N users` line, `audience-empty` validation hint
  - `compose/SegmentBuilder.tsx` — chip-toggle UI for tier multi · language multi · has-card tristate · has-transfer tristate · last-login enum (4 buckets); `Clear all criteria` action
  - `compose/UserPicker.tsx` — debounced (300ms) name-or-phone search; results dropdown with `<UserAvatar>` + name + phone subline + `<TierBadge>`; selected-state shows compact card + `Change` button
  - `compose/TypePicker.tsx` — 4-radio picker with tooltip per type (compliance tooltip explicitly notes "bypasses user notification preferences")
  - `compose/ContentSection.tsx` — `<LocaleTabInputs>` for title (max 60) + `<LocaleTabTextarea>` for body (max 180); both consume the lifted `zhipay/` primitives; red-dot indicator on missing locale tabs after `setShowErrors(true)` (News pattern)
  - `compose/DeepLinkSection.tsx` — toggle + screen `<Select>` (10 screens) + `<ParamsEditor>` (JSON textarea) + live preview-string line `zhipay://<screen>?<query>`
  - `compose/ParamsEditor.tsx` — JSON object validator with on-blur commit + soft warning when required params missing (per `DEEP_LINK_REQUIRED_PARAMS`); copied from Stories' `ParamsEditor` rather than lifted to `zhipay/` (lift deferred — only 2 consumers, the third would justify it)
  - `compose/ScheduleSection.tsx` — radio (now / later) with conditional `<DateTimeInput>` (5min granularity, min = now+5min snapped); error state when datetime missing or in the past
  - `compose/PreviewPane.tsx` — sticky on `lg+` (`lg:sticky lg:top-4`), mode toggle (Lock screen / In-app), locale switcher (uz/ru/en), renders `<LockScreenPreview>` or `<InAppPreview>` inside the lifted `<PhoneMockup>`
  - `compose/MobilePreviewSheet.tsx` — `<lg` mirror of preview, opens via `<Sheet side="bottom">` with `<PreviewPane bare />` inside
  - `preview/LockScreenPreview.tsx` — iOS-style lock-screen card (gradient dark wallpaper + 9:41 clock + brand-mini-icon notification card with title-bold + body + "now" + chevron+screen-name when deep-link)
  - `preview/InAppPreview.tsx` — in-app notifications-list-row variant (faux app header + ghost row for context + active row with type-toned icon chip + brand-tinted ring on the active row + chevron+screen-name when deep-link)
  - `compose/ComposeActionBar.tsx` — sticky-bottom (`fixed inset-x-0 bottom-0 md:left-[var(--sidebar-width,4rem)]` per LESSON 2026-05-02); audience summary chip + type chip + schedule chip + Cancel + primary CTA (Send / Schedule per radio state)
  - `compose/SendConfirmDialog.tsx` — AlertDialog with 4 visual variants (standard / large-broadcast > 5000 / compliance typed-confirm / scheduled-for); compliance gate uses trim+lowercase comparison against the localized "I confirm" string
  - `compose/ComposePane.tsx` — orchestrator that owns form state, derives errors, renders the 6 sections + sticky preview + action bar + confirm dialog; `summarizeMissing()` helper + always-clickable primary button + sonner toast on validation failure (Phase 18b LESSON pattern); `Cmd/Ctrl+1/2/3` swap locale tabs, `Cmd/Ctrl+Enter` submits

  **Sent tab pattern layer** (`dashboard/src/components/notifications/sent/`):
  - `NotificationsFilterBar.tsx` — carded shell (Phase 18b LESSON: `bg-card` outer + `bg-background` search input); search · type-multi · audience-type-multi · DateRangePicker · Clear-all
  - `StatusChip.tsx` — 5-tone palette (success Sent / brand Scheduled+Sending / muted Cancelled / danger Failed) with type-appropriate Lucide icons
  - `AudienceCell.tsx` — broadcast (Megaphone + "All users · 12 423") / segment (Filter + "Segment · 2 847") / single (`<UserAvatar size="sm">` + name)
  - `SentTable.tsx` — sortable desktop table on `lg+`, non-sticky thead per LESSON 2026-04-30, Title-Case `<TableHead>` per LESSON 2026-05-02, click row → navigate to detail; columns: Sent at (relative + absolute on hover) · Type chip+icon · Audience cell · Title (admin-locale) · Read rate (progress bar; em-dash for single-user / pre-send) · Sent by (`<UserAvatar size="sm">` + name) · Status chip
  - `SentMobileCardStack.tsx` — `<lg` mirror; tap → detail
  - `EmptyState.tsx` — 2 variants (no-records → Compose CTA; no-matches → Clear-all CTA)
  - `SentPane.tsx` — list orchestrator (filter-bar + table or mobile cards + empty states); `j/k` row focus + `Enter` open; `/` focus search; `f` focus first chip

  **Sent detail pattern layer** (`dashboard/src/components/notifications/detail/`):
  - `DetailHeader.tsx` — flow inline (NEVER sticky per LESSON 2026-05-02); back-link `<ArrowLeft> Back to notifications` per LESSON 2026-05-02 (no `← ` prefix in i18n); identity row with type chip + StatusChip + audience summary
  - `ContentCard.tsx` — read-only 3-locale tabs with brand-tinted active state (Phase 18b styling)
  - `AudienceCard.tsx` — type + recipient count + criteria summary (segment) or user link (single, deep-links to `/customers/users/:id`)
  - `DeepLinkCard.tsx` — screen + read-only jsonb viewer + full URL string (only rendered when `deep_link` is set)
  - `StatsCard.tsx` — Total sent · Delivered % w/ progress · Opened % w/ progress · Click-through % (when deep_link present) · 3-segment horizontal stacked bar for recipient language breakdown (uz / ru / en) computed via `audienceLanguageBreakdown(criteria)`
  - `AuditCard.tsx` — composed-by (`<UserAvatar>` + name + admin id) · created/sent/scheduled/cancelled timestamps (formatted) · cancellation reason banner (warning-tinted, when `cancelled`) · `View in audit log` deep-link to `/compliance/audit-log?entityType=notification&entityId={id}`
  - `CancelScheduledActionBar.tsx` — sticky-bottom only when `status='scheduled'`, same `fixed inset-x-0 bottom-0 md:left-[var(--sidebar-width,4rem)]` pattern as ComposeActionBar
  - `CancelScheduledDialog.tsx` — `<Dialog>` with ≥20-char reason + warning banner; on confirm, calls `cancelScheduledNotification(id, reason, actor)` mutator → status flips to `cancelled`, audit row written, toast.success

  **Pages**:
  - `pages/Notifications.tsx` — `<Tabs>` shell driven by `?tab=compose|sent` (URL is source of truth); page-scoped `c` / `s` chords switch tabs; admin locale hardcoded `uz` for v1 (forward-compat for global admin-locale switcher)
  - `pages/SentNotificationDetail.tsx` — fetches by `:id`, bounces to list with toast if not found, two-column on `lg+` (left: Content / Audience / DeepLink / Audit · right: Stats), stacked on `<lg`, sticky-bottom Cancel-scheduled action bar only for `status='scheduled'`

  **Mutators + audit-log integration** (`dashboard/src/data/mockNotifications.ts`):
  - `createNotification(input, actor)` — single mutator handles both "send now" (status=sent + simulated stats) and "schedule for later" (status=scheduled + null stats); inserts row + audit entry (`send` or `schedule` action verb) atomically
  - `cancelScheduledNotification(id, reason, actor)` — guard: id must exist + status must be `scheduled` + reason ≥20 chars; flips to `cancelled` with timestamp + reason + audit entry (`cancel_scheduled` action verb)
  - `listNotifications()` / `getNotificationById(id)` / `listNotificationAudit()`
  - Audit-bridge wired in `mockAuditLog.ts` via `bridgeNotificationAudit(e: NotificationAuditEntry)` — same pattern as News' `bridgeNewsAudit`. `AuditEntityType` already included `'notification'` (pre-existing). Action map: send→`created`, schedule→`created`, cancel_scheduled→`status_changed`. `fromStatus`/`toStatus` populated for the cancellation flip so the audit-log filter shows the state diff.
  - Seed audit rows (one per existing notification, two for cancelled ones — schedule + cancel_scheduled in chronological order) populated via IIFE so the audit-log surface has matching entries from session boot.

  **Lessons-compliance verified via grep sweep**:
  - 0 sub-13px text in any new component
  - 0 sticky thead in `SentTable.tsx`
  - 0 Visa/Mastercard mentions in `mockNotifications.ts` seed copy (only the docstring header references "Visa / Mastercard are deliberately absent" as the lesson-compliance reminder)
  - 0 `← ` literal prefix in any new i18n key
  - 0 `uppercase tracking-wider` on `<TableHead>` cells
  - 0 `text-xs` outside the reserved patterns (chips / badges / kbd / uppercase section labels)
  - All compose / sent / detail buttons use `text-sm` minimum per LESSON 2026-05-01
  - Detail header flows inline (`UserHeader` shape) per LESSON 2026-05-02; back-link uses `<ArrowLeft>` per LESSON 2026-05-02
  - Compose + Cancel-scheduled action bars use the canonical `fixed inset-x-0 bottom-0 md:left-[var(--sidebar-width,4rem)]` pattern with page wrapper `pb-28` per LESSON 2026-05-02
  - Filter bar uses carded `bg-card` shell + `bg-background` search input per Phase 18b LESSON
  - Tabs / locale tabs / preview-mode toggle inherit `bg-card + shadow-sm + brand ring` active state per Phase 18b LESSON (the `<TabsTrigger>` primitive flip already landed in Phase 18b; this phase consumes it)

- **Files modified**:
  - `docs/models.md` — §7 NOTIFICATIONS extended with 11 fields + 2 new enums + lifecycle ref · §9.1 enums table extended w/ `notification_status` + `notification_audience_type` · §9.2 indexing recommendations extended w/ 4 new indexes
  - `docs/mermaid_schemas/notification_send_state_machine.md` — new file (state diagram + audit-verb table + UI-mapping table)
  - `docs/product_requirements_document.md` — feature row 13 + Gherkin AC fragment
  - `dashboard/src/lib/deepLinkScreens.ts` — DeepLinkScreen union extended to 10 (added `card_detail`, `settings`); `DEEP_LINK_REQUIRED_PARAMS` map added
  - `dashboard/src/lib/i18n.ts` — ~150 new `admin.notifications.*` keys (compose / sent / detail / preview / validation / dialogs / actions); plus 4 deep-link keys for the 2 new screens
  - `dashboard/src/router.tsx` — `Notifications` + `SentNotificationDetail` routes added; `/notifications` placeholder retired; `/notifications` → `/content/notifications` redirect added
  - `dashboard/src/components/layout/Sidebar.tsx` — Content section href `/notifications` → `/content/notifications`
  - `dashboard/src/components/layout/HelpOverlay.tsx` — Navigation chords list extended with `g y` (Stories), `g n` (News), `g i` (Notifications)
  - `dashboard/src/components/layout/CommandPalette.tsx` — Notifications row added to Navigate group
  - `dashboard/src/data/mockAuditLog.ts` — `NotificationAuditEntry` import + `NOTIFICATION_ACTION_MAP` + `bridgeNotificationAudit` + listing-merge entry

- **Files added**:
  - `dashboard/src/data/mockNotifications.ts` — 38-row seed + types + mutators + audit
  - `dashboard/src/components/notifications/types.ts` — domain types + filters/sort + label-key maps + constants
  - `dashboard/src/components/notifications/filterState.ts` — module-level UI cache for Sent tab
  - `dashboard/src/components/notifications/audienceEstimate.ts` — pure-function audience estimation + breakdown + user search
  - `dashboard/src/components/notifications/compose/RadioCard.tsx`
  - `dashboard/src/components/notifications/compose/AudienceSection.tsx`
  - `dashboard/src/components/notifications/compose/SegmentBuilder.tsx`
  - `dashboard/src/components/notifications/compose/UserPicker.tsx`
  - `dashboard/src/components/notifications/compose/TypePicker.tsx`
  - `dashboard/src/components/notifications/compose/ContentSection.tsx`
  - `dashboard/src/components/notifications/compose/DeepLinkSection.tsx`
  - `dashboard/src/components/notifications/compose/ParamsEditor.tsx`
  - `dashboard/src/components/notifications/compose/ScheduleSection.tsx`
  - `dashboard/src/components/notifications/compose/PreviewPane.tsx`
  - `dashboard/src/components/notifications/compose/MobilePreviewSheet.tsx`
  - `dashboard/src/components/notifications/compose/ComposeActionBar.tsx`
  - `dashboard/src/components/notifications/compose/SendConfirmDialog.tsx`
  - `dashboard/src/components/notifications/compose/ComposePane.tsx`
  - `dashboard/src/components/notifications/preview/LockScreenPreview.tsx`
  - `dashboard/src/components/notifications/preview/InAppPreview.tsx`
  - `dashboard/src/components/notifications/sent/NotificationsFilterBar.tsx`
  - `dashboard/src/components/notifications/sent/StatusChip.tsx`
  - `dashboard/src/components/notifications/sent/AudienceCell.tsx`
  - `dashboard/src/components/notifications/sent/SentTable.tsx`
  - `dashboard/src/components/notifications/sent/SentMobileCardStack.tsx`
  - `dashboard/src/components/notifications/sent/EmptyState.tsx`
  - `dashboard/src/components/notifications/sent/SentPane.tsx`
  - `dashboard/src/components/notifications/detail/DetailHeader.tsx`
  - `dashboard/src/components/notifications/detail/ContentCard.tsx`
  - `dashboard/src/components/notifications/detail/AudienceCard.tsx`
  - `dashboard/src/components/notifications/detail/DeepLinkCard.tsx`
  - `dashboard/src/components/notifications/detail/StatsCard.tsx`
  - `dashboard/src/components/notifications/detail/AuditCard.tsx`
  - `dashboard/src/components/notifications/detail/CancelScheduledActionBar.tsx`
  - `dashboard/src/components/notifications/detail/CancelScheduledDialog.tsx`
  - `dashboard/src/pages/Notifications.tsx`
  - `dashboard/src/pages/SentNotificationDetail.tsx`

- **Docs updated**: `docs/models.md` (§7 + §9.1 + §9.2) · `docs/mermaid_schemas/notification_send_state_machine.md` (new) · `docs/product_requirements_document.md` (§6.1 row 13 + AC fragment) · `ai_context/AI_CONTEXT.md` (decisions table + route map + phase index — see below) · `ai_context/HISTORY.md` (this entry).

- **Verified**: `npx tsc --noEmit` (exit 0) · `npx vite build` (exit 0; chunk-size warning is pre-existing) · `npx vite --port 5181` boots; `curl /` HTTP 200; `curl /#/content/notifications` HTTP 200. Lessons-compliance grep sweep clean (sub-13px / sticky-thead / Visa-Mastercard-in-mock / `← ` prefix / uppercase-tracking-wider on column headers all 0 hits). Browser eyeballing deferred — please spot-check: Compose tab loads, audience radio switches sub-form correctly, segment criteria live-update count, single-user picker debounced search works, type tooltips render on hover, locale tabs swap correctly with red-dot on missing after submit attempt, char counters update live, deep-link toggle reveals editor + live preview string, schedule "later" reveals DateTimeInput with 5min granularity, lock-screen + in-app preview both render, send-confirm dialog has correct copy variants for standard / large / compliance / scheduled, compliance typed-confirm gates the primary CTA, send → row appears in Sent tab + audit-log row appears at `/compliance/audit-log?entityType=notification`, scheduled rows show Cancel-scheduled action bar on detail with ≥20-char reason gate, mobile (<lg) stacks correctly + Preview button opens sheet.

---

### 2026-05-03 — News follow-ups + filter-bar unification + segmented active-state contrast bump (Phase 18b)

- **Summary**: Cluster of polish items landed after the Phase 18 News build. Five threads:
  1. **News cover-image upload** — picker now supports both URL paste and file upload via `FileReader.readAsDataURL`. Always-visible 16:9 placeholder with mountain-and-sun glyph + caption "Here the uploaded image appears" when empty + clickable file-picker trigger; remove-X overlay when an image is loaded; URL input disables itself when a `data:` URL is in play and re-enables when cleared. 5 MB max; PNG / JPG / WebP / GIF accepted; toast errors for unsupported type / oversized / read-failure. Image-URL validator in `NewsEditor.tsx` extended to accept both `https?://...` and `data:image/(png|jpe?g|webp|gif);base64,...`. No schema change — `data:` URL flows through the existing `imageUrl: string | null` field. Real backend would replace it with a server-side upload + CDN URL on save.
  2. **News body min reduced 200 → 50 plain-text characters** — `BODY_MIN_PLAIN` constant in `components/news/editor/types.ts`. The `{min}` placeholder in i18n strings (`admin.news.editor.body-counter`, `admin.news.editor.validation.body-required`, `admin.news.editor.validation.summary.bodies`) carries the live value so future tweaks need only a constant edit. Per user direction; original spec called for 200.
  3. **News editor publish-button UX rework** — the validation-gated primary button was disabled with no feedback (classic "disabled button hides the reason it's disabled" trap). Fix: primary button stays clickable when validation fails. Click triggers `setShowErrors(true)` (red dots on locale tabs missing required fields) + a sonner toast naming exactly what's missing ("Title missing for en", "Body needs ≥ 50 characters for uz · ru", "Reason note ≥ 20 chars required", "Image URL must start with http(s):// or be an uploaded image"). Save-as-draft secondary keeps its empty-content gate but also raises a toast on click. Cmd/Ctrl+S and Cmd/Ctrl+Enter route through the same handlers. New `summarizeMissing()` helper composes the toast string from the live `errors` set.
  4. **News date-range filter bug fix** — the popover never opened. Root cause: `<DateRangeChip>` was a function component that didn't forward `onClick` + `ref` from Radix's `<PopoverTrigger asChild>` slot. Inlined the trigger button directly inside `<DateRangePicker>` (matches AuditFilterBar precedent). Drafts are excluded when the date-range filter is active (since they have no `publishedAt`).
  5. **Filter-bar style unification across the 8 standard list pages** — survey identified two camps that were each internally consistent but disagreed cross-page: 4 carded (AuditLog / Stories / ErrorCodes / Blacklist) and 4 naked (Users / Cards / Recipients / News). Locked the carded variant as canonical: `rounded-md border border-border bg-card px-3 py-3 space-y-3` wrapper · search input `type="search"` (native X clear) on `bg-background pl-9 h-10 text-sm shadow-sm` (well-in-card) · chip row `flex flex-wrap items-center gap-2`. Updated 4 filter bars (Users / Cards / Recipients / News): added carded wrapper, flipped search input from `bg-card` → `bg-background` (since the wrapper is now the `bg-card` surface). Specialized layouts (Transfers multi-row sticky + bulk-action bar, KYC Queue + AML Triage master-detail context) flagged as out-of-scope for this unification.
  6. **Segmented active-state contrast bump (two-step)** — first pass bumped active filter chips + locale tab pills + RTE toolbar buttons from `bg-brand-50` → `bg-brand-100` for visibility against the new carded `bg-card` wrapper (low contrast was the trigger). User redirected to "white" — second pass replaced `bg-brand-100` with `bg-card` + added `shadow-sm` for elevation, keeping the brand-tinted text + border (or ring on locale tabs / RTE toolbar). Final active-state styling: chip triggers `border-brand-600 bg-card text-brand-700 dark:text-brand-300 shadow-sm font-medium` · locale tabs / RTE toolbar `bg-card text-brand-700 dark:text-brand-300 ring-1 ring-brand-300 dark:ring-brand-700/40 shadow-sm`. Also flipped shadcn `<TabsTrigger>` primitive's `data-[state=active]:bg-background` → `data-[state=active]:bg-card` (one-token change in `components/ui/tabs.tsx`) so all segmented controls (Personal/Corporate · iOS/Android · any future tabs) get clear contrast in light mode — the old `bg-background` (slate-50) was barely distinguishable from the `bg-muted` (slate-100) container. Popover-row checked state inside chip dropdowns deliberately kept at `bg-brand-100` (different visual context — inside a white popover, white-on-white would be invisible).

- **Files modified**:
  - `dashboard/src/components/news/editor/FormSections.tsx` — `CoverImageSection` rewrite (file picker + always-visible placeholder + caption + remove-X overlay); `BodiesSection` red-dot indicator already present, no change needed
  - `dashboard/src/components/news/editor/types.ts` — `BODY_MIN_PLAIN` 200 → 50
  - `dashboard/src/components/news/editor/RichTextEditor.tsx` — doc-comment updated to refer to `BODY_MIN_PLAIN` instead of hardcoded 200
  - `dashboard/src/components/news/editor/Toolbar.tsx` — active button state to `bg-card` + ring + shadow
  - `dashboard/src/pages/NewsEditor.tsx` — image-URL validator regex extended to accept `data:` URLs · `summarizeMissing()` helper + `flagAndToast()` wrapper · primary button always-clickable
  - `dashboard/src/components/news/NewsFilterBar.tsx` — search bar style aligned to peers (full rewrite); `<DateRangeChip>` inlined into `<DateRangePicker>`; later wrapped in carded shell + input bg-card → bg-background
  - `dashboard/src/components/users/UsersFilterBar.tsx` — carded wrapper + input bg-card → bg-background
  - `dashboard/src/components/cards/CardsFilterBar.tsx` — same
  - `dashboard/src/components/recipients/RecipientsFilterBar.tsx` — same
  - All 11 filter-bar files (`{kyc-queue,cards,audit-log,recipients,transfers,stories,news,blacklist,error-codes,users,aml-triage}/{Kyc,Cards,Audit,Recipients,Transfers,Stories,News,Blacklist,ErrorCodes,Users,Aml}FilterBar.tsx`) — chip-trigger active-state bumped via `perl -i -pe '... if /border-brand/'` (only lines with `border-brand` got changed, popover rows untouched)
  - 5 locale-tab files (`zhipay/{LocaleTabInputs,LocaleTabTextarea}.tsx`, `news/editor/{FormSections,NewsPhonePreview}.tsx`, `stories/editor/MobilePreviewSheet.tsx`) — locale tab active-state bumped (ring + bg + shadow)
  - `dashboard/src/components/ui/tabs.tsx` — `data-[state=active]:bg-background` → `data-[state=active]:bg-card` (one-token change; affects every TabsTrigger consumer in the app)
  - `dashboard/src/lib/i18n.ts` — ~10 new `admin.news.editor.image-upload.*` keys + 5 `admin.news.editor.validation.summary.*` keys (toast summary strings) + `admin.news.editor.image-url-uploaded` placeholder
  - `ai_context/AI_CONTEXT.md` — News paragraph extended w/ follow-ups; 5 new "Decisions made" rows (Filter-bar pattern · Segmented active-state styling · News body min · News cover image · Publish-button validation UX)
  - `ai_context/HISTORY.md` — this entry

- **Files unchanged but referenced** (intentional non-targets for the segmentation contrast bump): transfer-detail tinted cards (Sender/InternalNotes/AdminActionHistory) · `<Alert variant="info">` · UserAvatar fallback · Services RecentActivityCard + ServiceTile · Sidebar nav (uses 2px brand bar indicator + intentionally subtler fill). These keep `bg-brand-50` / `bg-brand-100` on purpose — they're tinted information surfaces or special nav-active patterns, not "active among options" segmentation.

- **Docs updated**: `ai_context/AI_CONTEXT.md` · `ai_context/HISTORY.md`. **No** `docs/models.md` / PRD / mermaid / `docs/product_states.md` change — News row already at ✅, no schema/route/state-machine drift.

- **Verified**: `npx tsc --noEmit` (exit 0 after each step) · `npx vite build` (exit 0; chunk size warning is pre-existing) · `npx vite --port 5180` boots; `curl /` HTTP 200. Lessons-compliance greps clean: no sub-13px text, no sticky thead, no `← ` literal, no Visa/MC mentions in `mockNews.ts` (caught + cleaned during initial Phase 18 build). Browser eyeballing deferred — please spot-check: cover image upload + URL paste both work; placeholder caption visible when empty; remove-X clears; publish button on empty form raises toast naming what's missing + red dots appear on locale tabs; date-range filter popover opens and applies; all 8 standard list pages show carded filter bars with the same shape; active filter chips read clearly white-on-card with subtle shadow; Personal/Corporate + iOS/Android tab triggers have clear contrast in light mode.

---

### 2026-05-03 — Admin News (Phase 18) — `/content/news` · TipTap rich-text composer · 27-record uz/ru/en seed · schema cascade (rich-text body clarification + `image_url` nullable + listing index) · `PhoneMockup` + `LocaleTabInputs` lifted to shared · TipTap deps added · `g+n` rebound from notifications

- **Summary**: Built the News CMS — second `/content/*` surface after Stories. Article-list with multi-locale rich-text composer at `/content/news/new` and `/content/news/:id`. **`mockNews.ts` is single source of truth** — 27 deterministic records (23 published + 4 drafts) covering realistic press-release themes per spec (rates / Navruz / faster transfers / MyID / UZ-CN trade / Eid / NY discounts / app release / CB rate / Labour Day / saved recipients / 24/7 support / awards / rate-lock / Ramadan / Independence Day / business tier / partner banks / Yiwu trader / students / language settings / security / 1-yr anniversary; drafts: KZ corridor preview / new recipients screen beta / referral program / audit-reports announcement). Bodies authored as natural locale-appropriate translations (uz concise / ru formal-respectful / en direct), 2-4 paragraphs each. Mock-only audit-trail surrogates `createdBy / lastEditedAt / lastEditedBy` follow the FX/Commissions/Blacklist/AppVersions/Stories precedent. Status is **derived** from `is_published` (2 values: `published` / `draft`) — simpler than Stories' 4-value enum since News has no scheduled/expired semantics.

  **Decision deviations from the literal spec** (each flagged in the proposal and confirmed before implementation):
  - **D1 — `body_*` storage = HTML strings**. Schema's existing `string` type was kept; a one-line clarification added to §8 NEWS that body fields are HTML produced by the dashboard's TipTap RTE and sanitized server-side. More portable across RTE libraries than jsonb; better for SSR and full-text indexing. The dashboard renders via `dangerouslySetInnerHTML` only inside the trusted preview pane and editor (HTML is not user-supplied; the RTE produces it).
  - **D2 — `image_url` marked nullable** in §8. Spec says optional; original schema didn't say nullable. Tiny cascade.
  - **D3 — `(is_published, published_at DESC NULLS LAST)` listing index** added to §9.2 so the list-page sort with drafts-on-top is index-friendly.
  - **D4 — TipTap as the RTE** (the only meaningful net-new dependency this phase). 6 packages added: `@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/extension-link` + `@tiptap/extension-image` + `@tiptap/extension-underline` + `@tiptap/extension-placeholder`. ~30KB gzipped. Headless, ProseMirror-based, native keyboard (Cmd+B/I/U work out of the box). Alternatives (`contenteditable`+execCommand / markdown-textarea like App Versions Phase 15) wouldn't honor the spec's WYSIWYG toolbar (H2/H3/lists/quote/divider/inline-image/link with active-state).
  - **D6 — `g+n` rebound** from former `/notifications` placeholder to `/content/news`. Mnemonic-perfect for News. Notifications will get a different chord when its phase lands (`g+i` for Inbox is free).
  - **D7 — `PhoneMockup` lifted** from `components/stories/` → `components/zhipay/`. Stories' source comment explicitly anticipated this — News-editor preview is the 2nd consumer. Stories' `StoryPhonePreview.tsx` repointed.
  - **D8 — `LocaleTabInputs` lifted** from `components/stories/editor/` → `components/zhipay/`. News titles = 2nd consumer; Stories' `FormSections.tsx` repointed. Component already generic over i18n keys (`ariaLabelKey` / `localeLabelKey: Record<LocaleCode, string>` / `placeholderKeyPrefix` / `requiredErrorKey`) so each surface keeps its own `admin.<surface>.*` keys.
  - **D9 — Status enum is 2 values** (`published` / `draft`) — derived from `is_published`. No "scheduled" or "expired" like Stories.
  - **D10 — Default sort logic**: drafts first by `createdAt DESC`, then published by `publishedAt DESC`. Three sort options (Default / Published date / Created date).
  - **D11 — Edit-on-published reason note**: ≥20-char reason required when editing an already-published article (App Versions + Stories precedent). Plain edits to drafts don't require reason.
  - **D14 — Inline image in RTE toolbar = URL-input dialog** (no real upload backend in mock). Same pragmatism as Stories' cover-image URL.
  - **D15 — Unpublish action**: spec didn't list one explicitly, but the row kebab and editor save-as-draft on a published article both surface "Move to drafts" via `unpublishNews()` mutator + 1 audit row.

  **Lessons-compliance**:
  - During verification, two articles initially mentioned Visa/Mastercard in editorial body copy. Per LESSON 2026-04-30 spirit (Visa/MC scope-out applies to all dashboard-rendered content, not just filter chips), **rewrote `news_004`** to drop V/MC reference (now talks about saved-recipient list expansion) and **replaced `news_006` entirely** ("Visa/Mastercard support" → "Eid al-Adha / Qurbon Hayit"). Final `mockNews.ts` has zero V/MC mentions.
  - During TS verification, caught a `DateTimeInput` API mismatch: the prop is `onValueChange`, not `onChange`. Fixed in `FormSections.tsx`. Logged here as a sub-pattern for future consumers of the lifted primitive.
  - Initial PhoneMockup-from-Stories was already-clean (no sub-13px text — uses SVG glyphs only per LESSON 2026-04-29). Lifted as-is.

  **Pattern layer** (`dashboard/src/components/news/`):
  - `types.ts` — `NewsFilters` + `NewsSort` + `applyNewsFilters` (search across uz/ru/en titles, status multi, date-range against `publishedAt`) + `applyNewsSort` (3 sort keys) + `countActiveFilters` + `NEWS_STATUS_LABEL_KEY` + `NEWS_SORT_LABEL_KEY`
  - `filterState.ts` — module-level UI cache (filters / sort / focusedId)
  - `StatusChip.tsx` — 2-tone palette (success-tinted Published / muted-slate Draft)
  - `LocaleFillIndicator.tsx` — 3 small flag chips at full opacity (filled) or `opacity-30 grayscale` (missing); `computeLocaleFilled()` helper checks both title + plain-text body
  - `ImagePreview.tsx` — 60×40 thumb (table) or 88×64 rail (mobile cards) w/ slate-placeholder + ImageIcon fallback on missing/error
  - `SortDropdown.tsx` — 3-option dropdown (matches `SortableHeader` styling)
  - `NewsFilterBar.tsx` — 2-row bar: full-width search input (Search-icon left + inline X clear, debounced 300ms, page-scoped `/` focus, `aria-label`) + chip row (StatusChipMulti popover + `<DateRangePicker>` chip + Clear-all when active)
  - `NewsTable.tsx` — sortable desktop table on `lg+`, non-sticky thead per LESSON 2026-04-30, click-to-edit row + kebab actions, 8-row skeleton
  - `NewsMobileCardStack.tsx` — `<lg` mirror with same expand/kebab pattern (16:9 left rail image + title + status + locale-fill chips)
  - `DeleteNewsDialog.tsx` — 2-step (Dialog: ≥20-char reason + danger-tinted warning banner → AlertDialog "Are you sure?" before hard-delete)
  - `PublishNowDialog.tsx` — single-step AlertDialog
  - `UnpublishDialog.tsx` — Dialog w/ ≥20-char reason
  - `EmptyState.tsx` — 2 variants (no-records w/ Plus CTA, no-matches w/ Clear-all CTA)

  **Editor pattern layer** (`dashboard/src/components/news/editor/`):
  - `types.ts` — `NewsEditorValues` + `NewsEditorErrors` + constants (`TITLE_MAX=120`, `TITLE_WARN=100`, `BODY_MIN_PLAIN=200`, `REASON_MIN=20`)
  - `RichTextEditor.tsx` — TipTap wrapper. `useEditor` w/ StarterKit (h2/h3 only) + Underline + Link (no autoplay open, opens in new tab) + Image (lazy-load) + Placeholder. Editor is uncontrolled — `value` consumed only on mount; locale-flip remounts via `keyById` prop. `plainTextLength()` helper strips HTML tags + collapses whitespace for the 200-char min check. `NEWS_EDITOR_PROSE_CLASSES` exported so the preview pane reuses the same prose styling
  - `Toolbar.tsx` — 11 buttons (Bold / Italic / Underline + H2 / H3 + Bullet / Numbered + Link / Quote / Divider / Image), active-state highlight, mnemonic shortcuts in `title=` attribute, opens `LinkDialog` and `InlineImageDialog`
  - `LinkDialog.tsx` — URL input w/ `https?://` validation, Apply / Remove buttons (Remove only when existing link)
  - `InlineImageDialog.tsx` — URL + alt-text inputs, validates URL
  - `FormSections.tsx` — 5 sections (`CoverImageSection` / `TitlesSection` / `BodiesSection` / `PublishSection` / `ReasonSection`) + `FormSections` wrapper. Title length warning at >100 chars (warning tone). Body plain-text counter w/ red-when-below-min styling
  - `NewsPhonePreview.tsx` — 9:16 PhoneMockup + faux app top bar (back chevron + "News" eyebrow + share) + cover image strip + title + meta line + body rendered via `dangerouslySetInnerHTML` with `NEWS_EDITOR_PROSE_CLASSES` so preview matches editor exactly. Locale switcher above preview drives `previewLocale`
  - `MobilePreviewSheet.tsx` — Floating fixed-bottom-right Eye button (`<lg`) opens Sheet with same preview body
  - `EditorFooter.tsx` — Canonical `fixed inset-x-0 bottom-0 md:left-[var(--sidebar-width,4rem)]` pattern w/ Back (left) + Save-as-draft + Publish/Update (right). Primary label adapts: "Update" when editing already-published; "Publish" when form `isPublished=true`; "Save draft" otherwise
  - `PublishConfirmDialog.tsx` — AlertDialog w/ adaptive copy (Publish vs Update intent + interpolates `formatDateTime` for the publish stamp)

  **Pages**:
  - `pages/News.tsx` — list orchestrator. 350ms initial-mount skeleton. Module-cached state via `filterState`. 5 page-scoped hotkeys (`/` focus search · `f` focus first chip · `j/k` row focus · `Enter` open editor · `n` new). `formatDateTime` + `formatRelative` for column display. Toast notifications for delete/publish/unpublish. Adapts to mobile by switching desktop table → mobile card stack at `<lg`
  - `pages/NewsEditor.tsx` — `:id`-driven (new + edit branched). 404 state when `:id` doesn't resolve. Two-column layout w/ sticky preview right pane on `lg+`, mobile = floating Eye button → `MobilePreviewSheet`. 4-rule validation (titles all 3 locales · bodies all 3 locales ≥200 plain chars · image URL valid if non-empty · reason ≥20 if edit-on-published). Cmd/Ctrl+1/2/3 cycles locale tabs (also flips preview), Cmd/Ctrl+S save draft, Cmd/Ctrl+Enter primary action

  **Audit bridge** (`mockAuditLog.ts`): `'news'` added to `AuditEntityType` (now 13 types). `NEWS_ACTION_MAP` maps 5 granular actions (`add` / `edit` / `publish` / `unpublish` / `delete`) to the central enum (`add → created` / `edit → updated` / `publish/unpublish → status_changed` / `delete → deleted`). `bridgeNewsAudit` preserves granular verb in `context.kind`, snapshot of `{titleEn, isPublished, publishedAt, hasImage}` always included, per-field `previous` populated only for changed fields on edits, `from_status` / `to_status` set for publish/unpublish. `listNewsAudit()` merged into the central audit feed. `AuditFilterBar` + `AuditRowExpanded` updated. New i18n key `admin.audit-log.entity-type.news`.

  **Routing**: `/content/news` + `/content/news/new` + `/content/news/:id`. Back-compat redirects from `/news` / `/news/new` / `/news/:id` via plain `<Navigate>`. Removed `/news` from `PLACEHOLDER_ROUTES`. Sidebar entry repointed (`/news` → `/content/news`). TopBar `ROUTE_TITLES` repointed. CommandPalette gained "News" entry (Newspaper icon + `g n` shortcut hint). `useKeyboardShortcuts` `g+n` chord rebound from `/notifications` to `/content/news`.

  **i18n** — ~85 new `admin.news.*` keys (page chrome + count subtitle ICU `{published}` + `{draft}` / 3 sort labels / 2 status labels / 8 column labels + row kebab actions / 3 dialog bundles (Delete + Publish-now + Unpublish) / editor sections + fields + 12 toolbar tooltips + Link/Image dialogs + publish + reason + validation + preview pane + footer actions + 2 confirm-dialog bundles + not-found state) + 1 audit-log entity-type key.

  **Hotkeys** — list: `/` (focus search) · `f` (focus first chip) · `j`/`k` (row focus) · `Enter` (open editor) · `n` (new article). Editor: Cmd/Ctrl+1/2/3 cycle locale tabs (also flips preview), Cmd/Ctrl+S save draft, Cmd/Ctrl+Enter primary action. Global: `g+n` routes to `/content/news` (rebound from former `/notifications` placeholder).

- **Files created**:
  - `dashboard/src/data/mockNews.ts`
  - `dashboard/src/components/zhipay/PhoneMockup.tsx` (lifted from `stories/`)
  - `dashboard/src/components/zhipay/LocaleTabInputs.tsx` (lifted from `stories/editor/`)
  - `dashboard/src/components/news/{types,filterState,StatusChip,ImagePreview,LocaleFillIndicator,SortDropdown,NewsFilterBar,NewsTable,NewsMobileCardStack,DeleteNewsDialog,PublishNowDialog,UnpublishDialog,EmptyState}.tsx`
  - `dashboard/src/components/news/editor/{types,RichTextEditor,Toolbar,LinkDialog,InlineImageDialog,FormSections,NewsPhonePreview,MobilePreviewSheet,EditorFooter,PublishConfirmDialog}.tsx`
  - `dashboard/src/pages/News.tsx`
  - `dashboard/src/pages/NewsEditor.tsx`

- **Files deleted**:
  - `dashboard/src/components/stories/PhoneMockup.tsx` (lifted to `zhipay/`)
  - `dashboard/src/components/stories/editor/LocaleTabInputs.tsx` (lifted to `zhipay/`)

- **Files modified**:
  - `dashboard/package.json` (+ lockfile) — added 6 TipTap packages (@tiptap/react + @tiptap/starter-kit + @tiptap/extension-link + @tiptap/extension-image + @tiptap/extension-underline + @tiptap/extension-placeholder)
  - `dashboard/src/router.tsx` — added `/content/news` + `/content/news/new` + `/content/news/:id`; back-compat redirects from `/news`, `/news/new`, `/news/:id`; dropped `/news` from `PLACEHOLDER_ROUTES`
  - `dashboard/src/components/layout/Sidebar.tsx` — `/news` → `/content/news`
  - `dashboard/src/components/layout/TopBar.tsx` — `ROUTE_TITLES['/news']` → `ROUTE_TITLES['/content/news']`
  - `dashboard/src/components/layout/CommandPalette.tsx` — added News Navigate entry w/ `Newspaper` icon + `g n` shortcut hint
  - `dashboard/src/hooks/useKeyboardShortcuts.ts` — `g+n` rebound from `/notifications` to `/content/news`
  - `dashboard/src/components/stories/StoryPhonePreview.tsx` — repointed `PhoneMockup` import to `@/components/zhipay/PhoneMockup`
  - `dashboard/src/components/stories/editor/FormSections.tsx` — repointed `LocaleTabInputs` import to `@/components/zhipay/LocaleTabInputs`
  - `dashboard/src/data/mockAuditLog.ts` — added `NEWS_ACTION_MAP` + `bridgeNewsAudit` + `'news'` to `AuditEntityType` enum + `listNewsAudit()` merge into central
  - `dashboard/src/components/audit-log/AuditFilterBar.tsx` — `'news'` added to `ENTITY_TYPE_OPTIONS`
  - `dashboard/src/components/audit-log/AuditRowExpanded.tsx` — `ENTITY_LINK['news']` → `/content/news/:id`
  - `dashboard/src/lib/i18n.ts` — ~85 new `admin.news.*` keys + `admin.audit-log.entity-type.news`

- **Docs updated**: `docs/models.md` §8 NEWS (rich-text body clarification + nullable image_url + nullable-until-publish for published_at) · §9.2 (added `(is_published, published_at DESC NULLS LAST)` listing index for `news`) · `docs/product_states.md` (News row flipped Done; route updated to `/content/news`) · `ai_context/AI_CONTEXT.md` (current-phase paragraph + 1 new workstream entry) · `ai_context/HISTORY.md`. **No** PRD / mermaid change.

- **Verified**: `npx tsc --noEmit` (exit 0) · `npx vite build` (exit 0; chunk size warning is pre-existing, not News-related) · `npx vite --port 5180` boots; `curl /` → HTTP 200 (HashRouter — `/content/news` resolves under the hash). Lessons-compliance greps clean: no sub-13px hardcoded text in news pattern + page files · no `sticky top-0` on detail headers · no `← ` literal back-link prefixes · no Visa/Mastercard mentions in `mockNews.ts` (initial draft had 2 articles editorial-mentioning V/MC — `news_004` rewrote to drop reference, `news_006` replaced entirely with Eid al-Adha holiday theme) · canonical `fixed inset-x-0 bottom-0 md:left-[var(--sidebar-width,4rem)]` action bar pattern in EditorFooter · no `text-xs` in news flowing-meta or buttons. Browser eyeballing deferred — please spot-check: `/content/news` loads with 27 articles (23 published + 4 drafts), filter chips work, debounced title search filters across uz/ru/en, sort dropdown re-orders rows, click row → editor, RTE toolbar formats text, link/image dialogs work, locale tabs cycle via ⌘1/2/3 (also flips preview), Cmd/Ctrl+S saves draft, Cmd/Ctrl+Enter publishes, edit-on-published article requires reason note, delete is 2-step, mobile card stack renders at `<lg`, `g+n` global hotkey routes here, audit-log entries appear at `/compliance/audit-log?entity=news`.

---

### 2026-05-03 — Admin Stories (Phase 17) — `/content/stories` · drag-to-reorder card-grid CMS · 12-record uz/ru/en seed · schema cascade (`published_at` + per-locale CTA split + partial unique index) · `LocaleTabTextarea` lifted to shared · `@dnd-kit/*` added · 8-screen deep-link taxonomy · `Switch` + `Select` primitives added

- **Summary**: Built the Stories CMS — first surface under `/content/*`. Card-grid w/ drag-to-reorder for the published group, multi-locale (uz/ru/en) titles + CTA labels, scheduled publish via `published_at`, optional `expires_at`, and a full-page editor with phone-mockup live preview. **`mockStories.ts` is single source of truth** — 12 deterministic records (4 published / 4 scheduled / 4 drafts) seeded from the spec's themes (Add card 30s · Lower fees · WeChat 30s · MyID · Navruz · Rate-lock · Save recipients · Refer a friend · Trader bulk-send · Welcome · Default card · Ramazan rates). Status is **derived**, not stored — 4-value enum (`draft / scheduled / published / expired`) computed from `is_published × published_at × expires_at`. `display_order` is **unique among published rows only** (matches the new partial unique index in §9.2). Per-locale fields hand-authored as natural translations rather than transliterations.

  **Decision deviations from the literal spec** (each flagged in the proposal and confirmed before implementation):
  - **D1 — Schema cascade applied** (`docs/models.md` §8 STORIES): added `published_at timestamptz` (was missing — schema only had `is_published` boolean), split singular `cta jsonb {label, deep_link}` into per-locale `cta_label_uz/ru/en` + `cta_deep_link jsonb {screen, params}` (mirrors §6 NOTIFICATIONS canonical deep-link shape + Phase 16 ErrorCodes per-locale split precedent). Indexing recs (§9.2) gained a partial unique index `(display_order) WHERE is_published=true` plus a listing index `(is_published, published_at DESC)`.
  - **D4 — `@dnd-kit/*` added** to dashboard `package.json`: `@dnd-kit/core@^6.1.0` + `@dnd-kit/sortable@^8.0.0` + `@dnd-kit/utilities@^3.2.2`. Best-in-class accessible DnD lib with native keyboard support (space-to-grab + arrows) — required for spec-compliant reorder a11y.
  - **D5 — Status derivation logic** lives as `getStatus(s, atTime)` helper in `mockStories.ts`. Filter chip + StatusChip + grouping all read off it. Real backend would mirror as a derived view or recompute per request.
  - **D6 — Deep-link screens locked** in new `lib/deepLinkScreens.ts` constants module. 8 values per spec (`home / send_money / history / profile / kyc / transfer_detail / news / story`). Authoritative for Stories CTA today + future Notifications page. Helper `previewDeepLink(screen, params)` emits `zhipay://send-money?destination=wechat`-shaped URIs for the editor preview.
  - **D7 — `LocaleTabTextarea` lift**: pre-emptively lifted `components/app-versions/modals/ReleaseNotesEditor` → `components/zhipay/LocaleTabTextarea` (3rd-consumer rule honored — App Versions had a 2nd consumer for the same shape and Stories was poised to be the 3rd). Generic-over-i18n-keys: `ariaLabelKey` / `localeLabelKey: Record<LocaleCode, string>` / `placeholderKeyPrefix` / `requiredErrorKey` / `hintKey` / `charCountKey` so each consumer keeps its own surface-scoped strings. App Versions Add + Edit dialogs repointed. Stories editor uses a **single-line analogue** `LocaleTabInputs` (Stories-internal under `editor/`) for short fields like titles + CTA labels — `<Input>` instead of autoresizing `<textarea>`. Lifts later if a 2nd consumer appears.
  - **D8 — Phone-mockup primitive** stays Stories-internal (`components/stories/PhoneMockup.tsx`) for v1 — promotes to `zhipay/` if Notifications preview lands. 9:16 frame w/ notch + minimal status-bar chrome via SVG glyphs only (no sub-13px text per LESSON 2026-04-29 — earlier draft used `text-[10px]` "9:41" which violated the floor; replaced with illustrative SVG icons only).
  - **D9 — `cta.params` editor** is a small mono `<textarea>` with `JSON.parse` blur validation + per-screen hint copy. No syntax-highlighter library — the params surface is small (~1-3 keys typically) and a textarea with mono font + JSON-shape validation is sufficient.
  - **D10 — Mobile preview** uses `<Sheet side="bottom">` from existing UI primitives. Floating fixed-bottom-right `<Eye>` button on `<lg` opens the sheet w/ same `<StoryPhonePreview>` + locale switcher.
  - **D11 — Drag-to-reorder UX** restricted to the published group: SortableContext is given only `publishedIds`, non-published cards skip `useSortable`. On drop, **ReorderConfirmDialog** opens showing old→new slot visual + ≥20-char reason note. Cancel reverts (no optimistic mutation), confirm calls `reorderStory()` which shifts conflicting rows by ±1 to satisfy the partial unique index. Keyboard-accessible drag via dnd-kit's native space + arrow handling.
  - **D12 — `g+y` global hotkey** (since `s` and `t` are taken; `y` is closest mnemonic for "stories"). Page-scoped: `n` new · `j/k/Enter` per spec.
  - **D13 — Hard-delete with audit snapshot** included (spec was silent). Stories are CMS — no financial-history concern (unlike FX/Commissions which are version-history-only). DeleteStoryDialog 2-step (Dialog: ≥20-char reason + danger-tinted warning banner → AlertDialog "Are you sure?" before commit). Audit row preserves snapshot of `{titleEn, type, isPublished, displayOrder, publishedAt, expiresAt}` so the row reads cleanly after the live entry is gone.
  - **D14 — Routing**: first `/content/*` segment in the codebase. `/content/stories` (list) + `/content/stories/new` + `/content/stories/:id` (editor branched on `:id`). Back-compat: `/stories` → `/content/stories` + `/stories/new` + `/stories/:id` via plain `<Navigate>`. Removed `/stories` from `PLACEHOLDER_ROUTES`. Sidebar entry repointed; TopBar `ROUTE_TITLES` repointed; CommandPalette gained "Stories" entry under Navigate w/ `g y` shortcut hint; `useKeyboardShortcuts` `g+y` chord wired.
  - **D15 — Seed count** = 12 records exactly (4/4/4) per the explicit spec line — not the illustrative "12 / 4 / 8" in the header copy. The header chip reflects the live count (currently 4/4/4/0).

  **Save-as-draft on a previously-published story** triggers `unpublishStory()` mutator alongside `editStory()` — mock-only flow that produces two audit rows (one `edit`, one `unpublish`) so the draft-transition is auditable. New stories created via `addStory({ isPublished: true })` from the publish CTA emit one `add` audit row tagged `is_published=true`.

  **`AuditEntityType` += `'story'`**; entity-type chip + label key added to AuditLog filter (12 entity types now); `ENTITY_LINK['story']` wired to `/content/stories/:id` in `AuditRowExpanded`. `bridgeStoryAudit` maps the 6 granular Stories actions (`add / edit / publish / unpublish / reorder / delete`) onto the spec's 12-value central enum (`add → created · edit/reorder → updated · publish/unpublish → status_changed · delete → deleted`); granular verb stays in `context.kind`; `from_status`/`to_status` set for publish/unpublish transitions.

  **New `Switch` + `Select` ui primitives** added under `components/ui/` based on existing `@radix-ui/react-switch` + `@radix-ui/react-select` deps (radix packages were already in `package.json` but no shadcn wrappers existed — this build added them as the second / first consumers respectively).

  **i18n** — ~135 new keys: `admin.stories.*` (page chrome / count subtitle ICU `{published} {scheduled} {draft} {expired}` / 3 sort labels / 4 status labels / 2 type labels / 3 filter chips / card kebab + drag-handle aria + meta phrases / 4 dialog bundles (reorder + delete + publish-now + edit-confirm) / editor section headers + 6 form sections / 8 deep-link screen labels + 8 params hints / validation messages / 6 toast variants / empty states / phone-preview chrome) + `admin.deep-link.screen.*` + `admin.deep-link.params-hint.*` (8 each) + `common.actions.copy` / `common.actions.copied` + `admin.audit-log.entity-type.story`.

  **Hotkeys** — list: `n` new story · `j/k` card focus · `Enter` open editor. Editor: Cmd/Ctrl+1/2/3 cycle locale tabs (also flips preview), Cmd/Ctrl+S save draft, Cmd/Ctrl+Enter publish. Global: `g+y` routes to `/content/stories`.

- **Files created**:
  - `dashboard/src/data/mockStories.ts`
  - `dashboard/src/lib/deepLinkScreens.ts`
  - `dashboard/src/components/zhipay/LocaleTabTextarea.tsx` (lifted from app-versions)
  - `dashboard/src/components/ui/switch.tsx` (new shadcn wrapper for existing `@radix-ui/react-switch`)
  - `dashboard/src/components/ui/select.tsx` (new shadcn wrapper for existing `@radix-ui/react-select`)
  - `dashboard/src/components/stories/{types,filterState,StatusChip,TypeChip,MediaPreview,StoryCard,StoriesFilterBar,SortDropdown,StoryGrid,PhoneMockup,StoryPhonePreview,ReorderConfirmDialog,DeleteStoryDialog,PublishNowDialog,EmptyState}.tsx`
  - `dashboard/src/components/stories/editor/{LocaleTabInputs,DeepLinkBuilder,ParamsEditor,FormSections,EditorFooter,MobilePreviewSheet,PublishConfirmDialog,types}.tsx`
  - `dashboard/src/pages/Stories.tsx`
  - `dashboard/src/pages/StoryEditor.tsx`

- **Files moved (lift)**:
  - `dashboard/src/components/app-versions/modals/ReleaseNotesEditor.tsx` → `dashboard/src/components/zhipay/LocaleTabTextarea.tsx` (now generic over i18n keys)

- **Files modified**:
  - `dashboard/package.json` (+package-lock.json) — added `@dnd-kit/core@^6.1.0` + `@dnd-kit/sortable@^8.0.0` + `@dnd-kit/utilities@^3.2.2`
  - `dashboard/src/router.tsx` — added `/content/stories` + `/content/stories/new` + `/content/stories/:id` routes; back-compat redirects from flat `/stories` paths; dropped `/stories` from `PLACEHOLDER_ROUTES`
  - `dashboard/src/components/layout/Sidebar.tsx` — Stories nav entry `to: '/stories'` → `'/content/stories'`
  - `dashboard/src/components/layout/TopBar.tsx` — `ROUTE_TITLES['/stories']` → `'/content/stories'`
  - `dashboard/src/components/layout/CommandPalette.tsx` — added Stories Navigate entry w/ `Image` icon + `g y` shortcut hint
  - `dashboard/src/hooks/useKeyboardShortcuts.ts` — `g+y` chord → `/content/stories`
  - `dashboard/src/components/app-versions/modals/AddVersionDialog.tsx` + `EditVersionDialog.tsx` — repointed `ReleaseNotesEditor` import to lifted `LocaleTabTextarea` w/ surface-scoped i18n key props (also added `LOCALE_LABEL_KEY` import)
  - `dashboard/src/data/mockAuditLog.ts` — added `STORY_ACTION_MAP` + `bridgeStoryAudit` + `'story'` to `AuditEntityType` enum + listStoriesAudit() merge into central
  - `dashboard/src/components/audit-log/AuditFilterBar.tsx` — `'story'` added to `ENTITY_TYPE_OPTIONS`
  - `dashboard/src/components/audit-log/AuditRowExpanded.tsx` — `ENTITY_LINK['story']` → `/content/stories/:id`
  - `dashboard/src/lib/i18n.ts` — ~135 new keys (admin.stories.* + admin.deep-link.screen.* + admin.deep-link.params-hint.* + common.actions.copy/copied + admin.audit-log.entity-type.story)

- **Files deleted**:
  - `dashboard/src/components/app-versions/modals/ReleaseNotesEditor.tsx` (replaced by lifted shared component)

- **Docs updated**: `docs/models.md` §8 (cascade: STORIES schema split + `published_at` added; §9.2 added partial unique index + listing index for `stories`) · `docs/product_states.md` (Stories row flipped Done; route updated to `/content/stories`) · `ai_context/AI_CONTEXT.md` (current-phase paragraph + 1 new workstreams entry) · `ai_context/HISTORY.md`. **No** PRD / mermaid change.

- **Verified**: `npx tsc --noEmit` (exit 0) · `npx vite build` (exit 0; chunk size warning is pre-existing, not Stories-related) · lessons-compliance grep clean: no sub-13px hardcoded text in Stories pattern + page files (initial PhoneMockup `text-[10px]` "9:41" caught + replaced with SVG-only chrome) · no `sticky top-0` on detail headers · no `← ` literal back-link prefixes · no Visa/Mastercard mentions in Stories mock · canonical `fixed inset-x-0 bottom-0 md:left-[var(--sidebar-width,4rem)]` action bar pattern in EditorFooter. Browser eyeballing deferred — please spot-check: `/content/stories` loads with 12 cards (4 published + 4 scheduled + 4 drafts), filter chips work, drag handle on published cards opens reorder confirm with old→new visual, kebab Publish-now / Delete dialogs work, `n` opens editor, `g+y` global hotkey routes here, editor preview pane updates live as you type/switch locales, deep-link builder shows preview URI, mobile preview sheet opens via fixed-bottom-right Eye button on `<lg`, save-as-draft on a published story emits an unpublish audit row visible at `/compliance/audit-log?entity=story`.

---

### 2026-05-03 — Admin Error Codes (Phase 16) — `/system/error-codes` · read-only catalog · 15-row uz/ru/en seed · per-code observability cache · `LocaleFlag` lifted to shared

- **Summary**: Built the Error Codes catalog — read-only reference surface for ops to look up what users see for a given failure code. Single-column page: header with Export CSV → ReadOnlyBanner → canonical filter bar (search + 6-category multi + retryable single) → desktop sortable table on `lg+` / mobile card stack on `<lg` → click-to-expand inline RowExpanded. **`mockErrorCodes.ts` is single source of truth** — 15 codes spanning all 6 categories (kyc / acquiring / fx / provider / compliance / system), uz/ru/en authored as natural locale-appropriate translations (uz concise · ru formal-respectful · en direct). Schema cascade flagged at sign-off and applied: `docs/models.md` §7 splits singular `suggested_action` into per-locale `suggested_action_uz/ru/en` to parallel `message_*`; `.claude/rules/error-ux.md` updated to the plural form. Per-code "Last triggered + 24h/7d/30d daily counts + 7-day sparkline" rendered from a **mock-only synthetic observability cache** (deterministic FNV-1a seed per code-string into a Mulberry32 PRNG; sparse-series variant for `SANCTIONS_HIT`) — same precedent as Services & Health's observability cache. NOT derived from `mockTransfers` so the catalog stats stay coherent for codes that don't create transfer rows (KYC_REQUIRED etc.).

  **Decision deviations from the literal spec** (each flagged in the proposal and confirmed before implementation):
  - **Per-locale `suggested_action`** (D1) — schema literal in `docs/models.md` §7 had a singular `suggested_action`, but `.claude/rules/error-ux.md` already said *"localized via the same locale columns"*. Cascaded the schema to match the rule's intent (split into `suggested_action_uz/ru/en`) and updated the rule's bullet to the plural form. Mock + UI carry all three; row-expanded renders a 3-card row of suggested actions parallel to the 3-card row of localized messages.
  - **Last-triggered observability is mock-only** (D2) — schema doesn't carry temporal/volume fields and shouldn't (those live in metrics stores). Synthesized 30-day per-day count series + lastTriggeredAt per code with realistic frequency hints from spec: `LIMIT_DAILY_EXCEEDED` ~50/day base · `CARD_DECLINED` ~30 · `SANCTIONS_HIT` sparse 18% hit-prob · `SYSTEM_ERROR` ~7. **Dropped the planned `mockTransfers` backfill task** during execution since per-code stats live independently — the deep-link from Error Codes to Transfers list still works for the 6 codes in the existing `FAILURE_CODE_LIST` (CARD_DECLINED / RECIPIENT_INVALID / INSUFFICIENT_FUNDS / PROVIDER_UNAVAILABLE / LIMIT_DAILY_EXCEEDED / SANCTIONS_HIT) and lands on Transfers' canonical empty-results state for codes that don't create transfer rows (accurate behavior for KYC_REQUIRED etc.).
  - **WhereReferencedLinks scoped per-code** (D3) — always renders `/operations/transfers?failure_code=...` deep-link; renders `/compliance/aml-triage?type=sanctions` deep-link **only on `SANCTIONS_HIT`** since other compliance codes (LIMIT_*, KYC_*) have no clean correlation to a typed AML flag.
  - **`failure_code` filter dimension on Transfers** (D4) — added `failureCode?: string` to `TransferFilters` and wired it through `applyFilters` (literal match against `t.failureCode`). On mount, Transfers list reads `?failure_code=` URL param, seeds `filters.failureCode`, then strips the param (mirrors AuditLog's `?entity=` / `?id=` strip pattern). When active, a brand-tinted dismissable banner renders above the existing card / recipient context banners — clicking X clears `filters.failureCode`. Not exposed as a chip-row filter (kept off-keyboard since it's a deep-link only, not a faceted browse dimension).
  - **`LocaleFlag` lifted to `components/zhipay/`** (D5) — was Pattern-internal under `app-versions/`. Error Codes is the second consumer, so per `design-system-layers.md` (Pattern→Pattern import forbidden) lifted to the shared layer. Renamed exported type from `Locale` to `LocaleCode` to avoid name conflict at consumer sites (app-versions still owns its own internal `Locale` alias for `LOCALE_ORDER` + `LOCALE_LABEL_KEY`). Updated 4 app-versions consumers' imports (`ReleaseNotesPreview`, `modals/ReleaseNotesEditor`, `modals/ReleaseNotesPreviewPane`, `RowExpanded`) — the 4th was missed in the initial sweep and surfaced via `tsc --noEmit` ("Cannot find module './LocaleFlag'"). Now all four import from `@/components/zhipay/LocaleFlag`. Same precedent as `StepperNumberInput` + `DateTimeInput` lifted in Phase 10 and `useCopyFeedback` lifted in Phase 14.
  - **`g+e` global hotkey** (D6) — confirmed free in `useKeyboardShortcuts.ts` (`g+a` is AML, `g+v` is App Versions). Page-scoped: `/` focus search, `f` focus first chip, `j/k` row focus, `Enter` expand. Matches AuditLog's keyboard-driven read-only surface conventions.
  - **No audit-log bridging** (D7) — read-only catalog with no mutators. Same precedent as KycTiers and AuditLog itself. `error_code` deliberately NOT added to `AuditEntityType` enum since there's nothing to record.
  - **Message strings live on the mock record, not in i18n** (D8) — `message_uz/ru/en` and `suggested_action_uz/ru/en` are *data*, not UI strings, and live directly on the `ErrorCode` interface in `mockErrorCodes.ts` (mirrors schema). Existing 6 `common.errors.{CODE}.title/body` keys at `i18n.ts:360-374` left untouched (still consumed by Transfer Detail's failure rendering). Page chrome (column headers, banner copy, filter labels, locale labels, etc.) goes into `admin.error-codes.*` i18n keys per convention — ~38 new keys.
  - **Category tone palette locked per spec D9** — kyc=brand · acquiring/fx/provider=warning · compliance=danger · system=slate. Three categories sharing warning tone reflects domain reality (card-side / fx / provider issues are all "transient or recoverable on the user side"). RetryableChip: yes=success-tinted · no=muted-slate.
  - **Filter bar non-sticky** — followed AuditLog's final state (which removed `lg:sticky lg:top-0` per user feedback) over the spec's "(sticky)" line. Logged this deviation here for revisit if user wants the bar to stick.

  **Mock dataset** — `dashboard/src/data/mockErrorCodes.ts`. Deterministic manual seed (no PRNG for the rows themselves; PRNG only for the synthetic stats series). 15 `ErrorCode` records:
  - **kyc**: `KYC_REQUIRED` / `KYC_EXPIRED`
  - **acquiring**: `CARD_DECLINED` / `INSUFFICIENT_FUNDS` / `CARD_EXPIRED` / `THREE_DS_FAILED` / `3DS_TIMEOUT`
  - **fx**: `FX_STALE`
  - **provider**: `PROVIDER_UNAVAILABLE` / `RECIPIENT_INVALID`
  - **compliance**: `LIMIT_DAILY_EXCEEDED` / `LIMIT_MONTHLY_EXCEEDED` / `LIMIT_PER_TX_EXCEEDED` / `SANCTIONS_HIT`
  - **system**: `SYSTEM_ERROR`
  - Helpers: `listErrorCodes()` (sorted code ASC) / `getErrorCode(code)` / `countTriggersInWindow(code, hours)` (sum trailing day-aligned slice) / `getLastTriggeredAt(code)` / `getDailyCountsLast7d(code)` / `getMessage(ec, locale)` / `getSuggestedAction(ec, locale)`.
  - Synthetic stats: `STATS_SEEDS` table per-code declares `{base, jitter, sparseProb?, lastTriggeredMinAgo}` → Mulberry32 generator with code-string FNV-1a seed produces a 30-element daily-counts array; `SANCTIONS_HIT` uses sparse generator (18% hit prob, 0/1 series). Last-triggered range from `8 minutes` (LIMIT_DAILY_EXCEEDED — high freq) to `~4 days` (SANCTIONS_HIT — sparse).

  **Pattern layer** (`dashboard/src/components/error-codes/`):
  - `types.ts` — `ErrorCodeFilters` shape (search · categories[] · retryable any/yes/no) · `ErrorCodeSort` · `applyErrorCodeFilters` (search across code + 3 message + 3 suggested-action fields) + `applyErrorCodeSort` + `countActiveFilters` · `CATEGORY_LABEL_KEY` map
  - `filterState.ts` — module-level UI cache (filters · sort · expandedCode · focusedIndex)
  - `CategoryChip.tsx` — 6-tone palette per D9
  - `RetryableChip.tsx` — yes/no chip (success-tinted vs muted-slate)
  - `ReadOnlyBanner.tsx` — slate-100 banner with Info icon, deployment-only edit copy
  - `ErrorCodesFilterBar.tsx` — search input row (with inline X clear) + chip row (CategoryChipMulti popover with Checkbox per category + RetryableChipSingle popover with 3 radio options + Clear-all when active)
  - `ErrorCodesTable.tsx` — sortable desktop table (code default ASC; non-sticky thead; chevron / Code mono / Category chip / Retryable chip / 80-char message_en preview; click-to-expand inline; 10-row skeleton)
  - `ErrorCodesMobileCardStack.tsx` — `<lg` mirror with same expand-inline pattern (code mono + CategoryChip on left, RetryableChip + chevron on right, 100-char message_en preview)
  - `RowExpanded.tsx` — 2 sections of 3-card grids (md+ side-by-side, single column on narrow): localized messages then suggested actions (each card = LocaleFlag header + locale name + text body) + 2-column footer: WhereReferencedLinks + LastTriggeredCard
  - `WhereReferencedLinks.tsx` — Transfers deep-link always rendered; AML deep-link rendered only on `SANCTIONS_HIT`
  - `LastTriggeredCard.tsx` — relative-time chip (top-right) + 3 stat tiles (24h / 7d / 30d) + conditional 7-day daily-count sparkline (hidden when total7=0; recharts mini LineChart, no axes, brand-600 stroke)

  **Page** — `pages/ErrorCodes.tsx`. Single orchestrator, 350ms initial-mount skeleton matches KycTiers cadence. Persists `{filters, sort, expandedCode, focusedIndex}` to module-level cache via `filterState` so deep-link round-trips (Transfers ← back) restore state. Page-scoped hotkeys (`/` `f` `j` `k` `Enter`) ignore typing context. Export CSV emits 9-column CSV with all 15 codes.

  **Routing** — `/system/error-codes`. **Third `/system/*` route in the codebase** (after Services, App Versions). No `:id` route — read-only catalog; row-expand is inline. Back-compat: `/error-codes` → `/system/error-codes` via `RedirectPreservingQuery`. Removed `/error-codes` from `PLACEHOLDER_ROUTES`. Sidebar entry repointed (`/error-codes` → `/system/error-codes`); TopBar `ROUTE_TITLES` repointed; CommandPalette gained a new "Error Codes" entry under Navigate w/ `g e` shortcut hint; `useKeyboardShortcuts` `g+e` chord wired.

  **i18n** — ~38 new `admin.error-codes.*` keys (page header + subtitle / read-only banner / Export CSV button / search placeholder + aria + clear / clear-all / category labels for 6 cats / retryable yes/no/any / column headers / locale labels uz/ru/en / detail section headers / 24h/7d/30d window labels / sparkline label + meta interpolation / Transfers deep-link label / AML deep-link label / 2 empty-state title+body pairs). Plus 1 new `admin.transfers.context.failure-code-prefix` key for the dismissable failure-code banner on Transfers list.

  **Hotkeys** — list: `/` (focus search) · `f` (focus first chip) · `j/k` (row focus) · `Enter` (expand). Global: `g+e` routes to `/system/error-codes`. None conflict with the existing `g+ ` chord set.

- **Files created**:
  - `dashboard/src/data/mockErrorCodes.ts`
  - `dashboard/src/pages/ErrorCodes.tsx`
  - `dashboard/src/components/error-codes/{types,filterState,CategoryChip,RetryableChip,ReadOnlyBanner,ErrorCodesFilterBar,ErrorCodesTable,ErrorCodesMobileCardStack,RowExpanded,WhereReferencedLinks,LastTriggeredCard}.tsx` (+ `types.ts`, `filterState.ts`)
  - `dashboard/src/components/zhipay/LocaleFlag.tsx` (lifted from `components/app-versions/LocaleFlag.tsx`)

- **Files moved (lift)**:
  - `dashboard/src/components/app-versions/LocaleFlag.tsx` → `dashboard/src/components/zhipay/LocaleFlag.tsx` (now exports `LocaleCode` type alongside the component)

- **Files modified**:
  - `dashboard/src/router.tsx` — added `/system/error-codes` route; `RedirectPreservingQuery` back-compat from `/error-codes`; dropped `/error-codes` from `PLACEHOLDER_ROUTES`; new `<ErrorCodes>` import
  - `dashboard/src/components/layout/Sidebar.tsx` — System section's Error Codes entry `to: '/error-codes'` → `'/system/error-codes'`
  - `dashboard/src/components/layout/TopBar.tsx` — `ROUTE_TITLES['/error-codes']` → `'/system/error-codes'`
  - `dashboard/src/components/layout/CommandPalette.tsx` — added "Error Codes" Navigate entry w/ AlertCircle icon + `g e` shortcut hint
  - `dashboard/src/hooks/useKeyboardShortcuts.ts` — `g+e` chord → `/system/error-codes`
  - `dashboard/src/components/transfers/types.ts` — added `failureCode?: string` to `TransferFilters` + wired into `applyFilters` + `countActiveFilters`
  - `dashboard/src/pages/Transfers.tsx` — parses `?failure_code=` from URL on mount, seeds `filters.failureCode`, strips the param, renders dismissable brand-tinted banner (with `AlertCircle` icon + mono code + Clear button) above existing card/recipient context banners
  - `dashboard/src/components/app-versions/{ReleaseNotesPreview,modals/ReleaseNotesEditor,modals/ReleaseNotesPreviewPane,RowExpanded}.tsx` — repointed `LocaleFlag` import path to `@/components/zhipay/LocaleFlag`
  - `dashboard/src/lib/i18n.ts` — ~38 new `admin.error-codes.*` keys + 1 `admin.transfers.context.failure-code-prefix` key

- **Docs updated**: `docs/models.md` §7 (cascade: split `suggested_action` → `suggested_action_uz/ru/en`; expanded §7.1 examples table from 10 to 15 rows) · `.claude/rules/error-ux.md` (plural `suggested_action_*`) · `docs/product_states.md` (Error Codes row flipped Done; route updated to `/system/error-codes`) · `ai_context/AI_CONTEXT.md` (current-phase paragraph + 1 new workstreams entry) · `ai_context/HISTORY.md`. **No** PRD / mermaid change.

- **Verified**: `npx tsc --noEmit` (exit 0; surfaced one missed consumer at `app-versions/RowExpanded.tsx` during the LocaleFlag lift — fixed). Lessons-compliance grep results follow build verification step. Browser eyeballing deferred — please spot-check: `/system/error-codes` loads with 15 rows, search filters across all 3 locales, category multi-chip + retryable single-chip work, click-to-expand renders 3 locale message + 3 suggested-action cards + WhereReferencedLinks + LastTriggeredCard, "View transfers that failed with this code →" deep-link populates the failure-code banner on Transfers, banner X clears the filter, mobile card stack mirrors at `<lg`, `g+e` global hotkey + `j/k/Enter//f` page-scoped hotkeys work, Export CSV downloads `error-codes-YYYY-MM-DD.csv` with 15 rows × 9 columns.

---

### 2026-05-03 — Admin App Versions (Phase 15) — `/system/app-versions` · two-tab list (iOS / Android) + responsive Add / Edit Dialogs

- **Summary**: Built the App Versions surface — mobile-app release-management for iOS + Android binaries. Two-tab list with `?platform=` deep-link, ActiveVersionBanner per platform, sortable desktop VersionsTable + mobile card stack mirror, and responsive Add / Edit Dialogs that go full-screen on `<sm` and cap at 640 × 85vh from `sm+`. **`mockAppVersions.ts` is single source of truth** — 9 iOS + 9 Android deterministic seed (`NOW = 2026-04-29` matches every other store): 1.4.2 latest down to 1.2.0 force-update security release across the spec's 9-version histogram, dates spread over ~8 months at realistic cadence; uz/ru/en notes hand-authored as natural translations rather than transliterations (Pinyin/CJK convention same as Recipients). Schema reuses `docs/models.md` §8 verbatim plus mock-only audit-trail surrogates (`createdBy` / `lastEditedAt` / `lastEditedBy`) following the `mockFxRates` / `mockCommissionRules` / `mockBlacklist` precedent — **no schema cascade needed**. **Active version** derives as `MAX(released_at)` per platform (date-based, not version-string-based — a hotfix released after a major correctly outranks if dated later, matching release-mgmt norm).

  **Decision deviations from the literal spec** (each flagged in the proposal and confirmed before implementation):
  - **Add modal kept as Dialog** (spec was explicit "Dialog 640px scrollable") — first Add-shape modal of comparable size in the codebase since FX Update / Commission New / Blacklist Add are all full-page routes. Edit must be Dialog regardless. Responsive treatment uses one component for both breakpoints (no separate `<Sheet>` path) — `h-screen max-h-screen w-screen max-w-full rounded-none` on mobile (`<sm`), `sm:max-w-[640px] sm:max-h-[85vh] sm:rounded-lg` from `sm` up. Pinned header + footer w/ scrollable body in between via `flex flex-col` + body `overflow-y-auto`.
  - **Release-notes editing** unified: single locale tab strip + ONE textarea visible at a time on every breakpoint. Active locale switches via tab click OR Cmd/Ctrl+1/2/3 (visible ⌘N hint per tab). Spec's "three textareas" intent satisfied via 3 fields, not 3 simultaneously visible textareas — the unified single-textarea pattern naturally satisfies the "accordion on mobile" line. Edit / Preview top-level tabs control the panel mode — Edit shows the active-locale textarea, Preview renders all 3 locales as faux App Store / Play Store update cards via tiny zero-dep markdown transformer (`* / -` → `<ul>`, blank line → `<p>`).
  - **Markdown rendering** — `dashboard/src/components/app-versions/modals/markdown.ts` parses release-notes text into a flat `MarkdownNode[]` of `{kind: 'paragraph', lines}` or `{kind: 'list', items}` shapes. `<MarkdownView>` renders primitive React string nodes only — NO `dangerouslySetInnerHTML`, so untrusted release-notes copy can never inject HTML. Bold / italic / links deliberately unsupported in v1 (App Store / Play Store strip rich formatting from update notes anyway).
  - **Force-update warning placement** — inline danger-tinted banner directly under the Force-update toggle, body interpolates the entered min_supported (or "all earlier versions" when blank). Not a top-of-modal banner — placed near the source of risk.
  - **Edit reason note** — required, ≥ 20 chars (matches Users / Cards / Services convention). Lives as a card at the bottom of the Edit Dialog only; Add Dialog has no reason field (adding a version IS the action).
  - **Hotkey wiring** — `g+v` global chord routes to `/system/app-versions` (since `g+a` is taken by AML Triage). Page-scoped `n` opens Add modal. Inside Add / Edit dialog: Cmd/Ctrl+1/2/3 cycles locale tabs (also flips back to Edit panel if Preview was active), Cmd/Ctrl+Enter submits when valid. Hotkeys disable on form-input focus and when AlertDialog is open.
  - **Active version derivation** — date-based `MAX(released_at)` per platform, not version-string-based. Matches the spec's "Default sort: released_at DESC" line and the release-mgmt norm where a hotfix released after a major can correctly outrank if dated later.
  - **Delete affordance** — deliberately omitted. Spec doesn't mention delete; app versions are append-only by nature (users on old binaries need the row to keep resolving for force-update gating). Edit-only mutation surface.
  - **PlatformIcon assets** — initial draft used lucide `<Apple>` for iOS + a minimal head-only Android robot inline SVG. User provided 50×50 silhouette SVGs (Apple bitten silhouette + full Android robot with antennae + body + legs); swapped both at the same render contract (`fill="currentColor"` so the existing `tone="foreground"` / `tone="muted"` wiring continues to drive color across consumers).
  - **LocaleFlag asset source** — initial draft used hand-authored inline SVG (UZ tricolor + RU tricolor + simplified Union Jack). User provided 3 Wikimedia commons raster URLs (Uzbekistan / Russia / Flag of Great Britain 1707-1800 — the historical Union flag without St Patrick's saltire). Downloaded into `dashboard/src/assets/flags/` (uz.png 10 KB · ru.png 1 KB · gb.png 4 KB) and bundled via Vite's asset pipeline — `uz.png` emitted as a hashed file (over Vite's default 4 KB inline threshold), `ru.png` + `gb.png` inlined as base64 data URLs. Production `/zhi-pay/` base path resolves automatically through the import pipeline. `<img loading="lazy" decoding="async">` rendering at one of three sizes (`xs` for table preview chips, `sm` for dialog locale strip, `md` for preview card header).

  **Mock dataset** — `dashboard/src/data/mockAppVersions.ts`. Deterministic manual seed (no PRNG). 9 iOS + 9 Android `AppVersion` records:
  - **iOS**: 1.4.2 (5d ago · latest · min 1.2.0 · force=false) · 1.4.1 (3w ago) · 1.4.0 (6w ago · "Faster send-money flow + new rate-lock countdown + bug fixes for card linking on iOS 16/Android 12") · 1.3.5 (9w ago) · 1.3.4 (12w ago) · 1.3.3 (15w ago) · 1.3.2 (18w ago) · 1.3.1 (21w ago) · 1.3.0 (26w ago — major: WeChat Pay support, redesigned send-money flow) · 1.2.0 (34w ago · force=true · "Important security update").
  - **Android** mirrors with platform-realistic version cadence (slightly offset dates so the two tabs read distinctly): 1.4.2 (6d ago) … 1.2.0 (34w ago · force=true).
  - Notes are realistic per-locale equivalents: tier-2 quality copy with bullets where appropriate (1.4.0 lists 3 features), single-paragraph for minor patch versions, force-update version explains the security context.
  - Helpers: `listAppVersions(platform)` / `getAppVersionById` / `getLatestAppVersion(platform)` / `getCounts()` / `isValidSemver` / `compareSemver` / `findDuplicate(platform, version)`.
  - Mutators: `addAppVersion()` (validates semver + duplicate-blocks + min_supported ≤ version + all-3-locales-non-empty before insert; emits audit row with snapshot), `editAppVersion()` (locks platform + version, requires ≥ 20-char reason, captures per-field `previous_*` snapshot for changed fields).

  **Pattern layer** (`dashboard/src/components/app-versions/`):
  - `types.ts` — sort + locale + platform enums + label keys
  - `filterState.ts` — per-platform UI state cache (sort + expandedId) so tab switching preserves state across mounts
  - `PlatformIcon.tsx` — 50×50 silhouette SVGs (Apple + Android robot) w/ `currentColor` fill
  - `PlatformTabs.tsx` — 2-tab segmented control + Skeleton-then-active count badges (matches BlacklistTabs convention)
  - `ActiveVersionBanner.tsx` — filled brand-tinted card per platform + ActiveVersionBannerSkeleton
  - `ForceUpdatePill.tsx` — danger-tinted pill chip
  - `LocaleFlag.tsx` — Wikimedia raster flag chip at xs / sm / md sizes via Vite-bundled assets
  - `ReleaseNotesPreview.tsx` — 3 flag chips + 60-char en truncation for table cell
  - `VersionsTable.tsx` — sortable desktop table (released_at) w/ click-to-expand inline + non-sticky thead per LESSON 2026-04-30 + 6-row skeleton
  - `VersionsMobileCardStack.tsx` — `<lg` card stack mirror w/ same expand-inline pattern
  - `RowExpanded.tsx` — 3-locale grid (markdown rendered) + last-edited line
  - `MarkdownView.tsx` — primitive React string renderer (no `dangerouslySetInnerHTML`)
  - `EmptyState.tsx` — per-platform empty state w/ inline Add CTA
  - `modals/markdown.ts` — tiny zero-dep parser → `MarkdownNode[]`
  - `modals/ReleaseNotesEditor.tsx` — locale tab strip + autoresizing textarea + char counter + per-locale required validation + ⌘N hints
  - `modals/ReleaseNotesPreviewPane.tsx` — 3 stacked faux App Store / Play Store update cards w/ markdown-rendered body
  - `modals/AddVersionDialog.tsx` — responsive Dialog (full-screen `<sm`, 640 × 85vh `sm+`) w/ Edit / Preview tabs + AlertDialog 2-step confirm; first responsive Dialog pattern in the codebase
  - `modals/EditVersionDialog.tsx` — same shape, platform + version locked, + ≥ 20-char reason note card

  **Page** — `pages/AppVersions.tsx`. Single orchestrator, URL-driven tab via `?platform=ios|android` (default `ios`). 350ms initial-mount skeleton matches FX / Services cadence. `n` page-scoped hotkey opens Add modal. Toast feedback on add/edit success/failure. Auto-expands the freshly added row + flips the tab to the platform we just added to so the admin sees the result. Handlers strip `actor` from the dialog input and inject `CURRENT_USER_ADMIN` so the Dialog's `onConfirm` typing stays clean. Edit modal opens on row kebab "Edit" or banner "Edit" — one canonical Edit path. Row kebab "Open audit log entry" deep-links to `/compliance/audit-log?entity=app_version&id=<entryId>` (back-compat already works since `entity.type='app_version'` is already declared in `AuditEntityType`).

  **Routing** — `/system/app-versions`. **Second `/system/*` route in the codebase** (after Services). No `:id` route — Edit lives in a Dialog, not a separate page. Back-compat: `/app-versions` → `/system/app-versions` via `RedirectPreservingQuery` (preserves any future deep-link query params). Removed `/app-versions` from `PLACEHOLDER_ROUTES`. Sidebar entry repointed (`/app-versions` → `/system/app-versions`); TopBar `ROUTE_TITLES` repointed (`/app-versions` → `/system/app-versions`); CommandPalette gained a new "App Versions" entry under Navigate w/ ⌘V hint; `useKeyboardShortcuts` `g+v` chord wired (since `g+a` is AML Triage).

  **Audit-log bridge** — `mockAuditLog.ts` imported `listAppVersionsAudit` + `AppVersionAuditAction` + `AppVersionAuditEntry`; added `APP_VERSION_ACTION_MAP` (`add → created` / `edit → updated`) + `bridgeAppVersionAudit` (preserves granular verb in `context.kind`; snapshot of `{platform, version, force_update, min_supported, released_at}` always included; per-field `previous` populated only for changed fields on edits; `reason` populated only on edits); pushed `...listAppVersionsAudit().map(bridgeAppVersionAudit)` into the merge in `listAuditEvents()`. Audit log surface continues to read the existing `entity-type.app_version` i18n key (already declared since Phase 11 when the `AuditEntityType` enum was authored).

  **i18n** — ~60 new `admin.app-versions.*` keys (page header / tabs / locale labels / banner / table columns + cells / row-expanded / empty state / Add dialog (sections + fields + hint + force-update warning interpolation + tab labels + CTA + 4 validation messages) / ReleaseNotesEditor (locale strip aria + per-locale required + markdown hint + char count + per-locale placeholder copy in uz/ru/en) / ReleaseNotesPreviewPane (subtitle + What's-new + empty-locale fallback) / Confirm-publish AlertDialog (title + body + body-force + CTA + publishing) / Edit dialog (title + subtitle + CTA + saving + reason label + reason placeholder + reason counter + no-version fallback) / 6 toast variants).

  **Hotkeys** — list: `n` opens Add modal (page-scoped). Add / Edit dialog: Cmd/Ctrl+1/2/3 cycle locale tabs (also flip back to Edit panel if Preview was active), Cmd/Ctrl+Enter submits when valid. Global: `g+v` routes to `/system/app-versions` (new chord; `g+a` was already taken by AML Triage).

- **Files created**:
  - `dashboard/src/data/mockAppVersions.ts`
  - `dashboard/src/pages/AppVersions.tsx`
  - `dashboard/src/components/app-versions/{types,filterState,PlatformIcon,PlatformTabs,ActiveVersionBanner,ForceUpdatePill,LocaleFlag,ReleaseNotesPreview,VersionsTable,VersionsMobileCardStack,RowExpanded,MarkdownView,EmptyState}.tsx` (+ `types.ts`, `filterState.ts`)
  - `dashboard/src/components/app-versions/modals/{markdown.ts,ReleaseNotesEditor,ReleaseNotesPreviewPane,AddVersionDialog,EditVersionDialog}.tsx`
  - `dashboard/src/assets/flags/{uz,ru,gb}.png` (Wikimedia commons rasters bundled by Vite)

- **Files modified**:
  - `dashboard/src/router.tsx` — added `/system/app-versions` route; `RedirectPreservingQuery` back-compat from `/app-versions`; dropped `/app-versions` from `PLACEHOLDER_ROUTES`; new `<AppVersions>` import
  - `dashboard/src/components/layout/Sidebar.tsx` — System section's App Versions entry `to: '/app-versions'` → `'/system/app-versions'`
  - `dashboard/src/components/layout/TopBar.tsx` — `ROUTE_TITLES['/app-versions']` → `'/system/app-versions'`
  - `dashboard/src/components/layout/CommandPalette.tsx` — added "App Versions" Navigate entry w/ Smartphone icon + `g v` shortcut hint
  - `dashboard/src/hooks/useKeyboardShortcuts.ts` — `g+v` chord → `/system/app-versions`
  - `dashboard/src/data/mockAuditLog.ts` — imported `listAppVersionsAudit` + `AppVersionAuditAction` + `AppVersionAuditEntry`; added `APP_VERSION_ACTION_MAP` + `bridgeAppVersionAudit`; pushed `...listAppVersionsAudit().map(bridgeAppVersionAudit)` into the merge in `listAuditEvents()`
  - `dashboard/src/lib/i18n.ts` — ~60 new `admin.app-versions.*` keys

- **Docs updated**: `docs/product_states.md` (App Versions row flipped from ❌ Placeholder to ✅), `ai_context/AI_CONTEXT.md` (current-phase paragraph + 8 new decisions table rows + 1 workstreams entry + file tree), `ai_context/HISTORY.md`. **No** schema / PRD / mermaid change — `models.md` §8 already declares `app_versions` exactly as needed (id / platform / version / force_update / min_supported / release_notes_uz/ru/en / released_at); the mock-only `createdBy` / `lastEditedAt` / `lastEditedBy` fields are audit-trail surrogates that the real backend records in a separate audit-log table.

- **Verified**: `npx tsc --noEmit` (exit 0) · `npm run build` (exit 0; 3 flag assets bundled correctly — `uz.png` emitted as hashed file, `ru.png` + `gb.png` inlined as base64 data URLs under Vite's 4 KB threshold) · `npm run dev` boots cleanly to Vite ready state on :5175 · `/src/pages/AppVersions.tsx` serves with no transform errors. Lessons-compliance grep clean (no `sticky top` in new files, no `← ` text prefix anywhere, only allowed `text-xs uppercase tracking-wider` section-label usages in RowExpanded / VersionsMobileCardStack / ReleaseNotesPreviewPane). Browser eyeballing deferred — please spot-check tab switching keeps URL in sync, Add modal full-screen on `<sm` and 640 × 85vh on `sm+`, Cmd+1/2/3 cycles locale tabs, Cmd+Enter submits, force-update warning interpolates the entered min_supported, row-expand renders all three locales with markdown bullets, audit-log entries appear after Add/Edit at `/compliance/audit-log?entity=app_version`.

---

### 2026-05-03 — Admin Services & Health (Phase 14) — `/system/services` (+ `/:id`) · two-pane on lg+, full-page on mobile

- **Summary**: Built the Services & Health surface — operational rail dashboard with kill-switch confirmations. Two-pane on `lg+` (grid left + detail pane right that fills); grid-only on `<lg` with tile click navigating to `/system/services/:id` full page. **5 services** in mock (alipay · wechat · uzcard · humo · myid) — Visa / Mastercard absent per LESSON 2026-04-30 + spec ("not supported in v1"). **`mockServices.ts` is the single source of truth**: `ServiceFull` extends `docs/models.md` §8 with a mock-only **observability cache** (latency P50/P95/P99 24h · success 24h+7d · uptime 30d · inflight count · webhooks/hr · 24-pt success sparkline · 20-pip health-check strip · 10 webhook events · 5 latency-spike alerts) — these fields are normally surfaced from a metrics store / time-series DB / APM tool into the admin UI as denormalized read-models; modeled here so the page renders realistic data without a real backend. **Decision flagged at sign-off**: this is a mock-only observability cache, **not** a schema cascade — `services` table stays at the §8-declared 8 columns; if a future phase needs an `service_health_metrics` ER block for ops alerting thresholds, revisit then. Mutator surface: `setServiceStatus()` is the only writer for status; emits one audit-log row capturing `from_status` + `to_status` + reason + `inflight_at_change` + `acknowledge_impact?` (for disable transitions); bridged into `mockAuditLog` via `bridgeServiceAudit` (granular `activate` / `enter_maintenance` / `disable` verbs preserved in `context.kind`; spec's 12-value enum maps the three to `status_changed`, plus `run_health_check` → `updated`). `runHealthCheck()` appends a fresh pip without an audit row (it's a poke, not a state change).

  **Decision deviations from the literal spec** (each flagged in the proposal and confirmed before implementation):
  - **Mobile action-bar consistency** — initial mobile bar centered the StatusToggleGroup (auto-width) above two full-width buttons, leaving the toggle visibly narrower than the row below. User feedback: "the bottom segmentation in fix bar in mobile view should be consistent full width with below buttons". Resolved by adding a `fullWidth` prop to `<StatusToggleGroup>` (root switches `inline-flex` → `flex w-full`, each segment becomes `flex-1 justify-center`) and updating the mobile branch of `<ActionBar>` to render 2 stacked full-width rows: `<StatusToggleGroup fullWidth />` on top, `<div class="flex w-full gap-2">` w/ both buttons `flex-1` underneath. Desktop pane variant keeps content-sized inline-flex toggle.
  - **Layout shape** — landed after **3 passes**. Pass 1 (spec-as-written: always-two-pane with `lg:grid-cols-5` in the half-width left pane + EmptyDetailPane on right) — tiles ~120px wide, content crammed; user feedback "all elements in one row, fix it". Pass 2 (full-width `lg:grid-cols-5` when no detail, `[lg:w-[420px] grid-cols-2] + detail` when selected) — tiles got room but the layout shape changed on click which felt jarring; user feedback "change the layout like the cards are in a column and the service details in right when click the service it will show the all details in the right service details section". Pass 3 (final) — **single-column tile list + always-visible detail pane** on `lg+`: `[lg:w-[380px] grid-cols-1] + [lg:flex-1]`. Detail pane shows `EmptyDetailPane` until selection then swaps to the body. Layout shape doesn't change between states. Single-column tile density fits both desktop list-pane width and mobile viewport without changes. Mobile (`<lg`) renders the same single-column list at `/system/services` and the full-page detail at `/system/services/:id`. Page header + DetailHeader stack vertically on `<md` (`flex-col`) and side-by-side from `md+` (`md:flex-row md:flex-wrap`). LESSON 2026-05-03 ("Master-detail dashboards (Services-shape)…") captures the rule for future small-pinned-set surfaces.
  - **Action-bar position** — pane variant on `lg+` renders inline at the bottom of the right-pane Card (non-sticky). Earlier draft tried `sticky bottom-0` inside the Card body but it didn't compose with `overflow-hidden` cleanly and the sticky context was ambiguous; non-sticky bottom-row resolved it without losing the toggle ergonomics — the StatusToggleGroup also lives in the DetailHeader at the top of the pane so admins always have a reachable toggle. Mobile detail page uses the canonical `fixed inset-x-0 bottom-0 md:left-[var(--sidebar-width,4rem)] lg:hidden` overlay per LESSON 2026-05-02 with `pb-28` page-wrapper clearance.
  - **`useCopyFeedback` hook lift** — originally lived under `components/audit-log/`. Lifted to `dashboard/src/hooks/useCopyFeedback.ts` since this page is the second consumer (health-check URL copy in `HealthChecksCard`); the design-system-layers rule says Patterns may not import from other Patterns, so the right move was to lift to shared. Updated 3 audit-log file imports (`AuditTable` / `AuditMobileCardStack` / `AuditRowExpanded`) to `@/hooks/useCopyFeedback`. Behavior unchanged (1.5s in-place `Copy → Check` icon swap + success-tinted color flip, no toast).
  - **Sensitive config keys** — pure mask (`'••••••••'`) at the data layer, no reveal affordance. Per `core-principles.md` "no PII leakage" + the spec ("masked as •••••••• with no reveal affordance — pure server-side data"). Sensitive keys listed per service: `api_key` / `private_key` / `webhook_signing_secret` / `cert_serial_no` / `api_v3_key` / `shared_secret` / `jwt_signing_key`.
  - **Edit config affordance** — visible but `disabled` with a tooltip ("Editing service config is out of v1 scope. Update via deployment.") per spec.
  - **Auto-refresh** — 30s `setInterval` ticks the `version` counter so `formatRelative` last-checked timestamps refresh on tiles. Detail-pane stat values are intentionally frozen at-last-action time per spec ("Status changes do NOT auto-update the detail pane — admin sees the value they last set"). The "Stale view — refresh" indicator was scoped out of v1 — the mock has admin = source of truth so backend disagreement never occurs in this prototype.

  **Mock dataset** — `dashboard/src/data/mockServices.ts`. Deterministic manual seed (no PRNG). `NOW = 2026-04-29T10:30:00Z` matches every other store. 5 `ServiceFull` records with realistic state per spec:
  - alipay — `active`, P50 280ms / P95 540ms / P99 820ms, 99.7% 24h, last checked 12s ago, P1, healthy pip pattern
  - wechat — `maintenance`, "Scheduled maintenance window 14:00–16:00 UTC+5", last checked 4m ago, P1, pip strip shows the maintenance window's failed checks
  - uzcard — `active`, P50 340ms, 99.9%, P1, healthy
  - humo — `active`, P50 620ms (elevated), 97.6% (degraded — amber overlay dot), P2, pip strip shows scattered slow + 2 failed
  - myid — `active`, P50 1200ms, 98.9%, P1, healthy with high latency
  Each carries a 20-pip health-check strip, 24-pt success sparkline, 5–10 webhook events tied to its rail (alipay+wechat = transfer events; uzcard+humo = card.auth events; myid = kyc events), and 1–5 latency-spike alerts (humo carries 5 incl. one currently active; wechat carries an active alert tied to the maintenance window).

  **Pattern layer** (`dashboard/src/components/services/`):
  - `types.ts` — `healthOverlayTone(svc)` returns `'amber' | 'red' | null` based on the most recent 10 pips (≥3 failed = red · ≥1 failed or ≥3 slow = amber · otherwise null; only renders when service is `active`); `STATUS_TONES` tone-class table per status
  - `ServiceLogo.tsx` — 5 stylized SVG placeholders (alipay 支付宝 / wechat 微信 / UZCARD / HUMO / MyID; sm/md/lg sizes; real brand assets replace in-place)
  - `ServiceStatusBadge.tsx` — chip with icon (CheckCircle2 / Wrench / Ban) + tone palette
  - `HealthDot.tsx` — green/amber/red overlay dot rendered only when non-null
  - `SuccessRateSparkline.tsx` — recharts mini `<LineChart>` (24-pt, no axes, no tooltip, Y-axis locked to [0.94, 1] band so dips actually move the line; danger tint when <99%)
  - `ServiceTile.tsx` — grid tile w/ logo + relative-positioned overlay dot + name + status badge + last-checked + P50 latency + 24h success rate + sparkline + P1/P2 chip; selected = `ring-2 ring-brand-600 bg-brand-50/60`; hover-lift via `hover:-translate-y-0.5 hover:shadow-md`; click navigates to `/system/services/:id`
  - `ServicesGrid.tsx` — density-aware grid wrapper (`expanded` `lg:grid-cols-5` full-width; `compact` `xl:grid-cols-2` when detail open) + 5-tile skeleton
  - `EmptyDetailPane.tsx` — right-pane empty state on `lg+`
  - `StatusToggleGroup.tsx` — 3-segment toggle. Clicking a non-active segment fires `onPick(next)` so the page opens the AlertDialog confirm; clicking the active segment is a no-op
  - `DetailHeader.tsx` — logo + name + status badge + StatusToggleGroup; mobile-only back-link `<ArrowLeft> Back to services` per LESSONS 2026-05-02
  - `QuickStatsCard.tsx` — 3 grouped rows (P50/P95/P99 latency + 24h+7d success rate + 30d uptime / inflight / webhooks/hr); offline (maintenance / disabled) renders `—` for inflight latency / success rate
  - `HealthChecksCard.tsx` — `health_check_url` mono w/ in-place `useCopyFeedback` (Copy → Check 1.5s) · 20-pip strip with hover tooltip showing relative time + ms + status · "Run health check now" CTA · 3-tone legend
  - `ConfigCard.tsx` — collapsible default-closed jsonb viewer w/ sensitive keys masked + Lock icon + no reveal affordance + privacy note · "Edit config" link disabled w/ tooltip "out of v1 scope"
  - `RecentActivityCard.tsx` — webhook events list (links to `/compliance/audit-log?entity=service&id=...`) + alert rows w/ resolved/active distinction
  - `ActionBar.tsx` — `variant='pane'` (`hidden lg:flex border-t border-border bg-card px-6 py-3`) for the desktop right-pane bottom · `variant='mobile'` (`fixed inset-x-0 bottom-0 md:left-[var(--sidebar-width,4rem)] lg:hidden`) for the mobile full-page detail
  - `modals/StatusChangeDialog.tsx` — single component, 3 modes via per-target config (titleKey / bodyKey / confirmKey / minReason / destructive / requiresAcknowledge). Body for `disabled` interpolates `{inflight}` from the live service. Reason counter flips to warning tone below threshold. Acknowledge checkbox lives in a danger-tinted card w/ Checkbox primitive. Reset state on every open.

  **Page** — `pages/Services.tsx`. Single orchestrator handling both routes. URL drives selection. 350ms initial-mount skeleton. 30s `setInterval` ticks the `version` counter so `formatRelative` timestamps refresh. `handleConfirm` calls `setServiceStatus`; toast confirms with localized status name. `handleRunCheck` calls `runHealthCheck` and toasts the resulting status (success → ok ms · warning → slow ms · error → failed). Page-scoped hotkeys: `1` / `2` / `3` open Active / Maintenance / Disabled confirm (each gated when current = target so no-op clicks don't open the dialog); `r` runs a fresh health check; `Esc` / `Backspace` / `b` close the detail (route to `/system/services`). Hotkeys disable on form-input focus and when the AlertDialog is open. Mobile detail wrapper carries `pb-28` to clear the fixed bottom action bar.

  **Routing** — `/system/services` + `/system/services/:id`. **First `/system/*` route in the codebase**. Back-compat: `/services` → `/system/services` and `/services/:id` → `/system/services` (plain `<Navigate>` since the `:id` redirect routes to the listing, not the specific service — pre-existing usages were Overview's `/services?service=...` query-param style, which is now updated upstream to navigate directly to `/system/services/svc_<name>`). Removed `/services` from `PLACEHOLDER_ROUTES`. Sidebar entry repointed (`/services` → `/system/services`); `TopBar.ROUTE_TITLES` repointed; new TopBar breadcrumb match for `/system/services/:id` → System › Services & Health › `<id-without-prefix>`; CommandPalette `g+s` action repointed; `useKeyboardShortcuts` `g+s` chord repointed.

  **i18n** — ~65 new `admin.services.*` keys (page header / refresh actions / status enum / status-toggle aria-label / 5 service display names / tile labels + ICU `aria-label` / empty-pane / detail back-link / 4 detail card titles + 8 stat sub-labels / health-check legend tones + status tones / config card title + summary + privacy note + edit-disabled tooltip / recent-activity webhooks + alerts + 3 webhook-status chip labels + ICU `alert-line` w/ ms + duration / 3 confirm dialogs each with title + body + CTA + reason placeholder + counter + acknowledge / submitting state / 5 toast variants / not-found page).

  **Hotkeys** — list: Tab navigates between tiles (native focus order from button elements), Enter opens detail. Detail: `1` / `2` / `3` open Active / Maintenance / Disabled confirm (gated when current = target); `r` run health check; `Esc` / `Backspace` / `b` close detail. Global: `g+s` routes to `/system/services` (already wired; just repointed from `/services`).

- **Files created**:
  - `dashboard/src/data/mockServices.ts`
  - `dashboard/src/pages/Services.tsx`
  - `dashboard/src/components/services/{types}.ts`
  - `dashboard/src/components/services/{ServiceLogo,ServiceStatusBadge,HealthDot,SuccessRateSparkline,ServiceTile,ServicesGrid,EmptyDetailPane,StatusToggleGroup,DetailHeader,QuickStatsCard,HealthChecksCard,ConfigCard,RecentActivityCard,ActionBar}.tsx`
  - `dashboard/src/components/services/modals/StatusChangeDialog.tsx`
  - `dashboard/src/hooks/useCopyFeedback.ts`  (lifted from `components/audit-log/`)

- **Files modified**:
  - `dashboard/src/router.tsx` — added `/system/services` + `/:id` routes; `/services` and `/services/:id` redirects; dropped `/services` from `PLACEHOLDER_ROUTES`; new `<Services>` import
  - `dashboard/src/components/layout/Sidebar.tsx` — System section's Services entry `to: '/services'` → `'/system/services'`
  - `dashboard/src/components/layout/TopBar.tsx` — `ROUTE_TITLES['/services']` → `'/system/services'`; new breadcrumb match for `/system/services/:id`
  - `dashboard/src/components/layout/CommandPalette.tsx` — `g+s` → `/system/services`
  - `dashboard/src/hooks/useKeyboardShortcuts.ts` — `g+s` chord → `/system/services`
  - `dashboard/src/pages/Overview.tsx` — `ServicesHealthCard.onSelect` → `/system/services/svc_<name>` (was `/services?service=<name>`)
  - `dashboard/src/data/mockAuditLog.ts` — imported `listServicesAudit` + `ServiceAuditAction` + `ServiceAuditEntry`; added `SERVICE_ACTION_MAP` + `bridgeServiceAudit`; pushed `...listServicesAudit().map(bridgeServiceAudit)` into the merge in `listAuditEvents()`
  - `dashboard/src/lib/i18n.ts` — ~65 new `admin.services.*` keys
  - `dashboard/src/components/audit-log/{AuditTable,AuditMobileCardStack,AuditRowExpanded}.tsx` — `useCopyFeedback` import path `./useCopyFeedback` → `@/hooks/useCopyFeedback` (3 files)

- **Files deleted**:
  - `dashboard/src/components/audit-log/useCopyFeedback.ts`  (moved to `dashboard/src/hooks/useCopyFeedback.ts`)

- **Docs updated**: `docs/product_states.md` (Services row flipped from ❌ Placeholder to ✅), `ai_context/AI_CONTEXT.md` (current phase paragraph + 5 new decisions table rows + 1 workstreams entry + file tree), `ai_context/HISTORY.md`. **No** schema / PRD / mermaid change — `models.md` §8 stays accurate (the 8 declared columns are what the row actually has; the observability fields are denormalized cache surfaced from elsewhere, flagged as a decision in AI_CONTEXT).

- **Verified**: `npx tsc --noEmit` (exit 0) · `npm run build` (exit 0) · `npm run dev` boots cleanly to Vite ready state. Browser eyeballing deferred — the visual rhythm of the 5-tile grid + detail-pane layout (especially when toggling between no-detail and detail-open density) and the maintenance-window pip strip should still be checked before sign-off.

---

### 2026-05-03 — Admin KYC Tiers reference (Phase 13) — `/compliance/kyc-tiers` · read-only by design

- **Summary**: Built a **read-only** reference page for the three KYC tier definitions at `/compliance/kyc-tiers`. The original spec asked for a full edit-creates-new-version surface (per-tier edit modal, diff preview, version history table, `kyc_tier_versions` schema cascade). Pushed back during planning: tier limits in a regulated remittance corridor are governed by the Central Bank of Uzbekistan + Compliance memos — they're not click-an-admin-button edits. Putting an "Edit tier" affordance behind a 50-char reason note implies a level of agency we don't actually have, and the blast radius (every user, every transfer) is exactly the kind of change that should require a code-review + migration + formal sign-off, not an admin UI. Proposed three options (read-only / full-edit / hybrid); user picked read-only.

  **Resulting page** — three tier cards on top (`lg:grid-cols-3` desktop, single column mobile) + LiveImpactCard below. **Tier_2 card** carries the full stats grid (per-transaction · daily · monthly limits as `<Money currency="UZS">` + max linked cards integer) + a green "MyID required" chip in the top-right corner. **Tier_0 + tier_1 cards** carry no stats grid and no MyID chip — only a warning-toned gate note that says what's blocked at that tier. The user's two correctional rounds drove that shape:
  - Round 1 — "if not myid identified no one can make transactions" → added a generic `myid-gate` note on tier_0 / tier_1 cards.
  - Round 2 — "the limits no exists in tier 0 and 1 no operations can provided in these tiers" → removed the limits grid + MyID chip from tier_0 / tier_1 entirely; replaced the generic gate copy with **per-tier specific** copy: tier_0 = "Cannot access the app. Phone OTP verification is required before sign-in." · tier_1 = "View-only access — services and FX rates visible. No card linking, no recipients, no transfers until MyID verification."
  - Banner removal — initial draft had a non-dismissible warning banner at the top reading "Placeholder values pending Compliance sign-off · governed by Compliance and the regulator". User asked to drop it ("remove warning placeholder block"). The page is now header → 3 tier cards → LiveImpactCard.

  This re-framing matches the existing AI_CONTEXT decision "MyID is the hard gate for transfers" + the `_TIER_LIMITS_TIYINS` block in `mockUsers.ts` that already shows tier_0 + tier_1 = `0n / 0n` daily / monthly. The placeholder values from `kyc-tiers-and-limits.md` (tier_1 = 5M / 5M / 20M / 2 cards) are the **regulatory aspiration / future state** — they live on disk in the rule file as canonical reference, but the dashboard now reflects **live operational reality**: tier_2 is the only tier where operations happen. No divergence to flag — both views co-exist (rule file = future state, dashboard = current state).

  **LiveImpactCard** — derived from existing mocks. Title row carries `Total users` label + count on the right. 3-cell tier-count grid (count + % share). Meta strip below the divider with "Active transfers right now" count + "Avg per-tx amount" via `<Money>`. When no transfers in flight, drops the avg-amount cell and shows "No transfers in flight." italic.

  **Data layer** — `mockKycTiers.ts` is a **constants-only** module. Just 3 `TierConfig` records, the canonical regulatory values from `.claude/rules/kyc-tiers-and-limits.md` (tier_0 zeros, tier_1 5M / 5M / 20M / 2 cards / no MyID, tier_2 50M / 50M / 200M / 5 cards / MyID required). Helpers: `listKycTiers / getKycTier / getUserCountsByTier / getActiveTransferStats`. The last two derive from `listUsers()` and `TRANSFERS_FULL` so the page stays consistent with every other surface that reads from those stores. **No mutator, no audit-log store, no version history, no schema cascade** — the read-only shape is enforced by the data layer's API surface.

  **Pages** — `pages/KycTiers.tsx` orchestrates the page with a 350ms initial-mount skeleton (matches the FX Config / Commission Rules cadence). No back-compat redirect needed for `/kyc-tiers/:id` (no detail page exists).

  **Routing** — `/compliance/kyc-tiers`. Back-compat: `/kyc-tiers` → `/compliance/kyc-tiers` via plain `<Navigate>`. Removed `/kyc-tiers` from `PLACEHOLDER_ROUTES`. Sidebar entry repointed.

  **i18n** — 19 new `admin.kyc-tiers.*` keys (title / subtitle · 4 stat labels · MyID-required chip · 3 tier names + 3 tier descriptions + 2 tier-specific gate notes · LiveImpactCard title + subtitle + total-users + active-transfers + avg-amount + no-active fallback).

  **Hotkeys** — none page-scoped (read-only surface, no actions to wire). Existing `g+t` global hotkey would land here once added; not implemented this phase.

- **Files created**:
  - `dashboard/src/data/mockKycTiers.ts`
  - `dashboard/src/pages/KycTiers.tsx`
  - `dashboard/src/components/kyc-tiers/TierCard.tsx`
  - `dashboard/src/components/kyc-tiers/LiveImpactCard.tsx`

- **Files modified**:
  - `dashboard/src/router.tsx` — added `<KycTiers>` import + `/compliance/kyc-tiers` route + `/kyc-tiers` flat redirect; dropped `/kyc-tiers` from `PLACEHOLDER_ROUTES`
  - `dashboard/src/components/layout/Sidebar.tsx` — Compliance section's KYC Tiers nav `to` updated `/kyc-tiers` → `/compliance/kyc-tiers`
  - `dashboard/src/lib/i18n.ts` — 19 new `admin.kyc-tiers.*` keys

- **Docs updated**: `docs/product_states.md` (KYC Tiers row flipped from `❌ Placeholder` to `✅ Read-only reference`), `ai_context/AI_CONTEXT.md`, `ai_context/HISTORY.md`. **No** schema / PRD / mermaid change — `models.md` §2.2 was already accurate (the canonical regulatory placeholder values match what we render on tier_2; the operational gating we surfaced was already captured by AI_CONTEXT's "MyID is the hard gate for transfers" decision).

- **Decision deviations from the literal spec** (each flagged in the proposal and confirmed before implementation):
  - **Edit affordance** → dropped entirely. Per-tier "Edit →" button, edit modal/full-page form, diff preview, ImpactPreviewCard, SaveTierConfirmDialog, version history table + filter, useCopyFeedback lift, `kyc_tier_versions` schema cascade — none of it built. The user picked option A (read-only) over option B (full-spec) and option C (hybrid) during planning.
  - **Stats grid on tier_0 / tier_1** → not rendered. Round-2 user feedback was that limits don't exist on those tiers because no operations happen there.
  - **MyID chip on tier_0 / tier_1** → not rendered. The gate note carries the operational message; a "No MyID" chip alongside "MyID required for operations" copy was contradictory.
  - **Placeholder banner** → not rendered. Initial draft had a non-dismissible warning banner at the top; user asked to drop it.
  - **Schema cascade** (`kyc_tier_versions`) → not authored. Read-only surface = nothing to version.

- **Verified**: `npx tsc --noEmit` (exit 0) · `npm run build` (exit 0). Browser verification deferred — the visual rhythm of the tier-card grid + LiveImpactCard against the page bg should still be eyeballed before sign-off.

---

### 2026-05-03 — Blacklist polish — segmented-control pill restored · "Add entry" CTA tone correction

- **Summary**: Two same-day fixes to the freshly-shipped Blacklist surface, both driven by user feedback on the prototype.
  1. **BlacklistTabs segmented-control pill restored.** Initial draft passed `flex flex-wrap items-center gap-1 overflow-x-auto` to `<TabsList>`, which clobbered the shadcn primitive's default `inline-flex h-9 bg-muted p-1 rounded-md` and made the segment block stretch full-width and wrap to a second line on narrow viewports. User feedback: "segment block is wrong". Fixed by wrapping the TabsList in a `<div className="-mx-1 overflow-x-auto pb-1 md:mx-0 md:overflow-visible md:pb-0">` so mobile horizontal scroll lives on the outer wrapper while the inner TabsList keeps its native `inline-flex` pill shape. Triggers gained `gap-1.5 data-[state=active]:[&_[data-tab-count]]:bg-foreground/10` so the count badge lifts contrast when its tab is active (`bg-background/80` inactive → `bg-foreground/10` active inside the white-bg active trigger). Count chip is now `min-w-5 h-5 rounded-full text-xs font-medium tabular`.
  2. **Page-header "Add entry" button toned down.** Spec said "destructive variant"; the user pushed back ("is that add entry should be a red bg ?") — and they were right. The page-header CTA is constructive (it just navigates to the Add form); the actual destructive moments are the form's "Add to blacklist" submit, the AlertDialog confirm, and the detail "Remove" button. Flattening all four to red collapses the visual hierarchy — Remove no longer reads as the most dangerous. Switched to `variant="default"` (primary brand) on the page-header CTA only; form submit + AlertDialog confirm + detail Remove stay destructive red.

- **Files modified**:
  - `dashboard/src/components/blacklist/BlacklistTabs.tsx` — outer `<div>` wrapper for mobile horizontal scroll · TabsList kept at default pill shape (only `h-auto` to fit the count badge) · count badge active-state contrast via `data-tab-count` selector · `text-xs font-medium tabular`
  - `dashboard/src/pages/Blacklist.tsx` — page-header `<Button variant="destructive">` → default (brand)
  - `ai_context/AI_CONTEXT.md` — Blacklist paragraph + workstreams entry both updated to reflect the corrected button tone and the segmented-control fix
  - `ai_context/HISTORY.md` — this entry

- **Docs updated**: `ai_context/AI_CONTEXT.md`, `ai_context/HISTORY.md`. **No** schema / PRD / mermaid / product-states change — both fixes are presentation-layer.

- **Verified**: `npx tsc --noEmit` (exit 0). Build not re-run for this presentation-only diff.

---

### 2026-05-03 — Admin Blacklist surface (Phase 12) — `/compliance/blacklist` + `/new` + `/:id`

- **Summary**: Built the Blacklist surface — five-type unified entry shape (`phone` / `pinfl` / `device_id` / `ip` / `card_token`), versionless rows with append-only audit history. List page at `/compliance/blacklist` with a 5-tab segmented control (Tabs primitive) over a single mock pool, full-page Add form at `/new` with a live pre-add check panel + duplicate detection, and full-page detail at `/:id` with three persistent actions (Edit reason / Extend expiry / Remove) on the canonical fixed-bottom action bar. **`mockBlacklist.ts` is the single source of truth** — 45 deterministic seed rows (8 phone · 4 pinfl · 12 device · 15 ip · 6 card-token, severity mix per spec) — and exposes `addBlacklistEntry` / `editBlacklistReason` / `extendBlacklistExpiry` / `removeBlacklistEntry` mutators that all emit a single granular audit-log row with snapshot fields. The page imports zero "edit-the-row" mutators outside those four; the row never silently rewrites except via `editBlacklistReason()` (which preserves the previous text in the audit-log entry's `context.previous_reason`).

  **Decision deviations from the literal spec** (each flagged in the proposal and confirmed before implementation):
  - **Detail mobile "sticky bottom action bar"** → applied LESSON 2026-05-02 canonical overlay (`fixed inset-x-0 bottom-0 md:left-[var(--sidebar-width,4rem)]`) on **mobile and desktop** — one bar pattern at every breakpoint.
  - **"Currently affecting" derivation** — phone / pinfl / card_token cross-store via `mockUsers` / `mockCards`; **device_id / ip seed `affectedCount` per row** since no canonical session/device store exists yet in the prototype. Real backend will derive from sessions / device-trust tables.
  - **"Has prevented N login attempts in the last 30 days"** — gated "if available" in spec — surfaced as an optional `loginAttemptsBlocked30d` per seed row. Synthetic; the impact card hides the line when undefined.
  - **Pre-add check coverage** — phone / pinfl / card_token match the existing mock stores; device_id / ip render a calm "No live device / session match — evaluated at request time" panel rather than fabricating a match.
  - **Routing migration** — first existing-flat-route migration to `/compliance/*`. `/blacklist` redirects to `/compliance/blacklist`; `/blacklist/new` uses a `RedirectPreservingQuery` wrapper that preserves `?type=&identifier=` query params so the existing Users-detail "Add phone to blacklist" deep-link keeps resolving. Removed `/blacklist` from `PLACEHOLDER_ROUTES`.
  - **Visa / Mastercard rails** — N/A. Card-token entries are plain card-id strings; no scheme dimension surfaces on this page.
  - **Sticky table thead** — non-sticky per LESSON 2026-04-30 (the spec's "Default sort: created_at DESC" is honored; sticky header is not).
  - **Filter bar stickiness** — `lg:sticky lg:top-0 lg:z-20` kept (matches Transfers / KYC / AML; Audit Log opted out at user request).

  **Schema update** — `docs/models.md` §2.5 — added a `severity` enum (`suspected` | `confirmed`) to the `BLACKLIST` ER block and authored a full field-reference table (id / identifier / type / severity / reason / added_by / expires_at / created_at) with constraint notes and the active-vs-expired derivation rule. KYC state-machine section renumbered §2.5 → §2.6; updated cross-references in `docs/product_requirements_document.md` §13 and `docs/mermaid_schemas/kyc_state_machine.md`.

  **Mock dataset (45 rows · 7+ day spread)** — `dashboard/src/data/mockBlacklist.ts`. Deterministic manual seed (no PRNG). NOW = 2026-04-29T10:30:00Z (matches every other store). Distribution per spec: 8 phone (5 confirmed + 3 suspected — 2 of the confirmed phones intentionally match `mockUsers` `u_07` / `u_18` already-blocked accounts so the "currently affecting" count derives non-zero; the remaining 6 phones are out-of-pool); 4 pinfl (all confirmed; one matches `u_07`); 12 device (mix of confirmed bot/emulator/jailbreak patterns + a few suspected watch-blocks); 15 ip (3 with expiry — DDoS bursts; 12 indefinite — Tor exits, abusive ASNs, scraping bots, OTP-bombing sources, IPv6 source); 6 card token (5 confirmed fraud — one matches `c_ol_02` so the affected-card link works; 1 suspected). Each row carries `id` (`bl_NNNN`), `type`, `identifier`, `severity`, ≥30-char `reason` (chargeback case numbers, sanctions screening, AML escalations, IOC bundles), `addedBy` (alternates between `admin_super_01 = Yulduz Otaboeva` and `admin_finance_02 = Adel Ortiqova` to match the existing `ADMIN_PROFILES` pool from `mockAuditLog`), `expiresAt` (3 IP entries with future expiry; some device/phone entries with watch-window expiry; everything else null), `createdAt`. `affectedCount` (device/ip only) and `loginAttemptsBlocked30d` are denormalized seed-only embellishments.

  **Pattern layer** (`dashboard/src/components/blacklist/`):
  - `types.ts` — filter shape (`search` / `status` / `addedBy[]` / `createdRange`) + `applyFilters` + `applySort` (createdAt / expiresAt) + `countActiveBlacklistFilters` + `maskIdentifier(type, raw)` (per-type masking — phone full / pinfl `••••••••••<last4>` / device `••••••<last6>` / ip full / card_token `••••<last8>`). `createdRange` typed as `DateRangeValue | null` so the canonical `<DateRangePicker>` primitive plugs in cleanly; `null` = no filter.
  - `filterState.ts` — module-level cache keyed per `BlacklistType` so each tab keeps its own filter / sort / focus / visible-id list across switches.
  - `IdentityCell.tsx` / `ExpiryCell.tsx` / `AddedByCell.tsx` — type-aware cell helpers. `ExpiryCell` flips between "Never" / "In N days" countdown / warning-tinted "<3 days" countdown / danger-tinted "Expired" depending on `expiresAt`.
  - `SeverityChip.tsx` (suspected = warning + ShieldQuestion icon · confirmed = danger + ShieldAlert icon) and `StatusChip.tsx` (active = success · expired = slate · expiring-soon when <72h = warning + Clock icon).
  - `BlacklistTabs.tsx` — TabsList wrapper with count badges that show a Skeleton during initial load.
  - `BlacklistFilterBar.tsx` — sticky-on-`lg+` bar (canonical full-width search input on top, chip row beneath: status single-chip · added-by multi-chip · created date-range chip wrapping `<DateRangePicker>` with an inline X-clear button glued to the chip's right edge so the user can opt out of the range without opening the popover). Inline X clear on the search input matches Users / Cards / Recipients / Audit Log.
  - `BlacklistTable.tsx` — non-sticky thead (LESSON 2026-04-30) · 7 columns (Identifier / Reason 80-char-truncated / Added by avatar+name / Created sortable / Expires sortable / Currently affecting right-aligned tabular / kebab) · row click → detail · kebab actions (Open entry / Remove) · 8-row Skeleton variant during initial load · empty-state copy "No entries of this type. Add one to start blocking."
  - `BlacklistMobileCardStack.tsx` — `<lg` mirror with each card carrying identifier / severity + status chip pair / 80-char reason / created + expiry meta line, full-card tap target, ChevronRight affordance.
  - Detail-page cards: `EntryCard.tsx` (7-row dt/dd grid with type / identifier / severity / reason / added-by / created / expires) + `ImpactCard.tsx` (large affected-count tile + optional 30-day blocked-attempts line + linked-entity card with deep-link to `/customers/users/:id` or `/customers/cards/:id`).
  - `ActionBar.tsx` — canonical fixed-bottom overlay; mobile = 2-row grid (Edit + Extend share row 1, Remove on row 2 spanning); desktop = single flex row with destructive Remove on the right.
  - `PreAddCheckPanel.tsx` — 4 states (idle / duplicate-blocking-error / user-or-card-warning-match / no-store calm note / no-match success). Used as the right-pane companion in the Add form.
  - Modals (`modals/`): `EditReasonDialog` (small Dialog: new reason ≥30 chars + change-note ≥20 chars), `ExtendExpiryDialog` (small Dialog: single `<DateTimeInput>` with `allowEmpty`), `RemoveEntryDialog` (AlertDialog: ≥30-char reason note before hard-delete confirm), `ConfirmAddDialog` (AlertDialog: 2nd-step confirm before insert from the Add page).

  **Pages** — `Blacklist.tsx` orchestrates tabs / filters / sort / focus / version-bump on `focus` / `popstate` for cross-page-mutation refresh + 5 page-scoped hotkeys (n / j / k / Enter / `/`); `BlacklistNew.tsx` renders a 2-pane form (form left 60% / sticky pre-add check panel right 40% on `lg+`; mobile stacks the panel below the identifier field) with per-type identifier validation, ≥30-char reason note, severity radio (custom-styled radio cards instead of bare radios for clarity), `<DateTimeInput>` for the optional expiry, and Cmd/Ctrl+Enter submit; `BlacklistDetail.tsx` renders the inline back-link / type chip + identifier / severity + status header, 2-card body (EntryCard + ImpactCard), the canonical fixed-bottom action bar, and the three modals — plus 3 page-scoped hotkeys (b / Backspace = back, Del = remove confirm).

  **Routing** — `/compliance/blacklist` + `/new` + `/:id`. Back-compat redirects: `/blacklist` → `/compliance/blacklist` (plain `<Navigate>`); `/blacklist/new` → `/compliance/blacklist/new` (custom `RedirectPreservingQuery` wrapper that captures `useLocation().search` and threads it through, preserving the existing `?type=phone&identifier=...` deep-link from User Detail). Removed `/blacklist` from `PLACEHOLDER_ROUTES`. Sidebar entry repointed; `g+b` global hotkey now lands on `/compliance/blacklist`.

  **i18n** — ~115 new `admin.blacklist.*` keys (covers tabs / type labels / severity / status / filter labels + per-type search placeholders / column headers / row actions / expiry copy / empty state / Add page labels + section headings + per-type placeholders + 6 validation messages + ICU placeholders for user-match warning + duplicate / pre-add check 5 states / detail labels + cards + 4 noun forms for impact / 3 action labels / 3 modal copy bundles / 4 toast bundles).

  **Hotkeys** — list-page: `n` (Add) · `j` / `k` (focus row) · `Enter` (open detail) · `/` (focus search). New-version page: Cmd/Ctrl+Enter (submit when valid). Detail page: `b` / `Backspace` (back) · `Del` (remove confirm). Global: `g+b` (route here).

- **Files created**:
  - `dashboard/src/data/mockBlacklist.ts`
  - `dashboard/src/pages/{Blacklist,BlacklistNew,BlacklistDetail}.tsx`
  - `dashboard/src/components/blacklist/{types,filterState}.ts`
  - `dashboard/src/components/blacklist/{IdentityCell,ExpiryCell,AddedByCell,SeverityChip,StatusChip,BlacklistTabs,BlacklistFilterBar,BlacklistTable,BlacklistMobileCardStack,EntryCard,ImpactCard,ActionBar,PreAddCheckPanel}.tsx`
  - `dashboard/src/components/blacklist/modals/{EditReasonDialog,ExtendExpiryDialog,RemoveEntryDialog,ConfirmAddDialog}.tsx`

- **Files modified**:
  - `dashboard/src/types/index.ts` — `BlacklistType` + `BlacklistSeverity` exports
  - `dashboard/src/data/mockAuditLog.ts` — `bridgeBlacklistAudit` + `BLACKLIST_ACTION_MAP` + `listBlacklistAudit` import; merged into `listAuditEvents()`
  - `dashboard/src/router.tsx` — `<Blacklist>` / `<BlacklistNew>` / `<BlacklistDetail>` imports + 3 `/compliance/blacklist*` routes + 2 redirects from flat paths + `RedirectPreservingQuery` helper + dropped `/blacklist` from `PLACEHOLDER_ROUTES`
  - `dashboard/src/components/layout/Sidebar.tsx` — Blacklist nav `to` updated to `/compliance/blacklist`
  - `dashboard/src/components/layout/TopBar.tsx` — breadcrumb `ROUTE_TITLES` key migrated `/blacklist` → `/compliance/blacklist`
  - `dashboard/src/hooks/useKeyboardShortcuts.ts` — `g+b` routes to `/compliance/blacklist`
  - `dashboard/src/components/layout/HelpOverlay.tsx` — `g+b` Navigation entry + 3 new hotkey groups (Blacklist · New blacklist entry · Blacklist detail)
  - `dashboard/src/pages/UserDetail.tsx` — `blacklist_phone` admin action navigates to `/compliance/blacklist/new?…` (was `/blacklist/new?…`)
  - `dashboard/src/pages/Users.tsx` — page-header "Add to blacklist" navigates to `/compliance/blacklist/new?type=phone`
  - `dashboard/src/lib/i18n.ts` — ~115 new `admin.blacklist.*` keys
  - `docs/models.md` — `BLACKLIST` ER block adds `severity` enum; new §2.5 field-reference table for `blacklist`; KYC state-machine section renumbered §2.5 → §2.6
  - `docs/product_requirements_document.md` — §13 cross-ref updated `models.md §2.5` → `§2.6`
  - `docs/mermaid_schemas/kyc_state_machine.md` — back-link updated `models.md §2.5` → `§2.6`
  - `docs/product_states.md` — Blacklist row flipped from ❌ Placeholder to ✅ Done; route updated `/blacklist` → `/compliance/blacklist` (+ `/new` + `/:id`); last-updated bumped
  - `ai_context/AI_CONTEXT.md` — current-phase rewrite (12 surfaces); Phase 12 entry; placeholder count 8 → 7; routes-decision row updated; 4 new "Decisions made" rows (Blacklist immutability + audit contract, Blacklist routing migration, Pre-add check coverage, Currently-affecting derivation strategy); file-map extended with `blacklist/` tree + `mockBlacklist.ts` + `pages/Blacklist*.tsx`; workstreams flipped Blacklist to ☑
  - `ai_context/HISTORY.md` — this entry

- **Docs updated**: `docs/models.md`, `docs/product_requirements_document.md`, `docs/mermaid_schemas/kyc_state_machine.md`, `docs/product_states.md`, `ai_context/AI_CONTEXT.md`, `ai_context/HISTORY.md`. Schema gained a `severity` field for `blacklist`; `is_active` is derived from `expires_at` per the field-reference note (no separate column).

- **Open items**:
  - **`severity` enum default** — set to `suspected` in mock; backend may want `confirmed` as a stricter default for system-emitted entries. Decision pending.
  - **Cross-store derivation for device_id / ip** — once a canonical sessions / device-trust store exists, replace the seeded `affectedCount` with a live derivation (same pattern as `mockUsers.lifetimeUzs` → derived from `TRANSFERS_FULL`).
  - **`loginAttemptsBlocked30d`** — synthetic in mock. Real backend will compute from auth logs (likely a separate metrics table — out of scope for this surface).
  - **Audit-log surface integration** — bridged via `bridgeBlacklistAudit` so Blacklist actions appear on `/compliance/audit-log` with `entity.type='blacklist'` and `context.kind=<granular verb>`. Remove-entry rows preserve the original snapshot in `context.snapshot.{type,identifier,severity}` so the audit row is meaningful even after the live row is gone.
  - **Visa / Mastercard relevance** — N/A. Re-introduction of V/MC will not affect this surface; card_token entries treat all schemes uniformly.

- **Verified**: `npx tsc --noEmit` (exit 0) · `npx vite build` (exit 0, ~1.76 MB minified / ~442 KB gzip).

---

### 2026-05-03 — Audit Log polish — search-row layout · in-place copy feedback · non-sticky filter bar · DateRangePicker mobile + chip-label cleanup

- **Summary**: Five same-day adjustments to the freshly-shipped Audit Log surface plus a mobile fix on the shared `<DateRangePicker>` primitive. All driven by user feedback on the prototype.
  1. **Entity-ref search bar lifted to its own canonical full-width row** above the chip row in `AuditFilterBar.tsx`. Earlier draft had it as a `ml-auto md:w-72` element pinned to the right of the chip strip — visually cramped and out-of-step with the Users / Cards / Recipients convention. Now `h-10 bg-background shadow-sm` matching the other surfaces, with the lucide `Search` icon left and an inline X clear-button (8px right-padded ghost button) when the input is filled. New i18n key `admin.audit-log.filter.clear-search`.
  2. **Filter bar de-stickied** at user request. Earlier draft applied `lg:sticky lg:top-0 lg:z-20` on the filter card (LESSON 2026-04-30's filter-bar-stickiness carve-out permitted it); user removed: "remove the sticky header". Filter bar now scrolls with the page. Other surfaces' filter-bar stickiness is unaffected — this is an opt-out for the audit-log page only.
  3. **In-place copy feedback** replaces the earlier toast wiring. Three component files (`AuditTable.tsx`, `AuditMobileCardStack.tsx`, `AuditRowExpanded.tsx`) plus a small new hook (`components/audit-log/useCopyFeedback.ts`) — the hook returns `{ copied, copy(value) }` with a 1.5s timeout and a cleanup on unmount. Every copy site swaps `Copy → Check` icon with a `text-success-700 dark:text-success-600` color flip while `copied` is true; the mobile card stack also adds a `bg-success-50` tint behind the icon button for parity with the desktop visual. `aria-live="polite"` on each button so screen readers announce the change. Sonner imports dropped from all three files; toast i18n keys removed (`admin.audit-log.toast.copied.entity` and `admin.audit-log.toast.copied.context`); new key `admin.audit-log.expanded.copied` added for the context-button label that flips from "Copy" to "Copied". Toasts remain on the export modal — they communicate background work, not click confirmations.
  4. **DateRangePicker mobile fix** at the **primitive** layer (`components/zhipay/DateRangePicker.tsx`). New media-query state listens to `matchMedia('(max-width: 767px)')`. Below the `md` breakpoint the calendar renders `numberOfMonths={1}` and the header drops the `Month A | Month B` divider so only the active month name renders. `<PopoverContent>` gained `collisionPadding={8}` so Radix shifts the popover off the viewport's right edge when the trigger sits near the border (user feedback: "it appears to right border in open"). Width clamp tightened from `calc(100vw - 2rem)` → `calc(100vw - 1rem)`. Desktop behavior (2-month view + 210px sidebar) unchanged. Every `<DateRangePicker>` consumer (Cards' last-used filter, Recipients' last-used filter, Audit Log's date-range chip, Overview's range filter) gets the mobile fix automatically.
  5. **Date-range chip label cleanup**. Earlier draft was `Date · Today` (label prefix + separator + formatted range). Iterated through `[CalendarRange icon] Today` (added then removed at user request) → final form `Today` / `Last 7 days` / formatted custom range, plain text + chevron. `aria-label` keeps the explicit "Date: Today" form for screen readers. Chip text width raised to `max-w-[180px]`.

- **Files modified**:
  - `dashboard/src/components/audit-log/AuditFilterBar.tsx` — search row lifted to its own row · sticky removed · DateRangeChip label simplified · X clear button added
  - `dashboard/src/components/audit-log/AuditTable.tsx` — `useCopyFeedback` wired in `EntityRefCell` · sonner import dropped
  - `dashboard/src/components/audit-log/AuditMobileCardStack.tsx` — copy span lifted into a `<CopyEntityIdButton>` subcomponent so each row has its own hook state · sonner import dropped
  - `dashboard/src/components/audit-log/AuditRowExpanded.tsx` — both copy buttons consume `useCopyFeedback` (entity-id icon button + context-text button) · sonner import dropped · context button label flips from "Copy" → "Copied"
  - `dashboard/src/components/zhipay/DateRangePicker.tsx` — `isMobile` media-query state · responsive `numberOfMonths` · header divider hidden on mobile · `collisionPadding={8}` on popover · width clamp tightened
  - `dashboard/src/lib/i18n.ts` — added `admin.audit-log.filter.clear-search` and `admin.audit-log.expanded.copied`; removed `admin.audit-log.toast.copied.entity` and `admin.audit-log.toast.copied.context`
  - `ai_context/AI_CONTEXT.md` — Audit Log paragraph rewritten to reflect non-sticky filter bar, full-width search row, in-place copy feedback, plain date-chip label · file-map adds `useCopyFeedback.ts` · 2 new "Decisions made" rows (Copy-action feedback pattern, DateRangePicker mobile rendering) · sticky-thead-deviation row updated to note the audit-log filter bar opt-out
  - `docs/product_states.md` — Audit log row updated: "non-sticky filter bar" + canonical search-row pattern + in-place copy feedback + DateRangePicker mobile note
  - `ai_context/HISTORY.md` — this entry

- **Files created**:
  - `dashboard/src/components/audit-log/useCopyFeedback.ts`

- **Docs updated**: `ai_context/AI_CONTEXT.md`, `ai_context/HISTORY.md`, `docs/product_states.md`. **No** schema / PRD / mermaid change — all five tweaks are presentation-layer.

- **Verified**: `npx tsc --noEmit` (exit 0) · `npx vite build` (exit 0).

---

### 2026-05-03 — Admin Audit Log surface (Phase 11) — `/compliance/audit-log`

- **Summary**: Built the central audit-log surface — read-only union view that bridges every existing module-level audit store in the dashboard. List page at `/compliance/audit-log` with append-only banner (slate-100, non-dismissible), sticky filter bar on `lg+`, full-width sortable table with chevron + click-to-expand rows on desktop, and a card-stack mirror with the same expand-inline pattern on `<lg`. **`mockAuditLog.ts` is the single source of truth** — at read time it merges `TRANSFER_EVENTS_FULL` plus the 6 existing audit stores (`mockUsers` / `mockCards` / `mockKycQueue` / `mockAmlTriage` / `mockFxRates` / `mockCommissionRules` — each gained a small `listXxxAudit()` export) plus a 200-row 7-day deterministic seed. Granular per-store action verbs (e.g. `request_info`, `freeze_card`, `assign_to_me`, `auto_freeze_user_blocked`) are mapped into the spec's 12-value `AuditAction` enum (`created / updated / deleted / status_changed / approved / rejected / cleared / escalated / frozen / unfrozen / reversed / failed`); the original verb is preserved in `context.kind`. The page imports **zero mutators** — read-only is enforced by construction.

  **Decision deviations from the literal spec** (each flagged in the proposal and confirmed before implementation):
  - **Non-sticky table thead** — spec said "Table — sticky header"; LESSON 2026-04-30 firmly forbids sticky thead even when a spec asks. Filter-bar stickiness preserved (LESSON carve-out). Every other deviation in this list was confirmed in the proposal.
  - **`/compliance/audit-log` route** — first `/compliance/*` segment in the codebase. Back-compat redirect from flat `/audit-log` so existing FX Config + Commission Rules kebab "Open audit log entry" deep-links keep resolving (`/audit-log?entity=fx_rate&id=fxr_010` → `/compliance/audit-log?entity=fx_rate&id=fxr_010` → filter applied + params stripped on first mount).
  - **Bridge from existing 7 stores** instead of a fictional 200-row-only seed. The seed covers spread (system / provider / user activity that no current admin surface emits); the bridge ensures any admin action taken in the prototype shows up here on next page focus.
  - **Action enum mapping** — the spec's 12-value action filter is honored exactly; granular per-store verbs are rolled up to the closest spec value (e.g. `kyc.request_info` → `updated`) and the original verb stays in `context.kind` for forensic detail in the JSON viewer.
  - **Recipient hard-deletes are bridged via the user-audit store, not a separate `recipient` entity-type** — the spec's `entity_type` enum doesn't include `recipient`. `mockUsers.appendUserAudit` already records `hard_delete_recipient` rows, so they surface as `entity.type='user'` with `context.kind='hard_delete_recipient'`.

  **Mock dataset (200 rows · 7 days)** — `dashboard/src/data/mockAuditLog.ts`. Deterministic manual seed (no PRNG). NOW = 2026-04-29T10:30:00Z (matches `mockTransfers` / `mockFxRates` / `mockCommissionRules`). Distribution: ~80 system rows (4 transfer-state-transition clusters of `created → processing → completed`, 1 cluster of `created → processing → failed`, 12 KYC auto-expire rows, 7 FX `healthy → drifting` flagging rows once per day, 30 standalone transfer state transitions, the rest "last login recorded"); ~50 provider rows (alternating Alipay / WeChat webhook completed/failed, ~5 failures using `RECIPIENT_INVALID` + `PROVIDER_UNAVAILABLE` failure codes); ~40 admin rows (10 KYC approves / 5 KYC rejects with realistic reasons / 6 card freezes with severity + reason / 2 card unfreezes / 6 AML clears with reason codes / 3 AML escalates incl. one critical-blocks-user / 4 FX rate creates incl. one historic 1.5% manual override / 2 commission rule new versions / 1 blacklist add / 1 service maintenance toggle); 30 user rows (login / kyc_start / transfer_submit / recipient_save with realistic IPs and phones). Each row carries `id`, `timestamp`, `actorType`, `actor` ({id, name, ip, device, phone} as applicable), `action`, `entity` ({type, id}), `fromStatus`, `toStatus`, optional `reason`, and a free-form `context` jsonb.

  **Pattern layer** (`dashboard/src/components/audit-log/`):
  - `types.ts` — filter shape + `applyAuditFilters` + `applyAuditSort` + `countActiveAuditFilters`. Default filter is `{ dateRange: { range: 'today' }, actorTypes: [], adminActorIds: [], entityTypes: [], actions: [], entityRef: '' }`. Date-range filter resolves through the canonical `<DateRangePicker>` `resolveDateRange()` helper with end-of-day-inclusive upper bound. Entity-ref text input matches `entity.id` case-insensitively (substring).
  - `filterState.ts` — module-level cache keyed to filters / sort / page / focused-index / expanded-id.
  - `AuditLogBanner.tsx` — append-only banner with `bg-slate-100 dark:bg-slate-800`, Info icon, non-dismissible (append-only is a contract, not a hint).
  - `AuditFilterBar.tsx` — sticky-on-`lg+` filter bar inside a rounded `bg-card` container. DateRangeChip wraps `<DateRangePicker>` (today renders as inactive styling, anything else lights brand). 4 generic ChipMulti groups (actor type / entity type / action) + AdminActorChip (searchable multi-select populated from `getDistinctAdminActors()`). Free-text entity-ref `<Input>` aligned right via `ml-auto`. Clear-all chip appears whenever `countActiveAuditFilters > 0`.
  - `ActorTypeChip.tsx` — system / user / provider / admin chip with palette (slate / brand / success / warning) + lucide icon (`Cpu` / `User` / `Webhook` / `ShieldCheck`).
  - `ActionChip.tsx` — 12-action chip with tone mapping: `created → info`; `approved / cleared / unfrozen → success`; `escalated / frozen / reversed → warning`; `deleted / rejected / failed → danger`; `updated / status_changed → neutral`.
  - `StatusTransitionPill.tsx` — `from → to` mono pill with `ArrowRight` separator. Renders `∅` when one side is null; renders nothing when both are null.
  - `AuditTable.tsx` — desktop table. Non-sticky thead per LESSON 2026-04-30 (deviation note in code). 9 columns: chevron / Timestamp (sortable, ISO + `formatRelative` subline) / Actor type / Actor (admin avatar+name+id / user phone / provider name / "system" italic) / Action / Entity type / Entity ref (8-char prefix mono with copy-on-click that stops propagation) / from→to pill / 80-char Context summary. Click row → flips chevron + renders an inline `<TableRow colSpan={9}>` with `<AuditRowExpanded>`. Skeleton variant matches the layout exactly with 10 rows per spec.
  - `AuditMobileCardStack.tsx` — mirrors the table on `<lg`. Each card: timestamp + relative + chevron / actor-type chip + action chip / entity type + 8-char ref + copy / optional transition pill / 80-char context summary. Tap card → expand inline (per spec — no Sheet, since the data is already small enough).
  - `AuditRowExpanded.tsx` — 4-cell key/value grid (timestamp UTC, actor block (id / name / phone / ip / device), entity reference w/ Copy + "Open entity" Button when the type is one of transfer / user / card / kyc / aml / fx / commission and the id isn't a `tx_seed` / `bridge_` / `u_seed` / etc. seed id, reason note when present). Below the grid: a collapsible Context (JSON) `<pre>` viewer with `overflow-x-auto overflow-y-hidden` (matches the AML / KYC JSON-panel convention) + Copy button + BigInt-safe replacer. "View N other events for this entity →" Button at the bottom (visible when `countRelatedEvents > 0`) sets the entity-ref filter to the full id and scrolls the page back to the top.
  - `ExportDialog.tsx` — Date-range row read-only (locked to the page filter, formatted via `formatDateRangeLabel`). Format radio (CSV / NDJSON, custom radio buttons with brand-tinted active state). Include-context checkbox (default off). When include-context is on, a cheap byte estimator (`JSON.stringify(context).length` per row + 200 bytes for non-context columns) drives a ≥2 MB warning banner. Generate-export button builds the file synchronously, triggers a Blob download with `application/x-ndjson` MIME for NDJSON and `text/csv` for CSV, and toasts success or failure (failure path: error toast with Retry CTA per spec).

  **Page** — `AuditLog.tsx` orchestrates filters / sort / page / focus / expanded state; persists everything to the module cache on every change so a kebab round-trip restores the page. Initial-mount 400ms skeleton (`loading=true` → false). Re-derives the merged list via a `version` counter bumped on `focus` / `popstate` events so admin actions taken on other pages reflect on return. Deep-link consumption: `?entity=&id=` query params auto-apply on first mount (`fx_rate` / `commission_rule` aliases supported), broaden the date range to 30d so the matching rows actually show up, then `setParams(replace=true)` strips the params from the URL. 5 page-scoped hotkeys (j / k / Enter / e / f) with the standard typing-context guard.

  **Routing** — `/compliance/audit-log` (first `/compliance/*` route in the codebase). Back-compat redirect from flat `/audit-log` → `/compliance/audit-log` preserves existing kebab deep-links. Removed `/audit-log` from `PLACEHOLDER_ROUTES`. Sidebar entry repointed; `g+l` global hotkey (already wired) now lands on the new path. HelpOverlay groups added: "Audit Log" (5 page-scoped hotkeys) + Navigation entry for `g+l`.

  **i18n** — ~85 new `admin.audit-log.*` keys (covers nav / page title + subtitle / banner / Export action / 6 filter labels / 4 actor-type labels / 11 entity-type labels / 12 action labels / 8 column headers / 9 expanded-row labels / 3 pagination labels / 11 export-modal keys / 4 empty-state strings / 4 toast strings).

  **Hotkeys** — list-page (page-scoped): `j` / `k` move focus; `Enter` toggles expand; `e` opens export dialog; `f` focuses the first filter chip. Global: `g+l` routes to `/compliance/audit-log`.

- **Files created**:
  - `dashboard/src/data/mockAuditLog.ts`
  - `dashboard/src/pages/AuditLog.tsx`
  - `dashboard/src/components/audit-log/{types,filterState}.ts`
  - `dashboard/src/components/audit-log/{AuditLogBanner,AuditFilterBar,ActorTypeChip,ActionChip,StatusTransitionPill,AuditTable,AuditMobileCardStack,AuditRowExpanded,ExportDialog}.tsx`

- **Files modified**:
  - `dashboard/src/data/mockUsers.ts` — `listUserAudit()` export added (3 lines, full module store newest-first)
  - `dashboard/src/data/mockCards.ts` — `listCardAudit()` export added
  - `dashboard/src/data/mockKycQueue.ts` — `listKycAudit()` export added
  - `dashboard/src/data/mockAmlTriage.ts` — `listAmlAudit()` export added
  - `dashboard/src/data/mockFxRates.ts` — `listFxAudit()` export added
  - `dashboard/src/data/mockCommissionRules.ts` — `listCommissionAudit()` export added
  - `dashboard/src/router.tsx` — `<AuditLog>` import + `/compliance/audit-log` route + `Navigate` redirect from `/audit-log` + dropped `/audit-log` from `PLACEHOLDER_ROUTES`
  - `dashboard/src/components/layout/Sidebar.tsx` — Audit Log nav `to` updated to `/compliance/audit-log`
  - `dashboard/src/hooks/useKeyboardShortcuts.ts` — `g+l` routes to `/compliance/audit-log`
  - `dashboard/src/components/layout/HelpOverlay.tsx` — `g+l` Navigation entry + new "Audit Log" hotkey group with 5 page-scoped shortcuts + appended to `groups` array
  - `dashboard/src/lib/i18n.ts` — ~85 new `admin.audit-log.*` keys
  - `ai_context/AI_CONTEXT.md` — current-phase rewrite (11 surfaces); Phase 11 entry; placeholder count 9 → 8; routes-decision row updated for `/compliance/audit-log`; 2 new "Decisions made" rows (Central audit-log strategy, Audit Log sticky thead deviation); file-map extended with `audit-log/` tree + `mockAuditLog.ts`; pages list extended with `AuditLog`; workstreams flipped Audit Log to ☑
  - `docs/product_states.md` — Audit log row flipped from ❌ Placeholder to ✅ Done; route updated `/audit-log` → `/compliance/audit-log`; last-updated bumped
  - `ai_context/HISTORY.md` — this entry

- **Docs updated**: `ai_context/AI_CONTEXT.md`, `ai_context/HISTORY.md`, `docs/product_states.md`. **No** schema / PRD / mermaid change — central audit log is a derived UNION view, not a new entity. The real backend may store this as a single `audit_events` table or as a query that joins per-domain audit tables; the dashboard's mock simulates the union.

- **Open items**:
  - **Backend audit shape** — does the real backend keep one normalized `audit_events` table or per-domain audit tables joined via a view? The mock is agnostic — it just merges sources at read time.
  - **Recipient as a first-class entity type** — folded under `entity.type='user'` with `context.kind='hard_delete_recipient'` for now, since the spec's enum doesn't include `recipient`. Re-evaluate if the real schema records it as a separate entity.
  - **`reason_note` storage** — admin actions whose store carries a free-text reason (cards / KYC / AML / FX / commission / users) all expose it on the central row. The schema decision (denormalized on the entity row vs separate audit-only table) is still open across multiple surfaces (FX Config + Commission Rules already flagged this open).
  - **Visa / Mastercard relevance** — N/A. Audit Log surfaces whatever lands in the bridged stores; if V/MC return, they appear automatically.

- **Verified**: `npx tsc --noEmit` (exit 0) · `npx vite build` (exit 0, ~1.68 MB minified / ~426 KB gzip).

---

### 2026-05-03 — Admin Commission Rules surface (Phase 10) — `/finance/commissions` + `/new`

- **Summary**: Built the Commission Rules surface — versioned per account_type (Personal | Corporate), edits-as-new-version contract, audit-protected history, worked-example live recompute. List page at `/finance/commissions` with `<Tabs>` segmented control split between Personal (default) and Corporate; each tab stacks ActiveRuleCard → WorkedExampleCard → VersionHistoryTable on `lg+` / VersionHistoryMobileCardStack on `<lg`. Full-page New-version form at `/finance/commissions/new?account_type=...` (full pre-fill from active rule, sticky DiffPreview + WorkedExampleCard preview pane on `lg+`, mobile "Show diff & worked example" toggle). `mockCommissionRules.ts` is the single source of truth — `commission_rules` rows are NEVER edited in place per accountType; `addCommissionRule()` only inserts new versions and closes the previous active row's window by setting `effectiveTo = newRow.effectiveFrom`. Schema's `is_active` boolean is treated as a denormalized cache of the window check — derived in mock, the real backend may keep it materialized. `created_by` and `reason_note` are mock-only audit-trail surrogates (same precedent as `mockFxRates.ts`). The page never recomputes `transfer_fees.commission_uzs` for transfers already in `processing` / `completed` (this is enforced upstream).

  **Decision deviations from the literal spec** (each flagged in the proposal and confirmed before implementation):
  - **Phase 0 primitive lift** — `<StepperNumberInput>` + `<DateTimeInput>` moved from `components/fx-config/` to `components/zhipay/` because Patterns can't import from other Patterns per [`design-system-layers.md`](../.claude/rules/design-system-layers.md). FX Config import paths updated; no logic changes; i18n keys for the datetime primitive renamed from `admin.fx-config.datetime.*` to `common.datetime.*` to match the shared home.
  - **`Currency` type extended to `UZS | CNY | USD`** — added `USD` so `volume_threshold_usd` (bigint cents) renders via the standard `formatMoney`/`<Money>` path. `formatMoney` only string-appends the currency code, so no consumer required code changes.
  - **Tabs not sticky on mobile** — spec asked for sticky-horizontal tabs on mobile; we follow the locked Users-tabs convention (NOT sticky) for cross-surface consistency.
  - **Active history-row uses bg-tint only** (matching FX Config) — spec asked for a brand-600 left border; FX Config established `bg-brand-50/60` only; we matched FX Config.
  - **DiffPreview shows only changed rows** (per spec) — differs from FX Config's DiffPreview which shows all 6 rows. Empty state "No changes yet — edit a field to preview the diff" when the draft equals the active rule, with submit button disabled until at least one delta exists.

  **Mock dataset (12 personal + 8 corporate · ~9 months)** — `dashboard/src/data/mockCommissionRules.ts`. Deterministic manual seed (no PRNG). NOW = 2026-04-29T10:30:00Z (matches `mockFxRates`). Personal walk: v1 (270d ago, 1.00–3.00% / 5,000 UZS) → v12 (30d ago, ACTIVE, 0.50–2.00% / 5,000 UZS). Corporate walk: v1 (270d ago, 0.80–2.00% / 20,000 USD threshold / 0.50% corporate_pct) → v8 (90d ago, ACTIVE, 0.40–1.50% / 10,000 USD / 0.30% corporate_pct — matches spec exactly). Each row carries `id` ('cr_p_NNN' / 'cr_c_NNN') / `accountType` / `version` / `minPct` / `maxPct` / `minFeeUzsTiyins` / `volumeThresholdUsdCents` (null for personal) / `corporatePct` (null for personal) / `effectiveFrom` / `effectiveTo` (null only for the trailing active row per accountType) / `createdBy` / `reasonNote`. Reason notes reference plausible CBU / regulator notices and pricing-committee reviews. Module-level audit-log store with one action type (`commission_rule_create`).

  **Pattern layer** (`dashboard/src/components/commissions/`):
  - `ActiveRuleCard.tsx` — top row title + `v{version}` brand-tinted chip + right-side primary "New version" CTA. 4-cell grid (personal: min% / max% / min fee / [empty 4th cell collapses]) / 3-cell + 3-cell on lg corporate (min% / max% / min fee on row 1; volume_threshold / corporate_pct in brand-700 on row 2). Meta strip below the grid: effective-from with `formatRelative` parenthesis + effective-to ("open-ended" italic when null) + created-by mono. Skeleton matches the layout exactly.
  - `WorkedExampleCard.tsx` — header with title + (non-compact) subtitle. Sample-amount row → commission % line (with detail "Midpoint of the [min – max] band — illustrative typical charge") → commission UZS line → min-fee floor line (status detail flips between "Floor applies — total raised to min fee" and "Does not apply — commission > floor") → total fee line in brand-700 font-semibold. Corporate adds an "Above volume threshold" sub-card explaining the discount and showing the `corporate_pct` commission. `compact` prop hides the subtitle and tightens spacing for the form's right pane.
  - `VersionHistoryTable.tsx` — desktop table with 9 columns (chevron / version / effective-from / effective-to / min % / max % / min fee / Active badge / kebab); active row gets `bg-brand-50/60 dark:bg-brand-950/30` and version cell text shifts to brand; rows are clickable to expand inline showing the full record (10 fields personal / 12 corporate, including reason note) + a Diff vs previous version table (read-only — keeps the user in list context); kebab actions are `View / Collapse record` + `Open audit log entry` (`/audit-log?entity=commission_rule&id=...`); Title Case headers + `text-sm font-medium text-muted-foreground` per LESSON 2026-05-02.
  - `VersionHistoryMobileCardStack.tsx` — mirrors the table on `<lg`. Each card shows v{version} + effective-from + Active badge + a single line with `min – max` range + min fee; tapping expands the full record + a vertical diff for min_pct / max_pct / min_fee.
  - `DiffPreview.tsx` — used in the Update form's right pane. **Only-changed rows** Current vs New table (per spec). Empty state with "No changes yet" copy when the draft equals the active rule; in that case the card body is hidden so the empty state stands alone in the header. Disabled-style "—" rendering when numeric inputs aren't yet parseable.
  - `ActivateConfirmDialog.tsx` — AlertDialog with the spec'd "Activate new version now? Transfers created after [effective_from] will use the new rule. The old version remains read-only in history." copy, parameterized with the form's effective-from.

  **Pages** — `CommissionRules.tsx` (orchestrates the tabs + per-tab content + 400ms initial-mount skeletons + `n` page-scoped hotkey opens new-version for the visible tab + `focus`/`popstate` listeners bump a `version` counter so the list re-derives state when the user returns from a successful new-version submission) + `CommissionRulesNew.tsx` (full form with all numeric inputs through `<StepperNumberInput>`, datetime through `<DateTimeInput>`, 4-rule client-side validation with inline errors, has-changes detection so submit is disabled when the draft equals the active rule, AlertDialog confirm flow, error-path stays on form with toast + preserved inputs per spec — server-side validation is a backend responsibility flagged in the prompt).

  **Routing** — `/finance/commissions` + `/finance/commissions/new`. Back-compat redirects from `/commission-rules` + `/commission-rules/new`. Removed `/commission-rules` from `PLACEHOLDER_ROUTES`. Sidebar entry repointed; `g+m` global hotkey added (mnemonic for **m**oney / commissions); HelpOverlay groups added: "Commission Rules" + "New commission version".

  **i18n** — ~100 new `admin.commissions.*` keys (covers nav / page title / tabs / active card cells + meta strip / worked-example labels + corporate above-threshold copy / version history table columns + row actions + mobile card meta + expanded record fields + diff column headers / form labels + helps + reason note + warning banner + 4 validation messages + confirm dialog + toasts) + 8 `common.datetime.*` keys lifted from the FX Config datetime block.

  **Hotkeys** — list-page (page-scoped): `n` opens New-version page. New-version page (page-scoped): Cmd/Ctrl+Enter submits when the form is valid. Number inputs: ↑ / ↓ ± step (0.01 for percentages, 100 for UZS, 100 for USD), Shift+↑ / ↓ ± shiftStep (×10 of step). Global: `g+m` routes to `/finance/commissions`.

- **Files created**:
  - `dashboard/src/data/mockCommissionRules.ts`
  - `dashboard/src/pages/{CommissionRules,CommissionRulesNew}.tsx`
  - `dashboard/src/components/commissions/{ActiveRuleCard,WorkedExampleCard,VersionHistoryTable,VersionHistoryMobileCardStack,DiffPreview,ActivateConfirmDialog}.tsx`
  - `dashboard/src/components/zhipay/{StepperNumberInput,DateTimeInput}.tsx` (lifted from `components/fx-config/`)

- **Files modified**:
  - `dashboard/src/types/index.ts` — `Currency` type extended to `UZS | CNY | USD`
  - `dashboard/src/router.tsx` — `/finance/commissions` + `/:new` routes, redirects from `/commission-rules` + `/commission-rules/new`, dropped `/commission-rules` from `PLACEHOLDER_ROUTES`
  - `dashboard/src/components/layout/Sidebar.tsx` — Commission Rules nav `to` updated to `/finance/commissions`
  - `dashboard/src/hooks/useKeyboardShortcuts.ts` — `g+m` routes to `/finance/commissions`
  - `dashboard/src/components/layout/HelpOverlay.tsx` — new "Commission Rules" + "New commission version" hotkey groups + `g+m` Navigation entry
  - `dashboard/src/pages/FxConfigUpdate.tsx` — import paths for `StepperNumberInput` + `DateTimeInput` updated to `@/components/zhipay/...`
  - `dashboard/src/lib/i18n.ts` — ~100 new `admin.commissions.*` keys + 8 `common.datetime.*` keys (renamed from `admin.fx-config.datetime.*` since the primitive is now shared)
  - `ai_context/AI_CONTEXT.md` — current-phase rewrite (10 surfaces); Phase 10 entry; placeholder count 10 → 9; routes-decision row updated for `/finance/commissions`; 4 new "Decisions made" rows (Commission rules immutability + version contract, Commission worked-example contract, Currency type extension, primitive lift narrative on FX number stepping primitive row); file-map extended with `commissions/` tree + `mockCommissionRules.ts` + `zhipay/` lift annotation; ZhiPay primitives count 12 → 14; workstreams flipped Commission Rules to ☑
  - `dashboard/src/components/fx-config/` — `StepperNumberInput.tsx` + `DateTimeInput.tsx` removed (lifted to `components/zhipay/`)
  - `docs/product_states.md` — Commission Rules row flipped from ❌ Placeholder to ✅ Done; route updated `/commission-rules` → `/finance/commissions` (+ `/new`); last-updated bumped
  - `ai_context/HISTORY.md` — this entry

- **Docs updated**: `ai_context/AI_CONTEXT.md`, `ai_context/HISTORY.md`, `docs/product_states.md`. **No** schema / PRD / mermaid change — the existing `commission_rules` ER block in `docs/models.md` §6 already covered every spec'd field. `created_by` and `reason_note` are mock-only today (audit-trail surrogates that the real backend will record in a separate `commission_rules_audit` / `transfer_events`-style table).

- **Open items**:
  - **`commission_rules.created_by` + `commission_rules.reason_note`** — mock-only today. Backend will likely record these in an audit-log table rather than denormalize on the row. Decision pending.
  - **`transfer_fees.rule_id` snapshot on `transfers`** — already in the schema (`docs/models.md` §6); the page assumes every `processing` transfer was priced against the active rule for that accountType, but adding deep-links from version history to "transfers priced at THIS version" would round-trip nicely.
  - **Worked-example commission %** — currently the midpoint of [min_pct, max_pct]. Real product rule is some function of amount/destination/customer history. The midpoint is illustrative; final UI may surface multiple worked examples (low / mid / high amount) once the pricing function is decided.
  - **`is_active` denormalized cache** — the schema carries `is_active boolean`. The mock derives it from the window check; the real backend may materialize it for query performance + a partial unique index. Decision pending with backend.
  - **Visa / Mastercard relevance** — N/A. Commission Rules is rate-only with no card-scheme dimension. Re-introduction of V/MC card rails won't affect this surface.

- **Verified**: `npx tsc --noEmit` (exit 0) · `npx vite build` (exit 0, ~1.62 MB minified / ~412 KB gzip).

---

### 2026-05-03 — FX Config mobile polish — Source dropdown Radix-rebuild · SourceChip fit · Chart segmented-control padding

- **Summary**: Three small same-day fixes after mobile review of the FX Config surface.
  1. **Source dropdown rebuilt as Radix `<DropdownMenu>`** — initial native `<select>` (with `appearance-none` + custom `<ChevronDown>` overlay) was opening its option panel in inconsistent positions on Android Chrome / iOS Safari (the system popover drifts when the underlying control is heavily restyled). Replaced with a `<DropdownMenuTrigger>` button styled like an input (h-10, full-width, ChevronDown on the right) + `<DropdownMenuRadioGroup>` content. Content gets `className="w-[var(--radix-dropdown-menu-trigger-width)]"` so the panel always anchors flush under the trigger and matches its width on every platform. Same primitive the kebab menus already use, so positioning behavior is consistent across the dashboard.
  2. **SourceChip mobile fit** — chips were rendering inside DiffPreview's right-aligned cells (which carry `font-mono tabular`). The chip text inherited `font-mono` from the parent and rendered in JetBrains Mono at 13px, which is materially wider than Inter at the same size and pushed the columns past the viewport on narrow phones. Added `font-sans` + `whitespace-nowrap` to the chip so its text always renders in the design-system sans face and never breaks across lines mid-label. Fix lives at the chip level so it benefits every consumer (DiffPreview, ActiveRateCard, version history).
  3. **Chart range segmented-control horizontal padding** — RateTrendChart's range tabs (`24h / 7d / 30d / 90d`) shipped at `h-7 px-2.5` inside a `p-0.5` container which read as cramped. Bumped horizontal padding only (per user direction): container `px-1 py-0.5 gap-0.5`, items `h-7 px-3.5`. Height held at 28px so the segmented control still nests in the card header without crowding the title row.
- **Files modified**:
  - `dashboard/src/pages/FxConfigUpdate.tsx` — Source field rebuilt as `<DropdownMenu>` + `<DropdownMenuRadioGroup>` + `<DropdownMenuRadioItem>` × 3; new imports for the dropdown-menu primitives
  - `dashboard/src/components/fx-config/SourceChip.tsx` — added `font-sans whitespace-nowrap`
  - `dashboard/src/components/fx-config/RateTrendChart.tsx` — segmented control container `p-0.5` → `px-1 py-0.5 gap-0.5`; items `px-2.5` → `px-3.5`; skeleton width bumped `w-44` → `w-56`
  - `ai_context/AI_CONTEXT.md` — current-phase paragraph for FX Config updated: native `<select>` → Radix `<DropdownMenu>` w/ RadioGroup, with the rationale; Validity window `grid-cols-2` mention added inline
  - `ai_context/HISTORY.md` — this entry
- **Verified**: `npx tsc --noEmit` exit 0 · `npx vite build` exit 0.

---

### 2026-05-03 — DateTime picker calendar header polish + LESSON

- **Summary**: Calendar header in the FX Config DateTime picker shipped with react-day-picker's default chrome — the prev/next chevrons hugged the centered "Month YYYY" caption text, which read as cramped and didn't match `<DateRangePicker>`'s canonical "Month A | Month B" custom bar. User feedback: header should be `< Month YYYY >` with `justify-between` (arrows on the sides). Fixed `<DateTimeInput>` to render its own header above `<Calendar>` and hide rdp's defaults via `classNames={{ nav: 'hidden', month_caption: 'hidden' }}`. New header structure: 32×32px boxed icon buttons (`border border-border` + hover ring + focus-visible ring) on left/right, `text-base font-semibold tracking-tight` month/year title in the center, `border-b` separating the header from the calendar grid. `displayMonth` lifted into a separate `useState` and reset on every Popover open so cancel-then-reopen returns to the committed value's month.
- **LESSON locked** — `ai_context/LESSONS.md` 2026-05-03 entry: "Calendar / date-picker header is `[<]   Month YYYY   [>]` with `justify-between` — never the default react-day-picker chrome". Captures the full header template + hide-rdp-chrome classNames + button styling + spacing rules + the `nav: 'hidden'` / `month_caption: 'hidden'` requirement (single-month vs range picker note included). Quick grep verification command in the lesson catches future Calendar usages that drift back to the default chrome.
- **Files modified**:
  - `dashboard/src/components/fx-config/DateTimeInput.tsx` — custom header bar + `displayMonth` state + `classNames={{ nav: 'hidden', month_caption: 'hidden' }}` on the Calendar
  - `dashboard/src/lib/i18n.ts` — 2 new keys (`admin.fx-config.datetime.prev-month` / `next-month`)
  - `ai_context/LESSONS.md` — new 2026-05-03 LESSON: Calendar header convention
  - `ai_context/HISTORY.md` — this entry
- **Verified**: `npx tsc --noEmit` exit 0 · `npx vite build` exit 0.

---

### 2026-05-03 — FX Config Update form polish — Source dropdown chevron, Validity grid, Calendar-based DateTime picker

- **Summary**: Three UX fixes to the Update FX rate form following same-day review.
  1. **Source dropdown chevron** — native `<select>`'s system-rendered chevron sat jammed against the right border. Switched to `appearance-none pl-3 pr-10 cursor-pointer` + a `<ChevronDown h-4 w-4>` overlay positioned at `right-3 top-1/2 -translate-y-1/2 pointer-events-none`. Native a11y preserved; the chevron now has proper breathing room.
  2. **Validity window grid** — Valid from / Valid to were stacked vertically with `space-y-4` inside the section card. Re-laid out as `grid grid-cols-1 md:grid-cols-2 gap-4` so the paired range reads as one logical unit on `md+` and stacks on mobile. The "leave empty for open-ended" help text moved out of the inner Field and now sits below the grid as a single section-level note.
  3. **DateTime picker rebuilt** — replaced the native `<input type="datetime-local">` wrapper (the OS-rendered stepped numeric picker is awkward, especially on macOS) with a Popover-anchored Calendar + time selects, mirroring the existing `<DateRangePicker>` style. New shape: trigger button styled like an Input (h-10, full-width, calendar icon + tabular date label, optional X-clear when `allowEmpty`); PopoverContent is a 360-px panel with `<Calendar mode="single">` on top, a "Time" row below with hour (0-23) and minute (0,5,10…55 — 5-min steps so the dropdown stays scannable) selects, footer with summary line + Cancel / Clear / Apply buttons. `min` constraint passes through as a `disabled: (date) => boolean` matcher to the calendar so Valid to can't be set earlier than Valid from. Draft state resets on every open so cancel-then-reopen returns to the committed value.
- **Files modified**:
  - `dashboard/src/components/fx-config/DateTimeInput.tsx` — full rewrite (native datetime-local wrapper → Popover + Calendar + time selects)
  - `dashboard/src/pages/FxConfigUpdate.tsx` — Source select wrapped in a `relative` container w/ ChevronDown overlay; Validity window card switched to `grid grid-cols-1 md:grid-cols-2`
  - `dashboard/src/lib/i18n.ts` — 6 new `admin.fx-config.datetime.*` keys (placeholder / time / hour / minute / clear / no-selection)
  - `ai_context/AI_CONTEXT.md` — file-map line for `DateTimeInput.tsx` updated; "FX number stepping primitive" decision row updated to reflect the Popover-based picker (with the rationale for swapping out native)
  - `ai_context/HISTORY.md` — this entry
- **Verified**: `npx tsc --noEmit` exit 0 · `npx vite build` exit 0.

---

### 2026-05-03 — Admin FX Config surface (Phase 9) — `/finance/fx-config` + `/new`

- **Summary**: Built the FX Config surface — a touchy admin page where every edit changes pricing for new transfers immediately, audit-heavy, and immutability-by-version is the contract. List page at `/finance/fx-config` with active rate card + trend chart + version history (table on `lg+`, card stack on `<lg`); full-page Update form at `/finance/fx-config/new` with two-column layout (form left 60%, sticky DiffPreview right 40% on `lg+`; mobile stacks form + Show-diff toggle). `mockFxRates.ts` is the single source of truth — `fx_rates` rows are NEVER edited in place; `addFxRate()` only inserts new versions and closes the previous active row's window by setting `validTo = newRow.validFrom` so no two rows are open-ended at the same instant. **Decision deviations from the literal spec**: spread-health thresholds locked at `healthy ≤ 1.5% / drifting up to 2.0%` (spec said "configured band" without numbers — exported as `FX_SPREAD_HEALTH_THRESHOLDS` for one-place editability); native styled `<input type="datetime-local">` wrapped by a small `<DateTimeInput>` primitive instead of building a new datetime picker (the existing `<DateRangePicker>` is range-only; building a new primitive for a single consumer would be an under-tested abstraction); in-flight count derived from `TRANSFERS_FULL.filter(t => t.status === 'processing').length` (real backend will read `transfers.fx_rate_id`; in mock, every `processing` transfer is by definition created within the active rate's window, so the count IS the locked-at-active count); `setInFlightCounter()` indirection wires `mockTransfers` into `mockFxRates` from each page module so the data layer stays free of a circular import.
  - **Mock dataset (19 versions · 60 days)** — `dashboard/src/data/mockFxRates.ts`. Deterministic manual seed (no PRNG). Rate walk from `1392.00` → `1404.17` mid with realistic ≤ 0.4% day-on-day moves and one historic 1.5% jump on `2026-03-30` flagged "manual override after PBoC weekend devaluation announcement" with a compliance ticket reference (`RIS-2026-08`); the next version (`fxr_011`) reset spread to `1.20%` after compliance review closed. Source distribution: 17 `central_bank` / 1 `manual` / 0 `provider_x` (wired in the form select for v1). Created-by mix: `admin_super_01` (11) / `admin_finance_02` (8). Each row carries `id` / `pair` / `midRate` / `spreadPct` / `clientRate` (computed exactly as `round(mid × (1 + spread/100), 2)` so the math reconciles in the diff preview) / `source` / `validFrom` / `validTo` (null only for the trailing active row `fxr_019`) / `createdBy` / `reasonNote`. Module-level audit-log store with one action type (`fx_rate_create`).
  - **Pattern layer** (`dashboard/src/components/fx-config/`):
    - `FxStatusBadge.tsx` — Healthy / Drifting / Stale rendered as success / warning / danger pill with `CheckCircle2 / AlertTriangle / AlertOctagon` icons.
    - `SourceChip.tsx` — central_bank uses `RefreshCw` (neutral slate), provider_x uses `Database`, **manual uses `Pencil` in warning tone** so historical manual overrides are visually distinct.
    - `ActiveRateCard.tsx` — top row title + FxStatusBadge; 4-cell grid (`grid-cols-2 lg:grid-cols-4`) for mid / spread / client / source — client_rate large in `text-brand-700`; meta strip below the grid with pair (mono chip) / valid-from / valid-to ("open-ended" italic when null) / in-flight count. Skeleton variant matches the layout exactly.
    - `RateTrendChart.tsx` — recharts `LineChart` with two series (`midRate` dashed slate-400, `clientRate` solid brand-600); range tabs `24h / 7d / 30d / 90d` at top-right of the card header (`role="tablist"` + `aria-selected` + brand-tinted active state); `getFxChartSeries()` synthesizes intra-day samples by stepping through time and resolving each point's mid+spread from the version whose validity window covers it, then adding low-amplitude sine/cos noise so 24h doesn't read as flat-line; recharts `tick.fontSize: 13` per the typography floor (LESSON 2026-04-29).
    - `VersionHistoryTable.tsx` — desktop table with 10 columns (chevron / effective-from / effective-to / mid / spread / client (highlighted brand on the active row) / source chip / Active yes/no badge / created-by / kebab); active row gets `bg-brand-50/60 dark:bg-brand-950/30`; rows are clickable to expand inline showing the full record + a Diff vs previous version table (read-only — keeps the user in list context per spec); kebab actions are `View / Collapse record` and `Open audit log entry` (`/audit-log?entity=fx_rate&id=...`); Title Case headers + `text-sm font-medium text-muted-foreground` per LESSON 2026-05-02.
    - `VersionHistoryMobileCardStack.tsx` — mirrors the table on `<lg`. Each card shows the effective-from datetime + active badge + client_rate (brand-tinted on active) + spread + source chip; tapping expands the full record + a vertical 3-column `[label / prev / next]` diff for mid + client.
    - `DiffPreview.tsx` — used in the Update form's right pane. 6-row Current vs New table for mid / spread / client / source / valid-from / valid-to; client_rate row gets a `+/-X.XX%` percent delta badge (warning tone for upward, success tone for downward) when the absolute change is ≥ 0.005%; client_rate is `text-brand-700 font-semibold` when changed; disabled-style ("—") rendering when numeric inputs aren't yet parseable.
    - `UpdateConfirmDialog.tsx` — AlertDialog confirming with the in-flight count line per spec: "12 transfers currently locked at the old rate will not be affected."
    - `StepperNumberInput.tsx` — page-scoped numeric input. Handles ↑ / ↓ ± `0.01`, Shift+↑ / ↓ ± `0.10`, Cmd/Ctrl+Enter submit; commits via `toFixed(precision)` on blur and after each step; allows trailing `.` / `,` while typing; honors `disabled` (used when `source === 'central_bank'` per spec lock).
    - `DateTimeInput.tsx` — wraps native `<input type="datetime-local">` with design-system styling. Custom `toLocalInputValue` / `fromLocalInputValue` helpers parse the local-time string from the native control as local rather than letting `new Date()` coerce it as UTC (which would shift the value); `allowEmpty` clears to `null` for open-ended `validTo`.
  - **Pages** — `FxConfig.tsx` (orchestrates the active card + trend chart + history table + module-load `setInFlightCounter` wiring + `u` page-scoped hotkey opens Update + `focus` / `popstate` listeners bump a `version` counter so the list re-derives state when the user returns from a successful update) + `FxConfigUpdate.tsx` (full form with central_bank source lock, auto-computed client rate panel, sticky DiffPreview on `lg+`, mobile "Show diff" Eye-icon button that scrolls to a collapsed DiffPreview, AlertDialog confirm flow, error path stays on form with toast + preserved inputs per spec).
  - **Routing** — `/finance/fx-config` + `/finance/fx-config/new`. Back-compat redirects from `/fx-config` + `/fx-config/new`. Removed `/fx-config` from `PLACEHOLDER_ROUTES`. Sidebar entry repointed; `g+f` global hotkey + help-overlay shortcut text updated to the new path.
  - **i18n** — ~95 new `admin.fx-config.*` keys (covers nav / page title / subtitle / active rate card cells + meta strip / status-badge labels / source chip labels / chart range tabs + legend / version history table columns + row actions + mobile card meta + expanded record fields + diff column headers / form labels + helps + reason note + warning banner + confirm dialog + toasts).
  - **Hotkeys** — list-page (page-scoped): `u` opens Update page. Update-page (page-scoped): Cmd/Ctrl+Enter submits when the form is valid. Number inputs: ↑ / ↓ ± 0.01, Shift+↑ / ↓ ± 0.10. HelpOverlay groups added: "FX Config" + "Update FX rate".
- **Files created**:
  - `dashboard/src/data/mockFxRates.ts`
  - `dashboard/src/pages/{FxConfig,FxConfigUpdate}.tsx`
  - `dashboard/src/components/fx-config/{ActiveRateCard,FxStatusBadge,SourceChip,RateTrendChart,VersionHistoryTable,VersionHistoryMobileCardStack,DiffPreview,UpdateConfirmDialog,StepperNumberInput,DateTimeInput}.tsx`
- **Files modified**:
  - `dashboard/src/router.tsx` — `/finance/fx-config` + `/:new` routes, redirects from `/fx-config` + `/fx-config/new`, dropped `/fx-config` from `PLACEHOLDER_ROUTES`
  - `dashboard/src/components/layout/Sidebar.tsx` — FX Config nav `to` updated to `/finance/fx-config`
  - `dashboard/src/hooks/useKeyboardShortcuts.ts` — `g+f` repointed to `/finance/fx-config`
  - `dashboard/src/components/layout/HelpOverlay.tsx` — new "FX Config" + "Update FX rate" hotkey groups
  - `dashboard/src/lib/i18n.ts` — ~95 new `admin.fx-config.*` keys
  - `ai_context/AI_CONTEXT.md` — current-phase rewrite (9 surfaces); Phase 9 entry; placeholder count 11 → 10; routes-decision row updated for `/finance/*`; 4 new "Decisions made" rows (FX immutability + version contract, FX spread health bands, FX in-flight counter wiring, FX number stepping primitive); file-map extended with `fx-config/` tree + `mockFxRates.ts`; workstreams flipped FX Config to ☑
  - `docs/product_states.md` — FX Config row flipped from ❌ Placeholder to ✅ Done; route updated `/fx-config` → `/finance/fx-config` (+ `/new`); last-updated timestamp bumped to 2026-05-03
  - `ai_context/HISTORY.md` — this entry
- **Docs updated**: `ai_context/AI_CONTEXT.md`, `ai_context/HISTORY.md`, `docs/product_states.md`. **No** schema / PRD / mermaid change — the existing `fx_rates` ER block in `docs/models.md` §6 (with `id` / `pair` / `mid_rate` / `spread_pct` / `client_rate` / `source` / `valid_from` / `valid_to`) already covered every spec'd field. `created_by` and `reason_note` are mock-only today (audit-trail surrogates that the real backend will record in a separate `fx_rate_audit` / `transfer_events`-style table).
- **Open items**:
  - **`fx_rates.created_by` + `fx_rates.reason_note`** — mock-only today. Backend will likely record these in an audit-log table rather than denormalize on the row. Decision pending.
  - **`fx_rates.fx_rate_id` snapshot on `transfers`** — the page assumes every `processing` transfer is locked to the active rate (true by the validity window invariant), but adding an explicit `transfers.fx_rate_id` column would make the relationship explicit and let us build "transfers locked at THIS version" deep-links from the version history table. Backend signoff pending.
  - **Spread health bands** — `healthy ≤ 1.5% / drifting up to 2.0%` are placeholders pending Compliance sign-off. The 1.5% jump in `fxr_010` was deliberately authored to land at the band edge so the SourceChip warning tone exercises that boundary case visually.
  - **Provider X integration** — option exists in the source dropdown but no real feed is wired today; it's a free-edit fallback that mirrors `manual` in v1.
  - **Visa / Mastercard relevance** — N/A. FX Config is rate-only with no card-scheme dimension. Re-introduction of V/MC card rails won't affect this surface.

- **Verified**: `npx tsc --noEmit` (exit 0) · `npx vite build` (exit 0, 1.56 MB minified / 400 KB gzip) · dev server returns HTTP 200 on `/`.

---

### 2026-05-02 — Admin Recipients surface (Phase 8) + recipient-context filter on Transfers

- **Summary**: Built the Recipients section at `/customers/recipients` (cross-user list/search) + `/customers/recipients/:id` (full-page detail). `mockRecipients.ts` is now the single source of truth for saved-recipient data — `mockUsers.ts` shed its local `liveRecipients` array and `getUserRecipients` / `hardDeleteRecipient` are now thin wrappers (mirrors the Cards refactor pattern). Existing recipient IDs `r_u01_01` / `r_u02_01` / `r_u03_01` / `r_u03_02` were preserved so the user-detail Recipients tab + any latent deep-links still resolve. Spec-compliant 60-recipient mock across 30 distinct owners (36 alipay / 24 wechat / 12 favorites). Wired the `?context=recipient&recipient_id=...` filter on Transfers list + transfer-detail pager + back-link so the detail page's "View all transfers to this recipient" CTA round-trips cleanly. CJK display names (`张伟`, `李娜`, `王芳`, `黄敏`) render verbatim across the surface — no transliteration. Decision deviations from the literal spec: bucketed last-used filter swapped for the canonical `<DateRangePicker>` per the Cards convention (LESSONS 2026-05-02), back-link string authored as `Back to recipients` (no `← ` text prefix per LESSONS 2026-05-02), subtitle counts rendered live (`60 saved across 30 users`) instead of the spec's aspirational `12 384 / 4 821` placeholder.
  - **Mock dataset (60 recipients · 30 distinct owners)** — `dashboard/src/data/mockRecipients.ts`. Deterministic manual seed (no PRNG). Distribution: 6 heavy owners × 3 recipients (18) + 18 medium owners × 2 (36) + 6 light owners × 1 (6). Destinations: 36 alipay (60%) / 24 wechat (40%). Favorites: 12 / non-favorites: 48. Identifier mix: CN mobile (`13800138000`), Alipay email (`wang.fei@example.com`), WeChat ID (`wxid_*`). Display names mix Pinyin (Wang Lei, Zhang Wei, Sun Jian), CJK (`张伟`, `李娜`, `王芳`, `黄敏`, `何静`, `张敏`, `王伟`), and Latin. Some carry user-saved nicknames ("Mom", "Brother", "Yiwu supplier", "Guangzhou hostel", "Cousin", "Factory Liu", "Older brother", "Aunt", "Yiwu hostel", "Sister", "Restaurant", "Friend"); most do not. `transferCount` and `totalVolumeUzsTiyins` are stored as denormalized aggregates per recipient — mockTransfers' SENDERS pool only covers `u_01..u_05`, so derivation alone can't represent the long-tail spec. The detail-page Usage card's "Last 5 transfers" mini-list filters `TRANSFERS_FULL` by the canonical `(userId, destination, identifier)` tuple — for SENDER users this populates from real records; for the other 25 users the list shows an empty state (correct: those users have no transfer mock data today). Module-level audit-log store with one action type (`hard_delete`).
  - **Single source of truth refactor** — `mockUsers.ts` dropped its local `liveRecipients` array (lines 682-729 in the previous version), the `UserRecipientEntry` interface (now an alias of `RecipientEntry` re-exported from mockRecipients for back-compat with existing callers `UserRecipientsTab` and `HardDeleteRecipientDialog`). `getUserRecipients` is a thin re-export of `getRecipientsByUserId`. `hardDeleteRecipient(userId, recipientId, reason, actor)` is a wrapper that delegates to `recipientsHardDelete` AND writes a user-audit entry so the user-detail Audit tab continues to surface deletions. Cross-store sync is symmetric: deletions from the cross-user Recipients page also write to `mockUsers.userAudit` via this wrapper.
  - **Pattern layer** (`dashboard/src/components/recipients/`):
    - `types.ts` — `RecipientsFilters` shape (search · destinations multi · favoritesOnly toggle · lastUsedRange `DateRangeValue` + lastUsedNeverOnly toggle) + `applyRecipientsFilters` + `applyRecipientsSort` (3 keys: created · last-used · transfer-count). Default sort `created` DESC per spec.
    - `filterState.ts` — module-level cache for round-trip preservation (matches Cards / Users / Transfers filterState pattern).
    - `RecipientsFilterBar.tsx` — search Input (`bg-card h-10 shadow-sm`) + 3-chip row. Destination chip uses the canonical `<DestinationBadge>` primitive (Alipay blue · WeChat green dots). Last-used chip wraps the canonical `<DateRangePicker>` primitive with X-to-clear; opens with the shared `30d` default when filter inactive. Favorites-only is a toggle chip with a brand-tinted check.
    - `RecipientsTable.tsx` — desktop sortable table with 10 cols (destination · identifier mono · display-name · nickname · owner phone · favorite star · transfer-count right-aligned · last-used relative · created · kebab). Title Case headers + `text-sm font-medium text-muted-foreground` per LESSON 2026-05-02. Owner phone is a brand-tinted button linking to `/customers/users/:id`. Kebab actions: Open owner / Open transfers / Delete (danger-tinted).
    - `RecipientsMobileCardStack.tsx` — `<lg` card stack mirroring desktop signal density.
    - `RecipientActionBar.tsx` — fixed-bottom; mobile = full-width single button; desktop (`lg+`) = right-aligned single button. Position uses canonical `fixed inset-x-0 bottom-0 md:left-[var(--sidebar-width,4rem)]` (LESSON 2026-05-02). Page wrapper carries `pb-28`.
    - `cards/{DisplayInfoCard,OwnerCard,UsageCard}.tsx` — detail-page composables.
      - `DisplayInfoCard` — destination / identifier / display-name / nickname (`No nickname` italic placeholder when null).
      - `OwnerCard` — avatar(lg) + name + masked PINFL + phone + tier + status + "Open user profile →" CTA. Mirrors `CardOwnerCard` shape.
      - `UsageCard` — header with title + "View all {count} transfers" outline button (CTA navigates to `/operations/transfers?context=recipient&recipient_id=...`). 4 KPI tiles in a 2/4-col grid (transfer count · total volume · first-used · last-used). Last-5 mini-list rendered as desktop table + mobile list (responsive split mirroring `CardRecentActivityCard`). Empty-state copy "No transfer history available for this recipient."
    - `modals/HardDeleteRecipientDialog.tsx` — Dialog with destructive warning banner (red-tinted alert with the spec's exact warning text) + ≥20-char reason note (live char-count) → AlertDialog 2-step confirm. Per spec: no edit action exists.
  - **Pages** — `Recipients.tsx` (orchestrates list + search debounce + 50/page pagination + j/k/Enter/`/` hotkeys + CSV export + delete-from-list flow) + `RecipientDetail.tsx` (inline header / 2-col card-grid / full-width Usage / fixed action bar / b/Backspace/Del hotkeys; not-found state with inline error + retry CTA per spec).
  - **Routing** — `/customers/recipients` + `/customers/recipients/:id`. Back-compat redirects from `/recipients` + `/recipients/:id`. Removed `/recipients` from `PLACEHOLDER_ROUTES`. Sidebar entry repointed; `g+r` global hotkey + help-overlay shortcut text updated to the new path.
  - **Recipient-context filter on Transfers** — `Transfers.tsx` reads `?context=recipient&recipient_id=...` from search params and pre-filters `TRANSFERS_FULL` by `(userId, destination, identifier)` tuple before chip filters apply. Dismissible recipient-context banner appears above the filter bar (UserCircle icon + identifier + display name + Open recipient + Clear). Card-context and recipient-context are mutually exclusive (the URL only carries one `context=` param at a time). `TransferDetail.tsx` pager honors `context=recipient` (computes neighbors from recipient-scoped transfers) and the back-link returns to the recipient detail page (`/customers/recipients/:id`) so the reviewer lands on the same view they came from.
  - **i18n** — ~70 new `admin.recipients.*` keys (covers nav / subtitle / search / filter / table columns / row meta / empty / detail / hard-delete dialog / toasts) + 3 new `admin.transfers.context.*` keys (recipient-prefix, open-recipient) + 1 new `admin.transfer-detail.back-link.recipient` key.
  - **Hotkeys** — list-page (lg+ only): `j` next row · `k` prev row · `Enter` open focused · `/` focus search. Detail-page: `b` / `Backspace` back · `Del` open hard-delete confirm. HelpOverlay groups added: "Recipients" + "Recipient detail".
- **Files created**:
  - `dashboard/src/data/mockRecipients.ts`
  - `dashboard/src/pages/{Recipients,RecipientDetail}.tsx`
  - `dashboard/src/components/recipients/{types,filterState}.ts`
  - `dashboard/src/components/recipients/{RecipientsFilterBar,RecipientsTable,RecipientsMobileCardStack,RecipientActionBar}.tsx`
  - `dashboard/src/components/recipients/cards/{DisplayInfoCard,OwnerCard,UsageCard}.tsx`
  - `dashboard/src/components/recipients/modals/HardDeleteRecipientDialog.tsx`
- **Files modified**:
  - `dashboard/src/data/mockUsers.ts` — dropped local `liveRecipients` + duplicate `UserRecipientEntry` interface; re-exports `RecipientEntry` as `UserRecipientEntry`; `getUserRecipients` / `hardDeleteRecipient` are now wrappers around `mockRecipients`
  - `dashboard/src/router.tsx` — `/customers/recipients` + `/:id` routes, redirects from `/recipients` + `/recipients/:id`, dropped `/recipients` from `PLACEHOLDER_ROUTES`
  - `dashboard/src/components/layout/Sidebar.tsx` — Recipients nav `to` updated to `/customers/recipients`
  - `dashboard/src/hooks/useKeyboardShortcuts.ts` — `g+r` repointed to `/customers/recipients`
  - `dashboard/src/components/layout/HelpOverlay.tsx` — new "Recipients" + "Recipient detail" hotkey groups + g+r entry
  - `dashboard/src/lib/i18n.ts` — ~70 new `admin.recipients.*` keys + 3 transfers-context keys + 1 transfer-detail back-link key
  - `dashboard/src/pages/Transfers.tsx` — `?context=recipient&recipient_id=...` pre-filter + dismissible recipient-context banner above the filter chips
  - `dashboard/src/pages/TransferDetail.tsx` — pager honors `context=recipient` (computes neighbors from recipient-scoped transfers); back-link returns to `/customers/recipients/:id`; back-label "Back to recipient"
  - `ai_context/AI_CONTEXT.md` — current-phase rewrite (8 surfaces); Phase 8 entry; placeholder count 12 → 11; file-map extended with `recipients/` tree + `mockRecipients.ts`; workstreams flipped Recipients to ☑
  - `docs/product_states.md` — Recipients surface row flipped from ❌ Placeholder to ✅ Done; route updated `/recipients` → `/customers/recipients` (+ `/:id`)
  - `ai_context/HISTORY.md` — this entry
- **Docs updated**: `ai_context/AI_CONTEXT.md`, `ai_context/HISTORY.md`, `docs/product_states.md`. **No** schema / PRD / mermaid change — the existing `recipients` ER block in `docs/models.md` §4.1 (with `id` / `user_id` / `destination` / `identifier` / `display_name` / `nickname` / `is_favorite` / `last_used_at` / `created_at`) already covered every spec'd field exactly.
- **Open items**:
  - **`recipients.transfer_count` materialization** — backend can either materialize a counter on the row (denormalized for read efficiency) or compute it in-query from transfers. Mock stores a `transferCount` field for fast list-page rendering; the spec note that "the identifier is denormalized on the transfer row" implies derivation-by-tuple is the canonical approach. Decision pending backend signoff.
  - **`recipients.total_volume`** — same gap; mock stores `totalVolumeUzsTiyins` as denormalized aggregate.
  - **Visa / Mastercard relevance** — N/A. Recipients are Alipay/WeChat only by domain (destination instruments). Re-introduction of V/MC card rails won't affect this surface.
  - **CJK font fallback** — admin dashboard uses system fonts via Tailwind's default stack which covers CJK on macOS/Windows/Linux/iOS/Android out of the box. No explicit CJK font import needed today; if rendering issues emerge on niche systems we can add Noto Sans CJK SC as a fallback.

---

### 2026-05-02 — Admin Cards surface (Phase 7) + 3 dashboard-wide convention locks

- **Summary**: Built the Cards section at `/customers/cards` (list/search) + `/customers/cards/:id` (full-page detail). `mockCards.ts` is now the single source of truth for linked-card data — `mockUsers.ts` shed its local `liveCards` / `_ensurePlaceholderCards` / freeze/unfreeze and now consumes mockCards via thin re-exports + wrappers; `linkedCardsCount` is derived. The Cards detail page exercised three convention gaps that were locked in as project-wide rules during the build (table-header style across every table, detail-page-header consistency across User/Transfer/Card, fixed-bottom action-bar position via `--sidebar-width` CSS var). Force-expire was deliberately removed mid-build — admin-unilateral termination of a card conflicts with the user-only-unlinks policy already covered in the privacy banner; backend `expired` enum stays for natural acquirer-driven expiry only.
  - **Mock dataset (80 cards · 33 distinct owners)** — `dashboard/src/data/mockCards.ts`. Deterministic manual seed (no PRNG). Card IDs `c_01` / `c_02` / `c_03` / `c_04` / `c_05` / `c_ol_02` / `c_ma_02` / `c_sa_uz` / `c_az_h` / `c_be_h` are reused from `mockTransfers.ts` so a `?card_id=...` filter on the Transfers page resolves to the correct transfer history. Status mix exactly per spec: 73 active / 4 frozen (3 auto-frozen on user-block + 1 admin-frozen) / 2 expired (1 deleted-user historic + 1 active-user lifecycle) / 1 removed (deleted-user historic). Each card carries scheme + maskedPan + bank + holderName + issuerCountry + expiryMonth/Year + status + isDefault + token (acquirer-issued, NOT PAN) + lastUsedAt + createdAt + optional freezeReason / freezeSeverity. Module-level audit-log store with 4 action types (freeze / unfreeze / auto_freeze_user_blocked / copy_token).
  - **mockCards = single source of truth** — refactored `mockUsers.ts` to drop its own card array and helpers. `getUserCards(userId)` re-exports from `getCardsByUserId`. `freezeCard` / `unfreezeCard` are wrappers around `cardsFreezeCard` / `cardsUnfreezeCard` that also write to the user audit log (so the user-detail Audit tab still sees the action). `blockUser` invokes `freezeAllUserActiveCards` from mockCards as the side effect, returns the affected card IDs unchanged. `_seedToRow` computes `linkedCardsCount` from `getCardsByUserId(seed.id).length`. `UserCardsTab` updated to use `card.createdAt` (was `card.addedAt`); `CardActionDialog` types still reference `UserCardEntry` which is now an alias of `CardEntry`.
  - **Spec deviation (60 → 33 distinct owners)** — spec called for "60 distinct users" but the user pool is 50 and the partial-registration rule restricts cards to tier_2 users (plus a few tier_2-now-tier_1 historic exceptions). Realistic distinct-owner count: 33. Schema in `docs/models.md` unchanged. Status mix + total count match exactly.
  - **Pattern layer** (`dashboard/src/components/cards/`):
    - `types.ts` — `CardsFilters` shape with `lastUsedRange?: DateRangeValue` (uses canonical DateRangePicker semantics — today/yesterday/7d/30d/custom) + orthogonal `lastUsedNeverOnly` boolean toggle (since `lastUsedAt === null` isn't expressible as a range). `applyCardsFilters` + `applyCardsSort` (3 keys: created · last-used · expiry).
    - `filterState.ts` — module-level cache for round-trip preservation.
    - `CardsFilterBar.tsx` — search + 6 chips (scheme multi · status multi default `[active, frozen]` · bank searchable-multi · country multi · last-used `<DateRangePicker>` chip with X-to-clear · never-used toggle · default-only toggle). `LastUsedChip` wraps the canonical `<DateRangePicker>` primitive — opens with `30d` default when filter inactive.
    - `CardsTable.tsx` — desktop sortable table with 10 columns (Card / Bank / Holder / Country / Owner / Status / Default / Last used / Created / kebab). Frozen rows get `shadow-[inset_2px_0_0_theme(colors.warning.500)]`. Expired/removed rows opacity 60%. Owner phone is a brand-tinted button linking to `/customers/users/:id`. Default column shows a `bg-brand-600` 8px dot.
    - `CardsMobileCardStack.tsx` — `<lg` card stack mirroring the desktop signal density.
    - `CardActionBar.tsx` — fixed-bottom; mobile = 2-row grid (Freeze/Unfreeze + Copy token, Open transfers `col-span-2`); desktop = single flex row with spacer (Freeze on left / Copy + Open on right). Position uses `fixed inset-x-0 bottom-0 md:left-[var(--sidebar-width,4rem)]` — left edge tracks the live sidebar width via the AppShell CSS var.
    - `cards/{CardDetailsCard,CardOwnerCard,CardRecentActivityCard,PrivacyBanner}.tsx` — detail-page composables. `CardRecentActivityCard` has desktop-table + mobile-list responsive split, "View all {count} transfers" outline button in the card header, "Showing N of M transfers on this card" caption at the bottom.
    - `modals/{FreezeCardDialog,UnfreezeCardDialog}.tsx` — Freeze has 4-option severity dropdown (suspicious_activity / aml_flag / user_request / other) + ≥10 char reason. Unfreeze echoes the prior freeze reason inline.
  - **Pages** — `Cards.tsx` (list + 50/page pagination + j/k/Enter hotkeys + CSV export) + `CardDetail.tsx` (header + privacy banner + 2-col cards + activity card + action bar + 2 modals + b/Backspace/f/u/c hotkeys).
  - **Routing** — `/customers/cards` + `/customers/cards/:id`. Back-compat redirects from `/cards` + `/cards/:id`. Removed `/cards` from `PLACEHOLDER_ROUTES`. Sidebar entry repointed; `g+c` global hotkey + help-overlay shortcut text updated to the new path.
  - **Card-context filter on Transfers** — `Transfers.tsx` reads `?context=card&card_id=...` from search params and pre-filters `TRANSFERS_FULL` by `cardId` before the chip filters apply. Dismissible card-context banner appears above the filter bar (masked PAN + bank + Open card + Clear). `TransferDetail.tsx` pager honors `context=card` (computes neighbors from card-scoped transfers) and the back link returns to the cards list with the context preserved.
  - **Force-expire removed mid-build** — initially built per spec (button + dialog with 2-step confirm + mutator + audit-action enum + 11 i18n keys). User questioned why we needed it given Freeze + the no-admin-unlink policy already exists. Removed entirely: button, modal file, mutator, audit-action enum value, `forceExpiredReason` field on `CardEntry`, hotkey wiring, all 11 i18n keys. Backend `expired` enum stays for acquirer-driven natural expiry; no admin path leads there anymore.
  - **3 dashboard-wide convention locks** (LESSONS 2026-05-02):
    1. **Table column-header style** — Title Case + `text-sm font-medium text-muted-foreground` everywhere, no uppercase/tracking, no active-sort color differential. Active sort communicated by arrow icon only. Applied to `<TableHead>` shadcn primitive + every `SortableHeader` / custom `Th` button (Users / Cards / Transfers).
    2. **Detail-page header convention** — inline (NEVER `position: sticky`); structure is back-link / identity / chips. Back link is `<ArrowLeft h-4 w-4> Back to <list>`. i18n strings authored without the `← ` text prefix (which double-rendered alongside the icon component). Six back-link keys normalized; `UserHeader` swapped `ChevronLeft` → `ArrowLeft` for parity.
    3. **Action-bar fixed-bottom + `--sidebar-width` CSS var** — `AppShell.tsx` sets `--sidebar-width: ${collapsed ? 64 : 240}px` on the shell root; KYC / AML / Cards action bars + Transfer-detail mobile bar consume `md:left-[var(--sidebar-width,4rem)]`. Earlier hardcoded `md:left-16` is forbidden (only matched the collapsed sidebar; overlapped the expanded sidebar on `lg+`).
  - **Iteration trail** (user-correction-driven refinements during the build):
    1. Last-used filter — initially bucketed dropdown (lt-24h / lt-7d / lt-30d / gt-30d / never) → switched to canonical `<DateRangePicker>` chip + separate Never-used toggle.
    2. Table column header style — initially shadcn default (uppercase tracking-wider) with sortable-header active-state `text-foreground` differentiation → unified to Title Case `text-sm font-medium text-muted-foreground` everywhere; active state via arrow icon only.
    3. Header inconsistency — initially Cards Detail had a sticky `bg-card` band with negative-margin bleed → realigned to the inline back-link / identity / chips convention used by User / Transfer Detail.
    4. Back-link i18n inconsistency — three strings had `← ` text prefix that double-rendered alongside the icon; some strings omitted the "Back to" verb. Six strings normalized to `Back to <list>`.
    5. Action-bar position — first fixed (overlapping sidebar) → sticky inside main with negative-margin bleed (still affected by main padding) → fixed with `md:left-16` (only matched collapsed sidebar) → fixed with `md:left-[var(--sidebar-width,4rem)]` driven by AppShell CSS var (final).
    6. Action-bar layout — first 2-col grid all viewports → drop disabled "Remove" button (move policy to PrivacyBanner) → mobile 2-row grid, desktop single flex row with spacer (Freeze left, Copy + Open right).
    7. Force-expire removal — full implementation built then deliberately removed after policy review.
    8. Recent-activity layout — list-only → desktop table + mobile list (responsive split); count text + "View all" CTA swapped (count moved to bottom, CTA moved to header), CTA label includes total count.
- **Files created**:
  - `dashboard/src/data/mockCards.ts`
  - `dashboard/src/pages/{Cards,CardDetail}.tsx`
  - `dashboard/src/components/cards/{types,filterState}.ts`
  - `dashboard/src/components/cards/{CardsFilterBar,CardsTable,CardsMobileCardStack,CardActionBar}.tsx`
  - `dashboard/src/components/cards/cards/{CardDetailsCard,CardOwnerCard,CardRecentActivityCard,PrivacyBanner}.tsx`
  - `dashboard/src/components/cards/modals/{FreezeCardDialog,UnfreezeCardDialog}.tsx`
- **Files modified**:
  - `dashboard/src/data/mockUsers.ts` — dropped local `liveCards` / `_ensurePlaceholderCards`; re-export `UserCard*` types from mockCards; `freezeCard` / `unfreezeCard` are now wrappers; `blockUser` calls `freezeAllUserActiveCards`; `_seedToRow` derives `linkedCardsCount`
  - `dashboard/src/components/users/tabs/UserCardsTab.tsx` — `card.addedAt` → `card.createdAt`
  - `dashboard/src/components/ui/table.tsx` — `<TableHead>` style: `text-xs font-medium uppercase tracking-wider text-muted-foreground` → `text-sm font-medium text-muted-foreground`
  - `dashboard/src/components/users/UsersTable.tsx` — `SortableHeader` aligned to new convention (no active-sort color differential)
  - `dashboard/src/components/transfers/TransfersTable.tsx` — local `Th` + `SortHead` aligned
  - `dashboard/src/components/users/UserHeader.tsx` — `ChevronLeft` → `ArrowLeft`, icon `h-3.5` → `h-4`
  - `dashboard/src/components/layout/AppShell.tsx` — sets `--sidebar-width` CSS var on shell root based on collapsed state
  - `dashboard/src/components/kyc-queue/ActionBar.tsx`, `dashboard/src/components/aml-triage/ActionBar.tsx`, `dashboard/src/components/transfer-detail/MobileActionBar.tsx` — `md:left-16` / `left-0` → `md:left-[var(--sidebar-width,4rem)]`
  - `dashboard/src/router.tsx` — `/customers/cards` + `/:id` routes, redirects from `/cards` + `/cards/:id`, dropped `/cards` from `PLACEHOLDER_ROUTES`
  - `dashboard/src/components/layout/Sidebar.tsx` — Cards nav `to` updated to `/customers/cards`
  - `dashboard/src/hooks/useKeyboardShortcuts.ts` — `g+c` repointed to `/customers/cards`
  - `dashboard/src/components/layout/HelpOverlay.tsx` — new "Cards" + "Card detail" hotkey groups (j/k/Enter/`/`/b/Backspace/f/u/c)
  - `dashboard/src/lib/i18n.ts` — ~115 new `admin.cards.*` keys + `admin.transfers.context.*` (3 keys) + `admin.transfer-detail.back-link.card` + `admin.transfers.column.destination`. Six back-link strings normalized to drop `← ` text prefix. Force-expire / Remove keys (12 total) added then deleted.
  - `dashboard/src/pages/Transfers.tsx` — `?context=card&card_id=...` pre-filter + dismissible card-context banner above the filter chips
  - `dashboard/src/pages/TransferDetail.tsx` — pager honors `context=card`, back-link preserves card context, pager nav preserves all search params
  - `ai_context/LESSONS.md` — 3 new 2026-05-02 entries (table-header style, detail-page-header consistency, action-bar fixed-bottom + CSS var)
  - `ai_context/AI_CONTEXT.md` — current-phase rewrite (7 surfaces); 4 new "Decisions made" rows (table-header style, detail-page header convention, action-bar position via CSS var, table-column-header style); file-map extended with `cards/` tree + `mockCards.ts`; workstreams flipped Cards to ☑; placeholder-routes count 13 → 12
  - `docs/product_states.md` — Cards surface row flipped from ❌ Placeholder to ✅ Done; route updated `/cards` → `/customers/cards` (+ `/:id`); 3 new locked-foundation rows for the convention locks
  - `ai_context/HISTORY.md` — this entry
- **Docs updated**: `ai_context/AI_CONTEXT.md`, `ai_context/LESSONS.md`, `ai_context/HISTORY.md`, `docs/product_states.md`. **No** schema / PRD / mermaid change — every spec'd field already existed in `docs/models.md` (`linked_cards.scheme`, `status`, `is_default`, `bank_name`, `expiry_month` / `_year`, `created_at`).
- **Open items**:
  - **`linked_cards.token`** is mock-only — it's the acquirer-issued token referenced by the "Copy token" action. Backend `linked_cards` table doesn't currently model this column; gated on backend signoff before adding to `docs/models.md`.
  - **`linked_cards.last_used_at`** is mock-only — similar gap. Currently derivable from latest `transfers` row via the card; could either materialize as a column on `linked_cards` for read efficiency or compute in-query. Backend decision pending.
  - **Sidebar overlap on `lg+` user-collapsed state** — when a desktop user manually toggles the sidebar between collapsed (64px) and expanded (240px) the bar transitions smoothly via the CSS var. No regression observed; the var updates synchronously.
  - **Visa / Mastercard re-introduction** — still paused. The Cards surface has `SchemeLogo` / `CardScheme` / status-pill / column rendering ready for all 4 schemes; a single explicit user instruction is enough to re-enable mock data.

---

### 2026-05-01 — Admin Users surface (Phase 6) — list + full-page detail with MyID-gated transfer rule

- **Summary**: Built the Users section at `/customers/users` (list/search) + `/customers/users/:id` (full-page detail with 8 tabs). Phase 6 of the dashboard. List page has wide debounced search (300ms over name/phone/PINFL/email), 5-filter chip row (tier · status · KYC · Created range · Has open AML toggle), sortable desktop table (created · last-login · lifetime volume) with mobile card-stack fallback on `<lg`. Detail page is single-column full-bleed with avatar(xl) + name + masked PINFL on one row, contacts row (`tel:` + branded Telegram + WhatsApp pills + email) below, tier + status badges + admin kebab in the right group. 8 sticky tabs deep-linked via `?tab=...` query param. **MyID is wired as the hard gate for transfers** — `tier_0` / `tier_1` are both partial-registration states with `0 / 0` limits, and lifetime stats / monthly volume / status breakdown / today-month limit usage all derive from `TRANSFERS_FULL` so KPI / charts / recent activity / Transfers tab stay consistent. Iterated through several design polish rounds based on user feedback (sticky-condense header dropped, brand-pill contacts, underline-style tabs, derived lifetime stats, MyID profile card, partial-registration rule, PINFL nullability).
  - **Mock dataset (50 users)** — `dashboard/src/data/mockUsers.ts`. Deterministic manual seed (no PRNG). IDs `u_01..u_05` overlap with `mockTransfers.SENDERS` so the user-detail Transfers tab filters cleanly. Detailed demo profile is `u_03 = Sardor Tursunov` (tier_2, full hand-authored MyID payload). `u_05 Bekzod Nurmatov` was bumped from `tier_1` → `tier_2` in both `mockUsers` and `mockTransfers` to keep cross-store data honest (he's a sender on real transfer records). Mix: 31 tier_2 (active KYC), 11 tier_1 (10 partial-registration with `pinfl=null` / `cards=0` / `txCount=0` / `lifetimeUzs=0n`; 1 demoted-from-tier_2 with kyc=expired keeping historic stats and pinfl), 5 tier_0, 5 blocked, 3 deleted, 6 with `pinfl=null` for KYC never/failed/pending. Module-level audit-log store (`userAudit`) with 11 action types + cross-store sync to `mockAmlTriage.blockAmlUser()` on Block / soft-delete.
  - **MyID is the hard gate for transfers** — `_TIER_LIMITS_TIYINS` enforces `tier_0: 0/0` AND `tier_1: 0/0` (was 500M/2B). `LimitsCard` takes a `tier` prop instead of `tierIsZero` and renders distinct copy: tier_0 "User has just signed up — phone OTP and MyID verification both pending. Transfers cannot be initiated until MyID is complete." vs tier_1 "Phone verified but MyID not yet completed — partial registration. The user cannot send transfers until MyID identity verification passes." vs tier_2 actual progress bars.
  - **Lifetime stats are derived, not authored** — built `_transfersByUser` index from `TRANSFERS_FULL` at module load. `_seedToRow` overrides `lifetimeVolumeUzsTiyins` / `lifetimeTransferCount` from this index. `getUserMonthlyVolume` sums real `completed` transfers into 12 monthly buckets. `getUserStatusBreakdown` counts per status from real records. `getUserLimitUsage` sums today's / this-month's completed transfers for the daily/monthly used. Removed all hardcoded `userId === 'u_03'` special-case branches and the synthetic `seedNum * weight` distributions.
  - **PINFL nullability** — `users.pinfl` is `string | null` per `docs/models.md` §2.3 ("nullable until MyID"). 6 users in the seed (u_12, u_21, u_29, u_30, u_41, u_50) have `pinfl: null` because their KYC has never passed. UI hides the PINFL row entirely on the detail header + mobile card stack; desktop table shows italic "PINFL not yet verified" placeholder. `searchUsers`, `applyUsersFilters`, CSV export, and `getUserKycHistory` all handle null safely. KYC history doc-numbers are now synthesized from the user.id seed (kyc_verifications captures the submitted document regardless of MyID outcome).
  - **MyID profile card** — `MyIdResponse` typed shape (snake_case to match the API) added to `mockUsers.ts` with 5 sections: common_data / doc_data / contacts / address (permanent + temporary registration) / reuid + comparison_value + sdk_hash. `getUserMyIdResponse(userId)` returns null for unverified users; returns Sardor's hand-authored payload (Mirzo Ulug'bek IIB / Buz-2 mahalla / 96% match) for u_03; synthesizes a deterministic realistic payload for other passed-KYC users. `MyIdProfileCard` component renders 5 structured sections with masked PINFL + masked doc-number + tone-coded match-score badge (green ≥95% / amber ≥85% / red below) + collapsible raw JSON viewer with a `replacer` that masks `pinfl` and `pass_data` so the raw view never leaks unmasked values. Embedded in `UserKycTab` between current-tier card and history table.
  - **Pattern layer** (`dashboard/src/components/users/`):
    - `types.ts` — `UsersFilters` (no `languages` after the language filter was dropped), `applyUsersFilters` / `applyUsersSort` (3 sort keys: created · last-login · volume; both directions).
    - `filterState.ts` — module-level cache for round-trip.
    - `UsersFilterBar.tsx` — search Input with `bg-card h-10 shadow-sm` (distinct surface against page bg) + 5-chip row. ChipMulti / ChipSingle popover pattern mirrors AML/KYC filter bars (sticky header + Clear, brand-tinted active rows).
    - `UsersTable.tsx` — desktop table with 9 columns + kebab. Sortable headers via `SortableHeader` (created / last-login / volume). PINFL row shows italic "not yet verified" placeholder when null. `UserStatusBadge` is a local 4-tone wrapper for active/blocked/pending/deleted (the canonical `statusToTone` doesn't cover the user-status domain).
    - `UsersMobileCardStack.tsx` — `<lg` card stack; PINFL row hidden when null.
    - `UserAvatar.tsx` — initials-circle primitive (sm/md/lg/xl).
    - `UserHeader.tsx` — back link + top row (avatar + name + PINFL on one flex-wrap line) + contacts row (phone + Telegram pill + WhatsApp pill + email) + chips row (joined / last login / KYC expiry countdown <30d) + right group (tier badge + status badge + admin kebab; mobile keeps these inline so the kebab doesn't orphan).
    - `UserAdminMenu.tsx` — kebab dropdown with 7 admin actions (block / unblock / soft-delete / reverify-kyc / blacklist-phone / reset-devices / generate-audit-report). Renders block xor unblock based on current status.
    - `UserTabs.tsx` — bottom-underline tabs (`text-brand-700` + `border-brand-600` on active), strip has its own `border-b border-border` baseline, each tab uses `-mb-px` so the active underline punches the strip line cleanly. **Not sticky** (was sticky-with-condense, then sticky alone, both removed). AML count badge recolors based on active state.
  - **Cards** — `KpiTrio` (lifetime volume compact / lifetime tx count / success rate %), `LimitsCard` (tier-aware: warning banner for non-tier_2, progress bars for tier_2), `MonthlyVolumeChart` (recharts BarChart with empty-state fallback when total=0), `TransfersByStatusDonut` (recharts PieChart, uses `statusLabel(status, 'transfer')` for legend labels), `MyIdProfileCard` (full MyID payload).
  - **Tabs** — `UserOverviewTab` (KPI trio + 2 charts side-by-side + LimitsCard + 10-row recent activity feed linked to `/operations/transfers/:id?context=user&user_id=...` for pager scoping), `UserKycTab` (current tier + MyID profile + history table), `UserCardsTab` (2-col grid with Freeze/Unfreeze inline + tier-max card counter), `UserTransfersTab` (slim filtered table linking to transfer detail), `UserRecipientsTab` (saved Alipay/WeChat handles with hard-delete), `UserAmlTab` (filtered flag list linking to `/operations/aml-triage/:id`), `UserDevicesTab` (devices with Untrust action), `UserAuditTab` (user-audit-log entries with action labels + bigint-safe context replacer). Cards / Recipients / Devices tab tiles use `bg-card text-card-foreground shadow-sm` to match shadcn Card surface (was `bg-background` which blended into the page).
  - **Modals** (5 files, 10 logical actions):
    - `UserActionDialog` — handles 5 admin actions (block / unblock / soft-delete / reverify-kyc / reset-devices). ≥20-char reason note required. Soft-delete adds a 2-step Dialog → AlertDialog confirm. Danger-toned banner inside Block + Soft-delete bodies explaining side effects.
    - `GenerateAuditReportDialog` — date range (90d default) + reason + simulated 1.2s loading toast → "ready" toast (PDF generation stubbed).
    - `UntrustDeviceDialog` — single device, ≥20 char reason.
    - `CardActionDialog` — handles freeze + unfreeze via `mode` prop.
    - `HardDeleteRecipientDialog` — Dialog → AlertDialog 2-step confirm; hard-delete is permanent.
  - **State transitions enforced**:
    - **Block** → `users.status='blocked'`, freezes all linked active cards (side effect), cross-syncs to AML's `liveUsers` via `blockAmlUser`. Cards stay frozen on subsequent Unblock — admin must unfreeze each individually.
    - **Soft-delete** → `users.status='deleted'`, AlertDialog confirm step.
    - **Re-verify KYC** → audit-log entry only (notification flow is backend-side).
    - **Add phone to blacklist** → navigates to `/blacklist/new?type=phone&identifier=...&user_id=...` with pre-fill query params (the route is still Placeholder; will read params when blacklist surface is built).
    - **Reset device trust** → flips `is_trusted=false` on all user devices.
    - **Untrust device** / **Freeze card** / **Unfreeze card** / **Hard-delete recipient** — single-row mutators with audit entries.
  - **Pages** — `Users.tsx` (orchestrates list + search debounce + pagination + CSV export + `j/k/Enter` hotkeys on `lg+` + row-action funnel into the detail page) + `UserDetail.tsx` (orchestrates header + tabs + modal state + `1..8` tab hotkeys + `b` block + `e` audit; reacts to `?action=block|unblock` query param from list-page row-kebab funnel).
  - **Routing** — `/customers/users` (list) + `/customers/users/:id` (detail). Back-compat redirects from `/users` and `/users/:id`. Removed `/users` from `PLACEHOLDER_ROUTES`. Sidebar entry repointed; `g+u` global hotkey + help-overlay shortcut text updated to the new path.
  - **Telegram + WhatsApp branded pills** — replaced the muted square outline icons with circular brand-colored pills containing white filled SVG glyphs (paper plane for Telegram on `#229ED9`; chat bubble for WhatsApp on `#25D366`). Pills carry icon + label ("Telegram" / "WhatsApp") for clarity, brand-tinted focus rings, slight darken on hover.
  - **i18n.ts** — added ~280 new keys under `admin.users.*` covering filter labels (descriptive tier labels: "Tier 0 · Just signed up" / "Tier 1 · Phone OTP only" / "Tier 2 · MyID verified"), table columns, tabs, KPI tiles, limits-card bodies, all 10 modal dialogs, audit-log action labels, PINFL label + "not yet verified" placeholder, MyID profile card sections + fields. Also added 3 missing keys discovered during the project-wide audit (`admin.kyc-queue.detail.identity.doc-passport`, `admin.kyc-queue.detail.identity.doc-id-card`, `admin.aml-triage.row.reviewing-by`).
  - **Iteration trail** (user-correction-driven refinements):
    1. Sticky-condense header — initially built with IntersectionObserver sentinel + condensed sticky bar. Removed because it duplicated info already visible in the full header below.
    2. Telegram/WhatsApp buttons — outline squares → circular brand pills → brand pills with icon+label.
    3. Tabs strip — pill-fill style → bottom-underline with brand text → no longer sticky.
    4. Card tile surface — `bg-background` → `bg-card text-card-foreground shadow-sm` (matches shadcn Card).
    5. Search bar surface — default Input → `bg-card h-10 shadow-sm` (distinct surface).
    6. PINFL label — masked digits alone (looked like card number) → labelled "PINFL ••••••••••XXXX" → hidden entirely when null.
    7. Tier filter labels — "Tier 0/1/2" → descriptive "Tier X · Y" labels.
    8. Language filter + chip — initially included → removed (filter dropped from list, chip dropped from detail header).
    9. Lifetime stats — authored constants (Sardor 47 tx / 28.7M / 91% etc.) → derived from `TRANSFERS_FULL`. Resolves the "Transfers tab is empty while lifetime volume exists" inconsistency.
    10. tier_1 transfer-gating — initially had non-zero limits (500M/2B) and non-zero stats → reset to 0/0 limits + zero stats for partial-registration users (tier_1 + kyc≠passed). Per user rule: "if user does not verify MyID, no transfers".
    11. MyID profile card — added per user request to surface the full MyID response when KYC passes.
    12. Mobile kebab — was orphaning on its own line under tier+status badges → now inline with badges via `flex flex-wrap` on mobile.
    13. Header layout — avatar above name (mobile flex-col) → avatar always inline with name+pinfl on one row → contacts as sibling row below (not nested under name).
    14. Status donut legend — used missing `admin.transfers.filter.status.*` i18n keys → switched to canonical `statusLabel(status, 'transfer')` from `lib/utils.ts`.
- **Files created (~30)**:
  - `dashboard/src/data/mockUsers.ts`
  - `dashboard/src/pages/Users.tsx`, `dashboard/src/pages/UserDetail.tsx`
  - `dashboard/src/components/users/{types,filterState}.ts`
  - `dashboard/src/components/users/{UsersFilterBar,UsersTable,UsersMobileCardStack,UserAvatar,UserHeader,UserAdminMenu,UserTabs}.tsx`
  - `dashboard/src/components/users/cards/{KpiTrio,LimitsCard,MonthlyVolumeChart,TransfersByStatusDonut,MyIdProfileCard}.tsx`
  - `dashboard/src/components/users/tabs/{UserOverviewTab,UserKycTab,UserCardsTab,UserTransfersTab,UserRecipientsTab,UserAmlTab,UserDevicesTab,UserAuditTab}.tsx`
  - `dashboard/src/components/users/modals/{UserActionDialog,GenerateAuditReportDialog,UntrustDeviceDialog,CardActionDialog,HardDeleteRecipientDialog}.tsx`
- **Files modified**:
  - `dashboard/src/router.tsx` — `/customers/users` + `/:id` routes, redirects from `/users` + `/users/:id`, dropped `/users` from PLACEHOLDER_ROUTES
  - `dashboard/src/components/layout/Sidebar.tsx` — Users nav `to` updated to `/customers/users`
  - `dashboard/src/hooks/useKeyboardShortcuts.ts` — `g+u` repointed to `/customers/users`
  - `dashboard/src/components/layout/HelpOverlay.tsx` — new "Users" group with j/k/Enter/1..8/b/e
  - `dashboard/src/lib/i18n.ts` — ~280 new `admin.users.*` keys + 3 missing keys (kyc-queue passport/id-card labels, aml-triage reviewing-by) + new tier filter labels with descriptions + new tier-zero / tier-one limits-body copy
  - `dashboard/src/data/mockTransfers.ts` — u_03 + u_05 SENDERS bumped to tier_2 to keep cross-store data consistent with `mockUsers`
  - `.claude/commands/doc_sync.md` — added new step 3 triggering `docs/product_states.md` updates whenever a surface/foundation row flips status or a route/tech-stack decision changes
  - `ai_context/AI_CONTEXT.md` — current-phase rewrite (6 surfaces), expanded "Decisions made" with 9 new Users-related rows (route nesting, manual-flag-form deleted ref, tier_1 partial-registration rule, PINFL nullability, lifetime-stats derivation, MyID profile card, header layout, KYC tab structure, tabs strip, card tile surface, search bar surface, tier filter labels, language filter dropped), file-map extended with `users/` tree, workstreams flipped Users to ☑
  - `docs/product_states.md` — Users surface row updated with the deeper feature list (8 tabs, MyID profile card, derived lifetime stats, MyID-gated transfers)
  - `ai_context/HISTORY.md` — this entry
- **Docs updated**: `ai_context/AI_CONTEXT.md`, `ai_context/HISTORY.md`, `docs/product_states.md`. **No** schema / PRD / mermaid change — every spec'd field already existed in `docs/models.md` (`users.status` enum, `user_devices`, `recipients.is_favorite`, `user_limit_usage`).
- **Open items**:
  - The KYC tab's "Current tier" summary card duplicates a few fields with the new MyID profile card (doc type, masked doc number). User flagged this; awaiting decision between (A) slim the summary card to just tier badge + verified/expires + Re-verify, or (B) hoist the tier badge into the MyID card header. Currently kept as-is.
  - `/blacklist/new?type=phone&identifier=...&user_id=...` link from the admin menu is correct but the target route is still `Placeholder` until the Blacklist surface is built. Pre-fill query params will be honored when implemented.
  - Avatar initials shown in the inline-on-mobile header may overlap with name on very narrow viewports (<320px). Acceptable for v1.
  - The user-detail page's Cards tab synthesizes placeholder cards via `_ensurePlaceholderCards` for non-detailed users with non-zero `linkedCardsCount`. After the partial-registration rule, only tier_2 users have linked cards, so synthesized cards primarily render for tier_2 users without explicit entries (~25 of them).

---

### 2026-05-01 — Add `docs/product_states.md` build-progress snapshot

- **Summary**: Added a single-glance build-progress doc with two scopes (dashboard + mobile app), surface-level rows, and a 3-state legend (✅ Done / 🚧 In progress / ❌ Todo). Verified the dashboard placeholder list against [`router.tsx`](../dashboard/src/router.tsx) — it's **14** routes, not the "11" previously cited (`/stories`, `/news`, `/notifications` were missing from the count). Cross-referenced rules + state machines from each row so designers can jump from "what's left" → the canonical doc that constrains it.
  - **Dashboard section** — Foundation table (9 ✅ rows: tokens, type scale, shadcn primitives, ZhiPay primitives, app shell, mock data, master-detail pattern, action-bar pattern, deploy pipeline). Surfaces table (5 ✅ — Overview / Transfers / Transfer Detail / KYC Queue / AML Triage; 14 ❌ placeholders grouped Customers / Compliance / Finance / System / Content). Cross-cutting open-items table (2 ❌ + 1 🚧 + 1 ❌: brand assets, Visa/MC re-introduction, senior-role escalate wiring, bulk-reject/bulk-clear).
  - **Mobile section** — Foundation table (5 ❌ rows: tech-stack decision, mobile-first tokens, primitives/components/patterns, i18n seed, brand assets). Surfaces table (13 ❌ rows: onboarding, phone OTP, MyID, home, card linking, card management, send money, history, transfer detail, tier upgrade, notifications, settings, help). Each row links the constraining `.claude/rules/` file or `mermaid_schemas/` doc.
  - **AI_CONTEXT.md updates** — fixed "11 placeholder routes" → "14" in two places (current-phase paragraph + workstreams checklist; latter expanded with the explicit route list); added `product_states.md` to the file-map under `docs/`; added it to Quick links.
- **Files created**:
  - `docs/product_states.md`
- **Files modified**:
  - `ai_context/AI_CONTEXT.md` — 11→14 placeholder count (×2 spots), file-map row, Quick-links row
  - `ai_context/HISTORY.md` — this entry
- **Docs updated**: `docs/product_states.md` (new), `ai_context/AI_CONTEXT.md`, `ai_context/HISTORY.md`. **No** schema / PRD / mermaid change.
- **Key decisions**:
  - **Build-progress snapshot lives in `docs/`**, not `ai_context/`, because it's product-facing reference material, not orientation. Updated whenever a phase ships.
  - **Three-state legend** (✅ / 🚧 / ❌) — `🚧 In progress` reserved for partially-built items (e.g. senior-role escalate wiring is audit-log-only today). Strict ✅/❌ for fully-shipped vs not-started.
  - **Rows are surface-level** for dashboard (matches the "5 done + 14 placeholder" reality) and surface-level for mobile (since nothing is built, surface-level reads as a forward-looking screen list). No per-feature decomposition — that lives in the PRD.
- **Open items**: none.

---

### 2026-05-01 — Admin AML Triage page (master-detail) + cross-surface mobile-layout fix-up

- **Summary**: Built the AML Triage queue at `/operations/aml-triage` (+ `/:id` + `/new`) — Phase 5 of the dashboard. Master-detail (520px list + flex detail on `lg+`, single-pane stacked on mobile/tablet). Severity-driven prioritization with critical pinning. Flag-type-decorated detail (velocity / amount / pattern / sanctions / manual). Sanctions-only-escalate + critical-escalate-blocks-user compliance rules wired into UI and PRD §9.2. Manual-flag form is a separate full-page route, not a modal. **Also a cross-surface mobile-layout overhaul** that retroactively cleans up the KYC Queue too: action bar switched from `sticky bottom-0` (which stopped pinning under various wrapper-overflow strategies) to `position: fixed inset-x-0 bottom-0 md:left-16 lg:static`; detail body adds `pt-4 pb-28 lg:pb-4` to clear the fixed bar; row critical/selected indicator switched to inset box-shadow; JSON code viewers drop their internal scroll caps in favor of page scroll.
  - **Mock dataset (26 flags)** — `dashboard/src/data/mockAmlTriage.ts`. Status mix: 19 status=open (3 critical = 2 sanctions + 1 amount-anomaly · 12 warning · 4 info) + 7 status=reviewing (mix of severities, already assigned). Per-type structured `context` payloads — `VelocityContext` (window_minutes + transfer_count + threshold + recent_transfer_ids), `AmountContext` (amount_uzs + user_avg_uzs + std_dev_count + multiplier), `PatternContext` (rule_name + matched_signal + pattern_description), `SanctionsContext` (matched_list + matched_name + match_score + recipient_handle + recipient_destination), `ManualContext` (filer_admin_id + filer_admin_name + filer_note). User pool with lifetime stats (count + UZS volume) and mutable `users.status` so `blockAmlUser()` can flip a user to `'blocked'` for the critical-escalate side effect. Module-level audit-log store with 6 action types (claim / unclaim / reassign / clear / escalate / create_manual). `extraManualFlags` store so the manual-flag form's submissions appear on the next AmlTriage mount. Sanctions compliance template builder (`buildSanctionsEscalateTemplate`) used by the EscalateDialog.
  - **`reviewing` is derived UI** — same pattern as KYC Queue. `aml_flags.status` enum stays `open / reviewing / cleared / escalated` per [`models.md` §5.1](../docs/models.md#51-er-diagram). The header chip "X reviewing" computes from `status='reviewing'`. No state-machine change.
  - **Schema additions to `docs/models.md` §5.1** — added `aml_flags.context` (jsonb, "per-flag-type structured payload"), `aml_flags.clear_reason` (enum, populated on cleared status), and annotated `description` ("auto-generated reason") + `resolution_notes` ("captured on clear / escalate"). The KYC `kyc_verifications.assignee_id` gap is still open (PRD §12 q6).
  - **Compliance rules added to `docs/product_requirements_document.md` §9.2** — two new bullets: (1) sanctions hits **cannot be cleared** from the AML triage view, only escalated, with reviewer-facing UX hiding Clear and auto-filling a compliance template into Escalate; (2) escalating a **critical-severity** flag transitions the linked `users.status` to `'blocked'`. Lower severities escalate without blocking.
  - **Pattern layer** (`dashboard/src/components/aml-triage/`):
    - `types.ts` — `AmlFilters` shape (severities / types / statuses / assigned / hasTransfer), `applyFilters` + `applySort` helpers. `applySort` enforces critical-row pinning regardless of user-selected sort: critical rows always sort first by oldest-age within their bucket; non-critical rows then apply the user's sort choice (`severity-age` / `newest` / `oldest`).
    - `filterState.ts` — module-level cache for round-trip preservation (mirrors KYC + Transfers).
    - `AmlFilterBar.tsx` — inline chip row: severity (multi, default `warning+critical`) / type (multi) / status (multi, default `open+reviewing`) / assigned / has-linked-transfer toggle (custom button with Check icon when active, replacing the earlier color-only square). Multi-select popovers got a sticky header strip with the filter label + "Clear" link, brand-tinted active rows, internal scroll for long option lists. Single-select popover similarly polished with a Check icon on the active option.
    - `AmlRow.tsx` — 4-line list row: line 1 `[checkbox][shield-if-sanctions][severity badge][type chip] {push} [status badge]`, line 2 `phone · masked PINFL {push} age`, line 3 description (truncated to 80), line 4 (optional, when transfer or assignee present) `Tx prefix {push} Reviewing: <name>`. Critical rows get an inset box-shadow `shadow-[inset_2px_0_0_theme(colors.danger.600)]`, selected gets brand version. The kebab "⋮" menu was dropped — clicking the row already goes to detail and detail has every action.
    - `AmlListPane.tsx` — header (select-all + "N of M" count + sort DropdownMenu with `Check` icon on active option) + body + bulk-action sticky bar (X-first layout, Assign-to-me only). Empty / filtered-empty / error / 8-row loading skeleton. Sort lives in the list-pane header (same as KYC Queue) — was originally in the filter row but moved out for visual consistency.
    - `AmlDetailPane.tsx` — top bar (severity + type chip + flag-id mono + Copy + status + age) + scrollable body composing **SanctionsBanner** (top, when applicable) + UserCard + LinkedTransferCard + FlagContextCard + resolution-notes echo + Open-user-profile shortcut at the bottom + fixed-bottom ActionBar.
    - `ActionBar.tsx` — Clear (auto-blocked with tooltip on sanctions or terminal) · Escalate (destructive variant) · Assign to me (outline) · Reassign (outline). 2-col grid on mobile; flex-wrap row on `lg+`. ClearButton uses a `<span>` wrapper for the tooltip-on-disabled-button trick.
  - **Cards**:
    - `UserCard` — phone, masked PINFL, tier badge, account-status (highlighted danger when `'blocked'`), lifetime count + compact volume, joined date, BLOCKED chip when applicable, Open-user-profile button.
    - `LinkedTransferCard` — transfer summary (status, UZS→CNY amount, recipient with DestinationBadge, scheme + masked PAN), Open transfer link. Hard-deleted handling and "user-level flag, no linked transfer" empty state.
    - `FlagContextCard` — typed-decorated rendering per `flagType`:
      - `velocity` → headline + threshold + sparkline (red bar past threshold) + recent transfer-id chips
      - `amount` → headline + user-avg + multiplier + σ count
      - `pattern` → rule-name + matched-signal + why-this-matters description
      - `sanctions` → matched_list + matched_name + match_score + recipient_handle (red-toned header)
      - `manual` → filer_admin_name + filer_note (whitespace-pre-wrap)
      Plus a collapsible raw JSON viewer (`<pre><code>` with bigint-safe replacer + Copy).
    - `SanctionsBanner` (top of detail when sanctions) — red banner with title "Sanctions match — escalate only" + body about not communicating match details.
    - `CriticalBanner` (page-top when any open+critical+unassigned) — red banner with count + "Assign first to me" CTA that claims the oldest unassigned critical.
  - **Modals**:
    - `ClearDialog` — reason-code select (`false_positive` / `verified_legitimate` / `low_risk` / `other`) + ≥20 char notes textarea. Sanctions never reach this modal (Clear button disabled).
    - `EscalateDialog` — for sanctions, **auto-fills compliance template** (`Sanctions hit on watchlist [LIST]. Recipient handle [HANDLE] (...) matched [NAME] at score [SCORE]. Escalating to senior compliance per protocol. Source-of-funds documentation requested. Customer not to be informed of match details.`) into the textarea + validates that the reviewer added meaningful context (`<≥20 chars` and `template prefix unedited`+`<30 chars beyond template length` → invalid). For non-sanctions critical, surfaces a warning that the user account will be auto-blocked. Two-step flow: Dialog form → AlertDialog confirm with extra body for critical-block.
    - `ReassignDialog` — assignee `<select>` with admin pool + "Unassigned" option. Choosing Unassigned reverts `reviewing → open`.
  - **State transitions enforced**:
    - **Clear** → `cleared`, captures `resolutionNotes` + `clearReason` + `resolved_at`, auto-claims assignee for audit.
    - **Escalate** → `escalated`, captures `resolutionNotes` + `resolved_at`, auto-claims assignee. **Critical severity additionally calls `blockAmlUser(userId)` → `users.status='blocked'`**. Toast says "Flag escalated · user blocked" when blocked, otherwise just "Flag escalated".
    - **Assign to me** (claim) — sets `assigneeId` + transitions `open → reviewing`. Cleared/escalated stay terminal.
    - **Reassign** — updates `assigneeId`; "Unassigned" reverts `reviewing → open`.
  - **Bulk actions** — Assign to me only (Clear/Escalate inherently single-row in v1). The list pane's bulk-action sticky bar surfaces only when ≥1 row selected.
  - **Page-scoped hotkeys (6)** — `j/k` move focus + auto-select / `Enter` open / `c` Clear (gated by sanctions + terminal) / `e` Escalate (gated by terminal) / `m` Assign to me / `a` Reassign. Disabled on touch viewports (`max-width: 1023px`). Help overlay gets a new "AML Triage" group.
  - **Routing** — `/operations/aml-triage` (list/master-detail), `/operations/aml-triage/:id` (detail in master-detail or full-page on mobile), `/operations/aml-triage/new` (full-page manual-flag form). `/aml-triage` redirects to the nested form. Sidebar entry + `g+a` global shortcut updated.
  - **Manual flag full-page form** (`AmlTriageNew.tsx`) — typeahead user picker (search by phone or name with `<ul>` dropdown), optional transfer-id-prefix picker, severity radio (info / warning / critical with severity-tinted active state), type select, JSON context textarea (with parse validation on blur, falls back to `{}` if empty), filer note textarea (≥20 chars). Submit creates an `AmlReview` with `manual` context that mixes the filer info + user's parsed JSON, pushes into `extraManualFlags`, navigates to `/operations/aml-triage/:id` with the new id.
  - **Cross-surface mobile-layout overhaul** (also retroactively applied to KYC Queue):
    - **Action bar position** — was `sticky bottom-0` which stopped pinning under various overflow strategies the wrapper went through. Switched to `fixed inset-x-0 bottom-0 z-30 md:left-16 lg:static lg:left-auto lg:right-auto`. `position: fixed` escapes ancestor `overflow-hidden`. On `<md` (no sidebar) the bar spans full mobile width; on `md` to `<lg` (collapsed 64px sidebar) it offsets via `md:left-16`; on `lg+` it reverts to in-flow at the bottom of the detail pane.
    - **Action bar mobile layout** — `grid grid-cols-2 gap-2` on mobile so 4 buttons → 2 rows of equal-width. `lg:flex lg:flex-wrap lg:items-center` on desktop. Each button: `w-full lg:w-auto`. Disabled-button tooltip wrapper `<span>` got the same `w-full lg:w-auto` treatment.
    - **Detail-pane body padding** — `pt-4 pb-28 space-y-4 lg:pb-4` so the last card stays visible above the fixed bar (~112px reserved for the 2-row × 2-col bar + py-3 padding).
    - **Master-detail wrapper** — back to always-on `overflow-hidden` (was briefly `lg:overflow-hidden` and then `[clip-path:inset(0_round_0.5rem)]` during the iteration). With the action bar now `position: fixed`, the wrapper's `overflow-hidden` no longer breaks anything and properly clips the rounded corners on every viewport.
    - **Row indicator** — switched from `border-l-2 border-l-danger-600 -ml-[2px]` to `shadow-[inset_2px_0_0_theme(colors.danger.600)]` on critical rows and the brand equivalent on selected rows. The inset shadow draws inside the row's box, so `overflow-hidden` on the pane doesn't clip it. Applied to `KycRow` + `AmlRow`.
    - **JSON code viewers** — `<pre>` panels in `MyIdResponseCard` (KYC) + `FlagContextCard` (AML) dropped their `max-h-[*] overflow-y-auto` internal scroll caps; now use `overflow-x-auto overflow-y-hidden`. Long single lines still scroll horizontally; the page handles vertical scroll.
    - **Header buttons on mobile** — Refresh + New flag now 50/50-width row on `<md` (each `flex-1 md:flex-none`). AssigneeQuickToggle hidden on `<md` (still available via filter chip on the row below). On `<sm`, "New manual flag" label collapses to "New flag" to save more horizontal space.
    - **Filter dropdowns polish** — same treatment in both KYC + AML filter bars: wider `w-60` popovers (or `w-auto min-w-[14rem]` for single-select), sticky header strip with filter label + "Clear" link when active, brand-tinted active rows, `whitespace-nowrap` for long single-line options. Sort moved out of AML filter row into the list-pane header (consistent with KYC).
- **Files created (~17)**:
  - `dashboard/src/data/mockAmlTriage.ts`
  - `dashboard/src/pages/AmlTriage.tsx`, `dashboard/src/pages/AmlTriageNew.tsx`
  - `dashboard/src/components/aml-triage/{types,filterState}.ts`
  - `dashboard/src/components/aml-triage/{AmlFilterBar,AmlRow,AmlListPane,AmlDetailPane,ActionBar}.tsx`
  - `dashboard/src/components/aml-triage/cards/{UserCard,LinkedTransferCard,FlagContextCard,SanctionsBanner,CriticalBanner}.tsx`
  - `dashboard/src/components/aml-triage/modals/{ClearDialog,EscalateDialog,ReassignDialog}.tsx`
- **Files modified**:
  - `dashboard/src/router.tsx` — added `/operations/aml-triage` + `/:id` + `/new`; redirect from `/aml-triage`; removed `/aml-triage` from PLACEHOLDER_ROUTES
  - `dashboard/src/components/layout/Sidebar.tsx` — AML nav `to` updated to `/operations/aml-triage`
  - `dashboard/src/hooks/useKeyboardShortcuts.ts` — `g+a` → `/operations/aml-triage`
  - `dashboard/src/components/layout/HelpOverlay.tsx` — new "AML Triage" group with j/k/Enter/c/e/m/a
  - `dashboard/src/lib/i18n.ts` — ~70 new `admin.aml-triage.*` keys
  - `dashboard/src/components/kyc-queue/{ActionBar,KycDetailPane,KycListPane,KycRow,KycFilterBar,cards/MyIdResponseCard}.tsx` — cross-surface mobile-layout overhaul (see above)
  - `dashboard/src/pages/KycQueue.tsx` — wrapper `overflow-hidden` always-on; `lg:`-prefixed flex layout
  - `docs/models.md` — `aml_flags.context` + `aml_flags.clear_reason` added in §5.1, annotations on `description` + `resolution_notes`
  - `docs/product_requirements_document.md` — §9.2 added two compliance rules (sanctions-no-clear; critical-escalate-blocks-user)
  - `ai_context/AI_CONTEXT.md` — current phase rewrite (5 surfaces), 8 new "Decisions made" rows, file map extended with `aml-triage/` tree, AML triage workstream flipped to ☑, q7 added to Open questions
  - `ai_context/HISTORY.md` — this entry
- **Docs updated**: `docs/models.md`, `docs/product_requirements_document.md`, `ai_context/AI_CONTEXT.md`, `ai_context/HISTORY.md`. **No** `docs/mermaid_schemas/` change — AML state machine remains canonical 4 states (`open / reviewing / cleared / escalated`).
- **Key decisions**:
  - **AML routes — nested** (`/operations/aml-triage` + `/:id` + `/new`); `/aml-triage` redirects.
  - **Manual flag form is a separate full-page route**, not a modal — per spec.
  - **`reviewing` is derived UI** — consistent with KYC.
  - **Sanctions special handling** — Clear permanently disabled, Escalate auto-fills compliance template that reviewer must edit ≥30 chars beyond, SanctionsBanner reminds reviewer not to communicate match details.
  - **Critical-severity escalation auto-blocks the linked user** — `users.status='blocked'` side effect, EscalateDialog warns reviewer, AlertDialog confirms.
  - **Critical-row pinning is enforced regardless of sort** — even when reviewer flips to "newest first", critical rows pin to the top within their bucket.
  - **`aml_flags.context` jsonb shape is a per-type contract** — committed to `models.md` §5.1. Backend can emit jsonb when ready. Manual flags ship with freeform JSON in v1 (PRD q7 left open for typed-form vs freeform decision).
  - **`aml_flags.clear_reason` enum** — committed to `models.md` §5.1. UI captures via the ClearDialog reason-code select.
  - **Master-detail layout pattern is locked** — list pane (480px KYC / 520px AML) + flex detail pane on `lg+`, single-pane stacked on mobile/tablet via URL. Future review surfaces follow this template.
  - **Action-bar layout pattern is locked** — `fixed inset-x-0 bottom-0 z-30 md:left-16 lg:static lg:left-auto lg:right-auto` with `grid grid-cols-2` on mobile. `position: fixed` escapes any ancestor `overflow-hidden`/`clip-path`. Cross-applied to KYC + AML.
  - **Row indicators use inset box-shadow**, not negative margins. Cross-applied to KycRow + AmlRow.
  - **JSON code viewers drop internal scroll caps** — `overflow-x-auto overflow-y-hidden`, no `max-h-[*]`. Page handles vertical scroll.
- **Open items**:
  - Tablet (`md` to `<lg`) fixed action bar uses `md:left-16` to match the collapsed-sidebar width — exact match by design but should be visually verified on a real tablet viewport.
  - Bulk-action bar in list pane is still `sticky bottom-0` (not `fixed`) — pins to wrapper bottom on mobile, not viewport. Acceptable since bulk select on touch is rare.
  - Customer-area routes (`/users?focus=...`, `/cards/:id`) referenced from "Open user profile" / "Open transfer" still hit the catch-all Placeholder.
  - Manual-flag form's typeahead pickers are local-only (filtered against in-memory mock) — real backend would replace with paginated search.
  - Bulk reject for KYC and bulk clear/escalate for AML are deferred — single-row pattern covers the common path.
  - Senior-role wiring for AML escalate / KYC escalate is still a stub (audit-log entry only).

---

### 2026-05-01 — Admin KYC Review Queue (master-detail) + minimal UZ-ID-card placeholder

- **Summary**: Built the KYC Review Queue at `/operations/kyc-queue` (+ `/:id`) — Phase 4 of the dashboard. Master-detail layout: 480px list pane + flex detail pane on `lg+`, single-pane stacked on mobile/tablet via the URL (no overlay). Volume-processing oriented — reviewers move through pending verifications fast with `j/k/Enter/a/r/i/e/m`. Fixed page height (`100dvh − topbar − main padding`) keeps each pane scrolling independently and the action bar docked at the bottom of the right pane. Header matches Overview/Transfers (`text-2xl` + subtitle below + right-aligned actions group); filter bar is an inline chip row with no own `bg`/`border`. Master-detail body wrapped as a card (`rounded-lg border bg-background overflow-hidden`).
  - **Mock dataset (30 reviews)** — deterministic, manual seed (no PRNG): 27 pending (23 unassigned + 4 with assignee = derived "reviewing") + 2 passed (within last 24h, `verified_at`/`expires_at` populated) + 1 failed. Pending edge mix per spec: 22 clean / 2 `under_18` / 2 `data_mismatch` / 1 `sanctions_hit`. 3 rows have `submittedMinAgo > 12` so the soft auto-expire warning chip surfaces. Bilingual UZ names, 14-digit PINFLs, 9-char doc numbers (`AB1234567` passport / `IC4456778` id_card). Module-level audit-log store with append-only `KycAuditEntry` (action types include `claim` / `unclaim` / `approve` / `reject` / `request_info` / `escalate` / `reveal_face` / `hide_face` / `reveal_doc_number` / `hide_doc_number`) so all state-changing actions and sensitive-field reveals are captured for an eventual audit-log view.
  - **`reviewing` is derived UI** — the canonical KYC state machine ([`docs/mermaid_schemas/kyc_state_machine.md`](../docs/mermaid_schemas/kyc_state_machine.md)) stays at 4 states (`pending`/`passed`/`failed`/`expired`). Per [`status-machines.md`](../.claude/rules/status-machines.md) ("never invent states"), "X reviewing" header counts compute from `pending + assigneeId set`. StatusBadges always show the canonical 4.
  - **Schema gap flagged** — `kyc_verifications.assignee_id` is not in [`models.md` §2.4](../docs/models.md#24-field-reference--kyc_verifications). Modeled in mock only. Logged as PRD §12 q6 with related sub-question (stale-claim auto-release TTL?). Backend addition gated on that answer.
  - **`maskDocNumber` updated** in `dashboard/src/lib/utils.ts`: was `••••<last 4>`, now `<series 2>••••<last 3>` (e.g. `AB••••567`) — matches spec format. Used by KYC Queue + IdentityCard + DocumentImageCard. (Was previously only used in two places, both internal — safe to update.)
  - **Pattern layer** (`dashboard/src/components/kyc-queue/`):
    - `types.ts` — `KycFilters` shape, `applyFilters` / `applySort` helpers, age-bucket logic
    - `filterState.ts` — module-level cache for round-trip preservation (mirrors `transfers/filterState.ts`)
    - `KycFilterBar.tsx` — inline chip row: status (multi, default `pending`) / document-type / resulting-tier / age (`<1h` / `<24h` / `>24h` / `>7d`) / assigned (`anyone`/`me`/`unassigned`); `Clear all` link surfaces when any non-default filter is set; 6-skeleton-chip loading variant
    - `KycRow.tsx` — two-line row: `[checkbox][phone][status badge]` / `[tier badge][doc icon][doc-type masked-num][submitted-age]` + optional 3rd line for assignee + expiring-soon chip; selected = `bg-brand-50 + border-l-2 brand-600 -ml-[2px]`; Enter/click selects
    - `KycListPane.tsx` — sort header (newest/oldest dropdown) + select-all checkbox (supports `indeterminate`) + 8-row skeleton + EmptyState ("Queue is clear" with Auto-refreshing every 30s subtitle) + filtered-empty / ErrorState. Bulk-action sticky bar restructured to X-first layout: `[X icon-button][N selected][...spacer][Approve][Reject (danger-tinted outline)][Assign to me]`. (Earlier first attempt had X buried at the right in `ghost` mode — invisible — fixed by moving it left and using proper icon-button shape.)
    - `KycDetailPane.tsx` — top bar (phone + StatusBadge + Open user) + scrollable body composing 4 cards + sticky-bottom `ActionBar`. Outer is `flex flex-1 min-h-0 flex-col` so it composes correctly alongside the mobile back-bar (was `h-full` in the first cut — overflowed by ~40px on mobile and pushed the action bar past the viewport, hiding the MyID Response card behind it).
    - `ActionBar.tsx` — sticky bottom inside the right pane; 4 buttons (Approve / Reject / Request info / Escalate); Approve disabled with tooltip on `under_18` / `sanctions_hit` / non-pending; the disabled-state tooltip wraps the Button in a `<span tabIndex={0}>` so the tooltip still triggers
  - **Cards** (`dashboard/src/components/kyc-queue/cards/`):
    - `EdgeCaseBanners.tsx` — under_18 + sanctions_hit rendered as `tone="danger"`; data_mismatch + expiring-soon as `tone="warning"`; only renders banners that apply
    - `IdentityCard.tsx` — bilingual UZ/EN field grid with full name (from MyID), DOB + computed age, doc type, masked doc number, masked PINFL, MyID session id (mono + Copy w/ 1.2s success swap), submitted-at (relative + absolute on hover), verified-at + expires-at when passed, resulting tier badge, assignee
    - `DocumentImageCard.tsx` — **iterated twice**:
      1. First version was an elaborate UZ-ID-card mock with stylized flag stripe, golden-circle emblem, SVG guilloche security pattern, large diagonal "PLACEHOLDER" watermark, and full bilingual fields including signature line — too ornate (user feedback "now it looks weird")
      2. Final version is **minimal**: rounded surface w/ `bg-muted/30`, single title strip ("Identity card · Republic of Uzbekistan"), photo box on the left + 5-field bilingual grid on the right (Familiya/Surname, Ismi/Given name(s), Tug'ilgan sanasi/DOB, Card series or Passport series/Hujjat raqami, Shaxsiy raqami/ID number on a full-width row). Blur overlay over the photo until "Show face" toggles; blur chip over the masked PINFL until "Show document number" toggles. Both reveals append `reveal_face` / `reveal_doc_number` audit entries. Reset to hidden on review.id change so sensitive overlay state never carries across rows. SVG portrait silhouette renders behind the face blur. **No** flag stripe, **no** emblem, **no** guilloche, **no** watermark.
    - `MyIdResponseCard.tsx` — reuses `transfer-detail/cards/CollapsibleCard` (defaultOpen=false). When opened: leading note about redaction at the data layer, `RAW PAYLOAD` uppercase label + Copy button on a row, `<pre><code>` with the JSON payload (max-h-[420px] internal scroll). The mock payload pre-redacts PINFL (`pinfl_redacted: ••••••••••XXXX`) and document number (`number_redacted: ••••XXX`) so even the JSON viewer can't expose full values.
  - **Action modals** — `ApproveDialog` (AlertDialog only — no reason required, just the confirm), `RejectDialog` (failure-reason `<select>` (`document_unreadable` / `data_mismatch` / `under_18` / `sanctions_hit` / `other`) + reason textarea ≥10 chars; failure-reason is **prefilled** from `edgeFlag` so under_18 rows default to under_18 reason, sanctions_hit to sanctions_hit, data_mismatch to data_mismatch — saves clicks for the common path), `RequestInfoDialog` (message ≥10, increments `infoRequests` without status change), `EscalateDialog` (reason ≥10, audit-log only — senior-role wiring is deferred). All modals use the existing `transfer-detail/modals/Textarea` primitive for consistent visual treatment with the Transfer Detail surface.
  - **State transitions enforced** (per [`status-machines.md`](../.claude/rules/status-machines.md)):
    - **Approve** → `passed`, sets `verified_at = now`, `expires_at = now + 365d`, claims assignee = current admin, audit-log entry with `resulting_tier` context
    - **Reject** → `failed`, captures `failure_reason` + `failureNote` (the reason textarea), audit-log entry with `failureReason` and `reason` — **user tier untouched** per spec
    - **Request more info** → status stays `pending`, increments `infoRequests`, audit-log entry. No tier change, no assignee change.
    - **Escalate** → audit-log entry only (no state change). Senior-role wiring is deferred.
  - **Bulk actions** — Approve uses skip-with-explanation: iterates the selection, skips `under_18` and `sanctions_hit` rows, approves the rest, toast says "Approved 8 · skipped 2" with detail "1 under-18 · 1 sanctions-hit (review individually)"; blocked rows stay selected so the reviewer addresses them. Assign-to-me sets `assigneeId` + claims via audit. Bulk reject is deferred (toast directs reviewers to single-row reject) — single-row covers the common path.
  - **Page-scoped hotkeys** (8) — `j/k` move focus + auto-select (so detail stays in sync with focused row), `Enter` opens, `a/r/i/e` gated to pending status only (`a` also gated by `approveBlocked`), `m` toggles `assigned: 'me'` ↔ `'anyone'`. Help overlay gets a new "KYC Queue" group. Disabled on touch viewports (`(max-width: 1023px)`) per spec ("Hotkeys disabled on mobile"). Modal-typing context gates handled via tag check + contentEditable.
  - **Privacy** — full PINFL never displayed (`maskPinfl` last-4 only, including in `IdentityCard` PINFL row and the document scan's ID-number field). Full document number never displayed (`maskDocNumber` series + last-3). Document image starts blurred over face + numbers; reveals are explicit toggles, audit-logged. MyID JSON pre-redacts at the data layer. The `myidSessionId` mono value is the only freely copyable piece — that's a correlation id, not PII.
  - **Routing** — `/operations/kyc-queue` and `/operations/kyc-queue/:id` (KycQueue page handles both; URL `:id` selects a row on desktop, opens dedicated detail view on mobile). `/kyc-queue` redirects to the nested form. Sidebar entry updated; `g+k` global shortcut updated. TopBar breadcrumbs handle the parameterized route via the existing fallback.
- **Files created (~17)**:
  - `dashboard/src/data/mockKycQueue.ts`
  - `dashboard/src/pages/KycQueue.tsx`
  - `dashboard/src/components/kyc-queue/{types,filterState}.ts`
  - `dashboard/src/components/kyc-queue/{KycFilterBar,KycRow,KycListPane,KycDetailPane,ActionBar}.tsx`
  - `dashboard/src/components/kyc-queue/cards/{EdgeCaseBanners,IdentityCard,DocumentImageCard,MyIdResponseCard}.tsx`
  - `dashboard/src/components/kyc-queue/modals/{ApproveDialog,RejectDialog,RequestInfoDialog,EscalateDialog}.tsx`
- **Files modified**:
  - `dashboard/src/router.tsx` — added `/operations/kyc-queue` + `/:id` routes; redirect from `/kyc-queue`; removed `/kyc-queue` from PLACEHOLDER_ROUTES
  - `dashboard/src/components/layout/Sidebar.tsx` — KYC nav `to` updated to `/operations/kyc-queue`
  - `dashboard/src/hooks/useKeyboardShortcuts.ts` — `g+k` → `/operations/kyc-queue`
  - `dashboard/src/components/layout/HelpOverlay.tsx` — new "KYC Queue" group with j/k/Enter/a/r/i/e/m
  - `dashboard/src/lib/i18n.ts` — ~75 new `admin.kyc-queue.*` keys (filters, sort, row, bulk, detail cards, edge-case banners, action modals, mobile, shortcuts group)
  - `dashboard/src/lib/utils.ts` — `maskDocNumber` reformatted to `<series>••••<last 3>` (was `••••<last 4>`)
  - `ai_context/AI_CONTEXT.md` — Current phase, Decisions made (4 new rows), File map, Active workstreams, Open questions
  - `docs/product_requirements_document.md` — §12 Open questions q6 (KYC admin claim semantics + assignee_id schema gap)
  - `ai_context/HISTORY.md` — this entry
- **Files created**: see list above.
- **Docs updated**: `ai_context/AI_CONTEXT.md`, `ai_context/HISTORY.md`, `docs/product_requirements_document.md`. **No** `docs/models.md` change — schema, KYC tiers, status enum, error codes are unchanged. **No** `docs/mermaid_schemas/` change — KYC state machine stays at 4 states. The `assignee_id` gap is logged as a PRD open question rather than speculatively committed to the canonical schema.
- **Key decisions**:
  - **Master-detail layout, not overlay** — 480px list pane + flex detail pane on `lg+`, route-driven single-pane on mobile/tablet. Fixed page height + internal-scroll panes.
  - **`reviewing` is derived UI** — never invented as a status. Header chip computes from `pending + assigneeId set`. Per `status-machines.md` rule.
  - **`assignee_id` schema gap left as PRD open question** — not committed speculatively to `docs/models.md`. Resolution unblocks backend.
  - **Document scan placeholder is minimalistic** — clean surface + 5 bilingual fields + blur overlays. Stripped flag / emblem / guilloche / watermark / signature after first iteration looked "weird" per user feedback.
  - **Header design matches Overview/Transfers** — `text-2xl` heading + subtitle line below + right-aligned action group. First cut had a filled `bg-card` toolbar (text-xl + inline counts) — corrected to align with the rest of the dashboard.
  - **Approve auto-block rules** — `under_18` and `sanctions_hit` are HARD blocks (Approve disabled with tooltip + bulk-approve skips them). `data_mismatch` is a SOFT warning (reviewer can still approve after careful look).
  - **`infoRequests` increments without status change** — Request more info is the only action that doesn't move the row out of `pending`. Counter visible on the detail page so other reviewers see how many times the user has been asked.
  - **Mobile back-bar fix** — `KycDetailPane` outer changed from `h-full` to `flex-1 min-h-0` so it shares vertical space correctly with `MobileBackBar` (was overflowing by ~40px on mobile, pushing the action bar past the visible viewport).
  - **`maskDocNumber` reformatted** — now preserves the 2-char series prefix (`AB••••567`). Was `••••XXXX` previously — only used in this build's KYC Queue files, safe rename.
- **Open items**: assignee_id schema decision (PRD §12 q6); bulk-reject single-row pattern (deferred); senior-role wiring for Escalate (deferred); auto-expire `pending → expired` actual transition (UI shows the warning chip; the 15-min flip is a backend job not simulated in mock); customer-area routes (`/users?focus=...`) referenced from "Open user profile" still hit the catch-all Placeholder.

---

### 2026-05-01 — GitHub Pages deployment (HashRouter + Actions workflow)

- **Summary**: Wired the dashboard prototype up to GitHub Pages so the demo URL is shareable. Uses `HashRouter` (selected over BrowserRouter + 404.html SPA-redirect shim — simpler, zero deploy infrastructure), Vite `base: '/zhi-pay/'` applied only at build-time so local dev keeps serving at `/`, and a `actions/deploy-pages@v4`-based workflow that auto-deploys on every push to `main`. CI also runs `tsc --noEmit` before `vite build` so TS errors fail the deploy fast.
- **Files modified**:
  - `dashboard/vite.config.ts` — `defineConfig` switched to function form keyed off `command`; build emits assets at `/zhi-pay/`, dev unchanged at `/`
  - `dashboard/src/App.tsx` — `BrowserRouter` → `HashRouter`
  - `ai_context/AI_CONTEXT.md` — two new "Decisions made" rows (Router type, Deployment), file map gains `.github/workflows/`
  - `ai_context/HISTORY.md` — this entry
- **Files created**:
  - `.github/workflows/deploy.yml` — Node 20, `npm ci` in `dashboard/`, `tsc --noEmit`, `npm run build`, `actions/upload-pages-artifact` on `dashboard/dist`, `actions/deploy-pages` to publish. Triggers on push to `main` and manual `workflow_dispatch`.
- **Docs updated**: `ai_context/AI_CONTEXT.md`, `ai_context/HISTORY.md`. No `docs/models.md` / PRD / `mermaid_schemas/` changes.
- **Key decisions**:
  - **HashRouter for now** — GH Pages can't serve SPAs cleanly without a 404.html redirect script. HashRouter sidesteps that with no infrastructure cost. Hash URLs (`/#/operations/transfers/t_01`) are slightly less polished but fully functional, shareable, and reload-correct.
  - **Vite `base` is build-only** — `command === 'build' ? '/zhi-pay/' : '/'`. Local `npm run dev` keeps working at `http://localhost:5173/` exactly as before; only production builds embed the project-pages prefix.
  - **CI gate on type errors** — `tsc --noEmit` runs before `vite build` in the workflow. Any TS regression blocks the deploy.
- **Open items**: User must enable GitHub Pages with "GitHub Actions" as the source at https://github.com/SardorAllaberganov/zhi-pay/settings/pages (one-time, can't be done via CLI). After that, every push to `main` ships in ~1-2 min. Live URL: https://sardorallaberganov.github.io/zhi-pay/.

---

### 2026-05-01 — Transfer Detail polish rounds (FX, StatusTimeline, More dropdown, header buttons, 11px ban)

- **Summary**: Two correction passes after the initial Transfer Detail build, both same-day. Visual / interaction issues spotted by the user on real-device review.
  - **FX & fees card** — removed the 24h recharts mini chart entirely (user direction). Inner `space-y-4` → `space-y-3`. Recharts imports + chart-related i18n keys removed. The rate-popover line is now the last element in the card.
  - **FX vs status-timeline alignment** — discovered the left-column `space-y-4` was applying a phantom 16px top margin to the FX card on `lg+` because the tablet-only timeline div above it (`<div class="lg:hidden">`) is `display: none` on desktop but still counts as the "first child" for Tailwind's `> * + *` selector. Switched the left column to `flex flex-col gap-4` so `gap` spaces only between visible items. FX top now aligns with the right-rail status timeline.
  - **StatusTimeline rewrite** — flex layout w/ marker column (circle + line in same column, auto-centered). Lines render only **between** consecutive events (no overflow above first or below last). Past-to-past = solid `bg-border` 1px line; line from the current event to a theoretical-next marker = dashed `border-l border-dashed`. For non-terminal currents (`created`, `processing`) we append a hollow theoretical-next circle so the dashed line has somewhere to terminate; terminal states end with the last solid circle and no trailing line.
  - **More dropdown removed** — first attempt restyled the dropdown menu items as button rows; user pushed back ("the dropdown appearing buttons is not good view"). Replaced with a vertical stack of outline buttons under the primary action — full width, h-10, leading icon, left-aligned label. Destructive secondaries (Reverse / Refund) get a danger-bordered outline that fills `bg-danger-50` on hover. Disabled secondaries still get the explanation tooltip via wrapping `<span>`.
  - **Header buttons** — "Open user" and "Open in audit log" converted from underlined text-with-arrow links to proper `<Button variant="outline">` with leading icons (User, FileText), `gap-2`, default size. Now h-9 with text-sm.
  - **CardUsedCard** — `MaskedPan` was rendering its own embedded `SchemeLogo` while CardUsedCard already showed a standalone `SchemeLogo size="md"` to the left of it. Passed `hideScheme` on the MaskedPan to drop the duplicate logo.
  - **Provider response card iterations (3 rounds)**:
    1. Toggle was a small "▸ Raw response" text-link that user couldn't find. Replaced with a clear outline button "Show raw response ▼" + Copy button, JSON code panel `<pre><code>` opens below.
    2. User direction: the toggle should be inline with text, space-between. Reworked to `RAW RESPONSE` uppercase label on left + Show button on right with `justify-between`.
    3. Final direction: the accordion title (chevron + "Provider response") should be the **only** toggle. Removed the secondary Show/Hide button entirely. Also removed the `collapsedSummary` (was rendering `WX-… · wechat · Last webhook` text under the title when collapsed) so the card matches FxFeesCard behavior — only the title row is visible when collapsed. When the accordion opens, the JSON code panel always renders below the webhook events with a header bar (`RAW RESPONSE` label + Copy button) and a `<pre><code>` body.
  - **Sub-13px ban tightened (LESSON)** — initial fix replaced 4 `text-[10px]` violations with `text-xs`. User pushed back with examples of `text-xs` flowing-meta lines (`35 transfers · 133,186,000.00 UZS lifetime`, `· Apr 29, 2026 at 3:26 PM`) saying these still look 11px. Root cause: `text-xs` is technically 13px in our scale but reads as too-small for flowing text against muted-foreground at typical density. Plus shadcn's stock `Button` primitive baked `text-xs` into `size="sm"` — that carve-out was the source of half the regressions. **Edited `Button.tsx`** to drop `text-xs` from the `sm` variant; now all button sizes inherit base `text-sm` (14px). Audited all `text-xs` uses on the detail-page surface and bumped flowing meta to `text-sm`: SenderCard lifetime stats; InternalNotesCard author role + relative time; AdminActionHistoryCard relative time; FxFeesCard rate-popover ID value; ProviderResponseCard external_tx_id + webhook event type + webhook relative time + the custom-sized `h-7 text-xs` Copy JSON button (now standard `size="sm"`); MobileActionBar relative time + disabled-action reason; character counters in 6 modals; RefundRecipientPicker bank field labels and "(none on file)" hint. `text-xs` (13px) is RESERVED only for chips/badges, count badges in `h-5 w-5+` circles, `<kbd>`, uppercase+tracking-wider section labels, avatar fallback initials, tooltip body, position chip "12 of 47" in the header.
  - **LESSONS updated** — new 2026-05-01 entry: "Buttons and flowing-text spans must be ≥ `text-sm` (14px) — never `text-xs`". Older 2026-04-29 typography LESSON amended in-place to remove the `size="sm"` carve-out that was the root of the regressions. Grep verifications shipped: `text-\[1[0-2]px\]|fontSize:\s*1[0-2]\b` returns 0 hits.
- **Files modified**:
  - `dashboard/src/components/ui/button.tsx` — `sm` variant drops `text-xs`
  - `dashboard/src/components/zhipay/StatusTimeline.tsx` — full rewrite
  - `dashboard/src/components/transfer-detail/RightRail.tsx` — More dropdown removed, secondary stack
  - `dashboard/src/components/transfer-detail/cards/FxFeesCard.tsx` — chart removed, spacing tightened
  - `dashboard/src/components/transfer-detail/cards/CardUsedCard.tsx` — MaskedPan `hideScheme`
  - `dashboard/src/components/transfer-detail/cards/ProviderResponseCard.tsx` — 3-round redesign; collapsedSummary + nested toggle removed; JSON code panel always shown when card is open
  - `dashboard/src/components/transfer-detail/cards/{SenderCard,InternalNotesCard,AdminActionHistoryCard}.tsx` — flowing-meta `text-xs` → `text-sm`
  - `dashboard/src/components/transfer-detail/MobileActionBar.tsx` — flowing-meta + disabled-reason `text-xs` → `text-sm`
  - `dashboard/src/components/transfer-detail/modals/{AddNoteDialog,ResendWebhookDialog,ForceFailDialog,MarkCompletedDialog,ReverseDialog,RefundPartialDialog,RefundRecipientPicker}.tsx` — character counters / form sub-labels `text-xs` → `text-sm`
  - `dashboard/src/pages/TransferDetail.tsx` — left col `space-y-4` → `flex flex-col gap-4`; header Open-user + Open-audit converted to outline buttons with icons (User, FileText); `space-y-4 lg:space-y-6` reduced to `space-y-4` and `gap-4 lg:gap-6` reduced to `gap-4` (uniform 16px page rhythm)
  - `ai_context/LESSONS.md` — new 2026-05-01 LESSON, 2026-04-29 LESSON amended (button-sm carve-out retired)
  - `ai_context/AI_CONTEXT.md` — typography decision tightened, phase description updated to drop chart + More dropdown mentions, file-map kept current
  - `ai_context/HISTORY.md` — this entry
- **Files created**: none beyond what the initial detail-page build entry already records.
- **Docs updated**: `ai_context/AI_CONTEXT.md`, `ai_context/HISTORY.md`, `ai_context/LESSONS.md`. No `docs/models.md` / PRD / `mermaid_schemas/` changes.
- **Key decisions**:
  - **Provider Response card matches FX accordion behavior** — single toggle (the title row), no collapsed-summary line, no nested Show/Hide button. JSON code panel is always rendered when the accordion is open.
  - **24h FX chart cut** — user direction; the rate-source popover is sufficient context.
  - **No More dropdown anywhere on the detail page** — all secondary actions visible as stacked outline buttons. Adds vertical space when there are 2-3 secondaries but never more. Worth the discoverability win.
  - **`text-xs` is forbidden in buttons of any size and in flowing-meta spans** — firmer than the 2026-04-29 LESSON which carved out `size="sm"`. Shadcn's `Button` primitive patched accordingly.
  - **Tablet inline timeline preview** — kept on tablet (768-1023px) but the left-column wrapper switched to `flex flex-col gap-4` so it doesn't push desktop layout down by 16px.
- **Open items**: real Alipay/WeChat marks; UzCard/Humo logos; ZhiPay wordmark; customer-area routes (`/customers/users/:id`, `/customers/cards/:id`, `/customers/recipients`); audit-log query-driven view; AML triage detail. Saved filters reset on full reload (no localStorage). The 24h FX chart is gone from the detail page — if it returns, it should likely live in `/fx-config` rather than per-transfer.

---

### 2026-05-01 — Transfer Detail (forensic) + list-page polish (Export-in-header, 600ms skeletons, search w-64 reverted)

- **Summary**: Two parallel pieces shipped together.
  - **List-page polish** (option (a) from the diff comparison): Export CSV moved from filter-bar Row 1 right side back to the **page header** (kept the green Excel/CSV affordance per prior 2026-05-01 user direction). Search input width — first changed to `w-64` per spec, then **rolled back to `flex-1 min-w-0 max-w-[700px]`** at user direction ("too small now"). Initial-mount **loading skeletons** added (600ms): 8 rounded-pill skeleton chips on Row 2, label + 3 pill skeletons on Row 3, 10 skeleton table rows on desktop / 10 skeleton stacked cards on mobile. Keyboard `f` and `/` split — `/` focuses the search input, `f` focuses the first chip in the filter bar (Sheet trigger on mobile). Sticky `<thead>` deliberately not applied (LESSON 2026-04-30).
  - **Transfer Detail page** — full forensic-grade rebuild of `/operations/transfers/:id`. **Page header is non-sticky** per direct user instruction ("no sticky headers"); the spec's collapsed-on-scroll behavior is therefore dropped. Right-rail (timeline + ActionMenu) and mobile bottom action bar **kept sticky** because they're contextual control rails, not headers. New layout: Zone 1 page header (back + pager / status + 12-char copy-able id + relative time / amounts UZS→CNY at text-3xl + locked rate + total fees), Zone 2 12-col body (`lg:col-span-8` left + `lg:col-span-4` right rail; tablet collapses to single column with timeline pinned just below the headline; mobile single column), Zone 3 mobile sticky-bottom action bar. 8 left-column cards: **FxFeesCard** (tabular breakdown + 1 CNY=N UZS row with click-popover showing fx_rates row + 24h recharts line with vertical reference line at lock time), **SenderCard** (avatar + masked PINFL + tier + lifetime stats; `senderDeleted` fallback), **RecipientCard** (DestinationBadge + display name + saved badge + nth-transfer stat; `recipientDeleted` fallback), **CardUsedCard** (SchemeLogo + MaskedPan + bank + holder + status; `cardRemoved` fallback), **AmlFlagsCard** (only renders when flags exist; sanctions banner if any sanctions match), **InternalNotesCard** (list newest-first + Add note button + per-note tag tone), **ProviderResponseCard** (collapsible, auto-opens on `failed`; webhook events sequence + raw JSON `<pre>` with Copy button), **AdminActionHistoryCard** (last 5 with truncated reason expand-on-click + View full audit trail link). Right rail: **StatusTimeline** (foundation primitive) + **ActionMenu** (primary + "More" dropdown computed per status: created→AddNote primary; processing<5min→AddNote primary; processing≥5min→ForceFail primary with "Stuck for Xm" chip; completed→AddNote primary, Reverse/Refund in More; failed retryable→ResendWebhook primary; failed non-retryable→AddNote primary, ResendWebhook disabled with tooltip; reversed→AddNote terminal). Mobile bottom bar (lighter-pattern per Q2): persistent 64px bar with Status + relative time on left, Timeline / Primary / More buttons on right; Timeline & More open Radix Sheets (sidesteps custom drag-handle code). 6 action modals — **AddNoteDialog** (Dialog 480, body 5-1000 chars + tag select), **ResendWebhookDialog** (AlertDialog, reason ≥10 + notify-user toggle default off), **ForceFailDialog** (Dialog 480, non-retryable failure-code select + reason ≥30 + notify-user toggle default on; AlertDialog confirm), **MarkCompletedDialog** (Dialog 520, provider tx ID + reason ≥50 + acknowledge checkbox; AlertDialog confirm; styled destructive even though "completion"), **ReverseDialog** (Dialog 520 scrollable, reason ≥50 + RefundRecipientPicker {original / alternate card / external bank}; notify-user **locked ON** with tooltip per compliance; AlertDialog confirm), **RefundPartialDialog** (Dialog 520, amount input + reason ≥30 + recipient picker + live preview; notify-user **locked ON**; status stays completed; AlertDialog confirm). State-machine validation enforced via `computeActionPlan` — irrelevant actions hidden, ResendWebhook on non-retryable failures shown disabled with reason tooltip. **Real-time refresh** simulation: `setInterval(10_000)` for `processing` transfers, 25% chance per tick to advance to `completed`, appending a synthetic `transfer_event` and toasting "Status updated: processing → completed". **Pager** (`j`/`k`): reads `filterState.ts` cached sorted list to compute neighbors; scopes to user's transfers when URL has `?context=user&user_id=...`; disabled with tooltip when no list context (`?context=aml` or direct URL). **Loading**: 600ms initial mount skeleton + on every `id` change (so pager nav re-skeletons). **404 state**: Inbox icon + "Transfer not found" + "Maybe it was hard-deleted" + "Back to transfers" CTA. **Linked-entity edge cases**: 3 deterministic transfers in the dataset are flagged `senderDeleted` / `cardRemoved` / `recipientDeleted` so the fallbacks render with real data. **Mock data extensions**: notes for ~10 transfers (one stuck-processing has 2 notes), provider response with webhook event sequence per transfer with externalTxId, admin action history per reversed transfer + per-noted transfer, user lifetime stats + recipient transfer counts. **11 page-scoped keyboard shortcuts**: `j`/`k` pager, `n` add note, `r` reverse (completed only), `f` force fail (created/processing only), `m` mark completed (processing only), `w` resend webhook (processing/failed only), `c` copy id, `u` open user, `b`/Backspace back. Help overlay gets a "Transfer detail" group listing all of these.
- **Files created (Transfer Detail)**:
  - `dashboard/src/data/mockTransferDetail.ts` (types + edge-case sets + notes/provider/audit/lifetime/recipient builders + `getTransferDetail` / `getStuckMs` / `computeNeighbors` helpers)
  - `dashboard/src/components/transfer-detail/{ActionMenu,RightRail,MobileActionBar}.tsx`
  - `dashboard/src/components/transfer-detail/cards/{CollapsibleCard,FxFeesCard,SenderCard,RecipientCard,CardUsedCard,AmlFlagsCard,InternalNotesCard,ProviderResponseCard,AdminActionHistoryCard}.tsx` (9 files)
  - `dashboard/src/components/transfer-detail/modals/{Textarea,RefundRecipientPicker,AddNoteDialog,ResendWebhookDialog,ForceFailDialog,MarkCompletedDialog,ReverseDialog,RefundPartialDialog}.tsx` (8 files)
- **Files modified**:
  - `dashboard/src/pages/TransferDetail.tsx` — complete rewrite (~660 lines)
  - `dashboard/src/lib/i18n.ts` — ~85 new `admin.transfer-detail.*` keys
  - `dashboard/src/components/layout/HelpOverlay.tsx` — new "Transfer detail" group
  - `dashboard/src/pages/Transfers.tsx` — Export CSV moved to header, 600ms loading state, `f`/`/` split
  - `dashboard/src/components/transfers/TransfersFilterBar.tsx` — Export removed, search width rolled back, loading skeletons
  - `dashboard/src/components/transfers/TransfersTable.tsx` — `loading` prop + `<SkeletonRow>` + `<SkeletonMobileCard>`
  - `ai_context/AI_CONTEXT.md` — phase / file map / active workstreams
  - `ai_context/HISTORY.md` — this entry
- **Docs updated**: `ai_context/AI_CONTEXT.md`, `ai_context/HISTORY.md`. No `docs/models.md` / PRD / `mermaid_schemas/` changes.
- **Key decisions**:
  - **No sticky page header** on the detail page (user direction overrides spec). Collapsed-on-scroll behavior dropped with it.
  - **Right rail + mobile bottom drawer remain sticky** — different pattern from headers, both confirmed in scope.
  - **Lighter mobile drawer** (option Q2): persistent 64px bar + Sheet for Timeline / More, instead of custom 50vh drag-handle drawer. Same UX outcome with significantly less custom code.
  - **Real-time = local simulation** — no backend; `setInterval(10s)` advances `processing` rows with 25% probability per tick.
  - **Audit log link is flat** — `/audit-log?entity=transfer&id=:id` (the partial-nesting decision still stands; only Transfers itself is nested).
  - **Notify-user locked ON** for Reverse + Refund (shared `NotifyUserLockedRow` with disabled tooltip per compliance rule).
  - **Provider JSON** rendered as plain `<pre>` with mono — no syntax-highlight library.
  - **Audit/admin entries** on locally-added actions show actor "You / YO" — temporary stand-in for an authenticated principal.
- **Open items**: Customer-area routes (`/customers/users/:id`, `/customers/cards/:id`, `/customers/recipients/...`) and `/audit-log` query-driven view still placeholder. AML triage detail (`/operations/aml-triage/:id`) referenced from the AML flag card is still placeholder. Saved filters reset on full reload (no localStorage). Real Alipay/WeChat marks still placeholder dots.

---

### 2026-05-01 — Phase 3 Transfers Monitor (list + detail v1) + shared DateRangePicker

- **Summary**: Two large pieces shipped together.
  - **Transfers Monitor** — densest page in the dashboard. List page at `/operations/transfers` and detail page at `/operations/transfers/:id` (full-page detail per user direction, not a side-sheet). List has a sticky two-row filter bar (Row 1: search left + Export-CSV green button right with `justify-between`; Row 2: filter chips Status / Date range / Destination / Scheme / Amount / Tier / Has AML / Has failure with "Clear all" link; Row 3: quick-filter pills "Failed today" / "Reversed last 7d" / "Stuck > 10min" with live counts). 200-row deterministic seeded dataset (mix per spec: 65% completed, 12% processing, 8% failed, 4% reversed, 11% created, failure codes distributed across CARD_DECLINED / RECIPIENT_INVALID / INSUFFICIENT_FUNDS / PROVIDER_UNAVAILABLE / LIMIT_DAILY_EXCEEDED / SANCTIONS_HIT, UzCard + Humo only). Table: 12 columns including failure-rail (red for failed / amber for reversed) on the first cell, sortable Created / Amount UZS / Amount CNY (default Created DESC), row click → detail, kebab actions (Reverse / Force-fail / Resend webhook / Copy / Open audit), pagination 50/100/200, bulk-action sticky bar with `pointer-events: none` lock workaround for nested Radix DropdownMenus. Saved filters use a Dialog-based modal for Save / Rename (replaced the `window.prompt` first attempt) and a 3-dot kebab on each saved row for Apply / Rename / Delete. Detail page is single-column with a 2-col middle (Card + Recipient, Sender + AML), sticky header strip at top (status badge + copy-id + breadcrumb + Open user), sticky-bottom admin actions bar (Reverse / Force-fail when stuck > 10min / Resend webhook / Copy ID / Open audit log), AlertDialog with reason ≥ 10 chars for state-changing actions, mock state changes update local React state + append events to the timeline. List ↔ detail round-trip preserves filters / sort / page / selection via a module-level cache.
  - **Shared DateRangePicker** — new zhipay primitive (`components/zhipay/DateRangePicker.tsx`) used by both Transfers' filter bar and Overview's page header. Anchored Popover (not Dialog), opens beneath the trigger. Left sidebar with quick-select radios (Today / Yesterday / Last 7d / Last 30d / Custom range), right pane with two-month side-by-side calendar (`react-day-picker` v9 wrapped in a new `components/ui/calendar.tsx` shadcn primitive, brand colors via `--rdp-accent-*` CSS vars). Custom header bar above the calendar shows "Month A | Month B" with boxed prev/next arrows; default react-day-picker nav hidden via `classNames={{ nav: 'hidden' }}`. Footer with calendar-icon + range summary on the left, Cancel / Apply on the right. Pending state pattern: changes are local until Apply commits via `onChange`. Replaces the old popover-based RangeChip in Transfers and the 4-item DropdownMenu in Overview.
  - **Routing migration** — Transfers is the first page on nested routes (`/operations/transfers`, `/operations/transfers/:id`). Other pages stay flat for now. Sidebar entry updated, `g+t` global shortcut updated, back-compat redirects from old `/transfers` and `/transfers/:id` added.
  - **TopBar** — proper breadcrumbs on every page, including parameterized routes (`/operations/transfers/:id` → "Operations / Transfers / t_xxxx" with Transfers as a back-link). Falls back to title-cased path segments for unknown routes.
  - **Iterations along the way** that produced explicit user feedback (and the matching lessons): sticky table thead removed across the dashboard (LESSON), Visa/Mastercard re-introduced for one phase prompt then removed again (LESSON, scope-out is now firm). Overflow fixes for the 12-col table (`overflow-x-auto` wrapper) and the chip row (`min-w-0`). First-row brand ring on Transfers list initial mount fixed by defaulting `focusedIndex` to `-1`. Copy-ID buttons across the page now show a 1.5s green check-icon swap as visual feedback. Clear-all + Saved-filters reliability fixed by deferring `setSavedFiltersOpen(false)` to the next tick and setting the kebab DropdownMenu to `modal={false}` (prevents Radix's body `pointer-events: none` lock from getting stuck when nested menus close simultaneously).
- **Files created**:
  - `dashboard/src/data/mockTransfers.ts` (deterministic seeded 200-transfer + events + AML dataset, helpers `getTransferById` / `getEventsForTransfer` / `getAmlFlagsForTransfer` / `STATUS_COUNTS` / `QUICK_FILTERS`)
  - `dashboard/src/components/transfers/{types,filterState,TransfersFilterBar,TransfersTable}.tsx` (4 files — Pattern layer for the Transfers page; `filterState.ts` is module-level cache + saved-filters store)
  - `dashboard/src/components/ui/calendar.tsx` (shadcn-style Calendar primitive wrapping react-day-picker v9 with brand-colored CSS vars)
  - `dashboard/src/components/zhipay/DateRangePicker.tsx` (12th zhipay primitive)
  - `dashboard/src/pages/Transfers.tsx`, `dashboard/src/pages/TransferDetail.tsx`
- **Files modified**:
  - `dashboard/src/router.tsx` (added `/operations/transfers` + `/operations/transfers/:id`, redirects for old paths)
  - `dashboard/src/components/layout/Sidebar.tsx` (Transfers nav `to` updated)
  - `dashboard/src/components/layout/TopBar.tsx` (real breadcrumbs replacing the static title; parameterized route handling)
  - `dashboard/src/hooks/useKeyboardShortcuts.ts` (`g+t` → `/operations/transfers`)
  - `dashboard/src/lib/i18n.ts` (~150 new keys — Transfers list/detail, Saved-filters dialog + actions, Date-range picker)
  - `dashboard/src/pages/Overview.tsx` (replaced range DropdownMenu with DateRangePicker; state shape `range: RangeKey` → `dateRange: DateRangeValue`)
  - `dashboard/package.json`, `package-lock.json` (added `react-day-picker@^9.14.0`)
- **Docs updated**: `ai_context/AI_CONTEXT.md`, `ai_context/HISTORY.md`, `ai_context/LESSONS.md` (2 new lessons — see below). No `docs/models.md` / PRD / `mermaid_schemas/` changes.
- **Key decisions**:
  - **Routes — partial nesting**. Transfers is the first nested page (`/operations/transfers`). Other admin pages stay flat until each phase migrates them. The earlier "flat for now" lock is now "partially nested".
  - **Detail = full page**, not side-sheet. Filter state preserved via module cache so back-nav restores the list exactly.
  - **DateRangePicker = anchored Popover**, not Dialog (after one round-trip on this — initial Dialog implementation was rejected by user).
  - **Sticky table `<thead>` is forbidden** (LESSON 2026-04-30). Filter bars + bulk-action bars may still be sticky.
  - **Visa / Mastercard scope-out is firm** (LESSON 2026-04-30). Spec wording in a phase prompt does not constitute re-introduction; only a direct user instruction does.
  - **Saved filters use Dialog for save/rename**, kebab for actions per saved row. Save action is disabled when `countActiveFilters === 0`.
  - **Compact money formatter still applies** to KPI / aggregate tiles only — transactional Transfers row amounts use full `<Money>` grouping.
- **Open items**: Real Alipay / WeChat marks (DestinationBadge still placeholder dots). Real UzCard / Humo logos still stylized SVG placeholders. Customer-area routes (`/customers/users/:id`, `/customers/cards/:id`) referenced from detail page but not yet built — they hit the catch-all Placeholder. KYC review queue, AML triage, and the other 13 placeholder routes still empty. Saved filters reset on full reload (no localStorage yet).

---

### 2026-04-30 — Build Admin Overview page (Phase 2) — KPIs, charts, FX health, services, recent activity

- **Summary**: Rebuilt the admin Overview page (route `/`) per the Phase-2 spec. Page header with last-refreshed timestamp, manual refresh icon (`R` page-level shortcut), date-range dropdown (Today / Yesterday / 7d / 30d). KPI strip — 4 focusable cards with sparklines that navigate on Enter/Click (Transfers→`/transfers`, Volume→`/transfers`, Pending KYC→`/kyc-queue`, Open AML→`/aml-triage`); Volume tile uses **compact format** (`2.84B UZS`) with full-grouped figure on hover via `title=`; pulsing red attention dot when KYC > 50 or any critical AML flag is open/reviewing; subtle pulse animation on each 30-second auto-refresh tick. Two-column charts: status-breakdown donut covering all 5 transfer states (1 247 / 89 / 34 / 12 / 8) with centred total + percent legend; throughput line over the last 60 minutes with X/Y axes and tooltip. **NEW FX spread health card** — large `1 CNY = 1,404.17 UZS` rate, mid_rate / spread_pct / source / valid_from / live MM:SS TTL countdown ticking every second, Healthy / Drifting / Stale badge driven by spread + TTL, 24-hour mini chart, "Update rate →" link to `/fx-config`. Services & health grid — 5 tiles (alipay, wechat, uzcard, humo, myid) with health dot + status note ("Maintenance" for wechat) + latency + last-checked; click navigates to `/services?service=…`; mobile renders as 1-column full-width tiles. Recent activity — 20-row table with 8 columns (Time / Card / Sender / Recipient / Amount UZS / Amount CNY / Status / Action), `<tfoot>` totals row summing UZS + CNY across all 20 transfers, "View all transfers →" link promoted to top-right of the CardHeader (sibling to the title); mobile renders a stacked-card list with a parallel "Total" tile at the bottom. 600ms initial-mount skeletons; auto-refresh never re-skeletons. Empty / error variants gated by `HAS_DATA` and `FEED_HEALTHY` const flags at top of file (flip to preview). FX rates and FX-chart values use a new `formatNumber` helper for locale-grouped display (`1,404.17 UZS` instead of `1404.17 UZS`).
- **Files modified**: `dashboard/src/types/index.ts` (added optional `Service.note` for "Maintenance" / "Elevated latency" labels). `dashboard/src/data/mock.ts` (20 transfers spread across last 60 min using only UzCard / Humo per scoping; `STATUS_BREAKDOWN_TODAY` 5 slices summing 1390; 60 per-minute `THROUGHPUT_60M` points; `FX_RATE_24H` series; FX rate enriched w/ source + validFrom + validTo for 40-min TTL; `SERVICES` trimmed to 5 entries with `wechat` in maintenance state for amber demo). `dashboard/src/lib/i18n.ts` (~40 new keys: refresh, date-range, fx-health.*, services.status.*, recent-activity columns + totals + view-all, empty / error states, destination labels). `dashboard/src/lib/utils.ts` (new helpers: `formatNumber` for locale-grouped non-monetary numbers; `formatMoneyCompact` for KPI tiles). `dashboard/src/components/ui/table.tsx` (sticky thead removed, canonical `overflow-auto` wrapper restored). `dashboard/src/pages/Overview.tsx` (full rewrite of all 7 sections + skeletons + empty/error variants). `ai_context/AI_CONTEXT.md` (current phase + decisions + file-map + active workstreams). `ai_context/HISTORY.md` (this entry).
- **Files created**: `dashboard/src/components/zhipay/DestinationBadge.tsx` (11th domain primitive — Alipay-blue / WeChat-green chip + colored dot).
- **Docs updated**: `ai_context/AI_CONTEXT.md`, `ai_context/HISTORY.md`. (No `docs/models.md` / PRD / `mermaid_schemas/` changes — schema, KYC tiers, status machines, error codes, flows all unchanged.)
- **Key decisions**:
  - **Visa & Mastercard rails temporarily scoped out of the dashboard.** Per user direction "no visa and mastercard for now". The `card-schemes.md` rule and `docs/models.md` definitions for Visa / Mastercard are unchanged — they return when the user signals. Mock TRANSFERS use only UzCard / Humo; SERVICES grid is 5 services.
  - **Compact KPI money formatter** (`formatMoneyCompact`) reserved for aggregate dashboard tiles only. Transactional displays (send-money review, transfer detail, activity row amounts) keep full grouping per `.claude/rules/money-and-fx.md`. Doc-string locks this constraint.
  - **`<Table>` sticky thead removed** (user direction). Canonical shadcn `overflow-auto` wrapper restored, so horizontal-scroll comes back for narrow viewports.
  - **Mobile services grid: single column** full-width per user direction (not 2).
  - **Routes stay flat** (`/services`, `/fx-config`, `/transfers`) instead of nested `/system/services` / `/finance/fx-config` / `/operations/transfers` from the spec — renaming is a separate initiative.
  - **`r` page-level keyboard shortcut** scopes to Overview only and defers to global `g+r` (→ `/recipients`) when `g` was just pressed.
- **Open items**: Real Alipay / WeChat brand marks (DestinationBadge currently colored-dot placeholders). Real UzCard / Humo logos still placeholders; ZhiPay wordmark pending. 17 placeholder routes still hold no real content. Visa / Mastercard re-introduction paused.

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
