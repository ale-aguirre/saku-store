'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Grid, List } from 'lucide-react'
import { ProductCard } from '@/components/product/product-card'
import { ProductPagination } from '@/components/product/product-pagination'
import { ProductFilters } from '@/components/product/product-filters'
import { useProductFilters } from '@/hooks/use-product-filters'
import { useProducts, useProductCategories, usePriceRange } from '@/hooks/use-products'
import type { SortOption } from '@/types/catalog'

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [mounted, setMounted] = useState(false)
  
  // Usar el hook de filtros con URL state management
  const {
    filters,
    pagination,
    updateFilters,
    clearFilters,
    updatePage,
    updateSort,
    hasActiveFilters
  } = useProductFilters()
  
  const { page: currentPage, sort: sortBy } = pagination
  
  // Configuración de paginación fija en 12 productos por página
  
  // Inicializar estado montado
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Obtener categorías para el filtro
  const { data: categories = [] } = useProductCategories()
  
  // Obtener rango de precios
  const { data: priceRange } = usePriceRange()

  // Obtener productos con filtros aplicados
  const { data: productsData, isLoading, error, refetch } = useProducts({
    categoryId: filters.category_id,
    search: filters.search,
    sizes: filters.size ? [filters.size] : undefined,
    colors: filters.color ? [filters.color] : undefined,
    minPrice: filters.min_price,
    maxPrice: filters.max_price,
    sortBy: sortBy as 'featured' | 'name' | 'price_asc' | 'price_desc' | 'newest',
    page: currentPage,
    limit: 12
  })

  // Extraer datos de la respuesta
  const products = productsData?.products || []
  const totalProducts = productsData?.totalItems || 0
  const totalPages = productsData?.totalPages || 1

  // Función estable para refetch
  const stableRefetch = useCallback(() => {
    refetch()
  }, [refetch])

  // Si hay error, intentar refetch automáticamente
  useEffect(() => {
    if (error && mounted) {
      console.error('Error loading products:', error)
      // Intentar refetch después de 3 segundos
      const timeoutId = setTimeout(() => {
        stableRefetch()
      }, 3000)
      
      // Cleanup timeout si el componente se desmonta o cambian las dependencias
      return () => clearTimeout(timeoutId)
    }
  }, [error, mounted, stableRefetch])

  // Mostrar loading inicial si no está montado
  if (!mounted) {
    return (
      <div className="space-y-safe-section px-safe-x py-safe-y">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/2" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-safe-section px-safe-x py-safe-y">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error al cargar productos</h1>
          <p className="text-muted-foreground mb-4">
            Hubo un problema al cargar los productos. Reintentando automáticamente...
          </p>
          <Button onClick={() => refetch()}>
            Reintentar ahora
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-safe-section px-safe-x py-safe-y">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-safe-y">
        <h1 className="text-3xl font-serif font-normal mb-4">Nuestros Productos</h1>
        <p className="text-muted-foreground">
          Descubre toda nuestra colección de lencería premium
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {isLoading ? 'Cargando...' : `${totalProducts} productos encontrados`}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={(value: SortOption) => updateSort(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Destacados</SelectItem>
              <SelectItem value="price_asc">Precio: Menor a Mayor</SelectItem>
              <SelectItem value="price_desc">Precio: Mayor a Menor</SelectItem>
              <SelectItem value="newest">Más Nuevos</SelectItem>
              <SelectItem value="name">Nombre A-Z</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex border rounded-md">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'ghost'} 
              size="sm" 
              className="border-r"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <ProductFilters
              filters={filters}
              onFiltersChange={updateFilters}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
              availableCategories={categories}
              priceRange={priceRange}
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No se encontraron productos</h3>
              <p className="text-muted-foreground mb-4">
                Intenta ajustar los filtros para encontrar lo que buscas.
              </p>
              <Button 
                variant="outline" 
                onClick={clearFilters}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
          
          {/* Paginación */}
          {!isLoading && products && products.length > 0 && totalPages > 1 && (
            <ProductPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={updatePage}
            />
          )}
        </div>
      </div>
    </div>
  )
}