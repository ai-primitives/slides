import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(config)

const systemPrompt = `You are an expert at creating MDX slide decks. You understand how to structure content
for presentations using MDX components. Each slide should be wrapped in a <Slide> component.
Use appropriate heading levels and formatting. Include code examples using the <CodeBlock> component where relevant.

Requirements:
- Use a mix of layouts (default, center, split)
- Include relevant code examples
- Keep each slide focused and concise
- Use proper markdown formatting`

export async function generateSlide(topic: string, currentContent: string = '') {
  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Create the next slide for a presentation about ${topic}. Current content:\n${currentContent}` }
    ],
  })

  const stream = OpenAIStream(response)
  return new StreamingTextResponse(stream)
}
