import { useEffect, useState } from "react"

interface CodeBlockProps {
  children: string
  language?: string
  className?: string
  code?: any
  theme?: string
}

export function CodeBlock({
  children,
  language = "typescript",
  className = "",
  code = children,
  theme: themeProp,
}: CodeBlockProps) {
  const [systemTheme, setSystemTheme] = useState("github-light")

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark")
    setSystemTheme(isDark ? "github-dark" : "github-light")

    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark")
      setSystemTheme(isDark ? "github-dark" : "github-light")
    })

    observer.observe(document.documentElement, { attributes: true })
    return () => observer.disconnect()
  }, [])

  const theme = themeProp || systemTheme

  return (
    <pre
      className={`rounded-lg p-4 overflow-x-auto ${className}`}
      data-language={language}
      data-theme={theme}
    >
      {code}
    </pre>
  )
}
