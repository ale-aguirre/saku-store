'use client'

import { usePathname } from 'next/navigation'
import { MainLayout } from './main-layout'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Si estamos en rutas de admin, no aplicar MainLayout (header/footer)
  const isAdminRoute = pathname.startsWith('/admin')
  
  if (isAdminRoute) {
    // Para rutas de admin, solo renderizar children sin header/footer
    return <>{children}</>
  }
  
  // Para rutas públicas, aplicar MainLayout con header/footer
  return <MainLayout>{children}</MainLayout>
}