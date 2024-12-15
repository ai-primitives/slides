import { VoiceoverOptions } from '../schemas'
import { DEFAULT_VOICE_CONFIG } from '../constants'
import { AudioServiceResult, AudioStreamController, AudioServiceOptions } from '../services/types'
import { BaseAudioService } from './base'

export class OpenAIAudioService extends BaseAudioService {
  constructor(options?: AudioServiceOptions) {
    super(options)
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
    const duration = this.estimateAudioDuration(content, speed)

    return { audio, format, duration }
  }

  async createStream(options: VoiceoverOptions): Promise<AudioStreamController> {
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
            throw new Error(`OpenAI API error: ${response.statusText}`)
          }

          if (!response.body) {
            throw new Error('No response body')
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

  private estimateAudioDuration(text: string, speed: number): number {
    const wordsPerMinute = 150 * speed
    const wordCount = text.split(/\s+/).length
    return (wordCount / wordsPerMinute) * 60
  }
}

export class ElevenLabsAudioService extends BaseAudioService {
  constructor(options?: AudioServiceOptions) {
    super(options)
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
    const duration = this.estimateAudioDuration(content, speed)

    return { audio, format, duration }
  }

  async createStream(options: VoiceoverOptions): Promise<AudioStreamController> {
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
                style: 0.5,
                speaking_rate: speed,
              },
            }),
            signal: abortController.signal,
          })

          if (!response.ok) {
            throw new Error(`ElevenLabs API error: ${response.statusText}`)
          }

          if (!response.body) {
            throw new Error('No response body')
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

  private estimateAudioDuration(text: string, speed: number): number {
    const wordsPerMinute = 150 * speed
    const wordCount = text.split(/\s+/).length
    return (wordCount / wordsPerMinute) * 60
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
