# Technical Debt

## High Priority

1. No persistent backend or database exists. All data is mock data in the client.
2. Auth is simulated through a role toggle. Production auth, sessions, RBAC, and audit trails are required.
3. Routing is internal tab state. A production marketplace needs URL routes, deep links, canonical pages, and server-rendered SEO.
4. Payments are placeholders. M-Pesa and card providers need webhook-safe backend flows.
5. Images are remote Unsplash URLs without optimization, signed storage, or CDN transformations.

## Medium Priority

1. UI components still mix domain logic and presentation in several legacy files.
2. There is no request cache or API client because no API exists yet.
3. Accessibility needs keyboard focus passes on modals, navigation, and table actions.
4. Analytics are derived from static data, not event streams.
5. Test coverage is not yet meaningful beyond the runner setup.

## Low Priority

1. Some existing UI uses large radii and decorative styling that should be normalized as a design system matures.
2. Legacy placeholder comments should be removed as modules are migrated.
3. Copy needs localization readiness for Kenya-first, East Africa-next expansion.
