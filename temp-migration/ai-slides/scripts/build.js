import { build } from 'vite'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function buildAll() {
  try {
    // Build frontend
    await build({
      root: resolve(__dirname, '..'),
      configFile: resolve(__dirname, '../vite.config.ts')
    })

    // Build server
    await build({
      root: resolve(__dirname, '..'),
      configFile: resolve(__dirname, '../vite.config.ts'),
      build: {
        ssr: true,
        outDir: 'dist/server',
        rollupOptions: {
          input: 'src/server.ts',
          output: {
            format: 'esm'
          }
        }
      }
    })

    console.log('Build completed successfully!')
  } catch (error) {
    console.error('Build failed:', error)
    process.exit(1)
  }
}

buildAll()
