import { vi } from 'vitest'
import type { UseCompletionHelpers } from '@ai-sdk/react'
import type { JSONValue } from '@ai-sdk/ui-utils'

// Create a base mock state that matches the actual useCompletion return type
export const mockUseCompletionState: UseCompletionHelpers = {
  completion: '',
  complete: vi.fn().mockResolvedValue(''),
  error: undefined,
  isLoading: false,
  stop: vi.fn(),
  setCompletion: vi.fn(),
  input: '',
  setInput: vi.fn(),
  handleSubmit: vi.fn(),
  handleInputChange: vi.fn(),
  data: undefined
}

export const createMockState = (overrides: Partial<UseCompletionHelpers> = {}): UseCompletionHelpers => ({
  ...mockUseCompletionState,
  ...overrides
})

export const mockUseCompletion = () => {
  vi.mock('ai/react', () => ({
    useCompletion: vi.fn().mockImplementation(() => {
      const mockComplete = vi.fn().mockImplementation(async (prompt: string) => {
        return ''
      })

      return createMockState({ complete: mockComplete })
    })
  }))
}
