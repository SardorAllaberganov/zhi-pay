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
- button `size="sm"` variant
- tooltip body (small surface, intentional)

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
