import { describe, it, expect } from 'vitest'
import { generateVoiceoverBuffer } from '../lib/audio'
import { VoiceoverOptions } from '../lib/schemas'
import { createAudioService, OpenAIAudioService, ElevenLabsAudioService } from '../lib/services/audio'

describe('Audio Services', () => {
  it('should create appropriate service based on provider', () => {
    const openaiService = createAudioService('openai')
    const elevenLabsService = createAudioService('elevenlabs')

    expect(openaiService).toBeInstanceOf(OpenAIAudioService)
    expect(elevenLabsService).toBeInstanceOf(ElevenLabsAudioService)
  })

  it('should generate audio with OpenAI TTS', async () => {
    const options: VoiceoverOptions = {
      content: 'Hello, this is a test of the OpenAI text-to-speech system.',
      provider: 'openai',
      voice: 'alloy',
      model: 'tts-1',
      format: 'mp3',
      speed: 1.0
    }

    const result = await generateVoiceoverBuffer(options)
    expect(result.audio).toBeDefined()
    expect(result.audio.byteLength).toBeGreaterThan(0)
    expect(result.format).toBe('mp3')
    expect(result.duration).toBeGreaterThan(0)
  }, 10000)

  it('should generate audio with ElevenLabs', async () => {
    const options: VoiceoverOptions = {
      content: 'Hello, this is a test of the ElevenLabs text-to-speech system.',
      provider: 'elevenlabs',
      voice: 'rachel',
      model: 'eleven_monolingual_v1',
      format: 'mp3',
      speed: 1.0
    }

    const result = await generateVoiceoverBuffer(options)
    expect(result.audio).toBeDefined()
    expect(result.audio.byteLength).toBeGreaterThan(0)
    expect(result.format).toBe('mp3')
    expect(result.duration).toBeGreaterThan(0)
  }, 10000)

  it('should handle errors gracefully', async () => {
    const options: VoiceoverOptions = {
      content: '', // Empty content should cause an error
      provider: 'openai',
      voice: 'alloy',
      model: 'tts-1',
      format: 'mp3',
      speed: 1.0
    }

    await expect(generateVoiceoverBuffer(options)).rejects.toThrow('Content is required')
  })

  it('should handle API errors gracefully', async () => {
    const service = new OpenAIAudioService({ apiKey: 'invalid_key' })
    const options: VoiceoverOptions = {
      content: 'Test content',
      provider: 'openai',
      voice: 'alloy',
      model: 'tts-1',
      format: 'mp3',
      speed: 1.0
    }

    await expect(service.generateAudio(options)).rejects.toThrow('OPENAI API error')
  })
})
