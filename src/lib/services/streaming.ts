import { VoiceoverOptions, AudioFormat } from '../schemas'
import { DEFAULT_VOICE_CONFIG } from '../constants'

export interface AudioStreamController {
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => void
  onData: (callback: (chunk: Uint8Array) => void) => void
  onComplete: (callback: () => void) => void
  onError: (callback: (error: Error) => void) => void
}

export async function createOpenAIStream(options: VoiceoverOptions): Promise<AudioStreamController> {
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
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
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
      // We'll need to buffer the audio on the client side
    },
    resume: () => {
      // OpenAI doesn't support resuming streams
      // We'll need to buffer the audio on the client side
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
            'xi-api-key': process.env.ELEVENLABS_API_KEY!,
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
      // We'll need to buffer the audio on the client side
    },
    resume: () => {
      // ElevenLabs doesn't support resuming streams
      // We'll need to buffer the audio on the client side
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
