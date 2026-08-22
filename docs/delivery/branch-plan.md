# MVP branch plan

Each branch starts from the latest passing `develop`, owns a complete user outcome, adds tests and docs, and is merged locally only after its acceptance checks pass. No feature branch is created before work starts.

| Branch | Acceptance outcome |
| --- | --- |
| `chore/mvp-foundation` | Audit, safety tag, full-stack layout, PostgreSQL schema, Go health API, Compose, web relocation, routing/config foundation |
| `feat/auth-access` | Registration, login, logout, session restoration, organization bootstrap, server and route role guards |
| `feat/properties-units` | Landlord-owned property and unit CRUD with validation and protected deletion |
| `feat/marketplace-listings` | Publish/unpublish and public filtered rental listing/detail routes |
| `feat/listing-inquiries` | Authenticated renter inquiry and landlord inbox/status workflow |
| `feat/tenancies-leases` | Conflict-safe tenancy creation and renter visibility |
| `feat/payments-ledger` | Landlord records ledger entries; renter sees related entries |
| `feat/maintenance-workflow` | Renter creates requests; landlord performs valid status transitions |
| `feat/dashboard-analytics` | Both dashboards derive metrics and recent activity from PostgreSQL |
| `test/golden-path-e2e` | Playwright covers the critical landlord-to-renter path |
| `ci/mvp-quality-gates` | Frontend, Go, PostgreSQL, contract, security, and image checks run in CI |
| `chore/demo-deployment` | Deterministic demo setup, packaging, script, and final documentation |

Remote handoff when credentials are available:

```bash
git push origin legacy-propflow-ui-v0
git push -u origin develop
```
