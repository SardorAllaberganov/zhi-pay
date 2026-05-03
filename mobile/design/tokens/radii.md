# Radii

Four radius stops, plus a pill. Every rounded surface in the mobile app picks one of these — no arbitrary values.

## Source of truth

Inherits the admin's underlying CSS vars where they overlap. Mobile adds `radius-large` (20pt) for the hero card-as-object surface, which admin doesn't have a use for.

- Admin reference: [`dashboard/src/styles/globals.css`](../../../dashboard/src/styles/globals.css) lines 73–77

## Tokens

| Token | Value | Tailwind | Use |
|---|---:|---|---|
| `radius-sm` | 8pt | `rounded-md` | Inputs, chips, toast |
| `radius-md` | 12pt | `rounded-lg` | Cards, buttons, banners, list rows (when hosted in a card) |
| `radius-lg` | 20pt | `rounded-[20px]` (custom) | Sheets (top corners only), hero card-as-object on home, receipt amount card |
| `radius-pill` | 9999px | `rounded-full` | Tier badges, status chips, segmented-control track + thumb, avatar |

> Note on admin alignment: admin uses `radius-sm = 4px` for the lightest stop. Mobile bumps to **8pt** because mobile inputs at 48pt height with 4pt corners read tinny. Buttons at 48pt height with 12pt corners (`radius-md`) sit in the visual sweet-spot for fintech (Wise, Apple Pay, Cash App all live in 10–14pt range).

## Per-component spec

### Inputs / chips / toasts → `radius-sm` (8pt)

```
┌─[8pt corners]─────────────────────────┐
│  Phone number                          │
│  +998 90 123 45 67                     │
└────────────────────────────────────────┘
```

### Cards / buttons / banners → `radius-md` (12pt)

```
╭─[12pt corners]───────────────────────╮
│                                       │
│  Recent activity                      │
│  ──────────────────                   │
│                                       │
│  Wang Lei → Alipay     5 000 UZS     │
│  Today, 14:32                         │
│                                       │
╰───────────────────────────────────────╯
```

### Hero card-as-object / sheets → `radius-lg` (20pt)

```
        ╭─[20pt corners]─────────╮
        │                          │
        │  ZHIPAY                  │
        │                          │
        │  4242 42•• •••• 4242     │
        │                          │
        │  AGZAMOVA F.    12/27    │
        │                          │
        ╰──────────────────────────╯
```

Sheets apply `radius-lg` to the top two corners only; bottom flush to safe-area edge.

### Pill → `radius-full` (9999px)

```
   ╭───────────╮
   │ COMPLETED │     status chip
   ╰───────────╯

   ╭──── ●  ────╮
   │ ●        ○ │     segmented control thumb (3-segment)
   ╰────────────╯
```

## Composition rules

| Pattern | Radius |
|---|---|
| Card with embedded card (e.g. nested context card on Send-money review) | Outer `radius-md`, inner `radius-sm` (visual containment cue) |
| Card with embedded list rows | Card `radius-md`; first / last list-row top / bottom corners inherit the card's curve via `overflow-hidden` on the card |
| Modal (full-screen) | No radius — fills viewport edge to edge |
| Modal (centered, tablet — out of v1) | `radius-lg` |
| Image-in-card | Image radius = card-radius minus internal padding (~`radius-md` = 12pt → image `radius-sm` = 8pt) |
| Avatar (square photos auto-cropped) | `radius-full` |

## Forbidden patterns

| Don't | Required |
|---|---|
| Arbitrary radius like `rounded-[7px]` | Stick to scale (`rounded-md = 12pt`) |
| Mixing radii on adjacent elements without composition rule | Apply composition rules above; document any deviation |
| Half-rounded corners on a card (e.g. only top-left + bottom-right) | Reserved for sheets — never for cards |
| Removing radius from CTA buttons to "look more enterprise" | Mobile is consumer; restraint comes from color and weight, not square corners |

## Cross-references

- Admin reference: [`dashboard/src/styles/globals.css`](../../../dashboard/src/styles/globals.css)
- Layer rules: [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md)
