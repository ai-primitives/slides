import React from 'react'
import { createRoot } from 'react-dom/client'
import { Slide } from 'spectacle'
import { AIPreview } from './components/AIPreview'
import { ThemeProvider } from './theme/ThemeProvider'
import './index.css'

const Presentation = () => (
  <ThemeProvider>
    <Slide>
      <AIPreview />
    </Slide>
  </ThemeProvider>
)

const root = createRoot(document.getElementById('root')!)
root.render(<Presentation />)
