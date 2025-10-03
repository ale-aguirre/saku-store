'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { EditProductFormSimple } from '@/components/admin/edit-product-form-simple'
import { updateProduct } from '@/app/admin/productos/actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string | null
  base_price: number
  sku: string
  category_id: string | null
  brand: string | null
  category: string | null
  is_active: boolean | null
  is_featured: boolean | null
  images: string[] | null
  slug: string | null
  created_at: string | null
  updated_at: string | null
}

interface ProductVariant {
  id?: string
  size: string
  color: string
  stock_quantity: number | null
  sku: string
  product_id?: string | null
  images?: string[] | null
  price?: number | null
  price_adjustment?: number | null
  material?: string | null
  is_active?: boolean | null
  low_stock_threshold?: number | null
  created_at?: string | null
  updated_at?: string | null
}



const CATEGORIES = ['Brasieres', 'Conjuntos', 'Bombachas', 'Camisones']

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, loading: authLoading } = useAuth()
  const _router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [productId, setProductId] = useState<string>('')
  
  // Product form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    price: '',
    category: '',
    is_active: true,
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
      
      // Cargar imágenes del producto desde el campo images
      const productImages = product.images || []
      console.log('🖼️ Imágenes del producto cargadas:', productImages)
      
      setFormData({
        name: product.name,
        description: product.description || '',
        sku: product.sku || '',
        price: product.base_price.toString(), // base_price ya es decimal
        category: product.category_id || '',
        is_active: product.is_active ?? true,
        images: productImages
      })

      // Fetch variants
      const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)

      if (variantsError) throw variantsError

      setVariants(variantsData || [])
      
      // Images are now loaded from the products.images field
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
    console.log('🚀 Iniciando handleSubmit...')
    e.preventDefault()
    
    console.log('📋 FormData actual:', formData)
    
    // Validar campos obligatorios
    if (!formData.name || !formData.price || !formData.category) {
      console.log('❌ Faltan campos obligatorios')
      alert('Por favor completa todos los campos obligatorios')
      return
    }

    console.log('✅ Iniciando guardado...')
    setIsSubmitting(true)
    
    try {
      // Procesar imágenes: asegurar que sean un array válido, limpiar URLs y eliminar duplicados
      console.log('🖼️ Procesando imágenes antes de guardar:', formData.images);
      
      // Asegurar que formData.images sea un array
      const imagesArray = Array.isArray(formData.images) ? formData.images : [];
      console.log('🖼️ Array de imágenes confirmado:', imagesArray);
      
      // Limpiar y procesar imágenes de manera más estricta
      const processedImages = imagesArray
        .filter(img => img && typeof img === 'string' && img.trim() !== '') // Solo strings válidos
        .map(img => img.replace(/[`'"]/g, '').trim()) // Limpiar caracteres problemáticos
        .filter((img, index, self) => self.indexOf(img) === index); // Eliminar duplicados
      
      console.log('🖼️ Imágenes procesadas finales:', processedImages);
      
      // Crear FormData para la server action
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('slug', formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
      formDataToSend.append('description', formData.description || '')
      formDataToSend.append('sku', formData.sku || '')
      formDataToSend.append('base_price', parseFloat(formData.price).toString())
      formDataToSend.append('category_id', formData.category || '')
      formDataToSend.append('is_active', formData.is_active.toString())
      formDataToSend.append('is_featured', 'false')
      formDataToSend.append('images', JSON.stringify(processedImages))
      
      console.log('🖼️ Imágenes a guardar (limpias):', processedImages)
      console.log('🔄 Enviando datos a server action...')
      
      // Usar server action
      const result = await updateProduct(productId, formDataToSend)
      
      if (!result.success) {
        throw new Error(result.error || 'Error desconocido')
      }
      
      console.log('✅ Producto actualizado correctamente:', result.data);
      console.log('✅ Imágenes guardadas:', result.data?.images);

      toast.success('Producto guardado correctamente')
      // Refrescar datos del producto en la misma página para reflejar cambios
      await fetchProduct()
    } catch (error) {
      console.error('💥 Error updating product:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el producto'
      toast.error(errorMessage)
    } finally {
      console.log('🏁 Finalizando guardado...')
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

  // Adaptar datos para el nuevo componente
  const productForForm = product ? {
    id: product.id,
    name: formData.name,
    description: formData.description,
    base_price: parseFloat(formData.price) || 0,
    sku: formData.sku,
    category_id: formData.category,
    brand: null,
    category: null,
    is_active: formData.is_active,
    is_featured: false,
    images: formData.images,
    slug: null,
    created_at: null,
    updated_at: null
  } : null

  const categoriesForForm = CATEGORIES.map(cat => ({ id: cat, name: cat }))

  const handleProductChange = (field: string, value: any) => {
    if (field === 'base_price') {
      handleInputChange('price', value.toString())
    } else if (field === 'category_id') {
      handleInputChange('category', value)
    } else {
      handleInputChange(field, value)
    }
  }

  const handleVariantChange = (index: number, field: string, value: any) => {
    const variant = variants[index]
    if (!variant?.id) return

    if (field === 'stock_quantity') {
      updateVariantStock(variant.id, value)
    } else if (field === 'images') {
      updateVariantImages(variant.id, value)
    }
    // Para size y color, necesitaríamos una función de actualización completa
  }

  const handleAddVariant = () => {
    // Usar la función existente addVariant, pero necesitamos adaptar newVariant
    if (newVariant.size && newVariant.color) {
      addVariant()
    }
  }

  const handleRemoveVariant = (index: number) => {
    const variant = variants[index]
    if (variant?.id) {
      removeVariant(variant.id)
    }
  }

  if (!productForForm) return null

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

      <EditProductFormSimple
        product={productForForm}
        variants={variants}
        categories={categoriesForForm}
        onProductChange={handleProductChange}
        onVariantChange={handleVariantChange}
        onAddVariant={handleAddVariant}
        onRemoveVariant={handleRemoveVariant}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  )
}