'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Ruler } from 'lucide-react'
import { ProductWithVariantsAndStock } from '@/types/catalog'

interface VariantSelectorProps {
  product: ProductWithVariantsAndStock
  selectedSize: string | null
  selectedColor: string
  onSizeChange: (size: string | null) => void
  onColorChange: (color: string) => void
  availableSizes: (string | null)[]
  availableColors: string[]
}

const sizeGuide = [
  { size: '85', bust: '83-87', underbust: '68-72' },
  { size: '90', bust: '88-92', underbust: '73-77' },
  { size: '95', bust: '93-97', underbust: '78-82' },
  { size: '100', bust: '98-102', underbust: '83-87' }
]

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

export function VariantSelector({
  product,
  selectedSize,
  selectedColor,
  onSizeChange,
  onColorChange,
  availableSizes,
  availableColors
}: VariantSelectorProps) {
  return (
    <div className="space-y-6">
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
            const sizeVariants = product.variants.filter(v => v.size === size && v.is_active)
            const hasStock = sizeVariants.some(v => (v.stock_quantity || 0) > 0)
            
            return (
              <Button
                data-testid="size-selector"
                key={size}
                variant={selectedSize === size ? "default" : "outline"}
                size="sm"
                onClick={() => onSizeChange(size)}
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
            const colorVariants = product.variants.filter(v => v.color === color && v.is_active)
            const hasStock = colorVariants.some(v => (v.stock_quantity || 0) > 0)
            const colorHex = getColorHex(color)
            
            return (
              <button
                data-testid="color-selector"
                key={color}
                onClick={() => onColorChange(color)}
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
  )
}