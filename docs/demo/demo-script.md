# Wednesday demo script (5–7 minutes)

## Before the room

1. Run `cp .env.example .env && docker compose up --build`.
2. Confirm `http://localhost:8080/healthz`, `http://localhost:8080/readyz`, and `http://localhost:5173/listings` load.
3. Keep landlord and renter credentials from `docs/demo/accounts.md` ready. Use a private window when changing roles quickly.

## Live flow

**0:00–0:35 — FindYourKeja.** Open `/`. Explain that it is the public renter experience powered by the same PropFlow platform. Open **Browse rentals**, search `Westlands`, and briefly show rent, bedroom, locality, sort, and URL-synchronized filters.

**0:35–1:20 — Landlord operations.** Sign in with `landlord@propflow.demo` / `DemoPass2026!`. Show the database-derived dashboard, emphasizing that the counts and recent lists are not fixtures.

**1:20–2:15 — Inventory to marketplace.** Open **Properties**. For the fastest deterministic demo, open a seeded property and show its units. If demonstrating creation, add a property named `Wednesday Demo Court`, add unit `A-26`, and publish it. Confirm the success status and open the public marketplace to find the new listing.

**2:15–3:05 — Renter inquiry.** Sign out and sign in as `renter@propflow.demo`. Open the published listing, submit a message of at least ten characters, then open **Inquiries** to show its persisted state.

**3:05–4:20 — Convert the lead.** Return as the landlord. Open **Inquiries**, move the new item to `accepted`, then open **Tenancies** and create an active tenancy for an available unit and the seeded renter. Open **Payments** and record a KES ledger entry. If selecting `mpesa_demo`, say clearly that it is simulated and not a live M-Pesa transaction.

**4:20–5:25 — Maintenance loop.** Return as the renter. The dashboard now shows the relevant tenancy/payment state. Open **Maintenance**, submit a request for that active tenancy, and sign out. Return as the landlord, find it under **Maintenance**, and advance `open → acknowledged`.

**5:25–6:15 — Close the loop.** Return to the landlord dashboard and point out the updated database counts/recent activity. Briefly resize to mobile width or show the mobile navigation. End on the public marketplace.

## Fallbacks

- If data was changed during rehearsal, run `make demo-reset`. This intentionally deletes only the Compose demo volume and reseeds it.
- If external hosting is unavailable, use the local URLs above; no source edit is required.
- If creating a fresh tenancy would conflict, use another available seeded unit or show the already seeded active tenancy and payment history.
- If an image fails to load, continue—the seeded assets are local SVGs and the workflow data does not depend on an external image host.
- If Docker cannot run on the presentation machine, start PostgreSQL separately and follow the split frontend/API commands in the root README.
