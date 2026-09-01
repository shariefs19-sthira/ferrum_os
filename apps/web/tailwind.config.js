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
    },
  },
  plugins: [],
}
