# Chip & Badge

Three small primitives that carry status, identity, and counts. Used everywhere — history rows, home tier banner, recipient picker, notifications, MyID flow.

> Status: **First-pass spec, in review.** Mirrors admin's [`<Badge>`](../../../dashboard/src/components/ui/badge.tsx), `<StatusBadge>`, `<TierBadge>` shapes. Mobile mostly inherits — the only mobile-specific addition is a `MyID checkmark` glyph baked into the `tier_2` badge.

## Source of truth

- Admin references: [`dashboard/src/components/ui/badge.tsx`](../../../dashboard/src/components/ui/badge.tsx), [`StatusBadge`](../../../dashboard/src/components/transfers/StatusBadge.tsx) (transfer status), `TierBadge` (KYC tier)
- Tokens: [`colors.md`](../tokens/colors.md), [`typography.md`](../tokens/typography.md), [`spacing.md`](../tokens/spacing.md), [`radii.md`](../tokens/radii.md)
- Status state machines: [`docs/mermaid_schemas/`](../../../docs/mermaid_schemas/) (transfer / kyc / card)
- KYC tier semantics: [`.claude/rules/kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md)

## The three primitives

| Primitive | Purpose | Tokens consumed |
|---|---|---|
| `StatusChip` | Communicates the current state of a transfer / KYC / card | semantic 3-stop ramps (success / warning / danger / neutral) |
| `TierBadge` | Communicates the user's KYC tier | brand ramp + slate ramp + MyID glyph (tier_2) |
| `CountBadge` | Numeric overlay on icons (notifications, mailbox) | brand-600 / danger-600 / slate-500 |

> `text-xs` (13pt) is **allowed** here — chip / badge bodies are one of the reserved categories per LESSON 2026-04-29. Tap-area is enforced by the parent row, not the chip itself.

## Anatomy — StatusChip

```
       ╭─────────────────────╮
       │  ●   Completed       │       28pt height · radius-pill
       ╰─────────────────────╯       text-xs (13pt) font-medium
        ↑    ↑
        dot  label
        8pt  space-1 (4pt) gap
```

| Slot | Token / value |
|---|---|
| Container | `radius-pill` (9999px), 28pt height |
| Padding (X) | `space-2` (8pt) start, `space-3` (12pt) end |
| Padding (Y) | `space-1` (4pt) — keeps 28pt height |
| Surface fill | semantic 50-stop (`success-50` / `warning-50` / `danger-50` / `slate-100`) |
| Status dot | 8pt diameter, `radius-pill`, semantic 600-stop (`success-600` etc.) |
| Label color | semantic 700-stop (`success-700` / `warning-700` / `danger-700` / `slate-700`) |
| Type | `text-xs` (13pt) `font-medium` (Title Case as authored — never `uppercase tracking-wider`) |
| Border | none — fill carries the contrast |
| Gap (dot → label) | `space-1` (4pt) |

## StatusChip — state mapping

Per [`status-machines.md`](../../../.claude/rules/status-machines.md). **Never invent a state.** If a chip needs to render a state that isn't in the canonical list below, propose a state-machine update first.

### Transfer status (5 canonical states + `created`)

| State | Tone | Surface | Dot | Label | Notes |
|---|---|---|---|---|---|
| `created` | neutral | `slate-100` | `slate-500` | "Created" | Brief — usually transitions to `processing` within seconds |
| `processing` | active | `brand-50` | `brand-600` (animated pulse) | "Processing" | Pulse: opacity 1 → 0.4 → 1 over 1500ms, infinite, `ease-in-out`. Reduced-motion: static dot. |
| `completed` | success | `success-50` | `success-600` | "Completed" | Terminal success state |
| `failed` | error | `danger-50` | `danger-600` | "Failed" | Terminal failure; chip pairs with localized `failure_code` text below |
| `reversed` | warning | `warning-50` | `warning-600` | "Reversed" | Terminal — partial / full refund landed |

### KYC status

| State | Tone | Surface | Dot | Label |
|---|---|---|---|---|
| `pending` | neutral | `slate-100` | `slate-500` | "Pending" |
| `passed` | success | `success-50` | `success-600` | "Passed" |
| `failed` | error | `danger-50` | `danger-600` | "Failed" |
| `expired` | warning | `warning-50` | `warning-600` | "Expired" |

### Card status

| State | Tone | Surface | Dot | Label |
|---|---|---|---|---|
| `active` | success | `success-50` | `success-600` | "Active" |
| `frozen` | muted | `slate-100` | `slate-500` (with lock icon overlay) | "Frozen" |
| `expired` | warning | `warning-50` | `warning-600` | "Expired" |
| `removed` | (chip not rendered — card hidden from list) | — | — | — |

### Sizes

| Size | Height | Type | Dot | Use |
|---|---:|---|---:|---|
| `sm` | 24pt | `text-xs` | 6pt | Inline in dense list rows (history row meta) |
| `md` | 28pt | `text-xs` | 8pt | **Default.** Detail page headers, banner hosts |
| `lg` | 32pt | `text-sm` | 10pt | Hero / receipt screens — the chip is its own focal element |

## Anatomy — TierBadge

```
   ╭──────────╮
   │  Tier 0  │      slate-100 surface · slate-700 label
   ╰──────────╯

   ╭──────────╮
   │  Tier 1  │      brand-50 surface · brand-700 label
   ╰──────────╯

   ╭───────────────╮
   │ ✓  Tier 2     │   brand-600 surface · white label · MyID checkmark
   ╰───────────────╯
```

| Tier | Surface | Label color | Glyph | When |
|---|---|---|---|---|
| `tier_0` | `slate-100` | `slate-700` | none | Just signed up; cannot transfer per [`kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md) |
| `tier_1` | `brand-50` | `brand-700` | none | Phone-verified |
| `tier_2` | `brand-600` (solid) | `--primary-foreground` (white) | lucide `<BadgeCheck>` 14pt, white | Full MyID-verified |

