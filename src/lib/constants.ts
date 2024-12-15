// Voice options for different providers
export const OPENAI_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const
export const OPENAI_MODELS = ['tts-1', 'tts-1-hd'] as const

// Audio format options
export const AUDIO_FORMATS = {
  openai: ['mp3', 'opus', 'aac', 'flac'],
  elevenlabs: ['mp3_44100_128', 'mp3_44100_192', 'pcm_16000', 'pcm_44100']
} as const

// Default configuration
export const DEFAULT_VOICE_CONFIG = {
  provider: 'openai',
  model: 'tts-1',
  voice: 'alloy',
  format: 'mp3',
  speed: 1.0
} as const
