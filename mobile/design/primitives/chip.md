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

## Figma component-set

Three component sets, all under the `Chip / *` namespace per [`tokens/figma-setup.md`](../tokens/figma-setup.md). They share the `radius/pill` corner + `text/label` (Sm/Md) or `text/body-sm-medium` (Lg) typography contract but otherwise diverge — so they're authored as **three discrete sets** rather than one mega-axis set, matching the asset-panel rhythm Card / Banner / Button already established (≤ 30 cells per set).

> Built in Figma 2026-05-04 alongside Button as part of Pass 2.

### Set 1 · `Chip / Status` (30 cells)

#### Variant axes

| Property | Values | Count |
|---|---|---:|
| `Status` | `Created` · `Processing` · `Completed` · `Failed` · `Reversed` · `Pending` · `Passed` · `Expired` · `Active` · `Frozen` | 10 |
| `Size` | `Sm` · `Md` · `Lg` | 3 |

`Failed` and `Expired` are deduped across transfer / KYC / card domains (same tone + label; consumer disambiguates by row context, not by domain prefix). The animated pulse on `Processing` lives at code time per [`motion.md`](../tokens/motion.md) — Figma cell renders the dot static at full opacity.

#### Naming

```
Chip / Status   →   Status=<Status>, Size=<Size>
```

Examples: `Status=Completed, Size=Md`, `Status=Failed, Size=Lg`, `Status=Frozen, Size=Sm`.

#### Variable bindings — per cell

##### Container (frame)

| Property | Bound to |
|---|---|
| Fill | per status (see surface table below) |
| Padding-Left | `space/2` (8pt) |
| Padding-Right | `space/3` (12pt) |
| Item spacing | `space/1` (4pt) — gap between dot and label |
| Padding-Top / Bottom | `0` (height carried by fixed `height`) |
| Corner radius (all 4) | `radius/pill` |
| Auto Layout direction | Horizontal · `counterAxisAlignItems: CENTER` |
| Width | Hug contents |
| Height | Fixed: 24 (`Sm`) · 28 (`Md`) · 32 (`Lg`) |

##### Status-tone mapping (the matrix)

| Status | Surface (Container fill) | Dot fill | Label color |
|---|---|---|---|
| `Created` · `Pending` · `Frozen` | `color/slate/100` | `color/slate/500` | `color/slate/700` |
| `Processing` | `color/brand/50` | `color/brand/600` | `color/brand/700` |
| `Completed` · `Passed` · `Active` | `color/success/50` | `color/success/600` | `color/success/700` |
| `Failed` | `color/danger/50` | `color/danger/600` | `color/danger/700` |
| `Reversed` · `Expired` | `color/warning/50` | `color/warning/600` | `color/warning/700` |

> The 5-tone palette × 10 statuses dedupes naturally — colors map by intent, not by domain. Three statuses share the slate (neutral) tone; three share success; two share warning; one each on brand / danger.

##### Dot (ellipse)

| Property | Bound to |
|---|---|
| Width × Height | `Sm` 6×6 · `Md` 8×8 · `Lg` 10×10 |
| Fill | per status (see matrix above) — semantic 600-stop |

##### Label (text)