| Slot | Token / value |
|---|---|
| Container | `radius-pill` |
| Height | 24pt (`sm`), 28pt (`md` default), 32pt (`lg`) |
| Padding (X) | `space-3` (12pt); 10pt when `tier_2` glyph present |
| Type | `text-xs` (13pt) `font-medium` |
| Glyph (tier_2 only) | lucide `<BadgeCheck>` 14pt, gap `space-1` (4pt) before label |

## Anatomy — CountBadge

Numeric overlay sitting on top of an icon (notifications bell, mailbox, history badge in the tab bar).

```
            ╭─────╮
            │  3  │     20pt circle for 1-digit
            ╰─────╯

            ╭───────╮
            │  12   │   24pt pill for 2-digit
            ╰───────╯

            ╭────────╮
            │  99+   │   28pt pill — overflow
            ╰────────╯
```

| Slot | Token / value |
|---|---|
| Container | `radius-pill` |
| Min size | 20 × 20pt (1 digit) — never smaller; under 20pt the type drops below 13pt floor |
| Surface (default) | `--destructive` (`danger-600`) — matches OS notification convention |
| Surface (alt) | `--primary` (`brand-600`) for non-attention badges (e.g. "12 saved recipients") |
| Surface (muted) | `slate-500` for already-seen counts |
| Label color | `--destructive-foreground` / `--primary-foreground` — always white |
| Type | `text-xs` (13pt) `font-semibold` `tabular-nums` |
| Padding (X) | `space-2` (8pt) for 2+ digits; `0` for single digit (centered) |
| Overflow | `99+` past 99 — never render `100`, `247` etc. inline; use a separate counter |
| Position (overlay) | absolute, `top: -4pt`, `right: -4pt` of host icon |
| Border (overlay variant) | 2pt border in host's surface color (`--background`) — punches the badge out of the icon visually |

## States (cross-primitive)

| State | Treatment |
|---|---|
| `idle` | base palette per state mapping |
| `interactive` (chip can be tapped to open detail) | adds `hover:bg-{surface}/80` + `active:scale-[0.98]`; tap-area inflates to ≥ 44pt via parent-row padding |
| `loading` | not applicable — chips reflect server-state, never user-action-pending |
| `disabled` | `opacity-60`; reserved for tier upgrade affordances ("Tier 2 — locked") |

## Token consumption summary

| Surface | Token |
|---|---|
| Container background | semantic 50 (success/warning/danger), `slate-100` (neutral / muted), `brand-50` / `brand-600` (tier) |
| Label color | semantic 700, `slate-700`, `brand-700` / white |
| Status dot | semantic 600 |
| Border radius | `radius-pill` |
| Height | 24 / 28 / 32pt |
| Padding (X) | `space-2` … `space-3` |
| Type | `text-xs` font-medium (sm / md), `text-sm` font-medium (lg only) |
| Tier-2 glyph | lucide `<BadgeCheck>` 14pt |

## Accessibility

