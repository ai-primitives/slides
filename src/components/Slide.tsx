import React, { ReactNode } from 'react'

interface SlideProps {
  children: ReactNode
  layout?: 'default' | 'center' | 'split'
  className?: string
}

export function Slide({ children, layout = 'default', className = '' }: SlideProps) {
  const layouts = {
    default: 'p-8',
    center: 'flex items-center justify-center min-h-screen p-8',
    split: 'grid grid-cols-2 gap-8 p-8',
  }

  return (
    <div className={`slide ${layouts[layout]} ${className}`}>
      {children}
    </div>
  )
}
