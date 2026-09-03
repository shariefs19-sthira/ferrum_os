// Single source of truth for the site's base URL, per W2-280
// ("C-07 SITE_BASE_URL swap"). Previously hardcoded independently in
// both sitemap.ts and robots.ts — now both read from here so a domain
// change is a one-line edit, not a two-file grep-and-replace.
// NEXT_PUBLIC_SITE_URL lets a preview/staging deploy override it
// without a code change; falls back to the production domain.

export const SITE_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.ferrumos.com'

export const SOCIAL_CARD_PATH = '/social-card.png'
export const SOCIAL_CARD_ALT = 'Ferrum OS - India-first construction operating system from land to delivery.'
