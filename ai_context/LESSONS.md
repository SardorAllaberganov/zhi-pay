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
