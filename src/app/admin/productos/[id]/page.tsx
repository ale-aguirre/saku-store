'use client'

import { useState, useEffect, useCallback } from 'react'
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

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  status: string
  image_url: string | null
  created_at: string
}

interface ProductVariant {
  id?: string
  size: string
  color: string
  stock_quantity: number
  sku: string
  product_id?: string
}



const SIZES = ['85', '90', '95', '100']
const COLORS = ['Negro', 'Rojo', 'Blanco']
const CATEGORIES = ['Brasieres', 'Conjuntos', 'Bombachas', 'Camisones']

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [productId, setProductId] = useState<string>('')
  
  // Product form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    status: 'active',
    image_url: ''
  })
  
  // Variants
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [newVariant, setNewVariant] = useState<ProductVariant>({
    size: '',
    color: '',
    stock_quantity: 0,
    sku: ''
  })

  // Resolve params promise
  useEffect(() => {
    params.then(resolvedParams => {
      setProductId(resolvedParams.id)
    })
  }, [params])

  const fetchProduct = useCallback(async () => {
    if (!productId) return
    
    try {
      const supabase = createClient()
      
      // Fetch product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (productError) throw productError

      setProduct(productData)
      const product = productData as any
      setFormData({
        name: product.name,
        description: product.description,
        price: (product.price / 100).toString(), // Convert from cents
        category: product.category,
        status: product.status,
        image_url: product.image_url || ''
      })

      // Fetch variants
      const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)

      if (variantsError) throw variantsError

      setVariants(variantsData || [])
      
      // Fetch product images
      // Images are now handled by ProductImageManager component
    } catch (error) {
      console.error('Error fetching product:', error)
      alert('Error al cargar el producto')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    if (user && productId) {
      fetchProduct()
    }
  }, [user, productId, fetchProduct])

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

  const addVariant = async () => {
    if (!newVariant.size || !newVariant.color) return
    
    const sku = generateSKU(formData.name, newVariant.size, newVariant.color)
    const variantExists = variants.some(v => v.size === newVariant.size && v.color === newVariant.color)
    
    if (variantExists) {
      alert('Ya existe una variante con este talle y color')
      return
    }

    try {
      const supabase = createClient()
      
      const { data, error } = await (supabase as any)
        .from('product_variants')
        .insert({
          product_id: productId,
          size: newVariant.size,
          color: newVariant.color,
          stock_quantity: newVariant.stock_quantity,
          sku
        })
        .select()
        .single()

      if (error) throw error

      setVariants(prev => [...prev, data])
      setNewVariant({ size: '', color: '', stock_quantity: 0, sku: '' })
    } catch (error) {
      console.error('Error adding variant:', error)
      alert('Error al agregar la variante')
    }
  }

  const removeVariant = async (variantId: string) => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variantId)

      if (error) throw error

      setVariants(prev => prev.filter(v => v.id !== variantId))
    } catch (error) {
      console.error('Error removing variant:', error)
      alert('Error al eliminar la variante')
    }
  }

  const updateVariantStock = async (variantId: string, newStock: number) => {
    try {
      const supabase = createClient()
      
      const { error } = await (supabase as any)
        .from('product_variants')
        .update({ stock_quantity: newStock })
        .eq('id', variantId)

      if (error) throw error

      setVariants(prev => prev.map(v => 
        v.id === variantId ? { ...v, stock_quantity: newStock } : v
      ))
    } catch (error) {
      console.error('Error updating stock:', error)
      alert('Error al actualizar el stock')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !product) return
    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      alert('Por favor completa todos los campos obligatorios')
      return
    }

    setIsSubmitting(true)
    
    try {
      const supabase = createClient()
      
      // Update product
      const { error: productError } = await (supabase as any)
        .from('products')
        .update({
          name: formData.name,
          description: formData.description,
          price: Math.round(parseFloat(formData.price) * 100), // Convert to cents
          category: formData.category,
          status: formData.status,
          image_url: formData.image_url || null
        })
        .eq('id', productId)

      if (productError) throw productError

      router.push('/admin/productos')
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Error al actualizar el producto. Intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Acceso restringido</h1>
        <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
        <p className="text-gray-600">El producto que buscas no existe.</p>
        <Link href="/admin/productos">
          <Button className="mt-4">Volver a productos</Button>
        </Link>
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
        <div>
          <h1 className="text-3xl font-bold">Editar Producto</h1>
          <p className="text-gray-600">Modifica la información del producto</p>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Precio *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoría *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="image_url">URL de Imagen</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div>
                <Label htmlFor="status">Estado</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
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
                <h4 className="font-medium">Agregar Nueva Variante</h4>
                
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
                <h4 className="font-medium">Variantes Existentes ({variants.length})</h4>
                {variants.map((variant) => (
                  <div key={variant.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex gap-2 items-center">
                      <Badge variant="outline">Talle {variant.size}</Badge>
                      <Badge variant="outline">{variant.color}</Badge>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          value={variant.stock_quantity}
                          onChange={(e) => updateVariantStock(variant.id!, parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                        <span className="text-sm text-gray-500">unidades</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeVariant(variant.id!)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {variants.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No hay variantes para este producto
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
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </div>
  )
}