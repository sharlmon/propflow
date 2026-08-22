# MVP workboard

| Branch | Product outcome | Frontend tasks | Backend tasks | Database tasks | QA tasks | Dependencies | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `chore/mvp-foundation` | Runnable full-stack base | Relocate Vite, config/router base, tokens | Health/readiness, middleware shell | Initial additive schema, SQLC config | Baseline/audit/build | None | Complete |
| `feat/auth-access` | Real identity and access | Auth forms/layout guards | Argon2id sessions/RBAC | Users, orgs, members, sessions, audits | Auth/unit/route tests | Foundation | Complete |
| `feat/properties-units` | Landlord inventory | CRUD pages/forms | Ownership/business rules | Property/unit queries | Validation/ownership tests | Auth | Complete |
| `feat/marketplace-listings` | Public rental discovery | Search/detail/publish UI | Filters and publication rules | Listing/image queries/indexes | Filter and routing tests | Inventory | Complete |
| `feat/listing-inquiries` | Renter-to-landlord lead | Inquiry form/inbox | Status and authorization | Inquiry queries/audits | Workflow tests | Marketplace | Complete |
| `feat/tenancies-leases` | Active tenancy record | Tenancy forms/views | Transaction/conflict checks | Tenancy queries/partial index | Conflict tests | Inquiries | Complete |
| `feat/payments-ledger` | Demo rent ledger | Record/view pages | Ledger rules | Payment queries | Authorization tests | Tenancies | Pending |
| `feat/maintenance-workflow` | Repair lifecycle | Renter/landlord pages | Transition state machine | Maintenance queries | Transition tests | Tenancies | Pending |
| `feat/dashboard-analytics` | Real operating metrics | Metric/recent cards | Scoped aggregation | Dashboard queries/index review | Empty/error/aggregate tests | All domains | Pending |
| `test/golden-path-e2e` | Reproducible journey | Stable semantic selectors | Test reset support | Isolated test DB | Playwright | All features | Pending |
| `ci/mvp-quality-gates` | Merge protection | npm quality job | Go quality job | Migration/integration job | Contract/security jobs | Tests | Pending |
| `chore/demo-deployment` | Wednesday demo | Production build | Image/health config | Deterministic seed | Regression/demo script | CI | Pending |
