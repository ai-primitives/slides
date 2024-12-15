import { describe, it, expect, vi } from 'vitest'
import { voiceService } from '../../lib/audio'
import handler from '../voiceover'

// Mock dependencies
vi.mock('../../lib/audio', () => ({
  voiceService: {
    generateSpeech: vi.fn()
  }
}))

describe('Voiceover API Handler', () => {
  it('should return 405 for non-POST requests', async () => {
    const request = new Request('http://localhost/api/voiceover', {
      method: 'GET'
    })
    const response = await handler(request)
    expect(response.status).toBe(405)
  })

  it('should return 400 if text is missing', async () => {
    const request = new Request('http://localhost/api/voiceover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    const response = await handler(request)
    expect(response.status).toBe(400)
  })

  it('should generate audio successfully', async () => {
    const mockAudioBuffer = new ArrayBuffer(8)
    ;(voiceService.generateSpeech as any).mockResolvedValue(mockAudioBuffer)

    const request = new Request('http://localhost/api/voiceover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Hello world',
        provider: 'openai',
        voice: 'default'
      })
    })

    const response = await handler(request)
    const audioBuffer = await response.arrayBuffer()

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('audio/mpeg')
    expect(audioBuffer).toEqual(mockAudioBuffer)
  })
})
