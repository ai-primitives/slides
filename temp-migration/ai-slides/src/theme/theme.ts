import { defaultTheme } from 'spectacle'

// Base colors from slidev theme
const colors = {
  ...defaultTheme.colors,
  primary: '#3B82F6',
  secondary: '#10B981',
  background: '#FFFFFF',
  text: '#1E293B',
  code: '#1E293B',
  border: '#E2E8F0',
}

// Dark mode colors
const darkColors = {
  ...defaultTheme.colors,
  primary: '#60A5FA',
  secondary: '#34D399',
  background: '#0F172A',
  text: '#F8FAFC',
  code: '#F8FAFC',
  border: '#334155',
}

// Base theme configuration
export const lightTheme = {
  ...defaultTheme,
  colors,
  fonts: {
    header: 'Inter, sans-serif',
    text: 'Inter, sans-serif',
    monospace: 'Fira Code, monospace',
  },
  fontSizes: {
    h1: '2.5rem',
    h2: '2rem',
    h3: '1.75rem',
    text: '1.125rem',
    monospace: '1rem',
  },
  space: [8, 16, 24, 32, 48],
}

// Create dark theme by extending light theme
export const darkTheme = {
  ...lightTheme,
  colors: darkColors,
}

// Theme provider helper
export const getTheme = (isDark: boolean) => isDark ? darkTheme : lightTheme
