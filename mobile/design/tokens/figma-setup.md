# Figma Setup — Mobile Design System

The canonical setup guide for wiring the mobile token layer into the Figma file. **Variables for everything Figma supports as Variables (color / number); Styles for everything Figma doesn't (text composition, effects).**

> Status: locked `2026-05-04`. The mobile design system is built and reviewed in Figma (this is the implementation surface). The spec docs in [`mobile/design/`](../) describe **what** to build; this doc describes **how** the tokens land in Figma so primitives + components can bind to them.

## Source of truth

- Token primitives: [`colors.md`](./colors.md), [`typography.md`](./typography.md), [`spacing.md`](./spacing.md), [`radii.md`](./radii.md), [`shadows.md`](./shadows.md), [`motion.md`](./motion.md)
- Tokens Studio export (optional sync path): [`tokens.json`](./tokens.json)
- Layer hierarchy: [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md)

If a value here disagrees with a token spec doc, **the spec doc wins** — fix this file first, then re-import to Figma.

## What lives where

| Figma surface | What it holds | Why |
|---|---|---|
| **Variables** (Color collection, 2 modes) | All color values — primitive ramps + semantic role mappings | Native theme switching; aliasing makes ramp updates cascade |
| **Variables** (Spacing / Radius / Duration collections, single mode) | Number primitives | Figma Number variables can drive Auto Layout gap, padding, corner radius, smart-animate duration |
| **Text Styles** | 6 typography roles (font / size / weight / leading / tracking composed) | Figma Text Styles can't be themed via Variables (font-size isn't a Variable type in Figma yet); Text Styles are the unit of composition |
| **Effect Styles** | Shadows — `sm` / `md` / `lg` / `hero` × Light / Dark = 8 styles | Effect Styles aren't mode-aware in Figma today; we author one Effect Style per (elevation × mode) and swap manually when designing dark frames |
| **Components / Component Sets** | Primitives + Components | Variant axes per primitive/component; bind Variables to fills / strokes / corner-radius / Auto Layout values |

## Naming convention

Slash-separated paths group variables in Figma's panel cleanly. **Match these names exactly** so spec docs (which reference `color/brand/600`, `space/4`, `radius/lg`) bind 1:1 to Figma.

| Layer | Pattern | Example |
|---|---|---|
| Primitive color ramp | `color/<family>/<stop>` | `color/brand/600`, `color/slate/100`, `color/success/700` |
| Semantic color | `color/semantic/<role>` | `color/semantic/background`, `color/semantic/foreground`, `color/semantic/primary`, `color/semantic/ring` |
| Spacing | `space/<step>` | `space/0`, `space/4`, `space/12` |
| Radius | `radius/<stop>` | `radius/sm`, `radius/md`, `radius/lg`, `radius/pill` |
| Duration | `duration/<stop>` | `duration/fast`, `duration/base`, `duration/slow` |
| Text Style | `text/<role>` | `text/display-1`, `text/heading`, `text/body`, `text/label` |
| Effect Style | `effect/shadow-<elevation>/<mode>` | `effect/shadow-sm/light`, `effect/shadow-hero/dark` |
| Component / Set | `<Component>/<Variant>/<Size>/<State>/<Modifier>` | `Button/Primary/Md/Default/NoIcon`, `Card/Hero/Default` |

PascalCase for component / variant names; kebab-case inside variant values where multi-word (e.g. `Body small`, but `body-sm` in the variable name).

---

## Variables — Color collection (2 modes: Light + Dark)

Create **one Color collection** with two modes named exactly `Light` and `Dark`. Add primitive ramp variables first; semantic variables alias to the ramps via Figma's "Use existing variable" picker.

### Primitive ramps (same value in both modes)

Brand, slate, and semantic 3-stop ramps are mode-agnostic — the stop value never flips. Author them with **identical Light + Dark values** so the semantic-role aliases below resolve cleanly per mode.

#### `color/brand/*` (11 stops)

