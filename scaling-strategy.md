# Scaling Strategy

## Target Architecture

Use a modular monolith first, with clear domains and a versioned API. Split services only when operational pressure appears.

Core services:

1. React app, then Next.js or Remix for SEO-heavy marketplace pages.
2. Node API with domain modules for auth, listings, agents, leads, payments, messaging, analytics, admin, CMS, and notifications.
3. Postgres with PostGIS for listings, geospatial search, polygons, and neighborhood intelligence.
4. Redis for sessions, rate limits, queues, hot search caches, and recommendation cache.
5. Object storage plus CDN for listing media, floor plans, ownership documents, and generated assets.

## Data Scale

Partition high-volume tables by country and time where needed. Keep listing search read models separate from transactional listing records. Use background jobs to update search indexes, recommendation models, fraud scores, and SEO pages.

## Reliability

Add structured logging, tracing, uptime checks, queue retries, dead-letter queues, rate limiting, and provider-specific circuit breakers for M-Pesa, AI, maps, email, and WhatsApp.
