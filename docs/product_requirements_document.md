# ZhiPay — Product Requirements Document

**Status:** Draft v1
**Owner:** Product
**Last updated:** 2026-04-28

---

## 1. Executive summary

ZhiPay is a mobile-first remittance app that lets users in **Uzbekistan** send money in **UZS** from their UzCard / Humo / Visa / Mastercard cards to recipients on **Alipay** or **WeChat Pay** in **CNY**. The app handles KYC via Uzbekistan's **MyID** national e-ID, applies tier-based transfer limits, locks the FX rate at the moment of submission, and exposes the full transfer lifecycle to the user.

**Why now:** Cross-border UZ ↔ CN trade and tourism volumes have been growing. Existing options (bank wires, cash exchange, informal couriers) are slow, expensive, and opaque. ZhiPay is positioned as the fastest digital alternative with regulator-aligned KYC.

---

## 2. Goals & non-goals

### Goals
- Enable a verified user to send UZS → CNY in **under 60 seconds** end-to-end.
- Offer a **transparent rate** with all fees disclosed before submit.
- Stay aligned with **CBU** (Central Bank of Uzbekistan) AML & KYC regulation.
- Support multiple card schemes: UzCard, Humo, Visa, Mastercard.
- Provide a localized experience in **Uzbek, Russian, and English**.

### Non-goals (v1)
- Receiving money into UZS (incoming transfers).
- Corridors other than UZ → CN (no UZ → US, RU → CN, etc.).
- Internal P2P between ZhiPay users.
- Crypto, stablecoins, or non-fiat rails.
- Web app (mobile only at launch).
- A merchant/business-account flow (the schema reserves `account_type=corporate` for v2).

---

## 3. Target users

| persona          | description                                                                 | core need                                          |
|------------------|-----------------------------------------------------------------------------|----------------------------------------------------|
| Trader (SME)     | Buys goods from suppliers in Yiwu/Guangzhou, pays via Alipay business        | High limits, fast settlement, predictable rate     |
| Migrant family   | Has relatives studying or working in China                                   | Recurring transfers, low fees, saved recipients     |
| Tourist          | Traveling to China and needs to top up Alipay/WeChat to pay locally          | One-shot transfer, no friction, rate transparency   |
| Student          | Studying in China, receives funds from parents                               | Low minimum, broadcast rate, occasional use         |

---

## 4. KYC tiers

