# Icon

Icons in ZhiPay mobile come from a single library, sized to a single default, with one rule for decorative-vs-meaningful semantics. Cross-surface parity with admin is non-negotiable — both surfaces import from the same library so the visual language stays one language.

> Status: **First-pass spec, in review.** Inherits admin's library (lucide-react) and sizing baseline. Mobile adds a slightly larger default (20pt vs admin's `size-4` 16pt) — touch ergonomics need the extra glyph weight.

## Source of truth

- Library: [`lucide-react`](https://lucide.dev/icons/)
- Admin parity: every icon usage in [`dashboard/src/`](../../../dashboard/src/) imports from `lucide-react` — mobile follows
- Tokens: [`colors.md`](../tokens/colors.md), [`spacing.md`](../tokens/spacing.md)
- Accessibility floor: [`.claude/rules/accessibility.md`](../../../.claude/rules/accessibility.md)

## Library — lucide-react only

**No other icon library, no inline SVG paths, no Unicode arrows.** This is a design-system contract.

| Rule | Why |
|---|---|
| Only `lucide-react` | Single visual language across mobile + admin |
| No `<svg>` paths inline in screens | Bypasses tokens, fragments stroke-width, breaks recolor |
| No Unicode arrows (`←`, `→`, `↑`, `↓`, `✓`, `✗`) | Per LESSON 2026-05-02: back-link uses `<ArrowLeft>` icon component, never `← ` text prefix |
| No emoji as functional icons | Emoji rendering varies wildly per OS / version — visual drift |
| Brand logos (Visa / MasterCard / UzCard / Humo / Alipay / WeChat) | Live in a separate `SchemeLogo` primitive (per [`card-schemes.md`](../../../.claude/rules/card-schemes.md)), NOT in this layer |

If you reach for an icon that lucide doesn't have:
1. Pick a close cousin from lucide and use it (90% of the time this is fine).
2. If no cousin works, propose a one-off illustration as a separate `Illustration` primitive (Components layer or above) — don't extend the Icon primitive.

## Default size — 20pt (`size-5`)

```
        ┌───────────────┐
        │   ✈           │      20 × 20pt — default
        │   stroke-2     │
        └───────────────┘
```

Mobile default is `20pt` (Tailwind `size-5`). Admin default is `16pt` (`size-4`). The 4pt bump improves touch ergonomics — at typical thumb distance, 16pt glyphs read as too-small.

| Size | Tailwind | Use |
|---|---:|---|
| `xs` | `size-3` (12pt) | **Discouraged.** Reserved for inline-in-text decoration only (e.g. external-link arrow inside a link primitive) |
| `sm` | `size-4` (16pt) | Inside small buttons (`Button size="sm"`), inside chips, inside dense rows where 20pt would crowd |
| `md` | `size-5` (20pt) | **Default.** Buttons (`md` / `lg`), list rows, banners, tab bar, app bar |
| `lg` | `size-6` (24pt) | Hero contexts: empty-state illustration anchor, card-as-object glyph, MyID confirm screen |
| `xl` | `size-8` (32pt) | Onboarding screen anchors, error-state illustrations |

Stroke-width inherits lucide's default (`2`). Don't override per-icon — the system reads as one weight or none.

## The canonical 8 (foundation demo set)

These are the eight icons the foundation prompt requires rendered side-by-side at 20pt to demonstrate the sizing + color pattern. They also happen to cover the most-used surface actions:

| Icon | lucide name | Use |
|---|---|---|
| Send | `Send` | "Send money" CTA, transfer-flow entry, send-arrow on row |
| Receive | `ArrowDownToLine` | History row "received" indicator (future — receive flow not in v1) |
| Card | `CreditCard` | Card-management entry, scheme-agnostic card icon |
| User | `User` | Profile entry, recipient placeholder, sign-in icon |
| Shield | `ShieldCheck` | KYC / MyID / security context |
| Clock | `Clock` | Pending state, history entry, rate-lock countdown |
| Arrow right | `ArrowRight` | "Continue" / "Next step" CTA, navigation chevron alt |
| Check | `Check` | Success affirmation, completed status, verified-recipient |

Render all eight at 20pt with `slate-700 light / slate-300 dark` color in the foundation sample frame.

## Color rules

Icons inherit color via `currentColor` — they take the text color of their parent. **Never pass color directly to the icon component.**

```tsx
// ✓ correct — icon inherits parent's text color
<button className="text-brand-700"><Send /> Send money</button>

// ✗ wrong — hardcoded color disconnects from tokens
<Send color="#0a64bc" />
```

| Context | Icon color (via parent) |
|---|---|
| Inside `primary` button | `--primary-foreground` (white) |
| Inside `secondary` button | `--secondary-foreground` (slate-900 / slate-100) |
| Inside `tertiary` / `link` | `brand-700` light / `brand-400` dark |
| Inline meta text | `slate-500` light / `slate-400` dark (matches `text-muted-foreground`) |
| Status icon (in chip / banner) | semantic 600 (`success-600` / `warning-600` / `danger-600`) |
| Decorative app-bar trailing | `slate-700` light / `slate-300` dark |
| Disabled control | inherits `opacity-60` from parent |

Forbidden: theming icons with `color` props, `style={{color}}`, or `text-[#hex]`. Use parent text color exclusively.

## Decorative vs meaningful

The single most-confused rule in icon usage. Get this right.

| Type | When | Treatment |
|---|---|---|
| **Decorative** | The adjacent label carries the meaning. Icon is visual rhythm only. | `aria-hidden="true"`. SR skips it. |
| **Meaningful** | Icon-only control (no label). Or icon adds info the label doesn't carry. | `aria-label="{intent}"` required. SR announces the label. |

Examples:

```tsx
// Decorative — "Send money" is the meaning
<button>
  <Send aria-hidden="true" /> Send money
</button>

// Meaningful — close button on a sheet with no label
<button aria-label="Close sheet">
  <X />
</button>

// Meaningful — status icon in a chip (the label says "Completed" but the icon
// is announced for users who skim by icon)
<span>
  <Check aria-label="Completed" /> Completed
</span>
```

When in doubt: if removing the icon would not change what a screen-reader user understands, it's **decorative**. Otherwise it's **meaningful**.

## Token consumption

| Slot | Token / value |
|---|---|
| Color (always) | `currentColor` from parent — **never hardcoded** |
| Stroke-width | lucide default (`2`) — never overridden |
| Stroke-linecap | lucide default (`round`) — never overridden |
| Default size | `size-5` (20pt) |
| Sub-sizes | `size-3` / `size-4` / `size-6` / `size-8` |
| Animation (e.g. spinner) | `duration-base` (220ms), `ease-standard` per [`tokens/motion.md`](../tokens/motion.md) |

## Common patterns

### Loading spinner (used by Button, Toast, in-flight surfaces)

```tsx
<Loader2 className="size-4 animate-spin" aria-hidden="true" />
```

- Always lucide `<Loader2>`, never a custom spinner SVG.
- `animate-spin` Tailwind utility (360deg rotation, 1s linear, infinite).
- Reduced-motion fallback: replace with three static dots `•••` when `prefers-reduced-motion: reduce`.

### Status icons (in chips, banners, error states)

| Status | Icon | Color (via parent) |
|---|---|---|
| `processing` | `Loader2` (animated) or `Clock` (static) | `brand-600` |
| `completed` / `passed` / `active` | `CheckCircle2` | `success-600` |
| `failed` | `AlertCircle` | `danger-600` |
| `reversed` | `Undo2` | `warning-600` |
| `expired` / `frozen` | `AlertTriangle` (warning), `Lock` (frozen) | `warning-600` / `slate-500` |
| `pending` | `Clock` | `slate-500` |
| `kyc_required` | `ShieldAlert` | `warning-600` |
| `tier_2_verified` | `BadgeCheck` | white (on brand-600 surface) |

### Back-link icon (cross-cuts every detail page)

Per LESSON 2026-05-02:

```tsx
// ✓ correct
<button className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
  <ArrowLeft className="size-4" aria-hidden="true" />
  Back to send
</button>

// ✗ wrong — Unicode arrow in label
<button>← Back to send</button>

// ✗ wrong — ChevronLeft (LESSON 2026-05-02 says ArrowLeft)
<button><ChevronLeft /> Back to send</button>

// ✗ wrong — both icon + Unicode arrow (double arrow)
<button><ArrowLeft /> ← Back to send</button>
```

### App-bar trailing actions

App-bar icons (settings, more-overflow, search) sit at 20pt with 44pt tap-area inflation:

```tsx
<button className="inline-flex size-11 items-center justify-center" aria-label="Settings">
  <Settings className="size-5" aria-hidden="true" />
</button>
```

`size-11` (44pt) is the tap-area; `size-5` (20pt) is the visual icon. The 12pt of slack provides the touch margin per [`accessibility.md`](../../../.claude/rules/accessibility.md).

## Accessibility

| Concern | Rule |
|---|---|
| Decorative icons | `aria-hidden="true"` — every time |
| Meaningful icons (icon-only buttons / standalone status) | `aria-label="{intent}"` required |
| Color-only signals | Never. Icon + label + position carry meaning together |
| Tap target | Icon-only buttons inflate to ≥ 44pt tap-area; icon visual stays at 20pt |
| Contrast (icon vs background) | ≥ 3:1 for non-text UI per [`accessibility.md`](../../../.claude/rules/accessibility.md) — verified on slate-700 (light) = 9.8:1 vs slate-50, slate-300 (dark) = 8.9:1 vs slate-950 |
| Reduced motion | Spinner falls back to static three-dot string; no other icons animate by default |
| Focus | Icon-only buttons receive a visible `--ring` (2pt) offset against parent — never silently lose the ring |

## Localization

Icons themselves are language-agnostic. The accompanying labels and `aria-label`s are localized:

| Slot | Key pattern |
|---|---|
| `aria-label` (meaningful icon) | `mobile.<surface>.<screen>.icon-<intent>.aria-label` — e.g. `mobile.history.detail.icon-close.aria-label` ("Close sheet" / "Yopish" / "Закрыть") |
| Status-icon SR fallback | `common.status.<state>.aria-label` — pairs with the StatusChip's own SR text |
| Back-link icon | inherits parent button's localized label; icon itself is `aria-hidden="true"` |

**Bidirectional rule for v1:** Mobile is `ltr` (RTL not in v1 per [`localization.md`](../../../.claude/rules/localization.md)). Icons that imply direction (`ArrowLeft` / `ArrowRight`) stay in their authored direction. Don't mirror per-locale — there's no Arabic / Hebrew surface in v1.

## Forbidden patterns

| Don't | Required |
|---|---|
| Inline `<svg>` paths in screens | `lucide-react` import, every time |
| Custom icon SVG outside the lucide library | Use a lucide cousin or propose an `Illustration` primitive (separate concern) |
| Unicode arrows / checks (`←`, `→`, `✓`) | lucide icon components |
| Hardcoded color (`<Icon color="#0a64bc">`) | Inherit from parent `text-*` class |
| Stroke-width override | Lucide default (`2`) — system reads as one weight |
| Icon under 16pt (`size-3` / `size-4`) used as a primary action | Min 20pt (`size-5`) for any primary tap-target — sub-icons exist for in-text decoration only |
| Visa / Mastercard / UzCard / Humo / Alipay / WeChat as icons | Brand logos live in a separate `SchemeLogo` primitive (Components layer) |
| `text-xs` for nearby labels (e.g. "47m ago" with `<Clock>`) | `text-sm` minimum on flowing meta — LESSON 2026-05-01 |

## Quick grep to verify (when implemented)

```bash
# Inline SVG paths in screens — must return 0 hits:
grep -rnE '<svg[^>]*viewBox' mobile/design/screens/ mobile/design/patterns/

# Unicode arrows / checks in i18n strings — must return 0 hits:
grep -rE '← |→ |✓|✗|⇒' mobile/

# Hardcoded color on lucide icons — must return 0 hits:
grep -rnE '<(Send|ArrowLeft|Check|User|Clock|CreditCard|Shield|ArrowRight)[^>]*color=' mobile/

# Non-lucide imports in icon usage — review every hit:
grep -rnE "from\s+['\"](react-icons|@heroicons|@fortawesome|feather)" mobile/
# (must return 0 hits)
```

## Figma component-set

**Icon is the only primitive without a variant component set.** Each lucide icon is its own discrete `COMPONENT` node, and consumers import the icon they need directly (matches lucide-react's per-icon import shape: `import { Send } from 'lucide-react'`). Authoring a multi-axis component set with all icons would force designers to swap variants every time they want a different glyph — far worse UX than just dragging the right icon component.

> Built incrementally across Phases 26 (foundation 13) + 27b (Pass 2 added 4 for Input). Now **17 components live**.

### The 17-icon library

| # | Component | lucide name | Node ID | Added in | Primary use |
|--:|---|---|---|---|---|
| 1 | `Icon / Send` | `Send` | `42:5` | Phase 26 | "Send money" CTA, transfer-flow entry |
| 2 | `Icon / ArrowDownToLine` | `ArrowDownToLine` | `42:10` | Phase 26 | History "received" indicator (future receive flow) |
| 3 | `Icon / CreditCard` | `CreditCard` | `42:14` | Phase 26 | Card-management entry, scheme-agnostic card |
| 4 | `Icon / User` | `User` | `42:18` | Phase 26 | Profile, recipient placeholder, Avatar/Photo placeholder |
| 5 | `Icon / ShieldCheck` | `ShieldCheck` | `42:22` | Phase 26 | KYC / MyID / security context |
| 6 | `Icon / Clock` | `Clock` | `42:26` | Phase 26 | Pending state, history entry, rate-lock countdown |
| 7 | `Icon / ArrowRight` | `ArrowRight` | `42:30` | Phase 26 | "Continue" / "Next step", Button trailing icon default |
| 8 | `Icon / Check` | `Check` | `42:33` | Phase 26 | Success affirmation, completed status |
| 9 | `Icon / ChevronRight` | `ChevronRight` | `49:37` | Phase 26 | List-row navigation chevron |
| 10 | `Icon / Info` | `Info` | `44:22` | Phase 26 | Info-tone Banner |
| 11 | `Icon / CheckCircle2` | `CheckCircle2` | `44:26` | Phase 26 | Success-tone Banner, Tier2 MyID glyph stand-in |
| 12 | `Icon / AlertTriangle` | `AlertTriangle` | `44:31` | Phase 26 | Warning-tone Banner, KYC expired, expired state |
| 13 | `Icon / AlertCircle` | `AlertCircle` | `44:36` | Phase 26 | Danger-tone Banner, error states |
| 14 | `Icon / Search` | `Search` | `86:73` | **Phase 27b (Pass 2 — Input)** | Search field leading magnifier |
| 15 | `Icon / X` | `X` | `86:77` | **Phase 27b (Pass 2 — Input)** | Search clear button, modal close |
| 16 | `Icon / Delete` | `Delete` | `86:82` | **Phase 27b (Pass 2 — Input)** | NumberPad delete key |
| 17 | `Icon / Lock` | `Lock` | `86:86` | **Phase 27b (Pass 2 — Input)** | Read-only field state, Frozen chip recovery |

### Component anatomy (per icon)

Every icon component follows the same shape:

| Property | Value |
|---|---|
| Type | `COMPONENT` (not `COMPONENT_SET` — single node) |
| Container | 24 × 24pt baseline (matches lucide's `viewBox`) |
| Vector source | `figma.createNodeFromSvg(<lucide-svg-string>)` — bundles all path / circle / line elements as one frame |
| Stroke (every path) | bound to `color/foreground` via `setBoundVariableForPaint` — flips brand-correct in Light + Dark modes |
| Stroke weight | `2` (lucide default) — never overridden per-icon |
| Stroke linecap | `round` (lucide default) — never overridden |
| Fills | None (lucide icons are stroke-only) |

### Showcase frames

Two reference frames live on the page:

| Frame | Position | Contents |
|---|---|---|
| `Icons (canonical 8)` | (100, 1700) — pre-existing | The 8-icon foundation demo set per spec "The canonical 8" — Send · ArrowDownToLine · CreditCard · User · ShieldCheck · Clock · ArrowRight · Check at 20pt with name labels |
| `Icons (17 — full library)` | **(100, 1900)** — added Pass 2 (`108:92`) | All 17 icons in a 6×3 grid with name labels at 20pt slate-700 (foreground), label `text/body-sm` slate-500 |

The first showcase satisfies the foundation prompt's "render all eight at 20pt with `slate-700` color in the foundation sample frame" requirement. The second is the discoverable inventory designers consult when picking an icon.

### Usage convention

Designers consume icons three ways:

1. **Direct instance** — drag from the Assets palette, drop into a frame. Override size at instance time (`size-3` / `size-4` / `size-5` default / `size-6` / `size-8`).
2. **Inside a component property** — used by `Button` (`Leading icon` / `Trailing icon` INSTANCE_SWAP), `Input / Field` (Search variant), `Input / NumberPad` (Delete key). The component-set author wires the property; the instance designer picks via the right-panel picker.
3. **Inline in a custom layout** — drop an instance, override stroke color via the Variables picker (e.g. `color/slate/400` for the search magnifier; `color/primary-foreground` for the Tier2 glyph).

### Color / sizing rules (binding to spec)

- **Stroke**: bound to `color/foreground` by default; override at instance time to any `color/*` variable. **Never use raw hex.**
- **Size**: 24×24 baseline; override at instance time. The 5 canonical sizes (`size-3` 12 / `size-4` 16 / `size-5` 20 / `size-6` 24 / `size-8` 32) are documented above; use the variant table at the top of this spec to pick.
- **Stroke-width**: 2pt baseline (lucide default). **Never overridden per-icon** — system reads as one weight.

### Variant axes

**None — Icon has no component set.** The library is 17 individual `COMPONENT` nodes; the spec's `xs/sm/md/lg/xl` size variants are applied by the consumer at instance time, not as Figma variants. See the "Default size" table above.

### Skip cells

Not applicable. The library covers the most-used surface actions (per the canonical-8 list) plus the 5 banner / list-row glyphs added during Phase 26 plus the 4 Pass 2 input-driven additions. Future additions land in this same row pattern (24×24, stroke 2, foreground-bound) and are appended to the `Icons (17 — full library)` showcase.

### Deviations from spec, tracked

| Deviation | Reason | Recovery path |
|---|---|---|
| Library coverage is 17, not the lucide-react full set (~1500 icons) | Adding every lucide icon would bloat the file + the asset palette becomes unwieldy. Library grows on-demand as new screens / patterns need icons | Build new icons via `figma.createNodeFromSvg(<svg-string>)` per the convention; append to the `Icons (17 — full library)` showcase; add an entry to this spec's library table |
| `Icon / BadgeCheck` not in library (used by Tier2 glyph) | Wasn't needed at foundation time; Tier2 used `CheckCircle2` as stand-in | Add via the convention; swap instance reference in 3 `Chip / Tier / Tier2 / *` cells |
| `Icon / Loader2` not in library (used by Button loading state, status icons) | Button loading state was deferred from variant matrix; spinner pattern is animation, not a static icon usage | Add via the convention when a screen / pattern needs the static spinner glyph; the animation contract (`animate-spin`, 1s linear, infinite, reduced-motion fallback to three dots) lives at code time |
| Brand logos (Visa / Mastercard / UzCard / Humo / Alipay / WeChat) excluded | Per [`card-schemes.md`](../../../.claude/rules/card-schemes.md): brand marks live in a separate `SchemeLogo` primitive (Components layer), NOT in the Icon library — they need brand-accurate paths, NOT lucide simplifications | Build `SchemeLogo` as a Components-layer primitive when the `scheme-logo.md` Pass 2 sweep happens |

### File placement

| Asset | Component / Frame ID | Position (page `❖ Components`) | Size |
|---|---|---|---|
| Icon row 1 | individual icons at y=1600 | x=100…676 | 24 × 24 each |
| Icons (canonical 8) showcase | `43:2` | (100, 1700) | 745 × 112 |
| Icon row 2 | individual icons at y=1824 | x=100…436 | 24 × 24 each |
| **Icons (17 — full library) showcase** | **`108:92`** | **(100, 1900)** | **724 × 244** |

The 17 icons themselves stay in their original positions on the icon rows at y=1600 and y=1824. The two showcase frames sit between (canonical 8) and below (full 17) — neither contains the actual icon components, just instances arranged with name labels.

## Cross-references

- Lucide library: [`lucide.dev/icons`](https://lucide.dev/icons/)
- Tokens: [`colors.md`](../tokens/colors.md) · [`spacing.md`](../tokens/spacing.md) · [`motion.md`](../tokens/motion.md)
- Accessibility: [`accessibility.md`](../../../.claude/rules/accessibility.md)
- Localization (aria-label keys): [`localization.md`](../../../.claude/rules/localization.md)
- Card scheme logos (separate primitive): [`card-schemes.md`](../../../.claude/rules/card-schemes.md)
- Layer rules: [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md)
- Lessons: back-link icon (2026-05-02), flowing-text floor (2026-05-01), reserved typography categories (2026-04-29)
