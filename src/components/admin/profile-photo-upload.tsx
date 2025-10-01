'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, X } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Loader } from '@/components/ui/loader'
import { useAuth } from '@/hooks/use-auth'

interface ProfilePhotoUploadProps {
  currentAvatarUrl?: string | null
  userEmail: string
  onAvatarUpdate: (newAvatarUrl: string | null) => void
}

export function ProfilePhotoUpload({ 
  currentAvatarUrl, 
  userEmail, 
  onAvatarUpdate 
}: ProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const { refreshProfile } = useAuth()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de archivo no válido. Solo se permiten JPG, PNG, WebP y GIF.')
      return
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error('El archivo es demasiado grande. Máximo 5MB.')
      return
    }

    // Crear preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Subir archivo
    handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    console.log('🔄 Iniciando subida de avatar...', { fileName: file.name, fileSize: file.size })
    
    try {
      // Obtener usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('❌ Error de autenticación:', userError)
        throw new Error('Usuario no autenticado')
      }
      console.log('✅ Usuario autenticado:', user.id)

      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/avatar.${fileExt}`
      console.log('📁 Nombre del archivo:', fileName)

      // Eliminar avatar anterior si existe
      if (currentAvatarUrl) {
        console.log('🗑️ Eliminando avatar anterior:', currentAvatarUrl)
        const oldFileName = currentAvatarUrl.split('/').pop()
        if (oldFileName) {
          const { error: removeError } = await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldFileName}`])
          if (removeError) {
            console.warn('⚠️ Error eliminando avatar anterior:', removeError)
          }
        }
      }

      // Subir nuevo archivo
      console.log('⬆️ Subiendo archivo al storage...')
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('❌ Error en upload:', uploadError)
        throw uploadError
      }
      console.log('✅ Archivo subido exitosamente:', uploadData)

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)
      console.log('🔗 URL pública generada:', publicUrl)

      // Actualizar perfil en la base de datos
      console.log('💾 Actualizando perfil en la base de datos...')
      const { error: updateError } = await (supabase
        .from('profiles') as any)
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) {
        console.error('❌ Error actualizando perfil:', updateError)
        throw updateError
      }
      console.log('✅ Perfil actualizado exitosamente')

      // Refrescar el perfil en el contexto de auth
      await refreshProfile()
      
      onAvatarUpdate(publicUrl)
      toast.success('Foto de perfil actualizada correctamente')
      
    } catch (error) {
      console.error('❌ Error uploading avatar:', error)
      toast.error('Error al subir la foto de perfil')
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
      console.log('🏁 Proceso de subida finalizado')
    }
  }

  const handleRemoveAvatar = async () => {
    setIsUploading(true)
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('Usuario no autenticado')
      }

      // Eliminar archivo del storage si existe
      if (currentAvatarUrl) {
        const fileName = currentAvatarUrl.split('/').pop()
        if (fileName) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${fileName}`])
        }
      }

      // Actualizar perfil en la base de datos
      const { error: updateError } = await (supabase
        .from('profiles') as any)
        .update({ avatar_url: null })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      // Refrescar el perfil en el contexto de auth
      await refreshProfile()
      
      onAvatarUpdate(null)
      setPreviewUrl(null)
      toast.success('Foto de perfil eliminada')
      
    } catch (error) {
      console.error('Error removing avatar:', error)
      toast.error('Error al eliminar la foto de perfil')
    } finally {
      setIsUploading(false)
    }
  }

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage 
            src={previewUrl || currentAvatarUrl || undefined} 
            alt="Foto de perfil" 
          />
          <AvatarFallback className="text-lg">
            {getInitials(userEmail)}
          </AvatarFallback>
        </Avatar>
        
        {(currentAvatarUrl || previewUrl) && (
          <Button
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={handleRemoveAvatar}
            disabled={isUploading}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader size="sm" text="Subiendo..." />
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              {currentAvatarUrl ? 'Cambiar foto' : 'Subir foto'}
            </>
          )}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground text-center">
        JPG, PNG, WebP o GIF. Máximo 5MB.
      </p>
    </div>
  )
}