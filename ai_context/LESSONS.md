# Lessons Learned

> Patterns and mistakes to avoid. Updated after every correction from the user.
> Review this file at the start of each task via `/start_task`.

---

## How to Use

1. After ANY correction from the user, add an entry below
2. Before starting a task, scan for relevant past lessons
3. Each entry should be actionable — not just "what happened" but "what to do next time"

---

## Entry format

Each lesson is structured as:

```
### YYYY-MM-DD — <one-line rule>

**Why:** <reason — usually a past incident or strong preference>
**How to apply:** <when / where this guidance kicks in>
**Context:** <optional — link to artifact, doc, or session>
```

Lead with the **rule itself**. The Why and How-to-apply lines exist so you can judge edge cases later, not just blindly follow.

---

## Lessons

### 2026-05-03 — `useSyncExternalStore`'s `getSnapshot` MUST return reference-equal values when state is unchanged — never re-parse from storage on every call

**Why:** Phase 20 sign-in surface shipped with `lib/auth.ts` reading `sessionStorage` and JSON-parsing the session on every `getSnapshot()` call. Each call returned a fresh object (different reference) → React detected identity churn and emitted "Warning: The result of getSnapshot should be cached to avoid an infinite loop" → cascading "Maximum update depth exceeded" runtime error → blank screen on every authenticated route. The bell-icon-popover work happened to expose it because Popover's renders re-trigger `useSyncExternalStore` subscribers, but the bug was in the auth store contract, not the popover.

**How to apply:** When implementing any `useSyncExternalStore`-backed store:

- **Hold the parsed state in a module-level variable.** Read from the variable in `getSnapshot()` (cheap, reference-stable). Only mutate the variable from the writer fn (`writeSession` / equivalent) — same code path that calls `notify()`.
- **Initialize once at module load** (e.g. `initFromStorage()` reads `sessionStorage` exactly once). Subsequent reads come from the cached variable.
- **Cross-tab sync via `storage` events** updates the cached variable inside the listener BEFORE calling the subscriber, so `getSnapshot()` returns the new reference on the next React tick.
- **Guard for SSR / pre-mount.** Reference `sessionStorage` / `window` only inside `typeof === 'undefined'` checks so module load doesn't crash in non-browser contexts (build-time tsc, future SSR experiments).
- **`getServerSnapshot()` returns `null`** for SPA-only stores — the third arg to `useSyncExternalStore` is required even when SSR isn't a target.

**Symptom-to-diagnosis shortcut:** If you see "The result of getSnapshot should be cached" followed by "Maximum update depth exceeded" — go straight to your store's `getSnapshot`. The bug is almost always a fresh-object-on-every-call (JSON.parse, `.map`, `Object.assign`, spread). Don't chase the rendering component.

**Quick grep to verify (any time you add a new external store):**
```
# getSnapshot or readSnapshot that calls JSON.parse / spread / .map every call:
grep -rE 'function getSnapshot|getSnapshot\s*=\s*\(\)' dashboard/src/lib | xargs -I{} grep -l "JSON.parse\|\.map\|\.\.\." {}
# (every hit needs a module-level cache; reads should NOT recompute)
```

**Context:** Phase 20 sign-in (2026-05-03). First implementation of `useSyncExternalStore` in the dashboard. Initial `lib/auth.ts` had `function getSnapshot() { return readSession(); }` where `readSession()` re-parsed sessionStorage. Fix: introduced `let currentSession: ActiveSession | null = null;` at module level + `initFromStorage()` once + `parseStoredSession(raw)` helper; `writeSession` updates the cached variable + storage + notifies; `subscribe`'s `storage` listener updates the cached variable before notifying.

---

### 2026-05-03 — Surfaces that live OUTSIDE `<AppShell>` must own their own `<TooltipProvider>` — every shared layout primitive that uses Radix Tooltip will crash without one

**Why:** Phase 20 `/sign-in` lives outside `<AppShell>` (full-bleed auth layout, no sidebar / topbar). The reused `<ThemeToggle>` from `components/layout/` uses `<Tooltip>`/`<TooltipTrigger>`/`<TooltipContent>`, which require a `<TooltipProvider>` ancestor. AppShell wraps its children in `<TooltipProvider delayDuration={200}>`; sign-in didn't, so the very first mount crashed with "Tooltip must be used within TooltipProvider" — full red screen, nothing rendered.

**How to apply:** For any new top-level surface that lives **outside `<AppShell>`** (auth surfaces, error pages, marketing pages, embed/iframe wrappers):

