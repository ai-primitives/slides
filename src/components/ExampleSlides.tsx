import { MDXProvider } from '@mdx-js/react'
import { components } from './mdx-components'
import Example from '../slides/example.mdx?raw'
import { useState, useEffect } from 'react'
import { evaluate } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'

export function ExampleSlides() {
  const [Content, setContent] = useState<React.ComponentType | null>(null)

  useEffect(() => {
    async function loadMDX() {
      try {
        const { default: MDXContent } = await evaluate(Example, {
          ...runtime,
          baseUrl: import.meta.url,
          development: import.meta.env.DEV
        })
        setContent(() => MDXContent)
      } catch (error) {
        console.error('Error loading MDX:', error)
      }
    }
    loadMDX()
  }, [Example])

  if (!Content) {
    return <div>Loading...</div>
  }

  return (
    <div className="w-full h-screen p-4">
      <MDXProvider components={components}>
        <Content />
      </MDXProvider>
    </div>
  )
}
