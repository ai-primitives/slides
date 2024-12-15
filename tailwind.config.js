/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100ch',
            color: 'rgb(var(--foreground-rgb))',
            '[class~="lead"]': {
              color: 'rgb(var(--foreground-rgb))',
            },
            a: {
              color: 'rgb(var(--primary-rgb))',
              '&:hover': {
                color: 'rgb(var(--primary-hover-rgb))',
              },
            },
            strong: {
              color: 'rgb(var(--foreground-rgb))',
            },
            'ol > li::marker': {
              color: 'rgb(var(--foreground-rgb))',
            },
            'ul > li::marker': {
              color: 'rgb(var(--foreground-rgb))',
            },
            hr: {
              borderColor: 'rgb(var(--border-rgb))',
            },
            blockquote: {
              color: 'rgb(var(--foreground-rgb))',
              borderLeftColor: 'rgb(var(--border-rgb))',
            },
            h1: {
              color: 'rgb(var(--foreground-rgb))',
            },
            h2: {
              color: 'rgb(var(--foreground-rgb))',
            },
            h3: {
              color: 'rgb(var(--foreground-rgb))',
            },
            h4: {
              color: 'rgb(var(--foreground-rgb))',
            },
            'figure figcaption': {
              color: 'rgb(var(--foreground-rgb))',
            },
            code: {
              color: 'rgb(var(--foreground-rgb))',
            },
            'a code': {
              color: 'rgb(var(--primary-rgb))',
            },
            pre: {
              color: 'rgb(var(--foreground-rgb))',
              backgroundColor: 'rgb(var(--code-bg-rgb))',
            },
            thead: {
              color: 'rgb(var(--foreground-rgb))',
              borderBottomColor: 'rgb(var(--border-rgb))',
            },
            'tbody tr': {
              borderBottomColor: 'rgb(var(--border-rgb))',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
