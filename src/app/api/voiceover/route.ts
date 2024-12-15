import { generateVoiceover } from '../../../lib/ai'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { content, voice } = await req.json()
    return generateVoiceover({ content, voice })
  } catch (error) {
    console.error('Error in voiceover generation:', error)
    return new Response('Failed to generate voiceover', { status: 500 })
  }
}
