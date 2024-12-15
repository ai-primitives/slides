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

export interface GenerateVoiceoverOptions {
  content: string
  voice?: string
}
