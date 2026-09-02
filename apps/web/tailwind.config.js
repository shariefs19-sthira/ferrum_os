/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // NOTE (W2-344): `primary`/`success`/`warning` below are pre-Relume
        // leftovers, NOT part of the Relume token set — docs/RELUME_HANDOFF.md
        // §4 is explicit that "No chromatic brand colors set yet (color1–color8
        // empty)". They are kept only so any straggling consumer keeps
        // compiling; nothing in the design system should reference them, and
        // they should be deleted once a grep confirms zero usages.
        primary: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        // Relume default scheme (docs/RELUME_HANDOFF.md #4 DESIGN TOKENS).
        // No chromatic brand colors set yet — neutral-only, monochrome.
        relume: {
          neutral: '#161616', // brand neutral
          ink: '#070707', // heading/body/accent text, neutral.950
          border: 'rgba(7, 7, 7, 0.2)', // alpha.20
          surface: '#ffffff', // scheme background
          'surface-secondary': '#F5F5F5', // neutral.50
          // DERIVED (W2-344), not literal in the handoff: Relume specifies the
          // same #070707 for heading and body, which collapses all text
          // hierarchy. `muted` is derived the same way the border token is
          // (ink at reduced alpha) so secondary copy stays on-token instead of
          // reaching for off-palette grays like text-gray-600.
          muted: 'rgba(7, 7, 7, 0.66)',
        },
      },
      fontFamily: {
        // Relume: Inter for both heading and body.
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        // Relume heading token: letter-spacing Tight.
        'relume-tight': '-0.01em',
      },
      borderRadius: {
        // Relume shape token: "Corner radius: Regular".
        relume: '0.5rem',
      },
      maxWidth: {
        // Relume spacing token: "Container width: Regular" — the width every
        // SectionShell already uses, named so pages stop hardcoding max-w-7xl.
        'relume-container': '80rem',
        // Reading measure for prose/article pages (previously hardcoded max-w-3xl).
        'relume-prose': '48rem',
      },
      spacing: {
        // Relume spacing tokens: "Vertical spacing: Regular", "Card padding:
        // Regular" — the values SectionShell/cards already use, named.
        'relume-section': '4rem',
        'relume-card': '2rem',
      },
    },
  },
  plugins: [],
}
