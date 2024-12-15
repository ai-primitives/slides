import React from 'react'
import { MDXProvider } from './MDXProvider'
import exampleContent from '../slides/example.mdx?raw'

export function ExampleSlides() {
  return (
    <div className="w-full h-screen p-4">
      <MDXProvider content={exampleContent} />
    </div>
  )
}
