import { VoiceoverOptions } from '../schemas'
import { DEFAULT_VOICE_CONFIG } from '../constants'
import { OpenAIAudioService, ElevenLabsAudioService } from './audio'
import { AudioStreamController } from './types'

export async function createOpenAIStream(options: VoiceoverOptions): Promise<AudioStreamController> {
  const service = new OpenAIAudioService({ apiKey: process.env.OPENAI_API_KEY, tier: options.tier })

  let dataCallback: ((chunk: Uint8Array) => void) | undefined
  let completeCallback: (() => void) | undefined
  let errorCallback: ((error: Error) => void) | undefined
  let abortController: AbortController | undefined

  return {
    start: async () => {
      try {
        service.checkRateLimit('openai')
        abortController = new AbortController()
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: options.model || DEFAULT_VOICE_CONFIG.model,
            input: options.content,
            voice: options.voice || DEFAULT_VOICE_CONFIG.voice,
            response_format: options.format || DEFAULT_VOICE_CONFIG.format,
            speed: options.speed || DEFAULT_VOICE_CONFIG.speed,
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
    },
    resume: () => {
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

export async function createElevenLabsStream(options: VoiceoverOptions): Promise<AudioStreamController> {
  const service = new ElevenLabsAudioService({ apiKey: process.env.ELEVENLABS_API_KEY, tier: options.tier })

  let dataCallback: ((chunk: Uint8Array) => void) | undefined
  let completeCallback: (() => void) | undefined
  let errorCallback: ((error: Error) => void) | undefined
  let abortController: AbortController | undefined

  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    throw new Error('ElevenLabs API key is not configured')
  }

  return {
    start: async () => {
      try {
        service.checkRateLimit('elevenlabs')
        abortController = new AbortController()
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${options.voice || DEFAULT_VOICE_CONFIG.voice}/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
          },
          body: JSON.stringify({
            text: options.content,
            model_id: options.model || DEFAULT_VOICE_CONFIG.model,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.5,
              speaking_rate: options.speed || DEFAULT_VOICE_CONFIG.speed,
            },
          }),
          signal: abortController.signal,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: { message: response.statusText } }))
          throw new Error(`ElevenLabs API error: ${errorData.detail?.message || response.statusText}`)
        }

        if (!response.body) {
          throw new Error('No response body')
        }

        const reader = response.body.getReader()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          if (value && value.length > 0) {
            dataCallback?.(value)
          }
        }

        completeCallback?.()
      } catch (error) {
        errorCallback?.(error as Error)
      }
    },
    pause: () => {
    },
    resume: () => {
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
