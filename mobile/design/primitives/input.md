# Input

Seven input primitives. Every form on mobile — sign-in, MyID, card-add, send-money amount, recipient picker — composes from these.

> Status: **First-pass spec, in review.** Mirrors admin's [`<Input>`](../../../dashboard/src/components/ui/input.tsx) shape with mobile-specific additions: phone (`+998` locked), OTP (4 / 6 boxes), PIN dot, custom number keypad, and the search variant.

## Source of truth

- Admin reference: [`dashboard/src/components/ui/input.tsx`](../../../dashboard/src/components/ui/input.tsx)
- Tokens: [`colors.md`](../tokens/colors.md), [`typography.md`](../tokens/typography.md), [`spacing.md`](../tokens/spacing.md), [`radii.md`](../tokens/radii.md)
- Accessibility floor: [`.claude/rules/accessibility.md`](../../../.claude/rules/accessibility.md)
- Localization (label / placeholder / helper / error keys): [`.claude/rules/localization.md`](../../../.claude/rules/localization.md)

## The seven variants

| Variant | Use | Key surfaces |
|---|---|---|
| `text` | Single-line text | Recipient name, card label, password (with `type="password"`) |
| `textarea` | Multi-line text | Transfer note, support message, recipient address |
| `phone` | UZ phone number with `+998 ` prefix locked | Sign-up, MyID step 1, recipient phone |
| `otp` | 4- or 6-digit one-time code, auto-advance | SMS verification, MyID confirm, sign-in |
| `pin` | Hidden-digit dot input | Biometric fallback (future v1.1+) |
| `numberPad` | Custom amount keypad — full-width, large hit targets | Send-money amount entry only |
| `search` | Single-line with leading magnifier + clear-X | Recipient search, history search |

## Anatomy (text / textarea / phone / search)

```
┌─ label ─────────────────────────────────────┐
│ Phone number                                │   text-sm font-medium · slate-700 / slate-200
└─────────────────────────────────────────────┘
                                                  ↕ space-2 (8pt)
┌──── input field — radius-sm (8pt) ──────────┐
│  +998   90 123 45 67                        │   48pt height · text-base · slate-200 border
│  ↑                                          │   focus: ring-2 ring-brand-600 · border-brand-600
│  prefix                                     │   error: ring-2 ring-danger-600 · border-danger-600
└─────────────────────────────────────────────┘
                                                  ↕ space-2 (8pt)
┌─ helper / error ────────────────────────────┐
│ We'll text you a code.                      │   text-sm · slate-500 (helper) / danger-600 (error)
└─────────────────────────────────────────────┘
```

