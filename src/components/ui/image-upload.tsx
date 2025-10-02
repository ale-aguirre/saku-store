'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'
import { uploadImage, deleteImage, getPathFromUrl } from '@/lib/storage'

interface ImageUploadProps {
  value?: string[]
  onChange: (images: string[]) => void
  multiple?: boolean
  maxImages?: number
  className?: string
  label?: string
  description?: string
}

export function ImageUpload({
  value = [],
  onChange,
  multiple = false,
  maxImages = 5,
  className = '',
  label = 'Imágenes',
  description = 'Sube imágenes desde tu equipo'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      const newImages: string[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          console.warn(`Archivo ${file.name} no es una imagen válida`)
          continue
        }

        // Validar tamaño (máximo 10MB)
        if (file.size > 10 * 1024 * 1024) {
          console.warn(`Archivo ${file.name} es demasiado grande (máximo 10MB)`)
          continue
        }

        // Subir imagen a Supabase Storage
        const result = await uploadImage(file, 'products', 'uploads')
        
        if (result.error) {
          console.error(`Error subiendo ${file.name}:`, result.error)
          continue
        }

        newImages.push(result.url)

        // Si no es múltiple, solo tomar la primera imagen
        if (!multiple) break
      }

      // Asegurar que value sea siempre un array
      const currentValue = Array.isArray(value) ? value : [];
      console.log('🖼️ Imágenes actuales:', currentValue);
      console.log('🖼️ Nuevas imágenes:', newImages);

      if (multiple) {
        // Combinar con imágenes existentes, respetando el límite
        const combinedImages = [...currentValue, ...newImages].slice(0, maxImages)
        console.log('🖼️ Imágenes combinadas:', combinedImages);
        onChange(combinedImages)
      } else {
        // Reemplazar imagen existente
        console.log('🖼️ Reemplazando con:', newImages.slice(0, 1));
        onChange(newImages.slice(0, 1))
      }
    } catch (error) {
      console.error('Error al procesar imágenes:', error)
    } finally {
      setIsUploading(false)
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = async (index: number) => {
    const imageUrl = value[index]
    
    // Si es una URL de Supabase Storage, eliminar el archivo
    if (imageUrl && imageUrl.includes('supabase')) {
      try {
        const path = getPathFromUrl(imageUrl)
        if (path) {
          await deleteImage(path, 'products')
        }
      } catch (error) {
        console.error('Error eliminando imagen:', error)
      }
    }
    
    const newImages = value.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Input oculto */}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Botón de carga */}
      <Button
        type="button"
        variant="outline"
        onClick={openFileDialog}
        disabled={isUploading || (!multiple && value.length >= 1) || (multiple && value.length >= maxImages)}
        className="w-full h-32 border-dashed border-2 hover:border-primary/50"
      >
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium">
              {isUploading ? 'Subiendo...' : 'Seleccionar imágenes'}
            </p>
            <p className="text-sm text-muted-foreground">
              {multiple 
                ? `Máximo ${maxImages} imágenes (${value.length}/${maxImages})`
                : 'Una imagen'
              }
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, WEBP hasta 5MB
            </p>
          </div>
        </div>
      </Button>

      {/* Preview de imágenes */}
      {value.length > 0 && (
        <div className="space-y-3" data-testid="uploaded-images">
          <Label className="text-sm font-medium">
            Imágenes seleccionadas ({value.length})
          </Label>
          <div className={`grid gap-3 ${multiple ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
            {value.map((image, index) => (
              <Card key={index} className="relative group">
                <CardContent className="p-2">
                  <div className="relative aspect-square rounded-md overflow-hidden bg-muted">
                    <Image
                      src={image}
                      alt={`Imagen ${index + 1}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        // Si la imagen falla al cargar, mostrar placeholder
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = `
                            <div class="flex items-center justify-center h-full">
                              <svg class="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                            </div>
                          `
                        }
                      }}
                    />
                    
                    {/* Botón de eliminar */}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {/* Indicador de imagen principal */}
                  {index === 0 && multiple && (
                    <div className="absolute top-1 left-1">
                      <div className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                        Principal
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}