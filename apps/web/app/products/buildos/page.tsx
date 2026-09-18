import { redirect } from 'next/navigation'

// Ferrum Projects migration: /products/buildos is now a backward-compatible
// alias. Canonical content lives at /products/ferrum-projects — internal
// identifiers (registry key `buildos`, ProductControlId, CockpitProduct)
// are unchanged; only the outward product name and route moved. See also
// apps/web/public/_redirects for the edge-level 301 covering non-JS/static
// hosting paths.
export default function FerrumProjectsRedirectPage() {
  redirect('/products/ferrum-projects')
}