| Slot | Token / value |
|---|---|
| Container background | `--background` (slate-50 light / slate-950 dark) — flat, not card-on-card |
| Field border (idle) | `--input` (slate-200 / slate-800) 1pt |
| Field border (focus) | `--ring` (brand-600 / brand-400) 2pt + 2pt offset |
| Field border (error) | `danger-600` 2pt |
| Field background | `--background` light / `slate-900` dark |
| Field height | 48pt (`md`); 40pt (`sm` — only for inline filters); 56pt textarea minimum |
| Field padding (X / Y) | `space-4 / space-3` (16 / 12pt) |
| Border radius | `radius-sm` (8pt) — **not** `radius-md`. Inputs read tinny at 4pt corners (admin's value); 8pt is the mobile floor. |
| Type (label) | `text-sm` (14pt) `font-medium` slate-700 light / slate-200 dark |
| Type (value) | `text-base` (16pt) `font-normal` slate-900 light / slate-100 dark |
| Type (placeholder) | `text-base` (16pt) slate-400 light / slate-500 dark |
| Type (helper) | `text-sm` (14pt) slate-500 light / slate-400 dark |
| Type (error) | `text-sm` (14pt) `font-medium` danger-600 |

> **Type floor**: value text is `text-base` (16pt) on mobile, not `text-sm`. iOS auto-zooms inputs whose font-size is < 16pt — keep it at 16pt to prevent the layout jump on focus.

## Variant: `text`

Standard single-line. Type defaults to `text`; pass `type="email"` / `type="password"` / `type="url"` as needed (drives keyboard layout on mobile).

| Sub-state | Treatment |
|---|---|
| With leading icon | Icon at left padding, 20pt, `slate-400`; field text shifts right by `space-3` (12pt) |
| With trailing icon | Same on right (e.g. visibility-toggle for password, clear-X for search) |
| With character counter | `text-sm slate-500` bottom-right of field, format `{used}/{max}`; turns `danger-600` when exceeded |
| Disabled | `opacity-60`, `bg-muted` (slate-100 / slate-800), `cursor-not-allowed`, no caret |
| Read-only | Same as disabled visually but allows text selection / copy; mark with trailing lock icon |

## Variant: `textarea`

Same anatomy, vertical reflow.

- Min height: 96pt (3 lines at 16pt × 1.5 line-height + padding).
- Max height: 240pt (8 lines); past this, scroll inside the field — don't grow the screen.
- Auto-resize: opt-in via `autoResize` prop. Default off (predictable layout wins).
- Character counter: required when `maxLength` is set; placement bottom-right outside the field, `mt-2`.

## Variant: `phone`

UZ-only for v1. The `+998 ` prefix is **locked** — non-editable, visually distinct from the input area.

```
┌─────────────────────────────────────────────┐
│ +998 │  90 123 45 67                        │
│  ↑   │   ↑                                  │
│ pref │  mask 90 [Operator] · 123 45 67      │
└──────┴──────────────────────────────────────┘
```

| Detail | Value |
|---|---|
| Prefix surface | `bg-muted` (slate-100 / slate-800), 1pt right border, padding `space-3` (12pt) |
| Prefix label | `+998 ` in `text-base font-medium slate-500` |
| Mask | `90 123 45 67` — operator code (2) · subscriber (3 · 2 · 2) |
| Input mode | `inputmode="tel"` — opens numeric keypad on iOS / Android |
| Validation | Length 9 digits after prefix; first digit must be 9 (UZ mobile prefix) |
| Errors | `RECIPIENT_INVALID` from `error_codes` if non-UZ format submitted |

> v1 stays UZ-only. International phone is out of scope until cross-corridor expansion. **Don't** swap in a country-code picker.

## Variant: `otp`

Box-per-digit. Default 6 boxes (SMS); pass `length={4}` for 4-box variant (MyID confirm).

```
┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐
│ 1│ │ 2│ │ 3│ │ 4│ │ 5│ │  │   48 × 48pt boxes
└──┘ └──┘ └──┘ └──┘ └──┘ └──┘
                    ↑
                    auto-focus next on type
```

| Detail | Value |
|---|---|
| Box dimensions | 48 × 48pt at default — 56 × 56pt with `size="lg"` for hero verification screens |
| Gap between boxes | `space-2` (8pt) |
| Type | `text-2xl` (22pt) `font-semibold` `tabular-nums` |
| Border (idle) | `--input` 1pt |
| Border (focus) | `--ring` 2pt — only the active box; others stay idle |
| Border (filled) | `slate-300` 1pt — soft "this digit is set" cue |
| Border (error) | `danger-600` 2pt on **all** boxes when validation fails (not just one) |
| Auto-advance | On digit entry, focus jumps to next; on backspace from empty, jumps to previous |
| Paste behavior | Pasting a 6-digit code distributes one digit per box and triggers `onComplete` |
| Mobile keyboard | `inputmode="numeric"`, `autocomplete="one-time-code"` — iOS surfaces SMS auto-fill chip |
| Resend cooldown | Show `Resend in 0:30` countdown beneath; switch to `Resend code` button at 0:00 |

## Variant: `pin` (future, scaffolded)

Same shape as OTP but each digit renders as a filled / hollow circle, never the digit itself.

| Detail | Value |
|---|---|
| Box | 12pt-diameter dot, `radius-pill`, centered in a 40 × 40pt tap-area |
| Filled | `brand-600` solid |
| Empty | `slate-300` 1pt outline |
| Error | All dots `danger-600`, brief shake animation (`duration-fast`, `ease-out`) |
| Type | hidden — no glyph rendering |

> **Not used in v1.** Spec exists so the primitive shape doesn't drift later. Biometric fallback flows live in v1.1+.

## Variant: `numberPad`

Custom amount-entry keypad. Replaces the OS keyboard for the send-money amount field — full-width, fewer keys (10 digits + decimal + delete), large hit targets, currency-aware formatting.

```
┌──── Amount field (above keypad) ────┐
│                                     │
│            5 000 000.00 UZS         │   text-display (44pt)
│                                     │
└─────────────────────────────────────┘

┌─────────┬─────────┬─────────┐
│    1    │    2    │    3    │   72 × 72pt cells
├─────────┼─────────┼─────────┤   text-2xl (22pt) font-medium
│    4    │    5    │    6    │
├─────────┼─────────┼─────────┤
│    7    │    8    │    9    │
├─────────┼─────────┼─────────┤
│    ,    │    0    │   ⌫     │   left: decimal (locale-aware)
└─────────┴─────────┴─────────┘   right: lucide Delete icon
```

| Detail | Value |
|---|---|
| Cell dimensions | 72 × 72pt — exceeds 44pt floor by far; mobile thumb-targeting wants room |
| Grid | 4 rows × 3 cols, `gap-1` (4pt) — tight grid reads as a unit |
| Cell surface | `bg-card` light / `slate-900` dark |
| Cell pressed | `bg-muted` + 1pt scale-down (`scale-[0.97]`) at `duration-fast` |
| Decimal cell | Renders `,` for `uz` / `ru`, `.` for `en` per [`localization.md`](../../../.claude/rules/localization.md) — driven by `users.preferred_language` |
| Delete cell | lucide `<Delete>` icon, 24pt, `slate-700` light / `slate-300` dark; long-press clears entire field |
| Disabled keys | When the entered amount would exceed the per-tx limit, disable digits that would push it over (subtle: `opacity-40`, no press response) |
| Above-keypad amount field | renders a Headline-Number primitive (see Components layer) — keypad is the input device, not the display |
| Live formatting | `5000000` → `5 000 000` (uz/ru) or `5,000,000` (en) as the user types — never echo the raw integer |

**Forbidden**: rendering `numberPad` for any field other than amount. Recipient phone, OTP, PIN — all use their own variants. Don't repurpose.

## Variant: `search`

Standard text input + leading magnifier + trailing clear-X (only when value present).

```
┌─────────────────────────────────────────────┐
│ 🔍   Search recipients         ✕            │
└─────────────────────────────────────────────┘
   ↑                                ↑
   leading icon (slate-400)         clear button (only with value)
```

| Detail | Value |
|---|---|
| Leading icon | lucide `<Search>`, 20pt, `slate-400` light / `slate-500` dark |
| Clear button | lucide `<X>`, 16pt, in 32 × 32pt tap-area, `slate-500` |
| Debounce | 250ms before firing `onSearch` — prevents per-keystroke server roundtrips |
| Placeholder | localized from `mobile.<surface>.search.placeholder` |
| Empty-state slot | when `value !== ''` and result count = 0, render an `EmptyState` below (Components layer) |

## States (cross-variant)

Every input variant supports the same six states. Treatment varies; the contract doesn't.

| State | Visual |
|---|---|
| `idle` | base border, base label, helper if provided |
| `focused` | `--ring` 2pt + 2pt offset, label color shifts to `slate-900` / `slate-100` |
| `filled` | base border (no special treatment); helper persists |
| `error` | `danger-600` border 2pt, error text replaces helper, `aria-invalid="true"` |
| `disabled` | `opacity-60`, `bg-muted`, no caret, label dims to `slate-400` |
| `read-only` | trailing lock icon (`<Lock>` 16pt slate-500), text selectable, no caret |

## Token consumption summary

| Surface | Token |
|---|---|
| Field background | `--background` |
| Field border (idle) | `--input` |
| Field border (focus) | `--ring` 2pt |
| Field border (error) | `danger-600` 2pt |
| Label / value / placeholder / helper / error type | `text-sm` (label/helper/error), `text-base` (value/placeholder) — never `text-xs` |
| Padding | `space-4 / space-3` (16 / 12pt) |
| Radius | `radius-sm` (8pt) |
| Vertical gap (label → field → helper) | `space-2` (8pt) each |
| Stack gap (form rows) | `space-4` (16pt) per [`spacing.md`](../tokens/spacing.md) |

## Accessibility

| Concern | Rule |
|---|---|
| Label ↔ field | Every input has a `<label>` linked via `htmlFor` / `for`. **Placeholder is never the label.** |
| Error announcement | `aria-invalid="true"` + `aria-describedby` pointing at the error text id; live region announces on first error |
| Helper text | linked via `aria-describedby` |
| Tap target | Field height ≥ 44pt; `numberPad` cells ≥ 72pt; `otp` boxes ≥ 44pt; clear-X tap-area ≥ 32pt with surrounding pad |
| Focus ring | always visible — `--ring` 2pt + offset; `outline: none` is forbidden without a ring replacement |
| Type size | value text 16pt minimum (prevents iOS auto-zoom); helper / error 14pt; never `text-xs` |
| Color-only signals | error is danger-600 + icon ⚠ + error text — never just a red border |
| Keyboard | `inputmode` set per variant (`tel`, `numeric`, `email`, `decimal`); `autocomplete` populated where applicable (`tel`, `email`, `current-password`, `one-time-code`) |
| Screen reader | OTP boxes announce as "digit 1 of 6" etc. via `aria-label` per box |
| Reduced motion | PIN error-shake falls back to a static danger-600 ring (no shake) |

## Localization

| Slot | Key pattern |
|---|---|
| Label | `mobile.<surface>.<screen>.<field>.label` |
| Placeholder | `mobile.<surface>.<screen>.<field>.placeholder` |
| Helper | `mobile.<surface>.<screen>.<field>.helper` |
| Error (per error_code) | `common.errors.<CODE>.body` from `error_codes` |
| OTP resend countdown | `mobile.common.otp.resend-in` (ICU plural for seconds) |

- Russian labels run 15–25% longer — verify the `48pt` field height accommodates 2-line labels at `200%` dynamic-type.
- Decimal separator follows `users.preferred_language`: `,` for `uz`/`ru`, `.` for `en` (per [`money-and-fx.md`](../../../.claude/rules/money-and-fx.md)).
- Phone mask is locale-agnostic for v1 (UZ-only).

## Privacy

Per [`core-principles.md`](../../../.claude/rules/core-principles.md):

| Field type | Rule |
|---|---|
| Password | `type="password"`; visibility toggle allowed but must default to hidden |
| OTP / PIN | never logged, never echoed in error messages |
| PINFL / document numbers | masked in display; for entry, mask on blur, reveal only while focused |
| Card PAN | **never accepted in a free-text input** — card-add flows through the scheme's hosted form / 3DS WebView per [`card-schemes.md`](../../../.claude/rules/card-schemes.md). The mobile primitive layer does not include a PAN input. |
| CVV | same — never accepted in a free-text input. Hosted form only. |

## Forbidden patterns

| Don't | Required |
|---|---|
| Placeholder-as-label | Real label above the field, every time |
| `text-xs` (13pt) for value text | `text-base` (16pt) — prevents iOS auto-zoom on focus |
| `radius-md` (12pt) corners on inputs | `radius-sm` (8pt) — LESSON in [`radii.md`](../tokens/radii.md) |
| Country-code picker on phone field | UZ-only v1 — `+998 ` prefix is locked |
| Free-text PAN / CVV inputs | Hosted form / 3DS only — see [`card-schemes.md`](../../../.claude/rules/card-schemes.md) |
| OS keyboard for amount entry | `numberPad` variant — full-width, locale-aware separator, larger targets |
| Tooltip-only error message | Inline error text below the field — touch can't trigger tooltips |
| Silent client-side validation that shows nothing | Always render the error text + icon when `aria-invalid` |
| Disabled fields with no explanation | Helper or banner explains why (e.g. "Verify your phone first") |

## Quick grep to verify (when implemented)

```bash
# Sub-13pt body / value text — must return 0 hits:
grep -rE 'text-\[1[0-2]px\]|fontSize:\s*1[0-2]\b' mobile/

# text-xs in input value / placeholder — 0 hits:
grep -rnE 'Input.*text-xs|placeholder.*text-xs' mobile/

# radius-md / rounded-lg on Input — 0 hits (must be radius-sm / rounded-md per tokens):
grep -rnE '<Input[^>]*rounded-lg' mobile/
```

## Figma component-set

Three component sets, all under the `Input / *` namespace per [`tokens/figma-setup.md`](../tokens/figma-setup.md). Split by anatomy cluster — single-field variants share the label/field/helper rhythm and live in one set; OTP has its own per-box geometry; NumberPad is monolithic. The PIN variant is **deferred** per the spec ("Not used in v1").

> Built in Figma 2026-05-04 alongside the Chip primitives as part of Pass 2.

### Prerequisite — 4 new lucide icon components

Input depends on four lucide icons that were not in the foundation's initial 13-icon set. They were added to the icon row at y=1824 on the `❖ Components` page as part of this pass:

| Icon component | Used by |
|---|---|
| `Icon / Search` (`86:73`) | `Input / Field — Search` (mandatory leading magnifier) |
| `Icon / X` (`86:77`) | `Input / Field — Search` clear button + future modal close |
| `Icon / Delete` (`86:82`) | `Input / NumberPad` delete key |
| `Icon / Lock` (`86:86`) | `read-only` state of every field variant + the `Frozen` Chip status (recovery for the deviation logged in chip.md) |

All four authored via `figma.createNodeFromSvg` at 24×24, stroke-width 2, default-bound to `color/foreground`. Per-usage stroke overrides in instance contexts (slate-400 for the search magnifier, slate-500 for the X clear button, slate-700 for the Delete key glyph).

### Set 1 · `Input / Field` (12 cells)

#### Variant axes

| Property | Values | Count |
|---|---|---:|
| `Variant` | `Text` · `TextArea` · `Phone` · `Search` | 4 |
| `State` | `Default` · `Focused` · `Error` | 3 |

`Disabled` and `Read-only` states are **dropped from the variant matrix** — handled at instance time via overrides on the Default cell (opacity + bg-muted swap for disabled; `Icon / Lock` instance for read-only). Mirrors Button's pattern of keeping the variant matrix tractable.

#### Naming

```
Input / Field   →   Variant=<Variant>, State=<State>
```

Examples: `Variant=Text, State=Default`, `Variant=Phone, State=Error`, `Variant=Search, State=Focused`.

#### Variable bindings — per cell

##### Outer wrapper (vertical stack)

| Property | Bound to |
|---|---|
| Layout | Auto Layout VERTICAL |
| Item spacing (label → field → helper) | `space/2` (8pt) |
| Width | Fixed 328pt |
| Height | Hug contents |
| Fill | Transparent (no background — wrapper is layout-only) |

##### Label (text)

| Property | Bound to |
|---|---|
| Text Style | `text/body-sm-medium` (14/500) |
| Fill | `color/slate/700` (light) — primitive ramp; semantic `color/foreground/muted` would be cleaner if added |
| Layout sizing | Fill horizontal |

##### Field (container frame)

| Property | Bound to |
|---|---|
| Fill | `color/background` |
| Border (idle) | `color/input` 1pt `INSIDE` (`State=Default`) |
| Border (focused) | `color/ring` 2pt `INSIDE` (`State=Focused`) |
| Border (error) | `color/destructive` 2pt `INSIDE` (`State=Error`) |
| Corner radius (all 4) | `radius/sm` (8pt) |
| Padding-X | `space/4` (16pt) for Text · TextArea · Search; **none** at the field level for Phone (prefix has its own padding) |
| Padding-Y | `space/3` (12pt) for TextArea (top + bottom — multi-line); `0` at field level for single-line variants (height carries vertical centering) |
| Item spacing | `space/3` (12pt) — gap between leading icon and value |
| Height (fixed) | 48pt for Text · Phone · Search · 96pt for TextArea |

##### Variant-specific inner content

**Text** — single value/placeholder text node, layout-grow horizontal so it fills the field width.

**TextArea** — same as Text but with `textAutoResize=HEIGHT` and `layoutAlign=STRETCH` so multi-line content reflows. Field min-height 96pt.

**Phone** — two-section layout:
- Prefix box: 72×48pt, `bg=color/muted`, 1pt `color/input` right border, `+998` text in `text/body` Medium override at `color/slate/500`
- Main input area: `layoutGrow=1`, `paddingLeft=space/4`, value/placeholder text node

**Search** — three-section layout:
- Leading: `Icon / Search` instance at 20pt, stroke `color/slate/400`
- Value: text node, `layoutSizingHorizontal=FILL`
- Trailing (only when `State≠Default`): `Icon / X` instance at 16pt, stroke `color/slate/500`

##### Value / placeholder text

| Property | Bound to |
|---|---|
| Text Style | `text/body` (16/400) — **16pt floor prevents iOS auto-zoom on focus** |
| Fill (Default — placeholder) | `color/slate/400` |
| Fill (Focused / Error — value) | `color/slate/900` |

##### Helper / error text

| Property | Bound to |
|---|---|
| Text Style | `text/body-sm` (14/400) |
| Fill (Default · Focused) | `color/muted-foreground` |
| Fill (Error) | `color/danger/600` + `fontName` override to **Inter Medium** (per spec "error: text-sm font-medium danger-600") |
| Layout sizing | Fill horizontal |

### Set 2 · `Input / Otp` (6 cells)

#### Variant axes

| Property | Values | Count |
|---|---|---:|
| `Length` | `Four` (MyID confirm) · `Six` (SMS, default) | 2 |
| `State` | `Default` · `Focused` · `Error` | 3 |

#### Naming

```
Input / Otp   →   Length=<Length>, State=<State>
```

Examples: `Length=Six, State=Focused`, `Length=Four, State=Error`.

#### Variable bindings — per cell

##### Wrapper (horizontal stack of boxes)

| Property | Bound to |
|---|---|
| Layout | Auto Layout HORIZONTAL · hug both axes |
| Item spacing (between boxes) | `space/2` (8pt) |
| Fill | Transparent |

##### Box (per digit, one per `Length` count)

| Property | Bound to |
|---|---|
| Width × Height (fixed) | 48 × 48 |
| Fill | `color/background` |
| Border (Default · empty box) | `color/input` 1pt INSIDE |
| Border (Default · filled box) | `color/slate/300` 1pt INSIDE — soft "this digit is set" cue |
| Border (Focused · active box) | `color/ring` 2pt INSIDE — only the next-empty box gets this; others stay idle |
| Border (Error · all boxes) | `color/destructive` 2pt INSIDE on **every** box (not just one) |
| Corner radius (all 4) | `radius/sm` (8pt) |

##### Digit text (when filled)

| Property | Bound to |
|---|---|
| Font | `Inter Semi Bold` (600) — layer-level override (no `text/heading` Style at this size; one-off until a 2nd consumer surfaces) |
| Font size | 22pt |
| Line height | 28pt |
| Fill | `color/slate/900` |
| `font-variant-numeric` | `tabular-nums` — alignment matters in box-per-digit displays |

> Demo content per cell: 4-box variants show `1 2 _ _` (2 filled, 2 empty); 6-box variants show `1 2 3 4 _ _` (4 filled, 2 empty). Focused state's "active box" = the first empty position.

### Set 3 · `Input / NumberPad` (2 cells)

#### Variant axes

| Property | Values | Count |
|---|---|---:|
| `Locale` | `Comma` (uz / ru) · `Period` (en) | 2 |

The decimal-cell glyph + the integer separator in the amount-field demo flip per locale: `,` + space-grouping (`5 000 000,00`) for Comma; `.` + comma-grouping (`5,000,000.00`) for Period. Driven by `users.preferred_language` per [`localization.md`](../../../.claude/rules/localization.md).

#### Naming

```
Input / NumberPad   →   Locale=<Locale>
```

#### Variable bindings — per cell

##### Wrapper (vertical stack: amount / keypad)

| Property | Bound to |
|---|---|
| Layout | Auto Layout VERTICAL · hug both axes |
| Item spacing (amount → grid) | 16pt (literal — no `space/4-and-a-half`; pinned for visual balance) |

##### AmountField (faux Headline-Number display)

| Property | Bound to |
|---|---|
| Layout | Auto Layout HORIZONTAL · hug both axes · 8pt item spacing |
| Value text | `text/display-2` (32/700), `color/slate/900` |
| Currency code (`UZS`) | `text/body` (16/400) override to Medium, `color/slate/500` |
| Demo content | `5 000 000,00 UZS` (Comma) · `5,000,000.00 UZS` (Period) |

> The real screen consumes a `HeadlineNumber` component from the Components layer — this is a faux placeholder for the spec frame only. Don't ship a NumberPad that includes its own typography; the screen wraps a real Headline Number above the keypad.

##### Keypad (4×3 grid)

| Property | Bound to |
|---|---|
| Layout | Auto Layout VERTICAL of row frames; row item spacing 4pt; outer gap 4pt |
| Cell dimensions (fixed) | 72 × 72 per key |
| Cell fill | `color/card` |
| Cell border | `color/input` 1pt INSIDE — required because `color/card` (white) and `color/background` (slate-50) are nearly identical at the page level. Border supplies the cell silhouette for the spec frame; on real screens the keypad sits on a darker bottom-sheet surface where the border may visually drop without harm. |
| Cell radius (all 4) | `radius/sm` (8pt) |
| Cell label (digits 1-9, 0) | `Inter Medium` (500), 22pt, `color/slate/900` |
| Cell label (decimal) | same as digits — single character `,` or `.` depending on `Locale` |
| Cell glyph (Delete) | `Icon / Delete` instance at 24pt, stroke `color/slate/700` |

##### Per-row content

| Row | Cells |
|---|---|
| 1 | `1` · `2` · `3` |
| 2 | `4` · `5` · `6` |
| 3 | `7` · `8` · `9` |
| 4 | `<decimal>` · `0` · `<Delete glyph>` |

### Effect (focus rings, shadows)

`Input / Field` `Focused` state uses the spec's "ring 2pt + 2pt offset" pattern by **simply binding a 2pt `color/ring` stroke** — the offset effect (admin pattern: dual Drop Shadow stack) was simplified to a single border for visual readability in the small mobile field. If hard-edged focus visibility becomes insufficient (e.g. `prefers-contrast: more`), upgrade to the Effect-Style focus-ring pattern from `button.md`.

### Skip cells

| Set | Authored | Skipped |
|---|---|---|
| `Input / Field` | 12 | `Disabled`, `Read-only` states (handled via instance overrides) |
| `Input / Otp` | 6 | None |
| `Input / NumberPad` | 2 | None |

`Input / Pin` deferred entirely (PIN variant slated for v1.1+ per spec).

**Total: 20 cells across 3 component sets** (+ 4 new icon components in the foundation icon row).

### Deviations from spec, tracked

| Deviation | Reason | Recovery path |
|---|---|---|
| `Disabled` and `Read-only` states not in `Input / Field` variant matrix | Variant explosion — 5 states × 4 variants = 20 cells; would more than double the set size. Pattern lifted from Button which dropped its `State` axis entirely | Apply at instance time via overrides: opacity-60 + `color/muted` field fill for disabled; `Icon / Lock` instance pinned to trailing slot for read-only |
| `PIN` variant not built | Per spec "Not used in v1" — biometric fallback flows live in v1.1+ | Build a separate `Input / Pin` component set when the v1.1 biometric scope opens |
| `Focused` state uses single 2pt border, not the spec's ring + 2pt offset Effect-Style stack | Simpler visual contract on small mobile fields; offset stack is overkill at 48pt height | Upgrade to Effect-Style stack (per `button.md` "Effect (focus ring)" pattern) if `prefers-contrast: more` reveals insufficient hit fidelity |
| OTP digit weight = Semi Bold via `fontName` override (not via Style) | No 22pt Semibold Text Style exists in the foundation (closest is `text/heading` 22/600 — would actually work; consider migrating) | Consider migrating OTP digit text to `text/heading` Style (22/600) in a follow-up — same composition, no override needed |
| NumberPad keys carry a 1pt `color/input` border | Spec calls for `bg-card` only; on the page-background where component sets render, white-on-near-white made keys invisible | Border serves as silhouette for the spec frame; in real screens the keypad sits inside a sheet on `color/muted` background where the border is harmless. If sheet-context dark-mode preview ever shows the border as ugly, swap to a 1pt translucent stroke (`color/border` at 50% opacity) |
| Phone prefix uses `text/body` (Regular) with `Inter Medium` `fontName` override on the layer | No `text/body-medium-secondary` Style exists at the right weight + secondary color combo | Acceptable as a one-off — the `+998` prefix is the only mobile spot needing this combo |
| **Text · TextArea · Phone variants have no leading/trailing icon slots** (only Search has them) | Initial Pass 2 build wired `INSTANCE_SWAP` only where icons were already baked. Adding optional slots to Text/TextArea/Phone needs a per-cell refactor — the icon node must exist in every cell (visible or hidden) before `componentPropertyReferences` can wire | Follow-up: add a hidden leading + trailing instance (`Icon / User` placeholder) to each Text/TextArea/Phone cell, expose `Show leading icon` BOOL + `Show trailing icon` BOOL component properties to toggle visibility, and reuse the existing `Leading icon` / `Trailing icon` INSTANCE_SWAP properties for the swap. Mirrors Button exactly. |

### Component properties — icon swap

`Input / Field` and `Input / NumberPad` expose `INSTANCE_SWAP` component properties so designers can swap which lucide icon renders in each slot at instance time. Matches the canonical pattern from `Button` (`Leading icon` / `Trailing icon` INSTANCE_SWAP). Each property's `preferredValues` lists all 17 icons in the foundation library so the icon picker in the right-panel surfaces the full set.

| Component set | Property | Type | Default | `preferredValues` |
|---|---|---|---|---|
| `Input / Field` | `Leading icon` | `INSTANCE_SWAP` | `Icon / Search` | all 17 lucide icons |
| `Input / Field` | `Trailing icon` | `INSTANCE_SWAP` | `Icon / X` | all 17 lucide icons |
| `Input / NumberPad` | `Delete icon` | `INSTANCE_SWAP` | `Icon / Delete` | all 17 lucide icons |

The properties are wired on the **Search-variant cells only** (leading on Default/Focused/Error; trailing on Focused/Error) and the **NumberPad Delete cell** (one per Locale). The other field variants (`Text`, `TextArea`, `Phone`) currently have **no icon slots** — adding them is a follow-up (see Deviations).

> **How it works**: per `componentPropertyReferences` Plugin API contract, each instance node referencing a property must be inserted into its parent before wiring the reference. Both INSTANCE_SWAP defaults + `preferredValues` use **node IDs** (e.g. `42:30`) rather than published library keys (e.g. `42b2fbd4cc31fa3...`) — matching the Button precedent for local-only components.

### File placement

| Set / asset | Component-set ID | Position (page `❖ Components`) | Size |
|---|---|---|---|
| `Icon / Search` | `86:73` | (292, 1824) | 24 × 24 |
| `Icon / X` | `86:77` | (340, 1824) | 24 × 24 |
| `Icon / Delete` | `86:82` | (388, 1824) | 24 × 24 |
| `Icon / Lock` | `86:86` | (436, 1824) | 24 × 24 |
| `Input / Field` | `90:154` | **(100, 4500)** | 1200 × 656 |
| `Input / Otp` | `92:134` | **(100, 5256)** | 1350 × 312 |
| `Input / NumberPad` | `94:152` | **(100, 5668)** | 680 × 540 |

The three Input sets stack **vertically** below the three Chip sets at y=4500+, with consistent 100pt gaps between sets — matches the down-the-page rhythm Card / Banner / Headline Number / List Row / Button / Chip already follow. The icons append to the existing icon row at y=1824 on the same page.

> **Layout history**: Initial pass placed Input / Otp side-by-side with Input / Field at (1400, 4500) and Input / NumberPad at (100, 5300). User flagged the unbalanced layout — restacked vertically.

## Cross-references

- Tokens: [`colors.md`](../tokens/colors.md) · [`typography.md`](../tokens/typography.md) · [`spacing.md`](../tokens/spacing.md) · [`radii.md`](../tokens/radii.md)
- Money formatting (number pad separator): [`money-and-fx.md`](../../../.claude/rules/money-and-fx.md)
- Card-input boundary (PAN/CVV out-of-scope): [`card-schemes.md`](../../../.claude/rules/card-schemes.md)
- Error display: [`error-ux.md`](../../../.claude/rules/error-ux.md)
- Localization: [`localization.md`](../../../.claude/rules/localization.md)
- Layer rules: [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md)
