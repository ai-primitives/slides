import React from 'react'
import { createRoot } from 'react-dom/client'
import { Deck, DefaultTemplate, Slide, FlexBox } from 'spectacle'
import { AIPreview } from './components/AIPreview'
import './index.css'

const Presentation = () => (
  <Deck template={() => <DefaultTemplate />}>
    <Slide>
      <FlexBox height='100%'>
        <AIPreview />
      </FlexBox>
    </Slide>
  </Deck>
)

createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <Presentation />
  </React.StrictMode>
)
