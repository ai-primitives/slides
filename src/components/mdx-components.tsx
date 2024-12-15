import type { ComponentPropsWithoutRef } from 'react'
import { Slide } from './Slide'
import { CodeBlock } from './CodeBlock'

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
} as const

export type { CustomComponents }
