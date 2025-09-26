'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ProductImage } from '@/components/ui/product-image'
import { formatPrice } from '@/lib/utils'

import { useCart } from '@/hooks/use-cart'
import { useProductBySlug } from '@/hooks/use-products'
import { useWishlist } from '@/hooks/use-wishlist'
import { ChevronLeft, Heart, Share2, ShoppingCart, AlertCircle, Truck, Shield, RotateCcw, Loader2 } from 'lucide-react'

const getColorHex = (colorName: string): string => {
  const colorMap: Record<string, string> = {
    'negro': '#000000',
    'blanco': '#ffffff',
    'rojo': '#dc2626',
    'rosa': '#ec4899',
    'azul': '#2563eb',
    'verde': '#16a34a',
    'amarillo': '#eab308',
    'morado': '#9333ea',
    'gris': '#6b7280'
  }
  return colorMap[colorName.toLowerCase()] || '#6b7280'
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string>('')
  const quantity = 1
  const { addItem, openCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()

  const resolvedParams = use(params)
  const { data: product, isLoading, error } = useProductBySlug(resolvedParams.slug)
  
  if (isLoading) {
    return (
      <div className="py-8" data-testid="product-loading">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="py-8" data-testid="product-not-found">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Producto no encontrado</h1>
          <p className="text-muted-foreground mt-2">El producto que buscas no existe.</p>
          <Button asChild className="mt-4">
            <Link href="/productos">Volver a Productos</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Get available sizes and colors from variants
  const availableSizes = [...new Set(product.variants?.map(v => v.size) || [])]
  const availableColors = [...new Set(product.variants?.map(v => v.color) || [])]
  
  // Get selected variant
  const selectedVariant = product.variants?.find(
    v => v.size === selectedSize && v.color === selectedColor && v.is_active
  )
  
  const finalPrice = selectedVariant ? product.base_price + (selectedVariant.price_adjustment || 0) : product.base_price
  const comparePrice = product.compare_at_price
  const hasComparePrice = comparePrice && comparePrice > finalPrice
  const isOnSale = hasComparePrice
  const isNew = new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days

  const handleAddToCart = () => {
    if (!selectedVariant) return
    
    addItem({
      productId: product.id,
      name: product.name,
      price: finalPrice,
      image: product.images?.[0] || '/images/placeholder-product.svg',
      size: selectedSize,
      color: selectedColor,
      quantity: quantity,
      maxStock: selectedVariant.stock_quantity
    })
    openCart()
  }

  const isInStock = selectedVariant && selectedVariant.stock_quantity > 0
  const canAddToCart = selectedSize && selectedColor && isInStock

  return (
    <div className="py-8 px-4 md:px-6 lg:px-8" data-testid="product-detail">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
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
            <ProductImage
              src={product.images?.[0] || ''}
              alt={product.name}
              fill
              className="object-cover"
              data-testid="product-image"
            />
            {isOnSale && (
              <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600">
                Oferta
              </Badge>
            )}
            {isNew && (
              <Badge className="absolute top-4 right-4 bg-green-500 hover:bg-green-600">
                Nuevo
              </Badge>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2" data-testid="product-name">
              {product.name}
            </h1>
            <p className="text-muted-foreground" data-testid="product-description">
              {product.description}
            </p>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold" data-testid="product-price">
                {formatPrice(finalPrice)}
              </span>
              {hasComparePrice && (
                <span className="text-lg text-muted-foreground line-through" data-testid="product-compare-price">
                  {formatPrice(comparePrice)}
                </span>
              )}
            </div>
            {hasComparePrice && (
              <p className="text-sm text-green-600">
                Ahorrás {formatPrice(comparePrice - finalPrice)}
              </p>
            )}
          </div>

          {/* Variant Selector */}
          <div className="space-y-4">
            {/* Size Selection */}
            <div>
              <label className="text-sm font-medium mb-3 block">Talle</label>
              <div className="flex gap-2">
                {availableSizes.map((size) => {
                  const sizeVariants = product.variants?.filter(v => v.size === size && v.is_active) || []
                  const hasStock = sizeVariants.some(v => v.stock_quantity > 0)
                  
                  return (
                    <Button
                      data-testid="size-selector"
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
                  const colorVariants = product.variants?.filter(v => v.color === color && v.is_active) || []
                  const hasStock = colorVariants.some(v => v.stock_quantity > 0)
                  const colorHex = getColorHex(color || '')
                  
                  return (
                    <button
                      data-testid="color-selector"
                      key={color}
                      onClick={() => setSelectedColor(color || '')}
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
          </div>

          {/* Stock Status */}
          {selectedVariant && (
            <div className="flex items-center gap-2">
              {isInStock ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-green-600" data-testid="stock-status">
                    En stock ({selectedVariant.stock_quantity} disponibles)
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-sm text-red-600" data-testid="stock-status">
                    Sin stock
                  </span>
                </>
              )}
            </div>
          )}

          {/* Add to Cart */}
          <div className="space-y-4">
            <Button
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className="w-full"
              size="lg"
              data-testid="add-to-cart-button"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {!selectedSize || !selectedColor 
                ? 'Selecciona talle y color' 
                : !isInStock 
                ? 'Sin stock' 
                : 'Agregar al carrito'
              }
            </Button>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => toggleWishlist(product.id)}
              >
                <Heart 
                  className={`h-4 w-4 mr-2 transition-colors ${
                    isInWishlist(product.id) 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-muted-foreground'
                  }`} 
                />
                {isInWishlist(product.id) ? 'En Favoritos' : 'Favoritos'}
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
            </div>
          </div>

          {/* Product Features */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Envío gratis</p>
                  <p className="text-sm text-muted-foreground">En compras superiores a $50.000</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Compra protegida</p>
                  <p className="text-sm text-muted-foreground">Garantía de satisfacción</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Cambios y devoluciones</p>
                  <p className="text-sm text-muted-foreground">Hasta 30 días</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Notice */}
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    Importante
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Por razones de higiene, la lencería no admite cambios ni devoluciones una vez retirada del empaque.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}