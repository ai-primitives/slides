import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { type GenerateSlideOptions, type GenerateVoiceoverOptions, type Slide } from './schemas'
import { z } from 'zod'

const slideResponseSchema = z.object({
  title: z.string(),
  content: z.string(),
})

function validateSlideContent(content: string): boolean {
  try {
    const parsed = JSON.parse(content)
    return slideResponseSchema.safeParse(parsed).success
  } catch (error) {
    return false
  }
}

export async function generateSlides({ topic, style = 'professional', currentContent = '' }: GenerateSlideOptions) {
  try {
    const stream = streamText({
      model: openai('gpt-4'),
      system: `You are a slide deck generator. Generate slides in MDX format.
Each response should be a JSON object with the following structure:
{
  "title": "Slide Title",
  "content": "MDX/markdown formatted content"
}
Keep the content concise and focused. Use proper markdown formatting for:
- Headers (##, ###)
- Lists (-, *)
- Code blocks (\`\`\`)
- Emphasis (*text* or **text**)`,
      messages: [{ role: 'user', content: `Create a slide about ${topic} in a ${style} style.` }],
    })

    return stream
  } catch (error) {
    console.error('Error generating slides:', error)
    throw new Error('Failed to generate slides')
  }
}

export async function generateVoiceover({ content, voice = 'natural' }: GenerateVoiceoverOptions) {
  try {
    const stream = streamText({
      model: openai('gpt-4'),
      system: 'You are an expert at creating natural-sounding voiceover scripts with proper timing and pacing.',
      messages: [{ role: 'user', content: `Create a voiceover script for the following slide content in a ${voice} style:\n${content}` }],
    })

    return stream
  } catch (error) {
    console.error('Error generating voiceover:', error)
    throw new Error('Failed to generate voiceover')
  }
}
