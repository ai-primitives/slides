import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import { remarkCodeHike } from '@code-hike/mdx'
import path from 'path'

/** @type {import('@code-hike/mdx').CodeHikeConfig} */
const chConfig = {
  theme: {
    light: "github-light",
    dark: "github-dark"
  },
  lineNumbers: true,
  showCopyButton: true,
  autoImport: true
}

export default defineConfig({
  plugins: [
    mdx({
      remarkPlugins: [
        remarkGfm,
        [remarkCodeHike, chConfig]
      ],
      rehypePlugins: [rehypeSlug],
      providerImportSource: '@mdx-js/react',
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'components': path.resolve(__dirname, './src/components'),
      'https': 'agent-base',
      'http': 'agent-base',
      'stream': 'stream-browserify',
      'buffer': 'buffer/',
      'util': 'util/',
      'url': 'url/',
      'process': 'process/browser'
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@mdx-js/react', '@code-hike/mdx'],
  },
  define: {
    'process.env.NODE_DEBUG': 'false',
    'process.platform': JSON.stringify('browser'),
    'process.version': JSON.stringify(''),
    'Buffer.isBuffer': 'undefined'
  },
  assetsInclude: ['**/*.mdx'],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err)
          })
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request:', req.method, req.url)
          })
        }
      }
    }
  }
})
