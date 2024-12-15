import { generateText, type Message } from 'ai'
import { openai } from '@ai-sdk/openai'
import { type GenerateSlideOptions, type GenerateVoiceoverOptions } from './schemas'
import { nanoid } from 'nanoid'
import { z } from 'zod'

const systemPrompt = `You are an expert at creating MDX slide decks. You understand how to structure content
for presentations using MDX components. Each slide should be wrapped in a <Slide> component.

Requirements:
- Use appropriate layouts for different content types
- Include speaker notes where relevant
- Include relevant code examples
- Keep each slide focused and concise
- Use proper markdown formatting
- Return content in valid MDX format
- Each slide must be wrapped in a <Slide> component with a layout prop
- Code examples must use the <CodeBlock> component with a language prop`

const slideResponseSchema = z.object({
  content: z.string(),
})

export function validateMDXContent(content: string): boolean {
  const hasLayoutProp = content.includes('layout=')
  const hasCodeBlock = content.includes('<CodeBlock')
  const hasValidStructure = content.split('<Slide').length > 1

  if (!hasValidStructure || !hasLayoutProp) {
    return false
  }

  if (content.includes('```') || hasCodeBlock) {
    return true
  }

  return false
}

export async function generateSlides({ topic, style = 'professional', currentContent = '' }: GenerateSlideOptions): Promise<string> {
  try {
    const messages: Message[] = [
      { id: nanoid(), role: 'system', content: systemPrompt },
      { id: nanoid(), role: 'user', content: `Create a slide deck about ${topic} in a ${style} style. ${currentContent ? 'Current content:\n' + currentContent : ''}` }
    ]

    const { text } = await generateText({
      model: openai('gpt-4'),
      messages,
      temperature: 0.7,
      maxTokens: 2000,
    })

    if (!validateMDXContent(text)) {
      throw new Error('Invalid MDX: Missing required components or structure')
    }

    return text
  } catch (error) {
    console.error('Error generating slides:', error)
    throw error
  }
}

export async function generateVoiceover({ content, voice = 'natural' }: GenerateVoiceoverOptions): Promise<string> {
  try {
    const messages: Message[] = [
      { id: nanoid(), role: 'system', content: 'You are an expert at creating natural-sounding voiceover scripts with proper timing and pacing.' },
      { id: nanoid(), role: 'user', content: `Create a voiceover script for the following slide content in a ${voice} style:\n${content}` }
    ]

    const { text } = await generateText({
      model: openai('gpt-4'),
      messages,
      temperature: 0.7,
      maxTokens: 1000,
    })

    return text
  } catch (error) {
    console.error('Error generating voiceover:', error)
    throw error
  }
}
