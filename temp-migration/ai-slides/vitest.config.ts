/// <reference types="vitest" />
/// <reference types="vite/client" />

import { mergeConfig } from 'vite'
import { defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      coverage: {
        reporter: ['text', 'json', 'html'],
        exclude: ['node_modules/']
      },
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      deps: {
        inline: ['styled-components'] // Ensure styled-components is inlined for tests
      }
    }
  })
)
