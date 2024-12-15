import { describe, it, expect, vi } from 'vitest'
import { createOpenAIStream, createElevenLabsStream } from '../lib/services/streaming'
import { VoiceoverOptions } from '../lib/schemas'

describe('Audio Streaming', () => {
  it('should stream audio from OpenAI', async () => {
    const options: VoiceoverOptions = {
      content: 'Hello, this is a streaming test.',
      provider: 'openai',
      voice: 'alloy',
      model: 'tts-1',
      format: 'mp3',
      speed: 1.0,
    }

    const onData = vi.fn()
    const onComplete = vi.fn()
    const onError = vi.fn()

    const stream = await createOpenAIStream(options)
    stream.onData(onData)
    stream.onComplete(onComplete)
    stream.onError(onError)

    await stream.start()

    expect(onData).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  }, 10000)

  it('should stream audio from ElevenLabs', async () => {
    const options: VoiceoverOptions = {
      content: 'Hello, this is a streaming test.',
      provider: 'elevenlabs',
      voice: 'rachel',
      model: 'eleven_monolingual_v1',
      format: 'mp3',
      speed: 1.0,
    }

    const onData = vi.fn()
    const onComplete = vi.fn()
    const onError = vi.fn()

    const stream = await createElevenLabsStream(options)
    stream.onData(onData)
    stream.onComplete(onComplete)
    stream.onError(onError)

    await stream.start()

    expect(onData).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  }, 10000)

  it('should handle streaming errors gracefully', async () => {
    const options: VoiceoverOptions = {
      content: 'Test content',
      provider: 'openai',
      voice: 'alloy',
      model: 'invalid-model',
      format: 'mp3',
      speed: 1.0,
    }

    const onData = vi.fn()
    const onComplete = vi.fn()
    const onError = vi.fn()

    const stream = await createOpenAIStream(options)
    stream.onData(onData)
    stream.onComplete(onComplete)
    stream.onError(onError)

    await stream.start()

    expect(onError).toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('should stop streaming when requested', async () => {
    const options: VoiceoverOptions = {
      content: 'This stream will be stopped.',
      provider: 'openai',
      voice: 'alloy',
      model: 'tts-1',
      format: 'mp3',
      speed: 1.0,
    }

    const onData = vi.fn()
    const onComplete = vi.fn()
    const onError = vi.fn()

    const stream = await createOpenAIStream(options)
    stream.onData(onData)
    stream.onComplete(onComplete)
    stream.onError(onError)

    // Start streaming in the background
    const streamPromise = stream.start()

    // Stop after a short delay
    setTimeout(() => {
      stream.stop()
    }, 100)

    await streamPromise

    expect(onError).toHaveBeenCalledWith(expect.any(Error))
    expect(onComplete).not.toHaveBeenCalled()
  })
})
