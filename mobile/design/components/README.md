# Mobile Components — Layer 3

The third layer of the ZhiPay mobile design system. Components consume **Tokens + Primitives**. Patterns / Screens / Flows above this layer compose from these — domain-aware compositions, not raw primitives.

> Status: **First-pass spec, in review.** All 11 components drafted. The companion sample app shell (light / dark / 200% dynamic-type frame) lands as a separate render artefact once specs are locked.

## What lives here

| File | Purpose |
|---|---|
| [`card.md`](./card.md) | 6 variants — resting · header-body · footer-action · flat · interactive · card-as-object (home hero, mobile-specific). Strict padding contract per LESSON 2026-05-03 |
| [`list-row.md`](./list-row.md) | 5 variants — single-line · two-line · avatar · toggle · selectable. Most-used composition in the app |
| [`banner.md`](./banner.md) | 4 tones — info · success · warning · danger. Inline only, never sticky. Tier-upgrade prompts, MyID expiry, FX stale, offline |
| [`toast.md`](./toast.md) | 4 tones — top-of-screen, swipe-to-dismiss, auto-dismiss for non-error. Sonner-based shape |
| [`segmented-control.md`](./segmented-control.md) | 2 variants — `inline-flex` (default) / `fullWidth` (LESSON 2026-05-03). Pill track + thumb. 2 or 3 segments |
| [`tab-bar.md`](./tab-bar.md) | Bottom navigation — 4 tabs (Home / Send / History / More). No FAB, no diagonal cutout. CountBadge overlay |
| [`sheet.md`](./sheet.md) | Bottom sheet — 3 snap points (peek / half / full). Drag handle + content + optional sticky-bottom action |
| [`modal.md`](./modal.md) | Full-screen dialog — 3 variants (confirm · destructive · info). Reserved for confirm-send, freeze-card, sign-out, MyID-expiry |
| [`headline-number.md`](./headline-number.md) | The FX hero — `display` (44pt home balance), `hero` (32pt review screen), `inline` (16pt list rows). Tabular nums, locale-aware separators, never floats |
| [`status-timeline.md`](./status-timeline.md) | Vertical event timeline — past filled, current ringed, future hollow. Mirrors admin's `<StatusTimeline>` mobile-tuned |
| [`scheme-logo.md`](./scheme-logo.md) | Brand-accurate scheme marks — UzCard, Humo, Visa, Mastercard, Alipay, WeChat. Visa/MC excluded from v1 mock per LESSON 2026-04-30 |

## Layer rules (recap)

Per [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md):

```
Tokens     ←  this layer consumes
Primitives ←  this layer consumes
Components ←  THIS LAYER (no sideways imports — components never import other components)
Patterns   →  consume Tokens + Primitives + Components
Screens    →  consume all layers above
Flows      →  compose Screens
```

**Strictly downward.** A Card doesn't import a ListRow; a Banner doesn't import a Toast; a Sheet doesn't import a Modal. Each component is self-contained at this layer. If two components need to share something, it lives in Tokens or Primitives. If a "component" wraps another component, it's a Pattern — move it up a layer.

## Cross-cutting decisions

These decisions cut across every component in this layer.

