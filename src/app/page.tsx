import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Star, Truck, Shield, Heart } from 'lucide-react'

// Datos temporales para productos destacados
const featuredProducts = [
  {
    id: 1,
    name: 'Conjunto Elegance',
    price: 15900,
    originalPrice: 19900,
    image: '/products/conjunto-elegance.svg',
    rating: 4.8,
    reviews: 24,
    isNew: true,
  },
  {
    id: 2,
    name: 'Brasier Comfort Plus',
    price: 8900,
    image: '/products/brasier-comfort.svg',
    rating: 4.9,
    reviews: 18,
    isNew: false,
  },
  {
    id: 3,
    name: 'Conjunto Romantic',
    price: 17500,
    image: '/products/conjunto-romantic.svg',
    rating: 4.7,
    reviews: 31,
    isNew: true,
  },
  {
    id: 4,
    name: 'Brasier Push-Up',
    price: 9900,
    image: '/products/brasier-pushup.svg',
    rating: 4.6,
    reviews: 15,
    isNew: false,
  },
]

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

export default function HomePage() {
  return (
    <div className="space-y-safe-section">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="text-center space-y-safe-y px-safe-x">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="w-fit">
                Nueva Colección 2024
              </Badge>
              <h1 className="text-4xl md:text-6xl font-serif font-normal font-marcellus">
                Elegancia que
                <span className="text-[#d8ceb5]"> realza</span>
                <br />
                tu belleza
              </h1>
              <p className="text-lg text-muted-foreground max-w-md font-sans">
                Descubre nuestra colección de lencería premium diseñada para la mujer moderna que busca comodidad y estilo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
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
            <div className="relative">
              <Image
                src="/hero-image.svg"
                alt="Lencería Sakú"
                width={600}
                height={400}
                className="rounded-lg object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-[#d8ceb5]/20 rounded-full flex items-center justify-center">
                  <Icon className="h-6 w-6 text-[#d8ceb5]" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-serif font-normal font-marcellus">Productos Destacados</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Descubre nuestras piezas más populares, cuidadosamente seleccionadas por su calidad y diseño excepcional.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div key={product.id} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-lg bg-muted">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={300}
                  height={400}
                  className="object-cover w-full h-80 group-hover:scale-105 transition-transform duration-300"
                />
                {product.isNew && (
                  <Badge className="absolute top-2 left-2">
                    Nuevo
                  </Badge>
                )}
                {product.originalPrice && (
                  <Badge variant="destructive" className="absolute top-2 right-2">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </Badge>
                )}
              </div>
              <div className="space-y-2 mt-4">
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{product.rating}</span>
                  <span className="text-sm text-muted-foreground">({product.reviews})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold">${product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg" className="bg-[#d8ceb5] text-black hover:bg-[#d8ceb5]/90">
            <Link href="/productos">Ver Todos los Productos</Link>
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#d8ceb5]/10 py-16 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-serif font-normal font-marcellus">
            ¿Primera vez en Sakú?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Regístrate y recibe un 15% de descuento en tu primera compra. Además, mantente al día con nuestras últimas colecciones y ofertas exclusivas.
          </p>
          <Button size="lg">
            Registrarse Ahora
          </Button>
        </div>
      </section>
    </div>
  )
}
