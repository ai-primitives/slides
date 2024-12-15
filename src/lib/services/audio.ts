import { VoiceoverOptions, AudioFormat } from '../schemas'
import { DEFAULT_VOICE_CONFIG } from '../constants'

export interface AudioServiceResult {
  audio: ArrayBuffer
  format: AudioFormat
  duration: number
}

export interface AudioService {
  generateAudio(options: VoiceoverOptions): Promise<AudioServiceResult>
}

export class OpenAIAudioService implements AudioService {
  private readonly apiKey: string

  constructor(apiKey: string = process.env.OPENAI_API_KEY!) {
    this.apiKey = apiKey
  }

  async generateAudio(options: VoiceoverOptions): Promise<AudioServiceResult> {
    const {
      content,
      voice = DEFAULT_VOICE_CONFIG.voice,
      model = DEFAULT_VOICE_CONFIG.model,
      format = DEFAULT_VOICE_CONFIG.format,
      speed = DEFAULT_VOICE_CONFIG.speed,
    } = options

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: content,
        voice,
        response_format: format,
        speed,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`)
    }

    const audio = await response.arrayBuffer()
    const duration = estimateAudioDuration(content, speed)

    return { audio, format, duration }
  }
}

export class ElevenLabsAudioService implements AudioService {
  private readonly apiKey: string

  constructor(apiKey: string = process.env.ELEVENLABS_API_KEY!) {
    this.apiKey = apiKey
  }

  async generateAudio(options: VoiceoverOptions): Promise<AudioServiceResult> {
    const {
      content,
      voice = DEFAULT_VOICE_CONFIG.voice,
      model = DEFAULT_VOICE_CONFIG.model,
      format = DEFAULT_VOICE_CONFIG.format,
      speed = DEFAULT_VOICE_CONFIG.speed,
    } = options

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey,
      },
      body: JSON.stringify({
        text: content,
        model_id: model,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          speaking_rate: speed,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }))
      throw new Error(`ElevenLabs API error: ${error.detail || response.statusText}`)
    }

    const audio = await response.arrayBuffer()
    const duration = estimateAudioDuration(content, speed)

    return { audio, format, duration }
  }
}

function estimateAudioDuration(text: string, speed: number = DEFAULT_VOICE_CONFIG.speed): number {
  const wordsPerMinute = 150 * speed
  const wordCount = text.split(/\s+/).length
  return (wordCount / wordsPerMinute) * 60
}

export function createAudioService(provider: 'openai' | 'elevenlabs'): AudioService {
  switch (provider) {
    case 'openai':
      return new OpenAIAudioService()
    case 'elevenlabs':
      return new ElevenLabsAudioService()
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}
