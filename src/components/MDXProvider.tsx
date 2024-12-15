import { ReactNode, useState, useEffect } from 'react'
import { MDXProvider as BaseMDXProvider } from '@mdx-js/react'
import { components } from './mdx-components'
import * as runtime from 'react/jsx-runtime'
import { compile } from '@mdx-js/mdx'

interface MDXProviderProps {
  children?: ReactNode
  content?: string
}

export function MDXProvider({ children, content }: MDXProviderProps) {
  const [compiledContent, setCompiledContent] = useState<ReactNode | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (content) {
      compile(content, {
        outputFormat: 'function-body',
        pragma: 'React.createElement',
        pragmaFrag: 'React.Fragment',
        jsxImportSource: '@mdx-js/react',
        development: true,
      })
        .then((compiled) => {
          // @ts-ignore - Runtime type mismatch is expected
          const { default: MDXContent } = new Function('runtime', `${compiled}`)(runtime)
          setCompiledContent(<MDXContent components={components} />)
          setError(null)
        })
        .catch((err) => {
          console.error('Error compiling MDX:', err)
          setError('Failed to compile MDX content')
        })
    }
  }, [content])

  if (error) {
    return <div className="p-4 text-red-500 bg-red-50 rounded">{error}</div>
  }

  return (
    <BaseMDXProvider components={components}>
      {content ? compiledContent : children}
    </BaseMDXProvider>
  )
}
