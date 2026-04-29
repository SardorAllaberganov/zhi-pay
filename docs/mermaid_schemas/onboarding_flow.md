# Onboarding Flow — First-Time User

> Sequence diagram for first-time user onboarding: phone signup with SMS OTP, followed by an optional MyID KYC upgrade from `tier_1` → `tier_2`.
>
> **Used in:** PRD §7.1 — First-time onboarding
>
> **Participants:**
> - **U** — User
> - **App** — ZhiPay mobile app
> - **API** — ZhiPay backend
> - **SMS** — SMS gateway provider
> - **MyID** — Uzbekistan national e-ID service

```mermaid
sequenceDiagram
  participant U as User
  participant App
  participant API as ZhiPay API
  participant SMS as SMS gateway
  participant MyID

  U->>App: Open app
  App->>U: Ask for phone number
  U->>App: Enters +998...
  App->>API: POST /auth/start {phone}
  API->>SMS: Send OTP
  SMS-->>U: 6-digit code
  U->>App: Enters code
  App->>API: POST /auth/verify {phone, code}
  API-->>App: session token, user @ tier_1
  App->>U: Prompt MyID for higher limits
  U->>App: Tap "Verify with MyID"
  App->>MyID: Open MyID flow (deep link / WebView)
  MyID-->>App: session_id
  App->>API: POST /kyc/complete {session_id}
  API->>MyID: Fetch result
  MyID-->>API: passed + identity payload
  API->>API: Upgrade user.kyc_tier_id → tier_2
  API-->>App: tier_2, full_name, pinfl
  App->>U: Confirmation, ready to send
```
