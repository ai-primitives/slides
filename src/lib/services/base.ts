import { VoiceoverOptions } from '../schemas'
import { AudioService, AudioServiceResult, AudioStreamController, AudioServiceOptions } from '../services/types'

export abstract class BaseAudioService implements AudioService {
  protected readonly apiKey: string

  constructor(options?: AudioServiceOptions) {
    this.apiKey = options?.apiKey || process.env.OPENAI_API_KEY || ''
  }

  abstract generateAudio(options: VoiceoverOptions): Promise<AudioServiceResult>
  abstract createStream(options: VoiceoverOptions): Promise<AudioStreamController>
}
