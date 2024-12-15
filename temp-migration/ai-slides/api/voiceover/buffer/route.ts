import { NextRequest } from 'next/server'
import { voiceService } from '../../../src/lib/audio'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { text, provider = 'openai', voice } = await req.json()
    const audioBuffer = await voiceService.generateSpeech(text, provider, voice)

    return new Response(audioBuffer, {
      headers: { 'Content-Type': 'audio/mpeg' }
    })
  } catch (error) {
    console.error('Error generating speech:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate speech' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