| Concern | Rule |
|---|---|
| **Padding contract** | Card primitive padding is a contract, not a buffet (LESSON 2026-05-03). Either consume `<CardHeader>` + `<CardContent>` + `<CardFooter>` whole, OR replace with raw elements that own their own padding. Same applies to Sheet headers / content / sticky-action and Modal title / body / actions |
| **Sticky-vs-inline chrome** | Bottom action bars on detail pages: `position: fixed` overlay (LESSON 2026-05-02). Tab strips on tabbed admin surfaces: NEVER sticky (LESSON 2026-05-03). Banners: inline only, never sticky. Tab bar: `bottom: 0` always present in the app shell |
| **Type floor** | Buttons + flowing text ≥ `text-sm` (14pt) per LESSON 2026-05-01. Headline-Number `inline` ≥ `text-base` (16pt). `text-xs` (13pt) reserved for chip / kbd / uppercase tracking-wider section labels / avatar initials / tooltip body / tab-bar labels. Banner / Toast / Modal / List-row meta: `text-sm` minimum |
| **Color-only signals forbidden** | Every status / variant carries via color + icon + label trio. Banners need a variant icon. List-row selected state needs ring + tint, not tint alone. Active tab gets brand color + dot indicator + scale + label weight |
| **State machine canonicality** | Status timeline / chip / banner pull from `transfer_state_machine.md` / `kyc_state_machine.md` / `card_state_machine.md`. Never invent states (LESSON 2026-05-03). User-controllable state transitions in customer surface forbidden |
| **Money correctness** | Headline-Number accepts `bigint` minor units, never floats. UI divides by 100 at display. Locale-aware separators per `users.preferred_language` (not device locale) |
| **Visa / Mastercard scope** | SchemeLogo registers all four card schemes; mock data + filter chips ship with UzCard + Humo only in v1 (LESSON 2026-04-30) |
| **Privacy boundary** | No component accepts free-text PAN / CVV / full PINFL / full document number. Card flows go through hosted forms / 3DS WebView per [`card-schemes.md`](../../../.claude/rules/card-schemes.md). SchemeLogo always paired with masked PAN (first6 + last4) |

## Cross-surface parity

Every component in this layer has either a direct admin parallel or is mobile-specific by ergonomics:

