import { describe, it, expect, vi, type Mock } from 'vitest'
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
      tier: 'free'
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
      voice: 'adam',
      model: 'eleven_monolingual_v1',
      format: 'mp3',
      speed: 1.0,
      tier: 'free'
    }

    const onData = vi.fn()
    const onComplete = vi.fn()
    const onError = vi.fn()

    const stream = await createElevenLabsStream(options)
    stream.onData(onData)
    stream.onComplete(onComplete)
    stream.onError(onError)

    await stream.start()

    // Wait for streaming to complete
    await new Promise(resolve => setTimeout(resolve, 1000))

    expect(onData).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  }, 15000)

  it('should handle streaming errors gracefully', async () => {
    // Test missing ElevenLabs API key
    const elevenLabsOptions: VoiceoverOptions = {
      content: 'Test content',
      provider: 'elevenlabs',
      voice: 'invalid-voice-id',
      model: 'eleven_monolingual_v1',
      format: 'mp3',
      speed: 1.0,
      tier: 'free'
    }

    const onData = vi.fn()
    const onComplete = vi.fn()
    const onError = vi.fn()

    const stream = await createElevenLabsStream(elevenLabsOptions)
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
      tier: 'free'
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

  it('should enforce rate limits for ElevenLabs free tier', async () => {
    const options: VoiceoverOptions = {
      content: 'Test rate limiting.',
      provider: 'elevenlabs',
      voice: 'adam',
      model: 'eleven_monolingual_v1',
      format: 'mp3',
      speed: 1.0,
      tier: 'free'
    }

    // Create streams for free tier (limit: 2)
    const streams = await Promise.all([
      createElevenLabsStream({ ...options }),
      createElevenLabsStream({ ...options }),
      createElevenLabsStream({ ...options }), // Should fail due to rate limit
    ].map(p => p.catch(e => e))) // Catch promises to prevent rejection

    const results = await Promise.allSettled(
      streams.map(async (streamOrError) => {
        if (streamOrError instanceof Error) {
          return { onData: vi.fn(), onComplete: vi.fn(), onError: vi.fn().mockImplementation(() => streamOrError) }
        }

        const onData = vi.fn()
        const onComplete = vi.fn()
        const onError = vi.fn()

        streamOrError.onData(onData)
        streamOrError.onComplete(onComplete)
        streamOrError.onError(onError)

        try {
          await streamOrError.start()
        } catch (error) {
          onError(error)
        }

        return { onData, onComplete, onError }
      })
    )

    // Verify rate limiting
    const successfulRequests = results.filter(
      (result): result is PromiseFulfilledResult<{ onData: Mock; onComplete: Mock; onError: Mock }> =>
        result.status === 'fulfilled' && result.value.onData.mock.calls.length > 0
    )
    const failedRequests = results.filter(
      (result): result is PromiseFulfilledResult<{ onData: Mock; onComplete: Mock; onError: Mock }> =>
        result.status === 'fulfilled' && result.value.onError.mock.calls.length > 0
    )

    expect(successfulRequests.length).toBe(2) // Free tier limit
    expect(failedRequests.length).toBe(1) // One request should fail
    expect(failedRequests[0].value.onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Rate limit exceeded for elevenlabs free tier')
      })
    )
  }, 30000)

  it('should handle concurrent streaming requests', async () => {
    const options: VoiceoverOptions = {
      content: 'Test concurrent streaming.',
      provider: 'elevenlabs',
      voice: 'adam',
      model: 'eleven_monolingual_v1',
      format: 'mp3',
      speed: 1.0,
      tier: 'pro' // Using pro tier for concurrent requests test
    }

    // Create multiple streams
    const streams = await Promise.all([
      createElevenLabsStream(options),
      createElevenLabsStream(options),
      createElevenLabsStream(options),
    ])

    const results = await Promise.allSettled(
      streams.map(async (stream) => {
        const onData = vi.fn()
        const onComplete = vi.fn()
        const onError = vi.fn()

        stream.onData(onData)
        stream.onComplete(onComplete)
        stream.onError(onError)

        await stream.start()
        return { onData, onComplete, onError }
      })
    )

    // At least one stream should succeed, others may fail due to rate limiting
    const successfulStreams = results.filter(
      (result) => result.status === 'fulfilled' && result.value.onData.mock.calls.length > 0
    )
    expect(successfulStreams.length).toBeGreaterThan(0)
  }, 30000)

  it('should handle rate limits for different tiers', async () => {
    const tiers = ['free', 'starter', 'creator', 'pro'] as const

    for (const tier of tiers) {
      const options: VoiceoverOptions = {
        content: 'Test rate limiting for different tiers.',
        provider: 'elevenlabs',
        voice: 'adam',
        model: 'eleven_monolingual_v1',
        format: 'mp3',
        speed: 1.0,
        tier
      }

      const limit = tier === 'free' ? 2 :
                   tier === 'starter' ? 3 :
                   tier === 'creator' ? 5 :
                   tier === 'pro' ? 10 : 15

      // Create streams up to limit + 1
      const streams = await Promise.all(
        Array(limit + 1).fill(null).map(() =>
          createElevenLabsStream({ ...options }).catch(e => e)
        )
      )

      const results = await Promise.allSettled(
        streams.map(async (streamOrError) => {
          if (streamOrError instanceof Error) {
            return { onData: vi.fn(), onComplete: vi.fn(), onError: vi.fn().mockImplementation(() => streamOrError) }
          }

          const onData = vi.fn()
          const onComplete = vi.fn()
          const onError = vi.fn()

          streamOrError.onData(onData)
          streamOrError.onComplete(onComplete)
          streamOrError.onError(onError)

          try {
            await streamOrError.start()
          } catch (error) {
            onError(error)
          }

          return { onData, onComplete, onError }
        })
      )

      // Verify rate limiting for current tier
      const successfulRequests = results.filter(
        (result): result is PromiseFulfilledResult<{ onData: Mock; onComplete: Mock; onError: Mock }> =>
          result.status === 'fulfilled' && result.value.onData.mock.calls.length > 0
      )
      const failedRequests = results.filter(
        (result): result is PromiseFulfilledResult<{ onData: Mock; onComplete: Mock; onError: Mock }> =>
          result.status === 'fulfilled' && result.value.onError.mock.calls.length > 0
      )

      expect(successfulRequests.length).toBe(limit)
      expect(failedRequests.length).toBe(1)
      expect(failedRequests[0].value.onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining(`Rate limit exceeded for elevenlabs ${tier} tier`)
        })
      )
    }
  }, 120000)
})
