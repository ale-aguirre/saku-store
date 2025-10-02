import { createClient } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'

export interface UploadResult {
  url: string
  path: string
  error?: string
}

/**
 * Sube una imagen a Supabase Storage
 * @param file - Archivo a subir
 * @param bucket - Bucket de destino ('products' o 'avatars')
 * @param folder - Carpeta dentro del bucket (opcional)
 * @returns Promise con la URL pública de la imagen subida
 */
export async function uploadImage(
  file: File,
  bucket: 'products' | 'avatars' = 'products',
  folder?: string
): Promise<UploadResult> {
  try {
    const supabase = createClient()
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      return { url: '', path: '', error: 'El archivo debe ser una imagen' }
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { url: '', path: '', error: 'La imagen no puede superar los 10MB' }
    }

    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = folder ? `${folder}/${fileName}` : fileName

    // Subir archivo a Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error uploading file:', error)
      return { url: '', path: '', error: error.message }
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return {
      url: publicUrl,
      path: data.path,
      error: undefined
    }
  } catch (error) {
    console.error('Error in uploadImage:', error)
    return { 
      url: '', 
      path: '', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * Elimina una imagen de Supabase Storage
 * @param path - Ruta del archivo en Storage
 * @param bucket - Bucket donde está el archivo
 * @returns Promise<boolean> - true si se eliminó correctamente
 */
export async function deleteImage(
  path: string,
  bucket: 'products' | 'avatars' = 'products'
): Promise<boolean> {
  try {
    const supabase = createClient()
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Error deleting file:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteImage:', error)
    return false
  }
}

/**
 * Sube múltiples imágenes a Supabase Storage
 * @param files - Array de archivos a subir
 * @param bucket - Bucket de destino
 * @param folder - Carpeta dentro del bucket (opcional)
 * @returns Promise con array de resultados
 */
export async function uploadMultipleImages(
  files: File[],
  bucket: 'products' | 'avatars' = 'products',
  folder?: string
): Promise<UploadResult[]> {
  const results: UploadResult[] = []
  
  for (const file of files) {
    const result = await uploadImage(file, bucket, folder)
    results.push(result)
  }
  
  return results
}

/**
 * Convierte una URL de Storage a path para eliminación
 * @param url - URL pública de Supabase Storage
 * @returns string - Path del archivo
 */
export function getPathFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    // Formato: /storage/v1/object/public/bucket/path
    const bucketIndex = pathParts.indexOf('public') + 1
    return pathParts.slice(bucketIndex + 1).join('/')
  } catch (error) {
    console.error('Error parsing URL:', error)
    return ''
  }
}