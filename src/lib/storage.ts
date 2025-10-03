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
    console.log(`🚀 Iniciando carga de imagen en bucket: ${bucket}, folder: ${folder || 'raíz'}`);
    const supabase = createClient()
    
    if (!supabase) {
      console.error('❌ Cliente Supabase no inicializado');
      return { url: '', path: '', error: 'Error de conexión con Supabase' }
    }
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      console.error('❌ Tipo de archivo inválido:', file.type);
      return { url: '', path: '', error: 'El archivo debe ser una imagen' }
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.error('❌ Archivo demasiado grande:', file.size);
      return { url: '', path: '', error: 'La imagen no puede superar los 10MB' }
    }

    // Generar nombre único para el archivo con timestamp para evitar colisiones
    const timestamp = new Date().getTime()
    const fileExt = file.name.split('.').pop()
    const fileName = `${uuidv4()}_${timestamp}.${fileExt}`
    const filePath = folder ? `${folder}/${fileName}` : fileName
    
    console.log(`📄 Nombre de archivo generado: ${fileName}`);
    console.log(`📁 Ruta completa: ${filePath}`);

    // Intentar subir el archivo con reintentos
    let attempts = 0
    const maxAttempts = 3
    let data: any = null
    let error: any = null

    while (attempts < maxAttempts) {
      attempts++
      console.log(`🔄 Intento ${attempts}/${maxAttempts} de subir imagen`);
      
      // Subir archivo a Storage con upsert para garantizar persistencia
      const result = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Usar upsert para sobrescribir si existe
        })
      
      if (!result.error) {
        data = result.data
        console.log('✅ Imagen subida exitosamente:', data);
        break
      } else {
        error = result.error
        console.warn(`❌ Intento ${attempts}/${maxAttempts} fallido:`, error.message)
        
        // Esperar antes de reintentar (backoff exponencial)
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
        }
      }
    }

    if (error && !data) {
      console.error('❌ Error uploading file after retries:', error)
      return { url: '', path: '', error: error.message }
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)
    
    // Limpiar la URL para evitar problemas
    const cleanUrl = publicUrl.trim()
    console.log('✅ URL pública generada:', cleanUrl);

    // Verificar que la URL sea accesible
    try {
      const checkResponse = await fetch(cleanUrl, { method: 'HEAD' })
      if (!checkResponse.ok) {
        console.warn('⚠️ URL generada no es accesible:', checkResponse.status)
      } else {
        console.log('✅ URL verificada y accesible')
      }
    } catch (e) {
      console.warn('⚠️ Error verificando URL:', e)
      // No bloqueamos por esto, continuamos con la URL generada
    }

    console.log('🎉 Proceso de carga completado exitosamente')
    console.log('📊 Resultado final:', { url: cleanUrl, path: data.path })
    
    // Asegurar que la URL no tenga caracteres problemáticos
    const finalUrl = cleanUrl.replace(/[`'"]/g, '').trim()
    
    return {
      url: finalUrl,
      path: data.path,
      error: undefined
    }
  } catch (error) {
    console.error('❌ Error in uploadImage:', error)
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
  if (!path) {
    console.warn('Se intentó eliminar una imagen con path vacío')
    return false
  }
  
  try {
    const supabase = createClient()
    
    // Intentar eliminar con reintentos
    let attempts = 0
    const maxAttempts = 3
    let success = false
    
    while (attempts < maxAttempts && !success) {
      attempts++
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path])

      if (!error) {
        success = true
        break
      } else {
        console.warn(`Intento ${attempts}/${maxAttempts} de eliminar imagen fallido:`, error.message)
        
        // Esperar antes de reintentar (backoff exponencial)
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
        }
      }
    }

    return success
  } catch (error) {
    console.error('Error en deleteImage:', error)
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