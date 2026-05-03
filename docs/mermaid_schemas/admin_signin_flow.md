# Admin Sign-in Flow

> Canonical end-to-end sequence for an admin authenticating into the dashboard at `/sign-in`. Email + password only — there is no 2FA / OTP step on the admin surface (TOTP / SMS-OTP belongs to the mobile end-user flow). Covers the rate-limit, disabled-account, network, and 5xx failure paths.
>
> **Used in:** PRD §6.1 row 14 (Admin sign-in)
> **Related:** [models.md §10](../models.md#10-admin--auth) · [admin_session_state_machine.md](./admin_session_state_machine.md)

## Sequence

```mermaid
sequenceDiagram
  autonumber
  actor U as Admin (browser)
  participant SI as /sign-in (client)
  participant API as Auth API
  participant DB as Postgres
  participant AUD as admin_login_audit

  U->>SI: enter email + password, submit
  SI->>API: POST /auth/signin {email, password}
  API->>DB: SELECT admin_users WHERE email = lower(:email)

  alt account_status = 'disabled'
    API-->>AUD: insert event_type=signin_account_disabled, failure_code=AUTH_ACCOUNT_DISABLED
    API-->>SI: 403 {failure_code: AUTH_ACCOUNT_DISABLED}
    SI-->>U: inline alert (admin.sign-in.error.disabled)
  else locked_until > now()
    API-->>AUD: insert event_type=signin_rate_limited, failure_code=AUTH_RATE_LIMITED, context={attempts_in_window, window_seconds}
    API-->>SI: 429 {failure_code: AUTH_RATE_LIMITED}
    SI-->>U: inline alert (admin.sign-in.error.rate-limited)
  else password mismatch (or unknown email)
    API->>DB: UPDATE admin_users SET failed_login_attempts = failed_login_attempts + 1
    Note right of API: same generic response<br/>for unknown email AND wrong password<br/>(no field-level reveal)
    API-->>AUD: insert event_type=signin_failed_credentials, failure_code=AUTH_INVALID_CREDENTIALS
    API-->>SI: 401 {failure_code: AUTH_INVALID_CREDENTIALS}
    SI-->>U: inline alert (admin.sign-in.error.invalid)
  else credentials valid
    API->>DB: INSERT admin_sessions {admin_user_id, created_at, last_seen_at = now(), expires_at = now() + 12h, ip_address, user_agent, device_fingerprint}
    API->>DB: UPDATE admin_users SET last_signed_in_at = now(), failed_login_attempts = 0, locked_until = NULL
    API-->>AUD: insert event_type=signin_success
    API-->>SI: 200 {session_cookie, admin_user: {id, display_name, role, preferred_language}}
    SI-->>U: navigate to ?next=<path> (default /), toast "Signed in. Welcome back, {display_name}."
  end
```

## Failure-only sub-paths

### Network failure (client → API unreachable)

```mermaid
flowchart LR
  subm[Form submit] --> req[POST /auth/signin]
  req -. timeout / TypeError .-> err[client catches]
  err --> alert[inline alert: admin.sign-in.error.network<br/>+ Retry CTA]
```

No audit row is written — the request never reached the server.

### Backend 5xx

```mermaid
flowchart LR
  subm[Form submit] --> req[POST /auth/signin]
  req --> srv[5xx response]
  srv --> ref[server log captures correlation_id]
  ref --> alert[inline alert with reference id<br/>+ 'contact your administrator if this persists']
```

The audit row is the server's responsibility (request reached the server). The client surfaces the correlation id only.

## Rate-limit windows

See [models.md §10.6](../models.md#106-rate-limiting-rules) for the canonical thresholds:

- per email: 5 failed credentials in 15 min → `locked_until = now() + 15min`
- per IP: 20 failed attempts in 15 min → IP-level reject for the rest of the window

## State after success

The new `admin_sessions` row drives every subsequent authenticated request. See [`admin_session_state_machine.md`](./admin_session_state_machine.md) for the session lifecycle.
