import React, { createContext, useContext, useEffect, useState } from 'react'
import { Deck } from 'spectacle'
import { getTheme } from './theme'

type ThemeContextType = {
  isDark: boolean
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  setTheme: () => {},
})

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false)
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>('system')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | 'system' | null
    if (savedTheme) {
      setThemePreference(savedTheme)
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (savedTheme === 'dark' || (savedTheme !== 'light' && prefersDark)) {
      setIsDark(true)
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (themePreference === 'system') {
        setIsDark(e.matches)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [themePreference])

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    setThemePreference(theme)
    localStorage.setItem('theme', theme)

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDark(prefersDark)
    } else {
      setIsDark(theme === 'dark')
    }
  }

  return (
    <ThemeContext.Provider value={{ isDark, setTheme }}>
      <Deck theme={getTheme(isDark)}>
        {children}
      </Deck>
    </ThemeContext.Provider>
  )
}
