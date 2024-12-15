import React from 'react'
import { useChat } from 'ai/react'
import { z } from 'zod'
import { type GenerateSlideOptions } from '../lib/schemas'

// Validate slide generation response schema
const slideSchema = z.object({
  title: z.string(),
  content: z.string(),
})

interface AISlideGeneratorProps {
  initialTopic?: string
  onGenerated?: (content: string) => void
}

export function AISlideGenerator({ initialTopic = '', onGenerated }: AISlideGeneratorProps) {
  const [error, setError] = React.useState<string | null>(null)
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/generate',
    initialInput: initialTopic,
    onFinish: (message) => {
      try {
        const slideContent = slideSchema.parse(JSON.parse(message.content))
        onGenerated?.(slideContent.content)
      } catch (err) {
        console.error('Error parsing slide content:', err)
        setError('Failed to parse slide content')
      }
    },
    onError: (err) => {
      console.error('Error generating slides:', err)
      setError('Failed to generate slides. Please try again.')
    },
  })

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    handleSubmit(e)
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium mb-1">
            Slide Topic
          </label>
          <input
            id="topic"
            value={input}
            onChange={handleInputChange}
            placeholder="Enter a topic for your slides..."
            className="w-full p-2 border rounded-md"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Generate Slides'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="mt-8 space-y-6">
        {messages
          .filter((m) => m.role === 'assistant')
          .map((message, index) => {
            try {
              const slideContent = slideSchema.parse(JSON.parse(message.content))
              return (
                <div key={index} className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">{slideContent.title}</h2>
                  <div
                    className="prose prose-sm"
                    dangerouslySetInnerHTML={{ __html: slideContent.content }}
                  />
                </div>
              )
            } catch (err) {
              console.error('Error parsing slide content:', err)
              return (
                <div key={index} className="bg-red-50 p-4 rounded-md">
                  <p className="text-sm text-red-600">Error displaying slide content</p>
                </div>
              )
            }
          })}
      </div>
    </div>
  )
}
