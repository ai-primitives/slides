# Getting Started with @mdx.do/slides

This guide will help you set up and create your first AI-powered slide deck using @mdx.do/slides.

## Installation

```bash
npm install @mdx.do/slides
# or
pnpm add @mdx.do/slides
# or
yarn add @mdx.do/slides
```

## Quick Start

1. Create a new MDX file for your slides:

```mdx
---
theme: default
layout: center
---

# My First Slide Deck

---
layout: default
---

## Content Goes Here
```

2. Import and use the components:

```tsx
import { MDXProvider, Slide } from '@mdx.do/slides'
import MySlides from './slides.mdx'

export default function Presentation() {
  return (
    <MDXProvider>
      <MySlides />
    </MDXProvider>
  )
}
```

## AI Features

### Generating Slides

```tsx
import { AISlideGenerator } from '@mdx.do/slides'

<AISlideGenerator
  topic="Your Topic"
  style="professional"
  onSlideGenerated={(slide) => {
    console.log('New slide:', slide)
  }}
/>
```

### Adding Voiceovers

```tsx
import { AIVoiceover } from '@mdx.do/slides'

<AIVoiceover
  content="Slide content here"
  voice="natural"
/>
```

## Layouts

@mdx.do/slides comes with several built-in layouts:

- `default`: Standard slide layout
- `center`: Centered content
- `split`: Two-column layout

Example usage:

```mdx
---
layout: split
---

::left::
Left content

::right::
Right content
```

## Dark Mode Support

The theme automatically detects the user's preferred color scheme and applies the appropriate styles. You can also manually toggle between themes:

```tsx
import { useTheme } from '@mdx.do/slides'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  )
}
```

## Tailwind Integration

@mdx.do/slides uses Tailwind CSS with the Typography plugin. Add this to your `tailwind.config.js`:

```js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%',
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
```

For more information, check out our [detailed documentation](https://github.com/ai-primitives/slides).
