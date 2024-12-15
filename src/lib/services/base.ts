import { VoiceoverOptions } from '../schemas'
import { AudioService, AudioServiceResult, AudioStreamController, AudioServiceOptions } from '../services/types'

// Rate limiting configuration
const RATE_LIMITS = {
  elevenlabs: {
    free: 2,
    starter: 3,
    creator: 5,
    pro: 10,
    business: 15,
    enterprise: Infinity,
  },
  openai: {
    default: 3,
  },
}

export abstract class BaseAudioService implements AudioService {
  protected readonly apiKey: string
  protected readonly tier?: string
  private requestCount: number = 0
  private lastRequestTime: number = 0

  constructor(options?: AudioServiceOptions) {
    this.apiKey = options?.apiKey || ''
    this.tier = options?.tier || 'free'
  }

  public checkRateLimit(provider: 'openai' | 'elevenlabs'): void {
    const now = Date.now()
    const oneMinute = 60 * 1000

    // Reset counter if more than a minute has passed
    if (now - this.lastRequestTime > oneMinute) {
      this.requestCount = 0
      this.lastRequestTime = now
    }

    const limit = provider === 'openai'
      ? RATE_LIMITS.openai.default
      : RATE_LIMITS.elevenlabs[this.tier as keyof typeof RATE_LIMITS.elevenlabs] || RATE_LIMITS.elevenlabs.free

    if (this.requestCount >= limit) {
      throw new Error(`Rate limit exceeded for ${provider} ${this.tier} tier`)
    }

    this.requestCount++
  }

  abstract generateAudio(options: VoiceoverOptions): Promise<AudioServiceResult>
  abstract createStream(options: VoiceoverOptions): Promise<AudioStreamController>
}
