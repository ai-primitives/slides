import type { Slide, SlideDeck } from './schemas'

// Additional types for the AI components
export interface AISlideGeneratorProps {
  topic: string
  style?: string
  numSlides?: number
  onSlideGenerated?: (slide: Slide) => void
  onComplete?: (slides: SlideDeck) => void
  onError?: (error: Error) => void
}

export interface AIVoiceoverProps {
  slideContent: string
  voice?: string
  onVoiceoverGenerated?: (voiceover: { script: string; timing: number }) => void
  onError?: (error: Error) => void
}
