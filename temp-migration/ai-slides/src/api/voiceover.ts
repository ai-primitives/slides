import { voiceService } from '../lib/audio'

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

    const { text, provider = 'openai', voice } = await request.json()
    if (!text) {
      return new Response('Text is required', { status: 400 })
    }

    const audioBuffer = await voiceService.generateSpeech(text, provider, voice)
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg'
      }
    })
  } catch (error) {
    console.error('Error generating voiceover:', error)
    return new Response('Failed to generate voiceover', { status: 500 })
  }
}
