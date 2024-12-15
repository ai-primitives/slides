import express from 'express'
import cors from 'cors'
import compression from 'compression'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Load environment variables
const requiredEnvVars = ['OPENAI_API_KEY', 'ELEVENLABS_API_KEY']
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const port = process.env.PORT || 3000

// Edge Runtime error handling middleware
const edgeRuntimeErrorHandler = async (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Edge Runtime error:', err)
  res.status(500).json({ error: 'Edge Runtime error', message: err.message })
}

// Middleware
app.use(cors())
app.use(compression())
app.use(express.json())

// API Routes with Edge Runtime handlers
app.post('/api/generate', async (req, res, next) => {
  try {
    const request = new Request('http://localhost/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    })
    const response = await import('./api/generate').then(m => m.default(request))
    res.status(response.status).type(response.headers.get('Content-Type') || 'application/json')
    res.send(await response.text())
  } catch (error) {
    next(error)
  }
})

app.post('/api/voiceover', async (req, res, next) => {
  try {
    const request = new Request('http://localhost/api/voiceover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    })
    const response = await import('./api/voiceover').then(m => m.default(request))
    res.status(response.status).type(response.headers.get('Content-Type') || 'application/octet-stream')
    res.send(await response.arrayBuffer())
  } catch (error) {
    next(error)
  }
})

// Static files
app.use(express.static(resolve(__dirname, '../dist')))

// Error handling
app.use(edgeRuntimeErrorHandler)

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

export default app
