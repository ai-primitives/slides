import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

// Create an OpenAI client instance
const model = openai('gpt-4')

export const runtime = 'edge'

const systemPrompt = `You are a slide deck generator. Generate slides in MDX format.
Each response should be a JSON object with the following structure:
{
  "title": "Slide Title",
  "content": "MDX/markdown formatted content"
}
Keep the content concise and focused. Use proper markdown formatting for:
- Headers (##, ###)
- Lists (-, *)
- Code blocks (\`\`\`)
- Emphasis (*text* or **text**)
`

// Validate request body schema
const requestSchema = z.object({
  prompt: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { prompt } = requestSchema.parse(body)

    const result = streamText({
      model,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    })

    return result.toDataStreamResponse()
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid request body', { status: 400 })
    }
    console.error('Error in generate route:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
