import { VoiceoverOptions, AudioFormat } from './schemas'
import { DEFAULT_VOICE_CONFIG } from './constants'
import { createAudioService } from './services/audio'

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

export function createAudioElement(buffer: ArrayBuffer, format: AudioFormat): HTMLAudioElement {
  const blob = new Blob([buffer], { type: `audio/${format}` })
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)

  audio.addEventListener('canplaythrough', () => {
    URL.revokeObjectURL(url)
  }, { once: true })

  return audio
}

export function estimateAudioDuration(text: string, speed: number = DEFAULT_VOICE_CONFIG.speed): number {
  const wordsPerMinute = 150 * speed
  const wordCount = text.split(/\s+/).length
  return (wordCount / wordsPerMinute) * 60
}

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

export function validateAudioFormat(format: AudioFormat): boolean {
  const supportedFormats = ['mp3', 'opus', 'aac', 'flac']
  return supportedFormats.includes(format)
}

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

export async function generateVoiceoverBuffer(options: VoiceoverOptions): Promise<VoiceoverResult> {
  const {
    content,
    provider = DEFAULT_VOICE_CONFIG.provider,
    format = DEFAULT_VOICE_CONFIG.format,
  } = options

  if (!content || content.trim().length === 0) {
    throw new Error('Content is required')
  }

  if (!validateAudioFormat(format)) {
    throw new Error(`Unsupported audio format: ${format}`)
  }

  const service = createAudioService(provider)
  return service.generateAudio(options)
}
