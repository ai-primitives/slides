import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['babel-plugin-styled-components', {
            displayName: true,
            ssr: true,
            pure: false,
            fileName: false,
            namespace: 'ai-slides',
            transpileTemplateLiterals: true,
            minify: true,
            cssProp: true
          }]
        ]
      },
      jsxRuntime: 'automatic',
      fastRefresh: process.env.NODE_ENV !== 'test' // Disable fast refresh in test environment
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'components': path.resolve(__dirname, './src/components'),
      'lib': path.resolve(__dirname, './src/lib')
    }
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    },
    minify: 'esbuild',
    emptyOutDir: true
  },
  optimizeDeps: {
    include: ['styled-components'],
    exclude: ['@ai-sdk/openai', 'ai']
  }
})
