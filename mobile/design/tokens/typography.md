# Typography

Type scale for the ZhiPay mobile app. **Mobile lifts display sizes higher than admin's web scale** (admin caps at 36pt; mobile pushes to 44pt) so the home-card balance and receipt amount can read as the heroes of the surface.

## Source of truth

- Admin scale (reference parity): [`dashboard/tailwind.config.ts`](../../../dashboard/tailwind.config.ts) lines 106–116
- Floor rule: 13px — see LESSON 2026-04-29 in [`ai_context/LESSONS.md`](../../../ai_context/LESSONS.md). Body / button / flowing text never falls below 14px (LESSON 2026-05-01 narrows the floor further for those).

## Font family

| Role | Stack |
|---|---|
| Sans | `'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, system-ui, sans-serif` |
| Mono | `'JetBrains Mono', 'SF Mono', Menlo, monospace` |

Inter is the design canon. On Android, the system stack falls back to Roboto (close enough); on iOS, to SF Pro (close enough). When Inter ships in the app bundle, override the OS default.

**Font features enabled site-wide on `<body>`:** `cv11` (single-storey `a` for legibility on small text), `ss01` (open digits — important for amounts), `ss03` (curved `l` to disambiguate from `1` and `I`). Inherited from admin globals.css.

## Numerals

**Tabular numerals (`font-variant-numeric: tabular-nums`) for every monetary, count, ID, and timestamp value.** Reach for the `.tabular` class (Tailwind utility — see [`tailwind.tokens.css`](./tailwind.tokens.css)).

Required wherever numbers stack vertically and need to align column-wise:
- Amount on home card and receipt
- Per-row amounts in History list
- FX breakdown lines on Send-money review
- Status timeline timestamps
- Tier-headroom counters
- Card expiry `MM/YY`

Decorative numbers in marketing copy (none in v1) can keep proportional figures.

## The scale (proposed — pending lock)

> **PAUSE POINT.** The Display sizes below are proposals. Approve / adjust before I generate `tokens.json` + `tailwind.tokens.css`.

Mobile reading distance is ~12–14 inches; admin web distance is ~22–28 inches. Same on-screen pixel size reads visually smaller on mobile, so display roles (hero amount + page title) need a meaningful jump up vs. admin's 36/28 cap. Body roles stay close to admin since the floor rule still binds.

| Role | Size | Weight | Line-height | Letter-spacing | Mobile-specific use |
|---|---:|:---:|---:|:---:|---|
| **Display 1** | **44pt** | 700 | 48pt | -0.02em | Hero amount on home card; receipt amount on success screen |
| **Display 2** | **32pt** | 700 | 38pt | -0.015em | Page titles ("Send money", "History", "Verify your number") |
| **Heading** | **22pt** | 600 | 28pt | -0.01em | Section heads ("Recent activity", "Linked cards") |
| **Body** | **16pt** | 400 | 24pt | 0 | Default body text, list-row primary, button label (md) |
| **Body small** | **14pt** | 400 | 20pt | 0 | Secondary meta (timestamp, helper, list-row subline, error body) |
| **Label** | **13pt** | 500 | 18pt | +0.04em (uppercased only) | Chips, kbd, uppercase section labels |

### Why these numbers

**Display 1 = 44pt:** the home-card balance is the #1 information goal of the app — "how much can I send" / "how much will the recipient get." It needs to be the loudest thing on the screen even at 200% dynamic type without overflowing. Wise iOS sits at ~42pt; Apple Pay's transaction amounts at ~38pt. 44pt with -0.02em letter-spacing reads as "trustworthy hero" without crossing into marketing-loud.

**Display 2 = 32pt:** page titles need to anchor the screen but defer to display 1 when both are present (e.g. on the receipt screen). 32pt is a clean step from 44pt (1.4x ratio) and matches admin's `3xl` (28pt) plus a 4pt mobile bump.

**Heading = 22pt:** matches admin's `2xl` verbatim — no mobile bump needed because section heads sit inside the page rhythm and don't compete with the display roles.

**Body = 16pt:** mobile bumps body from admin's 15pt to 16pt. Mobile is where users read at small visual angles and frequently with one-handed thumbs covering the bottom; the extra pixel gives both readability and a more comfortable tap-target rhythm in list rows. Apple HIG recommends 17pt; we pull back to 16pt to match the slightly tighter Inter rendering vs. SF Pro.

**Body small = 14pt:** floor for any flowing text per LESSON 2026-05-01 ("Buttons and flowing-text spans must be ≥ `text-sm` (14px) — never `text-xs`"). Used for timestamps and list-row sublines, which read clearly at 14pt with `slate-500` foreground.

