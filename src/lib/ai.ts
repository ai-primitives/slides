import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'
import { z } from 'zod'

// Define schemas for slide content
export const SlideSchema = z.object({
  title: z.string(),
  content: z.string(),
  layout: z.enum(['default', 'center', 'split']).default('default'),
  notes: z.string().optional(),
  codeBlocks: z.array(z.object({
    language: z.string(),
    code: z.string(),
  })).optional(),
})

export const SlideDeckSchema = z.object({
  title: z.string(),
  description: z.string(),
  slides: z.array(SlideSchema),
})

export type Slide = z.infer<typeof SlideSchema>
export type SlideDeck = z.infer<typeof SlideDeckSchema>

export interface GenerateSlideOptions {
  topic: string
  style?: string
  currentContent?: string
}

export interface GenerateVoiceoverOptions {
  content: string
  voice?: string
}

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
- Use proper markdown formatting
- Return content in valid MDX format`

export async function generateSlides({ topic, style = 'professional', currentContent = '' }: GenerateSlideOptions) {
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create a slide deck about ${topic} in a ${style} style. ${currentContent ? 'Current content:\n' + currentContent : ''}` }
      ],
      stream: true,
    })

    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('Error generating slides:', error)
    throw new Error('Failed to generate slides')
  }
}

export async function generateVoiceover({ content, voice = 'natural' }: GenerateVoiceoverOptions) {
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert at creating natural-sounding voiceover scripts with proper timing and pacing.' },
        { role: 'user', content: `Create a voiceover script for the following slide content in a ${voice} style:\n${content}` }
      ],
      stream: true,
    })

    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('Error generating voiceover:', error)
    throw new Error('Failed to generate voiceover')
  }
}
