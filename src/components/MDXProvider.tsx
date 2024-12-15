import { ReactNode } from 'react'
import { MDXProvider as BaseMDXProvider } from '@mdx-js/react'
import { components } from './mdx-components'

interface MDXProviderProps {
  children?: ReactNode
}

export function MDXProvider({ children }: MDXProviderProps) {
  return (
    <BaseMDXProvider components={components}>
      {children}
    </BaseMDXProvider>
  )
}
