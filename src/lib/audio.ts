import { VoiceoverOptions, AudioFormat } from './schemas'
import { DEFAULT_VOICE_CONFIG } from './constants'
import { OpenAIStream } from 'ai'

/**
 * Converts a ReadableStream to ArrayBuffer
 */
export async function streamToBuffer(stream: ReadableStream): Promise<ArrayBuffer> {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  return Buffer.concat(chunks)
}

/**
 * Creates an HTMLAudioElement from an ArrayBuffer
 */
export function createAudioElement(buffer: ArrayBuffer, format: AudioFormat): HTMLAudioElement {
  const blob = new Blob([buffer], { type: `audio/${format}` })
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)

  // Clean up the object URL when the audio is loaded
  audio.addEventListener('canplaythrough', () => {
    URL.revokeObjectURL(url)
  }, { once: true })

  return audio
}

/**
 * Estimates audio duration based on text length and speech rate
 */
export function estimateAudioDuration(text: string, speed: number = DEFAULT_VOICE_CONFIG.speed): number {
  // Average speaking rate is about 150 words per minute
  const wordsPerMinute = 150 * speed
  const wordCount = text.split(/\s+/).length
  return (wordCount / wordsPerMinute) * 60
}

/**
 * Creates a MediaStream from an ArrayBuffer for real-time playback
 */
export async function createAudioStream(buffer: ArrayBuffer, format: AudioFormat): Promise<MediaStream> {
  const audioContext = new AudioContext()
  const audioBuffer = await audioContext.decodeAudioData(buffer)
  const source = audioContext.createBufferSource()
  const destination = audioContext.createMediaStreamDestination()

  source.buffer = audioBuffer
  source.connect(destination)
  source.start()

  return destination.stream
}

/**
 * Validates audio format compatibility
 */
export function validateAudioFormat(format: AudioFormat): boolean {
  const supportedFormats = ['mp3', 'opus', 'aac', 'flac']
  return supportedFormats.includes(format)
}

/**
 * Handles audio playback with progress tracking
 */
export function createAudioPlayer(audio: HTMLAudioElement): {
  play: () => Promise<void>
  pause: () => void
  stop: () => void
  seek: (time: number) => void
  onProgress: (callback: (progress: number) => void) => void
  onComplete: (callback: () => void) => void
} {
  let progressCallback: ((progress: number) => void) | null = null
  let completeCallback: (() => void) | null = null

  audio.addEventListener('timeupdate', () => {
    if (progressCallback) {
      progressCallback(audio.currentTime / audio.duration)
    }
  })

  audio.addEventListener('ended', () => {
    if (completeCallback) {
      completeCallback()
    }
  })

  return {
    play: () => audio.play(),
    pause: () => audio.pause(),
    stop: () => {
      audio.pause()
      audio.currentTime = 0
    },
    seek: (time: number) => {
      audio.currentTime = time
    },
    onProgress: (callback) => {
      progressCallback = callback
    },
    onComplete: (callback) => {
      completeCallback = callback
    }
  }
}

interface VoiceoverResult {
  audio: ArrayBuffer
  format: AudioFormat
  duration: number
}

/**
 * Generates voiceover audio using either OpenAI or ElevenLabs
 */
export async function generateVoiceoverBuffer(options: VoiceoverOptions): Promise<VoiceoverResult> {
  const {
    content,
    provider = DEFAULT_VOICE_CONFIG.provider,
    voice = DEFAULT_VOICE_CONFIG.voice,
    model = DEFAULT_VOICE_CONFIG.model,
    format = DEFAULT_VOICE_CONFIG.format,
    speed = DEFAULT_VOICE_CONFIG.speed,
  } = options

  if (!content || content.trim().length === 0) {
    throw new Error('Content is required')
  }

  if (!validateAudioFormat(format)) {
    throw new Error(`Unsupported audio format: ${format}`)
  }

  let audioBuffer: ArrayBuffer

  if (provider === 'openai') {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        input: content,
        voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
        response_format: format,
        speed,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const stream = OpenAIStream(response)
    audioBuffer = await streamToBuffer(stream)
  } else if (provider === 'elevenlabs') {
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voice, {
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
    })

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`)
    }

    audioBuffer = await response.arrayBuffer()
  } else {
    throw new Error(`Unsupported provider: ${provider}`)
  }

  return {
    audio: audioBuffer,
    format,
    duration: estimateAudioDuration(content, speed),
  }
}