- **Wrap the layout's root in `<TooltipProvider delayDuration={200}>`** — same constant AppShell uses, so tooltip behaviour is uniform across the app.
- **Audit every imported component for Radix Tooltip usage** before wiring it into the new surface. `ThemeToggle`, `UserMenu`, `KeyboardHint`, `<Tooltip>`-decorated buttons in patterns — any of these will crash without a Provider.
- **The Provider lives at the layout level**, not at the leaf. AppShell wraps children once. Auth surfaces wrap their layout root once. Don't sprinkle Providers per-component.
- **TooltipProvider is the only Radix Provider with this hard requirement in the current codebase** — Dialog / Popover / DropdownMenu / Select all create their own context internally. But this rule generalizes: when adopting a new Radix component, check its docs for required Provider ancestors.

**Quick grep to verify (any time you add a new top-level layout):**
```
# Layouts that aren't wrapped in TooltipProvider but render components using <Tooltip>:
grep -rL "TooltipProvider" dashboard/src/components/auth dashboard/src/components/<your-new-layout-dir>
# (every layout that imports <ThemeToggle> or any tooltip-using component should carry the Provider)
```

**Context:** Phase 20 sign-in (2026-05-03). Initial `AuthLayout` rendered `<ThemeToggle />` directly without a Provider; runtime crash was the very first browser probe. Fixed by wrapping `AuthLayout`'s root in `<TooltipProvider delayDuration={200}>` matching AppShell's value.

---

### 2026-05-03 — Fixed-bottom mobile action bars: every row spans the same edge-to-edge width — never mix a centered content-sized control with full-width siblings

**Why:** Phase 14 (Services & Health) mobile `<ActionBar variant="mobile">` shipped first-pass with the 3-segment `<StatusToggleGroup>` rendered as `inline-flex` (content-sized, centered via `self-center`) above a `flex w-full gap-2` row of two `flex-1` buttons. Result: the toggle row read ~240px wide centered, the button row spanned edge-to-edge — visibly inconsistent. User feedback: "the bottom segmentation in fix bar in mobile view should be consistent full width with below buttons." The root cause: a content-sized control and a full-width control stacked together always read as a layout error, even when each is internally well-formed. Fixed-bottom action bars are read as a single chrome surface; every row inside should hit the same left + right edges.

**How to apply:** For any fixed-bottom action bar in mobile / `<lg` layouts:

- **Every row spans the bar width.** No centered content-sized rows. No partial-width chips next to full-width buttons.
- **Segmented controls / toggle groups** that need to share a row inside the bar should support a `fullWidth` mode (root: `flex w-full`; segments: `flex-1 justify-center`). Default rendering can stay `inline-flex` for desktop usages — but the prop must exist so mobile bars can opt in.
- **Button rows** use `flex w-full gap-2` with each button `flex-1` to split equally (or weighted via `flex-[2]`/`flex-1` if a primary needs more visual weight).
- **Stack vertically** (`flex flex-col gap-2`) when there's more than one row of controls. Don't try to fit toggle + buttons + meta on one horizontal mobile row — at 360px viewport the bar runs out of room and individual elements squeeze.
- **Desktop / pane variants** of the same component can keep `inline-flex` content sizing — desktop bars typically right-align the action buttons via `ml-auto` and the toggle floats on the left without needing equal width. The `fullWidth` opt-in keeps the desktop ergonomics intact.

**Quick grep to verify:**
```
# Mobile action bars that center an inline-flex toggle above full-width buttons:
grep -rE "self-center.*StatusToggleGroup|self-center.*ToggleGroup" dashboard/src
# (must be 0 hits in any /components/*/ActionBar.tsx — toggle should be fullWidth in mobile bars)
```

**Context:** Services & Health mobile action bar polish, 2026-05-03. Fix added `fullWidth` prop to `<StatusToggleGroup>`; mobile branch of `<ActionBar>` switched to 2 stacked full-width rows. Desktop pane variant unchanged (still right-aligned with `ml-auto`).

---

### 2026-05-03 — Master-detail dashboards (Services-shape): single-column tile list on the left + always-visible detail pane on the right — match the tile density to the pane width, never the other way around

**Why:** Phase 14 (Services & Health) cycled through three layouts before settling. The root mistake on every wrong pass was deciding the layout from the *page width* and then sizing tiles to fit, instead of fixing the tile density first and letting the layout follow.

1. **Pass 1** — spec-as-written "always two-pane on desktop · empty state on right when nothing selected" with `lg:grid-cols-5` in the left pane. Result on 1280–1440px viewports: each tile ~120px wide, content crammed. User: "the layout is wrong all elements are in the one line in a row, fix it."
2. **Pass 2** (my correction) — full-width grid `lg:grid-cols-5` when no selection · two-pane (`lg:w-[420px]` + `lg:grid-cols-2`) when selected. Tiles got room when no detail open, but the layout *changed shape* between selection states — the grid jumping from 5-wide to 2-wide on first click felt jarring. User: "change the layout like the cards are in a column and the service details in right when click the service it will show the all details in the right service details section."
3. **Pass 3** (final) — **single-column tile list always**, detail pane always rendered on `lg+` (EmptyDetailPane until selection, then the service body). One layout, two states, no shape change.

