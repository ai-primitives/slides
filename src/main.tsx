import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AIPreview } from './components/AIPreview'
import { ExampleSlides } from './components/ExampleSlides'
import { initTheme } from './lib/theme'
import '@code-hike/mdx/dist/index.css'
import './index.css'

initTheme()

const router = createBrowserRouter([
  { path: '/', element: <AIPreview /> },
  { path: '/example', element: <ExampleSlides /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
