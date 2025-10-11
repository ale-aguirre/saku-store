'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageUpload } from '@/components/ui/image-upload'
import { 
  Plus, 
  Trash2,
  Save,
  Package,
  Image as ImageIcon,
  Settings
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Product, ProductVariant } from '@/types/catalog'

interface EditProductFormProps {
  product: Product
  variants: ProductVariant[]
  categories: Array<{ id: string; name: string }>
  onProductChange: (field: string, value: any) => void
  onVariantChange: (index: number, field: string, value: any) => void
  onAddVariant: () => void
  onRemoveVariant: (index: number) => void
  onSubmit: (e: React.FormEvent) => void
  isLoading: boolean
}

export function EditProductFormSimple({
  product,
  variants,
  categories,
  onProductChange,
  onVariantChange,
  onAddVariant,
  onRemoveVariant,
  onSubmit,
  isLoading
}: EditProductFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Información Básica
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Imágenes
          </TabsTrigger>
          <TabsTrigger value="variants" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Variantes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Producto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del producto</Label>
                  <Input
                    id="name"
                    value={product.name}
                    onChange={(e) => onProductChange('name', e.target.value)}
                    placeholder="Ej: Conjunto de encaje"
                    required
                  />
                </div>
                {/* SKU no está en el schema de products - se maneja a nivel de variantes */}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={product.description || ''}
                  onChange={(e) => onProductChange('description', e.target.value)}
                  placeholder="Describe el producto..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio base (en pesos)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="1"
                    value={product.base_price ? product.base_price / 100 : ''}
                    onChange={(e) => onProductChange('base_price', parseFloat(e.target.value) * 100)}
                    placeholder="15000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={product.category_id || ''}
                    onValueChange={(value) => onProductChange('category_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Brand no está en el schema de products */}
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={product.is_active || false}
                    onChange={(e) => onProductChange('is_active', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_active">Producto activo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={product.is_featured || false}
                    onChange={(e) => onProductChange('is_featured', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_featured">Producto destacado</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Imágenes del Producto</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={product.images || []}
                onChange={(images) => onProductChange('images', images)}
                maxImages={5}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variants" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Variantes del Producto</CardTitle>
              <Button
                type="button"
                onClick={onAddVariant}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Agregar Variante
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Variante {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveVariant(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Talle</Label>
                      <Select
                        value={variant.size}
                        onValueChange={(value) => onVariantChange(index, 'size', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Talle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="85">85</SelectItem>
                          <SelectItem value="90">90</SelectItem>
                          <SelectItem value="95">95</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <Select
                        value={variant.color}
                        onValueChange={(value) => onVariantChange(index, 'color', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Color" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="negro">Negro</SelectItem>
                          <SelectItem value="rojo">Rojo</SelectItem>
                          <SelectItem value="blanco">Blanco</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Stock</Label>
                      <Input
                        type="number"
                        min="0"
                        value={variant.stock_quantity || ''}
                        onChange={(e) => onVariantChange(index, 'stock_quantity', parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Umbral stock bajo</Label>
                      <Input
                        type="number"
                        min="0"
                        value={variant.low_stock_threshold || ''}
                        onChange={(e) => onVariantChange(index, 'low_stock_threshold', parseInt(e.target.value) || 5)}
                        placeholder="5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label>Precio de comparación (oferta)</Label>
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        value={variant.compare_at_price ? variant.compare_at_price / 100 : ''}
                        onChange={(e) => {
                          const value = e.target.value
                          const priceInDB = value ? Math.round(parseFloat(value) * 100) : null
                          onVariantChange(index, 'compare_at_price', priceInDB)
                        }}
                        placeholder="Precio original (opcional)"
                      />
                      <p className="text-xs text-muted-foreground">
                        Precio antes del descuento. Debe ser mayor al precio final.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>SKU de la variante</Label>
                      <Input
                        value={variant.sku}
                        onChange={(e) => onVariantChange(index, 'sku', e.target.value)}
                        placeholder="Ej: CONJ-001-85-NEGRO"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Imágenes de la variante</Label>
                    <ImageUpload
                      value={Array.isArray(variant.images) ? variant.images as string[] : []}
                      onChange={(images) => onVariantChange(index, 'images', images)}
                      maxImages={3}
                    />
                  </div>
                </div>
              ))}
              
              {variants.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay variantes. Agrega al menos una variante para el producto.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/productos">Cancelar</Link>
        </Button>
        <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  )
}