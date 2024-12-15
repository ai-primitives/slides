import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { validateMDXContent } from '../lib/ai'

// Edge Runtime configuration
export const config = {
  runtime: 'edge',
  regions: ['iad1']
}

export default async function handler(request: Request): Promise<Response> {
  try {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const { prompt } = await request.json()
    if (!prompt) {
      return new Response('Prompt is required', { status: 400 })
    }

    const { text } = await generateText({
      model: openai('gpt-4'),
      messages: [
        { role: 'system', content: 'You are a helpful assistant that generates slide content in MDX format.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      maxTokens: 2000
    })

    if (!validateMDXContent(text)) {
      return new Response('Generated content is not valid MDX', { status: 400 })
    }

    return new Response(JSON.stringify({ content: text }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error generating slides:', error)
    return new Response('Failed to generate slides', { status: 500 })
  }
}
