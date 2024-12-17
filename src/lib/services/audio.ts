import { VoiceoverOptions } from '../schemas'
import { DEFAULT_VOICE_CONFIG } from '../constants'
import { AudioServiceResult, AudioStreamController, AudioServiceOptions } from '../services/types'
import { BaseAudioService } from './base'

class AudioServiceError extends Error {
  constructor(message: string, public provider: 'openai' | 'elevenlabs') {
    super(`${provider.toUpperCase()} API error: ${message}`)
  }
}

export class OpenAIAudioService extends BaseAudioService {
  constructor(options?: AudioServiceOptions) {
    super({ apiKey: options?.apiKey || process.env.OPENAI_API_KEY || '', tier: options?.tier })
  }

  async generateAudio(options: VoiceoverOptions): Promise<AudioServiceResult> {
    this.checkRateLimit('openai')

    const {
      content,
      voice = DEFAULT_VOICE_CONFIG.voice,
      model = DEFAULT_VOICE_CONFIG.model,
      format = DEFAULT_VOICE_CONFIG.format,
      speed = DEFAULT_VOICE_CONFIG.speed,
    } = options

    try {
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
        const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
        throw new AudioServiceError(error.error?.message || 'Failed to generate audio', 'openai')
      }

      const audioBuffer = await response.arrayBuffer()
      return {
        audio: audioBuffer,
        format,
        duration: this.estimateAudioDuration(audioBuffer),
      }
    } catch (error: unknown) {
      if (error instanceof AudioServiceError) throw error
      const message = error instanceof Error ? error.message : 'Failed to generate audio'
      throw new AudioServiceError(message, 'openai')
    }
  }

  async createStream(options: VoiceoverOptions): Promise<AudioStreamController> {
    this.checkRateLimit('openai')

    const {
      content,
      voice = DEFAULT_VOICE_CONFIG.voice,
      model = DEFAULT_VOICE_CONFIG.model,
      format = DEFAULT_VOICE_CONFIG.format,
      speed = DEFAULT_VOICE_CONFIG.speed,
    } = options

    let dataCallback: ((chunk: Uint8Array) => void) | undefined
    let completeCallback: (() => void) | undefined
    let errorCallback: ((error: Error) => void) | undefined
    let abortController: AbortController | undefined

    return {
      start: async () => {
        try {
          abortController = new AbortController()
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
            signal: abortController.signal,
          })

          if (!response.ok) {
            throw new AudioServiceError(response.statusText, 'openai')
          }

          if (!response.body) {
            throw new AudioServiceError('No response body', 'openai')
          }

          const reader = response.body.getReader()

          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            dataCallback?.(value)
          }

          completeCallback?.()
        } catch (error) {
          errorCallback?.(error as Error)
        }
      },
      pause: () => {
        // OpenAI doesn't support pausing streams
      },
      resume: () => {
        // OpenAI doesn't support resuming streams
      },
      stop: () => {
        abortController?.abort()
      },
      onData: (callback) => {
        dataCallback = callback
      },
      onComplete: (callback) => {
        completeCallback = callback
      },
      onError: (callback) => {
        errorCallback = callback
      },
    }
  }

  private estimateAudioDuration(audioBuffer: ArrayBuffer): number {
    // Estimate duration based on buffer size and typical audio bitrate (128kbps)
    return (audioBuffer.byteLength * 8) / (128 * 1024)
  }
}

export class ElevenLabsAudioService extends BaseAudioService {
  constructor(options?: AudioServiceOptions) {
    super({ apiKey: options?.apiKey || process.env.ELEVENLABS_API_KEY || '', tier: options?.tier })
  }

  async generateAudio(options: VoiceoverOptions): Promise<AudioServiceResult> {
    this.checkRateLimit('elevenlabs')

    const {
      content,
      voice = DEFAULT_VOICE_CONFIG.voice,
      model = DEFAULT_VOICE_CONFIG.model,
      speed = DEFAULT_VOICE_CONFIG.speed,
    } = options

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/stream`, {
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
            style: 0.0,
            use_speaker_boost: true,
            speaking_rate: speed,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: { message: 'Unknown error' } }))
        throw new AudioServiceError(error.detail?.message || 'Failed to generate audio', 'elevenlabs')
      }

      const audioBuffer = await response.arrayBuffer()
      return {
        audio: audioBuffer,
        format: 'mp3',
        duration: this.estimateAudioDuration(audioBuffer),
      }
    } catch (error: unknown) {
      if (error instanceof AudioServiceError) throw error
      const message = error instanceof Error ? error.message : 'Failed to generate audio'
      throw new AudioServiceError(message, 'elevenlabs')
    }
  }

  async createStream(options: VoiceoverOptions): Promise<AudioStreamController> {
    this.checkRateLimit('elevenlabs')

    const {
      content,
      voice = DEFAULT_VOICE_CONFIG.voice,
      model = DEFAULT_VOICE_CONFIG.model,
      speed = DEFAULT_VOICE_CONFIG.speed,
    } = options

    let dataCallback: ((chunk: Uint8Array) => void) | undefined
    let completeCallback: (() => void) | undefined
    let errorCallback: ((error: Error) => void) | undefined
    let abortController: AbortController | undefined

    return {
      start: async () => {
        try {
          abortController = new AbortController()
          const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/stream`, {
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
                style: 0.0,
                use_speaker_boost: true,
                speaking_rate: speed,
              },
            }),
            signal: abortController.signal,
          })

          if (!response.ok) {
            throw new AudioServiceError(response.statusText, 'elevenlabs')
          }

          if (!response.body) {
            throw new AudioServiceError('No response body', 'elevenlabs')
          }

          const reader = response.body.getReader()

          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            dataCallback?.(value)
          }

          completeCallback?.()
        } catch (error) {
          errorCallback?.(error as Error)
        }
      },
      pause: () => {
        // ElevenLabs doesn't support pausing streams
      },
      resume: () => {
        // ElevenLabs doesn't support resuming streams
      },
      stop: () => {
        abortController?.abort()
      },
      onData: (callback) => {
        dataCallback = callback
      },
      onComplete: (callback) => {
        completeCallback = callback
      },
      onError: (callback) => {
        errorCallback = callback
      },
    }
  }

  private estimateAudioDuration(audioBuffer: ArrayBuffer): number {
    // Estimate duration based on buffer size and typical audio bitrate (128kbps)
    return (audioBuffer.byteLength * 8) / (128 * 1024)
  }
}

export function createAudioService(provider: 'openai' | 'elevenlabs', options?: AudioServiceOptions): BaseAudioService {
  switch (provider) {
    case 'openai':
      return new OpenAIAudioService(options)
    case 'elevenlabs':
      return new ElevenLabsAudioService(options)
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}
