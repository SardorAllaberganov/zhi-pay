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

## Cross-references

- Lucide library: [`lucide.dev/icons`](https://lucide.dev/icons/)
- Tokens: [`colors.md`](../tokens/colors.md) · [`spacing.md`](../tokens/spacing.md) · [`motion.md`](../tokens/motion.md)
- Accessibility: [`accessibility.md`](../../../.claude/rules/accessibility.md)
- Localization (aria-label keys): [`localization.md`](../../../.claude/rules/localization.md)
- Card scheme logos (separate primitive): [`card-schemes.md`](../../../.claude/rules/card-schemes.md)
- Layer rules: [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md)
- Lessons: back-link icon (2026-05-02), flowing-text floor (2026-05-01), reserved typography categories (2026-04-29)
