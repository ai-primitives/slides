import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import path from 'path'

export default defineConfig({
  plugins: [
    mdx({
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeSlug, rehypeHighlight],
      providerImportSource: '@mdx-js/react',
    }),
    react(),
    vue({
      include: [/\.vue$/],
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('slidev-'),
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'components': path.resolve(__dirname, './src/components'),
      'slidev': path.resolve(__dirname, './src/slidev'),
      'lib': path.resolve(__dirname, './src/lib'),
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@mdx-js/react', 'vue'],
    exclude: ['@vercel/edge']
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['@slidev/client/styles'],
    },
    target: 'esnext',
    sourcemap: true
  },
  server: process.env.NODE_ENV === 'development' ? {
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
  } : undefined
})
