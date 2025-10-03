'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { LoadingSpinner } from './loading-spinner'

export function GlobalLoading() {
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Mostrar loading al cambiar de ruta
    setLoading(true)
    
    // Simular un pequeño delay para mostrar el loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [pathname])

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="rounded-lg bg-card p-6 shadow-lg">
        <LoadingSpinner size="lg" text="Cargando página..." />
      </div>
    </div>
  )
}

// Hook para controlar loading programáticamente
export function useGlobalLoading() {
  const [loading, setLoading] = useState(false)

  const showLoading = () => setLoading(true)
  const hideLoading = () => setLoading(false)

  return {
    loading,
    showLoading,
    hideLoading,
    LoadingOverlay: () => loading ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="rounded-lg bg-card p-6 shadow-lg">
          <LoadingSpinner size="lg" text="Procesando..." />
        </div>
      </div>
    ) : null
  }
}