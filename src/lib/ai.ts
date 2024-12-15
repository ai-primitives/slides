import { OpenAIStream, StreamingTextResponse } from 'ai'
import { type GenerateSlideOptions, type GenerateVoiceoverOptions } from './schemas'

const systemPrompt = `You are an expert at creating MDX slide decks. You understand how to structure content
for presentations using MDX components. Each slide should be wrapped in a <Slide> component.
Use appropriate heading levels and formatting. Include code examples using the <CodeBlock> component where relevant.

Requirements:
- Use a mix of layouts (default, center, split)
- Include relevant code examples
- Keep each slide focused and concise
- Use proper markdown formatting
- Return content in valid MDX format
- Each slide must be wrapped in a <Slide> component with a layout prop
- Code examples must use the <CodeBlock> component with a language prop`

function validateMDXContent(content: string): boolean {
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

export async function generateSlides({ topic, style = 'professional', currentContent = '' }: GenerateSlideOptions) {
  try {
    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ''}`,
      },
      method: 'POST',
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create a slide deck about ${topic} in a ${style} style. ${currentContent ? 'Current content:\n' + currentContent : ''}` }
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    const stream = OpenAIStream(completion, {
      async onCompletion(completion) {
        if (!validateMDXContent(completion)) {
          console.error('Invalid MDX structure detected')
          throw new Error('Invalid MDX: Missing required components or structure')
        }
      },
    })

    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('Error generating slides:', error)
    throw new Error('Failed to generate slides')
  }
}

export async function generateVoiceover({ content, voice = 'natural' }: GenerateVoiceoverOptions) {
  try {
    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ''}`,
      },
      method: 'POST',
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert at creating natural-sounding voiceover scripts with proper timing and pacing.' },
          { role: 'user', content: `Create a voiceover script for the following slide content in a ${voice} style:\n${content}` }
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    const stream = OpenAIStream(completion)
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('Error generating voiceover:', error)
    throw new Error('Failed to generate voiceover')
  }
}
