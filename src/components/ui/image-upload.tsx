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
      console.log('🖼️ Archivos seleccionados:', files.length);
      console.log('🖼️ Imágenes actuales:', value);
      
      // Validar límite de imágenes
      if (multiple && files.length + value.length > maxImages) {
        alert(`Solo puedes subir hasta ${maxImages} imágenes en total`)
        setIsUploading(false)
        return
      }
      
      const newImages: string[] = []
      const errors: string[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        console.log(`🖼️ Procesando archivo ${i+1}/${files.length}:`, file.name, file.type, `${(file.size/1024/1024).toFixed(2)}MB`);
        
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          errors.push(`${file.name}: no es una imagen válida`)
          continue
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          errors.push(`${file.name}: es demasiado grande (máximo 5MB)`)
          continue
        }

        try {
          // Subir imagen a Supabase Storage con carpeta específica para productos
          console.log(`🖼️ Subiendo imagen ${file.name} al bucket 'products'...`);
          const result = await uploadImage(file, 'products', 'uploads')
          console.log(`✅ Resultado de subida:`, result);
          
          if (result.error) {
            console.error(`❌ Error al subir ${file.name}:`, result.error);
            errors.push(`${file.name}: ${result.error}`)
            continue
          }

          if (!result.url) {
            console.error(`❌ No se obtuvo URL para ${file.name}`);
            errors.push(`${file.name}: no se pudo obtener URL`)
            continue
          }

          // Procesar la URL para evitar problemas de sintaxis
          let cleanUrl = ""
          try {
            cleanUrl = String(result.url).trim()
            // Eliminar comillas y caracteres especiales
            cleanUrl = cleanUrl.replace(/[`'"]/g, '')
          } catch (err) {
            console.error('Error al limpiar URL:', err)
            continue
          }
          
          // Solo agregar URLs válidas y asegurar que no tengan caracteres problemáticos
          if (cleanUrl && cleanUrl.length > 0) {
            newImages.push(cleanUrl)
            console.log('✅ URL limpia agregada:', cleanUrl);
          }

          // Si no es múltiple, solo tomar la primera imagen
          if (!multiple) break
        } catch (uploadError) {
          errors.push(`${file.name}: error inesperado`)
          console.error(`❌ Error subiendo ${file.name}:`, uploadError)
        }
      }

      // Mostrar errores si los hay
      if (errors.length > 0) {
        console.error('Errores al subir imágenes:', errors)
        alert(`Algunos archivos no pudieron ser subidos:\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? `\n...y ${errors.length - 3} más` : ''}`)
      }

      // Si no se pudo subir ninguna imagen, salir
      if (newImages.length === 0) {
        console.log('⚠️ No hay imágenes nuevas para guardar');
        setIsUploading(false);
        return;
      }

      // Asegurar que value sea siempre un array
      const currentValue = Array.isArray(value) ? value.filter(Boolean) : [];

      console.log('📸 Imágenes nuevas a guardar:', newImages);
      console.log('📸 Imágenes existentes:', currentValue);

      let finalImages: string[] = [];
      
      if (multiple) {
        // Combinar con imágenes existentes, respetando el límite
        const combinedImages = [...currentValue, ...newImages].slice(0, maxImages);
        // Filtrar valores nulos o indefinidos y limpiar URLs
        finalImages = combinedImages
          .filter(img => img && typeof img === 'string' && img.trim() !== '')
          .map(img => img.replace(/[`'"]/g, '').trim());
        console.log('📸 Guardando múltiples imágenes:', finalImages);
      } else {
        // Reemplazar imagen existente
        finalImages = newImages
          .slice(0, 1)
          .filter(img => img && typeof img === 'string' && img.trim() !== '')
          .map(img => img.replace(/[`'"]/g, '').trim());
        console.log('📸 Guardando una imagen:', finalImages);
      }
      
      // Verificar que finalImages sea un array válido antes de llamar a onChange
      if (!Array.isArray(finalImages)) {
        console.error('❌ Error: finalImages no es un array:', finalImages);
        finalImages = [];
      }
      
      console.log('📸 Array final de imágenes a guardar:', JSON.stringify(finalImages));
      onChange(finalImages);
    } catch (error) {
      console.error('Error al procesar imágenes:', error)
      alert('Ocurrió un error al procesar las imágenes. Por favor, inténtalo de nuevo.')
    } finally {
      setIsUploading(false)
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = async (index: number) => {
    if (!Array.isArray(value)) return
    
    const imageUrl = value[index]
    
    // Si es una URL de Supabase Storage, eliminar el archivo
    if (imageUrl && imageUrl.includes('supabase')) {
      try {
        const path = getPathFromUrl(imageUrl)
        if (path) {
          console.log('🗑️ Eliminando imagen de Storage:', path);
          const success = await deleteImage(path, 'products')
          if (!success) {
            console.warn('No se pudo eliminar la imagen del storage, pero se quitará de la lista')
          }
        } else {
          console.warn('No se pudo obtener la ruta de la imagen para eliminarla')
        }
      } catch (error) {
        console.error('Error eliminando imagen:', error)
      }
    }
    
    // Actualizar la lista de imágenes independientemente del resultado de la eliminación
    // para garantizar que la UI se actualice correctamente
    const newImages = value.filter((_, i) => i !== index)
    
    // Asegurar que newImages es un array válido
     const cleanedImages = newImages
       .filter(img => img && typeof img === 'string' && img.trim() !== '')
       .map(img => img.replace(/[`'"]/g, '').trim());
    
    console.log('🗑️ Imágenes después de eliminar:', cleanedImages);
    onChange(cleanedImages)
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
              <Card key={index} className="relative group shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-2">
                  <div className="relative aspect-square rounded-md overflow-hidden bg-muted">
                    <Image
                      src={image}
                      alt={`Imagen ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index === 0}
                      className="object-cover transition-all hover:scale-105"
                      onError={(e) => {
                        // Si la imagen falla al cargar, mostrar placeholder
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = `
                            <div class="flex flex-col items-center justify-center h-full">
                              <svg class="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                              <p class="text-xs text-muted-foreground mt-2">Error al cargar</p>
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
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-80 hover:opacity-100"
                      onClick={() => removeImage(index)}
                      title="Eliminar imagen"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {/* Indicador de imagen principal */}
                  {index === 0 && multiple && (
                    <div className="absolute top-1 left-1">
                      <div className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded shadow-sm">
                        Principal
                      </div>
                    </div>
                  )}
                  
                  {/* Nombre de archivo truncado */}
                  <div className="mt-1 text-xs text-muted-foreground truncate text-center">
                    {image.split('/').pop()?.split('?')[0]?.substring(0, 20) || `Imagen ${index + 1}`}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}