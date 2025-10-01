'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

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

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          console.warn(`Archivo ${file.name} es demasiado grande (máximo 5MB)`)
          continue
        }

        // Convertir a base64 para preview (en producción se subiría a un servicio)
        const base64 = await fileToBase64(file)
        newImages.push(base64)

        // Si no es múltiple, solo tomar la primera imagen
        if (!multiple) break
      }

      if (multiple) {
        // Combinar con imágenes existentes, respetando el límite
        const combinedImages = [...value, ...newImages].slice(0, maxImages)
        onChange(combinedImages)
      } else {
        // Reemplazar imagen existente
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

  const removeImage = (index: number) => {
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
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Imágenes seleccionadas ({value.length})
          </Label>
          <div className={`grid gap-3 ${multiple ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
            {value.map((image, index) => (
              <Card key={index} className="relative group">
                <CardContent className="p-2">
                  <div className="relative aspect-square rounded-md overflow-hidden bg-muted">
                    {image.startsWith('data:') ? (
                      <Image
                        src={image}
                        alt={`Imagen ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        <span className="sr-only">URL: {image}</span>
                      </div>
                    )}
                    
                    {/* Botón de eliminar */}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
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

// Función auxiliar para convertir archivo a base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}