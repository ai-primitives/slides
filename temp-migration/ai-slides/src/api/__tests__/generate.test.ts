import { describe, it, expect, vi } from 'vitest'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { validateMDXContent } from '../../lib/ai'
import handler from '../generate'

// Mock dependencies
vi.mock('ai', () => ({
  generateText: vi.fn()
}))

vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn()
}))

vi.mock('../../lib/ai', () => ({
  validateMDXContent: vi.fn()
}))

describe('Generate API Handler', () => {
  it('should return 405 for non-POST requests', async () => {
    const request = new Request('http://localhost/api/generate', {
      method: 'GET'
    })
    const response = await handler(request)
    expect(response.status).toBe(405)
  })

  it('should return 400 if prompt is missing', async () => {
    const request = new Request('http://localhost/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    const response = await handler(request)
    expect(response.status).toBe(400)
  })

  it('should generate content successfully', async () => {
    const mockText = '# Sample MDX\n\nContent'
    ;(generateText as any).mockResolvedValue({ text: mockText })
    ;(validateMDXContent as any).mockReturnValue(true)
    ;(openai as any).mockReturnValue('gpt-4')

    const request = new Request('http://localhost/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Create a presentation' })
    })

    const response = await handler(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ content: mockText })
  })
})
