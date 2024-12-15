import React, { useState } from 'react'
import { MDXProvider } from './MDXProvider'
import { AISlideGenerator } from './AISlideGenerator'

export function AIPreview() {
  const [mdxContent, setMdxContent] = useState('')

  const handleSlidesGenerated = (content: string) => {
    setMdxContent(content)
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/3 border-r">
        <AISlideGenerator onSlidesGenerated={handleSlidesGenerated} />
      </div>
      <div className="w-2/3 p-4">
        <MDXProvider content={mdxContent} />
      </div>
    </div>
  )
}
