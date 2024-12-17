# AI Integration with @mdx.do/slides

This guide explains how to use the AI features in @mdx.do/slides, particularly focusing on the Vercel AI SDK's stream object integration.

## Streaming AI Responses

@mdx.do/slides uses the Vercel AI SDK's stream object to provide real-time streaming of AI-generated content. This enables:
- Progressive rendering of slide content
- Real-time voiceover generation
- Efficient handling of large responses

### Implementation Details

The streaming implementation uses the `OpenAIStream` and `StreamingTextResponse` from the Vercel AI SDK:

```typescript
import { OpenAIStream, StreamingTextResponse } from 'ai'

export async function generateSlides({ topic, style = 'professional' }) {
  const completion = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    method: 'POST',
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create slides about ${topic} in ${style} style` }
      ],
      stream: true,
    }),
  })

  // Transform and validate the stream
  const stream = OpenAIStream(completion, {
    async onCompletion(completion) {
      // Validate MDX structure
      if (!validateMDXContent(completion)) {
        throw new Error('Invalid MDX structure')
      }
    },
  })

  return new StreamingTextResponse(stream)
}
```

### Using the Stream in Components

The `AISlideGenerator` component handles the streaming response:

```typescript
function AISlideGenerator({ onSlideGenerated }) {
  const handleGenerate = async () => {
    const response = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify({ topic, style }),
    })

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      onSlideGenerated?.(chunk)
    }
  }
}
```

## Voiceover Generation

The voiceover feature also uses streaming for real-time audio generation:

```typescript
export async function generateVoiceover({ content, voice = 'natural' }) {
  const completion = await fetch('https://api.openai.com/v1/chat/completions', {
    // ... configuration ...
    body: JSON.stringify({
      messages: [
        { role: 'system', content: 'Create voiceover script' },
        { role: 'user', content: `Create voiceover for: ${content}` }
      ],
      stream: true,
    }),
  })

  const stream = OpenAIStream(completion)
  return new StreamingTextResponse(stream)
}
```

## Error Handling

The streaming implementation includes robust error handling:

```typescript
try {
  const stream = OpenAIStream(completion, {
    async onCompletion(completion) {
      if (!validateMDXContent(completion)) {
        console.error('Invalid MDX structure detected')
        throw new Error('Invalid MDX: Missing required components')
      }
    },
  })
  return new StreamingTextResponse(stream)
} catch (error) {
  console.error('Error in AI generation:', error)
  throw new Error('Failed to generate content')
}
```

## Best Practices

1. **Validation**: Always validate the streamed content before rendering
2. **Error Handling**: Implement proper error handling for stream interruptions
3. **Progress Updates**: Provide feedback during generation
4. **Chunking**: Process the stream in chunks for better performance

## Configuration

Set up your environment variables:

```env
OPENAI_API_KEY=your_api_key
```

Configure the API endpoint in your application:

```typescript
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL || '/api/generate'
```

For more information about the Vercel AI SDK's stream object, visit the [official documentation](https://sdk.vercel.ai/docs/reference/ai-sdk-core/stream-object).
