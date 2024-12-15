import React, { useEffect, useState } from 'react'
import { MDXProvider } from './MDXProvider'
import exampleContent from '../slides/example.mdx?raw'

export function ExampleSlides() {
  const [mdxContent, setMdxContent] = useState('')

  useEffect(() => {
    setMdxContent(exampleContent)
  }, [])

  return (
    <div className="w-full h-screen p-4">
      <MDXProvider content={mdxContent} />
    </div>
  )
}
