# Prompt — Help / Support screens (Help center · Article · Contact form · Issue report)

> **How to use:** open a fresh Claude.ai conversation. Paste in this order:
>
> 1. [`../00-shared-context.md`](../00-shared-context.md) (full content)
> 2. [`../01-foundation.md`](../01-foundation.md) (or rendered output)
> 3. [`../user-flows/flow-09-settings.md`](../user-flows/flow-09-settings.md)
>    (the help / support sub-tree shares this flow plan with settings)
> 4. This file
>
> Settings home (the parent surface) is in
> [`./11-settings-screens.md`](./11-settings-screens.md).

---

## What I want from this pass

Design the **help / support screen group** end to end:

1. **Help center home** — search + category chips + article list
2. **Article detail** — full markdown-rendered article + helpfulness
   feedback
3. **Contact support form** — subject picker + body + optional
   transfer-attach + screenshot upload
4. **Submission confirmation**
5. **Empty + offline + 5xx states**

Render at 390 × 844pt mobile viewport. Multiple frames per screen.

## Per-screen designs

### Screen 1 — Help center home

**Layout** (top → bottom):

- App bar: back arrow + "Help" heading; right-side "Contact" link
  (slate-700, body) → routes to step 3 contact form
- **Search input** (full-width, foundation Input primitive):
  - Search icon leading
  - Clear-X trailing when filled
  - Placeholder: "Search for help"
  - Debounced 300ms
- **Category chips row** (horizontally scrollable on narrow):
  - "All" (default, brand-50 surface when active)
  - "Sending money"
  - "Cards"
  - "Verification (MyID)"
  - "Limits & fees"
  - "Receiving money (CN side)"
  - "Account & security"
  - "Other"
- **Article list** (foundation ListRow):
  - Per row:
    - Question / title (top line, body, slate-900)
    - 1-line preview (sub-line, slate-500, truncated to 60 chars)
    - Right-side: chevron (decorative)
- **Empty state** (no search results):
  - Inline empty pattern below the chip strip (NOT full-screen — keeps
    the search context):
    - Heading: "No articles found"
    - Sub-line: "Try different keywords or contact support."
    - Inline CTA: "Contact support" → step 3
- **Empty state** (no articles in selected category — rare — placeholder
  for content gaps in early v1):
  - Inline pattern: "No articles in this category yet — coming soon."
- Footer link: "Still need help? Contact support" → step 3

**States**:
- Idle (default — All category, populated list)
- Category filtered (chip highlighted, list filtered)
- Search debounce active (subtle skeleton overlay)
- No search results (inline empty)
- No articles in category (inline empty)
- Initial mount skeleton (4 row skeletons + chip skeleton)
- Network offline (banner + cached articles)
- Server 5xx (full-screen calm error pattern)
- Dark mode

### Screen 2 — Article detail

**Layout** (top → bottom):

- App bar: back arrow + "Help" heading (same heading as parent — keeps
  user oriented); right-side "Share" icon (lucide `share`) → opens
  native share sheet with the article text + link
- **Article body**:
  - Heading (display-1, slate-900) — the article's title
  - Last-updated row: "Updated Apr 12, 2026" (body small, slate-500)
  - Body content: markdown-rendered:
    - Paragraphs (body weight)
    - Headings h2 / h3 (display-2 / display-3 weight)
    - Unordered lists (foundation List primitive, indented)
    - Inline links (brand-700, underlined)
    - Inline code (mono, slate-100 background tint, body small) —
      rare in this content
    - Block quotes (slate-50 left-border surface, slate-700 body) —
      rare
    - Image embeds (when relevant — scaled to fit width)
- **Helpfulness feedback row** (sticky-bottom-but-in-flow, foundation
  Card primitive):
  - Heading: "Was this helpful?"
  - Two side-by-side icon buttons: thumbs-up + thumbs-down (foundation
    IconButton, large, framed)
  - Tapping either → in-place "Thanks for the feedback" message; on
    thumbs-down, a tertiary "Tell us more →" link routes to step 3
    with the article context pre-filled in the body field
