'use client'

import { useAuth } from '@/hooks/use-auth'
import { CategoryManager } from '@/components/admin/category-manager'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CategoriesPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="py-8 text-center">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Acceso restringido</h1>
        <p className="text-muted-foreground">No tienes permisos para acceder a esta página.</p>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Gestión de Categorías</h1>
          <p className="text-gray-600">Organiza tus productos en categorías</p>
        </div>
      </div>

      <CategoryManager />
    </div>
  )
}