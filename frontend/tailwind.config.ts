import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%',
            color: '#374151',
            h1: { color: '#111827', fontWeight: '700' },
            h2: { color: '#111827', fontWeight: '700' },
            h3: { color: '#111827', fontWeight: '600' },
            a: { color: '#111827', textDecoration: 'underline' },
            strong: { color: '#111827' },
          },
        },
      },
    },
  },
  plugins: [typography],
}

export default config
