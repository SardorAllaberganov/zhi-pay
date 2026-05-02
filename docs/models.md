# ZhiPay — Data Model Reference

Complete data model for the ZhiPay cross-border remittance platform (UZ → CN). Authoritative source for entity definitions, relationships, enums, and state machines.

> **Money convention:** all UZS amounts are stored in **tiyins** (`bigint`, 1 UZS = 100 tiyins). All CNY amounts are stored in **fen** (`bigint`, 1 CNY = 100 fen). Never use `float`/`double`/`real` for monetary values.
>
> **Identifier convention:** all primary keys are `uuid` (v7 preferred for index locality). All foreign keys use the same type as the referenced PK.
>
> **Timestamp convention:** all timestamps are `timestamptz` stored in UTC.

---

## 1. Domain Map

The schema is organized into seven domain groups. Arrows show ownership / dominant FK direction.

```mermaid
flowchart LR
  ID[Identity & KYC]
  CW[Cards & Wallet]
  TR[Transfers]
  LC[Limits & Compliance]
  CM[Commissions]
  EN[Errors & Notifications]
  SV[Services & CMS]

  ID -->|user_id| CW
  ID -->|user_id| TR
  ID -->|user_id| LC
  ID -->|user_id| EN
  CW -->|card_id| TR
  TR -->|transfer_id| CM
  TR -->|transfer_id| LC
  EN -.error_code.-> TR
  SV -.controls.-> TR
  SV -.controls.-> CW
```

### High-level entity overview

```mermaid
erDiagram
  USERS ||--o{ KYC_VERIFICATIONS : "verifies via"
  USERS }o--|| KYC_TIERS : "currently at"
  USERS ||--o{ USER_DEVICES : "uses"
  USERS ||--|| WALLETS : "owns"
  USERS ||--o{ LINKED_CARDS : "links"
  USERS ||--o{ RECIPIENTS : "saves"
  USERS ||--o{ TRANSFERS : "initiates"
  USERS ||--o{ USER_LIMIT_USAGE : "tracks"
  USERS ||--o{ NOTIFICATIONS : "receives"
  USERS ||--o{ AML_FLAGS : "may have"
  USERS }o--o| BLACKLIST : "screened against"

  KYC_VERIFICATIONS }o--|| KYC_TIERS : "grants"

  LINKED_CARDS }o--|| CARD_SCHEMES : "issued under"
  LINKED_CARDS ||--o{ TRANSFERS : "charged to"
  WALLETS ||--o{ WALLET_LEDGER : "records"

  RECIPIENTS ||--o{ TRANSFERS : "sent to"
  FX_RATES ||--o{ TRANSFERS : "locked at"
  TRANSFERS ||--o{ TRANSFER_EVENTS : "tracks"
  TRANSFERS ||--|| TRANSFER_FEES : "charges"
  TRANSFER_FEES }o--|| COMMISSION_RULES : "applies"
  TRANSFERS ||--o{ AML_FLAGS : "triggers"
```

---

## 2. Identity & KYC

