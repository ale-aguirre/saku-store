'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, GripVertical } from 'lucide-react'
import { uploadImage, deleteImage, getPathFromUrl } from '@/lib/storage'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ImageUploadProps {
  value: string[]
  onChange: (images: string[]) => void
  multiple?: boolean
  maxImages?: number
  label?: string
  description?: string
  className?: string
  bucket?: 'products' | 'avatars' | 'images'
}

interface SortableImageItemProps {
  id: string
  image: string
  index: number
  onRemove: (index: number) => void
  isFirst: boolean
  multiple: boolean
}

function SortableImageItem({ id, image, index, onRemove, isFirst, multiple }: SortableImageItemProps) {
  const [hasError, setHasError] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  // Resetear error cuando cambia la imagen
  useEffect(() => {
    setHasError(false)
  }, [image])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`relative group shadow-sm hover:shadow-md transition-all ${isDragging ? 'z-50' : ''}`}
    >
      <CardContent className="p-2">
        <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
          <div className="relative w-full h-full">
            <Image
              key={`${image}-${index}`}
              src={image}
              alt={`Imagen ${index + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={index === 0}
              className={`object-cover transition-all hover:scale-105 ${hasError ? 'hidden' : ''}`}
              onError={() => setHasError(true)}
              onLoad={() => setHasError(false)}
            />
            {/* Placeholder de error que se muestra cuando la imagen falla */}
            {hasError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
                <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"></path>
                </svg>
                <p className="text-xs text-muted-foreground mt-1">Error al cargar</p>
              </div>
            )}
          </div>
          
          {/* Drag handle - solo visible en hover y si hay múltiples imágenes */}
          {multiple && (
            <div 
              {...attributes} 
              {...listeners}
              className="absolute top-2 left-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div className="bg-black/50 text-white p-1 rounded">
                <GripVertical className="h-3 w-3" />
              </div>
            </div>
          )}
          
          {/* Botón de eliminar */}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0 opacity-80 hover:opacity-100"
            onClick={() => onRemove(index)}
            title="Eliminar imagen"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        {/* Indicador de imagen principal */}
        {isFirst && multiple && (
          <div className="absolute bottom-2 left-2">
            <div className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded shadow-sm">
              Principal
            </div>
          </div>
        )}
        
        {/* Nombre de archivo truncado */}
        <div className="mt-1 text-xs text-muted-foreground truncate text-center">
          {image.split('/').pop()?.split('?')[0]?.substring(0, 15) || `Imagen ${index + 1}`}
        </div>
      </CardContent>
    </Card>
  )
}

export function ImageUpload({
  value = [],
  onChange,
  multiple = false,
  maxImages = 5,
  label = 'Imágenes',
  description,
  className = '',
  bucket = 'products'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = value.findIndex((_, index) => `image-${index}` === active.id)
      const newIndex = value.findIndex((_, index) => `image-${index}` === over?.id)
      
      const newOrder = arrayMove(value, oldIndex, newIndex)
      onChange(newOrder)
    }
  }

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return

    setIsUploading(true)

    try {
      const newImages: string[] = []
      const errors: string[] = []

      for (const file of files) {
        // Validaciones
        if (!file.type.startsWith('image/')) {
          errors.push(`${file.name}: no es una imagen válida`)
          continue
        }

        if (file.size > 5 * 1024 * 1024) {
          errors.push(`${file.name}: supera los 5MB`)
          continue
        }

        try {
          console.log(`📤 Subiendo imagen: ${file.name}`);
          const uploadResult = await uploadImage(file, bucket)
          console.log('📤 Resultado de subida:', uploadResult);

          if (!uploadResult || !uploadResult.url) {
            errors.push(`${file.name}: error al subir`)
            console.error(`❌ Error: no se obtuvo URL para ${file.name}`);
            continue
          }

          // Limpiar la URL de caracteres extraños
          const cleanUrl = uploadResult.url.replace(/[`'"]/g, '').trim();
          console.log('🧹 URL original:', uploadResult.url);
          console.log('🧹 URL limpia:', cleanUrl);

          if (cleanUrl && cleanUrl.length > 0) {
            newImages.push(cleanUrl)
            console.log('✅ URL limpia agregada:', cleanUrl);
          }

          if (!multiple) break
        } catch (uploadError) {
          errors.push(`${file.name}: error inesperado`)
          console.error(`❌ Error subiendo ${file.name}:`, uploadError)
        }
      }

      if (errors.length > 0) {
        console.error('Errores al subir imágenes:', errors)
        alert(`Algunos archivos no pudieron ser subidos:\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? `\n...y ${errors.length - 3} más` : ''}`)
      }

      if (newImages.length === 0) {
        console.log('⚠️ No hay imágenes nuevas para guardar');
        setIsUploading(false);
        return;
      }

      const currentValue = Array.isArray(value) ? value.filter(Boolean) : [];

      console.log('📸 Imágenes nuevas a guardar:', newImages);
      console.log('📸 Imágenes existentes:', currentValue);

      let finalImages: string[] = [];
      
      if (multiple) {
        const combinedImages = [...currentValue, ...newImages].slice(0, maxImages);
        finalImages = combinedImages
          .filter(img => img && typeof img === 'string' && img.trim() !== '')
          .map(img => img.replace(/[`'"]/g, '').trim());
        console.log('📸 Guardando múltiples imágenes:', finalImages);
      } else {
        finalImages = newImages
          .slice(0, 1)
          .filter(img => img && typeof img === 'string' && img.trim() !== '')
          .map(img => img.replace(/[`'"]/g, '').trim());
        console.log('📸 Guardando una imagen:', finalImages);
      }
      
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
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = async (index: number) => {
    if (!Array.isArray(value)) return
    
    const imageUrl = value[index]
    
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
    
    const newImages = value.filter((_, i) => i !== index)
    
    const cleanedImages = newImages
       .filter(img => img && typeof img === 'string' && img.trim() !== '')
       .map(img => img.replace(/[`'"]/g, '').trim());
    
    console.log('🗑️ Imágenes después de eliminar:', cleanedImages);
    onChange(cleanedImages)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    await processFiles(files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length > 0) {
      await processFiles(imageFiles)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />

      <div
        data-testid="image-upload-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full h-24 border-dashed border-2 rounded-md transition-colors ${
          isDragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        } ${
          isUploading || (!multiple && value.length >= 1) || (multiple && value.length >= maxImages)
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer'
        }`}
        onClick={openFileDialog}
      >
        <div className="flex flex-col items-center justify-center h-full gap-2 p-4">
          <Upload className="h-6 w-6 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium text-sm">
              {isUploading ? 'Subiendo...' : 'Seleccionar imágenes'}
            </p>
            <p className="text-xs text-muted-foreground">
              {multiple 
                ? `Máximo ${maxImages} imágenes (${value.length}/${maxImages})`
                : 'Una imagen'
              }
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, WEBP hasta 5MB
            </p>
            {isDragOver && (
              <p className="text-xs text-primary font-medium">
                 Suelta las imágenes aquí
               </p>
             )}
           </div>
         </div>
       </div>

      {value.length > 0 && (
        <div className="space-y-3" data-testid="uploaded-images">
          <Label className="text-sm font-medium">
            Imágenes seleccionadas ({value.length})
            {multiple && value.length > 1 && (
              <span className="text-xs text-muted-foreground ml-2">
                Arrastra para reordenar
              </span>
            )}
          </Label>
          
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={value.map((_, index) => `image-${index}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className={`grid gap-3 ${multiple ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 max-w-xs'}`}>
                {value.map((image, index) => (
                  <SortableImageItem
                    key={`image-${index}`}
                    id={`image-${index}`}
                    image={image}
                    index={index}
                    onRemove={removeImage}
                    isFirst={index === 0}
                    multiple={multiple}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}