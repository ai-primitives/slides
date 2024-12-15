import { OpenAIStream, StreamingTextResponse } from 'ai'
import { openai as aiSdkOpenAI } from '@ai-sdk/openai'
import OpenAI from 'openai'
import { type GenerateSlideOptions, type VoiceoverOptions, type VoiceoverResponse } from './schemas'
import { streamToBuffer, estimateAudioDuration } from './audio'
import { DEFAULT_VOICE_CONFIG, OPENAI_VOICES } from './constants'
import { type LanguageModelV1Message } from '@ai-sdk/provider'

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

type OpenAIVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function createVoiceoverPrompt(content: string): LanguageModelV1Message[] {
  return [
    {
      role: 'system',
      content: 'You are an expert at creating natural-sounding voiceover scripts with proper timing and pacing.'
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `Create a voiceover script for the following slide content:\n\n${content}\n\nThe script should be well-paced and engaging, suitable for presentation voiceover.`
        }
      ]
    }
  ]
}

export async function generateVoiceover({
  content,
  voice = DEFAULT_VOICE_CONFIG.voice,
  provider = DEFAULT_VOICE_CONFIG.provider,
  model = DEFAULT_VOICE_CONFIG.model,
  format = DEFAULT_VOICE_CONFIG.format,
  speed = DEFAULT_VOICE_CONFIG.speed
}: VoiceoverOptions): Promise<Response> {
  try {
    const chatModel = aiSdkOpenAI.chat('gpt-4')

    const completion = await chatModel.doStream({
      inputFormat: 'messages',
      mode: {
        type: 'regular',
      },
      prompt: createVoiceoverPrompt(content),
      temperature: 0.7,
      maxTokens: 1000,
    })

    const audioTransform = new TransformStream<Uint8Array, Uint8Array>({
      async transform(chunk, controller) {
        try {
          const text = new TextDecoder().decode(chunk)

          if (provider === 'openai') {
            const openAIVoice = voice as OpenAIVoice
            if (!OPENAI_VOICES.includes(openAIVoice)) {
              throw new Error(`Invalid voice. Must be one of: ${OPENAI_VOICES.join(', ')}`)
            }

            const audioResponse = await openai.audio.speech.create({
              model: 'tts-1',
              input: text,
              voice: openAIVoice,
              response_format: format,
              speed,
            })

            if (!audioResponse.body) {
              throw new Error('No audio stream received from OpenAI')
            }

            const audioBuffer = await streamToBuffer(audioResponse.body)
            controller.enqueue(new Uint8Array(audioBuffer))
          } else if (provider === 'elevenlabs') {
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'xi-api-key': process.env.ELEVENLABS_API_KEY as string,
              },
              body: JSON.stringify({
                text,
                model_id: model || 'eleven_multilingual_v2',
                output_format: format,
              }),
            })

            if (!response.ok) {
              throw new Error(`ElevenLabs API error: ${response.statusText}`)
            }

            if (!response.body) {
              throw new Error('No audio stream received from ElevenLabs')
            }

            const audioBuffer = await streamToBuffer(response.body)
            controller.enqueue(new Uint8Array(audioBuffer))
          } else {
            throw new Error(`Unsupported provider: ${provider}`)
          }
        } catch (error) {
          console.error('Error in audio transformation:', error)
          controller.error(error)
        }
      }
    })

    const streamingResponse = new Response(completion.stream)

    const audioStream = streamingResponse.body?.pipeThrough(audioTransform)
    if (!audioStream) {
      throw new Error('Failed to create audio stream')
    }

    return new Response(audioStream, {
      headers: {
        'Content-Type': `audio/${format}`,
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Error generating voiceover:', error)
    return new Response('Failed to generate voiceover', { status: 500 })
  }
}

export async function generateVoiceoverBuffer({
  content,
  voice = DEFAULT_VOICE_CONFIG.voice,
  provider = DEFAULT_VOICE_CONFIG.provider,
  model = DEFAULT_VOICE_CONFIG.model,
  format = DEFAULT_VOICE_CONFIG.format,
  speed = DEFAULT_VOICE_CONFIG.speed
}: VoiceoverOptions): Promise<VoiceoverResponse> {
  try {
    const chatModel = aiSdkOpenAI.chat('gpt-4')

    const completion = await chatModel.doGenerate({
      inputFormat: 'messages',
      mode: {
        type: 'regular',
      },
      prompt: createVoiceoverPrompt(content),
      temperature: 0.7,
      maxTokens: 1000,
    })

    const script = completion.text
    if (!script) throw new Error('No script generated')

    if (provider === 'openai') {
      const openAIVoice = voice as OpenAIVoice
      if (!OPENAI_VOICES.includes(openAIVoice)) {
        throw new Error(`Invalid voice. Must be one of: ${OPENAI_VOICES.join(', ')}`)
      }

      const audioResponse = await openai.audio.speech.create({
        model: 'tts-1',
        input: script,
        voice: openAIVoice,
        response_format: format,
        speed,
      })

      if (!audioResponse.body) {
        throw new Error('No audio stream received from OpenAI')
      }

      const audioBuffer = await streamToBuffer(audioResponse.body)
      const duration = estimateAudioDuration(script, speed)

      return {
        audio: new Uint8Array(audioBuffer),
        format,
        duration,
      }
    } else if (provider === 'elevenlabs') {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY as string,
        },
        body: JSON.stringify({
          text: script,
          model_id: model || 'eleven_multilingual_v2',
          output_format: format,
        }),
      })

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`)
      }

      if (!response.body) {
        throw new Error('No audio stream received from ElevenLabs')
      }

      const audioBuffer = await streamToBuffer(response.body)
      const duration = estimateAudioDuration(script, speed)

      return {
        audio: new Uint8Array(audioBuffer),
        format,
        duration,
      }
    } else {
      throw new Error(`Unsupported provider: ${provider}`)
    }
  } catch (error) {
    console.error('Error generating voiceover:', error)
    throw new Error('Failed to generate voiceover')
  }
}
