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
- Status state machines: [models.md §4.2](./models.md#42-transfer-status-machine), [models.md §2.5](./models.md#25-kyc-state-machine)
- Money & ledger rules: [models.md §3.3](./models.md#33-wallet-ledger-semantics), [models.md §9.3](./models.md#93-money-handling-rules)
- Error codes: [models.md §7.1](./models.md#71-error-code-examples)
