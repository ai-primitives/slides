import { generateSlides } from '../../../lib/ai'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { topic, style, currentContent } = await req.json()
    return generateSlides({ topic, style, currentContent })
  } catch (error) {
    console.error('Error in slide generation:', error)
    return new Response('Failed to generate slides', { status: 500 })
  }
}
