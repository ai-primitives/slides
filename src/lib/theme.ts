// Check if window is defined (browser environment)
const isClient = typeof window !== 'undefined'

// Function to get system color scheme preference
function getSystemPreference(): 'dark' | 'light' {
  if (!isClient) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Function to set theme
export function setTheme(theme: 'dark' | 'light' | 'system') {
  if (!isClient) return

  if (theme === 'system') {
    const systemTheme = getSystemPreference()
    document.documentElement.classList.toggle('dark', systemTheme === 'dark')
  } else {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }

  localStorage.setItem('theme', theme)
}

// Initialize theme
export function initTheme() {
  if (!isClient) return

  const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | 'system' | null
  const theme = savedTheme || 'system'

  setTheme(theme)

  // Listen for system theme changes
  if (theme === 'system') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      setTheme('system')
    })
  }
}
