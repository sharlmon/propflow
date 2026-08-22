# Security model

## Identity and sessions

- Passwords use Argon2id with per-password random salts and an encoded parameter string.
- A login creates 32 random bytes. Only a SHA-256 hash of that opaque token is stored in `sessions`.
- The raw token is sent only in an `HttpOnly`, `SameSite=Lax` cookie. `Secure` is mandatory outside local HTTP development.
- Logout revokes the database session before expiring the cookie.

## Authorization and tenancy isolation

- Backend middleware loads the user from the session for every protected request.
- Role middleware enforces landlord/renter routes; admin is not assignable through public registration.
- Landlord queries derive organization membership from the authenticated user. Client-supplied ownership identifiers are ignored or rejected.
- Renter queries are restricted to the authenticated renter's inquiries, tenancies, payments, and maintenance requests.

## Request protections

- Cookie-authenticated mutations require an exact configured `Origin`.
- API bodies are size-limited and unknown JSON fields are rejected.
- Authentication and inquiry endpoints use bounded in-process IP rate limits for the single-instance MVP.
- Requests have IDs and timeouts; panic recovery returns a generic error.
- Responses set content-type, frame, referrer, MIME sniffing, and permissions headers.
- Logs omit passwords, cookies, raw session tokens, and database connection strings.

## Deferred integrations

No AI or live payment provider is called. `mpesa_demo` is only a ledger label. A future integration must remain server-mediated, verify webhooks, provide idempotency/reconciliation, and store secrets only in server-side secret management.
