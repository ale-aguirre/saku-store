'use client'

import { useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ProductFilters } from '@/types/catalog'

export function useProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Parsear filtros desde URL
  const filters = useMemo((): ProductFilters => {
    const params = new URLSearchParams(searchParams.toString())
    
    return {
      category_id: params.get('categoria') || undefined,
      size: params.get('talle') || undefined,
      color: params.get('color') || undefined,
      min_price: params.get('precio_min') ? Number(params.get('precio_min')) : undefined,
      max_price: params.get('precio_max') ? Number(params.get('precio_max')) : undefined,
      in_stock_only: params.get('stock') === 'true' || undefined,
      is_featured: params.get('destacados') === 'true' || undefined,
      search: params.get('buscar') || undefined
    }
  }, [searchParams])

  // Actualizar filtros en URL
  const updateFilters = useCallback((newFilters: ProductFilters) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Limpiar parámetros existentes de filtros
    params.delete('categoria')
    params.delete('talle')
    params.delete('color')
    params.delete('precio_min')
    params.delete('precio_max')
    params.delete('stock')
    params.delete('destacados')
    params.delete('buscar')
    params.delete('pagina') // Reset página al cambiar filtros
    
    // Agregar nuevos filtros si tienen valor
    if (newFilters.category_id) {
      params.set('categoria', newFilters.category_id)
    }
    
    if (newFilters.size) {
      params.set('talle', newFilters.size)
    }
    
    if (newFilters.color) {
      params.set('color', newFilters.color)
    }
    
    if (newFilters.min_price !== undefined) {
      params.set('precio_min', newFilters.min_price.toString())
    }
    
    if (newFilters.max_price !== undefined) {
      params.set('precio_max', newFilters.max_price.toString())
    }
    
    if (newFilters.in_stock_only) {
      params.set('stock', 'true')
    }
    
    if (newFilters.is_featured) {
      params.set('destacados', 'true')
    }
    
    if (newFilters.search) {
      params.set('buscar', newFilters.search)
    }
    
    // Navegar con nuevos parámetros
    const newUrl = params.toString() ? `?${params.toString()}` : ''
    router.push(`/productos${newUrl}`, { scroll: false })
  }, [router, searchParams])

  // Limpiar todos los filtros
  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Mantener solo parámetros que no son filtros
    const nonFilterParams = new URLSearchParams()
    
    // Preservar ordenamiento y paginación si existen
    const sort = params.get('orden')
    const page = params.get('pagina')
    
    if (sort) nonFilterParams.set('orden', sort)
    if (page) nonFilterParams.set('pagina', page)
    
    const newUrl = nonFilterParams.toString() ? `?${nonFilterParams.toString()}` : ''
    router.push(`/productos${newUrl}`, { scroll: false })
  }, [router, searchParams])

  // Obtener parámetros de paginación y ordenamiento
  const pagination = useMemo(() => {
    const page = searchParams.get('pagina')
    const sort = searchParams.get('orden')
    
    return {
      page: page ? Number(page) : 1,
      sort: sort || 'featured'
    }
  }, [searchParams])

  // Actualizar página
  const updatePage = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (page === 1) {
      params.delete('pagina')
    } else {
      params.set('pagina', page.toString())
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : ''
    router.push(`/productos${newUrl}`, { scroll: false })
  }, [router, searchParams])

  // Actualizar ordenamiento
  const updateSort = useCallback((sort: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (sort === 'featured') {
      params.delete('orden')
    } else {
      params.set('orden', sort)
    }
    
    // Reset página al cambiar ordenamiento
    params.delete('pagina')
    
    const newUrl = params.toString() ? `?${params.toString()}` : ''
    router.push(`/productos${newUrl}`, { scroll: false })
  }, [router, searchParams])

  // Verificar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => 
      value !== undefined && value !== null && value !== ''
    )
  }, [filters])

  return {
    filters,
    pagination,
    updateFilters,
    clearFilters,
    updatePage,
    updateSort,
    hasActiveFilters
  }
}