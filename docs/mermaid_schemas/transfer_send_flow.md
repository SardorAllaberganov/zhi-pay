# Transfer Send Flow — Golden Path

> Sequence diagram for the happy-path transfer: FX quote, KYC tier limit check, card authorization, payout to Alipay/WeChat, and webhook-driven completion.
>
> **Used in:** PRD §7.3 — Send transfer (golden path)
>
> **Participants:**
> - **U** — User
> - **App** — ZhiPay mobile app
> - **API** — ZhiPay backend
> - **FX** — Internal FX rate service
> - **Acq** — Acquirer
> - **Prov** — Destination provider (Alipay or WeChat Pay)

```mermaid
sequenceDiagram
  participant U as User
  participant App
  participant API as ZhiPay API
  participant FX as FX service
  participant Acq as Acquirer
  participant Prov as Alipay/WeChat

  U->>App: Choose recipient + amount
  App->>API: GET /fx/quote?amount=X
  API->>FX: Latest mid_rate
  FX-->>API: rate + spread
  API-->>App: client_rate, fee_uzs, total_charge_uzs, amount_cny
  App->>U: Show breakdown, ask to confirm
  U->>App: Confirm
  App->>API: POST /transfers {card_id, recipient, amount, fx_rate_id}
  API->>API: Check KYC tier limits (per-tx, daily, monthly)
  API->>API: Insert transfers row, status=created
  API->>Acq: Auth + capture total_charge_uzs
  Acq-->>API: ok
  API->>API: status=processing, wallet hold
  API->>Prov: Initiate payout (amount_cny, recipient_id)
  Prov-->>API: external_tx_id
  API-->>App: status=processing
  App-->>U: "Sent — confirming..."
  Prov->>API: Webhook: completed
  API->>API: status=completed, ledger debit, usage++
  API->>U: Push "Transfer completed"
```