| Component | Admin parity | Mobile-specific deviations / additions |
|---|---|---|
| Card | shadcn `<Card>` + sub-elements | `card-as-object` variant (home hero, brand gradient, `radius-lg`) is mobile-only |
| ListRow | admin uses dense `<TableRow>` | Touch-first heights (56 / 64 / 72pt vs admin's 40pt typical) |
| Banner | admin's `<OfflineBanner>` / system-event banners | Inline only — admin sometimes has sticky session-warning chrome; mobile doesn't |
| Toast | admin's Sonner toaster | Top-of-screen on mobile (admin uses bottom-right); swipe-to-dismiss gesture |
| Segmented control | admin's StatusToggleGroup | `fullWidth` mode is mobile-required for fixed-bottom action bars (LESSON 2026-05-03) |
| Tab bar | n/a (admin uses sidebar nav) | Mobile-specific |
| Sheet | n/a (admin uses Dialog / SidePane) | Mobile-specific; snap points + drag handle ergonomics |
| Modal | shadcn `<Dialog>` (radix) | Full-screen on mobile (admin centers); CTA stack vertical (admin horizontal) |
| Headline number | n/a (admin uses `<TableCell>` for amounts) | Mobile-specific; consumes Display 1 / Display 2 typography roles only mobile has |
| Status timeline | admin's `<StatusTimeline>` (Phase 3 + Phase 5) | Smaller timestamps, tighter spacing on mobile |
| Scheme logo | admin's `<SchemeLogo>` | Same primitive; sizes shift (sm 32×20 / md 56×32 / lg 88×56) |

Admin source-of-truth: [`dashboard/src/components/`](../../../dashboard/src/components/) — linked per spec.

## Sample app shell — deferred

The foundation prompt asks for **one sample frame** stitching Tokens + Primitives + Components together: app bar (back / title / trailing action) + tab bar + content area showing card + list row + banner + primary button + status chip + headline number + segmented control. Light, dark, and 200% dynamic-type frames — three frames total.

This README locks the component specs first. The sample frame is a render artefact (React + Tailwind), produced once specs are stable.

## Lessons that bind every component in this layer

| Lesson | Bite |
|---|---|
| 2026-05-03 — Card primitive padding is a contract, not a buffet | Don't half-override `<CardHeader pb-0>` / `<CardContent p-0>`. Take whole, or replace with raw elements |
| 2026-05-03 — Tab strips on tabbed admin surfaces are NEVER sticky | Banners, segmented controls, list-pane filter strips: NEVER sticky in mobile. Filter bars on list pages can be — see Patterns layer |
| 2026-05-03 — Fixed-bottom mobile action bars: every row spans the same edge-to-edge width | Segmented control needs `fullWidth` mode for action-bar consistency |
| 2026-05-02 — Detail-page back-link is `<ArrowLeft>` icon component | Inherits from primitives; cross-cuts every screen header |
| 2026-05-02 — Detail-page sticky-bottom action bar uses canonical `fixed inset-x-0 bottom-0 md:left-16` overlay | The sticky-bottom action bar pattern (Patterns layer) — heads up |
| 2026-05-02 — Detail-page headers flow inline (NEVER sticky) | Cross-cuts headers across screens |
| 2026-05-02 — Data-table column headers: Title Case + `text-sm font-medium text-muted-foreground` | Chip labels also stay Title Case — never `uppercase tracking-wider` |
| 2026-05-01 — Buttons and flowing text ≥ `text-sm` | Cross-cuts every component's typography |
| 2026-04-30 — No sticky `<thead>` / column headers | Tables are at Patterns / Screens layer; this rule already applies |
| 2026-04-30 — Visa / Mastercard out of v1 mock until invoked | SchemeLogo registers them; mock data omits |
| 2026-04-29 — Typography 13pt floor + `text-xs` reserved categories | Cross-cuts every component |
| 2026-04-29 — Dashboard content is full-bleed | Mobile is naturally constrained, but the principle (no arbitrary max-width) holds in the app shell wrapper |

Full ledger: [`ai_context/LESSONS.md`](../../../ai_context/LESSONS.md).

## How to consume (preview)

These are previews of how components will be consumed. The actual `<Card>`, `<Sheet>`, etc. React components don't exist yet — they land at code-time. The specs here drive the prop signatures and the visual contract.

```tsx
// Card — wrapping recent activity on home
<Card>
  <CardHeader>
    <CardTitle>{t('mobile.home.recent.title')}</CardTitle>
    <CardDescription>{t('mobile.home.recent.description')}</CardDescription>
  </CardHeader>
  <CardContent>
    {recentTransfers.map(t => <ListRow key={t.id} variant="avatar" ... />)}
  </CardContent>
</Card>

// Banner — tier-upgrade prompt on home
<Banner variant="warning" dismissible>
  <BannerTitle>{t('mobile.home.tier-1-warning.title')}</BannerTitle>
  <BannerBody>{t('mobile.home.tier-1-warning.body')}</BannerBody>
  <BannerCTA href="/myid">{t('mobile.home.tier-1-warning.cta')}</BannerCTA>
</Banner>

// HeadlineNumber — send-money review hero
<HeadlineNumber size="hero" amount={5_000_000_00n} currency="UZS" />
<HeadlineNumber size="hero" amount={3_600_00n} currency="CNY" />

// Sheet — recipient picker
<Sheet snap="half" onClose={...}>
  <SheetHeader title={t('mobile.send-money.recipient-picker.title')} />
  <SheetContent>
    <SegmentedControl variant="fullWidth" segments={['Recent', 'Saved', 'New']} />
    {recipients.map(r => <ListRow variant="avatar" key={r.id} ... />)}
  </SheetContent>
  <SheetAction>
    <Button variant="primary" size="lg" className="w-full">
      {t('mobile.send-money.recipient-picker.cta')}
    </Button>
  </SheetAction>
</Sheet>

// Modal — confirm send
<Modal variant="confirm">
  <ModalTitle>{t('mobile.send-money.confirm.title')}</ModalTitle>
  <ModalBody>{t('mobile.send-money.confirm.body', { amount, recipient })}</ModalBody>
  <ModalActions>
    <Button variant="primary" size="lg">{t('...cta-confirm')}</Button>
    <Button variant="secondary" size="md">{t('...cta-edit')}</Button>
  </ModalActions>
</Modal>

// StatusTimeline — transfer detail
<StatusTimeline events={transferEvents} currentState="processing" />

// SchemeLogo — card-management row
<SchemeLogo code={card.scheme} size="md" />

// TabBar — app shell
<TabBar
  tabs={[
    { id: 'home', icon: Home, label: t('mobile.tab-bar.home') },
    { id: 'send', icon: Send, label: t('mobile.tab-bar.send'), emphasized: true },
    { id: 'history', icon: Clock, label: t('mobile.tab-bar.history'), badge: unreadCount },
    { id: 'more', icon: Menu, label: t('mobile.tab-bar.more') },
  ]}
/>
```

## What's next

Components layer locks the prop signatures and visual contract for the 11 component compositions. The next pass is **Patterns**:

```
Tokens (locked) → Primitives (drafted) → Components (this pass) → Patterns (next) → Screens → Flows
```

Per [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md), Patterns are domain-specific UX compositions:

- KYC step (phone-verify, MyID step, tier-upgrade)
- FX-quote breakdown (fee + spread + rate-lock countdown)
- Transfer-status timeline (the StatusTimeline component composed with detail-header context)
- Card-link 3DS WebView wrapper
- Recipient picker (the Sheet + segmented + list-row composition canonical)
- AML flag review (admin-side, but mobile may surface a calm-review pattern)
- Admin queue row (admin-side)
- Audit-log entry (admin-side)

Mobile patterns: KYC step, FX-quote breakdown, Recipient picker, Transfer-status detail, Card-link 3DS wrapper, Send-money review block, Receipt block.

## Adding to this layer

If a new component is genuinely needed:

1. **Check first**: can it compose from existing components at the Patterns layer? If yes, do that.
2. **Check the admin**: does it already exist there? If yes, inherit the shape verbatim and document mobile-specific deviations in the spec.
3. **If new**: add a `<name>.md` spec file matching the rhythm of the existing eleven (status header → source of truth → variants → sizes → states → anatomy → token consumption → composition rules → accessibility → localization → forbidden patterns → quick grep → cross-references).
4. **Update this README**: extend the "What lives here" table.
5. **Doc cascade**: if the new component shifts an existing spec, run [`design-review-checklist.md`](../../../.claude/rules/design-review-checklist.md) on every consumer before merging.

## Cross-references

- Layer rules: [`design-system-layers.md`](../../../.claude/rules/design-system-layers.md)
- Tokens (consumed): [`mobile/design/tokens/`](../tokens/) — [README](../tokens/README.md), [colors](../tokens/colors.md), [typography](../tokens/typography.md), [spacing](../tokens/spacing.md), [radii](../tokens/radii.md), [shadows](../tokens/shadows.md), [motion](../tokens/motion.md)
- Primitives (consumed): [`mobile/design/primitives/`](../primitives/) — [README](../primitives/README.md), [button](../primitives/button.md), [input](../primitives/input.md), [chip](../primitives/chip.md), [avatar](../primitives/avatar.md), [icon](../primitives/icon.md)
- Accessibility: [`accessibility.md`](../../../.claude/rules/accessibility.md)
- Money / FX rendering: [`money-and-fx.md`](../../../.claude/rules/money-and-fx.md)
- Localization: [`localization.md`](../../../.claude/rules/localization.md)
- Error UX: [`error-ux.md`](../../../.claude/rules/error-ux.md)
- Card-scheme rules: [`card-schemes.md`](../../../.claude/rules/card-schemes.md)
- KYC tier semantics: [`kyc-tiers-and-limits.md`](../../../.claude/rules/kyc-tiers-and-limits.md)
- Status machines: [`status-machines.md`](../../../.claude/rules/status-machines.md)
- Lessons: [`ai_context/LESSONS.md`](../../../ai_context/LESSONS.md)
- Foundation brief: [`mobile/prompts/01-foundation.md`](../../prompts/01-foundation.md)
- Admin parity: [`dashboard/src/components/`](../../../dashboard/src/components/)