KYC tier directly drives every transfer-limit decision. Authoritative tier definitions live in the `kyc_tiers` table; see [models.md §2.2](./models.md#22-kyc-tier-definitions-canonical-seed-data).

| tier     | how to attain                  | per-tx (UZS) | daily (UZS) | monthly (UZS) | max cards |
|----------|--------------------------------|-------------:|------------:|--------------:|----------:|
| `tier_0` | Just signed up                 | 0            | 0           | 0             | 1         |
| `tier_1` | Phone-verified (SMS OTP)       | 5,000,000    | 5,000,000   | 20,000,000    | 2         |
| `tier_2` | MyID-verified (full KYC)       | 50,000,000   | 50,000,000  | 200,000,000   | 5         |

> Final values are placeholders; Compliance must sign off before launch.

---

## 5. Supported payment methods

### 5.1 Source (sender's card)

| scheme       | issuer country | 3DS    | notes                                                    |
|--------------|----------------|--------|----------------------------------------------------------|
| UzCard       | UZ             | yes    | Domestic, primary acquirer                                |
| Humo         | UZ             | yes    | Domestic, secondary acquirer                              |
| Visa         | any            | yes    | International acquirer; foreign-issued may have higher fee |
| Mastercard   | any            | yes    | Same as Visa                                              |

### 5.2 Destination (recipient's wallet)

| destination | identifier format             | notes                                       |
|-------------|-------------------------------|---------------------------------------------|
| Alipay      | China-mainland phone or email | Personal Alipay accounts                     |
| WeChat Pay  | China-mainland phone          | Personal WeChat accounts; merchant flow v2  |

---

## 6. Core features

> Mermaid chart in `docs/mermaid_schemas/` folder, file: [`feature_overview_mindmap.md`](./mermaid_schemas/feature_overview_mindmap.md)

The v1 feature surface, grouped by domain:

- **Identity**
  - Phone signup
  - MyID KYC
  - Device trust
- **Cards**
  - Link UzCard / Humo
  - Link Visa / Mastercard
  - Manage default card
- **Sending**
  - Choose destination
  - Saved recipients
  - FX preview
  - Rate lock
  - Push status updates
- **Wallet**
  - UZS balance
  - Hold tracking
  - Ledger history
- **History**
  - Transfer list
  - Transfer detail with timeline
  - Receipts (PDF export)
- **Comms**
  - Multi-language UI (uz / ru / en)
  - Notifications
  - Stories & news

### 6.1 Feature list

| # | Feature                          | Priority | KYC tier required |
|---|----------------------------------|:--------:|:------------------:|
| 1 | Phone-number signup + SMS OTP    | P0       | —                  |
| 2 | MyID full KYC                    | P0       | promotes to tier_2 |
| 3 | Link card (UzCard/Humo)          | P0       | tier_1+            |
| 4 | Link card (Visa/Mastercard)      | P0       | tier_2             |
| 5 | Send to Alipay                   | P0       | tier_1+            |
| 6 | Send to WeChat                   | P0       | tier_1+            |
| 7 | Saved recipients                 | P1       | tier_1+            |
| 8 | Transfer history with status     | P0       | tier_1+            |
| 9 | Multi-language UI                | P0       | —                  |
| 10| Push notifications               | P0       | —                  |
| 11| Stories / news feed              | P1       | —                  |
| 12| Transfer receipt PDF export      | P2       | tier_1+            |
| 13| Admin push notification composer | P0       | — (admin surface)  |
| 14| Admin sign-in (email + password) | P0       | — (admin surface)  |
| 15| Admin profile & settings         | P0       | — (admin surface)  |

> Feature 13 is the admin-side surface at `/content/notifications` that authors push notifications targeting users (broadcast / segment / single). Multi-locale (uz/ru/en), schedulable, audit-trailed. Compliance-typed sends require typed-confirm and bypass user notification preferences. See [`docs/mermaid_schemas/notification_send_state_machine.md`](./mermaid_schemas/notification_send_state_machine.md) for the send lifecycle. Acceptance criteria:
>
> ```
> GIVEN admin authenticated WITH role IN (compliance | ops | comms)
> WHEN  admin submits notification with audience=broadcast AND status='sent'
> THEN  one row inserted into notifications WITH user_id=NULL, audience_type='broadcast'
> AND   audit row written WITH actor=admin, action='send', entity_type='notification'
> AND   recipient_count snapshot = COUNT(active users at send time)
> AND   fanout dispatched via push gateway
>
> GIVEN admin submits notification with audience=segment AND audience_criteria={...}
> THEN  recipient_count snapshot = COUNT(users matching criteria at send time)
> AND   audience_criteria persisted on the notifications row (immutable post-send)
>
> GIVEN admin submits notification with type='compliance'
> THEN  send-confirmation dialog requires typed confirmation (localized literal)
> AND   compliance sends bypass user notification preferences
>
> GIVEN status='scheduled' AND scheduled_for > now()
> WHEN  admin clicks "Cancel scheduled send" with reason ≥ 20 chars
> THEN  status flips to 'cancelled', cancelled_at = now(), cancellation_reason persisted
> AND   audit row written WITH action='cancel_scheduled'
>
> GIVEN status='sent'
> THEN  no admin action mutates the row — push notifications are non-recallable
> ```

> Feature 14 is the admin sign-in surface at `/sign-in` — the entry point for every admin / ops / compliance / finance / engineering account. **No self-signup**: accounts are provisioned out-of-band by an existing super-admin. **Email + password only** — the admin surface does NOT use 2FA / TOTP / SMS-OTP (those belong to the mobile end-user flow under MyID). If 2FA is reintroduced for admin accounts later, this row + `models.md §10` grow accordingly. The surface lives outside `<AppShell>` (no sidebar / topbar — full-bleed auth layout) and is the only route accessible without an active session. See [`docs/mermaid_schemas/admin_signin_flow.md`](./mermaid_schemas/admin_signin_flow.md) for the canonical sequence and [`docs/mermaid_schemas/admin_session_state_machine.md`](./mermaid_schemas/admin_session_state_machine.md) for the session lifecycle. Acceptance criteria:
>
> ```
> GIVEN admin_users.account_status = 'active' AND password matches password_hash
> WHEN  admin submits valid email + password
> THEN  one row inserted into admin_sessions WITH expires_at = now() + 12h
> AND   admin_users.last_signed_in_at = now(), failed_login_attempts = 0, locked_until = NULL
> AND   admin_login_audit row written WITH event_type='signin_success'
> AND   client navigates to ?next=<path> (or / if no next)
> AND   toast surfaces "Signed in. Welcome back, {display_name}." (admin.sign-in.toast.welcome)
>
> GIVEN admin submits wrong email OR wrong password
> THEN  reject with failure_code = AUTH_INVALID_CREDENTIALS
> AND   inline alert "Email or password is incorrect" (admin.sign-in.error.invalid)
> AND   NEVER reveal which field was wrong (security baseline)
> AND   admin_users.failed_login_attempts incremented (when email is known)
> AND   admin_login_audit row written WITH event_type='signin_failed_credentials'
>
> GIVEN admin_users.failed_login_attempts ≥ 5 within 15-min window
> WHEN  admin submits any sign-in attempt for that email
> THEN  reject with failure_code = AUTH_RATE_LIMITED
> AND   inline alert "Too many attempts. Try again in 15 minutes." (admin.sign-in.error.rate-limited)
> AND   admin_users.locked_until = now() + 15min
> AND   admin_login_audit row written WITH event_type='signin_rate_limited', context.attempts_in_window = N
>
> GIVEN admin_users.account_status = 'disabled'
> WHEN  admin submits any sign-in attempt
> THEN  reject with failure_code = AUTH_ACCOUNT_DISABLED
> AND   inline alert "This account has been disabled. Contact your administrator." (admin.sign-in.error.disabled)
> AND   NEVER reveal whether the password was correct
> AND   admin_login_audit row written WITH event_type='signin_account_disabled'
>
> GIVEN active session AND idle ≥ 30 min (configurable)
> THEN  client redirects to /sign-in?expired=1&next=<current_path>
> AND   <SessionExpiredBanner> renders above the auth card with admin.sign-in.banner.session-expired copy
> AND   admin_login_audit row written WITH event_type='session_expired'
>
> GIVEN passwords
> THEN  these MUST NEVER appear in admin_login_audit.context, server logs, or client console
> ```

> Feature 15 is the admin profile & settings surface at `/settings` — a single page with five tabbed sections (Profile · Security · Sessions · Preferences · My audit). Reachable from the TopBar avatar dropdown ("Settings"). Identity edits, password rotation, multi-device session management, and cosmetic / locale / notification preferences live here. **Email and role are read-only** (out-of-band changes only). **No 2FA card** — admin auth is email + password only per Feature 14. **Audit writes** for profile / password / session events route to `admin_login_audit` (preserving the Phase 20 separation between auth events and entity-state-change events) — see [`models.md §10.9`](./models.md#109-settings-audit-events). **My audit** tab reads from the central audit log filtered by `actor.id = current admin id`. Acceptance criteria:
>
> ```
> GIVEN admin authenticated AND on /settings
> WHEN  admin edits display_name and/or phone in Profile tab
> THEN  Save button enabled only after change
> AND   on submit, AlertDialog requires reason note ≥ 10 chars (name change is logged)
> AND   on confirm, admin_users row updated AND admin_login_audit row written
>       WITH event_type='profile_changed', context.fields=[…], context.previous={…}, context.reason
>
> GIVEN admin clicks "Change password" in Security tab
> WHEN  current + new (≥12 chars, mixed case, number, symbol) + confirm match
> THEN  AlertDialog warns "Change password? You will be signed out of all other sessions."
> AND   on confirm, password_hash rotated, last_password_changed_at = now()
> AND   all other admin_sessions rows revoked (revoked_at = now())
> AND   admin_login_audit row written WITH event_type='password_changed',
>       context.signed_out_other_sessions = N
> AND   passwords NEVER appear in admin_login_audit.context
>
> GIVEN multiple active admin_sessions for the current admin
> WHEN  admin clicks Revoke on a non-current session
> THEN  AlertDialog confirms; on submit, that row's revoked_at = now()
> AND   admin_login_audit row written WITH event_type='session_revoked',
>       context.session_id, context.ip_address, context.user_agent
> AND   the current session row's Revoke button stays disabled (admin must use TopBar Sign out)
>
> GIVEN admin clicks "Revoke all other sessions"
> THEN  AlertDialog confirms "Sign out of all other devices? You'll stay signed in here."
> AND   every non-current session row revoked
> AND   ONE admin_login_audit row written WITH event_type='session_revoked_all', context.count = N
>
> GIVEN admin toggles Theme / Density / Tabular numerals in Preferences tab
> THEN  CSS hook applied immediately (no Save), preferences jsonb updated
> AND   NO audit row written (cosmetic; not security-relevant)
>
> GIVEN admin opens "My audit" tab
> THEN  view = central audit log filtered to actor.id = current admin id
> AND   quick stat row shows {N} actions in last 24h · {M} in last 7 days
> AND   auth events (profile / password / session) do NOT appear here
>       — they live in admin_login_audit, surfaced separately if a future
>       /compliance/admin-login-audit page is built
> ```

---

## 7. User flows

### 7.1 First-time onboarding

> Mermaid chart in `docs/mermaid_schemas/` folder, file: [`onboarding_flow.md`](./mermaid_schemas/onboarding_flow.md)

**Participants:** User (U), App, ZhiPay API (API), SMS gateway (SMS), MyID

| #  | Direction         | Action                                          |
|----|-------------------|-------------------------------------------------|
| 1  | U → App           | Open app                                        |
| 2  | App → U           | Ask for phone number                            |
| 3  | U → App           | Enters `+998...`                                |
| 4  | App → API         | `POST /auth/start {phone}`                      |
| 5  | API → SMS         | Send OTP                                        |
| 6  | SMS → U           | 6-digit code (out of band)                      |
| 7  | U → App           | Enters code                                     |
| 8  | App → API         | `POST /auth/verify {phone, code}`               |
| 9  | API → App (reply) | session token, user @ `tier_1`                  |
| 10 | App → U           | Prompt MyID for higher limits                   |
| 11 | U → App           | Tap "Verify with MyID"                          |
| 12 | App → MyID        | Open MyID flow (deep link / WebView)            |
| 13 | MyID → App (reply)| `session_id`                                    |
| 14 | App → API         | `POST /kyc/complete {session_id}`               |
| 15 | API → MyID        | Fetch result                                    |
| 16 | MyID → API (reply)| `passed` + identity payload                     |
| 17 | API (internal)    | Upgrade `user.kyc_tier_id` → `tier_2`           |
| 18 | API → App (reply) | `tier_2`, `full_name`, `pinfl`                  |
| 19 | App → U           | Confirmation, ready to send                     |

### 7.2 Linking a card

> Mermaid chart in `docs/mermaid_schemas/` folder, file: [`card_linking_flow.md`](./mermaid_schemas/card_linking_flow.md)

**Participants:** User (U), App, ZhiPay API (API), Acquirer (Acq — UzCard / Humo / Visa / Mastercard)

| #  | Direction         | Action                                          |
|----|-------------------|-------------------------------------------------|
| 1  | U → App           | Tap "Add card"                                  |
| 2  | App → U           | Show card form (PAN, expiry, name)              |
| 3  | U → App           | Submits form                                    |
| 4  | App → API         | `POST /cards {pan, expiry, name}`               |
| 5  | API → Acq         | Tokenize card + 1-tiyin auth                    |
| 6  | Acq → API (reply) | token + 3DS challenge URL                       |
| 7  | API → App (reply) | 3DS redirect URL                                |
| 8  | App → U           | Opens 3DS WebView                               |
| 9  | U → Acq           | Authenticates with bank OTP                     |
| 10 | Acq → API         | 3DS success webhook                             |
| 11 | API (internal)    | Insert `linked_cards` row, `status=active`      |
| 12 | API → App (reply) | Card added (masked PAN, scheme, bank name)      |

### 7.3 Send transfer (golden path)

> Mermaid chart in `docs/mermaid_schemas/` folder, file: [`transfer_send_flow.md`](./mermaid_schemas/transfer_send_flow.md)

**Participants:** User (U), App, ZhiPay API (API), FX service (FX), Acquirer (Acq), Alipay/WeChat provider (Prov)

| #  | Direction         | Action                                                                    |
|----|-------------------|---------------------------------------------------------------------------|
| 1  | U → App           | Choose recipient + amount                                                  |
| 2  | App → API         | `GET /fx/quote?amount=X`                                                  |
| 3  | API → FX          | Fetch latest `mid_rate`                                                    |
| 4  | FX → API (reply)  | `rate` + `spread`                                                         |
| 5  | API → App (reply) | `client_rate`, `fee_uzs`, `total_charge_uzs`, `amount_cny`                |
| 6  | App → U           | Show breakdown, ask to confirm                                            |
| 7  | U → App           | Confirm                                                                   |
| 8  | App → API         | `POST /transfers {card_id, recipient, amount, fx_rate_id}`                |
| 9  | API (internal)    | Check KYC tier limits (per-tx, daily, monthly)                            |
| 10 | API (internal)    | Insert `transfers` row, `status=created`                                  |
| 11 | API → Acq         | Auth + capture `total_charge_uzs`                                         |
| 12 | Acq → API (reply) | ok                                                                        |
| 13 | API (internal)    | `status=processing`, place wallet hold                                    |
| 14 | API → Prov        | Initiate payout (`amount_cny`, `recipient_id`)                            |
| 15 | Prov → API (reply)| `external_tx_id`                                                          |
| 16 | API → App (reply) | `status=processing`                                                       |
| 17 | App → U           | "Sent — confirming..."                                                    |
| 18 | Prov → API        | Webhook: `completed`                                                      |
| 19 | API (internal)    | `status=completed`, ledger debit, increment limit usage                   |
| 20 | API → U           | Push notification: "Transfer completed"                                   |

### 7.4 Failed transfer recovery

> Mermaid chart in `docs/mermaid_schemas/` folder, file: [`transfer_failure_recovery_flow.md`](./mermaid_schemas/transfer_failure_recovery_flow.md)

**Participants:** ZhiPay API (API), Alipay/WeChat provider (Prov), Acquirer (Acq), User (U)

| # | Direction         | Action                                                                |
|---|-------------------|-----------------------------------------------------------------------|
| 1 | Prov → API        | Webhook: `failed (RECIPIENT_INVALID)`                                 |
| 2 | API (internal)    | `status=failed`, `failure_code=RECIPIENT_INVALID`                     |
| 3 | API → Acq         | Reverse card auth                                                     |
| 4 | Acq → API (reply) | ok                                                                    |
| 5 | API (internal)    | Ledger release (no debit consumed, no limit usage)                    |
| 6 | API → U           | Push: "Transfer failed: verify recipient"                              |
| 7 | U → API           | Tap notification → opens transfer detail                              |
| 8 | API → U (reply)   | Localized error message + suggested action (from `error_codes` table) |

---

## 8. Status state machines

### 8.1 Transfer (canonical)

> Mermaid chart in `docs/mermaid_schemas/` folder, file: [`transfer_state_machine.md`](./mermaid_schemas/transfer_state_machine.md)

**States:** `created`, `processing`, `completed`, `failed`, `reversed`

**Transitions:**

| From         | →  | To           | Trigger                              |
|--------------|----|--------------|--------------------------------------|
| _(start)_    | →  | `created`    | User submits, limits ok              |
| `created`    | →  | `processing` | Card auth captured                   |
| `created`    | →  | `failed`     | Auth declined / sanctions hit        |
| `processing` | →  | `completed`  | Provider ack                         |
| `processing` | →  | `failed`     | Provider rejects                     |
| `completed`  | →  | `reversed`   | Refund / chargeback                  |

**Terminal states:** `completed`, `failed`, `reversed`

### 8.2 KYC

> Mermaid chart in `docs/mermaid_schemas/` folder, file: [`kyc_state_machine.md`](./mermaid_schemas/kyc_state_machine.md)

**States:** `pending`, `passed`, `failed`, `expired`

**Transitions:**

| From      | →  | To        | Trigger                              |
|-----------|----|-----------|--------------------------------------|
| _(start)_ | →  | `pending` | User starts MyID session             |
| `pending` | →  | `passed`  | MyID returns success                 |
| `pending` | →  | `failed`  | MyID rejects                         |
| `pending` | →  | `expired` | Session timeout (e.g. > 15 min)       |
| `passed`  | →  | `expired` | MyID validity window elapses         |

**Terminal states:** `passed`, `failed`, `expired`

### 8.3 Card

> Mermaid chart in `docs/mermaid_schemas/` folder, file: [`card_state_machine.md`](./mermaid_schemas/card_state_machine.md)

**States:** `active`, `frozen`, `expired`, `removed`

**Transitions:**

| From      | →  | To        | Trigger                              |
|-----------|----|-----------|--------------------------------------|
| _(start)_ | →  | `active`  | Card linked + 3DS ok                 |
| `active`  | →  | `frozen`  | Suspicious activity (ops/AML)        |
| `active`  | →  | `expired` | Expiry date passes                   |
| `active`  | →  | `removed` | User unlinks                         |
| `frozen`  | →  | `active`  | Ops clears flag                      |

**Terminal states:** `expired`, `removed`

---

## 9. Compliance & risk

### 9.1 KYC
- Tier-0 users cannot transfer. Tier-1 (phone-only) is allowed for low limits, but Compliance retains the right to require MyID for any user.
- MyID verification expires per the configured validity window (`kyc_verifications.expires_at`); expired users are demoted to tier_1 and prompted to re-verify.

### 9.2 AML
- Every transfer creation is screened against `aml_flags` triggers (velocity, anomalous amount, pattern, sanctions list).
- Critical flags auto-pause the transfer (status remains `processing` until cleared).
- Blacklist (`blacklist`) screens phone, PINFL, device, IP, and card token at signup, login, card link, and transfer creation.
- **Sanctions hits cannot be cleared** from the AML triage view — only escalated. Reviewer-facing UX hides the Clear action and auto-fills a compliance template into the Escalate reason field that the reviewer must edit before submitting; match details are never communicated to the user.
- **Escalating a critical-severity flag auto-blocks the linked user** (`users.status = 'blocked'`). The user is unable to send or sign in until manually unblocked. Confirmation modal in the admin UI surfaces this side effect before submit. Lower severities (warning, info) escalate without blocking.

### 9.3 PCI
- Card PAN is **never** stored in plaintext. Only `masked_pan` (first6+last4) and the acquirer-issued `token`.
- Card data on the wire uses tokenization at the SDK layer; backend never sees full PAN.

### 9.4 Data retention
- KYC verifications, transfers, wallet ledger entries, and AML flags are **retention-protected**: never hard-deleted.
- User accounts are soft-deleted (`status='deleted'`); PII is redacted but the record remains for compliance lookups.

### 9.5 Currency reporting
- All transfers report to CBU in the format and cadence required by current regulation. (Out of scope for app spec; covered by ops runbook.)

---

## 10. Non-functional requirements

| area              | requirement                                                                  |
|-------------------|------------------------------------------------------------------------------|
| Latency (P95)     | FX quote < 300ms, transfer create < 1.5s, status webhook → push < 5s          |
| Availability      | 99.9% monthly for transfer flow                                               |
| Scalability       | 100k MAU at launch, design headroom for 1M                                    |
| Security          | TLS 1.3 minimum, app pinning, jailbreak/root detection, biometric unlock      |
| Localization      | All user-facing strings in `uz`, `ru`, `en` (no hardcoded copy)               |
| Auditability      | Every state change writes an event; ledger reconciles to balance daily        |
| Observability     | Structured logs, distributed tracing across acquirer + provider boundaries    |
| Money correctness | All amounts in integer minor units; reconciliation report runs daily          |

---

## 11. Success metrics

| metric                                  | target (90 days post-launch) |
|-----------------------------------------|------------------------------|
| Time-to-first-successful-transfer (P50) | < 5 min from app install     |
| KYC pass-through rate                   | > 85%                        |
| Transfer success rate                   | > 97%                        |
| FX-quote-to-submit conversion           | > 60%                        |
| MAU                                     | 50k                          |
| NPS                                     | > 40                         |

---

## 12. Open questions

1. **Refund policy:** what is the user-facing SLA for `reversed` transfers? Acquirer + provider both have refund timelines — need a unified message.
2. **Tier upgrade decay:** when MyID expires, do we instantly demote to tier_1, or grace-period? Compliance to decide.
3. **Visa/Mastercard fee differential:** international cards typically carry higher acquirer cost. Do we surface a higher fee, eat the margin, or block them at tier_1?
4. **Recipient verification:** Alipay/WeChat sometimes accept malformed identifiers and silently fail. Should we pre-validate via a provider lookup, or accept and reverse on failure?
5. **Rate refresh cadence:** how often does `fx_rates` regenerate? Seconds-level keeps quotes fresh but increases stale-quote risk; minutes-level is simpler but worse UX in volatile windows.
6. **KYC admin claim semantics:** when an ops reviewer picks up a verification in the KYC review queue, does that create a **soft claim** (`assignee_id` set, others can override) or a **hard reservation with TTL** (e.g. 10 minutes, auto-released)? Are multiple reviewers on the same row allowed? Schema gap: `kyc_verifications.assignee_id` is not in [`models.md` §2.4](./models.md#24-field-reference--kyc_verifications) today — the admin dashboard's [KYC Review Queue prototype](../dashboard/src/data/mockKycQueue.ts) models it locally so the "Assigned to me" filter and bulk Assign-to-me work, but backend addition is gated on this answer plus a related **stale-claim policy** (auto-release after N minutes idle?).

---

## 13. Cross-references

- Data model: see [models.md](./models.md)
- Status state machines: [models.md §4.2](./models.md#42-transfer-status-machine), [models.md §2.6](./models.md#26-kyc-state-machine)
- Money & ledger rules: [models.md §3.3](./models.md#33-wallet-ledger-semantics), [models.md §9.3](./models.md#93-money-handling-rules)
- Error codes: [models.md §7.1](./models.md#71-error-code-examples)
