/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './Nav.js',
  ],
  theme: {
    extend: {
      colors: {
        base: 'var(--base)',
        'base-2': 'var(--base-2)',
        'base-3': 'var(--base-3)',
        ink: 'var(--ink)',
        'ink-mute': 'var(--ink-mute)',
        'ink-faint': 'var(--ink-faint)',
        gold: 'var(--gold)',
        'gold-soft': 'var(--gold-soft)',
        line: 'var(--line)',
        green: 'var(--green)',
        'green-soft': 'var(--green-soft)',
        bg: 'var(--ce-bg)',
        surface: 'var(--ce-surface)',
        s2: 'var(--ce-s2)',
        s3: 'var(--ce-s3)',
        border: 'var(--ce-border)',
        border2: 'var(--ce-border2)',
        'on-accent': 'var(--ce-on-accent)',
        muted: 'var(--ce-muted)',
        soft: 'var(--ce-soft)',
        error: 'var(--error)',
        'green-dim': '#5a8a12',
        amber: '#E8A83A',
        red: '#E05C3A',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        sans: ['Instrument Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        ce: 'var(--r-lg)',
      },
    },
  },
  plugins: [],
}