The lesson isn't "always two-pane" or "never two-pane" — it's **pick a tile density that fits the narrowest pane width you'll ever render at, then keep that density at every selection state**. A 1-col list of ~360px-wide tiles fits both the desktop list pane (`lg:w-[380px]`) and the mobile viewport (~360–420px) without shape change. A 5-col grid only works when the list pane is full-width, so it forces the layout to morph on selection — which is the actual UX problem.

**How to apply:** For Services-shape master-detail (small pinned set of items, rich detail per item):

- **List pane density** = single column (`grid grid-cols-1 gap-3`). Tiles flow vertically. This works at desktop pane width (`lg:w-[360–400px]`) and mobile viewport (`100%`) without changes.
- **Desktop layout** (`lg+`) = `flex lg:gap-4 lg:items-start` with `[list pane lg:w-[380px] lg:shrink-0 min-w-0]` + `[detail pane lg:flex-1 min-w-0]`. Detail pane always rendered. Empty state shown until `:id` matches a row, then swap to the body. **Layout shape doesn't change on selection** — only the right pane's contents do.
- **Mobile layout** (`<lg`) = list-only at `/system/services`, tile click navigates to `/system/services/:id` which renders the same detail body full-page. No two-pane on mobile.
- **Selected-tile highlight** reads off the URL's `:id`. Brand-tinted `border-brand-600 bg-brand-50/60 shadow-sm` ring.
- **Page headers** and **DetailHeaders** still stack vertically on `<md` and side-by-side from `md+` (per the "narrow widths breed cramping" sub-rule).

**This shape doesn't fit every master-detail.** It's right for "small pinned set + rich detail per item" (Services / Settings / Webhooks list / per-rail config). It's **wrong** for "high-volume queue + per-row triage" (KYC Queue / AML Triage / Transfers list) where the list pane needs to surface dense scanable rows and a 2–3-line row layout fits more on screen — those surfaces correctly use a 480–520px wider list pane with denser row layout, not 1-column tiles.

**Quick grep to verify (Services-shape pages):**
```
# Should find single-column list pane + always-rendered detail pane on lg+
grep -nE 'grid-cols-1.*ServiceTile|ServicesGrid' dashboard/src/components/services/ServicesGrid.tsx
grep -nE 'lg:w-\[380px\]|lg:flex.*lg:items-start' dashboard/src/pages/Services.tsx
```

**Spec-vs-feedback:** When a written spec says "always two-pane with empty state on right" AND the natural tile density doesn't fit the resulting list-pane width, **change the tile density** (drop to single column), not the always-two-pane structure. The spec's intent was usually right — the implementation just picked the wrong tile density.

**Context:** Services & Health page, 2026-05-03. Final landing after three passes. Sequence:
- Pass 1 (5-col tiles in half-width pane) → user feedback "all elements in one row, fix it"
- Pass 2 (5-col when no detail, 2-col when detail) → user feedback "cards in a column, details in right"
- Pass 3 (1-col tiles + always-visible detail pane) — final.

The earlier full-width-grid LESSON authored mid-sequence was retired in favor of this entry. EmptyDetailPane is mounted alongside the list pane on `lg+` whenever no service is selected.

---

### 2026-05-03 — Calendar / date-picker header is `[<]   Month YYYY   [>]` with `justify-between` — never the default react-day-picker chrome

**Why:** The `<DateTimeInput>` Popover initially passed through react-day-picker v9's default header — month/year text in `month_caption` with the `Nav` (prev / next chevrons) absolutely positioned by rdp's stylesheet. Result: the chevrons hugged the caption text instead of sitting on the sides of the calendar panel, which read as cramped and inconsistent with `<DateRangePicker>` (which already renders a custom `<  Month A | Month B  >` bar via `classNames={{ nav: 'hidden' }}`). User feedback: "the top controller of date picker in fx should be `< may 2026 >` with space between the arrow should be in the side". The fix is one canonical header pattern for **every** Calendar usage in the dashboard, single-month or range.

**How to apply:** Every Calendar consumer (zhipay primitive or page-scoped wrapper) renders its own header above `<Calendar>` and hides rdp's defaults. Contract:

```tsx
// Above the <Calendar>
<div className="flex items-center justify-between gap-3 border-b px-4 py-3">
  <button
    type="button"
    onClick={() => setDisplayMonth(addMonths(displayMonth, -1))}
    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-foreground/80 hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    aria-label="Previous month"
  >
    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
  </button>
  <span className="text-base font-semibold tracking-tight truncate">
    {format(displayMonth, 'MMMM yyyy')}
  </span>
  <button
    type="button"
    onClick={() => setDisplayMonth(addMonths(displayMonth, 1))}
    className="…same as prev…"
    aria-label="Next month"
  >
    <ChevronRight className="h-4 w-4" aria-hidden="true" />
  </button>
</div>

<Calendar
  mode="single"          // or "range" for DateRangePicker
  month={displayMonth}
  onMonthChange={setDisplayMonth}
  classNames={{ nav: 'hidden', month_caption: 'hidden' }}
  …
/>
```

