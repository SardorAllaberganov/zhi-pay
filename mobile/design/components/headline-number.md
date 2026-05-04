# Headline number

The FX hero. Renders an amount + currency code with controlled emphasis. The most-seen number primitive in the app — home balance, send-money review, receipt amount, history-row inline meta. Tabular numerals, locale-aware separators, never floats.

> Status: **First-pass spec, in review.** No direct admin equivalent (admin uses `<TableCell>` for amounts in dense data tables — different ergonomics). Mobile-specific by definition.

## Source of truth

- Money-handling rules: [`.claude/rules/money-and-fx.md`](../../../.claude/rules/money-and-fx.md)
- Tokens: [`colors.md`](../../tokens/colors.md), [`typography.md`](../../tokens/typography.md), [`spacing.md`](../../tokens/spacing.md)
- Localization (decimal / group separators): [`.claude/rules/localization.md`](../../../.claude/rules/localization.md)

## Sizes

Three. The size is the **role**, not personal preference.

| Size | Amount type | Currency type | Use |
|---|---|---|---|
| `display` | `Display 1` (44pt `font-bold`) | `text-base font-medium text-muted-foreground` (16pt) | Home-screen balance, receipt-screen amount |
| `hero` | `Display 2` (32pt `font-semibold`) | `text-base font-medium text-muted-foreground` (16pt) | Send-money review (you-send + recipient-gets), transfer-detail-summary |
| `inline` | `text-base font-semibold tabular-nums` (16pt) | `text-base font-medium text-muted-foreground` (16pt) | List rows (history, recipient-with-balance), inline meta |

> The `display` and `hero` sizes use the **mobile-specific Display 1 / Display 2** typography roles per [`typography.md`](../../tokens/typography.md) — admin doesn't have these (admin uses `text-4xl` / `text-3xl` topping out at 36 / 28pt; mobile lifts to 44 / 32pt for hero impact).

## Anatomy

```
display size (home balance):

      ┌──────────────────────────────────────────┐
      │                                          │
      │      5 000 000.00       UZS              │   amount: 44pt font-bold tabular-nums
      │                                          │   currency: 16pt font-medium muted
      │            ↑          ↑                  │   gap: non-breaking space
      │            tabular    NBSP                │
      └──────────────────────────────────────────┘

hero size (send-money review):

      ┌──────────────────────────────────────────┐
      │                                          │
      │      3 600.00         CNY                │   amount: 32pt font-semibold tabular-nums
      │                                          │   currency: 16pt font-medium muted
      │  Recipient gets                          │   meta line below: text-sm muted
      └──────────────────────────────────────────┘

inline size (history row):

      ┌──────────────────────────────────────────┐
      │  Wang Lei                  5 000 UZS    ›│   amount + currency · 16pt
      │  Alipay · 2h ago         Completed       │   meta below
      └──────────────────────────────────────────┘
```

| Slot | Token / value |
|---|---|
| Amount | `font-bold` (display), `font-semibold` (hero / inline), `tabular-nums` always |
| Currency code | `font-medium`, `text-muted-foreground` (slate-500 / slate-400) |
| Separator (amount → currency) | non-breaking space (` `) — never wraps to next line |
| Color (amount) | `slate-900` light / `slate-100` dark on default surface; **`white` on card-as-object surface** (home hero); `--primary-foreground` (white) inside primary buttons |
| Color (currency) | `text-muted-foreground` (slate-500 / slate-400); `white at 80% opacity` on card-as-object |
| Alignment | center (display / hero) — always centered when standalone; trailing-right (inline) when in a list row |
| Reading direction | `ltr` per [`localization.md`](../../../.claude/rules/localization.md) — RTL not in v1 |

## Number formatting (cross-cuts every size)

Per [`money-and-fx.md`](../../../.claude/rules/money-and-fx.md):

| Locale | Group separator | Decimal separator | Example (UZS) | Example (CNY) |
|---|---|---|---|---|
| `uz` | space (` `) | comma (`,`) | `5 000 000,00 UZS` | `3 600,00 CNY` |
| `ru` | space (` `) | comma (`,`) | `5 000 000,00 UZS` | `3 600,00 CNY` |
| `en` | comma (`,`) | period (`.`) | `5,000,000.00 UZS` | `3,600.00 CNY` |

