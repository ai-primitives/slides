import React, { useState } from 'react'
import { useCompletion } from '@ai-sdk/react'
import styled from 'styled-components'
import type { Theme } from '../types/theme'

const Container = styled.div<{ theme?: Theme }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 800px;
  gap: 16px;
`

const Label = styled.label<{ theme: Theme }>`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.text};
  font-size: ${({ theme }) => theme.fontSizes.text};
`

const InputContainer = styled.div`
  width: 100%;
`

const Button = styled.button<{ $isDisabled: boolean }>`
  padding: 8px 16px;
  background-color: ${({ $isDisabled }) => $isDisabled ? '#ccc' : '#0070f3'};
  color: white;
  border-radius: 4px;
  cursor: ${({ $isDisabled }) => $isDisabled ? 'not-allowed' : 'pointer'};
  text-align: center;
  user-select: none;
  border: none;
`

const ResultContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const ResultContent = styled.pre`
  white-space: pre-wrap;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
`

export const AIPreview: React.FC = () => {
  const [prompt, setPrompt] = useState('')
  const { complete, completion, isLoading, error } = useCompletion({
    api: '/api/generate',
    onResponse: (response) => {
      if (!response.ok) {
        throw new Error('Failed to generate slides')
      }
    },
    onError: (error) => {
      console.error('Error generating slides:', error)
    }
  })

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    await complete(prompt)
  }

  const isDisabled = isLoading || !prompt.trim()

  return (
    <Container>
      <Label htmlFor="slideInput">Enter a topic or description to generate slides:</Label>
      <InputContainer>
        <textarea
          id="slideInput"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Create a presentation about AI and its impact on society"
          disabled={isLoading}
          aria-label="Slide topic or description"
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            minHeight: '100px',
            fontFamily: 'inherit'
          }}
        />
      </InputContainer>
      <Button
        onClick={handleGenerate}
        disabled={isDisabled}
        $isDisabled={isDisabled}
        aria-label={isLoading ? 'Generating...' : 'Generate slides'}
      >
        {isLoading ? 'Generating...' : 'Generate Slides'}
      </Button>
      {error && (
        <div role="alert" style={{ color: 'red' }}>
          {error.message}
        </div>
      )}
      {completion && (
        <ResultContainer>
          <Label as="h2">Generated Content:</Label>
          <ResultContent>{completion}</ResultContent>
        </ResultContainer>
      )}
    </Container>
  )
}