| Variable | Light + Dark value (HSL) | Hex (approx) |
|---|---|---|
| `color/brand/50` | `hsl(210, 80%, 95%)` | `#e8f1fc` |
| `color/brand/100` | `hsl(210, 78%, 88%)` | `#c9def8` |
| `color/brand/200` | `hsl(210, 76%, 76%)` | `#92bef0` |
| `color/brand/300` | `hsl(210, 70%, 64%)` | `#5b9be3` |
| `color/brand/400` | `hsl(210, 66%, 53%)` | `#3879cc` |
| `color/brand/500` | `hsl(209, 77%, 45%)` | `#1c70b9` |
| `color/brand/600` | `hsl(209, 90%, 39%)` | `#0a64bc` |
| `color/brand/700` | `hsl(211, 91%, 32%)` | `#0c569b` |
| `color/brand/800` | `hsl(213, 89%, 25%)` | `#0e4274` |
| `color/brand/900` | `hsl(215, 86%, 18%)` | `#0e3155` |
| `color/brand/950` | `hsl(217, 92%, 12%)` | `#062148` |

#### `color/slate/*` (11 stops)

| Variable | Light + Dark value (HSL) | Hex (approx) |
|---|---|---|
| `color/slate/50` | `hsl(210, 40%, 98%)` | `#f8fafc` |
| `color/slate/100` | `hsl(210, 40%, 96%)` | `#f1f5f9` |
| `color/slate/200` | `hsl(214, 32%, 91%)` | `#e2e8f0` |
| `color/slate/300` | `hsl(213, 27%, 84%)` | `#cbd5e1` |
| `color/slate/400` | `hsl(215, 20%, 65%)` | `#94a3b8` |
| `color/slate/500` | `hsl(215, 16%, 47%)` | `#64748b` |
| `color/slate/600` | `hsl(215, 19%, 35%)` | `#475569` |
| `color/slate/700` | `hsl(215, 25%, 27%)` | `#334155` |
| `color/slate/800` | `hsl(217, 33%, 17%)` | `#1e293b` |
| `color/slate/900` | `hsl(222, 47%, 11%)` | `#0f172a` |
| `color/slate/950` | `hsl(229, 84%, 5%)` | `#020617` |

#### `color/success/*`, `color/warning/*`, `color/danger/*` (3 stops each)

| Variable | HSL | Hex |
|---|---|---|
| `color/success/50` | `hsl(138, 76%, 97%)` | `#f0fdf4` |
| `color/success/600` | `hsl(142, 71%, 45%)` | `#22c55e` |
| `color/success/700` | `hsl(142, 76%, 36%)` | `#15803d` |
| `color/warning/50` | `hsl(48, 100%, 96%)` | `#fefce8` |
| `color/warning/600` | `hsl(32, 95%, 44%)` | `#dc8a05` |
| `color/warning/700` | `hsl(26, 90%, 37%)` | `#b45309` |
| `color/danger/50` | `hsl(0, 86%, 97%)` | `#fef2f2` |
| `color/danger/600` | `hsl(0, 72%, 51%)` | `#dc2626` |
| `color/danger/700` | `hsl(0, 74%, 42%)` | `#b91c1c` |

### Semantic role aliases (different value per mode)

These are the **role-anchored aliases** that flip Light ↔ Dark. **Always alias** (Figma "Use existing variable") — never hardcode the hex on a semantic variable. If you change a primitive stop, semantic roles cascade automatically.

| Variable | Light → alias to | Dark → alias to |
|---|---|---|
| `color/semantic/background` | `color/slate/50` | `color/slate/950` |
| `color/semantic/foreground` | `color/slate/900` | `color/slate/100` |
| `color/semantic/card` | `#FFFFFF` (raw) | `color/slate/900` |
| `color/semantic/card-foreground` | `color/slate/900` | `color/slate/100` |
| `color/semantic/popover` | `#FFFFFF` (raw) | `color/slate/900` |
| `color/semantic/popover-foreground` | `color/slate/900` | `color/slate/100` |
| `color/semantic/primary` | `color/brand/600` | `color/brand/500` |
| `color/semantic/primary-foreground` | `#FFFFFF` (raw) | `#FFFFFF` (raw) |
| `color/semantic/secondary` | `color/slate/100` | `color/slate/800` |
| `color/semantic/secondary-foreground` | `color/slate/900` | `color/slate/100` |
| `color/semantic/muted` | `color/slate/100` | `color/slate/800` |
| `color/semantic/muted-foreground` | `color/slate/500` | `color/slate/400` |
| `color/semantic/accent` | `color/slate/100` | `color/slate/800` |
| `color/semantic/accent-foreground` | `color/slate/900` | `color/slate/100` |
| `color/semantic/destructive` | `color/danger/600` | `color/danger/600` |
| `color/semantic/destructive-foreground` | `#FFFFFF` (raw) | `#FFFFFF` (raw) |
| `color/semantic/border` | `color/slate/200` | `color/slate/800` |
| `color/semantic/input` | `color/slate/200` | `color/slate/800` |
| `color/semantic/ring` | `color/brand/600` | `color/brand/400` |

