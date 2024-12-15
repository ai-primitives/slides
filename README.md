# @ai-primitives/slides

AI-Generated MDX Slide Decks and Voiceovers with Slidev, CodeHike, and Tailwind

## Features

- 🤖 AI-powered slide deck generation using Vercel AI SDK
- 🎙️ Automatic voiceover synthesis
- 📝 MDX-based slide authoring with Slidev
- 🎨 Beautiful, responsive layouts with Tailwind CSS
- 🌓 Automatic light/dark mode detection
- 💻 Code presentation with CodeHike
- 🎯 Built with Vite for optimal development experience
- 🎨 Tailwind Typography plugin for beautiful content

## Quick Start

### Installation

```bash
npm install @ai-primitives/slides
```

### Setup with Vite and Tailwind

1. Add the Tailwind CDN to your HTML:
```html
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {},
    },
    plugins: [
      require('@tailwindcss/typography'),
    ],
  }
</script>
```

2. Import and use the components:
```tsx
import { createDeck } from '@ai-primitives/slides'
import { streamObject } from 'ai'

// Generate a slide deck
const deck = await createDeck({
  topic: 'Introduction to React',
  slides: 5,
  includeCode: true,
  generateVoiceover: true
})

// Render the deck
function Presentation() {
  return <SlideDeck {...deck} />
}
```

## Documentation

### AI Integration

Built on the Vercel AI SDK for reliable streaming and structured data:

```tsx
import { generateSlides } from '@ai-primitives/slides'
import { streamObject } from 'ai'

const { slides, voiceover } = await generateSlides({
  topic: 'Machine Learning Basics',
  style: 'educational',
  audience: 'beginners',
  includeExamples: true
})
```

### Slide Layouts

The package includes a collection of beautiful, responsive layouts with automatic light/dark mode support:

```tsx
import { Slide, CodeBlock, Layout } from '@ai-primitives/slides'

// Split layout with code example
function CustomSlide() {
  return (
    <Slide layout="split">
      <Layout.Left>
        <h1>Custom Content</h1>
      </Layout.Left>
      <Layout.Right>
        <CodeBlock language="typescript">
          // Your code here
        </CodeBlock>
      </Layout.Right>
    </Slide>
  )
}

// Full-width layout with centered content
function TitleSlide() {
  return (
    <Slide layout="center">
      <h1>Presentation Title</h1>
      <p>Subtitle or description</p>
    </Slide>
  )
}
```

### MDX Integration

Create slides using MDX with built-in components:

```mdx
import { Slide } from '@ai-primitives/slides'

<Slide>
  # Welcome to My Presentation

  This slide uses MDX for content

  ```js
  // Code examples with syntax highlighting
  const hello = 'world'
  ```
</Slide>
```

## Contributing

Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © [AI Primitives](https://github.com/ai-primitives)