Core identity. Users register by phone, are verified via **MyID** (Uzbekistan's national e-ID), and the resulting **KYC tier** drives every transfer-limit decision downstream.

### 2.1 ER diagram

```mermaid
erDiagram
  USERS {
    uuid id PK
    string phone_number UK "+998..."
    string full_name
    string pinfl UK "14-digit UZ personal ID"
    uuid kyc_tier_id FK "current effective tier"
    enum status "active|blocked|pending|deleted"
    enum preferred_language "uz|ru|en"
    timestamp last_login_at
    timestamp created_at
    timestamp updated_at
  }
  KYC_TIERS {
    uuid id PK
    string code UK "tier_0|tier_1|tier_2"
    string name
    string description
    bigint per_transaction_limit_uzs
    bigint daily_limit_uzs
    bigint monthly_limit_uzs
    integer max_linked_cards
    boolean requires_myid
    boolean is_active
    timestamp created_at
  }
  KYC_VERIFICATIONS {
    uuid id PK
    uuid user_id FK
    uuid resulting_tier_id FK "tier granted on success"
    string myid_session_id
    enum status "pending|passed|failed|expired"
    enum document_type "passport|id_card"
    string document_number
    date date_of_birth
    jsonb myid_response
    string failure_reason
    timestamp verified_at
    timestamp expires_at "MyID validity window"
    timestamp created_at
  }
  USER_DEVICES {
    uuid id PK
    uuid user_id FK
    string device_id UK "hardware fingerprint"
    enum platform "ios|android"
    string app_version
    string push_token
    boolean is_trusted
    timestamp last_seen_at
    timestamp created_at
  }
  BLACKLIST {
    uuid id PK
    string identifier
    enum type "phone|pinfl|device_id|ip|card_token"
    enum severity "suspected|confirmed"
    string reason
    string added_by "admin user id or system"
    timestamp expires_at
    timestamp created_at
  }
  USERS ||--o{ KYC_VERIFICATIONS : "verifies via"
  USERS }o--|| KYC_TIERS : "currently at"
  USERS ||--o{ USER_DEVICES : "uses"
  KYC_VERIFICATIONS }o--|| KYC_TIERS : "grants"
  USERS }o--o| BLACKLIST : "screened against"
```

### 2.2 KYC tier definitions (canonical seed data)

| code     | name                | per-tx limit (UZS) | daily limit (UZS) | monthly limit (UZS) | max cards | requires MyID |
|----------|---------------------|-------------------:|------------------:|--------------------:|----------:|:--------------|
| `tier_0` | Unverified          | 0                  | 0                 | 0                   | 1         | no            |
| `tier_1` | Phone verified      | 5,000,000          | 5,000,000         | 20,000,000          | 2         | no            |
| `tier_2` | Fully MyID-verified | 50,000,000         | 50,000,000        | 200,000,000         | 5         | yes           |

> Limits are illustrative — final values must be set by Compliance and approved by CBU regulation.

### 2.3 Field reference — `users`

| field              | type         | constraints              | notes                                          |
|--------------------|--------------|--------------------------|------------------------------------------------|
| `id`               | uuid         | PK                       | uuid v7                                        |
| `phone_number`     | string       | unique, E.164            | login identifier                                |
| `full_name`        | string       | nullable until KYC       | sourced from MyID                               |
| `pinfl`            | string(14)   | unique, nullable         | UZ personal ID, only after MyID                 |
| `kyc_tier_id`      | uuid         | FK → `kyc_tiers.id`      | denormalized for fast limit lookup              |
| `status`           | enum         | not null                 | `active` / `blocked` / `pending` / `deleted`    |
| `preferred_language` | enum       | default `uz`             | drives notification content selection           |
| `last_login_at`    | timestamptz  | nullable                 | refreshed on session creation                   |
| `created_at`       | timestamptz  | not null, default now()  |                                                 |
| `updated_at`       | timestamptz  | not null                 | bumped via trigger                              |

### 2.4 Field reference — `kyc_verifications`

| field                  | type        | constraints                  | notes                                                       |
|------------------------|-------------|------------------------------|-------------------------------------------------------------|
| `id`                   | uuid        | PK                           |                                                             |
| `user_id`              | uuid        | FK → `users.id`              |                                                             |
| `resulting_tier_id`    | uuid        | FK → `kyc_tiers.id`, null    | populated on `passed`                                       |
| `myid_session_id`      | string      | unique, not null             | MyID-issued correlation id                                   |
| `status`               | enum        | not null                     | `pending` → `passed` / `failed` / `expired`                  |
| `document_type`        | enum        | not null                     | `passport` / `id_card`                                       |
| `document_number`      | string      | not null                     | encrypted at rest                                            |
| `date_of_birth`        | date        |                              | sanity check — under-18 must fail                            |
| `myid_response`        | jsonb       |                              | full response for audit                                       |
| `failure_reason`       | string      | nullable                     | human-readable cause for `failed`                            |
| `verified_at`          | timestamptz | nullable                     | set when status becomes `passed`                             |
| `expires_at`           | timestamptz | nullable                     | MyID re-verification window (e.g. 1 year)                    |
| `created_at`           | timestamptz | not null                     |                                                             |

### 2.5 Field reference — `blacklist`

| field         | type        | constraints                                  | notes                                                                                              |
|---------------|-------------|----------------------------------------------|----------------------------------------------------------------------------------------------------|
| `id`          | uuid        | PK                                           | uuid v7                                                                                            |
| `identifier`  | string      | not null                                     | full value, masked at the UI layer per `type`                                                      |
| `type`        | enum        | not null                                     | `phone` / `pinfl` / `device_id` / `ip` / `card_token`                                              |
| `severity`    | enum        | not null, default `suspected`                | `suspected` (warning UI) / `confirmed` (danger UI)                                                  |
| `reason`      | string      | not null, ≥ 30 chars at insert               | required justification — surfaced verbatim on the detail page; old reasons preserved in audit-log  |
| `added_by`    | string      | not null                                     | admin user id, or literal `'system'` for automated additions                                       |
| `expires_at`  | timestamptz | nullable                                     | `null` = indefinite; UI renders "Never" / countdown / "Expired"                                    |
| `created_at`  | timestamptz | not null, default now()                      |                                                                                                    |

> Edits and removals are recorded in a separate audit-log table (or `transfer_events`-style sink) — the row itself is never silently rewritten. Hard-deletes leave an audit-log entry. Active vs expired is derived from `(expires_at IS NULL OR expires_at > now())`.

### 2.6 KYC state machine

```mermaid
stateDiagram-v2
  [*] --> pending : user starts MyID
  pending --> passed : MyID returns success
  pending --> failed : MyID rejects / timeout
  pending --> expired : session abandoned > 15min
  passed --> expired : MyID validity window elapses
  failed --> [*]
  expired --> [*]
  passed --> [*]
```

---

## 3. Cards & Wallet

Linked card scheme is normalized into `card_schemes`, supporting **UzCard, Humo, Visa, Mastercard**. The internal `wallet` keeps a UZS balance with a strict double-entry-style **ledger** for auditability.

### 3.1 ER diagram

```mermaid
erDiagram
  CARD_SCHEMES {
    uuid id PK
    string code UK "uzcard|humo|visa|mastercard"
    string display_name
    string country "ISO-3166-1 alpha-2"
    boolean supports_3ds
    boolean is_international
    boolean is_active
  }
  LINKED_CARDS {
    uuid id PK
    uuid user_id FK
    uuid scheme_id FK
    string masked_pan "first6+last4"
    string token "PCI tokenized"
    string bank_name
    string issuer_country "ISO-3166-1 alpha-2"
    string holder_name
    string expiry_month "MM"
    string expiry_year "YY"
    boolean is_default
    enum status "active|expired|removed|frozen"
    timestamp last_used_at
    timestamp created_at
  }
  WALLETS {
    uuid id PK
    uuid user_id FK
    bigint balance_uzs "in tiyins"
    bigint hold_amount "in-flight transfer holds"
    enum status "active|frozen"
    timestamp updated_at
  }
  WALLET_LEDGER {
    uuid id PK
    uuid wallet_id FK
    enum entry_type "credit|debit|hold|release"
    bigint amount_uzs
    bigint balance_after "snapshot for audit"
    enum reference_type "transfer|refund|topup|adjustment"
    uuid reference_id "FK to source entity"
    string description
    timestamp created_at
  }
  USERS ||--o{ LINKED_CARDS : "links"
  USERS ||--|| WALLETS : "owns"
  LINKED_CARDS }o--|| CARD_SCHEMES : "issued under"
  WALLETS ||--o{ WALLET_LEDGER : "records"
```

### 3.2 Card schemes (canonical seed data)

| code         | display name | country | supports_3ds | international |
|--------------|--------------|---------|:-------------|:--------------|
| `uzcard`     | UzCard       | UZ      | yes          | no            |
| `humo`       | Humo         | UZ      | yes          | no            |
| `visa`       | Visa         | US      | yes          | yes           |
| `mastercard` | Mastercard   | US      | yes          | yes           |

> International cards (`is_international = true`) may have different FX, fee, and limit treatment — see PRD §6.

### 3.3 Wallet ledger semantics

Every change to `wallets.balance_uzs` or `wallets.hold_amount` **must** produce a `wallet_ledger` row.

| entry_type | effect on balance | effect on hold | when                                     |
|------------|------------------:|---------------:|------------------------------------------|
| `hold`     | 0                 | +amount        | transfer enters `processing`              |
| `release`  | 0                 | −amount        | transfer fails, hold returned             |
| `debit`    | −amount           | −amount        | transfer completes (hold → real debit)    |
| `credit`   | +amount           | 0              | refund / reversal / topup                 |

`balance_after` snapshots `balance_uzs` post-write; reconciliation jobs compare ledger sums against the live balance.

---

## 4. Transfers

A transfer is the unit of cross-border send. The FX rate is **locked at creation**, the status machine is auditable via `transfer_events`, and recipients can be saved per-user for one-tap re-send.

### 4.1 ER diagram

```mermaid
erDiagram
  RECIPIENTS {
    uuid id PK
    uuid user_id FK
    enum destination "alipay|wechat"
    string identifier "phone or email"
    string display_name
    string nickname
    boolean is_favorite
    timestamp last_used_at
    timestamp created_at
  }
  TRANSFERS {
    uuid id PK
    uuid user_id FK
    uuid card_id FK
    uuid recipient_id FK "nullable for one-shot sends"
    uuid fx_rate_id FK
    enum destination "alipay|wechat"
    string recipient_identifier "denormalized snapshot"
    bigint amount_uzs
    bigint amount_cny "in fen"
    bigint fee_uzs
    bigint fx_spread_uzs
    bigint total_charge_uzs "amount + fee"
    enum status "created|processing|completed|failed|reversed"
    string external_tx_id "Alipay/WeChat ref"
    string failure_code "FK->error_codes.code"
    jsonb provider_response
    timestamp completed_at
    timestamp created_at
  }
  TRANSFER_EVENTS {
    uuid id PK
    uuid transfer_id FK
    enum from_status
    enum to_status
    enum actor "system|user|provider|admin"
    jsonb context "provider payload, retry count..."
    timestamp created_at
  }
  FX_RATES {
    uuid id PK
    string pair "UZS_CNY"
    numeric mid_rate
    numeric spread_pct
    numeric client_rate "rate offered to user"
    string source "central_bank|provider_x"
    timestamp valid_from
    timestamp valid_to
  }
  USERS ||--o{ RECIPIENTS : "saves"
  USERS ||--o{ TRANSFERS : "initiates"
  LINKED_CARDS ||--o{ TRANSFERS : "charged to"
  RECIPIENTS ||--o{ TRANSFERS : "sent to"
  FX_RATES ||--o{ TRANSFERS : "locked at"
  TRANSFERS ||--o{ TRANSFER_EVENTS : "tracks"
```

### 4.2 Transfer status machine

```mermaid
stateDiagram-v2
  [*] --> created : user submits
  created --> processing : card auth approved
  created --> failed : card auth declined / KYC fail
  processing --> completed : Alipay/WeChat ack
  processing --> failed : provider rejects
  completed --> reversed : refund/chargeback
  failed --> [*]
  reversed --> [*]
  completed --> [*]
```

Every transition writes a `transfer_events` row (`from_status` → `to_status`) so the full lifecycle is reconstructible without depending on log retention.

### 4.3 FX rate lock invariant

- A `transfer` row's `fx_rate_id` MUST point to an `fx_rates` row whose `[valid_from, valid_to]` window contains `transfer.created_at`.
- Once `transfer.status = processing`, the linked rate is **immutable** for that transfer — never recompute CNY amount mid-flight.
- `amount_cny = floor(amount_uzs × client_rate)` — flooring prevents over-credit on rounding.

---

## 5. Limits & Compliance

Per-user usage rolls up daily/monthly to enforce KYC-tier caps cheaply at transfer creation. AML flags hang off both users and transfers for compliance review.

### 5.1 ER diagram

```mermaid
erDiagram
  USER_LIMIT_USAGE {
    uuid id PK
    uuid user_id FK
    date usage_date "rolled-up by day"
    bigint daily_used_uzs
    bigint monthly_used_uzs "denormalized for fast read"
    integer transaction_count
    timestamp updated_at
  }
  AML_FLAGS {
    uuid id PK
    uuid user_id FK
    uuid transfer_id FK "nullable for user-level flags"
    enum flag_type "velocity|amount|pattern|sanctions|manual"
    enum severity "info|warning|critical"
    string description "auto-generated reason"
    jsonb context "per-flag-type structured payload (velocity/amount/pattern/sanctions/manual)"
    enum status "open|reviewing|cleared|escalated"
    string assigned_to "admin user id"
    enum clear_reason "false_positive|verified_legitimate|low_risk|other (set on cleared)"
    string resolution_notes "captured on clear / escalate"
    timestamp resolved_at
    timestamp created_at
  }
  USERS ||--o{ USER_LIMIT_USAGE : "tracks"
  USERS ||--o{ AML_FLAGS : "may have"
  TRANSFERS ||--o{ AML_FLAGS : "triggers"
```

### 5.2 Limit enforcement read path

At transfer creation:

```mermaid
flowchart TD
  A[Transfer request] --> B{User KYC tier?}
  B --> C[Look up KYC_TIERS limits]
  A --> D[Read USER_LIMIT_USAGE today]
  C & D --> E{tier.daily_limit - usage.daily_used >= amount?}
  E -->|yes| F{per_transaction_limit >= amount?}
  E -->|no| X[Reject: LIMIT_DAILY_EXCEEDED]
  F -->|yes| G{monthly_limit - usage.monthly_used >= amount?}
  F -->|no| X2[Reject: LIMIT_PER_TX_EXCEEDED]
  G -->|yes| H[Accept → status=created]
  G -->|no| X3[Reject: LIMIT_MONTHLY_EXCEEDED]
```

`USER_LIMIT_USAGE` is updated **only when status transitions to `completed`** — failed transfers do not consume limit.

---

## 6. Commissions

Versioned commission rules. Each `transfer_fees` row freezes which `commission_rules` version applied, so re-pricing history is auditable.

```mermaid
erDiagram
  COMMISSION_RULES {
    uuid id PK
    enum account_type "personal|corporate"
    decimal min_pct
    decimal max_pct
    bigint min_fee_uzs
    bigint volume_threshold_usd "corporate tier trigger"
    decimal corporate_pct
    boolean is_active
    integer version
    timestamp effective_from
    timestamp effective_to
  }
  TRANSFER_FEES {
    uuid id PK
    uuid transfer_id FK
    uuid rule_id FK
    bigint commission_uzs
    bigint fx_spread_uzs
    bigint total_fee_uzs
  }
  TRANSFERS ||--|| TRANSFER_FEES : "charges"
  TRANSFER_FEES }o--|| COMMISSION_RULES : "applies"
```

> Only **one** `commission_rules` row per `account_type` should have `is_active = true` AND `effective_from <= now() < effective_to`. Enforce via partial unique index.

---

## 7. Errors & Notifications

`error_codes` is the single source of truth for user-facing failure messages. `notifications` powers in-app, push, and broadcast comms with full UZ/RU/EN localization.

```mermaid
erDiagram
  ERROR_CODES {
    string code PK "KYC_EXPIRED, FX_STALE..."
    enum category "kyc|acquiring|fx|provider|compliance|system"
    string message_uz
    string message_ru
    string message_en
    boolean retryable
    string suggested_action
  }
  NOTIFICATIONS {
    uuid id PK
    uuid user_id FK "null = broadcast"
    enum type "transfer|promo|system|compliance"
    string title_uz
    string title_ru
    string title_en
    string body_uz
    string body_ru
    string body_en
    boolean is_read
    jsonb deep_link "{screen, params}"
    timestamp sent_at
    timestamp read_at
    timestamp created_at
  }
  USERS ||--o{ NOTIFICATIONS : "receives"
```

### 7.1 Error code examples

| code                    | category   | retryable | suggested action                          |
|-------------------------|------------|:---------:|--------------------------------------------|
| `KYC_REQUIRED`          | kyc        | no        | Prompt MyID flow                            |
| `KYC_EXPIRED`           | kyc        | no        | Re-run MyID                                 |
| `LIMIT_DAILY_EXCEEDED`  | compliance | no        | Suggest waiting or upgrading tier           |
| `LIMIT_PER_TX_EXCEEDED` | compliance | no        | Suggest splitting transfer                  |
| `CARD_DECLINED`         | acquiring  | yes       | Try another card / retry                    |
| `INSUFFICIENT_FUNDS`    | acquiring  | yes       | Top up card and retry                       |
| `FX_STALE`              | fx         | yes       | Refetch rate and retry                      |
| `PROVIDER_UNAVAILABLE`  | provider   | yes       | Backoff and retry                           |
| `RECIPIENT_INVALID`     | provider   | no        | Verify Alipay/WeChat handle                 |
| `SANCTIONS_HIT`         | compliance | no        | Escalate to manual review                   |

---

## 8. Services & CMS

Operational toggles for payment rails and content surfaces in the mobile app.

```mermaid
erDiagram
  SERVICES {
    uuid id PK
    enum name UK "alipay|wechat|uzcard|humo|visa|mastercard|myid"
    enum status "active|maintenance|disabled"
    jsonb config "api keys, endpoints"
    integer priority
    string health_check_url
    timestamp last_checked_at
    timestamp updated_at
  }
  APP_VERSIONS {
    uuid id PK
    enum platform "ios|android"
    string version "semver"
    boolean force_update
    string min_supported
    string release_notes_uz
    string release_notes_ru
    string release_notes_en
    timestamp released_at
  }
  STORIES {
    uuid id PK
    string title_uz
    string title_ru
    string title_en
    string media_url
    enum type "image|video"
    jsonb cta "{label, deep_link}"
    integer display_order
    boolean is_published
    timestamp expires_at
    timestamp created_at
  }
  NEWS {
    uuid id PK
    string title_uz
    string title_ru
    string title_en
    string body_uz
    string body_ru
    string body_en
    string image_url
    boolean is_published
    timestamp published_at
    timestamp created_at
  }
```

---

## 9. Cross-cutting concerns

### 9.1 Centralized enums

| enum                | values                                                                  | used in                                |
|---------------------|-------------------------------------------------------------------------|----------------------------------------|
| `user_status`       | `active`, `blocked`, `pending`, `deleted`                               | `users`                                |
| `kyc_status`        | `pending`, `passed`, `failed`, `expired`                                | `kyc_verifications`                    |
| `card_scheme_code`  | `uzcard`, `humo`, `visa`, `mastercard`                                  | `card_schemes`                         |
| `card_status`       | `active`, `expired`, `removed`, `frozen`                                | `linked_cards`                         |
| `wallet_status`     | `active`, `frozen`                                                      | `wallets`                              |
| `ledger_entry_type` | `credit`, `debit`, `hold`, `release`                                    | `wallet_ledger`                        |
| `transfer_status`   | `created`, `processing`, `completed`, `failed`, `reversed`              | `transfers`, `transfer_events`         |
| `transfer_destination` | `alipay`, `wechat`                                                   | `transfers`, `recipients`              |
| `notification_type` | `transfer`, `promo`, `system`, `compliance`                             | `notifications`                        |
| `aml_flag_type`     | `velocity`, `amount`, `pattern`, `sanctions`, `manual`                  | `aml_flags`                            |
| `aml_severity`      | `info`, `warning`, `critical`                                           | `aml_flags`                            |
| `language`          | `uz`, `ru`, `en`                                                        | `users.preferred_language`             |
| `platform`          | `ios`, `android`                                                        | `user_devices`, `app_versions`         |

### 9.2 Indexing recommendations

| table              | index                                                | rationale                                  |
|--------------------|------------------------------------------------------|--------------------------------------------|
| `users`            | `(phone_number)` UNIQUE                              | login lookup                                |
| `users`            | `(pinfl)` UNIQUE PARTIAL where pinfl is not null     | KYC dedup, Visa-only users may lack pinfl   |
| `linked_cards`     | `(user_id, status)` PARTIAL where status='active'    | "show my active cards" is the hot query     |
| `transfers`        | `(user_id, created_at DESC)`                         | history pagination                           |
| `transfers`        | `(status)` PARTIAL where status='processing'         | reconciliation worker scan                   |
| `transfer_events`  | `(transfer_id, created_at)`                          | timeline reconstruction                      |
| `user_limit_usage` | `(user_id, usage_date)` UNIQUE                       | upsert hot path                              |
| `aml_flags`        | `(status)` PARTIAL where status in ('open','reviewing')| ops queue                                  |
| `wallet_ledger`    | `(wallet_id, created_at DESC)`                       | balance reconstruction                       |
| `fx_rates`         | `(pair, valid_from DESC)`                            | "latest live rate" lookup                    |

### 9.3 Money-handling rules

1. All monetary columns are `bigint` in **smallest currency unit** (tiyins for UZS, fen for CNY).
2. Conversions use `numeric(20,8)` for `fx_rates.client_rate`. Never widen to float.
3. Fee/spread arithmetic happens at integer level: `total_charge = amount + fee + spread` — all `bigint`.
4. Display layer formats with locale-appropriate separator; the database never stores formatted strings.

### 9.4 Soft-delete vs hard-delete

| entity              | strategy                            |
|---------------------|-------------------------------------|
| `users`             | soft (`status = 'deleted'`)         |
| `linked_cards`      | soft (`status = 'removed'`)         |
| `recipients`        | hard delete (no audit value)        |
| `transfers`         | never delete (regulatory retention) |
| `kyc_verifications` | never delete (regulatory retention) |
| `wallet_ledger`     | append-only, never delete           |
| `aml_flags`         | never delete (regulatory retention) |
