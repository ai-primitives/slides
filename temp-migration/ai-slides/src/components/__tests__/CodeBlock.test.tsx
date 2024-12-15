import React from 'react'
import { render, screen } from '@testing-library/react'
import { CodeBlock } from '../CodeBlock'

describe('CodeBlock', () => {
  const sampleCode = `
    const greeting = "Hello, World!"
    console.log(greeting)
  `

  it('renders code with syntax highlighting', () => {
    render(<CodeBlock code={sampleCode} />)
    const codeElement = screen.getByText(/Hello, World!/i)
    expect(codeElement).toBeInTheDocument()
    expect(codeElement.closest('code')).toHaveClass('language-typescript')
  })

  it('applies custom language class', () => {
    render(<CodeBlock code={sampleCode} language="javascript" />)
    const codeElement = screen.getByText(/Hello, World!/i)
    expect(codeElement.closest('code')).toHaveClass('language-javascript')
  })

  it('shows line numbers when enabled', () => {
    render(<CodeBlock code={sampleCode} showLineNumbers={true} />)
    const preElement = screen.getByText(/Hello, World!/i).closest('pre')
    expect(preElement).toHaveClass('line-numbers')
  })

  it('hides line numbers when disabled', () => {
    render(<CodeBlock code={sampleCode} showLineNumbers={false} />)
    const preElement = screen.getByText(/Hello, World!/i).closest('pre')
    expect(preElement).not.toHaveClass('line-numbers')
  })

  it('applies custom className', () => {
    render(<CodeBlock code={sampleCode} className="custom-class" />)
    const preElement = screen.getByText(/Hello, World!/i).closest('pre')
    expect(preElement).toHaveClass('custom-class')
  })
})
