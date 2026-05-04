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

## Cross-references

- Tokens: [`colors.md`](../tokens/colors.md) · [`typography.md`](../tokens/typography.md) · [`spacing.md`](../tokens/spacing.md) · [`radii.md`](../tokens/radii.md)
- Money formatting (number pad separator): [`money-and-fx.md`](../../../.claude/rules/money-and-fx.md)
- Card-input boundary (PAN/CVV out-of-scope): [`card-schemes.md`](../../../.claude/rules/card-schemes.md)
- Error display: [`error-ux.md`](../../../.claude/rules/error-ux.md)
- Localization: [`localization.md`](../../../.claude/rules/localization.md)
- Layer rules: [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md)
