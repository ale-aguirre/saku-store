import { Suspense } from 'react'
import { Metadata } from 'next'
import { ProductsPageContent } from '@/components/products/products-page-content'
import { ProductsPageSkeleton } from '@/components/products/products-page-skeleton'

export const metadata: Metadata = {
  title: 'Productos - Sakú Lencería',
  description: 'Descubre nuestra colección de lencería femenina. Calidad, comodidad y estilo en cada prenda.',
  openGraph: {
    title: 'Productos - Sakú Lencería',
    description: 'Descubre nuestra colección de lencería femenina. Calidad, comodidad y estilo en cada prenda.',
    type: 'website',
  },
}

interface ProductsPageProps {
  searchParams: Promise<{
    categoria?: string
    buscar?: string
    orden?: string
    precio_min?: string
    precio_max?: string
    tallas?: string
    colores?: string
    stock?: string
    destacados?: string
    pagina?: string
  }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  // Parsear parámetros de búsqueda
  const filters = {
    category_id: params.categoria,
    search: params.buscar,
    minPrice: params.precio_min ? parseFloat(params.precio_min) : undefined,
    maxPrice: params.precio_max ? parseFloat(params.precio_max) : undefined,
    sizes: params.tallas?.split(',').filter(Boolean),
    colors: params.colores?.split(',').filter(Boolean),
    inStock: params.stock === 'true' ? true : params.stock === 'false' ? false : undefined,
    is_featured: params.destacados === 'true',
  }

  const sortBy = (params.orden as any) || 'featured'
  const page = parseInt(params.pagina || '1', 10)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Productos
          </h1>
          <p className="text-muted-foreground">
            Descubre nuestra colección de lencería femenina
          </p>
        </div>

        <Suspense fallback={<ProductsPageSkeleton />}>
          <ProductsPageContent 
            initialFilters={filters}
            initialSortBy={sortBy}
            initialPage={page}
          />
        </Suspense>
      </div>
    </div>
  )
}