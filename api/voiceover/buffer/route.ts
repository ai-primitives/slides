import { generateVoiceoverBuffer } from '../../../../lib/ai'
import { VoiceoverOptions } from '../../../../lib/schemas'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const body = await req.json()
    const options: VoiceoverOptions = {
      content: body.content,
      voice: body.voice,
      provider: body.provider,
      model: body.model,
      format: body.format,
      speed: body.speed,
      tier: body.tier || 'free',
    }

    // Generate voiceover with full buffer response
    const { audio, format, duration } = await generateVoiceoverBuffer(options)

    // Return the audio buffer with appropriate headers
    return new Response(audio, {
      headers: {
        'Content-Type': `audio/${format}`,
        'Content-Length': audio.byteLength.toString(),
        'X-Audio-Duration': duration.toString(),
      },
    })
  } catch (error) {
    console.error('Error in voiceover generation:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate voiceover' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}
