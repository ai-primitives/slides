import { useState, useEffect, useRef } from 'react'
import { VoiceoverOptions } from '../lib/schemas'
import { createAudioPlayer } from '../lib/audio'
import { DEFAULT_VOICE_CONFIG } from '../lib/constants'

interface VoiceoverPlayerProps extends Partial<VoiceoverOptions> {
  content: string
  onPlay?: () => void
  onPause?: () => void
  onComplete?: () => void
  onError?: (error: Error) => void
  streaming?: boolean
  className?: string
}

export function VoiceoverPlayer({
  content,
  voice = DEFAULT_VOICE_CONFIG.voice,
  provider = DEFAULT_VOICE_CONFIG.provider,
  model = DEFAULT_VOICE_CONFIG.model,
  format = DEFAULT_VOICE_CONFIG.format,
  speed = DEFAULT_VOICE_CONFIG.speed,
  streaming = true,
  onPlay,
  onPause,
  onComplete,
  onError,
  className = '',
}: VoiceoverPlayerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null)

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.stop()
      }
      if (audioRef.current) {
        audioRef.current.src = ''
      }
    }
  }, [])

  async function generateAndPlay() {
    try {
      setIsLoading(true)
      setError(null)

      const endpoint = streaming ? '/api/voiceover' : '/api/voiceover/buffer'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          voice,
          provider,
          model,
          format,
          speed,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate audio')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      if (audioRef.current) {
        audioRef.current.src = url
        playerRef.current = createAudioPlayer(audioRef.current)

        playerRef.current.onProgress((p) => {
          setProgress(p * 100)
        })

        playerRef.current.onComplete(() => {
          onComplete?.()
          setProgress(0)
        })

        await playerRef.current.play()
        onPlay?.()
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred')
      setError(error.message)
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }

  function handlePause() {
    if (playerRef.current) {
      playerRef.current.pause()
      onPause?.()
    }
  }

  function handleResume() {
    if (playerRef.current) {
      playerRef.current.play()
      onPlay?.()
    }
  }

  function handleStop() {
    if (playerRef.current) {
      playerRef.current.stop()
      setProgress(0)
      onPause?.()
    }
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <button
          onClick={generateAndPlay}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Generate & Play'}
        </button>
        {audioRef.current && (
          <>
            <button
              onClick={handlePause}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Pause
            </button>
            <button
              onClick={handleResume}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Resume
            </button>
            <button
              onClick={handleStop}
              className="px-4 py-2 bg-red-500 text-white rounded hover:red-600"
            >
              Stop
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {progress > 0 && (
        <div className="w-full bg-gray-200 rounded h-2">
          <div
            className="bg-blue-500 rounded h-2 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <audio ref={audioRef} className="hidden" />
    </div>
  )
}
