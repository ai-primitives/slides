import { NextRequest } from 'next/server'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { nanoid } from 'nanoid'
import { voiceService } from '../../src/lib/audio'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { content, voice = 'natural', provider = 'openai' } = await req.json()

    const messages = [
      { id: nanoid(), role: 'system', content: 'You are an expert at creating natural-sounding voiceover scripts with proper timing and pacing.' },
      { id: nanoid(), role: 'user', content: `Create a voiceover script for the following slide content in a ${voice} style:\n${content}` }
    ]

    const { text } = await generateText({
      model: openai('gpt-4'),
      messages: messages.map(({ role, content }) => ({ role, content })),
      temperature: 0.7,
      maxTokens: 1000,
    })

    const audioBuffer = await voiceService.generateSpeech(text, provider)

    return new Response(audioBuffer, {
      headers: { 'Content-Type': 'audio/mpeg' }
    })
  } catch (error) {
    console.error('Error generating voiceover:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate voiceover' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
