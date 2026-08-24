# Current-state audit

## Ecosystem expansion audit — 24 August 2026

Baseline branch: `develop`

Baseline commit: `bdbd49bee2fc6e9096d4df9f8fb01edc0229d763`
Implementation branch: `chore/ecosystem-foundation`

The current `develop` branch is a functioning PropFlow + FindYourKeja vertical-slice MVP, not the original browser-only prototype described later in this document. It has a React/Vite web application, Go/Chi API, PostgreSQL migrations and seed data, server-side cookie sessions, role guards, property and unit CRUD, long-term listings and inquiries, tenancy creation, a demo rent ledger, maintenance, database-backed dashboards, OpenAPI, Docker packaging, Playwright coverage and GitHub Actions. That working path is the safety baseline for the ecosystem expansion.

The new ecosystem prompt adds three major requirements that are not present on `develop`:

- a route-level StayBora short-stay product with calendar, booking, guest-payment and host-payout state;
- a separate JengaBora application on port 3001 with construction project, milestone, evidence, approval, release-ledger and audit workflows;
- an explainable tenant reliability score with versioned evidence, appeal and human-review guardrails.

### Foundation gaps at the start of this branch

- Repository paths are `web/` and `api/`, not `apps/platform-web/` and `services/api/`.
- There is no root npm workspace or shared `packages/ui`, `packages/api-client`, `packages/contracts` and `packages/config` layer.
- There is no second Vite application or route shell for JengaBora.
- The platform routes still use `/landlord/*`, `/renter/*` and `/listings/*`; the requested `/propflow/*`, `/keja/*` and `/stay/*` product namespaces do not exist.
- Compose has PostgreSQL, API and one web container, but no MinIO service, JengaBora container or object-store readiness configuration.
- API origin configuration accepts one browser origin; two local applications require an allow-list while retaining strict origin enforcement.
- The schema does not yet contain rent obligations, immutable provider payment events, reconciliation matches/exceptions, short-stay availability/bookings/payouts, construction evidence/review/release records, media objects or tenant-score runs/components.
- The existing Go package is a single `internal/platform` package. The prompt's domain-level handler/service/repository split is a multi-branch refactor and must not be claimed as complete in the foundation branch.
- Current authentication supports landlord, renter and admin roles. Host, guest, developer, project manager, supervisor and contractor identities are not yet modeled.
- The existing password hashing, random server-side sessions, ownership checks, origin protection, rate limiting, safe headers and audit logging are reusable. Shared local-app SSO, explicit CSRF-token strategy, broader RBAC and media authorization remain follow-on work.

### Foundation decision

This branch will preserve the verified long-term rental path while changing its filesystem location, add the second frontend and shared workspace packages, add route-level ecosystem shells and feature flags, extend infrastructure and schema foundations, update contracts/docs/CI paths, and prove all existing checks still pass. It will not present placeholder shells as completed StayBora or JengaBora workflows. The exact next implementation branch is `feat/shared-auth-rbac`.

---

## Original prototype audit — 23 August 2026

Audit date: 23 August 2026  
Baseline commit: `5c0842b961eea071ed380a114e970b77ed7452cd` (`main`)  
Safety tag: `legacy-propflow-ui-v0`  
Audited before implementation on: `chore/mvp-foundation`

## Executive summary

The baseline is a visually developed React/Vite prototype, not a functioning production application. Its strongest reusable assets are the Kenyan real-estate vocabulary, selected cards and table layouts, responsive grid patterns, Lucide icon usage, the error boundary, and the loading skeleton. Identity, navigation, CRUD, analytics, payments, marketplace intelligence, and maintenance are simulated in browser memory or static fixtures. There is no server, database, authentication, public marketplace routing, API contract, CI workflow, or meaningful end-to-end test.

The rebuild should preserve selected presentation ideas while replacing the application shell, routing, authentication, server state, and all golden-path workflows with backend-backed implementations.

## Baseline and repository safety

- The working tree was clean on `main` before restructuring.
- Baseline commit: `5c0842b961eea071ed380a114e970b77ed7452cd`.
- The local safety tag `legacy-propflow-ui-v0` was created at that commit.
- Work moved to `develop`, then `chore/mvp-foundation`; implementation did not continue on `main`.
- The prototype frontend was relocated once from the repository root to `web/` with Git-tracked renames.

## Reuse assessment

### Reuse with refactoring

- React 19, TypeScript, Vite, Tailwind, Lucide, ESLint, Prettier, Vitest, Husky, and Commitlint are appropriate foundations.
- `web/src/shared/components/ErrorBoundary.tsx` and `LoadingSkeleton.tsx` provide useful initial patterns but need route-aware recovery and consistent tokens.
- Marketplace/property cards, dashboard metric composition, responsive table wrappers, and existing domain vocabulary are useful visual references.
- The stock prototype uses semantic `nav` and `main` elements, table headings, and generally useful image alt text in listing cards.
- Strategy documents correctly favor a modular monolith and provider interfaces for future payments.

### Rewrite or remove