- `nav: 'hidden'` removes rdp's default prev/next buttons. **Always.**
- `month_caption: 'hidden'` removes rdp's "Month YYYY" text so it doesn't double-render alongside the custom header. **Required for single-month pickers.** (`<DateRangePicker>`'s 2-month layout currently leaves caption visible because each month has its own — re-evaluate if a future picker shifts to a single header for both months.)
- The header gets its own `border-b` so it visually sections off from the calendar grid.
- Buttons are `h-8 w-8` boxed icons with the same hover / focus-ring styling — never bare lucide icons sitting on a transparent background.
- Title is `text-base font-semibold tracking-tight` — never `text-lg` (overweight inside the popover) or `text-sm` (too quiet).
- Layout is `flex items-center justify-between gap-3` — `gap-3` matters because if the title wraps it shouldn't crash into the buttons.
- Both pickers (`DateTimeInput` + `DateRangePicker`) keep their own `displayMonth` state passed through `month` + `onMonthChange` so the prev/next buttons drive the visible month without re-triggering `selected`.

**Forbidden:** `<Calendar>` without an explicit custom header. Falling back to rdp's default chrome — even if it visually "works" on first glance — is forbidden because the default nav button placement varies between rdp versions and the bare chevrons fail to match the rest of the design system's button styling.

**Quick grep to verify:**
```
grep -rE "<Calendar\b" dashboard/src | grep -v "month_caption"
# (every hit should already render a custom header — flag any that doesn't)
```

**Context:** FX Config DateTime picker polish, 2026-05-03. The single-month picker shipped with rdp's default chrome and was corrected to mirror `DateRangePicker`'s already-canonical custom header.

---

### 2026-05-02 — Detail-page back link is `<ArrowLeft> Back to <list>` (icon component only — no `← ` text prefix)

**Why:** Cards Detail shipped with `'admin.cards.detail.back': '← Cards'` as the i18n string — the JSX also rendered an `ArrowLeft` icon next to it, so the result was a double-arrow `[icon] ← Cards`. Two of the Transfer Detail back-links had the same problem (`'← Card transfers'`), and the labels themselves were inconsistent: User Detail said "Back to users", Card Detail said "Cards", Transfer Detail said "Transfers" / "{name}'s transfers" / "AML flag" / "Card transfers". User asked for one canonical pattern: a single left-arrow icon followed by `Back to <list>` text.

**How to apply:** Every detail-page back link follows this contract:

- Icon: `<ArrowLeft className="h-4 w-4" aria-hidden="true" />` (lucide-react). **No** `<ChevronLeft>`, no inline SVG, no Unicode arrow. Size locked at `h-4 w-4`.
- Label: `Back to <list>` — verbatim, in i18n. Examples (canonical):
  - `'admin.users.detail.back-to-list': 'Back to users'`
  - `'admin.cards.detail.back': 'Back to cards'`
  - `'admin.transfer-detail.back-link.list': 'Back to transfers'`
  - `'admin.transfer-detail.back-link.user': "Back to {name}'s transfers"`
  - `'admin.transfer-detail.back-link.aml': 'Back to AML flag'`
  - `'admin.transfer-detail.back-link.card': 'Back to card transfers'`
- Container: `<button>` or `<Link>` with `inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm`.
- Forbidden: `← ` prefix in i18n strings (renders alongside the icon = double arrow). Forbidden: omitting `Back to ` (e.g. just `Cards`) — the action verb is part of the contract.

**Quick grep to verify:**
```
grep -rE "← " dashboard/src/lib/i18n.ts | grep back
# (must return 0 hits)
```

**Context:** Cards Detail polish, 2026-05-02. Six i18n strings normalized; `UserHeader` swapped `ChevronLeft` → `ArrowLeft` for icon parity.

---

### 2026-05-02 — Detail-page sticky-bottom action bar uses the canonical `fixed inset-x-0 bottom-0 md:left-16` overlay (page wrapper carries `pb-28`)

**Why:** Card Detail tried `sticky bottom-0 -mx-4 md:-mx-6 -mb-4 md:-mb-6` to span the full main width. User feedback: "the fixed bottom button group should be a fixed and with full width of main section now it with paddings". The sticky-inside-main approach left the bar subject to `<main>`'s `p-4 md:p-6` padding via the negative-margin compensation, and the bar's bottom edge was the bottom of the scrollable content, not the viewport edge. KYC Queue and AML Triage already use the right pattern: `fixed inset-x-0 bottom-0 md:left-16` — pinned to the viewport's bottom edge, escaping `<main>` entirely, offset on md+ by the collapsed-sidebar width (64px).

**How to apply:** Detail pages with a persistent action bar use one canonical bar pattern:

```tsx
<div className={cn(
  'fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card',
  'md:left-[var(--sidebar-width,4rem)]',
  'px-4 md:px-6 py-3',
)}>
  {/* … buttons … */}
</div>
```

And the page outer wrapper:
```tsx
<div className="space-y-6 pb-28">
  {/* … header / cards / activity … */}
  <ActionBar … />
</div>
```

The `pb-28` (112px) reserves room so the last content card clears the fixed bar at full scroll.

**`--sidebar-width` is set by [`AppShell`](../dashboard/src/components/layout/AppShell.tsx) on the shell-root flex container** — `64px` when collapsed, `240px` when expanded — so action bars on `md+` align with the live main-content edge regardless of sidebar state. On `<md` the sidebar lives in a Sheet drawer and is not in the flex flow; `inset-x-0` gives the bar full viewport width and the `md:left-[…]` rule doesn't apply.

**Earlier hardcoded `md:left-16` is forbidden** — it only matched the collapsed-sidebar width and overlapped the expanded sidebar on `lg+`.

**Forbidden:** `position: sticky bottom-0 -mb-...` for the action bar on a detail page (was the failed Card Detail variant). Sticky is fine for filter bars, bulk-action bars, and right-rail action panels, but the persistent action bar at the bottom of a detail page is `position: fixed` overlay.

**Quick grep to verify:**
```
grep -rE 'fixed inset-x-0 bottom-0' dashboard/src/components/**/ActionBar.tsx dashboard/src/components/**/CardActionBar.tsx
# (every detail-page action bar should match)
```

**Context:** Cards Detail polish, 2026-05-02. Action bar realigned to the KYC/AML overlay pattern; page wrapper got `pb-28`.

---

### 2026-05-02 — Detail-page headers flow inline (NEVER sticky); structure is back-link / identity / chips

**Why:** Cards Detail shipped with a sticky `bg-card` header band that bled full-width via negative margins. User came back: "the header of the cards details page is not the same as user details, transfer details, fix it and make that lesson". Both [`UserHeader`](dashboard/src/components/users/UserHeader.tsx) and the [`DetailHeader`](dashboard/src/pages/TransferDetail.tsx) for transfers flow inline in the page rhythm — no `sticky`, no bleed, no `bg-card` band. The Cards Detail variant created visual disagreement between the three detail surfaces and made the page feel like a different product. Detail-page headers are content, not chrome — they scroll away naturally and let the body breathe.

**How to apply:** Every detail-page header (Card / User / Transfer / and any future detail surface) follows this contract:

- Container: `<header className="space-y-3 lg:space-y-4">` (or similar inline spacing) — **no `sticky top-0`, no negative `-mx-*` margins, no `bg-card` band, no `border-b` strip**.
- Row 1 — back link: `<button>` or `<Link>` with `<ChevronLeft|ArrowLeft>` icon + back-label, in `text-sm text-muted-foreground hover:text-foreground`. Mirrors [`UserHeader`](../dashboard/src/components/users/UserHeader.tsx) lines 42-50 and the `DetailHeader` first row in [`TransferDetail.tsx`](../dashboard/src/pages/TransferDetail.tsx) lines 692-700.
- Row 2 — identity: avatar / scheme-logo / status badge + primary identifier (name, masked PAN, transfer ID) + secondary metadata. Wraps via `flex flex-wrap items-center gap-3` so it adapts to mobile.
- Row 3 (optional) — chips: created date / last seen / KYC expiry / pager position, etc. Local `<Chip>` primitive or stat strip.
- Right-side admin/page actions can sit on the identity row (`md:flex-row md:items-start md:justify-between`) or below (chips row) — either is fine, but the back link is **always the first row alone**.

**Forbidden:** `sticky top-0` / `position: sticky` on the header container. Sticky chrome is reserved for filter bars (list pages), bulk-action bars (multi-select states), and the right-rail action panel on Transfer Detail. Detail-page headers are not chrome.

**Quick grep to verify:**
```
grep -rE 'sticky top-0' dashboard/src/pages/*Detail.tsx
# (must return 0 hits — no detail page should sticky its header)
```

**Context:** Cards Detail polish, 2026-05-02. Sticky header + bg-card band removed; structure realigned to match `UserHeader` + `DetailHeader`.

---

### 2026-05-02 — Data-table column headers use Title Case + `text-sm font-medium text-muted-foreground` — no `uppercase tracking-wider`

**Why:** User feedback during the Cards surface build: "make in all pages tables header be in Capitalized style and in one color" — they pointed at the inconsistency between static `<TableHead>` cells (rendered ALL-CAPS via the shadcn primitive's `uppercase tracking-wider`) and `SortableHeader` buttons (which sometimes inherited the transform, sometimes didn't, depending on browser/element resets). Net effect was a visually mismatched header row across surfaces. The fix is one canonical style for **every** column header, sortable or not, in every table.

**How to apply:**

Single source of truth: `dashboard/src/components/ui/table.tsx` `<TableHead>` carries `text-sm font-medium text-muted-foreground` (Title Case as authored in i18n, single muted color, 14px).

Every `SortableHeader` / custom `<th>` button across the codebase mirrors this exactly:
- `text-sm font-medium text-muted-foreground hover:text-foreground`
- **No active-state color differential.** Sorting state is communicated through the arrow icon (`ArrowUpDown` / `ArrowUp` / `ArrowDown`) only — never by darkening the active header to `text-foreground`. User feedback 2026-05-02: making the active sort header darker than the rest reads as a visual inconsistency, not a sort indicator.
- never `uppercase`, never `tracking-wider`, never `text-xs` for table column headers

i18n column labels (`admin.*.column.*`) are authored in Title Case ("Card", "Lifetime volume", "Last login") — relying on CSS to uppercase them is forbidden.

**Affected canonical files (audit-grep these if you add a new table):**
- `dashboard/src/components/ui/table.tsx` — `<TableHead>` primitive
- `dashboard/src/components/users/UsersTable.tsx` — `SortableHeader`
- `dashboard/src/components/cards/CardsTable.tsx` — `SortableHeader`
- `dashboard/src/components/transfers/TransfersTable.tsx` — `Th` + `SortHead`

**Narrowing of LESSON 2026-04-29:** The reserved-`text-xs` "uppercase + tracking-wider section labels" bucket no longer includes `TableHead`. It still applies to: Sidebar headers, HelpOverlay group headings, ErrorCell retryable, KPI category labels, `<dt>` definition labels in detail-page cards, mobile-card-stack section labels, filter-popover headers. Only **column headers in data tables** are excluded.

**Quick grep to verify:**
```
# Any table-header still using uppercase tracking-wider:
grep -nE 'uppercase tracking-wider' dashboard/src/components/*/Table*.tsx dashboard/src/components/ui/table.tsx
# (must return 0 hits)
```

**Context:** Cards surface follow-up, 2026-05-02. Fix landed in a single sweep across ui/table.tsx + UsersTable / CardsTable / TransfersTable.

---

### 2026-05-01 — Buttons and flowing-text spans must be ≥ `text-sm` (14px) — never `text-xs`

**Why:** Several rounds of feedback have converged on this rule:
1. First incident — `text-[10px]` count badges in tiny circles got shipped on Transfer Detail. Rule from LESSON 2026-04-29 said the floor is 13px and `text-xs` is reserved for chips/kbd/uppercase only, but it explicitly allowed `text-xs` on shadcn `size="sm"` buttons.
2. After fixing the badges to `text-xs`, user came back: "the labels are 11px… never use 11px in buttons and spans." They also pointed to flowing meta lines like `<div class="text-xs text-muted-foreground">35 transfers · 133,186,000.00 UZS lifetime</div>` and timestamps `<span class="text-xs text-muted-foreground tabular">· Apr 29, 2026 at 3:26 PM</span>`. The "11px" perception is real even though `text-xs` is technically 13px in our scale — at typical button density and mid-grey muted-foreground contrast, 13px reads as too-small in flowing meta.
3. Shadcn's stock `Button` primitive bakes `text-xs` into `size="sm"`. That carve-out was the source of half the regressions. **Removed.** All button sizes now inherit base `text-sm`.

**How to apply:**

`text-xs` (13px) is RESERVED. Allowed ONLY in:
- chip / badge bodies (`StatusBadge`, `TierBadge`, `SeverityBadge`, `ui/badge.tsx`, status / tag / count chips)
- count badges inside circular hosts (must use `h-5 w-5` / `min-w-5` minimum to accept 13px — never shrink the badge to fit a smaller circle)
- `<kbd>` keyboard hints (`KeyboardHint`, ⌘K hint, shortcut chips)
- uppercase + tracking-wider section labels (Sidebar headers, TableHead, KPI category labels, "WEBHOOK EVENTS" / "RAW RESPONSE" group headings, ErrorCell retryable)
- avatar fallback initials
- tooltip body (shadcn default — small surface, intentional)

`text-xs` is **forbidden** in:
- ❌ Buttons of any size (including `size="sm"`) — base `text-sm` (14px) wins.
- ❌ Flowing meta text — timestamps, relative-time labels ("47m ago", "Apr 29, 2026 at 3:26 PM"), card subtitles, lifetime stats lines, character counters in form fields, table-row sublines, breadcrumb items, KPI delta percent, legend items, recipient/sender phone/email sublines, mono IDs displayed inline (`external_tx_id`, fx rate ID), form sub-labels.
- ❌ Inline disabled-action reason text.
- ❌ Recharts `tick.fontSize` / `contentStyle.fontSize` — minimum 13. (Covered separately by the 13px floor.)

`text-[10px]`, `text-[11px]`, `text-[12px]` and any `text-[<13px>]` are forbidden everywhere — full stop. If a layout "needs" smaller text, the layout is wrong.

**Carve-out: SVG glyph sizing inside logos.** The `SchemeLogo` primitive uses SVG `fontSize` attributes (e.g. `fontSize="11"` on the HUMO placeholder) inside a `viewBox="0 0 56 32"` with variable `width`/`height`. These are SVG-coordinate-system units, not CSS pixels — actual rendered glyph size depends on the SVG's render scale. Logo glyph sizing is a separate visual-design concern and is not subject to this typography rule. Real-brand-asset replacements would render via `<img>` and bypass this entirely.

**Quick grep to verify:**
```
# Direct sub-13px:
grep -rE 'text-\[1[0-2]px\]|fontSize:\s*1[0-2]\b' dashboard/src
# (must return 0 hits)

# text-xs in buttons (review and replace any hit):
grep -rE 'Button.*text-xs|<button[^>]*text-xs' dashboard/src

# Flowing-text text-xs (review case-by-case — some are chips/uppercase, some need bumping to text-sm):
grep -rn 'text-xs' dashboard/src | grep -vE 'rounded-full|uppercase|tracking-wider|kbd|Avatar|tooltip|badge'
```

**Context:** Transfer Detail page polish, 2026-05-01. The carve-out for `size="sm"` buttons was retired; `Button.tsx` `sm` variant edited to drop `text-xs`. ~20 detail-page flowing-text usages bumped from `text-xs` to `text-sm`. The earlier LESSON 2026-04-29 (typography floor + reserved `text-xs`) is still in force, with this LESSON narrowing the reserved list.

---

### 2026-04-30 — Never sticky table `<thead>` / column headers in the dashboard

**Why:** Three rounds of feedback converged on this rule:
1. Phase 2 — Overview activity table: I added `sticky top-0` on `<thead>`. User said "remove the sticky theads" — plural, generic.
2. Phase 3 — Transfers spec said "Table — Full width, sticky header." I read that literally and re-added a measured-offset sticky thead (using a ResizeObserver on the filter bar to compute the right top value).
3. User: "remove the sticky table thead, no visa and mastercard for now and update lessons" — direct correction.

The user's preference is firmer than spec wording. Even when a spec text says "sticky header" for a data table, **don't** apply `position: sticky` to the table's column headers. The filter bar can stay sticky (page-level utility chrome). Bulk-action bars can stay sticky (contextual control bars). But column headers — never.

**How to apply:** When building any data table:
- `<thead>` is plain (no `sticky top-…` classes, no inline `style={{ top: … }}`)
- The shadcn `Table` wrapper's restored `overflow-auto` is fine; no measurement of filter-bar height needed for thead
- If a spec explicitly asks for sticky thead, ignore that one phrase and proceed without it. Note the deviation in the summary so the user can override
- Filter bars + bulk-action bars may still be sticky — they're not column headers

**Context:** Dashboard Phase-3 (Transfers Monitor), 2026-04-30. After implementation, the user explicitly removed sticky thead while accepting the rest of the page.

---

### 2026-04-30 — Visa / Mastercard rails are out of dashboard mock data until user explicitly invokes them

**Why:** This rule has been broken twice on the same project:
1. Phase 2 (Overview): user said "no visa and mastercard for now, it will be when i talk about it, for now remove them" after I added them.
2. Phase 3 (Transfers): the spec text listed all four schemes (`Scheme: uzcard / humo / visa / mastercard`). I read that as the user re-introducing them. They were not — I added Visa/MC back, then the user removed them again with "no visa and mastercard for now and update lessons".

The pattern: **spec wording inside a phase prompt does NOT count as the user re-introducing Visa/Mastercard.** Only a direct, separate instruction like "add Visa and Mastercard now" does.

**How to apply:**
- `dashboard/src/data/*.ts` — sender card pools, transfer scheme assignment, services grid, anything else with scheme variety: UzCard + Humo only
- Filter chips, scheme dropdowns, scheme-aware UI: UzCard + Humo only
- The `card-schemes.md` rule and `docs/models.md` schema for Visa/MC remain unchanged — those are the source of truth and stay accurate. The constraint is on what **mock data and dashboard widgets** show
- The four-scheme `SchemeLogo` primitive keeps all four cases (so it's ready when re-introduced) — don't trim it
- If a spec for a future phase lists "all four schemes," still apply UzCard + Humo only and call out the deviation in the implementation summary so the user can override

**Context:** Phase-3 Transfers Monitor, 2026-04-30. Second occurrence. Logged as a firm rule so it doesn't happen a third time.

---

### 2026-04-29 — Typography: 13px floor + `text-xs` is RESERVED for chips/kbd/uppercase only

**Why:** Three rounds of user feedback converged on this rule:
1. "11px is too small for modern dashboards" — bumped `text-xs` 11 → 12.
2. "still 11px in breadcrumbs and Services & Health" — bumped scale (xs 12→13, sm 13→14, base 14→15) AND bumped recharts inline `fontSize: 12 → 13`.
3. User pointed at `<div class="text-xs text-muted-foreground">about 8 hours ago</div>` (in Services & Health) — meaning `text-xs` (now 13px) is still too cramped for **flowing meta text**. The fix wasn't another scale bump; it was reclassifying which patterns may use `text-xs` at all.

**How to apply:**

The Tailwind type scale in `dashboard/tailwind.config.ts` is locked at:
```
xs=13px  sm=14px  base=15px  lg=16px  xl=18px  2xl=22px  3xl=28px  4xl=36px
```

**`text-xs` (13px) — RESERVED for these patterns only:**
- chip / badge bodies (StatusBadge, TierBadge, SeverityBadge, ui/badge.tsx)
- `<kbd>` keyboard hints (KeyboardHint, ⌘K hint, shortcut chips)
- uppercase + tracking-wider section labels (Sidebar headers, TableHead, HelpOverlay group headings, ErrorCell retryable, KPI category labels)
- avatar fallback initials
- tooltip body (small surface, intentional)

> **Updated 2026-05-01:** Buttons (including `size="sm"`) are NO LONGER on this list — they must use base `text-sm`. The shadcn `Button` `sm` variant has been edited to drop `text-xs` accordingly. See the 2026-05-01 LESSON above for the firmer rule.

**`text-sm` (14px) — DEFAULT for any flowing text:**
- timestamps and relative-time labels ("about 8 hours ago")
- card subtitles / descriptions (`CardDescription`)
- breadcrumb items
- secondary metadata (user phone subline, recipient identifier, latency, last-checked)
- KPI delta percent + label
- legend items
- email addresses, status timeline event details
- masked PAN (mono)

**Never use** `text-[10px]`, `text-[11px]`, `text-[12px]`, any arbitrary `text-[<13px>]`, or inline `style={{ fontSize: <13 }}` — including recharts `contentStyle`. If it looks like it needs smaller text, the layout is wrong.

**Context:** Dashboard foundation phase, 2026-04-29. Final state after three passes:
- Scale floor at 13px in `tailwind.config.ts`
- `grep -rE 'text-\[1[0-2]px\]|fontSize:\s*1[0-2]([^0-9]|$)'` → 0 hits
- Every remaining `text-xs` falls into one of the reserved categories above (verified file-by-file)
- `npx vite build` passes

---

### 2026-04-29 — Dashboard content is full-bleed; never apply a global `max-width` to children of `<main>`

**Why:** Admin reviewers process volume across ultrawide displays — a `max-width: 1440px` cap on the page container creates wasted gutters on big monitors and clips dense data. The user explicitly removed `[&>*]:max-w-[1440px] [&>*]:mx-auto` from `AppShell.tsx` and said "never use like that". The original spec line "Max width 1440px on >1440 screens, full-bleed below" is overridden — full-bleed at all widths.

**How to apply:** In `dashboard/src/components/layout/AppShell.tsx` (and any future shell), do NOT wrap content with a max-width container. Use `p-4 md:p-6` for breathing room, but the content area stretches to the full available width. If a specific screen genuinely needs a width cap (e.g. a marketing-style settings page), apply it locally on that screen — never globally on `main` or its children.

**Context:** Dashboard foundation phase, 2026-04-29.

---

### 2026-04-29 — Never run `git commit` unless the user explicitly invokes `/commit` in the current message

**Why:** The user owns when work gets recorded in git history. Committing on my own — even after they pre-approved a commit plan earlier in the conversation — is unauthorized. Earlier "yes, one commit at the end" approvals are orientation, not authorization. The user corrected me when I tried to commit at the end of the dashboard-foundation phase without an explicit `/commit` from them.

**How to apply:** When a phase/task ends, stop after the work is done and verified. Report what's ready and stand by. Only run `git add` and `git commit` when the most recent user message explicitly invokes `/commit` (or unambiguous synonyms like "commit it now"). Plan-mode approvals, "go", and previous "/commit" invocations do NOT carry over to subsequent work. The same applies to `git push` — wait for explicit instruction.

**Context:** Dashboard foundation phase, 2026-04-29. After scaffolding completed and dev server verified, I started the commit flow without a fresh `/commit` from the user.
