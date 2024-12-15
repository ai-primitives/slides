import { z } from 'zod'

// Define schemas for slide content
export const SlideSchema = z.object({
  title: z.string(),
  content: z.string(),
  layout: z.enum(['default', 'center', 'split']).default('default'),
  notes: z.string().optional(),
  codeBlocks: z.array(z.object({
    language: z.string(),
    code: z.string(),
  })).optional(),
})

export const SlideDeckSchema = z.object({
  title: z.string(),
  description: z.string(),
  slides: z.array(SlideSchema),
})

export type Slide = z.infer<typeof SlideSchema>
export type SlideDeck = z.infer<typeof SlideDeckSchema>

export interface GenerateSlideOptions {
  topic: string
  style?: string
  currentContent?: string
}

// Voice provider and format options
export const VoiceProviderSchema = z.enum(['openai', 'elevenlabs'])
export const AudioFormatSchema = z.enum(['mp3', 'opus', 'aac', 'flac'])

export const VoiceoverOptionsSchema = z.object({
  content: z.string(),
  voice: z.string().optional().default('alloy'), // OpenAI default voice
  provider: VoiceProviderSchema.optional().default('openai'),
  model: z.string().optional().default('tts-1'),
  format: AudioFormatSchema.optional().default('mp3'),
  speed: z.number().optional().default(1.0),
  apiKey: z.string().optional() // Optional API key for service instantiation
})

export type VoiceProvider = z.infer<typeof VoiceProviderSchema>
export type AudioFormat = z.infer<typeof AudioFormatSchema>
export type VoiceoverOptions = z.infer<typeof VoiceoverOptionsSchema>

export interface VoiceoverResponse {
  audio: ArrayBuffer
  format: AudioFormat
  duration: number
}
