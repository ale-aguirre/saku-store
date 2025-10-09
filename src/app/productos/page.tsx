import { Suspense } from 'react'
import { Metadata } from 'next'
import { ProductsPageContent } from '@/components/products/products-page-content'
import { ProductsPageSkeleton } from '@/components/products/products-page-skeleton'
import { getCategories } from '@/lib/supabase/products'

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
    oferta?: string
    descuento_min?: string
    pagina?: string
  }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  
  // Convertir slug de categoría a ID si es necesario
  let categoryId = params.categoria
  if (params.categoria && !params.categoria.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    // Si no es un UUID, asumir que es un slug y convertir a ID
    try {
      const categories = await getCategories()
      const category = categories.find(cat => cat.slug === params.categoria)
      categoryId = category?.id || undefined
    } catch (error) {
      console.error('Error fetching categories:', error)
      categoryId = undefined
    }
  }
  
  // Parsear parámetros de búsqueda
  const filters = {
    category_id: categoryId,
    search: params.buscar,
    minPrice: params.precio_min ? parseFloat(params.precio_min) : undefined,
    maxPrice: params.precio_max ? parseFloat(params.precio_max) : undefined,
    sizes: params.tallas?.split(',').filter(Boolean),
    colors: params.colores?.split(',').filter(Boolean),
    inStock: params.stock === 'true' ? true : params.stock === 'false' ? false : undefined,
    is_featured: params.destacados === 'true',
    onSale: params.oferta === 'true',
    discountPercentageMin: params.descuento_min ? parseFloat(params.descuento_min) : undefined,
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