**Label = 13pt:** the absolute floor per LESSON 2026-04-29 — reserved for chips / badges / kbd / uppercase-tracking-wider section labels. Never for buttons, never for flowing text.

### Comparison to admin

| Role (mobile) | Mobile size | Admin equivalent | Admin size | Δ |
|---|---:|---|---:|---|
| Display 1 | 44pt | `4xl` | 36pt | +8pt |
| Display 2 | 32pt | `3xl` | 28pt | +4pt |
| Heading | 22pt | `2xl` | 22pt | 0 |
| Body | 16pt | `lg` | 16pt | 0 (admin uses `base` 15pt for body; mobile picks `lg` 16pt) |
| Body small | 14pt | `sm` | 14pt | 0 |
| Label | 13pt | `xs` | 13pt | 0 |

The bump is concentrated at the display tier — body reads consistently across surfaces, which keeps i18n line-height calculations transferable.

## Specimen

Each role typeset on a sample sentence, with the token name beneath. Render this as a screen frame in the foundation pass.

```
Display 1 — 44pt / 48 / 700 / -0.02em
5 000 000.00 UZS
                                  display-1

Display 2 — 32pt / 38 / 700 / -0.015em
Send money to China
                                  display-2

Heading — 22pt / 28 / 600 / -0.01em
Recent activity
                                  heading

Body — 16pt / 24 / 400 / 0
You'll send to Wang Lei via Alipay.
                                  body

Body small — 14pt / 20 / 400 / 0
Rate locked for 02:34 · Updated 12:42
                                  body-sm

Label — 13pt / 18 / 500 / +0.04em (when uppercased)
COMPLETED · TIER 2 · MyID
                                  label
```

## Localization considerations

- **Russian runs 15–25% longer than English; Uzbek (Cyrillic + Latin scripts) sits between.** Test every text-bearing screen with the longest of `uz` / `ru` / `en` translations.
- **No truncation by default on the display tier.** Display 1 / Display 2 wrap to a second line; never ellipsize an amount or a page title.
- **Plural-sensitive Russian forms** add line-height pressure (`5 переводов` vs `1 перевод`); leading is sized to absorb either.
- **Uzbek diacritics** (`ʻ` `ʼ`) sit on the cap line — Inter renders them cleanly. The Latin / Cyrillic switch on Settings re-renders the whole tree; no in-place script swap.

## Dynamic type

- Honor OS text-size setting up to 200% per [`accessibility.md`](../../../.claude/rules/accessibility.md).
- Sizes scale linearly off the user-set base. No layout reflow tricks — the design must accept a Display 1 reflow from one line to two without clipping.
- Test the home card and receipt amount at 200%: the display-1 numeral should remain legible and inside the safe area. Worst case: the hero card grows from 220pt tall to ~280pt tall on iPhone-15-Pro viewport.

## Accessibility callouts

- **Contrast** is enforced at the color-token layer — see [`colors.md`](./colors.md).
- **Body / button minimum 14pt** — never 13pt for flowing text or interactive labels (LESSON 2026-05-01).
- **Tabular nums on every numeric value** so amounts align column-wise across list rows.
- **Letter-spacing**: positive (+0.04em) ONLY on uppercased labels — never on flowing text or buttons.

## Forbidden patterns

| Don't | Required |
|---|---|
| `text-xs` (13pt) on buttons | Always `text-sm` (14pt) minimum on buttons (LESSON 2026-05-01) |
| `text-xs` (13pt) on flowing meta (timestamps, sublines) | `text-sm` (14pt) — Body small role |
| `text-[10px]` / `text-[11px]` / `text-[12px]` anywhere | Forbidden — full stop. If a layout "needs" smaller, the layout is wrong (LESSON 2026-04-29) |
| Italic for emphasis on copy | Use `font-medium` (500) or color shift |
| Underlined body text | Underline reserved for inline links and `<a>` |
| Mixing `font-mono` with body text in a paragraph | Mono is for IDs, addresses, masked PAN, error codes only |
| Custom font-feature settings per screen | Inherit from `<body>` — don't override per-screen |

## Cross-references

- Floor rules: LESSONS 2026-04-29 + 2026-05-01 in [`ai_context/LESSONS.md`](../../../ai_context/LESSONS.md)
- Accessibility (dynamic type, contrast): [`accessibility.md`](../../../.claude/rules/accessibility.md)
- Localization (line length, plural forms): [`localization.md`](../../../.claude/rules/localization.md)
- Money formatting (tabular nums use sites): [`money-and-fx.md`](../../../.claude/rules/money-and-fx.md)
- Admin scale (parity reference): [`dashboard/tailwind.config.ts`](../../../dashboard/tailwind.config.ts) lines 106–116
