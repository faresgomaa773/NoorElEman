# Project conventions
- Keep the canonical site origin and indexable route policy in src/lib/site.ts; metadata and tests consume the same policy to avoid contradictory crawler signals.
- Manage per-route head tags with react-helmet-async under one HelmetProvider; this cleans up metadata during navigation.
- Keep the checked-in static sitemap synchronized with public React routes; do not list removed or private routes.
- Respect data-saving and slow connections for speculative route loading; user navigation remains lazy-loaded.