> **Storage vs display**: backend stores in `bigint` minor units (UZS in tiyins, CNY in fen). UI **always** divides by 100 at display time. Never store, pass, or render floats. The Headline Number primitive accepts a `bigint` (or string-typed bigint for safety in JS) and a `currency` field; it does the formatting.

## Decimal display rule

| Currency | Decimals shown |
|---|---:|
| UZS amounts < 100 UZS | 2 (e.g. `42,50 UZS`) |
| UZS amounts ≥ 100 UZS | 0 — never `5 000 000,00 UZS` (the `,00` is noise at scale) **EXCEPT** on send-money review and receipts where `,00` is preserved for parity-checking with provider amounts |
| CNY amounts | always 2 (e.g. `3 600,00 CNY`) — Alipay/WeChat receipts always show fen precision |

> **Tighten this rule per surface, don't loosen it**: a screen can require always-2-decimals (review, receipt) but never less than the table above.

## Variants beyond the size axis

| Modifier | Effect |
|---|---|
| `signed` | Prefix `+` / `−` for delta values (cashback, refund) — `+ 50 000 UZS` |
| `muted` | `text-muted-foreground` for both amount and currency — used for "available balance" sublines |
| `strikethrough` | `line-through` on amount, used for "was this much, now this much" rate-change moments |
| `placeholder` | dashed `——` rendered in `text-muted-foreground` for unknown / loading states; same width as a 6-digit amount |

## States

