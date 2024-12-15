import React, { useEffect, useRef } from 'react'
import * as shiki from 'shiki'

interface CodeBlockProps {
  children: string
  language?: string
  className?: string
}

export function CodeBlock({ children, language = 'typescript', className = '' }: CodeBlockProps) {
  const codeRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    async function highlightCode() {
      const highlighter = await shiki.getHighlighter({
        themes: ['github-dark'],
        langs: ['typescript', 'javascript', 'jsx', 'tsx', 'html', 'css']
      })

      if (codeRef.current) {
        const html = highlighter.codeToHtml(children, {
          theme: 'github-dark',
          lang: language as any
        })
        codeRef.current.innerHTML = html
      }
    }

    highlightCode()
  }, [children, language])

  return (
    <pre ref={codeRef} className={`rounded-lg p-4 overflow-x-auto ${className}`}>
      {children}
    </pre>
  )
}
