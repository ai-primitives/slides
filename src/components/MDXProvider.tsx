import { ReactNode, useState, useEffect } from 'react'
import { MDXProvider as BaseMDXProvider, useMDXComponents } from '@mdx-js/react'
import { components } from './mdx-components'
import { compile, run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'

interface MDXProviderProps {
  children?: ReactNode
  content?: string
}

export function MDXProvider({ children, content }: MDXProviderProps) {
  const [compiledContent, setCompiledContent] = useState<ReactNode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const mdxComponents = useMDXComponents(components)

  useEffect(() => {
    if (content) {
      compile(content)
        .then((compiled) => run(compiled, { ...runtime, useMDXComponents }))
        .then(({ default: Content }) => {
          setCompiledContent(<Content components={mdxComponents} />)
          setError(null)
        })
        .catch((err) => {
          console.error('Error compiling MDX:', err)
          setError('Failed to compile MDX content')
        })
    }
  }, [content, mdxComponents])

  if (error) {
    return <div className="p-4 text-red-500 bg-red-50 rounded">{error}</div>
  }

  return (
    <BaseMDXProvider components={components}>
      {content ? compiledContent : children}
    </BaseMDXProvider>
  )
}
