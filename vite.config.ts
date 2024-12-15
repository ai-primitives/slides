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
    react(),
    mdx({
      remarkPlugins: [
        remarkGfm,
        [remarkCodeHike, chConfig]
      ],
      rehypePlugins: [rehypeSlug],
      providerImportSource: '@mdx-js/react',
      jsxRuntime: 'automatic',
      jsx: true
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'components': path.resolve(__dirname, './src/components')
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.mdx']
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@mdx-js/react'],
    exclude: ['@code-hike/lighter', '@code-hike/mdx']
  },
  define: {
    'process.env.NODE_DEBUG': 'false',
    'process.platform': JSON.stringify('browser'),
    'process.version': JSON.stringify(''),
    'global': 'globalThis'
  },
  assetsInclude: ['**/*.mdx'],
  esbuild: {
    jsxInject: `import React from 'react'`,
    target: 'esnext'
  },
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
