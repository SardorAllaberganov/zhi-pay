# Sheet (bottom sheet)

The mobile workhorse for contextual surfaces. Recipient picker, currency picker, status detail, send-from-card picker, contextual overflow actions, MyID step confirmations. Drag handle at top, content area in the middle, optional sticky-bottom action row.

> Status: **First-pass spec, in review.** No direct admin equivalent (admin uses Side panes / Dialogs). Mobile-specific by definition. Mirrors common iOS / Android sheet ergonomics.

## Source of truth

- Library hint: [`vaul`](https://vaul.emilkowal.ski/) (React drawer/sheet primitive) — same library admin uses for mobile-bottom-sheet variants of dropdowns
- Tokens: [`colors.md`](../../tokens/colors.md), [`spacing.md`](../../tokens/spacing.md), [`radii.md`](../../tokens/radii.md), [`shadows.md`](../../tokens/shadows.md), [`motion.md`](../../tokens/motion.md)
- Accessibility floor: [`.claude/rules/accessibility.md`](../../../.claude/rules/accessibility.md)

## Snap points

Three snap-point options. A sheet declares which it supports.

| Snap | Height | Use |
|---|---|---|
| `peek` | 25% of viewport | Disclosure-only ("What does this fee mean?"), brief context, language picker quick view |
| `half` | 50% of viewport | **Default.** Recipient picker, send-from-card picker, transfer-detail summary |
| `full` | 92% of viewport (top 8% always shows the dimmed page behind) | Long-form content — full transfer detail, search-with-results, recipient list with 50+ entries |

The user can drag between supported snaps. Releasing past 30% of the way to the next snap commits to it.

> **`full` is not a modal.** It still preserves the 8% "I came from somewhere" affordance at top. For full-viewport coverage, use [`modal.md`](./modal.md).

## Anatomy

```
            ╭───────────────[ scrim · bg-black/40 ]───────────────╮
            │                                                    │
            │  (page content visible behind, dimmed)              │
            │                                                    │
            │                                                    │
            │  ╭────[ Sheet · radius-lg top corners (20pt) ]──╮  │
            │  │                                              │  │
            │  │              ▬▬▬▬                            │  │   drag handle
            │  │                                              │  │
            │  │  Pick a recipient            ✕               │  │   header (optional)
            │  │  ─────────────────────────────────           │  │
            │  │                                              │  │
            │  │  [content — list rows, form, picker, etc.]   │  │
            │  │                                              │  │
            │  │                                              │  │
            │  │  ┌──────────[ sticky-bottom action ]──────┐  │  │
            │  │  │   Continue                              │  │  │
            │  │  └─────────────────────────────────────────┘  │  │
            │  │                                              │  │
            │  ╰──────────────────────────────────────────────╯  │
            ╰────────────────────────────────────────────────────╯
                                                                ↑
                                                          safe-area-bottom
```

| Slot | Token / value |
|---|---|
| Scrim (backdrop) | `bg-black/40` (40% opacity); fades in at `duration-base` (220ms) |
| Sheet container | `bg-card` light / `slate-900` dark |
| Sheet top radius | `radius-lg` (20pt) — top two corners only; bottom flush to safe-area edge |
| Sheet shadow | `shadow-lg` light / none dark (surface contrast carries it) |
| Drag handle | 36 × 4pt rounded bar, `slate-300` light / `slate-600` dark, top-centered, `mt-2` (8pt) from top edge, tappable surrounding 44pt |
| Header padding | `space-5` (20pt) all sides — Card's contract carries here |
| Header title | `text-lg font-semibold` (16pt at default scale), slate-900 / slate-100 |
| Header dismiss-X | optional; lucide `<X>` 20pt in 44pt tap-area, top-right |
| Content padding | `space-5` (20pt) horizontal; vertical depends on content (list rows extend flush via composition rules) |
| Content scroll | `overflow-y-auto`; sheet itself doesn't scroll, only content does |
| Sticky-bottom action | optional; `border-t border-border`, `p-4`, `bg-card` (matches sheet); buttons `w-full` if single, `flex-1` each if pair |
| Safe-area-bottom buffer | sticky-bottom action wraps `pb-{safe-area-bottom + space-2}` |

## States

| State | Treatment |
|---|---|
| `closed` | not rendered; scrim absent |
| `opening` | scrim fades in (`opacity 0→1`, `duration-base`); sheet slides up from `translateY(100%)` to its snap (`duration-base`, `ease-standard`) |
| `idle` | rendered at snap point; user can drag, scroll content, or interact |
| `dragging` | sheet follows finger; scrim opacity tracks position (further up = darker) |
| `snapping` | release between snaps → animate to nearest at `duration-fast` (90ms) |
| `closing` | sheet slides down to `translateY(100%)`; scrim fades out at `duration-base` |
| `loading` (sheet content async) | content area shows skeleton while sheet stays at chosen snap |

## Token consumption summary

| Surface | Token |
|---|---|
| Scrim | `bg-black/40` |
| Sheet fill | `bg-card` |
| Top corners | `radius-lg` (20pt) |
| Drag handle | 36 × 4pt, `slate-300 / slate-600` |
| Header padding | `space-5` (20pt) |
| Header title | `text-lg font-semibold` |
| Content padding | `space-5` horizontal |
| Sticky action border | `border-t border-border` |
| Action padding | `p-4` (16pt) |
| Motion | `duration-base` (220ms) open / close, `duration-fast` (90ms) snap, `ease-standard` |
| Shadow | `shadow-lg` (light) |

## Composition rules

| Pattern | Rule |
|---|---|
| Sheet with list rows | List rows extend flush to sheet edges via composition rule from [`list-row.md`](./list-row.md). Sheet's content area `px-0`; rows own their own `px-4` |
| Sheet with form | Form `px-5`; rows of inputs stack with `space-y-4` per [`spacing.md`](../../tokens/spacing.md) |
| Sheet with hero number / detail | Headline number primitive (Components-layer) + meta beneath, all `px-5` |
| Sheet with sticky-bottom action | Sticky action sits above safe-area-bottom; `pb-{safe-area-bottom + space-2}` clearance; content area scrolls behind it |
| Multiple sheets stacked | Allowed but discouraged — second sheet renders above first; first sheet stays at last snap behind. Past two stacks, refactor to a single sheet with a stepper |
| Sheet inside a modal | Forbidden. Modals are full-screen; sheets dismiss before opening a modal |
| Sheet that opens a modal | Allowed; modal pushes the sheet to background until dismissed |
| Toast above sheet | Toasts render above sheet's z-order; verify they don't obscure the sticky action |

## Accessibility

| Concern | Rule |
|---|---|
| Focus trap | Sheet traps focus; Esc / dismiss-X / scrim-tap closes the sheet and returns focus to the trigger |
| Initial focus | First focusable element inside the sheet (header dismiss-X if present, else first content control) |
| Screen reader | `role="dialog"` `aria-modal="true"` `aria-labelledby` pointing at the header title; if no header, `aria-label` carries the purpose |
| Drag handle | Decorative for visual users; SR users get a "Close sheet" affordance via the X or scrim-tap |
| Tap target | Drag handle visual 36 × 4pt with surrounding 44 × 44pt tap-area; dismiss-X 20pt visual in 44pt tap-area |
| Reduced motion | Slide-up / slide-down replaced with opacity fade at `duration-fast`; drag still works |
| Background interaction | Page behind is `aria-hidden="true"` while sheet is open |
| Keyboard | Esc closes; Tab cycles within the sheet; Enter activates focused control |
| Scrim tap-to-dismiss | Optional per use case — passing `dismissible: false` disables (e.g. mid-MyID step where state would be lost) |

## Use cases (canonical)

| Trigger | Snap | Header | Sticky action | Dismissible |
|---|---|---|---|---|
| "Pick a recipient" (Send flow) | `half` ↔ `full` | "Pick a recipient" + dismiss-X | "Continue" (after selection) | scrim-tap allowed |
| "Send from card" (Send flow) | `half` | "Send from" + dismiss-X | none | scrim-tap allowed |
| Transfer detail summary (history → detail) | `half` ↔ `full` | masked PAN + status chip in header row | "View receipt" / "Contact support" | scrim-tap allowed |
| "What does this fee mean?" (Send review) | `peek` | none — small disclosure | none | scrim-tap allowed |
| Language picker (Settings) | `half` | "Language" + dismiss-X | none — selection auto-applies | scrim-tap allowed |
| MyID step confirmation | `half` | "Confirm details" | "Continue" | **`dismissible: false`** — losing state mid-MyID is a bad UX |
| Receipt actions overflow ("Share / Export / Report issue") | `peek` | none | none — list rows are the actions | scrim-tap allowed |
| Card-management overflow (Freeze, Set default, Remove) | `peek` | none | none | scrim-tap allowed |

## Localization

| Slot | Key pattern |
|---|---|
| Header title | `mobile.<surface>.<screen>.sheet-<id>.title` |
| Sticky action label | `mobile.<surface>.<screen>.sheet-<id>.cta` |
| Dismiss aria-label | `common.sheet.dismiss.aria-label` |

- Russian header titles run 15–25% longer; the header has plenty of room (single-line at default snap) — no special handling needed.
- The sheet itself is locale-agnostic; content inside follows per-component localization rules.

## Forbidden patterns

| Don't | Required |
|---|---|
| `radius-md` (12pt) on sheet top corners | `radius-lg` (20pt) — sheets get the larger radius for the "rising surface" feel |
| Bottom corners with radius | Bottom is flush to safe-area edge — never rounded |
| Sheet with no drag handle | Handle is a primary affordance even if dismiss-X is present |
| Sticky-top header inside the sheet itself | The sheet's frame already provides the "sticky" anchor; no nested sticky inside |
| Modal-style edge-to-edge sheet | Use [`modal.md`](./modal.md) — sheet always preserves the page-peek above it |
| Sheets within sheets within sheets | Two stacks max; past that, refactor to a stepper |
| Forcing a snap that doesn't match the content (e.g. `full` for a 4-row list) | Pick the snap that fits — don't make the user drag through dead space |
| Auto-dismiss on success | Sheets dismiss on user action (selection or close), not auto-timer |
| Hide-on-scroll handle | Handle is always visible — disappearing affordances confuse the dismiss intent |

## Quick grep to verify (when implemented)

```bash
# Bottom corners with radius (anti-pattern):
grep -rnE 'Sheet.*rounded-b' mobile/design/

# Sheet without drag handle:
grep -rnE '<Sheet[^>]*hideHandle|<Sheet[^>]*noHandle' mobile/

# Sheet with radius-md top corners (should be radius-lg):
grep -rnE 'Sheet.*rounded-t-\[12px\]|Sheet.*rounded-t-lg' mobile/

# Four-deep sheet stacking:
# (review every multi-sheet flow manually)
```

## Cross-references

- Tokens: [`colors.md`](../../tokens/colors.md) · [`radii.md`](../../tokens/radii.md) · [`shadows.md`](../../tokens/shadows.md) · [`motion.md`](../../tokens/motion.md)
- Adjacent: [`modal.md`](./modal.md) (full-screen) · [`list-row.md`](./list-row.md) (rows inside sheet)
- Library: [vaul](https://vaul.emilkowal.ski/) (suggested implementation)
- Layer rules: [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md)
- Lessons: card padding contract for headers (2026-05-03), inline-not-sticky chrome doesn't apply here — sheet IS chrome, but its container, not nested elements
