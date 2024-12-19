import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { AIPreview } from './components/AIPreview'
import { initTheme } from './lib/theme'
import './index.css'

initTheme()

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <AIPreview />
  </React.StrictMode>,
)
