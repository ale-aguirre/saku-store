'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { ShoppingCart, Heart, Eye } from 'lucide-react'
import { ProductImage } from '@/components/ui/product-image'
import type { ProductWithVariantsAndStock } from '@/types/catalog'
import { categoryRequiresSizes } from '@/types/catalog'
import { useCart } from '@/hooks/use-cart'
import { useState } from 'react'
import { useWishlist } from '@/hooks/use-wishlist'
import { cn, formatPrice } from '@/lib/utils'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ProductCardProps {
  product: ProductWithVariantsAndStock
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem, openCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [selectedSize, setSelectedSize] = useState<string | null>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  
  // Determinar si el producto requiere talles
  const requiresSizes = categoryRequiresSizes(product.category || '')
  // No discount logic since compare_at_price is not in the current schema
  const hasDiscount = false
  const discountPercentage = 0

  const isInStock = product.total_stock > 0
  // Lógica de badges de inventario:
  // Mostrar "Últimas unidades" solo si hay menos de 5 unidades en total
  // Ocultar badge si hay más de 30 unidades (implícito al usar < 5)
  const isLowStock = product.total_stock > 0 && product.total_stock < 5

  // Usar la primera imagen disponible o null para que ProductImage maneje el fallback
  const primaryImage = product.images?.[0] || null

  return (
    <Card 
      data-testid="product-card"
      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}
    >
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {!isInStock && (
          <Badge variant="destructive" className="text-xs">
            Agotado
          </Badge>
        )}
        {isInStock && isLowStock && (
          <Badge variant="secondary" className="text-xs">
            Últimas unidades
          </Badge>
        )}
        {hasDiscount && (
          <Badge variant="destructive" className="text-xs">
            -{discountPercentage}%
          </Badge>
        )}
        {product.is_featured && (
          <Badge className="bg-primary text-primary-foreground text-xs">
            Destacado
          </Badge>
        )}
      </div>

      {/* Wishlist button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100"
        aria-label={isInWishlist(product.id) ? "Remover de favoritos" : "Agregar a favoritos"}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toggleWishlist(product.id)
        }}
      >
        <Heart 
          className={cn(
            "h-4 w-4 transition-colors",
            isInWishlist(product.id) 
              ? "fill-red-500 text-red-500" 
              : "text-muted-foreground hover:text-red-500"
          )} 
        />
      </Button>

      {/* Product Image */}
      <Link href={`/productos/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <ProductImage
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          {!isInStock && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
              <span className="text-sm font-medium text-muted-foreground">
                Sin stock
              </span>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-3 sm:p-4">
        <Link href={`/productos/${product.slug}`} className="block">
          <h3 className="font-medium text-sm sm:text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Available variants info */}
        {requiresSizes && (
          <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
            {product.available_sizes.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Talles: {product.available_sizes.join(', ')}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
          {product.available_colors.length > 0 && (
            <div className="flex gap-1">
              {product.available_colors.map((color) => (
                <div
                  key={color}
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-border"
                  style={{ 
                    backgroundColor: color.toLowerCase() === 'negro' ? '#000000' : 
                                   color.toLowerCase() === 'rojo' ? '#dc2626' : 
                                   color.toLowerCase() === 'blanco' ? '#ffffff' : color 
                  }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          {product.price_range.min === product.price_range.max ? (
            <span className="font-semibold text-base sm:text-lg">
              {formatPrice(product.price_range.min)}
            </span>
          ) : (
            <span className="font-semibold text-base sm:text-lg">
              {formatPrice(product.price_range.min)} - {formatPrice(product.price_range.max)}
            </span>
          )}
          

        </div>

        {/* Hygiene notice - removed as field doesn't exist in current schema */}
      </CardContent>

      <CardFooter className="p-3 sm:p-4 pt-0">
        <div className="flex gap-2 w-full">
          <Button 
            asChild 
            className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
            disabled={!isInStock}
          >
            <Link href={`/productos/${product.slug}`}>
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Ver producto
            </Link>
          </Button>
          
          <Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9"
                disabled={!isInStock}
                aria-label="Agregar al carrito"
              >
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Agregar al carrito</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {requiresSizes 
                      ? 'Selecciona talle y color para agregar al carrito'
                      : 'Selecciona color para agregar al carrito'
                    }
                  </p>
                </div>
                
                {/* Size Selection - Solo para productos que requieren talles */}
                {requiresSizes && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Talle</label>
                    <Select value={selectedSize || ''} onValueChange={setSelectedSize}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un talle" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.available_sizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {/* Color Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color</label>
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un color" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.available_colors.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color.charAt(0).toUpperCase() + color.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-between pt-4">
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button 
                    disabled={requiresSizes ? (!selectedSize || !selectedColor) : !selectedColor}
                    onClick={() => {
                      // Encontrar la variante seleccionada
                      const variant = product.variants.find(
                        v => (requiresSizes ? v.size === selectedSize : v.size === null) && 
                             v.color === selectedColor && v.is_active
                      );
                      
                      if (variant && variant.is_in_stock) {
                        // Calcular precio final
                        const finalPrice = product.base_price + (variant.price_adjustment || 0);
                        
                        // Agregar al carrito
                        addItem({
                          productId: product.id,
                          name: product.name,
                          price: finalPrice,
                          image: product.images?.[0] || '/images/placeholder-product.svg',
                          size: requiresSizes ? selectedSize : undefined,
                          color: selectedColor,
                          quantity: 1,
                          maxStock: variant.stock_quantity || 0
                        });
                        
                        // Cerrar diálogo y abrir carrito
                        setQuickAddOpen(false);
                        openCart();
                        
                        // Resetear selecciones
                        setSelectedSize('');
                        setSelectedColor('');
                      }
                    }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>
    </Card>
  )
}