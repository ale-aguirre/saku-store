'use client'

import { useState, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/hooks/use-cart'
import { useProduct } from '@/hooks/use-products'
import { ChevronLeft, Heart, Share2, ShoppingCart, Ruler, AlertCircle, Truck, Shield, RotateCcw, Loader2 } from 'lucide-react'



const sizeGuide = [
  { size: '85', bust: '83-87', underbust: '68-72' },
  { size: '90', bust: '88-92', underbust: '73-77' },
  { size: '95', bust: '93-97', underbust: '78-82' },
  { size: '100', bust: '98-102', underbust: '83-87' }
]

// Helper function to get color hex codes
const getColorHex = (colorName: string): string => {
  const colorMap: Record<string, string> = {
    'negro': '#000000',
    'rojo': '#dc2626',
    'blanco': '#ffffff',
    'rosa': '#ec4899',
    'azul': '#2563eb',
    'verde': '#16a34a',
    'morado': '#9333ea',
    'amarillo': '#eab308',
    'gris': '#6b7280',
    'beige': '#d8ceb5',
  }
  return colorMap[colorName.toLowerCase()] || '#6b7280'
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const { addItem, openCart } = useCart()

  const resolvedParams = use(params)
  const { data: product, isLoading, error } = useProduct(resolvedParams.id)
  
  if (isLoading) {
    return (
      <div className="py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !product) {
    notFound()
  }

  // Get available sizes and colors from variants
  const availableSizes = [...new Set(product.product_variants.filter(v => v.is_active).map(v => v.size))]
  const availableColors = [...new Set(product.product_variants.filter(v => v.is_active).map(v => v.color))]
  
  // Get selected variant
  const selectedVariant = product.product_variants.find(
    v => v.size === selectedSize && v.color === selectedColor && v.is_active
  )
  
  // Calculate price range
  const activeVariants = product.product_variants.filter(v => v.is_active && v.stock_quantity > 0)
  const prices = activeVariants.map(v => v.price)
  const comparePrices = activeVariants.map(v => v.compare_at_price).filter(Boolean) as number[]
  
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const hasComparePrice = comparePrices.length > 0
  const minComparePrice = hasComparePrice ? Math.min(...comparePrices) : null
  
  const isOnSale = hasComparePrice && minComparePrice! > minPrice
  const isNew = new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days

  const handleAddToCart = () => {
    if (!selectedVariant) return
    
    addItem({
      productId: product.id,
      name: product.name,
      price: selectedVariant.price,
      image: product.image_url || '/placeholder-product.svg',
      size: selectedSize,
      color: selectedColor,
      quantity: quantity,
      maxStock: selectedVariant.stock_quantity
    })
    openCart()
  }

  const isInStock = selectedVariant && selectedVariant.stock_quantity > 0

  return (
    <div className="py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">Inicio</Link>
        <span>/</span>
        <Link href="/productos" className="hover:text-foreground">Productos</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/productos">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Volver a Productos
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
            <Image
              src={product.image_url || '/placeholder-product.svg'}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {isNew && (
                <Badge className="bg-[#d8ceb5] text-black hover:bg-[#d8ceb5]/90">
                  Nuevo
                </Badge>
              )}
              {isOnSale && (
                <Badge variant="destructive">
                  Oferta
                </Badge>
              )}
            </div>
          </div>
          
          {/* Single Image - No thumbnails for now */}
          <div className="flex justify-center">
            <div className="text-sm text-muted-foreground">
              Imagen principal del producto
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-serif font-normal mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              {minPrice === maxPrice ? (
                <span className="text-2xl font-semibold">${minPrice.toLocaleString()}</span>
              ) : (
                <span className="text-2xl font-semibold">${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}</span>
              )}
              {selectedVariant?.compare_at_price && (
                <span className="text-lg text-muted-foreground line-through">
                  ${selectedVariant.compare_at_price.toLocaleString()}
                </span>
              )}
              {isOnSale && (
                <Badge variant="destructive">OFERTA</Badge>
              )}
              {isNew && (
                <Badge variant="secondary">NUEVO</Badge>
              )}
            </div>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          {/* Size Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Talle</label>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-[#d8ceb5] hover:text-[#d8ceb5]/80">
                    <Ruler className="h-4 w-4 mr-1" />
                    Guía de Talles
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Guía de Talles</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm font-medium">
                      <div>Talle</div>
                      <div>Busto (cm)</div>
                      <div>Contorno (cm)</div>
                    </div>
                    <Separator />
                    {sizeGuide.map((guide) => (
                      <div key={guide.size} className="grid grid-cols-3 gap-4 text-sm">
                        <div className="font-medium">{guide.size}</div>
                        <div>{guide.bust}</div>
                        <div>{guide.underbust}</div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex gap-2">
              {availableSizes.map((size) => {
                const sizeVariants = product.product_variants.filter(v => v.size === size && v.is_active)
                const hasStock = sizeVariants.some(v => v.stock_quantity > 0)
                
                return (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSize(size)}
                    disabled={!hasStock}
                    className={selectedSize === size ? "bg-[#d8ceb5] text-black hover:bg-[#d8ceb5]/90" : ""}
                  >
                    {size}
                    {!hasStock && <span className="ml-1 text-xs">(Agotado)</span>}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Color</label>
            <div className="flex gap-3">
              {availableColors.map((color) => {
                const colorVariants = product.product_variants.filter(v => v.color === color && v.is_active)
                const hasStock = colorVariants.some(v => v.stock_quantity > 0)
                const colorHex = getColorHex(color)
                
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    disabled={!hasStock}
                    className={`relative w-8 h-8 rounded-full border-2 ${
                      selectedColor === color 
                        ? 'border-[#d8ceb5] ring-2 ring-[#d8ceb5]/30' 
                        : 'border-gray-300'
                    } ${!hasStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{ backgroundColor: colorHex }}
                    title={`${color} ${!hasStock ? '(Agotado)' : ''}`}
                  >
                    {!hasStock && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-0.5 bg-red-500 rotate-45" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="text-sm font-medium mb-3 block">Cantidad</label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                disabled={!isInStock || quantity >= (selectedVariant?.stock_quantity || 0)}
              >
                +
              </Button>
            </div>
            {selectedVariant && (
              <p className="text-xs text-muted-foreground mt-1">
                Stock disponible: {selectedVariant.stock_quantity}
              </p>
            )}
          </div>

          {/* Add to Cart */}
          <div className="space-y-3">
            <Button 
              size="lg" 
              className="w-full bg-[#d8ceb5] text-black hover:bg-[#d8ceb5]/90"
              disabled={!selectedSize || !selectedColor || !isInStock}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {!isInStock && selectedSize && selectedColor ? 'Sin Stock' : 'Agregar al Carrito'}
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Heart className="h-4 w-4 mr-2" />
                Favoritos
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
            </div>
          </div>

          {/* Hygiene Notice */}
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-medium text-amber-800 dark:text-amber-200">
                    Política de Higiene
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Por razones de higiene y salud, no se aceptan devoluciones ni cambios en productos de lencería. 
                    Te recomendamos consultar nuestra guía de talles antes de realizar tu compra.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping & Returns */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Truck className="h-5 w-5 text-[#d8ceb5]" />
              <span>Envío gratis en compras superiores a $25.000</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-5 w-5 text-[#d8ceb5]" />
              <span>Compra 100% segura</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <RotateCcw className="h-5 w-5 text-[#d8ceb5]" />
              <span>Garantía de calidad</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-serif text-lg font-normal mb-4">Características</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-[#d8ceb5] rounded-full" />
                  Materiales de alta calidad
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-[#d8ceb5] rounded-full" />
                  Diseño cómodo y elegante
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-[#d8ceb5] rounded-full" />
                  Disponible en múltiples talles
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-[#d8ceb5] rounded-full" />
                  Variedad de colores
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-serif text-lg font-normal mb-4">Cuidado y Mantenimiento</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-[#d8ceb5] rounded-full" />
                  Lavar a mano con agua fría
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-[#d8ceb5] rounded-full" />
                  No usar blanqueador
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-[#d8ceb5] rounded-full" />
                  Secar a la sombra
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-[#d8ceb5] rounded-full" />
                  No planchar directamente sobre encajes
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}