| Concern | Rule |
|---|---|
| Color-only signals | Never. Status chips pair color with **dot + label**; tier badges pair color with **label + glyph** (tier_2); count badges pair color with **number** |
| Contrast | Label-on-surface ≥ 4.5:1 body / 3:1 large. Verified: success-700 on success-50 = 8.0:1, warning-700 on warning-50 = 7.6:1, danger-700 on danger-50 = 8.4:1, brand-700 on brand-50 = 7.5:1, white on brand-600 = 5.6:1. All pass AA body. |
| Tap target | Chips are usually non-interactive (state display). When interactive, parent row provides ≥ 44pt tap-area; chip itself stays at 24–32pt visual |
| Screen reader | Status chip announces as `"Status: {label}"`; tier badge as `"KYC tier: {label}"`; count badge as `"{count} unread"` (with localized noun) |
| Decorative dots / glyphs | `aria-hidden="true"` — label text carries the meaning |
| Reduced motion | Processing-state dot pulse falls back to static fill |

## Localization

| Slot | Key pattern |
|---|---|
| Status label | `common.status.<state>` — e.g. `common.status.completed` ("Completed" / "Bajarildi" / "Завершено") |
| Tier label | `common.tier.<tier>` — e.g. `common.tier.tier-2` ("Tier 2" / "Daraja 2" / "Уровень 2") |
| MyID glyph announcement | `common.tier.tier-2.aria-label` ("MyID-verified") |
| Count noun | ICU plural — e.g. `mobile.notifications.unread-count`: `{count, plural, one {# unread} other {# unread}}` |

- All status / tier labels are **Title Case as authored** in i18n. Never `uppercase tracking-wider` on chips — that's reserved for the table-header / sidebar / kpi-label bucket and was removed from data-table headers per LESSON 2026-05-02.
- Width-test labels in `ru` (longest typical run: "Обрабатывается" for `processing`).

## Composition rules

| Pattern | Rule |
|---|---|
| Chip + label-row | Chip stays at the **end** of the row (`ml-auto`); doesn't compete with the row's primary content |
| Multiple chips on one row | Max two — beyond that the row reads as cluttered. Group rest under "More" |
| Chip + amount | Amount on the left, chip on the right (`justify-between`) |
| Chip in detail header | `md` size; sits on its own row (or on the identity row) per LESSON 2026-05-02 — detail-page headers flow inline (NEVER sticky) |
| Tier badge in home banner | `lg` size; pairs with progress meter showing daily-headroom (per [`kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md)) |
| Count badge on tab-bar icon | `sm` overlay variant; max value `99+`; localized aria-label |

## Forbidden patterns

| Don't | Required |
|---|---|
| Inventing states (`awaiting_3ds`, `partial_refund`) | Propose a state-machine update first per [`status-machines.md`](../../../.claude/rules/status-machines.md) |
| `uppercase tracking-wider` on chip labels | Title Case as authored — `text-xs font-medium` |
| Color-only status (red border, no dot, no label) | Color + dot + label, every time |
| Hard-coding hex values (e.g. `#22c55e`) | `success-600` token |
| Tier_2 badge without the MyID glyph | Glyph is part of the contract — the only mobile-specific deviation in this layer |
| Count badge < 20pt | Type would drop below 13pt floor |
| Count overflow rendered as `247` | Cap at `99+` |
| Chip used as a button without inflating tap-area | Parent row inflates to 44pt; chip stays visually 24–32pt |
| Failure chip without surfacing localized `failure_code` text | Per [`error-ux.md`](../../../.claude/rules/error-ux.md), failure chip + reason text are inseparable |

## Quick grep to verify (when implemented)

```bash
# Uppercase / tracking-wider on chip labels — must return 0 hits:
grep -rnE 'StatusChip.*uppercase|TierBadge.*uppercase|chip.*tracking-wider' mobile/

# Hardcoded chip hex / arbitrary radius — must return 0 hits:
grep -rnE 'chip[^.]*#[0-9a-fA-F]|StatusChip.*rounded-\[' mobile/

# Inline status states not in the canonical list — review each hit:
grep -rnE 'status:\s*"(awaiting|partial|cancelled|in_progress)"' mobile/
```

## Cross-references

- Tokens: [`colors.md`](../tokens/colors.md) · [`typography.md`](../tokens/typography.md) · [`spacing.md`](../tokens/spacing.md) · [`radii.md`](../tokens/radii.md)
- State machines: [`status-machines.md`](../../../.claude/rules/status-machines.md), [`docs/mermaid_schemas/`](../../../docs/mermaid_schemas/)
- Tier semantics: [`kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md)
- Error display: [`error-ux.md`](../../../.claude/rules/error-ux.md)
- Localization: [`localization.md`](../../../.claude/rules/localization.md)
- Layer rules: [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md)
- Lessons: typography reserved categories (2026-04-29), table-header normalization (2026-05-02)
