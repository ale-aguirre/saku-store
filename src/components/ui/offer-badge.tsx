'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface OfferBadgeProps {
  discountPercentage: number
  className?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary'
}

export function OfferBadge({ 
  discountPercentage, 
  className,
  variant = 'destructive' 
}: OfferBadgeProps) {
  // No mostrar badge si el descuento es 0 o menor
  if (discountPercentage <= 0) {
    return null
  }

  return (
    <Badge 
      variant={variant}
      className={cn(
        "text-xs font-semibold",
        variant === 'destructive' && "bg-red-600 text-white hover:bg-red-700",
        className
      )}
    >
      -{Math.round(discountPercentage)}%
    </Badge>
  )
}
