import './react-setup'
import '@testing-library/jest-dom'
import { expect, afterEach, beforeAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import type { UseCompletionHelpers } from '@ai-sdk/react'
import { StyleSheetManager } from './react-setup'

// Set up styled-components for Edge Runtime compatibility
beforeAll(() => {
  const styleElement = document.createElement('style')
  styleElement.setAttribute('data-styled', '')
  document.head.appendChild(styleElement)
})

// Configure test wrapper for styled-components
const StyledComponentsTestProvider = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(
    StyleSheetManager,
    { target: document.head },
    children
  )
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Mock @ai-sdk/react for Edge Runtime compatibility
vi.mock('@ai-sdk/react', () => ({
  useCompletion: vi.fn()
}))

expect.extend({
  // Add any custom matchers here if needed
})

export const mockUseCompletion = vi.fn() as unknown as () => UseCompletionHelpers

// Export configured wrapper for test utilities
export { StyledComponentsTestProvider as StyleSheetManager }