- `web/src/App.tsx` uses `activeTab`, a switch renderer, hardcoded users, and in-memory arrays. Replace it with React Router, authenticated layouts, and TanStack Query.
- `web/src/components/Layout.tsx` exposes fake role switching and a non-functional logout button. Replace it with server-derived identity and real navigation links.
- All property, unit, tenant, payment, maintenance, document, message, marketplace, and dashboard workflows need API-backed behavior.
- `web/src/services/geminiService.ts` and the `@google/genai` browser dependency must be removed from the P0 bundle.
- The sale/intelligence-oriented static marketplace model should not be used as the rental marketplace contract.

## Functional gaps and hardcoded state

- No URL router dependency or URL route tree existed. Back/Forward, refresh restoration, deep links, not-found pages, and role guards were absent.
- `web/src/App.tsx` hardcodes landlord Musa Omari and renter Alice Johnson and impersonates them using a role toggle.
- `web/src/constants.ts`, `web/src/domains/listings/data.ts`, and component-local arrays provide all visible data.
- Property and tenant creation only append to React state. Maintenance is component-local and is lost after unmount.
- Unit data is fabricated from array index/modulo logic rather than stored records.
- Dashboard occupancy and financial figures are static, not derived from a database.
- There was no API client and no `fetch` use for product data.

## Dead and misleading interactions

- Marketplace search and listing cards had no navigation, detail, or inquiry action.
- Property search, manage/configure/detail/remove controls, and unit cards were inert.
- “Add Tenant & Send Invite” only mutated memory; “STK Push” opened a placeholder screen and did not initiate a payment.
- Maintenance search, filters, assignment, menus, and message actions were inert.
- Document upload/download/search/menu actions and message send/attachment/phone actions were placeholders.
- Lease and finance actions were placeholders; notification and logout controls did nothing.
- Deferred Intelligence, Admin, Documents, Messaging, Financials, and AI features were visible despite not supporting the P0 path.

## Security risks

- Critical: `.env.example` advertised `VITE_GEMINI_API_KEY`, and `web/src/services/geminiService.ts` constructed `GoogleGenAI` in the browser. Any populated Vite value would be published in the client bundle, and lease/maintenance text would be sent directly to a provider.
- `web/src/types.ts` modeled M-Pesa consumer secrets/passkeys in client types, encouraging secret-bearing browser configuration.
- Role filtering was presentation-only. There was no session, password hashing, server authorization, organization ownership enforcement, CSRF/origin protection, rate limiting, audit logging, or safe error envelope.
- No live credentials were found in tracked files; environment examples contained blank provider fields.
- The unused local-storage hook had unguarded JSON parsing. It must never be used for authentication secrets.
- No security headers or production CORS/origin policy existed.

## Accessibility and responsive risks

- Icon-only menu, notification, close, overflow, and chat buttons lacked accessible names.
- Navigation lacked `aria-current`; mobile controls lacked `aria-expanded` and `aria-controls`.
- Prototype modals had no dialog semantics, focus trap/restoration, Escape handling, or background inerting.
- Several labels were not programmatically associated with inputs.
- Click-looking `div` elements were not keyboard accessible; chart content lacked a text/table fallback.
- The mobile sidebar started open as a fixed full-height overlay while the main area also used `h-screen`, risking viewport overflow.
- Several form and unit layouts retained fixed columns at narrow widths; the mobile messages experience could not open a conversation.
- No systematic contrast, 360px viewport, reduced-motion, keyboard, or screen-reader test existed.

## Tooling and test gaps

- The only test was a two-assertion pure-function test at `web/src/domains/listings/intelligence.test.ts`.
- React Testing Library, Playwright, component-route tests, API integration tests, test PostgreSQL setup, and coverage thresholds were absent.
- There were no GitHub Actions workflows, Dockerfiles, Compose services, migrations, OpenAPI validation, dependency/security jobs, or deployment health gates.
- The baseline `npm run lint`, `npm run test`, and `npm run build` could not start because dependencies were not installed (`eslint`, `vitest`, and `tsc` were not found). This is recorded as an unavailable baseline, not a passing or failing code result.
- After moving the frontend, root Husky scripts would be invalid unless updated to run commands in `web/`; hooks were also not installed in the audit environment.
- Tailwind animation utility names appeared in components without a plugin or custom definitions, so those animations were likely inert.

## Documentation and deployment gaps

- `README.md` was the stock Vite README and did not describe the product or setup.
- `roadmap.md`, `scaling-strategy.md`, `monetization-strategy.md`, and `AI-feature-plan.md` contain useful post-MVP ideas, but many explicitly deferred systems (Redis, AI, live payments, KYC, advanced search, WhatsApp) must not leak into P0 navigation.
- `deployment-guide.md` was aspirational and omitted SPA fallback, same-origin API proxying, migration safety, rollback, health checks, backup, secrets, and reproducible demo instructions.
- The roadmap sequenced broad marketplace/AI work before persistent vertical slices and needed to be superseded by the P0 workboard.

## Missing backend and database functionality

The baseline had no Go module, HTTP server, health endpoints, authentication, domain services, repositories, PostgreSQL schema, migrations, seed data, SQLC configuration, transactions, ownership checks, audit events, OpenAPI contract, or test database safeguards.

## Out-of-scope technical debt

The following remain post-MVP: live M-Pesa/card providers, document storage, messaging, AI, fraud and valuation systems, KYC, agent verification, moderation, PostGIS, Redis, queues, notifications, advanced accounting, investor intelligence, SEO rendering, localization, and multi-country/multi-currency support. They must remain absent from P0 navigation and disabled in production bundles.
