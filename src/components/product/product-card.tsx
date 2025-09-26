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
  const [selectedSize, setSelectedSize] = useState<string | null>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  
  // Determinar si el producto requiere talles
  const requiresSizes = categoryRequiresSizes(product.category?.slug || '')
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.base_price
  const discountPercentage = hasDiscount 
    ? Math.round(((product.compare_at_price! - product.base_price) / product.compare_at_price!) * 100)
    : 0

  const isInStock = product.total_stock > 0
  const isLowStock = product.variants.some(v => v.is_low_stock)

  // Usar la primera imagen disponible o null para que ProductImage maneje el fallback
  const primaryImage = product.images?.[0] || null

  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}>
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
        aria-label="Agregar a favoritos"
      >
        <Heart className="h-4 w-4" />
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

      <CardContent className="p-4">
        <Link href={`/productos/${product.slug}`} className="block">
          <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Available variants info */}
        {requiresSizes && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.available_sizes.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Talles: {product.available_sizes.join(', ')}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-1 mb-3">
          {product.available_colors.length > 0 && (
            <div className="flex gap-1">
              {product.available_colors.map((color) => (
                <div
                  key={color}
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ 
                    backgroundColor: color === 'negro' ? '#000000' : 
                                   color === 'rojo' ? '#dc2626' : 
                                   color === 'blanco' ? '#ffffff' : color 
                  }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          {product.price_range.min === product.price_range.max ? (
            <span className="font-semibold text-lg">
              ${product.price_range.min.toLocaleString()}
            </span>
          ) : (
            <span className="font-semibold text-lg">
              ${product.price_range.min.toLocaleString()} - ${product.price_range.max.toLocaleString()}
            </span>
          )}
          
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.compare_at_price!.toLocaleString()}
            </span>
          )}
        </div>

        {/* Hygiene notice */}
        {product.hygiene_notice && (
          <p className="text-xs text-muted-foreground mb-3">
            Sin cambios ni devoluciones por higiene
          </p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex gap-2 w-full">
          <Button 
            asChild 
            className="flex-1"
            disabled={!isInStock}
          >
            <Link href={`/productos/${product.slug}`}>
              <Eye className="h-4 w-4 mr-2" />
              Ver producto
            </Link>
          </Button>
          
          <Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                disabled={!isInStock}
                aria-label="Agregar al carrito"
              >
                <ShoppingCart className="h-4 w-4" />
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
                          maxStock: variant.stock_quantity
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