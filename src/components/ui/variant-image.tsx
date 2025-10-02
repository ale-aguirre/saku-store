'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface VariantImageProps {
  variant?: {
    images?: string[] | null
  }
  productImages?: string[] | null
  alt: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
}

/**
 * Componente para mostrar imágenes de variantes con fallback a imágenes del producto
 * Lógica de fallback:
 * 1. Si la variante tiene imágenes, usa la primera
 * 2. Si no, usa la primera imagen del producto
 * 3. Si no hay imágenes, usa placeholder
 */
export function VariantImage({
  variant,
  productImages,
  alt,
  className,
  width = 400,
  height = 400,
  priority = false
}: VariantImageProps) {
  // Obtener la imagen primaria con lógica de fallback
  const primaryImage = variant?.images?.[0] || productImages?.[0] || '/images/placeholder-product.svg'

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={primaryImage}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className="object-cover w-full h-full"
        onError={(e) => {
          // Fallback si la imagen falla al cargar
          const target = e.target as HTMLImageElement
          target.src = '/images/placeholder-product.svg'
        }}
      />
    </div>
  )
}