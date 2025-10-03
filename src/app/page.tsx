import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Truck, Shield, Heart } from 'lucide-react'
import { ProductCard } from '@/components/product/product-card'
import { getFeaturedProducts } from '@/lib/supabase/products'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const features = [
  {
    icon: Truck,
    title: 'Envío Gratis',
    description: 'En compras superiores a $25.000',
  },
  {
    icon: Shield,
    title: 'Compra Segura',
    description: 'Protección total en tus pagos',
  },
  {
    icon: Heart,
    title: 'Calidad Premium',
    description: 'Materiales de primera calidad',
  },
]

// Componente para cargar productos destacados
async function FeaturedProducts() {
  // Obtener productos destacados desde Supabase
  const featuredProducts = await getFeaturedProducts(4)
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {featuredProducts.length > 0 ? (
        featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))
      ) : (
        // Fallback para cuando no hay productos destacados
        <div className="col-span-full text-center py-8">
          <p className="text-muted-foreground">
            No hay productos destacados disponibles en este momento.
          </p>
        </div>
      )}
    </div>
  )
}

// Componente de carga para productos destacados
function FeaturedProductsSkeleton() {
  return (
    <div className="flex justify-center items-center py-12">
      <LoadingSpinner size="lg" text="Cargando productos destacados..." />
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="space-y-12 sm:space-y-16 lg:space-y-20">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] sm:min-h-[500px] flex items-center justify-center bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <Badge variant="secondary" className="w-fit mx-auto lg:mx-0">
                Nueva Colección 2024
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-normal font-marcellus">
                Elegancia que
                <span className="text-[#d8ceb5]"> realza</span>
                <br />
                tu belleza
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 font-sans">
                Descubre nuestra colección de lencería premium diseñada para la mujer moderna que busca comodidad y estilo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" asChild>
                  <Link href="/productos">
                    Ver Colección
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/guia-talles">
                    Guía de Talles
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative order-first lg:order-last">
              <Image
                src="/hero-1.webp"
                alt="Lencería Sakú"
                width={600}
                height={400}
                className="rounded-lg object-cover w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-[#d8ceb5]/20 rounded-full flex items-center justify-center">
                  <Icon className="h-6 w-6 text-[#d8ceb5]" />
                </div>
                <h3 className="font-semibold text-base sm:text-lg">{feature.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 sm:space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-serif font-normal font-marcellus">Productos Destacados</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Descubre nuestras piezas más populares, cuidadosamente seleccionadas por su calidad y diseño excepcional.
          </p>
        </div>
        
        <Suspense fallback={<FeaturedProductsSkeleton />}>
          <FeaturedProducts />
        </Suspense>

        <div className="text-center">
          <Button asChild size="lg" className="bg-[#d8ceb5] text-black hover:bg-[#d8ceb5]/90">
            <Link href="/productos">Ver Todos los Productos</Link>
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#d8ceb5]/10 py-12 sm:py-16 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-serif font-normal font-marcellus">
            ¿Primera vez en Sakú?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Regístrate y recibe un 15% de descuento en tu primera compra. Además, mantente al día con nuestras últimas colecciones y ofertas exclusivas.
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/register">
              Registrarse Ahora
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
