import OpenAI from 'openai'
import { z } from 'zod'

const OpenAIVoiceSchema = z.enum(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'])
type OpenAIVoice = z.infer<typeof OpenAIVoiceSchema>

interface VoiceProvider {
  generateSpeech(text: string, voice?: string): Promise<ArrayBuffer>
}

class OpenAIVoiceProvider implements VoiceProvider {
  private client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey })
  }

  async generateSpeech(text: string, voice: OpenAIVoice = 'alloy'): Promise<ArrayBuffer> {
    const response = await this.client.audio.speech.create({
      model: 'tts-1',
      voice,
      input: text,
    })

    return response.arrayBuffer()
  }
}

class ElevenLabsVoiceProvider implements VoiceProvider {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateSpeech(text: string, voice = 'rachel'): Promise<ArrayBuffer> {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`)
    }

    return response.arrayBuffer()
  }
}

type VoiceProviderMap = {
  openai: OpenAIVoiceProvider
  elevenlabs: ElevenLabsVoiceProvider
}

export class VoiceService {
  private providers: Map<keyof VoiceProviderMap, VoiceProvider>

  constructor() {
    this.providers = new Map<keyof VoiceProviderMap, VoiceProvider>([
      ['openai', new OpenAIVoiceProvider(process.env.OPENAI_API_KEY!)],
      ['elevenlabs', new ElevenLabsVoiceProvider(process.env.ELEVENLABS_API_KEY!)],
    ])
  }

  async generateSpeech(text: string, provider: keyof VoiceProviderMap = 'openai', voice?: string): Promise<ArrayBuffer> {
    const voiceProvider = this.providers.get(provider)
    if (!voiceProvider) {
      throw new Error(`Voice provider ${provider} not found`)
    }

    return voiceProvider.generateSpeech(text, voice)
  }
}

export const voiceService = new VoiceService()
