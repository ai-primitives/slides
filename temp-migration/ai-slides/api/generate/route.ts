import { NextRequest } from 'next/server'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { nanoid } from 'nanoid'
import { validateMDXContent } from '../../src/lib/ai'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { topic, style = 'professional', currentContent = '' } = await req.json()

    const messages = [
      { id: nanoid(), role: 'system', content: 'You are an expert at creating MDX slide decks...' },
      { id: nanoid(), role: 'user', content: `Create a slide deck about ${topic} in a ${style} style. ${currentContent ? 'Current content:\n' + currentContent : ''}` }
    ]

    const { text } = await generateText({
      model: openai('gpt-4'),
      messages: messages.map(({ role, content }) => ({ role, content })),
      temperature: 0.7,
      maxTokens: 2000,
    })

    if (!validateMDXContent(text)) {
      return new Response(JSON.stringify({ error: 'Invalid MDX content generated' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ content: text }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error generating slides:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate slides' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
