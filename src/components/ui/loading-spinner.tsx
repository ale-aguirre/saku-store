'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
  showText?: boolean
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6', 
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
}

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg', 
  xl: 'text-xl'
}

export function LoadingSpinner({ 
  size = 'md', 
  className, 
  text = 'Cargando...',
  showText = true 
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-muted-foreground', sizeClasses[size])} />
      {showText && (
        <span className={cn('text-muted-foreground', textSizeClasses[size])}>
          {text}
        </span>
      )}
    </div>
  )
}

// Componente para páginas completas
export function PageLoadingSpinner({ text = 'Cargando página...' }: { text?: string }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

// Componente para secciones
export function SectionLoadingSpinner({ text = 'Cargando...' }: { text?: string }) {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <LoadingSpinner size="md" text={text} />
    </div>
  )
}

// Componente inline para botones
export function InlineLoadingSpinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return <LoadingSpinner size={size} showText={false} />
}