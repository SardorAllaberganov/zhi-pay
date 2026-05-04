# Status timeline

Vertical timeline of `transfer_events` (or analogous event streams). Past events filled, current event ringed and active, future events hollow. Mirrors admin's [`<StatusTimeline>`](../../../dashboard/src/components/) shape with mobile-first rhythm — smaller timestamps, tighter spacing, identical state machine.

> Status: **First-pass spec, in review.** Direct mobile-tuned mirror of admin's existing component. State semantics never diverge from canonical state machines.

## Source of truth

- Admin reference: [`dashboard/src/components/transfers/StatusTimeline.tsx`](../../../dashboard/src/components/transfers/) (Phase 3 + Phase 5)
- State machine (transfer): [`docs/mermaid_schemas/transfer_state_machine.md`](../../../docs/mermaid_schemas/transfer_state_machine.md)
- Status visuals: [`.claude/rules/status-machines.md`](../../../.claude/rules/status-machines.md)
- Tokens: [`colors.md`](../../tokens/colors.md), [`typography.md`](../../tokens/typography.md), [`spacing.md`](../../tokens/spacing.md)

## Anatomy

```
   ●──────────  Created                   14:32 today · system     ← past · filled circle, solid line
   │
   ●──────────  Auth captured              14:32 today · provider   ← past · filled circle, solid line
   │
   ●──────────  Sent to Alipay             14:33 today · system     ← past · filled circle, solid line
   │
   ◉  ┄ ┄ ┄ ┄  Confirming with Alipay…    14:33 today · provider   ← current · ring, dashed line
   ┊
   ○  ┄ ┄ ┄ ┄  Completed                                            ← future · hollow circle, dashed
```

| Slot | Token / value |
|---|---|
| Container | column flow, `space-y-0` (line connects circles) |
| Circle (past) | 12pt diameter, **filled** with state-tone color (success-600 / brand-600 / danger-600 / warning-600 / slate-500) |
| Circle (current) | 12pt diameter outer ring (2pt) + 6pt inner dot, both in state-tone color |
| Circle (future) | 12pt diameter, 1.5pt outline `slate-300 / slate-600`, hollow center |
| Line (past → past, past → current) | 2pt solid in state-tone color of the entry above |
| Line (current → future, future → future) | 2pt dashed (8/4 dash pattern) in `slate-300 / slate-600` |
| Line height | `space-7` (32pt) between circles — enough room for the label + meta below the upper circle |
| Label | `text-base font-medium` (16pt), slate-900 / slate-100 |
| Meta (timestamp + actor) | `text-sm font-normal text-muted-foreground` (14pt) — never `text-xs` per LESSON 2026-05-01 |
| Optional context (failure_code body, refund amount) | `text-sm font-normal`, slate-700 / slate-300, beneath meta |
| Circle ↔ label gap | `space-3` (12pt) horizontal |
| Active-event subtle pulse | `current` circle's inner dot pulses opacity 1 → 0.5 → 1 over 1500ms infinite. Reduced-motion: static |

## State-tone mapping

Per [`status-machines.md`](../../../.claude/rules/status-machines.md). Color combines with circle-fill state (past/current/future) — never color-alone:

| State (transfer / KYC / card) | Tone | Circle (past) | Circle (current) ring + dot | Connecting line |
|---|---|---|---|---|
| `created`, `pending` | neutral | slate-500 filled | slate-500 ring + dot | slate-300 / slate-600 (forward) |
| `processing` | active | brand-600 filled | brand-600 ring + dot (pulsing) | brand-200 (forward, dashed) |
| `completed`, `passed`, `active` | success | success-600 filled | success-600 ring + dot | success-200 (forward) |
| `failed` | error | danger-600 filled | danger-600 ring + dot | danger-200 (forward) |
| `expired` | warning | warning-600 filled | warning-600 ring + dot | warning-200 (forward) |
| `reversed` | warning | warning-600 filled | warning-600 ring + dot | warning-200 (forward) |
| `frozen` (card lifecycle, rare in timelines) | muted | slate-500 filled | slate-500 ring + dot | slate-300 (forward) |

## Event row data

Every entry in the timeline is built from the canonical event shape:

| Field (from `transfer_events` or analog) | Renders to |
|---|---|
| `state` | label (localized via `common.status.<state>`) |
| `actor` (`system | user | provider | admin`) | meta line: "{actor}" — localized to "system" / "tizim" / "система" |
| `created_at` | timestamp formatted per `users.preferred_language` (relative if < 24h, absolute otherwise) |
| `failure_code` (when state = `failed`) | optional context line below meta — sourced from `error_codes` |
| `context` (jsonb) | not rendered by default; surface on tap-to-expand if there's reviewer-relevant detail (e.g. ops manual reversal reason) |

## States (whole timeline)

