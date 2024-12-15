import { useState } from 'react'
import { useCompletion } from 'ai/react'

interface AISlideGeneratorProps {
  onSlidesGenerated?: (content: string) => void
}

export function AISlideGenerator({ onSlidesGenerated }: AISlideGeneratorProps) {
  const [topic, setTopic] = useState('')
  const [style, setStyle] = useState('professional')
  const [error, setError] = useState<string | null>(null)

  const { complete, completion, isLoading } = useCompletion({
    api: '/api/generate',
    onResponse: (response) => {
      if (!response.ok) {
        setError('Failed to generate slides. Please try again.')
      }
    },
    onFinish: (result) => {
      onSlidesGenerated?.(result)
    },
    onError: (error) => {
      console.error('Error generating slides:', error)
      setError('An error occurred while generating slides.')
    }
  })

  const generateSlides = async () => {
    try {
      setError(null)
      await complete(`Create a slide deck about ${topic} in a ${style} style.`)
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to generate slides. Please try again.')
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
        disabled={isLoading || !topic}
        className="w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {isLoading ? 'Generating...' : 'Generate Slides'}
      </button>

      {error && (
        <div className="p-2 text-red-500 bg-red-50 rounded">
          {error}
        </div>
      )}

      {completion && !error && (
        <div className="p-2 text-green-500 bg-green-50 rounded">
          Slides generated successfully!
        </div>
      )}
    </div>
  )
}