> **Why `primary` flips brand/600 → brand/500 in dark:** brand/600 on slate/950 reads slightly muddy (~3.8:1 contrast on white-on-brand fill); brand/500 lifts to ~5.0:1. Same reason `ring` flips brand/600 → brand/400 — focus visibility on dark surfaces. Don't drift these.

> **Pure white (`#FFFFFF`) is NOT a primitive variable** — it's the raw value for `card`, `popover`, `primary-foreground`, and `destructive-foreground` in light mode (and primary/destructive foregrounds in dark too). Authored as raw to keep the primitive ramp clean (white isn't part of the slate ramp).

---

## Variables — Spacing collection (single mode)

Create **one Spacing collection** with a single mode. Use Figma's `Number` variable type. These bind to Auto Layout `padding`, `gap`, and to width/height where a fixed dimension is needed.

| Variable | Value (pt) | Tailwind | Use |
|---|---:|---|---|
| `space/0` | 0 | `0` | Reset / collapse |
| `space/1` | 4 | `1` | Hairline gap (icon → text in chip) |
| `space/2` | 8 | `2` | Tight gap (chip row, kbd combo) |
| `space/3` | 12 | `3` | List-row vertical padding (sm); button leading-icon → label |
| `space/4` | 16 | `4` | Card content padding (sm); list-row default vertical; gap between input rows |
| `space/5` | 20 | `5` | Card content padding (md, default); Sheet content padding |
| `space/6` | 24 | `6` | Card section gap; modal body padding |
| `space/7` | 32 | `8` | Section vertical rhythm |
| `space/8` | 40 | `10` | Page gutter top/bottom on hero screens |
| `space/9` | 48 | `12` | Hero card outer margin from viewport edge |
| `space/10` | 64 | `16` | Empty-state vertical breathing |
| `space/11` | 80 | `20` | Reserved (currently unused) |
| `space/12` | 96 | `24` | Reserved (currently unused) |

> Tailwind values listed for reference parity with the codebase — designers in Figma reach for the variable name (`space/4`), not the Tailwind class.

---

## Variables — Radius collection (single mode)

Create **one Radius collection** with a single mode. Use Figma's `Number` variable type for stops; the pill stop binds to a custom `9999` value (Figma corner-radius caps at half the smaller side automatically).

| Variable | Value (pt) | Use |
|---|---:|---|
| `radius/sm` | 8 | Inputs, chips, toast |
| `radius/md` | 12 | Cards, buttons, banners, list rows (when hosted in a card) |
| `radius/lg` | 20 | Sheets (top corners only), hero card-as-object on home, receipt amount card |
| `radius/pill` | 9999 | Tier badges, status chips, segmented-control track + thumb, avatar |

---

## Variables — Duration collection (single mode)

Create **one Duration collection** with a single mode. Use Figma's `Number` variable type. These drive **Smart Animate** durations on prototype connections.

| Variable | Value (ms) | Use |
|---|---:|---|
| `duration/fast` | 140 | Press-state on buttons, chip hover, toggle thumb |
| `duration/base` | 220 | Sheet open/close, toast in, banner reveal, segmented switch (default) |
| `duration/slow` | 320 | Modal open, sheet snap-point change, full-screen page transition |

