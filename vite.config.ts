import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import { remarkCodeHike, recmaCodeHike } from "codehike/mdx"
import path from 'path'

/** @type {import('codehike/mdx').CodeHikeConfig} */
const chConfig = {
  theme: {
    light: "github-light",
    dark: "github-dark"
  },
  lineNumbers: true,
  showCopyButton: true,
  autoImport: false // We'll handle imports manually for better control
}

export default defineConfig({
  plugins: [
    mdx({
      remarkPlugins: [
        remarkGfm,
        [remarkCodeHike, chConfig]
      ],
      recmaPlugins: [
        [recmaCodeHike, chConfig]
      ],
      rehypePlugins: [rehypeSlug], // Removed rehypeHighlight as Codehike handles highlighting
      providerImportSource: '@mdx-js/react',
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'components': path.resolve(__dirname, './src/components')
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@mdx-js/react', 'codehike'],
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
