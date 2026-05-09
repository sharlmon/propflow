# PropFlow Roadmap

## Current Baseline

PropFlow is currently a Vite React single-page app with mock in-memory property, tenant, finance, maintenance, messaging, document, payment, and Gemini-assisted lease/maintenance flows. There is no backend, database schema, server routing, production auth, deployment pipeline, or persistent API layer yet.

## Phase 1: Platform Foundation

1. Stabilize strict TypeScript, linting, formatting, test runner, commit hooks, central config, feature flags, error boundaries, loading states, and route-level lazy loading.
2. Move UI and business logic into domains: `auth`, `listings`, `agents`, `analytics`, `payments`, `messaging`, `maps`, `ai`, `admin`, `cms`, and `notifications`.
3. Introduce a typed API client, request caching, optimistic updates, and server-state boundaries before adding persistence.

## Phase 2: Marketplace And Intelligence

1. Promote properties into marketplace-grade listings with slugs, SEO metadata, geolocation, verification, pricing history, documents, AI summaries, and trust signals.
2. Add advanced search, saved searches, property compare, affordability, mortgage, and rental yield calculators.
3. Build recommendation rails for similar homes, nearby homes, trending properties, and best value properties.

## Phase 3: Backend And Data

1. Add a backend API with Postgres/PostGIS, Redis, object storage, background jobs, and audit logs.
2. Implement auth, RBAC, KYC, agent verification, listing moderation, lead capture, and payment webhooks.
3. Version APIs from the start: `/api/v1`.

## Phase 4: Growth, SEO, And Monetization

1. Generate county, neighborhood, investment-guide, market-report, and blog pages with schema markup and automated sitemaps.
2. Launch alerts, referrals, WhatsApp campaigns, email digests, agent public profiles, and CRM workflows.
3. Monetize with M-Pesa, Stripe, Flutterwave, featured listings, subscriptions, lead purchasing, and ad packages.

## Phase 5: Scale Across East Africa

1. Add country-aware configuration, currency support, locality taxonomy, and provider adapters.
2. Build analytics warehouses, predictive pricing, market heatmaps, and investor dashboards.
3. Prepare mobile PWA/offline flows for low-bandwidth environments.