| State | Treatment |
|---|---|
| `idle` | full event chain rendered with current event highlighted |
| `loading` (events not yet fetched) | skeleton: 3 placeholder rows with circle + label-block-shimmer + meta-block-shimmer |
| `error` (couldn't fetch events) | render an inline error banner below the transfer summary; "Try again" CTA |
| `expanded entry` (tap an event row to see context) | inline disclosure beneath the entry, surfacing `context` jsonb pretty-printed for ops contexts only — **mobile customer surface keeps `context` hidden by default** |

## Token consumption summary

| Surface | Token |
|---|---|
| Circle (past, fill) | state-tone-600 |
| Circle (current, ring + dot) | state-tone-600 |
| Circle (future, outline) | `slate-300 / slate-600`, 1.5pt |
| Connecting line (forward, past) | state-tone-600 (2pt solid) |
| Connecting line (forward, future) | state-tone-200 or `slate-300 / slate-600`, 2pt dashed (8/4) |
| Circle diameter | 12pt |
| Line spacing | `space-7` (32pt) |
| Label type | `text-base font-medium` |
| Meta type | `text-sm font-normal text-muted-foreground` (never `text-xs`) |
| Optional context type | `text-sm font-normal slate-700 / slate-300` |
| Pulse motion | 1500ms infinite, opacity 1 → 0.5 → 1, `ease-in-out`. Reduced motion: static |

## Composition rules

| Pattern | Rule |
|---|---|
| Inside a Card | Card `radius-md`, `overflow-hidden`; timeline padding `p-5` per Card padding contract. Don't half-override |
| Inside a Sheet (transfer detail summary) | `px-5` matches sheet content; timeline takes the natural vertical space |
| Hero placement on receipt screen | After the `display`-size headline number; vertical rhythm `space-7` (32pt) above the timeline |
| Combined with a Status chip | Chip in detail-page header; timeline sits below — chip is "current state at a glance", timeline is "how we got here" |
| Combined with a banner | Banner above the timeline if a relevant context message applies (e.g. "Refund pending") |
| With long event lists (rare for transfers, never > 7 events) | Truncate "future" entries past the next-2-up; tap "See all states" to expand — but for v1 transfers max out at 5 events typically |

## Accessibility

| Concern | Rule |
|---|---|
| Color-only signals | State combines color + circle-fill state (past/current/future) + label — multi-signal |
| Screen reader | Each event announces as "{state}, {meta}, {timestamp}"; current event prepended with "current step" |
| Live region | When state advances ("processing" → "completed"), live-announce the new entry via `aria-live="polite"` |
| Tap target | Whole row is the tap-target when entries are expandable; ≥ 44pt via padding |
| Focus | Visible focus ring on expandable rows; `--ring` 2pt outset |
| Reduced motion | Pulse falls back to static fill; line dash pattern stays |
| Decorative circles / lines | `aria-hidden="true"`; the label + meta carry meaning |

## Localization

| Slot | Key pattern |
|---|---|
| State label | `common.status.<state>` |
| Actor | `common.actor.<actor>` (system / user / provider / admin) |
| Timestamp | per `users.preferred_language` — relative ("2h ago") if < 24h, absolute (`Apr 29, 2026 at 3:26 PM` en / `29.04.2026 в 15:26` ru) otherwise |
| Failure code body (when state = `failed`) | `common.errors.<CODE>.body` |
| "See all states" expander | `mobile.transfer-detail.timeline.expand` |

- Timestamps follow [`localization.md`](../../../.claude/rules/localization.md): `DD.MM.YYYY` for `uz`/`ru`, `MMM D, YYYY` for `en`.
- Russian state labels run 15–25% longer ("Обрабатывается" for `processing`); the timeline label has plenty of room (single line wraps to two if needed).

## Forbidden patterns

| Don't | Required |
|---|---|
| Inventing states (`awaiting_3ds`, `partial_refund`) in the timeline | Propose a state-machine update first per [`status-machines.md`](../../../.claude/rules/status-machines.md) |
| User-controllable state transitions ("Mark completed" CTA in customer view) | Status moves only via system events. Customer surface NEVER offers state controls |
| `text-xs` on meta or label | `text-sm` floor — LESSON 2026-05-01 |
| Color-only state signal (red line, no label) | State + tone + label always |
| Showing `failure_code` raw (e.g. "ERR_42") | Localized `error_codes.message_*` body |
| Skipping the actor on each event | Per [`status-machines.md`](../../../.claude/rules/status-machines.md): always include actor (`system / user / provider / admin`) |
| Compressing line height to fit more events on screen | `space-7` (32pt) between circles — events are reading material, not a scroll race |
| Auto-collapsing past events into "Earlier" | Past events stay visible — the timeline IS the audit |

## Quick grep to verify (when implemented)

```bash
# text-xs on timeline meta (LESSON 2026-05-01):
grep -rnE 'StatusTimeline.*text-xs|TimelineEvent.*text-xs' mobile/

# Hardcoded state colors:
grep -rnE 'StatusTimeline.*bg-\[#|StatusTimeline.*text-\[#' mobile/

# User-control of state (anti-pattern):
grep -rnE 'StatusTimeline[^>]*\n[^<]*<Button[^>]*Mark|<Button[^>]*Force' mobile/

# Inventing states:
grep -rnE 'state:\s*"(awaiting|partial|cancelled|in_progress|in-progress)"' mobile/
```

## Figma component-set

Single component set `Status timeline` with one `Variant` axis showing the four canonical terminal states for a transfer event stream. Each cell renders 4–5 events with circle + label/meta column.

### Variant axes

| Property | Values | Count |
|---|---|---:|
| `Variant` | `Processing` · `Completed` · `Failed` · `Reversed` | 4 |

= **4 cells**.

### Naming

```
Status timeline   →   Variant=<Variant>
```

### Variable bindings — per row

Each event row has the same anatomy: Left column (20×80 fixed: 12pt circle + 56pt vertical line) + horizontal `space/3` gap + Right column (label `text/body-medium` 16/500 slate-900 + 4pt gap + meta `text/body-sm` 14/400 slate-500).

| Circle state | Bound to |
|---|---|
| `past-filled` | 12pt ELLIPSE, fill bound to state-tone-600 (`color/slate/500` / `color/success/600` / `color/danger/600` / `color/warning/600` / `color/brand/600`) |
| `future-hollow` | 12pt ELLIPSE, no fill, 1.5pt stroke `color/slate/300` |
| `current-ring` (Processing variant only) | 12pt ELLIPSE, no fill, 2pt stroke bound to state-tone-600 (e.g. `color/brand/600`) |

| Line state | Bound to |
|---|---|
| Past → past (solid) | 2pt × 56pt RECTANGLE filled with previous-event's state-tone-600 |
| Past → current / current → future (dashed approximation) | Same RECTANGLE shape but with 0.4 opacity to suggest dashed appearance — Figma's stroke-dash on a fill rect doesn't render as expected; opacity dim is the workaround |

| Variant | Event sequence |
|---|---|
| `Processing` | Created (slate) → Auth captured (success) → Sent to Alipay (success) → Confirming… (current ring brand) → Completed (future hollow) |
| `Completed` | All 5 events filled in success-600 |
| `Failed` | Created → Auth captured → Sent → Failed (terminal danger-600 with `CARD_DECLINED` meta) — 4 events, no future |
| `Reversed` | All 5 success → final Reversed in warning-600 |

### File placement

| Asset | Component-set ID | Position (page `❖ Components`) | Size |
|---|---|---|---|
| `Status timeline` | `128:327` | (700, 8500) | 1496 × 520 |

### Deviations from spec, tracked

| Deviation | Reason | Recovery path |
|---|---|---|
| **Current-event ring with inner dot** simplified to ring-only (no inner 6pt dot) | Figma auto-layout doesn't natively support overlay positioning; nesting a smaller filled ellipse inside a hollow ring requires escaping auto-layout | Detach the current-ring frame and absolutely position a 6pt filled ellipse at the center; or accept the simpler hollow ring as the canonical mobile rendering |
| **Dashed line** rendered as 0.4-opacity solid line | Figma RECTANGLE node fills don't accept stroke-dash; `dashPattern` on the stroke wouldn't render the way the spec describes (the dash needs to be on a 2pt vertical line, not on stroked edges). Opacity dim approximates the dashed effect visually | Use a Vector node or PNG asset for true dashed lines; or accept the opacity approximation |
| **Pulse animation** on current event not built | Animation territory | Smart Animate prototype connection between Processing cell and itself with opacity 1→0.5→1 cycle |
| **Initial layout collapsed cells to 0pt height** | First build set `cell.resize(280, 0)` then expected `primaryAxisSizingMode='AUTO'` to recompute. Resize value stuck. Fixed via explicit `layoutSizingVertical='HUG'` per-cell | Lesson: `resize(_, 0)` on auto-layout containers can stick despite sizing mode; force `layoutSizingVertical='HUG'` explicitly |

## Cross-references

- State machines: [`status-machines.md`](../../../.claude/rules/status-machines.md), [`docs/mermaid_schemas/`](../../../docs/mermaid_schemas/)
- Tokens: [`colors.md`](../../tokens/colors.md) · [`typography.md`](../../tokens/typography.md) · [`spacing.md`](../../tokens/spacing.md) · [`motion.md`](../../tokens/motion.md)
- Primitives: [`chip.md`](../primitives/chip.md) (StatusChip in headers above the timeline)
- Adjacent: [`headline-number.md`](./headline-number.md) (often paired on receipt / detail surfaces)
- Error sourcing: [`error-ux.md`](../../../.claude/rules/error-ux.md)
- Layer rules: [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md)
- Lessons: type floor (2026-05-01), no-state-invention (cross-cuts)
