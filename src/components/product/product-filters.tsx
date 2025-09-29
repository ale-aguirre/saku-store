'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { ProductFilters } from '@/types/catalog'

interface ProductFiltersProps {
  filters: ProductFilters
  onFiltersChange: (filters: ProductFilters) => void
  onClearFilters?: () => void
  hasActiveFilters?: boolean
  availableCategories?: Array<{ id: string; name: string; slug: string }>
  priceRange?: { min: number; max: number }
  className?: string
}

const AVAILABLE_SIZES = ['85', '90', '95', '100']
const AVAILABLE_COLORS = [
  { value: 'negro', label: 'Negro' },
  { value: 'rojo', label: 'Rojo' },
  { value: 'blanco', label: 'Blanco' }
]

export function ProductFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  hasActiveFilters = false,
  availableCategories = [],
  priceRange = { min: 0, max: 20000 },
  className = ''
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [openSections, setOpenSections] = useState({
    category: true,
    size: true,
    color: true,
    price: true
  })

  // Estado local para el slider de precio
  const [localPriceRange, setLocalPriceRange] = useState([
    filters.min_price || priceRange.min,
    filters.max_price || priceRange.max
  ])

  // Actualizar precio local cuando cambian los filtros externos
  useEffect(() => {
    setLocalPriceRange([
      filters.min_price || priceRange.min,
      filters.max_price || priceRange.max
    ])
  }, [filters.min_price, filters.max_price, priceRange.min, priceRange.max])

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    onFiltersChange({
      ...filters,
      category_id: checked ? categoryId : undefined
    })
  }

  const handleSizeChange = (size: string, checked: boolean) => {
    onFiltersChange({
      ...filters,
      size: checked ? size : undefined
    })
  }

  const handleColorChange = (color: string, checked: boolean) => {
    onFiltersChange({
      ...filters,
      color: checked ? color : undefined
    })
  }

  const handlePriceChange = (values: number[]) => {
    setLocalPriceRange(values)
  }

  const handlePriceCommit = (values: number[]) => {
    onFiltersChange({
      ...filters,
      min_price: values[0] === priceRange.min ? undefined : values[0],
      max_price: values[1] === priceRange.max ? undefined : values[1]
    })
  }

  const handleInStockToggle = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      in_stock_only: checked || undefined
    })
  }

  const clearAllFilters = () => {
    if (onClearFilters) {
      onClearFilters()
    } else {
      onFiltersChange({})
    }
    setLocalPriceRange([priceRange.min, priceRange.max])
  }

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Contar filtros activos
  const activeFiltersCount = hasActiveFilters 
    ? Object.values(filters).filter(value => 
        value !== undefined && value !== null && value !== ''
      ).length
    : 0

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header con toggle para móvil */}
      <div className="flex items-center justify-between lg:hidden">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Filtros activos (badges) */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.category_id && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {availableCategories.find(c => c.id === filters.category_id)?.name || 'Categoría'}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleCategoryChange(filters.category_id!, false)}
              />
            </Badge>
          )}
          {filters.size && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Talle {filters.size}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleSizeChange(filters.size!, false)}
              />
            </Badge>
          )}
          {filters.color && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {AVAILABLE_COLORS.find(c => c.value === filters.color)?.label || filters.color}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleColorChange(filters.color!, false)}
              />
            </Badge>
          )}
          {(filters.min_price || filters.max_price) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {formatPrice(filters.min_price || priceRange.min)} - {formatPrice(filters.max_price || priceRange.max)}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handlePriceCommit([priceRange.min, priceRange.max])}
              />
            </Badge>
          )}
          {filters.in_stock_only && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Solo con stock
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleInStockToggle(false)}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Panel de filtros */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filtros</CardTitle>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Limpiar todo
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Categorías */}
            {availableCategories.length > 0 && (
              <Collapsible open={openSections.category} onOpenChange={() => toggleSection('category')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
                  <h3 className="font-medium">Categoría</h3>
                  {openSections.category ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 mt-3">
                  {availableCategories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={filters.category_id === category.id}
                        onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                      />
                      <Label htmlFor={`category-${category.id}`} className="text-sm font-normal">
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Talles */}
            <Collapsible open={openSections.size} onOpenChange={() => toggleSection('size')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
                <h3 className="font-medium">Talle</h3>
                {openSections.size ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3">
                {AVAILABLE_SIZES.map((size) => (
                  <div key={size} className="flex items-center space-x-2">
                    <Checkbox
                      id={`size-${size}`}
                      checked={filters.size === size}
                      onCheckedChange={(checked) => handleSizeChange(size, checked as boolean)}
                    />
                    <Label htmlFor={`size-${size}`} className="text-sm font-normal">
                      {size}
                    </Label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Colores */}
            <Collapsible open={openSections.color} onOpenChange={() => toggleSection('color')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
                <h3 className="font-medium">Color</h3>
                {openSections.color ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3">
                {AVAILABLE_COLORS.map((color) => (
                  <div key={color.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`color-${color.value}`}
                      checked={filters.color === color.value}
                      onCheckedChange={(checked) => handleColorChange(color.value, checked as boolean)}
                    />
                    <Label htmlFor={`color-${color.value}`} className="text-sm font-normal flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{
                          backgroundColor: color.value === 'negro' ? '#000000' : 
                                         color.value === 'rojo' ? '#dc2626' : 
                                         color.value === 'blanco' ? '#ffffff' : color.value
                        }}
                      />
                      {color.label}
                    </Label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Precio */}
            <Collapsible open={openSections.price} onOpenChange={() => toggleSection('price')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
                <h3 className="font-medium">Precio</h3>
                {openSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-3">
                <div className="px-2">
                  <Slider
                    value={localPriceRange}
                    onValueChange={handlePriceChange}
                    onValueCommit={handlePriceCommit}
                    max={priceRange.max}
                    min={priceRange.min}
                    step={500}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>{formatPrice(localPriceRange[0])}</span>
                    <span>{formatPrice(localPriceRange[1])}</span>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Solo con stock */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="in-stock"
                checked={filters.in_stock_only || false}
                onCheckedChange={handleInStockToggle}
              />
              <Label htmlFor="in-stock" className="text-sm font-normal">
                Solo productos con stock
              </Label>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}