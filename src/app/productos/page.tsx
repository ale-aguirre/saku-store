'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SlidersHorizontal, Grid, List } from 'lucide-react'
import { useProducts, useProductCategories, useProductSizes, useProductColors, type Product, type ProductFilters } from '@/hooks/use-products'

function ProductCard({ product }: { product: Product }) {
  // Get the minimum and maximum prices from variants
  const activeVariants = product.product_variants.filter(v => v.is_active && v.stock_quantity > 0)
  const prices = activeVariants.map(v => v.price)
  const comparePrices = activeVariants.map(v => v.compare_at_price).filter(Boolean) as number[]
  
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const hasComparePrice = comparePrices.length > 0
  const minComparePrice = hasComparePrice ? Math.min(...comparePrices) : null
  
  const isOnSale = hasComparePrice && minComparePrice! > minPrice
  const isNew = new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days
  
  const priceDisplay = minPrice === maxPrice 
    ? `$${minPrice.toLocaleString()}` 
    : `$${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}`

  return (
    <Link href={`/productos/${product.id}`} className="group">
      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Sin imagen
            </div>
          )}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isNew && (
              <Badge className="bg-black text-white text-xs">
                Nuevo
              </Badge>
            )}
            {isOnSale && (
              <Badge variant="destructive" className="text-xs">
                Oferta
              </Badge>
            )}
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-[#d8ceb5] transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">
              {priceDisplay}
            </span>
            {isOnSale && minComparePrice && (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  ${minComparePrice.toLocaleString()}
                </span>
                <Badge variant="outline" className="text-xs">
                  {Math.round(((minComparePrice - minPrice) / minComparePrice) * 100)}% OFF
                </Badge>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function ProductFilters({ 
  filters, 
  onFiltersChange 
}: { 
  filters: ProductFilters
  onFiltersChange: (filters: ProductFilters) => void 
}) {
  const { data: categories } = useProductCategories()
  const { data: sizes } = useProductSizes()
  const { data: colors } = useProductColors()

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
            value={filters.category || 'all'} 
            onValueChange={(value) => 
              onFiltersChange({ ...filters, category: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
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
              {sizes?.map((size) => (
                <SelectItem key={size.id} value={size.id}>
                  {size.name}
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
              {colors?.map((color) => (
                <SelectItem key={color.id} value={color.id}>
                  {color.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
           <label className="text-sm font-medium mb-2 block">Precio</label>
           <Select 
             value={
               filters.minPrice === 0 && filters.maxPrice === 10000 ? '0-10000' :
               filters.minPrice === 10000 && filters.maxPrice === 15000 ? '10000-15000' :
               filters.minPrice === 15000 && filters.maxPrice === 20000 ? '15000-20000' :
               filters.minPrice === 20000 ? '20000+' :
               'all'
             }
             onValueChange={(value) => {
               if (value === 'all') {
                 onFiltersChange({ ...filters, minPrice: undefined, maxPrice: undefined })
               } else if (value === '0-10000') {
                 onFiltersChange({ ...filters, minPrice: 0, maxPrice: 10000 })
               } else if (value === '10000-15000') {
                 onFiltersChange({ ...filters, minPrice: 10000, maxPrice: 15000 })
               } else if (value === '15000-20000') {
                 onFiltersChange({ ...filters, minPrice: 15000, maxPrice: 20000 })
               } else if (value === '20000+') {
                 onFiltersChange({ ...filters, minPrice: 20000, maxPrice: undefined })
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
  const [sortBy, setSortBy] = useState('featured')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const { data: products, isLoading, error } = useProducts(filters, sortBy)

  if (error) {
    return (
      <div className="py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error al cargar productos</h1>
          <p className="text-muted-foreground">Hubo un problema al cargar los productos. Por favor, intenta nuevamente.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-8">
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
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Destacados</SelectItem>
              <SelectItem value="price-low">Precio: Menor a Mayor</SelectItem>
              <SelectItem value="price-high">Precio: Mayor a Menor</SelectItem>
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