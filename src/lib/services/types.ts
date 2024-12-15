import { VoiceoverOptions, AudioFormat } from '../schemas'

export interface AudioServiceResult {
  audio: ArrayBuffer
  format: AudioFormat
  duration: number
}

export interface AudioStreamController {
  start: () => Promise<void>
  pause: () => void
  resume: () => void
  stop: () => void
  onData: (callback: (chunk: Uint8Array) => void) => void
  onComplete: (callback: () => void) => void
  onError: (callback: (error: Error) => void) => void
}

export interface AudioService {
  generateAudio(options: VoiceoverOptions): Promise<AudioServiceResult>
  createStream(options: VoiceoverOptions): Promise<AudioStreamController>
}

export interface AudioServiceOptions {
  apiKey?: string
}
