import React from 'react'
import { AIPreview } from '../AIPreview'
import { createMockState } from '../../test/mocks'
import { useCompletion } from 'ai/react'
import { vi } from 'vitest'

// Mock useCompletion for fixtures
vi.mock('ai/react', () => ({
  useCompletion: vi.fn()
}))

// Create fixtures for different component states
const fixtures = {
  default: () => {
    vi.mocked(useCompletion).mockImplementation(() => createMockState())
    return <AIPreview />
  },

  'with loading state': () => {
    vi.mocked(useCompletion).mockImplementation(() => createMockState({ isLoading: true }))
    return <AIPreview />
  },

  'with generated content': () => {
    vi.mocked(useCompletion).mockImplementation(() =>
      createMockState({ completion: '# Generated Slide\n\nThis is a test slide content.' })
    )
    return <AIPreview />
  },

  'with error state': () => {
    vi.mocked(useCompletion).mockImplementation(() =>
      createMockState({
        error: new Error('Failed to generate slides'),
        isLoading: false
      })
    )
    return <AIPreview />
  }
}

export default fixtures
