import React from 'react'
import ReactDOM from 'react-dom/client'
import { MDXProvider } from './components/MDXProvider'
import ExampleSlides from './slides/example.mdx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MDXProvider>
      <div className="slides-container">
        <ExampleSlides />
      </div>
    </MDXProvider>
  </React.StrictMode>,
)
