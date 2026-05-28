/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        ink: {
          50:  '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        }
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: theme('colors.gray.700'),
            a: { color: theme('colors.ink.600') },
            'h1,h2,h3': { fontFamily: 'Playfair Display, Georgia, serif' },
            pre: { backgroundColor: theme('colors.gray.900') },
          }
        },
        invert: {
          css: {
            color: theme('colors.gray.300'),
            a: { color: theme('colors.ink.400') },
          }
        }
      })
    }
  },
  plugins: [require('@tailwindcss/typography')]
}
