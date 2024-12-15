import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(config)

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { content, voice } = await req.json()

    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at creating natural-sounding voiceover scripts with proper timing and pacing.',
        },
        {
          role: 'user',
          content: `Create a voiceover script for the following slide content in a ${voice} style:\n${content}`,
        },
      ],
      stream: true,
    })

    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('Error in voiceover generation:', error)
    return new Response('Failed to generate voiceover', { status: 500 })
  }
}
