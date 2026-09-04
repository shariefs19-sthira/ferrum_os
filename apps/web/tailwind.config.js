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
        // W2-372 Construction/Architecture palette, with the database orange
        // replaced by the established Fe saffron accent.
        primary: '#0B1F3A',
        success: '#138808',
        warning: '#FF9933',
        // RULE 6 keeps the legacy BOQ source class untouched; remap that lone
        // indigo utility to command navy so purple never renders.
        indigo: {
          600: '#0B1F3A',
          700: '#0B1F3A',
        },
        // Relume default scheme (docs/RELUME_HANDOFF.md #4 DESIGN TOKENS).
        // No chromatic brand colors set yet — neutral-only, monochrome.
        relume: {
          neutral: '#0B1F3A',
          ink: '#070707',
          command: '#0B1F3A',
          steel: '#64748B',
          'steel-soft': '#94A3B8',
          border: '#E2E8F0',
          surface: '#FFFFFF',
          'surface-secondary': '#F8FAFC',
          'surface-muted': '#EBF0F5',
          // DERIVED (W2-344), not literal in the handoff: Relume specifies the
          // same #070707 for heading and body, which collapses all text
          // hierarchy. `muted` is derived the same way the border token is
          // (ink at reduced alpha) so secondary copy stays on-token instead of
          // reaching for off-palette grays like text-gray-600.
          muted: '#475569',
          accent: '#FF9933',
          success: '#138808',
          danger: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
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
