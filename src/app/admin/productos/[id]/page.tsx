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
import { ImageUpload } from '@/components/ui/image-upload'
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
  images?: string[]
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
    is_active: true,
    image_url: '',
    images: [] as string[]
  })
  
  // Variants
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [newVariant, setNewVariant] = useState<ProductVariant>({
    size: '',
    color: '',
    stock_quantity: 0,
    sku: '',
    images: []
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
        is_active: product.is_active ?? true,
        image_url: product.image_url || '',
        images: product.images || (product.image_url ? [product.image_url] : [])
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

  const handleInputChange = (field: string, value: string | boolean) => {
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
          sku,
          images: newVariant.images || []
        })
        .select()
        .single()

      if (error) throw error

      setVariants(prev => [...prev, data])
      setNewVariant({ size: '', color: '', stock_quantity: 0, sku: '', images: [] })
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

  const updateVariantImages = async (variantId: string, newImages: string[]) => {
    try {
      const supabase = createClient()
      
      const { error } = await (supabase as any)
        .from('product_variants')
        .update({ images: newImages })
        .eq('id', variantId)

      if (error) throw error

      setVariants(prev => prev.map(v => 
        v.id === variantId ? { ...v, images: newImages } : v
      ))
    } catch (error) {
      console.error('Error updating variant images:', error)
      alert('Error al actualizar las imágenes de la variante')
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
          is_active: formData.is_active,
          image_url: formData.image_url || null,
          images: formData.images || []
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
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/productos">
          <Button variant="outline" size="sm" className="px-6 py-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Editar Producto</h1>
          <p className="text-gray-600">Modifica la información del producto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
        {/* Información Básica del Producto */}
        <Card className="shadow-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-semibold">Información Básica</CardTitle>
            <p className="text-sm text-muted-foreground">Datos principales del producto</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Nombre del Producto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ej: Conjunto Elegance"
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Descripción *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe las características del producto..."
                rows={4}
                required
                className="min-h-[120px] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium">Precio *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.00"
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">Categoría *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="h-11">
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

              <div className="space-y-2">
                <Label htmlFor="is_active" className="text-sm font-medium">Estado</Label>
                <Select 
                  value={formData.is_active ? 'true' : 'false'} 
                  onValueChange={(value) => handleInputChange('is_active', value === 'true')}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Activo</SelectItem>
                    <SelectItem value="false">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Imágenes del Producto */}
        <Card className="shadow-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-semibold">Imágenes del Producto</CardTitle>
            <p className="text-sm text-muted-foreground">Galería principal del producto</p>
          </CardHeader>
          <CardContent>
            <ImageUpload
              value={formData.images}
              onChange={(images) => setFormData(prev => ({ 
                ...prev, 
                images,
                image_url: images[0] || '' // Mantener compatibilidad con image_url
              }))}
              multiple={true}
              maxImages={5}
              label="Imágenes del Producto"
              description="Sube hasta 5 imágenes del producto. La primera será la imagen principal."
            />
          </CardContent>
        </Card>

        {/* Gestión de Variantes */}
        <Card className="shadow-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-semibold">Variantes del Producto</CardTitle>
            <p className="text-sm text-muted-foreground">Administra los talles, colores y stock de cada variante</p>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Formulario para Agregar Nueva Variante */}
            <div className="border rounded-lg p-6 space-y-6 bg-muted/30">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-lg">Agregar Nueva Variante</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Talle</Label>
                  <div className="space-y-2">
                    <Select value={newVariant.size} onValueChange={(value) => setNewVariant(prev => ({ ...prev, size: value }))}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Seleccionar talle" />
                      </SelectTrigger>
                      <SelectContent>
                        {SIZES.map((size) => (
                          <SelectItem key={size} value={size}>
                            Talle {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="O escribir talle personalizado (ej: 120)"
                      value={newVariant.size}
                      onChange={(e) => setNewVariant(prev => ({ ...prev, size: e.target.value }))}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Color</Label>
                  <div className="space-y-2">
                    <Select value={newVariant.color} onValueChange={(value) => setNewVariant(prev => ({ ...prev, color: value }))}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Seleccionar color" />
                      </SelectTrigger>
                      <SelectContent>
                        {COLORS.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color.charAt(0).toUpperCase() + color.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="O escribir color personalizado (ej: rosa)"
                      value={newVariant.color}
                      onChange={(e) => setNewVariant(prev => ({ ...prev, color: e.target.value }))}
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Stock Inicial</Label>
                <Input
                  type="number"
                  min="0"
                  value={newVariant.stock_quantity}
                  onChange={(e) => setNewVariant(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))}
                  placeholder="Cantidad inicial en stock"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Imágenes de la Variante (Opcional)</Label>
                <ImageUpload
                  value={newVariant.images || []}
                  onChange={(images) => setNewVariant(prev => ({ ...prev, images }))}
                  multiple={true}
                  maxImages={3}
                  description="Sube hasta 3 imágenes específicas para esta variante."
                />
              </div>

              <Button 
                type="button" 
                onClick={addVariant} 
                className="w-full h-12"
                disabled={!newVariant.size || !newVariant.color}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Variante
              </Button>
            </div>

            {/* Lista de Variantes Existentes */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-lg">Variantes Existentes</h4>
                <Badge variant="secondary" className="text-sm">
                  {variants.length} variante{variants.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              {variants.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-muted rounded-full">
                      <Plus className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">No hay variantes creadas aún</p>
                      <p className="text-sm">Agrega la primera variante usando el formulario de arriba</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {variants.map((variant) => (
                    <div key={variant.id} className="p-6 border rounded-lg bg-card hover:bg-muted/30 transition-colors space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-3 items-center">
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="font-medium">
                              Talle {variant.size}
                            </Badge>
                            <Badge variant="outline" className="font-medium">
                              {variant.color?.charAt(0).toUpperCase() + variant.color?.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-sm font-medium">Stock:</Label>
                            <Input
                              type="number"
                              min="0"
                              value={variant.stock_quantity}
                              onChange={(e) => updateVariantStock(variant.id!, parseInt(e.target.value) || 0)}
                              className="w-24 h-9"
                            />
                            <span className="text-sm text-muted-foreground">unidades</span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeVariant(variant.id!)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Imágenes de la variante</Label>
                        <ImageUpload
                           value={variant.images || []}
                           onChange={(urls) => updateVariantImages(variant.id!, urls)}
                           maxImages={3}
                           className="w-full"
                         />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/admin/productos')}
                className="h-12 px-8"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="h-12 px-8"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}