import React from 'react'
import { MDXProvider } from '@mdx-js/react'
import { components } from './mdx-components'
import ExampleContent from '../slides/example.mdx'

export function ExampleSlides() {
  return (
    <div className="w-full h-screen p-4">
      <MDXProvider components={components}>
        <ExampleContent />
      </MDXProvider>
    </div>
  )
}