| State | Treatment |
|---|---|
| `idle` | rendered with current value |
| `loading` | placeholder dashed `——` of expected length; skeleton optional via prop |
| `updating` (rate just refreshed) | brief opacity flicker over `duration-base` (220ms) — signals "I changed without you having to read both versions" |
| `error` (couldn't compute / fetch) | render `——` placeholder + danger-600 `<AlertCircle>` 16pt + helper line below |

## Token consumption summary

| Surface | Token |
|---|---|
| Amount type (display / hero / inline) | `text-display-1 font-bold` / `text-display-2 font-semibold` / `text-base font-semibold` |
| Amount feature | `tabular-nums` always |
| Currency type | `text-base font-medium text-muted-foreground` |
| Color (default) | `slate-900 / slate-100` amount; `slate-500 / slate-400` currency |
| Color (on card-as-object) | white amount; white@80% currency |
| Separator | ` ` non-breaking space, **always** |
| Locale formatter | `Intl.NumberFormat(users.preferred_language, { minimumFractionDigits, maximumFractionDigits })` driven by surface rules |
| Motion (updating flicker) | `duration-base` (220ms) opacity 1 → 0.6 → 1 |

## Composition rules

| Pattern | Rule |
|---|---|
| `display` size on home card-as-object | Centered, white amount + white@80% currency, `space-2` (8pt) above the masked PAN visually |
| `hero` size on send-money review | Stacked pair: "You send" + amount + "Recipient gets" + amount, with the FX rate disclaimer below in `text-sm text-muted-foreground` per [`money-and-fx.md`](../../../.claude/rules/money-and-fx.md) |
| `hero` size on receipt | Centered with success chip above, "Sent on {date}" meta below |
| `inline` size in a list row | Right-aligned in the trailing column of [`list-row.md`](./list-row.md), tabular-nums for visual scanning |
| `inline` size in a chip / banner | Allowed if the surface has space; ensure ≥ 4.5:1 contrast against the variant surface |
| Mixed currencies on one screen (UZS + CNY) | Render both separately; never sum across currencies. Use the `hero` pair pattern from send-money review |
| Amount > 9 digits | Spec doesn't truncate — UZ regulatory cap is 50 000 000 (8 digits + 2 decimal). If a future variant needs > 9 digits, propose a `display-xl` size |

## Accessibility

| Concern | Rule |
|---|---|
| Tabular nums | required for all sizes — keeps digits aligned during animation |
| Contrast (amount vs surface) | ≥ 4.5:1 on default surface; verified white-on-card-as-object ≥ 8.6:1 |
| Currency pronunciation | aria-label combines amount + currency in localized natural language: `aria-label="5 million 000 thousand Uzbek soms"` (uz) — use `Intl.NumberFormat(...).format()` for the visible string but a separate `Intl.NumberFormat(..., { style: 'currency' })` or natural-language helper for the SR label |
| Updating-state flicker | falls back to instant swap when `prefers-reduced-motion: reduce` |
| Color-only signals | Signed variant uses `+` / `−` prefix + (optionally) color tint — never color alone |
| Loading placeholder | announced as "Loading amount" via `aria-busy="true"` |
| Error state | helper text linked via `aria-describedby` so SR users hear "Couldn't fetch — try again" alongside the placeholder |

## Localization

| Slot | Key pattern |
|---|---|
| Currency labels | `common.currency.<code>` (e.g. `common.currency.UZS`, `common.currency.CNY`) — labels are usually 3-letter codes ("UZS" / "CNY") in all locales for consistency, but the spelled-out aria-label uses localized naturals ("Uzbek soms" / "O'zbek so'mlari" / "узбекских сумов") |
| Hero pair labels | `mobile.send-money.review.you-send`, `mobile.send-money.review.recipient-gets` |
| Updating helper | `mobile.send-money.review.rate-updating` |
| Error helper | `common.errors.FX_STALE.body` / `common.errors.FX_FETCH_FAILED.body` |

- Number formatting driven by `users.preferred_language`, **not** device locale, per [`money-and-fx.md`](../../../.claude/rules/money-and-fx.md).
- Don't translate currency codes — "UZS" stays "UZS" in every locale (ISO 4217 standard).

## Forbidden patterns

| Don't | Required |
|---|---|
| Floating-point amounts in code (`amount: number`) | `bigint` minor units; UI divides by 100 at display |
| Hardcoded separators ("5,000,000" in `uz` / `ru` locale) | `Intl.NumberFormat(users.preferred_language)` |
| Non-tabular nums | `tabular-nums` always — cross-row scan readability |
| Wrapping amount → currency across two lines | Non-breaking space (` `); never normal space |
| Mixing currencies in a single Headline Number ("5 000 UZS / 3 600 CNY") | Two Headline Numbers, side by side |
| Rounding before display (`Math.round(amount / 100)`) | Backend already enforces flooring per [`money-and-fx.md`](../../../.claude/rules/money-and-fx.md) — UI never re-rounds |
| Ellipsis on long amounts | UZ cap is 50M = 8 digits — design accommodates without truncation |
| `text-xs` (13pt) anywhere in a Headline Number | Min `text-base` (16pt) for inline — amounts are flowing data, never sub-13 |
| Showing raw `bigint` (`5000000`) in any surface | Always formatted (`5 000 000 UZS`) |
| Color signal alone for signed amounts | Prefix `+` / `−` always, color is supplemental |

## Quick grep to verify (when implemented)

```bash
# Floats anywhere in money paths:
grep -rnE 'amount:\s*number|amount:\s*[0-9]+\.[0-9]' mobile/design/ mobile/

# Hardcoded separators in non-en strings:
grep -rnE '"[0-9]+,[0-9]{3}\.[0-9]+ UZS"' mobile/i18n/

# Missing tabular-nums in money cells:
grep -rnE 'HeadlineNumber|<Amount[^>]*>' mobile/ | grep -v 'tabular-nums'

# Non-NBSP separator:
grep -rnE 'amount.*\+\s*"\s+"\s*\+\s*currency' mobile/
```

## Cross-references

- Money rules: [`money-and-fx.md`](../../../.claude/rules/money-and-fx.md)
- Tokens: [`typography.md`](../../tokens/typography.md) (Display 1 / Display 2 / Body)
- Localization: [`localization.md`](../../../.claude/rules/localization.md)
- Card-as-object surface (where `display` size lives): [`card.md`](./card.md)
- Layer rules: [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md)
- Lessons: type floor (2026-05-01), tabular-nums in admin tables (cross-cuts)
