import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ThemeProvider } from 'styled-components'
import { AIPreview } from '../AIPreview'
import { defaultTheme } from '../../test/theme'
import { useCompletion } from '@ai-sdk/react'
import { createMockState } from '../../test/mocks'
import { StyleSheetManager } from '../../test/setup'

const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <StyleSheetManager>
      <ThemeProvider theme={defaultTheme}>
        {ui}
      </ThemeProvider>
    </StyleSheetManager>
  )
}

describe('AIPreview Component', () => {
  beforeEach(() => {
    vi.mocked(useCompletion).mockImplementation(() => createMockState())
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Core Functionality', () => {
    it('renders input field and generate button', () => {
      renderWithTheme(<AIPreview />)
      expect(screen.getByRole('textbox', { name: /slide topic or description/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /generate slides/i })).toBeInTheDocument()
    })

    it('handles prompt input changes', async () => {
      renderWithTheme(<AIPreview />)
      const input = screen.getByRole('textbox', { name: /slide topic or description/i })
      await userEvent.type(input, 'Test prompt')
      expect(input).toHaveValue('Test prompt')
    })

    it('disables generate button when prompt is empty', () => {
      renderWithTheme(<AIPreview />)
      const button = screen.getByRole('button', { name: /generate slides/i })
      expect(button).toBeDisabled()
      expect(button).toHaveStyle({ backgroundColor: '#ccc' })
    })

    it('enables generate button when prompt is not empty', async () => {
      renderWithTheme(<AIPreview />)
      const input = screen.getByRole('textbox', { name: /slide topic or description/i })
      const button = screen.getByRole('button', { name: /generate slides/i })

      await userEvent.type(input, 'Test prompt')
      expect(button).not.toBeDisabled()
      expect(button).toHaveStyle({ backgroundColor: '#0070f3' })
    })
  })

  describe('AI Integration', () => {
    it('calls complete with prompt when generate is clicked', async () => {
      const mockComplete = vi.fn().mockResolvedValue('')
      vi.mocked(useCompletion).mockImplementation(() =>
        createMockState({ complete: mockComplete })
      )

      renderWithTheme(<AIPreview />)
      const input = screen.getByRole('textbox', { name: /slide topic or description/i })
      const button = screen.getByRole('button', { name: /generate slides/i })

      await userEvent.type(input, 'Test prompt')
      await userEvent.click(button)

      expect(mockComplete).toHaveBeenCalledWith('Test prompt')
    })

    it('displays loading state during generation', async () => {
      vi.mocked(useCompletion).mockImplementation(() =>
        createMockState({ isLoading: true })
      )

      renderWithTheme(<AIPreview />)
      const button = screen.getByRole('button', { name: /Generating\.\.\./i })
      expect(button).toBeDisabled()
    })

    it('displays generated content when available', () => {
      const mockCompletion = 'Generated slide content'
      vi.mocked(useCompletion).mockImplementation(() =>
        createMockState({ completion: mockCompletion })
      )

      renderWithTheme(<AIPreview />)
      expect(screen.getByRole('heading', { name: /generated content/i })).toBeInTheDocument()
      expect(screen.getByText(mockCompletion)).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      const error = new Error('Failed to generate slides')
      vi.mocked(useCompletion).mockImplementation(() =>
        createMockState({ error })
      )

      renderWithTheme(<AIPreview />)
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to generate slides')
    })

    it('handles network errors', async () => {
      const error = new Error('Network error')
      vi.mocked(useCompletion).mockImplementation(() =>
        createMockState({ error })
      )

      renderWithTheme(<AIPreview />)
      expect(screen.getByRole('alert')).toHaveTextContent('Network error')
    })

    it('handles rate limit errors', async () => {
      const error = new Error('Rate limit exceeded')
      vi.mocked(useCompletion).mockImplementation(() =>
        createMockState({ error })
      )

      renderWithTheme(<AIPreview />)
      expect(screen.getByRole('alert')).toHaveTextContent('Rate limit exceeded')
    })
  })
})
