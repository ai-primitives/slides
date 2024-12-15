const isClient = typeof window !== 'undefined'

function getSystemPreference(): 'dark' | 'light' {
  if (!isClient) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function setTheme(theme: 'dark' | 'light' | 'system') {
  if (!isClient) return

  let effectiveTheme: 'dark' | 'light'
  if (theme === 'system') {
    effectiveTheme = getSystemPreference()
  } else {
    effectiveTheme = theme
  }

  document.documentElement.classList.toggle('dark', effectiveTheme === 'dark')
  document.documentElement.setAttribute('data-theme', effectiveTheme)

  localStorage.setItem('theme', theme)
}

export function initTheme() {
  if (!isClient) return

  const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | 'system' | null
  const theme = savedTheme || 'system'

  setTheme(theme)

  if (theme === 'system') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', () => {
      setTheme('system')
    })
  }
}
