# Ecosystem branch plan

The completed PropFlow + FindYourKeja Wednesday MVP remains the verified `develop` baseline. Every ecosystem branch begins from the latest passing `develop`, owns one complete outcome, includes its UI/API/schema/tests/docs, and merges only after its checks pass.

| Sequence | Branch                                  | Acceptance outcome                                                                                                                  |
| -------: | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
|        0 | `chore/ecosystem-foundation`            | Workspace restructure, shared packages, two Vite apps, Go/API relocation, PostgreSQL + MinIO topology, schema/OpenAPI/CI foundation |
|        1 | `feat/shared-auth-rbac`                 | Shared cookie identity across both local apps, expanded roles, organization/project membership, CSRF and protected routes           |
|        2 | `feat/propflow-properties-units`        | Preserve and migrate property/unit CRUD into the ecosystem modules                                                                  |
|        3 | `feat/propflow-tenancies`               | Long-term tenancy and lease records with overlap protection                                                                         |
|        4 | `feat/propflow-daraja-reconciliation`   | Deterministic Daraja adapter, immutable callback events, matching and exception resolution                                          |
|        5 | `feat/propflow-roi-reporting`           | Database-backed occupancy, collection, arrears and yield reporting                                                                  |
|        6 | `feat/propflow-maintenance`             | Tenant request and landlord status workflow on shared inventory                                                                     |
|        7 | `feat/jengabora-projects-milestones`    | Project/team/milestone CRUD in the separate application                                                                             |
|        8 | `feat/jengabora-proof-of-work`          | Versioned evidence uploads to object storage                                                                                        |
|        9 | `feat/jengabora-approval-workflow`      | Supervisor approve/reject/resubmit state machine with reasons and audit                                                             |
|       10 | `feat/jengabora-payment-release-ledger` | Approval-gated sandbox release ledger; no production disbursement claim                                                             |
|       11 | `feat/findyourkeja-marketplace`         | PropFlow-sourced long-term inventory under `/keja/*`                                                                                |
|       12 | `feat/findyourkeja-inquiries`           | Renter inquiry submission and landlord inbox                                                                                        |
|       13 | `feat/findyourkeja-tenancy-conversion`  | Accepted inquiry transactionally becomes a tenancy and removes availability                                                         |
|       14 | `feat/staybora-listings-calendar`       | Managed/verified-host inventory and availability calendar                                                                           |
|       15 | `feat/staybora-booking-workflow`        | Search-by-date, conflict-safe booking request and lifecycle                                                                         |
|       16 | `feat/staybora-host-payout-ledger`      | Guest ledger and calculated sandbox host payout state                                                                               |
|       17 | `feat/tenant-reliability-score`         | Versioned deterministic score, reason codes, insufficient-history and human-review guardrails                                       |
|       18 | `test/ecosystem-golden-paths`           | Four isolated PostgreSQL/MinIO Playwright journeys                                                                                  |
|       19 | `ci/fullstack-quality-gates`            | Workspace, Go, migration, contract, object-store, security and image gates                                                          |
|       20 | `chore/demo-seeding-deployment`         | Deterministic multi-role accounts, Kenyan inventory/projects and repeatable demo packaging                                          |

Do not create a feature branch until its work begins. Do not force-push shared branches or merge failing checks.
