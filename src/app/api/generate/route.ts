import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(config)

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { topic, style, currentContent } = await req.json()

    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert at creating MDX slide decks. Generate content in valid MDX format.
Each slide should be wrapped in a <Slide> component with appropriate layout.
Use proper markdown formatting and include code examples where relevant.`,
        },
        {
          role: 'user',
          content: `Create a slide deck about ${topic} in a ${style} style. ${
            currentContent ? 'Current content:\n' + currentContent : ''
          }`,
        },
      ],
      stream: true,
    })

    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('Error in slide generation:', error)
    return new Response('Failed to generate slides', { status: 500 })
  }
}
