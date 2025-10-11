'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Plus, 
  Trash2,
  Save
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'

interface ProductVariant {
  size: string
  color: string
  stock_quantity: number
  sku: string
}

const SIZES = ['85', '90', '95', '100']
const COLORS = ['Negro', 'Rojo', 'Blanco']


export default function NewProductPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Product form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    base_price: '',
    brand: '',
    category_id: '',
    is_active: true,
    is_featured: false,
    images: ['']
  })
  
  // Variants
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [newVariant, setNewVariant] = useState<ProductVariant>({
    size: '',
    color: '',
    stock_quantity: 0,
    sku: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateSKU = (name: string, size: string, color: string) => {
    const nameCode = name.substring(0, 3).toUpperCase()
    const sizeCode = size
    const colorCode = color.substring(0, 3).toUpperCase()
    return `${nameCode}-${sizeCode}-${colorCode}`
  }

  const addVariant = () => {
    if (!newVariant.size || !newVariant.color) return
    
    const sku = generateSKU(formData.name, newVariant.size, newVariant.color)
    const variantExists = variants.some(v => v.size === newVariant.size && v.color === newVariant.color)
    
    if (variantExists) {
      alert('Ya existe una variante con este talle y color')
      return
    }
    
    setVariants(prev => [...prev, { ...newVariant, sku }])
    setNewVariant({ size: '', color: '', stock_quantity: 0, sku: '' })
  }

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return
    if (!formData.name || !formData.sku || !formData.base_price) {
      alert('Por favor completa todos los campos obligatorios (nombre, SKU, precio base)')
      return
    }
    
    if (variants.length === 0) {
      alert('Debes agregar al menos una variante')
      return
    }

    setIsSubmitting(true)
    
    try {
      const supabase = createClient()
      
      // Create product
      const { data: product, error: productError } = await (supabase as any)
        .from('products')
        .insert({
          name: formData.name,
          description: formData.description || null,
          sku: formData.sku,
          base_price: Math.round(parseFloat(formData.base_price) * 100), // Convert to centavos
          brand: formData.brand || null,
          category_id: formData.category_id || null,
          is_active: formData.is_active,
          is_featured: formData.is_featured,
          images: formData.images.filter(img => img.trim() !== '') // Remove empty strings
        })
        .select()
        .single()

      if (productError) throw productError

      // Create variants
      const variantsToInsert = variants.map(variant => ({
        product_id: (product as any).id,
        size: variant.size,
        color: variant.color,
        stock_quantity: variant.stock_quantity,
        sku: variant.sku
      }))

      const { error: variantsError } = await (supabase as any)
        .from('product_variants')
        .insert(variantsToInsert)

      if (variantsError) throw variantsError

      router.push('/admin/productos')
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Error al crear el producto. Intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="py-8 text-center">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Acceso restringido</h1>
        <p className="text-muted-foreground">No tienes permisos para acceder a esta página.</p>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/productos">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Nuevo Producto</h1>
          <p className="text-muted-foreground">Crea un nuevo producto para tu catálogo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Producto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej: Conjunto Elegance"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe las características del producto..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder="SKU-001"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="base_price">Precio Base (en pesos) *</Label>
                  <Input
                    id="base_price"
                    type="number"
                    step="1"
                    value={formData.base_price}
                    onChange={(e) => handleInputChange('base_price', e.target.value)}
                    placeholder="15000"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    placeholder="Marca del producto"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category_id">Categoría</Label>
                <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin categoría</SelectItem>
                    {/* TODO: Cargar categorías desde la DB */}
                    <SelectItem value="conjuntos">Conjuntos</SelectItem>
                    <SelectItem value="corpinos">Corpiños</SelectItem>
                    <SelectItem value="bombachas">Bombachas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="images">URLs de Imágenes</Label>
                <div className="space-y-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={image}
                        onChange={(e) => {
                          const newImages = [...formData.images]
                          newImages[index] = e.target.value
                          setFormData(prev => ({ ...prev, images: newImages }))
                        }}
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                      {formData.images.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newImages = formData.images.filter((_, i) => i !== index)
                            setFormData(prev => ({ ...prev, images: newImages }))
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, images: [...prev.images, ''] }))
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar imagen
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                />
                <Label htmlFor="is_active">Producto activo</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                />
                <Label htmlFor="is_featured">Producto destacado</Label>
              </div>
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader>
              <CardTitle>Variantes del Producto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Variant Form */}
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium">Agregar Variante</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Talle</Label>
                    <Select value={newVariant.size} onValueChange={(value) => setNewVariant(prev => ({ ...prev, size: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {SIZES.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Color</Label>
                    <Select value={newVariant.color} onValueChange={(value) => setNewVariant(prev => ({ ...prev, color: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {COLORS.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Stock Inicial</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newVariant.stock_quantity}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>

                <Button type="button" onClick={addVariant} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Variante
                </Button>
              </div>

              {/* Variants List */}
              <div className="space-y-2">
                <h4 className="font-medium">Variantes Agregadas ({variants.length})</h4>
                {variants.map((variant, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex gap-2">
                      <Badge variant="outline">Talle {variant.size}</Badge>
                      <Badge variant="outline">{variant.color}</Badge>
                      <Badge variant="outline">{variant.stock_quantity} unidades</Badge>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeVariant(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {variants.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No hay variantes agregadas
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link href="/admin/productos">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Guardando...' : 'Crear Producto'}
          </Button>
        </div>
      </form>
    </div>
  )
}