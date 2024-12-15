import { ThemeConfig } from '@slidev/types'

export default {
  name: 'ai-slides',
  colors: {
    primary: '#3B82F6',
    secondary: '#10B981',
  },
  fonts: {
    sans: 'Inter, sans-serif',
    mono: 'Fira Code, monospace',
  },
  layouts: {
    'default': () => import('./layouts/default.vue'),
    'center': () => import('./layouts/center.vue'),
    'split': () => import('./layouts/split.vue'),
  },
} as ThemeConfig