| Property | Bound to |
|---|---|
| Text Style | `text/label` (Sm + Md) · `text/body-sm-medium` (Lg) |
| `textCase` | `ORIGINAL` (overrides `text/label`'s baked `UPPER` — chips are Title Case as authored per [LESSON 2026-05-02](../../../ai_context/LESSONS.md)) |
| `letterSpacing` | `0%` (overrides `text/label`'s baked `+0.04em` — same reason) |
| Fill | per status (see matrix above) — semantic 700-stop |

> The `text/label` foundation Style is set up for uppercase + tracking ("uppercase section labels" use case). Chip labels override both at the layer level. **This is a one-off; if a second consumer needs the same override pattern, propose a `text/label-titlecase` Style addition in [`tokens/figma-setup.md`](../tokens/figma-setup.md).**

##### Effect (focus ring)

None on chips. Tap-area is enforced by the parent row at the Components / Patterns layer, not on the chip itself.

### Set 2 · `Chip / Tier` (9 cells)

#### Variant axes

| Property | Values | Count |
|---|---|---:|
| `Tier` | `Tier0` · `Tier1` · `Tier2` | 3 |
| `Size` | `Sm` · `Md` · `Lg` | 3 |

The MyID glyph is **baked into the `Tier2` cell** at all three sizes — not a separate axis. Per spec line "Tier_2 badge without the MyID glyph" forbidden, the glyph is part of the contract.

#### Naming

```
Chip / Tier   →   Tier=<Tier>, Size=<Size>
```

Examples: `Tier=Tier0, Size=Md`, `Tier=Tier2, Size=Lg`.

#### Variable bindings — per cell

##### Container (frame)

| Tier | Fill | Padding-Left | Padding-Right | Item spacing |
|---|---|---|---|---|
| `Tier0` · `Tier1` | per Tier surface (below) | `space/3` (12pt) | `space/3` (12pt) | `space/1` (4pt — unused, no glyph) |
| `Tier2` | `color/primary` | `space/2` (8pt — tighter to compensate for glyph) | `space/3` (12pt) | `space/1` (4pt — gap before label) |

| Property | Bound to |
|---|---|
| Padding-Top / Bottom | `0` |
| Corner radius (all 4) | `radius/pill` |
| Auto Layout | Horizontal · `counterAxisAlignItems: CENTER` |
| Height | Fixed: 24 (`Sm`) · 28 (`Md`) · 32 (`Lg`) |

##### Tier-tone mapping

| Tier | Surface (fill) | Label color | Glyph |
|---|---|---|---|
| `Tier0` | `color/slate/100` | `color/slate/700` | none |
| `Tier1` | `color/brand/50` | `color/brand/700` | none |
| `Tier2` | `color/primary` (brand-600 light / brand-500 dark) | `color/primary-foreground` (white via `color/base/white`) | white check-in-rounded glyph |

##### Glyph (Tier2 only)

The spec calls for lucide `<BadgeCheck>`. The Figma file's icon library currently ships 13 lucide components but **does not include `BadgeCheck`** — the `Tier2` cell uses **`Icon / CheckCircle2`** as a stand-in (visually close: round shape with internal check; same MyID-verified semantics). Glyph fills are overridden to `color/primary-foreground` at instance time.

| Size | Glyph dimensions |
|---|---|
| `Sm` | 12 × 12 |
| `Md` | 14 × 14 |
| `Lg` | 16 × 16 |

> **Deviation, tracked.** When `Icon / BadgeCheck` lands in the icon library, swap the instance reference in all three Tier2 cells. No other binding changes required.

##### Label (text)

| Property | Bound to |
|---|---|
| Text Style | `text/label` (Sm + Md) · `text/body-sm-medium` (Lg) |
| `textCase` | `ORIGINAL` (same chip Title Case override) |
| `letterSpacing` | `0%` |
| Fill | per Tier (see mapping above) |

### Set 3 · `Chip / Count` (18 cells)

#### Variant axes

| Property | Values | Count |
|---|---|---:|
| `Digits` | `One` · `Two` · `Overflow` (renders `99+`) | 3 |
| `Tone` | `Destructive` · `Brand` · `Muted` | 3 |
| `Border` | `None` · `Stroked` (2pt `color/background` ring for icon-overlay use) | 2 |

`Digits=One` renders as a 20×20 square (centered, no horizontal padding) — `radius/pill` rounds it to a circle. `Two` and `Overflow` render as auto-width pills with `space/2` (8pt) horizontal padding.

#### Naming

```
Chip / Count   →   Digits=<Digits>, Tone=<Tone>, Border=<Border>
```

Examples: `Digits=One, Tone=Destructive, Border=None`, `Digits=Overflow, Tone=Brand, Border=Stroked`.

#### Variable bindings — per cell

##### Container (frame)

| Property | Bound to |
|---|---|
| Fill | per Tone (see mapping below) |
| Stroke (when `Border=Stroked`) | `color/background` · 2pt · `OUTSIDE` align |
| Padding-Left / Right (Digits=One) | `0` (centered single digit) |
| Padding-Left / Right (Digits=Two / Overflow) | `space/2` (8pt) |
| Padding-Top / Bottom | `0` |
| Item spacing | `0` |
| Corner radius (all 4) | `radius/pill` |
| Auto Layout | Horizontal · `primaryAxisAlignItems: CENTER` · `counterAxisAlignItems: CENTER` |
| Height (fixed) | `One` 20 · `Two` 24 · `Overflow` 28 |
| Width | `One` fixed 20 · `Two` / `Overflow` Hug contents |

##### Tone mapping

| Tone | Surface (fill) | Label color |
|---|---|---|
| `Destructive` | `color/destructive` (`danger/600`) | `color/destructive-foreground` (white) |
| `Brand` | `color/primary` (brand/600 light · brand/500 dark) | `color/primary-foreground` (white) |
| `Muted` | `color/slate/500` | `color/base/white` (white via primitive — no `slate-foreground` semantic) |

##### Label (text)

| Property | Bound to |
|---|---|
| Text Style | `text/label` (13pt) at all `Digits` values |
| **Weight override** | **`Inter Semi Bold` (600)** — `text/label`'s default weight is Medium (500); spec calls for `font-semibold` (600). One-off layer-level override; no new Text Style added |
| `textCase` | `ORIGINAL` (chip Title Case override) |
| `letterSpacing` | `0%` |
| `font-variant-numeric` | `tabular-nums` (already on every Text Style by default per [`figma-setup.md`](../tokens/figma-setup.md) "Font features") |
| Fill | per Tone (see mapping above) |

> **Why no new `text/label-semibold` Style?** A single-component need doesn't justify a foundation addition — the figma-setup ledger is already at 13 Text Styles. If a second consumer needs the same Medium→Semibold override, lift the override into a new Text Style and update both consumers in one pass.

##### Border (Stroked variant) behavior

The `Stroked` variant exists to make CountBadge readable when **overlaid on a tab-bar icon or notifications bell** — the 2pt `color/background` ring "punches" the badge out of the icon's silhouette. On a page-background surface (like the component-set preview), the ring blends into the background and reads as identical to `Border=None` — that's correct: the ring's job is to disambiguate against the host icon, not the page.

### Effect (focus rings, shadows)

None on any chip primitive. Chips are non-interactive at this layer (state display); focus + hover treatment lives at the parent-row level in the Components layer.

### Skip cells

None. All variant combinations are authored:
- `Chip / Status`: 10 × 3 = 30 (no skips)
- `Chip / Tier`: 3 × 3 = 9 (no skips)
- `Chip / Count`: 3 × 3 × 2 = 18 (no skips)

**Total: 57 cells across 3 component sets.**

### Deviations from spec, tracked

| Deviation | Reason | Recovery path |
|---|---|---|
| `Tier2` glyph uses `Icon / CheckCircle2` instead of `BadgeCheck` | `BadgeCheck` not yet in the icon library (file ships 13 lucide icons, BadgeCheck not among them) | Add `Icon / BadgeCheck` to the library, swap instance reference in all 3 Tier2 cells |
| `Frozen` status has no inline lock icon (spec line "with lock icon overlay") | `Lock` not yet in the icon library; admin-only territory; ambiguity-free without the glyph | Add `Icon / Lock` to the library, append a small leading icon slot to the `Frozen` cells (Sm 10pt · Md 12pt · Lg 14pt) |
| `text/label` requires per-layer `textCase: ORIGINAL` + `letterSpacing: 0%` overrides | Foundation `text/label` baked uppercase + tracking for "section label" use; chip spec is firm on Title Case + 0 tracking | Either accept the per-layer override (current state — used in 39 chip cells) OR split foundation into `text/label-uppercase` + `text/label-titlecase` if a 4th consumer surfaces |
| `CountBadge` label weight = Semibold via `fontName` override (not via Style) | No `text/label-semibold` Style exists | If a 2nd Semibold consumer at 13pt appears, lift the override into a new Text Style |
| `Processing` dot static (not animated) | Figma component sets render still frames; pulse animation is a code-time concern | Smart Animate prototype connection on the dot opacity (1 → 0.4 → 1 over 1500ms) when a prototype demo is needed |

### File placement

| Set | Component-set ID | Position (page `❖ Components`) |
|---|---|---|
| `Chip / Status` | `71:92` | `(100, 3720)` · 510 × 680 |
| `Chip / Tier` | `75:29` | `(700, 3720)` · 510 × 288 |
| `Chip / Count` | `78:44` | `(1300, 3720)` · 320 × 624 |

Sits below the existing `Button` set (`(180, 3080)`) at y=3720+. The next primitive (Avatar) lands further down in Pass 2.

## Cross-references

- Tokens: [`colors.md`](../tokens/colors.md) · [`typography.md`](../tokens/typography.md) · [`spacing.md`](../tokens/spacing.md) · [`radii.md`](../tokens/radii.md)
- State machines: [`status-machines.md`](../../../.claude/rules/status-machines.md), [`docs/mermaid_schemas/`](../../../docs/mermaid_schemas/)
- Tier semantics: [`kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md)
- Error display: [`error-ux.md`](../../../.claude/rules/error-ux.md)
- Localization: [`localization.md`](../../../.claude/rules/localization.md)
- Layer rules: [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md)
- Lessons: typography reserved categories (2026-04-29), table-header normalization (2026-05-02)
