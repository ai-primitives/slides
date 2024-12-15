import React, { useState } from 'react'
import { GenerateSlideOptions, GenerateVoiceoverOptions } from '../lib/ai'

interface AISlideGeneratorProps {
  onSlidesGenerated?: (content: string) => void
  onVoiceoverGenerated?: (content: string) => void
}

export function AISlideGenerator({ onSlidesGenerated, onVoiceoverGenerated }: AISlideGeneratorProps) {
  const [topic, setTopic] = useState('')
  const [style, setStyle] = useState('professional')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateSlides = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, style }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate slides')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let content = ''

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        content += decoder.decode(value)
        onSlidesGenerated?.(content)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <label htmlFor="topic" className="block text-sm font-medium">
          Topic
        </label>
        <input
          id="topic"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter slide deck topic"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="style" className="block text-sm font-medium">
          Style
        </label>
        <select
          id="style"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="professional">Professional</option>
          <option value="casual">Casual</option>
          <option value="technical">Technical</option>
          <option value="educational">Educational</option>
        </select>
      </div>

      <button
        onClick={generateSlides}
        disabled={loading || !topic}
        className="w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate Slides'}
      </button>

      {error && (
        <div className="p-2 text-red-500 bg-red-50 rounded">
          {error}
        </div>
      )}
    </div>
  )
}