- **Related articles** (when API supports it; deferred for v1; design
  the slot):
  - Section heading: "Related"
  - 2-3 article rows (compact)
- **Footer**: "Still need help? Contact support →" link

**States**:
- Idle (default)
- Helpfulness — neither tapped (default)
- Helpfulness — thumbs-up tapped (success-tone "Thanks for the
  feedback")
- Helpfulness — thumbs-down tapped (slate-tone "Thanks for the
  feedback" + "Tell us more →" link)
- Loading (article content fetching)
- Article not found (calm 404 inside the body): "This article isn't
  available." + "Back to Help" CTA
- Network offline (banner + cached body if available)
- Localized variant available (article body in user's preferred
  language)
- Localized variant NOT available (fall-back-to-English banner above
  body: "Available in English only — sorry, we're working on
  translations." per
  [`../user-flows/flow-09-settings.md`](../user-flows/flow-09-settings.md)
  edge case)
- Dark mode

### Screen 3 — Contact support form

**Layout** (top → bottom):

- App bar: back arrow + "Contact support" heading
- **Subject section** (foundation Card):
  - Heading: "What's this about?"
  - Single-select list (foundation RadioCard primitive — one card per
    option):
    - "Transfer issue"
    - "Card issue"
    - "MyID problem"
    - "Account access"
    - "Other"
  - Each card: icon + label + chevron (decorative; tap selects)
- **Conditional sub-section — Transfer issue picker** (visible only
  when "Transfer issue" selected):
  - Heading: "Which transfer?"
  - Foundation ListRow showing recent transfers (list mirroring the
    History list-row shape but compact):
    - Top 5 most recent transfers
    - "View all transfers" link at the bottom — routes to a
      transfer-picker sub-sheet
  - Selected transfer: chip showing the transfer id + amount + status
    + remove-X
- **Body section**:
  - Heading: "Tell us what happened"
  - Multi-line textarea (foundation Textarea primitive)
  - Max 1000 chars; live-counter sub-line ("250 / 1000")
  - Placeholder: "Describe the issue. Include any error messages or
    screenshots if helpful."
- **Screenshot upload section**:
  - Heading: "Add a screenshot (optional)"
  - Upload tile (foundation UploadButton primitive — tap opens photo
    picker)
  - When 1+ screenshot attached: preview thumbnails (max 3) with
    remove-X each
- **Sticky-bottom CTA**: "Send" — disabled until subject picked + body
  ≥ 20 chars; offline-disabled with WriteButton tooltip
- **Footer**: "Or contact us directly at support@zhipay.uz / +998 71
  ..." (slate-500, body small)

**States**:
- Idle (no subject picked, all sections collapsed except subject)
- Subject picked = "Transfer issue" (transfer picker section appears)
- Subject picked = other (transfer picker hidden)
- Body partially filled (counter visible)
- Screenshot attached (1 / 2 / 3 thumbs)
- Loading (CTA tapped — spinner replaces label)
- Server error (calm inline error + retry)
- Network offline (banner + WriteButton-disabled CTA + queue option
  per `lib/offlineActionQueue` pattern: "We'll send when you're back
  online")
- Dark mode

### Screen 4 — Submission confirmation

**Layout** (centered foundation full-screen state):

- Hero icon: send (lucide), success-700, scale-in animation 200ms
- Heading: "We received your message" (display-1)
- Body: "We'll respond in 24 hours, usually faster. We'll send you a
  notification when we reply." (body, slate-700)
- Reference ID (mono, slate-500, body small): `8a7c-2f1e` — copy-on-
  click feedback per `useCopyFeedback`
- Sub-line: "Save this reference if you need to follow up." (slate-
  500)
- Two CTAs:
  - Primary "Back to Help"
  - Secondary "View my open tickets" → out of scope for v1; renders
    only if a ticketing surface lands later (designer can render the
    button as deferred-pending placeholder)
- Tertiary "Back to home"

**States**:
- Idle (default)
- Reduced motion (no scale-in)
- Dark mode

## Cross-screen patterns

### App bar pattern

- Back arrow on every screen
- "Help" heading on screens 1 and 2 (same heading — they're parent /
  child)
- "Contact support" heading on screen 3
- Right-side "Contact" link on Help home (encourages contact over
  digging deep into articles when stuck)
- Right-side "Share" icon on Article detail

### Bottom safe-area

- Sticky-bottom CTAs (Contact form Send) respect home-indicator

### Search behavior on Help home

- 300ms debounce
- Searches across article titles, bodies, and category names
- Locale-aware: searches the user's `preferred_language` content
  primarily, falls back to English if no localized hits

### Article markdown rendering

- Use a tiny zero-dep markdown transformer (similar to admin's
  app-versions release-notes pattern from Phase 15) — paragraphs +
  headings + lists + inline links + inline code + blockquotes +
  images. NO `dangerouslySetInnerHTML`; safe text-pipeline rendering
- Do NOT render arbitrary HTML in articles (security)

## Localization annotations

Render each text string with its i18n key inline. Suggested keys:

```
mobile.help.home.heading
mobile.help.home.contact-link
mobile.help.home.search.placeholder
mobile.help.home.category.all
mobile.help.home.category.sending
mobile.help.home.category.cards
mobile.help.home.category.verification
mobile.help.home.category.limits
mobile.help.home.category.receiving
mobile.help.home.category.account
mobile.help.home.category.other
mobile.help.home.empty.no-results.heading
mobile.help.home.empty.no-results.subline
mobile.help.home.empty.no-results.cta
mobile.help.home.empty.no-articles
mobile.help.home.footer-contact-link
mobile.help.article.heading
mobile.help.article.share-aria
mobile.help.article.last-updated (with {date})
mobile.help.article.helpfulness.heading
mobile.help.article.helpfulness.thumbs-up-aria
mobile.help.article.helpfulness.thumbs-down-aria
mobile.help.article.helpfulness.thanks
mobile.help.article.helpfulness.tell-more
mobile.help.article.related.heading
mobile.help.article.footer-contact-link
mobile.help.article.404.heading
mobile.help.article.404.body
mobile.help.article.404.cta
mobile.help.article.fallback-en-banner
mobile.help.contact.heading
mobile.help.contact.subject.heading
mobile.help.contact.subject.transfer
mobile.help.contact.subject.card
mobile.help.contact.subject.myid
mobile.help.contact.subject.account
mobile.help.contact.subject.other
mobile.help.contact.transfer-picker.heading
mobile.help.contact.transfer-picker.view-all
mobile.help.contact.body.heading
mobile.help.contact.body.placeholder
mobile.help.contact.body.counter (with {current} {max})
mobile.help.contact.screenshot.heading
mobile.help.contact.screenshot.upload-cta
mobile.help.contact.screenshot.attached (with {n})
mobile.help.contact.cta-send
mobile.help.contact.footer
mobile.help.confirmation.heading
mobile.help.confirmation.body
mobile.help.confirmation.ref-id-aria
mobile.help.confirmation.ref-id-subline
mobile.help.confirmation.cta-back-help
mobile.help.confirmation.cta-tickets
mobile.help.confirmation.cta-home
common.contact.email
common.contact.phone
```

**Longest-translation test**: render the Russian variant of:
1. Confirmation body ("Мы свяжемся с вами в течение 24 часов, обычно
   быстрее. Мы отправим уведомление, когда ответим.") — verify it
   renders cleanly within the centered state's body width
2. Article fallback-en banner ("Доступно только на английском —
   простите, мы работаем над переводами") — verify it doesn't push
   the article body too far down

## Accessibility annotations

- Tap-target sizes: ListRow rows ≥ 56pt; chip-strip chips ≥ 44pt × 36pt
  (height fine for chips); thumbs-up / thumbs-down icon buttons ≥
  56pt × 56pt; upload tile ≥ 80pt × 80pt; screenshot remove-X ≥ 32pt
  (smaller acceptable since it sits on top of larger thumbnail tap
  target)
- Focus order on Help home:
  1. Back arrow
  2. Contact link
  3. Search input
  4. Each category chip (left → right)
  5. Each article row (top → bottom)
  6. Footer contact link
- Focus order on Article detail:
  1. Back arrow
  2. Share icon
  3. Article body (announced as a single block; user can use rotor /
    headings navigation)
  4. Helpfulness thumbs-up
  5. Helpfulness thumbs-down
  6. Related articles (when present)
  7. Footer contact link
- Focus order on Contact form:
  1. Back arrow
  2. Each subject card (radio)
  3. Transfer picker (when applicable) — each transfer row, then
     "View all" link
  4. Body textarea
  5. Screenshot upload tile
  6. Each thumbnail remove-X (when present)
  7. Send CTA
- Screen-reader labels:
  - Search: "Search for help, search field"
  - Category chip: "Sending money category, currently not selected"
    / "currently selected"
  - Article row: "How to send money, Sending money category"
  - Helpfulness: thumbs-up "Was this helpful, yes button"; thumbs-down
    "Was this helpful, no button"
  - Subject card: "Transfer issue, radio option"
  - Body counter: "250 of 1000 characters used"
  - Screenshot upload: "Attach a screenshot, button"
  - Reference ID on confirmation: "Ticket reference 8a7c-2f1e, double
    tap to copy"
- Reduced-motion fallbacks:
  - Confirmation hero scale-in: instant
  - Sheet open: instant
  - Helpfulness toast: instant
- Color-only signals: category chips ALWAYS pair active state via
  surface tint AND outline / border weight (NOT color alone)

## Microinteractions to render

- Search debounce: 300ms after typing stops, list filters; subtle
  skeleton overlay during the debounce
- Category chip tap: chip-content swap from inactive (slate) to active
  (brand-50 surface, brand-700 text) in 150ms ease
- Helpfulness thumbs-up tap: brief 200ms scale-up + color flip to
  success-700; "Thanks for the feedback" message slides down (200ms);
  reduced-motion → instant
- Confirmation hero: scale-in 200ms ease-out
- Reference ID copy: icon swap with `text-success-700` 1.5s flip
  (matches admin's Phase 14 pattern)

## Output format checklist

- [ ] Single Claude.ai artefact, mobile viewport 390pt
- [ ] React + Tailwind, using foundation tokens
- [ ] All 4 screens × all listed states (~16 frames)
- [ ] Light + dark variants
- [ ] Russian-longest-translation tests on confirmation body +
      fallback-en banner
- [ ] All copy annotated with i18n keys
- [ ] Microinteractions annotated
- [ ] Accessibility focus order overlaid on all 3 main screens
- [ ] Acceptance criteria (Gherkin) appended (extending seeds from
      `flow-09-settings.md` since this surface shares its flow plan)

## Forbidden in this pass

- ❌ Live chat widget — v1 is async support only (24h SLA messaging)
- ❌ "Premium support" / "Priority queue" tiers
- ❌ Showing other users' submitted tickets / community Q&A — privacy
  signal; v1 is private 1-on-1 support only
- ❌ Embedded videos / animations on articles (markdown-text only;
  static image embeds when needed)
- ❌ Auto-uploading screenshots without explicit user attach action
  (privacy)
- ❌ AI chatbot mid-screen ("I'm here to help! Ask me anything") —
  v1 is human support; future iteration may add LLM-assisted FAQ
- ❌ "Was this helpful?" with mandatory follow-up survey on
  thumbs-down (a single optional "Tell us more" link is enough)

## Cross-references

- Foundation: [`../01-foundation.md`](../01-foundation.md)
- Flow plan (shared with settings): [`../user-flows/flow-09-settings.md`](../user-flows/flow-09-settings.md)
- Settings home (parent surface): [`./11-settings-screens.md`](./11-settings-screens.md)
- History (transfer picker target): [`./06-history-screens.md`](./06-history-screens.md)
- Localization (UZ-first, EN fallback for articles): [`../../../.claude/rules/localization.md`](../../../.claude/rules/localization.md)
- Accessibility: [`../../../.claude/rules/accessibility.md`](../../../.claude/rules/accessibility.md)
