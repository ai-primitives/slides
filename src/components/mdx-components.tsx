import type { ComponentPropsWithoutRef } from 'react'
import { useState } from 'react'
import { Slide } from './Slide'
import { CodeBlock } from './CodeBlock'
import { VoiceoverPlayer } from './VoiceoverPlayer'
import { VoiceoverControls } from './VoiceoverControls'
import { VoiceoverOptions } from '../lib/schemas'

type HTMLProps = {
  h1: ComponentPropsWithoutRef<'h1'>
  h2: ComponentPropsWithoutRef<'h2'>
  h3: ComponentPropsWithoutRef<'h3'>
  p: ComponentPropsWithoutRef<'p'>
  ul: ComponentPropsWithoutRef<'ul'>
  ol: ComponentPropsWithoutRef<'ol'>
}

type CustomComponents = {
  Slide: typeof Slide
  CodeBlock: typeof CodeBlock
  Voiceover: React.FC<{ content: string } & Partial<VoiceoverOptions>>
}

export const components = {
  h1: ({ children, ...props }: HTMLProps['h1']) => (
    <h1 className="text-4xl font-bold mb-4" {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }: HTMLProps['h2']) => (
    <h2 className="text-3xl font-semibold mb-3" {...props}>{children}</h2>
  ),
  h3: ({ children, ...props }: HTMLProps['h3']) => (
    <h3 className="text-2xl font-semibold mb-2" {...props}>{children}</h3>
  ),
  p: ({ children, ...props }: HTMLProps['p']) => (
    <p className="text-lg mb-4" {...props}>{children}</p>
  ),
  ul: ({ children, ...props }: HTMLProps['ul']) => (
    <ul className="list-disc list-inside mb-4" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }: HTMLProps['ol']) => (
    <ol className="list-decimal list-inside mb-4" {...props}>{children}</ol>
  ),
  Slide,
  CodeBlock,
  Voiceover: ({ content, ...props }: { content: string } & Partial<VoiceoverOptions>) => {
    const [voiceoverOptions, setVoiceoverOptions] = useState<Partial<VoiceoverOptions>>({})

    return (
      <div className="my-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
        <VoiceoverControls
          onChange={setVoiceoverOptions}
          className="mb-4"
        />
        <VoiceoverPlayer
          content={content}
          {...voiceoverOptions}
          {...props}
        />
      </div>
    )
  },
} as const

export type { CustomComponents }