> Easing curves (`ease-standard`, `ease-emphasized`, `ease-exit`) are NOT Figma Variables — Smart Animate offers a discrete easing dropdown. Pick the closest preset, then document the canonical cubic-bezier in the prototype description. See [`motion.md`](./motion.md) for the curves.

---

## Text Styles

Create **6 Text Styles** matching the typography roles. Bind `Color` to `color/semantic/foreground` (or override per usage); the rest of the composition is locked into the Text Style.

| Text Style | Font | Size | Weight | Line height | Letter spacing | Use |
|---|---|---:|---:|---:|---:|---|
| `text/display-1` | Inter | 44 | 700 (Bold) | 48 | -0.02em | Hero amount on home card; receipt amount on success screen |
| `text/display-2` | Inter | 32 | 700 (Bold) | 38 | -0.015em | Page titles ("Send money", "History") |
| `text/heading` | Inter | 22 | 600 (Semibold) | 28 | -0.01em | Section heads ("Recent activity", "Linked cards") |
| `text/body` | Inter | 16 | 400 (Regular) | 24 | 0 | Default body text, list-row primary, button label (md) |
| `text/body-sm` | Inter | 14 | 400 (Regular) | 20 | 0 | Secondary meta (timestamp, helper, list-row subline, error body) |
| `text/label` | Inter | 13 | 500 (Medium) | 18 | +0.04em (uppercased only) | Chips, kbd, uppercase section labels |

### Mono Text Styles (3)

For IDs, masked PAN, error codes — same sizes / weights as the roles above but with `JetBrains Mono` substituted. Author as **3 separate styles** to keep authoring instinct clear:

| Text Style | Font | Size | Weight | Line height | Use |
|---|---|---:|---:|---:|---|
| `text/mono/body` | JetBrains Mono | 16 | 400 | 24 | Inline IDs in body context |
| `text/mono/body-sm` | JetBrains Mono | 14 | 400 | 20 | Masked PAN, error codes, transfer IDs in meta lines |
| `text/mono/label` | JetBrains Mono | 13 | 500 | 18 | kbd hints, status pip labels |

### Font features (set once on the document)

Inter ships with custom font features that the spec depends on. In Figma, set these on **every Inter Text Style** via the Type panel → Details:

- `cv11` (single-storey `a`)
- `ss01` (open digits — important for amounts)
- `ss03` (curved `l` to disambiguate from `1` and `I`)
- `tnum` (tabular numerals — **on for every Text Style by default**; designers turn off only on decorative copy)

If Figma's font-feature surface doesn't expose `cv11` / `ss01` / `ss03` for Inter (varies by Figma version), document the dependency and rely on the engineering layer to apply them at the `<body>` tag. Tabular numerals **must** be on at the Text Style level since they're the spec's hard requirement for every monetary / count / ID / timestamp value.

---

## Effect Styles

Effect Styles in Figma can't be themed via Variables (no mode awareness for effects today). Author **8 separate Effect Styles** — one per (elevation × mode) — and swap manually when designing dark frames.

### Light mode (4)

| Effect Style | Composition |
|---|---|
| `effect/shadow-sm/light` | Drop Shadow: X 0 / Y 1 / Blur 2 / Spread 0 / Color `#000000` 4% |
| `effect/shadow-md/light` | Drop Shadow #1: X 0 / Y 4 / Blur 12 / Spread -2 / Color `#000000` 8% · Drop Shadow #2: X 0 / Y 1 / Blur 3 / Spread -1 / Color `#000000` 4% |
| `effect/shadow-lg/light` | Drop Shadow #1: X 0 / Y 12 / Blur 32 / Spread -8 / Color `#000000` 12% · Drop Shadow #2: X 0 / Y 4 / Blur 12 / Spread -2 / Color `#000000` 6% |
| `effect/shadow-hero/light` | Drop Shadow #1: X 0 / Y 24 / Blur 48 / Spread -12 / Color `color/brand/900` 20% · Drop Shadow #2: X 0 / Y 8 / Blur 24 / Spread -4 / Color `color/brand/800` 12% |

### Dark mode (4) — same offsets, opacity ~2-3× higher

