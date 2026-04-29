# Card Linking Flow

> Sequence diagram for adding a payment card. Tokenizes the PAN at the acquirer, runs a 1-tiyin authorization to validate, and completes a 3DS challenge before the card becomes usable.
>
> **Used in:** PRD §7.2 — Linking a card
>
> **Participants:**
> - **U** — User
> - **App** — ZhiPay mobile app
> - **API** — ZhiPay backend
> - **Acq** — Acquirer (UzCard / Humo / Visa / Mastercard processor)

```mermaid
sequenceDiagram
  participant U as User
  participant App
  participant API as ZhiPay API
  participant Acq as Acquirer (UzCard/Humo/Visa/MC)

  U->>App: "Add card"
  App->>U: Card form (PAN, expiry, name)
  U->>App: Submits
  App->>API: POST /cards {pan, expiry, name}
  API->>Acq: Tokenize card + 1-tiyin auth
  Acq-->>API: token + 3DS challenge URL
  API-->>App: 3DS redirect URL
  App->>U: Opens 3DS WebView
  U->>Acq: Authenticates with bank OTP
  Acq-->>API: 3DS success webhook
  API->>API: Insert linked_cards row, status=active
  API-->>App: Card added (masked PAN, scheme, bank_name)
```
