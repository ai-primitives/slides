import { useEffect, useState } from "react"
import { CH } from "@code-hike/mdx/components"

interface CodeBlockProps {
  children: string
  language?: string
  className?: string
  theme?: string
}

export function CodeBlock({
  children,
  language = "typescript",
  className = "",
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
    <div className={`rounded-lg overflow-hidden ${className}`}>
      <CH
        code={children}
        lang={language}
        theme={theme}
        minHeight={50}
        showCopyButton
      />
    </div>
  )
}
