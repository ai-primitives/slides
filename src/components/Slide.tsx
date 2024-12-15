import { ReactNode } from 'react'

interface SlideProps {
  children: ReactNode
  layout?: 'default' | 'center' | 'split'
  className?: string
}

export function Slide({ children, layout = 'default', className = '' }: SlideProps) {
  const layouts = {
    default: 'prose dark:prose-invert p-8',
    center: 'prose dark:prose-invert flex items-center justify-center min-h-screen p-8',
    split: 'prose dark:prose-invert grid grid-cols-2 gap-8 p-8',
  }

  return (
    <div className={`slide ${layouts[layout]} ${className}`}>
      {children}
    </div>
  )
}
