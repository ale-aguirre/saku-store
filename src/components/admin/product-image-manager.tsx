'use client'

import { useState } from 'react'
import { createAdminClient } from '@/lib/supabase/admin-client'
// Removed auxiliary types import - using as any directly
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon,
  ExternalLink,
  Check,
  X
} from 'lucide-react'

interface ProductImage {
  id: string
  product_id: string
  url: string
  alt_text: string | null
  is_primary: boolean
  sort_order: number
}

interface ProductImageManagerProps {
  productId: string
  images: ProductImage[]
  onUpdate: () => void
}

export function ProductImageManager({ productId, images, onUpdate }: ProductImageManagerProps) {
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newImageAlt, setNewImageAlt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isValidUrl, setIsValidUrl] = useState(false)

  const validateImageUrl = (url: string) => {
    if (!url) {
      setPreviewUrl('')
      setIsValidUrl(false)
      return
    }
    
    // Simple URL validation
    try {
      new URL(url)
      setPreviewUrl(url)
      setIsValidUrl(true)
    } catch (_e) {
      setPreviewUrl('')
      setIsValidUrl(false)
    }
  }

  const handleAddImage = async () => {
    if (!newImageUrl || !isValidUrl) return
    
    setIsSubmitting(true)
    
    try {
      const supabase = createAdminClient()
      
      // Get the next sort order (currently using images.length for simplicity)
      const _nextSortOrder = images.length > 0 
        ? Math.max(...images.map(img => img.sort_order)) + 1 
        : 0
      
      // Set as primary if it's the first image (currently using images.length === 0)
      const _isPrimary = images.length === 0
      
      const { error } = await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            url: newImageUrl.trim(),
            alt_text: newImageAlt.trim() || null,
            sort_order: images.length,
            is_primary: images.length === 0
          } as any)
      
      if (error) throw error
      
      // Reset form
      setNewImageUrl('')
      setNewImageAlt('')
      setPreviewUrl('')
      setIsValidUrl(false)
      
      // Refresh images
      onUpdate()
    } catch (_error) {
      console.error('Error adding image:', _error)
      alert('Error al agregar la imagen')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) return
    
    try {
      const supabase = createAdminClient()
      
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId)
      
      if (error) throw error
      
      // Refresh images
      onUpdate()
    } catch (_error) {
      console.error('Error deleting image:', _error)
      alert('Error al eliminar la imagen')
    }
  }

  const handleSetPrimary = async (imageId: string) => {
    try {
      const supabase = createAdminClient()
      
      // First, set all images as non-primary
      const { error: updateAllError } = await supabase
        .from('product_images')
        .update({ is_primary: false } as any)
        .eq('product_id', productId)
      
      if (updateAllError) throw updateAllError
      
      // Then, set the selected image as primary
      const { error: updateOneError } = await supabase
        .from('product_images')
        .update({ is_primary: true } as any)
        .eq('id', imageId)
      
      if (updateOneError) throw updateOneError
      
      // Refresh images
      onUpdate()
    } catch (error) {
      console.error('Error setting primary image:', error)
      alert('Error al establecer la imagen principal')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Imágenes del Producto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new image form */}
        <div className="border rounded-lg p-4 space-y-4">
          <h4 className="font-medium">Agregar Nueva Imagen</h4>
          
          <div>
            <Label htmlFor="image_url">URL de la Imagen</Label>
            <Input
              id="image_url"
              value={newImageUrl}
              onChange={(e) => {
                setNewImageUrl(e.target.value)
                validateImageUrl(e.target.value)
              }}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>
          
          <div>
            <Label htmlFor="image_alt">Texto Alternativo</Label>
            <Input
              id="image_alt"
              value={newImageAlt}
              onChange={(e) => setNewImageAlt(e.target.value)}
              placeholder="Descripción de la imagen"
            />
          </div>
          
          {previewUrl && (
            <div className="border rounded p-2">
              <p className="text-sm font-medium mb-2">Vista previa:</p>
              <div className="relative h-40 bg-gray-100 rounded">
                <Image
                  src={previewUrl}
                  alt="Vista previa"
                  fill
                  className="object-contain rounded"
                  onError={() => setIsValidUrl(false)}
                  onLoad={() => setIsValidUrl(true)}
                />
              </div>
              <div className="flex items-center mt-2">
                {isValidUrl ? (
                  <span className="text-xs text-green-600 flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    URL válida
                  </span>
                ) : (
                  <span className="text-xs text-red-600 flex items-center">
                    <X className="h-3 w-3 mr-1" />
                    URL inválida o imagen no disponible
                  </span>
                )}
              </div>
            </div>
          )}
          
          <Button 
            onClick={handleAddImage} 
            disabled={isSubmitting || !newImageUrl || !isValidUrl}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Imagen
          </Button>
        </div>
        
        {/* Images list */}
        <div>
          <h4 className="font-medium mb-3">Imágenes Actuales ({images.length})</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="border rounded-lg overflow-hidden">
                <div className="relative h-40 bg-gray-100">
                  <Image
                    src={image.url}
                    alt={image.alt_text || 'Imagen del producto'}
                    fill
                    className="object-contain"
                  />
                  {image.is_primary && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-blue-500">Principal</Badge>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-500 truncate mb-2">
                    {image.url}
                  </p>
                  <div className="flex justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.open(image.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    {!image.is_primary && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleSetPrimary(image.id)}
                      >
                        Principal
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {images.length === 0 && (
              <div className="col-span-full text-center py-8 border rounded-lg">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay imágenes</h3>
                <p className="text-gray-600 mb-4">
                  Agrega imágenes para mostrar tu producto
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}