| Effect Style | Composition |
|---|---|
| `effect/shadow-sm/dark` | Drop Shadow: X 0 / Y 1 / Blur 2 / Spread 0 / Color `#000000` 40% |
| `effect/shadow-md/dark` | Drop Shadow #1: X 0 / Y 4 / Blur 12 / Spread -2 / Color `#000000` 50% · Drop Shadow #2: X 0 / Y 1 / Blur 3 / Spread -1 / Color `#000000` 30% |
| `effect/shadow-lg/dark` | Drop Shadow #1: X 0 / Y 12 / Blur 32 / Spread -8 / Color `#000000` 60% · Drop Shadow #2: X 0 / Y 4 / Blur 12 / Spread -2 / Color `#000000` 40% |
| `effect/shadow-hero/dark` | Drop Shadow #1: X 0 / Y 24 / Blur 48 / Spread -12 / Color `color/brand/950` 65% · Drop Shadow #2: X 0 / Y 8 / Blur 24 / Spread -4 / Color `color/brand/900` 45% |

> **Limit one `shadow-hero` per screen** (per [`shadows.md`](./shadows.md)). Reserved for the home card-as-object and the receipt amount card. Don't sprinkle.

> **Future Figma support:** when Figma adds Effect Variables (it's on the roadmap as of 2026), collapse the 8 Effect Styles down to 4 + a mode flip via Variables. Until then, swap manually.

---

## Setup steps (in order)

Follow this order to avoid backward references when aliasing. Each step assumes the previous is complete.

1. **Create the Color collection** with two modes (`Light`, `Dark`). Add all primitive ramp variables (brand / slate / success / warning / danger). Set the same value in both modes.
2. **Add semantic alias variables** (`color/semantic/*`) inside the same Color collection. Use the "Use existing variable" picker so each semantic variable resolves through the alias chain. Verify the Light/Dark swap works by toggling the mode at the file level.
3. **Create the Spacing collection** (single mode) with all `space/*` Number variables.
4. **Create the Radius collection** (single mode) with all `radius/*` Number variables.
5. **Create the Duration collection** (single mode) with all `duration/*` Number variables.
6. **Author the 9 Text Styles** (6 sans + 3 mono). Pin Inter to the team library if not already published. Set font features per Style.
7. **Author the 8 Effect Styles** (4 light + 4 dark).
8. **Smoke-test on a throwaway frame:** drop a rectangle, fill it with `color/semantic/primary`, set corner radius via `radius/md`, padding via `space/5`, type via `text/body`, effect via `effect/shadow-md/light`. Toggle the file mode Light → Dark and confirm the fill flips to `brand/500` and the shadow stays light (you swap to `effect/shadow-md/dark` manually).
9. **Publish the library** so primitives + components published in the same file pick up the variables.

---

## Optional sync path — Tokens Studio for Figma

If you'd rather sync from [`tokens.json`](./tokens.json) than hand-author the variables:

1. Install the **Tokens Studio for Figma** plugin.
2. Plugin → Settings → Import → JSON → paste / select `tokens.json`.
3. Plugin → Settings → enable **"Sync to Variables"** mode (Tokens Studio v2+).
4. Push tokens to Variables. The plugin creates the collections + variables matching the names in `tokens.json` (which use the same `slash/separated/path` convention as this doc).
5. Verify the resulting Variables match this doc's naming and modes — re-import overrides any divergence.

> Tokens Studio's Sync-to-Variables feature is opinionated about naming and may not split `color/semantic/light/*` and `color/semantic/dark/*` into the same variable with two modes — it may create two variables instead. If that happens, manually consolidate via the Variables panel after import. Hand-authoring per the steps above is more durable.

---

## Component-set naming convention

For all primitives + components published as Figma component sets, use this pattern:

```
<Component> / <Variant> / <Size> / <State> / <Modifier>
```

Examples:

| Component | Naming |
|---|---|
| Button (primary, md, idle, no icon) | `Button / Primary / Md / Default / NoIcon` |
| Button (primary, md, loading, leading icon) | `Button / Primary / Md / Loading / IconLeading` |
| Card (resting variant) | `Card / Resting / Default` |
| Card (hero card-as-object) | `Card / Hero / Default` |
| List row (avatar variant, two-line) | `ListRow / Avatar / TwoLine / Default` |
| Status chip (completed) | `Chip / Status / Completed` |
| Tier badge (tier 2 with MyID glyph) | `Chip / Tier / Tier2 / WithMyID` |

**Variant axis ordering** — pick one canonical order per component (defined in the component's spec), document it, then keep it stable. Don't reorder axes after publish (breaks variant-picker memory).

**Skip-cells** — combinations that don't exist (e.g. `Button / Loading / IconTrailing` — loading state hides the icon) are simply not authored. Don't ship empty / placeholder cells.

---

## What this enables

With the above wired in Figma, every primitive and component spec in [`mobile/design/primitives/`](../primitives/) and [`mobile/design/components/`](../components/) carries a **Figma component-set** section listing variant axes + variable bindings per cell. Building a primitive in Figma becomes mechanical:

1. Read the spec's variant-axis table.
2. Create the component set with those axes.
3. For each cell, bind layer fills / strokes / corner radius / Auto Layout values to the variables called out in the spec.
4. Publish to the team library.

No interpretive work, no re-derivation from prose.

---

## Lessons binding this layer

These ZhiPay LESSONS shape the Figma file directly — keep them in mind while authoring components:

- **Type floor — never below 13pt; buttons + flowing text never below 14pt** ([LESSONS 2026-04-29 / 2026-05-01](../../../ai_context/LESSONS.md))
- **Tabular numerals on every monetary / count / ID / timestamp** (set on every Text Style by default)
- **Color is never the only signal** — pair status chips with icon + label ([accessibility.md](../../../.claude/rules/accessibility.md))
- **Tap targets ≥ 44 × 44pt** — extend tap-area beyond the visual when smaller
- **Visa / Mastercard scoped out of v1 mock** ([LESSON 2026-04-30](../../../ai_context/LESSONS.md)) — do not author Visa/MC variants on `SchemeLogo` until explicitly invoked, even though the spec keeps them documented for re-introduction
- **Privacy: full PAN / PINFL / document number never displayed** — even on tap, even in admin frames ([core-principles.md](../../../.claude/rules/core-principles.md))
- **Sticky chrome reserved for filter bars / bulk-action bars / right-rail action panels** — never tab strips, never detail-page headers ([LESSONS 2026-05-02 / 2026-05-03](../../../ai_context/LESSONS.md))
- **Card primitive padding is contract, not buffet** — replace the primitive with raw frames + dividers when you need a flush body, don't half-override `<CardHeader pb-0>` ([LESSON 2026-05-03](../../../ai_context/LESSONS.md))

---

## Forbidden patterns

| Don't | Required |
|---|---|
| Hardcode a hex on a layer fill | Bind to a `color/*` variable |
| Author a semantic variable (`color/semantic/*`) with raw values per mode | Always alias to a primitive ramp variable |
| Mix `radius/sm` (8pt) and `radius/md` (12pt) on adjacent elements without composition rule | Apply the composition rules in [`radii.md`](./radii.md) |
| Add a one-off Effect Style (`shadow-card-special`) | Pick one of the 4 elevations; if you need a new one, propose it in [`shadows.md`](./shadows.md) first |
| Detune a Text Style for a single screen | Specs override at the layer level, not the Style level |
| Drift naming from this doc (`color/brand-600` instead of `color/brand/600`) | Use slash-separated paths exactly — primitives' Figma-binding sections reference these names verbatim |

---

## Cross-references

- Token specs: [`colors.md`](./colors.md), [`typography.md`](./typography.md), [`spacing.md`](./spacing.md), [`radii.md`](./radii.md), [`shadows.md`](./shadows.md), [`motion.md`](./motion.md)
- Tokens Studio export: [`tokens.json`](./tokens.json)
- Layer rules: [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md)
- Accessibility floor: [`accessibility.md`](../../../.claude/rules/accessibility.md)
- Lessons: [`ai_context/LESSONS.md`](../../../ai_context/LESSONS.md)
- Layer index: [`README.md`](./README.md)
