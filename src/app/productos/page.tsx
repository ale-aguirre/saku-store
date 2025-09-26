'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SlidersHorizontal, Grid, List } from 'lucide-react'
import { ProductCard } from '@/components/product/product-card'
import { getProducts, getCategories } from '@/lib/supabase/products'
import type { ProductFilters, SortOption } from '@/types/catalog'

function ProductFilters({ 
  filters, 
  onFiltersChange 
}: { 
  filters: ProductFilters
  onFiltersChange: (filters: ProductFilters) => void 
}) {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  })

  const availableSizes = ['85', '90', '95', '100']
  const availableColors = ['negro', 'rojo', 'blanco']

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-5 w-5" />
        <h3 className="font-serif text-lg font-normal">Filtros</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Categoría</label>
          <Select 
            value={filters.category_id || 'all'} 
            onValueChange={(value) => 
              onFiltersChange({ ...filters, category_id: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Talle</label>
          <Select 
            value={filters.size || 'all'} 
            onValueChange={(value) => 
              onFiltersChange({ ...filters, size: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos los talles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los talles</SelectItem>
              {availableSizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Color</label>
          <Select 
            value={filters.color || 'all'} 
            onValueChange={(value) => 
              onFiltersChange({ ...filters, color: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos los colores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los colores</SelectItem>
              {availableColors.map((color) => (
                <SelectItem key={color} value={color}>
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
           <label className="text-sm font-medium mb-2 block">Precio</label>
           <Select 
             value={
               filters.min_price === 0 && filters.max_price === 10000 ? '0-10000' :
               filters.min_price === 10000 && filters.max_price === 15000 ? '10000-15000' :
               filters.min_price === 15000 && filters.max_price === 20000 ? '15000-20000' :
               filters.min_price === 20000 ? '20000+' :
               'all'
             }
             onValueChange={(value) => {
               if (value === 'all') {
                 onFiltersChange({ ...filters, min_price: undefined, max_price: undefined })
               } else if (value === '0-10000') {
                 onFiltersChange({ ...filters, min_price: 0, max_price: 10000 })
               } else if (value === '10000-15000') {
                 onFiltersChange({ ...filters, min_price: 10000, max_price: 15000 })
               } else if (value === '15000-20000') {
                 onFiltersChange({ ...filters, min_price: 15000, max_price: 20000 })
               } else if (value === '20000+') {
                 onFiltersChange({ ...filters, min_price: 20000, max_price: undefined })
               }
             }}
           >
             <SelectTrigger>
               <SelectValue placeholder="Todos los precios" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">Todos los precios</SelectItem>
               <SelectItem value="0-10000">Hasta $10.000</SelectItem>
               <SelectItem value="10000-15000">$10.000 - $15.000</SelectItem>
               <SelectItem value="15000-20000">$15.000 - $20.000</SelectItem>
               <SelectItem value="20000+">Más de $20.000</SelectItem>
             </SelectContent>
           </Select>
         </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const [filters, setFilters] = useState<ProductFilters>({})
  const [sortBy, setSortBy] = useState<SortOption>('featured')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [mounted, setMounted] = useState(false)
  
  // Evitar problemas de hidratación
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['products', filters, sortBy],
    queryFn: () => getProducts(filters, sortBy),
    enabled: mounted, // Solo ejecutar después de que el componente esté montado
    retry: 3,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Si hay error, intentar refetch automáticamente
  useEffect(() => {
    if (error && mounted) {
      const timer = setTimeout(() => {
        refetch()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [error, mounted, refetch])

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
            {isLoading ? 'Cargando...' : `${products?.length || 0} productos encontrados`}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
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
            <ProductFilters filters={filters} onFiltersChange={setFilters} />
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
                onClick={() => setFilters({})}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}