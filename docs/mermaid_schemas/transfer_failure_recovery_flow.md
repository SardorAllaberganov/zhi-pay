# Transfer Failure Recovery Flow

> Sequence diagram for a provider-side rejection (e.g. invalid Alipay/WeChat recipient). The card authorization is reversed, the wallet hold is released without consuming any limit, and the user is notified with a localized actionable error.
>
> **Used in:** PRD §7.4 — Failed transfer recovery
>
> **Participants:**
> - **API** — ZhiPay backend
> - **Prov** — Destination provider (Alipay or WeChat Pay)
> - **Acq** — Acquirer
> - **U** — User

```mermaid
sequenceDiagram
  participant API as ZhiPay API
  participant Prov as Alipay/WeChat
  participant Acq as Acquirer
  participant U as User

  Prov->>API: Webhook: failed (RECIPIENT_INVALID)
  API->>API: status=failed, failure_code=RECIPIENT_INVALID
  API->>Acq: Reverse card auth
  Acq-->>API: ok
  API->>API: ledger release (no debit consumed)
  API->>U: Push "Transfer failed: verify recipient"
  U->>API: Tap notification → opens transfer detail
  API-->>U: Localized error message + suggested action (from error_codes)
```
