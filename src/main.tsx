import React from 'react'
import ReactDOM from 'react-dom/client'
import { AIPreview } from './components/AIPreview'
import { initTheme } from './lib/theme'
import './index.css'

initTheme()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AIPreview />
  </React.StrictMode>,
)
